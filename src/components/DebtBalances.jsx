import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { calculateBalances, simplifyDebts } from '../utils/debtCalculator';
import { formatEUR } from '../utils/currency';
import { Scale, ArrowRight, CheckCircle2, Building2, User, Handshake, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function DebtBalances() {
  const { expenses, members, units, exchangeRate, settleDebt } = useExpenses();
  const [viewMode, setViewMode] = useState('units'); // 'units' | 'members'
  const [settledSuccessMsg, setSettledSuccessMsg] = useState(null);

  // Calcular saldos
  const { memberBalances, unitBalances } = calculateBalances(expenses, members, units, exchangeRate);

  // Preparar entidades para el algoritmo de simplificación
  const entitiesToSimplify = viewMode === 'units'
    ? Object.values(unitBalances).map(u => ({ id: u.unitId, name: u.unitName, netEUR: u.netEUR }))
    : Object.values(memberBalances).map(m => ({ id: m.memberId, name: m.memberName, netEUR: m.netEUR }));

  // Algoritmo de simplificación
  const simplifiedSettlements = simplifyDebts(entitiesToSimplify);

  // Manejador para registrar liquidación de pago
  const handleSettle = (settlement) => {
    settleDebt({
      fromId: settlement.fromId,
      toId: settlement.toId,
      amountEUR: settlement.amountEUR,
      isUnitLevel: viewMode === 'units',
      notes: `${settlement.fromName} paga a ${settlement.toName}`
    });

    // Lanzar confeti para celebrar la liquidación 🎉
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // Ignorar si confetti falla
    }

    setSettledSuccessMsg(`¡Pago de ${formatEUR(settlement.amountEUR)} de ${settlement.fromName} a ${settlement.toName} registrado con éxito!`);
    setTimeout(() => setSettledSuccessMsg(null), 4000);
  };

  const getUnitColor = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    return unit?.badgeBg || 'bg-slate-800 text-slate-300';
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>⚖️ Balances y Cuentas Claras</span>
          </h2>
          <p className="text-xs text-slate-400">Algoritmo de simplificación de deudas para minimizar transferencias</p>
        </div>
      </div>

      {/* Alerta de Éxito al liquidar */}
      {settledSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in zoom-in duration-200">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{settledSuccessMsg}</span>
        </div>
      )}

      {/* Selector de Nivel: Unidades Económicas vs Integrantes Individuales */}
      <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex gap-1">
        <button
          onClick={() => setViewMode('units')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            viewMode === 'units'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Por Unidades Económicas (3)</span>
        </button>
        <button
          onClick={() => setViewMode('members')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            viewMode === 'members'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Por Integrante Individual (8)</span>
        </button>
      </div>

      {/* 1. SECCIÓN: Quién debe a Quién (Liquidación Simplificada) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-emerald-400" />
            <span>Liquidación Optimizada ({simplifiedSettlements.length} {simplifiedSettlements.length === 1 ? 'pago' : 'pagos'})</span>
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">
            Cuentas Claras
          </span>
        </div>

        {simplifiedSettlements.length === 0 ? (
          <div className="text-center py-6 text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-sm text-slate-200">¡Cuentas completamente saldadas!</p>
            <p className="text-xs text-slate-500">Nadie debe nada a nadie en este nivel.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {simplifiedSettlements.map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-inner"
              >
                {/* Deudor -> Acreedor */}
                <div className="flex items-center gap-2 text-xs min-w-0 flex-1">
                  <div className="truncate font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                    {s.fromName}
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                  <div className="truncate font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                    {s.toName}
                  </div>
                </div>

                {/* Importe y Botón Liquidar */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-slate-100 text-sm">{formatEUR(s.amountEUR)}</span>
                  <button
                    onClick={() => handleSettle(s)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-[11px] transition shadow-md active:scale-95 flex items-center gap-1"
                    title="Registrar que este pago ha sido efectuado"
                  >
                    <span>Sellar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. SECCIÓN: Resumen de Saldos Netos por Entidad */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Desglose de Saldos Netos ({viewMode === 'units' ? 'Unidades' : 'Integrantes'})
        </h3>

        <div className="space-y-2.5">
          {viewMode === 'units'
            ? Object.values(unitBalances).map(u => {
                const isCreditor = u.netEUR >= 0;
                const unitInfo = units.find(unit => unit.id === u.unitId);
                return (
                  <div
                    key={u.unitId}
                    className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-${unitInfo?.color || 'slate'}-500 inline-block`}></span>
                        <h4 className="font-bold text-slate-100 text-sm">{u.unitName}</h4>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Pagó: <strong className="text-slate-200">{formatEUR(u.paidEUR)}</strong></span>
                        <span>Consumió: <strong className="text-slate-200">{formatEUR(u.owedEUR)}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Balance Neto</span>
                      <span className={`text-base font-black px-2.5 py-0.5 rounded-lg inline-block border ${
                        isCreditor
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {isCreditor ? `+${formatEUR(u.netEUR)}` : formatEUR(u.netEUR)}
                      </span>
                    </div>
                  </div>
                );
              })
            : Object.values(memberBalances).map(m => {
                const isCreditor = m.netEUR >= 0;
                const memberInfo = members.find(mem => mem.id === m.memberId);
                return (
                  <div
                    key={m.memberId}
                    className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{memberInfo?.avatar}</span>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{m.memberName}</h4>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>Pagó: {formatEUR(m.paidEUR)}</span>
                          <span>·</span>
                          <span>Debe: {formatEUR(m.owedEUR)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-black px-2 py-0.5 rounded-lg border ${
                        isCreditor
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {isCreditor ? `+${formatEUR(m.netEUR)}` : formatEUR(m.netEUR)}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

    </div>
  );
}
