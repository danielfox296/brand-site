#!/usr/bin/env python3
"""Cross-post to Medium by driving Brave over CDP.

Medium's /p/import tool is DEAD (the Import button fires no network call
— confirmed 2026-07-13). The working path is medium.com/new-story with a
pasted HTML body:

- Paste <h1>title</h1> + subtitle + hero <img> + body into the
  contenteditable editor; Medium adopts the <h1> as the title graf.
- The paste leaves a stray EMPTY leading h3 above the title — fixed by
  clicking into it and forward-deleting so the title merges up.
- A footer line "Originally published at entuned.co" links the canonical.
- Topic tags CANNOT be committed over CDP (the tokenizer ignores
  synthetic Enter/comma) — publish without and add them manually.

Usage:
    python3 publish_to_medium.py --payload posts/001_my-slug.json \
        --canonical-url https://entuned.co/blog/<slug>.html [--no-publish]

Reuses the Substack payload (title, subtitle, body_html, hero_url,
hero_alt, slug). Exit codes: 0 published, 3 signed out, 4 wrong Medium
account (expected EXPECTED_HANDLE), 1 anything else.
"""
import argparse
import json
import os
import sys
import time

from cdp import Tab, ensure_brave, find_tab, new_tab

HERE = os.path.dirname(os.path.abspath(__file__))
PROGRESS = os.path.join(HERE, "progress.json")
ED = "div[contenteditable=true]"

# The Entuned Medium account. Brave is shared with Daniel's personal
# Medium account (@danielfox) — on 2026-07-17 a post shipped to the
# wrong one. Abort rather than publish anywhere else (same rule as the
# LinkedIn autopost's company-page guard).
EXPECTED_HANDLE = "@daniel_35520"


def die(msg, code=1):
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(code)


def fix_leading_h3(tab):
    """Merge the stray empty leading h3 into the title below it."""
    info = tab.js(f"""
(() => {{
  const hs = Array.from(document.querySelectorAll('{ED} h3'));
  const empty = hs.find(h => !h.innerText.trim());
  if (!empty) return JSON.stringify({{empty: false}});
  empty.scrollIntoView({{block: 'center'}});
  const r = empty.getBoundingClientRect();
  return JSON.stringify({{empty: true, x: r.x + 4, y: r.y + r.height/2}});
}})()
""")
    c = json.loads(info)
    if not c.get("empty"):
        return
    time.sleep(0.5)
    tab.click_xy(c["x"], c["y"])
    time.sleep(0.3)
    tab.key("Delete", "Delete", 46)  # forward-delete merges the title up
    time.sleep(1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--payload", required=True)
    ap.add_argument("--canonical-url", required=True)
    ap.add_argument("--no-publish", action="store_true",
                    help="stop at the draft; don't click Publish")
    args = ap.parse_args()

    with open(args.payload) as f:
        p = json.load(f)

    full_html = (
        "<h1>" + p["title"] + "</h1>"
        + "<p><em>" + p["subtitle"] + "</em></p>"
        + (f'<img src="{p["hero_url"]}" alt="{p["hero_alt"]}">' if p.get("hero_url") else "")
        + p["body_html"]
        + f'<p><em>Originally published at <a href="{args.canonical_url}">entuned.co</a>.</em></p>'
    )

    ensure_brave()

    # Account guard: medium.com/me redirects to the signed-in profile.
    # Wrong account → exit 4, publish nothing.
    who = Tab(new_tab("https://medium.com/me"))
    time.sleep(6)
    who_url = who.js("window.location.href") or ""
    who.close()
    if "signin" in who_url or "login" in who_url or "/m/" in who_url:
        print("FAIL: Medium session expired — sign in manually in Brave "
              "(medium.com, the Entuned account), then re-run.", file=sys.stderr)
        sys.exit(3)
    if EXPECTED_HANDLE not in who_url:
        die(f"signed into the wrong Medium account ({who_url or 'unknown'}); "
            f"expected {EXPECTED_HANDLE}. Log into the Entuned account in "
            "Brave and re-run.", code=4)

    tab = Tab(new_tab("https://medium.com/new-story"))
    time.sleep(8)
    url = tab.js("window.location.href") or ""
    if "signin" in url or "login" in url or "/m/" in url:
        tab.close()
        print("FAIL: Medium session expired — sign in manually in Brave "
              "(medium.com, Google account), then re-run.", file=sys.stderr)
        sys.exit(3)
    if not tab.wait_js(f"!!document.querySelector('{ED}')", timeout=20):
        die("Medium editor never loaded")

    r = tab.paste_html(ED, full_html)
    if r != "pasted":
        die(f"paste: {r}")
    time.sleep(6)

    got_len = tab.js(f"document.querySelector('{ED}').innerText.length") or 0
    if got_len < 0.5 * len(p["body_html"]):
        die(f"editor text suspiciously short ({got_len} chars)")
    fix_leading_h3(tab)
    first_h = tab.js(f"document.querySelector('{ED} h1, {ED} h3')?.innerText || ''")
    # Medium replaces the title's final space with a non-breaking space
    # (widow prevention) — normalize before comparing.
    if p["title"] not in first_h.replace(" ", " "):
        die(f"title graf wrong after h3 fix: {first_h!r}")
    print(f"draft ok: {got_len} chars, title graf set")

    # Medium autosaves the draft under a /p/<id>/edit URL
    time.sleep(3)
    draft_url = tab.js("window.location.href")

    if args.no_publish:
        print(f"draft left unpublished: {draft_url}")
        tab.close()
        return

    r = tab.js("""
(() => {
  const b = Array.from(document.querySelectorAll('button')).find(x=>/^Publish$/.test((x.textContent||'').trim()));
  if (!b) return 'no publish button';
  b.click();
  return 'clicked';
})()
""")
    if r != "clicked":
        die(r)
    time.sleep(5)
    # Submission page: skip topics (cannot be committed over CDP), publish.
    r = tab.js("""
(() => {
  const b = Array.from(document.querySelectorAll('button')).find(x=>/^Publish$/.test((x.textContent||'').trim()));
  if (!b) return 'no publish button on submission page';
  b.click();
  return 'clicked';
})()
""")
    if r != "clicked":
        die(r)
    time.sleep(10)
    live = tab.js("window.location.href")
    tab.close()
    print(f"PUBLISHED: {live}")
    print("MANUAL STEP: add topic tags on Medium (Retail, Music, Consumer "
          "Behavior, Marketing, Small Business) — tags can't be set over CDP.")

    if p.get("slug") and os.path.exists(PROGRESS):
        with open(PROGRESS) as f:
            recs = json.load(f)
        for rec in recs:
            if rec.get("slug") == p["slug"]:
                rec["medium_url"] = live
        with open(PROGRESS, "w") as f:
            json.dump(recs, f, indent=2)
            f.write("\n")


if __name__ == "__main__":
    main()
