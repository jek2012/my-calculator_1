import {
  PriceItem,
  ConsumptionNorms,
  HvacInputs,
  ElectricInputs,
  PlumbingInputs,
  EstimateItem,
  SectionKey,
} from '../types';

export interface CalculationResult {
  allEstimateItems: EstimateItem[];
  hvacEstimateItems: EstimateItem[];
  electricEstimateItems: EstimateItem[];
  plumbingEstimateItems: EstimateItem[];
  generalEstimateItems: EstimateItem[];
  hvacTotal: number;
  electricTotal: number;
  plumbingTotal: number;
  generalTotal: number;
  workTotal: number;
  materialTotal: number;
  extraTotal: number;
  grandTotal: number;
}

// Find price item by techName or ID
function findPrice(items: PriceItem[], section: SectionKey, techName: string, fallbackPrice = 0): number {
  const item = items.find(
    (i) => i.section === section && (i.techName === techName || i.id === techName)
  );
  return item ? item.price : fallbackPrice;
}

export function calculateFullEstimate(
  priceItems: PriceItem[],
  norms: ConsumptionNorms,
  hvac: HvacInputs,
  elec: ElectricInputs,
  plumb: PlumbingInputs,
  dynamicQuantities: Record<string, number>
): CalculationResult {
  const hvacItems: EstimateItem[] = [];
  const electricItems: EstimateItem[] = [];
  const plumbingItems: EstimateItem[] = [];
  const generalItems: EstimateItem[] = [];

  // --- 1. КЛИМАТ ---
  const prHvac = {
    work_standard: findPrice(priceItems, 'hvac', 'work_standard', 6000),
    work_stage_1: findPrice(priceItems, 'hvac', 'work_stage_1', 4500),
    work_stage_2: findPrice(priceItems, 'hvac', 'work_stage_2', 2500),
    pipe: findPrice(priceItems, 'hvac', 'pipe', 1500),
    bracket: findPrice(priceItems, 'hvac', 'bracket', 1200),
    drain: findPrice(priceItems, 'hvac', 'drain', 250),
    pump: findPrice(priceItems, 'hvac', 'pump', 5500),
    box: findPrice(priceItems, 'hvac', 'box', 450),
    chasing_brick: findPrice(priceItems, 'hvac', 'chasing_brick', 500),
    chasing_concrete: findPrice(priceItems, 'hvac', 'chasing_concrete', 1000),
    coring: findPrice(priceItems, 'hvac', 'coring', 2500),
  };

  if (hvac.blocks > 0) {
    if (hvac.mode === 'standard') {
      hvacItems.push({
        id: 'hvac_work_main',
        techName: 'work_standard',
        section: 'Климат',
        sectionKey: 'hvac',
        name: `Монтаж кондиционера стандартный (${hvac.blocks} шт.)`,
        quantity: hvac.blocks,
        unit: 'шт.',
        price: prHvac.work_standard,
        total: hvac.blocks * prHvac.work_standard,
        category: 'Работа',
      });
    } else if (hvac.mode === 'stage_1') {
      hvacItems.push({
        id: 'hvac_work_main',
        techName: 'work_stage_1',
        section: 'Климат',
        sectionKey: 'hvac',
        name: `Монтаж кондиционера: 1-й этап закладки трассы (${hvac.blocks} шт.)`,
        quantity: hvac.blocks,
        unit: 'шт.',
        price: prHvac.work_stage_1,
        total: hvac.blocks * prHvac.work_stage_1,
        category: 'Работа',
      });
    } else if (hvac.mode === 'stage_2') {
      hvacItems.push({
        id: 'hvac_work_main',
        techName: 'work_stage_2',
        section: 'Климат',
        sectionKey: 'hvac',
        name: `Монтаж кондиционера: 2-й этап навески блоков (${hvac.blocks} шт.)`,
        quantity: hvac.blocks,
        unit: 'шт.',
        price: prHvac.work_stage_2,
        total: hvac.blocks * prHvac.work_stage_2,
        category: 'Работа',
      });
    }

    // Material lines (only for standard and stage 1)
    if (hvac.mode !== 'stage_2') {
      if (hvac.pipeMeters > 0) {
        hvacItems.push({
          id: 'hvac_pipe',
          techName: 'pipe',
          section: 'Климат',
          sectionKey: 'hvac',
          name: `Медная фреоновая трасса (${hvac.pipeMeters} м.)`,
          quantity: hvac.pipeMeters,
          unit: 'м.',
          price: prHvac.pipe,
          total: hvac.pipeMeters * prHvac.pipe,
          category: 'Материал',
        });
        hvacItems.push({
          id: 'hvac_drain',
          techName: 'drain',
          section: 'Климат',
          sectionKey: 'hvac',
          name: `Дренажный шланг (${hvac.pipeMeters} м.)`,
          quantity: hvac.pipeMeters,
          unit: 'м.',
          price: prHvac.drain,
          total: hvac.pipeMeters * prHvac.drain,
          category: 'Материал',
        });
      }
      hvacItems.push({
        id: 'hvac_bracket',
        techName: 'bracket',
        section: 'Климат',
        sectionKey: 'hvac',
        name: `Кронштейны внешнего блока (${hvac.blocks} компл.)`,
        quantity: hvac.blocks,
        unit: 'компл.',
        price: prHvac.bracket,
        total: hvac.blocks * prHvac.bracket,
        category: 'Материал',
      });
    }
  }

  if (hvac.pump > 0) {
    hvacItems.push({
      id: 'hvac_pump',
      techName: 'pump',
      section: 'Климат',
      sectionKey: 'hvac',
      name: 'Установка дренажной помпы',
      quantity: hvac.pump,
      unit: 'шт.',
      price: prHvac.pump,
      total: hvac.pump * prHvac.pump,
      category: 'Работа',
    });
  }

  if (hvac.boxMeters > 0) {
    hvacItems.push({
      id: 'hvac_box',
      techName: 'box',
      section: 'Климат',
      sectionKey: 'hvac',
      name: 'Монтаж декоративного короба',
      quantity: hvac.boxMeters,
      unit: 'м.',
      price: prHvac.box,
      total: hvac.boxMeters * prHvac.box,
      category: 'Работа',
    });
  }

  if (hvac.chasingBrick > 0) {
    hvacItems.push({
      id: 'hvac_ch_b',
      techName: 'chasing_brick',
      section: 'Климат',
      sectionKey: 'hvac',
      name: 'Штроба под трассу (Кирпич)',
      quantity: hvac.chasingBrick,
      unit: 'м.',
      price: prHvac.chasing_brick,
      total: hvac.chasingBrick * prHvac.chasing_brick,
      category: 'Работа',
    });
  }

  if (hvac.chasingConcrete > 0) {
    hvacItems.push({
      id: 'hvac_ch_c',
      techName: 'chasing_concrete',
      section: 'Климат',
      sectionKey: 'hvac',
      name: 'Штроба под трассу (Монолит)',
      quantity: hvac.chasingConcrete,
      unit: 'м.',
      price: prHvac.chasing_concrete,
      total: hvac.chasingConcrete * prHvac.chasing_concrete,
      category: 'Работа',
    });
  }

  if (hvac.coreHoles > 0) {
    hvacItems.push({
      id: 'hvac_core',
      techName: 'coring',
      section: 'Климат',
      sectionKey: 'hvac',
      name: 'Алмазное бурение отверстия',
      quantity: hvac.coreHoles,
      unit: 'шт.',
      price: prHvac.coring,
      total: hvac.coreHoles * prHvac.coring,
      category: 'Работа',
    });
  }

  // --- 2. ЭЛЕКТРИКА ---
  const prElec = {
    point: findPrice(priceItems, 'electric', 'point', 450),
    chasing: findPrice(priceItems, 'electric', 'chasing', 350),
    breaker: findPrice(priceItems, 'electric', 'breaker', 350),
    cable_1_5: findPrice(priceItems, 'electric', 'cable_1.5', 75),
    cable_2_5: findPrice(priceItems, 'electric', 'cable_2.5', 110),
    cable_4_0: findPrice(priceItems, 'electric', 'cable_4.0', 180),
    corrugation: findPrice(priceItems, 'electric', 'corrugation', 40),
    clips: findPrice(priceItems, 'electric', 'clips', 5),
  };

  if (elec.points > 0) {
    electricItems.push({
      id: 'elec_point',
      techName: 'point',
      section: 'Электрика',
      sectionKey: 'electric',
      name: `Монтаж электроточек (${elec.points} шт.)`,
      quantity: elec.points,
      unit: 'шт.',
      price: prElec.point,
      total: elec.points * prElec.point,
      category: 'Работа',
    });

    const totalCable = Math.round(elec.points * norms.cablePerPoint * 10) / 10;
    const c15 = Math.round(totalCable * norms.cableLightRatio * 10) / 10;
    const c25 = Math.round(totalCable * norms.cableSocketRatio * 10) / 10;
    const c40 = Math.round(totalCable * norms.cablePowerRatio * 10) / 10;
    const clipsQty = Math.round(totalCable * norms.clipsPerMeter);

    electricItems.push({
      id: 'elec_c15',
      techName: 'cable_1.5',
      section: 'Электрика',
      sectionKey: 'electric',
      name: 'Кабель ВВГнг-LS 3х1.5 (Освещение)',
      quantity: c15,
      unit: 'м.',
      price: prElec.cable_1_5,
      total: Math.round(c15 * prElec.cable_1_5),
      category: 'Материал',
    });

    electricItems.push({
      id: 'elec_c25',
      techName: 'cable_2.5',
      section: 'Электрика',
      sectionKey: 'electric',
      name: 'Кабель ВВГнг-LS 3х2.5 (Розетки)',
      quantity: c25,
      unit: 'м.',
      price: prElec.cable_2_5,
      total: Math.round(c25 * prElec.cable_2_5),
      category: 'Материал',
    });

    electricItems.push({
      id: 'elec_c40',
      techName: 'cable_4.0',
      section: 'Электрика',
      sectionKey: 'electric',
      name: 'Кабель ВВГнг-LS 3х4.0 (Силовой)',
      quantity: c40,
      unit: 'м.',
      price: prElec.cable_4_0,
      total: Math.round(c40 * prElec.cable_4_0),
      category: 'Материал',
    });

    electricItems.push({
      id: 'elec_corr',
      techName: 'corrugation',
      section: 'Электрика',
      sectionKey: 'electric',
      name: 'Гофра защитная негорючая',
      quantity: totalCable,
      unit: 'м.',
      price: prElec.corrugation,
      total: Math.round(totalCable * prElec.corrugation),
      category: 'Материал',
    });

    electricItems.push({
      id: 'elec_clips',
      techName: 'clips',
      section: 'Электрика',
      sectionKey: 'electric',
      name: 'Крепеж/Клипсы для гофры',
      quantity: clipsQty,
      unit: 'шт.',
      price: prElec.clips,
      total: clipsQty * prElec.clips,
      category: 'Материал',
    });
  }

  if (elec.chasingMeters > 0) {
    electricItems.push({
      id: 'elec_chasing',
      techName: 'chasing',
      section: 'Электрика',
      sectionKey: 'electric',
      name: `Штробление стен (${elec.chasingMeters} м.)`,
      quantity: elec.chasingMeters,
      unit: 'м.',
      price: prElec.chasing,
      total: elec.chasingMeters * prElec.chasing,
      category: 'Работа',
    });
  }

  if (elec.breakers > 0) {
    electricItems.push({
      id: 'elec_breaker',
      techName: 'breaker',
      section: 'Электрика',
      sectionKey: 'electric',
      name: `Установка автоматов в щит (${elec.breakers} шт.)`,
      quantity: elec.breakers,
      unit: 'шт.',
      price: prElec.breaker,
      total: elec.breakers * prElec.breaker,
      category: 'Работа',
    });
  }

  // --- 3. САНТЕХНИКА ---
  const prPlumb = {
    point: findPrice(priceItems, 'plumbing', 'point', 3500),
    collector: findPrice(priceItems, 'plumbing', 'collector', 8500),
    pipe_16: findPrice(priceItems, 'plumbing', 'pipe_16', 220),
    pipe_20: findPrice(priceItems, 'plumbing', 'pipe_20', 310),
    fitting: findPrice(priceItems, 'plumbing', 'fitting', 600),
  };

  if (plumb.points > 0) {
    plumbingItems.push({
      id: 'plumb_point',
      techName: 'point',
      section: 'Сантехника',
      sectionKey: 'plumbing',
      name: `Монтаж точек водоразбора (${plumb.points} шт.)`,
      quantity: plumb.points,
      unit: 'шт.',
      price: prPlumb.point,
      total: plumb.points * prPlumb.point,
      category: 'Работа',
    });

    const totalPipe = Math.round(plumb.points * norms.pipePerPoint * 10) / 10;
    const p16 = Math.round(totalPipe * norms.pipe16Ratio * 10) / 10;
    const p20 = Math.round(totalPipe * norms.pipe20Ratio * 10) / 10;
    const fitQty = Math.round(plumb.points * norms.fittingPerPoint);

    plumbingItems.push({
      id: 'plumb_p16',
      techName: 'pipe_16',
      section: 'Сантехника',
      sectionKey: 'plumbing',
      name: 'Труба PEX-a 16мм',
      quantity: p16,
      unit: 'м.',
      price: prPlumb.pipe_16,
      total: Math.round(p16 * prPlumb.pipe_16),
      category: 'Материал',
    });

    plumbingItems.push({
      id: 'plumb_p20',
      techName: 'pipe_20',
      section: 'Сантехника',
      sectionKey: 'plumbing',
      name: 'Труба PEX-a 20мм (магистраль)',
      quantity: p20,
      unit: 'м.',
      price: prPlumb.pipe_20,
      total: Math.round(p20 * prPlumb.pipe_20),
      category: 'Материал',
    });

    plumbingItems.push({
      id: 'plumb_fit',
      techName: 'fitting',
      section: 'Сантехника',
      sectionKey: 'plumbing',
      name: 'Аксиальные фитинги/водорозетки',
      quantity: fitQty,
      unit: 'шт.',
      price: prPlumb.fitting,
      total: fitQty * prPlumb.fitting,
      category: 'Материал',
    });
  }

  if (plumb.collectors > 0) {
    plumbingItems.push({
      id: 'plumb_collector',
      techName: 'collector',
      section: 'Сантехника',
      sectionKey: 'plumbing',
      name: `Установка коллекторов (${plumb.collectors} шт.)`,
      quantity: plumb.collectors,
      unit: 'шт.',
      price: prPlumb.collector,
      total: plumb.collectors * prPlumb.collector,
      category: 'Работа',
    });
  }

  // --- 4. ДИНАМИЧЕСКИЕ И ДОПОЛНИТЕЛЬНЫЕ ПОЗИЦИИ ИЗ ТАБЛИЦЫ/EXCEL ---
  // Any position from priceItems that is either:
  // - not standard (isStandard === false or not in standard_keys)
  // - or has a custom quantity specified in dynamicQuantities
  const standardTechKeys = [
    'work_standard',
    'work_stage_1',
    'work_stage_2',
    'pipe',
    'bracket',
    'drain',
    'pump',
    'box',
    'chasing_brick',
    'chasing_concrete',
    'coring',
    'point',
    'cable_1.5',
    'cable_2.5',
    'cable_4.0',
    'corrugation',
    'clips',
    'breaker',
    'chasing',
    'collector',
    'pipe_16',
    'pipe_20',
    'fitting',
  ];

  priceItems.forEach((item) => {
    // Only check items that are non-standard dynamic items (added via Excel or Admin UI)
    const isStandardMathKey = standardTechKeys.includes(item.techName);
    if (!isStandardMathKey) {
      const qty = dynamicQuantities[item.id] || dynamicQuantities[item.techName] || 0;
      if (qty > 0) {
        const catRu = item.category === 'material' ? 'Материал' : item.category === 'extra' ? 'Дополнительно' : 'Работа';
        const estItem: EstimateItem = {
          id: item.id,
          techName: item.techName,
          section:
            item.section === 'hvac'
              ? 'Климат'
              : item.section === 'electric'
              ? 'Электрика'
              : item.section === 'plumbing'
              ? 'Сантехника'
              : 'Дополнительно',
          sectionKey: item.section,
          name: item.name,
          quantity: qty,
          unit: item.unit,
          price: item.price,
          total: qty * item.price,
          category: catRu,
        };

        if (item.section === 'hvac') {
          hvacItems.push(estItem);
        } else if (item.section === 'electric') {
          electricItems.push(estItem);
        } else if (item.section === 'plumbing') {
          plumbingItems.push(estItem);
        } else {
          generalItems.push(estItem);
        }
      }
    }
  });

  const allEstimateItems = [...hvacItems, ...electricItems, ...plumbingItems, ...generalItems];

  const hvacTotal = hvacItems.reduce((sum, item) => sum + item.total, 0);
  const electricTotal = electricItems.reduce((sum, item) => sum + item.total, 0);
  const plumbingTotal = plumbingItems.reduce((sum, item) => sum + item.total, 0);
  const generalTotal = generalItems.reduce((sum, item) => sum + item.total, 0);

  const workTotal = allEstimateItems
    .filter((i) => i.category === 'Работа')
    .reduce((sum, item) => sum + item.total, 0);

  const materialTotal = allEstimateItems
    .filter((i) => i.category === 'Материал')
    .reduce((sum, item) => sum + item.total, 0);

  const extraTotal = allEstimateItems
    .filter((i) => i.category === 'Дополнительно')
    .reduce((sum, item) => sum + item.total, 0);

  const grandTotal = hvacTotal + electricTotal + plumbingTotal + generalTotal;

  return {
    allEstimateItems,
    hvacEstimateItems: hvacItems,
    electricEstimateItems: electricItems,
    plumbingEstimateItems: plumbingItems,
    generalEstimateItems: generalItems,
    hvacTotal,
    electricTotal,
    plumbingTotal,
    generalTotal,
    workTotal,
    materialTotal,
    extraTotal,
    grandTotal,
  };
}
