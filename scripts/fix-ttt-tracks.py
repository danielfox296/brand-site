#!/usr/bin/env python3
"""Re-fetch specific broken/missing tracks for Banger or Nah?

Targets the entries that came back as Glee Cast covers, orchestra arrangements,
wrong remixes, or got rate-limited on the first pass. Merges results back into
data/ttt/episodes.json by (ep_number, search_title) and downloads art.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG_ROOT = ROOT / "img" / "ttt"
DATA = ROOT / "data" / "ttt" / "episodes.json"

# (ep_num, search_title, search_artist, accept_substr_in_artist_lower)
FIXES = [
    (2, "Empire State of Mind", "Jay-Z", "jay"),
    (4, "Crazy In Love", "Beyonce", "beyonc"),
    (6, "Rollin (Air Raid Vehicle)", "Limp Bizkit", "limp bizkit"),
    (7, "Uptown Funk", "Mark Ronson", "mark ronson"),
    (9, "Black", "Pearl Jam", "pearl jam"),
    (9, "Welcome to the Black Parade", "My Chemical Romance", "my chemical romance"),
    (10, "Flowers", "Miley Cyrus", "miley cyrus"),
    (10, "Murder on the Dancefloor", "Sophie Ellis-Bextor", "sophie ellis"),
]

BAD_ARTIST_TOKENS = (
    "karaoke", "tribute", "made famous by", "instrumental",
    "cover version", "cover band", "glee cast", "philharmonic",
    "orchestra", "vitamin string", "sofia karlberg", "ameritz",
    "string quartet", "lullaby", "8-bit",
)


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def itunes_search(title: str, artist: str, require_artist: str):
    term = f"{title} {artist}"
    url = (
        "https://itunes.apple.com/search?"
        + urllib.parse.urlencode(
            {"term": term, "entity": "song", "limit": 25, "country": "US"}
        )
    )
    req = urllib.request.Request(url, headers={"User-Agent": "TTT-fetcher/1.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read().decode("utf-8"))
    results = data.get("results", [])
    title_norm = re.sub(r"[^a-z0-9]", "", title.lower())
    scored = []
    for cand in results:
        if not cand.get("previewUrl"):
            continue
        rt_lower = cand.get("trackName", "").lower()
        ra_lower = cand.get("artistName", "").lower()
        if require_artist and require_artist not in ra_lower:
            continue
        if any(b in ra_lower for b in BAD_ARTIST_TOKENS):
            continue
        if any(b in rt_lower for b in BAD_ARTIST_TOKENS):
            continue
        rt = re.sub(r"[^a-z0-9]", "", rt_lower)
        score = 0
        if title_norm == rt:
            score += 20
        elif rt.startswith(title_norm) or title_norm.startswith(rt):
            score += 10
        elif title_norm in rt or rt in title_norm:
            score += 5
        if "live" in rt_lower and "live" not in title.lower():
            score -= 5
        if "remix" in rt_lower and "remix" not in title.lower():
            score -= 3
        scored.append((score, cand))
    if not scored:
        return None
    scored.sort(key=lambda x: -x[0])
    return scored[0][1]


def download(url: str, dest: Path):
    if dest.exists() and dest.stat().st_size > 1000:
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "TTT-fetcher/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        dest.write_bytes(r.read())


def main():
    data = json.loads(DATA.read_text())
    eps_by_num = {ep["number"]: ep for ep in data["episodes"]}

    for ep_num, title, artist, require_artist in FIXES:
        print(f"  ep{ep_num:03d} :: {title} — {artist}", flush=True)
        for attempt in range(4):
            try:
                hit = itunes_search(title, artist, require_artist.lower())
                break
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    wait = 2 ** attempt
                    print(f"    429 — sleeping {wait}s")
                    time.sleep(wait)
                    continue
                print(f"    ! HTTP {e.code}: {e}", file=sys.stderr)
                hit = None
                break
            except Exception as e:
                print(f"    ! error: {e}", file=sys.stderr)
                hit = None
                break
        else:
            hit = None
        if not hit:
            print(f"    ! NO MATCH", file=sys.stderr)
            continue
        ep = eps_by_num[ep_num]
        ep_id = f"{ep_num:03d}"
        art_url = hit.get("artworkUrl100", "").replace("100x100bb", "600x600bb")
        slug = f"{slugify(title)}_{slugify(artist)}"
        art_rel = f"img/ttt/ep{ep_id}/{slug}.jpg"
        try:
            download(art_url, ROOT / art_rel)
        except Exception as e:
            print(f"    ! art download failed: {e}", file=sys.stderr)
        new_song = {
            "title": hit.get("trackName") or title,
            "artist": hit.get("artistName") or artist,
            "art": art_rel,
            "preview": hit.get("previewUrl"),
        }
        # Replace existing entry with same search-title (case-insensitive substring)
        # else append.
        replaced = False
        title_key = re.sub(r"[^a-z0-9]", "", title.lower())
        for i, s in enumerate(ep["songs"]):
            existing_key = re.sub(r"[^a-z0-9]", "", s["title"].lower())
            if title_key in existing_key or existing_key in title_key:
                ep["songs"][i] = new_song
                replaced = True
                break
        if not replaced:
            ep["songs"].append(new_song)
        print(f"    ✓ {new_song['title']} — {new_song['artist']}")
        time.sleep(0.6)

    # Re-sort each episode's songs to match the original FIXES + earlier order
    DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    total = sum(len(e["songs"]) for e in data["episodes"])
    print(f"\nWrote {DATA} ({total} songs)")


if __name__ == "__main__":
    main()
