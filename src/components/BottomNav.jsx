import React from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { PlusCircle, Scale, BarChart3 } from 'lucide-react';

export function BottomNav() {
  const { activeTab, setActiveTab } = useExpenses();

  const tabs = [
    { id: 'balances', label: 'Cuentas Pendientes', icon: Scale },
    { id: 'add', label: 'Añadir Gasto', icon: PlusCircle, isMain: true },
    { id: 'summary', label: 'Control de Gastos', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-4 py-2">
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
                  <PlusCircle className="w-8 h-8 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold text-red-400 mt-1">Añadir Gasto</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all ${
                isActive
                  ? 'text-red-400 font-bold bg-slate-800/80'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5] text-red-400' : 'stroke-2'}`} />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
