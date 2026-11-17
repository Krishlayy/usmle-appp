import os
import shutil

src_base = r'C:\Projects\MQB\drive-download-20261116T213704Z-1-001'
dst_base = r'c:\Users\hello\USMLE2\public\videos\mnemonics'
os.makedirs(dst_base, exist_ok=True)

mappings = {
    # AUTOIMMUNE (13 mnemonics)
    'autoimmune/boardroom': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/1. Boardroom', 'Clip 2.mp4'),
    'autoimmune/renovation': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/2. Renovation', '2026_06_03_Autoimmune_Video-Mnemonic-Renovation_wing_Connective-Tissue_Poojan_Version_V1.mov'),
    'autoimmune/motor-pool': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/3. Motor Pool', 'Motor Pool.mp4'),
    'autoimmune/bamboo-stairwell': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/4. Bamboo Stairwell', 'Clip 1.mp4'),
    'autoimmune/cable-run': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/5. High Voltage Cables', 'Clip 4.mp4'),
    'autoimmune/wall-sockets': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/6. Wall Sockets', 'Clip 4.mp4'),
    'autoimmune/thermostat': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/7. The Thermostat Room', 'Clip 5.mp4'),
    'autoimmune/supply-pipes': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/8. The Supply Pipes', 'Clip 1.mp4'),
    'autoimmune/filtration-plant': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/9. Filtration Plant', '2026-06-18_Mnemonic9_The-Filtration-Plant_Hepatobiliary-autoimmune-diseases_Poojan_Version_V1.mov'),
    'autoimmune/control-room': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/10. Control Room', 'Clip 1.mp4'),
    'autoimmune/the-walls': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/11. The Walls', 'the walls Mnemonic.mp4'),
    'autoimmune/water-plant': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/12. Water Plant', '2026-06-21_Mnemonic12_Filtration-Plant_Renal-Diseases_Poojan_Version_V1.mov'),
    'autoimmune/blood-bank': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/13. Blood Bank', 'Clip 6.mp4'),

    # IMMUNODEFICIENCY (13 mnemonics)
    'immunodeficiency/empty-nicu': ('Autoimmune Diseases/1. Autoimmune Disorders - Video-Mnemonics/1. Boardroom', 'Clip 4.mp4'),
    'immunodeficiency/thymus-school': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/2. Thymus Training Nursery', '2026-06-26_Mnemonic2_Thymus-Nursery_Image_Poojan_V1.mov'),
    'immunodeficiency/bubble-ward': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/3. Bubble Ward', '2026-06-26_Mnemonic3_Bubble-Ward_SCID_Poojan_V1.mov'),
    'immunodeficiency/eczema-clinic': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/4. Eczema Clinic', 'Clip 4.mp4'),
    'immunodeficiency/locked-doors': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/5. The Locked Doors', 'Clip 3.mp4'),
    'immunodeficiency/unregulated-wing': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/6. The Unregulated Wing', '6 mnemonic.mp4'),
    'immunodeficiency/fire-hall': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/7. Fire Hall', '7 mnemonic.mp4'),
    'immunodeficiency/empty-roster': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/8. Empty Roster', '7.mp4'),
    'immunodeficiency/utilities-room': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/9. Utilities Room', '1.mp4'),
    'immunodeficiency/sabotaged-watch': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/10. Security Room', '10 mnemonic.mp4'),
    'immunodeficiency/transplant-wing': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/11. Transplant Wing', '2.mp4'),
    'immunodeficiency/pharmacy-floor-1': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/12. Pharmacy', '3.mp4'),
    'immunodeficiency/pharmacy-floor-2': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/13. Pharmacy 2', '2.mp4'),

    # BIOLOGICS (6 mnemonics)
    'biologics/hot-t-bone': ('Biologics/3. Biologics - Video-Mnemonics', '2026_08_31_Biologics_Mnemonic1_HotTBoneStEAk_Poojan_Draft_V1.mp4'),
    'biologics/step-up-ladder': ('Biologics/3. Biologics - Video-Mnemonics', '2026_08_31_Biologics_Mnemonic1_HotTBoneStEAk_Poojan_Draft_V1.mp4'),
    'biologics/two-signals': ('Biologics/3. Biologics - Video-Mnemonics', '2026_08_31_Biologics_Mnemonic3_TwoSignalsTwoBrakes_Poojan_Draft_V1.mp4'),
    'biologics/badge-scanner': ('Biologics/3. Biologics - Video-Mnemonics', '2026_08_31_Biologics_Mnemonic3_TwoSignalsTwoBrakes_Poojan_Draft_V1.mp4'),
    'biologics/name-on-vial': ('Biologics/3. Biologics - Video-Mnemonics', '2026_08_31_Biologics_Mnemonic1_HotTBoneStEAk_Poojan_Draft_V1.mp4'),
    'biologics/gate-check': ('Biologics/3. Biologics - Video-Mnemonics', '2026_08_31_Biologics_Mnemonic3_TwoSignalsTwoBrakes_Poojan_Draft_V1.mp4'),

    # HISTOLOGY (6 mnemonics)
    'histology/colour-room': ('Approach to Histology/4. Histology - Video-mnemonics', 'Video 1_ The colour room.mov'),
    'histology/read-books': ('Approach to Histology/4. Histology - Video-mnemonics', 'Video 2- Be so totally cool, Read Books_.mov'),
    'histology/three-muscles': ('Approach to Histology/4. Histology - Video-mnemonics', 'video 3- \u201cThree Muscles and a Wire\u201d.mov'),
    'histology/down-gut-tube': ('Approach to Histology/4. Histology - Video-mnemonics', 'Video 1_ The colour room.mov'),
    'histology/endocrine-cabinet': ('Approach to Histology/4. Histology - Video-mnemonics', 'Video 5- The endocrine cabinet_.mov'),
    'histology/seven-up': ('Approach to Histology/4. Histology - Video-mnemonics', 'Video 2- Be so totally cool, Read Books_.mov'),

    # BASIC PHARMACOLOGY (2 mnemonics)
    'pharmacology/docking-ring': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/12. Pharmacy', '5.mp4'),
    'pharmacology/pressure-deck': ('Immunodeficiency/2. Immunodeficiencies - Video-Mnemonics/12. Pharmacy', '7.mp4'),
}

for key, (folder, fname) in mappings.items():
    src = os.path.join(src_base, folder.replace('/', os.sep), fname)
    sub_dir, file_tag = key.split('/')
    ext = os.path.splitext(fname)[1].lower()
    dst_dir = os.path.join(dst_base, sub_dir)
    os.makedirs(dst_dir, exist_ok=True)
    dst_file = os.path.join(dst_dir, f"{file_tag}{ext}")
    
    if os.path.exists(src):
        if not os.path.exists(dst_file):
            print(f"Copying {key} -> {dst_file} ...")
            shutil.copy2(src, dst_file)
        else:
            print(f"Exists {key} -> {dst_file}")
    else:
        print(f"NOT FOUND: {src}")

print("All video staging complete!")
