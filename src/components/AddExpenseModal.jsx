import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { CATEGORIES } from '../data/initialData';
import { convertJPYToEUR, convertEURToJPY, formatEUR, formatJPY } from '../utils/currency';
import { Check, Plus, DollarSign, CreditCard, Coins, Calendar, FileText, Users, User, HeartHandshake } from 'lucide-react';

export function AddExpenseForm({ onComplete }) {
  const { members, units, exchangeRate, addExpense, setActiveTab } = useExpenses();

  // Estado del formulario
  const [title, setTitle] = useState('');
  const [amountOriginal, setAmountOriginal] = useState('');
  const [currency, setCurrency] = useState('JPY'); // 'JPY' | 'EUR'
  const [payerId, setPayerId] = useState(members[0]?.id || 'm1');
  const [paymentMethod, setPaymentMethod] = useState('cash_jpy'); // 'card' | 'cash_jpy' | 'cash_eur'
  const [category, setCategory] = useState('Comida');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Selección de Beneficiarios
  const [beneficiaries, setBeneficiaries] = useState(members.map(m => m.id)); // Por defecto todos (8)

  // Título rápido de categorías (Preset suggestions)
  const quickTitles = {
    Comida: ['Cena Ramen Ichiran', 'Almuerzo Sushi', 'Desayuno Conbini (7-Eleven)', 'Cena Izakaya', 'Matcha & Sweet Treats'],
    Transporte: ['Pase Metro Suica / Pasmo', 'Billete Shinkansen', 'Taxi a Estación', 'Buses locales Kioto'],
    Ocio: ['Entradas Templo Kiyomizu-dera', 'Tokyo Disneyland / DisneySea', 'Entradas teamLab Planets', 'Museo de Anime'],
    Compras: ['Recuerdos Don Quijote', 'Regalos Akihabara', 'Snacks y Dulces', 'Ropa Uniqlo'],
    Alojamiento: ['Noche Hotel Tokio', 'Estancia Ryokan en Hakone', 'Tasa Turística Hotel'],
    Varios: ['Consigna Maletas', 'Agua y Bebidas', 'Sim Card / Wifi Pocket']
  };

  // Cálculo en vivo de conversión
  const rawNum = parseFloat(amountOriginal) || 0;
  const equivalentEUR = currency === 'JPY' ? convertJPYToEUR(rawNum, exchangeRate) : rawNum;
  const equivalentJPY = currency === 'EUR' ? convertEURToJPY(rawNum, exchangeRate) : rawNum;

  // Manejadores de Presets de Beneficiarios
  const selectAllBeneficiaries = () => {
    setBeneficiaries(members.map(m => m.id));
  };

  const selectAdultsOnly = () => {
    setBeneficiaries(members.filter(m => m.isAdult).map(m => m.id));
  };

  const selectMainFamilyOnly = () => {
    setBeneficiaries(members.filter(m => m.unitId === 'u1').map(m => m.id));
  };

  const toggleBeneficiary = (mId) => {
    if (beneficiaries.includes(mId)) {
      if (beneficiaries.length > 1) {
        setBeneficiaries(beneficiaries.filter(id => id !== mId));
      }
    } else {
      setBeneficiaries([...beneficiaries, mId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || rawNum <= 0 || beneficiaries.length === 0) return;

    addExpense({
      title: title.trim(),
      amountOriginal: rawNum,
      currency,
      amountEUR: equivalentEUR,
      exchangeRateUsed: exchangeRate,
      payerId,
      paymentMethod,
      category,
      date: new Date(date).toISOString(),
      splitType: 'equal',
      beneficiaries,
      notes: notes.trim()
    });

    // Resetear o redirigir
    if (onComplete) {
      onComplete();
    } else {
      setActiveTab('history');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      
      {/* Encabezado del Formulario */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>➕ Añadir Nuevo Gasto</span>
          </h2>
          <p className="text-xs text-slate-400">Imputación en Yenes (JPY) o Euros con conversión instantánea</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">Tasa Actual</span>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            1€ = {exchangeRate}¥
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. Categoría y Título */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
            1. Categoría del Gasto
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? `${cat.color} font-bold ring-2 ring-red-500/40 shadow-md scale-[1.02]`
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.name.split('/')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Presets Rápidos según Categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Sugerencias:</span>
            {quickTitles[category]?.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setTitle(preset)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition"
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Campo Título */}
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Concepto del gasto (ej: Cena Ramen en Shinjuku)..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        {/* 2. Importe y Moneda */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Importe y Divisa
            </label>

            {/* Toggle JPY / EUR */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrency('JPY')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currency === 'JPY'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Yenes (JPY ¥)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('EUR')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currency === 'EUR'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Euros (EUR €)
              </button>
            </div>
          </div>

          {/* Input de Importe Prominente */}
          <div className="relative flex items-center">
            <input
              type="number"
              step={currency === 'JPY' ? '1' : '0.01'}
              required
              min="0.01"
              value={amountOriginal}
              onChange={(e) => setAmountOriginal(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 pr-16"
            />
            <span className="absolute right-4 text-lg font-bold text-slate-400">
              {currency === 'JPY' ? '¥' : '€'}
            </span>
          </div>

          {/* Indicador en Vivo de Equivalencia */}
          {rawNum > 0 && (
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
              <span className="text-slate-400 font-medium">Equivalente en euros:</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {currency === 'JPY' ? formatEUR(equivalentEUR) : `${formatJPY(equivalentJPY)} (@ ${exchangeRate}¥)`}
              </span>
            </div>
          )}
        </div>

        {/* 3. Pagador y Método de Pago */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
            3. ¿Quién ha pagado?
          </label>

          {/* Selector de Integrante (Pagador) */}
          <div className="grid grid-cols-4 gap-2">
            {members.map((m) => {
              const isSelected = payerId === m.id;
              const unit = units.find(u => u.id === m.unitId);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayerId(m.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-red-500 ring-2 ring-red-500/40 text-slate-100 shadow-md scale-105'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg">{m.avatar}</span>
                  <span className="text-xs font-bold truncate w-full mt-0.5">{m.name}</span>
                  <span className="text-[9px] text-slate-500 truncate w-full">{unit?.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Método de Pago */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">Método:</span>
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_jpy')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                  paymentMethod === 'cash_jpy'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>💴 Efectivo ¥</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                  paymentMethod === 'card'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Tarjeta</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_eur')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                  paymentMethod === 'cash_eur'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>💶 Efectivo €</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Reparto entre Beneficiarios */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-red-400" />
              <span>4. ¿Entre quiénes se reparte?</span>
            </label>
            <span className="text-xs font-bold text-slate-400">
              {beneficiaries.length} de {members.length} pax
            </span>
          </div>

          {/* Atajos Rápidos de Selección */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={selectAllBeneficiaries}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                beneficiaries.length === members.length
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ✨ Todos ({members.length})
            </button>
            <button
              type="button"
              onClick={selectAdultsOnly}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                beneficiaries.length === members.filter(m => m.isAdult).length && beneficiaries.every(id => members.find(m => m.id === id)?.isAdult)
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              👴 Solo Adultos (6)
            </button>
            <button
              type="button"
              onClick={selectMainFamilyOnly}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                beneficiaries.length === 4 && beneficiaries.every(id => members.find(m => m.id === id)?.unitId === 'u1')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              👨‍👩‍👧‍👦 Mi Familia (4)
            </button>
          </div>

          {/* Grid de Checkboxes por Integrante */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {units.map((u) => {
              const unitMembers = members.filter(m => m.unitId === u.id);
              return (
                <div key={u.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-800/80 pb-1">
                    <span>{u.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {unitMembers.filter(m => beneficiaries.includes(m.id)).length}/{unitMembers.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {unitMembers.map((m) => {
                      const isIncluded = beneficiaries.includes(m.id);
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => toggleBeneficiary(m.id)}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition ${
                            isIncluded
                              ? 'bg-slate-800 text-slate-100 font-semibold'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{m.avatar}</span>
                            <span>{m.name}</span>
                          </span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isIncluded ? 'bg-red-500 border-red-500 text-white' : 'border-slate-700'
                          }`}>
                            {isIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Muestra de cuota por persona */}
          {rawNum > 0 && beneficiaries.length > 0 && (
            <div className="text-center text-xs text-slate-400 pt-1 font-medium">
              Cuota estimada por persona: <span className="font-extrabold text-slate-100">{formatEUR(equivalentEUR / beneficiaries.length)}</span>
            </div>
          )}
        </div>

        {/* 5. Fecha y Notas opcionales */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Notas / Detalles</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Botón Principal Guardar */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:brightness-110 text-white font-extrabold text-base shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Guardar Gasto en el Historial</span>
        </button>

      </form>
    </div>
  );
}
