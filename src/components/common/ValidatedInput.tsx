import React, { forwardRef } from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import { applyMask } from '../../utils/documentValidation';

export type MaskType = 'cpf' | 'cnpj' | 'cpf_cnpj' | 'phone' | 'cep';

export interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  loading?: boolean;
  mask?: MaskType;
  containerClassName?: string;
}

/**
 * ValidatedInput — Componente de Entrada com Suporte Estrito ao Padrão Visual Clínico da Odonto Souza
 *
 * Suporta máscaras automáticas: 'cpf' | 'cnpj' | 'cpf_cnpj' | 'phone' | 'cep'
 *
 * Em caso de erro:
 * - Borda vermelha: border-red-500 focus:ring-red-500 focus:border-red-500
 * - Texto digitado visível e preservado
 * - Ícone XCircle (lucide-react) em vermelho no lado direito interior do input
 * - Mensagem de erro em texto vermelho: text-red-500 text-sm mt-1
 */
export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      label,
      required,
      error = false,
      errorMessage,
      leftIcon,
      rightAction,
      loading = false,
      mask,
      containerClassName = '',
      className = '',
      id,
      maxLength,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    // Definição de limites padrão para cada máscara
    const computedMaxLength = maxLength ?? (
      mask === 'cpf'
        ? 14
        : mask === 'cnpj'
        ? 18
        : mask === 'cpf_cnpj'
        ? 18
        : mask === 'phone'
        ? 15
        : mask === 'cep'
        ? 9
        : undefined
    );

    const isMonoMask = mask === 'cpf' || mask === 'cnpj' || mask === 'cpf_cnpj' || mask === 'cep';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        e.target.value = applyMask(e.target.value, mask);
      }
      onChange?.(e);
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        {/* Input Wrapper com posicionamento relativo para ícones */}
        <div className="relative">
          {/* Ícone à esquerda */}
          {leftIcon && (
            <div
              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                error ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {leftIcon}
            </div>
          )}

          {/* Campo de Entrada de Dados */}
          <input
            ref={ref}
            id={inputId}
            maxLength={computedMaxLength}
            onChange={handleChange}
            aria-invalid={error}
            aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
            className={`w-full py-2.5 rounded-xl text-sm font-medium text-slate-800 bg-white transition outline-none ${
              isMonoMask ? 'font-mono' : ''
            } ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } ${
              error || loading || rightAction ? 'pr-10' : 'pr-3.5'
            } ${
              error
                ? 'border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 shadow-2xs'
                : 'border border-slate-300 shadow-2xs focus:ring-2 focus:ring-[#0A9396] focus:border-transparent'
            } ${className}`}
            {...props}
          />

          {/* Lado Direito: Ícone de Erro, Spinner de Carregamento ou Ação Customizada */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {loading ? (
              <Loader2 className="w-5 h-5 text-[#005F73] animate-spin" />
            ) : error ? (
              <XCircle className="text-red-500 w-5 h-5 shrink-0" />
            ) : (
              rightAction
            )}
          </div>
        </div>

        {/* Mensagem de Erro Abaixo do Input */}
        {error && errorMessage && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="text-red-500 text-sm mt-1"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';
