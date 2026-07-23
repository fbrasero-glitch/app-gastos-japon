import React from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { Receipt, PlusCircle, Scale, BarChart3, Settings } from 'lucide-react';

export function BottomNav() {
  const { activeTab, setActiveTab } = useExpenses();

  const tabs = [
    { id: 'history', label: 'Historial', icon: Receipt },
    { id: 'balances', label: 'Balances', icon: Scale },
    { id: 'add', label: 'Añadir', icon: PlusCircle, isMain: true },
    { id: 'summary', label: 'Resumen', icon: BarChart3 },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isMain) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center relative -top-3 transition-transform active:scale-95 ${
                  isActive ? 'scale-105' : ''
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-red-600/40 ring-4 ring-slate-900 border border-white/30">
                  <PlusCircle className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-red-400 mt-1">Añadir Gasto</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
                isActive
                  ? 'text-red-400 font-bold bg-slate-800/60'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5] text-red-400' : 'stroke-2'}`} />
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
