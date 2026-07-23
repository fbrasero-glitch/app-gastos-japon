import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { calculateBalances, simplifyDebts } from '../utils/debtCalculator';
import { formatEUR } from '../utils/currency';
import { Scale, ArrowRight, CheckCircle2, Building2, User, Handshake, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function DebtBalances() {
  const { expenses, members, units, exchangeRate, settleDebt } = useExpenses();
  const [viewLevel, setViewLevel] = useState('units'); // 'units' | 'members'
  const [successMessage, setSuccessMessage] = useState(null);

  // Excluir gastos que ya hayan sido saldados si se desea ver solo lo pendiente
  const activeExpenses = expenses.filter(exp => !exp.isSettlement);

  // Calcular saldos
  const { memberBalances, unitBalances } = calculateBalances(activeExpenses, members, units, exchangeRate);

  // Entidades a simplificar según el nivel seleccionado
  const entitiesToSimplify = viewLevel === 'units'
    ? Object.values(unitBalances).map(u => ({ id: u.unitId, name: u.unitName, netEUR: u.netEUR }))
    : Object.values(memberBalances).map(m => ({ id: m.memberId, name: m.memberName, netEUR: m.netEUR }));

  // Algoritmo de simplificación
  const pendingDebts = simplifyDebts(entitiesToSimplify);

  const handleSettle = (debt) => {
    settleDebt({
      fromId: debt.fromId,
      toId: debt.toId,
      amountEUR: debt.amountEUR,
      isUnitLevel: viewLevel === 'units',
      notes: `${debt.fromName} saldó cuenta con ${debt.toName}`
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}

    setSuccessMessage(`¡Cuenta saldada! ${debt.fromName} ha pagado ${formatEUR(debt.amountEUR)} a ${debt.toName}.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>⚖️ Cuentas Pendientes</span>
        </h2>
        <p className="text-xs text-slate-400">Quién debe a quién y liquidación rápida en 1 clic</p>
      </div>

      {/* Alerta de Deuda Saldada */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in zoom-in duration-200">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Selector simple: Por Familia vs Por Integrante */}
      <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex gap-1">
        <button
          onClick={() => setViewLevel('units')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            viewLevel === 'units'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Por Familia / Unidad</span>
        </button>
        <button
          onClick={() => setViewLevel('members')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            viewLevel === 'members'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Por Integrante</span>
        </button>
      </div>

      {/* LISTA LIMPIA DE DEUDAS PENDIENTES */}
      {pendingDebts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-3 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-black text-slate-100">¡Todas las cuentas están saldadas! 🎉</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            No hay deudas pendientes en este momento. Al añadir nuevos gastos compartidos, aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            {pendingDebts.length} {pendingDebts.length === 1 ? 'cuenta pendiente por saldar' : 'cuentas pendientes por saldar'}
          </div>

          {pendingDebts.map((debt, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xl transition"
            >
              {/* Deudor -> Acreedor */}
              <div className="flex items-center gap-2 text-xs min-w-0 flex-1">
                <div className="truncate font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-xl">
                  {debt.fromName}
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                <div className="truncate font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl">
                  {debt.toName}
                </div>
              </div>

              {/* Importe y Botón Saldar */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-black text-slate-100 text-base">{formatEUR(debt.amountEUR)}</span>
                <button
                  onClick={() => handleSettle(debt)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-1"
                >
                  <Handshake className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Saldar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
