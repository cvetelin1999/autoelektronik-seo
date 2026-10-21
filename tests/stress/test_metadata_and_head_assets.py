import os
import sys
from pathlib import Path
from html.parser import HTMLParser

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

DIST_DIR = Path("dist").resolve()

class MetaScanner(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta_tags = []
        self.link_tags = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if tag == 'meta':
            self.meta_tags.append(attr_dict)
        elif tag == 'link':
            self.link_tags.append(attr_dict)

def main():
    print("Testing Metadata and Head Assets across all 11 pages...")
    html_files = list(DIST_DIR.rglob("*.html"))
    errors = []

    for hf in sorted(html_files):
        rel = hf.relative_to(DIST_DIR)
        with open(hf, 'r', encoding='utf-8') as f:
            content = f.read()

        scanner = MetaScanner()
        scanner.feed(content)

        # Check canonical
        canonicals = [l.get('href') for l in scanner.link_tags if l.get('rel') == 'canonical']
        if not canonicals:
            errors.append(f"[{rel}] Missing canonical link tag!")
        elif len(canonicals) > 1:
            errors.append(f"[{rel}] Multiple canonical link tags found: {canonicals}")

        # Check favicon and apple-touch-icon
        icons = [l.get('href') for l in scanner.link_tags if 'icon' in str(l.get('rel'))]
        for icon in icons:
            if icon.startswith('/'):
                icon_path = DIST_DIR / icon.lstrip('/')
                if not icon_path.is_file():
                    errors.append(f"[{rel}] Icon not found on disk: {icon} -> {icon_path}")

        # Check og:image and twitter:image
        for m in scanner.meta_tags:
            prop = m.get('property') or m.get('name')
            if prop in ['og:image', 'twitter:image']:
                val = m.get('content')
                if not val:
                    errors.append(f"[{rel}] Empty content for {prop}")
                else:
                    # Could be absolute or relative URL
                    clean_val = val
                    if clean_val.startswith('https://'):
                        # e.g. https://autoelektronik.bg/images/...
                        parts = clean_val.split('/', 3)
                        if len(parts) >= 4:
                            clean_val = '/' + parts[3]
                    if clean_val.startswith('/'):
                        img_path = DIST_DIR / clean_val.lstrip('/')
                        if not img_path.is_file():
                            errors.append(f"[{rel}] Meta image {prop}='{val}' not found on disk at {img_path}")

    if errors:
        print(f"FAILED with {len(errors)} errors:")
        for e in errors:
            print(f"  ❌ {e}")
        sys.exit(1)
    else:
        print(f"SUCCESS: All 11 pages have valid canonicals, icons, and OG/Twitter images on disk.")

if __name__ == '__main__':
    main()
