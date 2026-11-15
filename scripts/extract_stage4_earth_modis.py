"""
EXOBASE Stage 4 — Earth MODIS Land Surface Temperature Extraction Pipeline

Extracts genuine satellite-derived daytime and nighttime Land Surface Temperature (LST)
from NASA MODIS/Terra 8-Day 1 km composites (MOD11A2.061, DOI: 10.5067/MODIS/MOD11A2.061)
via the Microsoft Planetary Computer STAC API & signed Cloud-Optimized GeoTIFF (COG)
byte-range reads across all 10 existing Earth sites.

Strict rules:
  - Reuses exact Stage 1 Earth coordinates (no coordinate changes).
  - Selects strictly Terra MOD11A2.061 items (`id` starting with `MOD11A2.A2023`).
  - Applies official MOD11A2 scale factor (0.02 K/DN), valid range [7500, 65535],
    fill value masking (DN == 0 excluded), and QC_Day/QC_Night bit-masking
    (bits 0-1 mandatory QA <= 1; cloud/non-produced flags excluded).
  - Never replaces NoData or missing pixels with zero.
  - Uses a common annual observation period across all 10 sites (2023-01-01 .. 2023-12-31).

Outputs:
  - data/stage4_earth_modis_thermal.csv
  - data/stage4_earth_modis_thermal.json
"""

import concurrent.futures
import csv
import json
import math
import os
import statistics
import struct
import threading
import time
import urllib.request
import zlib

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

STAC_SEARCH_URL = "https://planetarycomputer.microsoft.com/api/stac/v1/search"
SAS_TOKEN_URL = "https://planetarycomputer.microsoft.com/api/sas/v1/token/modiseuwest/modis-061-cogs"

MODIS_SPHERE_R = 6371007.181
SCALE_FACTOR_K = 0.02
KELVIN_OFFSET_C = 273.15
VALID_DN_MIN = 7500
VALID_DN_MAX = 65535
MAX_WORKERS = 16

EARTH_SITES = [
    {"id": "earth-atacama", "name": "Atacama Desert (Yungay & Salar Grande)", "lat": -24.10, "lon": -69.92},
    {"id": "earth-ladakh", "name": "Ladakh (Tso Kar & Nubra Cold Desert)", "lat": 33.31, "lon": 78.01},
    {"id": "earth-iceland", "name": "Icelandic Volcanic Fields (Askja & Krafla)", "lat": 65.03, "lon": -16.75},
    {"id": "earth-rann-kutch", "name": "Rann of Kutch (Great Rann Salt Flats)", "lat": 23.95, "lon": 69.80},
    {"id": "earth-makgadikgadi", "name": "Makgadikgadi Salt Pans", "lat": -20.72, "lon": 25.25},
    {"id": "earth-devon", "name": "Devon Island (Haughton Impact Structure)", "lat": 75.38, "lon": -89.68},
    {"id": "earth-mojave", "name": "Mojave Desert (Cima Volcanic Field)", "lat": 35.25, "lon": -115.75},
    {"id": "earth-rio-tinto", "name": "Rio Tinto Basin (Iberian Pyrite Belt)", "lat": 37.70, "lon": -6.55},
    {"id": "earth-mcmurdo", "name": "McMurdo Dry Valleys", "lat": -77.47, "lon": 162.52},
    {"id": "earth-lanzarote", "name": "Lanzarote Volcanic Field (Timanfaya)", "lat": 29.00, "lon": -13.75},
]

_token_lock = threading.Lock()
_cached_token = {"token": "", "fetched_at": 0.0}


def get_sas_token() -> str:
    with _token_lock:
        now = time.time()
        if _cached_token["token"] and (now - _cached_token["fetched_at"]) < 600:
            return _cached_token["token"]
        req = urllib.request.Request(SAS_TOKEN_URL, headers={"User-Agent": "exobase-pipeline/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            tok = json.loads(resp.read().decode("utf-8"))["token"]
        _cached_token["token"] = tok
        _cached_token["fetched_at"] = now
        return tok


def http_range_get(url: str, start: int, end: int, retries: int = 5) -> bytes:
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "Range": f"bytes={start}-{end}",
                    "User-Agent": "exobase-pipeline/1.0",
                },
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                return resp.read()
        except Exception as err:
            last_err = err
            time.sleep(min(6.0, 0.8 * attempt))
    raise RuntimeError(f"Range GET failed ({start}-{end}) for {url}: {last_err}")


def read_cog_3x3_patch(signed_url: str, row: int, col: int) -> list[int]:
    """Read a 3x3 pixel patch centered at (row, col) from a tiled Cloud-Optimized GeoTIFF."""
    hdr = http_range_get(signed_url, 0, 16383)
    endian = "<" if hdr[:2] == b"II" else ">"
    magic, ifd_off = struct.unpack(endian + "HI", hdr[2:8])
    if magic != 42:
        raise RuntimeError(f"Unsupported TIFF magic={magic} for {signed_url}")

    n_tags = struct.unpack(endian + "H", hdr[ifd_off : ifd_off + 2])[0]
    ifd_end = ifd_off + 2 + n_tags * 12
    if ifd_end > len(hdr):
        hdr = http_range_get(signed_url, 0, ifd_end + 4096)

    TYPE_SIZES = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 12: 8}
    tags: dict[int, tuple[int, int, bytes]] = {}
    for i in range(n_tags):
        p = ifd_off + 2 + i * 12
        tag, typ, cnt, val_off = struct.unpack(endian + "HHII", hdr[p : p + 12])
        sz = TYPE_SIZES.get(typ, 1) * cnt
        if sz <= 4:
            raw = hdr[p + 8 : p + 8 + sz]
        else:
            if val_off + sz > len(hdr):
                hdr = http_range_get(signed_url, 0, val_off + sz + 1024)
            raw = hdr[val_off : val_off + sz]
        tags[tag] = (typ, cnt, raw)

    def get_ints(tag: int) -> tuple[int, ...]:
        typ, cnt, raw = tags[tag]
        fmt = {1: "B", 3: "H", 4: "I"}[typ]
        return struct.unpack(endian + fmt * cnt, raw)

    width = get_ints(256)[0]
    height = get_ints(257)[0]
    bps = get_ints(258)[0]
    comp = get_ints(259)[0]
    pred = get_ints(317)[0] if 317 in tags else 1
    tw = get_ints(322)[0]
    th = get_ints(323)[0]
    offs = get_ints(324)
    cnts = get_ints(325)

    if pred != 1:
        raise RuntimeError(f"Unexpected TIFF predictor={pred}")
    if bps not in (8, 16) or comp not in (1, 8):
        raise RuntimeError(f"Unsupported bps={bps}, compression={comp}")

    ntx = math.ceil(width / tw)
    tile_cache: dict[tuple[int, int], bytes] = {}
    fmt_px = "B" if bps == 8 else "H"
    bpx = bps // 8
    values: list[int] = []

    for dr in (-1, 0, 1):
        rr = row + dr
        if rr < 0 or rr >= height:
            continue
        for dc in (-1, 0, 1):
            cc = col + dc
            if cc < 0 or cc >= width:
                continue
            tx, ty = cc // tw, rr // th
            if (tx, ty) not in tile_cache:
                tidx = ty * ntx + tx
                start, length = offs[tidx], cnts[tidx]
                if length == 0:
                    tile_cache[(tx, ty)] = b"\x00" * (tw * th * bpx)
                else:
                    raw_bytes = http_range_get(signed_url, start, start + length - 1)
                    tile_cache[(tx, ty)] = zlib.decompress(raw_bytes) if comp == 8 else raw_bytes
            raw_tile = tile_cache[(tx, ty)]
            lx, ly = cc % tw, rr % th
            pos = (ly * tw + lx) * bpx
            values.append(struct.unpack(endian + fmt_px, raw_tile[pos : pos + bpx])[0])

    return values


def search_mod11a2_2023(lat: float, lon: float) -> list[dict]:
    """Query Planetary Computer STAC for all Terra MOD11A2.061 2023 granules covering (lat, lon)."""
    body = json.dumps({
        "collections": ["modis-11A2-061"],
        "bbox": [lon, lat, lon, lat],
        "datetime": "2022-12-25T00:00:00Z/2024-01-05T23:59:59Z",
        "limit": 250,
    }).encode("utf-8")
    req = urllib.request.Request(
        STAC_SEARCH_URL,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "exobase-pipeline/1.0"},
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    # Keep strictly Terra MOD11A2 A2023* composites, deduplicated by A2023DDD date key
    by_date: dict[str, dict] = {}
    for feat in data.get("features", []):
        fid = feat.get("id", "")
        if not fid.startswith("MOD11A2.A2023"):
            continue
        date_key = fid.split(".")[1]  # e.g. A2023009
        if date_key not in by_date:
            by_date[date_key] = feat
    return [by_date[k] for k in sorted(by_date.keys())]


def latlon_to_tile_rc(lat: float, lon: float, transform: list[float]) -> tuple[int, int]:
    phi = math.radians(lat)
    lam = math.radians(lon)
    sx = MODIS_SPHERE_R * lam * math.cos(phi)
    sy = MODIS_SPHERE_R * phi
    col = int((sx - transform[2]) / transform[0])
    row = int((sy - transform[5]) / transform[4])
    return row, col


def fetch_composite_bands(item: dict, lat: float, lon: float, sas_token: str) -> dict:
    tr = item["properties"]["proj:transform"]
    row, col = latlon_to_tile_rc(lat, lon, tr)
    assets = item["assets"]
    lst_day = read_cog_3x3_patch(assets["LST_Day_1km"]["href"] + "?" + sas_token, row, col)
    qc_day = read_cog_3x3_patch(assets["QC_Day"]["href"] + "?" + sas_token, row, col)
    lst_night = read_cog_3x3_patch(assets["LST_Night_1km"]["href"] + "?" + sas_token, row, col)
    qc_night = read_cog_3x3_patch(assets["QC_Night"]["href"] + "?" + sas_token, row, col)
    return {
        "id": item["id"],
        "dateKey": item["id"].split(".")[1],
        "startDatetime": item["properties"].get("start_datetime", ""),
        "endDatetime": item["properties"].get("end_datetime", ""),
        "dayLst": lst_day,
        "dayQc": qc_day,
        "nightLst": lst_night,
        "nightQc": qc_night,
    }


def summarize_qc_lst(composites: list[dict], lst_key: str, qc_key: str) -> dict:
    valid_temps_k: list[float] = []
    valid_temps_c: list[float] = []
    high_qa_count = 0
    per_date_means_c: list[float] = []
    total_pixels = 0
    valid_dates = 0

    for comp in composites:
        lst_vals = comp[lst_key]
        qc_vals = comp[qc_key]
        n = min(len(lst_vals), len(qc_vals))
        total_pixels += len(lst_vals)
        date_temps_c: list[float] = []

        for idx in range(n):
            dn = lst_vals[idx]
            qc = qc_vals[idx]
            mandatory_qa = qc & 0b11
            # Mask fill (0), out-of-range DN, and QC mandatory bits 2 or 3 (not produced / cloud)
            if dn < VALID_DN_MIN or dn > VALID_DN_MAX:
                continue
            if mandatory_qa > 1:
                continue
            temp_k = dn * SCALE_FACTOR_K
            temp_c = temp_k - KELVIN_OFFSET_C
            valid_temps_k.append(temp_k)
            valid_temps_c.append(temp_c)
            date_temps_c.append(temp_c)
            if mandatory_qa == 0:
                high_qa_count += 1

        if date_temps_c:
            valid_dates += 1
            per_date_means_c.append(sum(date_temps_c) / len(date_temps_c))

    if not valid_temps_k:
        return {
            "meanK": None,
            "meanC": None,
            "stdC": None,
            "seasonalStdC": None,
            "minC": None,
            "maxC": None,
            "validPixels": 0,
            "highQaPixels": 0,
            "totalPixels": total_pixels,
            "validDates": 0,
        }

    return {
        "meanK": round(sum(valid_temps_k) / len(valid_temps_k), 2),
        "meanC": round(sum(valid_temps_c) / len(valid_temps_c), 2),
        "stdC": round(statistics.pstdev(valid_temps_c), 2) if len(valid_temps_c) > 1 else 0.0,
        "seasonalStdC": round(statistics.pstdev(per_date_means_c), 2) if len(per_date_means_c) > 1 else 0.0,
        "minC": round(min(valid_temps_c), 2),
        "maxC": round(max(valid_temps_c), 2),
        "validPixels": len(valid_temps_k),
        "highQaPixels": high_qa_count,
        "totalPixels": total_pixels,
        "validDates": valid_dates,
    }


def extract_site(site: dict) -> dict:
    lat, lon = site["lat"], site["lon"]
    items = search_mod11a2_2023(lat, lon)
    if not items:
        raise RuntimeError(f"No MOD11A2.A2023* STAC items returned for {site['id']}")

    sas_token = get_sas_token()
    composites: list[dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(fetch_composite_bands, item, lat, lon, sas_token) for item in items]
        for fut in futures:
            composites.append(fut.result())

    composites.sort(key=lambda c: c["dateKey"])
    day_stats = summarize_qc_lst(composites, "dayLst", "dayQc")
    night_stats = summarize_qc_lst(composites, "nightLst", "nightQc")

    mean_day_k = day_stats["meanK"]
    mean_night_k = night_stats["meanK"]
    mean_temp_k = (
        round((mean_day_k + mean_night_k) / 2.0, 2)
        if (mean_day_k is not None and mean_night_k is not None)
        else None
    )
    diurnal_swing_k = (
        round(mean_day_k - mean_night_k, 2)
        if (mean_day_k is not None and mean_night_k is not None)
        else None
    )

    tr0 = items[0]["properties"]["proj:transform"]
    cell_m = round(abs(float(tr0[0])), 1)
    win_m = round(cell_m * 3.0, 0)
    tile_id = items[0]["id"].split(".")[2]  # e.g. h11v11

    start_cal = composites[0]["startDatetime"][:10] or composites[0]["dateKey"]
    end_cal = composites[-1]["endDatetime"][:10] or composites[-1]["dateKey"]
    has_both = mean_day_k is not None and mean_night_k is not None

    return {
        "id": site["id"],
        "name": site["name"],
        "lat": lat,
        "lon": lon,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": f"MOD11A2.061 ({tile_id})",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": f"{cell_m} m native SIN grid; 3x3 ({int(win_m)} m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": f"{start_cal} to {end_cal} ({len(composites)} 8-day Terra composites)",
        "status": "Regenerated" if has_both else "Pending",
        "meanDayLstC": day_stats["meanC"],
        "meanNightLstC": night_stats["meanC"],
        "dayLstStdC": day_stats["stdC"],
        "nightLstStdC": night_stats["stdC"],
        "meanDayLstK": mean_day_k,
        "meanNightLstK": mean_night_k,
        "meanTempK": mean_temp_k,
        "diurnalSwingK": diurnal_swing_k,
        "validDayPixels": day_stats["validPixels"],
        "totalDayPixels": day_stats["totalPixels"],
        "validDayDates": day_stats["validDates"],
        "validNightPixels": night_stats["validPixels"],
        "totalNightPixels": night_stats["totalPixels"],
        "validNightDates": night_stats["validDates"],
        "totalComposites": len(composites),
        "scale_factor_k": SCALE_FACTOR_K,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1",
    }


def main():
    rows: list[dict] = []
    for site in EARTH_SITES:
        print(f"[Stage 4] Extracting MOD11A2.061 (2023) for {site['name']} ({site['lat']}, {site['lon']})...")
        row = extract_site(site)
        rows.append(row)
        print(
            f"  -> {row['status']} ({row['product_id']}, {row['totalComposites']} composites): "
            f"Day={row['meanDayLstC']} C (std {row['dayLstStdC']} C, {row['validDayPixels']}/{row['totalDayPixels']} px), "
            f"Night={row['meanNightLstC']} C (std {row['nightLstStdC']} C, {row['validNightPixels']}/{row['totalNightPixels']} px), "
            f"Mean={row['meanTempK']} K, Swing={row['diurnalSwingK']} K"
        )

    csv_path = os.path.join(DATA_DIR, "stage4_earth_modis_thermal.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {csv_path}")

    json_path = os.path.join(DATA_DIR, "stage4_earth_modis_thermal.json")
    manifest = {
        "stage": "Stage 4",
        "dataset": "MODIS/Terra Land Surface Temperature and Emissivity 8-Day L3 Global 1 km (MOD11A2)",
        "product_id": "MOD11A2.061",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "common_period": "2023-01-01 to 2023-12-31 (Terra MOD11A2.A2023* 8-day composites)",
        "scale_factor_k": SCALE_FACTOR_K,
        "kelvin_to_celsius_offset": -KELVIN_OFFSET_C,
        "sites": rows,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote {json_path}")


if __name__ == "__main__":
    main()
