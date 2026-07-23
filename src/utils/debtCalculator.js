// Lógica de cálculo de balances y simplificación de deudas ("Cuentas Claras")

import { convertJPYToEUR } from './currency';

/**
 * Calcula los balances netos (pagado, debido y balance final) para cada integrante y cada unidad económica.
 * Todo se calcula y normaliza en EUROS (€).
 */
export function calculateBalances(expenses, members, units, currentExchangeRate = 165.0) {
  // Inicializar mapas de integrantes
  const memberBalances = {};
  members.forEach(m => {
    memberBalances[m.id] = {
      memberId: m.id,
      memberName: m.name,
      unitId: m.unitId,
      paidEUR: 0,
      owedEUR: 0,
      netEUR: 0
    };
  });

  // Procesar cada gasto
  expenses.forEach(exp => {
    // Determinar importe en EUR del gasto
    let expEUR = exp.amountEUR;
    if (!expEUR || expEUR <= 0) {
      if (exp.currency === 'JPY') {
        expEUR = convertJPYToEUR(exp.amountOriginal, exp.exchangeRateUsed || currentExchangeRate);
      } else {
        expEUR = exp.amountOriginal;
      }
    }

    const payerId = exp.payerId;
    const beneficiaries = exp.beneficiaries || [];

    // Añadir al pagador
    if (memberBalances[payerId]) {
      memberBalances[payerId].paidEUR += expEUR;
    }

    // Repartir el coste proporcionalmente entre los beneficiarios
    if (beneficiaries.length > 0) {
      const shareEUR = expEUR / beneficiaries.length;
      beneficiaries.forEach(bId => {
        if (memberBalances[bId]) {
          memberBalances[bId].owedEUR += shareEUR;
        }
      });
    }
  });

  // Calcular balance neto por integrante
  Object.values(memberBalances).forEach(m => {
    m.netEUR = Number((m.paidEUR - m.owedEUR).toFixed(2));
    m.paidEUR = Number(m.paidEUR.toFixed(2));
    m.owedEUR = Number(m.owedEUR.toFixed(2));
  });

  // Consolidar balances por Unidad Económica
  const unitBalances = {};
  units.forEach(u => {
    unitBalances[u.id] = {
      unitId: u.id,
      unitName: u.name,
      paidEUR: 0,
      owedEUR: 0,
      netEUR: 0,
      memberIds: u.members || []
    };
  });

  Object.values(memberBalances).forEach(m => {
    if (unitBalances[m.unitId]) {
      unitBalances[m.unitId].paidEUR += m.paidEUR;
      unitBalances[m.unitId].owedEUR += m.owedEUR;
      unitBalances[m.unitId].netEUR += m.netEUR;
    }
  });

  Object.values(unitBalances).forEach(u => {
    u.paidEUR = Number(u.paidEUR.toFixed(2));
    u.owedEUR = Number(u.owedEUR.toFixed(2));
    u.netEUR = Number(u.netEUR.toFixed(2));
  });

  return {
    memberBalances,
    unitBalances
  };
}

/**
 * Algoritmo Greedy de simplificación de deudas para minimizar las transferencias.
 * Funciona tanto para lista de integrantes como de unidades familiares.
 * @param {Array<{ id: string, name: string, netEUR: number }>} entities 
 * @returns {Array<{ fromId: string, fromName: string, toId: string, toName: string, amountEUR: number }>}
 */
export function simplifyDebts(entities) {
  // Filtrar y clonar saldos
  const debtors = [];
  const creditors = [];

  entities.forEach(ent => {
    const balance = Math.round(ent.netEUR * 100) / 100;
    if (balance < -0.01) {
      debtors.push({ id: ent.id, name: ent.name, balance: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id: ent.id, name: ent.name, balance: balance });
    }
  });

  // Ordenar de mayor a menor
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.balance, creditor.balance);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      settlements.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amountEUR: roundedAmount
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  return settlements;
}

/**
 * Calcula estadísticas rápidas para el filtro de "Mis Gastos" (Familia Principal u1)
 */
export function calculateFamilyStats(expenses, familyUnitId = "u1", members = []) {
  const familyMemberIds = members.filter(m => m.unitId === familyUnitId).map(m => m.id);
  
  let totalDirectSpentEUR = 0; // Gastos donde un miembro de la familia pagó
  let totalFamilyShareEUR = 0;  // Cuota consumida por los miembros de la familia

  expenses.forEach(exp => {
    const expEUR = exp.amountEUR || 0;
    
    // Si pagó alguien de mi familia
    if (familyMemberIds.includes(exp.payerId)) {
      totalDirectSpentEUR += expEUR;
    }

    // Cuota consumida por mi familia en este gasto
    const beneficiaries = exp.beneficiaries || [];
    if (beneficiaries.length > 0) {
      const perPerson = expEUR / beneficiaries.length;
      const familyBeneficiariesCount = beneficiaries.filter(bId => familyMemberIds.includes(bId)).length;
      totalFamilyShareEUR += perPerson * familyBeneficiariesCount;
    }
  });

  return {
    totalDirectSpentEUR: Number(totalDirectSpentEUR.toFixed(2)),
    totalFamilyShareEUR: Number(totalFamilyShareEUR.toFixed(2))
  };
}
