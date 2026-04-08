# Entuned Internal Linking Strategy
**For Claude Code deployment in `/Users/fox296/Desktop/entuned/website`**
**Last updated: April 7, 2026**

---

## Why This Matters

entuned.co has 30 core pages and 55+ blog posts. Most blog posts are weakly
connected to each other and to the pillar pages. The result: Google sees isolated
documents rather than a coherent topical authority on retail music optimization.
Internal links fix this by passing page authority across the site, signaling topic
clusters to crawlers, and guiding readers toward conversion.

**Current gaps (confirmed from YAML audit):**
- Several core pages are near-orphans with few or no inbound links
  (enterprise.html, dataset.html, careers.html, team.html, press.html)
- Pillar pages (science, results, how-it-works, for-cfos) have almost no outbound
  links to supporting blog content
- Blog posts often link laterally to 2-3 others but don't link UP to pillar pages
- The Sound Check series (5 posts) is not navigable as a series
- The competitor/alternatives cluster has no hub to point toward

---

## Core Principles

1. **Every blog post links to its pillar page.** Hub-and-spoke model. Blogs are
   spokes; pillar pages are hubs.
2. **Every blog post links to pilot.html.** Already handled by the CTA block —
   verify it's there on each post.
3. **Anchor text is descriptive, not "click here."** Use topic-descriptive anchor
   text matching the destination page's subject.
4. **Maximum 5 internal links per blog post** (excluding nav, footer, CTA).
5. **Pillar pages link down to 3-5 supporting blog posts** in a "Further Reading"
   or "Related" section.
6. **No orphans.** Every page should receive at least 2 meaningful inbound links
   from content pages (not counting nav/footer).
7. **Reciprocal links are fine when genuinely useful.**

---

## Topic Cluster Map

### Cluster 1: The Science
**Pillar:** `science.html`
Supporting blogs:
- `blog/science-of-tempo-retail.html`
- `blog/milliman-study.html`
- `blog/what-are-flow-factors.html`
- `blog/retail-atmospherics-2026.html`
- `blog/sound-check-science-youre-ignoring.html`
- `blog/why-your-best-customers-leave-faster-than-they-should.html`
- `blog/luxury-priming-is-real-and-you-dont-have-to-be-a-luxury-brand-to-use-it.html`
- `blog/the-familiarity-trap.html`
- `blog/tempo-controls.html`

### Cluster 2: ROI & Cost
**Pillar:** `for-cfos.html` (primary), `results.html` (secondary)
Supporting blogs:
- `blog/why-background-music-costs-you-sales.html`
- `blog/the-real-cost-of-retail-music.html`
- `blog/the-8-12-youre-leaving-on-the-table.html`
- `blog/measure-roi-retail-music.html`
- `blog/cfos-case-for-retail-audio.html`
- `blog/tempo-volume-free.html`
- `blog/the-hidden-cost-of-your-licensing-fee.html`
- `blog/the-metrics-your-audio-environment-should-be-producing.html`
- `blog/the-second-sale-you-already-made.html`

### Cluster 3: Analytics & Measurement Gap
**Pillar:** `why-entuned.html` (primary), `data.html`, `dataset.html`
Supporting blogs:
- `blog/closing-the-loop-on-retail-analytics.html`
- `blog/2-billion-sensors-no-real-time-levers.html`
- `blog/music-provider-doesnt-know-retailnext.html`
- `blog/measure-what-you-ignore.html`
- `blog/the-dwell-time-variable-nobodys-tracking.html`
- `blog/fleet-learning.html`
- `blog/after-ninety-days.html`

### Cluster 4: How It Works / Product
**Pillar:** `how-it-works.html`
Supporting blogs:
- `blog/what-is-entuned.html`
- `blog/what-are-flow-factors.html`
- `blog/psychographic-profiling-retail.html`
- `blog/ai-generated-music-retail.html`
- `blog/ai-vs-traditional-retail-music.html`
- `blog/sound-check-close-the-loop.html`
- `blog/seamless-playback.html`

### Cluster 5: Competitor / Why Entuned
**Pillar:** `why-entuned.html`
Supporting blogs:
- `blog/what-spotify-gets-wrong.html`
- `blog/mood-media-alternatives.html`
- `blog/ai-vs-traditional-retail-music.html`
- `blog/music-was-never-made-for-your-store.html`
- `blog/music-provider-doesnt-know-retailnext.html`
- `blog/next-retail-tech-acquisition.html`

### Cluster 6: Brand & Employee Experience
**Pillar:** `for-retail-leaders.html`
Supporting blogs:
- `blog/the-silent-brand-signal.html`
- `blog/what-your-music-is-saying-about-your-brand.html`
- `blog/employees-hear-it.html`
- `blog/store-manager-problem.html`
- `blog/your-store-already-has-a-mood.html`
- `blog/the-store-is-not-a-set.html`
- `blog/what-happens-to-employee-performance.html`
- `blog/read-the-lyrics-on-your-speakers-right-now.html`
- `blog/the-multi-zone-problem-why-one-playlist-cant-serve-a-whole-store.html`

### Cluster 7: Dwell Time & Behavioral Outcomes
**Pillar:** `results.html` (primary), `pilot.html` (secondary)
Supporting blogs:
- `blog/the-dwell-time-variable-nobodys-tracking.html`
- `blog/why-your-best-customers-leave-faster-than-they-should.html`
- `blog/longer-visits.html`
- `blog/three-ways-to-think-about-what-your-store-cant-do-yet.html`

### Sound Check Series (5 posts — sequential navigation)
1. `blog/sound-check-music-is-a-variable.html`
2. `blog/sound-check-playlist-problem.html`
3. `blog/sound-check-music-selling-against-you.html`
4. `blog/sound-check-science-youre-ignoring.html`
5. `blog/sound-check-close-the-loop.html`

---

## Implementation Tasks

**Always edit source files in `_src/`. Never touch root-level built HTML.**
**Run `python3 build.py` after each task group.**

---

### GROUP A: Pillar Page Outbound Links (Highest SEO Impact)

Each pillar page needs a "Further Reading" section pointing to supporting blog posts.
Pattern: add new YAML keys to `content.yaml`, then add a matching `<section>` block
in `sections/01-content.html`.

**HTML section template to add (before the final CTA section):**
```html
<section class="section">
  <div class="container">
    <p class="section-eyebrow">{{content.further_reading_eyebrow}}</p>
    <h2>{{content.further_reading_headline}}</h2>
    <p class="fade-up">{{content.further_reading_links}}</p>
  </div>
</section>
```

---

**A1 — science.html: Add Further Reading**

Add to `_src/pages/science/content.yaml`:
```yaml
further_reading_eyebrow: "Go Deeper"
further_reading_headline: "Further Reading"
further_reading_links: >
  <a href="blog/science-of-tempo-retail.html">The Science of Tempo</a> &middot;
  <a href="blog/milliman-study.html">The Milliman Study</a> &middot;
  <a href="blog/what-are-flow-factors.html">What Are Flow Factors?</a> &middot;
  <a href="blog/luxury-priming-is-real-and-you-dont-have-to-be-a-luxury-brand-to-use-it.html">Luxury Priming Is Real</a> &middot;
  <a href="blog/the-familiarity-trap.html">The Familiarity Trap</a>
```

Add the section HTML to `_src/pages/science/sections/01-content.html` before
the final "Put the Research to Work" CTA section.

---

**A2 — results.html: Add Further Reading**

Add to `_src/pages/results/content.yaml`:
```yaml
further_reading_eyebrow: "Related Reading"
further_reading_headline: "From the Blog"
further_reading_links: >
  <a href="blog/the-dwell-time-variable-nobodys-tracking.html">The Dwell Time Variable Nobody's Tracking</a> &middot;
  <a href="blog/why-your-best-customers-leave-faster-than-they-should.html">Why Your Best Customers Leave Faster Than They Should</a> &middot;
  <a href="blog/measure-roi-retail-music.html">How to Measure the ROI of In-Store Music</a> &middot;
  <a href="blog/the-8-12-youre-leaving-on-the-table.html">The 8-12% You're Leaving on the Table</a>
```

Add matching section to `_src/pages/results/sections/01-content.html` before
the "Want to be one of our first case studies?" section.

---

**A3 — how-it-works.html: Add Related Reading**

Add to `_src/pages/how-it-works/content.yaml`:
```yaml
further_reading_eyebrow: "Go Deeper"
further_reading_headline: "Related Reading"
further_reading_links: >
  <a href="blog/what-is-entuned.html">What Is Entuned?</a> &middot;
  <a href="blog/what-are-flow-factors.html">What Are Flow Factors?</a> &middot;
  <a href="blog/psychographic-profiling-retail.html">Psychographic Profiling for Retail</a> &middot;
  <a href="blog/ai-generated-music-retail.html">AI-Generated Music for Retail: What's Real and What's Hype</a>
```

Add matching section to `_src/pages/how-it-works/sections/01-content.html`
before the final pilot CTA section.

---

**A4 — for-cfos.html: Add Further Reading**

Add to `_src/pages/for-cfos/content.yaml`:
```yaml
further_reading_eyebrow: "Go Deeper"
further_reading_headline: "From the Blog"
further_reading_links: >
  <a href="blog/the-8-12-youre-leaving-on-the-table.html">The 8-12% You're Leaving on the Table</a> &middot;
  <a href="blog/measure-roi-retail-music.html">How to Measure the ROI of In-Store Music</a> &middot;
  <a href="blog/cfos-case-for-retail-audio.html">The CFO's Case for Retail Audio</a> &middot;
  <a href="blog/the-real-cost-of-retail-music.html">The Real Cost of Your Retail Music</a> &middot;
  <a href="blog/the-hidden-cost-of-your-licensing-fee.html">The Hidden Cost of Your Licensing Fee</a>
```

Add matching section to `_src/pages/for-cfos/sections/01-content.html`
before the final CTA.

---

**A5 — why-entuned.html: Expand Related Reading (already partially exists)**

The page has `p_11`, `p_12`, `p_13` as related reading links.
Add three more keys after `p_13`:
```yaml
p_13b: "<a href=\"blog/closing-the-loop-on-retail-analytics.html\" style=\"color: #50929c;\">Closing the Loop on Retail Analytics</a>"
p_13c: "<a href=\"blog/2-billion-sensors-no-real-time-levers.html\" style=\"color: #50929c;\">$2 Billion in Sensors. No Real-Time Levers.</a>"
p_13d: "<a href=\"blog/mood-media-alternatives.html\" style=\"color: #50929c;\">Mood Media Alternatives in 2026</a>"
```

Then update the HTML section for `h2_4` (Related Reading) to render p_13b, p_13c,
p_13d alongside the existing three links.

---

**A6 — enterprise.html: Add blog links**

File: `_src/pages/enterprise/content.yaml`
Existing `p_9` links to `for-cfos.html`. Add:
```yaml
p_10: >
  <a href="blog/fleet-learning.html" style="color: #50929c;">Every Store Teaches the Next One</a> &middot;
  <a href="blog/closing-the-loop-on-retail-analytics.html" style="color: #50929c;">Closing the Loop on Retail Analytics</a> &middot;
  <a href="blog/after-ninety-days.html" style="color: #50929c;">What Happens After Ninety Days</a>
further_reading_label: "Related Reading"
```

Add a small related-reading line at the end of `_src/pages/enterprise/sections/01-content.html`.

---

**A7 — for-retail-leaders.html: Add blog outbound links**

Add to `_src/pages/for-retail-leaders/content.yaml`:
```yaml
further_reading_eyebrow: "From the Blog"
further_reading_headline: "Related Reading"
further_reading_links: >
  <a href="blog/the-silent-brand-signal.html" style="color: #50929c;">The Silent Brand Signal</a> &middot;
  <a href="blog/employees-hear-it.html" style="color: #50929c;">Your Employees Hear It First</a> &middot;
  <a href="blog/what-your-music-is-saying-about-your-brand.html" style="color: #50929c;">What Your Music Is Saying About Your Brand</a> &middot;
  <a href="blog/sound-check-music-is-a-variable.html" style="color: #50929c;">Sound Check: Music Is a Variable</a> &middot;
  <a href="blog/read-the-lyrics-on-your-speakers-right-now.html" style="color: #50929c;">Read the Lyrics on Your Speakers Right Now</a>
```

Add matching section to `_src/pages/for-retail-leaders/sections/01-content.html`.

---

### GROUP B: Blog-to-Pillar Uplinks

Each blog post's "Related reading" paragraph must include a link UP to its cluster's
pillar page. Edit `_src/pages/blog-<slug>/sections/01-content.html`.

**Path convention reminder:** Blog posts use `../` to reach root pages.
- Root pages: `../science.html`, `../why-entuned.html`, `../how-it-works.html`, etc.
- Sibling blog posts: `../blog/other-slug.html`

If a "Related reading" paragraph already exists, ADD the pillar link to it (don't
duplicate if it's already there). If none exists, add before the `article-cta` div:
```html
<p class="fade-up">Related reading: <a href="../pillar.html">Pillar Title</a> and <a href="../blog/sibling.html">Sibling Post Title</a>.</p>
```

**Cluster 1 — Pillar: `../science.html` ("The Science Behind the Soundtrack")**
Edit these posts to include the pillar link:
- `blog-science-of-tempo-retail`
- `blog-milliman-study`
- `blog-what-are-flow-factors`
- `blog-retail-atmospherics-2026`
- `blog-sound-check-science-youre-ignoring`
- `blog-why-your-best-customers-leave-faster-than-they-should`
- `blog-luxury-priming-is-real-and-you-dont-have-to-be-a-luxury-brand-to-use-it`
- `blog-the-familiarity-trap`
- `blog-tempo-controls`

**Cluster 2 — Pillar: `../for-cfos.html` ("The CFO Case for Retail Audio")**
Edit these posts:
- `blog-why-background-music-costs-you-sales`
- `blog-the-real-cost-of-retail-music`
- `blog-the-8-12-youre-leaving-on-the-table`
- `blog-measure-roi-retail-music`
- `blog-cfos-case-for-retail-audio`
- `blog-the-hidden-cost-of-your-licensing-fee`
- `blog-the-metrics-your-audio-environment-should-be-producing`

**Cluster 3 — Pillar: `../why-entuned.html` ("Why Entuned")**
Edit these posts:
- `blog-closing-the-loop-on-retail-analytics`
- `blog-2-billion-sensors-no-real-time-levers`
- `blog-music-provider-doesnt-know-retailnext`
- `blog-measure-what-you-ignore`
- `blog-the-dwell-time-variable-nobodys-tracking`
- `blog-fleet-learning`
- `blog-after-ninety-days`

**Cluster 4 — Pillar: `../how-it-works.html` ("How It Works")**
Edit these posts:
- `blog-what-is-entuned`
- `blog-what-are-flow-factors`
- `blog-psychographic-profiling-retail`
- `blog-ai-generated-music-retail`
- `blog-ai-vs-traditional-retail-music`
- `blog-seamless-playback`

**Cluster 5 — Pillar: `../why-entuned.html` ("How Entuned Is Different")**
Edit these posts:
- `blog-what-spotify-gets-wrong`
- `blog-mood-media-alternatives`
- `blog-music-was-never-made-for-your-store`
- `blog-next-retail-tech-acquisition`

**Cluster 6 — Pillar: `../for-retail-leaders.html` ("For Retail Leaders")**
Edit these posts:
- `blog-the-silent-brand-signal`
- `blog-what-your-music-is-saying-about-your-brand`
- `blog-employees-hear-it`
- `blog-store-manager-problem`
- `blog-your-store-already-has-a-mood`
- `blog-the-store-is-not-a-set`
- `blog-read-the-lyrics-on-your-speakers-right-now`
- `blog-what-happens-to-employee-performance`

**Cluster 7 — Pillar: `../results.html` ("The Research on Dwell Time and Spending")**
Edit these posts:
- `blog-the-dwell-time-variable-nobodys-tracking`
- `blog-why-your-best-customers-leave-faster-than-they-should`
- `blog-longer-visits`

---

### GROUP C: Sound Check Series Navigation

Add a series navigation block to all 5 Sound Check posts. Insert AFTER the
`back-link` div and BEFORE the `article-hero` div.

**HTML block to insert:**
```html
<div class="sound-check-nav fade-up">
  <p class="section-eyebrow">Sound Check Series</p>
  <p>
    Part 1: <a href="../blog/sound-check-music-is-a-variable.html">Music Is a Variable</a> &middot;
    Part 2: <a href="../blog/sound-check-playlist-problem.html">The Playlist Problem</a> &middot;
    Part 3: <a href="../blog/sound-check-music-selling-against-you.html">Your Music Is Selling Against You</a> &middot;
    Part 4: <a href="../blog/sound-check-science-youre-ignoring.html">The Science You're Ignoring</a> &middot;
    Part 5: <a href="../blog/sound-check-close-the-loop.html">Close the Loop</a>
  </p>
</div>
```

**Add to styles.css** (append to end of file):
```css
/* Sound Check series navigation */
.sound-check-nav {
  background: var(--accent-light);
  border-left: 3px solid var(--accent);
  padding: 1rem 1.5rem;
  border-radius: 4px;
  margin: 0 0 2.5rem;
  max-width: 800px;
}
.sound-check-nav .section-eyebrow {
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}
.sound-check-nav p:last-child {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.8;
}
```

Apply the HTML block to all 5 posts:
- `_src/pages/blog-sound-check-music-is-a-variable/sections/01-content.html`
- `_src/pages/blog-sound-check-playlist-problem/sections/01-content.html`
- `_src/pages/blog-sound-check-music-selling-against-you/sections/01-content.html`
- `_src/pages/blog-sound-check-science-youre-ignoring/sections/01-content.html`
- `_src/pages/blog-sound-check-close-the-loop/sections/01-content.html`

---

### GROUP D: Orphan Page Fixes

**D1 — enterprise.html: Add inbound links FROM:**
- `for-cfos/content.yaml`: Add `<a href="enterprise.html">enterprise deployments</a>`
  link near the end of the existing content, contextually tied to multi-location scale
- `blog-fleet-learning/sections/01-content.html`: Add `../enterprise.html`
  ("enterprise retail deployments") to related reading
- `blog-after-ninety-days/sections/01-content.html`: Add `../enterprise.html` to
  related reading

**D2 — dataset.html: Verify + Add inbound links FROM:**
- Check `about/content.yaml` — add link to `dataset.html` with anchor "the dataset
  we're building" contextually near the dataset/compound data mention
- `blog-fleet-learning/sections/01-content.html`: Add `../dataset.html`
  ("the proprietary dataset") to related reading

**D3 — careers.html: Add inbound links FROM:**
- `about/content.yaml`: Add link "see our <a href="careers.html">open roles</a>"
  near the end of the about page narrative
- `team/content.yaml` (if exists): Add link to careers.html

**D4 — team.html: Add inbound links FROM:**
- `about/content.yaml`: Add `<a href="team.html">the team</a>` near the Daniel
  Fox bio section — "Learn more about the team."
- `investors/content.yaml`: In the "Founder-market fit" section, add
  `<a href="team.html">team page</a>` link after describing Daniel

**D5 — press.html: Add inbound links FROM:**
- `about/content.yaml`: Add link in closing section
- `investors/content.yaml`: Add near "current status" section

---

### GROUP E: Vertical Page Cross-Linking (Verify & Expand)

for-apparel, for-cosmetics, and for-home-goods already have some cross-vertical
links. Verify they're rendering. Then expand each to also link to
`results.html` and `science.html`:

For each vertical's `content.yaml`, ensure the "See also" line includes:
```yaml
# Example for for-apparel (update p_17 or add adjacent key):
p_17: >
  See also:
  <a href="how-it-works.html" style="color: #50929c;">How It Works</a> &middot;
  <a href="science.html" style="color: #50929c;">The Science</a> &middot;
  <a href="results.html" style="color: #50929c;">Research Results</a> &middot;
  <a href="pilot.html" style="color: #50929c;">Pilot Program</a>
```

---

### GROUP F: About Page Contextual Links

`about.html` is high-authority. Add contextual inline links within the narrative.

File: `_src/pages/about/content.yaml`

Find these narrative moments and add inline links:
- "psychographic-to-musicological translation engine" → link to `how-it-works.html`
- "patent-pending" → link to `science.html` ("peer-reviewed behavioral science")
- "dataset mapping musical composition parameters" → link to `dataset.html`
- End of page: add
  ```yaml
  p_closing_links: >
    Learn more about the <a href="team.html">team</a>, explore
    <a href="careers.html">open roles</a>, or read
    <a href="blog/what-is-entuned.html">What Is Entuned</a>.
  ```

---

## Anchor Text Reference

| Destination | Preferred anchor text |
|---|---|
| science.html | "The Science Behind the Soundtrack", "the research", "peer-reviewed findings" |
| how-it-works.html | "How It Works", "the four-step process", "how the system works" |
| results.html | "The Research on Results", "what the research found" |
| pilot.html | "pilot program", "free pilot", "the pilot" |
| why-entuned.html | "Why Entuned", "How Entuned Is Different", "the measurement gap" |
| for-cfos.html | "The CFO Case", "the ROI case", "the numbers" |
| for-retail-leaders.html | "For Retail Leaders" |
| enterprise.html | "enterprise deployment", "fleet-scale", "multi-location retailers" |
| dataset.html | "the dataset", "the data asset", "the proprietary dataset" |
| blog/what-are-flow-factors.html | "Flow Factors", "compositional parameters" |
| blog/closing-the-loop-on-retail-analytics.html | "closing the loop", "the action layer" |
| blog/mood-media-alternatives.html | "Mood Media alternatives" |

**Never use:** "click here", "read more", "learn more", "this page", "this post"

---

## Implementation Order

1. **Group C** — Sound Check series nav (easiest, biggest UX win)
2. **Group A** — Pillar page outbound links (highest SEO impact)
3. **Group B** — Blog-to-pillar uplinks (largest volume, batch cluster by cluster)
4. **Group D** — Orphan page fixes
5. **Group E** — Vertical cross-linking verification
6. **Group F** — About page contextual links

---

## Build & Deploy

After each group:
```bash
cd /Users/fox296/Desktop/entuned/website
python3 build.py
```

Final commit:
```bash
git add -A && git commit -m "Internal linking: [describe what was implemented]" && git push origin main
```

---

## Expected Outcomes

| Signal | Before | After |
|---|---|---|
| Orphaned pages | 6+ | 0 |
| Avg content inbound links per blog post | ~1-2 | ~4-5 |
| Pillar pages with blog outlinks | ~3 | All 7 cluster hubs |
| Sound Check navigability | None | Full series nav |
| Crawl depth for blog posts | 3+ clicks | 2 clicks from pillar pages |
| Topic cluster signal to Google | Weak | Strong hub-and-spoke |
