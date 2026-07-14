# substack-port-work — cross-post pipeline

Durable scripts behind the `substack-cross-post` skill. Rebuilt 2026-07-13
from the CDP techniques proven live that day; **tracked in git** (the dir
was gitignored before, which is how the tooling got lost twice — don't
re-add `substack-port-work/` to .gitignore).

## Scripts

| Script | Does |
|---|---|
| `cross_post.py` | Orchestrator: preflight → record payload → Substack publish → postflight verify → optional Medium. `python3 cross_post.py blog-<slug> --json /tmp/rewrite.json [--medium] [--no-send] [--preflight-only] [--skip-live]` |
| `publish_to_substack.py` | Drives Brave/CDP: Tiptap paste publish, hero as first body node, "Send to everyone now". Writes `progress.json`. |
| `publish_to_medium.py` | medium.com/new-story paste flow (`/p/import` is dead). Topic tags are a manual step. |
| `verify_post.py` | Plain-HTTP postflight on the live Substack URL (title, CTA, image, word count). |
| `substack_auth.py` | Session check + emailed 6-digit-code sign-in (`check` / `request-code` / `enter-code`). |
| `source_unsplash.py` | Hero image: download by Unsplash photo id, crop 1600x900, compress <500KB. |
| `cdp.py` | Shared CDP library (websocket suppress_origin, PUT /json/new, Brave relaunch with the debug port). |

## Session expiry

Substack sessions expire. Every publish first runs the auth check; on
signed-out it exits 3 with the exact commands to run. The code is emailed
to danielchristopherfox@gmail.com (read it via Gmail MCP). Medium expiry
can't be scripted (Google sign-in) — sign in manually in Brave.

## Bookkeeping

- `posts/NNN_<slug>.json` — the exact payload published (committed)
- `progress.json` — slug, title, post id, live URLs (committed)
- `shots/`, `*.log` — runtime debris (gitignored)

Requires `pip3 install --user websocket-client`. Full workflow doc lives
in the skill: `../../.claude/skills/substack-cross-post/SKILL.md`.
