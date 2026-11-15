import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  FEATURE_DEFINITIONS,
  getCatalogByMode,
  PRIMARY_DATASETS,
  type CatalogMode,
} from './src/shared/planetaryData.ts';
import {
  computeSimilarityAnalysis,
  type GroupWeights,
} from './src/shared/similarityEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function parseCatalogMode(raw?: string): CatalogMode {
  if (raw === 'staged-hybrid' || raw === 'demo' || raw === 'verified-terrain') {
    return raw;
  }
  return 'verified-terrain';
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'exobase-engine' });
  });

  app.get('/api/datasets', (req, res) => {
    const mode = parseCatalogMode(req.query.mode as string | undefined);
    const { regions, earthSites } = getCatalogByMode(mode);
    res.json({
      catalogMode: mode,
      datasets: PRIMARY_DATASETS,
      regions,
      earthSites,
      featureDefinitions: FEATURE_DEFINITIONS,
    });
  });

  app.post('/api/analyze', (req, res) => {
    try {
      const { regionId, candidateIds, weights, catalogMode } = req.body as {
        regionId?: string;
        candidateIds?: string[];
        weights?: Partial<GroupWeights>;
        catalogMode?: string;
      };

      const mode = parseCatalogMode(catalogMode);
      const { regions } = getCatalogByMode(mode);

      if (!regionId || !regions.some((r) => r.id === regionId)) {
        res.status(400).json({ error: 'Invalid or missing planetary regionId.' });
        return;
      }

      const analysis = computeSimilarityAnalysis(regionId, candidateIds, weights, mode);
      res.json(analysis);
    } catch (error) {
      console.error('Analysis computation error:', error);
      res.status(500).json({ error: 'Failed to compute similarity analysis.' });
    }
  });

  app.post('/api/explain', async (req, res) => {
    try {
      const { regionId, candidateId, weights, catalogMode } = req.body as {
        regionId?: string;
        candidateId?: string;
        weights?: Partial<GroupWeights>;
        catalogMode?: string;
      };

      if (!regionId || !candidateId) {
        res.status(400).json({ error: 'Both regionId and candidateId are required.' });
        return;
      }

      const mode = parseCatalogMode(catalogMode);
      const analysis = computeSimilarityAnalysis(regionId, undefined, weights, mode);
      const match = analysis.results.find((r) => r.candidate.id === candidateId);
      if (!match) {
        res.status(404).json({ error: 'Candidate analog site not found.' });
        return;
      }

      const ai = getGeminiClient();

      const telemetrySummary = {
        catalogMode: analysis.catalogMode,
        planetaryTarget: {
          planet: analysis.targetRegion.planet.toUpperCase(),
          region: analysis.targetRegion.name,
          geologicalClass: analysis.targetRegion.geologicalClass,
          coordinates: analysis.targetRegion.coordinatesLabel,
          datasetsUsed: analysis.targetRegion.datasetsUsed,
          terrainProvenance: analysis.targetRegion.terrainProvenance,
        },
        earthCandidate: {
          name: match.candidate.name,
          country: match.candidate.country,
          biome: match.candidate.biome,
          coordinates: match.candidate.coordinatesLabel,
          datasetsUsed: match.candidate.datasetsUsed,
          terrainProvenance: match.candidate.terrainProvenance,
        },
        deterministicScoring: {
          rank: match.rank,
          totalCandidatesEvaluated: analysis.results.length,
          relativeRankingScoreOutOf100: Number(match.similarityScore.toFixed(2)),
          weightedEuclideanDistance: Number(match.euclideanDistance.toFixed(4)),
          weightsApplied: {
            terrainPct: Math.round(analysis.normalizedWeights.terrain * 100),
            thermalPct: Math.round(analysis.normalizedWeights.thermal * 100),
            surfacePct: Math.round(analysis.normalizedWeights.surface * 100),
          },
          groupContributionsPct: {
            terrain: Number(match.groupBreakdown.terrain.contributionSharePct.toFixed(1)),
            thermal: Number(match.groupBreakdown.thermal.contributionSharePct.toFixed(1)),
            surface: Number(match.groupBreakdown.surface.contributionSharePct.toFixed(1)),
          },
        },
        featureDeltas: match.featureDetails.map((f) => ({
          feature: f.label,
          unit: f.unit,
          provenanceStatus: f.status,
          targetValue: f.targetRaw,
          earthValue: f.candidateRaw,
          normalizedDiff: Number(f.normDiff.toFixed(3)),
          penaltyContributionPct: Number(f.contributionSharePct.toFixed(1)),
        })),
      };

      const prompt = [
        'Analyze the deterministic planetary analog comparison below and explain the computed results.',
        'Important: Treat the supplied relativeRankingScoreOutOf100, Euclidean Distance, and feature deltas as exact algorithmic outputs from the EXOBASE Weighted Euclidean Distance engine. Explicitly frame the similarity score as a relative ranking indicator over the current feature set — NOT a probability, confidence percentage, or independently validated scientific analog conclusion. Note explicitly if catalogMode is verified-terrain (Stages 1-3 reproducibly regenerated terrain only at 100% weight, with thermal/surface Stages 4-6 excluded until processed and validated), staged-hybrid, or demo.',
        JSON.stringify(telemetrySummary, null, 2),
      ].join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a planetary geologist and space mission site-selection analyst assisting researchers using EXOBASE. Provide concise, empirically grounded explanations linking the exact computed feature distances to field-testing suitability for rover mobility, geological sampling, and thermal/instrument calibration. Respect provenance status strictly: clearly distinguish reproducibly Regenerated DEM/LOLA/MOLA terrain metrics from Pending thermal/emissivity datasets or Demo estimates, and never present algorithmic similarity scores as probabilities or independently validated scientific conclusions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description:
                  '2-3 sentences explaining why this Earth location achieved its relative ranking score and rank under the current feature set (without framing it as a probability or validated conclusion).',
              },
              geologicalCorrespondence: {
                type: Type.STRING,
                description:
                  '2-3 sentences comparing geomorphology, lithology, and surface processes between the Earth analog and planetary region.',
              },
              roverMobilityInsight: {
                type: Type.STRING,
                description:
                  'Concrete assessment for rover traction, slope traversal, and obstacle/roughness testing based on slope, roughness, and relief deltas.',
              },
              thermalInstrumentInsight: {
                type: Type.STRING,
                description:
                  'Note explicitly that Stages 4-6 thermal/emissivity datasets (MODIS, ASTER, Diviner, THEMIS) are excluded/Pending when in terrain-only mode, or assess pending baseline inputs in hybrid mode.',
              },
              geologicalSamplingInsight: {
                type: Type.STRING,
                description:
                  'Assessment for drilling, regolith mechanics, spectroscopy, or astrobiology sampling experiments.',
              },
              scientificCaveats: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  '2-3 key physical differences, unvalidated algorithmic limitations, or dataset resolution/provenance caveats researchers must account for.',
              },
            },
            required: [
              'executiveSummary',
              'geologicalCorrespondence',
              'roverMobilityInsight',
              'thermalInstrumentInsight',
              'geologicalSamplingInsight',
              'scientificCaveats',
            ],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Gemini returned an empty explanation response.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json({
        explanation: parsed,
        telemetrySummary,
        model: 'gemini-4-hydrogen',
      });
    } catch (error) {
      console.error('Gemini explanation error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to generate AI mission explanation.';
      res.status(500).json({ error: message });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EXOBASE server running at http://localhost:${PORT}`);
  });
}

startServer();
