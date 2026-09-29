import React, { useState, useEffect } from 'react';
import { X, Car, QrCode, Camera, Check, AlertCircle } from 'lucide-react';
import { ParkingSpot, VehicleType } from '../types/parking';
import { LicensePlateBadge } from './LicensePlateBadge';
import { normalizePlateNumber, formatDateTime } from '../utils/tariffCalculator';
import { SAMPLE_DETECTED_PLATES } from '../utils/licensePlateRecognition';

interface VehicleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  freeSpots: ParkingSpot[];
  preselectedSpotId?: string;
  onConfirmEntry: (
    plateNumber: string,
    spotId: string,
    vehicleType: VehicleType,
    customEntryMinutesAgo?: number
  ) => void;
  onOpenScanner: () => void;
  initialPlate?: string;
}

export const VehicleEntryModal: React.FC<VehicleEntryModalProps> = ({
  isOpen,
  onClose,
  freeSpots,
  preselectedSpotId,
  onConfirmEntry,
  onOpenScanner,
  initialPlate = '',
}) => {
  const [plateInput, setPlateInput] = useState(initialPlate);
  const [selectedSpotId, setSelectedSpotId] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Yengil avtomobil');
  const [testTimeOffsetMinutes, setTestTimeOffsetMinutes] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialPlate) {
      setPlateInput(initialPlate);
    }
  }, [initialPlate]);

  useEffect(() => {
    if (preselectedSpotId) {
      setSelectedSpotId(preselectedSpotId);
    } else if (freeSpots.length > 0 && !selectedSpotId) {
      setSelectedSpotId(freeSpots[0].id);
    }
  }, [preselectedSpotId, freeSpots, selectedSpotId]);

  if (!isOpen) return null;

  const handlePlateChange = (val: string) => {
    setErrorMsg('');
    const formatted = normalizePlateNumber(val);
    setPlateInput(formatted);
  };

  const handleSelectSamplePlate = (samplePlate: string, sampleType: VehicleType) => {
    setPlateInput(samplePlate);
    setVehicleType(sampleType);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = plateInput.trim();
    if (!cleanPlate || cleanPlate.length < 5) {
      setErrorMsg('Iltimos, to‘liq avtomobil raqamini kiriting (masalan: 01 A 777 AA).');
      return;
    }
    if (!selectedSpotId) {
      setErrorMsg('Bo‘sh parking joyini tanlang.');
      return;
    }

    onConfirmEntry(cleanPlate, selectedSpotId, vehicleType, testTimeOffsetMinutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Avtomobil Kirishini Qayd Qilish
              </h3>
              <p className="text-xs text-slate-400">
                Kirish vaqti avtomatik belgilanadi va talon shakllanadi
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* License plate input & ANPR Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Avtomobil Davlat Raqami (License Plate)
              </label>
              <button
                type="button"
                onClick={onOpenScanner}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Kamera / ANPR orqali aniqlash</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                value={plateInput}
                onChange={(e) => handlePlateChange(e.target.value)}
                placeholder="Masalan: 01 A 777 AA"
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3.5 py-2.5 text-base font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 tracking-wider"
              />
            </div>

            {/* Live Plate Badge Preview */}
            {plateInput.trim() && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Ko‘rinishi:</span>
                <LicensePlateBadge plate={plateInput.trim()} size="md" />
              </div>
            )}

            {/* Quick sample plates for convenience */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[10px] text-slate-500 uppercase shrink-0">
                Namunalar:
              </span>
              {SAMPLE_DETECTED_PLATES.slice(0, 4).map((sample) => (
                <button
                  key={sample.plate}
                  type="button"
                  onClick={() => handleSelectSamplePlate(sample.plate, sample.vehicleType)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                >
                  {sample.plate}
                </button>
              ))}
            </div>
          </div>

          {/* Spot Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Ajratiladigan Bo‘sh Joy ({freeSpots.length} ta mavjud)
            </label>
            {freeSpots.length === 0 ? (
              <div className="p-3 rounded bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs">
                Afsuski, hozirda bo‘sh parking joyi qolmadi.
              </div>
            ) : (
              <select
                value={selectedSpotId}
                onChange={(e) => setSelectedSpotId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {freeSpots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    Joy {spot.id} (Sektor {spot.sector} · {spot.spotType})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Avtomobil Turi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Yengil avtomobil', 'Krossover / SUV', 'Yuk / Mikroavtobus'] as VehicleType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVehicleType(type)}
                    className={`py-2 px-2 text-xs rounded border transition-colors text-center ${
                      vehicleType === type
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Testing helper: simulate entry in past to test tariff calculation */}
          <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Kirish vaqti simulyatsiyasi (Tarifni sinash uchun):</span>
              <span className="font-mono text-blue-400 font-medium">
                {testTimeOffsetMinutes === 0
                  ? 'Ayni daqiqada (Hozir)'
                  : `${testTimeOffsetMinutes} daqiqa oldin`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTestTimeOffsetMinutes(0)}
                className={`px-2 py-1 text-xs rounded ${
                  testTimeOffsetMinutes === 0
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Hozir
              </button>
              <button
                type="button"
                onClick={() => setTestTimeOffsetMinutes(10)}
                className={`px-2 py-1 text-xs rounded ${
                  testTimeOffsetMinutes === 10
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                10 daq (Bepul)
              </button>
              <button
                type="button"
                onClick={() => setTestTimeOffsetMinutes(45)}
                className={`px-2 py-1 text-xs rounded ${
                  testTimeOffsetMinutes === 45
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                45 daq (5 000 so‘m)
              </button>
              <button
                type="button"
                onClick={() => setTestTimeOffsetMinutes(90)}
                className={`px-2 py-1 text-xs rounded ${
                  testTimeOffsetMinutes === 90
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                1.5 soat (8 000 so‘m)
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={freeSpots.length === 0}
              className="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-md transition-colors shadow-xs"
            >
              Kiritish va Talon Shakllantirish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
