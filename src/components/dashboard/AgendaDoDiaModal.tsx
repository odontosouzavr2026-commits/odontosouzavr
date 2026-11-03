import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Stethoscope,
  Sparkles,
  Users,
  Check,
} from 'lucide-react';
import { PatientAppointment } from '../../types/dashboard';

interface AgendaDoDiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: PatientAppointment[];
  onNavigateToAgenda?: () => void;
  onNavigateToAtendimento?: (appointmentId?: string) => void;
}

export const AgendaDoDiaModal: React.FC<AgendaDoDiaModalProps> = ({
  isOpen,
  onClose,
  appointments = [],
  onNavigateToAgenda,
  onNavigateToAtendimento,
}) => {
  const [dontShowAgainSession, setDontShowAgainSession] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgainSession) {
      try {
        sessionStorage.setItem('odonto_agenda_dia_modal_visto', 'true');
      } catch {}
    }
    onClose();
  };

  const handleGoToAgenda = () => {
    handleClose();
    if (onNavigateToAgenda) {
      onNavigateToAgenda();
    }
  };

  const handleStartAttendance = (appId: string) => {
    handleClose();
    if (onNavigateToAtendimento) {
      onNavigateToAtendimento(appId);
    }
  };

  // Métricas rápidas das consultas de hoje
  const total = appointments.length;
  const confirmados = appointments.filter(
    (a) => a.status === 'Confirmado' || (a.status as any) === 'confirmado'
  ).length;
  const finalizados = appointments.filter(
    (a) => a.status === 'Finalizado' || (a.status as any) === 'concluido'
  ).length;
  const emAndamentoOuEspera = appointments.filter(
    (a) => a.status === 'Em Atendimento' || a.status === 'Aguardando'
  ).length;

  const now = new Date();
  const dataExtenso = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('finaliz') || s.includes('conclu')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle2 className="w-3 h-3 text-slate-500" />
          Finalizado
        </span>
      );
    }
    if (s.includes('atendimento')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Em Atendimento
        </span>
      );
    }
    if (s.includes('cancel') || s.includes('desmarc')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          Cancelado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Confirmado
      </span>
    );
  };

  const getAvatarColor = (initials: string) => {
    const palette = [
      'bg-[#86f0f3] text-[#006e70]',
      'bg-[#b2ebff] text-[#004655]',
      'bg-[#d3e4fe] text-[#0b1c30]',
      'bg-[#b0efda] text-[#00493a]',
      'bg-amber-100 text-amber-900',
      'bg-purple-100 text-purple-900',
      'bg-emerald-100 text-emerald-900',
    ];
    let sum = 0;
    for (let i = 0; i < initials.length; i++) sum += initials.charCodeAt(i);
    return palette[sum % palette.length];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* ============================================================ */}
        {/* HEADER MODAL COM SAUDAÇÃO & DATA DO DIA                      */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-[#005F73] to-[#0A9396] p-5 sm:p-6 text-white shrink-0 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-xs">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Agenda do Dia • Odonto Souza
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight capitalize mt-0.5">
                {dataExtenso}
              </h2>
            </div>
          </div>

          {/* Cards Rápidos de Resumo no Topo do Modal */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4 pt-4 border-t border-white/15 text-center">
            <div className="bg-white/10 rounded-xl p-2 sm:p-2.5">
              <p className="text-lg sm:text-2xl font-black text-white leading-none">{total}</p>
              <p className="text-[10px] sm:text-xs text-cyan-100 font-semibold mt-1">Total Hoje</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-2.5">
              <p className="text-lg sm:text-2xl font-black text-emerald-300 leading-none">{confirmados}</p>
              <p className="text-[10px] sm:text-xs text-cyan-100 font-semibold mt-1">Confirmados</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-2.5">
              <p className="text-lg sm:text-2xl font-black text-amber-300 leading-none">{emAndamentoOuEspera}</p>
              <p className="text-[10px] sm:text-xs text-cyan-100 font-semibold mt-1">Em Espera</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-2.5">
              <p className="text-lg sm:text-2xl font-black text-slate-200 leading-none">{finalizados}</p>
              <p className="text-[10px] sm:text-xs text-cyan-100 font-semibold mt-1">Atendidos</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LISTA DE CONSULTAS DO DIA COM SCROLL                         */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#005F73]" />
              <span>Pacientes Agendados para Hoje ({total})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Ordem cronológica</span>
          </div>

          {total === 0 ? (
            <div className="py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Nenhuma consulta agendada para hoje até o momento!
                </p>
                <p className="text-xs text-slate-500">
                  O consultório está livre para novos encaixes de urgência ou manutenções preventivas.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {appointments.map((app) => {
                const isFinalizado =
                  (app.status || '').toLowerCase().includes('finaliz') ||
                  (app.status || '').toLowerCase().includes('conclu');
                const isAtendimento = (app.status || '').toLowerCase().includes('atendimento');

                return (
                  <div
                    key={app.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAtendimento
                        ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                        : isFinalizado
                        ? 'bg-slate-50/70 border-slate-200 opacity-80'
                        : 'bg-white border-slate-200 hover:border-[#005F73]/40 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Horário & Paciente */}
                    <div className="flex items-center gap-3">
                      {/* Pill de Horário */}
                      <div className="w-14 sm:w-16 py-1.5 rounded-xl bg-[#005F73]/10 text-[#005F73] font-mono font-black text-xs sm:text-sm text-center shrink-0">
                        {app.time}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${getAvatarColor(
                          app.initials || 'PA'
                        )}`}
                      >
                        {app.initials || 'PA'}
                      </div>

                      {/* Dados do Paciente */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {app.name}
                          </p>
                          <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {app.chartNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {app.procedure || 'Consulta Inicial'}
                        </p>
                      </div>
                    </div>

                    {/* Status & Ação Rápida */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <div>{getStatusBadge(app.status)}</div>

                      {!isFinalizado && (
                        <button
                          type="button"
                          onClick={() => handleStartAttendance(app.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#005F73] hover:bg-[#004756] text-white transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                          title="Iniciar atendimento deste paciente"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Atender</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RODAPÉ DO MODAL                                              */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none self-start sm:self-center">
            <input
              type="checkbox"
              checked={dontShowAgainSession}
              onChange={(e) => setDontShowAgainSession(e.target.checked)}
              className="w-4 h-4 rounded text-[#005F73] focus:ring-[#005F73] border-slate-300 cursor-pointer"
            />
            <span>Não exibir novamente nesta sessão</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Ir ao Dashboard
            </button>
            <button
              type="button"
              onClick={handleGoToAgenda}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004756] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver Agenda Completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
