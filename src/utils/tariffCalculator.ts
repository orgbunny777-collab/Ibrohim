import { PaymentStatus } from '../types/parking';

export const TARIFF_CONFIG = {
  freeGracePeriodMinutes: 15,
  firstHourRate: 5000,
  additionalHourRate: 3000,
};

/**
 * Calculates parking fee strictly following the tariff rules:
 * - 15 daqiqagacha bo‘lgan vaqt: bepul
 * - Birinchi 1 soat: 5 000 so‘m
 * - Har keyingi soat: 3 000 so‘m
 */
export function calculateParkingFee(durationMinutes: number): {
  fee: number;
  paymentStatus: PaymentStatus;
  breakdown: string;
  hoursBilled: number;
} {
  const safeMinutes = Math.max(0, Math.floor(durationMinutes));

  if (safeMinutes <= TARIFF_CONFIG.freeGracePeriodMinutes) {
    return {
      fee: 0,
      paymentStatus: 'Bepul',
      breakdown: `15 daqiqagacha bepul (Hozirgi turish vaqti: ${safeMinutes} daqiqa)`,
      hoursBilled: 0,
    };
  }

  if (safeMinutes <= 60) {
    return {
      fee: TARIFF_CONFIG.firstHourRate,
      paymentStatus: 'Kutilmoqda',
      breakdown: `Birinchi 1 soat: ${formatMoney(TARIFF_CONFIG.firstHourRate)}`,
      hoursBilled: 1,
    };
  }

  const extraMinutes = safeMinutes - 60;
  const extraHours = Math.ceil(extraMinutes / 60);
  const extraFee = extraHours * TARIFF_CONFIG.additionalHourRate;
  const totalFee = TARIFF_CONFIG.firstHourRate + extraFee;

  return {
    fee: totalFee,
    paymentStatus: 'Kutilmoqda',
    breakdown: `Birinchi 1 soat (5 000 so‘m) + ${extraHours} qo‘shimcha soat (${formatMoney(extraFee)})`,
    hoursBilled: 1 + extraHours,
  };
}

/**
 * Formats duration in minutes into clear Uzbek text
 */
export function formatDurationUzbek(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  if (safeMinutes === 0) return '1 daqiqadan kam';

  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) {
    return `${minutes} daqiqa`;
  }
  if (minutes === 0) {
    return `${hours} soat`;
  }
  return `${hours} soat ${minutes} daqiqa`;
}

/**
 * Formats currency in Uzbek So'm: e.g. 5 000 so‘m
 */
export function formatMoney(amount: number): string {
  const formatted = new Intl.NumberFormat('uz-UZ').format(amount);
  return `${formatted} so‘m`;
}

/**
 * Formats timestamp to Uzbek date/time: e.g. 28.09.2026 22:30
 */
export function formatDateTime(timestamp: number | null): string {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Formats time only: e.g. 22:30:15
 */
export function formatTimeOnly(timestamp: number | null, includeSeconds = false): string {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  if (includeSeconds) {
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${hours}:${minutes}`;
}

/**
 * Standardizes Uzbek license plates:
 * Examples:
 * "01a777aa" -> "01 A 777 AA"
 * "01 777 aaa" -> "01 777 AAA"
 * "10b123ba" -> "10 B 123 BA"
 */
export function normalizePlateNumber(input: string): string {
  if (!input) return '';
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Format 1: 01 A 777 AA (2 digits, 1 letter, 3 digits, 2 letters)
  const match1 = cleaned.match(/^(\d{2})([A-Z])(\d{3})([A-Z]{2})$/);
  if (match1) {
    return `${match1[1]} ${match1[2]} ${match1[3]} ${match1[4]}`;
  }

  // Format 2: 01 777 AAA (2 digits, 3 digits, 3 letters - Legal entity / Davlat)
  const match2 = cleaned.match(/^(\d{2})([0-9]{3})([A-Z]{3})$/);
  if (match2) {
    return `${match2[1]} ${match2[2]} ${match2[3]}`;
  }

  // Fallback: return cleaned with spaced region if starts with 2 digits
  if (/^\d{2}/.test(cleaned)) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  }

  return cleaned;
}

/**
 * Checks if a plate search term matches a target plate (ignoring spaces and casing)
 */
export function platesMatch(query: string, target: string): boolean {
  const cleanQ = query.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanT = target.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleanQ.length > 0 && cleanT.includes(cleanQ);
}
