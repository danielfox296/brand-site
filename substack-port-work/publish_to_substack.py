#!/usr/bin/env python3
"""Publish one post to entuned.substack.com by driving Brave over CDP.

Techniques proven live 2026-07-13 (Tiptap/ProseMirror editor):
- Title/subtitle are React textareas: set via the native value setter +
  an `input` event. Selectors: textarea[placeholder="Title"],
  textarea[placeholder^="Add a subtitle"].
- Body: synthetic ClipboardEvent('paste') with DataTransfer text/html
  into div.tiptap.ProseMirror.mousetrap. The paste lands at the current
  PM selection, so click into the target paragraph first (Cmd+ArrowUp
  does NOT move the PM selection).
- The Thumbnail file input rejects DOM.setFileInputFiles, so the hero is
  pasted as an <img> FIRST BODY NODE instead — Substack adopts it as the
  cover/social preview. The image URL must be live (we paste by URL).
- Publish: "Continue" (with an optional "Done" first to close the file
  sidebar) then "Send to everyone now"; the live URL is read from the
  share-center page.

Usage:
    python3 publish_to_substack.py --payload posts/001_my-slug.json [--no-send]

Payload JSON fields:
    title, subtitle, body_html   (required)
    hero_url, hero_alt           (required unless --no-hero)
    slug                         (optional; recorded in progress.json)
Exit codes: 0 published, 3 signed out, 1 anything else.
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.request

from cdp import Tab, ensure_brave, find_tab, new_tab, tabs
import substack_auth

HERE = os.path.dirname(os.path.abspath(__file__))
PROGRESS = os.path.join(HERE, "progress.json")
EDITOR_URL = "https://entuned.substack.com/publish/post?type=newsletter"
PM = "div.tiptap.ProseMirror.mousetrap"


def die(msg, code=1):
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(code)


def load_progress():
    if os.path.exists(PROGRESS):
        with open(PROGRESS) as f:
            return json.load(f)
    return []


def save_progress(records):
    with open(PROGRESS, "w") as f:
        json.dump(records, f, indent=2)
        f.write("\n")


def url_live(url):
    req = urllib.request.Request(url, method="HEAD",
                                 headers={"User-Agent": "Mozilla/5.0"})
    try:
        return urllib.request.urlopen(req, timeout=30).status == 200
    except OSError:
        return False


def set_title_subtitle(tab, title, subtitle):
    r = tab.js(f"""
(() => {{
  const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  const title = document.querySelector('textarea[placeholder="Title"]');
  const sub = document.querySelector('textarea[placeholder^="Add a subtitle"]');
  if (!title || !sub) return 'missing fields';
  set.call(title, {json.dumps(title)});
  title.dispatchEvent(new Event('input', {{bubbles: true}}));
  set.call(sub, {json.dumps(subtitle)});
  sub.dispatchEvent(new Event('input', {{bubbles: true}}));
  return 'ok';
}})()
""")
    if r != "ok":
        die(f"title/subtitle: {r}")
    got = tab.js("document.querySelector('textarea[placeholder=\"Title\"]').value")
    if got != title:
        die(f"title readback mismatch: {got!r}")


def paste_body(tab, body_html):
    r = tab.paste_html(PM, body_html)
    if r != "pasted":
        die(f"body paste: {r}")
    time.sleep(3)
    got_len = tab.js(f"document.querySelector('{PM}').innerText.length") or 0
    plain_len = len(re.sub(r"<[^>]+>", "", body_html))
    if got_len < 0.8 * plain_len:
        die(f"body looks truncated: editor {got_len} chars vs source ~{plain_len}")
    want_h2 = body_html.count("<h2")
    got_h2 = tab.js(f"document.querySelectorAll('{PM} h2').length")
    if got_h2 != want_h2:
        die(f"h2 count mismatch: editor {got_h2} vs source {want_h2}")
    print(f"body ok: {got_len} chars, {got_h2} h2s")


def _first_para_click(tab):
    rect = tab.js(f"""
(() => {{
  const pm = document.querySelector('{PM}');
  pm.firstElementChild.scrollIntoView({{block: 'center'}});
  const r = pm.firstElementChild.getBoundingClientRect();
  return JSON.stringify({{x: r.x + 2, y: r.y + 8}});
}})()
""")
    c = json.loads(rect)
    time.sleep(0.5)
    tab.click_xy(c["x"], c["y"])
    time.sleep(0.5)


def _delete_editor_img(tab):
    rect = tab.js(f"""
(() => {{
  const img = document.querySelector('{PM} img');
  if (!img) return '';
  img.scrollIntoView({{block: 'center'}});
  const r = img.getBoundingClientRect();
  return JSON.stringify({{x: r.x + r.width/2, y: r.y + r.height/2}});
}})()
""")
    if not rect:
        return
    c = json.loads(rect)
    time.sleep(0.5)
    tab.click_xy(c["x"], c["y"])  # selects the PM image node
    time.sleep(0.3)
    tab.key("Backspace", "Backspace", 8)
    time.sleep(1)


def paste_hero(tab, hero_url, hero_alt):
    if not url_live(hero_url):
        die(f"hero image not live: {hero_url} (push the site first)")
    img_html = f'<img src="{hero_url}" alt="{hero_alt}">'

    def img_index():
        return tab.js(f"""
(() => {{
  const pm = document.querySelector('{PM}');
  const kids = Array.from(pm.children);
  return JSON.stringify({{
    imgs: pm.querySelectorAll('img').length,
    idx: kids.findIndex(k => k.querySelector('img') || k.tagName === 'IMG')
  }});
}})()
""")

    for attempt in range(2):
        _first_para_click(tab)
        r = tab.paste_html(PM, img_html)
        if r != "pasted":
            die(f"hero paste: {r}")
        time.sleep(5)
        state = json.loads(img_index())
        if state["imgs"] == 1 and state["idx"] == 0:
            print("hero ok: first body node")
            return
        print(f"hero landed wrong (attempt {attempt + 1}): {state} — removing and retrying")
        while json.loads(img_index())["imgs"] > 0:
            _delete_editor_img(tab)
    die("hero image would not land as the first body node")


def click_button(tab, pattern, required=True):
    r = tab.js(f"""
(() => {{
  const btn = Array.from(document.querySelectorAll('button')).find(b => {pattern}.test((b.textContent||'').trim()));
  if (!btn) return 'absent';
  btn.click();
  return 'clicked';
}})()
""")
    if r != "clicked" and required:
        die(f"button {pattern} not found")
    return r == "clicked"


def publish(tab):
    click_button(tab, "/^Done$/", required=False)  # closes file sidebar if open
    time.sleep(2)
    if not click_button(tab, "/^Continue$/", required=False):
        die("no Continue button")
    time.sleep(6)
    deadline = time.time() + 30
    while time.time() < deadline:
        if click_button(tab, "/Send to everyone now/i", required=False):
            break
        time.sleep(2)
    else:
        die("'Send to everyone now' never appeared — post left in pre-publish state")
    time.sleep(8)


def live_url():
    t = find_tab("share-center")
    if t:
        tab = Tab(t)
        url = tab.js("""
(() => {
  const inp = Array.from(document.querySelectorAll('input')).find(i => (i.value||'').includes('/p/'));
  if (inp) return inp.value;
  const a = Array.from(document.querySelectorAll('a')).map(a=>a.href).find(h => h.includes('/p/'));
  return a || '';
})()
""")
        tab.close()
        if url:
            return url.split("?")[0]
    for t in tabs():
        m = re.search(r"(https://entuned\.substack\.com/p/[\w-]+)", t.get("url", ""))
        if m:
            return m.group(1)
    return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--payload", required=True)
    ap.add_argument("--no-send", action="store_true",
                    help="stop before publishing; leaves the draft open")
    ap.add_argument("--no-hero", action="store_true")
    args = ap.parse_args()

    with open(args.payload) as f:
        p = json.load(f)
    for k in ("title", "subtitle", "body_html"):
        if not p.get(k):
            die(f"payload missing {k}")
    if "—" in p["body_html"] or "—" in p["subtitle"]:
        die("em dash in payload (hard ban for Substack copy)")
    if not args.no_hero and not (p.get("hero_url") and p.get("hero_alt")):
        die("payload missing hero_url/hero_alt (or pass --no-hero)")

    ensure_brave()
    if substack_auth.check() != 0:
        sys.exit(3)

    tab = Tab(new_tab(EDITOR_URL))
    time.sleep(6)
    if not (tab.js("window.location.href") or "").startswith("https://"):
        # tab stuck on about:blank — navigate in-place and retry
        tab.goto(EDITOR_URL)
        time.sleep(6)
    if not tab.wait_js("!!document.querySelector('textarea[placeholder=\"Title\"]')", timeout=30):
        die("editor never loaded (no Title textarea)")

    set_title_subtitle(tab, p["title"], p["subtitle"])
    time.sleep(1)
    paste_body(tab, p["body_html"])
    if not args.no_hero:
        paste_hero(tab, p["hero_url"], p["hero_alt"])

    post_id = None
    m = re.search(r"/publish/post/(\d+)", tab.js("window.location.href") or "")
    if m:
        post_id = m.group(1)

    if args.no_send:
        print(f"draft ready (not sent). post_id={post_id}")
        tab.close()
        return

    publish(tab)
    url = live_url()
    tab.close()
    if not url:
        die("published (send clicked) but could not read the live URL — "
            "check entuned.substack.com/publish/home")

    records = load_progress()
    records.append({
        "slug": p.get("slug"),
        "title": p["title"],
        "substack_post_id": post_id,
        "substack_url": url,
        "published_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    })
    save_progress(records)
    print(f"PUBLISHED: {url}")


if __name__ == "__main__":
    main()
