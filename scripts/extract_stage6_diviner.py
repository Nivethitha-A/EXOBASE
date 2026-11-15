"""
EXOBASE Stage 6A — Moon LRO Diviner Thermal Extraction Pipeline

Extracts genuine satellite-derived bolometric brightness temperatures and rock abundance
across all 4 Moon reference regions from NASA PDS Geosciences Node:
  1. LRO-L-DLRE-5-GCP-V1.0 (Global Cumulative Products, 0.5 deg x 0.5 deg x 96 local-time bins)
     - Covers all latitudes (including Shackleton Crater Rim at -89.54S via 90s80s band)
     - Computes mean daytime (06:00-18:00 LT) & mean nighttime (18:00-06:00 LT) bolometric Temp
     - Derives cycle meanTempK = (dayMeanK + nightMeanK)/2 and diurnalSwingK = dayMeanK - nightMeanK
       consistent with Stage 4 Earth MODIS day/night thermal definitions, plus min/max extremes.
  2. LRO-L-DLRE-5-GHRM-V1.0 (Global High-Resolution Mosaics, 128 ppd = 236.9 m/pix, 70S-70N)
     - 5x5 patch (~1.18 km) sampling of midnight bolometric temp (dghrm_tbol_m),
       midnight rock-free regolith temp (dghrm_treg_m), and rock abundance (dghrm_ra_sam)
       for mid/low-latitude regions within 70S-70N (explicitly null for Shackleton at -89.54S).

Strict rules:
  - Reuses exact Stage 2 Moon coordinates (no coordinate changes).
  - Never fabricates values or replaces out-of-domain/missing pixels with zero.

Outputs:
  - data/stage6_moon_diviner_thermal.csv
  - data/stage6_moon_diviner_thermal.json
"""

import csv
import json
import math
import os
import statistics
import struct
import subprocess
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

DIVINER_BASE = "https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1"
GCP_BASE = f"{DIVINER_BASE}/data_derived_gcp"
GHRM_BASE = f"{DIVINER_BASE}/data_derived_ghrm/img"

GCP_RECORD_BYTES = 113
GCP_NLTIM = 96
GCP_NLAT_PER_BAND = 20
GCP_NLON = 720
GCP_MISSING = -9999.0

GHRM_PPD = 128.0
GHRM_LINES = 17920
GHRM_SAMPLES = 46080
GHRM_MAX_LAT = 70.0
GHRM_MIN_LAT = -70.0

MOON_REGIONS = [
    {
        "id": "moon-shackleton",
        "name": "Shackleton Crater Rim",
        "lat": -89.54,
        "lon": 129.78,
        "gcp_band": "90s80s",
        "band_min_lat": -90.0,
    },
    {
        "id": "moon-tranquillitatis",
        "name": "Mare Tranquillitatis",
        "lat": 8.50,
        "lon": 31.40,
        "gcp_band": "00n10n",
        "band_min_lat": 0.0,
    },
    {
        "id": "moon-aristarchus",
        "name": "Aristarchus Plateau",
        "lat": 23.70,
        "lon": 312.60,
        "gcp_band": "20n30n",
        "band_min_lat": 20.0,
    },
    {
        "id": "moon-tycho",
        "name": "Tycho Crater Ejecta Blanket",
        "lat": -43.31,
        "lon": 348.64,
        "gcp_band": "50s40s",
        "band_min_lat": -50.0,
    },
]


def fetch_range(url: str, start: int, length: int, max_retries: int = 4) -> bytes:
    end = start + length - 1
    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            out = subprocess.check_output(
                ["curl", "-sS", "-f", "--max-time", "20", "-r", f"{start}-{end}", url],
                timeout=25,
            )
            if len(out) != length:
                raise RuntimeError(f"Expected {length} bytes from {url}, got {len(out)}")
            return out
        except Exception as err:
            last_err = err
            time.sleep(min(8.0, 1.5 * attempt))
    raise RuntimeError(f"Range fetch failed for {url}: {last_err}")


def extract_gcp_cell(band: str, band_min_lat: float, lon_idx: int, lat_idx: int) -> dict:
    url = f"{GCP_BASE}/global_cumul_avg_cyl_{band}_002.tab"
    header_line = fetch_range(url, 0, GCP_RECORD_BYTES).decode("ascii").strip()
    cols = [c.strip() for c in header_line.split(",")]
    if len(cols) < 11 or cols[0] != "clon" or cols[2] != "ltim" or cols[10] != "tbol":
        raise RuntimeError(f"Unexpected GCP header in {band}: {header_line}")

    expected_clon = -179.75 + lon_idx * 0.5
    expected_clat = band_min_lat + 0.25 + lat_idx * 0.5

    byte_start = GCP_RECORD_BYTES + (lon_idx * GCP_NLAT_PER_BAND + lat_idx) * GCP_NLTIM * GCP_RECORD_BYTES
    raw_block = fetch_range(url, byte_start, GCP_NLTIM * GCP_RECORD_BYTES).decode("ascii")
    lines = [ln.strip() for ln in raw_block.splitlines() if ln.strip()]
    if len(lines) != GCP_NLTIM:
        raise RuntimeError(f"Expected {GCP_NLTIM} lines in GCP block, got {len(lines)}")

    day_vals: list[float] = []
    night_vals: list[float] = []
    all_vals: list[float] = []

    for ln in lines:
        parts = [float(x.strip()) for x in ln.split(",")]
        clon, clat, ltim, tbol = parts[0], parts[1], parts[2], parts[10]
        if abs(clon - expected_clon) > 0.02 or abs(clat - expected_clat) > 0.02:
            raise RuntimeError(
                f"GCP grid index mismatch: got ({clon}, {clat}), expected ({expected_clon}, {expected_clat})"
            )
        if tbol <= 0.0 or tbol == GCP_MISSING or tbol > 500.0 or math.isnan(tbol):
            continue
        all_vals.append(tbol)
        if 6.0 <= ltim < 18.0:
            day_vals.append(tbol)
        else:
            night_vals.append(tbol)

    if not day_vals or not night_vals:
        raise RuntimeError(f"Insufficient day/night GCP observations at ({expected_clat}, {expected_clon})")

    day_mean = sum(day_vals) / len(day_vals)
    night_mean = sum(night_vals) / len(night_vals)
    return {
        "cellLon": expected_clon,
        "cellLat": expected_clat,
        "dayMeanK": round(day_mean, 2),
        "nightMeanK": round(night_mean, 2),
        "meanTempK": round((day_mean + night_mean) / 2.0, 2),
        "diurnalSwingK": round(day_mean - night_mean, 2),
        "allBinMeanK": round(sum(all_vals) / len(all_vals), 2),
        "minTempK": round(min(all_vals), 2),
        "maxTempK": round(max(all_vals), 2),
        "maxMinAmplitudeK": round(max(all_vals) - min(all_vals), 2),
        "validDayBins": len(day_vals),
        "validNightBins": len(night_vals),
        "validLocalTimeBins": len(all_vals),
    }


def extract_ghrm_patch(filename: str, lat: float, lon_e: float, min_valid: float, max_valid: float) -> dict:
    url = f"{GHRM_BASE}/{filename}"
    center_row = int(round((GHRM_MAX_LAT - lat) * GHRM_PPD - 0.5))
    center_col = int(round((lon_e % 360.0) * GHRM_PPD - 0.5)) % GHRM_SAMPLES

    vals: list[float] = []
    for dr in range(-2, 3):
        r = max(0, min(GHRM_LINES - 1, center_row + dr))
        cols = [(center_col + dc) % GHRM_SAMPLES for dc in range(-2, 3)]
        if cols[-1] > cols[0] and (cols[-1] - cols[0]) < 16:
            span = cols[-1] - cols[0] + 1
            raw = fetch_range(url, (r * GHRM_SAMPLES + cols[0]) * 4, span * 4)
            unpacked = struct.unpack(f"<{span}f", raw)
            for c in cols:
                v = unpacked[c - cols[0]]
                if not math.isnan(v) and not math.isinf(v) and min_valid <= v <= max_valid:
                    vals.append(v)
        else:
            for c in cols:
                raw = fetch_range(url, (r * GHRM_SAMPLES + c) * 4, 4)
                v = struct.unpack("<f", raw)[0]
                if not math.isnan(v) and not math.isinf(v) and min_valid <= v <= max_valid:
                    vals.append(v)

    if not vals:
        return {"mean": None, "std": None, "validPixels": 0}
    return {
        "mean": sum(vals) / len(vals),
        "std": statistics.pstdev(vals) if len(vals) > 1 else 0.0,
        "validPixels": len(vals),
    }


def extract_region(reg: dict) -> dict:
    lat = reg["lat"]
    lon = reg["lon"]
    lon_180 = ((lon + 180.0) % 360.0) - 180.0
    lon_idx = max(0, min(GCP_NLON - 1, int(math.floor((lon_180 + 180.0) / 0.5))))
    lat_idx = max(0, min(GCP_NLAT_PER_BAND - 1, int(math.floor((lat - reg["band_min_lat"]) / 0.5))))

    print(f"[Stage 6A] Extracting Diviner GCP ({reg['gcp_band']}) for {reg['name']}...")
    gcp = extract_gcp_cell(reg["gcp_band"], reg["band_min_lat"], lon_idx, lat_idx)

    # For Shackleton (-89.54S), also record adjacent polar bin (-89.25S) due to steep rim gradient
    adjacent_note = ""
    if reg["id"] == "moon-shackleton" and lat_idx + 1 < GCP_NLAT_PER_BAND:
        adj = extract_gcp_cell(reg["gcp_band"], reg["band_min_lat"], lon_idx, lat_idx + 1)
        adjacent_note = (
            f"Adjacent 0.5-deg polar rim bin at ({adj['cellLat']}, {adj['cellLon']}): "
            f"dayMean={adj['dayMeanK']} K, nightMean={adj['nightMeanK']} K, "
            f"min={adj['minTempK']} K, max={adj['maxTempK']} K."
        )

    in_ghrm_domain = GHRM_MIN_LAT <= lat <= GHRM_MAX_LAT
    ghrm_tbol = None
    ghrm_treg = None
    ghrm_ra = None
    ghrm_valid_px = None
    ghrm_note = ""

    if in_ghrm_domain:
        print(f"[Stage 6A] Extracting Diviner GHRM 5x5 patch (236.9 m/pix) for {reg['name']}...")
        tbol_res = extract_ghrm_patch("dghrm_tbol_m_70s70n_img.img", lat, lon, 10.0, 500.0)
        treg_res = extract_ghrm_patch("dghrm_treg_m_70s70n_img.img", lat, lon, 10.0, 500.0)
        ra_res = extract_ghrm_patch("dghrm_ra_sam_70s70n_img.img", lat, lon, 0.0, 1.0)
        ghrm_tbol = round(tbol_res["mean"], 2) if tbol_res["mean"] is not None else None
        ghrm_treg = round(treg_res["mean"], 2) if treg_res["mean"] is not None else None
        ghrm_ra = round(ra_res["mean"], 4) if ra_res["mean"] is not None else None
        ghrm_valid_px = tbol_res["validPixels"]
        ghrm_note = "5x5 patch (~1.18 km) centered on target coordinates"
    else:
        ghrm_note = "Outside 70S-70N GHRM cylindrical domain; polar thermal covered by LRO-L-DLRE-5-GCP-V1.0 90s80s"

    products = f"LRO-L-DLRE-5-GCP-V1.0 (global_cumul_avg_cyl_{reg['gcp_band']}_002.tab)"
    if in_ghrm_domain:
        products += " + LRO-L-DLRE-5-GHRM-V1.0 (dghrm_tbol_m/treg_m/ra_sam_70s70n_img)"

    return {
        "id": reg["id"],
        "name": reg["name"],
        "lat": lat,
        "lon": lon,
        "dataset": "LRO Diviner Lunar Radiometer (GCP + GHRM)",
        "product_id": products,
        "resolution": (
            "0.5 deg diurnal bin (~15.2 km eq) + 236.9 m GHRM 5x5 patch (~1.18 km)"
            if in_ghrm_domain
            else "0.5 deg South Polar diurnal bin (GCP 90s80s)"
        ),
        "source": f"NASA PDS Geosciences Node ({DIVINER_BASE})",
        "extraction_method": (
            "HTTP byte-range extraction of 96 local-time bolometric temperature bins from GCP + "
            + ("5x5 IEEE754 float32 GHRM midnight Tbol/Treg/Rock Abundance patch" if in_ghrm_domain else "polar bin coverage")
        ),
        "status": "Regenerated",
        "gcpCellLat": gcp["cellLat"],
        "gcpCellLon": gcp["cellLon"],
        "dayMeanTempK": gcp["dayMeanK"],
        "nightMeanTempK": gcp["nightMeanK"],
        "meanTempK": gcp["meanTempK"],
        "diurnalSwingK": gcp["diurnalSwingK"],
        "allBinMeanTempK": gcp["allBinMeanK"],
        "minNightTempK": gcp["minTempK"],
        "maxDayTempK": gcp["maxTempK"],
        "maxMinAmplitudeK": gcp["maxMinAmplitudeK"],
        "validLocalTimeBins": gcp["validLocalTimeBins"],
        "ghrmMidnightTbolK": ghrm_tbol,
        "ghrmMidnightTregK": ghrm_treg,
        "ghrmRockAbundance": ghrm_ra,
        "ghrmValidPixels": ghrm_valid_px,
        "ghrmCoverageNote": ghrm_note,
        "polarGradientNote": adjacent_note,
    }


def main():
    rows = [extract_region(reg) for reg in MOON_REGIONS]

    csv_path = os.path.join(DATA_DIR, "stage6_moon_diviner_thermal.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {csv_path}")

    json_path = os.path.join(DATA_DIR, "stage6_moon_diviner_thermal.json")
    manifest = {
        "stage": "Stage 6A",
        "dataset": "LRO Diviner Lunar Radiometer (LRO-L-DLRE-5-GCP-V1.0 + LRO-L-DLRE-5-GHRM-V1.0)",
        "source": f"NASA PDS Geosciences Node ({DIVINER_BASE})",
        "definition_note": "meanTempK = (dayMeanTempK + nightMeanTempK)/2 and diurnalSwingK = dayMeanTempK - nightMeanTempK for consistent day/night cycle comparison with Earth MODIS; maxMinAmplitudeK preserves full 96-bin diurnal peak-to-trough range.",
        "status": "Regenerated",
        "regions": rows,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote {json_path}")


if __name__ == "__main__":
    main()
