import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  addToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, addToast: showToast, success, error, info }}>
      {children}
      {/* Toast Overlay Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '380px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: `1px solid ${
                  isSuccess
                    ? 'rgba(16, 185, 129, 0.4)'
                    : isError
                    ? 'rgba(229, 57, 53, 0.4)'
                    : 'var(--border-subtle)'
                }`,
                borderLeft: `4px solid ${
                  isSuccess ? '#10b981' : isError ? 'var(--accent-primary)' : '#3b82f6'
                }`,
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              {isSuccess && <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />}
              {isError && <AlertCircle size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
              {!isSuccess && !isError && <Info size={16} color="#3b82f6" style={{ flexShrink: 0 }} />}

              <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
