import { useState } from 'react';
import type { PlanetaryDatasetInfo, PlanetaryRegion, EarthAnalogSite } from '../shared/planetaryData';
import type { AnalogRankingResult, FeatureComparisonDetail } from '../shared/similarityEngine';

/* 1. Horizontal Similarity Ranking Chart with stacked penalty segments & tooltips */
export function SimilarityBarChart({
  results,
  selectedCandidateId,
  onSelectCandidate,
}: {
  results: AnalogRankingResult[];
  selectedCandidateId?: string;
  onSelectCandidate: (candidateId: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = results.find((r) => r.candidate.id === hoveredId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-cyan-400" />
            Terrain Penalty
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-blue-500" />
            Thermal Penalty
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-violet-400" />
            Surface Penalty
          </span>
        </div>
        <span>Score S = 100 / (1 + D)</span>
      </div>

      <div className="space-y-2.5">
        {results.map((item) => {
          const isSelected = item.candidate.id === selectedCandidateId;
          const terrainPct = item.groupBreakdown.terrain.contributionSharePct;
          const thermalPct = item.groupBreakdown.thermal.contributionSharePct;
          const surfacePct = item.groupBreakdown.surface.contributionSharePct;
          const barWidth = Math.min(100, Math.max(4, item.similarityScore));

          return (
            <button
              key={item.candidate.id}
              type="button"
              onMouseEnter={() => setHoveredId(item.candidate.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectCandidate(item.candidate.id)}
              className={`block w-full rounded-md border p-3 text-left transition-colors duration-150 cursor-pointer ${
                isSelected
                  ? 'border-cyan-500/70 bg-cyan-500/10'
                  : 'border-slate-800/90 bg-[#0F1420]/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    #{String(item.rank).padStart(2, '0')}
                  </span>
                  <span className="truncate text-sm font-medium text-slate-100">
                    {item.candidate.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 shrink-0 font-mono tabular-nums">
                  <span className="text-[11px] text-slate-400">
                    D={item.euclideanDistance.toFixed(4)}
                  </span>
                  <span className="text-sm font-bold text-cyan-400">
                    {item.similarityScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Score bar + proportional penalty composition */}
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-xs bg-slate-800">
                <div
                  className="flex h-full overflow-hidden transition-all duration-200"
                  style={{ width: `${barWidth}%` }}
                >
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${terrainPct}%` }}
                  />
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${thermalPct}%` }}
                  />
                  <div
                    className="h-full bg-violet-400"
                    style={{ width: `${surfacePct}%` }}
                  />
                </div>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-400 tabular-nums">
                <span>
                  {item.candidate.country} · Closest: {item.strongestMatchFeature?.shortLabel ?? 'N/A'}
                </span>
                <span>
                  Terrain {terrainPct.toFixed(0)}% · Thermal {thermalPct.toFixed(0)}% · Surface{' '}
                  {surfacePct.toFixed(0)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {hovered && (
        <div className="rounded-md border border-slate-800 bg-[#07090E] px-3.5 py-2.5 font-mono text-[11px] text-slate-300 tabular-nums">
          <span className="text-cyan-300 font-semibold">{hovered.candidate.name}</span> · Score{' '}
          {hovered.similarityScore.toFixed(2)} / 100 · D²={(hovered.euclideanDistance ** 2).toFixed(5)} ·
          Largest divergence: {hovered.largestDivergenceFeature?.label} (
          {hovered.largestDivergenceFeature?.contributionSharePct.toFixed(1)}%)
        </div>
      )}
    </div>
  );
}

/* 2. Grouped Bar Chart comparing Normalized [0, 1] Terrain & Active Features */
export function TerrainComparisonChart({
  features,
  targetName,
  candidateName,
  planet,
}: {
  features: FeatureComparisonDetail[];
  targetName: string;
  candidateName: string;
  planet: 'mars' | 'moon';
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const hovered = features.find((f) => f.key === hoveredKey) ?? null;

  const targetColor = planet === 'mars' ? '#F59E0B' : '#CBD5E1';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-slate-300">
            <span
              className="inline-block h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: targetColor }}
            />
            <span className="truncate max-w-[180px]">{targetName}</span>
          </span>
          <span className="flex items-center gap-2 text-slate-300">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-cyan-400" />
            <span className="truncate max-w-[180px]">{candidateName}</span>
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Normalized [0.00 – 1.00] Physical Scale
        </span>
      </div>

      <div className="space-y-3">
        {features.map((f) => {
          const isHovered = hoveredKey === f.key;
          return (
            <div
              key={f.key}
              onMouseEnter={() => setHoveredKey(f.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={`rounded-md border p-3 transition-colors ${
                isHovered
                  ? 'border-slate-700 bg-[#0F1420]'
                  : 'border-slate-800/80 bg-[#0B0E17]'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                <span className="font-medium text-slate-200">
                  {f.label}{' '}
                  <span className="font-mono text-[11px] text-slate-400">({f.unit})</span>
                </span>
                <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                  {planet.toUpperCase()}: {f.targetRaw.toFixed(f.precision)} · Earth:{' '}
                  <span className="text-cyan-300">{f.candidateRaw.toFixed(f.precision)}</span>
                </span>
              </div>

              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-14 font-mono text-[10px] text-slate-400 shrink-0">
                    {planet.toUpperCase()}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-xs bg-slate-800">
                    <div
                      className="h-full transition-all duration-200"
                      style={{
                        width: `${Math.max(2, f.targetNorm * 100)}%`,
                        backgroundColor: targetColor,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[10px] text-slate-400 tabular-nums">
                    {f.targetNorm.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-14 font-mono text-[10px] text-cyan-400 shrink-0">
                    EARTH
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-xs bg-slate-800">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-200"
                      style={{ width: `${Math.max(2, f.candidateNorm * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[10px] text-cyan-300 tabular-nums">
                    {f.candidateNorm.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hovered && (
        <div className="rounded-md border border-slate-800 bg-[#07090E] px-3.5 py-2.5 font-mono text-[11px] text-slate-300 tabular-nums">
          {hovered.label}: Δ={hovered.rawDelta >= 0 ? '+' : ''}
          {hovered.rawDelta.toFixed(hovered.precision)} {hovered.unit} · Norm Δ=
          {hovered.normDiff >= 0 ? '+' : ''}
          {hovered.normDiff.toFixed(3)} · Penalty share: {hovered.contributionSharePct.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/* 3. Feature Contribution Share Chart */
export function FeatureContributionChart({
  features,
}: {
  features: FeatureComparisonDetail[];
}) {
  const sorted = [...features].sort((a, b) => b.contributionSharePct - a.contributionSharePct);
  const maxPct = Math.max(10, ...sorted.map((f) => f.contributionSharePct));

  return (
    <div className="space-y-3">
      {sorted.map((f) => {
        const barColor =
          f.group === 'terrain'
            ? 'bg-cyan-400'
            : f.group === 'thermal'
            ? 'bg-blue-500'
            : 'bg-violet-400';
        return (
          <div key={f.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-slate-200 truncate">{f.label}</span>
              <span className="font-mono text-slate-300 tabular-nums shrink-0">
                {f.contributionSharePct.toFixed(1)}%{' '}
                <span className="text-[10px] text-slate-500">
                  (w={f.featureWeight.toFixed(3)})
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-xs bg-slate-800">
              <div
                className={`h-full ${barColor} transition-all duration-200`}
                style={{ width: `${(f.contributionSharePct / maxPct) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-1 font-mono text-[11px] text-slate-500">
        Sum of active feature penalties equals 100.0% of total D².
      </p>
    </div>
  );
}

/* 4. Dataset Stage Progress Visualization */
export function DatasetStageProgressChart({
  datasets,
}: {
  datasets: PlanetaryDatasetInfo[];
}) {
  const regeneratedCount = datasets.filter((d) => d.status === 'Regenerated').length;
  const totalCount = datasets.length || 1;
  const pct = Math.round((regeneratedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs text-slate-300">
          Pipeline Stage Readiness ({regeneratedCount} of {totalCount} primary stages fully
          Regenerated; Stage 6A Moon Diviner &amp; Stage 6B Mars MGS TES also Regenerated)
        </span>
        <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
          {pct}% Stages Complete
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {datasets.map((ds) => {
          const isRegen = ds.status === 'Regenerated';
          const hasPartialSub = Boolean(
            ds.subStages?.some((s) => s.status === 'Regenerated') && !isRegen
          );
          return (
            <div
              key={ds.id}
              className="rounded-md border border-slate-800 bg-[#0F1420] p-3"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">{ds.stage}</span>
                <span
                  className={
                    isRegen
                      ? 'text-emerald-400'
                      : hasPartialSub
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  }
                >
                  {isRegen ? '● Ready' : hasPartialSub ? '◐ Mixed' : '▲ Pending'}
                </span>
              </div>
              <p className="mt-1.5 text-xs font-medium text-slate-100 truncate">
                {ds.planet}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 truncate" title={ds.dataset}>
                {ds.dataset}
              </p>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-xs bg-slate-800">
                <div
                  className={`h-full ${
                    isRegen
                      ? 'bg-emerald-400 w-full'
                      : hasPartialSub
                      ? 'bg-cyan-400 w-2/3'
                      : 'bg-amber-400/50 w-1/5'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 5. Real Thermal Comparison Chart (renders only real Regenerated thermal datasets) */
export function ThermalComparisonChart({
  targetRegion,
  earthCandidate,
}: {
  targetRegion: PlanetaryRegion;
  earthCandidate: EarthAnalogSite;
}) {
  const modis = earthCandidate.modisExtract;
  const diviner = targetRegion.moonThermalExtract;
  const marsThermal = targetRegion.marsThermalExtract;

  if (targetRegion.planet === 'moon' && diviner?.status === 'Regenerated' && modis?.status === 'Regenerated') {
    const maxK = 410;
    const rows = [
      {
        label: 'Day Mean Temp (K)',
        targetVal: diviner.dayMeanTempK,
        earthVal: modis.meanDayLstK ?? 0,
      },
      {
        label: 'Mean Temp (K)',
        targetVal: diviner.meanTempK,
        earthVal: modis.meanTempK ?? 0,
      },
      {
        label: 'Night Mean Temp (K)',
        targetVal: diviner.nightMeanTempK,
        earthVal: modis.meanNightLstK ?? 0,
      },
      {
        label: 'Diurnal Amplitude ΔT (K)',
        targetVal: diviner.diurnalSwingK,
        earthVal: modis.diurnalSwingK ?? 0,
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="inline-block h-2.5 w-2.5 rounded-xs bg-slate-300" />
              <span>Moon Diviner ({targetRegion.name})</span>
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <span className="inline-block h-2.5 w-2.5 rounded-xs bg-cyan-400" />
              <span>Earth MODIS ({earthCandidate.name.split(' (')[0]})</span>
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400">
            ● Stages 4 &amp; 6A Regenerated (Kelvin)
          </span>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-md border border-slate-800/80 bg-[#0F1420]/60 p-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-slate-200">{row.label}</span>
                <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                  Moon: {row.targetVal.toFixed(2)} K · Earth:{' '}
                  <span className="text-cyan-300">{row.earthVal.toFixed(2)} K</span>
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-2 w-full overflow-hidden rounded-xs bg-slate-800">
                  <div
                    className="h-full bg-slate-300"
                    style={{ width: `${Math.min(100, Math.max(2, (row.targetVal / maxK) * 100))}%` }}
                  />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-xs bg-slate-800">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${Math.min(100, Math.max(2, (row.earthVal / maxK) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] leading-relaxed text-slate-400">
          Methodological window note: Earth MODIS MOD11A2.061 reflects 44 8-day Terra composites
          from 2023; Moon LRO Diviner GCP reflects cumulative 2009–2015 local-time bins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modis?.status === 'Regenerated' && (
        <div className="rounded-md border border-slate-800 bg-[#0F1420]/60 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-200">
              Earth MODIS MOD11A2.061 ({earthCandidate.name})
            </span>
            <span className="font-mono text-[11px] text-emerald-400">● Regenerated</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-xs tabular-nums">
            <div>
              <span className="block text-[10px] text-slate-500">Day Mean</span>
              <span className="text-slate-100">{modis.meanDayLstK?.toFixed(2)} K</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Night Mean</span>
              <span className="text-slate-100">{modis.meanNightLstK?.toFixed(2)} K</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Diurnal ΔT</span>
              <span className="text-cyan-300">{modis.diurnalSwingK?.toFixed(2)} K</span>
            </div>
          </div>
        </div>
      )}

      {marsThermal?.tesStatus === 'Regenerated' && (
        <div className="rounded-md border border-slate-800 bg-[#0F1420]/60 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-200">
              Mars MGS TES Thermal Inertia &amp; Albedo ({targetRegion.name})
            </span>
            <span className="font-mono text-[11px] text-emerald-400">● Regenerated</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-xs tabular-nums">
            <div>
              <span className="block text-[10px] text-slate-500">Night TI</span>
              <span className="text-amber-300">{marsThermal.tesNightTIU?.toFixed(1)} TIU</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Day TI</span>
              <span className="text-slate-100">{marsThermal.tesDayTIU?.toFixed(1)} TIU</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Lambert Albedo</span>
              <span className="text-slate-100">{marsThermal.albedo?.toFixed(4)} α</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-slate-300">
        <p className="font-mono text-[11px] text-amber-400">
          ▲ Mars Odyssey THEMIS IRPBT/IRBTR Surface Temperature Pending
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Cross-body Mars-vs-Earth surface temperature comparison is withheld because calibrated
          Odyssey THEMIS IRPBT Kelvin archives are blocked in the current extraction runtime (and
          8-bit WMS stretches are excluded).
        </p>
      </div>
    </div>
  );
}

/* 6. Emissivity Band Chart (ASTER GED v3 Bands 10-14 — renders bands if available, honest Pending otherwise) */
export function EmissivityBandChart({
  earthCandidate,
}: {
  earthCandidate: EarthAnalogSite;
}) {
  const aster = earthCandidate.asterExtract;
  const bands = aster
    ? [
        { band: 'Band 10 (8.29 µm)', val: aster.emissivityBand10 },
        { band: 'Band 11 (8.63 µm)', val: aster.emissivityBand11 },
        { band: 'Band 12 (9.08 µm)', val: aster.emissivityBand12 },
        { band: 'Band 13 (10.66 µm)', val: aster.emissivityBand13 },
        { band: 'Band 14 (11.32 µm)', val: aster.emissivityBand14 },
      ]
    : [];

  const hasBands = aster?.status === 'Regenerated' && bands.some((b) => b.val !== null);

  if (!hasBands) {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-slate-100">
            ASTER GED v3 TIR Emissivity (Bands 10–14)
          </span>
          <span className="font-mono text-amber-400">▲ Pending</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          {aster?.blocker ??
            'Stage 5 Earth ASTER GED v3 (AG100.003) requires authenticated NASA Earthdata Login OAuth and HDF5 decoding. No proxy values are substituted.'}
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2 border-t border-slate-800/80 pt-3 font-mono text-[10px] text-slate-500">
          <div>B10: Pending</div>
          <div>B11: Pending</div>
          <div>B12: Pending</div>
          <div>B13: Pending</div>
          <div>B14: Pending</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bands.map((b) => (
        <div key={b.band} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">{b.band}</span>
            <span className="font-mono text-violet-300 tabular-nums">
              {b.val !== null ? b.val.toFixed(4) : 'N/A'}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-xs bg-slate-800">
            {b.val !== null && (
              <div
                className="h-full bg-violet-400"
                style={{ width: `${Math.min(100, Math.max(0, ((b.val - 0.85) / 0.15) * 100))}%` }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
