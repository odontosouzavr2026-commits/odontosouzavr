import React from 'react';
import { Layers, TrendingUp, DollarSign, Tag, ArrowUpRight } from 'lucide-react';
import { ProcedimentosMetrics } from '../../types/procedimentos';

interface ProcedimentosMetricsRowProps {
  metrics: ProcedimentosMetrics;
  isMobile?: boolean;
}

export const ProcedimentosMetricsRow: React.FC<ProcedimentosMetricsRowProps> = ({
  metrics,
  isMobile = false,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {/* Card 1: Total Procedimentos */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total de Procedimentos
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              {metrics.totalActive}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-teal-50 text-[#0A9396]">
              +{metrics.newThisMonth} novos
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Disponíveis para agendamento</span>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-50/80 text-[#00696c] flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Card 2: Serviço Mais Realizado */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Mais Realizado
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
              {metrics.mostPerformedName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{metrics.mostPerformedPercentage}% base ({metrics.mostPerformedSessions} sessões)</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Card 3: Ticket Médio Geral */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Ticket Médio Geral
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              R$ {metrics.ticketMedio}
            </span>
            <span className="text-xs text-slate-400 font-normal">,00</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-teal-700">
            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-teal-50 text-[#00696c] font-semibold text-[10px] sm:text-xs">
              +{metrics.ticketMedioGrowth}%
            </span>
            <span className="text-slate-400">vs. mês anterior</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-50 text-[#005F73] flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Card 4: Especialidades Ativas */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Especialidades
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              {metrics.activeSpecialtiesCount}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">grupos ativos</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 truncate">Dentística, Cirurgia e +6</span>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
          <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};
