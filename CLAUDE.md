# Entuned Website — Claude Code Instructions

Read `ARCHITECTURE.md` for the full site structure, design system, and build process. Root-level rules and the memory policy live in `../CLAUDE.md` — unstamped claims are drafts.

## Quick Reference

- **Working directory:** `/Users/fox296/Desktop/entuned/website`
- **Build:** `python3 build.py` (pure Python, no deps)
- **Deploy:** `git add -A && git commit -m "message" && git push origin main` (GitHub Actions deploys to GitHub Pages)
- **Remote:** `danielfox296/brand-site` · **Domain:** entuned.co

## ⚠️ Hard rule: no raw HTML

Never create `.html` files directly in the repo root or `blog/`. Every output file comes from `_src/pages/<name>/`. Redirects too — a `blog-redirect-<slug>/config.json` with a `redirect_to` field (see `ARCHITECTURE.md` for the stub schema). If you write `<!DOCTYPE html>` outside `_src/layouts/base.html`, you're doing it wrong.

## Hard term bans (any user-facing copy)

**Read `../VOICE.md` and run `/terminology-check` before pushing any copy** — these bans are a subset of what that skill lints.

- **No "AI"** in page titles or heros. Category term is **"retail music strategy"**.
- **No "Essentials"** — the free tier is **"Entuned Free"**. **No "Core"** — the mid tier is **"Boost"**. (DB values stay `free`/`core` server-side; invisible to the site.)
- **No "zones"** — not a product concept.
- **No "day-parting"** except the single allowed explainer "like day-parting, but better". Use **"Outcome Scheduling"** everywhere else.

## Pricing CTA topology — locked plumbing, Free-first hierarchy

The CTA flow is intentionally asymmetric. Don't "fix" it by sending every tier through the same path.

| Path | CTA destination | Why |
|---|---|---|
| **Entuned Free** | `https://app.entuned.co/start` | **Primary CTA site-wide (Daniel, 2026-07-11): lead people to the listen-now path.** Self-onboard, no card. |
| Boost / Pro | Direct Stripe Checkout | Skip the dashboard intermediate; reduce friction. |
| Multi-location pilot | `pilot.html` → `contact.html?topic=pilot` | Secondary door on buyer-intent surfaces. 5–50-door specialty retail; founder-led. |
| Enterprise | `contact.html?topic=enterprise` | >50 doors. High-touch, inbound only. |

Start Free is primary on every surface; the pilot stays live as the secondary CTA on buyer-intent surfaces (homepage, pricing, verticals, for-retail-leaders, for-cfos) — don't remove it, and don't add a "pick a tier" selector. Pilot CTA copy is "Start the pilot conversation" — never the old "Ask About a Pilot Program" phrasings. History: `../projects/icp-v2-routing/SSOT.md`.

## Vertical pages — all live, all indexed, don't delete

The `for-<vertical>.html` family (apparel, beauty-supply, cosmetics, furniture-mattress, home-goods, jewelry, specialty-retail, sporting-goods) are all fully built, `index, follow`, and linked site-wide from the footer's "For Your Industry" list. Don't 410, delete, redirect, or treat any of them as a stub. Each vertical's `related.others` line cross-links to **all** other verticals (alphabetical, labels matching the footer) — keep that complete when adding one. Blog verticals are deliberately wider than the sales ICP (see `../marketing/blog/GEO-SEO-EXPANSION.md`).

## Video posts must stay watch pages

Posts with a `video:` block are **watch pages** — the player IS the page, and its render state is load-bearing SEO. Invariants (each one has broken indexing before; GSC validation last restarted 2026-08-03):

- **Never add `fade-up` or `loading="lazy"` to the video block** (`_src/templates/blocks/video.html`). The player must be opaque and loaded at first paint — crawlers don't scroll.
- **Keep the player first** — directly under the byline, above hero image and takeaways; the hero `<img>` is suppressed on video posts. Don't reintroduce it or push the player down.
- **VideoObject owns `mainEntityOfPage`** (with `@id` + `url`); the Article must NOT also claim it. Two claims and Google picks Article.
- **No `contentUrl`** — we host no media file. `embedUrl` alone is correct for an embed.
- **`embedUrl` must byte-match the iframe src** in `blocks/video.html` — host and params (`youtube-nocookie.com/embed/<id>?rel=0&enablejsapi=1`). Change the two together, always, or GSC flags "Multiple video URLs".
- **Clip `url`s point at this page with `?t=<seconds>`**, never at YouTube. Chapter links stay internal.
- **Auto-extracted FAQPage is suppressed** on video posts — no third competing claim.

If the Videos report regresses: check these render facts first, then GSC URL inspection → Video indexing ("Is on a watch page?" and "Multiple video URLs" are the diagnostics that name the cause). GSC using YouTube's thumbnail instead of ours is normal, not a defect.

## ICP discipline before new pages

- **ICP v2: the sales target is multi-location specialty retail, 5–50 doors; single-store stays self-serve.** Read `../marketing/ICP/SSOT.md` before writing any new vertical/landing page or outreach copy.
- **Run `/outreach-precheck` first** when the task is target selection or angle picking. Target selection comes *before* drafting.
- **Run `/adversarial` before publishing** any change to strategic surfaces: pricing copy, positioning, vertical pages, founder writing, blog posts, investor narrative.

## Order of gates on a user-facing push

1. Edit `_src/` source → 2. `python3 build.py` → 3. `/terminology-check` → 4. `/adversarial` if the surface is strategic → 5. `git add -A && git commit && git push origin main`

## Content Editing (YAML Layer)

Every page has a `content.yaml` alongside its HTML sections. **Edit the YAML, not the HTML.**

- Content: `_src/pages/<page-name>/content.yaml`; templates use `{{content.key}}` placeholders — no raw text in templates
- After any content edit: `python3 build.py` before committing
- how-it-works uses nested keys (`content.hero.headline`); all other pages flat sequential keys (`content.h1_1`, `content.p_3`)
- Inline HTML (links, `<span>`, `<strong>`) inside YAML values is intentional
- Read all site copy at once: `grep -r "" _src/pages/*/content.yaml`

## Publishing a blog post

**The `substack-cross-post` skill owns this workflow end-to-end** — YAML template, voice rules, hero image, cross-posting. Use it. Canonical facts the skill relies on:

- **YAML only, never HTML.** Every post is `blog-<slug>/config.json` + `content.yaml` with body blocks (`type: heading` / `paragraph` / `cta` …). The old `sections/01-content.html` pattern is retired.
- **Title suffix:** don't append one — the build normalizes every title to `" | Entuned"`.
- **Every post ends with the canonical Start Free CTA** (`type: cta`, `variant: start-free`, link `https://app.entuned.co/start`) — verbatim, never a custom blurb:
  > Entuned engineers original music for your store at the parameter level — tempo, key, lyrical density, energy arc — tailored to your customer and tied to your sales outcomes. Entuned Free &mdash; no card, no time limit. PRO-indemnified the moment it plays.
- **Also required per post:** TL;DR takeaway box first, h2 sections (never `<hr>`), byline + author bio, related-reading links to 2-3 other posts, listing card in `_src/pages/blog/sections/01-content.html` (newest high).
- **Hero image:** `img/blog/<name>.jpg`, max 500KB / 1600px wide (`sips --resampleWidth 1600 -s format jpeg -s formatOptions 80`), no portrait faces, check md5 against existing.
- **sitemap.xml and llms.txt are generated by `build.py`** — never edit by hand. Per-post llms line comes from `llms_description` YAML, falling back to `meta_description`.
- **Every post cross-posts to Substack AND Medium** (canonical-linked back). The skill owns the mechanics.

## Content Rules

- Read `../VOICE.md` before writing copy. Lead with outcomes, not technology.
- Read `../brain.md` for product details and competitive landscape. (Ratified-only doc — never write to it.)
- Only edit source in `_src/`, `styles.css`, or static assets. Never edit built HTML.

## CSS Rules

- **Use CSS custom properties** — `var(--accent)`, `var(--text)`, `var(--bg)` from `:root` in `styles.css`; no hardcoded hex in page CSS.
- **Never override global class names in page CSS.** Variants get a prefix (`.cfo-hero`, not `.hero-alt`) — see `for-cfos/style.css`.
- **Avoid inline `style` attributes** — but **do not mass-convert the existing ~1,000 inline styles to classes** (audited 2026-07-11): many out-rank descendant rules that a single class would lose to; a mechanical sweep silently reflows typography. Convert opportunistically, page by page, checking the cascade.
- **All `<img>` need descriptive `alt`**; never `alt=""` on content images. **Images under 500KB.**
