import React from 'react';
import { Users, UserPlus, Activity, Cake, TrendingUp, ArrowUpRight } from 'lucide-react';
import { PacientesMetrics } from '../../types/pacientes';

interface PacientesMetricsRowProps {
  metrics: PacientesMetrics;
  isMobile?: boolean;
}

export const PacientesMetricsRow: React.FC<PacientesMetricsRowProps> = ({
  metrics,
  isMobile = false,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Total de Pacientes */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total de Pacientes
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-[#005F73] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.totalPatients.toLocaleString('pt-BR')}
          </span>
          <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +{metrics.totalGrowth}%
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 truncate">Cadastros ativos na base da clínica</p>
      </div>

      {/* Card 2: Novos este Mês */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Novos este Mês
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-50 text-[#0A9396] flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.newThisMonth}
          </span>
          <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +{metrics.newThisMonthGrowth}%
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 truncate">Registrados no mês corrente</p>
      </div>

      {/* Card 3: Em Tratamento Ativo */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Em Tratamento Ativo
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.inActiveTreatment}
          </span>
          <span className="inline-flex items-center text-[10px] sm:text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
            {metrics.treatmentPercentage}% do total
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 truncate">Procedimentos e retornos pendentes</p>
      </div>

      {/* Card 4: Aniversariantes do Mês */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Aniversariantes
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Cake className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.birthdaysThisMonth}
          </span>
          <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
            Parabéns!
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 truncate">Campanhas automáticas ativas</p>
      </div>
    </div>
  );
};
