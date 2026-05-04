# Entuned Website — Claude Code Instructions

Read `ARCHITECTURE.md` for the full site structure, design system, and build process.

## Quick Reference

- **Working directory:** `/Users/fox296/Desktop/entuned/website`
- **Build:** `python3 build.py` (pure Python, no deps)
- **Deploy:** `git add -A && git commit -m "message" && git push origin main` (GitHub Actions deploys to GitHub Pages)
- **Remote:** `danielfox296/brand-site`
- **Domain:** entuned.co

## Content Editing (YAML Layer)

Every page has a `content.yaml` file alongside its HTML sections. **When editing text content, edit the YAML file — not the HTML.**

- **Content files:** `_src/pages/<page-name>/content.yaml`
- **HTML templates** use `{{content.key}}` placeholders — don't put raw text in these
- **After any content edit:** run `python3 build.py` before committing
- The how-it-works page uses nested keys (`content.hero.headline`); all other pages use flat sequential keys (`content.h1_1`, `content.p_3`, etc.)
- Inline HTML (links, `<span>`, `<strong>`) is stored inside YAML values — that's intentional
- To read all site copy at once: `grep -r "" _src/pages/*/content.yaml`

## Publishing a Blog Post

Every blog post requires **6 touchpoints**. Miss one and the post is orphaned.

### 1. Create the post directory

```
_src/pages/blog-<slug>/
  config.json
  sections/01-content.html
```

**config.json:**
```json
{
  "title": "Post Title — Entuned Blog",
  "meta_description": "150-160 chars. Summarize what the reader will learn.",
  "output": "blog/<slug>.html"
}
```

**No `style.css` needed** — all blog layout is handled by global classes. Only add a page-specific `style.css` if the post has a truly unique component (e.g., a data visualization grid).

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

    <!-- REQUIRED: TL;DR takeaway box — always first element in article-body -->
    <div class="takeaway-box fade-up">
      <p><strong>TL;DR:</strong> 2-3 sentence summary of the post's core argument.</p>
    </div>

    <p class="fade-up">Opening paragraph...</p>

    <!-- REQUIRED: Use h2 headings to break up sections — never use <hr> dividers -->
    <h2 class="fade-up">Section Heading</h2>
    <p class="fade-up">Body text...</p>

    <h2 class="fade-up">Next Section Heading</h2>
    <p class="fade-up">More body text...</p>

    <!-- Optional components: -->
    <div class="stat-box fade-up">
      <p><span class="highlight">Key stat or callout.</span></p>
    </div>

    <div class="warning-box fade-up">
      <p>Warning or contrarian point.</p>
    </div>

    <!-- REQUIRED: Byline -->
    <div class="byline fade-up">
      <p>Daniel<br>Founder, Entuned</p>
    </div>

    <!-- REQUIRED: Author bio -->
    <div class="author-bio fade-up">
      <p><strong>Daniel Fox</strong> is the founder of Entuned, where he builds music systems engineered for retail customer psychology. Background in music theory, behavioral research, and data-driven product design. <a href="../about.html">More about Daniel</a></p>
    </div>

    <!-- REQUIRED: Related reading — link to 2-3 other Entuned blog posts -->
    <p class="fade-up">Related reading: <a href="../blog/other-post.html">Other Post Title</a>, <a href="../blog/another.html">Another</a>, and <a href="../blog/third.html">Third</a>.</p>

    <!-- REQUIRED: CTA box — always last element in article-body. Use the canonical Start Free copy verbatim. -->
    <div class="article-cta fade-up">
      <p>Entuned engineers original music for your store at the parameter level — tempo, key, lyrical density, energy arc — tailored to your customer and tied to your sales outcomes. Essentials is free, indefinite, no card. PRO-indemnified the moment it plays.</p>
      <a href="https://app.entuned.co/start" class="btn btn-primary">Start Free</a>
    </div>
  </div>
```

**Required elements (every blog post must have all of these):**
1. **Takeaway box** — `<div class="takeaway-box">` as the first element in article-body. Starts with `<strong>TL;DR:</strong>` or `<strong>Key Takeaway:</strong>`. 2-3 sentences summarizing the core argument.
2. **h2 section headings** — break the post into 2-4 named sections. Never use `<hr>` dividers.
3. **Byline** — `<div class="byline">` with `Daniel<br>Founder, Entuned`.
4. **Author bio** — `<div class="author-bio">` with Daniel's standard bio and link to about page.
5. **Related reading** — link to 2-3 other Entuned blog posts for internal cross-linking.
6. **CTA box** — `<div class="article-cta">` using the canonical Start Free copy and button linking to `https://app.entuned.co/start` (the live self-onboard activation flow). Do NOT write a custom CTA blurb per post — every post uses the same canonical copy.

**Canonical Start Free CTA copy** (use verbatim on every post — HTML and YAML schema posts both):

> Entuned engineers original music for your store at the parameter level — tempo, key, lyrical density, energy arc — tailored to your customer and tied to your sales outcomes. Essentials is free, indefinite, no card. PRO-indemnified the moment it plays.

For posts using the **structured YAML blog renderer** (`type: cta` block), the canonical CTA is:

```yaml
  - type: cta
    variant: start-free
    headline: "Hear it on your floor."
    body: "Entuned engineers original music for your store at the parameter level — tempo, key, lyrical density, energy arc — tailored to your customer and tied to your sales outcomes. Essentials is free, indefinite, no card. PRO-indemnified the moment it plays."
    link: "https://app.entuned.co/start"
    link_text: "Start Free"
```

**Key patterns:**
- All `<p>`, `<h2>`, `<div>` in article-body get `class="fade-up"`
- Internal links use `../blog/slug.html` (relative from blog/ subdir)
- External links get `target="_blank" rel="noopener"`
- Use `&mdash;` for em dashes, `&middot;` for mid-dots
- Link to other Entuned blog posts where relevant (cross-linking helps SEO)
- CTA always points to `https://app.entuned.co/start` (the live self-onboard activation flow). The legacy `waitlist.html` email-capture page still exists as a fallback for inbound links, but new CTAs should go straight to the activation flow.
- Do NOT use the old "Ask About a Pilot Program" / "Learn About the Free Pilot Program" / "Start a conversation" CTAs anywhere

### 3. Add hero image

- Save to `img/blog/<descriptive-name>.jpg`
- **Max 500KB, 1600px wide** — compress with `sips --resampleWidth 1600 -s format jpeg -s formatOptions 80`
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

## CSS Rules

- **Use CSS custom properties** — colors and fonts are defined as variables in `:root` in `styles.css`. Use `var(--accent)`, `var(--text)`, `var(--bg)`, etc. instead of hardcoding hex values in page-specific CSS.
- **Never override global class names in page CSS.** If a page needs a variant, prefix it (e.g., `.cfo-hero` not `.hero-alt`). See `for-cfos/style.css` for the pattern.
- **Avoid inline `style` attributes.** Use a class in `styles.css` or the page's `style.css` instead. Existing inline styles are technical debt — don't add more.
- **All `<img>` tags need descriptive `alt` text.** Never use `alt=""` on content images.
- **Images must be under 500KB.** Compress before committing with `sips --resampleWidth 1600 -s format jpeg -s formatOptions 80`.
