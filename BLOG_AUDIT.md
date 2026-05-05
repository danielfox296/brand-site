# Entuned Blog SEO Audit Report

**Date:** May 2026 (re-run; supersedes the March 2026 audit)
**Total posts audited:** 92 source posts (`_src/pages/blog-*`)
**Note:** 7 orphan built files exist with no source dir — see "Orphaned built files" below.

---

## Executive Summary (post-fix)

| Checklist Item | Pass | Fail | Rate |
|:---|:---:|:---:|:---:|
| C1: Title under 60 chars | 63/92 | 29/92 | 68% |
| C2: Meta description present and ≤155 chars | 92/92 | 0/92 | 100% |
| C3: Clear/direct opening (not narrative) | 92/92 | 0/92 | 100% |
| C4: At least one H2 phrased as a question | 0/92 | 92/92 | 0% |
| C5: At least 2 internal blog cross-links | 92/92 | 0/92 | 100% |
| C6: At least 1 core page link | 92/92 | 0/92 | 100% |
| C7: Contains data point / statistic | 92/92 | 0/92 | 100% |
| C8: CTA at end of post | 92/92 | 0/92 | 100% |
| C9: URL slug clean, ≤5 words | 57/92 | 35/92 | 61% |

### Just-applied (this audit pass)

- **Standardized 89 title suffixes** to ` | Entuned` (per VOICE.md), retiring ` — Entuned Blog` and ` | Entuned Blog`. Saved 6 chars per title; 9 titles dropped under 60 chars as a result.
- **Trimmed 31 over-length meta descriptions** to ≤155 chars at sentence boundaries. C2 now 100%.

### Critical Site-Wide Gaps (still open)

1. **Question-phrased H2s: 0/92.** The YAML schema renderer correctly emits H2s from `subhead` blocks, but every post uses declarative subheads. Adding one question-phrased H2 per post (e.g., "How does this affect sales?", "What should retailers do?") unlocks featured-snippet eligibility across the entire corpus.
2. **29 titles still over 60 chars.** Suffix standardization alone wasn't enough for the longest ones — they need actual rewrites. List below.
3. **35 long URL slugs (>5 words).** Fixing requires 301 redirects and is lower priority than the above.
4. **7 orphaned built files** with no source dir. They predate the YAML schema migration, are missing OG tags, Article schema, and won't survive a clean rebuild.

---

## Phase 0 Technical SEO — Status

| Check | Pass rate | Notes |
|:---|---:|:---|
| `<link rel="canonical">` | 112/112 (100%) | Clean |
| `og:title` / `og:description` / `og:image` / `og:url` | 105/112 (93%) | Missing only on 7 orphan files |
| Twitter Card tags | 105/112 (93%) | Same as above |
| `Article` schema (blog posts) | 92/99 (93%) | Same as above |
| `Organization` schema | 105/112 (93%) | Same as above |
| `robots.txt` AI-crawler-friendly | ✓ | GPTBot, ClaudeBot, PerplexityBot, Google-Extended explicitly allowed |
| `sitemap.xml` | 119 URLs | Indexed at `https://entuned.co/sitemap.xml` |

**Tech SEO is in good shape.** The only concrete gap is the 7 orphaned built files.

---

## Orphaned Built Files (no source dir)

These 7 files exist in `/blog/` on disk but have no corresponding `_src/pages/blog-*` directory. They predate the structured-YAML migration, lack OG tags + Article schema, and will be deleted on a clean build.

- `everything-designed-except-music.html`
- `retail-dwell-time.html`
- `the-hidden-cost-of-your-licensing-fee.html`
- `the-silent-brand-signal.html`
- `three-ways-to-think-about-what-your-store-cant-do-yet.html`
- `volume-knob.html`
- `what-spotify-gets-wrong.html`

**Recommended action:** for each, either (a) recreate the source dir using the YAML schema, or (b) delete and 301-redirect to the closest topical replacement. Decision needed from Daniel.

---

## C1: Titles Still Over 60 Characters (29 remaining)

Sorted by length descending. These need genuine rewrites — suffix normalization alone wasn't enough.

| Slug | Current Title | Len |
|:-----|:--------------|---:|
| `music-already-talking-to-customers` | Your Music Is Already Talking to Your Customers. The Question Is What It's Saying. \| Entuned | 92 |
| `retail-music-licensing-2026` | Retail Music Licensing in 2026: ASCAP, BMI, SESAC for Multi-Location Retailers \| Entuned | 88 |
| `the-familiarity-trap` | The Familiarity Trap: Why Recognizable Music Sends Your Customers Home Early \| Entuned | 86 |
| `ai-music-for-business-2026` | AI Music for Business in 2026: What Works, What Doesn't, and What to Watch \| Entuned | 84 |
| `what-church-concert-halls-and-film-composers-know-that-retail-doesnt` | What Churches, Concert Halls, and Film Composers Know That Retail Doesn't \| Entuned | 83 |
| `luxury-priming-is-real-and-you-dont-have-to-be-a-luxury-brand-to-use-it` | Luxury Priming Is Real: How Background Music Shifts What Customers Spend \| Entuned | 82 |
| `commercial-music-services-compared` | Alternatives to Mood Media in 2026: Commercial Music Services Compared \| Entuned | 80 |
| `sound-designer` | You Hired a Lighting Designer. Why Didn't You Hire a Sound Designer? \| Entuned | 78 |
| `music-for-boutique-clothing-stores` | Music for Boutiques: What Should Your Store Actually Sound Like? \| Entuned | 74 |
| `sensory-marketing-for-retail` | Sensory Marketing for Retail: Where Sound Fits in the Strategy \| Entuned | 72 |
| `sound-check-close-the-loop` | Sound Check: How Do You Know If Your Music Is Hurting Sales? \| Entuned | 70 |
| `what-happens-to-employee-performance-when-the-music-is-right` | What Happens to Employee Performance When the Music Is Right \| Entuned | 70 |
| `how-to-choose-music-for-your-retail-store` | How to Choose Music for Your Retail Store: A Complete Guide \| Entuned | 69 |
| `ai-generated-music-retail` | AI-Generated Music for Retail: What's Real and What's Hype \| Entuned | 68 |
| `closing-the-loop-on-retail-analytics` | How to Get More Out of the Sensor Data You Already Pay For \| Entuned | 68 |
| `mood-media-alternatives` | Mood Media Alternatives in 2026: A Retail Operator's Guide \| Entuned | 68 |
| `science-of-tempo-retail` | The Science of Tempo in Retail: What BPM Actually Controls \| Entuned | 68 |
| `tuesday-vs-saturday-traffic` | Tuesday vs. Saturday Traffic: What Your Data Actually Says \| Entuned | 68 |
| `mall-vs-street-location` | Mall vs. Street: Making the Same Brand Feel Right in Both \| Entuned | 67 |
| `next-retail-tech-acquisition` | Why the Next Big Retail Tech Acquisition Will Be in Audio \| Entuned | 67 |
| `retail-designed-everything` | Retail Designed Everything Except the Most Powerful Thing \| Entuned | 67 |
| `multi-location-music-management` | Multi-Location Music: Why Every Store Sounds Different \| Entuned | 64 |
| `music-provider-doesnt-know-retailnext` | Your Music Provider Doesn't Know What RetailNext Knows \| Entuned | 64 |
| `the-metrics-your-audio-environment-should-be-producing` | The Metrics Your Audio Environment Should Be Producing \| Entuned | 64 |
| `why-background-music-costs-you-sales` | Why Your Store's Background Music Is Costing You Sales \| Entuned | 64 |
| `why-your-best-customers-leave-faster-than-they-should` | Why Your Best Customers Leave Faster Than They Should \| Entuned | 63 |
| `employees-hear-it` | How Do I Get My Staff to Stop Turning Off the Music? \| Entuned | 62 |
| `how-specialty-wine-retailers-use-music-to-sell-more-expensive-bottles` | How Wine Retailers Use Music to Sell Premium Bottles \| Entuned | 62 |
| `retail-atmospherics-2026` | What Your Store Sounds Like in the First 10 Seconds \| Entuned | 61 |

---

## C4: Question-Phrased H2s — Site-Wide Gap

**0 of 92 posts** have an H2 phrased as a question. The YAML schema's `subhead` blocks render correctly as H2 elements; the issue is purely editorial — every post uses declarative subheads.

**Recommended approach:** add one question-phrased subhead per post. Examples:
- "Does music actually affect sales?"
- "How do you measure if your music is working?"
- "What should retailers do this week?"
- "Why does this matter for multi-store operators?"

This is a manual content edit per post, not a mechanical fix. Given the 92-post corpus, recommend doing 8-10 posts per session. Prioritize the model posts (`what-is-entuned`, `retail-atmospherics-2026`, `measure-roi-retail-music`, `what-are-flow-factors`) and the highest-traffic SEO targets (`can-you-play-spotify-in-your-store`, `mood-media-alternatives`, `how-to-choose-music-for-your-retail-store`, `retail-music-licensing-2026`).

---

## C9: Long URL Slugs (35)

Fixing slugs requires 301 redirects (Bowie config update) and risks losing existing rankings on already-indexed posts. **Defer until search-console data shows which posts are getting impressions** — fix only the underperformers.

---

## Cross-Linking Note

C5 (internal blog cross-links) is now passing 92/92. **Caveat:** the audit detection counts any `href="../blog/...html"` reference, including those auto-generated by the `related` block in the YAML schema. The structured renderer adds 3 related posts to every page automatically. This is good for crawl depth but not as strong a signal as in-body editorial cross-links. Editorial in-body cross-links inside `prose` blocks would strengthen topical authority further.

---

## Priority Order for Next Session

1. **Question-H2 conversion** — pick 10 highest-traffic posts, add one question subhead to each.
2. **Title rewrites** — the 29 still-long titles. Many can be tightened by removing throat-clearing ("Why Your Store's Background Music Is Costing You Sales" → "How Background Music Costs You Sales").
3. **Resolve the 7 orphaned files** — recreate or 301-redirect.
4. **Slug cleanup** — only after GSC data tells us which posts are actually ranking.

---

*Audit run: 2026-05-05. Script: `/tmp/blog_audit.py`. Mechanical fixes applied: `/tmp/seo_mechanical_fixes.py`.*
