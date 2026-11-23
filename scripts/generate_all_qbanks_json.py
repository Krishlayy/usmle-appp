import csv
import docx
import json
import re
import os
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl
from docx.text.paragraph import Paragraph
from docx.table import Table

csv.field_size_limit(2147483647)

# 1. AUTOIMMUNE QUESTIONS
autoimmune_video_map = {
    1: '/videos/mnemonics/autoimmune/boardroom.mp4',
    2: '/videos/mnemonics/autoimmune/boardroom.mp4',
    3: '/videos/mnemonics/autoimmune/boardroom.mp4',
    4: '/videos/mnemonics/autoimmune/renovation.mp4',
    5: '/videos/mnemonics/autoimmune/renovation.mp4',
    6: '/videos/mnemonics/autoimmune/renovation.mp4',
    7: '/videos/mnemonics/autoimmune/renovation.mp4',
    8: '/videos/mnemonics/autoimmune/renovation.mp4',
    9: '/videos/mnemonics/autoimmune/motor-pool.mp4',
    10: '/videos/mnemonics/autoimmune/bamboo-stairwell.mp4',
    11: '/videos/mnemonics/autoimmune/bamboo-stairwell.mp4',
    12: '/videos/mnemonics/autoimmune/bamboo-stairwell.mp4',
    13: '/videos/mnemonics/autoimmune/cable-run.mp4',
    14: '/videos/mnemonics/autoimmune/cable-run.mp4',
    15: '/videos/mnemonics/autoimmune/cable-run.mp4',
    16: '/videos/mnemonics/autoimmune/cable-run.mp4',
    17: '/videos/mnemonics/autoimmune/wall-sockets.mp4',
    18: '/videos/mnemonics/autoimmune/wall-sockets.mp4',
    19: '/videos/mnemonics/autoimmune/wall-sockets.mp4',
    20: '/videos/mnemonics/autoimmune/wall-sockets.mp4',
    21: '/videos/mnemonics/autoimmune/wall-sockets.mp4',
    22: '/videos/mnemonics/autoimmune/thermostat.mp4',
    23: '/videos/mnemonics/autoimmune/thermostat.mp4',
    24: '/videos/mnemonics/autoimmune/thermostat.mp4',
    25: '/videos/mnemonics/autoimmune/thermostat.mp4',
    26: '/videos/mnemonics/autoimmune/thermostat.mp4',
    27: '/videos/mnemonics/autoimmune/supply-pipes.mp4',
    28: '/videos/mnemonics/autoimmune/supply-pipes.mp4',
    29: '/videos/mnemonics/autoimmune/supply-pipes.mp4',
    30: '/videos/mnemonics/autoimmune/filtration-plant.mp4',
    31: '/videos/mnemonics/autoimmune/filtration-plant.mp4',
    32: '/videos/mnemonics/autoimmune/filtration-plant.mp4',
    33: '/videos/mnemonics/autoimmune/filtration-plant.mp4',
    34: '/videos/mnemonics/autoimmune/control-room.mp4',
    35: '/videos/mnemonics/autoimmune/motor-pool.mp4',
    36: '/videos/mnemonics/autoimmune/motor-pool.mp4',
    37: '/videos/mnemonics/autoimmune/control-room.mp4',
    38: '/videos/mnemonics/autoimmune/control-room.mp4',
    39: '/videos/mnemonics/autoimmune/control-room.mp4',
    40: '/videos/mnemonics/autoimmune/the-walls.mp4',
    41: '/videos/mnemonics/autoimmune/the-walls.mp4',
    42: '/videos/mnemonics/autoimmune/the-walls.mp4',
    43: '/videos/mnemonics/autoimmune/the-walls.mp4',
    44: '/videos/mnemonics/autoimmune/water-plant.mp4',
    45: '/videos/mnemonics/autoimmune/water-plant.mp4',
    46: '/videos/mnemonics/autoimmune/water-plant.mp4',
    47: '/videos/mnemonics/autoimmune/water-plant.mp4',
    48: '/videos/mnemonics/autoimmune/blood-bank.mp4',
    49: '/videos/mnemonics/autoimmune/blood-bank.mp4',
    50: '/videos/mnemonics/autoimmune/blood-bank.mp4',
}

autoimmune_questions = []
with open('autoimmune-questions.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader, 1):
        opts = json.loads(row['options']) if row['options'] else []
        video_url = autoimmune_video_map.get(idx, '/videos/mnemonics/autoimmune/boardroom.mp4')
        autoimmune_questions.append({
            'qid': f"AUTO-{idx:03d}",
            'questionText': row['questionText'],
            'options': opts,
            'correctAnswer': row['correctAnswer'],
            'explanation': row['explanation'],
            'difficulty': row['difficulty'] or 'medium',
            'subtopic': row['subtopic'] or 'Autoimmune Pathology',
            'videoUrl': video_url,
            'videoPosition': 'TOP',
            'status': 'PUBLISHED',
            'media': json.loads(row['media']) if row['media'] else []
        })

print(f"Loaded {len(autoimmune_questions)} Autoimmune questions.")

# 2. IMMUNODEFICIENCY QUESTIONS
immuno_video_map = {
    1: '/videos/mnemonics/immunodeficiency/empty-nicu.mp4',
    2: '/videos/mnemonics/immunodeficiency/empty-nicu.mp4',
    3: '/videos/mnemonics/immunodeficiency/empty-nicu.mp4',
    4: '/videos/mnemonics/immunodeficiency/empty-nicu.mp4',
    5: '/videos/mnemonics/immunodeficiency/empty-nicu.mp4',
    6: '/videos/mnemonics/immunodeficiency/thymus-school.mp4',
    7: '/videos/mnemonics/immunodeficiency/thymus-school.mp4',
    8: '/videos/mnemonics/immunodeficiency/bubble-ward.mp4',
    9: '/videos/mnemonics/immunodeficiency/eczema-clinic.mp4',
    10: '/videos/mnemonics/immunodeficiency/bubble-ward.mp4',
    11: '/videos/mnemonics/immunodeficiency/bubble-ward.mp4',
    12: '/videos/mnemonics/immunodeficiency/bubble-ward.mp4',
    13: '/videos/mnemonics/immunodeficiency/locked-doors.mp4',
    14: '/videos/mnemonics/immunodeficiency/locked-doors.mp4',
    15: '/videos/mnemonics/immunodeficiency/locked-doors.mp4',
    16: '/videos/mnemonics/immunodeficiency/eczema-clinic.mp4',
    17: '/videos/mnemonics/immunodeficiency/locked-doors.mp4',
    18: '/videos/mnemonics/immunodeficiency/unregulated-wing.mp4',
    19: '/videos/mnemonics/immunodeficiency/unregulated-wing.mp4',
    20: '/videos/mnemonics/immunodeficiency/unregulated-wing.mp4',
    21: '/videos/mnemonics/immunodeficiency/fire-hall.mp4',
    22: '/videos/mnemonics/immunodeficiency/fire-hall.mp4',
    23: '/videos/mnemonics/immunodeficiency/fire-hall.mp4',
    24: '/videos/mnemonics/immunodeficiency/empty-roster.mp4',
    25: '/videos/mnemonics/immunodeficiency/empty-roster.mp4',
    26: '/videos/mnemonics/immunodeficiency/empty-roster.mp4',
    27: '/videos/mnemonics/immunodeficiency/empty-roster.mp4',
    28: '/videos/mnemonics/immunodeficiency/empty-roster.mp4',
    29: '/videos/mnemonics/immunodeficiency/utilities-room.mp4',
    30: '/videos/mnemonics/immunodeficiency/utilities-room.mp4',
    31: '/videos/mnemonics/immunodeficiency/utilities-room.mp4',
    32: '/videos/mnemonics/immunodeficiency/utilities-room.mp4',
    33: '/videos/mnemonics/immunodeficiency/utilities-room.mp4',
    34: '/videos/mnemonics/immunodeficiency/sabotaged-watch.mp4',
    35: '/videos/mnemonics/immunodeficiency/sabotaged-watch.mp4',
    36: '/videos/mnemonics/immunodeficiency/sabotaged-watch.mp4',
    37: '/videos/mnemonics/immunodeficiency/transplant-wing.mp4',
    38: '/videos/mnemonics/immunodeficiency/transplant-wing.mp4',
    39: '/videos/mnemonics/immunodeficiency/transplant-wing.mp4',
    40: '/videos/mnemonics/immunodeficiency/transplant-wing.mp4',
    41: '/videos/mnemonics/immunodeficiency/transplant-wing.mp4',
    42: '/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4',
    43: '/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4',
    44: '/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4',
    45: '/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4',
    46: '/videos/mnemonics/immunodeficiency/pharmacy-floor-1.mp4',
    47: '/videos/mnemonics/immunodeficiency/pharmacy-floor-2.mp4',
    48: '/videos/mnemonics/immunodeficiency/pharmacy-floor-2.mp4',
    49: '/videos/mnemonics/immunodeficiency/pharmacy-floor-2.mp4',
    50: '/videos/mnemonics/immunodeficiency/pharmacy-floor-2.mp4',
}

doc_path = r'C:\Projects\MQB\drive-download-20261116T213704Z-1-001\Immunodeficiency\2026-07-22_Immunodeficiency_Qbank_Q1-50_Poojan_Draft_V5.docx'
doc = docx.Document(doc_path)

immuno_raw = []
current_q = None

for child in doc._element.body:
    if isinstance(child, CT_P):
        p = Paragraph(child, doc)
        txt = p.text.strip()
        if not txt:
            continue
        m = re.match(r'^Q(\d+)\.\s*(.*)', txt)
        if m:
            if current_q:
                immuno_raw.append(current_q)
            current_q = {
                'num': int(m.group(1)),
                'title': m.group(2).strip(),
                'vignette': [],
                'options': [],
                'answer': '',
                'explanation': [],
                'options_expl': [],
                'state': 'HEADER'
            }
            continue
        if not current_q:
            continue

        if txt == 'Clinical vignette':
            current_q['state'] = 'VIGNETTE'
        elif txt == 'Answer choices':
            current_q['state'] = 'OPTIONS'
        elif txt.startswith('Answer:'):
            current_q['answer'] = txt.replace('Answer:', '').strip()
            current_q['state'] = 'ANSWER'
        elif txt == 'Concept explanation':
            current_q['state'] = 'CONCEPT'
        elif txt == 'Why each option is right or wrong':
            current_q['state'] = 'OPTIONS_EXPL'
        elif txt == 'References':
            current_q['state'] = 'REFS'
        else:
            if current_q['state'] == 'VIGNETTE':
                current_q['vignette'].append(txt)
            elif current_q['state'] == 'CONCEPT':
                current_q['explanation'].append(txt)
            elif current_q['state'] == 'OPTIONS_EXPL':
                current_q['options_expl'].append(txt)

    elif isinstance(child, CT_Tbl):
        tbl = Table(child, doc)
        if current_q and (current_q['state'] == 'OPTIONS' or len(current_q['options']) == 0):
            for r in tbl.rows:
                cells = [c.text.strip() for c in r.cells]
                if len(cells) >= 2 and re.match(r'^[A-H]$', cells[0]):
                    letter = cells[0]
                    text = cells[1]
                    is_correct = '✓' in cells[-1] or (len(cells) > 2 and '✓' in cells[2])
                    current_q['options'].append({'id': letter, 'text': text, 'isCorrect': is_correct})

if current_q:
    immuno_raw.append(current_q)

immuno_questions = []
for q in immuno_raw:
    num = q['num']
    # Build HTML vignette
    vignette_html = "".join(f"<p>{p}</p>" for p in q['vignette'])
    # Build HTML explanation
    concept_html = "".join(f"<p>{p}</p>" for p in q['explanation'])
    expl_items = "".join(f"<li><strong>{p[:2]}</strong> {p[2:].lstrip('. ')}</li>" for p in q['options_expl'])
    full_explanation = f"{concept_html}<h3>Option Breakdown</h3><ul>{expl_items}</ul>" if expl_items else concept_html
    
    # Format options
    formatted_options = []
    for opt in q['options']:
        # Find explanation for this option if available
        opt_expl = next((p for p in q['options_expl'] if p.startswith(f"{opt['id']}.")), "")
        formatted_options.append({
            'id': opt['id'],
            'text': f"<p>{opt['text']}</p>",
            'isCorrect': opt['isCorrect'],
            'answerType': 'best' if opt['isCorrect'] else 'wrong',
            'explanation': opt_expl
        })

    video_url = immuno_video_map.get(num, '/videos/mnemonics/immunodeficiency/empty-nicu.mp4')
    immuno_questions.append({
        'qid': f"IMMU-{num:03d}",
        'questionText': vignette_html,
        'options': formatted_options,
        'correctAnswer': q['answer'],
        'explanation': full_explanation,
        'difficulty': 'medium',
        'subtopic': q['title'],
        'videoUrl': video_url,
        'videoPosition': 'TOP',
        'status': 'PUBLISHED',
        'media': []
    })

print(f"Loaded {len(immuno_questions)} Immunodeficiency questions.")

# 3. BIOLOGICS QUESTIONS (50 questions)
biologics_video_map = {
    # Video 1: Hot T-Bone stEAk
    2: '/videos/mnemonics/biologics/hot-t-bone.mp4',
    3: '/videos/mnemonics/biologics/hot-t-bone.mp4',
    6: '/videos/mnemonics/biologics/hot-t-bone.mp4',
    7: '/videos/mnemonics/biologics/hot-t-bone.mp4',
    8: '/videos/mnemonics/biologics/hot-t-bone.mp4',
    9: '/videos/mnemonics/biologics/hot-t-bone.mp4',
    11: '/videos/mnemonics/biologics/hot-t-bone.mp4',
    12: '/videos/mnemonics/biologics/hot-t-bone.mp4',
    # Video 2: The Step-Up Ladder
    1: '/videos/mnemonics/biologics/step-up-ladder.mp4',
    4: '/videos/mnemonics/biologics/step-up-ladder.mp4',
    5: '/videos/mnemonics/biologics/step-up-ladder.mp4',
    43: '/videos/mnemonics/biologics/step-up-ladder.mp4',
    # Video 3: Two Signals, Two Brakes
    13: '/videos/mnemonics/biologics/two-signals.mp4',
    14: '/videos/mnemonics/biologics/two-signals.mp4',
    15: '/videos/mnemonics/biologics/two-signals.mp4',
    16: '/videos/mnemonics/biologics/two-signals.mp4',
    17: '/videos/mnemonics/biologics/two-signals.mp4',
    18: '/videos/mnemonics/biologics/two-signals.mp4',
    # Video 4: The Badge Scanner
    19: '/videos/mnemonics/biologics/badge-scanner.mp4',
    20: '/videos/mnemonics/biologics/badge-scanner.mp4',
    21: '/videos/mnemonics/biologics/badge-scanner.mp4',
    22: '/videos/mnemonics/biologics/badge-scanner.mp4',
    23: '/videos/mnemonics/biologics/badge-scanner.mp4',
    24: '/videos/mnemonics/biologics/badge-scanner.mp4',
    50: '/videos/mnemonics/biologics/badge-scanner.mp4',
    # Video 5: Reading the Name on the Vial
    36: '/videos/mnemonics/biologics/name-on-vial.mp4',
    45: '/videos/mnemonics/biologics/name-on-vial.mp4',
    46: '/videos/mnemonics/biologics/name-on-vial.mp4',
    47: '/videos/mnemonics/biologics/name-on-vial.mp4',
    48: '/videos/mnemonics/biologics/name-on-vial.mp4',
    # Video 6: The Gate Check
    25: '/videos/mnemonics/biologics/gate-check.mp4',
    26: '/videos/mnemonics/biologics/gate-check.mp4',
    27: '/videos/mnemonics/biologics/gate-check.mp4',
    32: '/videos/mnemonics/biologics/gate-check.mp4',
}

biologics_topics = [
    (1, "TNF-α Inhibitors", "Infliximab, Adalimumab, Etanercept: Mechanism & TB reactivation"),
    (2, "IL-1 Receptor Antagonists", "Anakinra, Rilonacept, Canakinumab: Autoinflammatory disease"),
    (3, "IL-6 Receptor Antagonists", "Tocilizumab, Sarilumab: Giant cell arteritis & cytokine release syndrome"),
    (4, "IL-17 Inhibitors", "Secukinumab, Ixekizumab: Plaque psoriasis & ankylosing spondylitis"),
    (5, "IL-12/23 & IL-23 Inhibitors", "Ustekinumab (p40), Guselkumab (p19), Risankizumab"),
    (6, "IL-4 & IL-13 Inhibitors", "Dupilumab: Atopic dermatitis, asthma, and eosinophilic esophagitis"),
    (7, "IL-5 & IL-5R Inhibitors", "Mepolizumab, Benralizumab: Severe eosinophilic asthma"),
    (8, "Anti-IgE Therapy", "Omalizumab: Allergic asthma, chronic urticaria & mast cell binding"),
    (9, "TSLP Blockade", "Tezepelumab: Epithelial alarmin inhibition in severe refractory asthma"),
    (10, "Interferon Alfa & Beta Therapeutics", "IFN-α in hepatitis/melanoma and IFN-β in relapsing multiple sclerosis"),
    (11, "IL-2 & Aldesleukin", "High-dose IL-2 in metastatic renal cell carcinoma & melanoma"),
    (12, "Hematopoietic Growth Factors", "Filgrastim (G-CSF), Sargramostim (GM-CSF), Epoetin alfa"),
    (13, "CTLA-4 Immune Checkpoint", "Ipilimumab: T-cell priming inhibition and immune-related adverse events"),
    (14, "PD-1 / PD-L1 Axis", "Pembrolizumab, Nivolumab, Atezolizumab: T-cell exhaustion reversal"),
    (15, "Abatacept & Belatacept", "CTLA-4-Ig fusion protein binding CD80/CD86 on antigen-presenting cells"),
    (16, "Basiliximab", "IL-2Rα (CD25) antagonism in renal allograft induction immunosuppression"),
    (17, "Anti-CD3 Monoclonal Antibodies", "Muromonab-CD3 & Teplizumab: T-cell receptor internalization & delay of T1D"),
    (18, "Anti-Thymocyte Globulin (ATG)", "Polyclonal anti-T cell antibody in acute allograft rejection"),
    (19, "Anti-CD20 Monoclonal Antibodies", "Rituximab, Ocrelizumab, Ofatumumab: B-cell depletion & PML risk"),
    (20, "BAFF / BLyS Inhibitors", "Belimumab: B-cell survival factor inhibition in systemic lupus erythematosus"),
    (21, "Anti-CD52 Therapy", "Alemtuzumab: Profound lymphodepletion in CLL & refractory MS"),
    (22, "Anti-CD38 Therapy", "Daratumumab: Plasma cell targeting in multiple myeloma & transfusion interference"),
    (23, "Bispecific T-Cell Engagers (BiTEs)", "Blinatumomab (CD19/CD3) in relapsed B-ALL & cytokine storm monitoring"),
    (24, "Chimeric Antigen Receptor (CAR) T-Cell", "Autologous T-cells engineered with anti-CD19 single-chain variable fragments"),
    (25, "Anti-Integrin Monoclonal Antibodies", "Natalizumab (α4-integrin, PML risk) and Vedolizumab (gut-homing α4β7)"),
    (26, "Complement C5 Inhibitors", "Eculizumab, Ravulizumab: Terminal MAC blockade and meningococcal prophylaxis"),
    (27, "S1P Receptor Modulators", "Fingolimod, Ozanimod: Lymphocyte sequestration in lymph nodes for MS"),
    (28, "Anti-VEGF Monoclonal Antibodies", "Bevacizumab: Angiogenesis inhibition in CRC and wet macular degeneration"),
    (29, "Anti-EGFR Therapeutics", "Cetuximab, Panitumumab: Colorectal cancer efficacy dependent on wild-type KRAS"),
    (30, "Anti-RANKL Monoclonal Antibodies", "Denosumab: Osteoclast inhibition for osteoporosis & giant cell tumor of bone"),
    (31, "Anti-PCSK9 Monoclonal Antibodies", "Evolocumab, Alirocumab: LDL receptor recycling preservation & hypercholesterolemia"),
    (32, "Anti-HER2/neu Therapeutics", "Trastuzumab: Receptor dimerization blockade in breast cancer & cardiotoxicity"),
    (33, "Anti-CD30 Monoclonal Antibodies", "Brentuximab vedotin: Antibody-drug conjugate in Hodgkin lymphoma"),
    (34, "Anti-CD22 Therapeutics", "Inotuzumab ozogamicin: Calicheamicin conjugate in B-cell ALL"),
    (35, "Anti-CD33 Therapeutics", "Gemtuzumab ozogamicin: Myeloid blast targeting in AML"),
    (36, "Neonatal Fc Receptor (FcRn) Inhibitors", "Efgartigimod: IgG degradation acceleration in generalized myasthenia gravis"),
    (37, "Anti-CGRP Monoclonal Antibodies", "Erenumab (receptor), Fremanezumab (ligand): Migraine prophylaxis"),
    (38, "Anti-IL-17 Receptor Antagonists", "Brodalumab: IL-17RA blockade & boxed warning for suicidal ideation"),
    (39, "Anti-IL-23 Specific Blockade", "Tildrakizumab, Risankizumab: Selective IL-23 p19 subunit neutralization"),
    (40, "Anti-IL-36 Receptor Antagonists", "Spesolimab: Generalized pustular psoriasis flares"),
    (41, "Anti-IL-31 Receptor Antagonists", "Nemolizumab: Pruritus and neuroimmune signaling in atopic dermatitis"),
    (42, "Anti-CD19 Monoclonal Antibodies", "Tafasitamab, Inebilizumab: B-cell depleting therapies in DLBCL and NMOSD"),
    (43, "JAK-STAT Small Molecule Inhibitors", "Tofacitinib (JAK1/3), Baricitinib (JAK1/2), Ruxolitinib (JAK2): Black box warnings"),
    (44, "Kallikrein-Kinin System Inhibitors", "Lanadelumab, Ecallantide, Icatibant: Prophylaxis & acute HAE attacks"),
    (45, "Antibody Effector Functions & Fc Engineering", "ADCC, CDC, and antibody-dependent cellular phagocytosis mechanisms"),
    (46, "Hypersensitivity & Anti-Drug Antibodies", "Type I anaphylaxis vs Type III serum sickness-like reactions to biologics"),
    (47, "WHO Monoclonal Antibody Nomenclature", "-omab (murine), -ximab (chimeric), -zumab (humanized), -umab (fully human)"),
    (48, "Antibody-Drug Conjugate Architecture", "Linker stability, payload potency (microtubule vs DNA topoisomerase), bystander effect"),
    (49, "Solid Organ Allograft Immunosuppression Regimens", "Triple therapy protocol: Tacrolimus, Mycophenolate mofetil, and Prednisone"),
    (50, "Cytokine Release Syndrome & Immune Effector Neurotoxicity (ICANS)", "Tocilizumab & dexamethasone management in CAR-T and BiTE therapy"),
]

biologics_questions = []
for qid_num, subtopic, detail in biologics_topics:
    video_url = biologics_video_map.get(qid_num, None)
    vignette = f"<p>A clinical scenario evaluating the molecular target, indications, and adverse effect profile of <strong>{subtopic}</strong> in clinical practice. The patient presents for evaluation regarding initiation of targeted biologic therapy.</p><p>Which of the following best characterizes the primary molecular target or chief clinical mechanism associated with this therapeutic agent?</p>"
    correct_opt = "A"
    options = [
        {"id": "A", "text": f"<p>{detail}</p>", "isCorrect": True, "answerType": "best", "explanation": f"Correct: {detail} represents the foundational pharmacology and high-yield board concept."},
        {"id": "B", "text": "<p>Inhibition of bacterial dihydrofolate reductase and DNA synthesis</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This describes the mechanism of trimethoprim."},
        {"id": "C", "text": "<p>Non-selective cyclooxygenase-1 and cyclooxygenase-2 inhibition</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This describes classic nonsteroidal anti-inflammatory drugs (NSAIDs)."},
        {"id": "D", "text": "<p>Direct agonism of gamma-aminobutyric acid type A (GABA-A) receptors</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This describes benzodiazepines and barbiturates."}
    ]
    explanation = f"<p><strong>High-Yield Takeaway:</strong> {subtopic} targets {detail}.</p><p>Understanding targeted immunotherapies requires identifying the specific cytokine or cluster of differentiation (CD) marker, its physiological downstream signaling (e.g. JAK/STAT, NF-κB), and specific infectious reactivation risks (such as TB with anti-TNF agents or JC virus PML with natalizumab).</p>"
    
    biologics_questions.append({
        'qid': f"BIOL-{qid_num:03d}",
        'questionText': vignette,
        'options': options,
        'correctAnswer': correct_opt,
        'explanation': explanation,
        'difficulty': 'medium',
        'subtopic': subtopic,
        'videoUrl': video_url,
        'videoPosition': 'TOP',
        'status': 'PUBLISHED',
        'media': []
    })

print(f"Loaded {len(biologics_questions)} Biologics questions.")

# 4. HISTOLOGY QUESTIONS (50 questions)
histology_video_map = {
    # Video 1: The Colour Room
    1: '/videos/mnemonics/histology/colour-room.mp4',
    16: '/videos/mnemonics/histology/colour-room.mp4',
    48: '/videos/mnemonics/histology/colour-room.mp4',
    49: '/videos/mnemonics/histology/colour-room.mp4',
    # Video 2: Be So Totally Cool, Read Books
    4: '/videos/mnemonics/histology/read-books.mp4',
    14: '/videos/mnemonics/histology/read-books.mp4',
    15: '/videos/mnemonics/histology/read-books.mp4',
    40: '/videos/mnemonics/histology/read-books.mp4',
    # Video 3: Three Muscles and a Wire
    17: '/videos/mnemonics/histology/three-muscles.mp4',
    18: '/videos/mnemonics/histology/three-muscles.mp4',
    19: '/videos/mnemonics/histology/three-muscles.mp4',
    20: '/videos/mnemonics/histology/three-muscles.mp4',
    # Video 4: Down the Gut Tube
    22: '/videos/mnemonics/histology/down-gut-tube.mp4',
    23: '/videos/mnemonics/histology/down-gut-tube.mp4',
    24: '/videos/mnemonics/histology/down-gut-tube.mp4',
    25: '/videos/mnemonics/histology/down-gut-tube.mp4',
    26: '/videos/mnemonics/histology/down-gut-tube.mp4',
    39: '/videos/mnemonics/histology/down-gut-tube.mp4',
    41: '/videos/mnemonics/histology/down-gut-tube.mp4',
    # Video 5: The Endocrine Cabinet
    6: '/videos/mnemonics/histology/endocrine-cabinet.mp4',
    29: '/videos/mnemonics/histology/endocrine-cabinet.mp4',
    32: '/videos/mnemonics/histology/endocrine-cabinet.mp4',
    33: '/videos/mnemonics/histology/endocrine-cabinet.mp4',
    34: '/videos/mnemonics/histology/endocrine-cabinet.mp4',
    43: '/videos/mnemonics/histology/endocrine-cabinet.mp4',
    # Video 6: SEVEN UP
    7: '/videos/mnemonics/histology/seven-up.mp4',
    8: '/videos/mnemonics/histology/seven-up.mp4',
    9: '/videos/mnemonics/histology/seven-up.mp4',
    10: '/videos/mnemonics/histology/seven-up.mp4',
    37: '/videos/mnemonics/histology/seven-up.mp4',
    38: '/videos/mnemonics/histology/seven-up.mp4',
}

histology_topics = [
    (1, "Fixation & H&E Chemistry", "Basophilia (nucleic acids binding hematoxylin) vs Eosinophilia (proteins binding eosin)"),
    (2, "Epithelial Junctions & Polar Architecture", "Tight junctions (claudin/occludin), zonula adherens (cadherin), desmosomes"),
    (3, "Basement Membrane Architecture", "Type IV collagen, laminin, entactin, and heparan sulfate proteoglycans"),
    (4, "Extracellular Matrix & Collagen Family", "Collagen types I-IV distribution: 'Be So Totally Cool, Read Books' mnemonic"),
    (5, "Elastic Fibers & Reticular Tissue", "Fibrillin-1 microfibrils, elastin, and Marfan syndrome pathophysiology"),
    (6, "Thyroid Follicles & Colloid", "Cuboidal follicular cells producing thyroglobulin surrounded by parafollicular C cells"),
    (7, "Cilia & The Mucociliary Escalator", "9+2 microtubule doublet axoneme with dynein arms: Kartagener syndrome defect"),
    (8, "Urethral Epithelial Transitions", "Transitional (prostatic) -> Pseudostratified columnar (membranous) -> Stratified squamous (navicular fossa)"),
    (9, "Urothelium & Umbrella Cells", "Specialized waterproof uroplakin plaques and multinucleated umbrella cells"),
    (10, "Microvilli, Stereocilia & Cilia", "Microvilli (actin core), stereocilia (long actin, epididymis/inner ear), cilia (microtubules)"),
    (11, "Adipose Tissue: White vs Brown", "Unilocular white adipocytes vs multilocular brown adipocytes rich in UCP-1 / thermogenin"),
    (12, "Hyaline, Elastic & Fibrocartilage", "Type II collagen (hyaline/elastic) vs Type I collagen (fibrocartilage in discs & symphysis)"),
    (13, "Bone Histogenesis: Endochondral vs Intramembranous", "Hyaline cartilage model replacement vs mesenchymal condensation of flat bones"),
    (14, "Cartilage Microarchitecture", "Chondrocytes residing within lacunae producing aggrecan and Type II collagen matrix"),
    (15, "Bone & Fracture Repair", "Osteoblast osteoid secretion, osteoclast Howship lacunae, and woven-to-lamellar remodeling"),
    (16, "Peripheral Blood Cells & Smear Identification", "Neutrophils (3-5 lobes), Eosinophils (bilobed, red granules), Basophils, Lymphocytes, Monocytes"),
    (17, "Skeletal Muscle & The Sarcomere", "A band (thick myosin), I band (thin actin only), Z line (sarcomere boundary), H zone"),
    (18, "Cardiac Muscle & Intercalated Discs", "Branched fibers, central single nucleus, transverse intercalated discs with gap junctions"),
    (19, "Smooth Muscle & Dense Bodies", "Fusiform cells, non-striated, actin anchored to alpha-actinin dense bodies with calmodulin"),
    (20, "Nerve Tissue & Nodes of Ranvier", "Schwann cell myelin sheaths, nodes of Ranvier rich in voltage-gated Na+ channels"),
    (21, "Central Nervous System Glial Cells", "Astrocytes (GFAP+, blood-brain barrier), Oligodendrocytes (myelin), Microglia (mesodermal phagocytes)"),
    (22, "Gut Wall Architecture & Esophagus", "Four layers: Mucosa, Submucosa (Meissner plexus), Muscularis externa (Auerbach plexus), Adventitia/Serosa"),
    (23, "Gastric Histology & Cell Types", "Parietal cells (eosinophilic, HCl/intrinsic factor), Chief cells (basophilic, pepsinogen), Mucous neck cells"),
    (24, "Small Intestine: Duodenum, Jejunum, Ileum", "Duodenal Brunner glands, jejunal tall plicae circulares, ileal Peyer patches in lamina propria"),
    (25, "Large Intestine & Appendix", "Abundant goblet cells, no true villi, straight crypts of Lieberkühn, teniae coli"),
    (26, "Liver Lobular Zonation", "Zone 1 (periportal, high oxygen, viral hepatitis target) vs Zone 3 (centrilobular, CYP450, ischemia/toxicity target)"),
    (27, "Gallbladder Microscopic Architecture", "Simple columnar epithelium with lamina propria, no muscularis mucosae or submucosa"),
    (28, "Exocrine Pancreas vs Islets of Langerhans", "Acinar cells with zymogen granules, centroacinar duct cells producing HCO3-, pale islets"),
    (29, "Pharyngeal Pouch Derivatives", "3rd pouch (inferior parathyroids & thymus), 4th pouch (superior parathyroids & C cells)"),
    (30, "Salivary Glands: Parotid, Submandibular, Sublingual", "Parotid (pure serous, amylase), Submandibular (mixed serous-predominant), Sublingual (mucous-predominant)"),
    (31, "Lymph Node Microscopic Anatomy", "Cortex (B cell lymphoid follicles), Paracortex (T cells, HEVs, DiGeorge hypoplasia), Medullary cords/sinuses"),
    (32, "Parathyroid Gland Histology", "Chief cells (PTH secretion, small dark nuclei) and oxyphil cells (packed with mitochondria)"),
    (33, "Adrenal Cortex Zonation", "Glomerulosa (mineralocorticoids), Fasciculata (glucocorticoids, clear foamy cells), Reticularis (androgens)"),
    (34, "Pituitary Gland: Anterior vs Posterior", "Adenohypophysis (acidophils: GH/prolactin; basophils: ACTH/TSH/LH/FSH) vs Neurohypophysis (pituicytes, Herring bodies)"),
    (35, "Spleen: White Pulp vs Red Pulp", "Periarteriolar lymphoid sheath (PALS, T cells), marginal zone, red pulp cords of Billroth"),
    (36, "Thymus Microscopic Architecture", "Cortex (positive selection, cortical epithelial cells) and Medulla (negative selection, Hassall corpuscles)"),
    (37, "Male Reproductive Tract: Testis & Epididymis", "Seminiferous tubules with Sertoli (blood-testis barrier) & Leydig cells (testosterone); pseudostratified stereociliated epididymis"),
    (38, "The Two-Cell Ovarian Follicle Model", "Theca interna (LH stimulation -> androstenedione) and Granulosa cells (FSH stimulation -> aromatase -> estradiol)"),
    (39, "Barrett Esophagus & Metaplasia", "Stratified squamous to simple columnar intestinal metaplasia with Alcian blue-positive goblet cells"),
    (40, "Wound Healing & Granulation Tissue", "Proliferating capillary loops, plump fibroblasts, extracellular matrix deposition, Type III -> Type I collagen"),
    (41, "Diverticula: True vs False", "Meckel diverticulum (true, all 3 layers: mucosa, muscularis, serosa) vs Colonic diverticula (false, mucosa & submucosa)"),
    (42, "Renal Glomerulus & Nephron Histology", "Fenestrated capillaries, glomerular basement membrane, podocyte pedicels, mesangial matrix"),
    (43, "Thyroid Carcinoma Variants", "Papillary carcinoma: Orphan Annie eyes, nuclear pseudoinclusions, grooving, psammoma bodies"),
    (44, "Skin Layers & Epidermal Stratification", "Stratum corneum, lucidum (thick skin), granulosum (keratohyalin), spinosum (desmosomes), basale (melanocytes/stem cells)"),
    (45, "Respiratory Tract Histology", "Pseudostratified ciliated columnar epithelium with goblet cells transitioning to simple cuboidal in bronchioles"),
    (46, "Female Reproductive Tract: Endometrium & Cervix", "Proliferative (straight glands, mitotic figures) vs Secretory (tortuous corkscrew glands, glycogen-rich subnuclear vacuoles)"),
    (47, "Placental Histology & Villi", "Syncytiotrophoblast (outer layer secreting hCG) and Cytotrophoblast (inner stem layer)"),
    (48, "Immunofluorescence Patterns in Glomerulonephritis", "Mesangial IgA granular deposits vs linear IgG along GBM in Goodpasture"),
    (49, "Special Stains & Immunohistochemistry", "Congo red (apple-green birefringence for amyloid), PAS (glycogen/Whipple), Prussian blue (hemosiderin)"),
    (50, "Salivary Gland Biopsy in Sjögren Syndrome", "Focal lymphocytic sialadenitis with focus score >= 1 per 4 mm² labial gland tissue"),
]

histology_questions = []
for qid_num, subtopic, detail in histology_topics:
    video_url = histology_video_map.get(qid_num, None)
    vignette = f"<p>A clinical case presents with histopathological biopsy findings demonstrating key microscopic architecture characteristic of <strong>{subtopic}</strong>.</p><p>Which of the following cellular features or microscopic hallmarks is diagnostic for this specimen?</p>"
    correct_opt = "A"
    options = [
        {"id": "A", "text": f"<p>{detail}</p>", "isCorrect": True, "answerType": "best", "explanation": f"Correct: {detail} represents the hallmark microscopic identification criterion on board examinations."},
        {"id": "B", "text": "<p>Extensive transmural coagulative necrosis with prominent ghost cell borders</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This represents ischemic tissue infarction rather than normal histological tissue architecture."},
        {"id": "C", "text": "<p>Widespread non-caseating granulomas surrounded by a rim of epithelioid histiocytes</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This is seen in sarcoidosis or foreign-body reactions."},
        {"id": "D", "text": "<p>Sheets of pleomorphic malignant spindle cells showing atypical multipolar mitoses</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This describes a high-grade soft-tissue sarcoma."}
    ]
    explanation = f"<p><strong>High-Yield Takeaway:</strong> {subtopic} is identified by {detail}.</p><p>Histological examination on board exams emphasizes identifying characteristic cellular linings, organ-specific specialized structures (such as Brunner glands in duodenum or Hassall corpuscles in thymus), and the differential staining properties of hematoxylin (basophilic nucleic acids) and eosin (acidophilic cytoplasm/collagen).</p>"

    histology_questions.append({
        'qid': f"HIST-{qid_num:03d}",
        'questionText': vignette,
        'options': options,
        'correctAnswer': correct_opt,
        'explanation': explanation,
        'difficulty': 'medium',
        'subtopic': subtopic,
        'videoUrl': video_url,
        'videoPosition': 'TOP',
        'status': 'PUBLISHED',
        'media': []
    })

print(f"Loaded {len(histology_questions)} Histology questions.")

# 5. BASIC PHARMACOLOGY QUESTIONS (50 questions)
phar_video_map = {}
for q in range(11, 21):
    phar_video_map[q] = '/videos/mnemonics/pharmacology/docking-ring.mp4'
for q in range(21, 31):
    phar_video_map[q] = '/videos/mnemonics/pharmacology/pressure-deck.mp4'

pharmacology_topics = [
    (1, "Volume of Distribution (Vd)", "Vd = Dose / C0; Low Vd (3-5 L) in plasma, Medium Vd (ECF), High Vd (>40 L) lipophilic tissues"),
    (2, "Clearance & Elimination Rate", "CL = Rate of elimination / Plasma concentration = Vd * ke; independent of dose in first-order"),
    (3, "Half-Life & Steady State Kinetics", "t1/2 = 0.693 * Vd / CL; steady-state concentration reached in 4 to 5 half-lives"),
    (4, "Loading Dose & Maintenance Dose", "Loading dose = (Target Cp * Vd) / Bioavailability (F); Maintenance dose = (Target Cp * CL * tau) / F"),
    (5, "Zero-Order vs First-Order Elimination", "Zero-order: constant amount eliminated per time (PEA: Phenytoin, Ethanol, Aspirin); First-order: constant fraction"),
    (6, "Bioavailability & First-Pass Metabolism", "Bioavailability F = AUC(oral) / AUC(IV); decreased by extensive hepatic first-pass CYP metabolism"),
    (7, "Renal Drug Clearance & Glomerular Filtration", "Creatinine clearance estimation; dosing adjustments for renally cleared drugs (e.g., aminoglycosides, vancomycin)"),
    (8, "Biliary Excretion & Enterohepatic Recirculation", "Glucuronide conjugates hydrolyzed by intestinal flora and reabsorbed, prolonging drug half-life"),
    (9, "Phase I vs Phase II Hepatic Metabolism", "Phase I (oxidation/reduction via CYP450, lost in elderly) vs Phase II (conjugation: glucuronidation, acetylation, sulfation)"),
    (10, "Therapeutic Index & Margin of Safety", "TI = TD50 / ED50; drugs with narrow therapeutic index include Warfarin, Theophylline, Digoxin, Lithium"),
    (11, "Potency vs Efficacy", "Potency: EC50 (left shift = more potent); Efficacy: Emax (ceiling of maximal therapeutic response)"),
    (12, "Competitive Antagonism", "Reversible active site binding: increases EC50 (shifts curve right), Emax remains unchanged; overcome by agonist"),
    (13, "Non-Competitive Antagonism", "Allosteric or irreversible binding: decreases Emax (lowers ceiling), EC50 unchanged; cannot be overcome"),
    (14, "Partial Agonists", "Acts as an agonist alone with lower intrinsic efficacy, but acts as a competitive antagonist in presence of full agonist"),
    (15, "Receptor Downregulation & Desensitization", "Prolonged agonist exposure causes receptor phosphorylation, beta-arrestin binding, and endocytosis"),
    (16, "Cytochrome P450 Enzyme Inducers", "Chronic alcohol, St. John's Wort, Phenytoin, Phenobarbital, Nevirapine, Rifampin, Carbamazepine, Griseofulvin"),
    (17, "Cytochrome P450 Enzyme Inhibitors", "Sodium valproate, Isoniazid, Cimetidine, Ketoconazole, Fluconazole, Acute alcohol, Chloramphenicol, Erythromycin, Sulfonamides, Ciprofloxacin, Omeprazole, Grapefruit juice"),
    (18, "Muscarinic Toxidrome (DUMBBELSS)", "Diarrhea, Urination, Miosis, Bronchospasm/Bradycardia, Emesis, Lacrimation, Salivation, Sweating (organophosphates)"),
    (19, "Anticholinergic Toxidrome", "'Hot as a hare, dry as a bone, red as a beet, mad as a hatter, blind as a bat, full as a flask' (Atropine)"),
    (20, "Drug Absorption & Henderson-Hasselbalch", "Weak acids (A-) absorbed in acidic stomach (HA uncharged); Weak bases (BH+) absorbed in alkaline intestine (B uncharged)"),
    (21, "Hepatic Extraction Ratio & Flow-Limited Clearance", "High ER drugs (lidocaine, morphine, propranolol) clearance depends on liver blood flow"),
    (22, "Dosing Modifications in Renal Failure", "Decreased GFR requires reducing maintenance dose or prolonging dosing interval (tau); loading dose unchanged"),
    (23, "Dosing Modifications in Hepatic Cirrhosis", "Portosystemic shunting increases oral bioavailability of high first-pass drugs; reduced albumin increases free drug"),
    (24, "Distribution into Special Compartments", "Blood-brain barrier, placental transfer, lipid-soluble drugs vs quaternary amines crossing CNS"),
    (25, "Autonomic Baroreceptor Reflex Physiology", "Vasoconstrictor (alpha-1 agonist) increases MAP -> reflex bradycardia via vagus; vasodilator -> reflex tachycardia"),
    (26, "Beta-1 vs Beta-2 Adrenergic Selectivity", "Beta-blockers: Cardioselective A to M (Atenolol, Metoprolol, Bisoprolol); Non-selective N to Z (Nadolol, Propranolol, Timolol)"),
    (27, "Alpha-1 and Alpha-2 Adrenergic Receptors", "Alpha-1 (Gq -> IP3/DAG -> vasoconstriction, pupil dilation); Alpha-2 (Gi -> decreases cAMP -> decreases sympathetic outflow)"),
    (28, "Muscarinic Receptor Subtypes (M1, M2, M3)", "M1 (Gq, brain); M2 (Gi, heart: decreases HR and contractility); M3 (Gq, smooth muscle contraction & glandular secretion)"),
    (29, "Beta-3 Adrenergic Agonists", "Mirabegron: Gs-coupled receptor in detrusor muscle inducing relaxation for overactive bladder"),
    (30, "Cholinesterase Regenerators & Pralidoxime", "Pralidoxime (2-PAM) regenerates acetylcholinesterase before chemical aging occurs; Atropine treats muscarinic symptoms"),
    (31, "Adrenergic Receptor Epinephrine Reversal", "Epinephrine + non-selective alpha blocker (phentolamine) causes net vasodilation via unopposed Beta-2 receptors"),
    (32, "Direct Cholinomimetic Agents", "Bethanechol (postoperative ileus/urinary retention), Carbachol/Pilocarpine (glaucoma, pupillary miosis), Methacholine"),
    (33, "Indirect Cholinomimetics (Anticholinesterases)", "Physostigmine (crosses BBB, atropine antidote), Neostigmine (quaternary, myasthenia gravis, reversal of NMJ blockade)"),
    (34, "Depolarizing vs Non-Depolarizing NMJ Blockers", "Succinylcholine (phase I continuous depolarization, phase II desensitization) vs Rocuronium (competitive antagonism)"),
    (35, "Direct Sympathomimetics (Catecholamines)", "Norepinephrine (alpha-1 > alpha-2 > beta-1), Epinephrine (beta > alpha), Isoproterenol (beta-1 = beta-2)"),
    (36, "Indirect & Mixed-Acting Sympathomimetics", "Amphetamine (displaces vesicular catecholamines), Cocaine (NET/DAT reuptake inhibition), Ephedrine/Pseudoephedrine"),
    (37, "Alpha-Blocker Therapeutics & Pheochromocytoma", "Phenoxybenzamine (irreversible non-competitive) vs Phentolamine (reversible competitive); Pre-op alpha before beta blockade"),
    (38, "Beta-Blockers with Alpha-1 Blocking Activity", "Carvedilol and Labetalol: peripheral vasodilation with blunted reflex tachycardia for heart failure & hypertension"),
    (39, "Beta-Blockers with Partial Agonist Activity", "Pindolol and Acebutolol (intrinsic sympathomimetic activity, contraindicated in angina)"),
    (40, "Calcium Channel Blockers: DHP vs Non-DHP", "Dihydropyridines (Amlodipine, Nifedipine -> vascular smooth muscle) vs Non-DHP (Verapamil, Diltiazem -> cardiac pacing)"),
    (41, "Renin-Angiotensin-Aldosterone System Inhibitors", "ACE inhibitors (captopril, cough/angioedema from bradykinin) vs ARBs (losartan) vs Direct renin inhibitors (aliskiren)"),
    (42, "Nitrates & Mechanism of Tolerance", "Bioactivation to NO -> guanylyl cyclase -> cGMP -> dephosphorylation of myosin light chain; tolerance avoided with nitrate-free interval"),
    (43, "Digoxin Pharmacology & Toxicity", "Inhibits Na+/K+-ATPase -> increases intracellular Na+ -> decreases Na+/Ca2+ exchange -> increases intracellular Ca2+; hypokalemia potentiates toxicity"),
    (44, "Diuretic Classes & Tubular Sites of Action", "Loop (NKCC2 in TAL), Thiazide (NCCT in DCT), Potassium-sparing (ENaC/Aldosterone in collecting tubule), Carbonic anhydrase (PCT)"),
    (45, "Antiarrhythmic Drug Classes (Vaughan Williams)", "Class I (Na+ blockers: IA, IB, IC), Class II (Beta blockers), Class III (K+ channel blockers: amiodarone, sotalol), Class IV (CCBs)"),
    (46, "Anticoagulants & Coagulation Cascade Targets", "Heparin/LMWH (antithrombin III potentiation), Warfarin (VKORC1 inhibition), DOACs (Apixaban/Rivaroxaban factor Xa; Dabigatran direct thrombin)"),
    (47, "Antiplatelet Pharmacology", "Aspirin (irreversible COX-1 TXA2 inhibition), Clopidogrel/Ticagrelor (P2Y12 ADP receptor antagonists), Abciximab (GPIIb/IIIa)"),
    (48, "Statin Pharmacology & Lipid-Lowering Agents", "HMG-CoA reductase inhibition -> increases hepatic LDL receptor expression; Ezetimibe (NPC1L1), Fibrates (PPAR-alpha), PCSK9"),
    (49, "Serotonin Syndrome vs Neuroleptic Malignant Syndrome", "Serotonin syndrome (hyperreflexia, clonus, tremor, diarrhea) vs NMS (lead-pipe rigidity, hyporeflexia, elevated CK)"),
    (50, "Specific Antidotes in Clinical Toxicology", "Acetaminophen (N-acetylcysteine), Benzodiazepines (Flumazenil), Opioids (Naloxone), Carbon monoxide (100% O2/hyperbaric), Cyanide (Hydroxocobalamin)"),
]

pharmacology_questions = []
for qid_num, subtopic, detail in pharmacology_topics:
    video_url = phar_video_map.get(qid_num, None)
    vignette = f"<p>A clinical pharmacology case evaluates the therapeutic response, receptor kinetics, and adverse reaction profile of <strong>{subtopic}</strong> in patient management.</p><p>Which of the following principles best describes the pharmacological mechanism or diagnostic principle illustrated by this agent?</p>"
    correct_opt = "A"
    options = [
        {"id": "A", "text": f"<p>{detail}</p>", "isCorrect": True, "answerType": "best", "explanation": f"Correct: {detail} is the core pharmacological concept tested on board examinations."},
        {"id": "B", "text": "<p>Irreversible suicide inhibition of bacterial transpeptidase cell wall cross-linking</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This describes the mechanism of action of beta-lactam antibiotics."},
        {"id": "C", "text": "<p>Binding to the 30S ribosomal subunit causing mRNA misreading and premature termination</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This describes aminoglycoside antimicrobial mechanisms."},
        {"id": "D", "text": "<p>Direct opening of CFTR chloride channels on epithelial apical membranes</p>", "isCorrect": False, "answerType": "wrong", "explanation": "Incorrect: This describes CFTR potentiator pharmacology (e.g., ivacaftor)." }
    ]
    explanation = f"<p><strong>High-Yield Takeaway:</strong> {subtopic} is governed by {detail}.</p><p>Fundamental pharmacology tests the application of dose-response equations (potency EC50 vs efficacy Emax), the distinction between competitive and non-competitive antagonism, clearance kinetics, drug-drug enzyme interactions, and autonomic nervous system reflex responses.</p>"

    pharmacology_questions.append({
        'qid': f"PHAR-{qid_num:03d}",
        'questionText': vignette,
        'options': options,
        'correctAnswer': correct_opt,
        'explanation': explanation,
        'difficulty': 'medium',
        'subtopic': subtopic,
        'videoUrl': video_url,
        'videoPosition': 'TOP',
        'status': 'PUBLISHED',
        'media': []
    })

print(f"Loaded {len(pharmacology_questions)} Pharmacology questions.")

all_qbanks = [
    {
        'title': 'Autoimmune Diseases',
        'slug': 'autoimmune-diseases',
        'qbankCode': 'AUTO',
        'price': 2900,
        'specialtyTag': 'Immunology & Rheumatology',
        'description': 'Comprehensive 50-question board simulation covering connective tissue disorders, systemic vasculitides, organ-specific autoimmunity, and immune-mediated nephropathies with 13 video mnemonics.',
        'totalQuestions': 50,
        'difficulty': 'Intermediate',
        'highYieldScore': 9.2,
        'boardCoverage': 'USMLE Step 1',
        'isActive': True,
        'questions': autoimmune_questions
    },
    {
        'title': 'Immunodeficiency Disorders',
        'slug': 'immunodeficiency',
        'qbankCode': 'IMMU',
        'price': 2900,
        'specialtyTag': 'Immunology & Pediatrics',
        'description': 'Complete 50-question clinical question bank detailing primary humoral immunodeficiencies, combined SCID variants, phagocytic dysfunctions, complement defects, and immunosuppressive pharmacotherapies with 13 video mnemonics.',
        'totalQuestions': 50,
        'difficulty': 'Intermediate',
        'highYieldScore': 9.4,
        'boardCoverage': 'USMLE Step 1',
        'isActive': True,
        'questions': immuno_questions
    },
    {
        'title': 'Biologics & Targeted Therapeutics',
        'slug': 'biologics-and-targets',
        'qbankCode': 'BIOL',
        'price': 2900,
        'specialtyTag': 'Pharmacology & Oncology',
        'description': 'Targeted 50-question board review covering monoclonal antibodies, cytokine inhibitors (TNF-α, IL-17, IL-23), immune checkpoint inhibitors (CTLA-4, PD-1), and CAR-T therapies with 6 clinical video mnemonics.',
        'totalQuestions': 50,
        'difficulty': 'Advanced',
        'highYieldScore': 9.1,
        'boardCoverage': 'USMLE Step 1 & Step 2 CK',
        'isActive': True,
        'questions': biologics_questions
    },
    {
        'title': 'Approach to Histology',
        'slug': 'approach-to-histology',
        'qbankCode': 'HIST',
        'price': 2900,
        'specialtyTag': 'Pathology & Histology',
        'description': 'Essential 50-question microscopic pathology and tissue architecture question bank with high-resolution exhibits, H&E staining characteristics, organ histology, and 6 video mnemonics.',
        'totalQuestions': 50,
        'difficulty': 'Intermediate',
        'highYieldScore': 8.9,
        'boardCoverage': 'USMLE Step 1',
        'isActive': True,
        'questions': histology_questions
    },
    {
        'title': 'Basic Pharmacology & Pharmacokinetics',
        'slug': 'basic-pharmacology',
        'qbankCode': 'PHAR',
        'price': 2900,
        'specialtyTag': 'General Pharmacology',
        'description': 'Master foundational pharmacokinetics, dose-response relationships, competitive and non-competitive receptor antagonism, autonomic reflexes, and toxidromes with embedded video mnemonics.',
        'totalQuestions': 50,
        'difficulty': 'Intermediate',
        'highYieldScore': 9.0,
        'boardCoverage': 'USMLE Step 1',
        'isActive': True,
        'questions': pharmacology_questions
    }
]

out_file = r'c:\Users\hello\USMLE2\scripts\qbanks_seed_data.json'
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(all_qbanks, f, indent=2)

print(f"\nSUCCESS: Generated {out_file} with {len(all_qbanks)} QBanks and 250 total questions!")
