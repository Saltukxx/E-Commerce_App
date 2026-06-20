"""
fix-product-images.py

Re-download product images with HVAC-focused search and strict URL filtering.
Skips junk (memes, games, NSFW, etc.) and prefers refrigeration supplier domains.

Usage (from backend/):
  pip install ddgs requests pillow
  python scripts/fix-product-images.py
  python scripts/fix-product-images.py --force          # re-fetch even if file exists
  python scripts/fix-product-images.py --limit 20     # smoke test

Output:
  uploads/products/<Lagercode>.jpg
  scripts/image-fix-results.json
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import time
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse

import requests
import urllib3
from ddgs import DDGS
from PIL import Image

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ROOT = Path(__file__).resolve().parent.parent
MAPPING_PATH = ROOT.parent / "export" / "image-mapping.json"
UPLOAD_DIR = ROOT / "uploads" / "products"
RESULTS_PATH = Path(__file__).resolve().parent / "image-fix-results.json"
SERVER_URL = os.environ.get("SERVER_URL", "http://167.172.168.81:3001").rstrip("/")

BLOCKED_DOMAIN_FRAGMENTS = [
    "reddit", "redd.it", "xhcdn", "porn", "xxx", "nude", "nsfw", "onlyfans",
    "marvel", "disney", "imdb", "steam", "paradox", "wikia", "fandom",
    "videochat", "og_image", "meme", "giphy", "tenor", "pinterest",
    "facebook", "instagram", "tiktok", "twitter", "x.com",
    "hearts-of-iron", "hoi4", "game", "wallpaper", "deviantart",
    "shutterstock", "gettyimages", "alamy", "dreamstime",
    "placeholder", "placehold.co", "via.placeholder",
    "centiundviti", "vitamine", "vitamin",
]

# Local category fallbacks (verified HVAC product photos from export/).
LOCAL_FALLBACK_FILES: dict[str, str] = {
    "condensing_unit": "DRC-10004.jpg",
    "scroll_compressor": "DRC-10003.jpg",
    "refrigerant": "DRC-10001.jpg",
    "commercial_fridge": "ITEM-23903.jpg",
    "systemair_indoor": "DRC-10018.jpg",
    "systemair_outdoor": "DRC-10018.jpg",
    "systemair_joint": "DRC-10018.jpg",
    "food_service": "ITEM-23904.jpg",
    "construction": "DRC-10004.jpg",
    "generic_hvac": "DRC-10004.jpg",
}
EXPORT_IMAGES_DIR = ROOT.parent / "export" / "product-images"
BAD_IMAGES_PATH = Path(__file__).resolve().parent / "bad-product-images.json"

PREFERRED_DOMAIN_FRAGMENTS = [
    "danfoss", "copeland", "embraco", "secop", "tecumseh", "cubigel",
    "kaeltetechnik", "refrigeration", "compressor", "hvac", "klima",
    "amifrigo", "partsfrigo", "refrig", "cooling", "coldstore",
    "totalparts", "partestotales", "kruff", "mfmref", "shopk.it",
    "kaeltetechnik-shop", "refrigerationcompressors", "elgracool",
]

MODEL_TOKEN = re.compile(
    r"\b([A-Z]{2,}\d{2,}[A-Z0-9\-./]*|ICF-[0-9A-Z.]+|MLZ\d+|MTZ\d+|NTZ\d+|LLZ\d+|ZH\d+[A-Z0-9\-]+)\b",
    re.IGNORECASE,
)


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


def extract_models(title: str) -> list[str]:
    return list(dict.fromkeys(m.group(1).upper() for m in MODEL_TOKEN.finditer(title)))


def build_queries(product: dict) -> list[str]:
    title = product["titleDe"] or product["titleTr"]
    title_lower = title.lower()
    models = extract_models(title)
    queries: list[str] = []

    if "systemair" in title_lower:
        if any(k in title_lower for k in ("außengerät", "dış ünite", "wärmepumpe", "heat pump")):
            model = models[0] if models else "SYSVRF"
            queries.append(f"Systemair {model} VRF outdoor unit product")
        elif any(k in title_lower for k in ("innengerät", "iç ünite", "wall")):
            queries.append(f"Systemair VRF indoor wall unit product photo")
        elif any(k in title_lower for k in ("joint", "verzweigungskit", "bransman")):
            queries.append(f"Systemair VRF joint kit refrigerant branch box")
        else:
            queries.append(f"Systemair VRF HVAC product {models[0] if models else ''}".strip())
    if any(k in title_lower for k in ("elektrosan", "kühlschrank", "buzdolab")):
        queries.append("Elektrosan commercial upright refrigerator stainless steel")
        queries.append("professional single door commercial fridge catering")
    if "sturzplatte" in title_lower:
        queries.append("precast concrete lintel block construction product")
    if "bain marie" in title_lower or "benmari" in title_lower:
        queries.append("commercial bain marie hot food display counter")
    if "kuchenschrank" in title_lower or "pasta dolab" in title_lower:
        queries.append("commercial refrigerated cake display cabinet")

    if models:
        queries.append(f"{models[0]} refrigeration product photo")
        if len(models) > 1:
            queries.append(f"{models[1]} HVAC spare part")
    if "copeland" in title_lower:
        queries.append(f"Copeland scroll compressor {models[0] if models else title[:40]}")
    if "ibs icf" in title_lower:
        queries.append(f"IBS microchannel condensing unit {models[0] if models else ''}".strip())
        queries.append(f"Danfoss condensing unit {models[-1] if models else ''}".strip())
    if any(k in title_lower for k in ("kältemittel", "r-404", "r134", "r407")):
        queries.append(f"{title.split()[0]} refrigerant cylinder product")
    if any(k in title_lower for k in ("polyurethan", "köpük tabancas", "schaumpistole", "pu foam")):
        queries.append("polyurethane foam sealant gun spray can insulation")
        queries.append("PU foam gun applicator construction product photo")
    if "sandwichplatte" in title_lower or "sandviç panel" in title_lower:
        queries.append("insulated sandwich panel white 100mm wall construction")
        queries.append("PIR sandwich panel product photo industrial")
    if "thermet" in title_lower or ("wte" in title_lower and "watt" in title_lower):
        queries.append("industrial electric immersion heater element product")
        queries.append("Thermet electric heater WTE product photo")
    if any(k in title_lower for k in ("glasregal", "cam rayon", "daisy vg")):
        queries.append("commercial vertical refrigerated glass display case showcase")
        queries.append("open front refrigerated shelf supermarket display")
    if any(k in title_lower for k in ("gebäckform", "böreklik", "pastry", "marmortisch", "mermer tabl")):
        queries.append("commercial stainless steel marble top pastry table bakery")
        queries.append("commercial kitchen work table marble surface food service")
    if any(k in title_lower for k in ("ttr kablo", "ttr-kabel", "ttr cable")):
        queries.append(f"flexible electrical cable TTR {title.split()[0]} wire")
        queries.append("multi-core flexible electrical cable product photo")

    short = " ".join(title.split()[:8])
    queries.append(f"{short} product photo")
    queries.append(f"{product['lagercode']} HVAC spare part")

    deduped: list[str] = []
    for q in queries:
        q = re.sub(r"\s+", " ", q).strip()
        if q and q not in deduped:
            deduped.append(q)
    return deduped[:8]


def domain(url: str) -> str:
    try:
        return urlparse(url).netloc.lower()
    except Exception:
        return ""


def is_blocked(url: str) -> bool:
    lower = url.lower()
    host = domain(url)
    return any(fragment in lower or fragment in host for fragment in BLOCKED_DOMAIN_FRAGMENTS)


def score_url(url: str) -> int:
    if is_blocked(url):
        return -1000
    host = domain(url)
    score = 0
    for i, fragment in enumerate(PREFERRED_DOMAIN_FRAGMENTS):
        if fragment in host:
            score += 100 - i
    if any(url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
        score += 10
    if "logo" in url.lower() or "icon" in url.lower():
        score -= 20
    return score


def search_image(queries: list[str], title: str) -> str | None:
    candidates: list[tuple[int, str]] = []
    try:
        with DDGS() as ddgs:
            for query in queries:
                results = list(ddgs.images(query, max_results=8))
                for result in results:
                    url = result.get("image") or ""
                    if not url or is_blocked(url):
                        continue
                    candidates.append((score_url(url), url))
                if len(candidates) >= 12:
                    break
    except Exception as exc:
        print(f"    search error: {exc}")
        return None

    if not candidates:
        return None
    candidates.sort(key=lambda item: item[0], reverse=True)
    for _, url in candidates[:12]:
        content = download_image(url, title)
        if content:
            return url
    return None


def audit_score(content: bytes, title: str) -> tuple[int, list[str]]:
    """Lightweight re-check before accepting a downloaded image."""
    if len(content) < 1000:
        return 10, ["missing_or_corrupt"]
    try:
        with Image.open(BytesIO(content)) as img:
            width, height = img.size
    except Exception:
        return 10, ["unreadable"]

    reasons: list[str] = []
    score = 0
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
    if abs(landscape - 16 / 9) < 0.06:
        score += 2
        reasons.append("video_ratio")
    if abs(portrait - 3 / 2) < 0.08 and width < 450:
        score += 4
        reasons.append("poster_ratio")
    if ("sturzplatte" in title_lower or "poly-poly" in title_lower) and landscape > 1.6:
        score += 4
        reasons.append("construction_aerial")
    if any(k in title_lower for k in ("kompressor", "verdichter", "condensing")) and landscape > 1.9:
        score += 3
        reasons.append("compressor_landscape")
    if any(k in title_lower for k in ("außengerät", "dış ünite", "wärmepumpe")) and portrait > 1.08:
        score += 5
        reasons.append("outdoor_unit_portrait")
    if any(k in title_lower for k in ("verzweigungskit", "joint in")) and landscape > 1.35:
        score += 5
        reasons.append("joint_kit_landscape")
    if any(k in title_lower for k in ("kühlschrank", "elektrosan")) and landscape > 1.25:
        score += 4
        reasons.append("fridge_banner")
    return score, reasons


def accept_image(content: bytes, title: str) -> bool:
    score, _ = audit_score(content, title)
    return score < 4 and validate_image(content)


def validate_image(content: bytes) -> bool:
    if len(content) < 4000:
        return False
    try:
        with Image.open(BytesIO(content)) as img:
            width, height = img.size
            if width < 180 or height < 180:
                return False
            ratio = max(width, height) / max(min(width, height), 1)
            if ratio > 3.2:
                return False
            return True
    except Exception:
        return False


def product_category(product: dict) -> str:
    title = (product["titleDe"] or product["titleTr"]).lower()
    if "ibs icf" in title or "kondensatoreinheit" in title or "mikrokanal" in title:
        return "condensing_unit"
    if "copeland" in title or "scroll-kompressor" in title or "scroll verdichter" in title:
        return "scroll_compressor"
    if any(k in title for k in ("kältemittel", "r-404", "r134", "r407")):
        return "refrigerant"
    if any(k in title for k in ("elektrosan", "kühlschrank", "buzdolab")):
        return "commercial_fridge"
    if "systemair" in title:
        if any(k in title for k in ("joint", "verzweigungskit", "bransman")):
            return "systemair_joint"
        if any(k in title for k in ("außengerät", "dış ünite", "wärmepumpe")):
            return "systemair_outdoor"
        return "systemair_indoor"
    if "bain marie" in title or "benmari" in title:
        return "food_service"
    if "sturzplatte" in title or "poly-poly" in title:
        return "construction"
    return "generic_hvac"


def fallback_urls(product: dict) -> list[str]:
    return []


def load_local_fallback(product: dict) -> bytes | None:
    category = product_category(product)
    filename = LOCAL_FALLBACK_FILES.get(category) or LOCAL_FALLBACK_FILES["generic_hvac"]
    path = EXPORT_IMAGES_DIR / filename
    if not path.exists():
        return None
    data = path.read_bytes()
    return data if validate_image(data) else None


def download_image(url: str, title: str | None = None) -> bytes | None:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=20, verify=False)
        if resp.status_code != 200:
            return None
        content_type = resp.headers.get("Content-Type", "")
        if "image" not in content_type and not url.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            return None
        data = resp.content
        if title is not None:
            return data if accept_image(data, title) else None
        return data if validate_image(data) else None
    except Exception as exc:
        print(f"    download error: {exc}")
        return None


def save_jpeg(content: bytes, path: Path) -> None:
    with Image.open(BytesIO(content)) as img:
        rgb = img.convert("RGB")
        rgb.save(path, format="JPEG", quality=88, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Replace existing files")
    parser.add_argument("--limit", type=int, default=0, help="Process only N products")
    parser.add_argument(
        "--codes",
        default="",
        help="Comma-separated Lagercodes to process (e.g. ITEM-23889,DRC-10085)",
    )
    parser.add_argument(
        "--only-bad",
        action="store_true",
        help="Fix only products listed in bad-product-images.json (from audit script)",
    )
    args = parser.parse_args()

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    products = load_products()
    if args.only_bad:
        if not BAD_IMAGES_PATH.exists():
            print("Run audit first: python scripts/audit-product-images.py")
            raise SystemExit(1)
        bad_codes = {
            item["lagercode"].upper()
            for item in json.loads(BAD_IMAGES_PATH.read_text(encoding="utf-8"))
        }
        products = [p for p in products if p["lagercode"].upper() in bad_codes]
        print(f"Fixing {len(products)} flagged products from audit\n")
    if args.codes.strip():
        wanted = {code.strip().upper() for code in args.codes.split(",") if code.strip()}
        products = [p for p in products if p["lagercode"].upper() in wanted]
    if args.limit:
        products = products[: args.limit]

    previous: dict[str, dict] = {}
    if RESULTS_PATH.exists():
        previous = {item["lagercode"]: item for item in json.loads(RESULTS_PATH.read_text(encoding="utf-8"))}

    results: list[dict] = []
    ok = failed = skipped = 0

    print(f"Processing {len(products)} products...\n")

    for index, product in enumerate(products, 1):
        code = product["lagercode"]
        out_path = UPLOAD_DIR / product["filename"]
        title = (product["titleDe"] or product["titleTr"])[:70]
        print(f"[{index}/{len(products)}] {code} | {title}")

        if out_path.exists() and not args.force and not args.only_bad:
            print("    skip (exists)")
            skipped += 1
            results.append(previous.get(code, {
                "lagercode": code,
                "filename": product["filename"],
                "titleDe": product["titleDe"],
                "status": "skipped_existing",
                "imageUrl": f"{SERVER_URL}/uploads/products/{product['filename']}",
            }))
            continue

        queries = build_queries(product)
        title_full = product["titleDe"] or product["titleTr"]
        image_url = search_image(queries, title_full)
        if not image_url:
            print("    not found")
            failed += 1
            results.append({
                "lagercode": code,
                "filename": product["filename"],
                "titleDe": product["titleDe"],
                "status": "not_found",
                "queries": queries,
            })
            continue

        content = download_image(image_url, title_full)
        if not content:
            print(f"    rejected: {image_url[:90]}")
            image_url = None

        if not content:
            for fallback_url in fallback_urls(product):
                content = download_image(fallback_url)
                if content:
                    image_url = fallback_url
                    print(f"    fallback url: {fallback_url[:90]}")
                    break

        if not content:
            content = load_local_fallback(product)
            if content and accept_image(content, title_full):
                image_url = f"local:{LOCAL_FALLBACK_FILES.get(product_category(product), 'generic')}"
                print(f"    fallback local: {image_url}")
            else:
                content = None

        if not content:
            failed += 1
            results.append({
                "lagercode": code,
                "filename": product["filename"],
                "titleDe": product["titleDe"],
                "status": "rejected",
                "sourceUrl": image_url,
                "queries": queries,
            })
            continue

        save_jpeg(content, out_path)
        public_url = f"{SERVER_URL}/uploads/products/{product['filename']}"
        print(f"    ok -> {public_url}")
        ok += 1
        results.append({
            "lagercode": code,
            "filename": product["filename"],
            "titleDe": product["titleDe"],
            "status": "ok",
            "sourceUrl": image_url,
            "imageUrl": public_url,
            "queries": queries,
        })

        if index % 10 == 0:
            RESULTS_PATH.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")

        time.sleep(1.0 + random.uniform(0.2, 0.8))

    RESULTS_PATH.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\n======================================")
    print(f"  OK       : {ok}")
    print(f"  Failed   : {failed}")
    print(f"  Skipped  : {skipped}")
    print(f"  Output   : {UPLOAD_DIR}")
    print(f"  Results  : {RESULTS_PATH}")
    print("======================================")


if __name__ == "__main__":
    main()
