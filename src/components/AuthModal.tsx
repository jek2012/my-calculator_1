import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, KeyRound, HardHat, X, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  isLocked?: boolean;
  onClose: () => void;
  onLogin: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  isLocked = false,
  onClose,
  onLogin,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<UserRole>('guest');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = password.trim();

    if (selectedProfile === 'admin') {
      if (trimmed === 'admin') {
        onLogin('admin');
        onClose();
        setPassword('');
        setError('');
      } else {
        setError('Неверный код доступа администратора');
      }
    } else {
      if (trimmed === '123') {
        onLogin('guest');
        onClose();
        setPassword('');
        setError('');
      } else {
        setError('Неверный код доступа монтажника');
      }
    }
  };

  const handleSelectProfile = (profile: UserRole) => {
    setSelectedProfile(profile);
    setPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
        {!isLocked && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Вход в калькулятор</h3>
            <p className="text-xs text-slate-400">
              {isLocked
                ? 'Выберите профиль и введите персональный код'
                : 'Смена профиля пользователя'}
            </p>
          </div>
        </div>

        {/* Profile Selection Cards */}
        <div className="space-y-2 mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            1. Выберите профиль:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Admin Card */}
            <button
              type="button"
              onClick={() => handleSelectProfile('admin')}
              className={`p-3.5 rounded-2xl text-left transition border ${
                selectedProfile === 'admin'
                  ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm mb-1">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Администратор</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Управление тарифами, нормами расхода и базой
              </p>
            </button>

            {/* Installer Card */}
            <button
              type="button"
              onClick={() => handleSelectProfile('guest')}
              className={`p-3.5 rounded-2xl text-left transition border ${
                selectedProfile === 'guest'
                  ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-400/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm mb-1">
                <HardHat className="w-4 h-4 shrink-0" />
                <span>Монтажник</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Ввод объемов работ, расчет и выгрузка сметы
              </p>
            </button>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              2. Код доступа ({selectedProfile === 'admin' ? 'Администратора' : 'Монтажника'}):
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition pr-10 font-mono"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                title={showPassword ? 'Скрыть код' : 'Показать код'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center space-x-1.5 text-rose-400 text-xs mt-2 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] ${
              selectedProfile === 'admin'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            <span>
              Войти как {selectedProfile === 'admin' ? 'Администратор' : 'Монтажник'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
