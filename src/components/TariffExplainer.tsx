import React, { useState } from 'react';
import { calculateParkingFee, formatDurationUzbek, formatMoney } from '../utils/tariffCalculator';
import { Clock, ShieldCheck, CheckCircle2, Calculator, Info } from 'lucide-react';

export const TariffExplainer: React.FC = () => {
  const [sliderMinutes, setSliderMinutes] = useState(45);

  const feeResult = calculateParkingFee(sliderMinutes);

  const presetExamples = [
    { mins: 10, label: '10 daqiqa (Kutish)' },
    { mins: 15, label: '15 daqiqa (Chegara)' },
    { mins: 40, label: '40 daqiqa (1-soat)' },
    { mins: 60, label: '60 daqiqa (To‘liq 1-soat)' },
    { mins: 75, label: '1 soat 15 daq (2-soat)' },
    { mins: 140, label: '2 soat 20 daq (3-soat)' },
    { mins: 300, label: '5 soat (Uzoq turish)' },
  ];

  return (
    <div className="space-y-6">
      {/* Official Tariff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Free Grace */}
        <div className="p-5 rounded-lg bg-slate-900 border border-emerald-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              BEPUL DAVR
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">
            0 so‘m
          </div>
          <p className="text-xs font-medium text-slate-300 mb-2">
            15 daqiqagacha bo‘lgan vaqt
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Yo‘lovchilarni kutib olish yoki tushirish uchun qisqa muddatli kirish mutlaqo bepul.
          </p>
        </div>

        {/* Tier 2: First Hour */}
        <div className="p-5 rounded-lg bg-slate-900 border border-blue-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
              BIRINCHI 1 SOAT
            </span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mb-1">
            5 000 so‘m
          </div>
          <p className="text-xs font-medium text-slate-300 mb-2">
            16 daqiqadan 60 daqiqagacha
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            15 daqiqadan oshgach, birinchi to‘liq yoki boshlangan 1 soat uchun qat’iy narx.
          </p>
        </div>

        {/* Tier 3: Additional Hours */}
        <div className="p-5 rounded-lg bg-slate-900 border border-purple-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">
              KEYINGI HAR BIR SOAT
            </span>
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mb-1">
            +3 000 so‘m
          </div>
          <p className="text-xs font-medium text-slate-300 mb-2">
            60 daqiqadan keyingi har soat
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Har bir keyingi to‘liq yoki boshlangan soat uchun 3 000 so‘mdan qo‘shib hisoblanadi.
          </p>
        </div>
      </div>

      {/* Interactive Fee Simulator */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Interaktiv Tarif Kalkulyatori va Simulyatori
              </h3>
              <p className="text-xs text-slate-400">
                Vaqtni o‘zgartirib, aniq to‘lov summasi hisob-kitobini tekshiring
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Hisoblangan to‘lov:</span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {formatMoney(feeResult.fee)}
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Turish muddati:</span>
            <span className="font-mono text-base font-bold text-white tabular-nums">
              {formatDurationUzbek(sliderMinutes)} ({sliderMinutes} daqiqa)
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={sliderMinutes}
            onChange={(e) => setSliderMinutes(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0 daq</span>
            <span>1 soat (60 daq)</span>
            <span>2 soat (120 daq)</span>
            <span>4 soat (240 daq)</span>
            <span>6 soat (360 daq)</span>
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <span className="text-xs text-slate-400 block mb-2">Tezkor namunalar:</span>
          <div className="flex flex-wrap gap-2">
            {presetExamples.map((ex) => (
              <button
                key={ex.mins}
                onClick={() => setSliderMinutes(ex.mins)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  sliderMinutes === ex.mins
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation breakdown explanation */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md text-xs text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Hisob-kitob tafsiloti: </span>
            <span>{feeResult.breakdown}</span>
            <span className="block mt-1 text-slate-400">
              To‘lov holati: <strong className="text-slate-200">{feeResult.paymentStatus}</strong> ·
              Faturalangan soat: <strong className="text-slate-200">{feeResult.hoursBilled} soat</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
