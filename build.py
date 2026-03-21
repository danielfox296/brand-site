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
        description = config.get('description', '')
        output      = config.get('output', f'{page_name}.html')

        # Determine nav_prefix based on output depth
        # Root pages (index.html) → ""
        # Blog posts (blog/slug.html) → "../"
        depth = output.count('/')
        nav_prefix = '../' * depth

        # CSS path prefix (same logic)
        css_path = nav_prefix

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

        # Substitute into base layout
        html = base
        html = html.replace('{{title}}',            title)
        html = html.replace('{{meta_description}}', meta_desc)
        html = html.replace('{{css_path}}',         css_path)
        html = html.replace('{{page_style}}',       page_style)
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
