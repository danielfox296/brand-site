"""
Glossary auto-linker for Entuned blog posts.

Reads glossary.yaml and links the first occurrence of each proprietary
term in a post's prose/aside blocks. Subsequent mentions of the same
term within the same post are left unlinked.

Rules:
    - Case-insensitive matching
    - Whole-word boundaries only
    - Longest terms matched first (avoids partial matches)
    - Never links inside existing <a> tags or HTML tag attributes
    - Only first mention per post gets a link
"""

__all__ = ["load_glossary", "auto_link_glossary"]

import os
import re

# ---------------------------------------------------------------------------
# Glossary loading
# ---------------------------------------------------------------------------


def load_glossary(glossary_path: str) -> list:
    """Load glossary terms from a YAML file.

    Args:
        glossary_path: Absolute or relative path to glossary.yaml.

    Returns:
        List of dicts, each with keys: term, slug, aliases.
        Sorted longest-match-first for safe replacement ordering.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the YAML is malformed or missing required keys.
    """
    if not os.path.isfile(glossary_path):
        raise FileNotFoundError(f"Glossary file not found: {glossary_path}")

    try:
        import yaml
    except ImportError:
        raise ImportError(
            "PyYAML is required for glossary loading. "
            "Install it with: pip install pyyaml"
        )

    with open(glossary_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    if not isinstance(raw, list):
        raise ValueError(
            f"glossary.yaml must be a YAML list of term entries, "
            f"got {type(raw).__name__}"
        )

    glossary = []
    for entry in raw:
        if not isinstance(entry, dict):
            raise ValueError(f"Each glossary entry must be a dict, got: {entry!r}")
        if "term" not in entry or "slug" not in entry:
            raise ValueError(
                f"Glossary entry missing 'term' or 'slug': {entry!r}"
            )
        glossary.append(
            {
                "term": entry["term"],
                "slug": entry["slug"],
                "aliases": entry.get("aliases", []),
            }
        )

    # Build a flat list of (match_phrase, slug) sorted longest-first
    # This is stored on the list for use by auto_link_glossary
    return glossary


# ---------------------------------------------------------------------------
# Auto-linking
# ---------------------------------------------------------------------------

# Regex to find HTML tags (so we can skip them)
_TAG_RE = re.compile(r"<[^>]+>", re.DOTALL)

# Regex to find existing <a>...</a> spans (so we don't link inside them)
_LINK_RE = re.compile(r"<a\b[^>]*>.*?</a>", re.DOTALL | re.IGNORECASE)


def _build_match_pairs(glossary: list) -> list:
    """Build a flat list of (phrase, slug) pairs, sorted longest-first.

    Each term and its aliases all map to the same slug.
    """
    pairs = []
    for entry in glossary:
        pairs.append((entry["term"], entry["slug"]))
        for alias in entry.get("aliases", []):
            pairs.append((alias, entry["slug"]))
    # Sort longest-first to avoid partial matches
    pairs.sort(key=lambda p: len(p[0]), reverse=True)
    return pairs


def _find_safe_positions(html: str) -> list:
    """Find character ranges in the HTML that are safe to modify.

    Returns a list of (start, end) tuples representing text outside of
    HTML tags and existing <a> links.
    """
    # Collect all "unsafe" ranges: tags and existing links
    unsafe = []

    for m in _TAG_RE.finditer(html):
        unsafe.append((m.start(), m.end()))

    for m in _LINK_RE.finditer(html):
        unsafe.append((m.start(), m.end()))

    # Merge overlapping ranges
    unsafe.sort()
    merged = []
    for start, end in unsafe:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))

    # Invert to get safe ranges
    safe = []
    prev = 0
    for start, end in merged:
        if prev < start:
            safe.append((prev, start))
        prev = end
    if prev < len(html):
        safe.append((prev, len(html)))

    return safe


def _is_word_boundary(html: str, start: int, end: int) -> bool:
    """Check that the match at [start:end] is at whole-word boundaries."""
    # Check left boundary
    if start > 0:
        left_char = html[start - 1]
        if left_char.isalnum() or left_char == "-":
            return False
    # Check right boundary
    if end < len(html):
        right_char = html[end]
        if right_char.isalnum() or right_char == "-":
            return False
    return True


def auto_link_glossary(
    html: str,
    glossary: list,
    linked_terms: set = None,
) -> tuple:
    """Replace first occurrence of each glossary term with a link.

    Args:
        html:         HTML string (a prose or aside block body).
        glossary:     List of term dicts from load_glossary().
        linked_terms: Set of slugs already linked in this post.
                      Terms in this set will be skipped.

    Returns:
        Tuple of (modified_html, updated_linked_terms_set).
    """
    if linked_terms is None:
        linked_terms = set()
    else:
        linked_terms = set(linked_terms)  # copy to avoid mutating input

    match_pairs = _build_match_pairs(glossary)

    for phrase, slug in match_pairs:
        if slug in linked_terms:
            continue

        # Build a case-insensitive regex for this phrase, whole-word
        # Escape the phrase for regex, then wrap in word boundaries
        escaped = re.escape(phrase)
        pattern = re.compile(escaped, re.IGNORECASE)

        safe_ranges = _find_safe_positions(html)

        # Search for the first match within safe ranges
        found = False
        for safe_start, safe_end in safe_ranges:
            segment = html[safe_start:safe_end]
            m = pattern.search(segment)
            if m:
                abs_start = safe_start + m.start()
                abs_end = safe_start + m.end()

                if not _is_word_boundary(html, abs_start, abs_end):
                    # Try remaining matches in this segment
                    pos = m.end()
                    while pos < len(segment):
                        m2 = pattern.search(segment, pos)
                        if not m2:
                            break
                        abs_start = safe_start + m2.start()
                        abs_end = safe_start + m2.end()
                        if _is_word_boundary(html, abs_start, abs_end):
                            m = m2
                            found = True
                            break
                        pos = m2.end()
                    if not found:
                        continue
                    if not found:
                        continue
                else:
                    found = True

                if found:
                    matched_text = html[abs_start:abs_end]
                    link = (
                        f'<a href="/glossary#{slug}" '
                        f'class="glossary-term">{matched_text}</a>'
                    )
                    html = html[:abs_start] + link + html[abs_end:]
                    linked_terms.add(slug)
                    break

            # If no match in this safe range, try next
            continue

    return html, linked_terms
