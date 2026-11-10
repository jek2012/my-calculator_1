import React, { useState } from 'react';
import { ElectricInputs, PriceItem, ConsumptionNorms } from '../../types';
import { NumberStepper } from '../common/NumberStepper';
import { Zap, Sparkles, Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface ElectricTabProps {
  inputs: ElectricInputs;
  onChange: (inputs: ElectricInputs) => void;
  priceItems: PriceItem[];
  norms: ConsumptionNorms;
  dynamicQuantities: Record<string, number>;
  onDynamicQuantityChange: (itemId: string, qty: number) => void;
  sectionTotal: number;
}

export const ElectricTab: React.FC<ElectricTabProps> = ({
  inputs,
  onChange,
  priceItems,
  norms,
  dynamicQuantities,
  onDynamicQuantityChange,
  sectionTotal,
}) => {
  const [showMaterialDetails, setShowMaterialDetails] = useState(false);

  // Filter dynamic items for Electric
  const dynamicElectricItems = priceItems.filter(
    (item) => item.section === 'electric' && !item.isStandard
  );

  const getPrice = (techName: string) => {
    return priceItems.find((i) => i.section === 'electric' && i.techName === techName)?.price || 0;
  };

  // Calculate material norms preview
  const totalCable = Math.round(inputs.points * norms.cablePerPoint * 10) / 10;
  const c15 = Math.round(totalCable * norms.cableLightRatio * 10) / 10;
  const c25 = Math.round(totalCable * norms.cableSocketRatio * 10) / 10;
  const c40 = Math.round(totalCable * norms.cablePowerRatio * 10) / 10;
  const clipsQty = Math.round(totalCable * norms.clipsPerMeter);

  const totalMaterialCost =
    Math.round(c15 * getPrice('cable_1.5')) +
    Math.round(c25 * getPrice('cable_2.5')) +
    Math.round(c40 * getPrice('cable_4.0')) +
    Math.round(totalCable * getPrice('corrugation')) +
    Math.round(clipsQty * getPrice('clips'));

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900/60 border-l-4 border-amber-500 p-4 sm:p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              ⚡
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Электрика и силовые щиты
              </h2>
              <p className="text-xs text-slate-400">
                Электроточки, штробление, щитовое оборудование и дополнительные работы
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-right self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Итого раздел
            </span>
            <span className="text-base sm:text-xl font-black text-amber-400">
              {sectionTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* 1. Основные объемы электромонтажных работ */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>1. Основные объемы электромонтажа</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberStepper
            label="Количество точек (подрозетников)"
            sublabel="Розетки, выключатели, выводы светильников"
            value={inputs.points}
            onChange={(val) => onChange({ ...inputs, points: val })}
            unit="шт."
            pricePerUnit={getPrice('point')}
          />

          <NumberStepper
            label="Штробление стен"
            sublabel="Прокладка кабельных трасс в штробах"
            value={inputs.chasingMeters}
            onChange={(val) => onChange({ ...inputs, chasingMeters: val })}
            unit="м."
            step={0.5}
            pricePerUnit={getPrice('chasing')}
          />

          <NumberStepper
            label="Автоматы / УЗО в щит"
            sublabel="Модульные аппараты защиты"
            value={inputs.breakers}
            onChange={(val) => onChange({ ...inputs, breakers: val })}
            unit="шт."
            pricePerUnit={getPrice('breaker')}
          />
        </div>

        {/* Компактная плашка автоматического расхода материалов (без 6 тяжелых карточек!) */}
        {inputs.points > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong className="text-white">Авторасчёт материалов:</strong> {totalCable} м кабеля, гофра и крепеж (норма: {norms.cablePerPoint} м/точка)
                </span>
                <span className="text-emerald-400 font-bold ml-1">
                  + {totalMaterialCost.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowMaterialDetails(!showMaterialDetails)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 font-medium transition self-start sm:self-auto"
              >
                <span>{showMaterialDetails ? 'Скрыть детали' : 'Показать раскладку'}</span>
                {showMaterialDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Аккуратная скрываемая раскладка сечений кабеля */}
            {showMaterialDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-slate-300">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">3х1.5 (Свет, 30%):</span>
                  <span className="font-bold text-white">{c15} м</span> ({Math.round(c15 * getPrice('cable_1.5'))} ₽)
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">3х2.5 (Розетки, 60%):</span>
                  <span className="font-bold text-white">{c25} м</span> ({Math.round(c25 * getPrice('cable_2.5'))} ₽)
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">3х4.0 (Сила, 10%):</span>
                  <span className="font-bold text-white">{c40} м</span> ({Math.round(c40 * getPrice('cable_4.0'))} ₽)
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">Гофра:</span>
                  <span className="font-bold text-white">{totalCable} м</span> ({Math.round(totalCable * getPrice('corrugation'))} ₽)
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">Клипсы:</span>
                  <span className="font-bold text-white">{clipsQty} шт</span> ({Math.round(clipsQty * getPrice('clips'))} ₽)
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Дополнительные работы и оборудование */}
      {dynamicElectricItems.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>2. Дополнительные работы и оборудование</span>
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">
              {dynamicElectricItems.length} позиций
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dynamicElectricItems.map((item) => {
              const qty = dynamicQuantities[item.id] || 0;
              return (
                <NumberStepper
                  key={item.id}
                  label={item.name}
                  sublabel={item.description || (item.category === 'material' ? 'Материал' : 'Работа')}
                  value={qty}
                  onChange={(val) => onDynamicQuantityChange(item.id, val)}
                  unit={item.unit}
                  pricePerUnit={item.price}
                  badge={item.category === 'material' ? 'Мат.' : 'Раб.'}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
