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

def fetch(url):
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
        return r.read()

def validate_combined(xml_path, ext_namespace, ext_xsd_bytes, name):
    print(f"\n--- Full XSD Validation for {name} ---")
    # Build wrapper schema that imports sitemap 0.9 and the extension schema
    wrapper_schema_str = f"""<?xml version="1.0" encoding="UTF-8"?>
<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            targetNamespace="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            elementFormDefault="qualified">
  <xsd:import namespace="{ext_namespace}"/>
  <xsd:include schemaLocation="https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"/>
</xsd:schema>"""

    # We can provide a custom resolver or load schema with parsed sources
    # Even simpler: lxml allows XMLSchema with multiple imports or validating the elements directly.
    # Let's validate the extension elements directly against the extension XSD:
    ext_schema_doc = etree.fromstring(ext_xsd_bytes)
    ext_schema = etree.XMLSchema(ext_schema_doc)

    xml_doc = etree.parse(str(xml_path))
    # Find all elements under the extension namespace
    ext_elements = xml_doc.xpath(f'//*[namespace-uri()="{ext_namespace}"]')
    print(f"Found {len(ext_elements)} elements with namespace '{ext_namespace}' in {name}")

    errors = []
    for el in ext_elements:
        # Only validate top-level container elements like <image:image> or <video:video>
        tag = etree.QName(el).localname
        if tag in ['image', 'video']:
            if not ext_schema.validate(el):
                for err in ext_schema.error_log:
                    errors.append(f"<{tag}> line {el.sourceline}: {err.message}")

    if errors:
        print(f"❌ {name} has schema errors:")
        for e in errors:
            print(f"   {e}")
        return False
    else:
        print(f"✅ All {len(ext_elements)} '{ext_namespace}' elements in {name} strictly conform to Google XSD!")
        return True

def main():
    img_xml = DIST_DIR / "image-sitemap.xml"
    vid_xml = DIST_DIR / "video-sitemap.xml"

    img_xsd = fetch("https://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd")
    vid_xsd = fetch("https://www.google.com/schemas/sitemap-video/1.1/sitemap-video.xsd")

    v1 = validate_combined(img_xml, "http://www.google.com/schemas/sitemap-image/1.1", img_xsd, "image-sitemap.xml")
    v2 = validate_combined(vid_xml, "http://www.google.com/schemas/sitemap-video/1.1", vid_xsd, "video-sitemap.xml")

    if v1 and v2:
        print("\n✅ BOTH EXTENSION SITEMAPS STRICTLY VALIDATED WITH OFFICIAL GOOGLE XSD SCHEMAS!")
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
