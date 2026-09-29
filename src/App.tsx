import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ParkingHeroBanner } from './components/ParkingHeroBanner';
import { ParkingMap } from './components/ParkingMap';
import { AssistantConsole } from './components/AssistantConsole';
import { HistoryTable } from './components/HistoryTable';
import { TariffExplainer } from './components/TariffExplainer';
import { VehicleEntryModal } from './components/VehicleEntryModal';
import { VehicleExitModal } from './components/VehicleExitModal';
import { PlateScannerModal } from './components/PlateScannerModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ParkingRecord, ParkingSpot, PaymentMethod, VehicleType } from './types/parking';
import { generateInitialRecords, generateInitialSpots } from './data/initialData';
import {
  calculateParkingFee,
  formatDurationUzbek,
  normalizePlateNumber,
  platesMatch,
} from './utils/tariffCalculator';
import { SamplePlateScenario } from './utils/licensePlateRecognition';

export default function App() {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'assistant' | 'history' | 'tariffs'>('dashboard');

  // Load state from localStorage or initialize with demo records
  const [spots, setSpots] = useState<ParkingSpot[]>(() => {
    const saved = localStorage.getItem('avtopark_spots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    const initial = generateInitialRecords(Date.now());
    return initial.spots;
  });

  const [records, setRecords] = useState<ParkingRecord[]>(() => {
    const saved = localStorage.getItem('avtopark_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    const initial = generateInitialRecords(Date.now());
    return initial.records;
  });

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [preselectedSpotId, setPreselectedSpotId] = useState<string | undefined>(undefined);
  const [initialEntryPlate, setInitialEntryPlate] = useState<string>('');

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [activeExitRecord, setActiveExitRecord] = useState<ParkingRecord | null>(null);

  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceiptRecord, setActiveReceiptRecord] = useState<ParkingRecord | null>(null);

  // Live timer tick every 1000ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage whenever spots or records update
  useEffect(() => {
    localStorage.setItem('avtopark_spots', JSON.stringify(spots));
  }, [spots]);

  useEffect(() => {
    localStorage.setItem('avtopark_records', JSON.stringify(records));
  }, [records]);

  // Derived stats
  const freeSpots = spots.filter((s) => !s.isOccupied);
  const occupiedSpots = spots.filter((s) => s.isOccupied);
  const activeRecords = records.filter((r) => r.exitTime === null);

  // Calculate live sum of pending fees for all active cars
  const currentPendingFeeTotal = activeRecords.reduce((acc, rec) => {
    const durationMin = Math.max(1, Math.floor((currentTime - rec.entryTime) / (60 * 1000)));
    const feeCalc = calculateParkingFee(durationMin);
    return acc + feeCalc.fee;
  }, 0);

  // Calculate total paid fees from completed records today
  const todayPaidTotal = records
    .filter((r) => r.exitTime !== null && r.paymentStatus === 'To‘langan')
    .reduce((acc, r) => acc + r.fee, 0);

  // Handler: Confirm Vehicle Entry
  const handleConfirmEntry = (
    plateNumber: string,
    spotId: string,
    vehicleType: VehicleType,
    customEntryMinutesAgo = 0
  ) => {
    const standardizedPlate = normalizePlateNumber(plateNumber);
    const entryTimestamp = currentTime - customEntryMinutesAgo * 60 * 1000;
    const duration = Math.max(0, customEntryMinutesAgo);
    const feeCalc = calculateParkingFee(duration);

    const ticketNumber = `T-${new Date(entryTimestamp).toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newRecord: ParkingRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ticketNumber,
      plateNumber: standardizedPlate,
      spotId,
      entryTime: entryTimestamp,
      exitTime: null,
      durationMinutes: duration,
      durationFormatted: formatDurationUzbek(duration),
      fee: feeCalc.fee,
      paymentStatus: feeCalc.paymentStatus,
      vehicleType,
    };

    // Update spot
    setSpots((prev) =>
      prev.map((s) =>
        s.id === spotId
          ? {
              ...s,
              isOccupied: true,
              currentVehiclePlate: standardizedPlate,
              occupiedSince: entryTimestamp,
            }
          : s
      )
    );

    // Add record
    setRecords((prev) => [newRecord, ...prev]);

    // Open receipt/talon
    setActiveReceiptRecord(newRecord);
    setIsReceiptModalOpen(true);
  };

  // Handler: Confirm Vehicle Exit and Payment
  const handleConfirmExit = (
    recordId: string,
    paymentMethod: PaymentMethod,
    finalFee: number,
    finalDuration: number
  ) => {
    let completedRec: ParkingRecord | null = null;

    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          completedRec = {
            ...rec,
            exitTime: currentTime,
            durationMinutes: finalDuration,
            durationFormatted: formatDurationUzbek(finalDuration),
            fee: finalFee,
            paymentStatus: finalFee === 0 ? 'Bepul' : 'To‘langan',
            paymentMethod,
            paidAt: currentTime,
          };
          return completedRec;
        }
        return rec;
      })
    );

    // Free the parking spot
    const targetRecord = records.find((r) => r.id === recordId);
    if (targetRecord) {
      setSpots((prev) =>
        prev.map((s) =>
          s.id === targetRecord.spotId
            ? {
                ...s,
                isOccupied: false,
                currentVehiclePlate: null,
                occupiedSince: null,
              }
            : s
        )
      );
    }

    if (completedRec) {
      setActiveReceiptRecord(completedRec);
      setIsReceiptModalOpen(true);
    }
  };

  // Handler: Plate Recognized from ANPR Camera / Scanner
  const handlePlateRecognized = (plate: string, scenario?: SamplePlateScenario) => {
    const existingActive = records.find(
      (r) => r.exitTime === null && platesMatch(plate, r.plateNumber)
    );

    if (existingActive) {
      // Plate is already parked -> prompt checkout
      setActiveExitRecord(existingActive);
      setIsExitModalOpen(true);
    } else {
      // Plate is not parked -> prompt entry
      setInitialEntryPlate(plate);
      setPreselectedSpotId(undefined);
      setIsEntryModalOpen(true);
    }
  };

  // Handler: Quick search plate from hero
  const handleSearchPlate = (plateQuery: string) => {
    setActiveTab('assistant');
  };

  // Handler: Reset to initial demo data
  const handleResetDemoData = () => {
    if (window.confirm('Barcha ma’lumotlarni standart namuna holatiga qaytarishni xohlaysizmi?')) {
      const initial = generateInitialRecords(Date.now());
      setSpots(initial.spots);
      setRecords(initial.records);
      localStorage.removeItem('avtopark_spots');
      localStorage.removeItem('avtopark_records');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEntryModal={() => {
          setInitialEntryPlate('');
          setPreselectedSpotId(undefined);
          setIsEntryModalOpen(true);
        }}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        currentTime={currentTime}
        freeCount={freeSpots.length}
        occupiedCount={occupiedSpots.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <ParkingHeroBanner
              onSearchPlate={handleSearchPlate}
              onOpenEntryModal={() => {
                setInitialEntryPlate('');
                setPreselectedSpotId(undefined);
                setIsEntryModalOpen(true);
              }}
              onOpenScanner={() => setIsScannerModalOpen(true)}
              onOpenAssistant={() => setActiveTab('assistant')}
              freeCount={freeSpots.length}
              occupiedCount={occupiedSpots.length}
            />

            <StatsOverview
              totalSpots={spots.length}
              freeSpotsCount={freeSpots.length}
              occupiedSpotsCount={occupiedSpots.length}
              currentPendingFeeTotal={currentPendingFeeTotal}
              todayPaidTotal={todayPaidTotal}
              activeCarsCount={activeRecords.length}
              onFilterFree={() => setActiveTab('map')}
              onFilterOccupied={() => setActiveTab('map')}
            />

            {/* Quick Two Columns: Live Parking Map Snippet & Assistant / Active table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 cols: Map preview */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Parking Joylari Holati</span>
                    <span className="text-xs font-normal text-slate-400">
                      (Tanlang yoki boshqaring)
                    </span>
                  </h2>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    To‘liq xarita →
                  </button>
                </div>

                <ParkingMap
                  spots={spots}
                  records={records}
                  currentTime={currentTime}
                  onSelectFreeSpot={(spotId) => {
                    setPreselectedSpotId(spotId);
                    setInitialEntryPlate('');
                    setIsEntryModalOpen(true);
                  }}
                  onSelectOccupiedSpot={(record) => {
                    setActiveExitRecord(record);
                    setIsExitModalOpen(true);
                  }}
                />
              </div>

              {/* Right col: Assistant Console Snippet */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>Yordamchi (AI)</span>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  </h2>
                  <button
                    onClick={() => setActiveTab('assistant')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Kengaytirilgan oyna →
                  </button>
                </div>

                <AssistantConsole
                  spots={spots}
                  records={records}
                  currentTime={currentTime}
                  onInitiateExit={(record) => {
                    setActiveExitRecord(record);
                    setIsExitModalOpen(true);
                  }}
                  onNavigateToTab={setActiveTab}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Parking Map */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Parking Xaritasi va Joylar</h1>
                <p className="text-xs text-slate-400">
                  Bo‘sh va band joylarni real vaqtda kuzatish va tezkor harakatlar
                </p>
              </div>
            </div>

            <StatsOverview
              totalSpots={spots.length}
              freeSpotsCount={freeSpots.length}
              occupiedSpotsCount={occupiedSpots.length}
              currentPendingFeeTotal={currentPendingFeeTotal}
              todayPaidTotal={todayPaidTotal}
              activeCarsCount={activeRecords.length}
              onFilterFree={() => {}}
              onFilterOccupied={() => {}}
            />

            <ParkingMap
              spots={spots}
              records={records}
              currentTime={currentTime}
              onSelectFreeSpot={(spotId) => {
                setPreselectedSpotId(spotId);
                setInitialEntryPlate('');
                setIsEntryModalOpen(true);
              }}
              onSelectOccupiedSpot={(record) => {
                setActiveExitRecord(record);
                setIsExitModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Assistant Console */}
        {activeTab === 'assistant' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div>
              <h1 className="text-xl font-bold text-white">
                Professional Parking Boshqaruv Yordamchisi
              </h1>
              <p className="text-xs text-slate-400">
                Avtomobil raqamini kiriting, yordamchi parkingdagi holatini, kirish vaqtini va to‘lovini ko‘rsatadi.
              </p>
            </div>

            <AssistantConsole
              spots={spots}
              records={records}
              currentTime={currentTime}
              onInitiateExit={(record) => {
                setActiveExitRecord(record);
                setIsExitModalOpen(true);
              }}
              onNavigateToTab={setActiveTab}
            />
          </div>
        )}

        {/* Tab 4: History & Logs Table */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">
                  Parking Jurnali va Tarix
                </h1>
                <p className="text-xs text-slate-400">
                  Kirgan va chiqqan barcha avtomobillar, turish vaqtlari va to‘lov summalari
                </p>
              </div>
            </div>

            <HistoryTable
              records={records}
              currentTime={currentTime}
              onInitiateExit={(record) => {
                setActiveExitRecord(record);
                setIsExitModalOpen(true);
              }}
              onOpenReceipt={(record) => {
                setActiveReceiptRecord(record);
                setIsReceiptModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 5: Tariff Explainer & Simulator */}
        {activeTab === 'tariffs' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div>
              <h1 className="text-xl font-bold text-white">Parking Qoidalari va Tariflar</h1>
              <p className="text-xs text-slate-400">
                15 daqiqagacha bepul, birinchi 1 soat 5 000 so‘m, har keyingi soat 3 000 so‘m
              </p>
            </div>

            <TariffExplainer />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AvtoPark</span>
            <span aria-hidden="true">·</span>
            <span>Professional Parking Boshqaruv Tizimi</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={handleResetDemoData}
              className="text-slate-400 hover:text-slate-300 underline transition-colors"
            >
              Namunaviy ma’lumotlarni tiklash
            </button>
            <span aria-hidden="true">·</span>
            <span>O‘zbekiston Respublikasi standartlari</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VehicleEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        freeSpots={freeSpots}
        preselectedSpotId={preselectedSpotId}
        initialPlate={initialEntryPlate}
        onConfirmEntry={handleConfirmEntry}
        onOpenScanner={() => {
          setIsEntryModalOpen(false);
          setIsScannerModalOpen(true);
        }}
      />

      <VehicleExitModal
        isOpen={isExitModalOpen}
        onClose={() => {
          setIsExitModalOpen(false);
          setActiveExitRecord(null);
        }}
        record={activeExitRecord}
        currentTime={currentTime}
        onConfirmExit={handleConfirmExit}
        onOpenReceipt={(rec) => {
          setActiveReceiptRecord(rec);
          setIsReceiptModalOpen(true);
        }}
      />

      <PlateScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onPlateRecognized={handlePlateRecognized}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setActiveReceiptRecord(null);
        }}
        record={activeReceiptRecord}
      />
    </div>
  );
}
