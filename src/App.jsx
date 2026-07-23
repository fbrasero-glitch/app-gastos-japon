import React from 'react';
import { ExpensesProvider, useExpenses } from './context/ExpensesContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AddExpenseForm } from './components/AddExpenseModal';
import { ExpenseList } from './components/ExpenseList';
import { DebtBalances } from './components/DebtBalances';
import { SummaryStats } from './components/SummaryStats';
import { SettingsModal } from './components/SettingsModal';

function MainContent() {
  const { activeTab } = useExpenses();

  return (
    <main className="min-h-screen">
      {activeTab === 'history' && <ExpenseList />}
      {activeTab === 'add' && <AddExpenseForm />}
      {activeTab === 'balances' && <DebtBalances />}
      {activeTab === 'summary' && <SummaryStats />}
      {activeTab === 'settings' && <SettingsModal />}
    </main>
  );
}

export default function App() {
  return (
    <ExpensesProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-red-500 selection:text-white">
        <Header />
        <MainContent />
        <BottomNav />
      </div>
    </ExpensesProvider>
  );
}
