import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextData {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: 'success', title, message, duration });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: 'warning', title, message, duration });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: 'error', title, message, duration });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast({ type: 'info', title, message, duration });
    },
    [showToast]
  );

  // Escuta eventos globais de toast disparados por serviços assíncronos (ex: disparos WhatsApp)
  React.useEffect(() => {
    const handleGlobalToast = (event: Event) => {
      const customEvent = event as CustomEvent<Omit<ToastItem, 'id'>>;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };

    window.addEventListener('app_toast', handleGlobalToast as EventListener);
    return () => {
      window.removeEventListener('app_toast', handleGlobalToast as EventListener);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, warning, error, info, dismissToast }}>
      {children}
      {/* Toast Container fixado no canto superior direito com alto z-index */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          // Estilos com alto contraste conforme solicitação do usuário
          // Verde positivo: fundo verde esmeralda suave, borda verde sólida, texto verde escuro legível
          // Alerta amarelo: fundo âmbar suave, borda âmbar sólida, texto âmbar/marrom escuro altamente legível
          // Erro vermelho: fundo vermelho suave, borda vermelha sólida, texto vermelho/bordô escuro altamente legível
          let containerStyle = 'bg-white border-slate-200 text-slate-800';
          let icon = <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />;
          let titleColor = 'text-slate-900';
          let messageColor = 'text-slate-600';

          if (toast.type === 'success') {
            containerStyle = 'bg-[#ecfdf5] border-2 border-[#10b981] shadow-lg shadow-emerald-900/10';
            icon = <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />;
            titleColor = 'text-[#064e3b] font-bold';
            messageColor = 'text-[#065f46] font-medium';
          } else if (toast.type === 'warning') {
            containerStyle = 'bg-[#fffbeb] border-2 border-[#f59e0b] shadow-lg shadow-amber-900/10';
            icon = <AlertTriangle className="w-5 h-5 text-[#d97706] shrink-0 mt-0.5" />;
            titleColor = 'text-[#78350f] font-bold';
            messageColor = 'text-[#92400e] font-medium';
          } else if (toast.type === 'error') {
            containerStyle = 'bg-[#fef2f2] border-2 border-[#ef4444] shadow-lg shadow-rose-900/10';
            icon = <AlertCircle className="w-5 h-5 text-[#dc2626] shrink-0 mt-0.5" />;
            titleColor = 'text-[#7f1d1d] font-bold';
            messageColor = 'text-[#991b1b] font-medium';
          } else if (toast.type === 'info') {
            containerStyle = 'bg-[#f0f9ff] border-2 border-[#0284c7] shadow-lg shadow-sky-900/10';
            icon = <Info className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />;
            titleColor = 'text-[#0c4a6e] font-bold';
            messageColor = 'text-[#0369a1] font-medium';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl p-3.5 flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${containerStyle}`}
              role="alert"
            >
              {icon}
              <div className="flex-1 min-w-0 pr-1">
                <h4 className={`text-sm leading-tight tracking-tight ${titleColor}`}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className={`text-xs mt-1 leading-relaxed ${messageColor}`}>
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextData => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
};
