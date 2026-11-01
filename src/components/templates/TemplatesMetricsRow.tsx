import React from 'react';
import {
  FileText,
  Send,
  CheckCheck,
  Clock,
  CheckCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { TemplatesMetrics } from '../../types/templates';

interface TemplatesMetricsRowProps {
  metrics: TemplatesMetrics;
  isMobile?: boolean;
}

export const TemplatesMetricsRow: React.FC<TemplatesMetricsRowProps> = ({
  metrics,
  isMobile = false,
}) => {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Templates Ativos */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            Templates Ativos
          </span>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#0A9396]">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.activeCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {metrics.totalCount} cadastrados
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[#0A9396] text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">100% aprovados pela Meta</span>
          </div>
        </div>
      </div>

      {/* 2. Disparos Hoje */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            Disparos Hoje
          </span>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-teal-50/80 flex items-center justify-center text-[#005F73]">
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.sentToday}
            </span>
            <span className="text-xs text-slate-400 font-medium">mensagens</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">+{metrics.sentGrowth}% vs ontem</span>
          </div>
        </div>
      </div>

      {/* 3. Taxa de Resposta */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            Taxa de Resposta
          </span>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.responseRate}%
            </span>
            <span className="text-xs text-slate-400 font-medium">interação</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] sm:text-xs">Alta receptividade</span>
          </div>
        </div>
      </div>

      {/* 4. Tempo Poupado */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            Tempo Poupado
          </span>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#005F73]">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ~{metrics.timeSavedDailyHours}h
            </span>
            <span className="text-xs text-slate-400 font-medium">/ dia</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-[#005F73]" />
            <span className="text-[11px] sm:text-xs">Autonomia da recepção</span>
          </div>
        </div>
      </div>
    </div>
  );
};
