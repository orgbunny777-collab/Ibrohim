import React from 'react';
import { getRegionFromPlate } from '../utils/licensePlateRecognition';

interface LicensePlateBadgeProps {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
  showRegionTooltip?: boolean;
}

export const LicensePlateBadge: React.FC<LicensePlateBadgeProps> = ({
  plate,
  size = 'md',
  showRegionTooltip = true,
}) => {
  const regionName = getRegionFromPlate(plate);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 h-6',
    md: 'text-sm px-2.5 py-1 gap-2 h-8',
    lg: 'text-base px-3 py-1.5 gap-2.5 h-10',
  };

  const fontSizes = {
    sm: 'text-[11px] font-bold tracking-wider',
    md: 'text-sm font-bold tracking-widest',
    lg: 'text-base font-extrabold tracking-widest',
  };

  return (
    <div
      title={showRegionTooltip && regionName ? `${regionName}` : undefined}
      className={`inline-flex items-center bg-white text-slate-900 border border-slate-300 rounded shadow-xs select-none ${sizeClasses[size]}`}
    >
      {/* Uzbek National License Plate Flag Strip */}
      <div className="flex items-center gap-1 shrink-0 border-r border-slate-300 pr-1.5">
        <svg
          viewBox="0 0 16 10"
          className={size === 'sm' ? 'w-3 h-2' : 'w-4 h-2.5'}
          aria-label="Uzbekistan flag"
        >
          <rect width="16" height="3.2" fill="#0099B5" />
          <rect y="3.2" width="16" height="0.4" fill="#CE1126" />
          <rect y="3.6" width="16" height="2.8" fill="#FFFFFF" />
          <rect y="6.4" width="16" height="0.4" fill="#CE1126" />
          <rect y="6.8" width="16" height="3.2" fill="#1EB53A" />
        </svg>
        <span className="text-[9px] font-extrabold text-blue-900 leading-none">UZ</span>
      </div>

      {/* Plate Characters */}
      <span className={`font-mono uppercase text-slate-900 ${fontSizes[size]}`}>
        {plate}
      </span>
    </div>
  );
};
