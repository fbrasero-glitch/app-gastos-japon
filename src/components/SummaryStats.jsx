import React from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { CATEGORIES } from '../data/initialData';
import { formatEUR, formatJPY } from '../utils/currency';
import { calculateBalances, calculateFamilyStats } from '../utils/debtCalculator';
import { PieChart, Wallet, CreditCard, Coins, ShoppingBag, Utensils, Train, Building, Layers } from 'lucide-react';

export function SummaryStats() {
  const { expenses, members, units, exchangeRate } = useExpenses();

  const totalEUR = expenses.reduce((acc, exp) => acc + (exp.amountEUR || 0), 0);
  const totalJPY = Math.round(totalEUR * exchangeRate);

  // Estadísticas específicas de Mi Familia (u1)
  const familyStats = calculateFamilyStats(expenses, 'u1', members);

  // Gasto por Categoría
  const categoryTotals = CATEGORIES.map(cat => {
    const sumEUR = expenses
      .filter(exp => exp.category === cat.id)
      .reduce((acc, exp) => acc + (exp.amountEUR || 0), 0);
    const percentage = totalEUR > 0 ? (sumEUR / totalEUR) * 100 : 0;
    return { ...cat, sumEUR, percentage };
  }).sort((a, b) => b.sumEUR - a.sumEUR);

  // Gasto por Unidad Económica (Consumido/Debido)
  const { unitBalances } = calculateBalances(expenses, members, units, exchangeRate);
  const unitStats = Object.values(unitBalances).map(u => {
    const percentage = totalEUR > 0 ? (u.owedEUR / totalEUR) * 100 : 0;
    const unitInfo = units.find(unit => unit.id === u.unitId);
    return { ...u, percentage, unitInfo };
  });

  // Métodos de Pago
  const paymentStats = {
    card: expenses.filter(e => e.paymentMethod === 'card').reduce((acc, e) => acc + e.amountEUR, 0),
    cash_jpy: expenses.filter(e => e.paymentMethod === 'cash_jpy').reduce((acc, e) => acc + e.amountEUR, 0),
    cash_eur: expenses.filter(e => e.paymentMethod === 'cash_eur').reduce((acc, e) => acc + e.amountEUR, 0)
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>📊 Resumen y Estadísticas</span>
        </h2>
        <p className="text-xs text-slate-400">Visión consolidada del gasto en Euros (€)</p>
      </div>

      {/* KPI Cards Principal */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Grupo */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Grupo (8 pax)</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{formatEUR(totalEUR)}</div>
          <div className="text-[11px] font-bold text-amber-400">
            {formatJPY(totalJPY)} (@ {exchangeRate}¥)
          </div>
        </div>

        {/* Total Familia Principal */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Consumo Mi Familia (4)</span>
            <span>👨‍👩‍👧‍👦</span>
          </div>
          <div className="text-2xl font-black text-emerald-300">
            {formatEUR(familyStats.totalFamilyShareEUR)}
          </div>
          <div className="text-[11px] text-slate-400">
            {(totalEUR > 0 ? ((familyStats.totalFamilyShareEUR / totalEUR) * 100).toFixed(1) : 0)}% del total del grupo
          </div>
        </div>
      </div>

      {/* Gasto por Categoría */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Gasto por Categoría</span>
          <PieChart className="w-4 h-4 text-red-400" />
        </h3>

        <div className="space-y-3 pt-1">
          {categoryTotals.map(cat => (
            <div key={cat.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-100">{formatEUR(cat.sumEUR)}</span>
                  <span className="text-[10px] text-slate-500 ml-1.5">({cat.percentage.toFixed(1)}%)</span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gasto Consumido por Unidad Económica */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Reparto del Gasto por Unidad Familiar
        </h3>

        <div className="space-y-3">
          {unitStats.map(u => (
            <div key={u.unitId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{u.unitName}</span>
                <span className="font-black text-slate-100">
                  {formatEUR(u.owedEUR)} <span className="text-[10px] text-slate-500 font-normal">({u.percentage.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(u.percentage, 100)}%`,
                    backgroundColor: u.unitInfo?.colorHex || '#3B82F6'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ratio por Método de Pago */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Métodos de Pago Utilizados
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
            <span className="text-xs text-amber-400 font-bold block">💴 Efectivo Yenes</span>
            <span className="text-sm font-black text-slate-100">{formatEUR(paymentStats.cash_jpy)}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
            <span className="text-xs text-blue-400 font-bold block">💳 Tarjetas</span>
            <span className="text-sm font-black text-slate-100">{formatEUR(paymentStats.card)}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
            <span className="text-xs text-emerald-400 font-bold block">💶 Efectivo Euros</span>
            <span className="text-sm font-black text-slate-100">{formatEUR(paymentStats.cash_eur)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
