import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  ArrowRight,
  Lock,
  LayoutGrid,
  Eye,
  Pencil,
  Trash2,
  Download,
  Bell,
  ChevronDown,
  LogOut,
  MapPin,
  ExternalLink,
  MessageCircle,
  FileCheck,
  CreditCard,
  History,
  Shield,
  HelpCircle,
  ArrowLeft,
  Filter,
  Check,
  X,
  Menu,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { scrollToTop } from '../../utils/scrollUtils';
import { MeusTratamentosView } from './MeusTratamentosView';
import { AgendarConsultaView } from './AgendarConsultaView';
import { MeusDadosView } from './MeusDadosView';
import { SegurancaView } from './SegurancaView';
import { agendaService } from '../../services/agendaService';
import { PacienteItem } from '../../types/pacientes';
import {
  pacientePortalService,
  PacientePortalData,
  ProcedimentoHistoricoItem,
  ResumoFinanceiroPortal,
  PlanoTratamentoPortal,
} from '../../services/pacientePortalService';
import { emitirNotificacaoClinica } from '../../contexts/NotificationContext';

interface MinhaContaViewProps {
  onLogout?: () => void;
  onNavigateToAdmin?: () => void;
  currentUser?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  } | null;
}

interface DayOption {
  dayName: string;
  dayNumber: string;
  month: string;
  dateKey: string;
  vacancies: string;
  isFull: boolean;
  isToday?: boolean;
  availableTimes: string[];
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

// Sequência completa contínua sem cortes: 45 min de atendimento + 5 min de intervalo até meia-noite
const CONTINUOUS_SCHEDULE_TIMES = [
  '08:10', '09:00', '09:50', '10:40', '11:30', '12:20', '13:10',
  '14:00', '14:50', '15:40', '16:30', '17:20', '18:10',
  '19:00', '19:50', '20:40', '21:30', '22:20', '23:10',
];

export const generateDaysSchedule = (baseDate = new Date()): DayOption[] => {
  const days: DayOption[] = [];
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  for (let i = 0; i < 6; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);

    const dayOfWeek = d.getDay();
    const isToday = i === 0;
    const dayNumber = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()];
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${dayNumber}`;
    const dayName = isToday ? 'Hoje' : WEEKDAY_NAMES[dayOfWeek];

    // Sequência completa contínua sem cortes
    let availableTimes: string[] = [...CONTINUOUS_SCHEDULE_TIMES];

    // Regra Estrita: Bloqueio retroativo. Se for hoje, remove horários que já passaram da hora atual do computador
    if (isToday) {
      availableTimes = availableTimes.filter((timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h > currentHours || (h === currentHours && m > currentMinutes);
      });
    }

    const freeSlots = availableTimes.filter((t) => t !== '08:10');
    const isFull = freeSlots.length === 0;
    const vacancies = isFull
      ? 'Lotado'
      : freeSlots.length === 1
      ? '1 vaga'
      : `${freeSlots.length} vagas`;

    days.push({
      dayName,
      dayNumber,
      month,
      dateKey,
      vacancies,
      isFull,
      isToday,
      availableTimes,
    });
  }

  return days;
};

const DAYS_SCHEDULE: DayOption[] = generateDaysSchedule();

interface AppointmentDetail {
  dateLabel: string;
  dateKey?: string;
  duration: string;
  procedure: string;
  dentist: string;
  room: string;
  status: string;
}

export const MinhaContaView: React.FC<MinhaContaViewProps> = ({
  onLogout,
  onNavigateToAdmin,
  currentUser,
}) => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'inicio' | 'tratamentos' | 'agendar' | 'dados' | 'seguranca'>('inicio');
  const [daysSchedule, setDaysSchedule] = useState<DayOption[]>(() => generateDaysSchedule());
  const [selectedDay, setSelectedDay] = useState<DayOption>(() => {
    const initialDays = generateDaysSchedule();
    return initialDays[0]; // Sempre inicia no dia atual (Hoje)!
  });
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const initialDays = generateDaysSchedule();
    return initialDays[0]?.availableTimes.find((t) => t !== '08:10') || '09:00';
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Estados com dados reais do Supabase
  const [patientData, setPatientData] = useState<PacientePortalData | null>(null);
  const [availablePatients, setAvailablePatients] = useState<PacienteItem[]>([]);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);

  // Dados clínicos e financeiros reais do Supabase
  const [proceduresHistory, setProceduresHistory] = useState<ProcedimentoHistoricoItem[]>([]);
  const [financialSummary, setFinancialSummary] = useState<ResumoFinanceiroPortal | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<PlanoTratamentoPortal | null>(null);

  // Estado da Consulta Principal (null se não houver agendamento futuro ativo)
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentDetail | null>(null);

  // Carrega dados reais do paciente do Supabase
  useEffect(() => {
    let isMounted = true;
    async function carregarDadosReais() {
      setIsLoadingPatient(true);
      try {
        const [pac, lista] = await Promise.all([
          pacientePortalService.getPacienteData(currentUser?.id, currentUser?.email),
          pacientePortalService.getPacientesDisponiveis(),
        ]);

        if (!isMounted) return;
        setPatientData(pac);
        setAvailablePatients(lista);

        if (pac?.id) {
          const [proxima, hist, fin, plano] = await Promise.all([
            pacientePortalService.getProximaConsulta(pac.id),
            pacientePortalService.getHistoricoProcedimentos(pac.id),
            pacientePortalService.getResumoFinanceiro(pac.id),
            pacientePortalService.getPlanoTratamentoCompleto(pac.id),
          ]);

          if (isMounted) {
            setProceduresHistory(hist);
            setFinancialSummary(fin);
            setTreatmentPlan(plano);

            if (proxima) {
              setCurrentAppointment({
                dateLabel: `${proxima.date} às ${proxima.time}`,
                dateKey: proxima.dateKey,
                duration: '45 min',
                procedure: proxima.procedure,
                dentist: proxima.dentist,
                room: 'Cadeira 01 / Consultório Principal',
                status: proxima.status,
              });
            } else {
              setCurrentAppointment(null);
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do paciente:', err);
      } finally {
        if (isMounted) setIsLoadingPatient(false);
      }
    }
    carregarDadosReais();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleSelectPatient = async (pItem: PacienteItem) => {
    setIsLoadingPatient(true);
    setIsUserMenuOpen(false);
    try {
      const pac = await pacientePortalService.getPacienteData(pItem.id);
      setPatientData(pac);

      const [proxima, hist, fin, plano] = await Promise.all([
        pacientePortalService.getProximaConsulta(pac.id),
        pacientePortalService.getHistoricoProcedimentos(pac.id),
        pacientePortalService.getResumoFinanceiro(pac.id),
        pacientePortalService.getPlanoTratamentoCompleto(pac.id),
      ]);

      setProceduresHistory(hist);
      setFinancialSummary(fin);
      setTreatmentPlan(plano);

      if (proxima) {
        setCurrentAppointment({
          dateLabel: `${proxima.date} às ${proxima.time}`,
          dateKey: proxima.dateKey,
          duration: '45 min',
          procedure: proxima.procedure,
          dentist: proxima.dentist,
          room: 'Cadeira 01 / Consultório Principal',
          status: proxima.status,
        });
      } else {
        setCurrentAppointment(null);
      }
      toast.success('Perfil Selecionado', `Exibindo prontuário de ${pac.fullName}`);
    } catch (e) {
      toast.error('Erro', 'Não foi possível carregar os dados do paciente.');
    } finally {
      setIsLoadingPatient(false);
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('odonto_user');
      sessionStorage.removeItem('odonto_user');
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/');
        window.location.href = '/';
      }
    }
  };

  const handleConfirmSchedule = async () => {
    if (selectedDay.isFull) {
      toast.warning('Dia Lotado', 'Por favor, selecione um dia com vagas disponíveis.');
      return;
    }

    // Regra Estrita: Não permitir agendamento retroativo
    if (selectedDay.isToday) {
      const now = new Date();
      const [h, m] = selectedTime.split(':').map(Number);
      if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) {
        toast.warning(
          'Horário Passado Indisponível',
          'Não é possível realizar agendamento retroativo para horários que já passaram da hora atual do computador.'
        );
        return;
      }
    }

    if (selectedTime === '08:10' || (selectedTime >= '08:00' && selectedTime < '09:00')) {
      toast.info(
        'Horário Exclusivo do Dr. Frankisney',
        'Os horários das 08:00 às 09:00 são reservados exclusivamente para o Dr. Frankisney Souza (Administração). Por favor, escolha um dos horários disponíveis a partir das 09:00.'
      );
      return;
    }

    // Regra de Negócio: Um paciente não pode marcar dois horários no mesmo dia.
    // Pode agendar em dias diferentes (ex: dia 1 e dia 3), mas nunca dois no mesmo dia,
    // a não ser que a consulta anterior na mesma data já esteja concluída.
    if (patientData?.id) {
      const conflito = await agendaService.verificarConflitoDuploAgendamento(
        patientData.id,
        selectedDay.dateKey
      );
      if (!conflito.permitido) {
        toast.warning(
          'Limite de 1 Agendamento por Dia',
          conflito.motivo || 'Você já possui uma consulta marcada para este dia. Não é permitido agendar dois horários na mesma data, a menos que a consulta anterior já esteja com o status "Concluído".'
        );
        return;
      }
    }

    if (currentAppointment && currentAppointment.dateKey === selectedDay.dateKey) {
      const isConcluido = currentAppointment.status.toLowerCase().includes('conclu');
      const isDesmarcado =
        currentAppointment.status.toLowerCase().includes('cancel') ||
        currentAppointment.status.toLowerCase().includes('desmarc');
      if (!isConcluido && !isDesmarcado) {
        toast.warning(
          'Limite de 1 Agendamento por Dia',
          'Regra Clínica: Você já possui uma consulta marcada para este dia. Não é permitido agendar dois horários na mesma data, a menos que a consulta anterior já esteja com o status "Concluído".'
        );
        return;
      }
    }

    const newLabel = `${selectedDay.dayName}, ${selectedDay.dayNumber} de ${selectedDay.month} às ${selectedTime}`;
    setCurrentAppointment({
      dateLabel: newLabel,
      dateKey: selectedDay.dateKey,
      duration: '45 min',
      procedure: 'Consulta e Avaliação Odontológica',
      dentist: 'Dr. Frankisney Souza (CRO-SP 78.432)',
      room: 'Cadeira 01 / Consultório Principal',
      status: 'Consulta Agendada • Confirmada',
    });

    // Atualiza imediatamente as vagas disponíveis do dia selecionado
    const updatedTimes = selectedDay.availableTimes.filter((t) => t !== selectedTime);
    const isFull = updatedTimes.length === 0;
    const vacancies = isFull
      ? 'Lotado'
      : updatedTimes.length === 1
      ? '1 vaga'
      : `${updatedTimes.length} vagas`;

    const updatedDay: DayOption = {
      ...selectedDay,
      availableTimes: updatedTimes,
      isFull,
      vacancies,
    };

    setSelectedDay(updatedDay);
    setDaysSchedule((prev) =>
      prev.map((d) => (d.dateKey === selectedDay.dateKey ? updatedDay : d))
    );
    if (updatedTimes.length > 0) {
      setSelectedTime(updatedTimes[0]);
    }

    // Persiste no Supabase se houver dados do paciente
    if (patientData?.id) {
      try {
        await pacientePortalService.criarAgendamentoReal({
          pacienteId: patientData.id,
          patientName: patientData.fullName,
          phone: patientData.phone,
          date: `${selectedDay.dayNumber} de ${selectedDay.month} de 2026`,
          time: selectedTime,
          type: 'Consulta e Avaliação Odontológica',
          notes: 'Agendamento rápido via Portal do Paciente.',
        });
      } catch (e) {
        console.warn('Erro ao salvar agendamento rápido no Supabase:', e);
      }
    }

    const pName = patientData?.fullName || 'Everaldo Souza da Silva';
    const pPhone = patientData?.phone || '(65) 99605-5823';
    const pEmail = patientData?.email || 'everaldoszpaciente@gmail.com';
    const pDataConsulta = `${selectedDay.dayName}, ${selectedDay.dayNumber} de ${selectedDay.month}`;

    emitirNotificacaoClinica({
      tipo: 'novo_agendamento',
      titulo: 'Novo Agendamento Confirmado',
      mensagem: `${pName} agendou Consulta e Avaliação Odontológica para ${pDataConsulta} às ${selectedTime}.`,
      detalhes: {
        pacienteNome: pName,
        pacienteTelefone: pPhone,
        pacienteEmail: pEmail,
        dataConsulta: `${pDataConsulta} às ${selectedTime}`,
        horarioConsulta: selectedTime,
        procedimento: 'Consulta e Avaliação Odontológica',
        dentista: 'Dr. Frankisney Souza',
        origem: 'portal_paciente',
        observacoes: 'Agendamento rápido via Portal do Paciente.',
      },
      linkRota: 'agenda',
    });

    toast.success(
      'Agendamento Confirmado! 🎉',
      `Sua consulta foi marcada para ${selectedDay.dayName}, ${selectedDay.dayNumber}/${selectedDay.month} às ${selectedTime} com o Dr. Frankisney Souza.`
    );

    scrollToTop();
  };

  const handleExportPDF = () => {
    toast.info('Exportando Prontuário', 'Gerando o laudo odontológico oficial em formato PDF...');
    setTimeout(() => {
      const patientName = patientData?.fullName || 'Paciente Odonto Souza';
      const patientPront = patientData?.code || 'OS-2026';
      const element = document.createElement('a');
      const proceduresList =
        proceduresHistory.length > 0
          ? proceduresHistory
              .map(
                (p, idx) =>
                  `${idx + 1}. ${p.date} - ${p.region}: ${p.procedure} (${p.status})`
              )
              .join('\n')
          : 'Nenhum procedimento anterior registrado no prontuário.';

      const file = new Blob(
        [
          `ODONTO SOUZA - LAUDO CLÍNICO DO PACIENTE\n\nPaciente: ${patientName}\nProntuário: #${patientPront}\nResponsável Técnico: Dr. Frankisney Souza (CRO-SP 78.432)\nData de Emissão: ${new Date().toLocaleDateString('pt-BR')}\n\nHISTÓRICO CLÍNICO:\n${proceduresList}\n\nClínica Souza Odontologia - Atendimento de Excelência`,
        ],
        { type: 'text/plain' }
      );
      element.href = URL.createObjectURL(file);
      element.download = `Laudo_Clinico_${patientName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Laudo Exportado', 'O arquivo foi baixado com sucesso no seu dispositivo!');
    }, 1000);
  };

  const handleDownloadReceipt = () => {
    toast.success('Recibo Baixado', 'Último recibo #892-C baixado com sucesso!');
  };

  // Formatações padronizadas de identificação do paciente
  const patientFullName = patientData?.fullName || currentUser?.name || 'Paciente';
  const firstName = patientFullName.trim().split(' ')[0] || 'Paciente';
  const rawCode = patientData?.code || patientData?.prontuario || 'OS-001';
  const prontuarioDisplay = rawCode.startsWith('#') ? rawCode : `#${rawCode}`;

  return (
    <div className="flex min-h-screen w-full bg-[#f8f9ff] font-sans text-[#0b1c30] selection:bg-[#86f0f3] selection:text-[#002021]">
      {/* ============================================================== */}
      {/* MOBILE DRAWER DO PACIENTE (SIDEBAR RESPONSIVA NO MOBILE)       */}
      {/* ============================================================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex pointer-events-auto animate-in fade-in duration-200 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Aside */}
          <aside
            className="relative w-[82%] max-w-[320px] h-full bg-[#005f73] text-white flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300"
            role="dialog"
            aria-label="Menu de Navegação do Paciente"
          >
            <div className="flex flex-col flex-1 overflow-y-auto">
              {/* Header do Drawer */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[#89f3f6] shrink-0">
                    <Stethoscope className="w-5 h-5 text-[#8bd1e8]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base leading-tight tracking-tight text-white">
                      Odonto Souza
                    </span>
                    <span className="text-[10px] font-bold text-[#b2ebff] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full w-max mt-1">
                      Área do Paciente
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-9 h-9 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Box de Informações do Paciente Logado */}
              <div className="p-3.5 mx-4 my-3 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 shrink-0 ring-2 ring-white/30">
                  <img
                    src={patientData?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"}
                    alt={patientData?.fullName || "Foto do Paciente"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">
                    {patientFullName}
                  </p>
                  <p className="text-[11px] text-[#b2ebff] font-medium truncate">
                    Prontuário: {prontuarioDisplay}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav aria-label="Navegação Lateral Mobile" className="space-y-1.5 p-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inicio');
                    setIsMobileDrawerOpen(false);
                    scrollToTop();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'inicio'
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5 text-current" />
                  <span>Início (Dashboard)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('tratamentos');
                    setIsMobileDrawerOpen(false);
                    scrollToTop();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'tratamentos'
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5 text-current" />
                  <span>Meus Tratamentos</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('agendar');
                    setIsMobileDrawerOpen(false);
                    scrollToTop();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'agendar'
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Calendar className="w-5 h-5 text-current" />
                  <span>Agendar Consulta</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('dados');
                    setIsMobileDrawerOpen(false);
                    scrollToTop();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'dados'
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <User className="w-5 h-5 text-current" />
                  <span>Meus Dados</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('seguranca');
                    setIsMobileDrawerOpen(false);
                    scrollToTop();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'seguranca'
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Lock className="w-5 h-5 text-current" />
                  <span>Segurança</span>
                </button>
              </nav>
            </div>

            {/* Rodapé do Drawer com Botão Sair */}
            <div className="p-4 sm:p-5 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  handleLogoutClick();
                }}
                className="w-full flex items-center justify-center space-x-2.5 bg-rose-500/20 hover:bg-rose-600 text-rose-100 hover:text-white border border-rose-400/30 hover:border-rose-600 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-xs active:scale-98 cursor-pointer group"
                title="Sair e voltar para a tela de login"
              >
                <LogOut className="w-4 h-4 text-rose-300 group-hover:text-white transition-colors" />
                <span>Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}
      {/* ============================================================== */}
      {/* 1. BARRA LATERAL FIXA DESKTOP (SIDEBAR DO PACIENTE)            */}
      {/* ============================================================== */}
      <aside className="w-72 bg-[#005f73] text-white hidden lg:flex flex-col justify-between shrink-0 shadow-2xl relative z-20">
        <div className="p-6">
          {/* Logo Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-[#b2ebff] shadow-xs">
              <Stethoscope className="w-6 h-6 text-[#8bd1e8]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl tracking-tight text-white font-extrabold leading-none">
                Odonto Souza
              </span>
              <span className="text-[10px] font-bold text-[#b2ebff] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full w-max mt-1">
                Área do Paciente
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Navegação do Paciente" className="space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('inicio')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'inicio'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-5 h-5 text-current" />
              <span>Início (Dashboard)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tratamentos')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'tratamentos'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5 text-current" />
              <span>Meus Tratamentos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('agendar');
                scrollToTop();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'agendar'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5 text-current" />
              <span>Agendar Consulta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('dados');
                scrollToTop();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'dados'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-5 h-5 text-current" />
              <span>Meus Dados</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('seguranca')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'seguranca'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-[#b2ebff] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Lock className="w-5 h-5 text-current" />
              <span>Segurança</span>
            </button>
          </nav>
        </div>

        {/* Rodapé Sidebar: Botão Sair */}
        <div className="p-6 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center space-x-2.5 bg-rose-500/15 hover:bg-rose-600 text-rose-100 hover:text-white border border-rose-400/30 hover:border-rose-600 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-xs active:scale-98 cursor-pointer group"
            title="Sair e voltar para a tela de login"
          >
            <LogOut className="w-4 h-4 text-rose-300 group-hover:text-white transition-colors" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL (DESKTOP & MOBILE RESPONSIVO)   */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* CABEÇALHO SUPERIOR (HEADER) */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
          {/* Esquerda: Identidade Mobile ou Saudação Desktop */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Botão Hambúrguer Mobile (Padrão do Sistema) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:text-[#005f73] active:bg-slate-100 transition-colors cursor-pointer flex lg:hidden -ml-1"
              aria-label="Abrir menu lateral"
              title="Abrir menu lateral"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-[#005f73] flex lg:hidden items-center justify-center text-white shrink-0 shadow-xs">
              <Stethoscope className="w-5 h-5 text-[#8bd1e8]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base sm:text-xl font-extrabold text-[#0b1c30] tracking-tight">
                  Olá, {firstName}
                </h1>
                <span className="text-base sm:text-xl">👋</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tracking-wider">
                  {patientData?.insuranceName?.toUpperCase() || 'PARTICULAR'}
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 mt-0.5 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <span>Prontuário:</span>
                  <strong className="text-slate-800 font-bold">
                    {prontuarioDisplay}
                  </strong>
                </span>
                <span className="hidden sm:inline-block text-slate-300">•</span>
                <span className="hidden sm:flex items-center space-x-1 text-[#00696c] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0A9396]" />
                  <span>Dr. Frankisney Souza</span>
                </span>
              </div>
            </div>
          </div>

          {/* Direita: Notificações & Dropdown Usuário */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notificações */}
            <button
              type="button"
              onClick={() => toast.info('Notificações', 'Você não possui notificações pendentes.')}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Notificações do Paciente"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            <div className="h-7 w-px bg-slate-200 hidden sm:block" />

            {/* Avatar & Perfil Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 sm:space-x-3 p-1 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-xs ring-2 ring-[#0A9396]/30 shrink-0">
                  <img
                    src={patientData?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"}
                    alt={patientData?.fullName || "Foto do Paciente"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left hidden md:block">
                  <span className="block text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {patientData?.fullName || currentUser?.name || 'Paciente'}
                  </span>
                  <span className="block text-[11px] text-slate-500 leading-tight">
                    {patientData?.email || currentUser?.email || ''}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Menu Suspenso */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] text-slate-400 font-semibold">Conectado(a) como</p>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {patientData?.fullName || currentUser?.name || 'Paciente'}
                    </p>
                    <p className="text-[11px] text-[#005f73] font-medium">
                      {patientData?.insuranceName || 'Particular'} • {prontuarioDisplay}
                    </p>
                  </div>

                  {/* Seletor de Paciente (quando houver múltiplos pacientes na base) */}
                  {availablePatients.length > 1 && (
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                        Alternar Paciente Cadastrado:
                      </p>
                      <div className="max-h-36 overflow-y-auto space-y-1">
                        {availablePatients.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPatient(p)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              patientData?.id === p.id
                                ? 'bg-teal-50 font-bold text-[#005f73]'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            {patientData?.id === p.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0A9396] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('dados');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Meu Perfil & Convênio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      toast.info('Ajuda', 'Central de Atendimento Odonto Souza disponível pelo WhatsApp.');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Ajuda & FAQ</span>
                  </button>

                  {onNavigateToAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigateToAdmin();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-[#005f73] hover:bg-teal-50 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#005f73]" />
                      <span>Ir para Gestão Clínica</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogoutClick();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sair da Minha Conta</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* 3. CONTEÚDO PRINCIPAL DA DASHBOARD (CONTAINER CENTRAL)         */}
        {/* ============================================================== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto w-full">
          {activeTab === 'tratamentos' && (
            <MeusTratamentosView
              patientData={patientData || undefined}
              onNavigateToSchedule={() => {
                setActiveTab('agendar');
                scrollToTop();
              }}
              onNavigateToInicio={() => {
                setActiveTab('inicio');
                scrollToTop();
              }}
            />
          )}

          {activeTab === 'agendar' && (
            <AgendarConsultaView
              patientData={patientData || undefined}
              onScheduleSuccess={(time, date, type) => {
                const dayNum = date.split(' ')[0];
                const dateKey = `2026-11-${String(dayNum).padStart(2, '0')}`;
                setCurrentAppointment({
                  dateLabel: `${date} às ${time}`,
                  dateKey,
                  duration: '45 min',
                  procedure: type,
                  dentist: 'Dr. Frankisney Souza (CRO-SP 78.432)',
                  room: 'Cadeira 01 / Consultório Principal',
                  status: 'Consulta Pré-Agendada',
                });
              }}
              onNavigateToTratamentos={() => {
                setActiveTab('tratamentos');
                scrollToTop();
              }}
            />
          )}

          {activeTab === 'dados' && (
            <MeusDadosView
              patientData={patientData || undefined}
              onSaved={(updated) => {
                setPatientData(updated);
              }}
            />
          )}

          {activeTab === 'seguranca' && (
            <SegurancaView
              patientData={patientData || undefined}
              onEmailUpdated={(newEmail) => {
                setPatientData((prev) => (prev ? { ...prev, email: newEmail } : null));
              }}
            />
          )}

          {activeTab !== 'tratamentos' && activeTab !== 'agendar' && activeTab !== 'dados' && activeTab !== 'seguranca' && (
            <>
              {/* ============================================================ */}
              {/* SESSÃO A: CONSULTA AGENDADA EM DESTAQUE                      */}
              {/* ============================================================ */}
              {currentAppointment ? (
                <section
                  aria-label="Consulta Agendada em Destaque"
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-l-4 border-[#005f73] border-t border-r border-b border-slate-200/80 relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#005f73] text-xs font-bold border border-teal-100">
                          <span className="w-2 h-2 rounded-full bg-[#0A9396] animate-pulse" />
                          <span>{currentAppointment.status}</span>
                        </span>

                        <span className="inline-flex items-center space-x-1 text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#0A9396]" />
                          <span>Presencial • Unidade Central Odonto Souza</span>
                        </span>
                      </div>

                      <div>
                        <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                          {currentAppointment.dateLabel}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="w-4 h-4 text-[#0A9396] shrink-0" />
                          <span>
                            <strong className="text-slate-900 font-semibold">Procedimento:</strong>{' '}
                            {currentAppointment.procedure}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-[#0A9396] shrink-0" />
                          <span>
                            <strong className="text-slate-900 font-semibold">Profissional:</strong>{' '}
                            {currentAppointment.dentist} • {currentAppointment.room}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsViewModalOpen(true)}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:opacity-80 text-white text-xs sm:text-sm font-bold shadow-xs transition-opacity cursor-pointer active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('agendar');
                          scrollToTop();
                        }}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:opacity-80 text-white text-xs sm:text-sm font-bold shadow-xs transition-opacity cursor-pointer active:scale-95"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCancelModalOpen(true)}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:opacity-80 text-white text-xs sm:text-sm font-bold shadow-xs transition-opacity cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </section>
              ) : (
                <section
                  aria-label="Agendamento de Consultas"
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#005f73]" />
                          <span>Agenda Odontológica</span>
                        </span>
                      </div>
                      <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        Nenhuma consulta agendada no momento
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                        Mantenha sua saúde bucal em dia realizando consultas preventivas semestrais. Escolha o melhor dia e horário com a nossa equipe.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('agendar');
                        scrollToTop();
                      }}
                      className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-98 shrink-0"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Agendar Consulta</span>
                    </button>
                  </div>
                </section>
              )}

              {/* ============================================================ */}
              {/* SESSÃO B: 4 CARDS KPIS DO PACIENTE (RESUMO GERAL)            */}
              {/* ============================================================ */}
              <section aria-label="Resumo do Paciente" className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Resumo do Paciente
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">4 indicadores ativos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                  {/* Card 1: Próxima Consulta */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A9396]" />
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-[#005f73]">
                          <Calendar className="w-4 h-4 text-[#005f73]" />
                          <span className="text-[11px] uppercase tracking-wider font-bold">
                            {currentAppointment?.dentist?.split(' ')[0] || 'Dr. Frankisney'}
                          </span>
                        </div>
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          currentAppointment ? 'bg-teal-50 text-[#005f73]' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${currentAppointment ? 'bg-[#0A9396]' : 'bg-slate-400'}`} />
                          <span>{currentAppointment ? 'Confirmado' : 'Disponível'}</span>
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {currentAppointment ? currentAppointment.dateLabel.split(' às ')[0] : 'Sem Consulta'}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#0A9396] font-bold mt-0.5">
                        {currentAppointment ? `Às ${currentAppointment.dateLabel.split(' às ')[1] || '10:00'}` : 'Horários abertos'}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {currentAppointment ? currentAppointment.procedure : 'Agende uma avaliação com nossa equipe de especialistas.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between bg-slate-50 -mx-5 -mb-5 px-5 py-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {currentAppointment ? currentAppointment.room : 'Atendimento Humanizado'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('agendar');
                          scrollToTop();
                        }}
                        className="text-xs text-[#005f73] hover:text-[#0A9396] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>{currentAppointment ? 'Reagendar' : 'Agendar'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Tratamentos em Andamento */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-[#005f73]">
                          <Stethoscope className="w-4 h-4 text-[#005f73]" />
                          <span className="text-[11px] uppercase tracking-wider font-bold">
                            Prontuário Odontológico
                          </span>
                        </div>
                        <span className="text-sm font-black text-[#0A9396]">
                          {treatmentPlan?.progressoPercentual ?? 100}%
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {treatmentPlan?.tituloPlano || (patientData?.medicalConditions ? `Atenção: ${patientData.medicalConditions}` : 'Saúde Bucal em Dia')}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {treatmentPlan
                          ? `${treatmentPlan.fasesConcluidas} de ${treatmentPlan.fasesTotal} etapas concluídas • Previsão: ${treatmentPlan.previsaoAlta}`
                          : 'Histórico e prontuário digital sincronizados com o sistema clínico.'}
                      </p>

                      <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
                        <div
                          className="bg-[#0A9396] h-full rounded-full transition-all duration-500"
                          style={{ width: `${treatmentPlan?.progressoPercentual ?? 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Histórico Completo</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('tratamentos');
                          scrollToTop();
                        }}
                        className="text-xs text-[#00696c] hover:text-[#004f51] font-bold inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Ver Plano</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Status Financeiro */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-[#005f73]">
                          <CreditCard className="w-4 h-4 text-[#005f73]" />
                          <span className="text-[11px] uppercase tracking-wider font-bold">
                            Convênio & Pagamentos
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          financialSummary?.temPendencia ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {financialSummary?.temPendencia ? 'Débito Ativo' : (financialSummary?.convenioNome || patientData?.insuranceName || 'Particular')}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {financialSummary?.convenioNome || patientData?.insuranceName || 'Particular'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {financialSummary?.ultimoOrcamento
                          ? `Orçamento ${financialSummary.ultimoOrcamento.numero}: R$ ${financialSummary.ultimoOrcamento.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${financialSummary.ultimoOrcamento.status})`
                          : patientData?.insuranceNumber
                          ? `Carteirinha: ${patientData.insuranceNumber}`
                          : 'Prontuário sem pendências financeiras ou débitos.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between bg-slate-50 -mx-5 -mb-5 px-5 py-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Recibos & Comprovantes</span>
                      <button
                        type="button"
                        onClick={handleDownloadReceipt}
                        className="text-xs text-[#005f73] hover:text-[#0A9396] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar Recibos</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Seu Dentista */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-[#005f73]">
                          <User className="w-4 h-4 text-[#005f73]" />
                          <span className="text-[11px] uppercase tracking-wider font-bold">
                            Dr. Frankisney Souza
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          CRO-SP 78.432
                        </span>
                      </div>

                      <div className="flex items-center space-x-3.5 mt-2">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs shrink-0 ring-1 ring-slate-200">
                          <img
                            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
                            alt="Dr. Frankisney Souza"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            Dr. Frankisney Souza
                          </h4>
                          <p className="text-xs text-[#00696c] font-semibold mt-0.5">
                            Responsável Técnico • Odonto Souza
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Central WhatsApp</span>
                      <a
                        href="https://wa.me/5511999999999"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Falar no WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>

          {/* ============================================================ */}
          {/* SESSÃO C: AGENDAR NOVA CONSULTA (WIDGET COMPLETO)            */}
          {/* ============================================================ */}
          <section id="agendar-secao" className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                    Agendar Nova Consulta
                  </h3>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#005f73] text-xs font-bold border border-teal-100">
                    <span className="w-2 h-2 rounded-full bg-[#0A9396] animate-pulse" />
                    <span>Tempo Real</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Escolha o melhor dia e horário para o seu próximo retorno preventivo ou ajuste.
                </p>
              </div>

              {/* Filtro de Especialidade / Profissional */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Filtrar:</span>
                <div className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-slate-800 border border-slate-200/80">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0A9396]" />
                  <span className="text-xs font-bold">Dr. Frankisney Souza</span>
                </div>
              </div>
            </div>

            {/* Seletor Horizontal de Dias da Semana */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 my-6">
              {daysSchedule.map((day) => {
                const isSelected = selectedDay.dateKey === day.dateKey;
                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => {
                      if (!day.isFull) {
                        setSelectedDay(day);
                        if (day.availableTimes.length > 0 && !day.availableTimes.includes(selectedTime)) {
                          setSelectedTime(day.availableTimes[0]);
                        }
                      } else {
                        toast.warning('Dia Lotado', 'Este dia não possui mais vagas para agendamento.');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all text-center cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#005f73] text-white shadow-md scale-102 ring-2 ring-[#005f73]/30'
                        : day.isFull
                        ? 'bg-slate-50 border border-slate-200/80 opacity-60 cursor-not-allowed'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800'
                    }`}
                  >
                    {day.isToday && (
                      <span className={`absolute -top-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isSelected ? 'bg-amber-400 text-slate-900 shadow-xs' : 'bg-[#0A9396] text-white'
                      }`}>
                        Hoje
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-[#b2ebff]' : 'text-slate-500'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span className="text-2xl font-black my-0.5">{day.dayNumber}</span>
                    <span
                      className={`text-xs ${
                        isSelected ? 'text-[#b2ebff]' : 'text-slate-500'
                      }`}
                    >
                      {day.month}
                    </span>
                    <span
                      className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : day.isFull
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {day.vacancies}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grade de Horários Livres & Painel de Confirmação Rápida */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="w-full lg:w-auto flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-4 h-4 text-[#0A9396]" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Horários disponíveis para {selectedDay.dayName}, {selectedDay.dayNumber} de {selectedDay.month} ({selectedDay.vacancies}):
                  </span>
                </div>

                {selectedDay.availableTimes.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    Não há mais vagas livres para agendamento online neste dia. Por favor, escolha outro dia acima.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {selectedDay.availableTimes.map((time) => {
                      const isDoctorOnly = time === '08:10' || (time >= '08:00' && time < '09:00');
                      const isTimeSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            if (isDoctorOnly) {
                              toast.info(
                                'Horário Exclusivo do Dr. Frankisney',
                                'Os horários das 08:00 às 09:00 são reservados exclusivamente para o Dr. Frankisney Souza (Administração). Por favor, selecione um horário a partir das 09:00 ou contate a recepção.'
                              );
                              return;
                            }
                            setSelectedTime(time);
                          }}
                          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 ${
                            isDoctorOnly
                              ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100/80'
                              : isTimeSelected
                              ? 'bg-[#00696c] text-white shadow-md scale-105'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                          title={isDoctorOnly ? 'Horário exclusivo da Administração / Dr. Frankisney' : `Agendar às ${time}`}
                        >
                          {isDoctorOnly && <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          <span>{time}</span>
                          {isDoctorOnly && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-80 ml-0.5">
                              (Dr)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card de Confirmação Rápida */}
              <div className="w-full lg:w-96 bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between shrink-0">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Calendar className="w-4 h-4 text-[#0A9396]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Dr. Frankisney Souza
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#00696c]">
                    {selectedDay.dayName}, {selectedDay.dayNumber} de {selectedDay.month} às {selectedTime}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#005f73] shrink-0">
                    <FileCheck className="w-4 h-4 text-[#005f73]" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Dr. Frankisney Souza</p>
                    <p className="text-[11px] text-slate-500">Duração média de 45 minutos</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSchedule}
                  className="w-full py-3 px-4 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-[#005f73]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Confirmar Este Agendamento</span>
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SESSÃO D: HISTÓRICO CLÍNICO (ÚLTIMOS PROCEDIMENTOS)          */}
          {/* ============================================================ */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-[#005f73]" />
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                    Últimos Procedimentos Realizados
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Histórico completo de intervenções registradas no seu odontograma digital.
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => toast.info('Filtro', 'Histórico completo de intervenções odontológicas.')}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filtrar</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:opacity-80 text-white text-xs font-bold shadow-xs transition-opacity cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Exportar Laudo (PDF)</span>
                </button>
              </div>
            </div>

            {/* Tabela de Histórico (Desktop) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-6 font-bold" scope="col">
                      Data
                    </th>
                    <th className="py-3.5 px-6 font-bold" scope="col">
                      Região / Dente
                    </th>
                    <th className="py-3.5 px-6 font-bold" scope="col">
                      Procedimento Realizado
                    </th>
                    <th className="py-3.5 px-6 font-bold" scope="col">
                      Profissional
                    </th>
                    <th className="py-3.5 px-6 font-bold text-center" scope="col">
                      Status
                    </th>
                    <th className="py-3.5 px-6 font-bold text-right" scope="col">
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {proceduresHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <p className="font-semibold text-slate-600">Nenhum procedimento anterior registrado</p>
                        <p className="text-xs text-slate-400 mt-1">Seus atendimentos e evoluções clínicas aparecerão aqui automaticamente.</p>
                      </td>
                    </tr>
                  ) : (
                    proceduresHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          {item.date}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                              item.regionType === 'dente'
                                ? 'bg-teal-50 text-[#005f73] border border-teal-100'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.region}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-800">
                          <p className="font-bold text-slate-900">{item.procedure}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                        </td>

                        <td className="py-4 px-6 font-medium text-slate-700 whitespace-nowrap">
                          {item.professional}
                        </td>

                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#2BFF05] text-slate-950 text-xs font-black border border-emerald-600 shadow-2xs">
                            <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                            <span>{item.status}</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              toast.info('Detalhes Clínicos', `${item.procedure} - Realizado por ${item.professional}.`)
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#005f73] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Visualizar laudo do procedimento"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Exibindo {proceduresHistory.length} procedimento(s) do prontuário</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 font-semibold cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Histórico', 'Todos os registros atuais estão exibidos.')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Próximo
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM BAR MOBILE FIXA (NAVEGAÇÃO COM O POLEGAR)           */}
      {/* ============================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex lg:hidden items-center justify-around py-2 px-1 shadow-lg">
        <button
          type="button"
          onClick={() => {
            setActiveTab('inicio');
            scrollToTop();
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'inicio' ? 'text-[#005f73] font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('tratamentos');
            scrollToTop();
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'tratamentos' ? 'text-[#005f73] font-bold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tratamentos</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('agendar');
            scrollToTop();
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'agendar' ? 'text-[#005f73] font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Agendar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('dados');
            scrollToTop();
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'dados' ? 'text-[#005f73] font-bold' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Meus Dados</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('seguranca');
            scrollToTop();
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'seguranca' ? 'text-[#005f73] font-bold' : 'text-slate-400'
          }`}
        >
          <Lock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Segurança</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* 5. MODAIS (VER DETALHES & CANCELAR)                            */}
      {/* ============================================================== */}
      {isViewModalOpen && currentAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <Calendar className="w-4 h-4 text-[#005f73]" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Detalhes da Consulta</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Data e Horário</span>
                <p className="font-extrabold text-slate-900 text-sm">{currentAppointment.dateLabel}</p>
                <p className="text-xs text-slate-500">Duração prevista: {currentAppointment.duration}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Procedimento Clínico</span>
                <p className="font-bold text-slate-900">{currentAppointment.procedure}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Profissional & Local</span>
                <p className="font-bold text-slate-900">{currentAppointment.dentist}</p>
                <p className="text-xs text-slate-500">{currentAppointment.room}</p>
                <p className="text-xs text-slate-500">Unidade Central Odonto Souza</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCancelModalOpen && currentAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Desmarcar Consulta?</h4>
                <p className="text-xs text-slate-500">Essa ação liberará o horário na agenda.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza de que deseja cancelar a consulta marcada para{' '}
              <strong className="text-slate-800">{currentAppointment.dateLabel}</strong>?
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  if (currentAppointment) {
                    emitirNotificacaoClinica({
                      tipo: 'cancelamento_agendamento',
                      titulo: 'Consulta Desmarcada pelo Paciente',
                      mensagem: `${patientData?.fullName || 'Paciente'} desmarcou a consulta agendada para ${currentAppointment.dateLabel}.`,
                      detalhes: {
                        pacienteNome: patientData?.fullName || 'Paciente',
                        pacienteTelefone: patientData?.phone || '',
                        pacienteEmail: patientData?.email || '',
                        dataConsulta: currentAppointment.dateLabel,
                        horarioConsulta: currentAppointment.dateLabel,
                        procedimento: currentAppointment.procedure,
                        dentista: currentAppointment.dentist,
                        motivo: 'Desmarcado pelo paciente na Área do Paciente.',
                        origem: 'portal_paciente',
                      },
                      linkRota: 'agenda',
                    });
                  }
                  setCurrentAppointment((prev) => (prev ? {
                    ...prev,
                    status: 'Consulta Cancelada / Desmarcada',
                  } : null));
                  toast.warning('Consulta Desmarcada', 'Sua consulta foi desmarcada. Você pode agendar um novo horário a qualquer momento.');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Confirmar Desmarcação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
