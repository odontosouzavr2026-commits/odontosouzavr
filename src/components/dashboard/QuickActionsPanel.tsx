import React from 'react';
import {
  Zap,
  Calendar,
  UserPlus,
  FileSpreadsheet,
  DollarSign,
  UserCog,
  FileText,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface QuickActionsPanelProps {
  onNavigate?: (path: string) => void;
  onOpenAppointmentModal?: () => void;
  onOpenPatientModal?: () => void;
  onOpenBudgetModal?: () => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onNavigate,
  onOpenAppointmentModal,
  onOpenPatientModal,
  onOpenBudgetModal,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-[#005F73]" />
          <h2 className="text-base text-slate-900 font-semibold">Ações Rápidas</h2>
        </div>
        <p className="text-xs text-slate-500 mb-3.5">Operações frequentes do consultório</p>

        {/* Grade de Botões de Ação */}
        <div className="flex flex-col gap-2.5">
          {/* 1. Novo Agendamento (Destaque Principal) */}
          <button
            onClick={() => (onOpenAppointmentModal ? onOpenAppointmentModal() : onNavigate?.('agenda'))}
            className="group flex items-center justify-between w-full bg-[#005F73] hover:bg-[#004655] text-white p-3 rounded-xl shadow-xs hover:shadow transition-all text-left cursor-pointer"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block leading-tight">Novo Agendamento</span>
                <span className="text-xs text-cyan-100 font-normal">Marcar consulta no calendário</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* 2. Cadastrar Paciente */}
          <button
            onClick={() => (onOpenPatientModal ? onOpenPatientModal() : onNavigate?.('pacientes'))}
            className="group flex items-center justify-between w-full bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow transition-all text-left cursor-pointer"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#b2ebff]/40 flex items-center justify-center text-[#004655] shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block leading-tight text-slate-800">
                  Cadastrar Paciente
                </span>
                <span className="text-xs text-slate-500 font-normal">Ficha clínica &amp; anamnese</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#005F73]/70 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* 3. Novo Orçamento */}
          <button
            onClick={() => (onOpenBudgetModal ? onOpenBudgetModal() : onNavigate?.('atendimento'))}
            className="group flex items-center justify-between w-full bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow transition-all text-left cursor-pointer"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#b0efda]/60 flex items-center justify-center text-[#00493a] shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block leading-tight text-slate-800">
                  Novo Orçamento
                </span>
                <span className="text-xs text-slate-500 font-normal">Proposta odontológica</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#005F73]/70 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* 4. Financeiro */}
          <button
            onClick={() => onNavigate?.('financeiro')}
            className="group flex items-center justify-between w-full bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow transition-all text-left cursor-pointer"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block leading-tight text-slate-800">
                  Financeiro
                </span>
                <span className="text-xs text-slate-500 font-normal">Fluxo de caixa &amp; receitas</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#005F73]/70 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* 5. Usuários */}
          <button
            onClick={() => onNavigate?.('usuarios')}
            className="group flex items-center justify-between w-full bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow transition-all text-left cursor-pointer"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-[#005F73] shrink-0">
                <UserCog className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block leading-tight text-slate-800">
                  Usuários
                </span>
                <span className="text-xs text-slate-500 font-normal">Equipe &amp; perfis de acesso</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#005F73]/70 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* 6. Relatórios */}
          <button
            onClick={() => onNavigate?.('relatorios')}
            className="group flex items-center justify-between w-full bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow transition-all text-left cursor-pointer"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block leading-tight text-slate-800">
                  Relatórios
                </span>
                <span className="text-xs text-slate-500 font-normal">DRE, auditoria &amp; produção</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#005F73]/70 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      </div>

      {/* Mini Card Informativo / Alerta Clínico */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#005F73] text-white flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#005F73]">Biossegurança</span>
            <span className="text-[10px] text-slate-400 font-medium">16:00</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
            Esterilização Autoclave lote #4 às 16:00. Kits cirúrgicos disponíveis.
          </p>
        </div>
      </div>
    </div>
  );
};
