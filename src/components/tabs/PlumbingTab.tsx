import React, { useState } from 'react';
import { PlumbingInputs, PriceItem, ConsumptionNorms } from '../../types';
import { NumberStepper } from '../common/NumberStepper';
import { Droplets, Sparkles, Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface PlumbingTabProps {
  inputs: PlumbingInputs;
  onChange: (inputs: PlumbingInputs) => void;
  priceItems: PriceItem[];
  norms: ConsumptionNorms;
  dynamicQuantities: Record<string, number>;
  onDynamicQuantityChange: (itemId: string, qty: number) => void;
  sectionTotal: number;
}

export const PlumbingTab: React.FC<PlumbingTabProps> = ({
  inputs,
  onChange,
  priceItems,
  norms,
  dynamicQuantities,
  onDynamicQuantityChange,
  sectionTotal,
}) => {
  const [showMaterialDetails, setShowMaterialDetails] = useState(false);

  // Filter dynamic items for Plumbing
  const dynamicPlumbingItems = priceItems.filter(
    (item) => item.section === 'plumbing' && !item.isStandard
  );

  const getPrice = (techName: string) => {
    return priceItems.find((i) => i.section === 'plumbing' && i.techName === techName)?.price || 0;
  };

  // Calculate material norms preview
  const totalPipe = Math.round(inputs.points * norms.pipePerPoint * 10) / 10;
  const p16 = Math.round(totalPipe * norms.pipe16Ratio * 10) / 10;
  const p20 = Math.round(totalPipe * norms.pipe20Ratio * 10) / 10;
  const fitQty = Math.round(inputs.points * norms.fittingPerPoint);

  const totalMaterialCost =
    Math.round(p16 * getPrice('pipe_16')) +
    Math.round(p20 * getPrice('pipe_20')) +
    Math.round(fitQty * getPrice('fitting'));

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-sky-950/20 to-slate-900/60 border-l-4 border-sky-500 p-4 sm:p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              🚰
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Сантехника и водоснабжение
              </h2>
              <p className="text-xs text-slate-400">
                Точки водоразбора, коллекторы, трубы PEX и дополнительное оборудование
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-right self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Итого раздел
            </span>
            <span className="text-base sm:text-xl font-black text-sky-400">
              {sectionTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* 1. Основные объемы сантехнических работ */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-sky-400" />
          <span>1. Основные объемы сантехники</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberStepper
            label="Точки водоснабжения и канализации"
            sublabel="Раковина, ванна, душ, унитаз, стиралка, бойлер"
            value={inputs.points}
            onChange={(val) => onChange({ ...inputs, points: val })}
            unit="шт."
            pricePerUnit={getPrice('point')}
          />

          <NumberStepper
            label="Коллекторные узлы (гребенки)"
            sublabel="Сборка и установка распределительных гребенок ХВС/ГВС"
            value={inputs.collectors}
            onChange={(val) => onChange({ ...inputs, collectors: val })}
            unit="шт."
            pricePerUnit={getPrice('collector')}
          />
        </div>

        {/* Компактная плашка авторасчета труб PEX и фитингов */}
        {inputs.points > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong className="text-white">Авторасчёт материалов:</strong> {totalPipe} м трубы PEX-a и фитинги (норма: {norms.pipePerPoint} м/точка)
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

            {showMaterialDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-slate-300">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">Труба PEX 16 мм (80%):</span>
                  <span className="font-bold text-white">{p16} м</span> ({Math.round(p16 * getPrice('pipe_16'))} ₽)
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">Труба PEX 20 мм (Магистраль 20%):</span>
                  <span className="font-bold text-white">{p20} м</span> ({Math.round(p20 * getPrice('pipe_20'))} ₽)
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-slate-400 block">Аксиальные фитинги:</span>
                  <span className="font-bold text-white">{fitQty} шт</span> ({Math.round(fitQty * getPrice('fitting'))} ₽)
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Дополнительные работы и оборудование */}
      {dynamicPlumbingItems.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>2. Дополнительные работы и оборудование</span>
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">
              {dynamicPlumbingItems.length} позиций
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dynamicPlumbingItems.map((item) => {
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
