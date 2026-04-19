# Entuned Website Content Audit — Implementation Spec
**Version 1.0 | April 2026**
**Purpose: Fix all positioning gaps identified in the April 2026 audit. Work through P1 items first, then P2, then P3. After all edits, run `python3 build.py` and commit.**

---

## How to use this file

Each item lists: the source file to edit, the specific key or element, the current state, and what it needs to become. Where the required copy is prescribed, use it exactly. Where the item says "rewrite to," write new copy that satisfies the stated requirement using the voice and language rules in `VOICE.md`.

**Language rules (enforce throughout all rewrites):**
- Required terms: *adaptive, learns, revenue, brand brief, control store*
- Prohibited terms: AI music, AI-generated, background music (describing Entuned), data platform, analytics platform, measurement (as primary value claim), optimize, leverage, seamless, cutting-edge, revolutionary
- No "It's not X, it's Y" negation constructions
- No inanimate agency ("the music drives" — name who benefits instead)
- No em dashes

After every edit, verify: could you replace "Entuned" with "Soundtrack Your Brand" and have the sentence still make sense? If yes, rewrite.

---

## P1 — Fix these first

### P1-1 · Homepage title tag
**File:** `_src/pages/index/config.json`
**Key:** `title`
**Current:** `Entuned | Retail Music Built for Your Customer's Psychology`
**Problem:** No "adaptive" language. "Built for your customer's psychology" is mechanism framing.
**Rewrite to:** Establish adaptive retail music in the title. Example direction: `Entuned | Adaptive Retail Music That Learns Your Stores`

---

### P1-2 · Homepage meta description
**File:** `_src/pages/index/config.json`
**Key:** `meta_description`
**Current:** `Original retail music built for your customer's psychology. Research shows 15-25% longer dwell time and 8-12% higher willingness to pay. Free founding pilot.`
**Problem:** Leads with mechanism (psychology). No "adaptive." No "revenue." No brand protection signal.
**Rewrite to:** Lead with the outcome claim in one sentence. Include "adaptive." Include a revenue or commercial outcome. Reference the pilot. Under 160 characters.

---

### P1-3 · Homepage H1
**File:** `_src/pages/index/content.yaml`
**Key:** `h1_1`
**Current:** `One variable in your store you haven't measured.`
**Problem:** Leads with a measurement gap, not a commercial outcome. The Protective Creative reads this as an analytics pitch and bounces.
**Rewrite to:** A headline that names what Entuned produces, uses "adaptive" or "learns," and leads with a revenue or brand outcome. The outcome must come before any hint of mechanism.

---

### P1-4 · Homepage hero subline
**File:** `_src/pages/index/content.yaml`
**Key:** `p_1`
**Current:** `Entuned builds original retail music made for the customer your store is built to serve. In published research, dwell time goes up fifteen to twenty-five percent and basket size goes up eight to twelve percent.`
**Problem:** "Original retail music" is the wrong category label. No "adaptive." No "learns." Outcomes are framed as research findings rather than as what Entuned produces.
**Rewrite to:** Include "adaptive." Include "learns your stores" or "learns your customers." State outcomes as what Entuned produces, not as research citations.

---

### P1-5 · Homepage brand protection signal
**File:** `_src/pages/index/content.yaml`
**Section:** The Solution section (`h2_2`, `p_3`, `p_4`)
**Current:** `h2_2`: `From customer insight to store soundtrack.` / `p_3` and `p_4` discuss original music and analytics gap.
**Problem:** No mention of brand brief, brand parameters, or the operator's control. The Protective Creative gets zero signal that her brand is protected.
**Rewrite to:** Add one sentence in the Solution section that explicitly establishes the brand brief as the ceiling. Required language direction: the intake produces a brand brief; the system operates inside it and never outside it. Add "brand" to `h2_2` or `p_3` or add a new key for a brand protection sentence. This signal must appear no later than the second section.

---

### P1-6 · Homepage "background music" removal
**File:** `_src/pages/index/content.yaml`
**Key:** `p_8`
**Current (contains):** `...you have lost nothing but background music you were going to play anyway.`
**Problem:** Uses prohibited term in a context that frames Entuned as a replacement for background music, cementing the wrong category.
**Rewrite to:** Remove "background music" from this sentence. Rewrite so it describes what the operator was previously running without using the prohibited category label.

---

### P1-7 · Homepage CTA above fold
**File:** `_src/pages/index/sections/01-content.html`
**Element:** Hero section, lines 12-14
**Current:** `<a href="how-it-works.html" class="btn btn-primary">{{content.btn_1}}</a>`
**`btn_1`:** `See How It Works`
**Problem:** "See How It Works" is educational navigation, not a conversion CTA. No conversion action is available above the fold.
**Fix:** Add a second button to the hero `btn-group` that links to `pilot.html` and uses an acceptable CTA. Acceptable options: "Book a pilot conversation" / "See how the pilot works" / "Talk to us about your stores." Add the button text as `btn_1b` in content.yaml and reference it in the HTML.

---

### P1-8 · How It Works — control store (CRITICAL)
**File:** `_src/pages/how-it-works/content.yaml`
**Keys:** `pilot3.title`, `pilot3.text`, `pilot.description`
**Current `pilot3.text`:** `The pilot runs on a timeline long enough to separate signal from noise. You see what the audio did for the stores that ran it compared to stores that did not.`
**Current `pilot.description`:** `The pilot runs long enough that weather, staffing, and promotion noise average out. At the end, you have data specific to your stores...`
**Problem:** The control store concept is implicit ("stores that did not") but never named. "Control store" does not appear. Matched selection criteria and twelve-week timeline are both absent. This is a critical gap — the control store is the primary conversion point for the Data-Curious Skeptic.
**Rewrite to:**
- `pilot3.title`: Name the control store explicitly — e.g., "We hold a control store."
- `pilot3.text`: State that at least one store runs unchanged as the control, matched on traffic volume and revenue baseline. State that the delta between pilot stores and the control store is the answer to the CFO's question. Use the phrase "control store."
- `pilot.description`: Add "twelve weeks" as the stated timeline. Reference the control store.
- Verify "control store" appears at least twice on the page after edits.

---

### P1-9 · How It Works — brand brief in intake
**File:** `_src/pages/how-it-works/content.yaml`
**Key:** `step1.text`
**Current:** `A short intake call covers the basics. Who shops your stores. What you already measure. What you would want to see move. The conversation gives us enough to build audio that fits the room and the customer, and gives you a clear picture of what the pilot will and will not do.`
**Problem:** The intake is described as data collection. No mention of the brand brief or brand parameters. The Protective Creative reads this as extraction, not alignment.
**Rewrite to:** The intake produces a brand brief. The brief specifies tempo range, mood vocabulary, lyrical guidelines, what the brand should never sound like. That brief is the ceiling the system operates inside permanently. Data needs ("what you already measure") can remain but must follow the brand brief description, not lead it.

---

### P1-10 · How It Works — card1 "Intake and audio brief" description
**File:** `_src/pages/how-it-works/content.yaml`
**Key:** `card1.text`
**Current:** `A short, structured conversation that captures what your stores need the audio to do. The output is a brief we work against, not a questionnaire that gets filed.`
**Problem:** "What your stores need the audio to do" is outcome framing without brand protection language. The brand brief is not described as the boundary.
**Rewrite to:** Describe the output as a brand brief — the document that specifies what the audio can and cannot do inside the brand's parameters. The system operates inside the brief permanently.

---

### P1-11 · About page — "AI music generation" (hardcoded HTML)
**File:** `_src/pages/about/sections/01-content.html`
**Line:** ~47 (inside `.about-convergence-item`)
**Current (hardcoded):** `AI music generation crosses quality threshold`
**Problem:** Prohibited term on a live indexed page, hardcoded in HTML rather than YAML.
**Fix:** Rewrite the label text in the HTML directly. Suggested replacement direction: "Generative composition reaches commercial quality" or "Original music generation becomes viable." Remove "AI music."
Also check the `.about-convergence-desc` on the same item — ensure it doesn't introduce other prohibited terms.

---

### P1-12 · About page — CTA "Get in Touch"
**File:** `_src/pages/about/content.yaml`
**Key:** `btn_2`
**Current:** `Get in Touch`
**Problem:** Explicitly prohibited CTA text per spec.
**Rewrite to:** One of the acceptable options — "Book a pilot conversation" / "See how the pilot works" / "Talk to us about your stores." Update the link target if needed (currently `contact.html` — acceptable if the contact page is also fixed per P2-12).

---

## P2 — Fix after P1 is complete

### P2-1 · Homepage "Selection vs. Generation" section
**File:** `_src/pages/index/content.yaml`
**Keys:** `h2_5`, eyebrow text in HTML (`_src/pages/index/sections/01-content.html` line ~51: `Selection vs. Generation`)
**Current `h2_5`:** `Catalogs pick songs. We make them.`
**Problem:** The differentiator is framed as production method (selection vs. generation), not category. This positions Entuned as a better version of a catalog service rather than a different category. A sophisticated buyer concludes: same product, different source material.
**Rewrite to:** Reframe the section around the adaptive/learning differentiator and the control store proof, not the generation vs. selection distinction. The eyebrow and headline should establish category difference, not production method difference. "Adaptive" must appear in this section.

---

### P2-2 · Homepage — "Zero Licensing Fees" stat
**File:** `_src/pages/index/sections/01-content.html`
**Element:** Stats bar, third stat item (lines ~100-104)
**Current:** `stat-number: Zero` / `stat-label: Licensing Fees`
**Problem:** Positions Entuned against the licensing cost of catalog services — a background music service objection, not an adaptive retail music claim. This invites category comparison with Soundtrack Your Brand rather than category differentiation.
**Rewrite to:** Replace with a stat that reinforces the adaptive music or revenue outcome positioning. Options: the control store methodology, the compounding improvement claim, or a revenue outcome stat. Remove the licensing fees framing.

---

### P2-3 · How It Works — "AI-Generated" link text
**File:** `_src/pages/how-it-works/content.yaml`
**Key:** `further_reading_links`
**Current (contains):** `<a href="blog/ai-generated-music-retail.html">AI-Generated Music for Retail: What's Real</a>`
**Problem:** Prohibited term appears as visible anchor text on a primary indexed page.
**Fix:** Change the link text to remove "AI-Generated." The URL can stay (blog post slug). Suggested link text: "What the research on original retail music actually shows" or simply "Does original retail music outperform licensed playlists?" — something that describes the content without using prohibited terms.

---

### P2-4 · How It Works — outcome lead
**File:** `_src/pages/how-it-works/content.yaml`
**Key:** `hero.subline`
**Current:** `What a pilot looks like, from first conversation to measurable store outcomes.`
**Problem:** Leads with the process ("what a pilot looks like") not the outcome. The spec requires: outcome before mechanism.
**Rewrite to:** Lead with what the operator gets. The pilot is the path to it, not the subject. Example direction: state the revenue or conversion outcome the pilot is designed to produce, then describe it as what the process delivers.

---

### P2-5 · How It Works — meta description
**File:** `_src/pages/how-it-works/config.json`
**Key:** `meta_description`
**Current:** `From customer psychology to store soundtrack in four steps. Profile your shoppers, translate to music, deploy, and measure what changes.`
**Problem:** Leads with process steps. "Measure what changes" uses measurement as the value claim. No "adaptive." No outcome lead.
**Rewrite to:** Lead with what the operator gets. Include "adaptive" or "learns." Under 160 characters.

---

### P2-6 · About page — meta description
**File:** `_src/pages/about/config.json`
**Key:** `meta_description`
**Current:** `A $1.9B industry never measured whether its product works. Entuned is building the first dataset linking music to verified retail outcomes.`
**Problem:** "Building the first dataset" positions as a data company. No category claim. No outcome for the buyer.
**Rewrite to:** Lead with the adaptive retail music category and what the operator gets. The dataset/proof angle can remain as supporting context but must not be the primary claim. Under 160 characters.

---

### P2-7 · About page — H1
**File:** `_src/pages/about/content.yaml`
**Key:** `h1_1`
**Current:** `Every retail store in the world plays music. Not one of them can tell you whether it's working.`
**Problem:** Leads with what the market lacks (measurement gap), not what Entuned produces. This is a data company hook, not an adaptive retail music hook.
**Rewrite to:** Reframe around what Entuned produces and for whom. The measurement gap can still be implicit in the problem framing, but the headline should establish the category and the buyer's benefit.

---

### P2-8 · About page — brand protection signal
**File:** `_src/pages/about/content.yaml`
**Key:** `p_11` or add a new key between `p_10` and `p_11`
**Current gap:** The About page describes the product as music that proves outcomes. It never mentions that the brand brief is the ceiling or that the operator retains control.
**Fix:** Add one paragraph to the "What We're Building" or closing section that establishes: the intake produces a brand brief; the system operates inside it; the brand's point of view is the starting point, not something the system overrides. Insert this before the pilot description in `p_11`.

---

### P2-9 · Contact page — H1
**File:** `_src/pages/contact/content.yaml`
**Key:** `h1_1`
**Current:** `Get in touch.`
**Problem:** Prohibited language as the page's primary headline.
**Rewrite to:** "Start the pilot conversation." or "Book a pilot conversation." or "Talk to us about your stores." Pick whichever fits the page's routing (retail leaders, investors, partners). If the page serves multiple audiences, consider: "Let's talk."

---

### P2-10 · Contact page — meta description
**File:** `_src/pages/contact/config.json`
**Key:** `meta_description`
**Current:** `Get in touch with the Entuned team. Retail leaders, investors, technology partners, and media inquiries welcome.`
**Problem:** Opens with prohibited phrase "Get in touch."
**Rewrite to:** Remove "Get in touch." Lead with who the page serves and what they can do. Under 160 characters.

---

### P2-11 · Contact page — form routing fields
**File:** `_src/pages/contact/sections/01-content.html`
**Element:** The `<form>` block, after the role dropdown
**Current:** Role, name, email, company (optional), message.
**Problem:** No routing data. A pilot inquiry arrives with no context about location count, retail category, or current music setup.
**Fix:** Add two optional fields after the company field, shown only when role === "Retail Leader" (use JS similar to the existing `?topic=pilot` pattern):
1. Number of locations (number input or short text)
2. Current music vendor (short text, placeholder: "Soundtrack Your Brand, Mood Media, other...")

These should be optional (`<span style="opacity: 0.4;">(optional)</span>` pattern already in use) and shown conditionally when "Retail Leader" is selected. This adds routing signal without adding friction for non-retail contacts.

---

### P2-12 · Footer tagline
**File:** `_src/partials/footer.html`
**Element:** Line 7
**Current:** `Retail music strategy driven by customer psychology.`
**Problem:** "Retail music strategy" is not the category. "Driven by customer psychology" is mechanism framing.
**Rewrite to:** Use "adaptive retail music" as the category label. Lead with what Entuned produces or does. Example direction: "Adaptive retail music that learns your stores and gets better at producing revenue outcomes the longer it runs." — or a shorter version that fits footer line length.

---

### P2-13 · Navigation — add primary CTA
**File:** `_src/partials/header.html`
**Element:** `<ul class="nav-links">` — currently 6 `<li>` items, no CTA button
**Problem:** No conversion action available in the navigation. A visitor who decides to act from any page must scroll to find a CTA.
**Fix:** Add a CTA button as the last nav item, after "Contact":
```html
<li><a href="{{nav_prefix}}pilot.html" class="btn btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.9rem;">Book a Pilot</a></li>
```
Check that the mobile menu toggle still works after adding the button. Adjust the `<ul>` alignment styles in `styles.css` if needed so the button sits visually separate from the nav links.

---

## P3 — Fix after P2 is complete

### P3-1 · Raise page — prohibited terms
**File:** `_src/pages/raise/content.yaml`
**Key:** `p_1`
**Current:** `Entuned deploys original AI-produced music in retail stores...`
**Fix:** Remove "AI-produced." Rewrite: "Entuned deploys original adaptive music in retail stores..."

**Key:** `p_3`
**Current:** `Generative AI music hit commercial quality in 2024.`
**Fix:** Remove "Generative AI music." Rewrite: "Original composition hit commercial quality in 2024." or "The tools to produce original music at scale arrived in 2024."

---

### P3-2 · Raise page — CTA
**File:** `_src/pages/raise/content.yaml`
**Key:** `btn_1`
**Current:** `Get in Touch`
**Fix:** Rewrite to "Book a call" or "Schedule a conversation."

---

### P3-3 · Investors page — compound dataset narrative
**File:** `_src/pages/investors/content.yaml`
**Section:** `h2_3` ("What we're building") or `h2_4` ("The moat") — `p_8` through `p_12`
**Current gap:** The page describes the data moat as a current asset (patent filed, methodology in place) but does not describe how the dataset compounds in value over time.
**Fix:** Add a paragraph under `h2_4` or `h2_3` that describes the compounding effect: week twenty outperforms week one; at six months the system knows the specific customer base well enough to produce measurably better outcomes than at launch; at full fleet, the dataset is a proprietary asset no competitor can replicate without running the same stores for the same period. Add as a new key, e.g., `p_10b`.

---

### P3-4 · Investors page — "background music" in TAM
**File:** `_src/pages/investors/content.yaml`
**Key:** `stat_label_1`
**Current:** `Commercial background music market we directly displace · 6.7% CAGR to $2.66B by 2030 (Mordor Intelligence, 2025)`
**Key:** `p_6`
**Current (contains):** `Entuned replaces the commercial background music line item on a retailer's P&L.`
**Problem:** "background music" as a market category is defensible in investor TAM framing, but it positions Entuned as a background music replacement in the same sentence as the market size claim.
**Suggested fix:** Change "commercial background music market" to "commercial in-store audio market" or "retail audio market" in `stat_label_1`. In `p_6`, change "the commercial background music line item" to "the in-store audio line item." The market size sources remain the same.

---

### P3-5 · Champion leave-behind — MISSING
**This is a new asset, not a content edit.**
**Required:** A downloadable or shareable one-pager a champion can forward to her CMO without translation. Per the positioning spec, three versions are needed: cosmetics, home goods, clothing.
**Minimum viable:** One version. The cosmetics one-pager is the first pilot vertical.
**Format:** A single HTML page (`one-pager-cosmetics.html` or similar), print-optimized via `@media print`, linked from the footer or from a new "For Your Team" section. The content covers: outcome claim, brand protection signal, control store proof structure, pilot terms, and a specific CTA.
**Do not build this until P1 and P2 rewrites are complete.** The one-pager inherits language from the main site — fix the site language first.

---

### P3-6 · Footer — add CTA
**File:** `_src/partials/footer.html`
**Element:** After the six-column grid, before `.footer-bottom`
**Current:** No footer CTA.
**Fix:** Add a footer CTA strip above `.footer-bottom`:
```html
<div class="footer-cta">
  <p>Ready to see what the pilot looks like for your stores?</p>
  <a href="{{nav_prefix}}pilot.html" class="btn btn-primary">Book a Pilot Conversation</a>
</div>
```
Add `.footer-cta` styles to `styles.css` — centered, padded, border-top similar to `.footer-bottom`.

---

## Build and deploy

After completing all edits within a priority group:

```bash
cd /Users/fox296/Desktop/entuned/website
python3 build.py
git add -A && git commit -m "Content audit rewrites: [describe what changed]" && git push origin main
```

Run build and commit after each priority group (P1, P2, P3) rather than waiting for all three.

---

## Verification checklist (run after all P1 + P2 edits)

After completing P1 and P2, scan the built output pages against this checklist before committing:

- [ ] "adaptive" appears on homepage (title, H1 or subline, at least one body section)
- [ ] "learns" appears on homepage or How It Works
- [ ] "revenue" appears on homepage
- [ ] "brand brief" appears on homepage or How It Works intake description
- [ ] "control store" appears on How It Works, named explicitly, at least twice
- [ ] "background music" does not appear on homepage in any context describing Entuned
- [ ] "AI music," "AI-generated," "AI-produced" do not appear on any indexed page
- [ ] "Get in touch" does not appear as a CTA on About or Contact
- [ ] A conversion CTA ("Book a pilot conversation" or equivalent) appears above the fold on homepage
- [ ] Footer tagline uses "adaptive" language
- [ ] Nav contains a CTA button

---

*Audit owner: Daniel Fox*
*Audit date: April 2026*
*Implement P1 before any other site work begins*
