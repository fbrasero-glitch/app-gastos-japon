import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_UNITS, INITIAL_MEMBERS, DEFAULT_EXCHANGE_RATE, INITIAL_EXPENSES } from '../data/initialData';
import { convertJPYToEUR } from '../utils/currency';

const ExpensesContext = createContext();

export function ExpensesProvider({ children }) {
  // Cargar estado inicial desde LocalStorage o usar predeterminados
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('japon_units');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('japon_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [exchangeRate, setExchangeRateState] = useState(() => {
    const saved = localStorage.getItem('japon_exchange_rate');
    return saved ? parseFloat(saved) : DEFAULT_EXCHANGE_RATE;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('japon_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Filtros y Navegación
  const [filterFamilyOnly, setFilterFamilyOnly] = useState(false); // u1 Familia Principal
  const [activeTab, setActiveTab] = useState('history'); // 'add' | 'history' | 'balances' | 'summary' | 'settings'

  // Persistir en LocalStorage
  useEffect(() => {
    localStorage.setItem('japon_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('japon_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('japon_exchange_rate', exchangeRate.toString());
  }, [exchangeRate]);

  useEffect(() => {
    localStorage.setItem('japon_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Funciones de modificación
  const setExchangeRate = (newRate) => {
    const rate = parseFloat(newRate);
    if (!isNaN(rate) && rate > 0) {
      setExchangeRateState(rate);
    }
  };

  const addExpense = (expenseData) => {
    let amountEUR = expenseData.amountEUR;
    if (expenseData.currency === 'JPY') {
      amountEUR = convertJPYToEUR(expenseData.amountOriginal, expenseData.exchangeRateUsed || exchangeRate);
    } else {
      amountEUR = Number(expenseData.amountOriginal);
    }

    const newExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      amountEUR: Number(amountEUR.toFixed(2)),
      exchangeRateUsed: expenseData.currency === 'JPY' ? (expenseData.exchangeRateUsed || exchangeRate) : exchangeRate,
      date: expenseData.date || new Date().toISOString()
    };

    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id, updatedData) => {
    let amountEUR = updatedData.amountEUR;
    if (updatedData.currency === 'JPY') {
      amountEUR = convertJPYToEUR(updatedData.amountOriginal, updatedData.exchangeRateUsed || exchangeRate);
    } else {
      amountEUR = Number(updatedData.amountOriginal);
    }

    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        return {
          ...exp,
          ...updatedData,
          amountEUR: Number(amountEUR.toFixed(2))
        };
      }
      return exp;
    }));
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  // Registrar un pago de liquidación entre integrantes o unidades
  const settleDebt = ({ fromId, toId, amountEUR, isUnitLevel = false, notes = "Liquidación de deuda" }) => {
    let payerId = fromId;
    let beneficiaries = [toId];

    // Si es a nivel de unidad, asignamos el representante principal de la unidad
    if (isUnitLevel) {
      const fromUnitMembers = members.filter(m => m.unitId === fromId);
      const toUnitMembers = members.filter(m => m.unitId === toId);
      payerId = fromUnitMembers[0]?.id || fromId;
      beneficiaries = toUnitMembers.map(m => m.id);
    }

    const amountJPY = Math.round(amountEUR * exchangeRate);

    const settlementExpense = {
      id: `exp-settle-${Date.now()}`,
      title: `🤝 Liquidación: ${notes}`,
      amountOriginal: amountJPY,
      currency: "JPY",
      amountEUR: Number(amountEUR.toFixed(2)),
      exchangeRateUsed: exchangeRate,
      payerId: payerId,
      paymentMethod: "card",
      category: "Varios",
      date: new Date().toISOString(),
      splitType: "custom",
      beneficiaries: beneficiaries,
      isSettlement: true,
      notes: notes
    };

    setExpenses(prev => [settlementExpense, ...prev]);
  };

  const resetToDefaults = () => {
    setUnits(INITIAL_UNITS);
    setMembers(INITIAL_MEMBERS);
    setExchangeRateState(DEFAULT_EXCHANGE_RATE);
    setExpenses(INITIAL_EXPENSES);
    localStorage.removeItem('japon_units');
    localStorage.removeItem('japon_members');
    localStorage.removeItem('japon_exchange_rate');
    localStorage.removeItem('japon_expenses');
  };

  return (
    <ExpensesContext.Provider value={{
      units,
      members,
      exchangeRate,
      setExchangeRate,
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      settleDebt,
      resetToDefaults,
      filterFamilyOnly,
      setFilterFamilyOnly,
      activeTab,
      setActiveTab
    }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpenses debe ser usado dentro de ExpensesProvider');
  }
  return context;
}
