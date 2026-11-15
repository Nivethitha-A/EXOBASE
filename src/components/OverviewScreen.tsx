import { ArrowRight, Compass, Database, Globe2, Layers, Map as MapIcon, Moon, Orbit } from 'lucide-react';
import type {
  CatalogMode,
  EarthAnalogSite,
  PlanetaryDatasetInfo,
  PlanetaryRegion,
  PlanetId,
} from '../shared/planetaryData';
import type { SimilarityAnalysisResponse } from '../shared/similarityEngine';
import type { ScreenId } from '../types/app';
import { OrbitalImage } from './OrbitalImage';
import { DatasetStageProgressChart } from './ScientificCharts';
import { StatusText } from './StatusText';

interface OverviewScreenProps {
  selectedPlanet: PlanetId;
  catalogMode: CatalogMode;
  datasets: PlanetaryDatasetInfo[];
  regions: PlanetaryRegion[];
  earthSites: EarthAnalogSite[];
  analysis: SimilarityAnalysisResponse;
  onChangeCatalogMode: (mode: CatalogMode) => void;
  onNavigate: (screen: ScreenId) => void;
  onQuickStartAnalysis: (planet: PlanetId) => void;
  onInspectCandidate: (candidateId: string) => void;
}

export function OverviewScreen({
  selectedPlanet,
  catalogMode,
  datasets,
  regions,
  earthSites,
  analysis,
  onChangeCatalogMode,
  onNavigate,
  onQuickStartAnalysis,
  onInspectCandidate,
}: OverviewScreenProps) {
  const marsCount = regions.filter((r) => r.planet === 'mars').length;
  const moonCount = regions.filter((r) => r.planet === 'moon').length;
  const regeneratedTerrainCount =
    earthSites.filter((s) => s.terrainProvenance?.status === 'Regenerated').length +
    regions.filter((r) => r.terrainProvenance?.status === 'Regenerated').length;

  const currentModeLabel =
    catalogMode === 'verified-terrain'
      ? 'Terrain-Only (1–3)'
      : catalogMode === 'staged-hybrid'
      ? 'Multimodal Hybrid'
      : 'Archived Demo';

  const topThree = analysis.results.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      {/* Mode Control Ribbon */}
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-800 bg-[#0B0E17] px-5 py-3.5 sm:flex-row sm:items-center">
        <div className="text-xs text-slate-300">
          <span className="font-mono text-cyan-400">Active Catalog Mode</span>
          <span className="mx-2 text-slate-600">·</span>
          <span>{analysis.compatibilityNotice}</span>
        </div>

        <div className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-[#07090E] p-1 self-start sm:self-auto">
          {(
            [
              { id: 'verified-terrain', label: 'Terrain-Only (1–3)' },
              { id: 'staged-hybrid', label: 'Multimodal Hybrid' },
              { id: 'demo', label: 'Archived Demo' },
            ] as { id: CatalogMode; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeCatalogMode(opt.id)}
              className={`rounded px-3 py-1.5 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                catalogMode === opt.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Split */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="flex flex-col justify-between rounded-lg border border-slate-800 bg-[#0B0E17] p-6 sm:p-8 lg:col-span-7">
          <div>
            <p className="text-xs font-mono text-cyan-400">
              EXOBASE · Planetary Analog Discovery &amp; Mission Site Planner
            </p>
            <h1 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.14] [text-wrap:balance]">
              Quantitative planetary analog discovery across Earth, Moon, and Mars
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Instead of relying on visual resemblance alone, EXOBASE compares satellite-derived
              elevation, terrain slope, surface roughness, local relief, and compatible thermal
              measurements across curated terrestrial field sites, lunar targets, and Martian
              landing regions.
            </p>
          </div>

          <div className="mt-7 border-t border-slate-800 pt-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onQuickStartAnalysis('mars')}
                className={`group flex flex-col justify-between rounded-md border p-4 text-left transition-colors duration-150 cursor-pointer ${
                  selectedPlanet === 'mars'
                    ? 'border-amber-500/60 bg-amber-500/10'
                    : 'border-slate-800 bg-[#0F1420] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-slate-100">
                    Run Mars Analog Search
                  </span>
                  <ArrowRight className="h-4 w-4 text-amber-400 transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  MGS MOLA MEGDR ({marsCount} regions) · MGS TES TI &amp; Albedo
                </p>
              </button>

              <button
                type="button"
                onClick={() => onQuickStartAnalysis('moon')}
                className={`group flex flex-col justify-between rounded-md border p-4 text-left transition-colors duration-150 cursor-pointer ${
                  selectedPlanet === 'moon'
                    ? 'border-cyan-500/60 bg-cyan-500/10'
                    : 'border-slate-800 bg-[#0F1420] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-slate-100">
                    Run Lunar Analog Search
                  </span>
                  <ArrowRight className="h-4 w-4 text-cyan-400 transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  LRO LOLA GDRDEM ({moonCount} regions) · LRO Diviner Thermal
                </p>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('analogs')}
                className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Compass className="h-4 w-4" />
                <span>Open Analog Discovery</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-[#0F1420] px-4 py-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 cursor-pointer whitespace-nowrap shrink-0"
              >
                <MapIcon className="h-4 w-4 text-cyan-400" />
                <span>Explore Interactive Maps</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-[#0F1420] px-4 py-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Database className="h-4 w-4 text-blue-400" />
                <span>Dataset Catalog</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Orbital Imagery */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-[#0B0E17] lg:col-span-5">
          <div className="grid flex-1 grid-rows-2 gap-px bg-slate-800">
            <OrbitalImage
              kind={selectedPlanet === 'mars' ? 'mars' : 'moon'}
              alt={
                selectedPlanet === 'mars'
                  ? 'Orbital view of Jezero Crater delta and volcanic floor on Mars'
                  : 'Orbital view of Shackleton Crater rim at the Lunar South Pole'
              }
              caption={
                selectedPlanet === 'mars'
                  ? 'Mars Target Coverage · MOLA MEGDR (926 m/pix)'
                  : 'Lunar Target Coverage · LOLA Polar & 64 ppd'
              }
              className="min-h-[190px] lg:h-full"
            />
            <OrbitalImage
              kind="earth"
              alt="Satellite observation of Earth analog desert basin"
              caption="Earth Field Testbeds · Copernicus GLO-90 & MODIS MOD11A2"
              className="min-h-[190px] lg:h-full"
            />
          </div>
        </div>
      </section>

      {/* 6 Summary Cards */}
      <section aria-label="Mission Catalog Summary" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <button
          type="button"
          onClick={() => onNavigate('earth')}
          className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4 text-left hover:border-slate-700 transition-colors cursor-pointer"
        >
          <p className="text-[11px] font-mono text-slate-400">Earth Locations</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-slate-50 tabular-nums">
            {earthSites.length}
          </p>
          <p className="mt-1 text-[11px] text-cyan-400 flex items-center gap-1">
            <span>Browse testbeds</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('moon')}
          className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4 text-left hover:border-slate-700 transition-colors cursor-pointer"
        >
          <p className="text-[11px] font-mono text-slate-400">Moon Regions</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-slate-50 tabular-nums">
            {moonCount}
          </p>
          <p className="mt-1 text-[11px] text-cyan-400 flex items-center gap-1">
            <span>LOLA + Diviner</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('mars')}
          className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4 text-left hover:border-slate-700 transition-colors cursor-pointer"
        >
          <p className="text-[11px] font-mono text-slate-400">Mars Regions</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-slate-50 tabular-nums">
            {marsCount}
          </p>
          <p className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
            <span>MOLA + TES</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </button>

        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4">
          <p className="text-[11px] font-mono text-slate-400">Regenerated Terrain</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {regeneratedTerrainCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Stages 1–3 records</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('catalog')}
          className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4 text-left hover:border-slate-700 transition-colors cursor-pointer"
        >
          <p className="text-[11px] font-mono text-slate-400">Dataset Stages</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-slate-50 tabular-nums">
            {datasets.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {datasets.filter((d) => d.status === 'Regenerated').length} full ·{' '}
            {datasets.filter((d) => d.status === 'Pending').length} partial/pending
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('analogs')}
          className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4 text-left hover:border-slate-700 transition-colors cursor-pointer"
        >
          <p className="text-[11px] font-mono text-slate-400">Analysis Mode</p>
          <p className="mt-1.5 font-display text-base font-bold text-cyan-300 truncate">
            {currentModeLabel}
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400 tabular-nums">
            {analysis.mathAudit.activeFeatureCount} active features
          </p>
        </button>
      </section>

      {/* Dataset Stage Progress & Table */}
      <section className="rounded-lg border border-slate-800 bg-[#0B0E17] p-6 space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-100">
              Dataset Pipeline Status (Stages 1–6)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Live status from backend catalog. Regenerated denotes reproducible script extraction,
              not independent scientific validation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            Inspect full provenance →
          </button>
        </div>

        <DatasetStageProgressChart datasets={datasets} />

        <div className="overflow-x-auto border-t border-slate-800 pt-4">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Stage</th>
                <th className="py-2.5 pr-4 font-medium">Body</th>
                <th className="py-2.5 pr-4 font-medium">Dataset</th>
                <th className="py-2.5 pr-4 font-medium">Resolution</th>
                <th className="py-2.5 pr-4 font-medium">Backend Status</th>
                <th className="py-2.5 font-medium">Coverage Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {datasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-slate-900/40">
                  <td className="py-3 pr-4 font-mono text-slate-400 whitespace-nowrap">
                    {ds.stage}
                  </td>
                  <td className="py-3 pr-4 font-mono text-slate-200 whitespace-nowrap">
                    {ds.planet}
                  </td>
                  <td className="py-3 pr-4 font-medium text-cyan-300 whitespace-nowrap">
                    {ds.dataset}
                  </td>
                  <td className="py-3 pr-4 font-mono text-slate-400 whitespace-nowrap">
                    {ds.spatialResolution}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-[11px]">
                    <StatusText status={ds.status} label={ds.statusSummary} />
                  </td>
                  <td className="py-3 text-slate-300">{ds.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Split: How EXOBASE Works + Recent Analysis & Top Candidates */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-6 lg:col-span-5">
          <h2 className="font-display text-lg font-semibold text-slate-100">
            How EXOBASE Works
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            All planetary and terrestrial measurements are normalized onto a single global physical
            scale and compared using Weighted Euclidean Distance. Similarity indices act as
            relative algorithmic ranking indicators, not probabilities.
          </p>

          <div className="mt-5 space-y-3 border-t border-slate-800 pt-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <Orbit className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="font-medium text-slate-100">1. Planetary Coverage</p>
                <p className="text-slate-400">
                  5 Martian regions (MOLA + TES), 4 lunar regions (LOLA + Diviner), and 10 Earth
                  field testbeds (Copernicus GLO-90 + MODIS).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Layers className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
              <div>
                <p className="font-medium text-slate-100">2. Strict Provenance Gating</p>
                <p className="text-slate-400">
                  Pending features (ASTER GED v3, Mars THEMIS IRPBT) are never zero-filled or
                  substituted with Demo values.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="font-medium text-slate-100">3. Deterministic Ranking &amp; AI Briefing</p>
                <p className="text-slate-400">
                  D = sqrt(sum(w_i · (x_i − y_i)²)) and S = 100 / (1 + D), paired with Gemini
                  geological interpretation.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Moon className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
              <div>
                <p className="font-medium text-slate-100">4. Separate Planetary Maps</p>
                <p className="text-slate-400">
                  Inspect dedicated Earth WGS84, Lunar Cylindrical + South Polar, and Martian
                  areographic coordinate projections.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live API Recent Analysis Results */}
        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-100">
                  Current Analysis Snapshot · {analysis.targetRegion.name}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Top Earth analog candidates returned by <span className="font-mono">/api/analyze</span>{' '}
                  ({analysis.targetRegion.planet.toUpperCase()} · {analysis.mathAudit.activeFeatureCount} active features)
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('rankings')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Full rankings →
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {topThree.map((item) => (
                <button
                  key={item.candidate.id}
                  type="button"
                  onClick={() => onInspectCandidate(item.candidate.id)}
                  className="flex w-full items-center justify-between gap-4 rounded-md border border-slate-800 bg-[#0F1420] p-4 text-left hover:border-cyan-500/60 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-xs text-cyan-400 tabular-nums">
                        #{String(item.rank).padStart(2, '0')}
                      </span>
                      <span className="truncate text-sm font-semibold text-slate-100">
                        {item.candidate.name}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 truncate">
                      {item.candidate.country} · {item.candidate.biome} · Closest:{' '}
                      {item.strongestMatchFeature?.label}
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono tabular-nums">
                    <span className="text-lg font-bold text-cyan-400">
                      {item.similarityScore.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      D = {item.euclideanDistance.toFixed(4)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-5 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
            Similarity scores are relative algorithmic ranking indicators derived from the currently
            available feature set—not probabilities or independently validated scientific analog
            conclusions.
          </p>
        </div>
      </section>
    </div>
  );
}
