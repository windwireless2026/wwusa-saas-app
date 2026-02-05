'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/hooks/useToast';

interface ToastHelpers {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

interface UIContextType {
  alert: (title: string, message: string, type?: 'info' | 'success' | 'danger') => Promise<void>;
  confirm: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'danger'
  ) => Promise<boolean>;
  /** Toasts não bloqueiam; use para feedback rápido (ex.: "Salvo!", "Erro ao salvar"). */
  toast: ToastHelpers;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error, warning, info, toasts } = useToast();
  const toast: ToastHelpers = { success, error, warning, info };

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'danger';
    isConfirm: boolean;
    resolve?: (value: boolean | void) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    isConfirm: false,
  });

  const showAlert = useCallback(
    (title: string, message: string, type: 'info' | 'success' | 'danger' = 'info') => {
      return new Promise<void>(resolve => {
        setModalConfig({
          isOpen: true,
          title,
          message,
          type,
          isConfirm: false,
          resolve: resolve as (value: boolean | void) => void,
        });
      });
    },
    []
  );

  const showConfirm = useCallback(
    (title: string, message: string, type: 'info' | 'success' | 'danger' = 'info') => {
      return new Promise<boolean>(resolve => {
        setModalConfig({
          isOpen: true,
          title,
          message,
          type,
          isConfirm: true,
          resolve: resolve as (value: boolean | void) => void,
        });
      });
    },
    []
  );

  const handleConfirm = () => {
    if (modalConfig.resolve) {
      modalConfig.resolve(true);
    }
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (modalConfig.resolve) {
      modalConfig.resolve(false);
    }
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <UIContext.Provider value={{ alert: showAlert, confirm: showConfirm, toast }}>
      {children}
      {/* Toasts globais via contexto */}
      {toasts.length > 0 && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              role="alert"
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                background: t.type === 'error' ? '#fef2f2' : t.type === 'success' ? '#f0fdf4' : t.type === 'warning' ? '#fffbeb' : '#f0f9ff',
                color: t.type === 'error' ? '#b91c1c' : t.type === 'success' ? '#15803d' : t.type === 'warning' ? '#b45309' : '#0369a1',
                border: `1px solid ${t.type === 'error' ? '#fecaca' : t.type === 'success' ? '#bbf7d0' : t.type === 'warning' ? '#fde68a' : '#bae6fd'}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                maxWidth: 360,
              }}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={modalConfig.isConfirm ? 'Confirmar' : 'OK'}
        cancelText={modalConfig.isConfirm ? 'Cancelar' : 'Fechar'}
      />
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    if (typeof window === 'undefined') {
      // During build/SSR, allow fallback to prevent crash
      return {
        alert: async () => { },
        confirm: async () => false,
        toast: { success: () => { }, error: () => { }, warning: () => { }, info: () => { } }
      };
    }
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
