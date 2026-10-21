import os
import re
import sys
from pathlib import Path
from html.parser import HTMLParser
from PIL import Image

DIST_DIR = Path("dist").resolve()
PUBLIC_DIR = Path("public").resolve()

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Cyrillic character range regex to detect sneaky homoglyph substitutions in ASCII URLs
CYRILLIC_PATTERN = re.compile(r'[\u0400-\u04FF]')

class HTMLScanner(HTMLParser):
    def __init__(self, filepath):
        super().__init__()
        self.filepath = filepath
        self.links = []
        self.images = []
        self.videos = []
        self.stylesheets = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        line, col = self.getpos()
        if tag == 'a':
            self.links.append((line, attr_dict))
        elif tag == 'img':
            self.images.append((line, attr_dict))
        elif tag == 'video':
            self.videos.append((line, attr_dict))
        elif tag == 'source':
            # child of video or picture
            self.videos.append((line, attr_dict))
        elif tag == 'link' and attr_dict.get('rel') == 'stylesheet':
            self.stylesheets.append((line, attr_dict))

def main():
    print(f"Adversarial Crawler starting on {DIST_DIR}...")
    if not DIST_DIR.exists():
        print(f"ERROR: {DIST_DIR} does not exist!")
        sys.exit(1)

    html_files = list(DIST_DIR.rglob("*.html"))
    print(f"Discovered {len(html_files)} HTML pages:")
    for hf in sorted(html_files):
        print(f"  - {hf.relative_to(DIST_DIR)}")

    errors = []
    warnings = []
    total_links = 0
    total_images = 0
    total_videos = 0

    for hf in sorted(html_files):
        rel_path = hf.relative_to(DIST_DIR)
        with open(hf, 'r', encoding='utf-8') as f:
            content = f.read()

        parser = HTMLScanner(hf)
        parser.feed(content)

        # 1. Test Links
        for line, attr in parser.links:
            total_links += 1
            href = attr.get('href')
            title = attr.get('title')

            if href is None:
                errors.append(f"[{rel_path}:{line}] <a> tag has NO href attribute!")
                continue

            # Check title attribute (CSCB700 Req #8)
            if not title or not title.strip():
                errors.append(f"[{rel_path}:{line}] <a> tag to '{href}' is missing a descriptive 'title' attribute!")

            # Check Cyrillic homoglyphs
            if CYRILLIC_PATTERN.search(href):
                errors.append(f"[{rel_path}:{line}] CRITICAL: Cyrillic homoglyph detected in href: '{href}'")

            # Check internal links resolution
            if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')):
                if href.startswith('javascript:'):
                    warnings.append(f"[{rel_path}:{line}] Avoid javascript: pseudo-protocol in href: '{href}'")
                continue
            
            # Anchor only
            if href.startswith('#'):
                continue

            # Strip query string and fragment
            clean_href = href.split('?')[0].split('#')[0]
            if not clean_href:
                continue

            # Path resolution
            if clean_href.startswith('/'):
                target_cand1 = DIST_DIR / clean_href.lstrip('/')
            else:
                target_cand1 = (hf.parent / clean_href).resolve()

            # Candidates: target_cand1 directly, target_cand1 / "index.html", target_cand1.with_suffix(".html")
            found = False
            if target_cand1.is_file():
                found = True
            elif target_cand1.is_dir() and (target_cand1 / "index.html").is_file():
                found = True
            elif (target_cand1.parent / f"{target_cand1.name}.html").is_file():
                found = True

            if not found:
                errors.append(f"[{rel_path}:{line}] Broken internal link (404): href='{href}' resolved to '{target_cand1}' (not found)")

        # 2. Test Images
        for line, attr in parser.images:
            total_images += 1
            src = attr.get('src')
            alt = attr.get('alt')
            width = attr.get('width')
            height = attr.get('height')

            if not src:
                errors.append(f"[{rel_path}:{line}] <img> tag missing src attribute!")
                continue

            # Alt attribute check
            if alt is None or not alt.strip():
                errors.append(f"[{rel_path}:{line}] <img> src='{src}' missing or empty alt attribute!")

            # Width and height check
            if not width or not height:
                errors.append(f"[{rel_path}:{line}] <img> src='{src}' missing width/height attributes (width={width}, height={height})")

            # Physical file existence
            clean_src = src.split('?')[0].split('#')[0]
            if clean_src.startswith('/'):
                img_path = DIST_DIR / clean_src.lstrip('/')
            else:
                img_path = (hf.parent / clean_src).resolve()

            if not img_path.is_file():
                errors.append(f"[{rel_path}:{line}] Missing physical image file (404): src='{src}' at '{img_path}'")
            else:
                # Check image validity and dimensions with PIL (if raster) or check SVG
                if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
                    try:
                        with Image.open(img_path) as im:
                            actual_w, actual_h = im.size
                            if actual_w <= 0 or actual_h <= 0:
                                errors.append(f"[{rel_path}:{line}] Corrupt/0-dimension image: {img_path}")
                    except Exception as e:
                        errors.append(f"[{rel_path}:{line}] Failed to read image {img_path}: {e}")
                elif img_path.suffix.lower() == '.svg':
                    if img_path.stat().st_size == 0:
                        errors.append(f"[{rel_path}:{line}] 0-byte SVG image: {img_path}")

        # 3. Test Videos
        for line, attr in parser.videos:
            src = attr.get('src')
            poster = attr.get('poster')
            if poster:
                clean_poster = poster.split('?')[0].split('#')[0]
                p_path = DIST_DIR / clean_poster.lstrip('/')
                if not p_path.is_file():
                    errors.append(f"[{rel_path}:{line}] Video poster missing (404): poster='{poster}'")
            if src:
                total_videos += 1
                clean_src = src.split('?')[0].split('#')[0]
                v_path = DIST_DIR / clean_src.lstrip('/')
                if not v_path.is_file():
                    errors.append(f"[{rel_path}:{line}] Video source missing (404): src='{src}'")
                else:
                    if v_path.stat().st_size == 0:
                        errors.append(f"[{rel_path}:{line}] 0-byte video file: {v_path}")

    print("\n--- Crawler Results Summary ---")
    print(f"Total HTML files crawled: {len(html_files)}")
    print(f"Total <a> tags audited: {total_links}")
    print(f"Total <img> tags audited: {total_images}")
    print(f"Total video sources audited: {total_videos}")
    print(f"Errors found: {len(errors)}")
    print(f"Warnings found: {len(warnings)}")

    if errors:
        print("\nERRORS DETECTED:")
        for err in errors:
            print(f"  ❌ {err}")
        sys.exit(1)
    else:
        print("\n✅ All links, images, and video assets passed adversarial crawler with 0 ERRORS!")

if __name__ == '__main__':
    main()
