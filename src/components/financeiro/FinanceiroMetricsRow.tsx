import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
  CheckCircle,
} from 'lucide-react';
import { FinanceiroMetrics } from '../../types/financeiro';

interface FinanceiroMetricsRowProps {
  metrics: FinanceiroMetrics;
  isMobile?: boolean;
}

export const FinanceiroMetricsRow: React.FC<FinanceiroMetricsRowProps> = ({
  metrics,
  isMobile = false,
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Receitas (Mês) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/80 shadow-xs flex flex-col justify-between gap-3 sm:gap-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-emerald-800/90 uppercase tracking-wider">
            Receitas (Mês)
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
            {formatCurrency(metrics.monthlyRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px]">
              <ArrowUpRight className="w-3 h-3" />+{metrics.revenueGrowth}%
            </span>
            <span className="text-slate-500 font-medium">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* 2. Despesas (Mês) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50/90 via-red-50/30 to-white border border-rose-200/80 shadow-xs flex flex-col justify-between gap-3 sm:gap-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-rose-800/90 uppercase tracking-wider">
            Despesas (Mês)
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {formatCurrency(metrics.monthlyExpenses)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {metrics.expenseBudgetPercentage}%
            </span>
            <span className="font-medium">do orçamento comprometido</span>
          </div>
        </div>
      </div>

      {/* 3. A Receber / Vencidos */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-white border border-amber-200/80 shadow-xs flex flex-col justify-between gap-3 sm:gap-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-amber-800/90 uppercase tracking-wider">
            A Receber / Vencidos
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
            {formatCurrency(metrics.toReceive)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
              {metrics.pendingInstallments} parcelas
            </span>
            <span className="font-medium">em aberto ou tolerância</span>
          </div>
        </div>
      </div>

      {/* 4. Saldo Operacional */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-50/90 via-teal-50/50 to-white border border-[#0A9396]/30 shadow-xs flex flex-col justify-between gap-3 sm:gap-4 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-[#005F73] uppercase tracking-wider">
            Saldo Operacional
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#005F73] text-white flex items-center justify-center shadow-xs shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#005F73] tracking-tight">
            {formatCurrency(metrics.operatingBalance)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A9396]/15 text-[#005F73] font-bold text-[11px] border border-[#0A9396]/20">
              <CheckCircle className="w-3.5 h-3.5 text-[#0A9396]" />
              Superávit Ativo
            </span>
            <span className="text-slate-500 font-medium">(Caixa Livre)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
