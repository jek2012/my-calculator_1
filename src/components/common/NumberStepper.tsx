import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  sublabel?: string;
  pricePerUnit?: number;
  badge?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  value,
  onChange,
  unit = 'шт.',
  min = 0,
  max = 99999,
  step = 1,
  sublabel,
  pricePerUnit,
  badge,
}) => {
  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (isNaN(parsed)) {
      onChange(min);
    } else {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
  };

  const totalCost = pricePerUnit !== undefined ? Math.round(value * pricePerUnit) : undefined;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-slate-700 transition flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-100 text-sm">{label}</span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {badge}
              </span>
            )}
          </div>
          {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
          {pricePerUnit !== undefined && (
            <p className="text-xs text-slate-500 mt-0.5">
              Тариф: <span className="text-slate-300 font-medium">{pricePerUnit.toLocaleString('ru-RU')} ₽</span> / {unit}
            </p>
          )}
        </div>

        {totalCost !== undefined && totalCost > 0 && (
          <div className="text-right ml-2 flex-shrink-0">
            <span className="text-xs text-slate-400 block font-normal">Сумма</span>
            <span className="text-sm font-bold text-emerald-400">
              {totalCost.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <span className="text-xs text-slate-400 font-medium">Количество:</span>
        <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="w-7 h-7 rounded-md bg-slate-700/70 hover:bg-slate-600 disabled:opacity-40 disabled:hover:bg-slate-700/70 flex items-center justify-center text-slate-200 transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center px-1">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value === 0 ? 0 : value}
              onChange={handleChange}
              className="w-14 bg-transparent text-center text-sm font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[11px] text-slate-400 font-medium select-none pr-1">{unit}</span>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="w-7 h-7 rounded-md bg-slate-700/70 hover:bg-slate-600 disabled:opacity-40 disabled:hover:bg-slate-700/70 flex items-center justify-center text-slate-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
