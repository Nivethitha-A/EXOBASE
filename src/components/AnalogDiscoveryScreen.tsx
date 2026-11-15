import { AlertTriangle, ArrowRight, Check, Loader2, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  CatalogMode,
  EarthAnalogSite,
  PlanetId,
  PlanetaryRegion,
} from '../shared/planetaryData';
import {
  DEFAULT_GROUP_WEIGHTS,
  normalizeGroupWeights,
  type GroupWeights,
  type MultimodalSupportInfo,
  type SimilarityAnalysisResponse,
} from '../shared/similarityEngine';
import { formatMetric, StatusText } from './StatusText';

interface AnalogDiscoveryScreenProps {
  catalogMode: CatalogMode;
  selectedPlanet: PlanetId;
  selectedRegionId: string;
  regions: PlanetaryRegion[];
  earthSites: EarthAnalogSite[];
  multimodalByPlanet: {
    moon: MultimodalSupportInfo;
    mars: MultimodalSupportInfo;
  };
  selectedCandidateIds: string[];
  weights: GroupWeights;
  analysis: SimilarityAnalysisResponse;
  isAnalyzing: boolean;
  analysisError: string | null;
  onChangePlanet: (planet: PlanetId) => void;
  onSelectRegion: (regionId: string) => void;
  onChangeCatalogMode: (mode: CatalogMode) => void;
  onToggleCandidate: (siteId: string) => void;
  onSelectAllCandidates: (siteIds: string[]) => void;
  onChangeWeights: (weights: GroupWeights) => void;
  onRunAnalysis: () => void;
  onViewRankings: () => void;
  onInspectCandidate: (candidateId: string) => void;
}

type BiomeFilter = 'all' | 'desert' | 'volcanic' | 'playa' | 'polar';

export function AnalogDiscoveryScreen({
  catalogMode,
  selectedPlanet,
  selectedRegionId,
  regions,
  earthSites,
  multimodalByPlanet,
  selectedCandidateIds,
  weights,
  analysis,
  isAnalyzing,
  analysisError,
  onChangePlanet,
  onSelectRegion,
  onChangeCatalogMode,
  onToggleCandidate,
  onSelectAllCandidates,
  onChangeWeights,
  onRunAnalysis,
  onViewRankings,
  onInspectCandidate,
}: AnalogDiscoveryScreenProps) {
  const [biomeFilter, setBiomeFilter] = useState<BiomeFilter>('all');

  const planetRegions = useMemo(
    () => regions.filter((r) => r.planet === selectedPlanet),
    [regions, selectedPlanet]
  );

  const activeRegion =
    planetRegions.find((r) => r.id === selectedRegionId) ?? planetRegions[0];

  const multimodalInfo = multimodalByPlanet[selectedPlanet];
  const isTerrainOnly = catalogMode === 'verified-terrain';

  const normalized = useMemo(
    () =>
      normalizeGroupWeights(
        weights,
        catalogMode,
        catalogMode === 'staged-hybrid' ? multimodalInfo.activeGroups : undefined
      ),
    [weights, catalogMode, multimodalInfo.activeGroups]
  );

  const filteredSites = useMemo(() => {
    return earthSites.filter((site) => {
      if (biomeFilter === 'all') return true;
      const b = site.biome.toLowerCase();
      if (biomeFilter === 'desert') return b.includes('desert') || b.includes('gossan');
      if (biomeFilter === 'volcanic') return b.includes('volcanic') || b.includes('basalt');
      if (biomeFilter === 'playa') return b.includes('playa') || b.includes('salt');
      if (biomeFilter === 'polar') return b.includes('polar') || b.includes('high-altitude');
      return true;
    });
  }, [earthSites, biomeFilter]);

  const handleWeightSlider = (key: keyof GroupWeights, rawPercent: number) => {
    onChangeWeights({
      ...weights,
      [key]: Math.max(0.05, rawPercent / 100),
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Analog Discovery Workflow
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure target planet, reference region, analysis mode, and candidate testbeds, then
            compute Weighted Euclidean rankings via <span className="font-mono">/api/analyze</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={isAnalyzing || selectedCandidateIds.length === 0}
          className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0 self-start lg:self-auto"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Computing Distances...</span>
            </>
          ) : (
            <>
              <span>Start Analog Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Step 1 & Step 2: Target Planet + Target Region */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5 lg:col-span-4 space-y-4">
          <div>
            <p className="font-mono text-[11px] text-cyan-400">Step 1 · Select Target Planet</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'mars', label: 'Mars (MOLA)', count: regions.filter((r) => r.planet === 'mars').length },
                  { id: 'moon', label: 'Moon (LOLA)', count: regions.filter((r) => r.planet === 'moon').length },
                ] as { id: PlanetId; label: string; count: number }[]
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChangePlanet(p.id)}
                  className={`rounded-md border p-3 text-left transition-colors cursor-pointer ${
                    selectedPlanet === p.id
                      ? p.id === 'mars'
                        ? 'border-amber-500/80 bg-amber-500/10'
                        : 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-800 bg-[#0F1420] hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-100">{p.label}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {p.count} regions ·{' '}
                    {multimodalByPlanet[p.id].available ? 'Multimodal ready' : 'Terrain-only'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <p className="font-mono text-[11px] text-cyan-400">Step 2 · Select Target Region</p>
            <div className="mt-2.5 space-y-2">
              {planetRegions.map((reg) => {
                const isSelected = reg.id === activeRegion?.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => onSelectRegion(reg.id)}
                    className={`w-full rounded-md border p-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-800 bg-[#0F1420] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-100">{reg.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {reg.coordinatesLabel}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-400 tabular-nums">
                      Elev {formatMetric(reg.features.elevationM, 0, 'm')} · Slope{' '}
                      {formatMetric(reg.features.slopeDeg, 2, '°')} · Relief{' '}
                      {formatMetric(reg.features.localReliefM, 0, 'm')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Analysis Mode & Weights + Candidate Earth Sites */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5 space-y-5">
            <div>
              <p className="font-mono text-[11px] text-cyan-400">
                Step 3 · Select Analysis Mode &amp; Feature Weights
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* Mode A: Terrain-Only */}
                <button
                  type="button"
                  onClick={() => onChangeCatalogMode('verified-terrain')}
                  className={`rounded-md border p-3.5 text-left transition-colors cursor-pointer ${
                    catalogMode === 'verified-terrain'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-800 bg-[#0F1420] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-100">
                      Mode A: Terrain-Only
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400">Default</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    100% terrain weight using Regenerated Stages 1–3 (4 active terrain features).
                  </p>
                </button>

                {/* Mode B: Multimodal */}
                <button
                  type="button"
                  disabled={!multimodalInfo.available}
                  onClick={() => onChangeCatalogMode('staged-hybrid')}
                  className={`rounded-md border p-3.5 text-left transition-colors ${
                    !multimodalInfo.available
                      ? 'border-slate-800/70 bg-[#0F1420]/40 opacity-60 cursor-not-allowed'
                      : catalogMode === 'staged-hybrid'
                      ? 'border-cyan-500 bg-cyan-500/10 cursor-pointer'
                      : 'border-slate-800 bg-[#0F1420] hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-100">
                      Mode B: Multimodal
                    </span>
                    <span
                      className={`font-mono text-[10px] ${
                        multimodalInfo.available ? 'text-cyan-400' : 'text-amber-400'
                      }`}
                    >
                      {multimodalInfo.available ? 'API Ready' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {multimodalInfo.available
                      ? `Suggested 45/35/20; backend activates ${multimodalInfo.activeFeatures.length} compatible Regenerated features (${multimodalInfo.activeGroups.join(' + ')}).`
                      : `Disabled for ${selectedPlanet.toUpperCase()} until compatible thermal/surface datasets are Regenerated.`}
                  </p>
                </button>

                {/* Isolated Demo */}
                <button
                  type="button"
                  onClick={() => onChangeCatalogMode('demo')}
                  className={`rounded-md border p-3.5 text-left transition-colors cursor-pointer ${
                    catalogMode === 'demo'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-800 bg-[#0F1420] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-100">Archived Demo</span>
                    <span className="font-mono text-[10px] text-slate-400">Isolated</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    Original 9-feature prototype estimates isolated from regenerated extracts.
                  </p>
                </button>
              </div>

              <p className="mt-3 rounded-md border border-slate-800 bg-[#0F1420] px-3.5 py-2.5 text-[11px] text-slate-300">
                {multimodalInfo.reason}
              </p>
            </div>

            {/* Weight Sliders */}
            <div className="border-t border-slate-800 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    Active Criterion Weights (Returned by API)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isTerrainOnly
                      ? 'Locked to 100% Terrain weight in Terrain-Only mode'
                      : 'Weights normalize proportionally across API-compatible Regenerated groups'}
                  </p>
                </div>
                {!isTerrainOnly && (
                  <button
                    type="button"
                    onClick={() => onChangeWeights({ ...DEFAULT_GROUP_WEIGHTS })}
                    className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-600 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset 45/35/20</span>
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Terrain</span>
                    <span className="font-mono text-cyan-400 tabular-nums">
                      {(normalized.terrain * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={85}
                    step={5}
                    disabled={isTerrainOnly}
                    value={isTerrainOnly ? 85 : Math.round(weights.terrain * 100)}
                    onChange={(e) => handleWeightSlider('terrain', Number(e.target.value))}
                    className="exo-slider mt-2 w-full disabled:opacity-40"
                  />
                </div>

                <div
                  className={
                    isTerrainOnly ||
                    (catalogMode === 'staged-hybrid' && !multimodalInfo.activeGroups.includes('thermal'))
                      ? 'opacity-45'
                      : ''
                  }
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Thermal</span>
                    <span className="font-mono text-blue-400 tabular-nums">
                      {(normalized.thermal * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={85}
                    step={5}
                    disabled={
                      isTerrainOnly ||
                      (catalogMode === 'staged-hybrid' && !multimodalInfo.activeGroups.includes('thermal'))
                    }
                    value={isTerrainOnly ? 5 : Math.round(weights.thermal * 100)}
                    onChange={(e) => handleWeightSlider('thermal', Number(e.target.value))}
                    className="exo-slider mt-2 w-full disabled:opacity-40"
                  />
                </div>

                <div
                  className={
                    isTerrainOnly ||
                    (catalogMode === 'staged-hybrid' && !multimodalInfo.activeGroups.includes('surface'))
                      ? 'opacity-45'
                      : ''
                  }
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Surface Props</span>
                    <span className="font-mono text-violet-400 tabular-nums">
                      {(normalized.surface * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={85}
                    step={5}
                    disabled={
                      isTerrainOnly ||
                      (catalogMode === 'staged-hybrid' && !multimodalInfo.activeGroups.includes('surface'))
                    }
                    value={isTerrainOnly ? 5 : Math.round(weights.surface * 100)}
                    onChange={(e) => handleWeightSlider('surface', Number(e.target.value))}
                    className="exo-slider mt-2 w-full disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Earth Sites */}
          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 rounded-md border border-slate-800 bg-[#07090E] p-1">
                {(
                  [
                    { id: 'all', label: 'All Sites' },
                    { id: 'desert', label: 'Deserts' },
                    { id: 'volcanic', label: 'Volcanic' },
                    { id: 'playa', label: 'Salt Playas' },
                    { id: 'polar', label: 'Polar' },
                  ] as { id: BiomeFilter; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBiomeFilter(tab.id)}
                    className={`rounded px-2.5 py-1 text-xs font-medium cursor-pointer whitespace-nowrap ${
                      biomeFilter === tab.id
                        ? 'bg-slate-800 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-slate-400 tabular-nums">
                  {selectedCandidateIds.length}/{earthSites.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => onSelectAllCandidates(earthSites.map((s) => s.id))}
                  className="rounded border border-slate-700 bg-[#0F1420] px-2.5 py-1 text-xs text-slate-200 hover:border-slate-600 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAllCandidates(filteredSites.map((s) => s.id))}
                  className="rounded border border-slate-700 bg-[#0F1420] px-2.5 py-1 text-xs text-slate-200 hover:border-slate-600 cursor-pointer"
                >
                  Select Filtered
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredSites.map((site) => {
                const checked = selectedCandidateIds.includes(site.id);
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => onToggleCandidate(site.id)}
                    className={`rounded-md border p-3.5 text-left transition-colors cursor-pointer ${
                      checked
                        ? 'border-cyan-500/70 bg-[#0F1724]'
                        : 'border-slate-800 bg-[#0F1420]/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{site.name}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          {site.country} · {site.biome}
                        </div>
                      </div>
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          checked
                            ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                            : 'border-slate-700 text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-4 gap-2 border-t border-slate-800/80 pt-2 font-mono text-[11px] text-slate-300 tabular-nums">
                      <span>Elev {formatMetric(site.features.elevationM, 0, 'm')}</span>
                      <span>Slope {formatMetric(site.features.slopeDeg, 2, '°')}</span>
                      <span>TRI {formatMetric(site.features.roughnessIndex, 3)}</span>
                      <span>T {formatMetric(site.features.meanTempK, 1, 'K')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Step 5: Live Backend Returned Results Preview */}
      <section className="rounded-lg border border-slate-800 bg-[#0B0E17] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] text-cyan-400">
              Step 5 · Backend Similarity Engine Output
            </p>
            <h2 className="mt-0.5 font-display text-lg font-semibold text-slate-100">
              {analysis.targetRegion.name} ({analysis.targetRegion.planet.toUpperCase()}) ·{' '}
              {analysis.results.length} Ranked Candidates
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onViewRankings}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-[#0F1420] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer"
            >
              <span>Open Full Rankings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2.5 rounded-md border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-xs text-cyan-200">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span>Querying /api/analyze and auditing cross-planetary distance invariants...</span>
          </div>
        )}

        {analysisError && (
          <div className="flex items-start gap-2.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{analysisError}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-4">Earth Analog</th>
                <th className="py-2 pr-4 text-right">Similarity</th>
                <th className="py-2 pr-4 text-right">Distance D</th>
                <th className="py-2 pr-4">Strongest Match</th>
                <th className="py-2 pr-4">Provenance</th>
                <th className="py-2 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {analysis.results.slice(0, 5).map((item) => (
                <tr key={item.candidate.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 pr-3 font-mono text-slate-400 tabular-nums">
                    #{String(item.rank).padStart(2, '0')}
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-slate-100">
                    {item.candidate.name}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono font-bold text-cyan-400 tabular-nums">
                    {item.similarityScore.toFixed(2)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-slate-300 tabular-nums">
                    {item.euclideanDistance.toFixed(4)}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-300">
                    {item.strongestMatchFeature?.label ?? 'N/A'}
                  </td>
                  <td className="py-2.5 pr-4 text-[11px]">
                    <StatusText status={item.candidate.terrainProvenance?.status ?? 'Pending'} />
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onInspectCandidate(item.candidate.id)}
                      className="text-xs font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
