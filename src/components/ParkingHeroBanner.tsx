import React, { useState } from 'react';
import { Search, Plus, Camera, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import heroImage from '../assets/images/parking_facility_hero_1790658784350.jpg';

interface ParkingHeroBannerProps {
  onSearchPlate: (plate: string) => void;
  onOpenEntryModal: () => void;
  onOpenScanner: () => void;
  onOpenAssistant: () => void;
  freeCount: number;
  occupiedCount: number;
}

export const ParkingHeroBanner: React.FC<ParkingHeroBannerProps> = ({
  onSearchPlate,
  onOpenEntryModal,
  onOpenScanner,
  onOpenAssistant,
  freeCount,
  occupiedCount,
}) => {
  const [quickPlate, setQuickPlate] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPlate.trim()) {
      onSearchPlate(quickPlate.trim());
      setQuickPlate('');
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
      {/* Background Image with Scrim */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Modern Smart Parking Facility"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/60" />
      </div>

      {/* Content */}
      <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smart Parking Boshqaruv Markazi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
            Avtomatlashtirilgan Parking va To‘lov Tizimi
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Avtomobillar kirish-chiqishini avtomatik ro‘yxatga olish, davlat raqamini aniqlash,
            turish vaqti va tarif bo‘yicha to‘lovni hisoblash.
          </p>

          {/* Quick search input */}
          <form onSubmit={handleQuickSearch} className="pt-2 flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={quickPlate}
                onChange={(e) => setQuickPlate(e.target.value)}
                placeholder="Avtomobil raqamini tekshirish (masalan: 01 A 777 AA)..."
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-md pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!quickPlate.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap"
            >
              Holatni topish
            </button>
          </form>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <button
            onClick={onOpenEntryModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Avtomobil Kirishi (+ Yangi)</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            <Camera className="w-4 h-4 text-slate-400" />
            <span>Kamera / ANPR Skaner</span>
          </button>

          <button
            onClick={onOpenAssistant}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-blue-500/30 text-blue-300 font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span>Yordamchiga murojaat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
