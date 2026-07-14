#!/usr/bin/env python3
"""Substack session check + emailed-code sign-in over CDP.

Substack sessions expire. Instead of failing opaquely mid-publish, the
pipeline checks sign-in state first and walks the emailed 6-digit-code
flow (account: danielchristopherfox@gmail.com — Daniel approved this
flow on 2026-07-13; the code is read from Gmail, e.g. via the Gmail MCP).

Usage:
    python3 substack_auth.py check
        exit 0 = signed in, exit 3 = signed out (sign-in page left open)
    python3 substack_auth.py request-code
        submits the email on the sign-in page; a 6-digit code is emailed
    python3 substack_auth.py enter-code 123456
        enters the code and re-checks; exit 0 = signed in
"""
import json
import sys
import time

from cdp import Tab, ensure_brave, find_tab, new_tab

PUBLISH_HOME = "https://entuned.substack.com/publish/home"
EMAIL = "danielchristopherfox@gmail.com"


def _substack_tab():
    t = find_tab("substack.com")
    if t is None:
        t = new_tab(PUBLISH_HOME)
        time.sleep(6)
    return Tab(t)


def _state(tab):
    """'in' | 'email' (sign-in page awaiting email) | 'code' (awaiting code)."""
    url = tab.js("window.location.href") or ""
    has_email = tab.js(
        "!!document.querySelector('input[type=\"email\"], input[name=\"email\"]')"
    )
    has_code = tab.js("""
(() => {
  const inps = Array.from(document.querySelectorAll('input')).filter(i => i.type !== 'hidden');
  return !!inps.find(i => /code|one-time|otp/i.test(i.name + i.placeholder + i.autocomplete));
})()
""")
    if "/publish/" in url and not has_email:
        return "in"
    if has_code and not has_email:
        return "code"
    return "email"


def check():
    tab = _substack_tab()
    tab.goto(PUBLISH_HOME)
    time.sleep(6)
    state = _state(tab)
    tab.close()
    if state == "in":
        print("SIGNED-IN")
        return 0
    print(f"SIGNED-OUT (state: awaiting {state})")
    print("Run: python3 substack_auth.py request-code")
    print(f"then read the 6-digit code emailed to {EMAIL} and run:")
    print("python3 substack_auth.py enter-code <code>")
    return 3


def request_code():
    tab = _substack_tab()
    if _state(tab) == "in":
        tab.close()
        print("already signed in")
        return 0
    r = tab.js(f"""
(() => {{
  const inp = document.querySelector('input[type="email"], input[name="email"]');
  if (!inp) return 'no email input (already past this step?)';
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  set.call(inp, {json.dumps(EMAIL)});
  inp.dispatchEvent(new Event('input', {{bubbles: true}}));
  const btn = Array.from(document.querySelectorAll('button')).find(b => /continue|sign in/i.test(b.textContent));
  if (!btn) return 'no continue button';
  btn.click();
  return 'submitted';
}})()
""")
    time.sleep(4)
    state = _state(tab)
    tab.close()
    print(f"{r}; now awaiting {state}")
    if state != "code":
        print("WARNING: code input not visible yet — re-run `check` in a few seconds")
    print(f"Check {EMAIL} for the 6-digit code, then run: python3 substack_auth.py enter-code <code>")
    return 0


def enter_code(code):
    tab = _substack_tab()
    r = tab.js(f"""
(() => {{
  const inps = Array.from(document.querySelectorAll('input')).filter(i => i.type !== 'hidden');
  const code = inps.find(i => /code|one-time|otp/i.test(i.name + i.placeholder + i.autocomplete))
            || inps.find(i => i.type==='text' || i.type==='number' || i.type==='tel');
  if (!code) return 'NO CODE INPUT';
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  set.call(code, {json.dumps(code)});
  code.dispatchEvent(new Event('input', {{bubbles: true}}));
  return 'entered';
}})()
""")
    print(r)
    time.sleep(5)
    tab.goto(PUBLISH_HOME)
    time.sleep(6)
    state = _state(tab)
    tab.close()
    if state == "in":
        print("SIGNED-IN")
        return 0
    print(f"still signed out (awaiting {state}) — wrong/expired code?")
    return 3


def main():
    ensure_brave()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if cmd == "check":
        return check()
    if cmd == "request-code":
        return request_code()
    if cmd == "enter-code":
        if len(sys.argv) < 3:
            print("usage: substack_auth.py enter-code <6-digit-code>")
            return 2
        return enter_code(sys.argv[2])
    print(__doc__)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
