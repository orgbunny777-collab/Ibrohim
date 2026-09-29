import React, { useState } from 'react';
import { ParkingRecord } from '../types/parking';
import { LicensePlateBadge } from './LicensePlateBadge';
import {
  formatDateTime,
  formatDurationUzbek,
  formatMoney,
  calculateParkingFee,
} from '../utils/tariffCalculator';
import { Search, Download, Receipt, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface HistoryTableProps {
  records: ParkingRecord[];
  currentTime: number;
  onInitiateExit: (record: ParkingRecord) => void;
  onOpenReceipt: (record: ParkingRecord) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  currentTime,
  onInitiateExit,
  onOpenReceipt,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter records
  const filtered = records.filter((r) => {
    if (filterMode === 'active' && r.exitTime !== null) return false;
    if (filterMode === 'completed' && r.exitTime === null) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().replace(/\s+/g, '');
      const plateMatches = r.plateNumber.toUpperCase().replace(/\s+/g, '').includes(q);
      const spotMatches = r.spotId.toUpperCase().includes(q);
      if (!plateMatches && !spotMatches) return false;
    }
    return true;
  });

  const exportToCSV = () => {
    const headers = [
      'Talon No',
      'Avtomobil Raqami',
      'Joyi',
      'Avtomobil Turi',
      'Kirish Vaqti',
      'Chiqish Vaqti',
      'Turish Vaqti',
      'Tolov Summasi',
      'Tolov Holati',
      'Tolov Usuli',
    ];

    const rows = filtered.map((r) => [
      r.ticketNumber,
      r.plateNumber,
      r.spotId,
      r.vehicleType,
      formatDateTime(r.entryTime),
      r.exitTime ? formatDateTime(r.exitTime) : 'Parkingda',
      r.durationFormatted,
      `${r.fee} som`,
      r.paymentStatus,
      r.paymentMethod || '—',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `parking_hisobot_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Table controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter mode */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded border border-slate-800 text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded transition-colors ${
              filterMode === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
            }`}
          >
            Barchasi ({records.length})
          </button>
          <button
            onClick={() => setFilterMode('active')}
            className={`px-3 py-1 rounded transition-colors ${
              filterMode === 'active' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
            }`}
          >
            Faol (Parkingda: {records.filter((r) => r.exitTime === null).length})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1 rounded transition-colors ${
              filterMode === 'completed' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
            }`}
          >
            Chiqib ketganlar ({records.filter((r) => r.exitTime !== null).length})
          </button>
        </div>

        {/* Search & Export */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Raqam yoki joy bo‘yicha qidirish..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded pl-8 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={exportToCSV}
            title="CSV formatida yuklab olish"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Eksport (CSV)</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3">Avtomobil Raqami</th>
              <th className="px-3 py-3">Joyi</th>
              <th className="px-3 py-3">Kirish Vaqti</th>
              <th className="px-3 py-3">Chiqish Vaqti</th>
              <th className="px-3 py-3">Umumiy Turish Vaqti</th>
              <th className="px-3 py-3 text-right">To‘lov Summasi</th>
              <th className="px-3 py-3">To‘lov Holati</th>
              <th className="px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Mos keluvchi avtomobil yozuvlari topilmadi.
                </td>
              </tr>
            ) : (
              filtered.map((record) => {
                const isActive = record.exitTime === null;
                const durationMin = isActive
                  ? Math.max(1, Math.floor((currentTime - record.entryTime) / (60 * 1000)))
                  : record.durationMinutes;

                const liveFeeCalc = isActive ? calculateParkingFee(durationMin) : null;
                const displayFee = isActive ? liveFeeCalc!.fee : record.fee;
                const displayStatus = isActive ? liveFeeCalc!.paymentStatus : record.paymentStatus;
                const durationText = isActive
                  ? formatDurationUzbek(durationMin)
                  : record.durationFormatted;

                return (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Plate */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <LicensePlateBadge plate={record.plateNumber} size="sm" />
                        <span className="text-[10px] text-slate-500 hidden xl:inline">
                          {record.vehicleType}
                        </span>
                      </div>
                    </td>

                    {/* Spot */}
                    <td className="px-3 py-3 font-mono font-semibold text-blue-400">
                      {record.spotId}
                    </td>

                    {/* Entry Time */}
                    <td className="px-3 py-3 font-mono tabular-nums text-slate-300">
                      {formatDateTime(record.entryTime)}
                    </td>

                    {/* Exit Time */}
                    <td className="px-3 py-3 font-mono tabular-nums text-slate-300">
                      {record.exitTime ? (
                        formatDateTime(record.exitTime)
                      ) : (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Parkingda
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="px-3 py-3 font-mono tabular-nums text-slate-200">
                      {durationText}
                    </td>

                    {/* Fee */}
                    <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-slate-100">
                      {formatMoney(displayFee)}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <span
                        className={`text-[11px] font-medium ${
                          displayStatus === 'To‘langan'
                            ? 'text-emerald-400'
                            : displayStatus === 'Bepul'
                            ? 'text-blue-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {displayStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenReceipt(record)}
                          title="Kvitansiya / Chekni ko‘rish"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        {isActive && (
                          <button
                            onClick={() => onInitiateExit(record)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>Chiqish</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
