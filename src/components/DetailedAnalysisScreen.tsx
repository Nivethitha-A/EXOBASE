import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FeatureProvenanceRecord } from '../shared/planetaryData';
import type { SimilarityAnalysisResponse } from '../shared/similarityEngine';
import type { ExplainApiResponse, GeminiExplanation } from '../types/app';
import { OrbitalImage } from './OrbitalImage';
import { RadarCalibrationChart } from './RadarCalibrationChart';

interface DetailedAnalysisScreenProps {
  analysis: SimilarityAnalysisResponse;
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
}

function ProvenanceTable({
  title,
  records,
}: {
  title: string;
  records: FeatureProvenanceRecord[];
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
      <h3 className="font-display text-sm font-semibold text-slate-100">{title}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-slate-800 font-mono uppercase tracking-wider text-slate-500">
              <th className="py-2 pr-3 font-medium">Feature</th>
              <th className="py-2 pr-3 font-medium">Dataset</th>
              <th className="py-2 pr-3 font-medium">Product ID</th>
              <th className="py-2 pr-3 font-medium">Value</th>
              <th className="py-2 pr-3 font-medium">Resolution</th>
              <th className="py-2 pr-3 font-medium">Source</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {records.map((row) => (
              <tr key={`${row.region}-${row.feature}`} className="hover:bg-slate-900/40">
                <td className="py-2 pr-3 font-sans text-slate-200 whitespace-nowrap">
                  {row.feature}
                </td>
                <td className="py-2 pr-3 text-cyan-300 whitespace-nowrap">{row.dataset}</td>
                <td className="py-2 pr-3 text-slate-400 whitespace-nowrap">{row.productId}</td>
                <td className="py-2 pr-3 text-slate-100 whitespace-nowrap">{row.value}</td>
                <td className="py-2 pr-3 text-slate-400 whitespace-nowrap">{row.resolution}</td>
                <td className="py-2 pr-3 font-sans text-slate-400 whitespace-nowrap">
                  {row.source}
                </td>
                <td className="py-2 whitespace-nowrap">
                  <span
                    className={
                      row.status === 'Regenerated'
                        ? 'text-emerald-400'
                        : row.status === 'Pending'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }
                  >
                    {row.status === 'Regenerated'
                      ? '● Regenerated'
                      : row.status === 'Pending'
                      ? '▲ Pending'
                      : '○ Demo Estimate'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DetailedAnalysisScreen({
  analysis,
  selectedCandidateId,
  onSelectCandidate,
}: DetailedAnalysisScreenProps) {
  const activeMatch =
    analysis.results.find((r) => r.candidate.id === selectedCandidateId) ?? analysis.results[0];

  const [explanation, setExplanation] = useState<GeminiExplanation | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchExplanation = async (regionId: string, candidateId: string) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingAi(true);
    setAiError(null);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          regionId,
          candidateId,
          weights: analysis.normalizedWeights,
          catalogMode: analysis.catalogMode,
        }),
      });
      const rawText = await response.text();
      const data = (rawText ? JSON.parse(rawText) : {}) as ExplainApiResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate mission insights.');
      }
      setExplanation(data.explanation);
      setModelUsed(data.model);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setExplanation(null);
      setAiError(
        err instanceof Error ? err.message : 'Failed to load AI mission suitability analysis.'
      );
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoadingAi(false);
      }
    }
  };

  useEffect(() => {
    if (!activeMatch) return;
    fetchExplanation(analysis.targetRegion.id, activeMatch.candidate.id);
    return () => {
      abortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    analysis.catalogMode,
    analysis.targetRegion.id,
    activeMatch?.candidate.id,
    analysis.normalizedWeights.terrain,
    analysis.normalizedWeights.thermal,
    analysis.normalizedWeights.surface,
  ]);

  if (!activeMatch) {
    return null;
  }

  const { targetRegion, mathAudit } = analysis;
  const { candidate } = activeMatch;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Candidate Switcher */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Step 05 · Side-by-Side Feature Telemetry, Provenance &amp; AI Mission Briefing
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            {candidate.name} vs. {targetRegion.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Mode: <span className="font-mono text-slate-200">{analysis.catalogMode}</span> · Rank #
            {activeMatch.rank} of {analysis.results.length} evaluated Earth analogs ·{' '}
            <span className="font-mono text-slate-300">
              {candidate.coordinatesLabel} ↔ {targetRegion.coordinatesLabel}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <label
            htmlFor="candidate-selector"
            className="text-xs font-mono uppercase text-slate-400 whitespace-nowrap"
          >
            Compare Site:
          </label>
          <select
            id="candidate-selector"
            value={candidate.id}
            onChange={(e) => onSelectCandidate(e.target.value)}
            className="rounded-md border border-slate-700 bg-[#0B0E17] px-3 py-2 text-xs font-medium text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            {analysis.results.map((r) => (
              <option key={r.candidate.id} value={r.candidate.id}>
                #{r.rank} {r.candidate.name} ({r.similarityScore.toFixed(1)}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dual Imagery Strip + 4 Quantitative Cards */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-800 bg-slate-800 lg:col-span-6">
          <OrbitalImage
            kind={targetRegion.planet === 'mars' ? 'mars' : 'moon'}
            alt={`${targetRegion.name} reference imagery`}
            caption={`TARGET · ${targetRegion.name.toUpperCase()}`}
            className="h-44 sm:h-48"
          />
          <OrbitalImage
            kind="earth"
            alt={`${candidate.name} analog imagery`}
            caption={`ANALOG · ${candidate.name.split(' (')[0].toUpperCase()}`}
            className="h-44 sm:h-48"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-6">
          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Relative Ranking Index
            </p>
            <div className="mt-2 flex items-baseline">
              <span className="font-mono text-3xl font-bold text-cyan-400">
                {activeMatch.similarityScore.toFixed(2)}
              </span>
              <span className="ml-1.5 font-mono text-xs text-slate-400">/ 100</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              D = <span className="font-mono">{activeMatch.euclideanDistance.toFixed(4)}</span> · Relative
              indicator, not probability
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Group Penalty Split
            </p>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Terrain</span>
                <span className="text-slate-100">
                  {activeMatch.groupBreakdown.terrain.contributionSharePct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thermal</span>
                <span className="text-slate-100">
                  {activeMatch.groupBreakdown.thermal.contributionSharePct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Surface</span>
                <span className="text-slate-100">
                  {activeMatch.groupBreakdown.surface.contributionSharePct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Strongest Match
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-slate-100">
              {activeMatch.strongestMatchFeature.label}
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-400">
              Penalty: {activeMatch.strongestMatchFeature.contributionSharePct.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Largest Divergence
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-slate-100">
              {activeMatch.largestDivergenceFeature.label}
            </p>
            <p className="mt-1 font-mono text-xs text-amber-400">
              Penalty: {activeMatch.largestDivergenceFeature.contributionSharePct.toFixed(1)}%
            </p>
          </div>
        </div>
      </section>

      {/* Main Split: Radar Chart + Gemini AI Explanation */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="rounded-lg border border-slate-800 bg-[#0B0E17] p-6 lg:col-span-5">
          <h2 className="font-display text-base font-semibold text-slate-100">
            Normalized {activeMatch.featureDetails.length}-Axis Parameter Profile
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Global cross-planetary physical scaling [0, 1] comparing {targetRegion.name} and{' '}
            {candidate.name}.
          </p>

          <div className="mt-4">
            <RadarCalibrationChart
              features={activeMatch.featureDetails}
              planet={targetRegion.planet}
              targetName={targetRegion.name}
              candidateName={candidate.name.split(' (')[0]}
            />
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-lg border border-slate-800 bg-[#0B0E17] p-6 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-100">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Mission Suitability &amp; Geological Explanation</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  AI interpretation grounded strictly in the computed Euclidean feature deltas
                  {modelUsed ? ` · ${modelUsed}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchExplanation(targetRegion.id, candidate.id)}
                disabled={isLoadingAi}
                className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-[#0F1420] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                <span>{isLoadingAi ? 'Analyzing...' : 'Refresh Analysis'}</span>
              </button>
            </div>

            {isLoadingAi && (
              <div className="mt-6 space-y-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />
                <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
                  <div className="h-24 animate-pulse rounded bg-slate-800/70" />
                  <div className="h-24 animate-pulse rounded bg-slate-800/70" />
                  <div className="h-24 animate-pulse rounded bg-slate-800/70" />
                </div>
              </div>
            )}

            {!isLoadingAi && aiError && (
              <div className="mt-6 rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-medium">Gemini explanation unavailable</p>
                    <p className="mt-1 text-xs text-amber-200/80">{aiError}</p>
                    <p className="mt-2 text-xs text-slate-300">
                      All numerical similarity scores, feature contributions, and provenance records
                      below remain 100% deterministically computed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isLoadingAi && explanation && (
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                    Executive Ranking Rationale
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                    {explanation.executiveSummary}
                  </p>
                </div>

                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                    Geological &amp; Surface Process Correspondence
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    {explanation.geologicalCorrespondence}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-slate-800 pt-4 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-800 bg-[#0F1420] p-4">
                    <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                      Rover Mobility
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {explanation.roverMobilityInsight}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-[#0F1420] p-4">
                    <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                      Thermal &amp; TIR Ops
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {explanation.thermalInstrumentInsight}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-[#0F1420] p-4">
                    <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                      Sampling &amp; Drill
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {explanation.geologicalSamplingInsight}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                    Scientific Caveats &amp; Non-Transferable Factors
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                    {explanation.scientificCaveats.map((caveat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                        <span>{caveat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Full Feature-Wise Comparison Table */}
      <section className="mt-8 rounded-lg border border-slate-800 bg-[#0B0E17] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-100">
              Feature-by-Feature Numerical Audit
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {mathAudit.normalizationScope} · Active feature penalties sum to 100.0%
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400">
            D² = {(activeMatch.euclideanDistance ** 2).toFixed(5)} · Consistent:{' '}
            <span className="text-emerald-400">{mathAudit.isConsistent ? 'Yes' : 'No'}</span>
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Feature</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
                <th className="py-2.5 pr-4 text-right font-medium">
                  {targetRegion.planet.toUpperCase()} Raw
                </th>
                <th className="py-2.5 pr-4 text-right font-medium">Earth Raw</th>
                <th className="py-2.5 pr-4 text-right font-medium">Physical Δ</th>
                <th className="py-2.5 pr-4 text-right font-medium">Norm Δ</th>
                <th className="py-2.5 pr-4 text-right font-medium">Weight w_i</th>
                <th className="py-2.5 text-right font-medium">Penalty Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {activeMatch.featureDetails.map((f) => (
                <tr key={f.key} className="hover:bg-slate-900/50">
                  <td className="py-3 pr-4 font-sans font-medium text-slate-100 whitespace-nowrap">
                    {f.label}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span
                      className={
                        f.status === 'Regenerated'
                          ? 'text-emerald-400'
                          : f.status === 'Pending'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }
                    >
                      {f.status === 'Regenerated'
                        ? '● Regenerated'
                        : f.status === 'Pending'
                        ? '▲ Pending'
                        : '○ Demo Estimate'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-200 whitespace-nowrap">
                    {f.targetRaw.toFixed(f.precision)}{' '}
                    <span className="text-[10px] text-slate-500">{f.unit}</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-cyan-300 whitespace-nowrap">
                    {f.candidateRaw.toFixed(f.precision)}{' '}
                    <span className="text-[10px] text-slate-500">{f.unit}</span>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-300 whitespace-nowrap">
                    {f.rawDelta >= 0 ? '+' : ''}
                    {f.rawDelta.toFixed(f.precision)}
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-400 whitespace-nowrap">
                    {f.normDiff >= 0 ? '+' : ''}
                    {f.normDiff.toFixed(3)}
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-400 whitespace-nowrap">
                    {f.featureWeight.toFixed(3)}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <span
                      className={
                        f.contributionSharePct > 30
                          ? 'font-semibold text-amber-400'
                          : 'text-slate-200'
                      }
                    >
                      {f.contributionSharePct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Side-by-Side Data Provenance Sections */}
      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ProvenanceTable
          title={`Planetary Reference Provenance · ${targetRegion.name}`}
          records={targetRegion.provenance ?? []}
        />
        <ProvenanceTable
          title={`Earth Candidate Provenance · ${candidate.name}`}
          records={candidate.provenance ?? []}
        />
      </section>
    </div>
  );
}
