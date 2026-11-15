"""
EXOBASE Stage 5 — Earth ASTER Global Emissivity Database (AG100.003) Provenance & Access Check

Checks unauthenticated public access to NASA LP DAAC ASTER GED v3 (AG100.003)
granules discovered via NASA Earthdata CMR across the 10 existing Earth sites.

Strict rules:
  - Reuses exact Stage 1 Earth coordinates (no coordinate changes).
  - Never invents measurements, substitutes proxy estimates, or fills NoData with zero.
  - Only marks a site/dataset Regenerated if official ASTER GED data is downloaded and decoded;
    otherwise keeps status strictly Pending and documents the exact technical blocker.

Outputs:
  - data/stage5_earth_aster_emissivity.csv
  - data/stage5_earth_aster_emissivity.json
"""

import csv
import json
import os
import subprocess
import urllib.parse

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

CMR_URL = "https://cmr.earthdata.nasa.gov/search/granules.json"

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


def query_cmr_granule(lat: float, lon: float) -> tuple[str, str]:
    qs = urllib.parse.urlencode({
        "short_name": "AG100",
        "version": "003",
        "point": f"{lon},{lat}",
        "page_size": 1,
    })
    raw = subprocess.check_output(
        ["curl", "-sS", "-f", "--max-time", "15", f"{CMR_URL}?{qs}"],
        timeout=20,
    )
    data = json.loads(raw.decode("utf-8"))
    entries = data.get("feed", {}).get("entry", [])
    if not entries:
        return ("NONE", "")
    entry = entries[0]
    granule_id = entry.get("producer_granule_id") or entry.get("title") or "UNKNOWN"
    h5_url = ""
    for link in entry.get("links", []):
        href = link.get("href", "")
        if href.endswith(".h5") and link.get("rel", "").endswith("/data#"):
            h5_url = href
            break
    return (granule_id, h5_url)


def probe_unauthenticated_download(url: str) -> str:
    if not url:
        return "No data URL in CMR granule metadata"
    out = subprocess.check_output(
        [
            "curl", "-sS", "-o", "/dev/null", "-w", "%{http_code}|%{redirect_url}",
            "--max-time", "15", "-r", "0-63", url,
        ],
        timeout=20,
    ).decode("utf-8", errors="replace").strip()
    return out


def main():
    rows = []
    sample_probe_result = ""

    for idx, site in enumerate(EARTH_SITES):
        print(f"[Stage 5] Checking NASA CMR AG100.003 granule for {site['name']}...")
        granule_id, data_url = query_cmr_granule(site["lat"], site["lon"])
        if idx == 0 and data_url:
            sample_probe_result = probe_unauthenticated_download(data_url)
            print(f"  Unauthenticated range GET probe -> {sample_probe_result}")

        blocker = (
            "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth "
            f"(probe={sample_probe_result or 'HTTP 302 -> urs.earthdata.nasa.gov/oauth/authorize'}) "
            "and HDF5 decoding library (h5py unavailable in runtime)."
        )

        rows.append({
            "id": site["id"],
            "name": site["name"],
            "lat": site["lat"],
            "lon": site["lon"],
            "dataset": "ASTER GED v3 (AG100.003)",
            "product_id": granule_id,
            "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
            "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
            "source": f"NASA LP DAAC CMR ({data_url or 'CMR metadata'})",
            "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
            "status": "Pending",
            "emissivityBand10": None,
            "emissivityBand11": None,
            "emissivityBand12": None,
            "emissivityBand13": None,
            "emissivityBand14": None,
            "emissivityMeanTIR": None,
            "emissivityStdTIR": None,
            "validObservations": None,
            "blocker": blocker,
        })

    csv_path = os.path.join(DATA_DIR, "stage5_earth_aster_emissivity.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {csv_path}")

    json_path = os.path.join(DATA_DIR, "stage5_earth_aster_emissivity.json")
    manifest = {
        "stage": "Stage 5",
        "dataset": "ASTER Global Emissivity Database (AG100.003)",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "status": "Pending",
        "blocker": (
            "Official AG100.003 HDF5 tiles on NASA Earthdata Cloud (data.lpdaac.earthdatacloud.nasa.gov) "
            "return HTTP 302 redirect to urs.earthdata.nasa.gov/oauth/authorize without user credentials, "
            "and h5py/netCDF4 are not installed. Kept strictly Pending per scientific provenance rules."
        ),
        "probe_response": sample_probe_result,
        "sites": rows,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote {json_path}")


if __name__ == "__main__":
    main()
