// Utilidades simples para codificación y verificación de PIN de 4 dígitos

/**
 * Genera un Hash simple a partir de un PIN de 4 dígitos
 * @param {string} pin 
 * @returns {string}
 */
export function hashPin(pin) {
  if (!pin || typeof pin !== 'string') return '';
  const cleanPin = pin.trim();
  let hash = 0;
  for (let i = 0; i < cleanPin.length; i++) {
    const char = cleanPin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `pin_v1_${Math.abs(hash).toString(36)}`;
}

/**
 * Verifica si un PIN introducido coincide con el Hash guardado
 * @param {string} inputPin 
 * @param {string} storedHash 
 * @returns {boolean}
 */
export function verifyPin(inputPin, storedHash) {
  if (!inputPin || !storedHash) return false;
  return hashPin(inputPin) === storedHash;
}
