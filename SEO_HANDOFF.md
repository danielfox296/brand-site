# Entuned SEO — Session Handoff

**Last work:** 2026-05-05. **Branch state:** all committed and pushed to `main` (last commit `df8ab99`).
**Read first:** `/Users/fox296/Desktop/entuned/website/CLAUDE.md`, `/Users/fox296/Desktop/entuned/VOICE.md`, `/Users/fox296/Desktop/entuned/website/BLOG_AUDIT.md`.

---

## Context (so you don't repeat what's already done)

The user dropped in `/Users/fox296/Downloads/entuned-seo-plan.md` (May 2026 PLG-pivot SEO plan) and said "execute this plan." The plan was written without seeing the live site state and was significantly out of date:

- It assumed 30+ blog posts; the site actually has **92 source posts / 99 built**.
- Five of the six "priority new posts" the plan recommends already exist (`can-you-play-spotify-in-your-store`, `mood-media-alternatives`, `how-to-choose-music-for-your-retail-store`, etc.).
- Homepage already PLG-positioned ("The Unmeasured Variable in Your Store's P&L"), pricing already 4-tier (Essentials free / Core $99 / Professional $399 / Enterprise), `/pilot.html` already redirected to enterprise, canonical CTA pattern already enforced (`app.entuned.co/start` per [website/CLAUDE.md](website/CLAUDE.md)).

**Do not write duplicate posts. Do not change the homepage title/meta — they're already PLG-positioned and stronger than the plan's recommendation.**

---

## What was done across this session (9 commits)

1. **Phase 0 tech audit.** Confirmed canonicals (100%), OG/Twitter tags (93%), Article schema (93%), `Organization` schema (93%), AI-crawler-friendly robots.txt. The 7% gap on each is the same 7 orphan files (see below).
2. **Full-corpus blog audit.** Re-ran the C1–C9 rubric across all 92 source posts (the March 2026 BLOG_AUDIT only covered 39).
3. **Title suffix normalization.** Standardized 89 blog title suffixes to ` | Entuned` (per VOICE.md), retiring ` — Entuned Blog` and ` | Entuned Blog`. Saved 6 chars/title.
4. **Title rewrites.** 29 over-length titles rewritten to fit ≤60 chars. Each preserves the keyword target. Full before/after table in BLOG_AUDIT.md.
5. **Meta description trims.** 31 meta descriptions ≤155 chars (3 awkward sentence cuts repaired by hand).
6. **Question-H2 conversion across all 92 posts.** Each post now has at least one H2 phrased as a question for featured-snippet eligibility. Done in 9 batches of ~10. Conversions logged in BLOG_AUDIT.md by batch.
7. **Audit script bug fix.** YAML schema appends `#` anchor links inside H2s; audit's question check was failing on the `?\n  #` suffix. Patched in `/tmp/blog_audit.py`.

**Final corpus state (8 of 9 checks at 100%):**

| Check | Rate |
|---|---|
| C1 title ≤60ch | 92/92 ✓ |
| C2 meta ≤155ch | 92/92 ✓ |
| C3 clear opening | 92/92 ✓ |
| C4 question H2 | 92/92 ✓ |
| C5 ≥2 internal blog links | 92/92 ✓ |
| C6 ≥1 core page link | 92/92 ✓ |
| C7 has data point | 92/92 ✓ |
| C8 has CTA | 92/92 ✓ |
| C9 slug ≤5 words | 57/92 (deferred) |

---

## Open items (in priority order)

### 1. Decide what to do with the 7 orphaned built files

These exist in `/website/blog/` on disk but have no `_src/pages/blog-*` source dir. They predate the YAML-schema migration, lack OG tags + Article schema, and **will be deleted on a clean rebuild**:

- `everything-designed-except-music.html`
- `retail-dwell-time.html`
- `the-hidden-cost-of-your-licensing-fee.html`
- `the-silent-brand-signal.html`
- `three-ways-to-think-about-what-your-store-cant-do-yet.html`
- `volume-knob.html`
- `what-spotify-gets-wrong.html`

**Decision needed from Daniel.** For each file: (a) recreate the source dir using the YAML schema, or (b) delete the orphan and 301-redirect to the closest topical replacement (the redirect map would live in `build.py` or a `_redirects` file — current redirect mechanism not yet identified, check Bowie config).

Suggested redirect targets if you go path (b):
- `the-hidden-cost-of-your-licensing-fee` → `the-real-cost-of-retail-music`
- `the-silent-brand-signal` → `your-store-already-has-a-mood`
- `volume-knob` → `tempo-volume-free`
- `what-spotify-gets-wrong` → `can-you-play-spotify-in-your-store`
- `everything-designed-except-music` → `retail-designed-everything`
- `retail-dwell-time` → `the-dwell-time-variable-nobodys-tracking`
- `three-ways-to-think-about-what-your-store-cant-do-yet` → `your-store-deserves-a-score`

But **do not act on this without Daniel's sign-off** — these may be ranking; check GSC first.

### 2. Slug cleanup (35 posts) — DO NOT DO YET

35 posts have slugs >5 words. Fixing them requires 301 redirects and risks losing existing rankings. **Do this only after Daniel pulls GSC data** identifying which long-slug posts are underperforming. The list is in BLOG_AUDIT.md.

### 3. New posts — only fill genuine gaps

The original plan listed six "priority new posts." Five already exist. The real, narrower gaps relative to the PLG buyer are:

- **Small-shop / 1–3 location framing layer.** Existing posts are written for multi-location operators. A single post or a content lens reframing dwell-time / licensing for the 1-store owner could meet the PLG buyer where they are.
- **"How to increase dwell time / AOV / store experience" Trojan-horse posts.** Cluster D in the plan. Broader retail-improvement angle where music is positioned as the under-utilized variable. Currently weak coverage.
- **"AI music for retail" emerging query.** The category term is nascent and growing — `ai-generated-music-retail`, `ai-music-for-business-2026`, `ai-vs-traditional-retail-music` are good but could be supplemented with a definitive "what is AI retail music" pillar post if GSC shows impression growth on the query.

**Do not write these on spec. Confirm with Daniel which gaps to fill, in what order.**

### 4. Phase 6 GEO bolt-ons (low priority)

The plan calls for FAQ blocks on key pages and more quotable stat lines. The question-H2 work this session already gives AI Overviews structured Q-A pairs. Two cheap additions if Daniel wants more lift:

- **Add a FAQ block to the homepage** (3–5 questions answered concisely, marked up with FAQPage schema).
- **Audit the top 10 posts for one-line "key takeaway" stat lines** — the `key_takeaways` block already exists in the YAML schema but isn't used uniformly. AI models pull these readily.

---

## Operating norms (from CLAUDE.md and PROTOCOL)

- **Always commit and push after edits.** Daniel runs everything live.
- **Build before commit:** `cd /Users/fox296/Desktop/entuned/website && python3 build.py`. Push triggers GitHub Actions → GitHub Pages.
- **Never edit root HTML directly.** Edit YAML source in `_src/pages/blog-*/content.yaml` (or `sections/01-content.html` for the legacy posts), then build.
- **YAML schema vs legacy HTML format.** 76+ posts use the structured YAML renderer (`type: subhead`, `type: prose`, `type: cta`). The rest use either the flat-key format (`h1_1`, `h2_1`, `p_1`) or raw HTML in `sections/01-content.html`. Detect format before editing.
- **Canonical CTA copy is enforced.** All posts use the verbatim `Start Free` block pointing to `https://app.entuned.co/start`. Don't customize per post.
- **VOICE.md governs tone.** Lead with outcomes, not technology. Never "AI" in titles or hero. "Retail music strategy" is the category term.
- **Never write to an SSOT without Daniel's sign-off.** BLOG_AUDIT.md is not an SSOT — it's a website-internal audit doc, fine to update.

---

## Useful files & tooling

- `/tmp/blog_audit.py` — full-corpus audit script (C1–C9). Re-run after edits with `python3 /tmp/blog_audit.py`. May not survive a fresh session — the script is in `/tmp/`. Re-create if missing; the logic is straightforward and BLOG_AUDIT.md documents what it checks.
- `/tmp/blog_audit.json` — last audit output as JSON.
- [BLOG_AUDIT.md](website/BLOG_AUDIT.md) — full corpus audit report with all batch logs, before/after title rewrites, all question-H2 conversions, and remaining open items.
- [CLAUDE.md](website/CLAUDE.md) — website-specific build/deploy rules and the canonical Start Free CTA copy.
- [VOICE.md](VOICE.md) — brand voice and SEO positioning rules.
- [START_HERE.md](START_HERE.md) — repo map.
- [PROTOCOL.md](PROTOCOL.md) — SSOT operating rules.

---

## Recommended first action in the new session

Before doing anything new, **re-read [BLOG_AUDIT.md](website/BLOG_AUDIT.md) and ask Daniel which open item to tackle.** The four candidates are:

1. Decide on the 7 orphan files (recreate vs. redirect).
2. Pull GSC data and act on slug cleanup for the underperformers.
3. Scope the small-shop / Trojan-horse content gaps.
4. Add FAQ blocks + structured stat callouts for GEO lift.

Don't auto-pick. Confirm with Daniel.
