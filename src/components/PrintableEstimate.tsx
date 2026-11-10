import React from 'react';
import { EstimateItem, ProjectInfo } from '../types';
import { Printer, X } from 'lucide-react';

interface PrintableEstimateProps {
  isOpen: boolean;
  onClose: () => void;
  estimateItems: EstimateItem[];
  grandTotal: number;
  workTotal: number;
  materialTotal: number;
  extraTotal: number;
  projectInfo: ProjectInfo;
}

export const PrintableEstimate: React.FC<PrintableEstimateProps> = ({
  isOpen,
  onClose,
  estimateItems,
  grandTotal,
  workTotal,
  materialTotal,
  extraTotal,
  projectInfo,
}) => {
  if (!isOpen) return null;

  const discountAmount =
    projectInfo.discountPercent > 0
      ? Math.round((grandTotal * projectInfo.discountPercent) / 100)
      : 0;
  const finalTotal = grandTotal - discountAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex flex-col items-center">
      {/* Top Floating Action Bar (hidden on print) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 print:hidden text-white bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold">Печатная форма коммерческого предложения</span>
          <span className="text-xs text-slate-400">({estimateItems.length} позиций)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-blue-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Печать / Сохранить в PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Printable Document */}
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 font-sans print:shadow-none print:p-0 print:m-0 print:rounded-none">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">
                Смета на монтаж внутренних инженерных сетей объекта «под ключ»
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase block">Номер расчета</span>
              <span className="font-mono text-base font-bold text-slate-800">
                КП-{new Date().getFullYear()}-{estimateItems.length * 7 + 101}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Дата: {projectInfo.date || new Date().toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Объект:</span>
              <span className="font-semibold text-slate-900">
                {projectInfo.title || 'Инженерные сети квартиры/коттеджа'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Заказчик:</span>
              <span className="font-semibold text-slate-900">
                {projectInfo.clientName || 'Частное лицо'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Телефон:</span>
              <span className="font-semibold text-slate-900">
                {projectInfo.clientPhone || '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-bold block uppercase text-[10px]">Адрес:</span>
              <span className="font-semibold text-slate-900">
                {projectInfo.address || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-2 w-8 text-center">№</th>
                <th className="py-2.5 px-3">Раздел</th>
                <th className="py-2.5 px-3">Наименование работ / материалов</th>
                <th className="py-2.5 px-2 text-center">Тип</th>
                <th className="py-2.5 px-2 text-center">Кол-во</th>
                <th className="py-2.5 px-2 text-center">Ед.</th>
                <th className="py-2.5 px-3 text-right">Цена (₽)</th>
                <th className="py-2.5 px-3 text-right">Сумма (₽)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {estimateItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-700">{item.section}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                  <td className="py-2 px-2 text-center text-[10px] text-slate-600 uppercase font-semibold">
                    {item.category}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-slate-900 font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600">{item.unit}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    {item.price.toLocaleString('ru-RU')}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {item.total.toLocaleString('ru-RU')} ₽
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
              <span>Стоимость работ:</span>
              <span className="font-mono font-semibold">{workTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
              <span>Стоимость материалов:</span>
              <span className="font-mono font-semibold">{materialTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            {extraTotal > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                <span>Дополнительные услуги:</span>
                <span className="font-mono font-semibold">{extraTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}
            {projectInfo.discountPercent > 0 && (
              <>
                <div className="flex justify-between py-1 border-b border-slate-200 text-slate-500">
                  <span>Сумма без скидки:</span>
                  <span className="font-mono">{grandTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 text-rose-600 font-semibold">
                  <span>Скидка ({projectInfo.discountPercent}%):</span>
                  <span className="font-mono">-{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              </>
            )}
            <div className="flex justify-between py-2 text-sm font-black border-t-2 border-slate-900 text-slate-900">
              <span>ИТОГО К ОПЛАТЕ:</span>
              <span className="font-mono text-base">{finalTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-10 pt-8 border-t border-slate-300 text-xs">
          <div>
            <div className="font-bold text-slate-800 mb-6 uppercase text-[10px]">
              Исполнитель (Подрядчик):
            </div>
            <div className="border-b border-slate-400 w-3/4 mb-1"></div>
            <span className="text-[10px] text-slate-500">Подпись / М.П.</span>
          </div>

          <div>
            <div className="font-bold text-slate-800 mb-6 uppercase text-[10px]">
              Заказчик (Клиент):
            </div>
            <div className="border-b border-slate-400 w-3/4 mb-1"></div>
            <span className="text-[10px] text-slate-500">Подпись / Расшифровка</span>
          </div>
        </div>
      </div>
    </div>
  );
};
