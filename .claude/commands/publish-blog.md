# Publish Blog Post

Publish one or more blog posts to the Entuned website. Handles everything: content creation, hero images, blog listing, sitemap, llms.txt, build, and git push.

## Input

The user will provide blog post content in one of these forms:
- A `.docx` file path containing one or more posts
- Raw text/markdown with the post content
- A topic or angle to write about (requires reading `../VOICE.md` and `../brain.md` for voice and context)

If the user provides a file, extract all posts from it. Each post typically has a title, author line, body paragraphs, and section headings.

## Step-by-step procedure

### 0. Read the architecture

Read `ARCHITECTURE.md` and `CLAUDE.md` in the website root. These have the full build system, design system, and blog publishing checklist. Also read `../VOICE.md` for brand voice and `../brain.md` for product context.

### 1. Determine slugs

For each post, create a URL-friendly slug from the title:
- Lowercase, hyphens for spaces, strip punctuation
- Keep it descriptive but not excessively long
- Example: "The Battery Ventures Thesis, Extended" → `battery-ventures-thesis-extended`

### 2. Create post directories

For each post, create:
```
_src/pages/blog-<slug>/
  config.json
  style.css          ← always just: /* Page styles — see global styles.css */
  sections/01-content.html
```

**config.json format:**
```json
{
  "title": "Post Title — Entuned Blog",
  "meta_description": "One-sentence outcome-focused description.",
  "output": "blog/<slug>.html"
}
```

### 3. Write HTML content

Use this exact structure for `sections/01-content.html`:

```html
<div class="back-link fade-up">
    <a href="../blog.html">&larr; Back to Blog</a>
  </div>

  <div class="article-hero fade-up">
    <h1>Post Title</h1>
    <img src="../img/blog/<image>.jpg" alt="Descriptive alt text" class="hero-image">
  </div>

  <div class="article-meta">
    Daniel Fox &middot; Month YYYY &middot; N min read
  </div>

  <div class="article-body">
    <!-- Body content with fade-up on every element -->
    <p class="fade-up">...</p>
    <h2 class="fade-up">Section Heading</h2>

    <!-- Available inline components: -->
    <div class="stat-box fade-up">
      <p><span class="highlight">Key callout text.</span></p>
    </div>

    <div class="warning-box fade-up">
      <p>Contrarian or cautionary point.</p>
    </div>

    <!-- Always end with this exact sequence (all 5 blocks, in this order): -->
    <div class="byline fade-up">
      <p>Daniel<br>Founder, Entuned</p>
    </div>

    <p class="fade-up">Related reading: <a href="../blog/slug1.html">Title 1</a>, <a href="../blog/slug2.html">Title 2</a>, and <a href="../blog/slug3.html">Title 3</a>.</p>

    <div class="takeaway-box fade-up">
      <p><strong>TL;DR:</strong> One-to-two sentence summary of the post's core argument or insight.</p>
    </div>

    <div class="author-bio fade-up">
      <p><strong>Daniel Fox</strong> is the founder of Entuned, where he builds music systems engineered for retail customer psychology. Background in music theory, behavioral research, and data-driven product design. <a href="../about.html">More about Daniel</a></p>
    </div>

    <div class="article-cta fade-up">
      <p>CTA text relevant to the post topic.</p>
      <a href="../pilot.html" class="btn btn-primary">Ask About a Pilot Program</a>
    </div>
  </div>
```

**Rules:**
- Every `<p>`, `<h2>`, `<div>` inside `.article-body` gets `class="fade-up"`
- Internal links: `../blog/other-slug.html` (relative from blog/ subdir)
- External links: `target="_blank" rel="noopener"`
- Use `&mdash;` for em dashes, `&middot;` for mid-dots
- Cross-link to other Entuned blog posts where relevant
- CTA always points to `../pilot.html`
- Pick 2-3 related posts for the "Related reading" section
- List existing posts: `ls _src/pages/ | grep blog-`

### 4. Find and download hero images

- Search Unsplash for landscape, professional images matching the post topic
- Download URL pattern: `https://unsplash.com/photos/<PHOTO_ID>/download?force=true`
- Save to `img/blog/<descriptive-name>.jpg`
- **CRITICAL: No portrait-style faces.** Abstract, tech, data visualization, store interiors preferred.
- Verify visually after download (read the image file to check)
- Check for duplicates against all existing blog images:
  ```bash
  newhash=$(md5 -q img/blog/new.jpg)
  for f in img/blog/*.jpg; do
    [ "$(md5 -q "$f")" = "$newhash" ] && [ "$f" != "img/blog/new.jpg" ] && echo "DUPLICATE: $f"
  done
  ```
- If duplicate found, download a different image

### 5. Add blog listing cards

In `_src/pages/blog/sections/01-content.html`, add card(s) inside the `.articles-grid` div. Position newer posts near the top (after the featured card):

```html
    <!-- Post Title -->
    <a href="blog/<slug>.html" class="article-card fade-up">
      <img src="img/blog/<image>.jpg" alt="Post Title" class="card-img">
      <div class="card-body">
        <h2>Post Title</h2>
        <div class="article-date">Month YYYY &middot; N min read</div>
        <div class="article-summary">One hook sentence.</div>
      </div>
    </a>
```

### 6. Add sitemap entries

In `sitemap.xml`, add for each post:
```xml
  <url>
    <loc>https://entuned.co/blog/<slug>.html</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

### 7. Add llms.txt entries

In `llms.txt`, add under the blog section:
```
- [Post Title](https://entuned.co/blog/<slug>.html): One-sentence description.
```

### 8. Build

```bash
cd /Users/fox296/Desktop/entuned/website
python3 build.py
```

Verify it says "Built N pages" and "Done" with no errors. The build also regenerates `rss.xml` — make sure to stage it in the commit.

### 9. Commit and push

```bash
git add -A
git commit -m "Add blog post(s): title1, title2"
git push origin main
```

GitHub Actions will deploy automatically.

### 10. Verify

After push, confirm the posts are accessible at:
- `https://entuned.co/blog/<slug>.html`
- Blog listing at `https://entuned.co/blog.html`

## Checklist (verify before declaring done)

For EACH post, confirm all 6 touchpoints:
- [ ] `_src/pages/blog-<slug>/` directory with config.json, style.css, sections/01-content.html
- [ ] Hero image in `img/blog/` (no faces, unique hash, visually verified)
- [ ] Card in `_src/pages/blog/sections/01-content.html`
- [ ] Entry in `sitemap.xml`
- [ ] Entry in `llms.txt`
- [ ] `python3 build.py` ran successfully
- [ ] Git committed and pushed
