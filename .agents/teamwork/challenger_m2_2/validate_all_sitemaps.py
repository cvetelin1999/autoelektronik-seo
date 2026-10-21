import os
import sys
from lxml import etree

WORK_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.abspath(os.path.join(WORK_DIR, '..', '..', '..', 'dist'))

def validate_standard_sitemap():
    print("=== [1/3] Validating standard sitemap.xml ===")
    xml_path = os.path.join(DIST_DIR, 'sitemap.xml')
    xsd_path = os.path.join(WORK_DIR, 'sitemap.xsd')

    with open(xsd_path, 'rb') as f:
        schema_doc = etree.parse(f)
    schema = etree.XMLSchema(schema_doc)

    with open(xml_path, 'rb') as f:
        doc = etree.parse(f)

    if schema.validate(doc):
        print(f"PASS: {xml_path} conforms to official sitemaps.org 0.9 XML schema.")
        return True
    else:
        print(f"FAIL: {xml_path} validation errors:")
        for err in schema.error_log:
            print(f"  Line {err.line}: {err.message}")
        return False

def validate_image_sitemap():
    print("\n=== [2/3] Validating image-sitemap.xml ===")
    xml_path = os.path.join(DIST_DIR, 'image-sitemap.xml')

    sitemap_xsd = os.path.join(WORK_DIR, 'sitemap.xsd').replace('\\', '/')
    image_xsd = os.path.join(WORK_DIR, 'sitemap-image.xsd').replace('\\', '/')

    wrapper_xsd = f"""<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
           elementFormDefault="qualified">
  <xs:import namespace="http://www.google.com/schemas/sitemap-image/1.1" schemaLocation="{image_xsd}"/>
  <xs:include schemaLocation="{sitemap_xsd}"/>
</xs:schema>"""

    schema_doc = etree.fromstring(wrapper_xsd.encode('utf-8'))
    schema = etree.XMLSchema(schema_doc)

    with open(xml_path, 'rb') as f:
        doc = etree.parse(f)

    if schema.validate(doc):
        print(f"PASS: {xml_path} conforms to official Google Image Sitemap 1.1 + Sitemaps 0.9 schema.")
        return True
    else:
        print(f"FAIL: {xml_path} validation errors:")
        for err in schema.error_log:
            print(f"  Line {err.line}: {err.message}")
        return False

def validate_video_sitemap():
    print("\n=== [3/3] Validating video-sitemap.xml ===")
    xml_path = os.path.join(DIST_DIR, 'video-sitemap.xml')

    sitemap_xsd = os.path.join(WORK_DIR, 'sitemap.xsd').replace('\\', '/')
    video_xsd = os.path.join(WORK_DIR, 'sitemap-video.xsd').replace('\\', '/')

    wrapper_xsd = f"""<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
           elementFormDefault="qualified">
  <xs:import namespace="http://www.google.com/schemas/sitemap-video/1.1" schemaLocation="{video_xsd}"/>
  <xs:include schemaLocation="{sitemap_xsd}"/>
</xs:schema>"""

    schema_doc = etree.fromstring(wrapper_xsd.encode('utf-8'))
    schema = etree.XMLSchema(schema_doc)

    with open(xml_path, 'rb') as f:
        doc = etree.parse(f)

    if schema.validate(doc):
        print(f"PASS: {xml_path} conforms to official Google Video Sitemap 1.1 + Sitemaps 0.9 schema.")
        return True
    else:
        print(f"FAIL: {xml_path} validation errors:")
        for err in schema.error_log:
            print(f"  Line {err.line}: {err.message}")
        return False

def main():
    v1 = validate_standard_sitemap()
    v2 = validate_image_sitemap()
    v3 = validate_video_sitemap()

    if v1 and v2 and v3:
        print("\n========================================================")
        print("EMPIRICAL TEST PASSED: ALL 3 SITEMAPS CONFORM TO OFFICIAL W3C/GOOGLE XML SCHEMAS (0 ERRORS)")
        print("========================================================")
        sys.exit(0)
    else:
        print("\nEMPIRICAL TEST FAILED!")
        sys.exit(1)

if __name__ == '__main__':
    main()
