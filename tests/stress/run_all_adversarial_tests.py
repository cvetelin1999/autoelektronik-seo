import subprocess
import sys
import time

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

TEST_SUITES = [
    ("Adversarial Link, Image & Media Crawler", ["python", "tests/stress/test_adversarial_crawler.py"]),
    ("Metadata & Head Asset Verification", ["python", "tests/stress/test_metadata_and_head_assets.py"]),
    ("XML Sitemaps Schema & Strict Sequence Validation", ["python", "tests/stress/test_xml_schemas.py"]),
    ("Full Extension XSD Schema Validation (Google sitemap-image & video)", ["python", "tests/stress/test_xsd_extension_validation.py"]),
    ("Schema.org Microdata & Rich Types Stress Test", ["python", "tests/stress/test_schema_org_jsonld.py"]),
    ("Diagnostic Wizard Decision-Tree Stress Test (176 assertions)", ["node", "tests/stress/test_wizard_logic.mjs"]),
]

def main():
    print("=" * 70)
    print("  AUTOELEKTRONIK ADVERSARIAL END-TO-END STRESS TEST SUITE (M4)  ")
    print("=" * 70)

    start_time = time.time()
    all_passed = True
    results = []

    for name, cmd in TEST_SUITES:
        print(f"\n▶ Executing: {name}...")
        t0 = time.time()
        res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
        duration = time.time() - t0
        passed = (res.returncode == 0)
        results.append((name, passed, duration, res.stdout, res.stderr))

        if passed:
            print(f"  ✓ PASS ({duration:.2f}s)")
        else:
            print(f"  ❌ FAIL ({duration:.2f}s)")
            all_passed = False
            print("STDOUT:\n" + res.stdout)
            print("STDERR:\n" + res.stderr)

    total_duration = time.time() - start_time
    print("\n" + "=" * 70)
    print("                    STRESS TEST EXECUTION REPORT                    ")
    print("=" * 70)
    for name, passed, duration, _, _ in results:
        status_str = "PASS [✓]" if passed else "FAIL [❌]"
        print(f"  {status_str:10} | {duration:6.2f}s | {name}")

    print("-" * 70)
    print(f"Total time: {total_duration:.2f}s")
    if all_passed:
        print("OVERALL VERDICT: APPROVE (100% of adversarial stress tests passed)")
        sys.exit(0)
    else:
        print("OVERALL VERDICT: REQUEST_CHANGES (Failures detected)")
        sys.exit(1)

if __name__ == '__main__':
    main()
