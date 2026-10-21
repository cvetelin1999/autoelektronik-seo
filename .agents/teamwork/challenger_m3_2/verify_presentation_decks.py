import json
import re
from pathlib import Path

def audit():
    repo_root = Path(r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen")
    deck5_path = repo_root / "docs" / "05-Mini-Project-Presentation-Deck.md"
    deck6_path = repo_root / "docs" / "06-Final-Project-Presentation-Deck.md"

    results = {}

    for file_path, expected_count in [(deck5_path, 12), (deck6_path, 16)]:
        content = file_path.read_text(encoding="utf-8")
        lines = content.splitlines()

        slide_pattern = re.compile(r"^##\s+Слайд\s+(\d+):\s*(.*)$")
        qa_pattern = re.compile(r"^##\s+Секция за Защита.*$")

        slides = []
        current_slide = None

        for idx, line in enumerate(lines, 1):
            m = slide_pattern.match(line)
            if m:
                if current_slide:
                    slides.append(current_slide)
                current_slide = {
                    "num": int(m.group(1)),
                    "title": m.group(2).strip(),
                    "start_line": idx,
                    "lines": [],
                }
            elif qa_pattern.match(line):
                if current_slide:
                    slides.append(current_slide)
                    current_slide = None
            else:
                if current_slide:
                    current_slide["lines"].append(line)

        if current_slide:
            slides.append(current_slide)

        slide_audits = []
        for s in slides:
            text = "\n".join(s["lines"])
            has_blueprint = bool(re.search(r"###\s*1\.\s*Визуален план и оформление", text, re.IGNORECASE))
            has_bullets = bool(re.search(r"###\s*2\.\s*Опорни точки", text, re.IGNORECASE))
            has_notes = bool(re.search(r"###\s*3\.\s*.*(?:Speaker Notes|текст за устна защита)", text, re.IGNORECASE))
            notes_match = re.search(r"###\s*3\.\s*.*(?:Speaker Notes|текст за устна защита).*?\n([\s\S]*?)(?=(?:---|\Z))", text, re.IGNORECASE)
            notes_content = notes_match.group(1).strip() if notes_match else ""
            cyrillic_chars = len(re.findall(r"[\u0400-\u04FF]", notes_content))
            word_count = len(notes_content.split())

            slide_audits.append({
                "num": s["num"],
                "title": s["title"],
                "has_blueprint": has_blueprint,
                "has_bullets": has_bullets,
                "has_notes": has_notes,
                "notes_word_count": word_count,
                "notes_cyrillic_chars": cyrillic_chars,
                "status": "PASS" if (has_blueprint and has_bullets and has_notes and word_count >= 50 and cyrillic_chars >= 100) else "FAIL"
            })

        # QA check
        qa_match = re.search(r"##\s+Секция за Защита.*?\n([\s\S]*)$", content)
        qa_list = []
        if qa_match:
            qa_text = qa_match.group(1)
            raw_qas = re.findall(r"###\s*Въпрос\s*(\d+).*?:\s*\n\s*\*([^*]+)\*([\s\S]*?)(?=(?:###\s*Въпрос|\Z))", qa_text)
            for q_num, q_title, q_body in raw_qas:
                qa_list.append({
                    "q_num": int(q_num),
                    "question": q_title.strip(),
                    "answer_words": len(q_body.split()),
                    "answer_cyrillic": len(re.findall(r"[\u0400-\u04FF]", q_body)),
                    "answer_excerpt": q_body.strip()[:200]
                })

        results[file_path.name] = {
            "file_size": len(content.encode("utf-8")),
            "line_count": len(lines),
            "slide_count": len(slides),
            "expected_slide_count": expected_count,
            "count_matches": len(slides) == expected_count,
            "numbering_matches": [s["num"] for s in slides] == list(range(1, expected_count + 1)),
            "slides": slide_audits,
            "qas": qa_list
        }

    out_file = Path(r"c:\Users\Asus\Documents\antigravity\hopeful-bardeen\.agents\teamwork\challenger_m3_2\verification_results.json")
    out_file.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Results written to {out_file}")

if __name__ == "__main__":
    audit()
