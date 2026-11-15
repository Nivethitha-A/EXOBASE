import { DEMO_EARTH_SITES, DEMO_PLANETARY_REGIONS } from './demoCatalog.ts';
import {
  VERIFIED_TERRAIN_EXTRACTS,
  type VerifiedTerrainExtract,
} from './verifiedTerrainData.ts';

export type PlanetId = 'mars' | 'moon';

export type CatalogMode = 'verified-terrain' | 'staged-hybrid' | 'demo';

export type ProvenanceStatus = 'Regenerated' | 'Pending' | 'Demo Estimate';

export type FeatureKey =
  | 'elevationM'
  | 'slopeDeg'
  | 'roughnessIndex'
  | 'localReliefM'
  | 'meanTempK'
  | 'diurnalSwingK'
  | 'thermalInertiaTIU'
  | 'emissivityTIR'
  | 'albedo';

export type FeatureGroupId = 'terrain' | 'thermal' | 'surface';

export interface FeatureVector {
  elevationM: number;
  slopeDeg: number;
  roughnessIndex: number;
  localReliefM: number;
  meanTempK: number;
  diurnalSwingK: number;
  thermalInertiaTIU: number;
  emissivityTIR: number;
  albedo: number;
}

export interface FeatureDefinition {
  key: FeatureKey;
  label: string;
  shortLabel: string;
  unit: string;
  group: FeatureGroupId;
  minBound: number;
  maxBound: number;
  precision: number;
  earthSource: string;
  marsSource: string;
  moonSource: string;
}

export interface FeatureProvenanceRecord {
  dataset: string;
  productId: string;
  region: string;
  feature: string;
  value: string;
  resolution: string;
  source: string;
  status: ProvenanceStatus;
}

export interface PlanetaryDatasetInfo {
  id: string;
  stage: string;
  planet: 'Earth' | 'Moon' | 'Mars';
  dataset: string;
  instrument: string;
  purpose: string;
  spatialResolution: string;
  wavelengthOrBand: string;
  calibrationNote: string;
  status: ProvenanceStatus;
}

export interface TerrainProvenanceSummary {
  dataset: string;
  productId: string;
  resolution: string;
  source: string;
  status: ProvenanceStatus;
}

export interface PlanetaryRegion {
  id: string;
  planet: PlanetId;
  name: string;
  subtitle: string;
  coordinatesLabel: string;
  lat: number;
  lon: number;
  geologicalClass: string;
  description: string;
  missionRelevance: string;
  datasetsUsed: string[];
  features: FeatureVector;
  terrainProvenance?: TerrainProvenanceSummary;
  provenance?: FeatureProvenanceRecord[];
}

export interface EarthAnalogSite {
  id: string;
  name: string;
  country: string;
  biome: string;
  coordinatesLabel: string;
  lat: number;
  lon: number;
  geologicalSummary: string;
  primaryTestApplications: string[];
  datasetsUsed: string[];
  features: FeatureVector;
  terrainProvenance?: TerrainProvenanceSummary;
  provenance?: FeatureProvenanceRecord[];
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    key: 'elevationM',
    label: 'Mean Elevation',
    shortLabel: 'Elevation',
    unit: 'm',
    group: 'terrain',
    minBound: -6000,
    maxBound: 21500,
    precision: 1,
    earthSource: 'Copernicus DEM GLO-90 (Open-Meteo API)',
    marsSource: 'MGS MOLA MEGDR (meg064)',
    moonSource: 'LRO LOLA GDRDEM (LDEM_75S_240M / LDEM_64)',
  },
  {
    key: 'slopeDeg',
    label: 'Mean Terrain Slope',
    shortLabel: 'Slope',
    unit: 'deg',
    group: 'terrain',
    minBound: 0,
    maxBound: 35,
    precision: 2,
    earthSource: 'Copernicus DEM GLO-90 (Open-Meteo API)',
    marsSource: 'MGS MOLA MEGDR (meg064)',
    moonSource: 'LRO LOLA GDRDEM (LDEM_75S_240M / LDEM_64)',
  },
  {
    key: 'roughnessIndex',
    label: 'Terrain Roughness Index (TRI / 1,100 m)',
    shortLabel: 'Roughness',
    unit: 'TRI',
    group: 'terrain',
    minBound: 0,
    maxBound: 1.0,
    precision: 3,
    earthSource: 'Copernicus DEM GLO-90 (Open-Meteo API)',
    marsSource: 'MGS MOLA MEGDR (meg064)',
    moonSource: 'LRO LOLA GDRDEM (LDEM_75S_240M / LDEM_64)',
  },
  {
    key: 'localReliefM',
    label: 'Local Relief (5x5 patch range)',
    shortLabel: 'Relief',
    unit: 'm',
    group: 'terrain',
    minBound: 0,
    maxBound: 3800,
    precision: 1,
    earthSource: 'Copernicus DEM GLO-90 (Open-Meteo API)',
    marsSource: 'MGS MOLA MEGDR (meg064)',
    moonSource: 'LRO LOLA GDRDEM (LDEM_75S_240M / LDEM_64)',
  },
  {
    key: 'meanTempK',
    label: 'Mean Surface Temperature',
    shortLabel: 'Mean Temp',
    unit: 'K',
    group: 'thermal',
    minBound: 100,
    maxBound: 320,
    precision: 1,
    earthSource: 'MODIS MOD11A2 (Stage 4 Pending)',
    marsSource: 'Odyssey THEMIS (Stage 6 Pending)',
    moonSource: 'LRO Diviner (Stage 6 Pending)',
  },
  {
    key: 'diurnalSwingK',
    label: 'Diurnal Thermal Amplitude',
    shortLabel: 'Diurnal ΔT',
    unit: 'K',
    group: 'thermal',
    minBound: 5,
    maxBound: 280,
    precision: 1,
    earthSource: 'MODIS MOD11A2 (Stage 4 Pending)',
    marsSource: 'Odyssey THEMIS (Stage 6 Pending)',
    moonSource: 'LRO Diviner (Stage 6 Pending)',
  },
  {
    key: 'thermalInertiaTIU',
    label: 'Thermal Inertia',
    shortLabel: 'Inertia',
    unit: 'TIU',
    group: 'thermal',
    minBound: 40,
    maxBound: 1200,
    precision: 0,
    earthSource: 'MODIS / ASTER (Stages 4–5 Pending)',
    marsSource: 'Odyssey THEMIS (Stage 6 Pending)',
    moonSource: 'LRO Diviner (Stage 6 Pending)',
  },
  {
    key: 'emissivityTIR',
    label: 'TIR Surface Emissivity',
    shortLabel: 'Emissivity',
    unit: 'ε',
    group: 'surface',
    minBound: 0.88,
    maxBound: 0.99,
    precision: 3,
    earthSource: 'ASTER GED v3 (Stage 5 Pending)',
    marsSource: 'Odyssey THEMIS (Stage 6 Pending)',
    moonSource: 'LRO Diviner (Stage 6 Pending)',
  },
  {
    key: 'albedo',
    label: 'Bolometric Surface Albedo',
    shortLabel: 'Albedo',
    unit: 'α',
    group: 'surface',
    minBound: 0.06,
    maxBound: 0.55,
    precision: 2,
    earthSource: 'MODIS / ASTER (Stages 4–5 Pending)',
    marsSource: 'TES / THEMIS (Stage 6 Pending)',
    moonSource: 'LRO Diviner (Stage 6 Pending)',
  },
];

export const PRIMARY_DATASETS: PlanetaryDatasetInfo[] = [
  {
    id: 'earth-copernicus-openmeteo',
    stage: 'Stage 1',
    planet: 'Earth',
    dataset: 'Earth terrain — 10 regions (Copernicus GLO-90)',
    instrument: 'Copernicus GLO-90 DEM via Open-Meteo Elevation API v1',
    purpose: 'Equal-area 950 m × 950 m metric stencil elevation, slope, TRI, and relief across 10 testbeds',
    spatialResolution: '90 m native; 950 m stencil',
    wavelengthOrBand: 'X-band InSAR (Global)',
    calibrationNote:
      'Reproducibly regenerated via Open-Meteo Elevation API (COP-DEM_GLO-90). 7 sites lie within SRTM 60°N–56°S; 3 lie in polar zones (>60°N / <56°S).',
    status: 'Regenerated',
  },
  {
    id: 'moon-lola',
    stage: 'Stage 2',
    planet: 'Moon',
    dataset: 'Moon LOLA — 4 regions',
    instrument: 'LOLA Polar Stereographic (LDEM_75S_240M) & 64 ppd Cylindrical (LDEM_64)',
    purpose: 'Lunar topography, slope, roughness, and crater relief (~950 m harmonized stencil)',
    spatialResolution: '240 m polar / 473.8 m global (~950 m stencil)',
    wavelengthOrBand: '1,064 nm Nd:YAG Laser',
    calibrationNote:
      'Reproducibly regenerated from NASA PDS LRO-L-LOLA-4-GDR-V1.0 (lro-l-lola-3-rdr-v1/.../lola_gdr). Shackleton (-89.54°S) uses South Polar Stereographic projection.',
    status: 'Regenerated',
  },
  {
    id: 'mars-mola',
    stage: 'Stage 3',
    planet: 'Mars',
    dataset: 'Mars MOLA — 5 regions',
    instrument: 'Mars Orbiter Laser Altimeter (meg064 64 ppd tiles)',
    purpose: 'Martian topography, slope, roughness, and local relief (~926 m stencil)',
    spatialResolution: '926.1 m/pix (64 pix/deg)',
    wavelengthOrBand: '1,064 nm Laser Altimetry',
    calibrationNote:
      'Reproducibly regenerated from NASA PDS MGS-M-MOLA-5-MEGDR-L3-V1.0 (meg064 MSB_INTEGER tiles) relative to areoid.',
    status: 'Regenerated',
  },
  {
    id: 'earth-modis',
    stage: 'Stage 4',
    planet: 'Earth',
    dataset: 'Earth MODIS thermal',
    instrument: 'Terra / Aqua MODIS MOD11A2',
    purpose: 'Land surface temperature and diurnal thermal amplitude across 10 Earth sites',
    spatialResolution: '1,000 m',
    wavelengthOrBand: '10.78–12.27 µm TIR',
    calibrationNote: 'Excluded from primary terrain-only mode until Stage 4 MODIS composites are processed and validated.',
    status: 'Pending',
  },
  {
    id: 'earth-aster',
    stage: 'Stage 5',
    planet: 'Earth',
    dataset: 'Earth ASTER emissivity',
    instrument: 'Terra ASTER GED v3',
    purpose: 'Broadband TIR surface emissivity across 10 Earth analog testbeds',
    spatialResolution: '100 m',
    wavelengthOrBand: '8.125–11.65 µm (Bands 10–14)',
    calibrationNote: 'Excluded from primary terrain-only mode until Stage 5 ASTER GED extracts are processed and validated.',
    status: 'Pending',
  },
  {
    id: 'moon-diviner-mars-themis',
    stage: 'Stage 6',
    planet: 'Mars',
    dataset: 'Moon Diviner & Mars THEMIS',
    instrument: 'LRO Diviner Lunar Radiometer & Odyssey THEMIS',
    purpose: 'Planetary surface temperature, diurnal swing, thermal inertia, and TIR emissivity',
    spatialResolution: '250 m (Diviner) / 100 m (THEMIS)',
    wavelengthOrBand: '0.3–400 µm / 6.78–14.88 µm',
    calibrationNote: 'Excluded from primary terrain-only mode until Stage 6 planetary thermal datasets are processed and validated.',
    status: 'Pending',
  },
];

function buildTerrainProvenance(
  extract: VerifiedTerrainExtract,
  regionName: string
): FeatureProvenanceRecord[] {
  const sourceDetail = extract.coverage_note
    ? `${extract.source} · ${extract.coverage_note}`
    : extract.source;
  return [
    {
      dataset: extract.dataset,
      productId: extract.product_id,
      region: regionName,
      feature: 'Mean Elevation',
      value: `${extract.elevationM.toFixed(1)} m`,
      resolution: extract.resolution,
      source: sourceDetail,
      status: 'Regenerated',
    },
    {
      dataset: extract.dataset,
      productId: extract.product_id,
      region: regionName,
      feature: 'Mean Terrain Slope',
      value: `${extract.slopeDeg.toFixed(2)} deg`,
      resolution: extract.resolution,
      source: sourceDetail,
      status: 'Regenerated',
    },
    {
      dataset: extract.dataset,
      productId: extract.product_id,
      region: regionName,
      feature: 'Terrain Roughness (TRI / 1,100 m)',
      value: `${extract.roughnessMeters.toFixed(1)} m (norm ${extract.roughnessIndex.toFixed(3)})`,
      resolution: extract.resolution,
      source: sourceDetail,
      status: 'Regenerated',
    },
    {
      dataset: extract.dataset,
      productId: extract.product_id,
      region: regionName,
      feature: 'Local Relief (5x5 patch)',
      value: `${extract.localReliefM.toFixed(1)} m`,
      resolution: extract.resolution,
      source: sourceDetail,
      status: 'Regenerated',
    },
  ];
}

function buildPendingThermalProvenance(
  body: 'earth' | 'mars' | 'moon',
  regionName: string,
  features: FeatureVector
): FeatureProvenanceRecord[] {
  const datasetThermal =
    body === 'earth'
      ? 'MODIS MOD11A2'
      : body === 'moon'
      ? 'LRO Diviner GDR'
      : 'Odyssey THEMIS';
  const datasetSurface =
    body === 'earth'
      ? 'ASTER GED v3'
      : body === 'moon'
      ? 'LRO Diviner GDR'
      : 'Odyssey THEMIS / TES';
  const sourceThermal =
    body === 'earth'
      ? 'NASA LP DAAC (Stage 4 Pending)'
      : 'NASA PDS (Stage 6 Pending)';
  const sourceSurface =
    body === 'earth'
      ? 'NASA LP DAAC (Stage 5 Pending)'
      : 'NASA PDS / ASU (Stage 6 Pending)';
  const resThermal = body === 'earth' ? '1,000 m' : body === 'moon' ? '250 m' : '100 m';

  return [
    {
      dataset: datasetThermal,
      productId: 'Pending Stage Ingestion',
      region: regionName,
      feature: 'Mean Surface Temperature',
      value: `${features.meanTempK.toFixed(1)} K (excluded)`,
      resolution: resThermal,
      source: sourceThermal,
      status: 'Pending',
    },
    {
      dataset: datasetThermal,
      productId: 'Pending Stage Ingestion',
      region: regionName,
      feature: 'Diurnal Thermal Amplitude',
      value: `${features.diurnalSwingK.toFixed(1)} K (excluded)`,
      resolution: resThermal,
      source: sourceThermal,
      status: 'Pending',
    },
    {
      dataset: datasetThermal,
      productId: 'Pending Stage Ingestion',
      region: regionName,
      feature: 'Thermal Inertia',
      value: `${features.thermalInertiaTIU.toFixed(0)} TIU (excluded)`,
      resolution: resThermal,
      source: sourceThermal,
      status: 'Pending',
    },
    {
      dataset: datasetSurface,
      productId: 'Pending Stage Ingestion',
      region: regionName,
      feature: 'TIR Surface Emissivity',
      value: `${features.emissivityTIR.toFixed(3)} ε (excluded)`,
      resolution: body === 'earth' ? '100 m' : resThermal,
      source: sourceSurface,
      status: 'Pending',
    },
    {
      dataset: datasetSurface,
      productId: 'Pending Stage Ingestion',
      region: regionName,
      feature: 'Bolometric Surface Albedo',
      value: `${features.albedo.toFixed(2)} α (excluded)`,
      resolution: resThermal,
      source: sourceSurface,
      status: 'Pending',
    },
  ];
}

function buildDemoProvenance(regionName: string, features: FeatureVector): FeatureProvenanceRecord[] {
  return FEATURE_DEFINITIONS.map((def) => ({
    dataset: 'Archived Demo Catalog',
    productId: 'DEMO-STATIC-V1',
    region: regionName,
    feature: def.label,
    value: `${features[def.key].toFixed(def.precision)} ${def.unit}`,
    resolution: 'Conceptual Regional Estimate',
    source: 'Initial Prototype Estimate',
    status: 'Demo Estimate',
  }));
}

const verifiedExtractMap = new Map<string, VerifiedTerrainExtract>(
  [
    ...VERIFIED_TERRAIN_EXTRACTS.earth,
    ...VERIFIED_TERRAIN_EXTRACTS.moon,
    ...VERIFIED_TERRAIN_EXTRACTS.mars,
  ].map((item) => [item.id, item])
);

export const VERIFIED_PLANETARY_REGIONS: PlanetaryRegion[] = DEMO_PLANETARY_REGIONS.map((base) => {
  const extract = verifiedExtractMap.get(base.id);
  if (!extract) return base;
  const mergedFeatures: FeatureVector = {
    ...base.features,
    elevationM: extract.elevationM,
    slopeDeg: extract.slopeDeg,
    roughnessIndex: extract.roughnessIndex,
    localReliefM: extract.localReliefM,
  };
  const thermalLabel =
    base.planet === 'moon' ? 'LRO Diviner (Stage 6 Pending)' : 'THEMIS (Stage 6 Pending)';
  return {
    ...base,
    datasetsUsed: [extract.dataset, thermalLabel],
    features: mergedFeatures,
    terrainProvenance: {
      dataset: extract.dataset,
      productId: extract.product_id,
      resolution: extract.resolution,
      source: extract.source,
      status: 'Regenerated',
    },
    provenance: [
      ...buildTerrainProvenance(extract, base.name),
      ...buildPendingThermalProvenance(base.planet, base.name, mergedFeatures),
    ],
  };
});

export const VERIFIED_EARTH_SITES: EarthAnalogSite[] = DEMO_EARTH_SITES.map((base) => {
  const extract = verifiedExtractMap.get(base.id);
  if (!extract) return base;
  const mergedFeatures: FeatureVector = {
    ...base.features,
    elevationM: extract.elevationM,
    slopeDeg: extract.slopeDeg,
    roughnessIndex: extract.roughnessIndex,
    localReliefM: extract.localReliefM,
  };
  return {
    ...base,
    datasetsUsed: [extract.dataset, 'MODIS (Stage 4) / ASTER (Stage 5) Pending'],
    features: mergedFeatures,
    terrainProvenance: {
      dataset: extract.dataset,
      productId: extract.product_id,
      resolution: extract.resolution,
      source: extract.source,
      status: 'Regenerated',
    },
    provenance: [
      ...buildTerrainProvenance(extract, base.name),
      ...buildPendingThermalProvenance('earth', base.name, mergedFeatures),
    ],
  };
});

export const PLANETARY_REGIONS = VERIFIED_PLANETARY_REGIONS;
export const EARTH_ANALOG_SITES = VERIFIED_EARTH_SITES;

export function getCatalogByMode(mode: CatalogMode): {
  regions: PlanetaryRegion[];
  earthSites: EarthAnalogSite[];
} {
  if (mode === 'demo') {
    return {
      regions: DEMO_PLANETARY_REGIONS.map((r) => ({
        ...r,
        terrainProvenance: {
          dataset: 'Archived Demo Catalog',
          productId: 'DEMO-STATIC-V1',
          resolution: 'Conceptual Regional Estimate',
          source: 'Initial Prototype Estimate',
          status: 'Demo Estimate',
        },
        provenance: buildDemoProvenance(r.name, r.features),
      })),
      earthSites: DEMO_EARTH_SITES.map((s) => ({
        ...s,
        terrainProvenance: {
          dataset: 'Archived Demo Catalog',
          productId: 'DEMO-STATIC-V1',
          resolution: 'Conceptual Regional Estimate',
          source: 'Initial Prototype Estimate',
          status: 'Demo Estimate',
        },
        provenance: buildDemoProvenance(s.name, s.features),
      })),
    };
  }
  return {
    regions: VERIFIED_PLANETARY_REGIONS,
    earthSites: VERIFIED_EARTH_SITES,
  };
}
