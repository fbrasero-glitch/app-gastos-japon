import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { calculateBalances, simplifyDebts } from '../utils/debtCalculator';
import { formatEUR } from '../utils/currency';
import { Scale, ArrowRight, CheckCircle2, Building2, User, Handshake, Sparkles, History, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export function DebtBalances() {
  const { expenses, members, units, exchangeRate, settleDebt } = useExpenses();
  const [viewLevel, setViewLevel] = useState('units'); // 'units' | 'members'
  const [showHistory, setShowHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // IMPORTANTE: Pasamos TODOS los gastos (incluidas las liquidaciones/pagos saldados)
  // para que cualquier pago individual reste o sume de forma matemáticamente exacta
  // en los balances de cada integrante y en el balance de su unidad familiar.
  const { memberBalances, unitBalances } = calculateBalances(expenses, members, units, exchangeRate);

  // Entidades a simplificar según el nivel seleccionado (Familia vs Integrante)
  const entitiesToSimplify = viewLevel === 'units'
    ? Object.values(unitBalances).map(u => ({ id: u.unitId, name: u.unitName, netEUR: u.netEUR }))
    : Object.values(memberBalances).map(m => ({ id: m.memberId, name: m.memberName, netEUR: m.netEUR }));

  // Algoritmo de simplificación de deudas pendientes
  const pendingDebts = simplifyDebts(entitiesToSimplify);

  // Lista de pagos saldados registrados previamente
  const settledHistory = expenses.filter(exp => exp.isSettlement);

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

    setSuccessMessage(`¡Liquidación registrada! ${debt.fromName} ha pagado ${formatEUR(debt.amountEUR)} a ${debt.toName}. El importe se ha restado del balance familiar correspondiente.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const getMemberName = (id) => members.find(m => m.id === id)?.name || id;
  const getMemberAvatar = (id) => members.find(m => m.id === id)?.avatar || '👤';

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>⚖️ Cuentas Pendientes y Liquidación</span>
        </h2>
        <p className="text-xs text-slate-400">
          Los pagos saldados individuales se restan automáticamente del balance familiar
        </p>
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
          <span>Por Integrante Individual</span>
        </button>
      </div>

      {/* LISTA DE DEUDAS PENDIENTES */}
      {pendingDebts.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-3 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-black text-slate-100">¡Cuentas saldadas al 100%! 🎉</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            No hay deudas pendientes en este nivel. Todos los saldos individuales y familiares se encuentran ajustados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            {pendingDebts.length} {pendingDebts.length === 1 ? 'cuenta pendiente' : 'cuentas pendientes'}
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

      {/* HISTORIAL DESPLEGABLE DE PAGOS SALDADOS (No se eliminan, quedan registrados) */}
      {settledHistory.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-850 transition"
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Registro de Pagos Saldados ({settledHistory.length})</span>
            </span>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-150">
              {settledHistory.map(settle => (
                <div key={settle.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🤝</span>
                    <div>
                      <span className="font-bold text-slate-200 block">{settle.notes || settle.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(settle.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · Pagado por {getMemberAvatar(settle.payerId)} {getMemberName(settle.payerId)}
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-xs">{formatEUR(settle.amountEUR)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
