import os
import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

html_path = "dist/uslugi/remont-na-abs-modul/index.html"
assert os.path.exists(html_path), "File does not exist"

with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

m = re.search(r'<video\b([^>]*)>([\s\S]*?)<\/video>', html, re.IGNORECASE)
if m:
    attrs = m.group(1)
    content = m.group(2)
    print("✓ Found <video> tag in dist/uslugi/remont-na-abs-modul/index.html")
    print(f"Attributes: {attrs.strip()}")
    print(f"Inner HTML: {content.strip()}")

    # Check controls, preload, poster
    assert "controls" in attrs, "Missing controls"
    assert 'preload="metadata"' in attrs, "Missing preload metadata"
    assert 'poster="/images/video-repair-thumbnail.svg"' in attrs, "Missing poster"

    # Check source
    src_match = re.search(r'<source\b([^>]*)>', content, re.IGNORECASE)
    assert src_match, "Missing <source> tag"
    src_attrs = src_match.group(1)
    print(f"Source attributes: {src_attrs.strip()}")
    assert 'src="/videos/abs-module-repair-lab.mp4"' in src_attrs, "Incorrect src"
    assert 'type="video/mp4"' in src_attrs, "Incorrect type"

    # Check fallback
    assert "Вашият браузър не поддържа" in content, "Missing fallback Bulgarian text"
    assert 'href="/videos/abs-module-repair-lab.mp4"' in content, "Missing fallback link"
    assert 'title="Изтеглете видеоклипа за ремонт на ABS модул"' in content, "Missing fallback title"

    print("\nALL VIDEO EMBED CRITERIA VERIFIED 100%!")
else:
    print("ERROR: <video> tag not found!")
    sys.exit(1)
