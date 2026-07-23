# 💴 Gastos Japón - Control de Gastos en Grupo

Aplicación web responsive (Mobile-First) progresiva para el control de gastos de un viaje en grupo a Japón de **8 personas organizadas en 3 unidades económicas**.

## 👨‍👩‍👧‍👦 Unidades Económicas e Integrantes

1. **Familia Principal (4 pax)**: Felipe, Lorena, Ivan, Laura
2. **Familia Vicente y Lola (2 pax)**: Vicente, Lola
3. **Familia Cesar y Gema (2 pax)**: Cesar, Gema

## 🚀 Características Clave

- **Conversión de Divisas Instantánea (JPY / EUR)**: Imputación de gastos en Yenes o Euros con ratio de cambio editable (ej. 1 € = 165 JPY).
- **Reparto Personalizado o por Cabezas**: Reparto automático entre todos los integrantes, solo adultos, solo la unidad familiar o selección individualizada.
- **Cuentas Claras & Liquidación de Deudas**: Algoritmo que simplifica las deudas cruzadas al mínimo número de transferencias (tanto por unidad económica como por integrante individual).
- **Vista "Mi Familia"**: Filtro directo para aislar el consumo de la Familia Principal (Felipe, Lorena, Ivan, Laura).
- **Persistencia Local**: Guarda el estado automáticamente en `LocalStorage` y ofrece exportación e importación de backups en formato `.json`.

## 🛠️ Tecnologías

- **React 19 + Vite**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Canvas Confetti**

## 🏃 Cómo ejecutar en local

```bash
npm install
npm run dev
```
