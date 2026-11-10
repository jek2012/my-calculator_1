import React from 'react';
import { HvacInputs, PriceItem } from '../../types';
import { NumberStepper } from '../common/NumberStepper';
import { Snowflake, Wrench, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface HvacTabProps {
  inputs: HvacInputs;
  onChange: (inputs: HvacInputs) => void;
  priceItems: PriceItem[];
  dynamicQuantities: Record<string, number>;
  onDynamicQuantityChange: (itemId: string, qty: number) => void;
  sectionTotal: number;
}

export const HvacTab: React.FC<HvacTabProps> = ({
  inputs,
  onChange,
  priceItems,
  dynamicQuantities,
  onDynamicQuantityChange,
  sectionTotal,
}) => {
  const [showExtra, setShowExtra] = React.useState(true);

  // Filter custom/dynamic items for HVAC
  const dynamicHvacItems = priceItems.filter(
    (item) => item.section === 'hvac' && !item.isStandard
  );

  const getPrice = (techName: string) => {
    return priceItems.find((i) => i.section === 'hvac' && i.techName === techName)?.price || 0;
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/20 to-slate-900/60 border-l-4 border-cyan-500 p-4 sm:p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              ❄️
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Кондиционирование и вентиляция
              </h2>
              <p className="text-xs text-slate-400">
                Расчёт монтажа сплит-систем, фреоновых трасс, штробления и доп. оборудования
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-right self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Итого раздел
            </span>
            <span className="text-base sm:text-xl font-black text-cyan-400">
              {sectionTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Main Parameters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-2">
          <span>1. Основные параметры системы</span>
        </h3>

        {/* Scheme selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Схема монтажа
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'standard',
                title: 'В один этап (Стандарт)',
                desc: 'Полный монтаж сразу с вакуумацией',
                price: getPrice('work_standard'),
              },
              {
                id: 'stage_1',
                title: '1-й этап (Закладка трасс)',
                desc: 'Черновой этап ремонта до отделки',
                price: getPrice('work_stage_1'),
              },
              {
                id: 'stage_2',
                title: '2-й этап (Навеска блоков)',
                desc: 'Чистовой монтаж на готовые трассы',
                price: getPrice('work_stage_2'),
              },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChange({ ...inputs, mode: mode.id as any })}
                className={`p-3.5 rounded-xl border text-left transition ${
                  inputs.mode === mode.id
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="font-bold text-sm mb-1">{mode.title}</div>
                <div className="text-xs text-slate-400 mb-1">{mode.desc}</div>
                <div className="text-xs font-semibold text-cyan-400">
                  {mode.price.toLocaleString('ru-RU')} ₽ / блок
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberStepper
            label="Кондиционеры / Сплит-системы"
            sublabel="Количество внутренних + внешних блоков"
            value={inputs.blocks}
            onChange={(val) => onChange({ ...inputs, blocks: val })}
            unit="шт."
            pricePerUnit={
              inputs.mode === 'standard'
                ? getPrice('work_standard')
                : inputs.mode === 'stage_1'
                ? getPrice('work_stage_1')
                : getPrice('work_stage_2')
            }
          />

          <NumberStepper
            label="Фреоновая трасса медная"
            sublabel={
              inputs.mode === 'stage_2'
                ? 'Во 2-м этапе трасса не включается'
                : 'Включает медные трубы, изоляцию и дренажный шланг'
            }
            value={inputs.pipeMeters}
            onChange={(val) => onChange({ ...inputs, pipeMeters: val })}
            unit="м."
            step={0.5}
            pricePerUnit={
              inputs.mode === 'stage_2' ? 0 : getPrice('pipe') + getPrice('drain')
            }
          />
        </div>
      </div>

      {/* 2. Дополнительные работы (единый блок) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <button
          type="button"
          onClick={() => setShowExtra(!showExtra)}
          className="w-full flex items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-slate-300"
        >
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>2. Дополнительные работы и материалы</span>
          </div>
          {showExtra ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showExtra && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-slate-800">
            <NumberStepper
              label="Дренажная помпа"
              sublabel="Для отвода конденсата"
              value={inputs.pump}
              onChange={(val) => onChange({ ...inputs, pump: val })}
              unit="шт."
              pricePerUnit={getPrice('pump')}
            />

            <NumberStepper
              label="Декоративный короб"
              sublabel="Пластиковый кабель-канал для трассы"
              value={inputs.boxMeters}
              onChange={(val) => onChange({ ...inputs, boxMeters: val })}
              unit="м."
              pricePerUnit={getPrice('box')}
            />

            <NumberStepper
              label="Алмазное бурение"
              sublabel="Сквозное отверстие в стене под трассу"
              value={inputs.coreHoles}
              onChange={(val) => onChange({ ...inputs, coreHoles: val })}
              unit="шт."
              pricePerUnit={getPrice('coring')}
            />

            <NumberStepper
              label="Штроба под трассу (Кирпич)"
              sublabel="Глубина 50-60 мм"
              value={inputs.chasingBrick}
              onChange={(val) => onChange({ ...inputs, chasingBrick: val })}
              unit="м."
              pricePerUnit={getPrice('chasing_brick')}
            />

            <NumberStepper
              label="Штроба под трассу (Монолит)"
              sublabel="Бетон / ЖБ конструкции"
              value={inputs.chasingConcrete}
              onChange={(val) => onChange({ ...inputs, chasingConcrete: val })}
              unit="м."
              pricePerUnit={getPrice('chasing_concrete')}
            />

            {/* Все дополнительные позиции раздела отображаются в этой же единой сетке */}
            {dynamicHvacItems.map((item) => {
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
        )}
      </div>
    </div>
  );
};
