# entuned.co — Claude Code Instructions

entuned.co is the **Entuned, LLC parent-company page**: a reference page for anyone checking who Entuned, LLC is (card statements, invoices, Stripe, Mercury, W-9s), linking out to the ventures. The retail music product is shut down. Not a sales page. (Daniel's handoff, 2026-11-12.)

Root rules and memory policy live in `../CLAUDE.md`. Build details in `ARCHITECTURE.md` (its product-era sections are history).

## What's live

- `/` — company line, Entuned logo, company line, three venture cards (Signet Artists, Fractional CMO, Music Behaviorist). No header; the footer carries the contact email, Privacy Policy and Terms. Daniel's name stays off the page and out of the schema (Daniel, 2026-11-12). Organization JSON-LD comes from `build.py` (`LLC_LINE`, `VENTURE_URLS`, `CONTACT_EMAIL`).
- `/privacy-policy.html` — covers Entuned, LLC and every venture, Signet included; Signet may link to it. Approved by Daniel 2026-11-12.
- `/pricing/terms.html` — archive of the old subscription terms for past customers. Don't delete.
- `404.html`.
- Everything else is a redirect stub (`config.json` with `redirect_to`): to `/`, except `blog/live-music-in-your-store.html` and `blog/the-pianist-in-the-store.html` → signetartists.com/blog/<slug>/. Licensing pages redirect home too (Daniel, 2026-11-12). Don't revive product pages.

## Build and deploy

- GitHub Pages (no server redirects) → redirects are meta-refresh stubs with canonical + fallback link.
- Never write `.html` by hand. Edit `_src/`, run `python3 build.py`, then `git add -A && git commit && git push origin main`. The pre-commit hook rebuilds.
- `sitemap.xml` and `llms.txt` are generated (llms prose: `_src/llms-template.txt`). No RSS feed.

## Copy

Daniel's existing voice rules (`../VOICE.md`, `~/Desktop/site-ops/BASE-VOICE.md`). No em dashes. Describe, don't sell. Don't invent logos.
