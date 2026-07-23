import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { CATEGORIES } from '../data/initialData';
import { formatEUR, formatJPY } from '../utils/currency';
import { Search, Trash2, ChevronDown, ChevronUp, UserCheck, Globe, Home, Lock } from 'lucide-react';

export function ExpenseList() {
  const { expenses, members, units, currentMemberId, deleteExpense, filterFamilyOnly, setFilterFamilyOnly } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const activeMember = members.find(m => m.id === currentMemberId);
  const activeUnitId = activeMember?.unitId || 'u1';

  // Filtrado dinámico
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;

    // Filtro "Solo Mi Familia" (u1)
    if (filterFamilyOnly) {
      const familyMemberIds = members.filter(m => m.unitId === activeUnitId).map(m => m.id);
      const isPayerFamily = familyMemberIds.includes(exp.payerId);
      const isBeneficiaryFamily = exp.beneficiaries && exp.beneficiaries.some(id => familyMemberIds.includes(id));
      if (!isPayerFamily && !isBeneficiaryFamily) return false;
    }

    return matchesSearch && matchesCategory;
  });

  const totalFilteredEUR = filteredExpenses.reduce((acc, exp) => acc + (exp.amountEUR || 0), 0);

  const familyMemberIds = members.filter(m => m.unitId === activeUnitId).map(m => m.id);
  const totalFamilyShareEUR = filteredExpenses.reduce((acc, exp) => {
    const beneficiaries = exp.beneficiaries || [];
    if (beneficiaries.length === 0) return acc;
    const sharePerPerson = (exp.amountEUR || 0) / beneficiaries.length;
    const familyBeneficiaryCount = beneficiaries.filter(bId => familyMemberIds.includes(bId)).length;
    return acc + (sharePerPerson * familyBeneficiaryCount);
  }, 0);

  const getPayerName = (id) => members.find(m => m.id === id)?.name || 'Desconocido';
  const getPayerAvatar = (id) => members.find(m => m.id === id)?.avatar || '👤';
  const getUnitColor = (memberId) => {
    const member = members.find(m => m.id === memberId);
    const unit = units.find(u => u.id === member?.unitId);
    return unit?.badgeBg || 'bg-slate-800 text-slate-300';
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      
      {/* Encabezado y Resumen del Historial */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>📜 Historial de Gastos</span>
          </h2>
          <p className="text-xs text-slate-400">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'gasto visible' : 'gastos visibles'} para {activeMember?.name}
          </p>
        </div>

        {/* Totalizador */}
        <div className="text-right bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
            {filterFamilyOnly ? 'Total Consumido Familia' : 'Total Filtrado'}
          </span>
          <span className="text-base font-black text-emerald-400">
            {filterFamilyOnly ? formatEUR(totalFamilyShareEUR) : formatEUR(totalFilteredEUR)}
          </span>
        </div>
      </div>

      {/* Banner promocional si está filtrando Mi Familia */}
      {filterFamilyOnly && (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mostrando solo consumo de tu unidad familiar</span>
          </div>
          <button
            onClick={() => setFilterFamilyOnly(false)}
            className="text-[10px] underline font-bold text-emerald-400 hover:text-emerald-200"
          >
            Ver Todo
          </button>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros Rápidos */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por concepto o notas..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Carrusel de Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border flex items-center gap-1.5 transition ${
                selectedCategory === cat.id
                  ? 'bg-red-500/20 text-red-300 border-red-500/50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Tarjetas de Gastos */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="text-4xl">🏮</div>
          <h3 className="text-slate-300 font-bold text-sm">No se encontraron gastos</h3>
          <p className="text-xs text-slate-500">Prueba a borrar la búsqueda o añadir un nuevo gasto desde el botón inferior.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => {
            const isExpanded = expandedId === exp.id;
            const categoryObj = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[5];
            const beneficiaries = exp.beneficiaries || [];
            
            const familyBeneficiariesCount = beneficiaries.filter(bId => familyMemberIds.includes(bId)).length;
            const familyShareEUR = beneficiaries.length > 0 ? (exp.amountEUR / beneficiaries.length) * familyBeneficiariesCount : 0;
            const visibility = exp.visibility || 'public';

            return (
              <div
                key={exp.id}
                className={`bg-slate-900/90 border rounded-2xl transition-all shadow-md overflow-hidden ${
                  exp.isSettlement
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Cabecera Principal de la Tarjeta */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                  className="p-4 cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Icono Categoría */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${categoryObj.color}`}>
                      {categoryObj.icon}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-100 text-sm truncate">{exp.title}</h3>

                        {/* Badge Nivel de Visibilidad */}
                        {visibility === 'private' && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3 text-purple-400" />
                            <span>Privado</span>
                          </span>
                        )}
                        {visibility === 'family' && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <Home className="w-3 h-3 text-emerald-400" />
                            <span>Familiar</span>
                          </span>
                        )}
                        {exp.isSettlement && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                            Liquidación
                          </span>
                        )}
                      </div>

                      {/* Detalles del Pagador y Método */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${getUnitColor(exp.payerId)}`}>
                          <span>{getPayerAvatar(exp.payerId)}</span>
                          <span>{getPayerName(exp.payerId)}</span>
                        </span>

                        <span className="text-slate-500">·</span>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          {exp.paymentMethod === 'card' ? (
                            <>💳 Tarjeta</>
                          ) : exp.paymentMethod === 'cash_jpy' ? (
                            <>💴 Efectivo JPY</>
                          ) : (
                            <>💶 Efectivo EUR</>
                          )}
                        </span>
                      </div>

                      {/* Parte de la Unidad Familiar */}
                      {familyBeneficiariesCount > 0 && visibility !== 'private' && (
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 pt-0.5">
                          <span>Cuota Familia: {formatEUR(familyShareEUR)}</span>
                          <span className="text-slate-500">({familyBeneficiariesCount} pax)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Importes */}
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-base font-black text-slate-100">
                      {formatEUR(exp.amountEUR)}
                    </div>
                    {exp.currency === 'JPY' && (
                      <div className="text-[11px] font-semibold text-amber-400">
                        {formatJPY(exp.amountOriginal)}
                      </div>
                    )}
                    <div className="text-slate-500 text-[10px] flex justify-end items-center pt-1">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>

                {/* Desplegable de Detalles Expandidos */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/50 space-y-3 animate-in fade-in duration-150">
                    
                    {/* Lista de Beneficiarios */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                        Beneficiarios ({beneficiaries.length} pax - {formatEUR(exp.amountEUR / beneficiaries.length)} c/u):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {beneficiaries.map(bId => {
                          const m = members.find(mem => mem.id === bId);
                          return (
                            <span key={bId} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                              <span>{m?.avatar}</span>
                              <span>{m?.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notas y Fecha */}
                    {exp.notes && (
                      <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-semibold">Notas: </span>
                        {exp.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>Fecha: {new Date(exp.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>Visibilidad: <strong className="text-slate-300 capitalize">{visibility}</strong></span>
                    </div>

                    {/* Acciones Eliminar */}
                    <div className="flex justify-end pt-2 border-t border-slate-800">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar Gasto</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
