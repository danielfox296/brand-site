# Entuned Site Expansion — Implementation Guide
## Phase 1 Build Instructions for Claude Code

Read `CLAUDE.md` and `ARCHITECTURE.md` before starting. All pages follow the existing `_src/pages/` pattern.
Each new page requires: a directory, `config.json`, `sections/01-content.html`, `style.css`, a sitemap entry, and an `llms.txt` entry.

---

## PAGES TO BUILD

### 1. /for-apparel.html
### 2. /for-wine.html
### 3. /for-hospitality.html
### 4. /team.html
### 5. /why-entuned.html
### 6. /data.html

---

## NAVIGATION CHANGES

After building all pages, update `_src/partials/header.html`:

- Add a "For Your Industry" nav item (desktop: dropdown or separate nav group) containing:
  - For Apparel Retailers → /for-apparel.html
  - For Wine Retailers → /for-wine.html
  - For Hospitality Retail → /for-hospitality.html

- Add to footer navigation (already exists in `_src/partials/footer.html`):
  - Team → /team.html
  - Why Entuned → /why-entuned.html
  - Data Practices → /data.html

Footer placement signals these pages exist for those who look — investors, partners, prospects doing due diligence — without cluttering primary nav.

---

## SITEMAP ENTRIES TO ADD

Add to `sitemap.xml` after existing entries:

```xml
  <url>
    <loc>https://entuned.co/for-apparel.html</loc>
    <lastmod>2026-03-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://entuned.co/for-wine.html</loc>
    <lastmod>2026-03-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://entuned.co/for-hospitality.html</loc>
    <lastmod>2026-03-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://entuned.co/team.html</loc>
    <lastmod>2026-03-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://entuned.co/why-entuned.html</loc>
    <lastmod>2026-03-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://entuned.co/data.html</loc>
    <lastmod>2026-03-31</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

---

## LLMS.TXT ENTRIES TO ADD

Add under the "Pages" section in `llms.txt`:

```
- [Entuned for Apparel Retailers](https://entuned.co/for-apparel.html): How Entuned optimizes store atmosphere for clothing and apparel retailers, with outcome metrics and implementation overview.
- [Entuned for Wine Retailers](https://entuned.co/for-wine.html): How Entuned optimizes store atmosphere for wine and specialty beverage retailers, targeting dwell time and basket size.
- [Entuned for Hospitality Retail](https://entuned.co/for-hospitality.html): How Entuned optimizes store atmosphere for hotel retail, resort shops, and hospitality-adjacent retail environments.
- [Team](https://entuned.co/team.html): Entuned's founder background and advisor network across retail operations, data science, and music production.
- [Why Entuned](https://entuned.co/why-entuned.html): How Entuned differs from existing retail music and background audio services, and why measurement is the missing layer.
- [Data Practices](https://entuned.co/data.html): How Entuned handles retailer data, what it collects, how it's protected, and what customers retain ownership of.
```

---

## CONTENT RULES (from VOICE.md — apply to all new pages)

- Lead with outcomes, not technology
- No bullet points in body copy — prose only
- No em dashes
- No hedging language ("might," "could," "may help")
- Mechanistic prose: say what happens, not how impressive it is
- Assertions earned before they are made
- Peer-to-peer tone — you are talking to a retail operator, not pitching to a prospect
- No "AI" in page titles or hero headings
- CTA on every page: "Schedule a consultation" linking to /pilot.html or /contact.html

---

## PAGE CONTENT SPECIFICATIONS

The complete HTML content for each page's `sections/01-content.html` is provided in the files below.
Build them in order. After all six are written, update header and footer partials, update sitemap.xml and llms.txt, run `python3 build.py`, verify output, then push.

---

## BUILD AND DEPLOY

```bash
cd /Users/fox296/Desktop/entuned/website
python3 build.py
git add -A && git commit -m "Add industry vertical pages, team, why-entuned, data practices" && git push origin main
```

---

## FUTURE PHASES — DO NOT BUILD NOW

These pages should be built only when the corresponding operational reality exists:

- /case-studies.html — when publishable pilot results exist with client permission
- /partners.html — when integration conversations with RetailNext or others are formalized
- /careers.html — when a hire is imminent
- /enterprise.html — when multi-location enterprise deals are in active pipeline
- /press.html — when media coverage exists to populate it
- /dataset.html — when the data moat is mature enough to describe publicly without overstating
