#!/usr/bin/env python3
"""Source + compress a blog hero image from Unsplash.

Reinstated 2026-06-05 (the original one-off porter dir was deleted and was
never tracked in git). Browser-free; this is the deterministic half of the
cross-post workflow. The Substack publisher (CDP/Brave) is separate.

Usage:
    python3 source_unsplash.py --slug <slug-without-blog-prefix> --id <unsplash-photo-id>
    python3 source_unsplash.py --slug coffee-shop --id SNvtWzPFeZM

Find the photo id by searching unsplash.com and taking the trailing token of
the photo URL (e.g. unsplash.com/photos/<...>-SNvtWzPFeZM -> SNvtWzPFeZM).
Downloads at 1600px, center-crops to 1600x900 landscape, compresses to
<500KB JPEG, and writes website/img/blog/<slug>.jpg. Refuses to overwrite an
existing image (intentional: don't clobber a published post's hero).
"""
import argparse, os, re, subprocess, sys, tempfile, urllib.request
from html import unescape as html_unescape

WEBSITE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(WEBSITE, "img", "blog")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def _curl(url: str, dest: str | None = None) -> bytes:
    """urllib gets 401'd by Unsplash's bot detection even with browser headers
    (TLS fingerprinting); curl passes. Raises CalledProcessError on failure."""
    cmd = ["curl", "-sSL", "--fail", "--max-time", "60"]
    for k, v in HEADERS.items():
        cmd += ["-H", f"{k}: {v}"]
    if dest:
        cmd += ["-o", dest]
    cmd.append(url)
    return subprocess.run(cmd, check=True, capture_output=True).stdout


def _fetch(url: str, dest: str) -> int:
    _curl(url, dest)
    return os.path.getsize(dest)


def _cdn_url(photo_id: str) -> str:
    """Resolve a photo id to its images.unsplash.com base via the photo page's
    og:image tag, then request a clean 1600px JPEG (no opengraph watermark)."""
    page = f"https://unsplash.com/photos/{photo_id}"
    html = _curl(page).decode("utf-8", "replace")
    m = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', html)
    if not m:
        raise ValueError(f"no og:image on {page}")
    base = html_unescape(m.group(1)).split("?")[0]
    return f"{base}?w=1600&q=80&fm=jpg&fit=max"


def download(photo_id: str, dest: str) -> int:
    """Returns bytes written, or 0 on any HTTP/network failure (caller retries
    with a different id). Unsplash 403s some ids via urllib — don't crash.

    The /download endpoint started returning 401 for anonymous requests
    (2026-08-06), so fall back to the CDN URL resolved from the photo page.
    """
    try:
        return _fetch(
            f"https://unsplash.com/photos/{photo_id}/download?force=true&w=1600", dest)
    except (subprocess.CalledProcessError, OSError) as e:
        print(f"/download failed for id={photo_id} ({e}); trying CDN", file=sys.stderr)
    try:
        return _fetch(_cdn_url(photo_id), dest)
    except (subprocess.CalledProcessError, OSError, ValueError) as e:
        print(f"download error for id={photo_id}: {e}", file=sys.stderr)
        return 0


def process(src: str, out: str) -> None:
    cropped = src + ".crop.jpg"
    subprocess.run(["sips", "-c", "900", "1600", src, "--out", cropped],
                   check=True, capture_output=True)
    subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "80",
                    cropped, "--out", out], check=True, capture_output=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True, help="slug without the blog- prefix")
    ap.add_argument("--id", required=True, dest="photo_id", help="Unsplash photo id")
    args = ap.parse_args()

    out = os.path.join(OUT_DIR, f"{args.slug}.jpg")
    if os.path.exists(out):
        print(f"refuse: {out} already exists (won't clobber)", file=sys.stderr)
        return 2

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = tmp.name
    size = download(args.photo_id, tmp_path)
    if size < 50_000:
        print(f"download failed for id={args.photo_id} ({size} bytes) — try another id",
              file=sys.stderr)
        return 1
    process(tmp_path, out)
    final = os.path.getsize(out)
    if final > 500_000:
        print(f"warning: {out} is {final} bytes (>500KB)", file=sys.stderr)

    # Dedup: an identical hero on two posts means one of them reused a
    # photo id. Website CLAUDE.md requires this check; enforce it here.
    import hashlib
    new_md5 = hashlib.md5(open(out, "rb").read()).hexdigest()
    for f in os.listdir(OUT_DIR):
        path = os.path.join(OUT_DIR, f)
        if path == out or not f.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        if hashlib.md5(open(path, "rb").read()).hexdigest() == new_md5:
            os.remove(out)
            print(f"refuse: identical to existing {path} — pick a different "
                  "photo id", file=sys.stderr)
            return 3

    print(f"ok: {out} ({final} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
