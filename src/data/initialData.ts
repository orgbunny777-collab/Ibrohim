import { ParkingRecord, ParkingSpot } from '../types/parking';
import { calculateParkingFee, formatDurationUzbek } from '../utils/tariffCalculator';

export function generateInitialSpots(): ParkingSpot[] {
  const spots: ParkingSpot[] = [];

  // Sector A: 8 spots
  for (let i = 1; i <= 8; i++) {
    const id = `A-0${i}`;
    spots.push({
      id,
      sector: 'A',
      spotNumber: i,
      isOccupied: false,
      currentVehiclePlate: null,
      occupiedSince: null,
      spotType: i <= 2 ? 'VIP' : 'Standart',
    });
  }

  // Sector B: 8 spots
  for (let i = 1; i <= 8; i++) {
    const id = `B-0${i}`;
    spots.push({
      id,
      sector: 'B',
      spotNumber: i,
      isOccupied: false,
      currentVehiclePlate: null,
      occupiedSince: null,
      spotType: 'Standart',
    });
  }

  // Sector C: 8 spots (Kengaytirilgan / SUV)
  for (let i = 1; i <= 8; i++) {
    const id = `C-0${i}`;
    spots.push({
      id,
      sector: 'C',
      spotNumber: i,
      isOccupied: false,
      currentVehiclePlate: null,
      occupiedSince: null,
      spotType: 'Kengaytirilgan',
    });
  }

  return spots;
}

export function generateInitialRecords(now: number): {
  records: ParkingRecord[];
  spots: ParkingSpot[];
} {
  const spots = generateInitialSpots();

  // Active parked cars
  const initialActive = [
    {
      plate: '01 A 777 AA',
      spotId: 'A-01',
      minutesAgo: 12, // <= 15 min => Bepul (0 so'm)
      vehicleType: 'Yengil avtomobil' as const,
      ticket: 'T-20260928-01',
    },
    {
      plate: '10 B 456 BA',
      spotId: 'A-03',
      minutesAgo: 38, // 16-60 min => 5 000 so'm
      vehicleType: 'Krossover / SUV' as const,
      ticket: 'T-20260928-02',
    },
    {
      plate: '01 555 BBB',
      spotId: 'B-02',
      minutesAgo: 75, // 1h 15m => 5 000 + 3 000 = 8 000 so'm
      vehicleType: 'Krossover / SUV' as const,
      ticket: 'T-20260928-03',
    },
    {
      plate: '30 X 999 XX',
      spotId: 'B-05',
      minutesAgo: 130, // 2h 10m => 5 000 + 2*3000 = 11 000 so'm
      vehicleType: 'Yengil avtomobil' as const,
      ticket: 'T-20260928-04',
    },
    {
      plate: '01 G 123 GA',
      spotId: 'C-01',
      minutesAgo: 6, // <= 15 min => Bepul
      vehicleType: 'Yengil avtomobil' as const,
      ticket: 'T-20260928-05',
    },
    {
      plate: '40 Y 321 AB',
      spotId: 'C-04',
      minutesAgo: 52, // 16-60 min => 5 000 so'm
      vehicleType: 'Yengil avtomobil' as const,
      ticket: 'T-20260928-06',
    },
    {
      plate: '01 M 800 FA',
      spotId: 'C-07',
      minutesAgo: 200, // 3h 20m => 5 000 + 3*3000 = 14 000 so'm
      vehicleType: 'Yuk / Mikroavtobus' as const,
      ticket: 'T-20260928-07',
    },
  ];

  const records: ParkingRecord[] = [];

  initialActive.forEach((car) => {
    const entryTime = now - car.minutesAgo * 60 * 1000;
    const { fee, paymentStatus } = calculateParkingFee(car.minutesAgo);

    records.push({
      id: `rec-${car.ticket}`,
      ticketNumber: car.ticket,
      plateNumber: car.plate,
      spotId: car.spotId,
      entryTime,
      exitTime: null,
      durationMinutes: car.minutesAgo,
      durationFormatted: formatDurationUzbek(car.minutesAgo),
      fee,
      paymentStatus,
      vehicleType: car.vehicleType,
    });

    const targetSpot = spots.find((s) => s.id === car.spotId);
    if (targetSpot) {
      targetSpot.isOccupied = true;
      targetSpot.currentVehiclePlate = car.plate;
      targetSpot.occupiedSince = entryTime;
    }
  });

  // Completed history records
  const pastCars = [
    {
      plate: '01 K 001 KA',
      spotId: 'A-02',
      entryMinutesAgo: 280,
      exitMinutesAgo: 240, // stayed 40 min => 5 000 so'm
      vehicleType: 'Yengil avtomobil' as const,
      paymentMethod: 'Click / Payme' as const,
      ticket: 'T-20260928-001',
    },
    {
      plate: '20 A 444 AA',
      spotId: 'B-01',
      entryMinutesAgo: 180,
      exitMinutesAgo: 168, // stayed 12 min => Bepul
      vehicleType: 'Yengil avtomobil' as const,
      paymentMethod: 'Bepul' as const,
      ticket: 'T-20260928-002',
    },
    {
      plate: '80 R 888 RR',
      spotId: 'C-02',
      entryMinutesAgo: 360,
      exitMinutesAgo: 210, // stayed 150 min (2h 30m) => 5 000 + 2*3000 = 11 000 so'm
      vehicleType: 'Krossover / SUV' as const,
      paymentMethod: 'Humo / Uzcard' as const,
      ticket: 'T-20260928-003',
    },
  ];

  pastCars.forEach((past) => {
    const entryTime = now - past.entryMinutesAgo * 60 * 1000;
    const exitTime = now - past.exitMinutesAgo * 60 * 1000;
    const duration = past.entryMinutesAgo - past.exitMinutesAgo;
    const { fee } = calculateParkingFee(duration);

    records.push({
      id: `rec-${past.ticket}`,
      ticketNumber: past.ticket,
      plateNumber: past.plate,
      spotId: past.spotId,
      entryTime,
      exitTime,
      durationMinutes: duration,
      durationFormatted: formatDurationUzbek(duration),
      fee,
      paymentStatus: fee === 0 ? 'Bepul' : 'To‘langan',
      paymentMethod: past.paymentMethod,
      vehicleType: past.vehicleType,
      paidAt: exitTime,
    });
  });

  return { records, spots };
}
