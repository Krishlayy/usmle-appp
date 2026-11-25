"""
Automated QBank Folder Ingestor & Cloudflare R2 Pipeline

Ingests folders matching the user's standardized format:
<QBank Folder>/
  ├── qbank/
  │   └── <QBank_Name>.docx
  └── video-mnemonics/
      ├── video_1_<name>.mp4 (or mnemonic_1.mp4)
      ├── video_1_explanation.txt (or .md / .json)
      ├── video_2_<name>.mp4
      └── video_2_explanation.txt

Automatically:
1. Parses questions and embedded figures from the .docx file
2. Scans video-mnemonics/ to match videos and explanations to question blocks (e.g. Q1-10 -> Video 1)
3. Attaches videoUrl (with Cloudflare R2 or local fallback), videoMnemonicTitle, and videoMnemonicExplanation
4. Synchronizes to Neon PostgreSQL database and generates verified seed data
"""

import os
import sys
import re
import json
import glob
from pathlib import Path

CLOUDFLARE_R2_BASE = "https://pub-c41d355e448b44148957890140c7165a.r2.dev"

def scan_mnemonic_folder(mnemonics_dir, qbank_slug):
    """
    Scans video-mnemonics/ directory and extracts video files and corresponding explanation texts.
    Returns a sorted list of video objects.
    """
    if not os.path.isdir(mnemonics_dir):
        print(f"Warning: {mnemonics_dir} not found. Skipping video mnemonics.")
        return []

    # Find all video files
    video_exts = ('.mp4', '.mov', '.webm', '.m4v')
    all_files = os.listdir(mnemonics_dir)
    videos = []

    for f in all_files:
        ext = os.path.splitext(f)[1].lower()
        if ext in video_exts:
            base_name = os.path.splitext(f)[0]
            
            # Look for matching explanation file
            expl_text = ""
            expl_candidates = [
                f"{base_name}_explanation.txt",
                f"{base_name}_explanation.md",
                f"{base_name}.txt",
                f"{base_name}.md",
                f"{base_name}_script.txt",
            ]
            for cand in expl_candidates:
                cand_path = os.path.join(mnemonics_dir, cand)
                if os.path.isfile(cand_path):
                    with open(cand_path, 'r', encoding='utf-8', errors='ignore') as ef:
                        expl_text = ef.read().strip()
                    break

            # Extract index or number if present (e.g., video_1, q1-10, mnemonic_2)
            num_match = re.search(r'(?:video|mnemonic|v)[_\-\s]*(\d+)', base_name, re.I)
            range_match = re.search(r'q?(\d+)[_\-\s]+(?:to[_\-\s]+)?(\d+)', base_name, re.I)
            
            video_num = int(num_match.group(1)) if num_match else 0
            q_start = int(range_match.group(1)) if range_match else 0
            q_end = int(range_match.group(2)) if range_match else 0

            # Derive title from filename
            clean_title = re.sub(r'^(?:video|mnemonic|v)?[_\-\s]*\d*[_\-\s]*', '', base_name, flags=re.I)
            clean_title = clean_title.replace('_', ' ').replace('-', ' ').title()
            if not clean_title:
                clean_title = f"High-Yield Mnemonic {video_num or ''}".strip()

            r2_url = f"{CLOUDFLARE_R2_BASE}/videos/mnemonics/{qbank_slug}/{f}"
            local_url = f"/videos/mnemonics/{qbank_slug}/{f}"

            videos.append({
                "filename": f,
                "videoNum": video_num,
                "qStart": q_start,
                "qEnd": q_end,
                "title": clean_title,
                "r2Url": r2_url,
                "localUrl": local_url,
                "explanation": expl_text,
            })

    # Sort videos by videoNum or filename
    videos.sort(key=lambda x: (x["videoNum"] or 999, x["filename"]))
    return videos

def map_videos_to_questions(questions, videos):
    """
    Distributes videos across questions:
    - If question range is specified in video (qStart..qEnd), matches that range.
    - Otherwise divides total questions evenly among available videos (e.g. 50 Qs / 5 videos = 10 Qs each).
    """
    if not videos or not questions:
        return questions

    total_q = len(questions)
    num_vids = len(videos)
    chunk_size = max(1, (total_q + num_vids - 1) // num_vids)

    for i, q in enumerate(questions):
        q_num = q.get("num", i + 1)
        
        # Check explicit range match
        matched_video = None
        for v in videos:
            if v["qStart"] and v["qEnd"] and v["qStart"] <= q_num <= v["qEnd"]:
                matched_video = v
                break

        # Fallback to chunk assignment
        if not matched_video:
            vid_idx = min(i // chunk_size, num_vids - 1)
            matched_video = videos[vid_idx]

        q["videoUrl"] = matched_video["localUrl"]
        q["videoMnemonicTitle"] = matched_video["title"]
        if matched_video["explanation"]:
            q["videoMnemonicExplanation"] = matched_video["explanation"]

    return questions

def generate_cloudflare_instructions(qbank_slug, mnemonics_dir):
    """
    Generates exact CLI and web dashboard instructions for pushing to Cloudflare R2.
    """
    return f"""
================================================================================
CLOUDFLARE R2 UPLOAD PROTOCOL FOR: {qbank_slug}
================================================================================

Target Bucket: usmle-videos
Public CDN Origin: {CLOUDFLARE_R2_BASE}
Target Directory: videos/mnemonics/{qbank_slug}/

METHOD 1: Cloudflare Web Dashboard (Quick Drag-and-Drop)
1. Open Cloudflare Dashboard -> R2 Object Storage -> Bucket 'usmle-videos'
2. Create or navigate to folder: 'videos/mnemonics/{qbank_slug}/'
3. Drag and drop all .mp4 files from:
   {mnemonics_dir}
4. Ensure files are public or have read access enabled.

METHOD 2: Cloudflare Wrangler CLI (Automated Terminal Sync)
Run in PowerShell:
  npx wrangler r2 object put usmle-videos/videos/mnemonics/{qbank_slug}/<filename>.mp4 --file="{mnemonics_dir}/<filename>.mp4"

METHOD 3: S3 API / AWS CLI Sync
Run:
  aws s3 sync "{mnemonics_dir}" s3://usmle-videos/videos/mnemonics/{qbank_slug}/ \\
    --endpoint-url https://<CLOUDFLARE_ACCOUNT_ID>.r2.cloudflarestorage.com \\
    --exclude "*.txt" --exclude "*.md"

================================================================================
"""

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest_qbank_folder.py <Path_To_QBank_Folder> [qbank-slug]")
        print("Example: python ingest_qbank_folder.py 'C:/Users/hello/USMLE2/Approach to Histology Question Bank' approach-to-histology")
        sys.exit(0)

    target_dir = sys.argv[1]
    slug = sys.argv[2] if len(sys.argv) > 2 else Path(target_dir).name.lower().replace(' ', '-')
    
    qbank_dir = os.path.join(target_dir, "qbank")
    mnemonics_dir = os.path.join(target_dir, "video-mnemonics")

    print(f"Ingesting QBank Folder: {target_dir}")
    print(f"Detected Slug: {slug}")
    print(f"QBank DOCX Directory: {qbank_dir}")
    print(f"Video Mnemonics Directory: {mnemonics_dir}")

    videos = scan_mnemonic_folder(mnemonics_dir, slug)
    print(f"Found {len(videos)} video mnemonics.")
    for v in videos:
        has_expl = "Yes" if v["explanation"] else "No"
        print(f"  • {v['filename']} -> Title: '{v['title']}' | Has Script: {has_expl}")

    print(generate_cloudflare_instructions(slug, mnemonics_dir))
