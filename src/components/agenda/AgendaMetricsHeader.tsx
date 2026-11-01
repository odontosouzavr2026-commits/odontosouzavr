import React from 'react';
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
} from 'lucide-react';
import { AgendaMetricsData } from '../../types/agenda';

interface AgendaMetricsHeaderProps {
  metrics: AgendaMetricsData;
  isToday?: boolean;
  isMobile?: boolean;
}

export const AgendaMetricsHeader: React.FC<AgendaMetricsHeaderProps> = ({
  metrics,
  isToday = true,
  isMobile = false,
}) => {
  return (
    <>
      {/* Desktop 5-Cards Grid */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 py-2">
        {/* Card 1: Agendados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isToday ? 'Agendados Hoje' : 'Agendados no Dia'}
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metrics.scheduled}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <CalendarCheck className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        {/* Card 2: Concluídos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Concluídos
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <span>{metrics.completed}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2BFF05] shadow-xs ring-1 ring-emerald-500" title="Verde Neon C:83, M:0, Y:98, K:0" />
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2BFF05]/20 border border-[#2BFF05]/60 flex items-center justify-center text-slate-900 shadow-2xs">
            <CheckCircle className="w-5 h-5 text-emerald-800" />
          </div>
        </div>

        {/* Card 3: Em Atendimento (LIVE) */}
        <div className="bg-white p-4 rounded-xl border border-cyan-200 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-12 h-12 bg-cyan-100/50 rounded-full blur-md pointer-events-none" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Em Atendimento
              </p>
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 bg-cyan-600 text-white rounded">
                LIVE
              </span>
            </div>
            <p className="text-2xl font-bold text-[#0A9396] mt-1">{metrics.inChair}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#0A9396]">
            <Clock className="w-5 h-5 text-[#0A9396]" />
          </div>
        </div>

        {/* Card 4: Cancelados / Falta */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cancelados / Falta
            </p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{metrics.cancelled}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        {/* Card 5: Encaixe Confirmado */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Encaixe Confirmado
            </p>
            <p className="text-2xl font-bold text-violet-700 mt-1">{metrics.encaixes}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Zap className="w-5 h-5 text-violet-600" />
          </div>
        </div>
      </div>

      {/* Mobile Carrossel Horizontal */}
      <div className="flex md:hidden gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {/* Total */}
        <div className="min-w-[124px] bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between shrink-0">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
            Agendados
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">{metrics.scheduled}</span>
            <span className="text-[10px] text-slate-400">{isToday ? 'hoje' : 'no dia'}</span>
          </div>
        </div>

        {/* Em Cadeira LIVE */}
        <div className="min-w-[136px] bg-[#86f0f3]/25 p-3 rounded-2xl shadow-xs border border-[#86f0f3]/60 flex flex-col justify-between shrink-0">
          <span className="text-[11px] text-[#006e70] flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00696c] animate-pulse" />
            Em Cadeira
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#00696c]">{metrics.inChair}</span>
            <span className="text-[10px] text-[#00696c] font-bold">LIVE</span>
          </div>
        </div>

        {/* Concluídos */}
        <div className="min-w-[124px] bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between shrink-0">
          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2BFF05] ring-1 ring-emerald-500 shadow-2xs" />
            Concluídos
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">{metrics.completed}</span>
            <span className="text-[10px] text-slate-400">de {metrics.scheduled}</span>
          </div>
        </div>

        {/* Fila Espera */}
        <div className="min-w-[120px] bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between shrink-0">
          <span className="text-[11px] font-bold text-[#005F73] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-violet-600" />
            Fila Espera
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#005F73]">03</span>
            <span className="text-[10px] text-slate-400">fila</span>
          </div>
        </div>

        {/* Faltas/Canc */}
        <div className="min-w-[120px] bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between shrink-0">
          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Faltas/Canc.
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-rose-600">{metrics.cancelled}</span>
            <span className="text-[10px] text-slate-400">vagas</span>
          </div>
        </div>
      </div>
    </>
  );
};
