import React from 'react';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';
import { ParkingRecord } from '../types/parking';
import { LicensePlateBadge } from './LicensePlateBadge';
import { formatDateTime, formatMoney } from '../utils/tariffCalculator';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ParkingRecord | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <span className="text-xs font-semibold text-slate-300">
            Parking To‘lov Kvitansiyasi
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal style receipt paper */}
        <div className="p-6 bg-white text-slate-900 font-mono text-xs select-text">
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              AVTOPARK TIZIMI
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Toshkent shahri · Smart Parking #01
            </p>
            <p className="text-[10px] text-slate-500">
              Talon №: {record.ticketNumber}
            </p>
          </div>

          <div className="py-4 space-y-2.5 border-b border-dashed border-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Avtomobil:</span>
              <span className="font-bold text-slate-900">{record.plateNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Joy raqami:</span>
              <span className="font-bold text-slate-900">{record.spotId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Avtomobil turi:</span>
              <span className="text-slate-800">{record.vehicleType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Kirish vaqti:</span>
              <span className="text-slate-800">{formatDateTime(record.entryTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Chiqish vaqti:</span>
              <span className="text-slate-800">
                {record.exitTime ? formatDateTime(record.exitTime) : 'Parkingda'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Umumiy turish:</span>
              <span className="font-bold text-slate-900">{record.durationFormatted}</span>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-600">To‘lov summasi:</span>
              <span className="text-base font-bold text-slate-900">
                {formatMoney(record.fee)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600">Holati:</span>
              <span className="font-semibold text-emerald-700">
                {record.paymentStatus}
              </span>
            </div>
            {record.paymentMethod && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600">To‘lov usuli:</span>
                <span className="text-slate-800">{record.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Barcode / QR Simulation */}
          <div className="pt-4 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-100 border border-slate-300 rounded flex items-center justify-center p-2 mb-2">
              <QrCode className="w-16 h-16 text-slate-800" />
            </div>
            <p className="text-[9px] text-slate-500">
              Avtomatik to‘lov va chiqish tekshiruvi uchun
            </p>
            <p className="text-[8px] text-slate-400 mt-1">
              Rahmat! Xavfsiz harakatlaning!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 flex items-center justify-end gap-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Yopish
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Chop etish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
