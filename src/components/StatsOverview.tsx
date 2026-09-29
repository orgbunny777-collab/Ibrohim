import React from 'react';
import { CheckCircle2, AlertCircle, ArrowUpRight, DollarSign, Clock, ParkingSquare } from 'lucide-react';
import { formatMoney } from '../utils/tariffCalculator';

interface StatsOverviewProps {
  totalSpots: number;
  freeSpotsCount: number;
  occupiedSpotsCount: number;
  currentPendingFeeTotal: number;
  todayPaidTotal: number;
  activeCarsCount: number;
  onFilterFree: () => void;
  onFilterOccupied: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalSpots,
  freeSpotsCount,
  occupiedSpotsCount,
  currentPendingFeeTotal,
  todayPaidTotal,
  activeCarsCount,
  onFilterFree,
  onFilterOccupied,
}) => {
  const occupancyPercentage = Math.round((occupiedSpotsCount / totalSpots) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Bo'sh joylar */}
      <div
        onClick={onFilterFree}
        role="button"
        tabIndex={0}
        className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-600/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Bo‘sh Joylar</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400">
            {freeSpotsCount}
          </span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            / {totalSpots} jami
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400 group-hover:text-emerald-400 transition-colors">
          Avtomobillar uchun ochiq
        </p>
      </div>

      {/* 2. Band joylar */}
      <div
        onClick={onFilterOccupied}
        role="button"
        tabIndex={0}
        className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-600/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Band Joylar</span>
          <span className="text-xs font-mono text-blue-400 tabular-nums font-semibold">
            {occupancyPercentage}%
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-400">
            {occupiedSpotsCount}
          </span>
          <span className="text-xs text-slate-500">ta avtomobil</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400 group-hover:text-blue-400 transition-colors">
          Hozirda to‘xtab turgan
        </p>
      </div>

      {/* 3. Faol to'lov summasi (Kutilayotgan) */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Kutilayotgan To‘lov</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-400">
          {formatMoney(currentPendingFeeTotal)}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Hozirgi hisoblangan miqdor
        </p>
      </div>

      {/* 4. Bugungi yig'ilgan tushum */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Bugungi Tushum</span>
          <DollarSign className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
          {formatMoney(todayPaidTotal)}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Chiqishda to‘langan
        </p>
      </div>

      {/* 5. Tarif rejasi qisqacha */}
      <div className="col-span-2 md:col-span-4 lg:col-span-1 p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-400">Joriy Tarif</span>
          <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
            Standart
          </span>
        </div>
        <div className="text-xs space-y-1 text-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">0 - 15 daq:</span>
            <span className="text-emerald-400 font-semibold">Bepul</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">1-soat:</span>
            <span className="font-mono tabular-nums font-semibold">5 000 so‘m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Keyingi har soat:</span>
            <span className="font-mono tabular-nums font-semibold">+3 000 so‘m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
