import React, { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  Receipt,
  CheckCircle,
  QrCode,
  CheckCircle2,
} from 'lucide-react';

interface FinancialCheckoutCardProps {
  subtotal?: number;
  coverage?: number;
  patientName?: string;
  insuranceLabel?: string;
  procedureCount?: number;
  onConcludeSession?: () => void;
  isMobile?: boolean;
}

export const FinancialCheckoutCard: React.FC<FinancialCheckoutCardProps> = ({
  subtotal = 0,
  coverage = 0,
  patientName,
  insuranceLabel,
  procedureCount,
  onConcludeSession,
  isMobile = false,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  const coparticipation = Math.max(0, subtotal - coverage);

  const handlePay = () => {
    setIsPaid(true);
    setToastMsg(`Pagamento de R$ ${coparticipation.toFixed(2).replace('.', ',')} registrado com sucesso!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleReceipt = () => {
    setToastMsg(patientName ? `Recibo fiscal gerado para ${patientName}!` : 'Recibo fiscal emitido com sucesso!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 relative">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="absolute top-3 right-3 left-3 bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-20 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00493a]/10 flex items-center justify-center text-[#00493a]">
            <DollarSign className="w-4 h-4 text-[#00493a]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Resumo Financeiro da Sessão
            </h2>
            <span className="text-[11px] text-slate-400">Faturamento e coparticipação</span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#00696c] text-[10px] font-semibold">
          {insuranceLabel || 'Particular'}
        </span>
      </div>

      {/* Demonstrativo */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Subtotal Procedimentos{procedureCount !== undefined ? ` (${procedureCount})` : ''}:</span>
          <span className="font-semibold text-slate-800">
            R$ {subtotal.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#00493a] font-medium">
          <span>Cobertura Convênio{insuranceLabel ? ` (${insuranceLabel})` : ''}:</span>
          <span>- R$ {coverage.toFixed(2).replace('.', ',')}</span>
        </div>

        <div className="h-px bg-slate-200 my-0.5" />

        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-900">
            Coparticipação Paciente:
          </span>
          <span className="text-base sm:text-lg font-bold text-[#005F73]">
            R$ {coparticipation.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {isPaid && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-1.5 rounded-md border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Liquidado com sucesso</span>
          </div>
        )}
      </div>

      {/* Ações Financeiras */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={handlePay}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80"
          type="button"
        >
          <CreditCard className="w-4 h-4 text-[#005F73]" />
          <span>Cartão / PIX</span>
        </button>

        <button
          onClick={handleReceipt}
          className="py-2.5 px-3 rounded-xl bg-[#00696c] hover:bg-[#005F73] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          type="button"
        >
          <Receipt className="w-4 h-4" />
          <span>Emitir Recibo</span>
        </button>
      </div>

      {/* Botão de Conclusão direta (útil em mobile) */}
      {isMobile && onConcludeSession && (
        <button
          onClick={onConcludeSession}
          className="w-full mt-1 py-3 px-4 rounded-xl bg-[#005F73] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          type="button"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Concluir Sessão</span>
        </button>
      )}
    </div>
  );
};
