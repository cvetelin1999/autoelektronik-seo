import sys

for mod in ['lxml', 'lxml.etree', 'xmlschema', 'xml.etree.ElementTree']:
    try:
        __import__(mod)
        print(f"{mod}: available")
    except ImportError:
        print(f"{mod}: NOT available")
