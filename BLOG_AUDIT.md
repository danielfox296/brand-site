# Entuned Blog SEO Audit Report

**Date:** May 2026 (re-run; supersedes the March 2026 audit)
**Total posts audited:** 92 source posts (`_src/pages/blog-*`)
**Note:** 7 orphan built files exist with no source dir — see "Orphaned built files" below.

---

## Executive Summary (post-fix)

| Checklist Item | Pass | Fail | Rate |
|:---|:---:|:---:|:---:|
| C1: Title under 60 chars | 92/92 | 0/92 | 100% |
| C2: Meta description present and ≤155 chars | 92/92 | 0/92 | 100% |
| C3: Clear/direct opening (not narrative) | 92/92 | 0/92 | 100% |
| C4: At least one H2 phrased as a question | 82/92 | 10/92 | 89% |
| C5: At least 2 internal blog cross-links | 92/92 | 0/92 | 100% |
| C6: At least 1 core page link | 92/92 | 0/92 | 100% |
| C7: Contains data point / statistic | 92/92 | 0/92 | 100% |
| C8: CTA at end of post | 92/92 | 0/92 | 100% |
| C9: URL slug clean, ≤5 words | 57/92 | 35/92 | 61% |

### Applied across the May 2026 audit pass

- **Title suffix normalization:** all 89 ` — Entuned Blog` / ` | Entuned Blog` suffixes changed to ` | Entuned` (per VOICE.md).
- **29 over-length titles rewritten** to fit ≤60 chars while preserving keyword targets. C1 now 100%.
- **31 over-length meta descriptions trimmed** to ≤155 chars at sentence boundaries. C2 now 100%.
- **10 priority posts** got a question-phrased subhead (Cluster A/B/C/E winners): Spotify-licensing, Mood Media alts, Mood Media exit, retail music licensing 2026, AI-generated music, commercial services compared, best background music 2026, science of tempo, how to choose music, psychographic profiling.

### Critical Site-Wide Gaps (still open)

1. **Question-phrased H2s: 12/92.** 80 posts still need at least one question-phrased subhead for featured-snippet eligibility. Recommend continuing in batches of ~10 per session, prioritized by traffic.
2. **35 long URL slugs (>5 words).** Fixing requires 301 redirects. Defer until GSC data identifies the underperforming ones.
3. **7 orphaned built files** with no source dir. They predate the YAML schema migration, are missing OG tags, Article schema, and won't survive a clean rebuild. Decision pending: recreate or 301-redirect.

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

## C1: Titles Rewrites Applied (29 of 29)

All titles rewritten in this audit pass to fit ≤60 chars while preserving keyword targets. Below is the before/after record. Sorted by original length descending.

| Slug | Was → Now | Len |
|:-----|:---------|---:|
| `music-already-talking-to-customers` | Your Music Is Already Talking. What's It Saying? \| Entuned | 58 |
| `retail-music-licensing-2026` | Retail Music Licensing in 2026: ASCAP, BMI, SESAC \| Entuned | 59 |
| `the-familiarity-trap` | The Familiarity Trap: Why Hits Send Customers Home \| Entuned | 60 |
| `ai-music-for-business-2026` | AI Music for Business in 2026: What Actually Works \| Entuned | 60 |
| `what-church-concert-halls-and-film-composers-know-that-retail-doesnt` | What Concert Halls Know That Retail Doesn't \| Entuned | 53 |
| `luxury-priming-is-real-and-you-dont-have-to-be-a-luxury-brand-to-use-it` | Luxury Priming: How Music Lifts Shopper Spend \| Entuned | 55 |
| `commercial-music-services-compared` | Commercial Music Services Compared (2026) \| Entuned | 51 |
| `sound-designer` | You Hired a Lighting Designer. Hire a Sound One. \| Entuned | 58 |
| `music-for-boutique-clothing-stores` | Music for Boutiques: What Should You Sound Like? \| Entuned | 58 |
| `sensory-marketing-for-retail` | Sensory Marketing: Where Sound Fits the Strategy \| Entuned | 58 |
| `sound-check-close-the-loop` | How Do You Know If Your Music Is Hurting Sales? \| Entuned | 57 |
| `what-happens-to-employee-performance-when-the-music-is-right` | When the Music's Right, Employees Perform Better \| Entuned | 58 |
| `how-to-choose-music-for-your-retail-store` | How to Choose Music for Your Retail Store \| Entuned | 51 |
| `ai-generated-music-retail` | AI-Generated Music for Retail: Real or Hype? \| Entuned | 54 |
| `closing-the-loop-on-retail-analytics` | Get More From the Sensor Data You Already Pay For \| Entuned | 59 |
| `mood-media-alternatives` | Mood Media Alternatives: A 2026 Operator's Guide \| Entuned | 58 |
| `science-of-tempo-retail` | The Science of Tempo: What BPM Controls in Retail \| Entuned | 59 |
| `tuesday-vs-saturday-traffic` | Tuesday vs. Saturday Traffic: What the Data Says \| Entuned | 58 |
| `mall-vs-street-location` | Mall vs. Street: Same Brand, Two Soundscapes \| Entuned | 54 |
| `next-retail-tech-acquisition` | The Next Big Retail Tech Acquisition Is Audio \| Entuned | 55 |
| `retail-designed-everything` | Retail Designed Everything Except the Soundtrack \| Entuned | 58 |
| `multi-location-music-management` | Multi-Location Music: Why Every Store Sounds Off \| Entuned | 58 |
| `music-provider-doesnt-know-retailnext` | Your Music Provider Doesn't Know RetailNext \| Entuned | 53 |
| `the-metrics-your-audio-environment-should-be-producing` | Metrics Your Store Audio Should Be Producing \| Entuned | 54 |
| `why-background-music-costs-you-sales` | Why Your Background Music Is Costing You Sales \| Entuned | 56 |
| `why-your-best-customers-leave-faster-than-they-should` | Why Your Best Customers Leave Faster Than They Should | 53 |
| `employees-hear-it` | How Do I Stop Staff From Turning Off the Music? \| Entuned | 57 |
| `how-specialty-wine-retailers-use-music-to-sell-more-expensive-bottles` | How Wine Stores Use Music to Sell Premium Bottles \| Entuned | 59 |
| `retail-atmospherics-2026` | What Your Store Sounds Like in 10 Seconds \| Entuned | 51 |

---

## C4: Question-Phrased H2s — Conversions Log

**22 of 92 posts** now have at least one H2 phrased as a question (up from 0). Posts converted across two batches:

### Batch 1 (Cluster A/B/E winners)
| Slug | Question H2 added |
|:-----|:------------------|
| `can-you-play-spotify-in-your-store` | Why doesn't my Spotify subscription cover my store? |
| `mood-media-alternatives` | Why are operators leaving Mood Media? |
| `how-to-choose-music-for-your-retail-store` | What does the research actually say? |
| `retail-music-licensing-2026` | What does an ASCAP or BMI letter actually mean? |
| `ai-generated-music-retail` | What can AI-generated music not do yet? |
| `commercial-music-services-compared` | Should you switch music vendors right now? |
| `best-background-music-for-retail-stores-2026` | Is it legal to play your background music? |
| `science-of-tempo-retail` | What does tempo actually do in retail? |
| `get-out-of-mood-media-contract` | How do you actually exit a Mood Media contract? |
| `psychographic-profiling-retail` | What kind of music should my store play? |

### Batch 2 (cost / multi-location / vertical / AI category)
| Slug | Question H2 added |
|:-----|:------------------|
| `how-much-does-retail-music-cost` | How much does retail music actually cost in 2026? |
| `multi-location-music-management` | Why does every store sound different? |
| `music-for-boutique-clothing-stores` | What should a boutique actually sound like? |
| `the-familiarity-trap` | How does familiar music affect dwell time? |
| `why-background-music-costs-you-sales` | Is your background music costing you sales? |
| `the-real-cost-of-retail-music` | What does bad retail music actually cost you? |
| `music-for-home-goods-stores` | What music works in a home goods store? |
| `ai-music-for-business-2026` | What should you ask your music provider this quarter? |
| `ai-vs-traditional-retail-music` | How should you evaluate AI vs. traditional retail music? |
| `sensory-marketing-for-retail` | Why does retail still treat sound like a utility? |

### Batch 3 (measurement / dwell / ROI / research / acquisition thesis)
| Slug | Question H2 added |
|:-----|:------------------|
| `the-dwell-time-variable-nobodys-tracking` | Why isn't anyone tracking audio's effect on dwell time? |
| `what-is-entuned` | What does Entuned actually do? |
| `measure-roi-retail-music` | How do you measure the ROI of in-store music? |
| `the-metrics-your-audio-environment-should-be-producing` | What metrics should your store audio actually produce? |
| `tempo-controls` | What does tempo actually control in a retail store? |
| `tempo-volume-free` | What can tempo and volume alone actually do? |
| `longer-visits` | Do longer visits actually mean bigger receipts? |
| `milliman-study` | What did the Milliman study actually find? |
| `cfos-case-for-retail-audio` | Which P&L lines does retail audio actually move? |
| `next-retail-tech-acquisition` | Why will the next big retail tech acquisition be in audio? |

### Batch 4 (employees / premium / measurement / strategy / verticals / testing)
| Slug | Question H2 added |
|:-----|:------------------|
| `employees-hear-it` | Why does your staff keep turning off the music? |
| `how-to-make-your-store-sound-premium` | What makes a store actually sound premium? |
| `how-to-measure-if-your-store-music-is-working` | How do you know if your store music is working? |
| `in-store-music-strategy` | What's the difference between song selection and music strategy? |
| `in-store-audio-advertising-vs-audio-strategy` | What's the difference between audio advertising and audio strategy? |
| `luxury-priming-is-real-and-you-dont-have-to-be-a-luxury-brand-to-use-it` | Does luxury-style music really make shoppers spend more? |
| `major-key` | Does happy music actually make customers spend more? |
| `how-specialty-wine-retailers-use-music-to-sell-more-expensive-bottles` | Can music actually shift which bottles customers buy? |
| `fleet-learning` | How do you run controlled tests across multiple stores? |
| `closing-the-loop-on-retail-analytics` | Why doesn't anyone act on the sensor data? |

### Batch 5 (atmospherics / flow / ROI / CX / verticals / multi-location / classic posts)
| Slug | Question H2 added |
|:-----|:------------------|
| `retail-atmospherics-2026` | What does your store sound like in the first 10 seconds? |
| `what-are-flow-factors` | Does your store's music actually matter? |
| `the-8-12-youre-leaving-on-the-table` | How much revenue is bad music actually leaving on the table? |
| `the-supermarket-study` | What did the supermarket music study actually prove? |
| `the-audio-gap-in-retail-customer-experience` | Where is the audio gap in your customer experience? |
| `music-was-never-made-for-your-store` | Who was your store's music actually made for? |
| `what-music-to-play-in-a-high-end-store` | What music should a high-end store actually play? |
| `mall-vs-street-location` | Should mall and street stores sound the same? |
| `bye-bye-bye-dwell-time` | Where is your store losing dwell time? |
| `music-already-talking-to-customers` | What is your store's music already telling customers? |

### Batch 6 (vendor management / brand signal / store-as-room / playlist era)
| Slug | Question H2 added |
|:-----|:------------------|
| `qbr-questions-music-vendor` | What should you ask your music vendor at QBR? |
| `music-provider-doesnt-know-retailnext` | Why doesn't your music provider know what your analytics know? |
| `retail-designed-everything` | Why is store music the one thing retail leaves to chance? |
| `what-happens-to-employee-performance-when-the-music-is-right` | How does music affect employee performance? |
| `why-your-best-customers-leave-faster-than-they-should` | Why are your best customers leaving sooner than they should? |
| `what-your-music-is-saying-about-your-brand` | What is your music really saying about your brand? |
| `the-store-is-not-a-set` | Is your store a stage set or a real room? |
| `what-church-concert-halls-and-film-composers-know-that-retail-doesnt` | What do film composers know that retail doesn't? |
| `the-playlist-era-and-the-open-loop` | Why is the playlist era a feedback loop nobody closed? |
| `seamless-playback` | Why do most retail playlists break the room? |

### Batch 7 (sensor gap / art-vs-design / measurement / sound-check series)
| Slug | Question H2 added |
|:-----|:------------------|
| `2-billion-sensors-no-real-time-levers` | Why don't retail sensors translate into real-time levers? |
| `closing-the-loop` | Why is store audio the one environment nobody measures? |
| `difference-between-art-and-design` | What's the difference between art and design? |
| `every-song-working-or-not` | Is every song in your store either working or hurting? |
| `measure-what-you-ignore` | Which store-level KPIs are you not tracking yet? |
| `sound-check-close-the-loop` | How do you know if your music is hurting sales? |
| `sound-check-music-is-a-variable` | Is your music a managed variable or just background? |
| `sound-check-music-selling-against-you` | Is your store music actually selling against you? |
| `sound-check-playlist-problem` | What's actually wrong with your store's playlist? |
| `sound-check-science-youre-ignoring` | What does retail music science actually say? |

### Batch 8 (90-day arc / lyrics / second-sale / traffic / mood / score / producer / venues)
| Slug | Question H2 added |
|:-----|:------------------|
| `after-ninety-days` | What changes after ninety days of measured audio? |
| `read-the-lyrics-on-your-speakers-right-now` | Have you actually read the lyrics on your store speakers? |
| `the-second-sale-you-already-made` | Are you missing the second sale you already made? |
| `tuesday-vs-saturday-traffic` | Should Tuesday and Saturday traffic sound the same? |
| `your-store-already-has-a-mood` | What mood is your store already broadcasting? |
| `your-store-deserves-a-score` | Why does your store deserve a score, not a playlist? |
| `what-a-producer-hears` | What does a music producer hear in your store that you don't? |
| `the-nightclub-on-the-sales-floor` | Is your store running a nightclub on the sales floor? |
| `the-sound-of-nothing` | When does silence in a store actually work? |
| `what-jazz-musicians-hear` | What do jazz musicians hear that streaming tags miss? |

**10 posts still need a question subhead.** Final batch coming.

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
