"""
prepare-product-uploads.py

Seed backend/uploads/products from export/product-images (keeps good images),
then fix only the flagged bad ones.

Usage (from backend/):
  python scripts/audit-product-images.py
  python scripts/prepare-product-uploads.py
  python scripts/fix-product-images.py --only-bad
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPORT_DIR = ROOT.parent / "export" / "product-images"
UPLOAD_DIR = ROOT / "uploads" / "products"
MAPPING_PATH = ROOT.parent / "export" / "image-mapping.json"


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    copied = skipped = 0
    for item in mapping:
        filename = item.get("filename")
        if not filename:
            continue
        src = EXPORT_DIR / filename
        dst = UPLOAD_DIR / filename
        if not src.exists():
            skipped += 1
            continue
        shutil.copy2(src, dst)
        copied += 1

    print("======================================")
    print(f"  Copied   : {copied}")
    print(f"  Missing  : {skipped}")
    print(f"  Output   : {UPLOAD_DIR}")
    print("======================================")
    print("\nNext: python scripts/fix-product-images.py --only-bad")


if __name__ == "__main__":
    main()
