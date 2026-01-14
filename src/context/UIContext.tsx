'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface UIContextType {
  alert: (title: string, message: string, type?: 'info' | 'success' | 'danger') => Promise<void>;
  confirm: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'danger'
  ) => Promise<boolean>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    <UIContext.Provider value={{ alert: showAlert, confirm: showConfirm }}>
      {children}
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
        confirm: async () => false
      };
    }
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
