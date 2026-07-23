import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { RefreshCw, Download, Upload, RotateCcw, Building2, Users, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

export function SettingsModal() {
  const { exchangeRate, setExchangeRate, units, members, expenses, resetToDefaults } = useExpenses();
  const [rateInput, setRateInput] = useState(exchangeRate.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveRate = (e) => {
    e.preventDefault();
    const val = parseFloat(rateInput);
    if (!isNaN(val) && val > 0) {
      setExchangeRate(val);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // Exportar Copia de Seguridad JSON
  const handleExportJSON = () => {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      exchangeRate,
      units,
      members,
      expenses
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `gastos_japon_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar Copia de Seguridad JSON
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.expenses && parsed.members && parsed.units) {
          localStorage.setItem('japon_expenses', JSON.stringify(parsed.expenses));
          localStorage.setItem('japon_members', JSON.stringify(parsed.members));
          localStorage.setItem('japon_units', JSON.stringify(parsed.units));
          if (parsed.exchangeRate) {
            localStorage.setItem('japon_exchange_rate', parsed.exchangeRate.toString());
          }
          window.location.reload();
        } else {
          alert('El archivo JSON no tiene el formato correcto.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>⚙️ Ajustes y Configuración</span>
        </h2>
        <p className="text-xs text-slate-400">Gestión de divisa, unidades familiares y copias de seguridad</p>
      </div>

      {/* 1. Tipo de Cambio JPY / EUR */}
      <form onSubmit={handleSaveRate} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Tipo de Cambio Oficial / Personalizado</span>
          </label>
        </div>

        <p className="text-xs text-slate-400">
          Ratio de conversión para convertir Yenes (JPY) a Euros (€) en toda la aplicación.
        </p>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.1"
              required
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-slate-100 font-bold text-base focus:outline-none pr-16"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">JPY / €</span>
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Guardado</span>
              </>
            ) : (
              <span>Actualizar</span>
            )}
          </button>
        </div>
      </form>

      {/* 2. Resumen de Integrantes y Unidades Económicas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Unidades Económicas Registradas</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-bold">8 integrantes</span>
        </div>

        <div className="space-y-2">
          {units.map((u) => {
            const unitMembers = members.filter(m => m.unitId === u.id);
            return (
              <div key={u.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{u.name}</span>
                  <span className="text-[10px] text-slate-400">{unitMembers.length} personas</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {unitMembers.map(m => (
                    <span key={m.id} className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                      <span>{m.avatar}</span>
                      <span>{m.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Copias de Seguridad (Exportar / Importar) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Copia de Seguridad y Datos (LocalStorage)</span>
        </h3>

        <p className="text-xs text-slate-400">
          Guarda tus gastos en un archivo JSON o restáuralos en otro dispositivo móvil sin necesidad de servidor backend.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportJSON}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Backup</span>
          </button>

          <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Importar Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4. Restablecer Datos de Ejemplo / Reiniciar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          <span>Zona de Restablecimiento</span>
        </h3>

        <p className="text-xs text-slate-400">
          Reinicia la aplicación a sus valores y gastos predeterminados de ejemplo.
        </p>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Datos Iniciales</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
            <span className="text-xs text-red-300 font-bold block">¿Estás seguro de reiniciar todos los gastos?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setConfirmReset(false);
                }}
                className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
              >
                Sí, Reiniciar
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
