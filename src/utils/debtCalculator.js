// Lógica de cálculo de balances y simplificación de deudas ("Cuentas Claras")

import { convertJPYToEUR } from './currency';

/**
 * Calcula los balances de consumo y los balances financieros netos por integrante y unidad económica.
 */
export function calculateBalances(expenses, members, units, currentExchangeRate = 165.0) {
  const memberBalances = {};
  members.forEach(m => {
    memberBalances[m.id] = {
      memberId: m.id,
      memberName: m.name,
      unitId: m.unitId,
      paidEUR: 0,  // Desembolsado de su bolsillo
      owedEUR: 0,  // Consumido individualmente en el viaje
      netEUR: 0
    };
  });

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

  // Procesar cada gasto o liquidación
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
    const payerMember = members.find(m => m.id === payerId);
    const payerUnitId = payerMember?.unitId || exp.createdUnitId;

    if (exp.isSettlement) {
      // LIQUIDACIÓN DE DEUDA (Individual o Familiar)
      if (memberBalances[payerId]) {
        memberBalances[payerId].paidEUR += expEUR;
      }
      if (payerUnitId && unitBalances[payerUnitId]) {
        unitBalances[payerUnitId].paidEUR += expEUR;
      }

      const recipientId = beneficiaries[0];
      const recipientMember = members.find(m => m.id === recipientId);
      const recipientUnitId = recipientMember?.unitId;

      if (recipientId && memberBalances[recipientId]) {
        memberBalances[recipientId].paidEUR -= expEUR;
      }
      if (recipientUnitId && unitBalances[recipientUnitId]) {
        unitBalances[recipientUnitId].paidEUR -= expEUR;
      }
    } else {
      // GASTO REAL DEL VIAJE
      if (memberBalances[payerId]) {
        memberBalances[payerId].paidEUR += expEUR;
      }
      if (payerUnitId && unitBalances[payerUnitId]) {
        unitBalances[payerUnitId].paidEUR += expEUR;
      }

      if (beneficiaries.length > 0) {
        const shareEUR = expEUR / beneficiaries.length;
        beneficiaries.forEach(bId => {
          if (memberBalances[bId]) {
            memberBalances[bId].owedEUR += shareEUR;
          }
          const bMember = members.find(m => m.id === bId);
          if (bMember?.unitId && unitBalances[bMember.unitId]) {
            unitBalances[bMember.unitId].owedEUR += shareEUR;
          }
        });
      }
    }
  });

  // Calcular balance neto final por integrante y unidad
  Object.values(memberBalances).forEach(m => {
    m.netEUR = Number((m.paidEUR - m.owedEUR).toFixed(2));
    m.paidEUR = Number(m.paidEUR.toFixed(2));
    m.owedEUR = Number(m.owedEUR.toFixed(2));
  });

  Object.values(unitBalances).forEach(u => {
    u.netEUR = Number((u.paidEUR - u.owedEUR).toFixed(2));
    u.paidEUR = Number(u.paidEUR.toFixed(2));
    u.owedEUR = Number(u.owedEUR.toFixed(2));
  });

  return {
    memberBalances,
    unitBalances
  };
}

/**
 * Simplifica deudas a nivel de Unidad Económica (Familias)
 */
export function simplifyUnitDebts(unitBalancesMap) {
  const debtors = [];
  const creditors = [];

  Object.values(unitBalancesMap).forEach(u => {
    const balance = Math.round(u.netEUR * 100) / 100;
    if (balance < -0.01) {
      debtors.push({ id: u.unitId, name: u.unitName, balance: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id: u.unitId, name: u.unitName, balance: balance });
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
        amountEUR: roundedAmount,
        isUnit: true
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
 * Simplifica deudas a nivel Individual PERO EXCLUYENDO deudas internas dentro de la misma familia.
 * (Ej: Ivan e hijos no deben a Felipe, pero Cesar de otra familia sí puede saldar individualmente con Felipe).
 */
export function simplifyIndividualDebts(memberBalancesMap, members) {
  // Separar integrantes por unidad
  const debtors = [];
  const creditors = [];

  Object.values(memberBalancesMap).forEach(m => {
    const member = members.find(mem => mem.id === m.memberId);
    const balance = Math.round(m.netEUR * 100) / 100;
    
    if (balance < -0.01) {
      debtors.push({
        id: m.memberId,
        name: m.memberName,
        unitId: member?.unitId,
        balance: Math.abs(balance)
      });
    } else if (balance > 0.01) {
      creditors.push({
        id: m.memberId,
        name: m.memberName,
        unitId: member?.unitId,
        balance: balance
      });
    }
  });

  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const settlements = [];

  // Emparejar deudores y acreedores que pertenecen a FAMILIAS DISTINTAS
  for (let d of debtors) {
    if (d.balance < 0.01) continue;

    for (let c of creditors) {
      if (c.balance < 0.01) continue;
      
      // EXCLUIR deudas entre personas de la misma unidad familiar
      if (d.unitId === c.unitId) continue;

      const amount = Math.min(d.balance, c.balance);
      const roundedAmount = Math.round(amount * 100) / 100;

      if (roundedAmount > 0) {
        settlements.push({
          fromId: d.id,
          fromName: d.name,
          toId: c.id,
          toName: c.name,
          amountEUR: roundedAmount,
          isUnit: false
        });

        d.balance -= amount;
        c.balance -= amount;
      }
    }
  }

  return settlements;
}
