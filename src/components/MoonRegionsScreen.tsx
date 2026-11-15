import { ArrowRight, Compass, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PlanetaryRegion } from '../shared/planetaryData';
import { OrbitalImage } from './OrbitalImage';
import { formatMetric, StatusText } from './StatusText';

interface MoonRegionsScreenProps {
  moonRegions: PlanetaryRegion[];
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
  onDiscoverAnalogs: (regionId: string) => void;
  onOpenDetailedAnalysis: (regionId: string) => void;
}

export function MoonRegionsScreen({
  moonRegions,
  selectedRegionId,
  onSelectRegion,
  onDiscoverAnalogs,
  onOpenDetailedAnalysis,
}: MoonRegionsScreenProps) {
  const [focusedId, setFocusedId] = useState<string>(
    moonRegions.some((r) => r.id === selectedRegionId)
      ? selectedRegionId
      : moonRegions[0]?.id ?? 'moon-shackleton'
  );

  useEffect(() => {
    if (moonRegions.some((r) => r.id === selectedRegionId)) {
      setFocusedId(selectedRegionId);
    }
  }, [selectedRegionId, moonRegions]);

  const activeRegion =
    moonRegions.find((r) => r.id === focusedId) ?? moonRegions[0];

  const handleSelect = (regionId: string) => {
    setFocusedId(regionId);
    onSelectRegion(regionId);
  };

  if (!activeRegion) return null;

  const isPolarStereographic = activeRegion.id === 'moon-shackleton';
  const diviner = activeRegion.moonThermalExtract;
  const hasRealDiviner = diviner?.status === 'Regenerated';

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Lunar Reference Regions
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            All {moonRegions.length} curated lunar sites extracted from NASA PDS LRO LOLA GDRDEM
            (Stage 2) and LRO Diviner Radiometer archives (Stage 6A).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onDiscoverAnalogs(activeRegion.id)}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer whitespace-nowrap"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Find Earth Analogs for {activeRegion.name.split(' ')[0]}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenDetailedAnalysis(activeRegion.id)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-[#0B0E17] px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer whitespace-nowrap"
          >
            <span>Open Detailed Analysis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Polar Stereographic vs Cylindrical Callout */}
      <div className="flex items-start gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-5 py-3.5 text-xs text-slate-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
        <p className="leading-relaxed">
          <strong className="text-slate-100">LOLA Product Projection Distinction:</strong>{' '}
          Shackleton Crater Rim (89.54°S) uses South Polar Stereographic{' '}
          <span className="font-mono text-cyan-300">LDEM_75S_240M.IMG</span> (240 m native) to avoid
          polar longitude distortion, whereas Mare Tranquillitatis, Aristarchus Plateau, and Tycho
          Crater use Simple Cylindrical 64 ppd{' '}
          <span className="font-mono text-slate-200">LDEM_64.IMG</span> (473.8 m native).
        </p>
      </div>

      {/* Main Split: 4 Lunar Region Cards + Detailed Telemetry Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          {moonRegions.map((region) => {
            const isSelected = region.id === activeRegion.id;
            const isPolar = region.id === 'moon-shackleton';
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => handleSelect(region.id)}
                className={`w-full rounded-lg border p-5 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-800 bg-[#0B0E17] hover:border-slate-700 hover:bg-[#0F1420]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-semibold text-slate-100">
                      {region.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {region.geologicalClass} ·{' '}
                      <span className="font-mono text-slate-200">{region.coordinatesLabel}</span>
                    </p>
                  </div>
                  <StatusText
                    status={region.terrainProvenance?.status ?? 'Pending'}
                    className="text-[11px]"
                  />
                </div>

                <p className="mt-2 font-mono text-[11px] text-cyan-300">
                  {isPolar
                    ? 'Polar Stereographic · LDEM_75S_240M (240 m)'
                    : 'Simple Cylindrical · LDEM_64 (473.8 m)'}
                </p>

                <div className="mt-3 grid grid-cols-4 gap-2 border-t border-slate-800/80 pt-3 font-mono text-xs tabular-nums">
                  <div>
                    <span className="block text-[10px] text-slate-500">Elev</span>
                    <span className="text-slate-100">
                      {formatMetric(region.features.elevationM, 1, 'm')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Slope</span>
                    <span className="text-slate-100">
                      {formatMetric(region.features.slopeDeg, 2, '°')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">TRI</span>
                    <span className="text-slate-100">
                      {formatMetric(region.features.roughnessIndex, 3)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Relief</span>
                    <span className="text-slate-100">
                      {formatMetric(region.features.localReliefM, 0, 'm')}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Inspector */}
        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] overflow-hidden lg:col-span-7 flex flex-col justify-between">
          <div>
            <OrbitalImage
              kind="moon"
              alt={`${activeRegion.name} lunar orbital reference`}
              caption={`Moon · ${activeRegion.name} · ${activeRegion.coordinatesLabel}`}
              className="h-52 w-full"
            />

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-50">
                    {activeRegion.name}
                  </h2>
                  <p className="mt-1 text-sm text-cyan-400">{activeRegion.subtitle}</p>
                </div>
                <span className="font-mono text-xs text-slate-300">
                  {isPolarStereographic
                    ? 'South Polar Stereographic (LDEM_75S_240M)'
                    : 'Simple Cylindrical 64 ppd (LDEM_64)'}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-slate-300">
                {activeRegion.description}
              </p>

              <div className="border-t border-slate-800 pt-4">
                <p className="font-mono text-[11px] text-slate-400">Mission Relevance</p>
                <p className="mt-1 text-sm text-slate-200">{activeRegion.missionRelevance}</p>
              </div>

              {/* LOLA Terrain Metrics */}
              <div className="border-t border-slate-800 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-xs text-slate-300">
                    Stage 2 · LRO LOLA Terrain Product
                  </h3>
                  <StatusText
                    status={activeRegion.terrainProvenance?.status ?? 'Pending'}
                    className="text-xs"
                  />
                </div>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {activeRegion.terrainProvenance?.productId} ·{' '}
                  {activeRegion.terrainProvenance?.resolution}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs tabular-nums">
                  <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                    <span className="block text-[10px] text-slate-400">Elevation</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-100">
                      {formatMetric(activeRegion.features.elevationM, 1, 'm')}
                    </span>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                    <span className="block text-[10px] text-slate-400">Mean Slope</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-100">
                      {formatMetric(activeRegion.features.slopeDeg, 2, 'deg')}
                    </span>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                    <span className="block text-[10px] text-slate-400">Roughness (TRI)</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-100">
                      {formatMetric(activeRegion.features.roughnessIndex, 3)}
                    </span>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                    <span className="block text-[10px] text-slate-400">Local Relief</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-100">
                      {formatMetric(activeRegion.features.localReliefM, 1, 'm')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Diviner Thermal Section — Only shown with real Regenerated Diviner data */}
              <div className="border-t border-slate-800 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-xs text-slate-300">
                    Stage 6A · LRO Diviner Radiometer Thermal Telemetry
                  </h3>
                  <StatusText
                    status={hasRealDiviner ? 'Regenerated' : 'Pending'}
                    className="text-xs"
                  />
                </div>

                {hasRealDiviner && diviner ? (
                  <div className="mt-3 space-y-3">
                    <p className="font-mono text-[11px] text-slate-400">
                      {diviner.product_id} · {diviner.resolution}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs tabular-nums">
                      <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                        <span className="block text-[10px] text-slate-400">Day Mean</span>
                        <span className="mt-1 block text-sm font-semibold text-amber-300">
                          {diviner.dayMeanTempK.toFixed(2)} K
                        </span>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                        <span className="block text-[10px] text-slate-400">Night Mean</span>
                        <span className="mt-1 block text-sm font-semibold text-cyan-300">
                          {diviner.nightMeanTempK.toFixed(2)} K
                        </span>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                        <span className="block text-[10px] text-slate-400">Mean Temp</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-100">
                          {diviner.meanTempK.toFixed(2)} K
                        </span>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                        <span className="block text-[10px] text-slate-400">Diurnal Swing</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-100">
                          {diviner.diurnalSwingK.toFixed(2)} K
                        </span>
                      </div>
                    </div>

                    <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3 text-xs text-slate-300 space-y-1 font-mono text-[11px] tabular-nums">
                      <div>
                        Min/Max Bin Range: {diviner.minNightTempK.toFixed(2)} K –{' '}
                        {diviner.maxDayTempK.toFixed(2)} K (Amplitude{' '}
                        {diviner.maxMinAmplitudeK.toFixed(2)} K · {diviner.validLocalTimeBins}/96
                        local-time bins)
                      </div>
                      {diviner.ghrmMidnightTbolK !== null ? (
                        <div className="text-cyan-300">
                          GHRM 5×5 Patch: Midnight Tbol={diviner.ghrmMidnightTbolK.toFixed(2)} K ·
                          Treg={diviner.ghrmMidnightTregK?.toFixed(2)} K · Rock Abundance=
                          {diviner.ghrmRockAbundance?.toFixed(4)}
                        </div>
                      ) : (
                        <div className="text-slate-400">{diviner.ghrmCoverageNote}</div>
                      )}
                      {diviner.polarGradientNote && (
                        <div className="text-amber-300/90">{diviner.polarGradientNote}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-amber-400">
                    Diviner thermal telemetry is Pending for this catalog mode (or Archived Demo).
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
