# Entuned Website — Claude Code Instructions

Read `ARCHITECTURE.md` for the full site structure, design system, and build process.

## Quick Reference

- **Working directory:** `/Users/fox296/Desktop/entuned/website`
- **Build:** `python3 build.py` (pure Python, no deps)
- **Deploy:** `git add -A && git commit -m "message" && git push origin main` (GitHub Actions deploys to GitHub Pages)
- **Remote:** `danielfox296/brand-site`
- **Domain:** entuned.co

## ⚠️ Hard rule: no raw HTML

Never create `.html` files directly in the repo root or `blog/`. Every output file must come from `_src/pages/<name>/`. This includes redirects — use a `blog-redirect-<slug>/config.json` with a `redirect_to` field. See `ARCHITECTURE.md` for the redirect stub schema. If you write `<!DOCTYPE html>` outside `_src/layouts/base.html`, you're doing it wrong.

## Load-bearing rules

Rules that have bitten in the past and aren't enforceable by the build. **Read `../VOICE.md` and run `/terminology-check` before pushing any copy** — the bans below are a subset of what that skill lints.

### Hard term bans (in any user-facing copy)

- **No "AI"** in page titles or heros. Category term is **"retail music strategy"**.
- **No "Essentials"** — the free tier is **"Entuned Free"**. (DB value is still `free` server-side; that's invisible to the site.)
- **No "Core"** — the mid tier is **"Boost"**. (DB value is still `core` server-side.)
- **No "zones"** — not a product concept. Don't reference it anywhere.
- **No "day-parting"** except in the single allowed explainer phrase "like day-parting, but better". Use **"Outcome Scheduling"** in all other copy.

### Pricing CTA topology — locked plumbing, Free-first hierarchy

The CTA flow is intentionally asymmetric. Don't "fix" it by sending every tier through the same path.

| Path | CTA destination | Why |
|---|---|---|
| **Entuned Free** | `https://app.entuned.co/start` | **The primary CTA site-wide (Daniel, 2026-07-11): lead people to the listen-now path.** Self-onboard activation flow. No card. |
| Boost | Direct Stripe Checkout | Skip the dashboard intermediate; reduce friction. |
| Pro | Direct Stripe Checkout | Same as Boost. |
| Multi-location pilot | `pilot.html` → `contact.html?topic=pilot` | Secondary door on buyer-intent surfaces (demoted 2026-07-11). 5–50-door specialty retail; founder-led. |
| Enterprise | `contact.html?topic=enterprise` | >50 doors. High-touch, inbound only. |

**Hierarchy (re-inverted 2026-07-11, Daniel):** Start Free is the primary CTA on every surface — the GTM is the listen-now path: free signup, music on the floor the same day. The multi-location pilot stays live as the secondary CTA on buyer-intent surfaces (homepage, pricing, verticals, for-retail-leaders, for-cfos) with the 5–50-door routing microcopy — don't remove it. Don't add a "pick a tier" selector on the brand site. History: the pilot held the primary slot 2026-06-09 → 2026-07-11 (ICP v2 Phases 2–3); see `../projects/icp-v2-routing/SSOT.md`.

### Vertical pages — all live, all indexed, don't delete

The `for-<vertical>.html` family (apparel, beauty-supply, cosmetics, furniture-mattress, home-goods, jewelry, specialty-retail, sporting-goods) are all **fully built, `index, follow`, and linked site-wide from the footer's "For Your Industry" list**. `for-cosmetics.html` was formerly a noindex placeholder; it was built out and is now a normal live vertical — don't treat it (or any sibling) as a stub. Don't 410, delete, or redirect any of them.

Each vertical's `related.others` line cross-links to **all** other verticals (alphabetical, labels matching the footer). Keep that complete and consistent when adding a new vertical — add it to every sibling's `others` line and to the footer.

### Video posts must stay watch pages

Posts with a `video:` block in `content.yaml` are **watch pages** — pages whose main content is the player. Google only indexes a video when the page reads that way, so the player's render state is load-bearing SEO, not styling.

**Never add `fade-up` or `loading="lazy"` to the video block** (`_src/templates/blocks/video.html`). `fade-up` paints at `opacity: 0` until an IntersectionObserver fires on scroll; `loading="lazy"` means a crawler that renders without scrolling never fetches the iframe at all. The player must be **opaque and loaded at first paint**.

**Keep the player first.** `blog_post.html` renders it directly under the byline, above the hero image and key takeaways, and suppresses the hero `<img>` on video posts — `hero.src` there is the same 1280×720 YouTube thumbnail the player already shows. Don't reintroduce the hero image or push the player below the fold.

**The markup must agree that the video owns the page.** Rendering it prominently is only half — Google reads the structured data to decide what the page *is*. On video posts `build.py` therefore:

- gives the **VideoObject** the `mainEntityOfPage` (plus `@id` and `url`) and **takes it away from the Article**. Two competing claims and Google picks Article.
- emits **no `contentUrl`**. It must point at a real media file; we don't host one. Pointing it at `youtube.com/watch` produced GSC's *"Multiple video URLs discovered as belonging to this video"* and resolved the video's home to YouTube. `embedUrl` alone is correct for an embed.
- points every **Clip `url`** at this page with `?t=<seconds>`, never at YouTube — Google's Clip spec requires the URL to be the page holding the video. The chapter links and the `?t=` deep-link handler in `blocks/transcript.html` exist to make those URLs real; don't turn the chapter links back into outbound YouTube links.
- **suppresses the auto-extracted FAQPage.** Most of these posts have question-shaped H2s, and an FAQPage is a third competing claim about what the page primarily is.

History: all 33 video posts sat at **0 indexed** under GSC's single reason *"Video isn't on a watch page"* (detected 2026-06-11). Two rounds:

1. **2026-07-25** — render fix (`opacity: 0`, lazy iframe at 879px, hero image on top). Confirmed working: the Jul 26 recrawl reported *"One video detected on page"*. But validation **failed** 7/27, now with the sharper diagnostic *"Is on a watch page? No — the video is supplementary content on the page."*
2. **2026-07-27** — the structured-data changes above; validation restarted.

If the Videos report regresses, check the render facts first, then run URL inspection → Video indexing on one page: the *"Is on a watch page?"* line and the *"Multiple video URLs"* list are the two diagnostics that actually name the cause.

### ICP discipline before new pages

- **ICP v2 (2026-06-09): the sales target is multi-location specialty retail, 5–50 doors; single-store stays self-serve.** Read `../marketing/ICP/SSOT.md` before writing any new vertical/landing page or outreach copy. Excluded verticals (grocery/convenience/pharmacy, luxury flagship, restaurants/hospitality) and cultural-identity verticals don't ship.
- **Run `/outreach-precheck` first** when the task is target selection or angle picking for a vertical/listicle/partnership page. Target selection comes *before* drafting.
- **Run `/adversarial` before publishing** any change to strategic surfaces: pricing copy, public positioning, vertical pages, founder writing, blog posts, investor narrative. The skill spawns a cold-context attack on the draft; surface the punch list before pushing.

### Order of gates on a user-facing push

1. Edit `_src/` source
2. `python3 build.py`
3. `/terminology-check` (deterministic lint against the ban list)
4. `/adversarial` if the surface is strategic (pricing, doctrine, vertical, founder writing, blog post)
5. `git add -A && git commit && git push origin main`

## Content Editing (YAML Layer)

Every page has a `content.yaml` file alongside its HTML sections. **When editing text content, edit the YAML file — not the HTML.**

- **Content files:** `_src/pages/<page-name>/content.yaml`
- **HTML templates** use `{{content.key}}` placeholders — don't put raw text in these
- **After any content edit:** run `python3 build.py` before committing
- The how-it-works page uses nested keys (`content.hero.headline`); all other pages use flat sequential keys (`content.h1_1`, `content.p_3`, etc.)
- Inline HTML (links, `<span>`, `<strong>`) is stored inside YAML values — that's intentional
- To read all site copy at once: `grep -r "" _src/pages/*/content.yaml`

## Publishing a Blog Post

> **Canonical path is the structured YAML renderer (`content.yaml`), not raw HTML.** As of 2026-06, **all** posts are authored via `content.yaml` (see memory `feedback_blog_posts_yaml_only`). Create `blog-<slug>/config.json` + `blog-<slug>/content.yaml` and let the renderer emit the HTML — body blocks (`type: heading`, `type: paragraph`, `type: cta`, etc.) live in YAML. The `sections/01-content.html` walkthrough below is **legacy/reference only**; do not start new posts from it. The `type: cta` block uses the canonical CTA copy shown later in this section. Easiest path: use the `substack-cross-post` skill, which owns the YAML template end-to-end.

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
  "title": "Post Title",
  "meta_description": "150-160 chars. Summarize what the reader will learn.",
  "output": "blog/<slug>.html"
}
```

**Title suffix:** don't append one. The build normalizes every page title (blog and non-blog) to `" | Entuned"` — it strips any legacy `" — Entuned Blog"` suffix and re-appends `" | Entuned"`. The shorter suffix wastes less of the ~60-char SERP title budget. (Convention ratified 2026-07-11; the old em-dash blog suffix is retired.)

**No `style.css` needed** — all blog layout is handled by global classes. Only add a page-specific `style.css` if the post has a truly unique component (e.g., a data visualization grid).

### 2. Write the content (LEGACY HTML pattern — prefer `content.yaml`; see callout above)

Template (legacy reference only):
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
      <p>Entuned engineers original music for your store at the parameter level — tempo, key, lyrical density, energy arc — tailored to your customer and tied to your sales outcomes. Entuned Free &mdash; no card, no time limit. PRO-indemnified the moment it plays.</p>
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

> Entuned engineers original music for your store at the parameter level — tempo, key, lyrical density, energy arc — tailored to your customer and tied to your sales outcomes. Entuned Free &mdash; no card, no time limit. PRO-indemnified the moment it plays.

For posts using the **structured YAML blog renderer** (`type: cta` block), the canonical CTA is:

```yaml
  - type: cta
    variant: start-free
    headline: "Hear it on your floor."
    body: "Entuned engineers original music for your store at the parameter level — tempo, key, lyrical density, energy arc — tailored to your customer and tied to your sales outcomes. Entuned Free &mdash; no card, no time limit. PRO-indemnified the moment it plays."
    link: "https://app.entuned.co/start"
    link_text: "Start Free"
```

**Key patterns:**
- All `<p>`, `<h2>`, `<div>` in article-body get `class="fade-up"`
- Internal links use `../blog/slug.html` (relative from blog/ subdir)
- External links get `target="_blank" rel="noopener"`
- Use `&mdash;` for em dashes, `&middot;` for mid-dots
- Link to other Entuned blog posts where relevant (cross-linking helps SEO)
- Blog CTA always points to `https://app.entuned.co/start` (the live self-onboard activation flow). The legacy `waitlist.html` page no longer exists — do not link to it. `pilot.html` is live again as of 2026-06-09 (ICP v2): the multi-location pilot page for the 5–50-door buyer. Linking to it from buyer-intent surfaces is correct; the blog CTA box stays Start Free until the planned template-level fork lands (see `../projects/icp-v2-routing/SSOT.md`, Phase 4).
- Do NOT use the old "Ask About a Pilot Program" / "Learn About the Free Pilot Program" CTA phrasings — the pilot CTA copy is "Start the pilot conversation" pointing at `pilot.html` or `contact.html?topic=pilot`

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

### 5. sitemap.xml — automatic (since 2026-07-11)

`build.py` generates `sitemap.xml` on every build. Never edit it by hand. Noindexed posts, redirect stubs, and posts whose YAML `canonical` points at a different page are excluded automatically. Blog `lastmod` comes from YAML `last_updated`/`date`; root pages read `lastmod` from their `config.json`.

### 6. llms.txt — automatic (since 2026-07-11)

`build.py` generates `llms.txt` from `_src/llms-template.txt` (hand-maintained non-blog sections) + one line per post. The per-post description comes from the post's `llms_description` YAML field, falling back to `meta_description`. Set `llms_description` in the post's `content.yaml` if you want the llms.txt line to differ from the meta description.

### 7. Build and push

```bash
cd /Users/fox296/Desktop/entuned/website
python3 build.py
git add -A && git commit -m "Add blog post: Post Title" && git push origin main
```

### 8. Cross-post to Substack + Medium

Every new blog post ships a Substack-voice version to `entuned.substack.com`
AND a Medium cross-post (mandatory as of 2026-07-17, canonical-linked back
to entuned.co). Run the `substack-cross-post` skill — it owns the voice
rules, the `cross_post.py` orchestration (Medium runs by default), and the
Brave/CDP prereq. Don't duplicate those instructions here.

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
- **Avoid inline `style` attributes.** Use a class in `styles.css` or the page's `style.css` instead. Existing inline styles are technical debt — don't add more. **Do not mass-convert the existing ~1,000 inline styles to classes** (audited 2026-07-11): many sit on elements also matched by descendant rules (`.feature-row-text p`, page-level `p` rules, etc.) that inline styles currently out-rank but a single class would lose to — a mechanical sweep silently reflows typography. Convert opportunistically, page by page, checking the cascade.
- **All `<img>` tags need descriptive `alt` text.** Never use `alt=""` on content images.
- **Images must be under 500KB.** Compress before committing with `sips --resampleWidth 1600 -s format jpeg -s formatOptions 80`.
