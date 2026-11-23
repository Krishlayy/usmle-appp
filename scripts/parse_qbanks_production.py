import os
import re
import json
import zipfile
import html
import docx

WORKSPACE_DIR = r"C:\Users\hello\USMLE2"
FINAL_DIR = r"C:\Projects\MQB\Final"

BANKS_CONFIG = [
    {
        "slug": "autoimmune-diseases",
        "title": "Autoimmune Diseases Q-Bank",
        "specialtyTag": "Immunology / Rheumatology",
        "description": "Master SLE, Rheumatoid Arthritis, Scleroderma, Vasculitides, and HLA associations with high-yield distractor analysis and clinical recall mnemonics.",
        "docxPath": os.path.join(FINAL_DIR, "Autoimmune Disorders", "Autoimmune_Disease_Qbank_Q1-50_Revision.docx"),
        "imgSubdir": "autoimmune",
        "videoMapping": {
            1: "/videos/mnemonics/autoimmune/boardroom.mp4",
            2: "/videos/mnemonics/autoimmune/boardroom.mp4",
            3: "/videos/mnemonics/autoimmune/boardroom.mp4",
            4: "/videos/mnemonics/autoimmune/renovation.mp4",
            5: "/videos/mnemonics/autoimmune/renovation.mp4",
            6: "/videos/mnemonics/autoimmune/renovation.mp4",
            7: "/videos/mnemonics/autoimmune/renovation.mp4",
            8: "/videos/mnemonics/autoimmune/renovation.mp4",
            9: "/videos/mnemonics/autoimmune/motor-pool.mp4",
            35: "/videos/mnemonics/autoimmune/motor-pool.mp4",
            36: "/videos/mnemonics/autoimmune/motor-pool.mp4",
            10: "/videos/mnemonics/autoimmune/bamboo-stairwell.mp4",
            11: "/videos/mnemonics/autoimmune/bamboo-stairwell.mp4",
            12: "/videos/mnemonics/autoimmune/bamboo-stairwell.mp4",
            13: "/videos/mnemonics/autoimmune/cable-run.mp4",
            14: "/videos/mnemonics/autoimmune/cable-run.mp4",
            15: "/videos/mnemonics/autoimmune/cable-run.mp4",
            16: "/videos/mnemonics/autoimmune/cable-run.mp4",
            17: "/videos/mnemonics/autoimmune/wall-sockets.mp4",
            18: "/videos/mnemonics/autoimmune/wall-sockets.mp4",
            19: "/videos/mnemonics/autoimmune/wall-sockets.mp4",
            20: "/videos/mnemonics/autoimmune/wall-sockets.mp4",
            21: "/videos/mnemonics/autoimmune/wall-sockets.mp4",
            22: "/videos/mnemonics/autoimmune/thermostat.mp4",
            23: "/videos/mnemonics/autoimmune/thermostat.mp4",
            24: "/videos/mnemonics/autoimmune/thermostat.mp4",
            25: "/videos/mnemonics/autoimmune/thermostat.mp4",
            26: "/videos/mnemonics/autoimmune/thermostat.mp4",
            27: "/videos/mnemonics/autoimmune/supply-pipes.mp4",
            28: "/videos/mnemonics/autoimmune/supply-pipes.mp4",
            29: "/videos/mnemonics/autoimmune/supply-pipes.mp4",
            30: "/videos/mnemonics/autoimmune/filtration-plant.mp4",
            31: "/videos/mnemonics/autoimmune/filtration-plant.mp4",
            32: "/videos/mnemonics/autoimmune/filtration-plant.mp4",
            33: "/videos/mnemonics/autoimmune/filtration-plant.mp4",
            34: "/videos/mnemonics/autoimmune/control-room.mp4",
            37: "/videos/mnemonics/autoimmune/control-room.mp4",
            38: "/videos/mnemonics/autoimmune/control-room.mp4",
            39: "/videos/mnemonics/autoimmune/control-room.mp4",
            40: "/videos/mnemonics/autoimmune/the-walls.mp4",
            41: "/videos/mnemonics/autoimmune/the-walls.mp4",
            42: "/videos/mnemonics/autoimmune/the-walls.mp4",
            43: "/videos/mnemonics/autoimmune/the-walls.mp4",
            44: "/videos/mnemonics/autoimmune/water-plant.mp4",
            45: "/videos/mnemonics/autoimmune/water-plant.mp4",
            46: "/videos/mnemonics/autoimmune/water-plant.mp4",
            47: "/videos/mnemonics/autoimmune/water-plant.mp4",
            48: "/videos/mnemonics/autoimmune/blood-bank.mp4",
            49: "/videos/mnemonics/autoimmune/blood-bank.mp4",
            50: "/videos/mnemonics/autoimmune/blood-bank.mp4",
        }
    },
    {
        "slug": "biologics-and-their-targets",
        "title": "Biologics & Targeted Therapeutics",
        "specialtyTag": "Pharmacology / Oncology",
        "description": "Monoclonal antibodies, TNF inhibitors, checkpoint inhibitors, and receptor antagonists with precise clinical indication mechanisms.",
        "docxPath": os.path.join(FINAL_DIR, "Biologics", "2026-08-08_Biologics_and_Their_Targets_Qbank_Q1-50_Poojan_Draft_V5 (1).docx"),
        "imgSubdir": "biologics",
        "videoMapping": {
            2: "/videos/mnemonics/biologics/hot-t-bone.mp4",
            3: "/videos/mnemonics/biologics/hot-t-bone.mp4",
            6: "/videos/mnemonics/biologics/hot-t-bone.mp4",
            7: "/videos/mnemonics/biologics/hot-t-bone.mp4",
            8: "/videos/mnemonics/biologics/hot-t-bone.mp4",
            9: "/videos/mnemonics/biologics/hot-t-bone.mp4",
            11: "/videos/mnemonics/biologics/hot-t-bone.mp4",
            12: "/videos/mnemonics/biologics/hot-t-bone.mp4",
            1: "/videos/mnemonics/biologics/step-up-ladder.mp4",
            4: "/videos/mnemonics/biologics/step-up-ladder.mp4",
            5: "/videos/mnemonics/biologics/step-up-ladder.mp4",
            43: "/videos/mnemonics/biologics/step-up-ladder.mp4",
            13: "/videos/mnemonics/biologics/two-signals.mp4",
            14: "/videos/mnemonics/biologics/two-signals.mp4",
            15: "/videos/mnemonics/biologics/two-signals.mp4",
            16: "/videos/mnemonics/biologics/two-signals.mp4",
            17: "/videos/mnemonics/biologics/two-signals.mp4",
            18: "/videos/mnemonics/biologics/two-signals.mp4",
            19: "/videos/mnemonics/biologics/badge-scanner.mp4",
            20: "/videos/mnemonics/biologics/badge-scanner.mp4",
            21: "/videos/mnemonics/biologics/badge-scanner.mp4",
            22: "/videos/mnemonics/biologics/badge-scanner.mp4",
            23: "/videos/mnemonics/biologics/badge-scanner.mp4",
            24: "/videos/mnemonics/biologics/badge-scanner.mp4",
            50: "/videos/mnemonics/biologics/badge-scanner.mp4",
            36: "/videos/mnemonics/biologics/name-on-vial.mp4",
            45: "/videos/mnemonics/biologics/name-on-vial.mp4",
            46: "/videos/mnemonics/biologics/name-on-vial.mp4",
            47: "/videos/mnemonics/biologics/name-on-vial.mp4",
            48: "/videos/mnemonics/biologics/name-on-vial.mp4",
            25: "/videos/mnemonics/biologics/gate-check.mp4",
            26: "/videos/mnemonics/biologics/gate-check.mp4",
            27: "/videos/mnemonics/biologics/gate-check.mp4",
            32: "/videos/mnemonics/biologics/gate-check.mp4",
        }
    },
    {
        "slug": "immunodeficiency-disorders",
        "title": "Immunodeficiency Disorders Q-Bank",
        "specialtyTag": "Immunology / Genetics",
        "description": "SCID, Bruton Agammaglobulinemia, CVID, DiGeorge Syndrome, and complement deficiencies thoroughly mapped to visual memory anchors.",
        "docxPath": os.path.join(FINAL_DIR, "Immunodeficiency", "Copy of 2026-07-22_Immunodeficiency_Qbank_Q1-50_Poojan_Draft_V5.docx"),
        "imgSubdir": "immunodeficiency",
        "videoMapping": {
            1: "/videos/mnemonics/immunodeficiency/empty-nicu.mp4",
            2: "/videos/mnemonics/immunodeficiency/empty-nicu.mp4",
            3: "/videos/mnemonics/immunodeficiency/empty-nicu.mp4",
            4: "/videos/mnemonics/immunodeficiency/empty-nicu.mp4",
            5: "/videos/mnemonics/immunodeficiency/empty-nicu.mp4",
            6: "/videos/mnemonics/immunodeficiency/thymus-school.mp4",
            7: "/videos/mnemonics/immunodeficiency/thymus-school.mp4",
            8: "/videos/mnemonics/immunodeficiency/bubble-ward.mp4",
            10: "/videos/mnemonics/immunodeficiency/bubble-ward.mp4",
            11: "/videos/mnemonics/immunodeficiency/bubble-ward.mp4",
            12: "/videos/mnemonics/immunodeficiency/bubble-ward.mp4",
            9: "/videos/mnemonics/immunodeficiency/eczema-clinic.mp4",
            16: "/videos/mnemonics/immunodeficiency/eczema-clinic.mp4",
            13: "/videos/mnemonics/immunodeficiency/locked-doors.mp4",
            14: "/videos/mnemonics/immunodeficiency/locked-doors.mp4",
            15: "/videos/mnemonics/immunodeficiency/locked-doors.mp4",
            17: "/videos/mnemonics/immunodeficiency/locked-doors.mp4",
            18: "/videos/mnemonics/immunodeficiency/unregulated-wing.mp4",
            19: "/videos/mnemonics/immunodeficiency/unregulated-wing.mp4",
            20: "/videos/mnemonics/immunodeficiency/unregulated-wing.mp4",
            21: "/videos/mnemonics/immunodeficiency/fire-hall.mp4",
            22: "/videos/mnemonics/immunodeficiency/fire-hall.mp4",
            23: "/videos/mnemonics/immunodeficiency/fire-hall.mp4",
            24: "/videos/mnemonics/immunodeficiency/empty-roster.mp4",
            25: "/videos/mnemonics/immunodeficiency/empty-roster.mp4",
            26: "/videos/mnemonics/immunodeficiency/empty-roster.mp4",
            27: "/videos/mnemonics/immunodeficiency/empty-roster.mp4",
            28: "/videos/mnemonics/immunodeficiency/empty-roster.mp4",
            29: "/videos/mnemonics/immunodeficiency/utilities-room.mp4",
            30: "/videos/mnemonics/immunodeficiency/utilities-room.mp4",
            31: "/videos/mnemonics/immunodeficiency/utilities-room.mp4",
            32: "/videos/mnemonics/immunodeficiency/utilities-room.mp4",
            33: "/videos/mnemonics/immunodeficiency/utilities-room.mp4",
            34: "/videos/mnemonics/immunodeficiency/sabotaged-watch.mp4",
            35: "/videos/mnemonics/immunodeficiency/sabotaged-watch.mp4",
            36: "/videos/mnemonics/immunodeficiency/sabotaged-watch.mp4",
            37: "/videos/mnemonics/immunodeficiency/transplant-wing.mp4",
            38: "/videos/mnemonics/immunodeficiency/transplant-wing.mp4",
            39: "/videos/mnemonics/immunodeficiency/transplant-wing.mp4",
            40: "/videos/mnemonics/immunodeficiency/transplant-wing.mp4",
            41: "/videos/mnemonics/immunodeficiency/transplant-wing.mp4",
            42: "/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4",
            43: "/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4",
            44: "/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4",
            45: "/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4",
            46: "/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4",
            47: "/videos/mnemonics/immunodeficiency/pharmacy-floor-2.mp4",
            48: "/videos/mnemonics/immunodeficiency/pharmacy-floor-2.mp4",
            49: "/videos/mnemonics/immunodeficiency/pharmacy-floor-2.mp4",
            50: "/videos/mnemonics/immunodeficiency/pharmacy-floor-2.mp4",
        }
    }
]

def extract_images_from_docx(docx_path, out_dir, web_prefix):
    os.makedirs(out_dir, exist_ok=True)
    image_rel_map = {}
    with zipfile.ZipFile(docx_path, 'r') as z:
        # Read rels
        try:
            rels_xml = z.read('word/_rels/document.xml.rels').decode('utf-8', errors='ignore')
            for m in re.finditer(r'<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"', rels_xml):
                r_id, target = m.group(1), m.group(2)
                if 'media/' in target:
                    fname = os.path.basename(target)
                    image_rel_map[r_id] = (target, fname)
        except Exception as e:
            print(f"Error reading rels: {e}")

        # Extract all media files
        for name in z.namelist():
            if name.startswith('word/media/'):
                fname = os.path.basename(name)
                out_path = os.path.join(out_dir, fname)
                with open(out_path, 'wb') as f_out:
                    f_out.write(z.read(name))
                print(f"  Extracted image: {fname} ({os.path.getsize(out_path)} bytes)")

    rel_to_url = {}
    for r_id, (target, fname) in image_rel_map.items():
        rel_to_url[r_id] = f"{web_prefix}/{fname}"
    return rel_to_url

def table_to_html(tbl_elem):
    """Convert an arbitrary w:tbl element to clean, semantic, selectable HTML table."""
    doc_table = docx.table.Table(tbl_elem, None)
    rows_html = []
    
    for r_idx, row in enumerate(doc_table.rows):
        cells_html = []
        is_header = (r_idx == 0)
        cell_tag = "th" if is_header else "td"
        
        for c in row.cells:
            # cell text with preserved paragraphs
            cell_text = "<br>".join(p.text.strip() for p in c.paragraphs if p.text.strip())
            cell_text = html.escape(cell_text).replace("&lt;br&gt;", "<br>")
            
            # Shading check
            shd = c._element.xpath('.//w:shd/@w:fill')
            shd_class = ""
            if shd:
                val = shd[0].upper()
                if 'E8F5E9' in val or 'GREEN' in val:
                    shd_class = " bg-emerald-50 text-emerald-950 font-medium"
                elif 'FFF8E1' in val or 'YELLOW' in val:
                    shd_class = " bg-amber-50 text-amber-950 font-medium"
                elif 'FBE9E7' in val or 'RED' in val:
                    shd_class = " bg-rose-50 text-rose-950"
                elif 'F1F5F9' in val or 'F8FAFC' in val:
                    shd_class = " bg-slate-50 font-medium"

            if is_header:
                cells_html.append(f'<th class="border border-slate-300 p-2.5 bg-slate-100 font-bold text-slate-900 text-left{shd_class}">{cell_text}</th>')
            else:
                cells_html.append(f'<td class="border border-slate-300 p-2.5 text-slate-800 text-left leading-normal{shd_class}">{cell_text}</td>')
                
        rows_html.append(f'<tr>{"".join(cells_html)}</tr>')

    return (
        '<div class="overflow-x-auto my-6">'
        '<table class="qbank-table border-collapse w-full border border-slate-300 text-xs shadow-xs rounded bg-white">'
        f'<tbody>{"".join(rows_html)}</tbody>'
        '</table>'
        '</div>'
    )

def parse_bank(config):
    slug = config["slug"]
    docx_path = config["docxPath"]
    print(f"\n========================================================")
    print(f"Parsing QBank: {config['title']} ({slug})")
    print(f"Source file: {docx_path}")
    print(f"========================================================")

    out_img_dir = os.path.join(WORKSPACE_DIR, "public", "images", "qbank", config["imgSubdir"])
    web_img_prefix = f"/images/qbank/{config['imgSubdir']}"
    rel_to_url = extract_images_from_docx(docx_path, out_img_dir, web_img_prefix)
    print(f"Mapped {len(rel_to_url)} image relationships.")

    doc = docx.Document(docx_path)
    body = doc._element.body

    # Partition elements by question Q1..Q50
    q_elements = {}
    current_q = None
    current_title = ""

    for elem in body:
        tag = elem.tag.split('}')[-1]
        if tag == 'p':
            full_t = ''.join(elem.xpath('.//w:t/text()')).strip()
            m = re.match(r'^Q(\d+)\.\s*(.*)', full_t)
            if m:
                current_q = int(m.group(1))
                current_title = m.group(2).strip()
                q_elements[current_q] = {
                    "num": current_q,
                    "title": current_title,
                    "elements": []
                }
                continue
        if current_q is not None:
            q_elements[current_q]["elements"].append(elem)

    print(f"Partitioned {len(q_elements)} questions.")
    assert len(q_elements) == 50, f"Expected 50 questions, found {len(q_elements)}"

    parsed_questions = []

    for q_num in range(1, 51):
        q_data = q_elements[q_num]
        elements = q_data["elements"]
        title = q_data["title"]

        # Parse sections within the question
        section = "vignette"
        vignette_nodes = []
        options_table_elem = None
        answer_key = None
        explanation_nodes = []
        rationale_paragraphs = []
        reference_paragraphs = []

        for elem in elements:
            tag = elem.tag.split('}')[-1]
            if tag == 'p':
                t = ''.join(elem.xpath('.//w:t/text()')).strip()
                if re.match(r'^clinical\s*vignette$', t, re.IGNORECASE):
                    section = "vignette"
                    continue
                elif re.match(r'^answer\s*choices$', t, re.IGNORECASE):
                    section = "options"
                    continue
                elif re.match(r'^answer:\s*([A-E])', t, re.IGNORECASE):
                    m_ans = re.match(r'^answer:\s*([A-E])', t, re.IGNORECASE)
                    answer_key = m_ans.group(1).upper()
                    section = "after_options"
                    continue
                elif re.match(r'^concept\s*explanation$', t, re.IGNORECASE):
                    section = "explanation"
                    continue
                elif re.match(r'^why each option is right or wrong', t, re.IGNORECASE):
                    section = "rationale"
                    continue
                elif re.match(r'^references:?', t, re.IGNORECASE):
                    section = "references"
                    continue

                if section == "vignette":
                    vignette_nodes.append(elem)
                elif section == "explanation":
                    explanation_nodes.append(elem)
                elif section == "rationale":
                    if re.match(r'^[A-E]\.\s+', t):
                        rationale_paragraphs.append((t[0].upper(), t[2:].strip()))
                    else:
                        explanation_nodes.append(elem)
                elif section == "references":
                    reference_paragraphs.append(t)
            elif tag == 'tbl':
                if section == "options" and options_table_elem is None:
                    options_table_elem = elem
                    section = "after_options"
                else:
                    if section == "vignette":
                        vignette_nodes.append(elem)
                    else:
                        explanation_nodes.append(elem)

        # 1. Process Vignette
        vignette_html_parts = []
        vignette_images = []
        for elem in vignette_nodes:
            tag = elem.tag.split('}')[-1]
            if tag == 'p':
                t = ''.join(elem.xpath('.//w:t/text()')).strip()
                # Check for drawing
                drawings = elem.xpath('.//w:drawing')
                for d in drawings:
                    blip = d.xpath('.//@r:embed')
                    if blip and blip[0] in rel_to_url:
                        img_url = rel_to_url[blip[0]]
                        vignette_images.append(img_url)
                        vignette_html_parts.append(
                            f'<figure class="my-4 text-center">'
                            f'<img src="{img_url}" alt="Question Exhibit" class="max-w-md w-full h-auto rounded border border-slate-300 my-4 shadow-sm mx-auto cursor-pointer exhibit-trigger" />'
                            f'</figure>'
                        )
                if t:
                    vignette_html_parts.append(f'<p class="mb-4 text-base leading-relaxed text-slate-800">{html.escape(t)}</p>')
            elif tag == 'tbl':
                vignette_html_parts.append(table_to_html(elem))

        vignette_html = "".join(vignette_html_parts)

        # 2. Process Options Table
        assert options_table_elem is not None, f"Q{q_num} missing options table!"
        doc_tbl = docx.table.Table(options_table_elem, None)
        options = []
        green_found = None
        yellow_found = []

        # Map rationales
        rationale_map = {letter: r_text for letter, r_text in rationale_paragraphs}

        for row in doc_tbl.rows:
            opt_letter = row.cells[0].text.strip().rstrip('.').upper()
            opt_text = row.cells[1].text.strip() if len(row.cells) > 1 else ""
            indicator = row.cells[2].text.strip() if len(row.cells) > 2 else ""

            # Check shading and colors
            shd = [c._element.xpath('.//w:shd/@w:fill') for c in row.cells]
            clrs = [c._element.xpath('.//w:color/@w:val') for c in row.cells]
            text_all = ' '.join(c.text for c in row.cells)

            is_green = ('✓' in text_all) or any('E8F5E9' in s for s in shd) or any('2E7D32' in c for c in clrs) or (answer_key == opt_letter)
            is_yellow = ('~' in text_all) or any('FFF8E1' in s for s in shd) or any('B8860B' in c for c in clrs)

            if is_green:
                green_found = opt_letter
            elif is_yellow:
                yellow_found.append(opt_letter)

            options.append({
                "id": opt_letter,
                "text": opt_text,
                "isCorrect": bool(is_green),
                "isYellowDistractor": bool(is_yellow),
                "explanation": rationale_map.get(opt_letter, None)
            })

        if not green_found and answer_key:
            green_found = answer_key
            for opt in options:
                if opt["id"] == answer_key:
                    opt["isCorrect"] = True

        correct_answer = green_found or "A"

        # 3. Process Concept Explanation
        explanation_html_parts = []
        explanation_images = []

        explanation_html_parts.append(
            '<div class="concept-explanation space-y-4 text-slate-800 text-sm leading-relaxed">'
            '<h3 class="text-base font-bold font-serif text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">'
            '<span class="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>'
            'Concept Explanation'
            '</h3>'
        )

        for elem in explanation_nodes:
            tag = elem.tag.split('}')[-1]
            if tag == 'p':
                t = ''.join(elem.xpath('.//w:t/text()')).strip()
                drawings = elem.xpath('.//w:drawing')
                for d in drawings:
                    blip = d.xpath('.//@r:embed')
                    if blip and blip[0] in rel_to_url:
                        img_url = rel_to_url[blip[0]]
                        explanation_images.append(img_url)
                        explanation_html_parts.append(
                            f'<figure class="my-6 text-center">'
                            f'<img src="{img_url}" alt="Clinical Reference Exhibit" class="max-w-full h-auto rounded border border-slate-200 my-4 shadow-sm mx-auto cursor-pointer hover:opacity-95 transition-opacity" />'
                            f'</figure>'
                        )
                if t:
                    # Heading detection
                    if re.match(r'^(table|figure)\s*\d+[:.]', t, re.IGNORECASE):
                        explanation_html_parts.append(f'<p class="text-xs text-slate-500 font-medium italic my-2 text-center">{html.escape(t)}</p>')
                    elif re.match(r'^mnemonic[:.]', t, re.IGNORECASE):
                        explanation_html_parts.append(
                            f'<div class="my-4 p-3.5 bg-teal-50 border-l-4 border-teal-600 rounded-r-lg text-teal-900 font-medium text-xs shadow-2xs">'
                            f'{html.escape(t)}'
                            f'</div>'
                        )
                    elif re.match(r'^clinical\s*pearl[:.]?', t, re.IGNORECASE):
                        explanation_html_parts.append(
                            f'<div class="my-4 p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-950 font-medium text-xs shadow-2xs">'
                            f'⭐ {html.escape(t)}'
                            f'</div>'
                        )
                    elif re.match(r'^[A-Z0-9\s–—\(\)]{4,60}$', t) and len(t.split()) <= 8:
                        explanation_html_parts.append(f'<h4 class="text-sm font-bold text-slate-900 mt-6 mb-2">{html.escape(t)}</h4>')
                    else:
                        explanation_html_parts.append(f'<p class="mb-3 leading-relaxed">{html.escape(t)}</p>')
            elif tag == 'tbl':
                explanation_html_parts.append(table_to_html(elem))

        # Add Option Rationales Section
        explanation_html_parts.append(
            '<div class="mt-8 pt-6 border-t-2 border-slate-200">'
            '<h3 class="text-base font-bold font-serif text-slate-900 mb-4 flex items-center gap-2">'
            '<span class="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block"></span>'
            'Why Each Option Is Right or Wrong'
            '</h3>'
            '<div class="space-y-3">'
        )

        for opt in options:
            letter = opt["id"]
            r_text = opt["explanation"] or f"Option {letter} analysis."
            is_c = opt["isCorrect"]
            is_y = opt.get("isYellowDistractor", False)

            badge_color = "bg-emerald-100 text-emerald-800 border-emerald-300" if is_c else ("bg-amber-100 text-amber-800 border-amber-300" if is_y else "bg-slate-100 text-slate-700 border-slate-300")
            label_text = "CORRECT" if is_c else ("PLAUSIBLE DISTRACTOR" if is_y else "INCORRECT")

            explanation_html_parts.append(
                f'<div class="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs leading-relaxed">'
                f'<div class="flex items-center gap-2 mb-1.5">'
                f'<span class="font-bold text-xs font-mono px-2 py-0.5 rounded border {badge_color}">{letter}. {label_text}</span>'
                f'<span class="font-semibold text-xs text-slate-900">{html.escape(opt["text"])}</span>'
                f'</div>'
                f'<div class="text-xs text-slate-600 pl-1">{html.escape(r_text)}</div>'
                f'</div>'
            )

        explanation_html_parts.append('</div></div>')

        # Add References Section if present
        if reference_paragraphs:
            explanation_html_parts.append(
                '<div class="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">'
                '<div class="font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">References</div>'
            )
            for ref in reference_paragraphs:
                explanation_html_parts.append(f'<div class="pl-2 border-l border-slate-300">{html.escape(ref)}</div>')
            explanation_html_parts.append('</div>')

        explanation_html_parts.append('</div>')
        full_explanation_html = "".join(explanation_html_parts)

        # Video URL
        video_url = config["videoMapping"].get(q_num, None)

        parsed_questions.append({
            "num": q_num,
            "qid": f"{slug}-q{q_num:02d}",
            "title": title,
            "questionText": vignette_html,
            "options": options,
            "correctAnswer": correct_answer,
            "acceptableAnswers": [correct_answer] + yellow_found,
            "explanation": full_explanation_html,
            "difficulty": "medium",
            "subtopic": title,
            "videoUrl": video_url,
            "vignetteImages": vignette_images,
            "explanationImages": explanation_images,
        })

    return {
        "slug": slug,
        "title": config["title"],
        "specialtyTag": config["specialtyTag"],
        "description": config["description"],
        "questions": parsed_questions
    }

def main():
    all_banks = []
    for cfg in BANKS_CONFIG:
        bank_data = parse_bank(cfg)
        all_banks.append(bank_data)

    out_file = os.path.join(WORKSPACE_DIR, "scripts", "qbanks_parsed_all.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_banks, f, indent=2, ensure_ascii=False)

    print(f"\n========================================================")
    print(f"SUCCESS: Successfully parsed all {len(all_banks)} QBanks!")
    for b in all_banks:
        total_q = len(b["questions"])
        total_v_img = sum(len(q["vignetteImages"]) for q in b["questions"])
        total_e_img = sum(len(q["explanationImages"]) for q in b["questions"])
        with_video = sum(1 for q in b["questions"] if q["videoUrl"])
        print(f"  • {b['title']}: {total_q} Qs | {total_v_img} Vignette Imgs | {total_e_img} Expl Imgs | {with_video} Videos")
    print(f"Saved complete seed payload to {out_file}")
    print(f"========================================================")

if __name__ == "__main__":
    main()
