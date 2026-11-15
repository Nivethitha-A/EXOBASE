import type { CatalogMode, FeatureDefinition, PlanetaryDatasetInfo, PlanetaryRegion, EarthAnalogSite } from '../shared/planetaryData';
import type { MultimodalSupportInfo } from '../shared/similarityEngine';

export type ScreenId =
  | 'overview'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'analogs'
  | 'rankings'
  | 'map'
  | 'analysis'
  | 'catalog';

export interface GeminiExplanation {
  executiveSummary: string;
  geologicalCorrespondence: string;
  roverMobilityInsight: string;
  thermalInstrumentInsight: string;
  geologicalSamplingInsight: string;
  scientificCaveats: string[];
}

export interface ExplainApiResponse {
  explanation: GeminiExplanation;
  model: string;
}

export interface DatasetsApiResponse {
  catalogMode: CatalogMode;
  datasets: PlanetaryDatasetInfo[];
  multimodalByPlanet: {
    moon: MultimodalSupportInfo;
    mars: MultimodalSupportInfo;
  };
  regions: PlanetaryRegion[];
  earthSites: EarthAnalogSite[];
  featureDefinitions: FeatureDefinition[];
}
