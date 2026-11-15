import {
  FEATURE_DEFINITIONS,
  getCatalogByMode,
  type CatalogMode,
  type EarthAnalogSite,
  type FeatureGroupId,
  type FeatureKey,
  type PlanetaryRegion,
  type ProvenanceStatus,
} from './planetaryData.ts';

export interface GroupWeights {
  terrain: number; // Default 0.45 in multi-criteria, 1.0 in verified-terrain
  thermal: number; // Default 0.35
  surface: number; // Default 0.20
}

export const DEFAULT_GROUP_WEIGHTS: GroupWeights = {
  terrain: 0.45,
  thermal: 0.35,
  surface: 0.2,
};

export const VERIFIED_TERRAIN_WEIGHTS: GroupWeights = {
  terrain: 1.0,
  thermal: 0.0,
  surface: 0.0,
};

export interface FeatureComparisonDetail {
  key: FeatureKey;
  label: string;
  shortLabel: string;
  unit: string;
  group: FeatureGroupId;
  precision: number;
  status: ProvenanceStatus;
  targetRaw: number;
  candidateRaw: number;
  rawDelta: number;
  targetNorm: number;
  candidateNorm: number;
  normDiff: number;
  featureWeight: number;
  weightedSquaredDiff: number;
  contributionSharePct: number;
}

export interface GroupDistanceSummary {
  group: FeatureGroupId;
  label: string;
  weight: number;
  weightedSquaredSum: number;
  groupDistance: number;
  contributionSharePct: number;
}

export interface AnalogRankingResult {
  rank: number;
  candidate: EarthAnalogSite;
  euclideanDistance: number;
  similarityScore: number;
  groupBreakdown: Record<FeatureGroupId, GroupDistanceSummary>;
  featureDetails: FeatureComparisonDetail[];
  strongestMatchFeature: FeatureComparisonDetail;
  largestDivergenceFeature: FeatureComparisonDetail;
}

export interface MathConsistencyAudit {
  normalizationScope: string;
  activeFeatureCount: number;
  totalDistanceSquared: number;
  sumOfGroupDistancesSquared: number;
  sumOfFeaturePenaltiesPct: number;
  sumOfGroupPenaltiesPct: number;
  isConsistent: boolean;
}

export interface SimilarityAnalysisResponse {
  catalogMode: CatalogMode;
  targetRegion: PlanetaryRegion;
  normalizedWeights: GroupWeights;
  results: AnalogRankingResult[];
  computedAtIso: string;
  mathAudit: MathConsistencyAudit;
  formula: {
    distanceEquation: string;
    similarityEquation: string;
    normalizationMethod: string;
  };
}

export function normalizeGroupWeights(
  raw?: Partial<GroupWeights>,
  catalogMode: CatalogMode = 'verified-terrain'
): GroupWeights {
  if (catalogMode === 'verified-terrain') {
    return { terrain: 1.0, thermal: 0.0, surface: 0.0 };
  }
  const t = Math.max(0, Number(raw?.terrain ?? DEFAULT_GROUP_WEIGHTS.terrain));
  const th = Math.max(0, Number(raw?.thermal ?? DEFAULT_GROUP_WEIGHTS.thermal));
  const s = Math.max(0, Number(raw?.surface ?? DEFAULT_GROUP_WEIGHTS.surface));
  const sum = t + th + s;
  if (sum <= 0) {
    return { ...DEFAULT_GROUP_WEIGHTS };
  }
  return {
    terrain: t / sum,
    thermal: th / sum,
    surface: s / sum,
  };
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function normalizeFeatureValue(value: number, minBound: number, maxBound: number): number {
  if (maxBound <= minBound) return 0;
  return clamp01((value - minBound) / (maxBound - minBound));
}

export function computeSimilarityAnalysis(
  regionId: string,
  candidateIds?: string[],
  rawWeights?: Partial<GroupWeights>,
  catalogMode: CatalogMode = 'verified-terrain'
): SimilarityAnalysisResponse {
  const { regions, earthSites } = getCatalogByMode(catalogMode);

  const targetRegion = regions.find((r) => r.id === regionId) ?? regions[0];
  const normalizedWeights = normalizeGroupWeights(rawWeights, catalogMode);

  const candidates =
    candidateIds && candidateIds.length > 0
      ? earthSites.filter((site) => candidateIds.includes(site.id))
      : earthSites;

  const activeCandidates = candidates.length > 0 ? candidates : earthSites;

  const activeFeatureDefs =
    catalogMode === 'verified-terrain'
      ? FEATURE_DEFINITIONS.filter((f) => f.group === 'terrain')
      : FEATURE_DEFINITIONS;

  const groupFeatureCounts: Record<FeatureGroupId, number> = {
    terrain: activeFeatureDefs.filter((f) => f.group === 'terrain').length || 1,
    thermal: activeFeatureDefs.filter((f) => f.group === 'thermal').length || 1,
    surface: activeFeatureDefs.filter((f) => f.group === 'surface').length || 1,
  };

  const unsortedResults: Omit<AnalogRankingResult, 'rank'>[] = activeCandidates.map((candidate) => {
    let totalWeightedSquaredDiff = 0;

    const groupSums: Record<FeatureGroupId, number> = {
      terrain: 0,
      thermal: 0,
      surface: 0,
    };

    const rawDetails = activeFeatureDefs.map((def) => {
      const targetRaw = targetRegion.features[def.key];
      const candidateRaw = candidate.features[def.key];
      const targetNorm = normalizeFeatureValue(targetRaw, def.minBound, def.maxBound);
      const candidateNorm = normalizeFeatureValue(candidateRaw, def.minBound, def.maxBound);
      const normDiff = candidateNorm - targetNorm;

      const groupWeight = normalizedWeights[def.group];
      const featureWeight = groupWeight / groupFeatureCounts[def.group];
      const weightedSquaredDiff = featureWeight * (normDiff * normDiff);

      totalWeightedSquaredDiff += weightedSquaredDiff;
      groupSums[def.group] += weightedSquaredDiff;

      const status: ProvenanceStatus =
        catalogMode === 'demo'
          ? 'Demo Estimate'
          : def.group === 'terrain'
          ? 'Regenerated'
          : 'Pending';

      return {
        key: def.key,
        label: def.label,
        shortLabel: def.shortLabel,
        unit: def.unit,
        group: def.group,
        precision: def.precision,
        status,
        targetRaw,
        candidateRaw,
        rawDelta: candidateRaw - targetRaw,
        targetNorm,
        candidateNorm,
        normDiff,
        featureWeight,
        weightedSquaredDiff,
        contributionSharePct: 0,
      };
    });

    const euclideanDistance = Math.sqrt(totalWeightedSquaredDiff);
    const similarityScore = 100 / (1 + euclideanDistance);

    const featureDetails: FeatureComparisonDetail[] = rawDetails.map((d) => ({
      ...d,
      contributionSharePct:
        totalWeightedSquaredDiff > 0
          ? (d.weightedSquaredDiff / totalWeightedSquaredDiff) * 100
          : 0,
    }));

    const sortedByAbsNormDiff = [...featureDetails].sort(
      (a, b) => Math.abs(a.normDiff) - Math.abs(b.normDiff)
    );
    const strongestMatchFeature = sortedByAbsNormDiff[0];
    const largestDivergenceFeature = sortedByAbsNormDiff[sortedByAbsNormDiff.length - 1];

    const groupBreakdown: Record<FeatureGroupId, GroupDistanceSummary> = {
      terrain: {
        group: 'terrain',
        label: 'Terrain',
        weight: normalizedWeights.terrain,
        weightedSquaredSum: groupSums.terrain,
        groupDistance: Math.sqrt(groupSums.terrain),
        contributionSharePct:
          totalWeightedSquaredDiff > 0
            ? (groupSums.terrain / totalWeightedSquaredDiff) * 100
            : 0,
      },
      thermal: {
        group: 'thermal',
        label: 'Thermal',
        weight: normalizedWeights.thermal,
        weightedSquaredSum: groupSums.thermal,
        groupDistance: Math.sqrt(groupSums.thermal),
        contributionSharePct:
          totalWeightedSquaredDiff > 0
            ? (groupSums.thermal / totalWeightedSquaredDiff) * 100
            : 0,
      },
      surface: {
        group: 'surface',
        label: 'Surface Properties',
        weight: normalizedWeights.surface,
        weightedSquaredSum: groupSums.surface,
        groupDistance: Math.sqrt(groupSums.surface),
        contributionSharePct:
          totalWeightedSquaredDiff > 0
            ? (groupSums.surface / totalWeightedSquaredDiff) * 100
            : 0,
      },
    };

    return {
      candidate,
      euclideanDistance,
      similarityScore,
      groupBreakdown,
      featureDetails,
      strongestMatchFeature,
      largestDivergenceFeature,
    };
  });

  unsortedResults.sort((a, b) => b.similarityScore - a.similarityScore);

  const results: AnalogRankingResult[] = unsortedResults.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  const sample = results[0];
  const totalDistanceSquared = sample ? sample.euclideanDistance ** 2 : 0;
  const sumOfGroupDistancesSquared = sample
    ? sample.groupBreakdown.terrain.weightedSquaredSum +
      sample.groupBreakdown.thermal.weightedSquaredSum +
      sample.groupBreakdown.surface.weightedSquaredSum
    : 0;
  const sumOfFeaturePenaltiesPct = sample
    ? sample.featureDetails.reduce((acc, f) => acc + f.contributionSharePct, 0)
    : 0;
  const sumOfGroupPenaltiesPct = sample
    ? sample.groupBreakdown.terrain.contributionSharePct +
      sample.groupBreakdown.thermal.contributionSharePct +
      sample.groupBreakdown.surface.contributionSharePct
    : 0;

  const isConsistent =
    !sample ||
    (Math.abs(totalDistanceSquared - sumOfGroupDistancesSquared) < 1e-9 &&
      (totalDistanceSquared === 0 ||
        (Math.abs(sumOfFeaturePenaltiesPct - 100) < 1e-4 &&
          Math.abs(sumOfGroupPenaltiesPct - 100) < 1e-4)));

  return {
    catalogMode,
    targetRegion,
    normalizedWeights,
    results,
    computedAtIso: new Date().toISOString(),
    mathAudit: {
      normalizationScope:
        'Global Cross-Planetary Physical Bounds (shared across Earth, Moon, and Mars)',
      activeFeatureCount: activeFeatureDefs.length,
      totalDistanceSquared,
      sumOfGroupDistancesSquared,
      sumOfFeaturePenaltiesPct,
      sumOfGroupPenaltiesPct,
      isConsistent,
    },
    formula: {
      distanceEquation: 'D = sqrt( sum_i( w_i * (x_i - y_i)^2 ) )',
      similarityEquation: 'Similarity = 100 / (1 + D)',
      normalizationMethod:
        'Global cross-planetary physical min-max scaling [0, 1] (never independent per-planet scaling)',
    },
  };
}
