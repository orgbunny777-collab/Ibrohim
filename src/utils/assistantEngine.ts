import { ParkingRecord, ParkingSpot } from '../types/parking';
import {
  calculateParkingFee,
  formatDateTime,
  formatDurationUzbek,
  formatMoney,
  normalizePlateNumber,
  platesMatch,
} from './tariffCalculator';

export interface AssistantResponse {
  text: string;
  foundRecord?: ParkingRecord;
  suggestedAction?: 'exit_car' | 'enter_car' | 'view_map' | 'view_tariffs';
  isError?: boolean;
}

/**
 * Professional Parking Management AI Assistant Engine
 * Strictly follows the requirements:
 * - Accurate time and fee calculations
 * - "Bu raqam bilan parkingda avtomobil topilmadi" if car plate not found
 * - No hallucinations
 * - Requests necessary info if missing
 * - Concise, clear Uzbek language
 */
export function processAssistantQuery(
  rawQuery: string,
  spots: ParkingSpot[],
  records: ParkingRecord[],
  currentTime: number
): AssistantResponse {
  const query = rawQuery.trim();
  const lowerQuery = query.toLowerCase();

  if (!query) {
    return {
      text: 'Iltimos, avtomobil raqamini kiriting (masalan: 01 A 777 AA) yoki savolingizni yozing.',
    };
  }

  // 1. Check for tariff question
  if (
    lowerQuery.includes('tarif') ||
    lowerQuery.includes('narx') ||
    lowerQuery.includes('qancha to‘lov') ||
    lowerQuery.includes('qancha to\'lov') ||
    lowerQuery.includes('to‘lov qoidalari')
  ) {
    return {
      text: `Parking tarif qoidalari:
• 15 daqiqagacha bo‘lgan vaqt: bepul
• Birinchi 1 soat (16 - 60 daqiqa): 5 000 so‘m
• Har keyingi soat: 3 000 so‘m

Avtomobilning to‘lov summasini bilish uchun uning raqamini yuboring.`,
      suggestedAction: 'view_tariffs',
    };
  }

  // 2. Check for free / occupied spots query
  if (
    lowerQuery.includes('bo‘sh') ||
    lowerQuery.includes('bosh') ||
    lowerQuery.includes('joylar') ||
    lowerQuery.includes('band') ||
    lowerQuery.includes('joy bormi') ||
    lowerQuery.includes('qancha joy')
  ) {
    const freeSpots = spots.filter((s) => !s.isOccupied);
    const occupiedSpots = spots.filter((s) => s.isOccupied);

    const freeA = freeSpots.filter((s) => s.sector === 'A').map((s) => s.id).join(', ') || 'yo‘q';
    const freeB = freeSpots.filter((s) => s.sector === 'B').map((s) => s.id).join(', ') || 'yo‘q';
    const freeC = freeSpots.filter((s) => s.sector === 'C').map((s) => s.id).join(', ') || 'yo‘q';

    return {
      text: `Parking holati:
• Jami joylar: ${spots.length} ta
• Bo‘sh joylar: ${freeSpots.length} ta
• Band joylar: ${occupiedSpots.length} ta

Bo‘sh joylar ro‘yxati:
- Sektor A: ${freeA}
- Sektor B: ${freeB}
- Sektor C: ${freeC}`,
      suggestedAction: 'view_map',
    };
  }

  // 3. Check for check-in intent without plate
  if (
    (lowerQuery === 'kirish' || lowerQuery === 'kiritish' || lowerQuery === 'avtomobil kiritish') &&
    !query.match(/\d/)
  ) {
    return {
      text: 'Avtomobilni kiritish uchun uning davlat raqamini kiriting (masalan: "Kirish: 01 A 777 AA") yoki "Kirish Qayd Qilish" tugmasini bosing.',
      suggestedAction: 'enter_car',
    };
  }

  // 4. Try to extract license plate from query
  // Support forms like: "01 A 777 AA", "01A777AA", "01 777 AAA", "chiqarish 01 A 777 AA", "01a777aa holati"
  const potentialPlateMatch = query.match(/[0-9]{2}\s?[A-Za-z0-9\s]{4,8}/);
  const candidatePlate = potentialPlateMatch ? potentialPlateMatch[0] : query;
  const normalizedCandidate = normalizePlateNumber(candidatePlate);

  // Search active parked vehicles first
  const activeRecord = records.find(
    (r) => r.exitTime === null && platesMatch(candidatePlate, r.plateNumber)
  );

  if (activeRecord) {
    // Calculate live up-to-date duration and fee
    const currentDurationMinutes = Math.max(
      1,
      Math.floor((currentTime - activeRecord.entryTime) / (60 * 1000))
    );
    const feeCalculation = calculateParkingFee(currentDurationMinutes);
    const durationText = formatDurationUzbek(currentDurationMinutes);

    return {
      text: `Avtomobil ma’lumotlari:
• Avtomobil raqami: ${activeRecord.plateNumber}
• Parking joyi: ${activeRecord.spotId}
• Kirish vaqti: ${formatDateTime(activeRecord.entryTime)}
• Chiqish vaqti: Hozirda parkingda
• Umumiy turish vaqti: ${durationText}
• To‘lov summasi: ${formatMoney(feeCalculation.fee)} (${feeCalculation.breakdown})
• To‘lov holati: ${feeCalculation.paymentStatus}`,
      foundRecord: {
        ...activeRecord,
        durationMinutes: currentDurationMinutes,
        durationFormatted: durationText,
        fee: feeCalculation.fee,
        paymentStatus: feeCalculation.paymentStatus,
      },
      suggestedAction: 'exit_car',
    };
  }

  // Search historical completed records if not currently active
  const pastRecord = records.find(
    (r) => r.exitTime !== null && platesMatch(candidatePlate, r.plateNumber)
  );

  if (pastRecord) {
    return {
      text: `Ushbu avtomobil oldin parkingda bo‘lgan va chiqib ketgan:
• Avtomobil raqami: ${pastRecord.plateNumber}
• Parking joyi: ${pastRecord.spotId}
• Kirish vaqti: ${formatDateTime(pastRecord.entryTime)}
• Chiqish vaqti: ${formatDateTime(pastRecord.exitTime)}
• Umumiy turish vaqti: ${pastRecord.durationFormatted}
• To‘lov summasi: ${formatMoney(pastRecord.fee)}
• To‘lov holati: ${pastRecord.paymentStatus}
• To‘lov usuli: ${pastRecord.paymentMethod || 'Naqd'}

Hozirda mazkur avtomobil parking hududida emas.`,
      foundRecord: pastRecord,
    };
  }

  // If query contains plate-like format but car is not in records:
  // Strictly output the exact requested message: "Bu raqam bilan parkingda avtomobil topilmadi"
  if (
    normalizedCandidate.length >= 4 ||
    /\d{2}/.test(query) ||
    lowerQuery.includes('raqam') ||
    lowerQuery.includes('qayerda') ||
    lowerQuery.includes('avtomobil')
  ) {
    return {
      text: 'Bu raqam bilan parkingda avtomobil topilmadi.',
      isError: true,
    };
  }

  // If not enough information was provided, ask politely without guessing
  return {
    text: 'Iltimos, aniq avtomobil raqamini kiriting (masalan: 01 A 777 AA) yoki bo‘sh joylar va tariflar haqida so‘rang.',
  };
}
