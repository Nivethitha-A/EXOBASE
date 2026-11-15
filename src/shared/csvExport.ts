import type { PlanetaryDatasetInfo, PlanetaryRegion, EarthAnalogSite } from './planetaryData';
import type { AnalogRankingResult, SimilarityAnalysisResponse } from './similarityEngine';

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerCsvDownload(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportRankingsCsv(analysis: SimilarityAnalysisResponse) {
  const { targetRegion, catalogMode, results } = analysis;
  const tp = targetRegion.terrainProvenance;

  const headers = [
    'Rank',
    'Catalog Mode',
    'Target Planet',
    'Target Region',
    'Target Dataset',
    'Target Product ID',
    'Target Resolution',
    'Target Status',
    'Earth Analog',
    'Country',
    'Biome',
    'Coordinates',
    'Earth Dataset',
    'Earth Product ID',
    'Earth Resolution',
    'Earth Status',
    'Relative Ranking Score (/100)',
    'Euclidean Distance (D)',
    'Distance Squared (D^2)',
    'Active Features Count',
    'Terrain Penalty (%)',
    'Thermal Penalty (%)',
    'Surface Penalty (%)',
    'Strongest Match Feature',
    'Largest Divergence Feature',
  ];

  const rows = results.map((r) => {
    const cp = r.candidate.terrainProvenance;
    return [
      r.rank,
      catalogMode,
      targetRegion.planet.toUpperCase(),
      targetRegion.name,
      tp?.dataset ?? targetRegion.datasetsUsed[0],
      tp?.productId ?? 'N/A',
      tp?.resolution ?? 'N/A',
      tp?.status ?? 'Pending',
      r.candidate.name,
      r.candidate.country,
      r.candidate.biome,
      r.candidate.coordinatesLabel,
      cp?.dataset ?? r.candidate.datasetsUsed[0],
      cp?.productId ?? 'N/A',
      cp?.resolution ?? 'N/A',
      cp?.status ?? 'Pending',
      r.similarityScore.toFixed(2),
      r.euclideanDistance.toFixed(4),
      (r.euclideanDistance ** 2).toFixed(6),
      analysis.mathAudit.activeFeatureCount,
      r.groupBreakdown.terrain.contributionSharePct.toFixed(1),
      r.groupBreakdown.thermal.contributionSharePct.toFixed(1),
      r.groupBreakdown.surface.contributionSharePct.toFixed(1),
      r.strongestMatchFeature?.label ?? 'N/A',
      r.largestDivergenceFeature?.label ?? 'N/A',
    ];
  });

  triggerCsvDownload(`exobase_${catalogMode}_${targetRegion.id}_rankings.csv`, headers, rows);
}

export function exportDetailedComparisonCsv(
  analysis: SimilarityAnalysisResponse,
  match: AnalogRankingResult
) {
  const { targetRegion, catalogMode, normalizedWeights } = analysis;
  const headers = [
    'Section',
    'Catalog Mode',
    'Target Planet',
    'Target Region',
    'Target Coordinates',
    'Earth Analog',
    'Earth Coordinates',
    'Rank',
    'Similarity Score (/100)',
    'Weighted Distance D',
    'Feature / Dataset',
    'Unit',
    'Status',
    'Target Value / Dataset',
    'Earth Value / Product ID',
    'Absolute Delta / Resolution',
    'Normalized Delta',
    'Weight w_i / Group Weight',
    'Penalty Share (%) / Note',
  ];

  const featureRows = match.featureDetails.map((f) => [
    'Active Feature',
    catalogMode,
    targetRegion.planet.toUpperCase(),
    targetRegion.name,
    targetRegion.coordinatesLabel,
    match.candidate.name,
    match.candidate.coordinatesLabel,
    match.rank,
    match.similarityScore.toFixed(2),
    match.euclideanDistance.toFixed(4),
    f.label,
    f.unit,
    f.status,
    f.targetRaw.toFixed(f.precision),
    f.candidateRaw.toFixed(f.precision),
    f.rawDelta.toFixed(f.precision),
    f.normDiff.toFixed(4),
    f.featureWeight.toFixed(4),
    f.contributionSharePct.toFixed(2),
  ]);

  const excludedRows = analysis.excludedFeatures.map((ex) => [
    'Excluded Feature',
    catalogMode,
    targetRegion.planet.toUpperCase(),
    targetRegion.name,
    targetRegion.coordinatesLabel,
    match.candidate.name,
    match.candidate.coordinatesLabel,
    match.rank,
    match.similarityScore.toFixed(2),
    match.euclideanDistance.toFixed(4),
    ex.label,
    '-',
    `Target: ${ex.targetStatus} / Earth: ${ex.earthStatus}`,
    'Excluded',
    'Excluded',
    '-',
    '-',
    (normalizedWeights[ex.group] ?? 0).toFixed(4),
    ex.reason,
  ]);

  const targetProvRows = (targetRegion.provenance ?? []).map((p) => [
    'Target Provenance',
    catalogMode,
    targetRegion.planet.toUpperCase(),
    targetRegion.name,
    targetRegion.coordinatesLabel,
    match.candidate.name,
    match.candidate.coordinatesLabel,
    match.rank,
    match.similarityScore.toFixed(2),
    match.euclideanDistance.toFixed(4),
    p.feature,
    '-',
    p.status,
    p.dataset,
    p.productId,
    p.resolution,
    p.value,
    p.source,
    p.note ?? '',
  ]);

  const earthProvRows = (match.candidate.provenance ?? []).map((p) => [
    'Earth Provenance',
    catalogMode,
    targetRegion.planet.toUpperCase(),
    targetRegion.name,
    targetRegion.coordinatesLabel,
    match.candidate.name,
    match.candidate.coordinatesLabel,
    match.rank,
    match.similarityScore.toFixed(2),
    match.euclideanDistance.toFixed(4),
    p.feature,
    '-',
    p.status,
    p.dataset,
    p.productId,
    p.resolution,
    p.value,
    p.source,
    p.note ?? '',
  ]);

  triggerCsvDownload(
    `exobase_detailed_${targetRegion.id}_vs_${match.candidate.id}.csv`,
    headers,
    [...featureRows, ...excludedRows, ...targetProvRows, ...earthProvRows]
  );
}

export function exportDatasetCatalogCsv(
  datasets: PlanetaryDatasetInfo[],
  regions: PlanetaryRegion[],
  earthSites: EarthAnalogSite[]
) {
  const headers = [
    'Record Type',
    'Stage / Body',
    'Name / Dataset',
    'Product ID',
    'Resolution',
    'Status',
    'Source',
    'Features / Summary',
    'Notes',
  ];

  const datasetRows = datasets.map((d) => [
    'Dataset Stage',
    `${d.stage} (${d.planet})`,
    d.dataset,
    d.productId,
    d.spatialResolution,
    d.statusSummary,
    d.sourceLabel,
    d.availableFeatures.join('; '),
    d.calibrationNote,
  ]);

  const regionRows = regions.flatMap((r) =>
    (r.provenance ?? []).map((p) => [
      `${r.planet.toUpperCase()} Region Provenance`,
      r.name,
      p.feature,
      p.productId,
      p.resolution,
      p.status,
      p.source,
      p.value,
      p.note ?? '',
    ])
  );

  const earthRows = earthSites.flatMap((s) =>
    (s.provenance ?? []).map((p) => [
      'Earth Site Provenance',
      s.name,
      p.feature,
      p.productId,
      p.resolution,
      p.status,
      p.source,
      p.value,
      p.note ?? '',
    ])
  );

  triggerCsvDownload(
    'exobase_dataset_provenance_catalog.csv',
    headers,
    [...datasetRows, ...regionRows, ...earthRows]
  );
}
