# Entuned Website — Architecture

**This is a modular static site generator. Do NOT edit the HTML files directly.**

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
    index/                  ← One directory per page
      config.json           ← Title, output filename
      style.css             ← Page-specific CSS (optional)
      sections/
        01-content.html     ← Page body content
    how-it-works/
    science/
    blog/                   ← Blog index page
    investors/
    download/
    blog-<slug>/            ← Individual blog posts (output to blog/<slug>.html)

build.py                    ← The build script (pure Python, no dependencies)
styles.css                  ← Global stylesheet (NOT generated — edit directly)
img/                        ← Static images (NOT generated — edit directly)
```

## Key rules

- **Never edit root-level .html files** — they get overwritten by `build.py`
- **To change nav or footer**: edit `_src/partials/header.html` or `footer.html`, then rebuild
- **To add a page**: create a new directory in `_src/pages/` with `config.json` and `sections/`
- **To add a blog post**: create `_src/pages/blog-<slug>/` with config output set to `blog/<slug>.html`
- **Global CSS** lives in `styles.css` at the repo root (not inside `_src/`)
- **Page-specific CSS** goes in `_src/pages/<name>/style.css` — injected as inline `<style>`

## Blog posts

Blog posts live in `_src/pages/blog-<slug>/`. Their `config.json` sets `"output": "blog/<slug>.html"`. The build script automatically adjusts all nav/footer links to use `../` so relative paths work from the subdirectory.

## Deploy

GitHub Actions runs `python3 build.py` then deploys to GitHub Pages. The player app (separate repo: `entuned-player`) gets built and dropped into `/play/`. See `.github/workflows/deploy.yml`.
