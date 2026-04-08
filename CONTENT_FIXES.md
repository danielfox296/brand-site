# Entuned — Content Sweep & Fixes
**For Claude Code. Read ARCHITECTURE.md first.**
**Edit only `_src/` source files. Run `python3 build.py` after all edits.**

---

## Overview

This document covers 11 targeted content fixes across 8 source files.
No new pages. No structural changes. Copy edits and one HTML credential swap only.

---

## FIX 1 — "Gigging musician" credential (HTML, not YAML)

**File:** `_src/pages/about/sections/01-content.html`

This is hardcoded HTML, not a YAML key. Use edit_block to find and replace:

old_string:
```
<div class="about-credential">Gigging musician, producer &amp; music theoretician</div>
```

new_string:
```
<div class="about-credential">Music producer &amp; composer</div>
```

---

## FIX 2 — "As a musician and producer" (about YAML)

**File:** `_src/pages/about/content.yaml`

old_string:
```
p_8: "Daniel Fox spent his career at the intersection of music and human experience. As a musician and producer, and informed by existing research, he developed a working model of how specific musical parameters affect customer psychology. "
```

new_string:
```
p_8: "Daniel Fox spent his career at the intersection of music and human experience. As a music producer and composer, and informed by existing research, he developed a working model of how specific musical parameters affect customer psychology."
```


---

## FIX 3 — iOS app listed as "in development" (investors YAML)

**File:** `_src/pages/investors/content.yaml`

old_string:
```
li_4: "iOS streaming app in development"
```

new_string:
```
li_4: "Web streaming app operational — play.entuned.co"
```

---

## FIX 4 — Fundraise cap shows a range instead of a fixed figure (investors YAML)

**File:** `_src/pages/investors/content.yaml`

old_string:
```
p_17: "$500K SAFE at a $4–5M cap. 24 months of runway. This funds pilot partners — treatment and control store pairs generating proprietary data across the full pilot period. At the end, we either have statistically significant proof that specific musical variables cause measurable lift — or we know the thesis doesn't hold."
```

new_string:
```
p_17: "$500K SAFE at a $5M cap. 24 months of runway. This funds pilot partners — treatment and control store pairs generating proprietary data across the full pilot period. At the end, we either have statistically significant proof that specific musical variables cause measurable lift — or we know the thesis doesn't hold."
```

---

## FIX 5 — "Thirty-one distinct compositional variables" (investors YAML)

**File:** `_src/pages/investors/content.yaml`

old_string:
```
p_3: "What doesn't exist is a dataset mapping <em>specific musical parameters</em> to <em>specific retail outcomes</em> at scale. The research tells us tempo matters. It tells us genre congruence matters. But nobody has measured which tempo, which harmonic structure, which production style, which combination of thirty-one distinct compositional variables produces lift in a given retail context."
```

new_string:
```
p_3: "What doesn't exist is a dataset mapping <em>specific musical parameters</em> to <em>specific retail outcomes</em> at scale. The research tells us tempo matters. It tells us genre congruence matters. But nobody has measured which tempo, which harmonic structure, which production style, which specific combination of compositional variables produces lift in a given retail context."
```


---

## FIX 6 — Analytics market figure inconsistency (enterprise YAML)

`why-entuned`, `about`, and `investors` all use $1.9B for the in-store analytics market.
`enterprise` uses $1.8B for the same market. Align enterprise to match.

**File:** `_src/pages/enterprise/content.yaml`

old_string:
```
p_1: "The retail analytics industry spent $1.8 billion on sensors and measurement. Entuned is the action layer."
```

new_string:
```
p_1: "The retail analytics industry spends $1.9 billion annually on sensors and measurement. Entuned is the action layer."
```

---

## FIX 7 — Q3 2026 publication promise (results YAML)

Remove the date commitment and the promise to publish case study data.
Replace with copy that holds a credible position without a deadline.

**File:** `_src/pages/results/content.yaml`

old_string:
```
p_7: "We're running pilots with premium retailers across fashion, home goods, and specialty retail. Results from our first cohort will be published here in <strong style=\"color: #50929c;\">Q3 2026</strong>."
p_8: "Real store data. Real metrics. Every case study will show before/after performance, methodology, and the specific psychographic positioning that drove results."
p_9: "Pilot participants get priority pricing and co-marketing opportunities. Your results could be featured here alongside the science that backs them."
```

new_string:
```
p_7: "We're building our first pilot cohort now. Performance data from those deployments will shape what goes on this page."
p_8: "What you'll eventually see here: before-and-after store performance, methodology, and the specific musical parameters that drove the results. No projections. Only what actually happened."
p_9: "Founding pilot partners receive priority pricing and direct input on the measurement methodology."
```

Also update `h3_1` in the same file — the heading currently reads "Pilot Results Coming Soon"
which implies an imminent timeline. Replace:

old_string:
```
h3_1: Pilot Results Coming Soon
```

new_string:
```
h3_1: Pilot Data in Progress
```


---

## FIX 8 — West Elm (for-retail-leaders YAML)

**File:** `_src/pages/for-retail-leaders/content.yaml`

old_string:
```
p_9: "West Elm has a $40 dorm pillow section and a $3,000 sofa section. Those customers need different music. The 19-year-old shopping for dorm decor responds to pop-rock energy at 110 BPM. The 38-year-old buying a luxury sofa responds to ambient sophistication at 65 BPM. Only original, created-to-order music makes simultaneous department-level customization possible. Catalog-based providers are architecturally locked into one playlist per store."
```

new_string:
```
p_9: "A lifestyle home goods brand with a $40 candle section and a $2,800 furniture section serves two entirely different customers under one roof. The person browsing entry-level accessories and the person evaluating a considered furniture purchase do not respond to the same audio environment. Only original, created-to-order music makes simultaneous zone-level calibration possible. Catalog-based providers are architecturally locked into one playlist per store."
```

---

## FIX 9 — West Elm (enterprise YAML)

**File:** `_src/pages/enterprise/content.yaml`

old_string:
```
p_6: "A single store often serves multiple customer types. West Elm has a $40 dorm pillow section and a $3,000 sofa section. Those are different customers who need different music. Only original, created-to-order music makes department-level customization possible. At enterprise scale, strategies tested in one region roll out to hundreds of stores overnight."
```

new_string:
```
p_6: "A single store often serves multiple customer types with nothing in common except the building they are standing in. The customer browsing a $40 item and the customer evaluating a $2,800 purchase respond to entirely different audio environments. Only original, created-to-order music makes zone-level calibration possible without a different catalog for every section. At enterprise scale, strategies refined in one region roll out to hundreds of stores overnight."
```


---

## FIX 10 — Zone deployment framing (three vertical YAMLs)

Department/zone-level music is currently framed as a delivered product feature.
Reframe as an architectural capability — what the system makes possible —
not a feature activated in every pilot by default.

### FIX 10a — for-apparel YAML

**File:** `_src/pages/for-apparel/content.yaml`

old_string:
```
p_9: "Entuned integrates with RetailNext to track dwell time, transaction value, and traffic patterns across departments. The fitting room area, the front-of-store entrance, and the sale section serve different customer mindsets. Each department gets music calibrated to the behavior you want there. The data from each cycle makes the next round more precise."
```

new_string:
```
p_9: "Entuned integrates with RetailNext to track dwell time, transaction value, and traffic patterns across departments. The fitting room area, the front-of-store entrance, and the sale section serve different customer mindsets. Because every composition is built from specification rather than pulled from a catalog, the system can be calibrated to the behavioral target of each area. The data from each cycle makes the next round more precise."
```

### FIX 10b — for-cosmetics YAML

**File:** `_src/pages/for-cosmetics/content.yaml`

old_string:
```
p_9: "Your fragrance counter does not serve the same customer mindset as your skincare wall. The treatment area does not serve the same mindset as the checkout queue. Each department gets its own soundtrack. Entuned integrates with RetailNext traffic and dwell time analytics, so every decision is driven by what your customers actually do, not what a playlist curator assumes they want to hear."
```

new_string:
```
p_9: "Your fragrance counter does not serve the same customer mindset as your skincare wall. The treatment area does not serve the same mindset as the checkout queue. Because every composition is built to specification rather than selected from a catalog, the system can address different areas of your store with different behavioral targets. Entuned integrates with RetailNext traffic and dwell time analytics, so every decision is driven by what your customers actually do, not what a playlist curator assumes they want to hear."
```

### FIX 10c — for-home-goods YAML

**File:** `_src/pages/for-home-goods/content.yaml`

Two edits in this file.

**Edit 1:**

old_string:
```
p_7: "We profile your customer by department. The person shopping for premium furniture responds to different musical parameters than the person browsing kitchen accessories. Both are in your store, but Knoferle et al. showed that specific combinations of tempo and mode produce measurably different spending behavior. Entuned maps each department to the customer it serves and builds compositions from those parameters."
```

new_string:
```
p_7: "The person shopping for premium furniture responds to different musical parameters than the person browsing kitchen accessories. Both are in your store, but Knoferle et al. showed that specific combinations of tempo and mode produce measurably different spending behavior. Because Entuned builds compositions from specification rather than from a catalog, each area of your store can be addressed with the parameters that match the purchase psychology it serves."
```

**Edit 2:**

old_string:
```
p_8: "Every composition is original and license-free. The furniture showroom gets slow tempo in minor mode, calibrated for considered browsing. The seasonal decor section gets moderate tempo in major mode, encouraging discovery and impulse. Each soundtrack is built from customer psychology and specific musical parameters, not genre tags."
```

new_string:
```
p_8: "Every composition is original and license-free. A considered-purchase area like a furniture showroom calls for slow tempo in minor mode. A discovery-oriented section calls for moderate tempo in major mode. The system is built to accommodate that specificity — because the music is generated to a parameter set, not selected from a genre tag."
```


---

## FIX 11 — Grammar fix + remove "freelance" framing (investors YAML)

**File:** `_src/pages/investors/content.yaml`

old_string:
```
p_14: "He bootstrapped an online custom apparel platform to 180 employees and thousands of monthly active users, with multiple industry awards. He previously built a generative AI platform that constructed ICPs and produced original content calibrated to each one -- the same core concepts powering Entuned. His background as a freelance music producer who understands how to dial in compositional parameters drive behavioral response across audiences."
```

new_string:
```
p_14: "He bootstrapped an online custom apparel platform to 180 employees and thousands of monthly active users, with multiple industry awards. He previously built a generative AI platform that constructed ICPs and produced original content calibrated to each one — the same core concepts powering Entuned. His background as a music producer gives him a working model of how specific compositional parameters drive behavioral response across audiences."
```

---

## VERIFY BEFORE SHIPPING — Pathr.ai acquisition claim

**File:** `_src/pages/enterprise/content.yaml`

p_7 contains this sentence:
"Same pattern RetailNext validated when they acquired Pikato. Same pattern Standard AI followed when they acquired Pathr.ai."

Before deploying, confirm both acquisitions are factually accurate:
- RetailNext / Pikato
- Standard AI / Pathr.ai

If either is incorrect, remove only that sentence using edit_block.
Do not remove or alter the surrounding paragraph.

---

## Build and deploy

After all edits above are complete:

```bash
cd /Users/fox296/Desktop/entuned/website
python3 build.py
```

Confirm the build succeeds with no errors, then:

```bash
git add -A && git commit -m "Content sweep: remove deprecated claims, fix stale figures, soften zone framing" && git push origin main
```
