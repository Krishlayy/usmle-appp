import docx
import re
import json
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl
from docx.text.paragraph import Paragraph
from docx.table import Table

doc_path = r'C:\Projects\MQB\drive-download-20261116T213704Z-1-001\Immunodeficiency\2026-07-22_Immunodeficiency_Qbank_Q1-50_Poojan_Draft_V5.docx'
doc = docx.Document(doc_path)

questions = []
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
                questions.append(current_q)
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
    questions.append(current_q)

print(f"Total parsed questions: {len(questions)}")
correct_count = sum(1 for q in questions if len(q['options']) > 0 and q['answer'])
print(f"Questions with valid options & answers: {correct_count}/{len(questions)}")
for q in questions[:5]:
    print(f"Q{q['num']}: {q['title']} | Options: {len(q['options'])} | Ans: {q['answer']}")
    for opt in q['options']:
        print(f"   [{opt['id']}] {opt['text'][:50]} {'(CORRECT)' if opt['isCorrect'] else ''}")
