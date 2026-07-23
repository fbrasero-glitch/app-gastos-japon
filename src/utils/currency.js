// Utilidades de conversión y formateo de monedas (JPY y EUR)

/**
 * Convierte Yenes a Euros según el tipo de cambio especificado.
 * @param {number} amountJPY 
 * @param {number} rate - Yenes por 1 Euro (ej. 165)
 * @returns {number}
 */
export function convertJPYToEUR(amountJPY, rate = 165.0) {
  if (!amountJPY || isNaN(amountJPY) || rate <= 0) return 0;
  return Number((amountJPY / rate).toFixed(2));
}

/**
 * Convierte Euros a Yenes.
 * @param {number} amountEUR 
 * @param {number} rate 
 * @returns {number}
 */
export function convertEURToJPY(amountEUR, rate = 165.0) {
  if (!amountEUR || isNaN(amountEUR)) return 0;
  return Math.round(amountEUR * rate);
}

/**
 * Formatea un valor numérico en Euros (€)
 * @param {number} amount 
 * @returns {string}
 */
export function formatEUR(amount) {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

/**
 * Formatea un valor numérico en Yenes (¥)
 * @param {number} amount 
 * @returns {string}
 */
export function formatJPY(amount) {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(val);
}

/**
 * Formatea según el código de moneda especificado
 */
export function formatCurrency(amount, currency = 'EUR', rate = 165.0) {
  if (currency === 'JPY') {
    return formatJPY(amount);
  }
  return formatEUR(amount);
}
