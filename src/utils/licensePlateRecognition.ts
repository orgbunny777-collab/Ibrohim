export interface RegionInfo {
  code: string;
  name: string;
}

export const UZBEK_REGIONS: Record<string, string> = {
  '01': 'Toshkent shahri',
  '10': 'Toshkent viloyati',
  '20': 'Sirdaryo viloyati',
  '25': 'Jizzax viloyati',
  '30': 'Samarqand viloyati',
  '40': 'Farg‘ona viloyati',
  '50': 'Namangan viloyati',
  '60': 'Andijon viloyati',
  '70': 'Qashqadaryo viloyati',
  '75': 'Surxondaryo viloyati',
  '80': 'Buxoro viloyati',
  '85': 'Navoiy viloyati',
  '90': 'Xorazm viloyati',
  '95': 'Qoraqalpog‘iston Respublikasi',
};

export function getRegionFromPlate(plate: string): string | null {
  const clean = plate.trim().slice(0, 2);
  return UZBEK_REGIONS[clean] || null;
}

export interface SamplePlateScenario {
  plate: string;
  vehicleModel: string;
  vehicleType: 'Yengil avtomobil' | 'Krossover / SUV' | 'Yuk / Mikroavtobus';
  color: string;
  confidence: number;
}

export const SAMPLE_DETECTED_PLATES: SamplePlateScenario[] = [
  {
    plate: '01 A 777 AA',
    vehicleModel: 'Chevrolet Malibu 2',
    vehicleType: 'Yengil avtomobil',
    color: 'Qora metallik',
    confidence: 99.4,
  },
  {
    plate: '10 B 456 BA',
    vehicleModel: 'Chevrolet Tracker 2',
    vehicleType: 'Krossover / SUV',
    color: 'Oq (Gaz)',
    confidence: 98.7,
  },
  {
    plate: '01 555 BBB',
    vehicleModel: 'BYD Song Plus EV',
    vehicleType: 'Krossover / SUV',
    color: 'Kulrang',
    confidence: 99.1,
  },
  {
    plate: '30 X 999 XX',
    vehicleModel: 'Chevrolet Cobalt',
    vehicleType: 'Yengil avtomobil',
    color: 'Oq marvarid',
    confidence: 97.9,
  },
  {
    plate: '01 G 123 GA',
    vehicleModel: 'Chevrolet Gentra',
    vehicleType: 'Yengil avtomobil',
    color: 'Mo‘rk-asfalt',
    confidence: 98.2,
  },
  {
    plate: '40 Y 321 AB',
    vehicleModel: 'Kia K5',
    vehicleType: 'Yengil avtomobil',
    color: 'Ko‘k metallik',
    confidence: 99.0,
  },
  {
    plate: '01 M 800 FA',
    vehicleModel: 'Mercedes-Benz Sprinter',
    vehicleType: 'Yuk / Mikroavtobus',
    color: 'Kumushrang',
    confidence: 96.5,
  },
];
