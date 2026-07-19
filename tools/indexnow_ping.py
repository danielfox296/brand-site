#!/usr/bin/env python3
"""IndexNow ping — notifies Bing (feeds ChatGPT search + Copilot) of updated URLs.

Two modes:

  CI diff mode (used by .github/workflows/deploy.yml after each deploy):
      tools/indexnow_ping.py --diff <before-sha> <after-sha> [--dry-run]
  Maps changed files to live URLs and keeps only URLs present in sitemap.xml,
  so noindexed pages and redirect stubs are never pinged.

  Manual mode:
      tools/indexnow_ping.py https://entuned.co/blog/some-post.html [more URLs...]

Key file hosted at https://entuned.co/a90a24496d14307cb0567d7dc9281578.txt
Never fails the caller: any error prints a warning and exits 0.
"""

import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

HOST = "entuned.co"
KEY = "a90a24496d14307cb0567d7dc9281578"
ENDPOINT = "https://api.indexnow.org/indexnow"
ROOT = Path(__file__).resolve().parent.parent


def sitemap_urls():
    sitemap = (ROOT / "sitemap.xml").read_text()
    return set(re.findall(r"<loc>(.*?)</loc>", sitemap))


def page_output(page_dir):
    """Output path for an _src/pages/<name>/ directory, per its config.json."""
    config = ROOT / "_src" / "pages" / page_dir / "config.json"
    if config.exists():
        try:
            cfg = json.loads(config.read_text())
            if cfg.get("redirect_to"):
                return None
            if cfg.get("output"):
                return cfg["output"]
        except json.JSONDecodeError:
            pass
    return f"{page_dir}.html"


def changed_urls(before, after):
    def rev_ok(rev):
        return subprocess.run(
            ["git", "cat-file", "-e", rev], cwd=ROOT, capture_output=True
        ).returncode == 0

    if not rev_ok(before):  # force-push or shallow history — fall back to last commit
        before = f"{after}^"
    diff = subprocess.run(
        ["git", "diff", "--name-only", before, after],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout.split()

    outputs = set()
    for f in diff:
        if f.startswith("_src/pages/"):
            out = page_output(f.split("/")[2])
            if out:
                outputs.add(out)
        elif f.endswith(".html") and not f.startswith("_src/"):
            outputs.add(f)

    live = sitemap_urls()
    urls = set()
    for out in outputs:
        candidates = [f"https://{HOST}/{out}"]
        if out == "index.html":
            candidates.append(f"https://{HOST}/")
        urls.update(c for c in candidates if c in live)
    return sorted(urls)


def ping(urls):
    payload = json.dumps({
        "host": HOST,
        "key": KEY,
        "keyLocation": f"https://{HOST}/{KEY}.txt",
        "urlList": urls,
    }).encode()
    req = urllib.request.Request(
        ENDPOINT, data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(f"IndexNow responded {resp.status} for {len(urls)} URL(s)")


def main():
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry_run = "--dry-run" in sys.argv

    if args and args[0] == "--diff":
        if len(args) != 3:
            print("usage: indexnow_ping.py --diff <before-sha> <after-sha> [--dry-run]")
            return
        urls = changed_urls(args[1], args[2])
    else:
        urls = args

    if not urls:
        print("IndexNow: no indexable URLs changed, skipping ping")
        return
    for u in urls:
        print(f"  {u}")
    if dry_run:
        print(f"IndexNow: dry run, would ping {len(urls)} URL(s)")
        return
    ping(urls)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # a failed ping must never fail the deploy
        print(f"IndexNow: WARNING — ping failed: {e}")
