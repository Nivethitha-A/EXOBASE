import type { ProvenanceStatus } from '../shared/planetaryData';

export function StatusText({
  status,
  label,
  className = '',
}: {
  status: ProvenanceStatus;
  label?: string;
  className?: string;
}) {
  const glyph =
    status === 'Regenerated' ? '●' : status === 'Pending' ? '▲' : '○';
  const color =
    status === 'Regenerated'
      ? 'text-emerald-400'
      : status === 'Pending'
      ? 'text-amber-400'
      : 'text-slate-400';

  return (
    <span className={`font-mono whitespace-nowrap ${color} ${className}`}>
      {glyph} {label ?? status}
    </span>
  );
}

export function formatMetric(
  value: number | null | undefined,
  precision: number,
  unit?: string
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Pending';
  }
  return unit ? `${value.toFixed(precision)} ${unit}` : value.toFixed(precision);
}
