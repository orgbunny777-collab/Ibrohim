import React from 'react';
import { Car, Camera, Plus, Clock, HelpCircle } from 'lucide-react';
import { formatTimeOnly } from '../utils/tariffCalculator';

interface NavbarProps {
  activeTab: 'dashboard' | 'map' | 'assistant' | 'history' | 'tariffs';
  setActiveTab: (tab: 'dashboard' | 'map' | 'assistant' | 'history' | 'tariffs') => void;
  onOpenEntryModal: () => void;
  onOpenScannerModal: () => void;
  currentTime: number;
  freeCount: number;
  occupiedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEntryModal,
  onOpenScannerModal,
  currentTime,
  freeCount,
  occupiedCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand element */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
            >
              AvtoPark
            </a>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-400">
              Boshqaruv Tizimi
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, clean text) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Boshqaruv Paneli
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Parking Xaritasi
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Yordamchi (AI)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Tarix va Jurnal
          </button>
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'tariffs'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Tariflar
          </button>
        </nav>

        {/* Zone 3: Primary Actions and Live Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Clock & Spots indicator */}
          <div className="hidden lg:flex items-center gap-2.5 px-2.5 py-1 rounded-md bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono tabular-nums text-slate-200">
              {formatTimeOnly(currentTime, true)}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-medium font-mono tabular-nums">
              Bo‘sh: {freeCount}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-blue-400 font-medium font-mono tabular-nums">
              Band: {occupiedCount}
            </span>
          </div>

          {/* Scanner Button */}
          <button
            onClick={onOpenScannerModal}
            title="Avtomatik raqamni aniqlash (Kamera / OCR)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Raqam Skanerlash</span>
          </button>

          {/* Main Action Button: Kirish */}
          <button
            onClick={onOpenEntryModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Kirish Qayd Qilish</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-900/95 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            activeTab === 'dashboard' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Boshqaruv
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            activeTab === 'map' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Xarita ({freeCount})
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
            activeTab === 'assistant' ? 'bg-blue-600/30 text-blue-300 font-medium' : 'text-slate-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Yordamchi
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            activeTab === 'history' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Tarix
        </button>
        <button
          onClick={() => setActiveTab('tariffs')}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            activeTab === 'tariffs' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Tariflar
        </button>
      </div>
    </header>
  );
};
