#!/usr/bin/env python3
"""Postflight verification of a live Substack post (plain HTTP, no browser).

Usage:
    python3 verify_post.py <substack-url> --expected-title "Post Title"
    python3 verify_post.py --slug <slug> --expected-title "Post Title"
        (--slug looks the URL up in progress.json)

Checks: HTTP 200, title present, canonical CTA link present, a Substack
CDN image attached (the pasted hero), and a plausible body word count.
Exit 0 = all pass; non-zero lists every failure.
"""
import argparse
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CTA_LINK = "https://app.entuned.co/start"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read().decode("utf-8", "replace")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url", nargs="?")
    ap.add_argument("--slug")
    ap.add_argument("--expected-title", required=True)
    ap.add_argument("--min-words", type=int, default=400)
    ap.add_argument("--no-cta-check", action="store_true",
                    help="post uses a Daniel-approved custom close; skip the /start link check")
    args = ap.parse_args()

    url = args.url
    if not url and args.slug:
        with open(os.path.join(HERE, "progress.json")) as f:
            recs = [r for r in json.load(f) if r.get("slug") == args.slug]
        if not recs:
            print(f"FAIL: no progress.json record for slug {args.slug}")
            return 1
        url = recs[-1]["substack_url"]
    if not url:
        print("FAIL: need a URL or --slug")
        return 2

    failures = []
    try:
        status, html = fetch(url)
    except OSError as e:
        print(f"FAIL: fetch {url}: {e}")
        return 1
    if status != 200:
        failures.append(f"HTTP {status}")

    if args.expected_title not in html:
        failures.append(f"title not found: {args.expected_title!r}")
    if not args.no_cta_check and CTA_LINK not in html:
        failures.append(f"CTA link missing: {CTA_LINK}")
    if "substackcdn.com/image" not in html:
        failures.append("no Substack CDN image (hero missing?)")

    text = re.sub(r"<[^>]+>", " ", html)
    words = len(text.split())
    if words < args.min_words:
        failures.append(f"body too short: ~{words} words on page")

    if failures:
        print(f"VERIFY FAILED for {url}:")
        for f_ in failures:
            print(f"  - {f_}")
        return 1
    print(f"VERIFY OK: {url} (title, CTA, image, ~{words} page words)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
