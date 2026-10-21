import os
import sys
import urllib.request
from lxml import etree

def fetch_url(url):
    print(f"Fetching official schema: {url}")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) XMLValidator/1.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()

def validate_sitemap_standard(xml_path):
    print(f"\n--- Validating Standard Sitemap: {xml_path} ---")
    sitemap_xsd_url = "https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    xsd_content = fetch_url(sitemap_xsd_url)
    schema_root = etree.fromstring(xsd_content)
    schema = etree.XMLSchema(schema_root)

    with open(xml_path, 'rb') as f:
        doc = etree.parse(f)

    is_valid = schema.validate(doc)
    if is_valid:
        print(f"PASS: {xml_path} is 100% valid against official sitemaps.org 0.9 XSD schema.")
        return True
    else:
        print(f"FAIL: {xml_path} failed schema validation:")
        for error in schema.error_log:
            print(f"  Line {error.line}: {error.message}")
        return False

def validate_image_sitemap(xml_path):
    print(f"\n--- Validating Image Sitemap: {xml_path} ---")
    # To validate image sitemap with sitemaps.org base + google image schema,
    # we can construct a combined schema importing both namespaces.
    combined_xsd = """<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
           elementFormDefault="qualified">
  <xs:import namespace="http://www.google.com/schemas/sitemap-image/1.1"
             schemaLocation="https://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd"/>
  <xs:include schemaLocation="https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"/>
</xs:schema>"""

    # Fetch referenced schemas to test accessibility
    img_xsd_url = "https://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd"
    fetch_url(img_xsd_url)

    schema_doc = etree.fromstring(combined_xsd.encode('utf-8'))
    schema = etree.XMLSchema(schema_doc)

    with open(xml_path, 'rb') as f:
        doc = etree.parse(f)

    is_valid = schema.validate(doc)
    if is_valid:
        print(f"PASS: {xml_path} is 100% valid against official Google Image Sitemap 1.1 XSD schema.")
        return True
    else:
        print(f"FAIL: {xml_path} failed schema validation:")
        for error in schema.error_log:
            print(f"  Line {error.line}: {error.message}")
        return False

def validate_video_sitemap(xml_path):
    print(f"\n--- Validating Video Sitemap: {xml_path} ---")
    combined_xsd = """<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
           elementFormDefault="qualified">
  <xs:import namespace="http://www.google.com/schemas/sitemap-video/1.1"
             schemaLocation="https://www.google.com/schemas/sitemap-video/1.1/sitemap-video.xsd"/>
  <xs:include schemaLocation="https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"/>
</xs:schema>"""

    vid_xsd_url = "https://www.google.com/schemas/sitemap-video/1.1/sitemap-video.xsd"
    fetch_url(vid_xsd_url)

    schema_doc = etree.fromstring(combined_xsd.encode('utf-8'))
    schema = etree.XMLSchema(schema_doc)

    with open(xml_path, 'rb') as f:
        doc = etree.parse(f)

    is_valid = schema.validate(doc)
    if is_valid:
        print(f"PASS: {xml_path} is 100% valid against official Google Video Sitemap 1.1 XSD schema.")
        return True
    else:
        print(f"FAIL: {xml_path} failed schema validation:")
        for error in schema.error_log:
            print(f"  Line {error.line}: {error.message}")
        return False

def main():
    dist_dir = os.path.abspath('dist')
    p_standard = os.path.join(dist_dir, 'sitemap.xml')
    p_image = os.path.join(dist_dir, 'image-sitemap.xml')
    p_video = os.path.join(dist_dir, 'video-sitemap.xml')

    ok1 = validate_sitemap_standard(p_standard)
    ok2 = validate_image_sitemap(p_image)
    ok3 = validate_video_sitemap(p_video)

    if ok1 and ok2 and ok3:
        print("\n========================================================")
        print("ALL 3 SITEMAPS PASSED OFFICIAL XML SCHEMA VALIDATION 100%!")
        print("========================================================")
        sys.exit(0)
    else:
        print("\nXML SCHEMA VALIDATION FAILED!")
        sys.exit(1)

if __name__ == '__main__':
    main()
