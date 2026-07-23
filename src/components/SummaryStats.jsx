import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { formatEUR, formatJPY } from '../utils/currency';
import { calculateBalances, calculateFamilyStats } from '../utils/debtCalculator';
import { Building2, User, Wallet, Sparkles } from 'lucide-react';

export function SummaryStats() {
  const { expenses, members, units, currentMemberId, exchangeRate } = useExpenses();
  const [viewTab, setViewTab] = useState('family'); // 'family' | 'individual'

  const activeMember = members.find(m => m.id === currentMemberId);
  const activeUnit = units.find(u => u.id === activeMember?.unitId);

  const totalGroupEUR = expenses.reduce((acc, exp) => acc + (exp.amountEUR || 0), 0);
  const totalGroupJPY = Math.round(totalGroupEUR * exchangeRate);

  // Estadísticas del grupo por unidad económica (lo consumido en total por cada familia)
  const { unitBalances, memberBalances } = calculateBalances(expenses, members, units, exchangeRate);

  const familyStatsList = Object.values(unitBalances).map(u => {
    const unitInfo = units.find(unit => unit.id === u.unitId);
    const percentage = totalGroupEUR > 0 ? (u.owedEUR / totalGroupEUR) * 100 : 0;
    return { ...u, unitInfo, percentage };
  });

  const memberStatsList = Object.values(memberBalances).map(m => {
    const memberInfo = members.find(mem => mem.id === m.memberId);
    const percentage = totalGroupEUR > 0 ? (m.owedEUR / totalGroupEUR) * 100 : 0;
    return { ...m, memberInfo, percentage };
  });

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>📊 Control de Gastos</span>
        </h2>
        <p className="text-xs text-slate-400">Totales consumidos a nivel familiar e individual en Euros (€)</p>
      </div>

      {/* KPI Principal Total Grupo */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4.5 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Gasto Total Acumulado</span>
          <div className="text-3xl font-black text-slate-100">{formatEUR(totalGroupEUR)}</div>
        </div>
        <div className="text-right">
          <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 block">
            {formatJPY(totalGroupJPY)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">@ 1€ = {exchangeRate}¥</span>
        </div>
      </div>

      {/* Selector Claro: Por Familia vs Por Integrante */}
      <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex gap-1">
        <button
          onClick={() => setViewTab('family')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            viewTab === 'family'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏠 Gastos por Familia</span>
        </button>
        <button
          onClick={() => setViewTab('individual')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            viewTab === 'individual'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>👤 Gastos Individuales</span>
        </button>
      </div>

      {/* 1. SECCIÓN FAMILIAR */}
      {viewTab === 'family' && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Consumo total por unidad familiar (3 familias)
          </div>

          <div className="space-y-2.5">
            {familyStatsList.map(item => {
              const isMyFamily = activeUnit?.id === item.unitId;
              return (
                <div
                  key={item.unitId}
                  className={`bg-slate-900/90 border p-4 rounded-2xl space-y-2 shadow-lg transition ${
                    isMyFamily
                      ? 'border-emerald-500/50 bg-emerald-950/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-${item.unitInfo?.color || 'slate'}-500`}></span>
                      <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                        <span>{item.unitName}</span>
                        {isMyFamily && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                            Tu Familia
                          </span>
                        )}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-100">{formatEUR(item.owedEUR)}</span>
                    </div>
                  </div>

                  {/* Barra de Proporción */}
                  <div className="space-y-1">
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor: item.unitInfo?.colorHex || '#3B82F6'
                        }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400 text-right font-medium">
                      Representa el {item.percentage.toFixed(1)}% del gasto del grupo
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SECCIÓN INDIVIDUAL */}
      {viewTab === 'individual' && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Consumo total por integrante (8 personas)
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {memberStatsList.map(item => {
              const isMe = currentMemberId === item.memberId;
              return (
                <div
                  key={item.memberId}
                  className={`bg-slate-900/90 border p-3.5 rounded-2xl space-y-1 shadow-md transition ${
                    isMe
                      ? 'border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.memberInfo?.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-100 text-xs truncate flex items-center gap-1">
                        <span>{item.memberName}</span>
                        {isMe && <span className="text-[9px] text-emerald-400 font-bold">(Tú)</span>}
                      </h4>
                      <span className="text-[10px] font-black text-emerald-400 block pt-0.5">
                        {formatEUR(item.owedEUR)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
