import React, { useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  PriceItem,
  ConsumptionNorms,
  HvacInputs,
  ElectricInputs,
  PlumbingInputs,
  ProjectInfo,
  SectionKey,
} from './types';
import {
  DEFAULT_PRICE_ITEMS,
  DEFAULT_CONSUMPTION_NORMS,
  SECTION_NAMES,
  SECTION_EMOJIS,
} from './constants/defaultPrices';
import { calculateFullEstimate } from './utils/calculator';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { HvacTab } from './components/tabs/HvacTab';
import { ElectricTab } from './components/tabs/ElectricTab';
import { PlumbingTab } from './components/tabs/PlumbingTab';
import { GeneralTab } from './components/tabs/GeneralTab';
import { PriceManagerTab } from './components/tabs/PriceManagerTab';
import { NormsTab } from './components/tabs/NormsTab';
import { EstimateTab } from './components/tabs/EstimateTab';
import { PrintableEstimate } from './components/PrintableEstimate';
import {
  Snowflake,
  Zap,
  Droplets,
  Wrench,
  Sliders,
  Coins,
  ReceiptText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const STORAGE_KEY_PRICES = 'engineering_calc_prices_v1';
const STORAGE_KEY_NORMS = 'engineering_calc_norms_v1';
const STORAGE_KEY_INPUTS = 'engineering_calc_inputs_v1';
const STORAGE_KEY_ROLE = 'engineering_calc_role_v1';

export default function App() {
  // Role & Auth State
  const [role, setRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE);
    if (saved === 'admin') return 'admin';
    if (saved === 'guest') return 'guest';
    return null; // Locked until user enters code!
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE);
    return saved !== 'admin' && saved !== 'guest';
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('hvac');

  // Prices & Norms State
  const [priceItems, setPriceItems] = useState<PriceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRICES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRICE_ITEMS;
  });

  const [norms, setNorms] = useState<ConsumptionNorms>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NORMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CONSUMPTION_NORMS;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'error'>('local');

  // Work Quantities State
  const [hvacInputs, setHvacInputs] = useState<HvacInputs>({
    blocks: 0,
    pipeMeters: 0,
    mode: 'standard',
    pump: 0,
    boxMeters: 0,
    coreHoles: 0,
    chasingBrick: 0,
    chasingConcrete: 0,
  });

  const [electricInputs, setElectricInputs] = useState<ElectricInputs>({
    points: 0,
    chasingMeters: 0,
    breakers: 0,
  });

  const [plumbingInputs, setPlumbingInputs] = useState<PlumbingInputs>({
    points: 0,
    collectors: 0,
  });

  const [dynamicQuantities, setDynamicQuantities] = useState<Record<string, number>>({});

  // Project Info State
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    title: '',
    clientName: '',
    clientPhone: '',
    address: '',
    date: new Date().toISOString().slice(0, 10),
    discountPercent: 0,
    notes: '',
  });

  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Load from server on mount
  useEffect(() => {
    async function loadServerData() {
      try {
        const res = await fetch('/api/prices');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (json.data.priceItems && Array.isArray(json.data.priceItems)) {
              setPriceItems(json.data.priceItems);
              localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(json.data.priceItems));
            }
            if (json.data.norms) {
              setNorms(json.data.norms);
              localStorage.setItem(STORAGE_KEY_NORMS, JSON.stringify(json.data.norms));
            }
            setSyncStatus('synced');
          }
        }
      } catch (err) {
        console.warn('Backend /api/prices unavailable, using local storage.');
      }
    }
    loadServerData();
  }, []);

  // Sync role to localStorage
  useEffect(() => {
    if (role) {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_KEY_ROLE);
    }
  }, [role]);

  // Save changes to localStorage & auto-sync to backend in background
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(priceItems));
    const timer = setTimeout(() => {
      fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceItems, norms, updatedAt: new Date().toISOString() }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [priceItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NORMS, JSON.stringify(norms));
    const timer = setTimeout(() => {
      fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceItems, norms, updatedAt: new Date().toISOString() }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [norms]);

  const handleSaveToServer = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceItems, norms, updatedAt: new Date().toISOString() }),
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setPriceItems([...DEFAULT_PRICE_ITEMS]);
    setNorms({ ...DEFAULT_CONSUMPTION_NORMS });
  };

  const handleResetAllQuantities = () => {
    setHvacInputs({
      blocks: 0,
      pipeMeters: 0,
      mode: 'standard',
      pump: 0,
      boxMeters: 0,
      coreHoles: 0,
      chasingBrick: 0,
      chasingConcrete: 0,
    });
    setElectricInputs({
      points: 0,
      chasingMeters: 0,
      breakers: 0,
    });
    setPlumbingInputs({
      points: 0,
      collectors: 0,
    });
    setDynamicQuantities({});
  };

  const handleDynamicQuantityChange = (itemId: string, qty: number) => {
    setDynamicQuantities((prev) => ({
      ...prev,
      [itemId]: qty,
    }));
  };

  // Perform full reactive calculation
  const calculation = useMemo(() => {
    return calculateFullEstimate(
      priceItems,
      norms,
      hvacInputs,
      electricInputs,
      plumbingInputs,
      dynamicQuantities
    );
  }, [priceItems, norms, hvacInputs, electricInputs, plumbingInputs, dynamicQuantities]);

  // Tabs configuration
  const tabsList = useMemo(() => {
    const list = [
      { id: 'hvac', label: 'Климат', emoji: '❄️', icon: Snowflake, count: calculation.hvacTotal },
      { id: 'electric', label: 'Электрика', emoji: '⚡', icon: Zap, count: calculation.electricTotal },
      { id: 'plumbing', label: 'Сантехника', emoji: '🚰', icon: Droplets, count: calculation.plumbingTotal },
      { id: 'general', label: 'Дополнительно', emoji: '🛠️', icon: Wrench, count: calculation.generalTotal },
    ];

    if (role === 'admin') {
      list.push(
        { id: 'norms', label: 'Расход', emoji: '📊', icon: Sliders, count: 0 },
        { id: 'prices', label: 'Прайс-лист', emoji: '💰', icon: Coins, count: 0 }
      );
    }

    list.push({
      id: 'estimate',
      label: 'Итог',
      emoji: '🧾',
      icon: ReceiptText,
      count: calculation.grandTotal,
    });

    return list;
  }, [role, calculation]);

  // Adjust active tab if user was on admin tab and logged out
  useEffect(() => {
    if (role === 'guest' && (activeTab === 'norms' || activeTab === 'prices')) {
      setActiveTab('estimate');
    }
  }, [role, activeTab]);

  const tabBarRef = React.useRef<HTMLDivElement>(null);
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabBarRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      tabBarRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        role={role}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        grandTotal={calculation.grandTotal}
        projectTitle={projectInfo.title}
        isSaving={isSaving}
        syncStatus={syncStatus}
      />

      {/* Main Container (Blurred and protected until user logs in) */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 transition-all duration-300 ${!role ? 'filter blur-md pointer-events-none select-none opacity-25' : ''}`}>
        {/* Navigation Tabs Bar with touch swipe & mobile scroll buttons */}
        <div className="relative border-b border-slate-800 pb-2.5 mb-5">
          <div className="flex items-center gap-1.5">
            {/* Left scroll chevron (mobile only) */}
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              title="Прокрутить вкладки влево"
              aria-label="Влево"
              className="lg:hidden p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl shrink-0 active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Tabs */}
            <div
              ref={tabBarRef}
              className="flex-1 flex items-center gap-2 overflow-x-auto touch-scroll-x no-scrollbar scroll-smooth flex-nowrap lg:flex-wrap py-1"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
            >
              {tabsList.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => {
                      setActiveTab(tab.id);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
                    }}
                    style={{ touchAction: 'pan-x pan-y' }}
                    className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition relative select-none ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                          isActive ? 'bg-black/30 text-emerald-300' : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        {tab.count.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right scroll chevron (mobile only) */}
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              title="Прокрутить вкладки вправо"
              aria-label="Вправо"
              className="lg:hidden p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl shrink-0 active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === 'hvac' && (
            <HvacTab
              inputs={hvacInputs}
              onChange={setHvacInputs}
              priceItems={priceItems}
              dynamicQuantities={dynamicQuantities}
              onDynamicQuantityChange={handleDynamicQuantityChange}
              sectionTotal={calculation.hvacTotal}
            />
          )}

          {activeTab === 'electric' && (
            <ElectricTab
              inputs={electricInputs}
              onChange={setElectricInputs}
              priceItems={priceItems}
              norms={norms}
              dynamicQuantities={dynamicQuantities}
              onDynamicQuantityChange={handleDynamicQuantityChange}
              sectionTotal={calculation.electricTotal}
            />
          )}

          {activeTab === 'plumbing' && (
            <PlumbingTab
              inputs={plumbingInputs}
              onChange={setPlumbingInputs}
              priceItems={priceItems}
              norms={norms}
              dynamicQuantities={dynamicQuantities}
              onDynamicQuantityChange={handleDynamicQuantityChange}
              sectionTotal={calculation.plumbingTotal}
            />
          )}

          {activeTab === 'general' && (
            <GeneralTab
              priceItems={priceItems}
              dynamicQuantities={dynamicQuantities}
              onDynamicQuantityChange={handleDynamicQuantityChange}
              sectionTotal={calculation.generalTotal}
              onOpenPriceManager={() => setActiveTab('prices')}
              isAdmin={role === 'admin'}
            />
          )}

          {activeTab === 'norms' && role === 'admin' && (
            <NormsTab
              norms={norms}
              onUpdateNorms={setNorms}
            />
          )}

          {activeTab === 'prices' && role === 'admin' && (
            <PriceManagerTab
              priceItems={priceItems}
              onUpdatePriceItems={setPriceItems}
              onResetToDefaults={handleResetToDefaults}
            />
          )}

          {activeTab === 'estimate' && (
            <EstimateTab
              estimateItems={calculation.allEstimateItems}
              grandTotal={calculation.grandTotal}
              workTotal={calculation.workTotal}
              materialTotal={calculation.materialTotal}
              extraTotal={calculation.extraTotal}
              hvacTotal={calculation.hvacTotal}
              electricTotal={calculation.electricTotal}
              plumbingTotal={calculation.plumbingTotal}
              generalTotal={calculation.generalTotal}
              projectInfo={projectInfo}
              onUpdateProjectInfo={setProjectInfo}
              onResetAllQuantities={handleResetAllQuantities}
              onPrint={() => setIsPrintOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen || !role}
        isLocked={!role}
        onClose={() => {
          if (role) setIsAuthOpen(false);
        }}
        onLogin={(newRole) => {
          setRole(newRole);
          setIsAuthOpen(false);
          if (newRole === 'guest' && (activeTab === 'norms' || activeTab === 'prices')) {
            setActiveTab('hvac');
          }
        }}
      />

      <PrintableEstimate
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        estimateItems={calculation.allEstimateItems}
        grandTotal={calculation.grandTotal}
        workTotal={calculation.workTotal}
        materialTotal={calculation.materialTotal}
        extraTotal={calculation.extraTotal}
        projectInfo={projectInfo}
      />
    </div>
  );
}
