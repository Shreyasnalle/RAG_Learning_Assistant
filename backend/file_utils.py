import os
import glob
from typing import List, Dict
def get_latest_caption_file(folder : str = "raw_captions") -> str :
    txt_files = glob.glob(os.path.join(folder, "*.txt"))
    if not txt_files :
        raise FileNotFoundError(f"No caption files found in '{folder}")
    latest_file = max(txt_files, key = os.path.getmtime)
    return latest_file