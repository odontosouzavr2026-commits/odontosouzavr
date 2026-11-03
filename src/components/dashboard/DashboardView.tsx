import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Stethoscope,
  Building2,
  CalendarPlus,
  ArrowRight,
  UserPlus,
  FileSpreadsheet,
  ShieldCheck,
  User,
  Clock,
  DollarSign,
  CheckSquare,
  UserX,
  UserCog,
  Users,
  FileText,
} from 'lucide-react';
import { MetricsGrid } from './MetricsGrid';
import { UpcomingAppointmentsTable } from './UpcomingAppointmentsTable';
import { QuickActionsPanel } from './QuickActionsPanel';
import { AppointmentVolumeChart } from './AppointmentVolumeChart';
import { FinancialGrowthChart } from './FinancialGrowthChart';
import { MobilePatientList } from './MobilePatientList';
import { MobileCharts } from './MobileCharts';
import { AppointmentModal } from '../forms/AppointmentModal';
import { PatientModal } from '../forms/PatientModal';
import { BudgetModal } from '../forms/BudgetModal';
import { AgendaDoDiaModal } from './AgendaDoDiaModal';
import { PatientAppointment, AppointmentStatus } from '../../types/dashboard';
import { agendaService } from '../../services/agendaService';
import { dashboardService, DashboardMetricsData, DashboardChartData } from '../../services/dashboardService';
import { scrollToTop } from '../../utils/scrollUtils';

interface DashboardViewProps {
  forceMobileView?: boolean;
  onNavigate?: (path: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  forceMobileView = false,
  onNavigate,
}) => {
  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAgendaDoDiaOpen, setIsAgendaDoDiaOpen] = useState(false);

  // Real appointments from Supabase
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [chartData, setChartData] = useState<DashboardChartData | undefined>(undefined);

  // Real metrics from Supabase
  const [metrics, setMetrics] = useState<DashboardMetricsData>({
    totalAppointmentsToday: 0,
    waitingCount: 0,
    inChairCount: 0,
    faturamentoDia: 0,
    faturamentoMes: 0,
    faturamentoLabel: 'Faturamento Dia',
    orcamentosTotal: 0,
    orcamentosAprovados: 0,
    orcamentosTaxa: 0,
    novosPacientesTotal: 0,
    novosPacientesMes: 0,
    taxaFaltas: 0,
    totalFaltas: 0,
    ocupacaoTaxa: 0,
    consultoriosAtivos: 3,
    formattedDate: new Date().toLocaleDateString('pt-BR'),
    formattedTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  });

  const loadData = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setMetrics(data.metrics);
      if (data.appointments) {
        setAppointments(data.appointments);
      }
      if (data.charts) {
        setChartData(data.charts);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do dashboard via Supabase:', err);
    }
  };

  useEffect(() => {
    scrollToTop();
    loadData();

    // Auto-exibe o modal com as consultas do dia na abertura do sistema (1x por sessão)
    try {
      const modalVisto = sessionStorage.getItem('odonto_agenda_dia_modal_visto');
      if (!modalVisto) {
        const timerOpen = setTimeout(() => {
          setIsAgendaDoDiaOpen(true);
        }, 500);
        return () => clearTimeout(timerOpen);
      }
    } catch {}

    // Timer para atualizar relógio e manter sincronizado
    const timer = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    try {
      const dbStatus =
        newStatus === 'Finalizado'
          ? 'concluido'
          : newStatus === 'Cancelado'
          ? 'cancelado'
          : newStatus === 'Em Atendimento'
          ? 'em_atendimento'
          : 'confirmado';
      await agendaService.updateStatus(id, dbStatus);
      await loadData();
    } catch (e) {
      console.warn('Erro ao persistir status:', e);
    }
  };

  const handleAddNewAppointment = async (newApp: Omit<PatientAppointment, 'id'>) => {
    const created: PatientAppointment = {
      ...newApp,
      id: Math.random().toString(),
    };
    setAppointments((prev) => [created, ...prev]);
    await loadData();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* ============================================================== */}
      {/* 1. HEADER / VISÃO GERAL DA CLÍNICA                            */}
      {/* ============================================================== */}

      {/* Mobile Header Card (Visible on mobile screens or forced mobile) */}
      <section className={`${forceMobileView ? 'flex' : 'flex md:hidden'} bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex-col gap-2`}>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-slate-900">
            Visão Geral Clínica
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#86f0f3]/50 flex items-center justify-center text-[#006e70] shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 leading-none">
                {metrics.ocupacaoTaxa}% de ocupação
              </span>
              <span className="text-[11px] text-slate-500 leading-tight mt-0.5">
                {metrics.consultoriosAtivos} consultórios ativos
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block leading-none">{metrics.formattedDate}</span>
            <span className="text-[11px] text-[#00696c] font-semibold leading-tight mt-0.5 block">
              {metrics.formattedTime} BRT
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAgendaDoDiaOpen(true)}
          className="w-full mt-1.5 py-2 px-3 rounded-xl bg-[#005F73]/10 hover:bg-[#005F73]/15 text-[#005F73] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#005F73]" />
          <span>Ver Consultas de Hoje ({appointments.length})</span>
        </button>
      </section>

      {/* Desktop Header Banner (Visible on md+ unless forced mobile) */}
      <section className={`${forceMobileView ? 'hidden' : 'hidden md:flex'} items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-xs border border-slate-100`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#b2ebff] flex items-center justify-center text-[#004655] shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Visão Geral Clínica
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Sincronização em tempo real das agendas dos consultórios 1, 2 e centro cirúrgico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAgendaDoDiaOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004756] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Abrir o resumo das consultas agendadas para hoje"
          >
            <Calendar className="w-4 h-4 text-cyan-200" />
            <span>Consultas do Dia ({appointments.length})</span>
          </button>

          <div className="flex flex-col text-right pl-2 border-l border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Disponibilidade Hoje
            </span>
            <span className="text-sm font-bold text-[#005F73]">
              {metrics.ocupacaoTaxa}% de ocupação
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. GRID DE MÉTRICAS CHAVE REAIS DO SUPABASE                    */}
      {/* ============================================================== */}

      {/* Mobile 2x3 Grid */}
      <section className={`${forceMobileView ? 'grid' : 'grid md:hidden'} grid-cols-2 gap-2.5`}>
        {/* Métrica 1: Consultas Hoje */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Consultas Hoje</span>
            <div className="w-7 h-7 rounded-lg bg-[#b2ebff] flex items-center justify-center text-[#004655]">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 leading-none block">
              {metrics.totalAppointmentsToday}
            </span>
            <span className="text-[10px] text-[#00696c] font-medium block mt-0.5">
              Agendados hoje
            </span>
          </div>
        </div>

        {/* Métrica 2: Aguardando */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Aguardando</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-[#00696c]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 leading-none block">
              {metrics.waitingCount}
            </span>
            <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
              Na recepção / Cadeira
            </span>
          </div>
        </div>

        {/* Métrica 3: Faturamento */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{metrics.faturamentoLabel}</span>
            <div className="w-7 h-7 rounded-lg bg-[#b0efda] flex items-center justify-center text-[#00493a]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 leading-none block truncate" title={formatCurrency(metrics.faturamentoDia)}>
              {formatCurrency(metrics.faturamentoDia)}
            </span>
            <span className="text-[10px] text-[#00493a] font-medium block mt-0.5">
              Receitas confirmadas
            </span>
          </div>
        </div>

        {/* Métrica 4: Orçamentos */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Orçamentos</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#005F73]">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 leading-none block">
              {metrics.orcamentosTaxa}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {metrics.orcamentosAprovados} de {metrics.orcamentosTotal} propostas
            </span>
          </div>
        </div>

        {/* Métrica 5: Novos Pacientes */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Pacientes</span>
            <div className="w-7 h-7 rounded-lg bg-[#89f3f6]/50 flex items-center justify-center text-[#00696c]">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 leading-none block">
              {metrics.novosPacientesTotal}
            </span>
            <span className="text-[10px] text-[#00696c] font-medium block mt-0.5">
              +{metrics.novosPacientesMes} este mês
            </span>
          </div>
        </div>

        {/* Métrica 6: Taxa de Faltas */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Taxa de Faltas</span>
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 leading-none block">
              {metrics.taxaFaltas}%
            </span>
            <span className="text-[10px] text-red-600 font-medium block mt-0.5">
              {metrics.totalFaltas === 0
                ? 'Zero ausências hoje'
                : `${metrics.totalFaltas} ausência(s)`}
            </span>
          </div>
        </div>
      </section>

      {/* Desktop 6-Column Grid */}
      <div className={forceMobileView ? 'hidden' : 'hidden md:block'}>
        <MetricsGrid
          waitingCount={metrics.waitingCount}
          totalAppointmentsToday={metrics.totalAppointmentsToday}
          faturamentoDia={metrics.faturamentoDia}
          faturamentoLabel={metrics.faturamentoLabel}
          orcamentosTaxa={metrics.orcamentosTaxa}
          orcamentosTotal={metrics.orcamentosTotal}
          orcamentosAprovados={metrics.orcamentosAprovados}
          novosPacientesTotal={metrics.novosPacientesTotal}
          novosPacientesMes={metrics.novosPacientesMes}
          taxaFaltas={metrics.taxaFaltas}
          totalFaltas={metrics.totalFaltas}
        />
      </div>

      {/* ============================================================== */}
      {/* 3. AÇÕES RÁPIDAS (TOUCH-FIRST)                                 */}
      {/* ============================================================== */}

      {/* Mobile Touch Actions (Visible on mobile or forced mobile) */}
      <section className={`${forceMobileView ? 'flex' : 'flex md:hidden'} flex-col space-y-2.5`}>
        {/* Botão Principal Destacado: Novo Agendamento */}
        <button
          onClick={() => (onNavigate ? onNavigate('agenda') : setIsAppointmentModalOpen(true))}
          className="w-full h-12 bg-[#005f73] active:bg-[#004655] text-white rounded-xl px-4 flex items-center justify-between shadow-xs active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Novo Agendamento
            </span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Grade de Ações Rápidas Mobile */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => (onNavigate ? onNavigate('pacientes') : setIsPatientModalOpen(true))}
            className="h-11 bg-white text-[#005f73] rounded-xl px-3 flex items-center justify-center gap-2 shadow-xs border border-slate-200/80 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#0A9396] shrink-0" />
            <span className="text-xs font-semibold truncate">Cadastrar Paciente</span>
          </button>
          <button
            onClick={() => (onNavigate ? onNavigate('atendimento') : setIsBudgetModalOpen(true))}
            className="h-11 bg-white text-[#005f73] rounded-xl px-3 flex items-center justify-center gap-2 shadow-xs border border-slate-200/80 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0A9396] shrink-0" />
            <span className="text-xs font-semibold truncate">Novo Orçamento</span>
          </button>
          <button
            onClick={() => (onNavigate ? onNavigate('financeiro') : undefined)}
            className="h-11 bg-white text-[#005f73] rounded-xl px-3 flex items-center justify-center gap-2 shadow-xs border border-slate-200/80 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold truncate">Financeiro</span>
          </button>
          <button
            onClick={() => (onNavigate ? onNavigate('usuarios') : undefined)}
            className="h-11 bg-white text-[#005f73] rounded-xl px-3 flex items-center justify-center gap-2 shadow-xs border border-slate-200/80 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <UserCog className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="text-xs font-semibold truncate">Usuários</span>
          </button>
        </div>

        {/* Botão Relatórios Mobile */}
        <button
          onClick={() => (onNavigate ? onNavigate('relatorios') : undefined)}
          className="w-full h-10 bg-white text-slate-700 rounded-xl px-3 flex items-center justify-center gap-2 shadow-xs border border-slate-200/80 active:bg-slate-50 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold">Relatórios &amp; DRE</span>
        </button>

        {/* Card Compacto de Biossegurança */}
        <div className="bg-slate-100/90 rounded-xl p-3 flex items-center justify-between border border-slate-200/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#86f0f3]/60 text-[#00696c] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 truncate">
                Biossegurança • Autoclave #4
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                Ciclo às 16:00 • Kits cirúrgicos prontos
              </span>
            </div>
          </div>
          <span className="inline-flex px-2 py-0.5 rounded-full bg-[#b0efda] text-[#00493a] text-[10px] font-bold shrink-0">
            OK
          </span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. PRÓXIMOS PACIENTES DO DIA COM DADOS REAIS DO SUPABASE      */}
      {/* ============================================================== */}

      {/* Mobile Card-based Patient List */}
      <div className={forceMobileView ? 'block' : 'block md:hidden'}>
        <MobilePatientList
          appointments={appointments}
          onViewAll={() => onNavigate && onNavigate('agenda')}
        />
      </div>

      {/* Desktop Layout: Table + Quick Actions Sidebar */}
      <div className={`${forceMobileView ? 'hidden' : 'hidden md:grid'} grid-cols-1 lg:grid-cols-3 gap-6 mb-6`}>
        <UpcomingAppointmentsTable
          appointments={appointments}
        />
        <QuickActionsPanel
          onNavigate={onNavigate}
          onOpenAppointmentModal={() => (onNavigate ? onNavigate('agenda') : setIsAppointmentModalOpen(true))}
          onOpenPatientModal={() => (onNavigate ? onNavigate('pacientes') : setIsPatientModalOpen(true))}
          onOpenBudgetModal={() => (onNavigate ? onNavigate('atendimento') : setIsBudgetModalOpen(true))}
        />
      </div>

      {/* ============================================================== */}
      {/* 5. GRÁFICOS OPERACIONAIS & FINANCEIROS                          */}
      {/* ============================================================== */}

      {/* Mobile Touch SVG Charts */}
      <div className={forceMobileView ? 'block' : 'block md:hidden'}>
        <MobileCharts data={chartData} />
      </div>

      {/* Desktop Rich SVG Charts */}
      <div className={`${forceMobileView ? 'hidden' : 'hidden md:grid'} grid-cols-1 lg:grid-cols-2 gap-6`}>
        <AppointmentVolumeChart data={chartData?.volume} />
        <FinancialGrowthChart data={chartData?.financial} />
      </div>

      {/* Modais de Cadastro e Orçamento */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleAddNewAppointment}
      />

      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      {/* Modal Matinal / Agenda do Dia na Abertura do Sistema */}
      <AgendaDoDiaModal
        isOpen={isAgendaDoDiaOpen}
        onClose={() => setIsAgendaDoDiaOpen(false)}
        appointments={appointments}
        onNavigateToAgenda={() => {
          if (onNavigate) onNavigate('agenda');
        }}
        onNavigateToAtendimento={() => {
          if (onNavigate) onNavigate('atendimento');
        }}
      />
    </div>
  );
};
