// Configuración e Inicialización de Firebase (Realtime Database & Firestore)

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref as dbRef, onValue, set as dbSet, push as dbPush, remove as dbRemove } from 'firebase/database';

// Tries to get user custom config from localStorage or default placeholder
const getStoredConfig = () => {
  try {
    const saved = localStorage.getItem('japon_firebase_config');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error al leer firebase config guardada:', e);
  }
  return null;
};

export const defaultFirebaseConfig = {
  apiKey: "AIzaSy_demo_key_japon_app",
  authDomain: "gastos-japon-demo.firebaseapp.com",
  databaseURL: "https://gastos-japon-demo-default-rtdb.firebaseio.com",
  projectId: "gastos-japon-demo",
  storageBucket: "gastos-japon-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

let app = null;
let database = null;

export function initFirebase(customConfig = null) {
  const config = customConfig || getStoredConfig();
  if (!config || !config.apiKey || config.apiKey.includes('demo_key')) {
    return { isConfigured: false, database: null };
  }

  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    database = getDatabase(app);
    return { isConfigured: true, database };
  } catch (err) {
    console.error('Error inicializando Firebase:', err);
    return { isConfigured: false, database: null, error: err.message };
  }
}

export { dbRef, onValue, dbSet, dbPush, dbRemove };
