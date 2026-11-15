"""
EXOBASE Catalog Builder — Merges Stages 4, 5, 6A, and 6B Verified JSON Extracts
into a single strongly-typed TypeScript module: src/shared/verifiedThermalData.ts.

Strict rules:
  - Preserves null for all Pending/missing values (never fabricates or zero-fills).
  - Keeps Stage 4-6 provenance metadata, blockers, and dataset statuses intact.
"""

import json
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
TS_OUT_PATH = os.path.join(ROOT_DIR, "src", "shared", "verifiedThermalData.ts")


def load_json(filename: str) -> dict:
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    stage4 = load_json("stage4_earth_modis_thermal.json")
    stage5 = load_json("stage5_earth_aster_emissivity.json")
    stage6a = load_json("stage6_moon_diviner_thermal.json")
    stage6b = load_json("stage6_mars_themis_thermal.json")

    earth_modis_rows = stage4["sites"]
    earth_aster_rows = stage5["sites"]
    moon_diviner_rows = stage6a["regions"]
    mars_thermal_rows = stage6b["regions"]

    payload = {
        "stage4": {
            "dataset": stage4["dataset"],
            "productId": stage4["product_id"],
            "doi": stage4["doi"],
            "commonPeriod": stage4["common_period"],
            "status": "Regenerated" if all(s.get("status") == "Regenerated" for s in earth_modis_rows) else "Pending",
            "sites": earth_modis_rows,
        },
        "stage5": {
            "dataset": stage5["dataset"],
            "doi": stage5["doi"],
            "status": stage5["status"],
            "blocker": stage5["blocker"],
            "sites": earth_aster_rows,
        },
        "stage6a": {
            "dataset": stage6a["dataset"],
            "source": stage6a["source"],
            "definitionNote": stage6a["definition_note"],
            "status": stage6a["status"],
            "regions": moon_diviner_rows,
        },
        "stage6b": {
            "themisDataset": stage6b["themis_dataset"],
            "themisStatus": stage6b["themis_status"],
            "themisBlocker": stage6b["themis_blocker"],
            "tesDataset": stage6b["tes_dataset"],
            "tesStatus": stage6b["tes_status"],
            "regions": mars_thermal_rows,
        },
    }

    ts_code = (
        "// Auto-generated directly by scripts/build_verified_catalog.py (do not manually edit)\n"
        "// Preserves null for all Pending/out-of-domain fields; never zero-fills NoData.\n\n"
        "export interface Stage4ModisExtract {\n"
        "  id: string;\n"
        "  name: string;\n"
        "  lat: number;\n"
        "  lon: number;\n"
        "  dataset: string;\n"
        "  product_id: string;\n"
        "  doi: string;\n"
        "  resolution: string;\n"
        "  source: string;\n"
        "  extraction_method: string;\n"
        "  temporal_coverage: string;\n"
        "  status: 'Regenerated' | 'Pending';\n"
        "  meanDayLstC: number | null;\n"
        "  meanNightLstC: number | null;\n"
        "  dayLstStdC: number | null;\n"
        "  nightLstStdC: number | null;\n"
        "  meanDayLstK: number | null;\n"
        "  meanNightLstK: number | null;\n"
        "  meanTempK: number | null;\n"
        "  diurnalSwingK: number | null;\n"
        "  validDayPixels: number;\n"
        "  totalDayPixels: number;\n"
        "  validDayDates: number;\n"
        "  validNightPixels: number;\n"
        "  totalNightPixels: number;\n"
        "  validNightDates: number;\n"
        "  totalComposites: number;\n"
        "  scale_factor_k: number;\n"
        "  qc_rule: string;\n"
        "}\n\n"
        "export interface Stage5AsterExtract {\n"
        "  id: string;\n"
        "  name: string;\n"
        "  lat: number;\n"
        "  lon: number;\n"
        "  dataset: string;\n"
        "  product_id: string;\n"
        "  doi: string;\n"
        "  resolution: string;\n"
        "  source: string;\n"
        "  extraction_method: string;\n"
        "  status: 'Regenerated' | 'Pending';\n"
        "  emissivityBand10: number | null;\n"
        "  emissivityBand11: number | null;\n"
        "  emissivityBand12: number | null;\n"
        "  emissivityBand13: number | null;\n"
        "  emissivityBand14: number | null;\n"
        "  emissivityMeanTIR: number | null;\n"
        "  emissivityStdTIR: number | null;\n"
        "  validObservations: number | null;\n"
        "  blocker: string;\n"
        "}\n\n"
        "export interface Stage6MoonDivinerExtract {\n"
        "  id: string;\n"
        "  name: string;\n"
        "  lat: number;\n"
        "  lon: number;\n"
        "  dataset: string;\n"
        "  product_id: string;\n"
        "  resolution: string;\n"
        "  source: string;\n"
        "  extraction_method: string;\n"
        "  status: 'Regenerated' | 'Pending';\n"
        "  gcpCellLat: number;\n"
        "  gcpCellLon: number;\n"
        "  dayMeanTempK: number;\n"
        "  nightMeanTempK: number;\n"
        "  meanTempK: number;\n"
        "  diurnalSwingK: number;\n"
        "  allBinMeanTempK: number;\n"
        "  minNightTempK: number;\n"
        "  maxDayTempK: number;\n"
        "  maxMinAmplitudeK: number;\n"
        "  validLocalTimeBins: number;\n"
        "  ghrmMidnightTbolK: number | null;\n"
        "  ghrmMidnightTregK: number | null;\n"
        "  ghrmRockAbundance: number | null;\n"
        "  ghrmValidPixels: number | null;\n"
        "  ghrmCoverageNote: string;\n"
        "  polarGradientNote: string;\n"
        "}\n\n"
        "export interface Stage6MarsThermalExtract {\n"
        "  id: string;\n"
        "  name: string;\n"
        "  lat: number;\n"
        "  lon: number;\n"
        "  themisDataset: string;\n"
        "  themisStatus: 'Regenerated' | 'Pending';\n"
        "  themisDayTempK: number | null;\n"
        "  themisNightTempK: number | null;\n"
        "  meanTempK: number | null;\n"
        "  diurnalSwingK: number | null;\n"
        "  themisBlocker: string;\n"
        "  tesDataset: string;\n"
        "  tesProductId: string;\n"
        "  tesResolution: string;\n"
        "  tesSource: string;\n"
        "  tesExtractionMethod: string;\n"
        "  tesStatus: 'Regenerated' | 'Pending';\n"
        "  thermalInertiaTIU: number | null;\n"
        "  tesNightTIU: number | null;\n"
        "  tesNightTIUStd: number | null;\n"
        "  tesNightValidPixels: number;\n"
        "  tesDayTIU: number | null;\n"
        "  tesDayTIUStd: number | null;\n"
        "  tesDayValidPixels: number;\n"
        "  albedo: number | null;\n"
        "  albedoStd: number | null;\n"
        "  albedoValidPixels: number;\n"
        "}\n\n"
        "export interface VerifiedThermalCatalog {\n"
        "  stage4: {\n"
        "    dataset: string;\n"
        "    productId: string;\n"
        "    doi: string;\n"
        "    commonPeriod: string;\n"
        "    status: 'Regenerated' | 'Pending';\n"
        "    sites: Stage4ModisExtract[];\n"
        "  };\n"
        "  stage5: {\n"
        "    dataset: string;\n"
        "    doi: string;\n"
        "    status: 'Regenerated' | 'Pending';\n"
        "    blocker: string;\n"
        "    sites: Stage5AsterExtract[];\n"
        "  };\n"
        "  stage6a: {\n"
        "    dataset: string;\n"
        "    source: string;\n"
        "    definitionNote: string;\n"
        "    status: 'Regenerated' | 'Pending';\n"
        "    regions: Stage6MoonDivinerExtract[];\n"
        "  };\n"
        "  stage6b: {\n"
        "    themisDataset: string;\n"
        "    themisStatus: 'Regenerated' | 'Pending';\n"
        "    themisBlocker: string;\n"
        "    tesDataset: string;\n"
        "    tesStatus: 'Regenerated' | 'Pending';\n"
        "    regions: Stage6MarsThermalExtract[];\n"
        "  };\n"
        "}\n\n"
        "export const VERIFIED_THERMAL_CATALOG: VerifiedThermalCatalog = "
        + json.dumps(payload, indent=2)
        + ";\n"
    )

    with open(TS_OUT_PATH, "w", encoding="utf-8") as f:
        f.write(ts_code)
    print(f"Wrote {TS_OUT_PATH}")


if __name__ == "__main__":
    main()
