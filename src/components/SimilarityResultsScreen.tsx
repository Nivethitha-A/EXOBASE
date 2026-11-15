import { ArrowRight, ChevronDown, ChevronUp, Download, Info, MapPin } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { exportRankingsCsv } from '../shared/csvExport';
import type { PlanetaryRegion } from '../shared/planetaryData';
import type { SimilarityAnalysisResponse } from '../shared/similarityEngine';
import { SimilarityBarChart } from './ScientificCharts';
import { StatusText } from './StatusText';

interface SimilarityResultsScreenProps {
  analysis: SimilarityAnalysisResponse;
  regions: PlanetaryRegion[];
  selectedCandidateId: string;
  onSelectRegion: (regionId: string) => void;
  onInspectCandidate: (candidateId: string) => void;
  onViewMap: () => void;
  onReconfigure: () => void;
}

type RankingSortKey = 'rank' | 'similarityScore' | 'euclideanDistance' | 'name' | 'elevationM';

export function SimilarityResultsScreen({
  analysis,
  regions,
  selectedCandidateId,
  onSelectRegion,
  onInspectCandidate,
  onViewMap,
  onReconfigure,
}: SimilarityResultsScreenProps) {
  const { targetRegion, normalizedWeights, results, mathAudit, catalogMode } = analysis;
  const topMatch = results[0];

  const [sortBy, setSortBy] = useState<RankingSortKey>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'rank') cmp = a.rank - b.rank;
      else if (sortBy === 'similarityScore') cmp = a.similarityScore - b.similarityScore;
      else if (sortBy === 'euclideanDistance') cmp = a.euclideanDistance - b.euclideanDistance;
      else if (sortBy === 'name') cmp = a.candidate.name.localeCompare(b.candidate.name);
      else if (sortBy === 'elevationM') {
        cmp = (a.candidate.features.elevationM ?? 0) - (b.candidate.features.elevationM ?? 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [results, sortBy, sortDir]);

  const toggleSort = (key: RankingSortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir(key === 'similarityScore' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header + Target Region Filter */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Similarity Rankings: {targetRegion.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Target: <span className="font-mono text-slate-200">{targetRegion.planet.toUpperCase()}</span>{' '}
            · Mode: <span className="font-mono text-slate-200">{catalogMode}</span> ·{' '}
            {mathAudit.activeFeatureCount} active features · Weights:{' '}
            <span className="font-mono text-slate-200 tabular-nums">
              {(normalizedWeights.terrain * 100).toFixed(1)}% Terrain /{' '}
              {(normalizedWeights.thermal * 100).toFixed(1)}% Thermal /{' '}
              {(normalizedWeights.surface * 100).toFixed(1)}% Surface
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="rankings-region-filter" className="text-xs text-slate-400 whitespace-nowrap">
              Target Region:
            </label>
            <select
              id="rankings-region-filter"
              value={targetRegion.id}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="rounded-md border border-slate-700 bg-[#0B0E17] px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.planet.toUpperCase()} — {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onReconfigure}
            className="rounded-md border border-slate-700 bg-[#0B0E17] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer whitespace-nowrap"
          >
            Adjust Mode / Weights
          </button>
          <button
            type="button"
            onClick={() => exportRankingsCsv(analysis)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-[#0B0E17] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onViewMap}
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer whitespace-nowrap"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Required Verbatim Scientific Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-5 py-3.5 text-xs text-slate-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p className="leading-relaxed">
          Similarity scores are relative algorithmic ranking indicators derived from the currently
          available feature set. They are not probabilities or independently validated scientific
          analog conclusions.
        </p>
      </div>

      {/* Math Invariant & Target Provenance Audit */}
      <div className="rounded-lg border border-slate-800 bg-[#0B0E17] px-5 py-3 text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span className="font-mono text-emerald-400">
              {mathAudit.isConsistent ? '● Math Invariant Consistent' : '✖ Inconsistency Detected'}
            </span>
            <span className="text-slate-600">·</span>
            <span>{mathAudit.normalizationScope}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 tabular-nums">
            D² ({mathAudit.totalDistanceSquared.toFixed(5)}) = Σ Group D² (
            {mathAudit.sumOfGroupDistancesSquared.toFixed(5)}) · Penalties ={' '}
            {mathAudit.sumOfFeaturePenaltiesPct.toFixed(1)}%
          </div>
        </div>
        <p className="border-t border-slate-800/70 pt-2 text-[11px] text-slate-400">
          {analysis.compatibilityNotice}
        </p>
      </div>

      {/* Top Candidate Highlight Cards */}
      {topMatch && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-cyan-500/40 bg-[#0B0E17] p-5">
            <p className="text-[11px] font-mono text-cyan-400">Top Candidate (#01)</p>
            <p className="mt-1.5 truncate font-display text-lg font-bold text-slate-50">
              {topMatch.candidate.name}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {topMatch.candidate.country} · {topMatch.candidate.coordinatesLabel}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
            <p className="text-[11px] font-mono text-slate-400">Relative Similarity Index</p>
            <div className="mt-1.5 flex items-baseline">
              <span className="font-mono text-3xl font-bold text-cyan-400 tabular-nums">
                {topMatch.similarityScore.toFixed(2)}
              </span>
              <span className="ml-1.5 font-mono text-xs text-slate-400">/ 100</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-slate-400 tabular-nums">
              Distance D = {topMatch.euclideanDistance.toFixed(4)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
            <p className="text-[11px] font-mono text-slate-400">Strongest Feature Match</p>
            <p className="mt-1.5 font-display text-base font-semibold text-slate-100">
              {topMatch.strongestMatchFeature?.label ?? 'N/A'}
            </p>
            {topMatch.strongestMatchFeature && (
              <p className="mt-1 font-mono text-xs text-emerald-400 tabular-nums">
                Δ {Math.abs(topMatch.strongestMatchFeature.rawDelta).toFixed(
                  topMatch.strongestMatchFeature.precision
                )}{' '}
                {topMatch.strongestMatchFeature.unit}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
            <p className="text-[11px] font-mono text-slate-400">Largest Divergence</p>
            <p className="mt-1.5 font-display text-base font-semibold text-slate-100">
              {topMatch.largestDivergenceFeature?.label ?? 'N/A'}
            </p>
            {topMatch.largestDivergenceFeature && (
              <p className="mt-1 font-mono text-xs text-amber-400 tabular-nums">
                {topMatch.largestDivergenceFeature.contributionSharePct.toFixed(1)}% of D² penalty
              </p>
            )}
          </div>
        </section>
      )}

      {/* Split: Horizontal Ranking Chart + Sortable Table with Expandable Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-lg border border-slate-800 bg-[#0B0E17] p-6 lg:col-span-5">
          <h2 className="font-display text-base font-semibold text-slate-100">
            Horizontal Similarity &amp; Penalty Chart
          </h2>
          <p className="mt-1 text-xs text-slate-400 mb-4">
            Hover bars for exact D² penalties; click any site to inspect full feature breakdown.
          </p>
          <SimilarityBarChart
            results={results}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={onInspectCandidate}
          />
        </section>

        <section className="rounded-lg border border-slate-800 bg-[#0B0E17] p-6 lg:col-span-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-100">
                Sortable Analog Ranking Table
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Click column headers to sort or expand a row to inspect active feature deltas.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-[11px] text-slate-400">
                  <th className="py-2.5 pr-3">
                    <button
                      type="button"
                      onClick={() => toggleSort('rank')}
                      className="hover:text-cyan-300 cursor-pointer"
                    >
                      Rank {sortBy === 'rank' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </th>
                  <th className="py-2.5 pr-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className="hover:text-cyan-300 cursor-pointer"
                    >
                      Earth Analog {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </th>
                  <th className="py-2.5 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('similarityScore')}
                      className="hover:text-cyan-300 cursor-pointer"
                    >
                      Score {sortBy === 'similarityScore' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </th>
                  <th className="py-2.5 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('euclideanDistance')}
                      className="hover:text-cyan-300 cursor-pointer"
                    >
                      Distance D{' '}
                      {sortBy === 'euclideanDistance' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </th>
                  <th className="py-2.5 pr-4">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {sortedResults.map((item) => {
                  const isExpanded = expandedId === item.candidate.id;
                  const cp = item.candidate.terrainProvenance;
                  return (
                    <Fragment key={item.candidate.id}>
                      <tr className="hover:bg-slate-900/50">
                        <td className="py-3 pr-3 font-mono font-semibold text-slate-400 tabular-nums align-top">
                          #{String(item.rank).padStart(2, '0')}
                        </td>
                        <td className="py-3 pr-4 align-top">
                          <div className="font-medium text-slate-100">{item.candidate.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {item.candidate.country} · {item.candidate.biome}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-sm font-bold text-cyan-400 tabular-nums align-top">
                          {item.similarityScore.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-slate-300 tabular-nums align-top">
                          {item.euclideanDistance.toFixed(4)}
                        </td>
                        <td className="py-3 pr-4 text-[11px] align-top">
                          <StatusText status={cp?.status ?? 'Pending'} />
                        </td>
                        <td className="py-3 text-right whitespace-nowrap align-top">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : item.candidate.id)
                              }
                              aria-label={`Toggle details for ${item.candidate.name}`}
                              className="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:border-slate-500 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                              <span>Delta</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onInspectCandidate(item.candidate.id)}
                              className="inline-flex items-center gap-1 rounded border border-cyan-500/40 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/10 cursor-pointer"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${item.candidate.id}-exp`} className="bg-[#0F1420]/80">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 font-mono text-[11px] tabular-nums">
                              {item.featureDetails.map((f) => (
                                <div key={f.key}>
                                  <span className="block text-[10px] text-slate-400">
                                    {f.shortLabel}
                                  </span>
                                  <span className="text-slate-100">
                                    {f.candidateRaw.toFixed(f.precision)} {f.unit}
                                  </span>
                                  <span className="block text-[10px] text-amber-300">
                                    {f.contributionSharePct.toFixed(1)}% pen
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
