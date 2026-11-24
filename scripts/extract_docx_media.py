import zipfile
import os
import shutil

BASE_DIR = r"C:\Projects\MQB\usmle-appp"

docx_configs = [
    {
        "name": "autoimmune",
        "docx": r"C:\Projects\MQB\Final\Autoimmune Disorders\Autoimmune_Disease_Qbank_Q1-50_Revision.docx",
        "target_dir": os.path.join(BASE_DIR, "public", "images", "qbank", "autoimmune"),
        "target_uploads": os.path.join(BASE_DIR, "public", "uploads", "qbank", "autoimmune-diseases")
    },
    {
        "name": "biologics",
        "docx": r"C:\Projects\MQB\Final\Biologics\2026-08-08_Biologics_and_Their_Targets_Qbank_Q1-50_Poojan_Draft_V5 (1).docx",
        "target_dir": os.path.join(BASE_DIR, "public", "images", "qbank", "biologics"),
        "target_uploads": os.path.join(BASE_DIR, "public", "uploads", "qbank", "biologics-and-their-targets")
    },
    {
        "name": "immunodeficiency",
        "docx": r"C:\Projects\MQB\Final\Immunodeficiency\Copy of 2026-07-22_Immunodeficiency_Qbank_Q1-50_Poojan_Draft_V5.docx",
        "target_dir": os.path.join(BASE_DIR, "public", "images", "qbank", "immunodeficiency"),
        "target_uploads": os.path.join(BASE_DIR, "public", "uploads", "qbank", "immunodeficiency-disorders")
    }
]

for cfg in docx_configs:
    os.makedirs(cfg["target_dir"], exist_ok=True)
    os.makedirs(cfg["target_uploads"], exist_ok=True)
    print(f"\nProcessing {cfg['name']} from {cfg['docx']}...")
    with zipfile.ZipFile(cfg["docx"], 'r') as z:
        for entry in z.namelist():
            if entry.startswith("word/media/"):
                fname = os.path.basename(entry)
                out_path = os.path.join(cfg["target_dir"], fname)
                with open(out_path, "wb") as f_out:
                    f_out.write(z.read(entry))
                print(f"  Extracted {fname} -> {out_path}")

print("\nDone extracting docx media!")
