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

Every page needs a `config.json`:

```json
{
  "title": "Page Title | Entuned",
  "output": "page-slug.html"
}
```

For blog posts, output goes into the `blog/` subdirectory:

```json
{
  "title": "Blog Post Title | Entuned",
  "output": "blog/post-slug.html"
}
```

The build script uses the output path depth to set `nav_prefix` — blog posts at `blog/slug.html` get `../` so relative links to styles, images, and other pages resolve correctly.

## Content files

Section files are plain HTML fragments. They do NOT include `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` tags. The first line of blog post content files is typically `</header>` (closing the header partial), followed by `<main>`.

For non-blog pages, content starts directly with `<section>` tags.

## Adding a blog post

1. Create `_src/pages/blog-<slug>/`
2. Add `config.json` with `"output": "blog/<slug>.html"`
3. Add `sections/01-content.html` — HTML fragment starting with `</header>` then `<main><article>...`
4. Optionally add `style.css` for page-specific styles
5. Add hero image to `img/blog/<slug>.jpg`
6. Add a card entry in `_src/pages/blog/sections/01-content.html` (the blog listing)
7. Run `python3 build.py`

## Design system

- **Background:** #080808
- **Gold accent:** #d7af74
- **Blue accent:** #829eac
- **Text:** #E8E4DE
- **Fonts:** Manrope (headings, via Google Fonts CDN), Inter (body)
- **Logo:** `img/Entuned_logo.png` (transparent PNG logotype, used in header and footer via `.logo-img` and `.footer-logo-img`)
- **Button classes:** `.btn .btn-primary` (gold bg), `.btn .btn-secondary` (gold border), `.btn-accent` (blue bg), `.btn-accent-outline` (blue border)
- **Accent utilities:** `.accent` (blue text), `.accent-bg` (blue background)
- **Layout:** `.container` (max-width 1200px), `.section` (8rem padding)
- **Cards:** `.card`, `.card-grid`, `.card-title`, `.card-text`
- **Stats:** `.stats-section`, `.stats-grid`, `.stat-item`, `.stat-number`, `.stat-label`
- **Pricing:** `.pricing-grid`, `.pricing-card`, `.pricing-card.featured`
- **Blog article layout (global):** `.article-hero`, `.article-body`, `.article-meta`, `.article-cta`, `.back-link`, `.hero-image`
- **Blog content components (global):** `.stat-box`, `.warning-box`, `.cta`, `.highlight`, `.byline`, `.meta`
- **Blog listing (global):** `.blog-hero`, `.articles-grid`, `.article-card`, `.card-img`, `.card-body`, `.featured-card`, `.featured-label`
- **Shared components (global):** `.section-eyebrow`, `.icon-box`
- **Steps (How It Works):** `.hiw-step`, `.hiw-step-icon`, `.hiw-step-label`, `.hiw-step-body` (page-level CSS)
- **Research cards:** `.research-grid`, `.research-card`, `.research-stat`, `.research-title`, `.research-cite` (page-level CSS)
- **Audio:** `.audio-player-wrap`, `.audio-track`, `.audio-play-btn`, `.audio-progress`, `.audio-time`
- **Animations:** `.fade-up`, `.fade-in` (triggered by Intersection Observer in base.html)

## JavaScript (in base.html)

The base layout includes vanilla JS for:
- **Nav active state** — highlights current page link
- **Intersection Observer** — triggers `.fade-up` and `.fade-in` animations on scroll
- **Mobile menu toggle** — opens/closes `.nav-links` on mobile via `.mobile-open` class
- **Audio player** — play/pause, progress bar, time display for `.audio-track` elements

No build tools, no npm, no bundler. Everything is vanilla JS in a single `<script>` block.

## Email

Email for entuned.co is handled by Cloudflare Email Routing (free). See `ops/Email_Setup.txt` for full details.

- **Forwarding:** hello@entuned.co and daniel@entuned.co both forward to Gmail
- **Send-as:** Both addresses are configured in Gmail Settings → Accounts → Send mail as
- **DNS:** Managed by Cloudflare (nameservers: malcolm.ns.cloudflare.com / roxy.ns.cloudflare.com)
- **To add more addresses:** Cloudflare dashboard → entuned.co → Email → Routing → Create address

## CTAs and contact

All CTAs that require user contact point to `mailto:hello@entuned.co` with contextual subject lines, or to the pilot program page (`pilot.html`).

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) runs on push to `main`:
1. Checks out `brand-site` repo
2. Checks out `entuned-player` repo, builds it with Vite, drops output into `_site/play/`
3. Runs `python3 build.py` to generate all HTML from `_src/`
4. Stages everything into `_site/` (HTML, CSS, img, audio, blog, play)
5. Deploys to GitHub Pages at entuned.co

To deploy: `git add -A && git commit -m "message" && git push origin main`

## Agent rules

**IMPORTANT — rules for AI agents working on this codebase:**

1. **Always provide push commands.** After completing any update, always give the user ready-to-copy git commands (add, commit, push) with absolute paths. The user deploys manually from their local machine. Never end a task without providing the push commands.
2. **Never edit built HTML files.** Only edit source files in `_src/`, `styles.css`, or static assets. Then run `python3 build.py`.
3. **Rebuild after every change.** Always run `python3 build.py` and confirm it succeeds before declaring work done.
4. **Respect the design system.** Use the colors, fonts, and component classes documented above. Don't invent one-off inline styles when a reusable class exists.
5. **CSS is centralized.** Most component styles live in global `styles.css`. Page-specific `style.css` files should only contain styles truly unique to that one page. Blog posts generally need no page-specific CSS — their layout and content components are all global. Before adding a new class to a page CSS file, check if a global class already covers it.
6. **Keep it simple.** No build tools, no npm, no bundler. Vanilla HTML/CSS/JS only.
7. **Follow brand voice.** Read `../VOICE.md` before writing any copy. Lead with outcomes, not technology. Never put "AI" in a page title or hero. Use "retail music strategy" as the category term, not "AI music."
8. **Every page needs SEO.** Every config.json must have a `title` and `description`. Titles lead with the outcome. Descriptions include a stat and the pilot CTA. See `../VOICE.md` for patterns.
9. **Read `../brain.md` for context.** It has product details, pricing, competitive landscape, research citations, and key decisions. Reference it before making content decisions.

## Testing locally

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

Note: the audio player requires HTTP (not `file://`) to load audio files, so use the local server.
