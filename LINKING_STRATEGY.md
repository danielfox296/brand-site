# Entuned Internal Linking Strategy
**Last updated: April 16, 2026**

## Why This Matters

entuned.co has ~35 core pages and 79 blog posts. Internal links signal
topic clusters to crawlers and guide readers toward the pilot.

## Core Principles

1. **Every blog post links UP to its cluster's pillar page** (hub-and-spoke)
2. **Every blog post has a pilot CTA** (in the sections-format YAML via
   `type: cta` block; rendered as a soft pilot inquiry)
3. **Anchor text is descriptive, not "click here"** - match the destination's subject
4. **Max ~5 internal links per post** (excluding nav, footer, CTA)
5. **Pillar pages link down to 3-6 supporting blog posts** (`further_reading`)
6. **No orphans** - every page gets at least 2 meaningful inbound links

---

## Topic Cluster Map

Pillar pages and their current supporting post inventory:

### Cluster 1 - The Science
**Pillar:** `science.html` ("The Science Behind the Soundtrack")
- blog/science-of-tempo-retail.html
- blog/milliman-study.html ("The Milliman Study Is Wrong. Sort Of.")
- blog/what-are-flow-factors.html ("Does Your Store's Music Actually Matter?")
- blog/tempo-controls.html
- blog/luxury-priming-is-real-and-you-dont-have-to-be-a-luxury-brand-to-use-it.html
- blog/the-familiarity-trap.html
- blog/major-key.html
- blog/how-specialty-wine-retailers-use-music-to-sell-more-expensive-bottles.html
- blog/difference-between-art-and-design.html
- blog/longer-visits.html
- blog/how-to-choose-music-for-your-retail-store.html
- blog/best-background-music-for-retail-stores-2026.html
- blog/in-store-music-strategy.html

### Cluster 2 - ROI & Cost
**Pillar:** `for-cfos.html` ("The CFO's Case for Retail Audio")
- blog/cfos-case-for-retail-audio.html
- blog/the-8-12-youre-leaving-on-the-table.html
- blog/measure-roi-retail-music.html
- blog/why-background-music-costs-you-sales.html
- blog/the-real-cost-of-retail-music.html
- blog/the-hidden-cost-of-your-licensing-fee.html
- blog/how-much-does-retail-music-cost.html
- blog/tempo-volume-free.html
- blog/the-metrics-your-audio-environment-should-be-producing.html
- blog/how-to-measure-if-your-store-music-is-working.html

### Cluster 3 - Analytics / Measurement Gap + Competitor
**Pillar:** `why-entuned.html`
- blog/closing-the-loop-on-retail-analytics.html
- blog/2-billion-sensors-no-real-time-levers.html
- blog/music-provider-doesnt-know-retailnext.html
- blog/measure-what-you-ignore.html
- blog/the-dwell-time-variable-nobodys-tracking.html
- blog/after-ninety-days.html
- blog/three-ways-to-think-about-what-your-store-cant-do-yet.html
- blog/battery-ventures-thesis-extended.html
- blog/next-retail-tech-acquisition.html
- blog/fleet-learning.html ("Running Controlled Tests Across Multiple Stores")
- blog/what-spotify-gets-wrong.html
- blog/can-you-play-spotify-in-your-store.html
- blog/mood-media-alternatives.html
- blog/music-was-never-made-for-your-store.html
- blog/commercial-music-services-compared.html
- blog/retail-music-licensing-2026.html
- blog/in-store-audio-advertising-vs-audio-strategy.html
- (plus all 5 Sound Check posts)

### Cluster 4 - How It Works / Product
**Pillar:** `how-it-works.html`
- blog/what-is-entuned.html
- blog/ai-generated-music-retail.html
- blog/ai-vs-traditional-retail-music.html
- blog/ai-music-for-business-2026.html
- blog/seamless-playback.html
- blog/psychographic-profiling-retail.html ("What Kind of Music Should a Store Like Mine Play?")

### Cluster 5 - Brand / Employee / Leadership
**Pillar:** `for-retail-leaders.html`
- blog/the-silent-brand-signal.html
- blog/what-your-music-is-saying-about-your-brand.html
- blog/employees-hear-it.html
- blog/store-manager-problem.html
- blog/your-store-already-has-a-mood.html
- blog/the-store-is-not-a-set.html
- blog/read-the-lyrics-on-your-speakers-right-now.html
- blog/what-happens-to-employee-performance-when-the-music-is-right.html
- blog/retail-designed-everything.html
- blog/everything-designed-except-music.html
- blog/sensory-marketing-for-retail.html
- blog/the-audio-gap-in-retail-customer-experience.html
- blog/sound-designer.html
- blog/what-a-producer-hears.html
- blog/what-church-concert-halls-and-film-composers-know-that-retail-doesnt.html
- blog/multi-location-music-management.html
- blog/retail-atmospherics-2026.html ("What Your Store Sounds Like in the First 10 Seconds")
- blog/how-to-make-your-store-sound-premium.html
- blog/what-music-to-play-in-a-high-end-store.html
- blog/volume-knob.html

### Cluster 6 - Dwell Time / Outcomes
**Pillar:** `results.html`
- blog/retail-dwell-time.html
- blog/why-your-best-customers-leave-faster-than-they-should.html
- blog/the-second-sale-you-already-made.html
- blog/every-song-working-or-not.html

### Sound Check Series (navigable as a 5-post series)
1. blog/sound-check-music-is-a-variable.html
2. blog/sound-check-playlist-problem.html
3. blog/sound-check-music-selling-against-you.html
4. blog/sound-check-science-youre-ignoring.html
5. blog/sound-check-close-the-loop.html

### Vertical-Specific (point to vertical pages)
- blog/music-for-boutique-clothing-stores.html -> for-apparel.html
- blog/music-for-home-goods-stores.html -> for-home-goods.html

### About / Team
- blog/welcoming-mrinmayi-katti.html -> about.html
- blog/why-i-went-back-to-folding-shirts.html -> about.html

---

## Current State (as of April 16, 2026)

Completed:
- All 79 posts have a pillar uplink inline before the CTA block
- All 79 posts have the pilot CTA (sections YAML `type: cta`)
- Sound Check posts 1-5 have a series navigation aside at the top
- Pillar pages science, how-it-works, for-cfos, for-retail-leaders, enterprise,
  results all have `further_reading_links`
- why-entuned has 6 inbound blog links
- about, dataset, press, pilot have expanded see-also / further-reading lines
- One stale link text fixed (how-to-choose-music)
- All blog listing card titles and summaries auto-regenerated from post titles/deks
- llms.txt fully regenerated

Known gaps to consider in a future pass:
- index (homepage) has only 2 blog links, could expose more
- Vertical pages (for-apparel, for-cosmetics, for-home-goods) could expand
  cross-vertical and blog links
- Some old-format blog posts (how-to-choose-music, what-your-music-is-saying-
  about-your-brand) use flat p_N keys rather than the sections format and get
  uplinks via inline text rather than a dedicated block

---

## Anchor Text Reference

| Destination | Preferred anchor text |
|---|---|
| science.html | "The Science Behind the Soundtrack", "the research record" |
| how-it-works.html | "how the pilot works", "how It Works" |
| results.html | "the research on dwell time and spending", "the results page" |
| pilot.html | "the pilot program", "start a conversation" |
| why-entuned.html | "why Entuned exists", "the measurement gap" |
| for-cfos.html | "The CFO's Case for Retail Audio", "the numbers side" |
| for-retail-leaders.html | "For Retail Leaders", "the retail leaders page" |
| about.html | "the about page", "the story behind Entuned" |
| blog/mood-media-alternatives.html | "Mood Media alternatives" |
| blog/cfos-case-for-retail-audio.html | "The CFO's Case for Retail Audio" |

**Never use:** "click here", "read more", "learn more", "this page", "this post"

---

## Maintenance

Any time a blog post is rewritten or retitled:
1. Check that the title in `blog/content.yaml` (`h2_N` card title) matches the
   current post title
2. Check that the dek in `blog/content.yaml` (`summary_N`) matches the post dek
3. Check that any cross-post link text still matches the destination's current title
4. Rebuild (`python3 build.py`) before committing

The auto-regeneration script at `/tmp/` can regenerate blog listing entries
from post frontmatter in one pass.
