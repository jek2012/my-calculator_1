import React from 'react';
import { PriceItem } from '../../types';
import { NumberStepper } from '../common/NumberStepper';
import { Wrench, Sparkles, FolderPlus } from 'lucide-react';

interface GeneralTabProps {
  priceItems: PriceItem[];
  dynamicQuantities: Record<string, number>;
  onDynamicQuantityChange: (itemId: string, qty: number) => void;
  sectionTotal: number;
  onOpenPriceManager?: () => void;
  isAdmin: boolean;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  priceItems,
  dynamicQuantities,
  onDynamicQuantityChange,
  sectionTotal,
  onOpenPriceManager,
  isAdmin,
}) => {
  const generalItems = priceItems.filter((item) => item.section === 'general');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-violet-950/20 to-slate-900/60 border-l-4 border-purple-500 p-4 sm:p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              🛠️
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Дополнительные и общестроительные работы
              </h2>
              <p className="text-xs text-slate-400">
                Тёплые полы, скрытые люки, вынос строительного мусора, логистика и кастомные пункты
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-right self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Итого раздел
            </span>
            <span className="text-base sm:text-xl font-black text-purple-400">
              {sectionTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* General items grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-purple-400" />
            <span>Позиции раздела</span>
          </h3>

          {isAdmin && onOpenPriceManager && (
            <button
              onClick={onOpenPriceManager}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1 font-medium transition"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Добавить пункт в прайс</span>
            </button>
          )}
        </div>

        {generalItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">В этом разделе пока нет добавленных позиций.</p>
            {isAdmin && onOpenPriceManager && (
              <button
                onClick={onOpenPriceManager}
                className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Добавить позицию через Excel или форму
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {generalItems.map((item) => {
              const qty = dynamicQuantities[item.id] || 0;
              return (
                <NumberStepper
                  key={item.id}
                  label={item.name}
                  sublabel={
                    item.description ||
                    (item.category === 'material'
                      ? 'Материал'
                      : item.category === 'extra'
                      ? 'Доп. услуга'
                      : 'Работа')
                  }
                  value={qty}
                  onChange={(val) => onDynamicQuantityChange(item.id, val)}
                  unit={item.unit}
                  pricePerUnit={item.price}
                  badge={
                    item.category === 'material' ? 'Мат.' : item.category === 'extra' ? 'Доп.' : 'Раб.'
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
