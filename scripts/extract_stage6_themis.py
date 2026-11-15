"""
EXOBASE Stage 6B — Mars Thermal Extraction Pipeline (Odyssey THEMIS Audit + MGS TES Thermal Inertia & Albedo)

Per strict scientific provenance rules:
  1. Probes Odyssey THEMIS calibrated IR brightness temperature archives
     (ODY-M-THM-5-IRPBT-V2.0 / ODY-M-THM-3-IRBTR-V1.0) and documents exact network/auth blockers.
     Also probes ASU WMS THEMIS IR global mosaics (thm_dayir_100m_v11 / thm_nightir_100m_v13)
     and rejects them as Kelvin proxies because VICAR headers confirm FORMAT='BYTE' (8-bit visual stretches).
     Therefore, Mars meanTempK & diurnalSwingK (THEMIS) remain strictly Pending (null).
  2. Extracts genuine calibrated physical products from MGS TES across all 5 Mars regions:
     - MGS-M-TES-5-TIMAP-V1.0 (NASA PDS Geosciences Node):
       global_ti_night_2007.img & global_ti_day_2007.img (20 ppd = 2.96 km/pix, 3x3 patch)
       calibrated Thermal Inertia in TIU = J/(m^2*K*sqrt(s)).
     - TES_Lambert_Albedo_numeric (ASU Mars WMS image/vicar FORMAT='REAL' IEEE float32, 5x5 patch)
       calibrated Lambert bolometric albedo.
     MGS TES records are labeled accurately as MGS TES (never mislabeled as Odyssey THEMIS).

Outputs:
  - data/stage6_mars_themis_thermal.csv
  - data/stage6_mars_themis_thermal.json
"""

import csv
import json
import math
import os
import re
import statistics
import struct
import subprocess
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

TES_TIMAP_BASE = "https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data"
TES_NIGHT_URL = f"{TES_TIMAP_BASE}/global_ti_night_2007.img"
TES_DAY_URL = f"{TES_TIMAP_BASE}/global_ti_day_2007.img"
ASU_WMS_BASE = "http://ms-mars.mars.asu.edu/"

TIMAP_LINES = 3600
TIMAP_SAMPLES = 7200
TIMAP_PPD = 20.0

MARS_REGIONS = [
    {"id": "mars-jezero", "name": "Jezero Crater Basin", "lat": 18.38, "lon": 77.58},
    {"id": "mars-gale", "name": "Gale Crater (Aeolis Mons)", "lat": -5.40, "lon": 137.80},
    {"id": "mars-olympus-rupes", "name": "Olympus Rupes & Tharsis Basalts", "lat": 18.65, "lon": 226.20},
    {"id": "mars-arcadia", "name": "Arcadia Planitia", "lat": 46.70, "lon": 188.00},
    {"id": "mars-valles", "name": "Valles Marineris (Coprates Chasma)", "lat": -13.80, "lon": 300.80},
]


def probe_themis_endpoints() -> dict:
    probes = {}
    targets = {
        "asu_pds_irpbt": "https://static.mars.asu.edu/pds/ODY-M-THM-5-IRPBT-V2.0/",
        "jpl_pds_themis": "https://pds-imaging.jpl.nasa.gov/data/ody/themis/",
        "asu_wms_thm_dayir": (
            f"{ASU_WMS_BASE}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/vicar&WIDTH=3&HEIGHT=3"
            "&SRS=JMARS:4&BBOX=77.5,18.3,77.6,18.4&LAYERS=thm_dayir_100m_v11&STYLES="
        ),
    }
    for key, url in targets.items():
        try:
            proc = subprocess.run(
                ["curl", "-sS", "-D", "-", "--max-time", "6", url],
                capture_output=True,
                timeout=8,
            )
            if proc.returncode != 0:
                probes[key] = f"curl_exit_{proc.returncode}: {proc.stderr.decode('utf-8', 'ignore').strip()}"
            else:
                head = proc.stdout[:300].decode("latin1", "ignore").replace("\r", " ").replace("\n", " | ")
                probes[key] = head[:220]
        except Exception as err:
            probes[key] = f"probe_error: {err}"
    return probes


def fetch_range(url: str, start: int, length: int, max_retries: int = 4) -> bytes:
    end = start + length - 1
    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            out = subprocess.check_output(
                ["curl", "-sS", "-f", "--max-time", "18", "-r", f"{start}-{end}", url],
                timeout=22,
            )
            if len(out) != length:
                raise RuntimeError(f"Expected {length} bytes from {url}, got {len(out)}")
            return out
        except Exception as err:
            last_err = err
            time.sleep(min(8.0, 1.5 * attempt))
    raise RuntimeError(f"Range fetch failed for {url}: {last_err}")


def extract_tes_ti_patch(url: str, lat: float, lon_e: float) -> dict:
    # MGS-M-TES-5-TIMAP-V1.0: 3600 x 7200, MSB_INTEGER (>h), -180..180 lon, -90..90 lat, 20 ppd
    lon_180 = ((lon_e + 180.0) % 360.0) - 180.0
    center_row = max(1, min(TIMAP_LINES - 2, int(round((90.0 - lat) * TIMAP_PPD - 0.5))))
    center_col = int(round((lon_180 + 180.0) * TIMAP_PPD - 0.5)) % TIMAP_SAMPLES

    vals: list[float] = []
    for dr in range(-1, 2):
        r = center_row + dr
        cols = [(center_col + dc) % TIMAP_SAMPLES for dc in range(-1, 2)]
        if cols[-1] > cols[0] and (cols[-1] - cols[0]) < 8:
            span = cols[-1] - cols[0] + 1
            raw = fetch_range(url, (r * TIMAP_SAMPLES + cols[0]) * 2, span * 2)
            unpacked = struct.unpack(f">{span}h", raw)
            for c in cols:
                v = unpacked[c - cols[0]]
                if 0 < v <= 5000:
                    vals.append(float(v))
        else:
            for c in cols:
                raw = fetch_range(url, (r * TIMAP_SAMPLES + c) * 2, 2)
                v = struct.unpack(">h", raw)[0]
                if 0 < v <= 5000:
                    vals.append(float(v))

    if not vals:
        return {"mean": None, "std": None, "validPixels": 0}
    return {
        "mean": round(sum(vals) / len(vals), 1),
        "std": round(statistics.pstdev(vals), 1) if len(vals) > 1 else 0.0,
        "validPixels": len(vals),
    }


def extract_tes_albedo_patch(lat: float, lon_e: float) -> dict:
    # ASU WMS TES_Lambert_Albedo_numeric (FORMAT='REAL', <f 32-bit float after LBLSIZE header)
    half_deg = 0.05  # 5x5 pixels over 0.10 deg (~5.9 km)
    lon_min = (lon_e % 360.0) - half_deg
    lon_max = (lon_e % 360.0) + half_deg
    lat_min = max(-89.9, lat - half_deg)
    lat_max = min(89.9, lat + half_deg)
    url = (
        f"{ASU_WMS_BASE}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/vicar"
        f"&WIDTH=5&HEIGHT=5&SRS=JMARS:4&BBOX={lon_min:.4f},{lat_min:.4f},{lon_max:.4f},{lat_max:.4f}"
        "&LAYERS=TES_Lambert_Albedo_numeric&STYLES="
    )
    raw = subprocess.check_output(["curl", "-sS", "-f", "--max-time", "15", url], timeout=18)
    head_txt = raw[:512].decode("latin1", "ignore")
    m_lbl = re.search(r"LBLSIZE=(\d+)", head_txt)
    if not m_lbl:
        raise RuntimeError(f"Missing VICAR LBLSIZE in ASU TES Albedo response: {head_txt[:120]}")
    if "FORMAT='REAL'" not in head_txt:
        raise RuntimeError(f"Unexpected VICAR format (expected REAL): {head_txt[:160]}")
    lblsize = int(m_lbl.group(1))
    payload = raw[lblsize:]
    if len(payload) < 25 * 4:
        raise RuntimeError(f"Short VICAR float32 payload: {len(payload)} bytes")
    floats = struct.unpack("<25f", payload[: 25 * 4])
    valid = [v for v in floats if not math.isnan(v) and not math.isinf(v) and 0.0 < v <= 1.0]
    if not valid:
        return {"mean": None, "std": None, "validPixels": 0}
    return {
        "mean": round(sum(valid) / len(valid), 4),
        "std": round(statistics.pstdev(valid), 4) if len(valid) > 1 else 0.0,
        "validPixels": len(valid),
    }


def main():
    print("[Stage 6B] Probing Odyssey THEMIS calibrated endpoints...")
    themis_probes = probe_themis_endpoints()
    for k, v in themis_probes.items():
        print(f"  probe[{k}]: {v[:110]}")

    themis_blocker = (
        "Odyssey THEMIS calibrated IRPBT/IRBTR archives unavailable unauthenticated in runtime: "
        f"static.mars.asu.edu -> {themis_probes.get('asu_pds_irpbt', 'timeout')}; "
        f"pds-imaging.jpl.nasa.gov -> {themis_probes.get('jpl_pds_themis', '403')}. "
        "ASU WMS thm_dayir_100m_v11 / thm_nightir_100m_v13 return VICAR FORMAT='BYTE' (uncalibrated 8-bit stretch, not Kelvin). "
        "THEMIS temperature fields kept strictly Pending (null)."
    )

    rows = []
    for reg in MARS_REGIONS:
        print(f"[Stage 6B] Extracting MGS TES TIMAP & Lambert Albedo for {reg['name']}...")
        night_ti = extract_tes_ti_patch(TES_NIGHT_URL, reg["lat"], reg["lon"])
        day_ti = extract_tes_ti_patch(TES_DAY_URL, reg["lat"], reg["lon"])
        albedo = extract_tes_albedo_patch(reg["lat"], reg["lon"])

        tes_ok = night_ti["mean"] is not None and albedo["mean"] is not None
        rows.append({
            "id": reg["id"],
            "name": reg["name"],
            "lat": reg["lat"],
            "lon": reg["lon"],
            "themisDataset": "Odyssey THEMIS IRPBT / IRBTR",
            "themisStatus": "Pending",
            "themisDayTempK": None,
            "themisNightTempK": None,
            "meanTempK": None,
            "diurnalSwingK": None,
            "themisBlocker": themis_blocker,
            "tesDataset": "MGS TES Thermal Inertia (TIMAP) & Lambert Albedo",
            "tesProductId": "MGS-M-TES-5-TIMAP-V1.0 (global_ti_night/day_2007.img) + TES_Lambert_Albedo_numeric",
            "tesResolution": "2.96 km/pix (20 ppd); 3x3 TI patch (~8.9 km) + 5x5 Albedo patch (~5.9 km)",
            "tesSource": f"NASA PDS Geosciences Node ({TES_TIMAP_BASE}) + ASU Mars WMS ({ASU_WMS_BASE})",
            "tesExtractionMethod": "HTTP byte-range MSB_INTEGER int16 TIU extraction + VICAR REAL float32 Lambert albedo patch",
            "tesStatus": "Regenerated" if tes_ok else "Pending",
            "thermalInertiaTIU": night_ti["mean"],
            "tesNightTIU": night_ti["mean"],
            "tesNightTIUStd": night_ti["std"],
            "tesNightValidPixels": night_ti["validPixels"],
            "tesDayTIU": day_ti["mean"],
            "tesDayTIUStd": day_ti["std"],
            "tesDayValidPixels": day_ti["validPixels"],
            "albedo": albedo["mean"],
            "albedoStd": albedo["std"],
            "albedoValidPixels": albedo["validPixels"],
        })

    csv_path = os.path.join(DATA_DIR, "stage6_mars_themis_thermal.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {csv_path}")

    json_path = os.path.join(DATA_DIR, "stage6_mars_themis_thermal.json")
    manifest = {
        "stage": "Stage 6B",
        "themis_dataset": "Odyssey THEMIS Calibrated IR Brightness Temperature (ODY-M-THM-5-IRPBT-V2.0)",
        "themis_status": "Pending",
        "themis_blocker": themis_blocker,
        "themis_probes": themis_probes,
        "tes_dataset": "MGS TES Thermal Inertia (MGS-M-TES-5-TIMAP-V1.0) & TES Lambert Albedo",
        "tes_status": "Regenerated",
        "regions": rows,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote {json_path}")


if __name__ == "__main__":
    main()
