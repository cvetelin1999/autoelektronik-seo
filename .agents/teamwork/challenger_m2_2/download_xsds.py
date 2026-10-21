import os
import urllib.request

schemas = {
    'sitemap.xsd': 'https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd',
    'sitemap-image.xsd': 'https://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd',
    'sitemap-video.xsd': 'https://www.google.com/schemas/sitemap-video/1.1/sitemap-video.xsd',
}

work_dir = os.path.dirname(os.path.abspath(__file__))

for name, url in schemas.items():
    dest = os.path.join(work_dir, name)
    print(f"Downloading {url} to {dest}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read()
    with open(dest, 'wb') as f:
        f.write(content)
    print(f"Saved {name} ({len(content)} bytes)")
