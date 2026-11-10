import React, { useState } from 'react';
import { EstimateItem, ProjectInfo } from '../../types';
import { exportEstimateToExcel, generateEstimateTxt } from '../../utils/excel';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Building,
  Percent,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Table,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EstimateTabProps {
  estimateItems: EstimateItem[];
  grandTotal: number;
  workTotal: number;
  materialTotal: number;
  extraTotal: number;
  hvacTotal: number;
  electricTotal: number;
  plumbingTotal: number;
  generalTotal: number;
  projectInfo: ProjectInfo;
  onUpdateProjectInfo: (info: ProjectInfo) => void;
  onResetAllQuantities: () => void;
  onPrint: () => void;
}

export const EstimateTab: React.FC<EstimateTabProps> = ({
  estimateItems,
  grandTotal,
  workTotal,
  materialTotal,
  extraTotal,
  hvacTotal,
  electricTotal,
  plumbingTotal,
  generalTotal,
  projectInfo,
  onUpdateProjectInfo,
  onResetAllQuantities,
  onPrint,
}) => {
  const [copied, setCopied] = useState(false);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      tableContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Discount calculation
  const discountAmount =
    projectInfo.discountPercent > 0
      ? Math.round((grandTotal * projectInfo.discountPercent) / 100)
      : 0;
  const finalTotal = grandTotal - discountAmount;

  const handleCopyTxt = () => {
    const text = generateEstimateTxt(estimateItems, projectInfo, grandTotal);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadExcel = () => {
    exportEstimateToExcel(estimateItems, projectInfo, grandTotal);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  const filteredItems = estimateItems.filter((item) => {
    const matchesSection = filterSection === 'all' || item.section === filterSection;
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    return matchesSection && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Banner & KPI */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900/60 border-l-4 border-emerald-500 p-4 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Коммерческое предложение • Итоговая смета
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {projectInfo.title ? projectInfo.title : 'Инженерные сети объекта'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Позиций в спецификации: <span className="text-white font-semibold">{estimateItems.length}</span>
              {projectInfo.clientName && ` • Заказчик: ${projectInfo.clientName}`}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 px-5 py-3 rounded-2xl text-right">
            <span className="text-xs uppercase font-extrabold text-slate-400 block tracking-wider">
              {projectInfo.discountPercent > 0 ? 'Итого со скидкой' : 'Итоговая сумма под ключ'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {finalTotal.toLocaleString('ru-RU')} ₽
            </div>
            {projectInfo.discountPercent > 0 && (
              <span className="text-xs text-rose-400 block line-through">
                Без скидки: {grandTotal.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
        </div>

        {/* Cost Breakdown Cards (Работы, Материалы, Доп. работы) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium truncate">Работы (монтаж)</span>
            <span className="text-sm sm:text-lg font-extrabold text-white font-mono block mt-0.5 truncate">
              {workTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium truncate">Материалы</span>
            <span className="text-sm sm:text-lg font-extrabold text-cyan-400 font-mono block mt-0.5 truncate">
              {materialTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl col-span-2 sm:col-span-1 min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium truncate">Дополнительно</span>
            <span className="text-sm sm:text-lg font-extrabold text-purple-400 font-mono block mt-0.5 truncate">
              {extraTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        {/* Разделы инженерии — все 4 раздела с защитой от переполнения */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-3 pt-3 border-t border-slate-800/60">
          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between min-w-0 overflow-hidden">
            <span className="text-slate-400 font-medium flex items-center space-x-1 text-[11px] sm:text-xs truncate">
              <span>❄️</span>
              <span className="truncate">Климат</span>
            </span>
            <span className="font-extrabold text-cyan-400 font-mono text-xs sm:text-sm md:text-base mt-1 whitespace-nowrap truncate">
              {hvacTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between min-w-0 overflow-hidden">
            <span className="text-slate-400 font-medium flex items-center space-x-1 text-[11px] sm:text-xs truncate">
              <span>⚡</span>
              <span className="truncate">Электрика</span>
            </span>
            <span className="font-extrabold text-amber-400 font-mono text-xs sm:text-sm md:text-base mt-1 whitespace-nowrap truncate">
              {electricTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between min-w-0 overflow-hidden">
            <span className="text-slate-400 font-medium flex items-center space-x-1 text-[11px] sm:text-xs truncate">
              <span>🚰</span>
              <span className="truncate">Сантехника</span>
            </span>
            <span className="font-extrabold text-sky-400 font-mono text-xs sm:text-sm md:text-base mt-1 whitespace-nowrap truncate">
              {plumbingTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 sm:p-3 rounded-xl flex flex-col justify-between min-w-0 overflow-hidden">
            <span className="text-slate-400 font-medium flex items-center space-x-1 text-[11px] sm:text-xs truncate">
              <span>🛠️</span>
              <span className="truncate">Дополнительно</span>
            </span>
            <span className="font-extrabold text-purple-400 font-mono text-xs sm:text-sm md:text-base mt-1 whitespace-nowrap truncate">
              {generalTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadExcel}
            disabled={estimateItems.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Скачать в Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleCopyTxt}
            disabled={estimateItems.length === 0}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 shadow-md shadow-blue-600/20 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Скопировано в буфер!' : 'Скопировать текст (КП)'}</span>
          </button>

          <button
            onClick={onPrint}
            disabled={estimateItems.length === 0}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 border border-slate-700"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Печать / В PDF</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowClientDetails(!showClientDetails)}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center space-x-1"
          >
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>Реквизиты объекта</span>
            {showClientDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onResetAllQuantities}
            title="Сбросить все счетчики"
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-rose-400 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project and Client Details Drawer */}
      {showClientDetails && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Данные заказчика и объекта (для шапки КП и Excel)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Название объекта / ЖК
              </label>
              <input
                type="text"
                placeholder="ЖК Новые Горизонты, кв. 142"
                value={projectInfo.title}
                onChange={(e) => onUpdateProjectInfo({ ...projectInfo, title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                ФИО Заказчика
              </label>
              <input
                type="text"
                placeholder="Иванов Алексей Петрович"
                value={projectInfo.clientName}
                onChange={(e) => onUpdateProjectInfo({ ...projectInfo, clientName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Телефон заказчика
              </label>
              <input
                type="text"
                placeholder="+7 (999) 000-00-00"
                value={projectInfo.clientPhone}
                onChange={(e) => onUpdateProjectInfo({ ...projectInfo, clientPhone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Адрес объекта
              </label>
              <input
                type="text"
                placeholder="г. Москва, ул. Ленина, д. 24"
                value={projectInfo.address}
                onChange={(e) => onUpdateProjectInfo({ ...projectInfo, address: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Скидка клиенту (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="0"
                  value={projectInfo.discountPercent}
                  onChange={(e) =>
                    onUpdateProjectInfo({
                      ...projectInfo,
                      discountPercent: Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)),
                    })
                  }
                  className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Дата составления
              </label>
              <input
                type="date"
                value={projectInfo.date}
                onChange={(e) => onUpdateProjectInfo({ ...projectInfo, date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Specification Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Filters & View Switcher */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Спецификация сметы ({filteredItems.length} позиций)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/80 mr-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Табличный вид со свайпом"
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Таблица</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Компактный вид карточками для телефонов"
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Карточки</span>
              </button>
            </div>

            <span className="text-xs text-slate-400">Раздел:</span>
            {['all', 'Климат', 'Электрика', 'Сантехника', 'Дополнительно'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSection(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  filterSection === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'Все' : s}
              </button>
            ))}

            <span className="text-xs text-slate-400 ml-1">Тип:</span>
            {['all', 'Работа', 'Материал'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  filterCategory === c
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {c === 'all' ? 'Все' : c}
              </button>
            ))}
          </div>
        </div>

        {estimateItems.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm font-semibold text-slate-300">Смета пока пуста</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Перейдите во вкладки ❄️ Климат, ⚡ Электрика или 🚰 Сантехника и введите выполненные объемы работ.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          /* Mobile / Tablet Cards View (Zero horizontal overflow) */
          <div className="p-3 sm:p-5 space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredItems.map((item, idx) => (
                <div
                  key={`${item.id}_${idx}`}
                  className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 p-3.5 rounded-xl flex flex-col justify-between transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
                        {item.section}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.category === 'Материал'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : item.category === 'Дополнительно'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400 font-mono whitespace-nowrap">
                        {item.total.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-medium text-white mb-2 leading-relaxed">
                    {item.name}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="font-mono text-slate-300">
                      <strong className="text-white font-bold">{item.quantity}</strong> {item.unit} × {item.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Позиция сметы</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer inside Cards View */}
            <div className="mt-4 p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
              {projectInfo.discountPercent > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span>Скидка ({projectInfo.discountPercent}%):</span>
                  <span className="text-rose-400 font-mono font-bold">
                    -{discountAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
                  Итоговая сумма под ключ:
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {finalTotal.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Table View with Horizontal Swipe & Navigation */
          <div>
            {/* Mobile swipe helper bar with quick scroll buttons */}
            <div className="sm:hidden px-3.5 py-2 bg-slate-950/70 border-b border-slate-800/90 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5 text-blue-400 font-medium">
                <span>👈 Проведите пальцем вбок 👉</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => scrollTable('left')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 active:scale-95 text-[11px] font-semibold flex items-center space-x-0.5"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Влево</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollTable('right')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 active:scale-95 text-[11px] font-semibold flex items-center space-x-0.5"
                >
                  <span>Вправо</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div
              ref={tableContainerRef}
              className="overflow-x-auto touch-scroll-x table-scrollbar w-full pb-2"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
            >
              <table className="w-full min-w-[760px] text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5 w-12 text-center">№</th>
                    <th className="py-3 px-3.5 w-28">Раздел</th>
                    <th className="py-3 px-3.5 w-24">Тип</th>
                    <th className="py-3 px-3.5 min-w-[220px]">Наименование</th>
                    <th className="py-3 px-3.5 w-20 text-center">Кол-во</th>
                    <th className="py-3 px-3.5 w-20 text-center">Ед. изм.</th>
                    <th className="py-3 px-3.5 w-28 text-right">Цена (₽)</th>
                    <th className="py-3 px-3.5 w-32 text-right">Сумма (₽)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredItems.map((item, idx) => (
                    <tr key={`${item.id}_${idx}`} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-300">{item.section}</span>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.category === 'Материал'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : item.category === 'Дополнительно'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-medium text-white max-w-sm">
                        {item.name}
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-white whitespace-nowrap font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3.5 text-center text-slate-400 whitespace-nowrap">
                        {item.unit}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono text-slate-300">
                        {item.price.toLocaleString('ru-RU')}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono font-bold text-emerald-400">
                        {item.total.toLocaleString('ru-RU')} ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950/80 border-t-2 border-slate-700 font-bold text-white text-xs sm:text-sm">
                  {projectInfo.discountPercent > 0 && (
                    <>
                      <tr>
                        <td colSpan={7} className="py-2.5 px-3.5 text-right text-slate-400 uppercase text-xs">
                          Сумма без скидки:
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono text-slate-300">
                          {grandTotal.toLocaleString('ru-RU')} ₽
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7} className="py-2 px-3.5 text-right text-rose-400 uppercase text-xs">
                          Скидка ({projectInfo.discountPercent}%):
                        </td>
                        <td className="py-2 px-3.5 text-right font-mono text-rose-400">
                          -{discountAmount.toLocaleString('ru-RU')} ₽
                        </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td colSpan={7} className="py-3.5 px-3.5 text-right uppercase tracking-wider text-emerald-400 text-sm">
                      ИТОГОВАЯ СТОИМОСТЬ ПОД КЛЮЧ:
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-base sm:text-lg text-emerald-400 font-extrabold whitespace-nowrap">
                      {finalTotal.toLocaleString('ru-RU')} ₽
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
