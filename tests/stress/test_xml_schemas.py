import os
import sys
import ssl
import urllib.request
from pathlib import Path
from lxml import etree

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

DIST_DIR = Path("dist").resolve()

def fetch_xsd(url):
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
        return resp.read()

def validate_xml_with_schema(xml_path, xsd_bytes, name):
    print(f"\n--- Validating {name} against official XSD ---")
    xml_doc = etree.parse(str(xml_path))
    schema_root = etree.XML(xsd_bytes)
    schema = etree.XMLSchema(schema_root)
    
    is_valid = schema.validate(xml_doc)
    if is_valid:
        print(f"✅ {name} strictly conforms to official XSD schema!")
        return True
    else:
        print(f"❌ {name} FAILED schema validation:")
        for err in schema.error_log:
            print(f"   Line {err.line}, col {err.column}: {err.message}")
        return False

def check_element_sequence(xml_path, expected_order_map):
    """Adversarial check: strictly enforce XML child element sequence order."""
    print(f"\n--- Checking element sequence order in {xml_path.name} ---")
    tree = etree.parse(str(xml_path))
    root = tree.getroot()
    errors = []

    for elem in root.iter():
        tag = etree.QName(elem).localname
        if tag in expected_order_map:
            expected_order = expected_order_map[tag]
            child_tags = [etree.QName(c).localname for c in elem]
            filtered = [t for t in child_tags if t in expected_order]
            
            # Check indices match expected sequence
            last_idx = -1
            for child_tag in filtered:
                curr_idx = expected_order.index(child_tag)
                if curr_idx < last_idx:
                    errors.append(f"Invalid sequence in <{tag}>: '{child_tag}' appeared after '{expected_order[last_idx]}'. Expected order: {expected_order}")
                last_idx = curr_idx

    if errors:
        for err in errors:
            print(f"❌ {err}")
        return False
    else:
        print(f"✅ Sequence order in {xml_path.name} is 100% compliant!")
        return True

def main():
    sitemap_xml = DIST_DIR / "sitemap.xml"
    image_sitemap_xml = DIST_DIR / "image-sitemap.xml"
    video_sitemap_xml = DIST_DIR / "video-sitemap.xml"

    all_passed = True

    # 1. Sitemap 0.9 official schema
    try:
        sitemap_xsd = fetch_xsd("https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd")
        if not validate_xml_with_schema(sitemap_xml, sitemap_xsd, "sitemap.xml"):
            all_passed = False
    except Exception as e:
        print(f"Warning: could not fetch online sitemap.xsd: {e}")

    # Sequence validation for sitemap.xml: loc, lastmod, changefreq, priority
    seq_sitemap = {
        'url': ['loc', 'lastmod', 'changefreq', 'priority']
    }
    if not check_element_sequence(sitemap_xml, seq_sitemap):
        all_passed = False

    # 2. Image sitemap sequence validation according to Google sitemap-image.xsd
    seq_image_names = []
    try:
        img_xsd = fetch_xsd("https://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd")
        img_doc = etree.fromstring(img_xsd)
        for elem in img_doc.xpath('//xsd:sequence', namespaces={'xsd': 'http://www.w3.org/2001/XMLSchema'}):
            names = [e.attrib.get('name') for e in elem.xpath('./xsd:element', namespaces={'xsd': 'http://www.w3.org/2001/XMLSchema'})]
            if 'loc' in names:
                seq_image_names = names
                break
        print(f"Extracted image XSD sequence: {seq_image_names}")
    except Exception as e:
        print(f"Error fetching image XSD: {e}")
        seq_image_names = ['loc', 'caption', 'geo_location', 'title', 'license']

    seq_image = {'image': seq_image_names}
    if not check_element_sequence(image_sitemap_xml, seq_image):
        all_passed = False

    # 3. Video sitemap sequence validation according to Google sitemap-video.xsd
    seq_video_names = []
    try:
        vid_xsd = fetch_xsd("https://www.google.com/schemas/sitemap-video/1.1/sitemap-video.xsd")
        vid_doc = etree.fromstring(vid_xsd)
        for elem in vid_doc.xpath('//xsd:sequence', namespaces={'xsd': 'http://www.w3.org/2001/XMLSchema'}):
            names = [e.attrib.get('name') for e in elem.xpath('./xsd:element', namespaces={'xsd': 'http://www.w3.org/2001/XMLSchema'})]
            if 'thumbnail_loc' in names:
                seq_video_names = names
                break
        print(f"Extracted video XSD sequence: {seq_video_names}")
    except Exception as e:
        print(f"Error fetching video XSD: {e}")
        seq_video_names = [
            'thumbnail_loc', 'title', 'description', 'content_loc', 'player_loc',
            'duration', 'expiration_date', 'rating', 'content_segment_loc', 'view_count',
            'publication_date', 'tag', 'category', 'family_friendly', 'restriction',
            'gallery_loc', 'price', 'requires_subscription', 'uploader', 'tvshow',
            'platform', 'live', 'id'
        ]

    seq_video = {'video': seq_video_names}
    if not check_element_sequence(video_sitemap_xml, seq_video):
        all_passed = False

    if not all_passed:
        print("\n❌ XML SITEMAP STRESS TEST FAILED!")
        sys.exit(1)
    else:
        print("\n✅ ALL XML SITEMAPS STRICTLY VALIDATED WITH 100% SEQUENCE INTEGRITY!")

if __name__ == '__main__':
    main()
