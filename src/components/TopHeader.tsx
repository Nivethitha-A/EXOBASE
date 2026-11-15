import { ChevronRight, Menu, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CatalogMode,
  EarthAnalogSite,
  PlanetaryDatasetInfo,
  PlanetaryRegion,
} from '../shared/planetaryData';
import type { ScreenId } from '../types/app';
import { NAV_SECTIONS } from './SidebarNav';

interface TopHeaderProps {
  activeScreen: ScreenId;
  catalogMode: CatalogMode;
  regions: PlanetaryRegion[];
  earthSites: EarthAnalogSite[];
  datasets: PlanetaryDatasetInfo[];
  onOpenMobileMenu: () => void;
  onNavigate: (screen: ScreenId) => void;
  onSelectRegion: (regionId: string, navigateTo?: ScreenId) => void;
  onSelectEarthSite: (siteId: string, navigateTo?: ScreenId) => void;
}

interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  category: 'Earth' | 'Moon' | 'Mars' | 'Dataset';
  action: () => void;
}

export function TopHeader({
  activeScreen,
  catalogMode,
  regions,
  earthSites,
  datasets,
  onOpenMobileMenu,
  onNavigate,
  onSelectRegion,
  onSelectEarthSite,
}: TopHeaderProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSection =
    NAV_SECTIONS.find((s) => s.id === activeScreen) ?? NAV_SECTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchHits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const hits: SearchHit[] = [];

    earthSites.forEach((site) => {
      const hay = `${site.name} ${site.country} ${site.biome} ${site.coordinatesLabel}`.toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          id: site.id,
          title: site.name,
          subtitle: `${site.country} · ${site.biome} · ${site.coordinatesLabel}`,
          category: 'Earth',
          action: () => {
            onSelectEarthSite(site.id, 'analysis');
            setQuery('');
            setOpen(false);
          },
        });
      }
    });

    regions.forEach((reg) => {
      const hay = `${reg.name} ${reg.planet} ${reg.geologicalClass} ${reg.coordinatesLabel}`.toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          id: reg.id,
          title: reg.name,
          subtitle: `${reg.planet.toUpperCase()} · ${reg.geologicalClass} · ${reg.coordinatesLabel}`,
          category: reg.planet === 'moon' ? 'Moon' : 'Mars',
          action: () => {
            onSelectRegion(reg.id, reg.planet === 'moon' ? 'moon' : 'mars');
            setQuery('');
            setOpen(false);
          },
        });
      }
    });

    datasets.forEach((ds) => {
      const hay = `${ds.stage} ${ds.dataset} ${ds.instrument} ${ds.productId} ${ds.planet} ${ds.statusSummary}`.toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          id: ds.id,
          title: `${ds.stage}: ${ds.dataset}`,
          subtitle: `${ds.planet} · ${ds.productId} · ${ds.status}`,
          category: 'Dataset',
          action: () => {
            onNavigate('catalog');
            setQuery('');
            setOpen(false);
          },
        });
      }
    });

    return hits.slice(0, 8);
  }, [query, earthSites, regions, datasets, onNavigate, onSelectEarthSite, onSelectRegion]);

  const modeLabel =
    catalogMode === 'verified-terrain'
      ? 'Mode: Terrain-Only (Stages 1–3)'
      : catalogMode === 'staged-hybrid'
      ? 'Mode: Multimodal Hybrid'
      : 'Mode: Archived Demo';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#07090E]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-50 lg:hidden cursor-pointer shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                EXOBASE
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              <span className="truncate text-slate-200 font-medium">
                {currentSection.breadcrumb}
              </span>
            </nav>
            <p className="mt-0.5 text-[11px] font-mono text-slate-500 truncate">
              {modeLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end max-w-md min-w-[220px]" ref={containerRef}>
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              placeholder="Search regions, Earth sites, or datasets..."
              aria-label="Global search across Earth sites, Moon and Mars regions, and datasets"
              className="w-full rounded-md border border-slate-800 bg-[#0B0E17] py-2 pl-9 pr-8 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setOpen(false);
                }}
                aria-label="Clear global search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {open && query.trim().length > 0 && (
              <div className="absolute right-0 left-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-md border border-slate-700 bg-[#0B0E17] shadow-xl z-50">
                {searchHits.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400">
                    No matching Earth sites, planetary regions, or datasets for &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-800/80">
                    {searchHits.map((hit) => (
                      <li key={`${hit.category}-${hit.id}`}>
                        <button
                          type="button"
                          onClick={hit.action}
                          className="flex w-full items-start justify-between gap-3 px-4 py-2.5 text-left hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-slate-100">
                              {hit.title}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {hit.subtitle}
                            </p>
                          </div>
                          <span className="font-mono text-[10px] text-cyan-400 shrink-0 pt-0.5">
                            {hit.category}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
