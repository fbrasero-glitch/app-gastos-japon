import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_UNITS, INITIAL_MEMBERS, DEFAULT_EXCHANGE_RATE, INITIAL_EXPENSES } from '../data/initialData';
import { convertJPYToEUR } from '../utils/currency';
import { initFirebase, dbRef, onValue, dbSet } from '../firebase/config';

const ExpensesContext = createContext();

export function ExpensesProvider({ children }) {
  const [currentMemberId, setCurrentMemberIdState] = useState(() => {
    return localStorage.getItem('japon_current_member_id') || null;
  });

  const [memberPins, setMemberPins] = useState(() => {
    const saved = localStorage.getItem('japon_member_pins');
    return saved ? JSON.parse(saved) : {};
  });

  const [units] = useState(INITIAL_UNITS);
  const [members] = useState(INITIAL_MEMBERS);

  const [exchangeRate, setExchangeRateState] = useState(() => {
    const saved = localStorage.getItem('japon_exchange_rate');
    return saved ? parseFloat(saved) : DEFAULT_EXCHANGE_RATE;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('japon_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [filterFamilyOnly, setFilterFamilyOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('add'); // Pestaña por defecto: Añadir Gasto

  useEffect(() => {
    const { isConfigured, database } = initFirebase();
    if (isConfigured && database) {
      setIsFirebaseConnected(true);

      const pinsRef = dbRef(database, 'pins');
      onValue(pinsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMemberPins(data);
          localStorage.setItem('japon_member_pins', JSON.stringify(data));
        }
      });

      const expensesRef = dbRef(database, 'expenses');
      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data);
          setExpenses(list);
          localStorage.setItem('japon_expenses', JSON.stringify(list));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (currentMemberId) {
      localStorage.setItem('japon_current_member_id', currentMemberId);
    } else {
      localStorage.removeItem('japon_current_member_id');
    }
  }, [currentMemberId]);

  useEffect(() => {
    localStorage.setItem('japon_member_pins', JSON.stringify(memberPins));
  }, [memberPins]);

  useEffect(() => {
    localStorage.setItem('japon_exchange_rate', exchangeRate.toString());
  }, [exchangeRate]);

  useEffect(() => {
    localStorage.setItem('japon_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const setCurrentMemberId = (mId) => {
    setCurrentMemberIdState(mId);
  };

  const logoutCurrentMember = () => {
    setCurrentMemberIdState(null);
  };

  const setMemberPin = (memberId, hashedPin) => {
    const updated = { ...memberPins, [memberId]: hashedPin };
    setMemberPins(updated);

    const { isConfigured, database } = initFirebase();
    if (isConfigured && database) {
      dbSet(dbRef(database, `pins/${memberId}`), hashedPin);
    }
  };

  const setExchangeRate = (newRate) => {
    const rate = parseFloat(newRate);
    if (!isNaN(rate) && rate > 0) {
      setExchangeRateState(rate);
      const { isConfigured, database } = initFirebase();
      if (isConfigured && database) {
        dbSet(dbRef(database, 'exchangeRate'), rate);
      }
    }
  };

  const addExpense = (expenseData) => {
    let amountEUR = expenseData.amountEUR;
    if (expenseData.currency === 'JPY') {
      amountEUR = convertJPYToEUR(expenseData.amountOriginal, expenseData.exchangeRateUsed || exchangeRate);
    } else {
      amountEUR = Number(expenseData.amountOriginal);
    }

    const currentMember = members.find(m => m.id === currentMemberId);

    const newExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      amountEUR: Number(amountEUR.toFixed(2)),
      exchangeRateUsed: expenseData.currency === 'JPY' ? (expenseData.exchangeRateUsed || exchangeRate) : exchangeRate,
      date: expenseData.date || new Date().toISOString(),
      visibility: expenseData.visibility || 'public',
      createdBy: currentMemberId || expenseData.payerId,
      createdUnitId: currentMember?.unitId || 'u1'
    };

    setExpenses(prev => [newExpense, ...prev]);

    const { isConfigured, database } = initFirebase();
    if (isConfigured && database) {
      dbSet(dbRef(database, `expenses/${newExpense.id}`), newExpense);
    }
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));

    const { isConfigured, database } = initFirebase();
    if (isConfigured && database) {
      dbSet(dbRef(database, `expenses/${id}`), null);
    }
  };

  const settleDebt = ({ fromId, toId, amountEUR, isUnitLevel = false, notes = "Liquidación de deuda" }) => {
    let payerId = fromId;
    let beneficiaries = [toId];

    if (isUnitLevel) {
      const fromUnitMembers = members.filter(m => m.unitId === fromId);
      const toUnitMembers = members.filter(m => m.unitId === toId);
      payerId = fromUnitMembers[0]?.id || fromId;
      beneficiaries = toUnitMembers.map(m => m.id);
    }

    const currentMember = members.find(m => m.id === currentMemberId);
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
      notes: notes,
      visibility: 'public',
      createdBy: currentMemberId || payerId,
      createdUnitId: currentMember?.unitId || 'u1'
    };

    setExpenses(prev => [settlementExpense, ...prev]);

    const { isConfigured, database } = initFirebase();
    if (isConfigured && database) {
      dbSet(dbRef(database, `expenses/${settlementExpense.id}`), settlementExpense);
    }
  };

  const resetToDefaults = () => {
    setMemberPins({});
    setExchangeRateState(DEFAULT_EXCHANGE_RATE);
    setExpenses(INITIAL_EXPENSES);
    localStorage.removeItem('japon_member_pins');
    localStorage.removeItem('japon_exchange_rate');
    localStorage.removeItem('japon_expenses');
    localStorage.removeItem('japon_current_member_id');
    setCurrentMemberIdState(null);
  };

  const activeMember = members.find(m => m.id === currentMemberId);
  const activeUnitId = activeMember?.unitId || 'u1';

  const visibleExpenses = expenses.filter(exp => {
    const visibility = exp.visibility || 'public';

    if (visibility === 'private') {
      return exp.createdBy === currentMemberId || exp.payerId === currentMemberId;
    }

    if (visibility === 'family') {
      const creator = members.find(m => m.id === exp.createdBy);
      const payer = members.find(m => m.id === exp.payerId);
      const creatorUnitId = creator?.unitId || exp.createdUnitId;
      const payerUnitId = payer?.unitId;

      return creatorUnitId === activeUnitId || payerUnitId === activeUnitId;
    }

    return true;
  });

  return (
    <ExpensesContext.Provider value={{
      units,
      members,
      currentMemberId,
      setCurrentMemberId,
      logoutCurrentMember,
      memberPins,
      setMemberPin,
      exchangeRate,
      setExchangeRate,
      expenses: visibleExpenses,
      allRawExpenses: expenses,
      addExpense,
      deleteExpense,
      settleDebt,
      resetToDefaults,
      filterFamilyOnly,
      setFilterFamilyOnly,
      activeTab,
      setActiveTab,
      isFirebaseConnected
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
