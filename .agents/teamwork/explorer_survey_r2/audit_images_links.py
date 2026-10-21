import os
import glob
import json
import re
from bs4 import BeautifulSoup

dist_dir = r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\dist"
html_files = sorted(glob.glob(os.path.join(dist_dir, "**", "*.html"), recursive=True))

pages_audit = []
all_image_srcs = set()

for hf in html_files:
    rel = os.path.relpath(hf, dist_dir).replace("\\", "/")
    with open(hf, "r", encoding="utf-8") as f:
        html = f.read()
    soup = BeautifulSoup(html, "lxml")
    
    # Word count (excluding nav and footer)
    main_el = soup.find("main")
    if main_el:
        main_text = main_el.get_text(separator=" ", strip=True)
        # remove excess whitespace
        words = [w for w in re.split(r"\s+", main_text) if len(w) > 1]
        word_count = len(words)
    else:
        words = [w for w in re.split(r"\s+", soup.get_text(separator=" ", strip=True)) if len(w) > 1]
        word_count = len(words)

    # Images
    page_imgs = []
    for img in soup.find_all("img"):
        src = img.get("src", "")
        all_image_srcs.add(src)
        page_imgs.append({
            "src": src,
            "alt": img.get("alt"),
            "width": img.get("width"),
            "height": img.get("height"),
            "loading": img.get("loading")
        })

    # Headings
    headings = {
        "h1": [h.get_text(strip=True) for h in soup.find_all("h1")],
        "h2": [h.get_text(strip=True) for h in soup.find_all("h2")],
        "h3": [h.get_text(strip=True) for h in soup.find_all("h3")]
    }

    # Links
    links_sample = []
    for a in soup.find_all("a"):
        links_sample.append({
            "href": a.get("href"),
            "title": a.get("title"),
            "text": a.get_text(strip=True)
        })

    # Schema.org
    ld_scripts = []
    for s in soup.find_all("script", type="application/ld+json"):
        try:
            ld_scripts.append(json.loads(s.string))
        except Exception as e:
            ld_scripts.append({"error": str(e)})

    # Meta
    title = soup.find("title").get_text(strip=True) if soup.find("title") else ""
    meta_desc = soup.find("meta", attrs={"name": "description"})
    desc = meta_desc.get("content", "") if meta_desc else ""
    meta_kw = soup.find("meta", attrs={"name": "keywords"})
    kw_str = meta_kw.get("content", "") if meta_kw else ""
    keywords = [k.strip() for k in kw_str.split(",") if k.strip()]

    pages_audit.append({
        "route": "/" if rel == "index.html" else "/" + rel[:-len("index.html")],
        "file": rel,
        "title": title,
        "title_length": len(title),
        "description": desc,
        "desc_length": len(desc),
        "word_count": word_count,
        "keywords_count": len(keywords),
        "keywords": keywords,
        "headings": headings,
        "images": page_imgs,
        "total_links": len(links_sample),
        "json_ld": ld_scripts
    })

# Check public images directory
public_img_dir = r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\public\images"
physical_images = os.listdir(public_img_dir) if os.path.exists(public_img_dir) else []

result = {
    "pages_count": len(pages_audit),
    "distinct_images_used_in_html": sorted(list(all_image_srcs)),
    "physical_images_in_public_dir": sorted(physical_images),
    "pages": pages_audit
}

with open(r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\explorer_survey_r2\detailed_audit.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Audited {len(pages_audit)} pages.")
print(f"Physical images in public/images: {len(physical_images)}")
print(f"Distinct images used in HTML: {len(all_image_srcs)}")
for p in pages_audit:
    print(f"{p['route']}: {p['word_count']} words, {len(p['images'])} imgs, {len(p['keywords'])} keywords, title len: {p['title_length']}")
