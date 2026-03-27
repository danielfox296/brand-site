#!/usr/bin/env python3
"""
Entuned — Site Builder
======================
Assembles static HTML pages from modular source files.

Usage:
    python3 build.py

Structure:
    _src/
      layouts/base.html       — HTML shell template
      partials/header.html    — shared nav (edit once, updates everywhere)
      partials/footer.html    — shared footer
      pages/
        <page-name>/
          config.json         — title, description, output path, etc.
          style.css           — page-specific CSS (optional)
          sections/           — content modules in alphabetical order
            01-hero.html
            02-section.html
            ...

Output:
    Root-level HTML files (index.html, how-it-works.html, etc.)
    blog/ subdirectory for blog posts

Notes:
    - Section files are plain HTML (no Markdown dependency needed)
    - Blog posts use output paths like "blog/slug.html" and get
      adjusted nav_prefix ("../") so relative links work
    - Page-specific CSS is injected as an inline <style> block
"""

import os
import json
import glob

REPO     = os.path.dirname(os.path.abspath(__file__))
SRC      = os.path.join(REPO, '_src')
LAYOUTS  = os.path.join(SRC, 'layouts')
PARTIALS = os.path.join(SRC, 'partials')
PAGES    = os.path.join(SRC, 'pages')
SITE_URL = 'https://entuned.co'


def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def collect_sections(sections_dir):
    """Collect section files from a directory in alphabetical order."""
    files = sorted(glob.glob(os.path.join(sections_dir, '*.html')))
    return files


def build():
    # Load shared pieces
    base   = read(os.path.join(LAYOUTS,  'base.html'))
    header = read(os.path.join(PARTIALS, 'header.html'))
    footer = read(os.path.join(PARTIALS, 'footer.html'))

    pages_built = []

    # Find all page directories (supports nested: pages/blog-posts/slug/)
    page_dirs = []
    for root, dirs, files in os.walk(PAGES):
        if 'config.json' in files:
            page_dirs.append(root)

    for page_path in sorted(page_dirs):
        page_name = os.path.relpath(page_path, PAGES)

        config_path = os.path.join(page_path, 'config.json')
        config      = json.loads(read(config_path))

        if config.get('skip'):
            continue

        title       = config.get('title', 'Entuned')
        description = config.get('description', '') or config.get('meta_description', '')
        output      = config.get('output', f'{page_name}.html')

        # Determine nav_prefix based on output depth
        # Root pages (index.html) → ""
        # Blog posts (blog/slug.html) → "../"
        depth = output.count('/')
        nav_prefix = '../' * depth

        # CSS path prefix (same logic)
        css_path = nav_prefix

        # Robots meta tag
        robots_value = config.get('robots', 'index, follow')

        # Meta description tag
        meta_desc = ''
        if description:
            meta_desc = f'<meta name="description" content="{description}">'

        # Load page-specific CSS
        style_path = os.path.join(page_path, 'style.css')
        page_style = ''
        if os.path.exists(style_path):
            css_content = read(style_path).strip()
            if css_content:
                page_style = f'<style>\n{css_content}\n  </style>'

        # Assemble content from sections in order
        sections_dir  = os.path.join(page_path, 'sections')
        if os.path.isdir(sections_dir):
            section_files = collect_sections(sections_dir)
            content = '\n\n'.join(read(f).strip() for f in section_files)
        else:
            content = ''

        # Apply nav_prefix to header and footer
        page_header = header.strip().replace('{{nav_prefix}}', nav_prefix)
        page_footer = footer.strip().replace('{{nav_prefix}}', nav_prefix)

        # Compute canonical URL
        if output == 'index.html':
            canonical_url = f'{SITE_URL}/'
        else:
            canonical_url = f'{SITE_URL}/{output}'

        # Determine if blog post
        is_blog = output.startswith('blog/')

        # Clean title for OG/schema (strip suffixes)
        og_title = title
        for suffix in [' — Entuned Blog', ' — Entuned']:
            if og_title.endswith(suffix):
                og_title = og_title[:-len(suffix)]
                break

        # OG type
        og_type = 'article' if is_blog else 'website'

        # OG image
        og_image = f'{SITE_URL}/img/og-default.png'
        if config.get('og_image'):
            og_image = config['og_image'] if config['og_image'].startswith('http') else f'{SITE_URL}/{config["og_image"]}'
        elif is_blog:
            slug = output.replace('blog/', '').replace('.html', '')
            for ext in ['jpg', 'png']:
                img_path = os.path.join(REPO, 'img', 'blog', f'{slug}.{ext}')
                if os.path.exists(img_path):
                    og_image = f'{SITE_URL}/img/blog/{slug}.{ext}'
                    break

        # Build OG tags
        og_tags = '\n  '.join([
            f'<meta property="og:title" content="{og_title}">',
            f'<meta property="og:description" content="{description}">',
            f'<meta property="og:url" content="{canonical_url}">',
            f'<meta property="og:type" content="{og_type}">',
            f'<meta property="og:image" content="{og_image}">',
            f'<meta property="og:site_name" content="Entuned">',
        ])

        # Build Twitter Card tags
        twitter_tags = '\n  '.join([
            f'<meta name="twitter:card" content="summary_large_image">',
            f'<meta name="twitter:title" content="{og_title}">',
            f'<meta name="twitter:description" content="{description}">',
            f'<meta name="twitter:image" content="{og_image}">',
        ])

        # Build JSON-LD schema
        if is_blog:
            date_published = config.get('date_published', '2026-03-25')
            date_modified = config.get('date_modified', '2026-03-25')
            schema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": og_title,
                "author": {
                    "@type": "Person",
                    "name": "Daniel Fox"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Entuned",
                    "url": SITE_URL
                },
                "datePublished": date_published,
                "dateModified": date_modified,
                "description": description,
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": canonical_url
                },
                "about": [
                    {"@type": "Thing", "name": "retail music strategy"},
                    {"@type": "Thing", "name": "in-store customer behavior"},
                    {"@type": "Thing", "name": "AI-powered retail music optimization"}
                ]
            }
        else:
            schema = {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Entuned",
                "url": SITE_URL,
                "description": "Entuned maps musical flow factors to verified retail behavioral outcomes using AI-generated music, turning in-store sound into a measurable performance channel.",
                "foundingDate": "2025",
                "founder": {
                    "@type": "Person",
                    "name": "Daniel Fox"
                },
                "knowsAbout": [
                    "retail atmospherics",
                    "music psychology",
                    "generative AI music",
                    "in-store customer behavior",
                    "retail analytics",
                    "AI-powered retail music optimization"
                ],
                "sameAs": [
                    "https://www.linkedin.com/company/entuned"
                ]
            }

        schema_json = f'<script type="application/ld+json">\n{json.dumps(schema, indent=2)}\n  </script>'

        # WebSite schema — added to homepage only
        if output == 'index.html':
            website_schema = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Entuned",
                "url": SITE_URL,
                "description": "AI-powered retail music optimization backed by music psychology research.",
                "publisher": {
                    "@type": "Organization",
                    "name": "Entuned"
                }
            }
            schema_json += f'\n  <script type="application/ld+json">\n{json.dumps(website_schema, indent=2)}\n  </script>'

        # FAQPage schema — if config has a 'faq' key with [{q, a}, ...] entries
        faq_items = config.get('faq', [])
        if faq_items:
            faq_schema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": item["q"],
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": item["a"]
                        }
                    }
                    for item in faq_items
                ]
            }
            schema_json += f'\n  <script type="application/ld+json">\n{json.dumps(faq_schema, indent=2)}\n  </script>'

        # Substitute into base layout
        html = base
        html = html.replace('{{title}}',            title)
        html = html.replace('{{robots}}',           robots_value)
        html = html.replace('{{meta_description}}', meta_desc)
        html = html.replace('{{canonical_url}}',    canonical_url)
        html = html.replace('{{css_path}}',         css_path)
        html = html.replace('{{page_style}}',       page_style)
        html = html.replace('{{og_tags}}',          og_tags)
        html = html.replace('{{twitter_tags}}',     twitter_tags)
        html = html.replace('{{schema_json}}',      schema_json)
        html = html.replace('{{header}}',           page_header)
        html = html.replace('{{content}}',          content)
        html = html.replace('{{footer}}',           page_footer)

        # Write output file
        out_path = os.path.join(REPO, output)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)

        pages_built.append(output)
        print(f'  ✓ {output}')

    print(f'\nBuilt {len(pages_built)} pages.')


if __name__ == '__main__':
    print('Building Entuned...\n')
    build()
    print('\nDone.')
