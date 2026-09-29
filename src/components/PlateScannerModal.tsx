import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, RefreshCw, Check, AlertCircle, Scan, Sparkles } from 'lucide-react';
import { SAMPLE_DETECTED_PLATES, SamplePlateScenario } from '../utils/licensePlateRecognition';
import { LicensePlateBadge } from './LicensePlateBadge';

interface PlateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlateRecognized: (plate: string, scenario?: SamplePlateScenario) => void;
}

export const PlateScannerModal: React.FC<PlateScannerModalProps> = ({
  isOpen,
  onClose,
  onPlateRecognized,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedPlate, setDetectedPlate] = useState<SamplePlateScenario | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Default to first scenario
      setDetectedPlate(SAMPLE_DETECTED_PLATES[0]);
    }
  }, [isOpen]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useWebcam && isOpen) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setWebcamError(null);
        })
        .catch((err) => {
          setWebcamError('Kameraga ulanish imkoni bo‘lmadi yoki ruxsat berilmadi.');
          setUseWebcam(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useWebcam, isOpen]);

  if (!isOpen) return null;

  const currentScenario = SAMPLE_DETECTED_PLATES[selectedScenarioIndex];

  const handleSimulateScan = (index: number) => {
    setSelectedScenarioIndex(index);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setDetectedPlate(SAMPLE_DETECTED_PLATES[index]);
    }, 600);
  };

  const handleUsePlate = () => {
    if (detectedPlate) {
      onPlateRecognized(detectedPlate.plate, detectedPlate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Avtomobil Raqamini Aniqlash (ANPR Kamera)
              </h3>
              <p className="text-xs text-slate-400">
                Kirish / Chiqish shlagbaumidagi avtomatik optik skaner
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

        {/* Scanner Viewport */}
        <div className="p-5 space-y-4">
          <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
            {useWebcam ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 text-center">
                <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-mono">
                  [ANPR CAMERA STREAM #01]
                </div>
                {detectedPlate && (
                  <div className="my-2">
                    <LicensePlateBadge plate={detectedPlate.plate} size="lg" />
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  {detectedPlate?.vehicleModel} · {detectedPlate?.color}
                </div>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-emerald-500/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                <span>[SCAN_MODE: OCR_UZ]</span>
                <span>{detectedPlate ? `ANIQLIK: ${detectedPlate.confidence}%` : 'SCANNING...'}</span>
              </div>
              <div className="flex justify-center">
                {isScanning && (
                  <div className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono animate-pulse border border-emerald-500/30">
                    Raqam o‘qilmoqda...
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-emerald-400/70">
                <span>SEKTOR: SHLAGBAUM 1</span>
                <span>FPS: 30</span>
              </div>
            </div>

            {/* Laser scanning line */}
            {isScanning && (
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_#34d399] animate-bounce top-1/2" />
            )}
          </div>

          {webcamError && (
            <div className="text-xs text-rose-400 p-2 rounded bg-rose-950/40 border border-rose-800">
              {webcamError}
            </div>
          )}

          {/* Test Samples Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">
                Kamera oqimi yoki test namunalarini tanlang:
              </span>
              <button
                type="button"
                onClick={() => setUseWebcam(!useWebcam)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{useWebcam ? 'Namunaviy rejim' : 'Haqiqiy veb-kamera'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SAMPLE_DETECTED_PLATES.map((sample, idx) => (
                <button
                  key={sample.plate}
                  type="button"
                  onClick={() => handleSimulateScan(idx)}
                  className={`p-2 rounded text-left border transition-all ${
                    selectedScenarioIndex === idx
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-slate-200">
                    {sample.plate}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {sample.vehicleModel}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSimulateScan(selectedScenarioIndex)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Qaytadan skanerlash</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleUsePlate}
                disabled={!detectedPlate || isScanning}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Raqamni Qabul Qilish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
