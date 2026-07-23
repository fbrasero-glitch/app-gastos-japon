// Lógica de cálculo de balances y simplificación de deudas ("Cuentas Claras")

import { convertJPYToEUR } from './currency';

/**
 * Calcula los balances netos (pagado, consumido y balance final) para cada integrante y unidad económica.
 * Maneja correctamente la diferencia entre Gastos del Viaje y Transferencias de Liquidación.
 */
export function calculateBalances(expenses, members, units, currentExchangeRate = 165.0) {
  // Inicializar mapas de integrantes
  const memberBalances = {};
  members.forEach(m => {
    memberBalances[m.id] = {
      memberId: m.id,
      memberName: m.name,
      unitId: m.unitId,
      paidEUR: 0,  // Total desembolsado de su bolsillo
      owedEUR: 0,  // Total consumido en gastos del viaje
      netEUR: 0    // Balance final (Pagado - Consumido)
    };
  });

  // Procesar cada registro
  expenses.forEach(exp => {
    let expEUR = exp.amountEUR;
    if (!expEUR || expEUR <= 0) {
      if (exp.currency === 'JPY') {
        expEUR = convertJPYToEUR(exp.amountOriginal, exp.exchangeRateUsed || currentExchangeRate);
      } else {
        expEUR = Number(exp.amountOriginal) || 0;
      }
    }

    const payerId = exp.payerId;
    const beneficiaries = exp.beneficiaries || [];

    if (exp.isSettlement) {
      // LIQUIDACIÓN (Transferencia entre personas para saldar deuda)
      // El pagador desembolsa dinero para saldar deudas
      if (memberBalances[payerId]) {
        memberBalances[payerId].paidEUR += expEUR;
      }
      // El receptor disminuye su crédito (o se le descuenta de su desembolso neto)
      const recipientId = beneficiaries[0];
      if (recipientId && memberBalances[recipientId]) {
        memberBalances[recipientId].paidEUR -= expEUR;
      }
    } else {
      // GASTO REAL DEL VIAJE (Comida, Tren, Hotel, etc.)
      if (memberBalances[payerId]) {
        memberBalances[payerId].paidEUR += expEUR;
      }

      if (beneficiaries.length > 0) {
        const shareEUR = expEUR / beneficiaries.length;
        beneficiaries.forEach(bId => {
          if (memberBalances[bId]) {
            memberBalances[bId].owedEUR += shareEUR;
          }
        });
      }
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
 * Funciona tanto a nivel de integrantes como de unidades familiares.
 */
export function simplifyDebts(entities) {
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
 * Calcula estadísticas de gasto para una familia
 */
export function calculateFamilyStats(expenses, familyUnitId = "u1", members = []) {
  const familyMemberIds = members.filter(m => m.unitId === familyUnitId).map(m => m.id);
  
  let totalDirectSpentEUR = 0;
  let totalFamilyShareEUR = 0;

  expenses.forEach(exp => {
    if (exp.isSettlement) return; // No contar transferencias como gasto real del viaje

    const expEUR = exp.amountEUR || 0;
    
    if (familyMemberIds.includes(exp.payerId)) {
      totalDirectSpentEUR += expEUR;
    }

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
