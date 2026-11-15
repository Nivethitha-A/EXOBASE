import { useCallback, useEffect, useRef, useState } from 'react';
import { AnalogDiscoveryScreen } from './components/AnalogDiscoveryScreen';
import { DetailedAnalysisScreen } from './components/DetailedAnalysisScreen';
import { InteractiveMapScreen } from './components/InteractiveMapScreen';
import { OverviewScreen } from './components/OverviewScreen';
import { RegionSelectionScreen } from './components/RegionSelectionScreen';
import { SimilarityResultsScreen } from './components/SimilarityResultsScreen';
import { TopNav } from './components/TopNav';
import {
  getCatalogByMode,
  type CatalogMode,
  type PlanetId,
} from './shared/planetaryData';
import {
  computeSimilarityAnalysis,
  DEFAULT_GROUP_WEIGHTS,
  type GroupWeights,
  type SimilarityAnalysisResponse,
} from './shared/similarityEngine';
import type { ScreenId } from './types/app';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('overview');
  const [catalogMode, setCatalogMode] = useState<CatalogMode>('verified-terrain');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>('mars');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('mars-jezero');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(() =>
    getCatalogByMode('verified-terrain').earthSites.map((s) => s.id)
  );
  const [weights, setWeights] = useState<GroupWeights>({ ...DEFAULT_GROUP_WEIGHTS });

  const [analysis, setAnalysis] = useState<SimilarityAnalysisResponse>(() =>
    computeSimilarityAnalysis(
      'mars-jezero',
      getCatalogByMode('verified-terrain').earthSites.map((s) => s.id),
      DEFAULT_GROUP_WEIGHTS,
      'verified-terrain'
    )
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    () => analysis.results[0]?.candidate.id ?? 'earth-atacama'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const analysisReqIdRef = useRef<number>(0);

  const { regions } = getCatalogByMode(catalogMode);
  const activeRegion = regions.find((r) => r.id === selectedRegionId) ?? regions[0];

  const runServerAnalysis = useCallback(
    async (
      regionIdToRun: string,
      candidateIdsToRun: string[],
      weightsToRun: GroupWeights,
      modeToRun: CatalogMode,
      navigateTo?: ScreenId
    ) => {
      const requestId = ++analysisReqIdRef.current;
      setIsAnalyzing(true);
      setAnalysisError(null);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            regionId: regionIdToRun,
            candidateIds: candidateIdsToRun,
            weights: weightsToRun,
            catalogMode: modeToRun,
          }),
        });
        const rawText = await res.text();
        const data = (rawText ? JSON.parse(rawText) : {}) as SimilarityAnalysisResponse & {
          error?: string;
        };
        if (requestId !== analysisReqIdRef.current) return;
        if (!res.ok) {
          throw new Error(data.error || 'Similarity calculation failed.');
        }
        setAnalysis(data);
        if (
          !data.results.some((r) => r.candidate.id === selectedCandidateId) &&
          data.results[0]
        ) {
          setSelectedCandidateId(data.results[0].candidate.id);
        } else if (navigateTo === 'rankings' && data.results[0]) {
          setSelectedCandidateId(data.results[0].candidate.id);
        }
        if (navigateTo) {
          setActiveScreen(navigateTo);
        }
      } catch (err) {
        if (requestId !== analysisReqIdRef.current) return;
        setAnalysisError(
          err instanceof Error ? err.message : 'Unable to compute similarity rankings.'
        );
      } finally {
        if (requestId === analysisReqIdRef.current) {
          setIsAnalyzing(false);
        }
      }
    },
    [selectedCandidateId]
  );

  useEffect(() => {
    runServerAnalysis(
      'mars-jezero',
      selectedCandidateIds,
      DEFAULT_GROUP_WEIGHTS,
      'verified-terrain'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeCatalogMode = (nextMode: CatalogMode) => {
    setCatalogMode(nextMode);
    runServerAnalysis(selectedRegionId, selectedCandidateIds, weights, nextMode);
  };

  const handleChangePlanet = (planet: PlanetId) => {
    setSelectedPlanet(planet);
    const firstRegion = getCatalogByMode(catalogMode).regions.find(
      (r) => r.planet === planet
    );
    if (firstRegion) {
      setSelectedRegionId(firstRegion.id);
      runServerAnalysis(firstRegion.id, selectedCandidateIds, weights, catalogMode);
    }
  };

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    const region = getCatalogByMode(catalogMode).regions.find((r) => r.id === regionId);
    if (region) {
      setSelectedPlanet(region.planet);
    }
    runServerAnalysis(regionId, selectedCandidateIds, weights, catalogMode);
  };

  const handleToggleCandidate = (siteId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  const handleInspectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActiveScreen('analysis');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-slate-100">
      <TopNav activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {analysisError && (
        <div
          role="alert"
          className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200"
        >
          {analysisError}
        </div>
      )}

      <main className="flex-1">
        {activeScreen === 'overview' && (
          <OverviewScreen
            selectedPlanet={selectedPlanet}
            catalogMode={catalogMode}
            onChangeCatalogMode={handleChangeCatalogMode}
            onSelectPlanetAndExplore={(planet) => {
              handleChangePlanet(planet);
              setActiveScreen('regions');
            }}
            onQuickStartAnalysis={(planet) => {
              const firstRegion = getCatalogByMode(catalogMode).regions.find(
                (r) => r.planet === planet
              );
              const regionId = firstRegion?.id ?? selectedRegionId;
              setSelectedPlanet(planet);
              setSelectedRegionId(regionId);
              runServerAnalysis(
                regionId,
                selectedCandidateIds,
                weights,
                catalogMode,
                'rankings'
              );
            }}
          />
        )}

        {activeScreen === 'regions' && (
          <RegionSelectionScreen
            catalogMode={catalogMode}
            selectedPlanet={selectedPlanet}
            selectedRegionId={selectedRegionId}
            onChangePlanet={handleChangePlanet}
            onSelectRegion={handleSelectRegion}
            onProceedToAnalogs={() => setActiveScreen('analogs')}
          />
        )}

        {activeScreen === 'analogs' && (
          <AnalogDiscoveryScreen
            catalogMode={catalogMode}
            targetRegion={activeRegion}
            selectedCandidateIds={selectedCandidateIds}
            weights={weights}
            isAnalyzing={isAnalyzing}
            onChangeCatalogMode={handleChangeCatalogMode}
            onToggleCandidate={handleToggleCandidate}
            onSelectAllCandidates={setSelectedCandidateIds}
            onChangeWeights={setWeights}
            onRunAnalysis={() =>
              runServerAnalysis(
                selectedRegionId,
                selectedCandidateIds,
                weights,
                catalogMode,
                'rankings'
              )
            }
          />
        )}

        {activeScreen === 'rankings' && (
          <SimilarityResultsScreen
            analysis={analysis}
            selectedCandidateId={selectedCandidateId}
            onInspectCandidate={handleInspectCandidate}
            onViewMap={() => setActiveScreen('map')}
            onReconfigure={() => setActiveScreen('analogs')}
          />
        )}

        {activeScreen === 'map' && (
          <InteractiveMapScreen
            analysis={analysis}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
            onOpenDetailedAnalysis={handleInspectCandidate}
          />
        )}

        {activeScreen === 'analysis' && (
          <DetailedAnalysisScreen
            analysis={analysis}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
          />
        )}
      </main>

      <footer className="mt-12 border-t border-slate-800/80 bg-[#07090E] py-6">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            EXOBASE · Planetary Analog Discovery &amp; Mission Site Planner · Research-support
            shortlisting tool
          </p>
          <p className="font-mono text-[11px] text-slate-500">
            Regenerated (Stages 1–3): Copernicus GLO-90 (Open-Meteo API) · LRO LOLA · MGS MOLA ·
            Pending (Stages 4–6): Earth MODIS · Earth ASTER · Moon Diviner &amp; Mars THEMIS
          </p>
        </div>
      </footer>
    </div>
  );
}
