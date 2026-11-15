// Auto-generated directly by scripts/build_verified_catalog.py (do not manually edit)
// Preserves null for all Pending/out-of-domain fields; never zero-fills NoData.

export interface Stage4ModisExtract {
  id: string;
  name: string;
  lat: number;
  lon: number;
  dataset: string;
  product_id: string;
  doi: string;
  resolution: string;
  source: string;
  extraction_method: string;
  temporal_coverage: string;
  status: 'Regenerated' | 'Pending';
  meanDayLstC: number | null;
  meanNightLstC: number | null;
  dayLstStdC: number | null;
  nightLstStdC: number | null;
  meanDayLstK: number | null;
  meanNightLstK: number | null;
  meanTempK: number | null;
  diurnalSwingK: number | null;
  validDayPixels: number;
  totalDayPixels: number;
  validDayDates: number;
  validNightPixels: number;
  totalNightPixels: number;
  validNightDates: number;
  totalComposites: number;
  scale_factor_k: number;
  qc_rule: string;
}

export interface Stage5AsterExtract {
  id: string;
  name: string;
  lat: number;
  lon: number;
  dataset: string;
  product_id: string;
  doi: string;
  resolution: string;
  source: string;
  extraction_method: string;
  status: 'Regenerated' | 'Pending';
  emissivityBand10: number | null;
  emissivityBand11: number | null;
  emissivityBand12: number | null;
  emissivityBand13: number | null;
  emissivityBand14: number | null;
  emissivityMeanTIR: number | null;
  emissivityStdTIR: number | null;
  validObservations: number | null;
  blocker: string;
}

export interface Stage6MoonDivinerExtract {
  id: string;
  name: string;
  lat: number;
  lon: number;
  dataset: string;
  product_id: string;
  resolution: string;
  source: string;
  extraction_method: string;
  status: 'Regenerated' | 'Pending';
  gcpCellLat: number;
  gcpCellLon: number;
  dayMeanTempK: number;
  nightMeanTempK: number;
  meanTempK: number;
  diurnalSwingK: number;
  allBinMeanTempK: number;
  minNightTempK: number;
  maxDayTempK: number;
  maxMinAmplitudeK: number;
  validLocalTimeBins: number;
  ghrmMidnightTbolK: number | null;
  ghrmMidnightTregK: number | null;
  ghrmRockAbundance: number | null;
  ghrmValidPixels: number | null;
  ghrmCoverageNote: string;
  polarGradientNote: string;
}

export interface Stage6MarsThermalExtract {
  id: string;
  name: string;
  lat: number;
  lon: number;
  themisDataset: string;
  themisStatus: 'Regenerated' | 'Pending';
  themisDayTempK: number | null;
  themisNightTempK: number | null;
  meanTempK: number | null;
  diurnalSwingK: number | null;
  themisBlocker: string;
  tesDataset: string;
  tesProductId: string;
  tesResolution: string;
  tesSource: string;
  tesExtractionMethod: string;
  tesStatus: 'Regenerated' | 'Pending';
  thermalInertiaTIU: number | null;
  tesNightTIU: number | null;
  tesNightTIUStd: number | null;
  tesNightValidPixels: number;
  tesDayTIU: number | null;
  tesDayTIUStd: number | null;
  tesDayValidPixels: number;
  albedo: number | null;
  albedoStd: number | null;
  albedoValidPixels: number;
}

export interface VerifiedThermalCatalog {
  stage4: {
    dataset: string;
    productId: string;
    doi: string;
    commonPeriod: string;
    status: 'Regenerated' | 'Pending';
    sites: Stage4ModisExtract[];
  };
  stage5: {
    dataset: string;
    doi: string;
    status: 'Regenerated' | 'Pending';
    blocker: string;
    sites: Stage5AsterExtract[];
  };
  stage6a: {
    dataset: string;
    source: string;
    definitionNote: string;
    status: 'Regenerated' | 'Pending';
    regions: Stage6MoonDivinerExtract[];
  };
  stage6b: {
    themisDataset: string;
    themisStatus: 'Regenerated' | 'Pending';
    themisBlocker: string;
    tesDataset: string;
    tesStatus: 'Regenerated' | 'Pending';
    regions: Stage6MarsThermalExtract[];
  };
}

export const VERIFIED_THERMAL_CATALOG: VerifiedThermalCatalog = {
  "stage4": {
    "dataset": "MODIS/Terra Land Surface Temperature and Emissivity 8-Day L3 Global 1 km (MOD11A2)",
    "productId": "MOD11A2.061",
    "doi": "10.5067/MODIS/MOD11A2.061",
    "commonPeriod": "2023-01-01 to 2023-12-31 (Terra MOD11A2.A2023* 8-day composites)",
    "status": "Regenerated",
    "sites": [
      {
        "id": "earth-atacama",
        "name": "Atacama Desert (Yungay & Salar Grande)",
        "lat": -24.1,
        "lon": -69.92,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h11v11)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": 42.22,
        "meanNightLstC": 10.59,
        "dayLstStdC": 8.97,
        "nightLstStdC": 3.46,
        "meanDayLstK": 315.37,
        "meanNightLstK": 283.74,
        "meanTempK": 299.56,
        "diurnalSwingK": 31.63,
        "validDayPixels": 396,
        "totalDayPixels": 396,
        "validDayDates": 44,
        "validNightPixels": 387,
        "totalNightPixels": 396,
        "validNightDates": 44,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-ladakh",
        "name": "Ladakh (Tso Kar & Nubra Cold Desert)",
        "lat": 33.31,
        "lon": 78.01,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h24v05)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": 11.1,
        "meanNightLstC": -6.43,
        "dayLstStdC": 10.65,
        "nightLstStdC": 10.7,
        "meanDayLstK": 284.25,
        "meanNightLstK": 266.72,
        "meanTempK": 275.49,
        "diurnalSwingK": 17.53,
        "validDayPixels": 371,
        "totalDayPixels": 396,
        "validDayDates": 44,
        "validNightPixels": 396,
        "totalNightPixels": 396,
        "validNightDates": 44,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-iceland",
        "name": "Icelandic Volcanic Fields (Askja & Krafla)",
        "lat": 65.03,
        "lon": -16.75,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h17v02)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": -1.11,
        "meanNightLstC": -3.77,
        "dayLstStdC": 7.65,
        "nightLstStdC": 6.25,
        "meanDayLstK": 272.04,
        "meanNightLstK": 269.38,
        "meanTempK": 270.71,
        "diurnalSwingK": 2.66,
        "validDayPixels": 345,
        "totalDayPixels": 396,
        "validDayDates": 42,
        "validNightPixels": 357,
        "totalNightPixels": 396,
        "validNightDates": 41,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-rann-kutch",
        "name": "Rann of Kutch (Great Rann Salt Flats)",
        "lat": 23.95,
        "lon": 69.8,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h24v06)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": 31.84,
        "meanNightLstC": 23.34,
        "dayLstStdC": 5.38,
        "nightLstStdC": 4.38,
        "meanDayLstK": 304.99,
        "meanNightLstK": 296.49,
        "meanTempK": 300.74,
        "diurnalSwingK": 8.5,
        "validDayPixels": 374,
        "totalDayPixels": 396,
        "validDayDates": 43,
        "validNightPixels": 376,
        "totalNightPixels": 396,
        "validNightDates": 42,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-makgadikgadi",
        "name": "Makgadikgadi Salt Pans",
        "lat": -20.72,
        "lon": 25.25,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h20v11)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": 32.67,
        "meanNightLstC": 16.65,
        "dayLstStdC": 6.31,
        "nightLstStdC": 5.36,
        "meanDayLstK": 305.82,
        "meanNightLstK": 289.8,
        "meanTempK": 297.81,
        "diurnalSwingK": 16.02,
        "validDayPixels": 391,
        "totalDayPixels": 396,
        "validDayDates": 44,
        "validNightPixels": 387,
        "totalNightPixels": 396,
        "validNightDates": 43,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-devon",
        "name": "Devon Island (Haughton Impact Structure)",
        "lat": 75.38,
        "lon": -89.68,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h15v01)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": -17.15,
        "meanNightLstC": -19.87,
        "dayLstStdC": 19.2,
        "nightLstStdC": 17.84,
        "meanDayLstK": 256.0,
        "meanNightLstK": 253.28,
        "meanTempK": 254.64,
        "diurnalSwingK": 2.72,
        "validDayPixels": 396,
        "totalDayPixels": 396,
        "validDayDates": 44,
        "validNightPixels": 395,
        "totalNightPixels": 396,
        "validNightDates": 44,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-mojave",
        "name": "Mojave Desert (Cima Volcanic Field)",
        "lat": 35.25,
        "lon": -115.75,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h08v05)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": 32.13,
        "meanNightLstC": 11.45,
        "dayLstStdC": 12.9,
        "nightLstStdC": 8.85,
        "meanDayLstK": 305.28,
        "meanNightLstK": 284.6,
        "meanTempK": 294.94,
        "diurnalSwingK": 20.68,
        "validDayPixels": 396,
        "totalDayPixels": 396,
        "validDayDates": 44,
        "validNightPixels": 396,
        "totalNightPixels": 396,
        "validNightDates": 44,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-rio-tinto",
        "name": "Rio Tinto Basin (Iberian Pyrite Belt)",
        "lat": 37.7,
        "lon": -6.55,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h17v05)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": 28.6,
        "meanNightLstC": 14.8,
        "dayLstStdC": 11.02,
        "nightLstStdC": 7.05,
        "meanDayLstK": 301.75,
        "meanNightLstK": 287.95,
        "meanTempK": 294.85,
        "diurnalSwingK": 13.8,
        "validDayPixels": 393,
        "totalDayPixels": 396,
        "validDayDates": 44,
        "validNightPixels": 396,
        "totalNightPixels": 396,
        "validNightDates": 44,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-mcmurdo",
        "name": "McMurdo Dry Valleys",
        "lat": -77.47,
        "lon": 162.52,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h21v16)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": -26.65,
        "meanNightLstC": -27.94,
        "dayLstStdC": 11.2,
        "nightLstStdC": 9.69,
        "meanDayLstK": 246.5,
        "meanNightLstK": 245.21,
        "meanTempK": 245.86,
        "diurnalSwingK": 1.29,
        "validDayPixels": 371,
        "totalDayPixels": 396,
        "validDayDates": 44,
        "validNightPixels": 392,
        "totalNightPixels": 396,
        "validNightDates": 44,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      },
      {
        "id": "earth-lanzarote",
        "name": "Lanzarote Volcanic Field (Timanfaya)",
        "lat": 29.0,
        "lon": -13.75,
        "dataset": "MODIS/Terra LST 8-Day (MOD11A2)",
        "product_id": "MOD11A2.061 (h16v06)",
        "doi": "10.5067/MODIS/MOD11A2.061",
        "resolution": "926.6 m native SIN grid; 3x3 (2780 m) patch",
        "source": "NASA MOD11A2.061 via Microsoft Planetary Computer STAC & COG Archive",
        "extraction_method": "Annual 2023 3x3 Sinusoidal COG patch mean with DN [7500..65535] & QC bits 0-1 <= 1 masking, scale=0.02 K",
        "temporal_coverage": "2023-01-09 to 2023-12-31 (44 8-day Terra composites)",
        "status": "Regenerated",
        "meanDayLstC": 34.11,
        "meanNightLstC": 17.21,
        "dayLstStdC": 6.07,
        "nightLstStdC": 3.5,
        "meanDayLstK": 307.26,
        "meanNightLstK": 290.36,
        "meanTempK": 298.81,
        "diurnalSwingK": 16.9,
        "validDayPixels": 396,
        "totalDayPixels": 396,
        "validDayDates": 44,
        "validNightPixels": 396,
        "totalNightPixels": 396,
        "validNightDates": 44,
        "totalComposites": 44,
        "scale_factor_k": 0.02,
        "qc_rule": "Excluded DN==0, DN<7500, and mandatory QA bits (QC & 0b11) > 1"
      }
    ]
  },
  "stage5": {
    "dataset": "ASTER Global Emissivity Database (AG100.003)",
    "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
    "status": "Pending",
    "blocker": "Official AG100.003 HDF5 tiles on NASA Earthdata Cloud (data.lpdaac.earthdatacloud.nasa.gov) return HTTP 302 redirect to urs.earthdata.nasa.gov/oauth/authorize without user credentials, and h5py/netCDF4 are not installed. Kept strictly Pending per scientific provenance rules.",
    "sites": [
      {
        "id": "earth-atacama",
        "name": "Atacama Desert (Yungay & Salar Grande)",
        "lat": -24.1,
        "lon": -69.92,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.-24.-070.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.-24.-070.0001/AG100.v003.-24.-070.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-ladakh",
        "name": "Ladakh (Tso Kar & Nubra Cold Desert)",
        "lat": 33.31,
        "lon": 78.01,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.34.078.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.34.078.0001/AG100.v003.34.078.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-iceland",
        "name": "Icelandic Volcanic Fields (Askja & Krafla)",
        "lat": 65.03,
        "lon": -16.75,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.66.-017.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.66.-017.0001/AG100.v003.66.-017.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-rann-kutch",
        "name": "Rann of Kutch (Great Rann Salt Flats)",
        "lat": 23.95,
        "lon": 69.8,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.24.069.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.24.069.0001/AG100.v003.24.069.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-makgadikgadi",
        "name": "Makgadikgadi Salt Pans",
        "lat": -20.72,
        "lon": 25.25,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.-20.025.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.-20.025.0001/AG100.v003.-20.025.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-devon",
        "name": "Devon Island (Haughton Impact Structure)",
        "lat": 75.38,
        "lon": -89.68,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.76.-090.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.76.-090.0001/AG100.v003.76.-090.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-mojave",
        "name": "Mojave Desert (Cima Volcanic Field)",
        "lat": 35.25,
        "lon": -115.75,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.36.-116.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.36.-116.0001/AG100.v003.36.-116.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-rio-tinto",
        "name": "Rio Tinto Basin (Iberian Pyrite Belt)",
        "lat": 37.7,
        "lon": -6.55,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.38.-007.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.38.-007.0001/AG100.v003.38.-007.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-mcmurdo",
        "name": "McMurdo Dry Valleys",
        "lat": -77.47,
        "lon": 162.52,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "NONE",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (CMR metadata)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      },
      {
        "id": "earth-lanzarote",
        "name": "Lanzarote Volcanic Field (Timanfaya)",
        "lat": 29.0,
        "lon": -13.75,
        "dataset": "ASTER GED v3 (AG100.003)",
        "product_id": "AG100.v003.29.-014.0001",
        "doi": "10.5067/COMMUNITY/ASTER_GED/AG100.003",
        "resolution": "100 m native (TIR Bands 10-14: 8.29, 8.63, 9.08, 10.66, 11.32 um)",
        "source": "NASA LP DAAC CMR (https://data.lpdaac.earthdatacloud.nasa.gov/lp-prod-protected/AG100.003/AG100.v003.29.-014.0001/AG100.v003.29.-014.0001.h5)",
        "extraction_method": "Blocked pending authenticated Earthdata Login session + HDF5 reader; no proxy substitution",
        "status": "Pending",
        "emissivityBand10": null,
        "emissivityBand11": null,
        "emissivityBand12": null,
        "emissivityBand13": null,
        "emissivityBand14": null,
        "emissivityMeanTIR": null,
        "emissivityStdTIR": null,
        "validObservations": null,
        "blocker": "NASA LP DAAC AG100.003 HDF5 download requires Earthdata Login OAuth (probe=302|https://urs.earthdata.nasa.gov/oauth/authorize?client_id=FtSFfbOeuxDcdf4px-elGw&response_type=code&redirect_uri=https://data.lpdaac.earthdatacloud.nasa.gov/login&state=%2Flp-prod-protected%2FAG100.003%2FAG100.v003.-24.-070.0001%2FAG100.v003.-24.-070.0001.h5&app_type=401) and HDF5 decoding library (h5py unavailable in runtime)."
      }
    ]
  },
  "stage6a": {
    "dataset": "LRO Diviner Lunar Radiometer (LRO-L-DLRE-5-GCP-V1.0 + LRO-L-DLRE-5-GHRM-V1.0)",
    "source": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1)",
    "definitionNote": "meanTempK = (dayMeanTempK + nightMeanTempK)/2 and diurnalSwingK = dayMeanTempK - nightMeanTempK for consistent day/night cycle comparison with Earth MODIS; maxMinAmplitudeK preserves full 96-bin diurnal peak-to-trough range.",
    "status": "Regenerated",
    "regions": [
      {
        "id": "moon-shackleton",
        "name": "Shackleton Crater Rim",
        "lat": -89.54,
        "lon": 129.78,
        "dataset": "LRO Diviner Lunar Radiometer (GCP + GHRM)",
        "product_id": "LRO-L-DLRE-5-GCP-V1.0 (global_cumul_avg_cyl_90s80s_002.tab)",
        "resolution": "0.5 deg South Polar diurnal bin (GCP 90s80s)",
        "source": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1)",
        "extraction_method": "HTTP byte-range extraction of 96 local-time bolometric temperature bins from GCP + polar bin coverage",
        "status": "Regenerated",
        "gcpCellLat": -89.75,
        "gcpCellLon": 129.75,
        "dayMeanTempK": 75.99,
        "nightMeanTempK": 55.62,
        "meanTempK": 65.81,
        "diurnalSwingK": 20.36,
        "allBinMeanTempK": 65.81,
        "minNightTempK": 41.51,
        "maxDayTempK": 136.03,
        "maxMinAmplitudeK": 94.53,
        "validLocalTimeBins": 96,
        "ghrmMidnightTbolK": null,
        "ghrmMidnightTregK": null,
        "ghrmRockAbundance": null,
        "ghrmValidPixels": null,
        "ghrmCoverageNote": "Outside 70S-70N GHRM cylindrical domain; polar thermal covered by LRO-L-DLRE-5-GCP-V1.0 90s80s",
        "polarGradientNote": "Adjacent 0.5-deg polar rim bin at (-89.25, 129.75): dayMean=126.22 K, nightMean=90.16 K, min=50.51 K, max=168.32 K."
      },
      {
        "id": "moon-tranquillitatis",
        "name": "Mare Tranquillitatis",
        "lat": 8.5,
        "lon": 31.4,
        "dataset": "LRO Diviner Lunar Radiometer (GCP + GHRM)",
        "product_id": "LRO-L-DLRE-5-GCP-V1.0 (global_cumul_avg_cyl_00n10n_002.tab) + LRO-L-DLRE-5-GHRM-V1.0 (dghrm_tbol_m/treg_m/ra_sam_70s70n_img)",
        "resolution": "0.5 deg diurnal bin (~15.2 km eq) + 236.9 m GHRM 5x5 patch (~1.18 km)",
        "source": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1)",
        "extraction_method": "HTTP byte-range extraction of 96 local-time bolometric temperature bins from GCP + 5x5 IEEE754 float32 GHRM midnight Tbol/Treg/Rock Abundance patch",
        "status": "Regenerated",
        "gcpCellLat": 8.75,
        "gcpCellLon": 31.25,
        "dayMeanTempK": 361.05,
        "nightMeanTempK": 105.27,
        "meanTempK": 233.16,
        "diurnalSwingK": 255.78,
        "allBinMeanTempK": 217.18,
        "minNightTempK": 92.92,
        "maxDayTempK": 394.53,
        "maxMinAmplitudeK": 301.61,
        "validLocalTimeBins": 48,
        "ghrmMidnightTbolK": 100.82,
        "ghrmMidnightTregK": 99.58,
        "ghrmRockAbundance": 0.0031,
        "ghrmValidPixels": 25,
        "ghrmCoverageNote": "5x5 patch (~1.18 km) centered on target coordinates",
        "polarGradientNote": ""
      },
      {
        "id": "moon-aristarchus",
        "name": "Aristarchus Plateau",
        "lat": 23.7,
        "lon": 312.6,
        "dataset": "LRO Diviner Lunar Radiometer (GCP + GHRM)",
        "product_id": "LRO-L-DLRE-5-GCP-V1.0 (global_cumul_avg_cyl_20n30n_002.tab) + LRO-L-DLRE-5-GHRM-V1.0 (dghrm_tbol_m/treg_m/ra_sam_70s70n_img)",
        "resolution": "0.5 deg diurnal bin (~15.2 km eq) + 236.9 m GHRM 5x5 patch (~1.18 km)",
        "source": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1)",
        "extraction_method": "HTTP byte-range extraction of 96 local-time bolometric temperature bins from GCP + 5x5 IEEE754 float32 GHRM midnight Tbol/Treg/Rock Abundance patch",
        "status": "Regenerated",
        "gcpCellLat": 23.75,
        "gcpCellLon": -47.25,
        "dayMeanTempK": 322.08,
        "nightMeanTempK": 132.7,
        "meanTempK": 227.39,
        "diurnalSwingK": 189.38,
        "allBinMeanTempK": 219.37,
        "minNightTempK": 119.46,
        "maxDayTempK": 376.19,
        "maxMinAmplitudeK": 256.73,
        "validLocalTimeBins": 59,
        "ghrmMidnightTbolK": 117.77,
        "ghrmMidnightTregK": 110.2,
        "ghrmRockAbundance": 0.0271,
        "ghrmValidPixels": 25,
        "ghrmCoverageNote": "5x5 patch (~1.18 km) centered on target coordinates",
        "polarGradientNote": ""
      },
      {
        "id": "moon-tycho",
        "name": "Tycho Crater Ejecta Blanket",
        "lat": -43.31,
        "lon": 348.64,
        "dataset": "LRO Diviner Lunar Radiometer (GCP + GHRM)",
        "product_id": "LRO-L-DLRE-5-GCP-V1.0 (global_cumul_avg_cyl_50s40s_002.tab) + LRO-L-DLRE-5-GHRM-V1.0 (dghrm_tbol_m/treg_m/ra_sam_70s70n_img)",
        "resolution": "0.5 deg diurnal bin (~15.2 km eq) + 236.9 m GHRM 5x5 patch (~1.18 km)",
        "source": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1)",
        "extraction_method": "HTTP byte-range extraction of 96 local-time bolometric temperature bins from GCP + 5x5 IEEE754 float32 GHRM midnight Tbol/Treg/Rock Abundance patch",
        "status": "Regenerated",
        "gcpCellLat": -43.25,
        "gcpCellLon": -11.25,
        "dayMeanTempK": 294.73,
        "nightMeanTempK": 138.14,
        "meanTempK": 216.43,
        "diurnalSwingK": 156.6,
        "allBinMeanTempK": 209.05,
        "minNightTempK": 123.71,
        "maxDayTempK": 349.48,
        "maxMinAmplitudeK": 225.77,
        "validLocalTimeBins": 53,
        "ghrmMidnightTbolK": 126.19,
        "ghrmMidnightTregK": 118.29,
        "ghrmRockAbundance": 0.0399,
        "ghrmValidPixels": 25,
        "ghrmCoverageNote": "5x5 patch (~1.18 km) centered on target coordinates",
        "polarGradientNote": ""
      }
    ]
  },
  "stage6b": {
    "themisDataset": "Odyssey THEMIS Calibrated IR Brightness Temperature (ODY-M-THM-5-IRPBT-V2.0)",
    "themisStatus": "Pending",
    "themisBlocker": "Odyssey THEMIS calibrated IRPBT/IRBTR archives unavailable unauthenticated in runtime: static.mars.asu.edu -> curl_exit_28: curl: (28) Connection timed out after 6001 milliseconds; pds-imaging.jpl.nasa.gov -> HTTP/2 403   | server: awselb/2.0  | date: Sat, 14 Nov 2026 08:35:00 GMT  | content-type: text/html  | content-length: 118  |   | <html>  | <head><title>403 Forbidden</title></head>  | <body>  | <center><h1>403 Forbidden. ASU WMS thm_dayir_100m_v11 / thm_nightir_100m_v13 return VICAR FORMAT='BYTE' (uncalibrated 8-bit stretch, not Kelvin). THEMIS temperature fields kept strictly Pending (null).",
    "tesDataset": "MGS TES Thermal Inertia (MGS-M-TES-5-TIMAP-V1.0) & TES Lambert Albedo",
    "tesStatus": "Regenerated",
    "regions": [
      {
        "id": "mars-jezero",
        "name": "Jezero Crater Basin",
        "lat": 18.38,
        "lon": 77.58,
        "themisDataset": "Odyssey THEMIS IRPBT / IRBTR",
        "themisStatus": "Pending",
        "themisDayTempK": null,
        "themisNightTempK": null,
        "meanTempK": null,
        "diurnalSwingK": null,
        "themisBlocker": "Odyssey THEMIS calibrated IRPBT/IRBTR archives unavailable unauthenticated in runtime: static.mars.asu.edu -> curl_exit_28: curl: (28) Connection timed out after 6001 milliseconds; pds-imaging.jpl.nasa.gov -> HTTP/2 403   | server: awselb/2.0  | date: Sat, 14 Nov 2026 08:35:00 GMT  | content-type: text/html  | content-length: 118  |   | <html>  | <head><title>403 Forbidden</title></head>  | <body>  | <center><h1>403 Forbidden. ASU WMS thm_dayir_100m_v11 / thm_nightir_100m_v13 return VICAR FORMAT='BYTE' (uncalibrated 8-bit stretch, not Kelvin). THEMIS temperature fields kept strictly Pending (null).",
        "tesDataset": "MGS TES Thermal Inertia (TIMAP) & Lambert Albedo",
        "tesProductId": "MGS-M-TES-5-TIMAP-V1.0 (global_ti_night/day_2007.img) + TES_Lambert_Albedo_numeric",
        "tesResolution": "2.96 km/pix (20 ppd); 3x3 TI patch (~8.9 km) + 5x5 Albedo patch (~5.9 km)",
        "tesSource": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data) + ASU Mars WMS (http://ms-mars.mars.asu.edu/)",
        "tesExtractionMethod": "HTTP byte-range MSB_INTEGER int16 TIU extraction + VICAR REAL float32 Lambert albedo patch",
        "tesStatus": "Regenerated",
        "thermalInertiaTIU": 286.1,
        "tesNightTIU": 286.1,
        "tesNightTIUStd": 13.4,
        "tesNightValidPixels": 9,
        "tesDayTIU": 290.8,
        "tesDayTIUStd": 34.9,
        "tesDayValidPixels": 9,
        "albedo": 0.1492,
        "albedoStd": 0.0032,
        "albedoValidPixels": 25
      },
      {
        "id": "mars-gale",
        "name": "Gale Crater (Aeolis Mons)",
        "lat": -5.4,
        "lon": 137.8,
        "themisDataset": "Odyssey THEMIS IRPBT / IRBTR",
        "themisStatus": "Pending",
        "themisDayTempK": null,
        "themisNightTempK": null,
        "meanTempK": null,
        "diurnalSwingK": null,
        "themisBlocker": "Odyssey THEMIS calibrated IRPBT/IRBTR archives unavailable unauthenticated in runtime: static.mars.asu.edu -> curl_exit_28: curl: (28) Connection timed out after 6001 milliseconds; pds-imaging.jpl.nasa.gov -> HTTP/2 403   | server: awselb/2.0  | date: Sat, 14 Nov 2026 08:35:00 GMT  | content-type: text/html  | content-length: 118  |   | <html>  | <head><title>403 Forbidden</title></head>  | <body>  | <center><h1>403 Forbidden. ASU WMS thm_dayir_100m_v11 / thm_nightir_100m_v13 return VICAR FORMAT='BYTE' (uncalibrated 8-bit stretch, not Kelvin). THEMIS temperature fields kept strictly Pending (null).",
        "tesDataset": "MGS TES Thermal Inertia (TIMAP) & Lambert Albedo",
        "tesProductId": "MGS-M-TES-5-TIMAP-V1.0 (global_ti_night/day_2007.img) + TES_Lambert_Albedo_numeric",
        "tesResolution": "2.96 km/pix (20 ppd); 3x3 TI patch (~8.9 km) + 5x5 Albedo patch (~5.9 km)",
        "tesSource": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data) + ASU Mars WMS (http://ms-mars.mars.asu.edu/)",
        "tesExtractionMethod": "HTTP byte-range MSB_INTEGER int16 TIU extraction + VICAR REAL float32 Lambert albedo patch",
        "tesStatus": "Regenerated",
        "thermalInertiaTIU": 296.4,
        "tesNightTIU": 296.4,
        "tesNightTIUStd": 68.6,
        "tesNightValidPixels": 9,
        "tesDayTIU": 215.4,
        "tesDayTIUStd": 56.6,
        "tesDayValidPixels": 9,
        "albedo": 0.187,
        "albedoStd": 0.006,
        "albedoValidPixels": 25
      },
      {
        "id": "mars-olympus-rupes",
        "name": "Olympus Rupes & Tharsis Basalts",
        "lat": 18.65,
        "lon": 226.2,
        "themisDataset": "Odyssey THEMIS IRPBT / IRBTR",
        "themisStatus": "Pending",
        "themisDayTempK": null,
        "themisNightTempK": null,
        "meanTempK": null,
        "diurnalSwingK": null,
        "themisBlocker": "Odyssey THEMIS calibrated IRPBT/IRBTR archives unavailable unauthenticated in runtime: static.mars.asu.edu -> curl_exit_28: curl: (28) Connection timed out after 6001 milliseconds; pds-imaging.jpl.nasa.gov -> HTTP/2 403   | server: awselb/2.0  | date: Sat, 14 Nov 2026 08:35:00 GMT  | content-type: text/html  | content-length: 118  |   | <html>  | <head><title>403 Forbidden</title></head>  | <body>  | <center><h1>403 Forbidden. ASU WMS thm_dayir_100m_v11 / thm_nightir_100m_v13 return VICAR FORMAT='BYTE' (uncalibrated 8-bit stretch, not Kelvin). THEMIS temperature fields kept strictly Pending (null).",
        "tesDataset": "MGS TES Thermal Inertia (TIMAP) & Lambert Albedo",
        "tesProductId": "MGS-M-TES-5-TIMAP-V1.0 (global_ti_night/day_2007.img) + TES_Lambert_Albedo_numeric",
        "tesResolution": "2.96 km/pix (20 ppd); 3x3 TI patch (~8.9 km) + 5x5 Albedo patch (~5.9 km)",
        "tesSource": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data) + ASU Mars WMS (http://ms-mars.mars.asu.edu/)",
        "tesExtractionMethod": "HTTP byte-range MSB_INTEGER int16 TIU extraction + VICAR REAL float32 Lambert albedo patch",
        "tesStatus": "Regenerated",
        "thermalInertiaTIU": 112.1,
        "tesNightTIU": 112.1,
        "tesNightTIUStd": 0.3,
        "tesNightValidPixels": 9,
        "tesDayTIU": 217.4,
        "tesDayTIUStd": 85.5,
        "tesDayValidPixels": 9,
        "albedo": 0.2926,
        "albedoStd": 0.0019,
        "albedoValidPixels": 25
      },
      {
        "id": "mars-arcadia",
        "name": "Arcadia Planitia",
        "lat": 46.7,
        "lon": 188.0,
        "themisDataset": "Odyssey THEMIS IRPBT / IRBTR",
        "themisStatus": "Pending",
        "themisDayTempK": null,
        "themisNightTempK": null,
        "meanTempK": null,
        "diurnalSwingK": null,
        "themisBlocker": "Odyssey THEMIS calibrated IRPBT/IRBTR archives unavailable unauthenticated in runtime: static.mars.asu.edu -> curl_exit_28: curl: (28) Connection timed out after 6001 milliseconds; pds-imaging.jpl.nasa.gov -> HTTP/2 403   | server: awselb/2.0  | date: Sat, 14 Nov 2026 08:35:00 GMT  | content-type: text/html  | content-length: 118  |   | <html>  | <head><title>403 Forbidden</title></head>  | <body>  | <center><h1>403 Forbidden. ASU WMS thm_dayir_100m_v11 / thm_nightir_100m_v13 return VICAR FORMAT='BYTE' (uncalibrated 8-bit stretch, not Kelvin). THEMIS temperature fields kept strictly Pending (null).",
        "tesDataset": "MGS TES Thermal Inertia (TIMAP) & Lambert Albedo",
        "tesProductId": "MGS-M-TES-5-TIMAP-V1.0 (global_ti_night/day_2007.img) + TES_Lambert_Albedo_numeric",
        "tesResolution": "2.96 km/pix (20 ppd); 3x3 TI patch (~8.9 km) + 5x5 Albedo patch (~5.9 km)",
        "tesSource": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data) + ASU Mars WMS (http://ms-mars.mars.asu.edu/)",
        "tesExtractionMethod": "HTTP byte-range MSB_INTEGER int16 TIU extraction + VICAR REAL float32 Lambert albedo patch",
        "tesStatus": "Regenerated",
        "thermalInertiaTIU": 196.2,
        "tesNightTIU": 196.2,
        "tesNightTIUStd": 9.3,
        "tesNightValidPixels": 9,
        "tesDayTIU": 213.3,
        "tesDayTIUStd": 14.1,
        "tesDayValidPixels": 9,
        "albedo": 0.2431,
        "albedoStd": 0.0019,
        "albedoValidPixels": 25
      },
      {
        "id": "mars-valles",
        "name": "Valles Marineris (Coprates Chasma)",
        "lat": -13.8,
        "lon": 300.8,
        "themisDataset": "Odyssey THEMIS IRPBT / IRBTR",
        "themisStatus": "Pending",
        "themisDayTempK": null,
        "themisNightTempK": null,
        "meanTempK": null,
        "diurnalSwingK": null,
        "themisBlocker": "Odyssey THEMIS calibrated IRPBT/IRBTR archives unavailable unauthenticated in runtime: static.mars.asu.edu -> curl_exit_28: curl: (28) Connection timed out after 6001 milliseconds; pds-imaging.jpl.nasa.gov -> HTTP/2 403   | server: awselb/2.0  | date: Sat, 14 Nov 2026 08:35:00 GMT  | content-type: text/html  | content-length: 118  |   | <html>  | <head><title>403 Forbidden</title></head>  | <body>  | <center><h1>403 Forbidden. ASU WMS thm_dayir_100m_v11 / thm_nightir_100m_v13 return VICAR FORMAT='BYTE' (uncalibrated 8-bit stretch, not Kelvin). THEMIS temperature fields kept strictly Pending (null).",
        "tesDataset": "MGS TES Thermal Inertia (TIMAP) & Lambert Albedo",
        "tesProductId": "MGS-M-TES-5-TIMAP-V1.0 (global_ti_night/day_2007.img) + TES_Lambert_Albedo_numeric",
        "tesResolution": "2.96 km/pix (20 ppd); 3x3 TI patch (~8.9 km) + 5x5 Albedo patch (~5.9 km)",
        "tesSource": "NASA PDS Geosciences Node (https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data) + ASU Mars WMS (http://ms-mars.mars.asu.edu/)",
        "tesExtractionMethod": "HTTP byte-range MSB_INTEGER int16 TIU extraction + VICAR REAL float32 Lambert albedo patch",
        "tesStatus": "Regenerated",
        "thermalInertiaTIU": 555.8,
        "tesNightTIU": 555.8,
        "tesNightTIUStd": 39.9,
        "tesNightValidPixels": 9,
        "tesDayTIU": 358.6,
        "tesDayTIUStd": 38.7,
        "tesDayValidPixels": 9,
        "albedo": 0.1178,
        "albedoStd": 0.0,
        "albedoValidPixels": 25
      }
    ]
  }
};
