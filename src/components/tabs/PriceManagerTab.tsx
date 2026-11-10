import React, { useState } from 'react';
import { PriceItem, SectionKey, ItemCategory } from '../../types';
import { SECTION_NAMES, SECTION_EMOJIS } from '../../constants/defaultPrices';
import { exportPriceListToExcel, formatCategoryRu } from '../../utils/excel';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  Search,
  RotateCcw,
  X,
} from 'lucide-react';

interface PriceManagerTabProps {
  priceItems: PriceItem[];
  onUpdatePriceItems: (items: PriceItem[]) => void;
  onResetToDefaults: () => void;
}

export const PriceManagerTab: React.FC<PriceManagerTabProps> = ({
  priceItems,
  onUpdatePriceItems,
  onResetToDefaults,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New item modal state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSection, setNewItemSection] = useState<SectionKey>('general');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('work');
  const [newItemUnit, setNewItemUnit] = useState('шт.');
  const [newItemPrice, setNewItemPrice] = useState<number>(1000);
  const [newItemDesc, setNewItemDesc] = useState('');

  // Filter items
  const filteredItems = priceItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.techName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSection === 'all' || item.section === selectedSection;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesSection && matchesCategory;
  });

  // Handle direct price change (auto-saved)
  const handlePriceChange = (id: string, newPrice: number) => {
    const updated = priceItems.map((item) =>
      item.id === id ? { ...item, price: Math.max(0, newPrice) } : item
    );
    onUpdatePriceItems(updated);
  };

  // Handle delete custom item (immediate, no iframe-blocked confirm dialog)
  const handleDeleteItem = (id: string) => {
    const updated = priceItems.filter((item) => item.id !== id);
    onUpdatePriceItems(updated);
  };

  // Handle add new custom item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const techName = `cust_${Date.now()}`;
    const newItem: PriceItem = {
      id: `item_${Date.now()}`,
      techName,
      name: newItemName.trim(),
      section: newItemSection,
      category: newItemCategory,
      unit: newItemUnit.trim() || 'шт.',
      price: Math.max(0, newItemPrice),
      description: newItemDesc.trim(),
      isStandard: false,
    };

    onUpdatePriceItems([...priceItems, newItem]);
    setIsAddingItem(false);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice(1000);
  };

  return (
    <div className="space-y-4">
      {/* Clean Top Action Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Title and Buttons Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">💰</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Прайс-лист компании
              </h2>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                {priceItems.length} позиций
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Цены сохраняются автоматически при вводе и сразу действуют у всех монтажников
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportPriceListToExcel(priceItems)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2"
              title="Выгрузить текущие цены в Excel файл"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Выгрузить в Excel</span>
            </button>

            <button
              onClick={() => setIsAddingItem(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить пункт</span>
            </button>

            <button
              type="button"
              onClick={onResetToDefaults}
              title="Сбросить все цены к стандартным"
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-rose-400 rounded-xl transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск позиции по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Очистить
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Раздел:</span>
            {['all', 'hvac', 'electric', 'plumbing', 'general'].map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedSection === sec
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {sec === 'all'
                  ? 'Все разделы'
                  : `${SECTION_EMOJIS[sec as SectionKey]} ${SECTION_NAMES[sec as SectionKey]}`}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Тип:</span>
            {['all', 'work', 'material'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {cat === 'all' ? 'Все типы' : cat === 'work' ? 'Работы' : 'Материалы'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-300">
            Список позиций ({filteredItems.length} из {priceItems.length})
          </span>
          <span>
            💡 Кликните на поле с ценой, чтобы изменить тариф
          </span>
        </div>

        <div
          className="overflow-x-auto touch-scroll-x table-scrollbar w-full pb-2"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
        >
          <table className="w-full min-w-[720px] text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Раздел</th>
                <th className="py-3 px-4">Наименование</th>
                <th className="py-3 px-4">Тип</th>
                <th className="py-3 px-4">Ед. изм.</th>
                <th className="py-3 px-4">Цена (₽)</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 border border-slate-700">
                      <span>{SECTION_EMOJIS[item.section]}</span>
                      <span>{SECTION_NAMES[item.section]}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-white max-w-xs sm:max-w-md">
                    <div>{item.name}</div>
                    {item.description && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.category === 'material'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : item.category === 'extra'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {formatCategoryRu(item.category)}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono">
                    {item.unit}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={item.price}
                        onChange={(e) =>
                          handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-24 bg-slate-800 border border-slate-700 hover:border-emerald-500 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-sm font-bold text-emerald-400 focus:outline-none transition"
                      />
                      <span className="text-slate-400 text-xs">₽</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {!item.isStandard ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        title="Удалить позицию"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Базовая
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setIsAddingItem(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>Добавить новую позицию в прайс</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Новая позиция сразу появится в соответствующем разделе у монтажников
            </p>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Наименование работы или материала *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Монтаж радиатора отопления"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Раздел
                  </label>
                  <select
                    value={newItemSection}
                    onChange={(e) => setNewItemSection(e.target.value as SectionKey)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hvac">❄️ Климат</option>
                    <option value="electric">⚡ Электрика</option>
                    <option value="plumbing">🚰 Сантехника</option>
                    <option value="general">🛠️ Дополнительно</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Тип
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="work">Работа</option>
                    <option value="material">Материал</option>
                    <option value="extra">Дополнительно</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Единица измерения
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="шт., м., компл., м²"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Базовая цена (₽)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Описание / Примечание (опционально)
                </label>
                <input
                  type="text"
                  placeholder="Дополнительные условия или детали монтажа"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/30"
                >
                  Создать позицию
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
