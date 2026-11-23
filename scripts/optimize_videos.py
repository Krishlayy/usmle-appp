import os
import subprocess
import sys
from pathlib import Path

FFMPEG_PATH = r"C:\Users\hello\AppData\Local\Programs\Python\Python311\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
VIDEOS_DIR = Path(r"c:\Users\hello\USMLE2\public\videos")

def optimize_file(input_path: Path, output_path: Path):
    temp_output = output_path.with_name(f"{output_path.stem}.tmp.mp4")
    
    cmd = [
        FFMPEG_PATH,
        "-y",
        "-i", str(input_path),
        "-c:v", "libx264",
        "-crf", "24",
        "-preset", "faster",
        "-pix_fmt", "yuv420p",
        "-vf", "scale='min(1280,iw)':-2",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        str(temp_output)
    ]
    
    print(f"Optimizing: {input_path.name} -> {output_path.name}")
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print(f"ERROR optimizing {input_path.name}: {result.stderr.decode('utf-8', errors='ignore')[-300:]}")
        if temp_output.exists():
            temp_output.unlink()
        return False

    old_size = input_path.stat().st_size / (1024 * 1024)
    new_size = temp_output.stat().st_size / (1024 * 1024)
    print(f"  Done: {old_size:.1f} MB -> {new_size:.1f} MB ({((old_size-new_size)/old_size)*100:.1f}% reduction)")
    
    if output_path.exists() and output_path != input_path:
        output_path.unlink()
    
    temp_output.replace(output_path)
    return True

def main():
    if not os.path.exists(FFMPEG_PATH):
        print(f"ffmpeg not found at {FFMPEG_PATH}")
        sys.exit(1)
        
    print(f"Using ffmpeg: {FFMPEG_PATH}")
    print(f"Scanning {VIDEOS_DIR}...")
    
    # Process both histology and mnemonics
    all_files = list(VIDEOS_DIR.rglob("*"))
    
    # 1. Convert all .mp4 files to .mp4
    mov_files = [f for f in all_files if f.is_file() and f.suffix.lower() == ".mp4"]
    print(f"\nFound {len(mov_files)} .mp4 files to convert.")
    
    for mov in mov_files:
        target_mp4 = mov.with_suffix(".mp4")
        if target_mp4.exists() and target_mp4.stat().st_size < 15 * 1024 * 1024:
            print(f"Skipping conversion for {mov.name}, {target_mp4.name} already exists ({target_mp4.stat().st_size / (1024*1024):.1f} MB).")
            mov.unlink()
            print(f"  Removed raw {mov.name}")
        else:
            success = optimize_file(mov, target_mp4)
            if success:
                mov.unlink()
                print(f"  Removed raw {mov.name}")

    # 2. Find any large .mp4 files (> 10MB) across all folders and optimize them
    all_mp4s = [f for f in VIDEOS_DIR.rglob("*.mp4") if f.is_file() and not f.name.endswith(".tmp.mp4")]
    large_mp4s = [f for f in all_mp4s if f.stat().st_size > 10 * 1024 * 1024]
    print(f"\nFound {len(large_mp4s)} large .mp4 files (>10MB) to compress.")
    
    for mp4 in large_mp4s:
        target = mp4
        optimize_file(mp4, target)

    # Calculate final size
    final_files = list(VIDEOS_DIR.rglob("*"))
    final_size = sum(f.stat().st_size for f in final_files if f.is_file()) / (1024 * 1024)
    print(f"\n==========================================")
    print(f"OPTIMIZATION COMPLETE!")
    print(f"Total video directory size is now: {final_size:.1f} MB")
    print(f"==========================================")

if __name__ == "__main__":
    main()
