import json
import re
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

DIST_DIR = Path("dist").resolve()

# Route to expected Schema types per prompt & docs/03 specification
EXPECTED_ROUTE_SCHEMAS = {
    "index.html": ["AutoRepair"],
    "uslugi/index.html": ["CollectionPage", "BreadcrumbList"],
    "uslugi/remont-na-abs-modul/index.html": ["Service", "VideoObject", "BreadcrumbList"],
    "uslugi/remont-na-ecu-kompyutar/index.html": ["Service", "BreadcrumbList"],
    "uslugi/remont-na-avtomobilno-tablo/index.html": ["Service", "BreadcrumbList"],
    "uslugi/avtodiagnostika/index.html": ["Service", "BreadcrumbList"],
    "otkrii-problema/index.html": ["WebApplication", "DiagnosticProcedure", "BreadcrumbList"],
    "za-nas/index.html": ["AboutPage", "AutoRepair", "BreadcrumbList"],
    "kontakti/index.html": ["ContactPage", "BreadcrumbList"],
    "usloviya-za-polzvane/index.html": ["WebPage", "BreadcrumbList"],
    "zashtita-na-dannite/index.html": ["WebPage", "BreadcrumbList"],
}

def extract_json_ld(html_content):
    pattern = re.compile(r'<script\s+type=["\']application/ld\+json["\']>([\s\S]*?)</script>', re.IGNORECASE)
    return pattern.findall(html_content)

def collect_types(data):
    types = set()
    def recurse(node):
        if isinstance(node, dict):
            if '@type' in node:
                t = node['@type']
                if isinstance(t, list):
                    for item in t:
                        types.add(item)
                else:
                    types.add(t)
            for v in node.values():
                recurse(v)
        elif isinstance(node, list):
            for item in node:
                recurse(item)
    recurse(data)
    return types

def main():
    print(f"Starting Schema.org Microdata Stress Test on {DIST_DIR}...")
    errors = []
    total_ld_blocks = 0

    # Specific required rich types from prompt:
    # CollectionPage, Service, VideoObject, WebApplication, DiagnosticProcedure, AboutPage, ContactPage, WebPage
    verified_rich_types = set()

    for route_rel, expected_types in EXPECTED_ROUTE_SCHEMAS.items():
        page_path = DIST_DIR / route_rel
        if not page_path.is_file():
            errors.append(f"Missing HTML file: {route_rel}")
            continue

        with open(page_path, 'r', encoding='utf-8') as f:
            html = f.read()

        blocks = extract_json_ld(html)
        if not blocks:
            errors.append(f"[{route_rel}] No <script type='application/ld+json'> found!")
            continue

        found_types_for_page = set()

        for idx, block in enumerate(blocks):
            total_ld_blocks += 1
            # 1. Check valid JSON
            try:
                data = json.loads(block)
            except Exception as e:
                errors.append(f"[{route_rel}] Block #{idx} invalid JSON: {e}")
                continue

            # 2. Check context
            if isinstance(data, dict):
                ctx = data.get('@context')
                if not ctx or 'schema.org' not in str(ctx).lower():
                    errors.append(f"[{route_rel}] Block #{idx} missing valid @context schema.org: {ctx}")
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        ctx = item.get('@context')
                        if ctx and 'schema.org' not in str(ctx).lower():
                            errors.append(f"[{route_rel}] Block #{idx} item missing valid @context: {ctx}")

            # Collect types
            types = collect_types(data)
            found_types_for_page.update(types)

            # Check detailed properties for root objects
            if isinstance(data, dict):
                ntype = data.get('@type')
                if ntype == 'AutoRepair':
                    for req_prop in ['name', 'telephone', 'address']:
                        if req_prop not in data:
                            errors.append(f"[{route_rel}] Top-level AutoRepair missing '{req_prop}'")
                elif ntype == 'BreadcrumbList':
                    if 'itemListElement' not in data:
                        errors.append(f"[{route_rel}] BreadcrumbList missing 'itemListElement'")
                elif ntype == 'VideoObject':
                    for req_prop in ['name', 'description', 'thumbnailUrl', 'contentUrl']:
                        if req_prop not in data:
                            errors.append(f"[{route_rel}] VideoObject missing '{req_prop}'")
                elif ntype == 'WebApplication':
                    for req_prop in ['name', 'applicationCategory']:
                        if req_prop not in data:
                            errors.append(f"[{route_rel}] WebApplication missing '{req_prop}'")
                elif ntype == 'DiagnosticProcedure':
                    if 'name' not in data:
                        errors.append(f"[{route_rel}] DiagnosticProcedure missing 'name'")

        # 4. Check that all expected types are present
        missing_types = [t for t in expected_types if t not in found_types_for_page]
        if missing_types:
            errors.append(f"[{route_rel}] Missing expected Schema types: {missing_types}. Found: {sorted(found_types_for_page)}")
        else:
            print(f"  ✓ [{route_rel}] Verified expected types: {expected_types}")
            for t in expected_types:
                verified_rich_types.add(t)

    # Verify all 8 prompt rich types are present across the site
    required_prompt_types = [
        "CollectionPage", "Service", "VideoObject", "WebApplication",
        "DiagnosticProcedure", "AboutPage", "ContactPage", "WebPage"
    ]
    missing_prompt_types = [t for t in required_prompt_types if t not in verified_rich_types]
    if missing_prompt_types:
        errors.append(f"Missing required rich types across site: {missing_prompt_types}")
    else:
        print(f"\n✅ All 8 required rich types {required_prompt_types} verified on their routes!")

    print("\n--- Schema.org Test Summary ---")
    print(f"Total pages validated: {len(EXPECTED_ROUTE_SCHEMAS)}")
    print(f"Total JSON-LD blocks parsed: {total_ld_blocks}")
    print(f"Errors found: {len(errors)}")

    if errors:
        print("\nERRORS DETECTED:")
        for err in errors:
            print(f"  ❌ {err}")
        sys.exit(1)
    else:
        print("\n✅ 100% PASS: All Schema.org JSON-LD microdata strictly verified with zero errors!")

if __name__ == '__main__':
    main()
