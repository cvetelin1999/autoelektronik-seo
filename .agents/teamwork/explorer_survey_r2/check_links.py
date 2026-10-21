import os, glob, re
from bs4 import BeautifulSoup

dist_dir = r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\dist"
html_files = sorted(glob.glob(os.path.join(dist_dir, "**", "*.html"), recursive=True))

known_routes = set()
for hf in html_files:
    rel = os.path.relpath(hf, dist_dir).replace("\\", "/")
    if rel == "index.html":
        known_routes.add("/")
    elif rel.endswith("/index.html"):
        route = "/" + rel[:-len("index.html")]
        known_routes.add(route)
        known_routes.add(route[:-1]) # without trailing slash

known_routes.add("/robots.txt")
known_routes.add("/sitemap.xml")
known_routes.add("/image-sitemap.xml")
known_routes.add("/video-sitemap.xml")

print("Known routes count:", len(known_routes))

broken_links = []
external_links = []
all_links_count = 0

for hf in html_files:
    page_rel = os.path.relpath(hf, dist_dir).replace("\\", "/")
    with open(hf, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "lxml")
    
    for a in soup.find_all("a"):
        all_links_count += 1
        href = a.get("href", "")
        title = a.get("title", "")
        
        if href.startswith("http://") or href.startswith("https://"):
            external_links.append((page_rel, href, a.get_text(strip=True), title))
        elif href.startswith("tel:") or href.startswith("mailto:") or href.startswith("#"):
            continue
        else:
            # Internal link
            clean_href = href.split("#")[0].split("?")[0]
            if not clean_href:
                continue
            if clean_href not in known_routes:
                broken_links.append((page_rel, href, clean_href, a.get_text(strip=True), title))

print(f"Total links: {all_links_count}")
print(f"External links count: {len(external_links)}")
for el in set(external_links):
    print(f"  Ext link: from {el[0]} -> {el[1]} (anchor: '{el[2]}', title: '{el[3]}')")

print(f"Broken links count: {len(broken_links)}")
for bl in broken_links:
    print(f"  BROKEN LINK: in {bl[0]} -> href='{bl[1]}' (clean='{bl[2]}') text='{bl[3]}'")
