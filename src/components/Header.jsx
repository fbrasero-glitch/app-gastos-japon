import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { RefreshCw, Users, UserCheck, Lock, LogOut, Cloud, CloudOff } from 'lucide-react';

export function Header() {
  const {
    exchangeRate,
    setExchangeRate,
    filterFamilyOnly,
    setFilterFamilyOnly,
    expenses,
    members,
    currentMemberId,
    logoutCurrentMember,
    isFirebaseConnected
  } = useExpenses();

  const [showRateModal, setShowRateModal] = useState(false);
  const [tempRate, setTempRate] = useState(exchangeRate.toString());

  const activeMember = members.find(m => m.id === currentMemberId);

  const handleSaveRate = () => {
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      setExchangeRate(val);
      setShowRateModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        
        {/* Título y Logo / Perfil Activo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-xl shadow-md shadow-red-500/20 border border-white/20">
            💴
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 leading-tight flex items-center gap-1.5">
              Gastos Japón
              {/* Indicador de conexión Firebase */}
              <span className={`w-2 h-2 rounded-full inline-block ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} title={isFirebaseConnected ? 'Firebase Realtime Cloud Conectado' : 'Modo Offline / Local'}></span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Perfil:</span>
              <strong className="text-emerald-400 font-bold flex items-center gap-0.5">
                {activeMember?.avatar} {activeMember?.name}
              </strong>
            </p>
          </div>
        </div>

        {/* Acciones del Encabezado */}
        <div className="flex items-center gap-2">
          
          {/* Botón Tasa de Cambio */}
          <button
            onClick={() => { setTempRate(exchangeRate.toString()); setShowRateModal(true); }}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border border-amber-500/30 font-medium transition-all active:scale-95 shadow-sm"
            title="Cambiar tipo de cambio EUR/JPY"
          >
            <span className="text-[10px] text-slate-400">1€ =</span>
            <span className="font-bold">{exchangeRate}¥</span>
            <RefreshCw className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {/* Toggle "Mi Familia" vs "Todos" */}
          <button
            onClick={() => setFilterFamilyOnly(!filterFamilyOnly)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all active:scale-95 shadow-md ${
              filterFamilyOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/30 ring-2 ring-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {filterFamilyOnly ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mi Familia</span>
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Grupo</span>
              </>
            )}
          </button>

          {/* Botón de Bloqueo / Cambiar Perfil */}
          <button
            onClick={logoutCurrentMember}
            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 transition active:scale-95"
            title="Bloquear Perfil / Cambiar de Integrante"
          >
            <Lock className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Modal Rápido para Cambiar Tasa de Cambio */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-xs shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              <span>Tipo de Cambio (JPY/EUR)</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Introduce cuántos Yenes (JPY) equivalen a 1 Euro (€). Se usará para las conversiones automáticas.
            </p>

            <div className="space-y-1">
              <label className="text-xs text-amber-400 font-semibold">1 Euro (€) =</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-slate-100 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 pr-12"
                  placeholder="165"
                />
                <span className="absolute right-3 text-slate-400 font-bold">JPY ¥</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRateModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRate}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:brightness-110 transition shadow-lg shadow-amber-500/20"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
