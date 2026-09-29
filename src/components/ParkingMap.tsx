import React, { useState } from 'react';
import { ParkingRecord, ParkingSpot } from '../types/parking';
import { LicensePlateBadge } from './LicensePlateBadge';
import { calculateParkingFee, formatDurationUzbek, formatMoney, formatTimeOnly } from '../utils/tariffCalculator';
import { Car, Plus, LogOut, Search, Filter, ShieldCheck } from 'lucide-react';

interface ParkingMapProps {
  spots: ParkingSpot[];
  records: ParkingRecord[];
  currentTime: number;
  onSelectFreeSpot: (spotId: string) => void;
  onSelectOccupiedSpot: (record: ParkingRecord) => void;
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  spots,
  records,
  currentTime,
  onSelectFreeSpot,
  onSelectOccupiedSpot,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'free' | 'occupied'>('all');
  const [selectedSector, setSelectedSector] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter spots
  const filteredSpots = spots.filter((spot) => {
    if (filterType === 'free' && spot.isOccupied) return false;
    if (filterType === 'occupied' && !spot.isOccupied) return false;
    if (selectedSector !== 'all' && spot.sector !== selectedSector) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().replace(/\s+/g, '');
      const spotIdMatches = spot.id.replace('-', '').includes(q) || spot.id.includes(q);
      const plateMatches =
        spot.currentVehiclePlate &&
        spot.currentVehiclePlate.toUpperCase().replace(/\s+/g, '').includes(q);
      if (!spotIdMatches && !plateMatches) return false;
    }

    return true;
  });

  const getRecordForSpot = (spot: ParkingSpot): ParkingRecord | undefined => {
    if (!spot.isOccupied || !spot.currentVehiclePlate) return undefined;
    return records.find(
      (r) => r.spotId === spot.id && r.exitTime === null
    );
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Holat:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterType === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Barchasi ({spots.length})
          </button>
          <button
            onClick={() => setFilterType('free')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterType === 'free'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Bo‘sh ({spots.filter((s) => !s.isOccupied).length})
          </button>
          <button
            onClick={() => setFilterType('occupied')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterType === 'occupied'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            Band ({spots.filter((s) => s.isOccupied).length})
          </button>
        </div>

        {/* Sector Tabs and Search */}
        <div className="flex items-center gap-2">
          {/* Sector filter */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedSector('all')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedSector === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Jami
            </button>
            <button
              onClick={() => setSelectedSector('A')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedSector === 'A' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Sektor A
            </button>
            <button
              onClick={() => setSelectedSector('B')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedSector === 'B' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Sektor B
            </button>
            <button
              onClick={() => setSelectedSector('C')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedSector === 'C' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Sektor C
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-40 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Joy yoki raqam..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded pl-8 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of spots */}
      {filteredSpots.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
          <p className="text-sm">Tanlangan filtr bo‘yicha parking joyi topilmadi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredSpots.map((spot) => {
            const activeRec = getRecordForSpot(spot);
            const durationMin = activeRec
              ? Math.max(1, Math.floor((currentTime - activeRec.entryTime) / (60 * 1000)))
              : 0;
            const feeCalc = activeRec ? calculateParkingFee(durationMin) : null;

            if (!spot.isOccupied) {
              return (
                <div
                  key={spot.id}
                  onClick={() => onSelectFreeSpot(spot.id)}
                  className="group relative p-3 bg-slate-900/90 border border-emerald-900/40 hover:border-emerald-500/80 rounded-lg transition-all cursor-pointer flex flex-col justify-between min-h-[140px] hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {spot.id}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="my-2 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-emerald-400 tracking-wider">
                      BO‘SH
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {spot.spotType}
                    </span>
                  </div>

                  <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[11px] text-slate-400 group-hover:text-emerald-300 transition-colors">
                    <Plus className="w-3 h-3" />
                    <span>Avtomobil kiritish</span>
                  </div>
                </div>
              );
            }

            // Occupied Spot Card
            return (
              <div
                key={spot.id}
                onClick={() => activeRec && onSelectOccupiedSpot(activeRec)}
                className="group relative p-3 bg-slate-900 border border-blue-900/50 hover:border-blue-500/80 rounded-lg transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold font-mono text-blue-400">
                      {spot.id}
                    </span>
                    {spot.spotType === 'VIP' && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-medium">
                        VIP
                      </span>
                    )}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>

                <div className="my-1.5 space-y-1">
                  <div className="flex justify-center">
                    <LicensePlateBadge
                      plate={spot.currentVehiclePlate || '---'}
                      size="sm"
                    />
                  </div>

                  {activeRec && (
                    <div className="text-center text-[10px] text-slate-400 space-y-0.5">
                      <div className="font-mono tabular-nums text-slate-300">
                        {formatDurationUzbek(durationMin)}
                      </div>
                      <div className="font-semibold text-amber-400 font-mono tabular-nums">
                        {feeCalc ? formatMoney(feeCalc.fee) : '0 so‘m'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full pt-2 border-t border-slate-800 flex items-center justify-center gap-1 text-[11px] text-blue-400 group-hover:text-blue-300 transition-colors">
                  <LogOut className="w-3 h-3" />
                  <span>Chiqarish / To‘lov</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
