"""
OG image generator for Entuned blog posts.

Generates 1200x630 branded OG images using Pillow (PIL).
One template, every post -- no hand-designed one-offs.

Template layout:
    - 1200x630 px, dark background (#161613)
    - 4px gold bar, top-left, 120px wide
    - Eyebrow text: Inter, uppercase, gold, small
    - Headline: Manrope, ice text, large, wraps to 2-3 lines
    - "entuned" wordmark: bottom-right, muted

Requires: pip install Pillow
"""

__all__ = ["generate_og_image"]

import hashlib
import os
import textwrap

# -- Brand tokens -----------------------------------------------------------

_BG_COLOR = (22, 22, 19)  # #161613
_ICE_TEXT = (212, 225, 229)  # #d4e1e5
_GOLD = (215, 175, 116)  # #d7af74
_MUTED_ICE = (212, 225, 229, 128)  # #d4e1e5 at ~50% opacity

# -- Font loading -----------------------------------------------------------

_FONT_CACHE = {}


def _load_font(family: str, size: int):
    """Load a TrueType font, falling back gracefully if not found.

    Args:
        family: "Manrope" or "Inter"
        size: Font size in pixels.

    Returns:
        A PIL ImageFont instance.
    """
    from PIL import ImageFont

    cache_key = (family, size)
    if cache_key in _FONT_CACHE:
        return _FONT_CACHE[cache_key]

    # Common system font paths (macOS, Linux)
    search_names = {
        "Manrope": [
            "Manrope-Bold.ttf",
            "Manrope-ExtraBold.ttf",
            "Manrope-SemiBold.ttf",
            "Manrope-Regular.ttf",
            "Manrope.ttf",
        ],
        "Inter": [
            "Inter-Regular.ttf",
            "Inter-Medium.ttf",
            "Inter.ttf",
        ],
    }

    search_dirs = [
        "/System/Library/Fonts",
        "/System/Library/Fonts/Supplemental",
        "/Library/Fonts",
        os.path.expanduser("~/Library/Fonts"),
        "/usr/share/fonts/truetype",
        "/usr/share/fonts",
        "/usr/local/share/fonts",
    ]

    candidates = search_names.get(family, [f"{family}.ttf"])

    for directory in search_dirs:
        for name in candidates:
            path = os.path.join(directory, name)
            if os.path.isfile(path):
                try:
                    font = ImageFont.truetype(path, size)
                    _FONT_CACHE[cache_key] = font
                    return font
                except (OSError, IOError):
                    continue

    # Fallback: try loading by name (PIL will search system paths)
    for name in candidates:
        try:
            font = ImageFont.truetype(name, size)
            _FONT_CACHE[cache_key] = font
            return font
        except (OSError, IOError):
            continue

    # Final fallback: DejaVuSans or default
    fallback_names = ["DejaVuSans.ttf", "DejaVuSans-Bold.ttf", "Arial.ttf"]
    for fb in fallback_names:
        try:
            font = ImageFont.truetype(fb, size)
            print(
                f"Warning: Could not find {family} font. "
                f"Falling back to {fb}."
            )
            _FONT_CACHE[cache_key] = font
            return font
        except (OSError, IOError):
            continue

    print(
        f"Warning: Could not find {family} or any fallback TrueType font. "
        f"Using Pillow default bitmap font."
    )
    font = ImageFont.load_default()
    _FONT_CACHE[cache_key] = font
    return font


# -- Text wrapping ----------------------------------------------------------


def _wrap_title(title: str, max_chars: int = 25, max_lines: int = 3) -> list:
    """Wrap a title into lines, truncating if needed.

    Args:
        title: The full headline text.
        max_chars: Max characters per line.
        max_lines: Max number of lines.

    Returns:
        List of line strings.
    """
    lines = textwrap.wrap(title, width=max_chars)

    if len(lines) > max_lines:
        lines = lines[:max_lines]
        # Truncate last line with ellipsis
        last = lines[-1]
        if len(last) > max_chars - 3:
            last = last[: max_chars - 3]
        lines[-1] = last.rstrip() + "..."

    return lines


# -- Cache hash -------------------------------------------------------------


def _content_hash(title: str, eyebrow: str) -> str:
    """Generate a short hash from title + eyebrow for cache comparison."""
    content = f"{title}|{eyebrow}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]


# -- Public API -------------------------------------------------------------


def generate_og_image(
    title: str,
    eyebrow: str,
    output_path: str,
    cache_dir: str = None,
) -> str:
    """Generate a 1200x630 OG image for a blog post.

    Args:
        title:       The post headline.
        eyebrow:     Category label (e.g., "FLOW FACTORS").
        output_path: Where to write the final PNG.
        cache_dir:   Optional directory for caching. If provided and a cached
                     image with matching content hash exists, generation is
                     skipped.

    Returns:
        The output_path string.

    Raises:
        ImportError: If Pillow is not installed.
    """
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        raise ImportError(
            "Pillow is required for OG image generation. "
            "Install it with: pip install Pillow"
        )

    # -- Cache check --------------------------------------------------------
    content_h = _content_hash(title, eyebrow)

    if cache_dir:
        os.makedirs(cache_dir, exist_ok=True)
        cache_path = os.path.join(cache_dir, f"og-{content_h}.png")
        if os.path.isfile(cache_path):
            # Copy cached image to output path if different
            if os.path.abspath(cache_path) != os.path.abspath(output_path):
                import shutil

                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                shutil.copy2(cache_path, output_path)
            return output_path

    # -- Generate image -----------------------------------------------------
    img = Image.new("RGB", (1200, 630), _BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Load fonts
    font_headline = _load_font("Manrope", 48)
    font_eyebrow = _load_font("Inter", 18)
    font_wordmark = _load_font("Inter", 18)

    # Gold accent bar: 4px tall, 120px wide, positioned ~40px from top-left
    bar_x, bar_y = 60, 50
    draw.rectangle(
        [bar_x, bar_y, bar_x + 120, bar_y + 4],
        fill=_GOLD,
    )

    # Eyebrow: uppercase, gold, below the gold bar
    eyebrow_text = eyebrow.upper() if eyebrow else ""
    eyebrow_y = bar_y + 20
    draw.text(
        (bar_x, eyebrow_y),
        eyebrow_text,
        fill=_GOLD,
        font=font_eyebrow,
    )

    # Headline: ice text, wraps to 2-3 lines
    headline_lines = _wrap_title(title)
    headline_y = eyebrow_y + 50
    line_height = 62  # ~48px font + spacing

    for i, line in enumerate(headline_lines):
        draw.text(
            (bar_x, headline_y + i * line_height),
            line,
            fill=_ICE_TEXT,
            font=font_headline,
        )

    # "entuned" wordmark: bottom-right, muted ice text
    wordmark = "entuned"
    # Get text bounding box for positioning
    try:
        bbox = draw.textbbox((0, 0), wordmark, font=font_wordmark)
        wm_w = bbox[2] - bbox[0]
    except AttributeError:
        # Older Pillow versions
        wm_w = draw.textlength(wordmark, font=font_wordmark)

    wm_x = 1200 - 60 - wm_w
    wm_y = 630 - 50

    # Draw wordmark with reduced opacity by compositing
    # Create a separate layer for the muted text
    try:
        from PIL import Image as PILImage

        overlay = PILImage.new("RGBA", (1200, 630), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.text(
            (wm_x, wm_y),
            wordmark,
            fill=_MUTED_ICE,
            font=font_wordmark,
        )
        img = img.convert("RGBA")
        img = PILImage.alpha_composite(img, overlay)
        img = img.convert("RGB")
    except Exception:
        # If compositing fails, draw at full opacity as fallback
        draw.text(
            (wm_x, wm_y),
            wordmark,
            fill=_ICE_TEXT,
            font=font_wordmark,
        )

    # -- Save ---------------------------------------------------------------
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)

    # Write to cache if cache_dir provided
    if cache_dir:
        cache_path = os.path.join(cache_dir, f"og-{content_h}.png")
        if os.path.abspath(cache_path) != os.path.abspath(output_path):
            import shutil

            shutil.copy2(output_path, cache_path)

    return output_path
