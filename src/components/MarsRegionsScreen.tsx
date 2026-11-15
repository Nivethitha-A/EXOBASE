import { ArrowRight, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PlanetaryRegion } from '../shared/planetaryData';
import { OrbitalImage } from './OrbitalImage';
import { formatMetric, StatusText } from './StatusText';

interface MarsRegionsScreenProps {
  marsRegions: PlanetaryRegion[];
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
  onDiscoverAnalogs: (regionId: string) => void;
  onOpenDetailedAnalysis: (regionId: string) => void;
}

export function MarsRegionsScreen({
  marsRegions,
  selectedRegionId,
  onSelectRegion,
  onDiscoverAnalogs,
  onOpenDetailedAnalysis,
}: MarsRegionsScreenProps) {
  const [focusedId, setFocusedId] = useState<string>(
    marsRegions.some((r) => r.id === selectedRegionId)
      ? selectedRegionId
      : marsRegions[0]?.id ?? 'mars-jezero'
  );

  useEffect(() => {
    if (marsRegions.some((r) => r.id === selectedRegionId)) {
      setFocusedId(selectedRegionId);
    }
  }, [selectedRegionId, marsRegions]);

  const activeRegion =
    marsRegions.find((r) => r.id === focusedId) ?? marsRegions[0];

  const handleSelect = (regionId: string) => {
    setFocusedId(regionId);
    onSelectRegion(regionId);
  };

  if (!activeRegion) return null;

  const marsThermal = activeRegion.marsThermalExtract;
  const hasRealThemis =
    marsThermal?.themisStatus === 'Regenerated' &&
    marsThermal.meanTempK !== null &&
    marsThermal.diurnalSwingK !== null;
  const hasRealTes = marsThermal?.tesStatus === 'Regenerated';

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Martian Reference Regions
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            All {marsRegions.length} Martian reference sites extracted from NASA PDS MGS MOLA
            MEGDR 64 ppd tiles (Stage 3) and MGS TES TIMAP / Lambert Albedo (Stage 6B).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onDiscoverAnalogs(activeRegion.id)}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer whitespace-nowrap"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Find Earth Analogs for {activeRegion.name.split(' (')[0]}</span>
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

      {/* Main Split: 5 Martian Region Cards + Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          {marsRegions.map((region) => {
            const isSelected = region.id === activeRegion.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => handleSelect(region.id)}
                className={`w-full rounded-lg border p-5 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-amber-500/80 bg-amber-500/10'
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

                <p className="mt-2 font-mono text-[11px] text-amber-300/90 truncate">
                  {region.terrainProvenance?.productId}
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

        {/* Inspector */}
        <div className="rounded-lg border border-slate-800 bg-[#0B0E17] overflow-hidden lg:col-span-7 flex flex-col justify-between">
          <div>
            <OrbitalImage
              kind="mars"
              alt={`${activeRegion.name} Martian orbital terrain`}
              caption={`Mars · ${activeRegion.name} · ${activeRegion.coordinatesLabel}`}
              className="h-52 w-full"
            />

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-50">
                    {activeRegion.name}
                  </h2>
                  <p className="mt-1 text-sm text-amber-400">{activeRegion.subtitle}</p>
                </div>
                <span className="font-mono text-xs text-slate-300">
                  {activeRegion.coordinatesLabel}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-slate-300">
                {activeRegion.description}
              </p>

              <div className="border-t border-slate-800 pt-4">
                <p className="font-mono text-[11px] text-slate-400">Mission Relevance</p>
                <p className="mt-1 text-sm text-slate-200">{activeRegion.missionRelevance}</p>
              </div>

              {/* Stage 3 MOLA Terrain */}
              <div className="border-t border-slate-800 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-xs text-slate-300">
                    Stage 3 · MGS MOLA MEGDR Tile Product
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

              {/* Stage 6B Mars Thermal: MGS TES Regenerated + Odyssey THEMIS Pending */}
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-mono text-xs text-slate-300">
                      Stage 6B · MGS TES Thermal Inertia &amp; Lambert Albedo
                    </h3>
                    <StatusText
                      status={hasRealTes ? 'Regenerated' : 'Pending'}
                      className="text-xs"
                    />
                  </div>
                  {hasRealTes && marsThermal ? (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 font-mono text-xs tabular-nums">
                      <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                        <span className="block text-[10px] text-slate-400">Night TI (TIMAP)</span>
                        <span className="mt-1 block text-sm font-semibold text-amber-300">
                          {marsThermal.tesNightTIU?.toFixed(1)} TIU
                        </span>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                        <span className="block text-[10px] text-slate-400">Day TI (TIMAP)</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-100">
                          {marsThermal.tesDayTIU?.toFixed(1)} TIU
                        </span>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-[#0F1420] p-3">
                        <span className="block text-[10px] text-slate-400">Lambert Albedo</span>
                        <span className="mt-1 block text-sm font-semibold text-cyan-300">
                          {marsThermal.albedo?.toFixed(4)} α
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">
                      TES measurements unavailable in current mode.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-mono text-xs text-slate-300">
                      Stage 6B · Odyssey THEMIS Calibrated IR Brightness Temperature
                    </h3>
                    <StatusText
                      status={hasRealThemis ? 'Regenerated' : 'Pending'}
                      className="text-xs"
                    />
                  </div>
                  {hasRealThemis && marsThermal ? (
                    <div className="mt-2 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums">
                      <div>Mean Temp: {marsThermal.meanTempK?.toFixed(2)} K</div>
                      <div>Diurnal Swing: {marsThermal.diurnalSwingK?.toFixed(2)} K</div>
                    </div>
                  ) : (
                    <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-slate-400">
                      {marsThermal?.themisBlocker ??
                        'Odyssey THEMIS calibrated IRPBT/IRBTR temperature products are currently Pending. Uncalibrated 8-bit WMS stretches are excluded and never substituted for Kelvin temperatures.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
