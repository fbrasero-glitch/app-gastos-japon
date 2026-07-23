// Configuración inicial predeterminada para el viaje a Japón

export const INITIAL_UNITS = [
  {
    id: "u1",
    name: "Familia Principal",
    subtitle: "Felipe, Lorena, Ivan, Laura (4 pax)",
    color: "emerald",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    colorHex: "#10B981"
  },
  {
    id: "u2",
    name: "Suegros",
    subtitle: "Vicente, Lola (2 pax)",
    color: "indigo",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    colorHex: "#6366F1"
  },
  {
    id: "u3",
    name: "Cuñado y Pareja",
    subtitle: "Cesar, Gema (2 pax)",
    color: "amber",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    colorHex: "#F59E0B"
  }
];

export const INITIAL_MEMBERS = [
  // Familia Principal
  { id: "m1", name: "Felipe", unitId: "u1", isAdult: true, avatar: "👨" },
  { id: "m2", name: "Lorena", unitId: "u1", isAdult: true, avatar: "👩" },
  { id: "m3", name: "Ivan", unitId: "u1", isAdult: false, avatar: "👦" },
  { id: "m4", name: "Laura", unitId: "u1", isAdult: false, avatar: "👧" },
  // Suegros
  { id: "m5", name: "Vicente", unitId: "u2", isAdult: true, avatar: "👴" },
  { id: "m6", name: "Lola", unitId: "u2", isAdult: true, avatar: "👵" },
  // Cuñado y Pareja
  { id: "m7", name: "Cesar", unitId: "u3", isAdult: true, avatar: "🧔" },
  { id: "m8", name: "Gema", unitId: "u3", isAdult: true, avatar: "👩‍🦰" }
];

export const DEFAULT_EXCHANGE_RATE = 165.0; // 1 EUR = 165 JPY

export const INITIAL_EXPENSES = [
  {
    id: "exp-1",
    title: "Cena Izakaya Bienvenida Shinjuku",
    amountOriginal: 19800,
    currency: "JPY",
    amountEUR: 120.0,
    exchangeRateUsed: 165.0,
    payerId: "m1", // Felipe
    paymentMethod: "cash_jpy", // 'card' | 'cash_jpy' | 'cash_eur'
    category: "Comida",
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    splitType: "equal",
    beneficiaries: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"], // Todos
    notes: "Cena completa de bienvenida con brochetas yakitori y bebidas."
  },
  {
    id: "exp-2",
    title: "Entradas Tokyo Disneyland",
    amountOriginal: 33000,
    currency: "JPY",
    amountEUR: 200.0,
    exchangeRateUsed: 165.0,
    payerId: "m7", // Cesar
    paymentMethod: "card",
    category: "Ocio",
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    splitType: "custom",
    beneficiaries: ["m1", "m2", "m3", "m4", "m7", "m8"], // Familia Principal + Cuñados
    notes: "Pases de un día comprados online."
  },
  {
    id: "exp-3",
    title: "Billete Shinkansen Tokio -> Kioto",
    amountOriginal: 108900,
    currency: "JPY",
    amountEUR: 660.0,
    exchangeRateUsed: 165.0,
    payerId: "m5", // Vicente
    paymentMethod: "card",
    category: "Transporte",
    date: new Date(Date.now() - 3600000 * 12).toISOString(),
    splitType: "equal",
    beneficiaries: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"], // Todos
    notes: "Billetes reservados en tren bala para todo el grupo."
  },
  {
    id: "exp-4",
    title: "Snacks y Souvenirs Lawson (Familia)",
    amountOriginal: 4950,
    currency: "JPY",
    amountEUR: 30.0,
    exchangeRateUsed: 165.0,
    payerId: "m2", // Lorena
    paymentMethod: "cash_jpy",
    category: "Compras",
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    splitType: "equal",
    beneficiaries: ["m1", "m2", "m3", "m4"], // Solo Familia Principal
    notes: "Gastos personales de la unidad familiar."
  }
];

export const CATEGORIES = [
  { id: "Comida", name: "Comida / Restaurantes", icon: "🍱", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { id: "Transporte", name: "Transporte / Trenes", icon: "🚄", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: "Ocio", name: "Entradas y Ocio", icon: "🏯", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "Compras", name: "Compras / Regalos", icon: "🛍️", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { id: "Alojamiento", name: "Hotel / Ryokan", icon: "🏨", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "Varios", name: "Varios / Imprevistos", icon: "🪙", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" }
];
