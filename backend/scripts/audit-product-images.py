"""
audit-product-images.py

Find product images that likely do not match the catalog item.
Keeps good images untouched; outputs a fix list for fix-product-images.py.

Usage (from backend/):
  python scripts/audit-product-images.py
  python scripts/audit-product-images.py --source server
  python scripts/audit-product-images.py --source export
  python scripts/audit-product-images.py --source uploads

Output:
  scripts/bad-product-images.json
"""

from __future__ import annotations

import argparse
import json
from io import BytesIO
from pathlib import Path

import requests
import urllib3
from PIL import Image

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ROOT = Path(__file__).resolve().parent.parent
MAPPING_PATH = ROOT.parent / "export" / "image-mapping.json"
EXPORT_DIR = ROOT.parent / "export" / "product-images"
UPLOAD_DIR = ROOT / "uploads" / "products"
OUTPUT_PATH = Path(__file__).resolve().parent / "bad-product-images.json"
SERVER_URL = "http://167.172.168.81:3001"


def load_products() -> list[dict]:
    data = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    return [
        {
            "lagercode": Path(item["filename"]).stem,
            "filename": item["filename"],
            "titleDe": item.get("titleDe") or "",
            "titleTr": item.get("titleTr") or "",
        }
        for item in data
        if item.get("filename")
    ]


def score_image(content: bytes, title: str) -> tuple[int, list[str], dict]:
    reasons: list[str] = []
    score = 0
    meta: dict = {}

    if len(content) < 1000:
        return 10, ["missing_or_corrupt"], {"bytes": len(content)}

    try:
        with Image.open(BytesIO(content)) as img:
            img = img.convert("RGB")
            width, height = img.size
    except Exception:
        return 10, ["unreadable"], {}

    meta = {"width": width, "height": height, "bytes": len(content)}
    title_lower = title.lower()
    landscape = width / max(height, 1)
    portrait = height / max(width, 1)

    if max(width, height) < 280:
        score += 6
        reasons.append("too_small")

    if len(content) < 12_000:
        score += 4
        reasons.append("tiny_file")

    if landscape > 1.55:
        score += 3
        reasons.append("wide_landscape")

    if portrait > 1.35:
        score += 2
        reasons.append("portrait")

    if landscape > 2.2 or portrait > 2.2:
        score += 3
        reasons.append("extreme_ratio")

    # Common junk aspect ratios from image search (posters, video frames).
    if abs(landscape - 16 / 9) < 0.06:
        score += 2
        reasons.append("video_ratio")
    if abs(portrait - 3 / 2) < 0.08 and width < 450:
        score += 4
        reasons.append("poster_ratio")

    # Category-specific mismatches.
    if any(k in title_lower for k in ("außengerät", "dış ünite", "heat pump", "wärmepumpe")):
        if portrait > 1.08:
            score += 5
            reasons.append("outdoor_unit_portrait")

    if any(k in title_lower for k in ("verzweigungskit", "joint in", "bransman")):
        if landscape > 1.35:
            score += 5
            reasons.append("joint_kit_landscape")

    if any(k in title_lower for k in ("kühlschrank", "buzdolab", "elektrosan")):
        if landscape > 1.25:
            score += 4
            reasons.append("fridge_banner")

    if "sturzplatte" in title_lower or "poly-poly" in title_lower:
        if landscape > 1.6:
            score += 4
            reasons.append("construction_aerial")

    if any(k in title_lower for k in ("kompressor", "verdichter", "condensing", "kondensator")):
        if landscape > 1.9:
            score += 3
            reasons.append("compressor_landscape")

    return score, reasons, meta


def load_image_bytes(source: str, product: dict) -> bytes | None:
    filename = product["filename"]
    if source == "export":
        path = EXPORT_DIR / filename
        return path.read_bytes() if path.exists() else None
    if source == "uploads":
        path = UPLOAD_DIR / filename
        return path.read_bytes() if path.exists() else None
    if source == "server":
        url = f"{SERVER_URL}/uploads/products/{filename}"
        try:
            resp = requests.get(
                url,
                timeout=15,
                verify=False,
                headers={"User-Agent": "DurmusBabaImageAudit/1.0"},
            )
            if resp.status_code == 200:
                return resp.content
        except Exception:
            return None
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        choices=["export", "uploads", "server"],
        default="export",
        help="Where to read current images from (default: export/)",
    )
    parser.add_argument(
        "--min-score",
        type=int,
        default=4,
        help="Flag image when audit score >= this value",
    )
    args = parser.parse_args()

    products = load_products()
    bad: list[dict] = []
    ok = missing = 0

    print(f"Auditing {len(products)} images from {args.source}...\n")

    for product in products:
        content = load_image_bytes(args.source, product)
        title = product["titleDe"] or product["titleTr"]
        if not content:
            missing += 1
            bad.append({
                **product,
                "score": 10,
                "reasons": ["missing"],
                "meta": {},
            })
            continue

        score, reasons, meta = score_image(content, title)
        if score >= args.min_score:
            bad.append({
                **product,
                "score": score,
                "reasons": reasons,
                "meta": meta,
            })
            print(f"  BAD  {product['lagercode']:12} score={score} {meta} {reasons}")
        else:
            ok += 1

    OUTPUT_PATH.write_text(json.dumps(bad, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\n======================================")
    print(f"  OK       : {ok}")
    print(f"  Bad      : {len(bad)}")
    print(f"  Missing  : {missing}")
    print(f"  Output   : {OUTPUT_PATH}")
    print("======================================")
    print("\nNext: python scripts/fix-product-images.py --only-bad")


if __name__ == "__main__":
    main()
