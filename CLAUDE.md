# Entuned Website — Claude Code Instructions

Read `ARCHITECTURE.md` for the full site structure, design system, and build process.

## Quick Reference

- **Working directory:** `/Users/fox296/Desktop/entuned/website`
- **Build:** `python3 build.py` (pure Python, no deps)
- **Deploy:** `git add -A && git commit -m "message" && git push origin main` (GitHub Actions deploys to GitHub Pages)
- **Remote:** `danielfox296/brand-site`
- **Domain:** entuned.co

## Publishing a Blog Post

Every blog post requires **6 touchpoints**. Miss one and the post is orphaned.

### 1. Create the post directory

```
_src/pages/blog-<slug>/
  config.json
  style.css
  sections/01-content.html
```

**config.json:**
```json
{
  "title": "Post Title — Entuned Blog",
  "meta_description": "One-sentence description with outcome language.",
  "output": "blog/<slug>.html"
}
```

**style.css** — always just:
```css
/* Page styles — see global styles.css */
```

### 2. Write the HTML content (`sections/01-content.html`)

Template:
```html
<div class="back-link fade-up">
    <a href="../blog.html">&larr; Back to Blog</a>
  </div>

  <div class="article-hero fade-up">
    <h1>Post Title</h1>
    <img src="../img/blog/<image-filename>.jpg" alt="Descriptive alt text" class="hero-image">
  </div>

  <div class="article-meta">
    Daniel Fox &middot; Month YYYY &middot; N min read
  </div>

  <div class="article-body">
    <p class="fade-up">First paragraph...</p>

    <h2 class="fade-up">Section Heading</h2>
    <p class="fade-up">Body text...</p>

    <!-- Optional components: -->
    <div class="stat-box fade-up">
      <p><span class="highlight">Key stat or callout.</span></p>
    </div>

    <div class="warning-box fade-up">
      <p>Warning or contrarian point.</p>
    </div>

    <div class="byline fade-up">
      <p>Daniel<br>Founder, Entuned</p>
    </div>

    <p class="fade-up">Related reading: <a href="../blog/other-post.html">Other Post Title</a>, <a href="../blog/another.html">Another</a>, and <a href="../blog/third.html">Third</a>.</p>

    <div class="article-cta fade-up">
      <p>CTA text about what Entuned does, relevant to this post's topic.</p>
      <a href="../pilot.html" class="btn btn-primary">Ask About a Pilot Program</a>
    </div>
  </div>
```

**Key patterns:**
- All `<p>`, `<h2>`, `<div>` in article-body get `class="fade-up"`
- Internal links use `../blog/slug.html` (relative from blog/ subdir)
- External links get `target="_blank" rel="noopener"`
- Use `&mdash;` for em dashes, `&middot;` for mid-dots
- Link to other Entuned blog posts where relevant (cross-linking helps SEO)
- CTA always points to `../pilot.html`

### 3. Add hero image

- Save to `img/blog/<descriptive-name>.jpg`
- **No portrait-style faces** — abstract, tech, data visualization, store interiors preferred
- Source from Unsplash (download URL: `https://unsplash.com/photos/<ID>/download?force=true`)
- Check for duplicates: `md5 -q img/blog/new.jpg` against existing images
- Landscape orientation, professional quality

### 4. Add blog listing card

In `_src/pages/blog/sections/01-content.html`, add inside `.articles-grid`:

```html
    <!-- Post Title -->
    <a href="blog/<slug>.html" class="article-card fade-up">
      <img src="img/blog/<image>.jpg" alt="Post Title" class="card-img">
      <div class="card-body">
        <h2>Post Title</h2>
        <div class="article-date">Month YYYY &middot; N min read</div>
        <div class="article-summary">One-sentence summary that hooks the reader.</div>
      </div>
    </a>
```

Position newer posts higher in the list (after featured card).

### 5. Add sitemap entry

In `sitemap.xml`:
```xml
  <url>
    <loc>https://entuned.co/blog/<slug>.html</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

### 6. Add llms.txt entry

In `llms.txt`, under the blog section:
```
- [Post Title](https://entuned.co/blog/<slug>.html): One-sentence description of what the post covers.
```

### 7. Build and push

```bash
cd /Users/fox296/Desktop/entuned/website
python3 build.py
git add -A && git commit -m "Add blog post: Post Title" && git push origin main
```

## Content Rules

- Read `../VOICE.md` before writing copy. Lead with outcomes, not technology.
- Never put "AI" in a page title or hero.
- Use "retail music strategy" as the category term, not "AI music."
- Read `../brain.md` for product details, pricing, competitive landscape, research citations.
- Only edit source files in `_src/`, `styles.css`, or static assets. Never edit built HTML.
- CSS is centralized in `styles.css`. Blog posts almost never need page-specific CSS.
