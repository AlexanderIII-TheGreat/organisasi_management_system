'use client';

import React, { useEffect, useState } from 'react';

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (value?: string) => void;
  title: string;
  message: string;
  type?: 'confirm' | 'alert' | 'input' | 'error' | 'success';
  inputType?: string;
  placeholder?: string;
  inputValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ModernModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  inputType = 'text',
  placeholder = '',
  inputValue = '',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal'
}: ModernModalProps) {
  const [val, setVal] = useState(inputValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setVal(inputValue);
    } else {
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen, inputValue]);

  if (!isOpen && !isAnimating) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm(type === 'input' ? val : undefined);
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return <span className="material-symbols-outlined text-4xl text-error">error</span>;
      case 'success': return <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>;
      case 'input': return <span className="material-symbols-outlined text-4xl text-primary">edit_calendar</span>;
      default: return <span className="material-symbols-outlined text-4xl text-amber-500">help</span>;
    }
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        
        {/* Header/Ikon */}
        <div className="pt-8 pb-4 flex flex-col items-center text-center px-8">
          <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center mb-4 shadow-inner">
            {getIcon()}
          </div>
          <h3 className="text-2xl font-black text-on-surface tracking-tight mb-2">{title}</h3>
          <p className="text-on-surface-variant font-medium leading-relaxed">{message}</p>
        </div>

        {/* Form Input (Opsional) */}
        {type === 'input' && (
          <div className="px-8 pb-4">
            <input 
              type={inputType}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={placeholder}
              className="w-full px-5 py-4 bg-white border-2 border-outline-variant/30 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all font-bold text-center text-lg"
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="p-8 flex flex-col md:flex-row gap-3">
          {type !== 'alert' && type !== 'success' && type !== 'error' && (
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95 order-2 md:order-1"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95 order-1 md:order-2 ${
              type === 'error' ? 'bg-error hover:bg-red-600' : 'bg-primary hover:bg-primary-dim'
            }`}
          >
            {confirmText}
          </button>
        </div>

        {/* Decorative Bottom Bar */}
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-50" />
      </div>
    </div>
  );
}
