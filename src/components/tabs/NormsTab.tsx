import React from 'react';
import { ConsumptionNorms } from '../../types';
import { DEFAULT_CONSUMPTION_NORMS } from '../../constants/defaultPrices';
import { Sliders, RotateCcw, CheckCircle2, Save } from 'lucide-react';

interface NormsTabProps {
  norms: ConsumptionNorms;
  onUpdateNorms: (norms: ConsumptionNorms) => void;
}

export const NormsTab: React.FC<NormsTabProps> = ({
  norms,
  onUpdateNorms,
}) => {
  const handleReset = () => {
    onUpdateNorms({ ...DEFAULT_CONSUMPTION_NORMS });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-blue-950/20 to-slate-900/60 border-l-4 border-indigo-500 p-4 sm:p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              📊
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Нормы расхода инженерных материалов
              </h2>
              <p className="text-xs text-slate-400">
                Коэффициенты для автоматического расчета кабелей, труб и комплектующих от количества точек
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Norms Settings Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Electrical Norms */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>⚡ Нормативы по электрике</span>
            </h3>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Электрика
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Кабель на одну электроточку (м)</span>
                <span className="text-amber-400 font-bold">{norms.cablePerPoint} м / точка</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="12.0"
                step="0.5"
                value={norms.cablePerPoint}
                onChange={(e) =>
                  onUpdateNorms({ ...norms, cablePerPoint: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Общий метраж кабеля = (Кол-во точек) × {norms.cablePerPoint} м.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-xs text-slate-400 font-medium block">
                Распределение общего кабеля по сечениям:
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">Свет 3х1.5</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {Math.round(norms.cableLightRatio * 100)}%
                  </div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">Розетки 3х2.5</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {Math.round(norms.cableSocketRatio * 100)}%
                  </div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">Силовой 3х4.0</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {Math.round(norms.cablePowerRatio * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Клипс/крепежа на метр кабеля</span>
                <span className="text-amber-400 font-bold">{norms.clipsPerMeter} шт / м</span>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={norms.clipsPerMeter}
                onChange={(e) =>
                  onUpdateNorms({ ...norms, clipsPerMeter: parseInt(e.target.value) || 3 })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Plumbing Norms */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>🚰 Нормативы по сантехнике</span>
            </h3>
            <span className="text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              Сантехника
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Труба PEX на точку водоразбора (м)</span>
                <span className="text-sky-400 font-bold">{norms.pipePerPoint} м / точка</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="15.0"
                step="0.5"
                value={norms.pipePerPoint}
                onChange={(e) =>
                  onUpdateNorms({ ...norms, pipePerPoint: parseFloat(e.target.value) })
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Общий метраж труб = (Точки водоразбора) × {norms.pipePerPoint} м.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-xs text-slate-400 font-medium block">
                Распределение диаметров труб:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">PEX-a 16 мм к точкам</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {Math.round(norms.pipe16Ratio * 100)}%
                  </div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[11px] text-slate-400">PEX-a 20 мм магистраль</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {Math.round(norms.pipe20Ratio * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Фитингов и водорозеток на одну точку</span>
                <span className="text-sky-400 font-bold">{norms.fittingPerPoint} шт / точка</span>
              </div>
              <input
                type="number"
                min="1"
                max="5"
                value={norms.fittingPerPoint}
                onChange={(e) =>
                  onUpdateNorms({ ...norms, fittingPerPoint: parseInt(e.target.value) || 2 })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Сбросить к исходным нормам</span>
        </button>
      </div>
    </div>
  );
};
