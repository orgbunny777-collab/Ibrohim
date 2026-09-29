export type PaymentStatus = 'To‘langan' | 'Kutilmoqda' | 'Bepul';

export type PaymentMethod = 'Naqd' | 'Humo / Uzcard' | 'Click / Payme' | 'Bepul';

export type VehicleType = 'Yengil avtomobil' | 'Krossover / SUV' | 'Yuk / Mikroavtobus';

export interface ParkingSpot {
  id: string; // e.g. "A-01"
  sector: 'A' | 'B' | 'C';
  spotNumber: number;
  isOccupied: boolean;
  currentVehiclePlate: string | null;
  occupiedSince: number | null; // timestamp in ms
  spotType: 'Standart' | 'Kengaytirilgan' | 'VIP';
}

export interface ParkingRecord {
  id: string;
  ticketNumber: string;
  plateNumber: string;
  spotId: string;
  entryTime: number; // timestamp in ms
  exitTime: number | null; // timestamp in ms
  durationMinutes: number;
  durationFormatted: string;
  fee: number; // in Uzbek So'm
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  vehicleType: VehicleType;
  paidAt?: number;
  notes?: string;
}

export interface TariffRule {
  freeGracePeriodMinutes: number; // 15
  firstHourRate: number; // 5000 so'm
  additionalHourRate: number; // 3000 so'm
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  structuredRecord?: ParkingRecord;
  actionType?: 'found_car' | 'not_found' | 'free_spots' | 'tariff_info' | 'help';
}
