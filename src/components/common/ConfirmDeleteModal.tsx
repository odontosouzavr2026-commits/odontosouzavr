import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  itemDetails?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  alertText?: string | React.ReactNode | false;
  extraContent?: React.ReactNode;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Exclusão',
  description = 'Esta ação não poderá ser desfeita. O registro será removido permanentemente do sistema.',
  itemName,
  itemDetails,
  confirmLabel = 'Sim, Excluir',
  cancelLabel = 'Cancelar',
  isLoading = false,
  alertText = 'Esta ação liberará imediatamente o horário para nova marcação.',
  extraContent,
}) => {
  // Fecha com a tecla Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Botão Fechar no Topo Direito */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho do Modal com Ícone de Alerta Clínico */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Trash2 className="w-6 h-6 text-rose-600" />
          </div>

          <div className="space-y-1 pr-6">
            <h3
              id="confirm-delete-title"
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Card de Destaque com o Item a ser Excluído */}
        {(itemName || itemDetails) && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
            {itemName && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {itemName}
                </span>
              </div>
            )}
            {itemDetails && (
              <p className="text-xs text-slate-600 pl-3.5 leading-relaxed">
                {itemDetails}
              </p>
            )}
          </div>
        )}

        {/* Alerta Adicional */}
        {alertText !== false && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{alertText}</span>
          </div>
        )}

        {/* Conteúdo Extra (Ex: Notificação WhatsApp de Remarcação) */}
        {extraContent}

        {/* Rodapé com Botões de Ação Padronizados */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition hover:opacity-80 cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 hover:opacity-80 transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 text-white" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
