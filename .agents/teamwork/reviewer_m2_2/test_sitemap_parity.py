import os
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = os.path.abspath(".")
DIST_DIR = os.path.join(BASE_DIR, "dist")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

print(f"Base dir: {BASE_DIR}")
print(f"Dist dir exists: {os.path.exists(DIST_DIR)}")

# 1. robots.txt
robots_path = os.path.join(PUBLIC_DIR, "robots.txt")
assert os.path.exists(robots_path), "robots.txt missing in public/"
with open(robots_path, "r", encoding="utf-8") as f:
    robots_txt = f.read()
print("--- robots.txt content ---")
print(robots_txt.strip())

expected_sitemaps = [
    "https://autoelektronik-service.bg/sitemap.xml",
    "https://autoelektronik-service.bg/image-sitemap.xml",
    "https://autoelektronik-service.bg/video-sitemap.xml",
]

for s in expected_sitemaps:
    assert s in robots_txt, f"Missing {s} in robots.txt"
print("✓ robots.txt contains all 3 sitemap references")

# 2. Check XML Sitemaps in dist/
sitemaps = {
    "sitemap.xml": os.path.join(DIST_DIR, "sitemap.xml"),
    "image-sitemap.xml": os.path.join(DIST_DIR, "image-sitemap.xml"),
    "video-sitemap.xml": os.path.join(DIST_DIR, "video-sitemap.xml"),
}

for name, path in sitemaps.items():
    assert os.path.exists(path), f"Sitemap file missing: {path}"
    print(f"\n--- Checking {name} ({os.path.getsize(path):,} bytes) ---")
    tree = ET.parse(path)
    root = tree.getroot()
    print(f"Root tag: {root.tag}")

    # Inspect namespaces
    namespaces = {
        "s": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "image": "http://www.google.com/schemas/sitemap-image/1.1",
        "video": "http://www.google.com/schemas/sitemap-video/1.1",
    }

    if name == "sitemap.xml":
        urls = root.findall("s:url", namespaces)
        print(f"Found {len(urls)} <url> elements")
        assert len(urls) == 11, f"Expected 11 URLs in sitemap.xml, found {len(urls)}"
        for u in urls:
            loc = u.find("s:loc", namespaces).text
            parsed = urlparse(loc)
            path_part = parsed.path.strip("/")
            if path_part == "":
                target_file = os.path.join(DIST_DIR, "index.html")
            else:
                target_file = os.path.join(DIST_DIR, path_part, "index.html")
            assert os.path.exists(target_file), f"Page for {loc} does not exist at {target_file}"
            print(f"  ✓ {loc} -> {os.path.relpath(target_file, BASE_DIR)} ({os.path.getsize(target_file):,} bytes)")

    elif name == "image-sitemap.xml":
        urls = root.findall("s:url", namespaces)
        print(f"Found {len(urls)} <url> elements with images")
        assert len(urls) > 0, "No URLs in image-sitemap.xml"
        total_images = 0
        for u in urls:
            loc = u.find("s:loc", namespaces).text
            images = u.findall("image:image", namespaces)
            for img in images:
                total_images += 1
                img_loc = img.find("image:loc", namespaces).text
                title = img.find("image:title", namespaces)
                caption = img.find("image:caption", namespaces)
                assert title is not None and title.text, f"Image {img_loc} missing title"
                assert caption is not None and caption.text, f"Image {img_loc} missing caption"
                
                parsed = urlparse(img_loc)
                rel_path = parsed.path.lstrip("/")
                dist_file = os.path.join(DIST_DIR, rel_path)
                pub_file = os.path.join(PUBLIC_DIR, rel_path)
                found = os.path.exists(dist_file) or os.path.exists(pub_file)
                assert found, f"Image does not exist on disk: {img_loc} (checked {dist_file} and {pub_file})"
                resolved_size = os.path.getsize(dist_file if os.path.exists(dist_file) else pub_file)
                print(f"  ✓ {img_loc} -> exists ({resolved_size:,} bytes) | Title: {title.text[:30]}...")
        print(f"Total images checked: {total_images}")

    elif name == "video-sitemap.xml":
        urls = root.findall("s:url", namespaces)
        print(f"Found {len(urls)} <url> elements with videos")
        assert len(urls) == 1, f"Expected 1 video URL, found {len(urls)}"
        for u in urls:
            loc = u.find("s:loc", namespaces).text
            vids = u.findall("video:video", namespaces)
            for v in vids:
                thumb = v.find("video:thumbnail_loc", namespaces).text
                content = v.find("video:content_loc", namespaces).text
                v_title = v.find("video:title", namespaces).text
                desc = v.find("video:description", namespaces).text
                
                # Check thumb
                thumb_rel = urlparse(thumb).path.lstrip("/")
                thumb_file = os.path.join(DIST_DIR, thumb_rel) if os.path.exists(os.path.join(DIST_DIR, thumb_rel)) else os.path.join(PUBLIC_DIR, thumb_rel)
                assert os.path.exists(thumb_file), f"Thumbnail not found: {thumb}"
                print(f"  ✓ Thumbnail: {thumb} -> exists ({os.path.getsize(thumb_file):,} bytes)")

                # Check content MP4
                content_rel = urlparse(content).path.lstrip("/")
                content_file = os.path.join(DIST_DIR, content_rel) if os.path.exists(os.path.join(DIST_DIR, content_rel)) else os.path.join(PUBLIC_DIR, content_rel)
                assert os.path.exists(content_file), f"Video content not found: {content}"
                print(f"  ✓ Content: {content} -> exists ({os.path.getsize(content_file):,} bytes)")

print("\nALL SITEMAP AND ROBOTS.TXT CHECKS PASSED 100%!")
