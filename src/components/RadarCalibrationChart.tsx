import { useState } from 'react';
import type { PlanetId } from '../shared/planetaryData';
import type { FeatureComparisonDetail } from '../shared/similarityEngine';

interface RadarCalibrationChartProps {
  features: FeatureComparisonDetail[];
  planet: PlanetId;
  targetName: string;
  candidateName: string;
}

export function RadarCalibrationChart({
  features,
  planet,
  targetName,
  candidateName,
}: RadarCalibrationChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const size = 440;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 148;
  const rings = [0.25, 0.5, 0.75, 1.0];
  const count = features.length;

  if (count < 3) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-slate-800/80 bg-[#07090E]/60 p-6 text-center text-xs text-slate-400">
        <p className="font-mono text-slate-300">
          Radar geometry requires at least 3 active features (currently {count}).
        </p>
      </div>
    );
  }

  const targetStroke = planet === 'mars' ? '#F59E0B' : '#CBD5E1';
  const targetFill = planet === 'mars' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(203, 213, 225, 0.16)';

  const getPoint = (idx: number, normVal: number) => {
    const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
    const r = normVal * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
    };
  };

  const targetPoints = features.map((f, i) => getPoint(i, f.targetNorm));
  const candidatePoints = features.map((f, i) => getPoint(i, f.candidateNorm));

  const toPolygonStr = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const hoveredFeature = hoveredIdx !== null ? features[hoveredIdx] : null;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[440px] select-none"
        role="img"
        aria-label={`Normalized feature calibration radar chart comparing ${targetName} and ${candidateName}`}
      >
        {/* Concentric grid rings */}
        {rings.map((ring) => {
          const pts = features.map((_, i) => getPoint(i, ring));
          return (
            <polygon
              key={ring}
              points={toPolygonStr(pts)}
              fill="none"
              stroke="#1E293B"
              strokeWidth={1}
            />
          );
        })}

        {/* Radial axes and labels */}
        {features.map((f, i) => {
          const outer = getPoint(i, 1.0);
          const labelPt = getPoint(i, 1.19);
          const isHovered = hoveredIdx === i;

          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (Math.cos(outer.angle) > 0.25) textAnchor = 'start';
          else if (Math.cos(outer.angle) < -0.25) textAnchor = 'end';

          return (
            <g key={f.key}>
              <line
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke={isHovered ? '#06B6D4' : '#1E293B'}
                strokeWidth={isHovered ? 1.5 : 1}
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className={`font-mono text-[10px] transition-colors ${
                  isHovered ? 'fill-cyan-300 font-semibold' : 'fill-slate-400'
                }`}
              >
                {f.shortLabel}
              </text>
            </g>
          );
        })}

        {/* Ring scale values */}
        {rings.map((ring) => (
          <text
            key={`lbl-${ring}`}
            x={cx + 4}
            y={cy - ring * radius + 10}
            className="fill-slate-600 font-mono text-[9px]"
          >
            {ring.toFixed(2)}
          </text>
        ))}

        {/* Planetary Target Polygon */}
        <polygon
          points={toPolygonStr(targetPoints)}
          fill={targetFill}
          stroke={targetStroke}
          strokeWidth={2}
        />

        {/* Earth Candidate Polygon */}
        <polygon
          points={toPolygonStr(candidatePoints)}
          fill="rgba(6, 182, 212, 0.20)"
          stroke="#06B6D4"
          strokeWidth={2}
        />

        {/* Interactive Vertex Hotspots */}
        {features.map((f, i) => {
          const tp = targetPoints[i];
          const cp = candidatePoints[i];
          const outer = getPoint(i, 1.05);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={`pts-${f.key}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-crosshair"
            >
              <line
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="transparent"
                strokeWidth={18}
              />
              <circle
                cx={tp.x}
                cy={tp.y}
                r={isHovered ? 5 : 3.5}
                fill={targetStroke}
                stroke="#07090E"
                strokeWidth={1.5}
              />
              <circle
                cx={cp.x}
                cy={cp.y}
                r={isHovered ? 5 : 3.5}
                fill="#06B6D4"
                stroke="#07090E"
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>

      {/* Legend & Live Coordinate Readout */}
      <div className="mt-2 flex w-full flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <span
              className="inline-block h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: targetStroke }}
            />
            <span className="truncate max-w-[140px]">{targetName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-cyan-500" />
            <span className="truncate max-w-[140px]">{candidateName}</span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-400">
          {hoveredFeature ? (
            <span>
              {hoveredFeature.shortLabel}:{' '}
              <span className="text-slate-200">
                {hoveredFeature.targetRaw.toFixed(hoveredFeature.precision)}
              </span>{' '}
              vs{' '}
              <span className="text-cyan-400">
                {hoveredFeature.candidateRaw.toFixed(hoveredFeature.precision)}
              </span>{' '}
              {hoveredFeature.unit}
            </span>
          ) : (
            <span>Hover axis vertex to inspect raw telemetry</span>
          )}
        </div>
      </div>
    </div>
  );
}
