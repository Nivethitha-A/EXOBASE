"""
EXOBASE Stage 1-3 Harmonized Terrain Feature Extraction Pipeline

Standardizes spatial scale across Earth, Moon, and Mars (~950 m metric stencil)
and enforces consistent slope, Riley TRI roughness, and local relief formulas:
  - Stage 1 (Earth): Open-Meteo Elevation API v1 (Copernicus DEM GLO-90, 90 m native)
                     sampled on an equal-area 950 m x 950 m metric stencil.
  - Stage 2 (Moon):  NASA PDS LRO-L-LOLA-4-GDR-V1.0
                     * Shackleton (-89.54S): Polar Stereographic LDEM_75S_240M.IMG (4x240m = 960 m)
                     * Mid/Low-Latitudes: Simple Cylindrical LDEM_64.IMG (2x473.8m = 947.6 m)
  - Stage 3 (Mars):  NASA PDS MGS-M-MOLA-5-MEGDR-L3-V1.0
                     * meg064 quadrant tiles (64 pix/deg = 926.1 m/pix)

Single source of truth: writes CSVs, JSON manifest, and TypeScript data module.
"""

import csv
import json
import math
import os
import struct
import subprocess
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
TS_OUT_PATH = os.path.join(ROOT_DIR, "src", "shared", "verifiedTerrainData.ts")
os.makedirs(DATA_DIR, exist_ok=True)

LOLA_BASE = "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr"
LDEM_64_URL = f"{LOLA_BASE}/cylindrical/img/ldem_64.img"
LDEM_75S_240M_URL = f"{LOLA_BASE}/polar/img/ldem_75s_240m.img"
MOLA_64_BASE = "https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg064"

TRI_GLOBAL_DIVISOR_M = 1100.0
FILL_INT16 = -32768

EARTH_SITES = [
    {"id": "earth-atacama", "name": "Atacama Desert (Yungay & Salar Grande)", "lat": -24.10, "lon": -69.92, "coverage_note": "Mid-latitude (within SRTM 60N-56S)"},
    {"id": "earth-ladakh", "name": "Ladakh (Tso Kar & Nubra Cold Desert)", "lat": 33.31, "lon": 78.01, "coverage_note": "Mid-latitude (within SRTM 60N-56S)"},
    {"id": "earth-iceland", "name": "Icelandic Volcanic Fields (Askja & Krafla)", "lat": 65.03, "lon": -16.75, "coverage_note": "High-latitude >60N (outside SRTM; ArcticDEM/Copernicus zone)"},
    {"id": "earth-rann-kutch", "name": "Rann of Kutch (Great Rann Salt Flats)", "lat": 23.95, "lon": 69.80, "coverage_note": "Mid-latitude (within SRTM 60N-56S)"},
    {"id": "earth-makgadikgadi", "name": "Makgadikgadi Salt Pans", "lat": -20.72, "lon": 25.25, "coverage_note": "Mid-latitude (within SRTM 60N-56S)"},
    {"id": "earth-devon", "name": "Devon Island (Haughton Impact Structure)", "lat": 75.38, "lon": -89.68, "coverage_note": "High-latitude >60N (outside SRTM; ArcticDEM/Copernicus zone)"},
    {"id": "earth-mojave", "name": "Mojave Desert (Cima Volcanic Field)", "lat": 35.25, "lon": -115.75, "coverage_note": "Mid-latitude (within SRTM 60N-56S)"},
    {"id": "earth-rio-tinto", "name": "Rio Tinto Basin (Iberian Pyrite Belt)", "lat": 37.70, "lon": -6.55, "coverage_note": "Mid-latitude (within SRTM 60N-56S)"},
    {"id": "earth-mcmurdo", "name": "McMurdo Dry Valleys", "lat": -77.47, "lon": 162.52, "coverage_note": "Antarctic <56S (outside SRTM; REMA/Copernicus zone)"},
    {"id": "earth-lanzarote", "name": "Lanzarote Volcanic Field (Timanfaya)", "lat": 29.00, "lon": -13.75, "coverage_note": "Mid-latitude (within SRTM 60N-56S)"},
]

MOON_REGIONS = [
    {"id": "moon-shackleton", "name": "Shackleton Crater Rim", "lat": -89.54, "lon": 129.78},
    {"id": "moon-tranquillitatis", "name": "Mare Tranquillitatis", "lat": 8.50, "lon": 31.40},
    {"id": "moon-aristarchus", "name": "Aristarchus Plateau", "lat": 23.70, "lon": 312.60},
    {"id": "moon-tycho", "name": "Tycho Crater Ejecta Blanket", "lat": -43.31, "lon": 348.64},
]

MARS_REGIONS = [
    {"id": "mars-jezero", "name": "Jezero Crater Basin", "lat": 18.38, "lon": 77.58},
    {"id": "mars-gale", "name": "Gale Crater (Aeolis Mons)", "lat": -5.40, "lon": 137.80},
    {"id": "mars-olympus-rupes", "name": "Olympus Rupes & Tharsis Basalts", "lat": 18.65, "lon": 226.20},
    {"id": "mars-arcadia", "name": "Arcadia Planitia", "lat": 46.70, "lon": 188.00},
    {"id": "mars-valles", "name": "Valles Marineris (Coprates Chasma)", "lat": -13.80, "lon": 300.80},
]


def fetch_range(url: str, start: int, length: int) -> bytes:
    end = start + length - 1
    out = subprocess.check_output(
        ["curl", "-sS", "-f", "--max-time", "12", "-r", f"{start}-{end}", url],
        timeout=15,
    )
    if len(out) != length:
        raise RuntimeError(f"Expected {length} bytes from {url}, got {len(out)}")
    return out


def compute_metric_patch_stats(grid: list[list[float]], dx_m: float, dy_m: float) -> dict:
    flat = [v for row in grid for v in row]
    mean_elev = sum(flat) / len(flat)
    local_relief = max(flat) - min(flat)

    slopes = []
    tris = []
    for r in range(1, 4):
        for c in range(1, 4):
            dz_dx = (grid[r][c + 1] - grid[r][c - 1]) / (2.0 * dx_m)
            dz_dy = (grid[r + 1][c] - grid[r - 1][c]) / (2.0 * dy_m)
            slope_rad = math.atan(math.sqrt(dz_dx * dz_dx + dz_dy * dz_dy))
            slopes.append(math.degrees(slope_rad))

            center = grid[r][c]
            neighbors = [
                grid[r - 1][c - 1], grid[r - 1][c], grid[r - 1][c + 1],
                grid[r][c - 1],                     grid[r][c + 1],
                grid[r + 1][c - 1], grid[r + 1][c], grid[r + 1][c + 1],
            ]
            tri_m = math.sqrt(sum((n - center) ** 2 for n in neighbors) / 8.0)
            tris.append(tri_m)

    mean_slope = sum(slopes) / len(slopes)
    mean_tri_m = sum(tris) / len(tris)
    tri_norm = round(min(1.0, max(0.001, mean_tri_m / TRI_GLOBAL_DIVISOR_M)), 3)

    return {
        "elevationM": round(mean_elev, 1),
        "slopeDeg": round(mean_slope, 2),
        "roughnessIndex": tri_norm,
        "roughnessMeters": round(mean_tri_m, 1),
        "localReliefM": round(local_relief, 1),
        "gridStepMetersX": round(dx_m, 1),
        "gridStepMetersY": round(dy_m, 1),
    }


def sample_earth_harmonized(lat: float, lon: float, target_step_m: float = 950.0) -> dict:
    # Equal-area metric stencil of 950 m x 950 m across all latitudes
    earth_r_m = 6371000.0
    dlat_deg = math.degrees(target_step_m / earth_r_m)
    cos_lat = max(0.05, math.cos(math.radians(lat)))
    dlon_deg = math.degrees(target_step_m / (earth_r_m * cos_lat))

    coords = []
    for dr in range(-2, 3):
        for dc in range(-2, 3):
            p_lat = max(-89.9, min(89.9, lat - dr * dlat_deg))
            p_lon = ((lon + dc * dlon_deg + 180.0) % 360.0) - 180.0
            coords.append((p_lat, p_lon))

    lat_str = ",".join(f"{c[0]:.5f}" for c in coords)
    lon_str = ",".join(f"{c[1]:.5f}" for c in coords)
    url = f"https://api.open-meteo.com/v1/elevation?latitude={lat_str}&longitude={lon_str}"
    raw_json = subprocess.check_output(["curl", "-sS", "-f", "--max-time", "12", url], timeout=15)
    data = json.loads(raw_json.decode("utf-8"))
    time.sleep(0.15)

    elevs = data["elevation"]
    if len(elevs) != 25:
        raise RuntimeError(f"Expected 25 elevation samples, got {len(elevs)}")
    grid = [elevs[i * 5 : (i + 1) * 5] for i in range(5)]
    return compute_metric_patch_stats(grid, target_step_m, target_step_m)


def sample_lola_polar_south(lat: float, lon: float) -> dict:
    # NASA PDS LRO-L-LOLA-4-GDR-V1.0 / LDEM_75S_240M.IMG
    # Polar Stereographic (South Pole), N=3812, MAP_SCALE=240 m/pix, LSB_INTEGER, scale=0.5 m
    n = 3812
    map_scale = 240.0
    moon_r_m = 1737400.0
    stride = 4  # 4 * 240 m = 960 m harmonized metric stencil

    # Per DSMAP_POLAR.CAT:
    # LAT = -90 + (180/pi) * 2 * atan(0.5 * R / 1737400) => R = 2 * 1737400 * tan((90 + lat)*pi/360)
    r_m = 2.0 * moon_r_m * math.tan(math.radians(90.0 + lat) / 2.0)
    lon_rad = math.radians(lon)
    x_m = r_m * math.sin(lon_rad)
    y_m = r_m * math.cos(lon_rad)  # NS = -1 in southern hemisphere

    center_col = int(round((n / 2.0 - 0.5) + x_m / map_scale))
    center_row = int(round((n / 2.0 - 0.5) - y_m / map_scale))

    grid = []
    for dr in range(-2, 3):
        r = max(0, min(n - 1, center_row + dr * stride))
        cols = [max(0, min(n - 1, center_col + dc * stride)) for dc in range(-2, 3)]
        c_min, c_max = cols[0], cols[-1]
        span = c_max - c_min + 1
        raw = fetch_range(LDEM_75S_240M_URL, (r * n + c_min) * 2, span * 2)
        unpacked = struct.unpack(f"<{span}h", raw)
        row_vals = []
        for c in cols:
            dn = unpacked[c - c_min]
            if dn == FILL_INT16:
                raise RuntimeError(f"Fill value encountered in LDEM_75S_240M at row={r}, col={c}")
            row_vals.append(dn * 0.5)
        grid.append(row_vals)

    step_m = map_scale * stride  # 960.0 m
    return compute_metric_patch_stats(grid, step_m, step_m)


def sample_lola_cylindrical_64(lat: float, lon: float) -> dict:
    # NASA PDS LRO-L-LOLA-4-GDR-V1.0 / LDEM_64.IMG
    # Simple Cylindrical 64 pix/deg, 11520 lines x 23040 samples, LSB_INTEGER, scale=0.5 m
    pix_per_deg = 64.0
    lines = 11520
    line_samples = 23040
    moon_r_m = 1737400.0

    center_row = max(4, min(lines - 5, int(round((90.0 - lat) * pix_per_deg - 0.5))))
    center_col = int(round((lon % 360.0) * pix_per_deg - 0.5)) % line_samples

    stride_lat = 2  # 2 * 473.8 m = 947.6 m
    cos_lat = max(0.1, math.cos(math.radians(lat)))
    stride_lon = max(1, int(round(stride_lat / cos_lat)))

    dy_m = (stride_lat / pix_per_deg) * (math.pi / 180.0) * moon_r_m
    dx_m = (stride_lon / pix_per_deg) * (math.pi / 180.0) * moon_r_m * cos_lat

    grid = []
    for dr in range(-2, 3):
        r = center_row + dr * stride_lat
        cols = [(center_col + dc * stride_lon) % line_samples for dc in range(-2, 3)]
        if cols[-1] > cols[0] and (cols[-1] - cols[0]) < 32:
            span = cols[-1] - cols[0] + 1
            raw = fetch_range(LDEM_64_URL, (r * line_samples + cols[0]) * 2, span * 2)
            unpacked = struct.unpack(f"<{span}h", raw)
            row_vals = []
            for c in cols:
                dn = unpacked[c - cols[0]]
                if dn == FILL_INT16:
                    raise RuntimeError(f"Fill value encountered in LDEM_64 at row={r}, col={c}")
                row_vals.append(dn * 0.5)
        else:
            row_vals = []
            for c in cols:
                raw = fetch_range(LDEM_64_URL, (r * line_samples + c) * 2, 2)
                dn = struct.unpack("<h", raw)[0]
                if dn == FILL_INT16:
                    raise RuntimeError(f"Fill value encountered in LDEM_64 at row={r}, col={c}")
                row_vals.append(dn * 0.5)
        grid.append(row_vals)

    return compute_metric_patch_stats(grid, dx_m, dy_m)


def sample_mola_cylindrical_64(lat: float, lon: float) -> tuple[dict, str]:
    # NASA PDS MGS-M-MOLA-5-MEGDR-L3-V1.0 / meg064 quadrant tiles
    # Each tile: 5760 lines (90 deg) x 11520 samples (180 deg), MSB_INTEGER (>h), scale=1.0 m
    lon_e = lon % 360.0
    is_north = lat >= 0.0
    is_west_hemi = lon_e < 180.0

    if is_north and is_west_hemi:
        tile = "megt90n000gb.img"
        max_lat = 90.0
        min_lon = 0.0
    elif is_north and not is_west_hemi:
        tile = "megt90n180gb.img"
        max_lat = 90.0
        min_lon = 180.0
    elif not is_north and is_west_hemi:
        tile = "megt00n000gb.img"
        max_lat = 0.0
        min_lon = 0.0
    else:
        tile = "megt00n180gb.img"
        max_lat = 0.0
        min_lon = 180.0

    url = f"{MOLA_64_BASE}/{tile}"
    pix_per_deg = 64.0
    lines = 5760
    line_samples = 11520
    mars_r_m = 3396000.0

    center_row = max(4, min(lines - 5, int(round((max_lat - lat) * pix_per_deg - 0.5))))
    center_col = max(4, min(line_samples - 5, int(round((lon_e - min_lon) * pix_per_deg - 0.5))))

    stride_lat = 1  # 1 * 926.1 m = 926.1 m
    cos_lat = max(0.1, math.cos(math.radians(lat)))
    stride_lon = max(1, int(round(stride_lat / cos_lat)))

    dy_m = (stride_lat / pix_per_deg) * (math.pi / 180.0) * mars_r_m
    dx_m = (stride_lon / pix_per_deg) * (math.pi / 180.0) * mars_r_m * cos_lat

    grid = []
    for dr in range(-2, 3):
        r = center_row + dr * stride_lat
        cols = [center_col + dc * stride_lon for dc in range(-2, 3)]
        c_min, c_max = cols[0], cols[-1]
        span = c_max - c_min + 1
        raw = fetch_range(url, (r * line_samples + c_min) * 2, span * 2)
        unpacked = struct.unpack(f">{span}h", raw)
        row_vals = []
        for c in cols:
            dn = unpacked[c - c_min]
            if dn == FILL_INT16:
                raise RuntimeError(f"Fill value encountered in {tile} at row={r}, col={c}")
            row_vals.append(float(dn))
        grid.append(row_vals)

    return compute_metric_patch_stats(grid, dx_m, dy_m), tile


def main():
    earth_rows = []
    for site in EARTH_SITES:
        print(f"[Stage 1] Extracting Earth 950 m metric stencil: {site['name']}...")
        m = sample_earth_harmonized(site["lat"], site["lon"], target_step_m=950.0)
        earth_rows.append({
            "id": site["id"],
            "name": site["name"],
            "lat": site["lat"],
            "lon": site["lon"],
            "dataset": "Copernicus DEM GLO-90 (via Open-Meteo Elevation API)",
            "product_id": "COP-DEM_GLO-90 / open-meteo-v1-elevation",
            "resolution": f"90 m native; {m['gridStepMetersX']}x{m['gridStepMetersY']} m stencil",
            "source": "Open-Meteo Elevation API (Copernicus DEM GLO-90)",
            "coverage_note": site["coverage_note"],
            "status": "Regenerated",
            **m,
        })

    moon_rows = []
    for reg in MOON_REGIONS:
        if abs(reg["lat"]) >= 75.0:
            print(f"[Stage 2] Extracting Moon LOLA Polar Stereographic (LDEM_75S_240M): {reg['name']}...")
            m = sample_lola_polar_south(reg["lat"], reg["lon"])
            product_id = "LRO-L-LOLA-4-GDR-V1.0 / LDEM_75S_240M.IMG (Polar Stereographic)"
            resolution = f"240 m native; {m['gridStepMetersX']}x{m['gridStepMetersY']} m stencil"
        else:
            print(f"[Stage 2] Extracting Moon LOLA Cylindrical 64ppd (LDEM_64): {reg['name']}...")
            m = sample_lola_cylindrical_64(reg["lat"], reg["lon"])
            product_id = "LRO-L-LOLA-4-GDR-V1.0 / LDEM_64.IMG (Simple Cylindrical)"
            resolution = f"473.8 m native; {m['gridStepMetersX']}x{m['gridStepMetersY']} m stencil"

        moon_rows.append({
            "id": reg["id"],
            "name": reg["name"],
            "lat": reg["lat"],
            "lon": reg["lon"],
            "dataset": "LRO LOLA GDRDEM",
            "product_id": product_id,
            "resolution": resolution,
            "source": "NASA PDS Geosciences Node (archive: lro-l-lola-3-rdr-v1/.../lola_gdr)",
            "status": "Regenerated",
            **m,
        })

    mars_rows = []
    for reg in MARS_REGIONS:
        print(f"[Stage 3] Extracting Mars MOLA 64ppd (meg064): {reg['name']}...")
        m, tile = sample_mola_cylindrical_64(reg["lat"], reg["lon"])
        mars_rows.append({
            "id": reg["id"],
            "name": reg["name"],
            "lat": reg["lat"],
            "lon": reg["lon"],
            "dataset": "MGS MOLA MEGDR",
            "product_id": f"MGS-M-MOLA-5-MEGDR-L3-V1.0 / {tile.upper()}",
            "resolution": f"926.1 m native; {m['gridStepMetersX']}x{m['gridStepMetersY']} m stencil",
            "source": "NASA PDS Geosciences Node (mgsl_300x/meg064)",
            "status": "Regenerated",
            **m,
        })

    def write_csv(filename: str, rows: list[dict]):
        path = os.path.join(DATA_DIR, filename)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
        print(f"Wrote {path}")

    write_csv("stage1_earth_terrain.csv", earth_rows)
    write_csv("stage2_moon_lola_terrain.csv", moon_rows)
    write_csv("stage3_mars_mola_terrain.csv", mars_rows)

    manifest = {
        "earth": earth_rows,
        "moon": moon_rows,
        "mars": mars_rows,
    }
    manifest_path = os.path.join(DATA_DIR, "verified_terrain_extracts.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote {manifest_path}")

    ts_content = (
        "// Auto-generated directly by scripts/extract_stage1_3_terrain.py (do not manually edit)\n"
        "export interface VerifiedTerrainExtract {\n"
        "  id: string;\n"
        "  name: string;\n"
        "  lat: number;\n"
        "  lon: number;\n"
        "  dataset: string;\n"
        "  product_id: string;\n"
        "  resolution: string;\n"
        "  source: string;\n"
        "  coverage_note?: string;\n"
        "  status: 'Regenerated';\n"
        "  elevationM: number;\n"
        "  slopeDeg: number;\n"
        "  roughnessIndex: number;\n"
        "  roughnessMeters: number;\n"
        "  localReliefM: number;\n"
        "  gridStepMetersX: number;\n"
        "  gridStepMetersY: number;\n"
        "}\n\n"
        "export const VERIFIED_TERRAIN_EXTRACTS: {\n"
        "  earth: VerifiedTerrainExtract[];\n"
        "  moon: VerifiedTerrainExtract[];\n"
        "  mars: VerifiedTerrainExtract[];\n"
        "} = "
        + json.dumps(manifest, indent=2)
        + ";\n"
    )
    with open(TS_OUT_PATH, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Wrote {TS_OUT_PATH}")


if __name__ == "__main__":
    main()
