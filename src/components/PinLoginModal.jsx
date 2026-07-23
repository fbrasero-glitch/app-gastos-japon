import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { hashPin, verifyPin } from '../utils/cryptoPin';
import { Lock, KeyRound, UserCheck, ShieldAlert, ArrowLeft, Check, Sparkles } from 'lucide-react';

export function PinLoginModal() {
  const { members, units, currentMemberId, setCurrentMemberId, memberPins, setMemberPin } = useExpenses();

  const [selectedMember, setSelectedMember] = useState(null);
  const [pinDigits, setPinDigits] = useState('');
  const [confirmPinDigits, setConfirmPinDigits] = useState('');
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Si ya hay perfil activo seleccionado, no mostrar pantalla de login
  if (currentMemberId) return null;

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setPinDigits('');
    setConfirmPinDigits('');
    setErrorMessage('');
    setSuccessMessage('');

    const existingPinHash = memberPins[member.id];
    if (!existingPinHash) {
      setIsCreatingPin(true);
    } else {
      setIsCreatingPin(false);
    }
  };

  const handleKeyPress = (numStr) => {
    if (errorMessage) setErrorMessage('');
    if (isCreatingPin) {
      if (pinDigits.length < 4) {
        setPinDigits(prev => prev + numStr);
      } else if (confirmPinDigits.length < 4) {
        setConfirmPinDigits(prev => prev + numStr);
      }
    } else {
      if (pinDigits.length < 4) {
        const nextPin = pinDigits + numStr;
        setPinDigits(nextPin);
        
        // Auto-verificar al llegar a 4 dígitos
        if (nextPin.length === 4) {
          const storedHash = memberPins[selectedMember.id];
          if (verifyPin(nextPin, storedHash)) {
            setCurrentMemberId(selectedMember.id);
          } else {
            setErrorMessage('PIN incorrecto. Vuelve a intentarlo.');
            setTimeout(() => setPinDigits(''), 1000);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    if (errorMessage) setErrorMessage('');
    if (isCreatingPin) {
      if (confirmPinDigits.length > 0) {
        setConfirmPinDigits(prev => prev.slice(0, -1));
      } else {
        setPinDigits(prev => prev.slice(0, -1));
      }
    } else {
      setPinDigits(prev => prev.slice(0, -1));
    }
  };

  const handleCreatePinSubmit = () => {
    if (pinDigits.length !== 4) {
      setErrorMessage('El PIN debe tener 4 dígitos.');
      return;
    }
    if (pinDigits !== confirmPinDigits) {
      setErrorMessage('Los PINs no coinciden. Inténtalo de nuevo.');
      setPinDigits('');
      setConfirmPinDigits('');
      return;
    }

    const hashed = hashPin(pinDigits);
    setMemberPin(selectedMember.id, hashed);
    setSuccessMessage('¡PIN guardado correctamente!');
    setTimeout(() => {
      setCurrentMemberId(selectedMember.id);
    }, 800);
  };

  const getUnitName = (unitId) => units.find(u => u.id === unitId)?.name || '';
  const getUnitColor = (unitId) => units.find(u => u.id === unitId)?.badgeBg || 'bg-slate-800 text-slate-300';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="w-full max-w-md space-y-6">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-red-500/30 border border-white/20">
            ⛩️
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Gastos Japón 2026
          </h1>
          <p className="text-xs text-slate-400">
            Selecciona tu perfil de integrante para entrar y acceder a tus gastos
          </p>
        </div>

        {/* 1. SECCIÓN: Grid de Integrantes */}
        {!selectedMember ? (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
              ¿Quién eres tú?
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {members.map((m) => {
                const hasPin = Boolean(memberPins[m.id]);
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMember(m)}
                    className="bg-slate-900/90 border border-slate-800 hover:border-red-500/60 p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 text-left group shadow-lg"
                  >
                    <span className="text-3xl shrink-0 group-hover:scale-110 transition">{m.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-100 text-sm flex items-center gap-1">
                        <span className="truncate">{m.name}</span>
                        {hasPin && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                      </div>
                      <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-semibold border mt-0.5 truncate max-w-full ${getUnitColor(m.unitId)}`}>
                        {getUnitName(m.unitId)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* 2. SECCIÓN: Introducción o Creación de PIN */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Volver */}
            <button
              onClick={() => setSelectedMember(null)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cambiar de Integrante</span>
            </button>

            {/* Perfil Seleccionado */}
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-4xl">{selectedMember.avatar}</span>
              <div>
                <h3 className="font-bold text-slate-100 text-base">{selectedMember.name}</h3>
                <span className="text-xs text-slate-400">{getUnitName(selectedMember.unitId)}</span>
              </div>
            </div>

            {/* Título de Acción */}
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-100 text-sm flex items-center justify-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>
                  {isCreatingPin
                    ? 'Define tu PIN Secreto de 4 dígitos'
                    : 'Introduce tu PIN para acceder'}
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                {isCreatingPin
                  ? 'Este PIN protegerá tu perfil y tus gastos privados.'
                  : 'Teclea los 4 números de tu clave de acceso.'}
              </p>
            </div>

            {/* Indicador visual de los 4 dígitos */}
            <div className="space-y-3">
              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2, 3].map(idx => {
                  const currentPin = isCreatingPin
                    ? (pinDigits.length < 4 ? pinDigits : confirmPinDigits)
                    : pinDigits;
                  const isFilled = idx < currentPin.length;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isFilled
                          ? 'bg-amber-400 border-amber-400 scale-110 shadow-md shadow-amber-400/40'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    ></div>
                  );
                })}
              </div>

              {isCreatingPin && (
                <div className="text-center text-xs font-semibold text-slate-400">
                  {pinDigits.length < 4
                    ? '1️⃣ Introduce tu nuevo PIN de 4 números'
                    : '2️⃣ Vuelve a teclear tu PIN para confirmar'}
                </div>
              )}

              {/* Mensajes de error / éxito */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs text-center font-semibold animate-shake">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-semibold flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>

            {/* Teclado numérico táctil de 4x3 */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((btn, idx) => {
                if (btn === '') return <div key={idx}></div>;
                if (btn === 'DEL') {
                  return (
                    <button
                      key={idx}
                      onClick={handleBackspace}
                      className="py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 active:scale-95 transition"
                    >
                      Borrar
                    </button>
                  );
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleKeyPress(btn)}
                    className="py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 font-black text-xl hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition shadow-sm"
                  >
                    {btn}
                  </button>
                );
              })}
            </div>

            {/* Botón de confirmar creación de PIN */}
            {isCreatingPin && pinDigits.length === 4 && confirmPinDigits.length === 4 && (
              <button
                onClick={handleCreatePinSubmit}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Confirmar y Crear PIN</span>
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
