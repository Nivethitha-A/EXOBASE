import { ChevronDown, ChevronUp, Download, ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { exportDatasetCatalogCsv } from '../shared/csvExport';
import type {
  EarthAnalogSite,
  PlanetaryDatasetInfo,
  PlanetaryRegion,
  ProvenanceStatus,
} from '../shared/planetaryData';
import { DatasetStageProgressChart } from './ScientificCharts';
import { StatusText } from './StatusText';

interface DatasetCatalogScreenProps {
  datasets: PlanetaryDatasetInfo[];
  regions: PlanetaryRegion[];
  earthSites: EarthAnalogSite[];
}

export function DatasetCatalogScreen({
  datasets,
  regions,
  earthSites,
}: DatasetCatalogScreenProps) {
  const [planetFilter, setPlanetFilter] = useState<'all' | 'Earth' | 'Moon' | 'Mars'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProvenanceStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('moon-diviner-mars-themis');

  const filteredDatasets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return datasets.filter((ds) => {
      if (planetFilter !== 'all' && !ds.planet.includes(planetFilter)) return false;
      if (stageFilter !== 'all' && String(ds.stageNumber) !== stageFilter) return false;
      if (statusFilter !== 'all') {
        const hasSubMatch = ds.subStages?.some((sub) => sub.status === statusFilter);
        if (ds.status !== statusFilter && !hasSubMatch) return false;
      }
      if (q) {
        const hay = `${ds.stage} ${ds.planet} ${ds.dataset} ${ds.instrument} ${ds.productId} ${ds.sourceLabel} ${ds.availableFeatures.join(' ')} ${ds.calibrationNote}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [datasets, planetFilter, stageFilter, statusFilter, search]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Dataset Catalog &amp; Provenance Registry (Stages 1–6)
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Complete satellite ingestion status, product identifiers, native spatial resolutions,
            and extraction boundaries across all six EXOBASE stages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportDatasetCatalogCsv(datasets, regions, earthSites)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-[#0B0E17] px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer whitespace-nowrap shrink-0 self-start lg:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Provenance CSV</span>
        </button>
      </div>

      {/* Status Definitions & Scientific Caveat */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4">
          <StatusText status="Regenerated" className="text-xs font-semibold" />
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Reproducibly extracted from official NASA PDS / Copernicus / MODIS source products via
            deterministic scripts. <strong className="text-slate-100">Regenerated does not mean
            independently scientifically validated.</strong>
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4">
          <StatusText status="Pending" className="text-xs font-semibold" />
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Not yet processed or inaccessible without authentication in runtime (e.g., Stage 5
            ASTER GED v3 Earthdata OAuth, Stage 6B Odyssey THEMIS calibrated IRPBT). Strictly
            excluded from scoring and never zero-filled.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-4">
          <StatusText status="Demo Estimate" className="text-xs font-semibold" />
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Archived initial prototype conceptual estimate kept strictly isolated from
            regenerated datasets and never merged into verified extracts.
          </p>
        </div>
      </section>

      {/* Progress Strip */}
      <section className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5">
        <DatasetStageProgressChart datasets={datasets} />
      </section>

      {/* Filter Bar */}
      <section className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#0B0E17] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-slate-800 bg-[#07090E] p-1">
            {(['all', 'Earth', 'Moon', 'Mars'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlanetFilter(p)}
                className={`rounded px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap ${
                  planetFilter === p
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === 'all' ? 'All Bodies' : p}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter by stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-md border border-slate-800 bg-[#07090E] px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Stages (1–6)</option>
            {datasets.map((d) => (
              <option key={d.id} value={String(d.stageNumber)}>
                {d.stage} · {d.planet}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by dataset status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ProvenanceStatus)}
            className="rounded-md border border-slate-800 bg-[#07090E] px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Regenerated">Regenerated</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dataset, product ID, or instrument..."
            className="w-full rounded-md border border-slate-800 bg-[#07090E] py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Catalog List */}
      <section className="space-y-3">
        {filteredDatasets.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-8 text-center text-sm text-slate-400">
            No dataset stages match the selected filters.
          </div>
        ) : (
          filteredDatasets.map((ds) => {
            const isExpanded = expandedId === ds.id;
            return (
              <article
                key={ds.id}
                className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="text-cyan-400 font-semibold">{ds.stage}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-200">{ds.planet}</span>
                      <span className="text-slate-600">·</span>
                      <StatusText status={ds.status} label={ds.statusSummary} />
                    </div>
                    <h2 className="font-display text-lg font-semibold text-slate-100">
                      {ds.dataset}
                    </h2>
                    <p className="text-xs text-slate-300">{ds.purpose}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {ds.sourceUrl && (
                      <a
                        href={ds.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300"
                      >
                        <span>Source Docs</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ds.id)}
                      className="inline-flex items-center gap-1 rounded border border-slate-700 bg-[#0F1420] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          <span>Hide Product Info</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          <span>Product Info</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-3 sm:grid-cols-4 font-mono text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-500">Product ID</span>
                    <span className="text-slate-200 break-all">{ds.productId}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Native Resolution</span>
                    <span className="text-slate-200">{ds.spatialResolution}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Regions Covered</span>
                    <span className="text-slate-200 tabular-nums">{ds.regionCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Wavelength / Band</span>
                    <span className="text-slate-200">{ds.wavelengthOrBand}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-slate-800 pt-4 text-xs">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <p className="font-mono text-[11px] text-slate-400">Instrument &amp; Source</p>
                        <p className="mt-1 text-slate-200">{ds.instrument}</p>
                        <p className="mt-0.5 text-slate-400">{ds.sourceLabel}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[11px] text-slate-400">Available Features</p>
                        <p className="mt-1 text-slate-200">{ds.availableFeatures.join(' · ')}</p>
                      </div>
                    </div>

                    <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3 text-xs text-slate-300 leading-relaxed">
                      <span className="font-mono text-[11px] text-cyan-300">
                        Calibration &amp; Extraction Note:{' '}
                      </span>
                      {ds.calibrationNote}
                    </div>

                    {ds.subStages && ds.subStages.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-mono text-[11px] text-slate-400">
                          Stage 6 Sub-Dataset Breakdown
                        </p>
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                          {ds.subStages.map((sub) => (
                            <div
                              key={sub.id}
                              className="rounded-md border border-slate-800 bg-[#0F1420] p-3 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-100">{sub.label}</span>
                                <StatusText status={sub.status} className="text-[11px]" />
                              </div>
                              <p className="font-mono text-[10px] text-cyan-300 break-all">
                                {sub.productId}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {sub.regionCount} regions · {sub.resolution}
                              </p>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                {sub.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
