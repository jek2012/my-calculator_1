import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, HardHat, LogOut, Wrench, Lock } from 'lucide-react';

interface HeaderProps {
  role: UserRole | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  grandTotal: number;
  projectTitle: string;
  isSaving: boolean;
  syncStatus: 'synced' | 'local' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  role,
  onOpenAuth,
  onLogout,
  grandTotal,
  projectTitle,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Left: Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">
                  Инженерная Смета
                </h1>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                {projectTitle ? `Объект: ${projectTitle}` : 'Климат • Электрика • Сантехника'}
              </p>
            </div>
          </div>

          {/* Right: Quick Total & Compact Role Button */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Grand Total Pill (only when logged in) */}
            {role && (
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-right flex-shrink-0">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 block font-medium leading-none">
                  Итого
                </span>
                <span className="text-xs sm:text-base font-extrabold text-emerald-400 leading-tight">
                  {grandTotal.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {/* Role Button & Switch Profile */}
            {role === 'admin' ? (
              <button
                type="button"
                onClick={onLogout}
                title="Администратор: нажмите, чтобы выйти"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition active:scale-95 flex-shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Администратор</span>
                <span className="sm:hidden text-[11px]">Админ</span>
                <LogOut className="w-3 h-3 text-amber-400/80 ml-0.5 shrink-0" />
              </button>
            ) : role === 'guest' ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  title="Переключиться в режим администратора"
                  className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Для админа</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  title="Монтажник: нажмите для выхода"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-semibold transition active:scale-95 flex-shrink-0"
                >
                  <HardHat className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="hidden sm:inline">Монтажник</span>
                  <span className="sm:hidden text-[11px]">Монтажник</span>
                  <LogOut className="w-3 h-3 text-blue-400/80 ml-0.5 shrink-0" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                title="Войти в систему"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-blue-600/30 active:scale-95 flex-shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Войти</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
