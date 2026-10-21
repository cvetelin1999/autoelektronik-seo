import os
import glob
import json
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

dist_dir = r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\dist"
html_files = sorted(glob.glob(os.path.join(dist_dir, "**", "*.html"), recursive=True))
print(f"Total HTML files found: {len(html_files)}")

total_links = 0
total_missing_title = 0
total_imgs = 0
total_missing_alt = 0
total_missing_width = 0
total_missing_height = 0

all_page_audits = []

for hf in html_files:
    rel = os.path.relpath(hf, dist_dir).replace("\\", "/")
    with open(hf, "r", encoding="utf-8") as f:
        html_content = f.read()
    soup = BeautifulSoup(html_content, "lxml")
    
    # <a> tags
    links = soup.find_all("a")
    links_missing_title = [a for a in links if not a.get("title") or not a.get("title").strip()]
    total_links += len(links)
    total_missing_title += len(links_missing_title)
    
    # <img> tags
    imgs = soup.find_all("img")
    imgs_missing_alt = [img for img in imgs if img.get("alt") is None]
    imgs_missing_width = [img for img in imgs if not img.get("width")]
    imgs_missing_height = [img for img in imgs if not img.get("height")]
    total_imgs += len(imgs)
    total_missing_alt += len(imgs_missing_alt)
    total_missing_width += len(imgs_missing_width)
    total_missing_height += len(imgs_missing_height)
    
    # Heading hierarchy
    h1s = [h.get_text(strip=True) for h in soup.find_all("h1")]
    h2s = [h.get_text(strip=True) for h in soup.find_all("h2")]
    h3s = [h.get_text(strip=True) for h in soup.find_all("h3")]
    
    # Title & Meta
    title_tag = soup.find("title")
    title_text = title_tag.get_text(strip=True) if title_tag else ""
    meta_desc = soup.find("meta", attrs={"name": "description"})
    desc_text = meta_desc.get("content", "") if meta_desc else ""
    canonical = soup.find("link", rel="canonical")
    canonical_href = canonical.get("href", "") if canonical else ""
    
    # Open Graph
    og_title = soup.find("meta", property="og:title")
    og_desc = soup.find("meta", property="og:description")
    og_image = soup.find("meta", property="og:image")
    og_url = soup.find("meta", property="og:url")
    og_type = soup.find("meta", property="og:type")
    
    # JSON-LD
    json_ld_scripts = soup.find_all("script", type="application/ld+json")
    json_ld_data = []
    for s in json_ld_scripts:
        try:
            json_ld_data.append(json.loads(s.string))
        except Exception as e:
            json_ld_data.append({"parse_error": str(e)})
            
    # Breadcrumbs element
    breadcrumbs_nav = soup.find("nav", attrs={"aria-label": lambda v: v and "трохи" in v.lower() or v and "breadcrumb" in v.lower()})
    
    # External and Internal links
    ext_links = [a for a in links if a.get("href", "").startswith("http://") or a.get("href", "").startswith("https://")]
    
    audit_res = {
        "page": rel,
        "title": title_text,
        "description": desc_text,
        "canonical": canonical_href,
        "links_count": len(links),
        "links_missing_title": len(links_missing_title),
        "missing_title_details": [{"href": a.get("href"), "text": a.get_text(strip=True)[:40]} for a in links_missing_title],
        "imgs_count": len(imgs),
        "imgs_missing_alt": len(imgs_missing_alt),
        "imgs_missing_width": len(imgs_missing_width),
        "imgs_missing_height": len(imgs_missing_height),
        "h1_count": len(h1s),
        "h1": h1s[0] if h1s else None,
        "h2_count": len(h2s),
        "h3_count": len(h3s),
        "has_og": bool(og_title and og_desc and og_image and og_url),
        "json_ld_types": [d.get("@type") for d in json_ld_data if isinstance(d, dict)],
        "has_breadcrumbs": bool(breadcrumbs_nav),
        "ext_links_count": len(ext_links),
        "ext_links": [a.get("href") for a in ext_links]
    }
    all_page_audits.append(audit_res)
    print(f"[{rel}] Links: {len(links)} (missing title: {len(links_missing_title)}), Imgs: {len(imgs)} (missing alt/w/h: {len(imgs_missing_alt)}/{len(imgs_missing_width)}/{len(imgs_missing_height)}), H1: {len(h1s)}, JSON-LD: {[d.get('@type') for d in json_ld_data if isinstance(d, dict)]}")

print("\n--- SUMMARY ---")
print(f"Total links: {total_links}, Missing title: {total_missing_title}")
print(f"Total images: {total_imgs}, Missing alt: {total_missing_alt}, Missing width: {total_missing_width}, Missing height: {total_missing_height}")

with open(r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\explorer_survey_r2\audit_results.json", "w", encoding="utf-8") as out:
    json.dump(all_page_audits, out, ensure_ascii=False, indent=2)
print("Saved audit_results.json successfully.")
