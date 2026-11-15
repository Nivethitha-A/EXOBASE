import { Globe } from 'lucide-react';
import { useState } from 'react';
import earthAnalogImg from '../assets/images/earth_analog_basin_1794635707364.jpg';
import lunarOrbitalImg from '../assets/images/lunar_orbital_terrain_1794635706395.jpg';
import marsOrbitalImg from '../assets/images/mars_orbital_terrain_1794635705590.jpg';

export const ORBITAL_ASSETS = {
  mars: marsOrbitalImg,
  moon: lunarOrbitalImg,
  earth: earthAnalogImg,
} as const;

interface OrbitalImageProps {
  kind: 'mars' | 'moon' | 'earth';
  alt: string;
  className?: string;
  caption?: string;
}

export function OrbitalImage({
  kind,
  alt,
  className = '',
  caption,
}: OrbitalImageProps) {
  const [hasError, setHasError] = useState(false);

  const fallbackGradient =
    kind === 'mars'
      ? 'from-amber-950/80 via-stone-900 to-[#0B0E17]'
      : kind === 'moon'
      ? 'from-slate-800/80 via-slate-900 to-[#0B0E17]'
      : 'from-cyan-950/70 via-slate-900 to-[#0B0E17]';

  return (
    <div className={`relative overflow-hidden bg-[#0B0E17] ${className}`}>
      {!hasError ? (
        <img
          src={ORBITAL_ASSETS[kind]}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${fallbackGradient} p-6 text-center`}
        >
          <Globe className="h-8 w-8 text-slate-400" />
          <p className="mt-2 text-xs font-mono text-slate-400">{alt}</p>
        </div>
      )}
      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-3">
          <p className="text-xs font-mono text-slate-200">{caption}</p>
        </div>
      )}
    </div>
  );
}
