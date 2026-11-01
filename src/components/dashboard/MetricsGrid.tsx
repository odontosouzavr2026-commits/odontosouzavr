import React from 'react';
import { User, Clock, DollarSign, CheckSquare, UserPlus, UserX, TrendingUp, ArrowUp } from 'lucide-react';

export interface MetricsGridProps {
  waitingCount?: number;
  totalAppointmentsToday?: number;
  faturamentoDia?: number;
  faturamentoLabel?: string;
  orcamentosTaxa?: number;
  orcamentosTotal?: number;
  orcamentosAprovados?: number;
  novosPacientesTotal?: number;
  novosPacientesMes?: number;
  taxaFaltas?: number;
  totalFaltas?: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ 
  waitingCount = 0, 
  totalAppointmentsToday = 0,
  faturamentoDia = 0,
  faturamentoLabel = 'Faturamento Dia',
  orcamentosTaxa = 0,
  orcamentosTotal = 0,
  orcamentosAprovados = 0,
  novosPacientesTotal = 0,
  novosPacientesMes = 0,
  taxaFaltas = 0,
  totalFaltas = 0,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Card 1: Consultas Hoje */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#b2ebff]/50 text-[#004655] flex items-center justify-center group-hover:scale-105 transition-transform">
            <User className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#00696c] bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100/60">
            <TrendingUp className="w-3 h-3 text-[#00696c]" />
            +{totalAppointmentsToday > 0 ? totalAppointmentsToday : 0}
          </span>
        </div>
        <div>
          <span className="text-3xl text-slate-900 font-bold leading-none tracking-tight block mb-1">
            {totalAppointmentsToday}
          </span>
          <span className="text-xs font-semibold text-slate-600 block truncate">
            Consultas Hoje
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Agendados no sistema</span>
        </div>
      </div>

      {/* Card 2: Aguardando Atendimento */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
        </div>
        <div>
          <span className="text-3xl text-slate-900 font-bold leading-none tracking-tight block mb-1">
            {waitingCount}
          </span>
          <span className="text-xs font-semibold text-slate-600 block truncate">
            Aguardando Atend.
          </span>
          <span className="text-[11px] text-amber-700 font-medium block mt-0.5">Na recepção / Cadeira</span>
        </div>
      </div>

      {/* Card 3: Faturamento do Dia / Mês */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#b0efda] text-[#00493a] flex items-center justify-center group-hover:scale-105 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center text-[11px] font-bold text-[#00493a] bg-[#b0efda]/70 px-1.5 py-0.5 rounded">
            Recebido
          </span>
        </div>
        <div>
          <span className="text-2xl text-[#005F73] font-bold leading-none tracking-tight block mb-1 truncate" title={formatCurrency(faturamentoDia)}>
            {formatCurrency(faturamentoDia)}
          </span>
          <span className="text-xs font-semibold text-slate-600 block truncate">
            {faturamentoLabel}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5">Entradas confirmadas</span>
        </div>
      </div>

      {/* Card 4: Orçamentos Aprovados */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#86f0f3]/40 text-[#00696c] flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {orcamentosTotal > 0 ? `${orcamentosTotal} total` : '0 prop.'}
          </span>
        </div>
        <div>
          <span className="text-3xl text-slate-900 font-bold leading-none tracking-tight block mb-1">
            {orcamentosTaxa}%
          </span>
          <span className="text-xs font-semibold text-slate-600 block truncate">
            Orçamentos Apr.
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {orcamentosAprovados} de {orcamentosTotal} {orcamentosTotal === 1 ? 'proposta' : 'propostas'}
          </span>
        </div>
      </div>

      {/* Card 5: Novos Pacientes */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#8bd1e8]/30 text-[#005f73] flex items-center justify-center group-hover:scale-105 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center text-[11px] font-bold text-[#005F73]">
            <ArrowUp className="w-3.5 h-3.5" /> {novosPacientesMes}
          </span>
        </div>
        <div>
          <span className="text-3xl text-slate-900 font-bold leading-none tracking-tight block mb-1">
            {novosPacientesTotal}
          </span>
          <span className="text-xs font-semibold text-slate-600 block truncate">
            Total Pacientes
          </span>
          <span className="text-[11px] text-[#005f73] block mt-0.5">
            +{novosPacientesMes} este mês
          </span>
        </div>
      </div>

      {/* Card 6: Taxa de Faltas */}
      <div className="bg-gradient-to-br from-white via-white to-red-50/50 p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <UserX className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-red-600 bg-red-100/60 px-2 py-0.5 rounded-full font-semibold">
            {taxaFaltas > 10 ? 'Atenção' : 'Baixa'}
          </span>
        </div>
        <div>
          <span className="text-3xl text-red-600 font-bold leading-none tracking-tight block mb-1">
            {taxaFaltas}%
          </span>
          <span className="text-xs font-semibold text-slate-600 block truncate">
            Taxa de Faltas
          </span>
          <span className="text-[11px] text-red-600 font-medium block mt-0.5">
            {totalFaltas === 0
              ? 'Zero ausências hoje'
              : `${totalFaltas} ${totalFaltas === 1 ? 'ausência' : 'ausências'}`}
          </span>
        </div>
      </div>
    </div>
  );
};
