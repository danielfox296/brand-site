#!/usr/bin/env python3
"""Shared Chrome-DevTools-Protocol helpers for the cross-post pipeline.

Drives Brave over CDP on port 9222. Every technique in here was proven live
on 2026-07-13 publishing "What in the Music Actually Moves the Sale":

- websocket-client needs suppress_origin=True or Brave answers 403.
- /json/new needs PUT on current Brave (GET is a 405 fallback path).
- If Brave is running WITHOUT the debug port it must be quit (osascript,
  sometimes takes two tries) and relaunched with --remote-debugging-port.

Requires: pip3 install --user websocket-client
"""
import json
import subprocess
import time
import urllib.error
import urllib.request

import websocket

PORT = 9222
BRAVE_BIN = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"


# ---------------------------------------------------------------- tab list

def tabs(port=PORT):
    return json.load(urllib.request.urlopen(f"http://localhost:{port}/json"))


def find_tab(substr, port=PORT):
    for t in tabs(port):
        if t.get("type") == "page" and substr in t.get("url", ""):
            return t
    return None


def new_tab(url, port=PORT):
    """Open a new tab. Newer Chromium wants PUT; fall back to GET."""
    endpoint = f"http://localhost:{port}/json/new?url={url}"
    try:
        req = urllib.request.Request(endpoint, method="PUT")
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError:
        return json.load(urllib.request.urlopen(endpoint))


# ---------------------------------------------------------------- Brave

def cdp_up(port=PORT):
    try:
        urllib.request.urlopen(f"http://localhost:{port}/json/version", timeout=3)
        return True
    except OSError:
        return False


def _brave_running():
    r = subprocess.run(["pgrep", "-x", "Brave Browser"], capture_output=True)
    return r.returncode == 0


def ensure_brave(port=PORT):
    """Make sure Brave is up with the CDP port open. Quits and relaunches
    Brave if it is running without the port (quit can take two tries)."""
    if cdp_up(port):
        return
    if _brave_running():
        for _ in range(2):
            subprocess.run(
                ["osascript", "-e", 'tell application "Brave Browser" to quit'],
                capture_output=True,
            )
            for _ in range(10):
                time.sleep(1)
                if not _brave_running():
                    break
            if not _brave_running():
                break
        if _brave_running():
            raise RuntimeError(
                "Brave refuses to quit; quit it manually, then relaunch with "
                f'"{BRAVE_BIN}" --remote-debugging-port={port}'
            )
    subprocess.Popen(
        [BRAVE_BIN, f"--remote-debugging-port={port}", "--restore-last-session"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(30):
        time.sleep(1)
        if cdp_up(port):
            time.sleep(3)  # let session restore settle
            return
    raise RuntimeError(f"Brave relaunched but CDP port {port} never came up")


# ---------------------------------------------------------------- Tab

class Tab:
    def __init__(self, t):
        self.ws = websocket.create_connection(
            t["webSocketDebuggerUrl"], timeout=30, suppress_origin=True
        )
        self.mid = 0

    def cmd(self, method, **params):
        self.mid += 1
        self.ws.send(json.dumps({"id": self.mid, "method": method, "params": params}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get("id") == self.mid:
                if "error" in m:
                    raise RuntimeError(m["error"])
                return m.get("result", {})

    def js(self, expr, await_promise=False):
        r = self.cmd(
            "Runtime.evaluate",
            expression=expr,
            awaitPromise=await_promise,
            returnByValue=True,
            userGesture=True,
        )
        res = r.get("result", {})
        if res.get("subtype") == "error":
            raise RuntimeError(res.get("description"))
        return res.get("value")

    def goto(self, url):
        self.cmd("Page.enable")
        self.cmd("Page.navigate", url=url)

    def wait_js(self, expr, timeout=30, interval=1.0):
        """Poll a JS expression until truthy; return its value or None."""
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                v = self.js(expr)
                if v:
                    return v
            except RuntimeError:
                pass
            time.sleep(interval)
        return None

    def click_xy(self, x, y, count=1):
        for typ in ("mousePressed", "mouseReleased"):
            self.cmd(
                "Input.dispatchMouseEvent",
                type=typ, x=x, y=y, button="left", clickCount=count,
            )

    def key(self, key, code, vk, modifiers=0):
        self.cmd("Input.dispatchKeyEvent", type="rawKeyDown", key=key,
                 windowsVirtualKeyCode=vk, code=code, modifiers=modifiers)
        self.cmd("Input.dispatchKeyEvent", type="keyUp", key=key,
                 windowsVirtualKeyCode=vk, code=code, modifiers=modifiers)

    def paste_html(self, target_selector, html):
        """Synthetic ClipboardEvent paste of text/html into an editor.
        Lands at the CURRENT ProseMirror selection — click into the target
        position first if it matters."""
        return self.js(f"""
(() => {{
  const el = document.querySelector({json.dumps(target_selector)});
  if (!el) return 'no element for selector';
  el.focus();
  const dt = new DataTransfer();
  dt.setData('text/html', {json.dumps(html)});
  const ev = new ClipboardEvent('paste', {{bubbles: true, cancelable: true}});
  Object.defineProperty(ev, 'clipboardData', {{value: dt}});
  el.dispatchEvent(ev);
  return 'pasted';
}})()
""")

    def screenshot(self, path):
        import base64
        shot = self.cmd("Page.captureScreenshot", format="jpeg", quality=60)
        with open(path, "wb") as f:
            f.write(base64.b64decode(shot["data"]))

    def close(self):
        self.ws.close()
