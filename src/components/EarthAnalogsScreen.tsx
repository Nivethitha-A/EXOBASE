import { ArrowRight, ChevronDown, ChevronUp, LayoutGrid, Search, Table } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { EarthAnalogSite } from '../shared/planetaryData';
import { formatMetric, StatusText } from './StatusText';

interface EarthAnalogsScreenProps {
  earthSites: EarthAnalogSite[];
  onInspectInAnalysis: (siteId: string) => void;
}

type BiomeFilter = 'all' | 'desert' | 'volcanic' | 'playa' | 'polar';
type SortKey = 'name' | 'elevationM' | 'slopeDeg' | 'roughnessIndex' | 'localReliefM' | 'meanTempK';

export function EarthAnalogsScreen({
  earthSites,
  onInspectInAnalysis,
}: EarthAnalogsScreenProps) {
  const [search, setSearch] = useState('');
  const [biome, setBiome] = useState<BiomeFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedId, setExpandedId] = useState<string | null>(earthSites[0]?.id ?? null);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = earthSites.filter((site) => {
      if (q) {
        const hay = `${site.name} ${site.country} ${site.biome} ${site.geologicalSummary} ${site.coordinatesLabel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const b = site.biome.toLowerCase();
      if (biome === 'desert') return b.includes('desert') || b.includes('gossan');
      if (biome === 'volcanic') return b.includes('volcanic') || b.includes('basalt');
      if (biome === 'playa') return b.includes('playa') || b.includes('salt');
      if (biome === 'polar') return b.includes('polar') || b.includes('high-altitude');
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'name') {
        return sortDir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      const av = a.features[sortBy] ?? -Infinity;
      const bv = b.features[sortBy] ?? -Infinity;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [earthSites, search, biome, sortBy, sortDir]);

  const handleSortChange = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Earth Analog Testbeds
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            All {earthSites.length} curated terrestrial field sites with Stage 1 Copernicus GLO-90
            terrain metrics and Stage 4 MODIS MOD11A2.061 thermal observations.
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-[#0B0E17] p-1 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap ${
              viewMode === 'cards'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap ${
              viewMode === 'table'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Filter, Search, Sort Controls */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#0B0E17] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-slate-800 bg-[#07090E] p-1">
          {(
            [
              { id: 'all', label: 'All Sites' },
              { id: 'desert', label: 'Hyper-Arid' },
              { id: 'volcanic', label: 'Volcanic' },
              { id: 'playa', label: 'Salt Playas' },
              { id: 'polar', label: 'Polar & High-Alt' },
            ] as { id: BiomeFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBiome(tab.id)}
              className={`rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                biome === tab.id
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[210px] flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter Earth sites..."
              className="w-full rounded-md border border-slate-800 bg-[#07090E] py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="earth-sort" className="text-slate-400 whitespace-nowrap">
              Sort:
            </label>
            <select
              id="earth-sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortKey)}
              className="rounded-md border border-slate-800 bg-[#07090E] px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="name">Name</option>
              <option value="elevationM">Elevation (m)</option>
              <option value="slopeDeg">Slope (deg)</option>
              <option value="roughnessIndex">Roughness (TRI)</option>
              <option value="localReliefM">Local Relief (m)</option>
              <option value="meanTempK">Mean Temp (K)</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="rounded border border-slate-800 bg-[#07090E] px-2.5 py-1.5 font-mono text-[11px] text-slate-300 hover:border-slate-700 cursor-pointer"
            >
              {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-8 text-center text-sm text-slate-400">
          No Earth analog sites match the current search or biome filter.
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Location &amp; Coordinates</th>
                <th className="py-2.5 pr-4 text-right font-medium">Elevation</th>
                <th className="py-2.5 pr-4 text-right font-medium">Slope</th>
                <th className="py-2.5 pr-4 text-right font-medium">Roughness</th>
                <th className="py-2.5 pr-4 text-right font-medium">Relief</th>
                <th className="py-2.5 pr-4 text-right font-medium">MODIS Mean T</th>
                <th className="py-2.5 pr-4 font-medium">Dataset &amp; Resolution</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
                <th className="py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredAndSorted.map((site) => (
                <tr key={site.id} className="hover:bg-slate-900/40">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-slate-100">{site.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {site.country} · {site.coordinatesLabel}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                    {formatMetric(site.features.elevationM, 1, 'm')}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                    {formatMetric(site.features.slopeDeg, 2, '°')}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                    {formatMetric(site.features.roughnessIndex, 3)}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                    {formatMetric(site.features.localReliefM, 1, 'm')}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-cyan-300 tabular-nums whitespace-nowrap">
                    {formatMetric(site.features.meanTempK, 2, 'K')}
                  </td>
                  <td className="py-3 pr-4 font-mono text-[11px] text-slate-400">
                    <div>{site.terrainProvenance?.productId ?? 'N/A'}</div>
                    <div className="text-slate-500">{site.terrainProvenance?.resolution ?? ''}</div>
                  </td>
                  <td className="py-3 pr-4 text-[11px]">
                    <StatusText status={site.terrainProvenance?.status ?? 'Pending'} />
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onInspectInAnalysis(site.id)}
                      className="inline-flex items-center gap-1 rounded border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300 cursor-pointer"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredAndSorted.map((site) => {
            const isExpanded = expandedId === site.id;
            return (
              <article
                key={site.id}
                className="rounded-lg border border-slate-800 bg-[#0B0E17] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-slate-100">
                        {site.name}
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        {site.country} · {site.biome} ·{' '}
                        <span className="font-mono text-slate-200">{site.coordinatesLabel}</span>
                      </p>
                    </div>
                    <StatusText
                      status={site.terrainProvenance?.status ?? 'Pending'}
                      className="text-xs"
                    />
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    {site.geologicalSummary}
                  </p>

                  {/* Core Telemetry Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-5 font-mono text-xs tabular-nums">
                    <div>
                      <span className="block text-[10px] text-slate-500">Elevation</span>
                      <span className="text-slate-100">
                        {formatMetric(site.features.elevationM, 1, 'm')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Slope</span>
                      <span className="text-slate-100">
                        {formatMetric(site.features.slopeDeg, 2, '°')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Roughness</span>
                      <span className="text-slate-100">
                        {formatMetric(site.features.roughnessIndex, 3)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Local Relief</span>
                      <span className="text-slate-100">
                        {formatMetric(site.features.localReliefM, 1, 'm')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">MODIS Mean T</span>
                      <span className="text-cyan-300">
                        {formatMetric(site.features.meanTempK, 2, 'K')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 font-mono text-[11px] text-slate-400">
                    <span>{site.terrainProvenance?.dataset}</span>
                    <span className="mx-1.5 text-slate-600">·</span>
                    <span>{site.terrainProvenance?.productId}</span>
                    <span className="mx-1.5 text-slate-600">·</span>
                    <span>{site.terrainProvenance?.resolution}</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-slate-800 pt-4">
                      <div>
                        <p className="text-[11px] font-mono text-slate-400">
                          Primary Field-Testing Applications
                        </p>
                        <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                          {site.primaryTestApplications.map((app) => (
                            <li key={app}>· {app}</li>
                          ))}
                        </ul>
                      </div>

                      {site.modisExtract?.status === 'Regenerated' && (
                        <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3 text-xs">
                          <p className="font-mono text-[11px] text-cyan-300">
                            Stage 4 MODIS/Terra MOD11A2.061 ({site.modisExtract.temporal_coverage})
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-[11px] tabular-nums text-slate-300">
                            <div>Day: {site.modisExtract.meanDayLstC?.toFixed(2)} °C</div>
                            <div>Night: {site.modisExtract.meanNightLstC?.toFixed(2)} °C</div>
                            <div>Swing: {site.modisExtract.diurnalSwingK?.toFixed(2)} K</div>
                            <div>
                              QA px: {site.modisExtract.validDayPixels}/
                              {site.modisExtract.totalDayPixels}
                            </div>
                          </div>
                        </div>
                      )}

                      {site.provenance && (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-left text-[11px]">
                            <thead>
                              <tr className="border-b border-slate-800 font-mono text-slate-500">
                                <th className="py-1.5 pr-3">Feature</th>
                                <th className="py-1.5 pr-3">Product</th>
                                <th className="py-1.5 pr-3">Value</th>
                                <th className="py-1.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono">
                              {site.provenance.map((row) => (
                                <tr key={row.feature}>
                                  <td className="py-1.5 pr-3 font-sans text-slate-200">
                                    {row.feature}
                                  </td>
                                  <td className="py-1.5 pr-3 text-slate-400">{row.productId}</td>
                                  <td className="py-1.5 pr-3 text-slate-200">{row.value}</td>
                                  <td className="py-1.5">
                                    <StatusText status={row.status} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : site.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-cyan-300 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        <span>Hide provenance &amp; details</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        <span>Scientific details &amp; provenance</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onInspectInAnalysis(site.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer whitespace-nowrap"
                  >
                    <span>Detailed Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
