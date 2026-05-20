#!/usr/bin/env python3
"""Fetch iTunes metadata + album art for Banger or Nah? episodes.

Reads the EPISODES list below, queries iTunes Search API for each track,
downloads 600x600 album art to img/ttt/epNNN/, writes data/ttt/episodes.json.

Re-runnable: skips downloads whose target file already exists.
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG_ROOT = ROOT / "img" / "ttt"
DATA_OUT = ROOT / "data" / "ttt" / "episodes.json"

EPISODES = [
    {
        "number": 1,
        "title": "Across the Eras",
        "tracks": [
            ("Smells Like Teen Spirit", "Nirvana"),
            ("...Baby One More Time", "Britney Spears"),
            ("Mr. Brightside", "The Killers"),
            ("Bad Romance", "Lady Gaga"),
            ("Espresso", "Sabrina Carpenter"),
        ],
    },
    {
        "number": 2,
        "title": "Hip-Hop Through the Years",
        "tracks": [
            ("Juicy", "The Notorious B.I.G."),
            ("California Love", "2Pac"),
            ("Hey Ya!", "OutKast"),
            ("Empire State of Mind", "JAY-Z Alicia Keys"),
            ("HUMBLE.", "Kendrick Lamar"),
        ],
    },
    {
        "number": 3,
        "title": "Cry on the Dance Floor",
        "tracks": [
            ("Nothing Compares 2 U", "Sinead O'Connor"),
            ("Iris", "Goo Goo Dolls"),
            ("Chasing Cars", "Snow Patrol"),
            ("Someone Like You", "Adele"),
            ("drivers license", "Olivia Rodrigo"),
        ],
    },
    {
        "number": 4,
        "title": "Wedding Floor Anthems",
        "tracks": [
            ("Livin' On a Prayer", "Bon Jovi"),
            ("I Want It That Way", "Backstreet Boys"),
            ("Crazy In Love", "Beyonce"),
            ("I Gotta Feeling", "Black Eyed Peas"),
            ("Shake It Off", "Taylor Swift"),
        ],
    },
    {
        "number": 5,
        "title": "Blog Rock / Indie Sleaze",
        "tracks": [
            ("Last Nite", "The Strokes"),
            ("Maps", "Yeah Yeah Yeahs"),
            ("Float On", "Modest Mouse"),
            ("Time to Pretend", "MGMT"),
            ("A-Punk", "Vampire Weekend"),
        ],
    },
    {
        "number": 6,
        "title": "Love It or Hate It",
        "tracks": [
            ("Wonderwall", "Oasis"),
            ("Rollin'", "Limp Bizkit"),
            ("Toxic", "Britney Spears"),
            ("Photograph", "Nickelback"),
            ("Despacito", "Luis Fonsi Justin Bieber"),
        ],
    },
    {
        "number": 7,
        "title": "2010s Pop Reign",
        "tracks": [
            ("Rolling in the Deep", "Adele"),
            ("Get Lucky", "Daft Punk Pharrell"),
            ("Uptown Funk", "Mark Ronson Bruno Mars"),
            ("Hotline Bling", "Drake"),
            ("bad guy", "Billie Eilish"),
        ],
    },
    {
        "number": 8,
        "title": "R&B Generations",
        "tracks": [
            ("Vision of Love", "Mariah Carey"),
            ("Waterfalls", "TLC"),
            ("Try Again", "Aaliyah"),
            ("Crazy", "Gnarls Barkley"),
            ("Pink + White", "Frank Ocean"),
        ],
    },
    {
        "number": 9,
        "title": "Rock Through the Decades",
        "tracks": [
            ("Black", "Pearl Jam"),
            ("1979", "Smashing Pumpkins"),
            ("In the End", "Linkin Park"),
            ("Welcome to the Black Parade", "My Chemical Romance"),
            ("Pumped Up Kicks", "Foster the People"),
        ],
    },
    {
        "number": 10,
        "title": "Right Now",
        "tracks": [
            ("Heat Waves", "Glass Animals"),
            ("good 4 u", "Olivia Rodrigo"),
            ("Flowers", "Miley Cyrus"),
            ("Murder on the Dancefloor", "Sophie Ellis-Bextor"),
            ("Pink Pony Club", "Chappell Roan"),
        ],
    },
]


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def itunes_search(title: str, artist: str):
    """Query iTunes Search API. Returns best matching song dict or None."""
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
    if not results:
        return None
    # Pick best: exact-ish title match wins; prefer one with previewUrl
    title_norm = re.sub(r"[^a-z0-9]", "", title.lower())
    artist_norm = re.sub(r"[^a-z0-9]", "", artist.lower())
    scored = []
    for r in results:
        if not r.get("previewUrl"):
            continue
        rt = re.sub(r"[^a-z0-9]", "", r.get("trackName", "").lower())
        ra = re.sub(r"[^a-z0-9]", "", r.get("artistName", "").lower())
        score = 0
        if title_norm == rt:
            score += 10
        elif title_norm in rt or rt in title_norm:
            score += 5
        if artist_norm in ra or any(p in ra for p in artist_norm.split()):
            score += 5
        # Penalize remix/live/karaoke unless the search asked for it
        bad = ("karaoke", "tribute", "made famous by", "instrumental", "cover version")
        if any(b in r.get("trackName", "").lower() for b in bad) or any(
            b in r.get("artistName", "").lower() for b in bad
        ):
            score -= 20
        if "live" in r.get("trackName", "").lower() and "live" not in title.lower():
            score -= 3
        scored.append((score, r))
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
    out = {"episodes": []}
    for ep in EPISODES:
        ep_id = f"{ep['number']:03d}"
        ep_dir = IMG_ROOT / f"ep{ep_id}"
        songs = []
        for title, artist in ep["tracks"]:
            print(f"  ep{ep_id} :: {title} — {artist}", flush=True)
            try:
                hit = itunes_search(title, artist)
            except Exception as e:
                print(f"    ! search error: {e}", file=sys.stderr)
                hit = None
            if not hit:
                print(f"    ! NO MATCH for {title} — {artist}", file=sys.stderr)
                continue
            # Upgrade art URL to 600x600
            art_url = hit.get("artworkUrl100", "").replace(
                "100x100bb", "600x600bb"
            )
            slug = f"{slugify(title)}_{slugify(artist)}"
            art_rel = f"img/ttt/ep{ep_id}/{slug}.jpg"
            art_path = ROOT / art_rel
            try:
                download(art_url, art_path)
            except Exception as e:
                print(f"    ! art download failed: {e}", file=sys.stderr)
            songs.append(
                {
                    "title": hit.get("trackName") or title,
                    "artist": hit.get("artistName") or artist,
                    "art": art_rel,
                    "preview": hit.get("previewUrl"),
                }
            )
            time.sleep(0.25)  # polite to iTunes
        out["episodes"].append(
            {
                "id": ep_id,
                "number": ep["number"],
                "slug": f"ep-{ep_id}-{slugify(ep['title'])}",
                "title": ep["title"],
                "songs": songs,
            }
        )
    DATA_OUT.parent.mkdir(parents=True, exist_ok=True)
    DATA_OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"\nWrote {DATA_OUT} ({sum(len(e['songs']) for e in out['episodes'])} songs)")


if __name__ == "__main__":
    main()
