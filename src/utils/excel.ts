import * as XLSX from 'xlsx';
import { PriceItem, EstimateItem, ProjectInfo, SectionKey, ItemCategory } from '../types';
import { SECTION_NAMES } from '../constants/defaultPrices';

// Helper to map Russian section names to SectionKey
export function parseSection(val: string): SectionKey {
  const s = String(val || '').trim().toLowerCase();
  if (s.includes('клим') || s.includes('hvac') || s.includes('кондиц')) return 'hvac';
  if (s.includes('электр') || s.includes('elec') || s.includes('свет')) return 'electric';
  if (s.includes('сант') || s.includes('plumb') || s.includes('отоп') || s.includes('вода')) return 'plumbing';
  return 'general';
}

export function parseCategory(val: string): ItemCategory {
  const c = String(val || '').trim().toLowerCase();
  if (c.includes('мат') || c.includes('mat')) return 'material';
  if (c.includes('доп') || c.includes('extra')) return 'extra';
  return 'work';
}

export function formatCategoryRu(cat: ItemCategory): 'Работа' | 'Материал' | 'Дополнительно' {
  if (cat === 'material') return 'Материал';
  if (cat === 'extra') return 'Дополнительно';
  return 'Работа';
}

// 1. Export price base to Excel
export function exportPriceListToExcel(items: PriceItem[]) {
  const rows = items.map((item, idx) => ({
    '№': idx + 1,
    'Раздел': SECTION_NAMES[item.section],
    'Тех_Имя': item.techName || item.id,
    'Наименование': item.name,
    'Категория': formatCategoryRu(item.category),
    'Ед_Изм': item.unit,
    'Цена_База': item.price,
    'Описание': item.description || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 }, // №
    { wch: 15 }, // Раздел
    { wch: 22 }, // Тех_Имя
    { wch: 45 }, // Наименование
    { wch: 15 }, // Категория
    { wch: 10 }, // Ед_Изм
    { wch: 14 }, // Цена_База
    { wch: 40 }, // Описание
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Прайс_База');

  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Прайс_База_Инженерия_${nowStr}.xlsx`);
}

// 2. Import and merge prices from Excel file
export interface ImportResult {
  items: PriceItem[];
  addedCount: number;
  updatedCount: number;
  errors: string[];
}

export async function importPriceListFromExcel(
  file: File,
  currentItems: PriceItem[]
): Promise<ImportResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error('В файле не найдено листов с данными');
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Таблица пуста. Убедитесь, что первая строка содержит заголовки колонок.');
  }

  const itemsMap = new Map<string, PriceItem>();
  // Index existing items by techName and by name (lowercase)
  currentItems.forEach((it) => {
    const key = (it.techName || it.id).trim().toLowerCase();
    itemsMap.set(key, { ...it });
  });

  let addedCount = 0;
  let updatedCount = 0;
  const errors: string[] = [];

  rawRows.forEach((row, index) => {
    const lineNum = index + 2; // header is line 1

    // Extract fields with multiple possible column names
    const sectionRaw = row['Раздел'] || row['Секция'] || row['Section'] || row['section'] || '';
    const techNameRaw =
      row['Тех_Имя'] || row['ТехИмя'] || row['Код'] || row['TechName'] || row['techName'] || row['id'] || '';
    const nameRaw = row['Наименование'] || row['Название'] || row['Позиция'] || row['Name'] || row['name'] || '';
    const categoryRaw = row['Категория'] || row['Тип'] || row['Category'] || row['category'] || '';
    const unitRaw = row['Ед_Изм'] || row['Единица'] || row['Ед.изм'] || row['Unit'] || row['unit'] || 'шт.';
    const priceRaw = row['Цена_База'] || row['Цена'] || row['Прайс'] || row['Price'] || row['price'];

    if (!nameRaw) {
      // empty row
      return;
    }

    const price = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw || '0').replace(',', '.'));

    if (isNaN(price) || price < 0) {
      errors.push(`Строка ${lineNum}: некорректная цена для "${nameRaw}". Пропущено.`);
      return;
    }

    const section = parseSection(sectionRaw);
    const category = parseCategory(categoryRaw);
    const techName = String(techNameRaw || '').trim() || `custom_${Date.now()}_${index}`;
    const name = String(nameRaw).trim();
    const unit = String(unitRaw).trim() || 'шт.';

    const lookupKey = techName.toLowerCase();
    const existing = itemsMap.get(lookupKey);

    if (existing) {
      // Update existing item
      existing.price = price;
      existing.name = name;
      existing.unit = unit;
      existing.category = category;
      existing.section = section;
      itemsMap.set(lookupKey, existing);
      updatedCount++;
    } else {
      // Add new item
      const newItem: PriceItem = {
        id: `dyn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        techName: techName,
        section,
        name,
        unit,
        price,
        category,
        isStandard: false,
        description: row['Описание'] || row['комментарий'] || '',
      };
      itemsMap.set(lookupKey, newItem);
      addedCount++;
    }
  });

  return {
    items: Array.from(itemsMap.values()),
    addedCount,
    updatedCount,
    errors,
  };
}

// 3. Export complete Estimate to Excel
export function exportEstimateToExcel(
  estimateItems: EstimateItem[],
  projectInfo: ProjectInfo,
  grandTotal: number
) {
  const wb = XLSX.utils.book_new();

  // Create header info rows
  const headerData = [
    ['КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ / СМЕТА НА ИНЖЕНЕРНЫЕ РАБОТЫ'],
    ['Объект:', projectInfo.title || 'Инженерные сети квартиры/дома'],
    ['Заказчик:', projectInfo.clientName || 'Не указан'],
    ['Телефон:', projectInfo.clientPhone || '—'],
    ['Адрес:', projectInfo.address || '—'],
    ['Дата составления:', projectInfo.date || new Date().toLocaleDateString('ru-RU')],
    [''],
    ['№', 'Раздел', 'Категория', 'Наименование работ и материалов', 'Кол-во', 'Ед. изм.', 'Цена (руб.)', 'Сумма (руб.)'],
  ];

  const rows = estimateItems.map((item, idx) => [
    idx + 1,
    item.section,
    item.category,
    item.name,
    item.quantity,
    item.unit,
    item.price,
    item.total,
  ]);

  // Discount calculation
  let finalTotal = grandTotal;
  const footerRows: any[][] = [[''], ['', '', '', 'ИТОГО БЕЗ СКИДКИ', '', '', '', grandTotal]];

  if (projectInfo.discountPercent > 0) {
    const discountAmount = Math.round((grandTotal * projectInfo.discountPercent) / 100);
    finalTotal = grandTotal - discountAmount;
    footerRows.push(['', '', '', `СКИДКА (${projectInfo.discountPercent}%)`, '', '', '', -discountAmount]);
  }

  footerRows.push(['', '', '', 'ИТОГОВАЯ СТОИМОСТЬ ПОД КЛЮЧ', '', '', '', finalTotal]);

  const allRows = [...headerData, ...rows, ...footerRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  ws['!cols'] = [
    { wch: 5 }, // №
    { wch: 15 }, // Раздел
    { wch: 15 }, // Категория
    { wch: 45 }, // Наименование
    { wch: 10 }, // Кол-во
    { wch: 10 }, // Ед. изм.
    { wch: 14 }, // Цена
    { wch: 16 }, // Сумма
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Смета');
  const safeTitle = (projectInfo.title || 'Смета').replace(/[/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(wb, `${safeTitle}_Инженерия.xlsx`);
}

// 4. Generate clean text estimate for WhatsApp / Telegram
export function generateEstimateTxt(
  estimateItems: EstimateItem[],
  projectInfo: ProjectInfo,
  grandTotal: number
): string {
  const line = '━'.repeat(42);
  const doubleLine = '═'.repeat(42);

  let text = `${doubleLine}\n`;
  text += `   КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ (СМЕТА)\n`;
  text += `${doubleLine}\n\n`;

  if (projectInfo.title) text += `📌 Объект: ${projectInfo.title}\n`;
  if (projectInfo.clientName) text += `👤 Заказчик: ${projectInfo.clientName}\n`;
  if (projectInfo.address) text += `📍 Адрес: ${projectInfo.address}\n`;
  text += `📅 Дата: ${projectInfo.date || new Date().toLocaleDateString('ru-RU')}\n`;
  text += `${line}\n\n`;

  // Group items by section
  const sections = ['Климат', 'Электрика', 'Сантехника', 'Дополнительно'];
  
  sections.forEach((sectName) => {
    const items = estimateItems.filter((i) => i.section === sectName);
    if (items.length > 0) {
      const sectTotal = items.reduce((acc, curr) => acc + curr.total, 0);
      text += `▶ [${sectName.toUpperCase()}] — ${sectTotal.toLocaleString('ru-RU')} руб.\n`;
      items.forEach((item) => {
        text += ` • ${item.name}\n   ${item.quantity} ${item.unit} × ${item.price.toLocaleString('ru-RU')} руб. = ${item.total.toLocaleString('ru-RU')} руб.\n`;
      });
      text += '\n';
    }
  });

  text += `${doubleLine}\n`;
  text += `ИТОГО БЕЗ СКИДКИ: ${grandTotal.toLocaleString('ru-RU')} руб.\n`;

  if (projectInfo.discountPercent > 0) {
    const discountAmount = Math.round((grandTotal * projectInfo.discountPercent) / 100);
    const finalTotal = grandTotal - discountAmount;
    text += `Скидка ${projectInfo.discountPercent}%: -${discountAmount.toLocaleString('ru-RU')} руб.\n`;
    text += `${line}\n`;
    text += `ИТОГОВАЯ СТОИМОСТЬ СО СКИДКОЙ: ${finalTotal.toLocaleString('ru-RU')} руб.\n`;
  } else {
    text += `ИТОГОВАЯ СТОИМОСТЬ ПОД КЛЮЧ: ${grandTotal.toLocaleString('ru-RU')} руб.\n`;
  }

  text += `${doubleLine}\n`;
  if (projectInfo.notes) {
    text += `\nПримечание: ${projectInfo.notes}\n`;
  }

  return text;
}
