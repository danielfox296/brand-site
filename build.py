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
import sys
import json
import glob
import re
import html as html_mod

REPO     = os.path.dirname(os.path.abspath(__file__))
SRC      = os.path.join(REPO, '_src')
LAYOUTS  = os.path.join(SRC, 'layouts')
PARTIALS = os.path.join(SRC, 'partials')
PAGES    = os.path.join(SRC, 'pages')
SITE_URL = 'https://entuned.co'

# ---------------------------------------------------------------------------
# New blog renderer (Jinja2 + YAML pipeline)
# ---------------------------------------------------------------------------
# These imports are deferred so the existing build still works even when
# jinja2/markdown/pyyaml are not installed — they're only needed when a
# new-format blog post is encountered or --lint is used.

_blog_renderer = None   # lazy-loaded module reference
_jinja_env = None       # lazy-loaded Jinja2 Environment


def _ensure_blog_renderer():
    """Lazy-import the blog renderer and its dependencies.

    Returns (blog_renderer_module, jinja_env) or raises ImportError
    with a helpful install message.
    """
    global _blog_renderer, _jinja_env
    if _blog_renderer is not None:
        return _blog_renderer, _jinja_env

    # Make _src importable
    if REPO not in sys.path:
        sys.path.insert(0, REPO)

    try:
        from _src.lib import blog_renderer as br
        from _src.lib import reading_time  # noqa: F401 — validates import
    except ImportError as e:
        raise ImportError(
            f"Blog renderer dependency missing: {e}\n"
            "Install with: pip install jinja2 markdown pyyaml"
        ) from e

    templates_dir = os.path.join(SRC, 'templates')
    _blog_renderer = br
    _jinja_env = br.create_jinja_env(templates_dir)
    return _blog_renderer, _jinja_env


def _is_new_format_blog(page_path: str) -> bool:
    """Check if a page directory contains a new-format blog content.yaml."""
    yaml_path = os.path.join(page_path, 'content.yaml')
    if not os.path.exists(yaml_path):
        return False
    try:
        br, _ = _ensure_blog_renderer()
        return br.is_new_format(yaml_path)
    except ImportError:
        return False


def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def parse_simple_yaml(text):
    """Parse the subset of YAML used by content files (no PyYAML needed).
    Supports: nested string maps (key: value, with indented children)."""
    root = {}
    stack = [(root, -1)]  # (dict, indent_level)

    for raw_line in text.split('\n'):
        stripped = raw_line.strip()
        if not stripped or stripped.startswith('#'):
            continue

        indent = len(raw_line) - len(raw_line.lstrip())

        if ':' in stripped:
            k, v = stripped.split(':', 1)
            k = k.strip()
            v = v.strip()

            # Pop stack back to correct parent
            while len(stack) > 1 and stack[-1][1] >= indent:
                stack.pop()

            parent = stack[-1][0]

            if v:
                # Strip quotes and unescape
                if v.startswith('"') and v.endswith('"'):
                    v = v[1:-1].replace('\\"', '"')
                elif v.startswith("'") and v.endswith("'"):
                    v = v[1:-1]
                parent[k] = v
            else:
                # Nested map
                child = {}
                parent[k] = child
                stack.append((child, indent))

    return root


def resolve_content(template, data):
    """Replace {{content.x.y}} placeholders with values from data dict."""
    if not data:
        return template

    def replace_placeholder(m):
        path = m.group(1).strip()
        obj = data
        for key in path.split('.'):
            if isinstance(obj, dict):
                obj = obj.get(key)
            else:
                return m.group(0)
        return str(obj) if obj is not None else m.group(0)

    return re.sub(r'\{\{(content\.[\w.]+)\}\}', replace_placeholder, template)


def collect_sections(sections_dir):
    """Collect section files from a directory in alphabetical order."""
    files = sorted(glob.glob(os.path.join(sections_dir, '*.html')))
    return files


def lint():
    """Validate all new-format blog posts without generating HTML.

    Prints errors and warnings.  Returns True if all posts pass
    (warnings are OK), False if any errors were found.
    """
    br, _ = _ensure_blog_renderer()

    print('Linting new-format blog posts...\n')
    total_errors = []
    total_warnings = []

    for entry in sorted(os.listdir(PAGES)):
        if not entry.startswith('blog-'):
            continue
        page_path = os.path.join(PAGES, entry)
        yaml_path = os.path.join(page_path, 'content.yaml')
        if not os.path.exists(yaml_path):
            continue
        if not br.is_new_format(yaml_path):
            continue

        data = br.load_post(yaml_path)
        errors, warnings = br.validate_post(data, yaml_path)

        for w in warnings:
            print(f'  ⚠ {w}')
            total_warnings.append(w)
        for e in errors:
            print(f'  ✗ {e}')
            total_errors.append(e)

        if not errors and not warnings:
            print(f'  ✓ {entry}')
        elif not errors:
            print(f'  ✓ {entry} (with warnings)')

    print(f'\nLint complete: {len(total_errors)} error(s), {len(total_warnings)} warning(s).')

    if total_errors:
        print('\nLint FAILED — fix errors before building.')
        return False
    return True


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

        # ---------------------------------------------------------------
        # NEW-FORMAT BLOG POST DETECTION
        # If this page has a new-format content.yaml (with sections array),
        # render it through the Jinja2 blog pipeline instead of the old
        # section-file pipeline.  Old-format posts fall through untouched.
        # ---------------------------------------------------------------
        output_check = config.get('output', f'{page_name}.html')
        use_new_renderer = (
            output_check.startswith('blog/')
            and _is_new_format_blog(page_path)
        )

        if use_new_renderer:
            # --- New blog renderer path ---
            br, env = _ensure_blog_renderer()
            all_posts = br.collect_all_post_frontmatter(PAGES)

            try:
                content_html, post_data = br.render_post(page_path, env, all_posts)
            except (ValueError, FileNotFoundError) as exc:
                print(f'  ✗ {output_check} — {exc}')
                raise SystemExit(1)

            # Pull metadata from the YAML frontmatter
            title = post_data.get('title', config.get('title', 'Entuned'))
            if not title.endswith('— Entuned Blog'):
                title = f"{title} — Entuned Blog"
            description = post_data.get('meta_description',
                                        config.get('meta_description', ''))
            output      = output_check
            nav_prefix  = '../'
            css_path    = nav_prefix
            content     = content_html

            # Store new-format post data for RSS generation later
            if not hasattr(build, '_new_format_posts'):
                build._new_format_posts = []
            build._new_format_posts.append(post_data)

        else:
            # --- Original pipeline (unchanged) ---
            title       = config.get('title', 'Entuned')
            description = config.get('description', '') or config.get('meta_description', '')
            output      = config.get('output', f'{page_name}.html')

            # Determine nav_prefix based on output depth
            depth = output.count('/')
            nav_prefix = '../' * depth
            css_path = nav_prefix

            # Assemble content from sections in order
            sections_dir  = os.path.join(page_path, 'sections')
            if os.path.isdir(sections_dir):
                section_files = collect_sections(sections_dir)
                content = '\n\n'.join(read(f).strip() for f in section_files)
            else:
                content = ''

            # Apply content.yaml substitutions (if present)
            content_yaml_path = os.path.join(page_path, 'content.yaml')
            if os.path.exists(content_yaml_path):
                yaml_data = parse_simple_yaml(read(content_yaml_path))
                content = resolve_content(content, {'content': yaml_data})

        # ---------------------------------------------------------------
        # SHARED LAYOUT ASSEMBLY (both old and new pipelines converge)
        # ---------------------------------------------------------------

        # Robots meta tag
        robots_value = config.get('robots', 'index, follow')

        # Meta description tag
        meta_desc = ''
        if description:
            safe_desc = html_mod.escape(description, quote=True)
            meta_desc = f'<meta name="description" content="{safe_desc}">'

        # Load page-specific CSS
        style_path = os.path.join(page_path, 'style.css')
        page_style = ''
        if os.path.exists(style_path):
            css_content = read(style_path).strip()
            if css_content:
                page_style = f'<style>\n{css_content}\n  </style>'

        # New-format blog posts need the blog.css stylesheet
        if use_new_renderer:
            blog_css_link = f'<link rel="stylesheet" href="{css_path}styles/blog.css">'
            page_style = blog_css_link + '\n  ' + page_style

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

        # OG image — check new-format YAML first, then config.json
        og_image = f'{SITE_URL}/img/og-default.png'
        _og_from_yaml = post_data.get('og_image', '') if use_new_renderer else ''
        if _og_from_yaml:
            og_image = _og_from_yaml if _og_from_yaml.startswith('http') else f'{SITE_URL}/{_og_from_yaml.lstrip("/")}'
        elif config.get('og_image'):
            og_image = config['og_image'] if config['og_image'].startswith('http') else f'{SITE_URL}/{config["og_image"]}'
        elif is_blog:
            slug = output.replace('blog/', '').replace('.html', '')
            for ext in ['jpg', 'png']:
                img_path = os.path.join(REPO, 'img', 'blog', f'{slug}.{ext}')
                if os.path.exists(img_path):
                    og_image = f'{SITE_URL}/img/blog/{slug}.{ext}'
                    break

        # Build OG tags (escape user-provided strings)
        safe_og_title = html_mod.escape(og_title, quote=True)
        safe_og_desc  = html_mod.escape(description, quote=True)
        og_tags = '\n  '.join([
            f'<meta property="og:title" content="{safe_og_title}">',
            f'<meta property="og:description" content="{safe_og_desc}">',
            f'<meta property="og:url" content="{canonical_url}">',
            f'<meta property="og:type" content="{og_type}">',
            f'<meta property="og:image" content="{og_image}">',
            f'<meta property="og:site_name" content="Entuned">',
            f'<meta property="og:locale" content="en_US">',
        ])

        if is_blog:
            # For new-format posts, dates come from YAML; for old, from config.json
            if use_new_renderer:
                _pub_time = post_data.get('date', '2026-03-25')
                _author_name = post_data.get('author', {}).get('name', 'Daniel Fox') if isinstance(post_data.get('author'), dict) else 'Daniel Fox'
            else:
                _pub_time = config.get('date_published', '2026-03-25')
                _author_name = 'Daniel Fox'
            og_tags += '\n  ' + f'<meta property="article:published_time" content="{_pub_time}">'
            og_tags += '\n  ' + f'<meta property="article:author" content="{_author_name}">'

        # Build Twitter Card tags
        twitter_tags = '\n  '.join([
            f'<meta name="twitter:card" content="summary_large_image">',
            f'<meta name="twitter:title" content="{safe_og_title}">',
            f'<meta name="twitter:description" content="{safe_og_desc}">',
            f'<meta name="twitter:image" content="{og_image}">',
        ])

        # Build JSON-LD schema
        if is_blog:
            if use_new_renderer:
                date_published = post_data.get('date', '2026-03-25')
                date_modified = post_data.get('last_updated', date_published)
            else:
                date_published = config.get('date_published', '2026-03-25')
                date_modified = config.get('date_modified', '2026-03-25')
            _schema_author = _author_name
            schema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": og_title,
                "author": {
                    "@type": "Person",
                    "name": _schema_author
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Entuned",
                    "url": SITE_URL
                },
                "datePublished": date_published,
                "dateModified": date_modified,
                "description": description,
                "image": og_image,
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
                "foundingDate": "2026",
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

        # BreadcrumbList schema — all pages except homepage
        if output != 'index.html':
            # Build breadcrumb items
            crumbs = [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/"}]

            if is_blog:
                crumbs.append({"@type": "ListItem", "position": 2, "name": "Blog", "item": SITE_URL + "/blog.html"})
                crumbs.append({"@type": "ListItem", "position": 3, "name": og_title})
            elif output.startswith('for-'):
                crumbs.append({"@type": "ListItem", "position": 2, "name": "For Your Industry", "item": SITE_URL + "/for-apparel.html"})
                # Determine industry name from output
                industry_names = {
                    'for-apparel.html': 'Apparel',
                    'for-cosmetics.html': 'Cosmetics',
                    'for-home-goods.html': 'Home Goods',
                    'for-cfos.html': 'For CFOs',
                    'for-retail-leaders.html': 'For Retail Leaders'
                }
                industry_name = industry_names.get(output, og_title)
                crumbs.append({"@type": "ListItem", "position": 3, "name": industry_name})
            else:
                crumbs.append({"@type": "ListItem", "position": 2, "name": og_title})

            breadcrumb_schema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": crumbs
            }
            schema_json += f'\n  <script type="application/ld+json">\n{json.dumps(breadcrumb_schema, indent=2)}\n  </script>'

        # Service schema for key product pages
        if output in ('how-it-works.html', 'pilot.html'):
            service_schema = {
                "@context": "https://schema.org",
                "@type": "Service",
                "name": "Entuned Retail Music Optimization",
                "provider": {
                    "@type": "Organization",
                    "name": "Entuned",
                    "url": SITE_URL
                },
                "description": "AI-generated music engineered for retail customer psychology. Original compositions mapped to behavioral outcomes using proprietary Flow Factors framework.",
                "serviceType": "Retail Audio Optimization",
                "areaServed": "US",
                "offers": {
                    "@type": "Offer",
                    "name": "90-Day Pilot Program",
                    "price": "0",
                    "priceCurrency": "USD",
                    "description": "Free 90-day pilot with behavioral measurement and ROI analysis"
                }
            }
            schema_json += f'\n  <script type="application/ld+json">\n{json.dumps(service_schema, indent=2)}\n  </script>'

        # Substitute into base layout
        html = base
        html = html.replace('{{title}}',            title)
        html = html.replace('{{robots}}',           robots_value)
        html = html.replace('{{meta_description}}', meta_desc)
        html = html.replace('{{canonical_url}}',    canonical_url)
        html = html.replace('{{css_path}}',         css_path)
        html = html.replace('{{page_style}}',       page_style)
        # Add RSS autodiscovery link
        og_tags = f'<link rel="alternate" type="application/rss+xml" title="Entuned Blog" href="{css_path}rss.xml">\n  ' + og_tags

        html = html.replace('{{og_tags}}',          og_tags)
        html = html.replace('{{twitter_tags}}',     twitter_tags)
        html = html.replace('{{schema_json}}',      schema_json)
        html = html.replace('{{header}}',           page_header)
        html = html.replace('{{content}}',          content)
        html = html.replace('{{footer}}',           page_footer)

        # Write output file (validate path stays within repo)
        out_path = os.path.join(REPO, output)
        if not os.path.abspath(out_path).startswith(os.path.abspath(REPO)):
            print(f'  ✗ SKIPPED {output} — path escapes repo root')
            continue
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)

        pages_built.append(output)
        print(f'  ✓ {output}')

    print(f'\nBuilt {len(pages_built)} pages.')

    # --- Generate RSS Feed ---
    print('\nGenerating RSS feed...')
    import datetime

    rss_items = []
    # Track slugs already added by the new renderer to avoid duplicates
    new_format_slugs = set()
    if hasattr(build, '_new_format_posts'):
        for post_data in build._new_format_posts:
            slug = post_data.get('slug', '')
            new_format_slugs.add(slug)

            rss_title = post_data.get('title', 'Entuned')
            rss_desc = post_data.get('meta_description', post_data.get('dek', ''))
            rss_date = post_data.get('date', '2026-03-25')
            rss_link = f'{SITE_URL}/blog/{slug}.html'

            try:
                dt = datetime.datetime.strptime(rss_date, '%Y-%m-%d')
                pub_date = dt.strftime('%a, %d %b %Y 00:00:00 +0000')
            except Exception:
                pub_date = 'Tue, 25 Mar 2026 00:00:00 +0000'

            rss_items.append({
                'title': rss_title,
                'link': rss_link,
                'description': rss_desc,
                'pubDate': pub_date,
                'date_sort': rss_date,
            })

    # Old-format posts (from config.json)
    for page_path in sorted(page_dirs):
        config_path = os.path.join(page_path, 'config.json')
        config = json.loads(read(config_path))
        if config.get('skip'):
            continue
        output = config.get('output', '')
        if not output.startswith('blog/'):
            continue

        # Skip if this post was already added by the new renderer
        old_slug = output.replace('blog/', '').replace('.html', '')
        if old_slug in new_format_slugs:
            continue

        title = config.get('title', 'Entuned')
        # Clean title
        for suffix in [' — Entuned Blog', ' — Entuned']:
            if title.endswith(suffix):
                title = title[:-len(suffix)]
                break

        description = config.get('description', '') or config.get('meta_description', '')
        date_published = config.get('date_published', '2026-03-25')
        link = f'{SITE_URL}/{output}'

        # Convert date to RFC 822 format
        try:
            dt = datetime.datetime.strptime(date_published, '%Y-%m-%d')
            pub_date = dt.strftime('%a, %d %b %Y 00:00:00 +0000')
        except:
            pub_date = 'Tue, 25 Mar 2026 00:00:00 +0000'

        rss_items.append({
            'title': title,
            'link': link,
            'description': description,
            'pubDate': pub_date,
            'date_sort': date_published
        })

    # Sort by date descending
    rss_items.sort(key=lambda x: x['date_sort'], reverse=True)

    # Build RSS XML
    rss_xml = '''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Entuned Blog — Retail Music Strategy</title>
  <link>{site_url}/blog.html</link>
  <description>Research-backed insights on retail music strategy, in-store customer behavior, and AI-powered audio optimization.</description>
  <language>en-us</language>
  <atom:link href="{site_url}/rss.xml" rel="self" type="application/rss+xml"/>
'''.format(site_url=SITE_URL)

    for item in rss_items[:20]:  # Last 20 posts
        # Escape XML special chars in description
        desc = item['description'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        title = item['title'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        rss_xml += f'''  <item>
    <title>{title}</title>
    <link>{item['link']}</link>
    <description>{desc}</description>
    <pubDate>{item['pubDate']}</pubDate>
    <guid>{item['link']}</guid>
  </item>
'''

    rss_xml += '''</channel>
</rss>'''

    rss_path = os.path.join(REPO, 'rss.xml')
    with open(rss_path, 'w', encoding='utf-8') as f:
        f.write(rss_xml)
    print('  ✓ rss.xml')


if __name__ == '__main__':
    if '--lint' in sys.argv:
        print('Entuned — Lint mode\n')
        ok = lint()
        sys.exit(0 if ok else 1)
    else:
        print('Building Entuned...\n')
        build()
        print('\nDone.')
