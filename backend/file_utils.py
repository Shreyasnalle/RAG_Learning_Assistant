import os
import glob


def get_latest_caption_file(folder: str = "raw_captions") -> str:
    txt_files = glob.glob(os.path.join(folder, "*.txt"))
    if not txt_files:
        raise FileNotFoundError(f"No caption files found in '{folder}'")
    full_files = [f for f in txt_files if os.path.getsize(f) >= 5000]
    if not full_files:
        raise FileNotFoundError(f"No full caption files found in '{folder}' (all files are too small)")
    return max(full_files, key=os.path.getmtime)