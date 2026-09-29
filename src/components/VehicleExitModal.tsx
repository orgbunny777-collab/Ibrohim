import React, { useState, useEffect } from 'react';
import { X, LogOut, CheckCircle2, DollarSign, Clock, CreditCard, Receipt, ShieldCheck } from 'lucide-react';
import { ParkingRecord, PaymentMethod } from '../types/parking';
import { LicensePlateBadge } from './LicensePlateBadge';
import {
  calculateParkingFee,
  formatDateTime,
  formatDurationUzbek,
  formatMoney,
} from '../utils/tariffCalculator';

interface VehicleExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ParkingRecord | null;
  currentTime: number;
  onConfirmExit: (
    recordId: string,
    paymentMethod: PaymentMethod,
    finalFee: number,
    finalDuration: number
  ) => void;
  onOpenReceipt: (record: ParkingRecord) => void;
}

export const VehicleExitModal: React.FC<VehicleExitModalProps> = ({
  isOpen,
  onClose,
  record,
  currentTime,
  onConfirmExit,
  onOpenReceipt,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Naqd');

  if (!isOpen || !record) return null;

  // Calculate current duration and exact fee
  const actualDurationMinutes = Math.max(
    1,
    Math.floor((currentTime - record.entryTime) / (60 * 1000))
  );

  const feeCalc = calculateParkingFee(actualDurationMinutes);
  const isFree = feeCalc.fee === 0;

  const handleConfirm = () => {
    onConfirmExit(
      record.id,
      isFree ? 'Bepul' : selectedPaymentMethod,
      feeCalc.fee,
      actualDurationMinutes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Avtomobil Chiqishi va To‘lov
              </h3>
              <p className="text-xs text-slate-400">
                To‘lov summasini hisoblash va shlagbaumni ochish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Vehicle & Spot Info */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Avtomobil raqami:</span>
              <LicensePlateBadge plate={record.plateNumber} size="md" />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block mb-1">Parking joyi:</span>
              <span className="text-base font-bold font-mono text-blue-400">
                {record.spotId}
              </span>
              <span className="block text-[10px] text-slate-500">
                {record.vehicleType}
              </span>
            </div>
          </div>

          {/* Timing details */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Kirish vaqti:</span>
              <span className="font-mono text-slate-200 font-medium">
                {formatDateTime(record.entryTime)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Chiqish vaqti:</span>
              <span className="font-mono text-slate-200 font-medium">
                {formatDateTime(currentTime)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Turgan muddati:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {formatDurationUzbek(actualDurationMinutes)}
              </span>
            </div>
          </div>

          {/* Tariff Breakdown & Total Fee */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Tarif hisob-kitobi:</span>
              <span className="text-[11px] text-blue-400 font-medium">
                {feeCalc.breakdown}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
              <span className="text-sm font-semibold text-slate-200">
                Jami to‘lov summasi:
              </span>
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  isFree ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {formatMoney(feeCalc.fee)}
              </span>
            </div>

            {isFree && (
              <p className="mt-1 text-[11px] text-emerald-400">
                * 15 daqiqagacha bo‘lgan vaqt bepul tarif bo‘yicha to‘lov talab etilmaydi.
              </p>
            )}
          </div>

          {/* Payment Method Selector (if not free) */}
          {!isFree && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                To‘lov usulini tanlang:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Naqd', 'Humo / Uzcard', 'Click / Payme'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`py-2 px-3 text-xs rounded border transition-colors flex items-center justify-center gap-1.5 ${
                      selectedPaymentMethod === method
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{method}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isFree ? 'Shlagbaumni ochish (Bepul)' : 'To‘lovni qabul qilish va Ochish'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
