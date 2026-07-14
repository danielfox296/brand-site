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
import argparse, os, subprocess, sys, tempfile, urllib.request

WEBSITE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(WEBSITE, "img", "blog")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"


def download(photo_id: str, dest: str) -> int:
    """Returns bytes written, or 0 on any HTTP/network failure (caller retries
    with a different id). Unsplash 403s some ids via urllib — don't crash."""
    url = f"https://unsplash.com/photos/{photo_id}/download?force=true&w=1600"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
            f.write(r.read())
    except (urllib.error.HTTPError, urllib.error.URLError, OSError) as e:
        print(f"download error for id={photo_id}: {e}", file=sys.stderr)
        return 0
    return os.path.getsize(dest)


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
    print(f"ok: {out} ({final} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
