#!/usr/bin/env python3
"""One-off: post a Substack Note for the What One Chord Does essay.
Follows the verified 2026-07-17 path: /notes -> open composer -> paste_html
-> Post. Screenshots at each step for verification."""
import time, sys
from cdp import ensure_brave, new_tab, Tab

NOTE_HTML = (
    "<p>A pop song is about a hundred decisions made at once, and then it is "
    "fused into one object forever. So when a song moves a room, you never learn "
    "which of the hundred decisions did the work.</p>"
    "<p>What changed two years ago: you can finally hold a single song still and "
    "move one thing inside it, then watch what a real room does.</p>"
    "<p>https://entuned.substack.com/p/what-one-chord-does</p>"
)

def main():
    ensure_brave()
    t = Tab(new_tab("https://substack.com/notes"))
    time.sleep(6)
    # confirm signed in / feed loaded
    t.screenshot("/tmp/note_1_feed.jpg")
    # open the composer: click the "What's on your mind?" trigger
    opened = t.js(r"""
(() => {
  const cands = [...document.querySelectorAll('button, div[role="button"], textarea, input, [contenteditable]')];
  const hit = cands.find(e => {
    const s = (e.getAttribute('placeholder')||'') + ' ' + (e.innerText||e.textContent||'');
    return /what'?s on your mind/i.test(s);
  });
  if (!hit) return 'no-trigger';
  hit.scrollIntoView({block:'center'});
  hit.click();
  return 'clicked-trigger';
})()
""")
    print("open composer:", opened)
    time.sleep(3)
    t.screenshot("/tmp/note_2_composer.jpg")
    # find the editable editor
    sel = '[contenteditable="true"]'
    has = t.wait_js(f"document.querySelector('{sel}') ? 'yes' : ''", timeout=15)
    print("editor present:", has)
    if not has:
        # fallback: sometimes the trigger IS the editable; re-screenshot and bail
        t.screenshot("/tmp/note_2b_noeditor.jpg")
        print("ERROR: no contenteditable editor found")
        sys.exit(2)
    # focus + paste
    t.js(f"document.querySelector('{sel}').focus()")
    time.sleep(0.5)
    print("paste:", t.paste_html(sel, NOTE_HTML))
    time.sleep(6)  # let the link auto-embed as a card
    t.screenshot("/tmp/note_3_pasted.jpg")
    editor_text = t.js(f"document.querySelector('{sel}').innerText")
    print("editor text now:\n", editor_text)
    # click the Post button (exact text 'Post', not 'Post to...')
    posted = t.js(r"""
(() => {
  const btns = [...document.querySelectorAll('button')];
  const b = btns.find(x => /^\s*Post\s*$/.test(x.innerText||'') && !x.disabled);
  if (!b) return 'no-post-button:' + btns.map(x=>x.innerText).filter(Boolean).slice(0,12).join('|');
  b.click();
  return 'clicked-post';
})()
""")
    print("post click:", posted)
    time.sleep(6)
    t.screenshot("/tmp/note_4_after_post.jpg")
    # verify: composer closed AND a note with our text near top of feed
    check = t.js(r"""
(() => {
  const body = document.body.innerText || '';
  const composerGone = !document.querySelector('[contenteditable="true"]');
  const present = body.includes('hold a single song still and move one thing inside it');
  return JSON.stringify({composerGone, present});
})()
""")
    print("verify:", check)

if __name__ == "__main__":
    main()
