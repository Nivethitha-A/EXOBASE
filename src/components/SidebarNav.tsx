import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Compass,
  Database,
  Globe2,
  Layers,
  LayoutDashboard,
  Map as MapIcon,
  Microscope,
  Moon,
  Orbit,
  X,
} from 'lucide-react';
import type { ScreenId } from '../types/app';

interface SidebarNavProps {
  activeScreen: ScreenId;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const NAV_SECTIONS: {
  id: ScreenId;
  label: string;
  breadcrumb: string;
  group: 'Explore' | 'Analyze' | 'Provenance';
  icon: typeof LayoutDashboard;
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    breadcrumb: 'Mission Overview',
    group: 'Explore',
    icon: LayoutDashboard,
  },
  {
    id: 'earth',
    label: 'Earth Analogs',
    breadcrumb: 'Earth Analog Testbeds',
    group: 'Explore',
    icon: Globe2,
  },
  {
    id: 'moon',
    label: 'Moon Regions',
    breadcrumb: 'Lunar Reference Regions',
    group: 'Explore',
    icon: Moon,
  },
  {
    id: 'mars',
    label: 'Mars Regions',
    breadcrumb: 'Martian Reference Regions',
    group: 'Explore',
    icon: Orbit,
  },
  {
    id: 'analogs',
    label: 'Analog Discovery',
    breadcrumb: 'Analog Discovery Workflow',
    group: 'Analyze',
    icon: Compass,
  },
  {
    id: 'rankings',
    label: 'Similarity Rankings',
    breadcrumb: 'Similarity Rankings',
    group: 'Analyze',
    icon: BarChart3,
  },
  {
    id: 'map',
    label: 'Interactive Map',
    breadcrumb: 'Planetary Spatial Map',
    group: 'Analyze',
    icon: MapIcon,
  },
  {
    id: 'analysis',
    label: 'Detailed Analysis',
    breadcrumb: 'Detailed Scientific Analysis',
    group: 'Analyze',
    icon: Microscope,
  },
  {
    id: 'catalog',
    label: 'Dataset Catalog',
    breadcrumb: 'Dataset Catalog (Stages 1–6)',
    group: 'Provenance',
    icon: Database,
  },
];

function ExobaseMark() {
  return (
    <svg
      viewBox="0 0 28 28"
      className="h-7 w-7 shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="14"
        cy="14"
        r="11.5"
        fill="none"
        stroke="#1E293B"
        strokeWidth="1.5"
      />
      <ellipse
        cx="14"
        cy="14"
        rx="11.5"
        ry="4.8"
        transform="rotate(-24 14 14)"
        fill="none"
        stroke="#06B6D4"
        strokeWidth="1.5"
      />
      <circle cx="14" cy="14" r="3.4" fill="#3B82F6" />
      <circle cx="22.8" cy="10.2" r="1.7" fill="#22D3EE" />
    </svg>
  );
}

export function SidebarNav({
  activeScreen,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
}: SidebarNavProps) {
  const groups: ('Explore' | 'Analyze' | 'Provenance')[] = ['Explore', 'Analyze', 'Provenance'];

  const renderLinks = (isCompact: boolean, isMobile = false) => (
    <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
      <div className="space-y-6">
        {groups.map((group) => {
          const items = NAV_SECTIONS.filter((item) => item.group === group);
          return (
            <div key={group}>
              {!isCompact && (
                <p className="px-2.5 pb-2 text-[11px] font-medium tracking-wider text-slate-500">
                  {group}
                </p>
              )}
              <nav aria-label={`${group} Navigation`} className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        if (isMobile) onCloseMobile();
                      }}
                      title={isCompact ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                        isCompact ? 'justify-center' : 'justify-start'
                      } ${
                        isActive
                          ? 'bg-cyan-500/12 text-cyan-300'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-50'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {!isCompact && (
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {!isCompact && (
        <div className="mt-6 border-t border-slate-800/80 pt-4 px-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <span>Planetary Analog Workbench</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Stages 1–4 &amp; 6A Regenerated · Stage 5 &amp; 6B THEMIS Pending
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:shrink-0 border-r border-slate-800 bg-[#090D16] transition-[width] duration-200 sticky top-0 h-screen ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div
          className={`flex h-16 items-center border-b border-slate-800 px-4 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 cursor-pointer"
          >
            <ExobaseMark />
            {!collapsed && (
              <span className="font-display text-base font-bold tracking-tight text-slate-50 whitespace-nowrap">
                EXOBASE
              </span>
            )}
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-100 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center border-b border-slate-800/80 py-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-100 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {renderLinks(collapsed)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-slate-800 bg-[#090D16] h-full">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
              <button
                type="button"
                onClick={() => {
                  onNavigate('overview');
                  onCloseMobile();
                }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <ExobaseMark />
                <span className="font-display text-base font-bold tracking-tight text-slate-50">
                  EXOBASE
                </span>
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation drawer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 text-slate-300 hover:text-slate-50 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderLinks(false, true)}
          </aside>
        </div>
      )}
    </>
  );
}
