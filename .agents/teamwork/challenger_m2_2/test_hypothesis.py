import os
from lxml import etree

WORK_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.abspath(os.path.join(WORK_DIR, '..', '..', '..', 'dist'))

# Test hypothesis for image sitemap: caption must come before title
sitemap_xsd = os.path.join(WORK_DIR, 'sitemap.xsd').replace('\\', '/')
image_xsd = os.path.join(WORK_DIR, 'sitemap-image.xsd').replace('\\', '/')

wrapper_img_xsd = f"""<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
           elementFormDefault="qualified">
  <xs:import namespace="http://www.google.com/schemas/sitemap-image/1.1" schemaLocation="{image_xsd}"/>
  <xs:include schemaLocation="{sitemap_xsd}"/>
</xs:schema>"""

img_schema = etree.XMLSchema(etree.fromstring(wrapper_img_xsd.encode('utf-8')))

with open(os.path.join(DIST_DIR, 'image-sitemap.xml'), 'r', encoding='utf-8') as f:
    orig_img_xml = f.read()

# Let's reorder <image:title> and <image:caption> in memory
import re
reordered_img_xml = re.sub(
    r'(<image:title>[\s\S]*?<\/image:title>)\s*(<image:caption>[\s\S]*?<\/image:caption>)',
    r'\2\n      \1',
    orig_img_xml
)

doc_img = etree.fromstring(reordered_img_xml.encode('utf-8'))
img_valid = img_schema.validate(doc_img)
print(f"Hypothesis Test - Reordered Image Sitemap valid: {img_valid}")
if not img_valid:
    for err in img_schema.error_log:
        print(f"  Line {err.line}: {err.message}")

# Test hypothesis for video sitemap: tags must come before family_friendly
video_xsd = os.path.join(WORK_DIR, 'sitemap-video.xsd').replace('\\', '/')
wrapper_vid_xsd = f"""<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           targetNamespace="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
           elementFormDefault="qualified">
  <xs:import namespace="http://www.google.com/schemas/sitemap-video/1.1" schemaLocation="{video_xsd}"/>
  <xs:include schemaLocation="{sitemap_xsd}"/>
</xs:schema>"""

vid_schema = etree.XMLSchema(etree.fromstring(wrapper_vid_xsd.encode('utf-8')))

with open(os.path.join(DIST_DIR, 'video-sitemap.xml'), 'r', encoding='utf-8') as f:
    orig_vid_xml = f.read()

# Swap <video:family_friendly> with <video:tag> elements in memory
# Extract family_friendly and tags
m = re.search(r'(<video:family_friendly>[^<]+<\/video:family_friendly>)\s*((?:<video:tag>[\s\S]*?<\/video:tag>\s*)+)', orig_vid_xml)
if m:
    reordered_vid_xml = orig_vid_xml.replace(m.group(0), m.group(2) + '      ' + m.group(1) + '\n')
else:
    reordered_vid_xml = orig_vid_xml

doc_vid = etree.fromstring(reordered_vid_xml.encode('utf-8'))
vid_valid = vid_schema.validate(doc_vid)
print(f"Hypothesis Test - Reordered Video Sitemap valid: {vid_valid}")
if not vid_valid:
    for err in vid_schema.error_log:
        print(f"  Line {err.line}: {err.message}")
