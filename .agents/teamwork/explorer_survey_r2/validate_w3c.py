import os
import glob
import requests
import json
import time

dist_dir = r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\dist"
html_files = sorted(glob.glob(os.path.join(dist_dir, "**", "*.html"), recursive=True))

headers = {
    "Content-Type": "text/html; charset=utf-8",
    "User-Agent": "W3C-Validation-Audit-Agent/1.0"
}
url = "https://validator.w3.org/nu/?out=json"

results = {}

for hf in html_files:
    rel = os.path.relpath(hf, dist_dir).replace("\\", "/")
    with open(hf, "rb") as f:
        data = f.read()
    
    try:
        r = requests.post(url, headers=headers, data=data, timeout=15)
        if r.status_code == 200:
            res_json = r.json()
            messages = res_json.get("messages", [])
            errors = [m for m in messages if m.get("type") == "error"]
            warnings = [m for m in messages if m.get("type") in ["info", "warning"] and m.get("subType") == "warning"]
            results[rel] = {
                "errors": len(errors),
                "warnings": len(warnings),
                "error_details": errors,
                "warning_details": warnings
            }
            print(f"[{rel}] Errors: {len(errors)}, Warnings: {len(warnings)}")
        else:
            print(f"[{rel}] HTTP {r.status_code}: {r.text[:200]}")
            results[rel] = {"status": r.status_code, "error": r.text[:200]}
    except Exception as e:
        print(f"[{rel}] Exception: {e}")
        results[rel] = {"exception": str(e)}
    
    time.sleep(1) # Be gentle with W3C service

with open(r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\explorer_survey_r2\w3c_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("W3C validation finished.")
