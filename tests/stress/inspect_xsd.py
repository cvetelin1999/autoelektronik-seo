import sys
from lxml import etree

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

import ssl
import urllib.request

ctx = ssl.create_default_context()
req = urllib.request.Request('https://www.google.com/schemas/sitemap-video/1.1/sitemap-video.xsd', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
    raw = resp.read()
doc = etree.fromstring(raw)
for elem in doc.xpath('//xsd:sequence', namespaces={'xsd': 'http://www.w3.org/2001/XMLSchema'}):
    names = [e.attrib.get('name') for e in elem.xpath('./xsd:element', namespaces={'xsd': 'http://www.w3.org/2001/XMLSchema'})]
    if 'thumbnail_loc' in names:
        print('XSD sequence order for video:')
        for i, n in enumerate(names, 1):
            print(f"  {i}. {n}")
