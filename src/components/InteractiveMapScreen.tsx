import { ArrowRight, Compass, Layers, Maximize2, Search, ZoomIn, ZoomOut } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { EarthAnalogSite, PlanetaryRegion } from '../shared/planetaryData';
import type { SimilarityAnalysisResponse } from '../shared/similarityEngine';
import { formatMetric, StatusText } from './StatusText';

type MapBody = 'earth' | 'moon' | 'mars';

interface InteractiveMapScreenProps {
  analysis: SimilarityAnalysisResponse;
  regions: PlanetaryRegion[];
  earthSites: EarthAnalogSite[];
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
  onSelectRegion: (regionId: string) => void;
  onOpenDetailedAnalysis: (candidateId?: string) => void;
  onDiscoverAnalogsForRegion: (regionId: string) => void;
}

const EARTH_CONTINENT_PATHS = [
  'M 42,68 L 118,52 L 185,48 L 245,56 L 285,68 L 325,95 L 308,132 L 285,155 L 266,178 L 242,196 L 222,226 L 245,244 L 225,252 L 195,218 L 164,194 L 146,160 L 130,126 L 86,102 L 42,88 Z',
  'M 332,22 L 418,16 L 444,38 L 410,68 L 364,84 L 336,64 Z',
  'M 225,28 L 296,24 L 306,46 L 246,52 Z',
  'M 268,230 L 318,224 L 368,256 L 404,284 L 386,330 L 348,374 L 320,418 L 304,444 L 292,438 L 294,388 L 284,334 L 266,282 Z',
  'M 428,60 L 460,58 L 464,74 L 432,76 Z',
  'M 466,118 L 484,96 L 520,70 L 568,54 L 635,44 L 748,40 L 855,46 L 944,58 L 952,82 L 908,110 L 864,132 L 852,164 L 826,184 L 786,216 L 758,218 L 742,194 L 704,190 L 664,218 L 642,188 L 614,174 L 580,178 L 548,162 L 504,160 L 478,154 L 468,134 Z',
  'M 476,94 L 496,90 L 498,112 L 478,114 Z',
  'M 468,176 L 538,168 L 586,184 L 614,226 L 642,238 L 616,288 L 588,334 L 558,348 L 536,312 L 526,274 L 496,252 L 462,226 L 456,198 Z',
  'M 624,296 L 638,292 L 632,324 L 618,322 Z',
  'M 596,178 L 646,184 L 658,218 L 618,228 L 598,202 Z',
  'M 786,232 L 820,248 L 808,266 L 778,248 Z',
  'M 828,256 L 876,264 L 872,278 L 824,270 Z',
  'M 874,136 L 896,132 L 892,158 L 872,160 Z',
  'M 812,306 L 882,294 L 924,324 L 916,368 L 870,382 L 814,362 L 806,332 Z',
  'M 956,368 L 976,356 L 972,384 L 948,392 Z',
  'M 40,456 L 190,450 L 340,446 L 490,452 L 650,448 L 810,452 L 960,448 L 990,492 L 10,492 Z',
];

function projectEarth(lon: number, lat: number) {
  return {
    x: ((lon + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 500,
  };
}

function projectEastLongitude360(lonDeg: number, latDeg: number) {
  const lon360 = ((lonDeg % 360) + 360) % 360;
  return {
    x: (lon360 / 360) * 1000,
    y: ((90 - latDeg) / 180) * 500,
  };
}

export function InteractiveMapScreen({
  analysis,
  regions,
  earthSites,
  selectedCandidateId,
  onSelectCandidate,
  onSelectRegion,
  onOpenDetailedAnalysis,
  onDiscoverAnalogsForRegion,
}: InteractiveMapScreenProps) {
  const [activeBody, setActiveBody] = useState<MapBody>('earth');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);

  const [layers, setLayers] = useState({
    graticule: true,
    contours: true,
    labels: true,
    rankColors: true,
  });

  const [selectedMoonId, setSelectedMoonId] = useState<string>(
    regions.find((r) => r.planet === 'moon')?.id ?? 'moon-shackleton'
  );
  const [selectedMarsId, setSelectedMarsId] = useState<string>(
    regions.find((r) => r.planet === 'mars')?.id ?? 'mars-jezero'
  );

  const moonRegions = useMemo(() => regions.filter((r) => r.planet === 'moon'), [regions]);
  const marsRegions = useMemo(() => regions.filter((r) => r.planet === 'mars'), [regions]);

  const rankByEarthId = useMemo(() => {
    const map = new Map<string, number>();
    analysis.results.forEach((r) => map.set(r.candidate.id, r.rank));
    return map;
  }, [analysis.results]);

  const filteredEarth = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return earthSites;
    return earthSites.filter((s) =>
      `${s.name} ${s.country} ${s.biome}`.toLowerCase().includes(q)
    );
  }, [earthSites, searchQuery]);

  const filteredMoon = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return moonRegions;
    return moonRegions.filter((r) =>
      `${r.name} ${r.geologicalClass}`.toLowerCase().includes(q)
    );
  }, [moonRegions, searchQuery]);

  const filteredMars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return marsRegions;
    return marsRegions.filter((r) =>
      `${r.name} ${r.geologicalClass}`.toLowerCase().includes(q)
    );
  }, [marsRegions, searchQuery]);

  const activeEarthResult =
    analysis.results.find((r) => r.candidate.id === selectedCandidateId) ?? analysis.results[0];
  const activeEarthSite =
    earthSites.find((s) => s.id === selectedCandidateId) ??
    activeEarthResult?.candidate ??
    earthSites[0];

  const activeMoonRegion =
    moonRegions.find((r) => r.id === selectedMoonId) ?? moonRegions[0];
  const activeMarsRegion =
    marsRegions.find((r) => r.id === selectedMarsId) ?? marsRegions[0];

  const switchBody = (body: MapBody) => {
    setActiveBody(body);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCursorCoords(null);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => {
      const next = Math.min(3.4, Math.max(1, Number((prev + delta).toFixed(2))));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const viewW = 1000 / zoom;
  const viewH = 500 / zoom;
  const viewX = 500 - viewW / 2 - pan.x;
  const viewY = 250 - viewH / 2 - pan.y;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const mapX = viewX + relX * viewW;
    const mapY = viewY + relY * viewH;

    const lon =
      activeBody === 'earth'
        ? Math.max(-180, Math.min(180, (mapX / 1000) * 360 - 180))
        : Math.max(0, Math.min(360, (mapX / 1000) * 360));
    const lat = Math.max(-90, Math.min(90, 90 - (mapY / 500) * 180));
    setCursorCoords({ lat, lon });

    if (isDragging && zoom > 1) {
      const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * viewW;
      const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * viewH;
      setPan({
        x: Math.max(-420, Math.min(420, dragStartRef.current.panX + dx)),
        y: Math.max(-200, Math.min(200, dragStartRef.current.panY + dy)),
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const earthLonLines = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  const eastLonLines = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const latLines = [-60, -30, 0, 30, 60];

  const projectionLabel =
    activeBody === 'earth'
      ? 'EARTH WGS84 EQUIRECTANGULAR (-180° to +180°)'
      : activeBody === 'moon'
      ? 'SELENOGRAPHIC CYLINDRICAL (0° to 360°E) + SOUTH POLAR INSET'
      : 'MARS AREOGRAPHIC EQUIRECTANGULAR (0° to 360°E)';

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header & Separate Planet View Switcher */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Interactive Planetary Maps
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Dedicated coordinate projections for Earth ({earthSites.length} analogs), Moon (
            {moonRegions.length} regions), and Mars ({marsRegions.length} regions).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="Select planetary coordinate map"
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-[#0B0E17] p-1"
          >
            {(
              [
                { id: 'earth', label: `Earth (${earthSites.length})` },
                { id: 'moon', label: `Moon (${moonRegions.length})` },
                { id: 'mars', label: `Mars (${marsRegions.length})` },
              ] as { id: MapBody; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeBody === tab.id}
                onClick={() => switchBody(tab.id)}
                className={`rounded px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeBody === tab.id
                    ? tab.id === 'mars'
                      ? 'bg-amber-500 text-slate-950'
                      : tab.id === 'moon'
                      ? 'bg-slate-200 text-slate-950'
                      : 'bg-cyan-500 text-slate-950'
                    : 'text-slate-300 hover:text-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleZoom(-0.4)}
              aria-label="Zoom out map"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-700 bg-[#0B0E17] text-slate-200 hover:border-slate-500 cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.4)}
              aria-label="Zoom in map"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-700 bg-[#0B0E17] text-slate-200 hover:border-slate-500 cursor-pointer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-9 items-center gap-1.5 rounded border border-slate-700 bg-[#0B0E17] px-3 text-xs font-medium text-slate-200 hover:border-slate-500 cursor-pointer whitespace-nowrap"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Reset ({zoom.toFixed(1)}x)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layer Controls & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#0B0E17] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Layers:</span>
          </span>
          {(
            [
              { key: 'graticule', label: 'Graticule' },
              { key: 'contours', label: activeBody === 'earth' ? 'Continents' : 'Physiographic Basins' },
              { key: 'labels', label: 'Site Labels' },
              ...(activeBody === 'earth'
                ? [{ key: 'rankColors', label: 'Top-3 Analog Highlights' }]
                : []),
            ] as { key: keyof typeof layers; label: string }[]
          ).map((ctrl) => (
            <label
              key={ctrl.key}
              className="inline-flex items-center gap-1.5 text-slate-300 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={layers[ctrl.key]}
                onChange={() =>
                  setLayers((prev) => ({ ...prev, [ctrl.key]: !prev[ctrl.key] }))
                }
                className="accent-cyan-500 rounded cursor-pointer"
              />
              <span>{ctrl.label}</span>
            </label>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeBody} markers...`}
            className="w-full rounded-md border border-slate-800 bg-[#07090E] py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Map Viewport + Right Location Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-[#070B12] lg:col-span-8">
          <div className="pointer-events-none absolute top-3 left-3 z-10 rounded border border-slate-800 bg-[#07090E]/90 px-3 py-1.5 font-mono text-[11px] text-slate-300 tabular-nums">
            {cursorCoords
              ? `CURSOR ${Math.abs(cursorCoords.lat).toFixed(2)}°${
                  cursorCoords.lat >= 0 ? 'N' : 'S'
                }, ${
                  activeBody === 'earth'
                    ? `${Math.abs(cursorCoords.lon).toFixed(2)}°${cursorCoords.lon >= 0 ? 'E' : 'W'}`
                    : `${cursorCoords.lon.toFixed(2)}°E`
                }`
              : projectionLabel}
          </div>

          <svg
            viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => {
              setIsDragging(false);
              setCursorCoords(null);
            }}
            className={`block h-[420px] w-full sm:h-[520px] select-none ${
              zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
            }`}
            role="img"
            aria-label={`${activeBody} coordinate map`}
          >
            <rect
              x={0}
              y={0}
              width={1000}
              height={500}
              fill={
                activeBody === 'earth'
                  ? '#080C14'
                  : activeBody === 'moon'
                  ? '#0C0F16'
                  : '#140C09'
              }
            />

            {/* Coordinate Graticule */}
            {layers.graticule && (
              <>
                {(activeBody === 'earth' ? earthLonLines : eastLonLines).map((lon) => {
                  const pt =
                    activeBody === 'earth'
                      ? projectEarth(lon, 0)
                      : projectEastLongitude360(lon, 0);
                  return (
                    <g key={`lon-${lon}`}>
                      <line
                        x1={pt.x}
                        y1={0}
                        x2={pt.x}
                        y2={500}
                        stroke={lon === 0 || lon === 180 ? '#273449' : '#151D2C'}
                        strokeWidth={1 / zoom}
                        strokeDasharray={`${3 / zoom} ${3 / zoom}`}
                      />
                      <text
                        x={pt.x + 3 / zoom}
                        y={14 / zoom}
                        fontSize={9 / zoom}
                        className="fill-slate-500 font-mono"
                      >
                        {activeBody === 'earth'
                          ? lon === 0
                            ? '0°'
                            : `${Math.abs(lon)}°${lon > 0 ? 'E' : 'W'}`
                          : `${lon}°E`}
                      </text>
                    </g>
                  );
                })}
                {latLines.map((lat) => {
                  const pt = projectEarth(0, lat);
                  return (
                    <g key={`lat-${lat}`}>
                      <line
                        x1={0}
                        y1={pt.y}
                        x2={1000}
                        y2={pt.y}
                        stroke={lat === 0 ? '#273449' : '#151D2C'}
                        strokeWidth={lat === 0 ? 1.2 / zoom : 0.8 / zoom}
                        strokeDasharray={lat === 0 ? undefined : `${3 / zoom} ${3 / zoom}`}
                      />
                      <text
                        x={6 / zoom}
                        y={pt.y - 3 / zoom}
                        fontSize={9 / zoom}
                        className="fill-slate-500 font-mono"
                      >
                        {lat === 0 ? 'EQ' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            {/* Body-Specific Physiographic Contours */}
            {layers.contours && activeBody === 'earth' && (
              <g>
                {EARTH_CONTINENT_PATHS.map((d, idx) => (
                  <path
                    key={idx}
                    d={d}
                    fill="#141C2B"
                    stroke="#263248"
                    strokeWidth={0.9 / zoom}
                  />
                ))}
              </g>
            )}

            {layers.contours && activeBody === 'moon' && (
              <g>
                {/* Mare Imbrium, Serenitatis, Tranquillitatis, Oceanus Procellarum, South Pole-Aitken stylized basins */}
                <ellipse cx={945} cy={165} rx={65} ry={48} fill="#161C29" stroke="#2D3748" strokeWidth={1 / zoom} />
                <ellipse cx={50} cy={175} rx={55} ry={45} fill="#161C29" stroke="#2D3748" strokeWidth={1 / zoom} />
                <ellipse cx={865} cy={225} rx={75} ry={70} fill="#141A26" stroke="#2D3748" strokeWidth={1 / zoom} />
                <ellipse cx={85} cy={225} rx={45} ry={34} fill="#171E2C" stroke="#2D3748" strokeWidth={1 / zoom} />
                <ellipse cx={540} cy={385} rx={155} ry={78} fill="#121722" stroke="#2A3346" strokeWidth={1 / zoom} strokeDasharray={`${4 / zoom} ${3 / zoom}`} />
                <line x1={0} y1={458} x2={1000} y2={458} stroke="#334155" strokeWidth={1 / zoom} strokeDasharray={`${4 / zoom} ${4 / zoom}`} />
                <text x={14} y={452} fontSize={9 / zoom} className="fill-slate-400 font-mono">
                  75°S Polar Stereographic Boundary (LDEM_75S_240M)
                </text>
              </g>
            )}

            {layers.contours && activeBody === 'mars' && (
              <g>
                {/* Crustal dichotomy, Hellas Basin, Isidis Basin, Tharsis volcanic rise, Valles Marineris canyon */}
                <path
                  d="M 0,150 Q 180,190 360,155 T 700,195 T 1000,165 L 1000,0 L 0,0 Z"
                  fill="#191312"
                  stroke="#3B2922"
                  strokeWidth={1 / zoom}
                />
                <ellipse cx={645} cy={195} rx={115} ry={78} fill="#261812" stroke="#573424" strokeWidth={1 / zoom} />
                <ellipse cx={242} cy={210} rx={36} ry={28} fill="#161110" stroke="#472E23" strokeWidth={1 / zoom} />
                <ellipse cx={194} cy={365} rx={68} ry={48} fill="#140F0E" stroke="#472E23" strokeWidth={1 / zoom} />
                <path d="M 730,275 Q 815,288 900,272" fill="none" stroke="#9A3412" strokeWidth={2.5 / zoom} />
              </g>
            )}

            {/* Markers by Body */}
            {activeBody === 'earth' &&
              filteredEarth.map((site) => {
                const pt = projectEarth(site.lon, site.lat);
                const rank = rankByEarthId.get(site.id);
                const isSelected = site.id === activeEarthSite?.id;
                const isTopRank = rank !== undefined && rank <= 3;

                const markerColor =
                  layers.rankColors && rank === 1
                    ? '#22D3EE'
                    : layers.rankColors && isTopRank
                    ? '#06B6D4'
                    : '#94A3B8';

                return (
                  <g
                    key={site.id}
                    onClick={() => onSelectCandidate(site.id)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={13 / zoom}
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth={1.5 / zoom}
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={(isTopRank ? 6.5 : 5) / zoom}
                      fill={markerColor}
                      stroke="#07090E"
                      strokeWidth={1.5 / zoom}
                    />
                    {layers.labels && (
                      <text
                        x={pt.x + 8 / zoom}
                        y={pt.y + 3 / zoom}
                        fontSize={(isSelected ? 10.5 : 9) / zoom}
                        className={`font-mono ${
                          isSelected ? 'fill-cyan-300 font-bold' : 'fill-slate-300'
                        }`}
                      >
                        {rank ? `#${rank} ` : ''}
                        {site.name.split(' (')[0]}
                      </text>
                    )}
                  </g>
                );
              })}

            {activeBody === 'moon' &&
              filteredMoon.map((region) => {
                const pt = projectEastLongitude360(region.lon, region.lat);
                const isSelected = region.id === activeMoonRegion?.id;
                const isPolar = region.id === 'moon-shackleton';
                return (
                  <g
                    key={region.id}
                    onClick={() => {
                      setSelectedMoonId(region.id);
                      onSelectRegion(region.id);
                    }}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={14 / zoom}
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth={1.5 / zoom}
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={(isPolar ? 7 : 6) / zoom}
                      fill={isPolar ? '#38BDF8' : '#E2E8F0'}
                      stroke="#07090E"
                      strokeWidth={1.5 / zoom}
                    />
                    {layers.labels && (
                      <text
                        x={Math.min(pt.x + 9 / zoom, 820)}
                        y={pt.y - 6 / zoom}
                        fontSize={(isSelected ? 10.5 : 9.5) / zoom}
                        className={`font-mono ${
                          isSelected ? 'fill-cyan-300 font-bold' : 'fill-slate-200'
                        }`}
                      >
                        {region.name}
                      </text>
                    )}
                  </g>
                );
              })}

            {activeBody === 'mars' &&
              filteredMars.map((region) => {
                const pt = projectEastLongitude360(region.lon, region.lat);
                const isSelected = region.id === activeMarsRegion?.id;
                return (
                  <g
                    key={region.id}
                    onClick={() => {
                      setSelectedMarsId(region.id);
                      onSelectRegion(region.id);
                    }}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={14 / zoom}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth={1.5 / zoom}
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={6.5 / zoom}
                      fill="#F59E0B"
                      stroke="#07090E"
                      strokeWidth={1.5 / zoom}
                    />
                    {layers.labels && (
                      <text
                        x={Math.min(pt.x + 9 / zoom, 810)}
                        y={pt.y + 3 / zoom}
                        fontSize={(isSelected ? 10.5 : 9.5) / zoom}
                        className={`font-mono ${
                          isSelected ? 'fill-amber-300 font-bold' : 'fill-slate-200'
                        }`}
                      >
                        {region.name.split(' (')[0]}
                      </text>
                    )}
                  </g>
                );
              })}
          </svg>

          {/* South Polar Stereographic Inset when viewing Moon */}
          {activeBody === 'moon' && activeMoonRegion && (
            <div className="border-t border-slate-800 bg-[#0B0E17] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="font-mono text-cyan-300">
                South Polar Stereographic Domain: Shackleton Crater Rim (89.54°S, 129.78°E ·
                LDEM_75S_240M)
              </span>
              <span className="font-mono">
                Equatorial &amp; Mid-Latitude Domain: LDEM_64 (64 ppd)
              </span>
            </div>
          )}
        </div>

        {/* Right Location Information Panel */}
        <aside className="rounded-lg border border-slate-800 bg-[#0B0E17] p-6 lg:col-span-4 flex flex-col justify-between">
          {activeBody === 'earth' && activeEarthSite && (
            <>
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[11px] text-cyan-400">
                      Earth Analog ·{' '}
                      {rankByEarthId.get(activeEarthSite.id)
                        ? `Rank #${rankByEarthId.get(activeEarthSite.id)}`
                        : 'Not in active subset'}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold text-slate-50">
                      {activeEarthSite.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {activeEarthSite.country} · {activeEarthSite.biome}
                    </p>
                  </div>
                  {activeEarthResult && (
                    <div className="text-right font-mono tabular-nums">
                      <span className="text-2xl font-bold text-cyan-400">
                        {activeEarthResult.similarityScore.toFixed(1)}
                      </span>
                      <span className="block text-[10px] text-slate-500">Rel. Index</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 font-mono text-xs tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates</span>
                    <span className="text-slate-200">{activeEarthSite.coordinatesLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevation / Slope</span>
                    <span className="text-slate-200">
                      {formatMetric(activeEarthSite.features.elevationM, 1, 'm')} ·{' '}
                      {formatMetric(activeEarthSite.features.slopeDeg, 2, '°')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MODIS Mean Temp</span>
                    <span className="text-cyan-300">
                      {formatMetric(activeEarthSite.features.meanTempK, 2, 'K')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terrain Status</span>
                    <StatusText status={activeEarthSite.terrainProvenance?.status ?? 'Pending'} />
                  </div>
                </div>

                <p className="border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-300">
                  {activeEarthSite.geologicalSummary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenDetailedAnalysis(activeEarthSite.id)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
              >
                <span>Open Detailed Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {activeBody === 'moon' && activeMoonRegion && (
            <>
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-4">
                  <p className="font-mono text-[11px] text-cyan-400">Lunar Reference Region</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-50">
                    {activeMoonRegion.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">{activeMoonRegion.subtitle}</p>
                </div>

                <div className="space-y-2 font-mono text-xs tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selenographic Coords</span>
                    <span className="text-slate-200">{activeMoonRegion.coordinatesLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevation / Slope</span>
                    <span className="text-slate-200">
                      {formatMetric(activeMoonRegion.features.elevationM, 1, 'm')} ·{' '}
                      {formatMetric(activeMoonRegion.features.slopeDeg, 2, '°')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Diviner Mean Temp</span>
                    <span className="text-cyan-300">
                      {formatMetric(activeMoonRegion.features.meanTempK, 2, 'K')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">LOLA Status</span>
                    <StatusText status={activeMoonRegion.terrainProvenance?.status ?? 'Pending'} />
                  </div>
                </div>

                <p className="border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-300">
                  {activeMoonRegion.description}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => onDiscoverAnalogsForRegion(activeMoonRegion.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
                >
                  <Compass className="h-4 w-4" />
                  <span>Find Earth Analogs</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectRegion(activeMoonRegion.id);
                    onOpenDetailedAnalysis();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-[#0F1420] px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer"
                >
                  <span>Detailed Analysis</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

          {activeBody === 'mars' && activeMarsRegion && (
            <>
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-4">
                  <p className="font-mono text-[11px] text-amber-400">Martian Reference Region</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-50">
                    {activeMarsRegion.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">{activeMarsRegion.subtitle}</p>
                </div>

                <div className="space-y-2 font-mono text-xs tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Areographic Coords</span>
                    <span className="text-slate-200">{activeMarsRegion.coordinatesLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevation / Slope</span>
                    <span className="text-slate-200">
                      {formatMetric(activeMarsRegion.features.elevationM, 1, 'm')} ·{' '}
                      {formatMetric(activeMarsRegion.features.slopeDeg, 2, '°')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TES Night TI / Albedo</span>
                    <span className="text-amber-300">
                      {formatMetric(activeMarsRegion.features.thermalInertiaTIU, 1, 'TIU')} ·{' '}
                      {formatMetric(activeMarsRegion.features.albedo, 4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MOLA Status</span>
                    <StatusText status={activeMarsRegion.terrainProvenance?.status ?? 'Pending'} />
                  </div>
                </div>

                <p className="border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-300">
                  {activeMarsRegion.description}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => onDiscoverAnalogsForRegion(activeMarsRegion.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
                >
                  <Compass className="h-4 w-4" />
                  <span>Find Earth Analogs</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectRegion(activeMarsRegion.id);
                    onOpenDetailedAnalysis();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-[#0F1420] px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer"
                >
                  <span>Detailed Analysis</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
