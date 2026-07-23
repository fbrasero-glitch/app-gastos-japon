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
    name: "Familia Vicente y Lola",
    subtitle: "Vicente, Lola (2 pax)",
    color: "indigo",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    colorHex: "#6366F1"
  },
  {
    id: "u3",
    name: "Familia Cesar y Gema",
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
  // Familia Vicente y Lola
  { id: "m5", name: "Vicente", unitId: "u2", isAdult: true, avatar: "👴" },
  { id: "m6", name: "Lola", unitId: "u2", isAdult: true, avatar: "👵" },
  // Familia Cesar y Gema
  { id: "m7", name: "Cesar", unitId: "u3", isAdult: true, avatar: "🧔" },
  { id: "m8", name: "Gema", unitId: "u3", isAdult: true, avatar: "👩‍🦰" }
];

export const DEFAULT_EXCHANGE_RATE = 165.0; // 1 EUR = 165 JPY

// Inicializado a vacíos a petición del usuario para introducir sus datos reales
export const INITIAL_EXPENSES = [];

export const CATEGORIES = [
  { id: "Comida", name: "Comida / Restaurantes", icon: "🍱", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { id: "Transporte", name: "Transporte / Trenes", icon: "🚄", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: "Ocio", name: "Entradas y Ocio", icon: "🏯", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "Compras", name: "Compras / Regalos", icon: "🛍️", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { id: "Alojamiento", name: "Hotel / Ryokan", icon: "🏨", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "Varios", name: "Varios / Imprevistos", icon: "🪙", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" }
];
