export type SectionKey = 'hvac' | 'electric' | 'plumbing' | 'general';

export type ItemCategory = 'work' | 'material' | 'extra';

export interface PriceItem {
  id: string; // уникальный ключ (например 'work_standard', 'pipe_16' или 'custom_123')
  techName: string; // техническое имя для Excel (Тех_Имя)
  section: SectionKey;
  name: string;
  unit: string;
  price: number;
  category: ItemCategory;
  isStandard?: boolean; // базовый элемент оригинальной системы
  description?: string;
}

export interface ConsumptionNorms {
  cablePerPoint: number; // метров кабеля на точку (по умолчанию 5.0)
  pipePerPoint: number; // метров трубы PEX на точку (по умолчанию 6.0)
  fittingPerPoint: number; // фитингов на точку (по умолчанию 2)
  cableLightRatio: number; // доля кабеля 3х1.5 (0.3 = 30%)
  cableSocketRatio: number; // доля кабеля 3х2.5 (0.6 = 60%)
  cablePowerRatio: number; // доля кабеля 3х4.0 (0.1 = 10%)
  pipe16Ratio: number; // доля трубы 16мм (0.8 = 80%)
  pipe20Ratio: number; // доля трубы 20мм (0.2 = 20%)
  clipsPerMeter: number; // клипс на метр гофры (3 шт/м)
}

export interface EstimateItem {
  id: string;
  techName?: string;
  section: string; // "Климат" | "Электрика" | "Сантехника" | "Дополнительно"
  sectionKey: SectionKey;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  category: 'Работа' | 'Материал' | 'Дополнительно';
}

export interface HvacInputs {
  blocks: number;
  pipeMeters: number;
  mode: 'standard' | 'stage_1' | 'stage_2';
  pump: number;
  boxMeters: number;
  coreHoles: number;
  chasingBrick: number;
  chasingConcrete: number;
}

export interface ElectricInputs {
  points: number;
  chasingMeters: number;
  breakers: number;
}

export interface PlumbingInputs {
  points: number;
  collectors: number;
}

export interface ProjectInfo {
  title: string;
  clientName: string;
  clientPhone: string;
  address: string;
  date: string;
  discountPercent: number;
  notes: string;
}

export type UserRole = 'admin' | 'guest';
