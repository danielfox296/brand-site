# Entuned Website — Architecture

**This is a modular static site generator. Do NOT edit the built HTML files directly.**

## How it works

1. Edit source files in `_src/`
2. Run `python3 build.py`
3. Built HTML files appear at the repo root (and in `blog/`)

## Directory structure

```
_src/
  layouts/base.html         ← HTML shell (head, scripts, body wrapper)
  partials/
    header.html             ← Shared nav — edit here, updates ALL pages
    footer.html             ← Shared footer — same deal
  pages/
    <page-name>/            ← One directory per page
      config.json           ← Title, output filename
      style.css             ← Page-specific CSS (optional)
      sections/
        01-content.html     ← Page body content (HTML fragment, no doctype)
    blog/                   ← Blog index/listing page
    blog-<slug>/            ← Individual blog posts (output to blog/<slug>.html)

build.py                    ← The build script (pure Python, no dependencies)
styles.css                  ← Global stylesheet (NOT generated — edit directly)
img/                        ← Static images (NOT generated — edit directly)
img/blog/                   ← Blog hero images — filename matches the blog slug
audio/                      ← Static audio files (NOT generated — edit directly)
.github/workflows/deploy.yml ← GitHub Actions deploy to GitHub Pages
```

## Key rules

- **Never edit root-level .html files** — they get overwritten by `build.py`
- **To change nav or footer**: edit `_src/partials/header.html` or `footer.html`, then rebuild
- **To add a page**: create a new directory in `_src/pages/` with `config.json` and `sections/`
- **To add a blog post**: create `_src/pages/blog-<slug>/` with config output set to `blog/<slug>.html`
- **Global CSS** lives in `styles.css` at the repo root (not inside `_src/`)
- **CSS is centralized.** Blog article layout, blog listing, blog content components (`.stat-box`, `.warning-box`, `.cta`, `.highlight`, `.byline`, `.meta`, `.hero-image`), `.section-eyebrow`, and `.icon-box` all live in `styles.css`. Page-specific `style.css` files should only contain styles truly unique to that page (e.g., `.tempo-grid` for the tempo blog post, `.timeline` for the pilot page).
- **Static assets** (`img/`, `audio/`) live at the repo root and are referenced with relative paths from the HTML

## config.json format

Every page needs a `config.json` with `title`, `meta_description`, and `output`:

```json
{
  "title": "Page Title | Entuned",
  "meta_description": "150-160 chars. Lead with outcome, include a stat. No AI.",
  "output": "page-slug.html"
}
```

For blog posts, output goes into the `blog/` subdirectory:

```json
{
  "title": "Blog Post Title — Entuned Blog",
  "meta_description": "150-160 chars. Summarize what the reader will learn.",
  "output": "blog/post-slug.html"
}
```

**Title separator conventions:**
- Non-blog pages: `" | Entuned"` (pipe)
- Blog posts: `" — Entuned Blog"` (em dash)

The build script uses the output path depth to set `nav_prefix` — blog posts at `blog/slug.html` get `../` so relative links to styles, images, and other pages resolve correctly.

## Content files

Section files are plain HTML fragments. They do NOT include `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` tags.

Blog posts start with `<div class="back-link fade-up">` followed by `<div class="article-hero fade-up">`, `<div class="article-meta">`, and `<div class="article-body">`. See CLAUDE.md for the full blog post template.

Non-blog pages start directly with `<section>` tags.

## Adding a blog post

1. Create `_src/pages/blog-<slug>/`
2. Add `config.json` with `"title"`, `"meta_description"`, and `"output": "blog/<slug>.html"`
3. Add `sections/01-content.html` using the modern blog template (see CLAUDE.md)
4. Blog posts do NOT need a `style.css` — all blog layout is global. Only add one if the post has truly unique components (e.g., a data grid).
5. Add hero image to `img/blog/<slug>.jpg` — **max 500KB**, landscape, 1600px wide
6. Add a card entry in `_src/pages/blog/sections/01-content.html` (the blog listing) — card `<img>` must have descriptive `alt` text
7. Add sitemap.xml and llms.txt entries
8. Run `python3 build.py`

## Design system

### CSS custom properties

All core values are defined as CSS variables in `:root` in `styles.css`. Use these instead of hardcoding colors:

```css
:root {
  --bg: #20201c;
  --bg-card: rgba(80, 146, 156, 0.07);
  --accent: #50929c;
  --accent-light: rgba(80, 146, 156, 0.15);
  --accent-glow: rgba(80, 146, 156, 0.08);
  --text: #d4e1e5;
  --text-muted: rgba(212, 225, 229, 0.5);
  --gold: #d7af74;
  --font-heading: 'Manrope', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

### Tokens

- **Fonts:** Manrope (headings), Inter (body) — loaded via `<link>` in base.html, not CSS `@import`
- **Logo:** `img/entuned-logo-ice.svg` (SVG logotype, used in header `.logo-img` and footer `.footer-logo-img`)

### Component classes

- **Buttons:** `.btn .btn-primary` (gold bg), `.btn .btn-secondary` (gold border), `.btn-accent` (blue bg), `.btn-accent-outline` (blue border)
- **Accent utilities:** `.accent` (blue text), `.accent-bg` (blue background)
- **Layout:** `.container` (max-width 1200px), `.section` (8rem padding)
- **Cards:** `.card`, `.card-grid`, `.card-title`, `.card-text`
- **Stats:** `.stats-section`, `.stats-grid`, `.stat-item`, `.stat-number`, `.stat-label`
- **Blog article layout (global):** `.article-hero`, `.article-body`, `.article-meta`, `.article-cta`, `.back-link`, `.hero-image`
- **Blog content components (global):** `.stat-box`, `.warning-box`, `.cta`, `.highlight`, `.byline`, `.meta`
- **Blog listing (global):** `.blog-hero`, `.articles-grid`, `.article-card`, `.card-img`, `.card-body`, `.featured-card`, `.featured-label`
- **Shared components (global):** `.section-eyebrow`, `.icon-box`
- **Steps (How It Works):** `.hiw-step`, `.hiw-step-icon`, `.hiw-step-label`, `.hiw-step-body` (page-level CSS)
- **Research cards:** `.research-grid`, `.research-card`, `.research-stat`, `.research-title`, `.research-cite` (page-level CSS)
- **Audio:** `.audio-player-wrap`, `.audio-track`, `.audio-play-btn`, `.audio-progress`, `.audio-time`
- **Animations:** `.fade-up`, `.fade-in` (triggered by Intersection Observer in base.html)

### Removed (no longer in styles.css)

The following were pruned as unused. Do not reference them:
- Pricing system: `.pricing-grid`, `.pricing-card`, `.pricing-features`, etc.
- Step timeline: `.steps-container`, `.step-row`, `.step-content`, etc.
- Comparison table: `.comparison-table`
- Accordion sub-classes: `.accordion-group`, `.accordion-title`, `.accordion-panel`, `.accordion-stat`, `.accordion-icon`, `.accordion-cite` (`.accordion` and `.accordion-trigger` still exist)
- `.breadcrumbs`, `.lead`, `.section-alt`

If a future page needs pricing or comparison tables, build new classes — don't re-add the old ones.

## JavaScript (in base.html)

The base layout includes vanilla JS (at end of `<body>`) for:
- **Nav active state** — highlights current page link and adds `aria-current="page"`
- **Intersection Observer** — triggers `.fade-up` and `.fade-in` animations on scroll
- **Mobile menu toggle** — opens/closes `.nav-links` on mobile via `.mobile-open` class; toggles `aria-expanded` on the button
- **Audio player** — play/pause, progress bar, time display for `.audio-track` elements

Google Analytics (GA4) is also loaded at end of `<body>` with `defer` to avoid render-blocking.

No build tools, no npm, no bundler. Everything is vanilla JS in a single `<script>` block.

## Security

- **Build script** escapes all user-provided strings (`html.escape`) before injecting into meta/OG/Twitter tags to prevent HTML injection. It also validates output paths stay within the repo root.
- **GitHub Pages** does not support custom response headers. Security headers (CSP, X-Frame-Options, etc.) should be added via Cloudflare if needed — see Cloudflare dashboard → Rules → Transform Rules → Managed Transforms or custom response headers.
- **Deck pages** use client-side password gates (not secure for truly confidential content). Treat them as deterrents, not access control.

## Email

Email for entuned.co is handled by Cloudflare Email Routing (free). See `ops/Email_Setup.txt` for full details.

- **Forwarding:** daniel@entuned.co and daniel@entuned.co both forward to Gmail
- **Send-as:** Both addresses are configured in Gmail Settings → Accounts → Send mail as
- **DNS:** Managed by Cloudflare (nameservers: malcolm.ns.cloudflare.com / roxy.ns.cloudflare.com)
- **To add more addresses:** Cloudflare dashboard → entuned.co → Email → Routing → Create address

## CTAs and contact

All CTAs that require user contact point to the contact form (`contact.html`) or to the pilot program page (`pilot.html`).

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) runs on push to `main`:
1. Checks out `brand-site` repo
2. Runs `python3 build.py` to generate all HTML from `_src/`
3. Stages everything into `_site/` (HTML, CSS, img, audio, blog)
4. Deploys to GitHub Pages at entuned.co

To deploy: `git add -A && git commit -m "message" && git push origin main`

## Agent rules

**IMPORTANT — rules for AI agents working on this codebase:**

1. **Always provide push commands.** After completing any update, always give the user ready-to-copy git commands (add, commit, push) with absolute paths. The user deploys manually from their local machine. Never end a task without providing the push commands.
2. **Never edit built HTML files.** Only edit source files in `_src/`, `styles.css`, or static assets. Then run `python3 build.py`.
3. **Rebuild after every change.** Always run `python3 build.py` and confirm it succeeds before declaring work done.
4. **Respect the design system.** Use the colors, fonts, and component classes documented above. Don't invent one-off inline styles when a reusable class exists.
5. **CSS is centralized.** Most component styles live in global `styles.css`. Page-specific `style.css` files should only contain styles truly unique to that one page. Blog posts generally need no page-specific CSS — their layout and content components are all global. Before adding a new class to a page CSS file, check if a global class already covers it.
5a. **Never override global class names in page CSS.** If a page needs a variant of a global class (e.g., `.hero-alt`), create a scoped version (e.g., `.cfo-hero-alt`) instead of redefining the global class in the page stylesheet. This prevents cross-page side effects.
5b. **All images need alt text.** Every `<img>` must have a descriptive `alt` attribute for SEO and accessibility. Never use `alt=""` on content images.
6. **Keep it simple.** No build tools, no npm, no bundler. Vanilla HTML/CSS/JS only.
7. **Follow brand voice.** Read `../VOICE.md` before writing any copy. Lead with outcomes, not technology. Never put "AI" in a page title or hero. Use "retail music strategy" as the category term, not "AI music."
8. **Every page needs SEO.** Every config.json must have a `title` and `meta_description`. Titles lead with the outcome. Descriptions include a stat and the pilot CTA. See `../VOICE.md` for patterns. Use `" | Entuned"` separator for pages and `" — Entuned Blog"` for blog posts.
9. **Read `../brain.md` for context.** It has product details, pricing, competitive landscape, research citations, and key decisions. Reference it before making content decisions.

## Testing locally

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

Note: the audio player requires HTTP (not `file://`) to load audio files, so use the local server.
