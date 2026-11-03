import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Zap,
  Users,
  Lock,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Sparkles,
  Coffee,
  Timer,
  Filter,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { scrollToTop } from '../../utils/scrollUtils';
import { pacientePortalService, PacientePortalData } from '../../services/pacientePortalService';
import { emitirNotificacaoClinica } from '../../contexts/NotificationContext';
import { agendaService } from '../../services/agendaService';

interface SlotItem {
  id: string;
  time: string;
  endTime: string;
  duration: string;
  restMinutes: number;
  status: 'concluido' | 'cirurgia' | 'encaixe' | 'confirmado' | 'livre';
  statusLabel: string;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  detail: string;
  subDetail: string;
  shift: 'manha' | 'tarde' | 'noite';
  isDoctorOnly?: boolean;
}

const INITIAL_SLOTS: SlotItem[] = [
  // ===================== HORÁRIO MATINAL EXCLUSIVO DR. FRANKISNEY =====================
  {
    id: 'slot-1',
    time: '08:10',
    endTime: '08:55',
    duration: '45 min',
    restMinutes: 5,
    shift: 'manha',
    isDoctorOnly: true,
    status: 'concluido',
    statusLabel: 'Concluído',
    badgeColor: 'bg-[#2BFF05] text-slate-950 font-black border border-emerald-600 shadow-2xs',
    borderColor: 'border-[#2BFF05]',
    bgColor: 'bg-[#2BFF05]/10',
    detail: 'Horário Sob Demanda • Exclusivo Dr. Frankisney (Administração)',
    subDetail: 'Agendamento reservado apenas pela equipe do Dr. Frankisney / Administração',
  },

  // ===================== TURNO DA MANHÃ (09:00 às 12:15) =====================
  {
    id: 'slot-2',
    time: '09:00',
    endTime: '09:45',
    duration: '45 min',
    restMinutes: 5,
    shift: 'manha',
    status: 'cirurgia',
    statusLabel: 'Cirurgia',
    badgeColor: 'bg-rose-600 text-white',
    borderColor: 'border-rose-300 hover:border-rose-400',
    bgColor: 'bg-rose-50/40',
    detail: 'Horário Reservado • Procedimento Cirúrgico (09:00 às 09:45)',
    subDetail: 'Indisponível para novos agendamentos',
  },
  {
    id: 'slot-3',
    time: '09:50',
    endTime: '10:35',
    duration: '45 min',
    restMinutes: 5,
    shift: 'manha',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Horário matutino vago • Consultório liberado (09:50 às 10:35)',
    subDetail: 'Cadeira 01 pronta • Sala Esterilizada',
  },
  {
    id: 'slot-4',
    time: '10:40',
    endTime: '11:25',
    duration: '45 min',
    restMinutes: 5,
    shift: 'manha',
    status: 'encaixe',
    statusLabel: 'Encaixe de Urgência',
    badgeColor: 'bg-amber-500 text-white',
    borderColor: 'border-amber-400 hover:border-amber-500',
    bgColor: 'bg-amber-50/40',
    detail: 'Horário Reservado • Consulta de Encaixe (10:40 às 11:25)',
    subDetail: 'Atendimento prioritário agendado',
  },
  {
    id: 'slot-5',
    time: '11:30',
    endTime: '12:15',
    duration: '45 min',
    restMinutes: 5,
    shift: 'manha',
    status: 'confirmado',
    statusLabel: 'Confirmado',
    badgeColor: 'bg-[#004f51] text-white',
    borderColor: 'border-cyan-400 hover:border-cyan-500',
    bgColor: 'bg-cyan-50/40',
    detail: 'Horário Reservado • Particular (11:30 às 12:15)',
    subDetail: 'Bloqueado na agenda clínica',
  },

  // ===================== TURNO DA TARDE SEM CORTES (12:20 às 18:05) =====================
  {
    id: 'slot-6',
    time: '12:20',
    endTime: '13:05',
    duration: '45 min',
    restMinutes: 5,
    shift: 'tarde',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Horário de meio-dia • Consultório liberado (12:20 às 13:05)',
    subDetail: 'Atendimento contínuo sem cortes',
  },
  {
    id: 'slot-7',
    time: '13:10',
    endTime: '13:55',
    duration: '45 min',
    restMinutes: 5,
    shift: 'tarde',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Horário vespertino inicial • Cadeira 01 pronta (13:10 às 13:55)',
    subDetail: 'Consultório liberado',
  },
  {
    id: 'slot-8',
    time: '14:00',
    endTime: '14:45',
    duration: '45 min',
    restMinutes: 5,
    shift: 'tarde',
    status: 'confirmado',
    statusLabel: 'Confirmado',
    badgeColor: 'bg-[#004f51] text-white',
    borderColor: 'border-cyan-400 hover:border-cyan-500',
    bgColor: 'bg-cyan-50/40',
    detail: 'Horário Reservado • Particular (14:00 às 14:45)',
    subDetail: 'Bloqueado na agenda clínica',
  },
  {
    id: 'slot-9',
    time: '14:50',
    endTime: '15:35',
    duration: '45 min',
    restMinutes: 5,
    shift: 'tarde',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Horário vespertino vago • Consultório liberado (14:50 às 15:35)',
    subDetail: 'Cadeira 01 pronta • Sala Esterilizada',
  },
  {
    id: 'slot-10',
    time: '15:40',
    endTime: '16:25',
    duration: '45 min',
    restMinutes: 5,
    shift: 'tarde',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Horário vespertino vago • Sala Esterilizada (15:40 às 16:25)',
    subDetail: 'Sem fila de espera',
  },
  {
    id: 'slot-11',
    time: '16:30',
    endTime: '17:15',
    duration: '45 min',
    restMinutes: 5,
    shift: 'tarde',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Horário vespertino vago • Consultório liberado (16:30 às 17:15)',
    subDetail: 'Cadeira 01 pronta • Sala Esterilizada',
  },
  {
    id: 'slot-12',
    time: '17:20',
    endTime: '18:05',
    duration: '45 min',
    restMinutes: 5,
    shift: 'tarde',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Horário de final de tarde vago (17:20 às 18:05)',
    subDetail: 'Cadeira 01 pronta • Horário flexível',
  },

  // ===================== TURNO DA NOITE SEM CORTES (18:10 às 23:55 / MEIA-NOITE) =====================
  {
    id: 'slot-13',
    time: '18:10',
    endTime: '18:55',
    duration: '45 min',
    restMinutes: 5,
    shift: 'noite',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Início do Turno Noturno • Cadeira Pronta (18:10 às 18:55)',
    subDetail: 'Atendimento contínuo noturno',
  },
  {
    id: 'slot-14',
    time: '19:00',
    endTime: '19:45',
    duration: '45 min',
    restMinutes: 5,
    shift: 'noite',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Turno Noturno • Consultório liberado (19:00 às 19:45)',
    subDetail: 'Atendimento noturno confortável',
  },
  {
    id: 'slot-15',
    time: '19:50',
    endTime: '20:35',
    duration: '45 min',
    restMinutes: 5,
    shift: 'noite',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Turno Noturno • Consultório liberado (19:50 às 20:35)',
    subDetail: 'Equipe clínica de prontidão',
  },
  {
    id: 'slot-16',
    time: '20:40',
    endTime: '21:25',
    duration: '45 min',
    restMinutes: 5,
    shift: 'noite',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Turno Noturno • Equipe clínica de prontidão (20:40 às 21:25)',
    subDetail: 'Atendimento de excelência',
  },
  {
    id: 'slot-17',
    time: '21:30',
    endTime: '22:15',
    duration: '45 min',
    restMinutes: 5,
    shift: 'noite',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Atendimento Estendido Noturno (21:30 às 22:15)',
    subDetail: 'Horário especial para pacientes sem tempo comercial',
  },
  {
    id: 'slot-18',
    time: '22:20',
    endTime: '23:05',
    duration: '45 min',
    restMinutes: 5,
    shift: 'noite',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Atendimento Noturno Avançado (22:20 às 23:05)',
    subDetail: 'Ambiente calmo e exclusivo',
  },
  {
    id: 'slot-19',
    time: '23:10',
    endTime: '23:55',
    duration: '45 min',
    restMinutes: 5,
    shift: 'noite',
    status: 'livre',
    statusLabel: 'Disponível para agendamento',
    badgeColor: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    borderColor: 'border-dashed border-slate-300 hover:border-slate-400',
    bgColor: 'bg-white',
    detail: 'Plantão Noturno Especial até Meia-Noite (23:10 às 23:55)',
    subDetail: 'Último horário clínico • Fechamento às 00:00',
  },
];

interface AgendarConsultaViewProps {
  onScheduleSuccess?: (time: string, date: string, type: string) => void;
  onNavigateToTratamentos?: () => void;
  patientData?: PacientePortalData;
}

export const AgendarConsultaView: React.FC<AgendarConsultaViewProps> = ({
  onScheduleSuccess,
  onNavigateToTratamentos,
  patientData,
}) => {
  const toast = useToast();

  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const m = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return m.charAt(0).toUpperCase() + m.slice(1);
  });
  const [daySlotsMap, setDaySlotsMap] = useState<Record<number, SlotItem[]>>({});
  const slots = daySlotsMap[selectedDay] || INITIAL_SLOTS;

  // Carrega agendamentos reais do paciente no Supabase para o dia selecionado
  useEffect(() => {
    if (!patientData?.id) return;
    const targetDateKey = `2026-11-${String(selectedDay).padStart(2, '0')}`;
    agendaService
      .getAgendamentosPorData(targetDateKey)
      .then((apps) => {
        const patientApps = apps.filter(
          (a) =>
            (a.pacienteId && a.pacienteId === patientData.id) ||
            (a.patientName && a.patientName.toLowerCase().trim() === patientData.fullName?.toLowerCase().trim())
        );
        if (patientApps.length > 0) {
          setDaySlotsMap((prev) => {
            const baseSlots = prev[selectedDay] || INITIAL_SLOTS;
            return {
              ...prev,
              [selectedDay]: baseSlots.map((s) => {
                const matchedApp = patientApps.find((a) => a.time === s.time);
                if (matchedApp) {
                  return {
                    ...s,
                    status: 'confirmado',
                    statusLabel: 'Sua Consulta Agendada',
                    badgeColor: 'bg-[#005f73] text-white font-bold',
                    borderColor: 'border-[#005f73]',
                    bgColor: 'bg-teal-50/70',
                    detail: `Sua Consulta Confirmada • ${matchedApp.procedure || 'Consulta'}`,
                    subDetail: 'Agendamento sincronizado com o sistema clínico',
                  };
                }
                return s;
              }),
            };
          });
        }
      })
      .catch((e) => console.warn('Erro ao carregar agendamentos do dia:', e));
  }, [selectedDay, patientData]);

  // Helper para verificar se um horário de um determinado dia já passou da hora do computador
  const isSlotInThePast = (slotTime: string, day: number): boolean => {
    const now = new Date();
    const currentDay = now.getDate();

    // Se o dia selecionado for anterior ao dia de hoje (no mês atual)
    if (day < currentDay) return true;
    if (day > currentDay) return false;

    // Se for o dia de hoje, compara hora e minuto com a hora atual do computador
    const [slotHour, slotMin] = slotTime.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    if (slotHour < currentHour) return true;
    if (slotHour === currentHour && slotMin <= currentMin) return true;

    return false;
  };

  const getDayOfWeekName = (day: number) => {
    try {
      const now = new Date();
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      const name = d.toLocaleDateString('pt-BR', { weekday: 'long' });
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      return 'Dia';
    }
  };

  // Estados de Fila de Encaixe
  const [inFila, setInFila] = useState(false);
  const [filaCount, setFilaCount] = useState(1);

  // Filtros de Turno e Disponibilidade
  const [shiftFilter, setShiftFilter] = useState<'todos' | 'manha' | 'tarde' | 'noite' | 'livres'>('todos');

  const filteredSlots = slots.filter((slot) => {
    if (shiftFilter === 'manha') return slot.shift === 'manha';
    if (shiftFilter === 'tarde') return slot.shift === 'tarde';
    if (shiftFilter === 'noite') return slot.shift === 'noite';
    if (shiftFilter === 'livres') return slot.status === 'livre' && !isSlotInThePast(slot.time, selectedDay);
    return true;
  });

  // Apenas horários livres no futuro são contabilizados como vagas livres disponíveis
  const freeSlotsCount = slots.filter(
    (s) => s.status === 'livre' && !isSlotInThePast(s.time, selectedDay)
  ).length;

  // Modal de Agendamento
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<SlotItem | null>(null);
  const [bookingType, setBookingType] = useState<string>('Avaliação Geral');
  const [bookingObservation, setBookingObservation] = useState<string>('');

  // Modal de Visualização de Detalhes do Horário
  const [viewSlot, setViewSlot] = useState<SlotItem | null>(null);

  const handleEntrarFila = async () => {
    if (inFila) {
      toast.info('Fila de Encaixe', 'Você já está cadastrado na fila de encaixe prioritário para este dia.');
      return;
    }

    try {
      const targetDateKey = `2026-11-${String(selectedDay).padStart(2, '0')}`;
      if (patientData?.id) {
        await agendaService.saveAgendamento({
          pacienteId: patientData.id,
          pacienteNome: patientData.fullName,
          pacienteTelefone: patientData.phone,
          date: targetDateKey,
          time: '11:00',
          procedure: 'Avaliação de Encaixe / Urgência',
          insurance: patientData.convenio || 'Particular',
          status: 'Encaixe de Urgência',
          isEncaixe: true,
          notes: 'Paciente cadastrado na Fila de Encaixe via Portal do Paciente. Aguardando desistência para alocação automática.',
        });
      }

      setInFila(true);
      setFilaCount((prev) => prev + 1);
      toast.success(
        'Fila de Encaixe Confirmada! ⚡',
        'Você entrou na Fila de Encaixe Prioritário! Caso ocorra desistência ou cancelamento hoje, nosso sistema alocará você automaticamente e enviará os dados no seu WhatsApp.'
      );
    } catch (err) {
      console.warn('Erro ao salvar encaixe:', err);
      setInFila(true);
      setFilaCount((prev) => prev + 1);
      toast.success(
        'Fila de Encaixe Confirmada! ⚡',
        'Você entrou na Fila de Encaixe Prioritário. Você receberá um aviso no WhatsApp em caso de desistência hoje.'
      );
    }
  };

  const handleOpenBooking = (slot: SlotItem) => {
    // Validação estrita: Não permitir agendamento retroativo para horários que já passaram
    if (isSlotInThePast(slot.time, selectedDay)) {
      toast.warning(
        'Horário Passado Indisponível',
        'Não é possível realizar agendamento retroativo para um horário que já passou da hora atual do computador.'
      );
      return;
    }

    // Horários das 08h às 09h são reservados exclusivamente para o Dr. Frankisney / Administração
    if (slot.isDoctorOnly || (slot.time >= '08:00' && slot.time < '09:00')) {
      toast.info(
        'Horário Exclusivo do Dr. Frankisney',
        'Os horários das 08:00 às 09:00 são reservados exclusivamente para o Dr. Frankisney Souza (Administração). Por favor, selecione um horário a partir das 09:00 ou contate a recepção.'
      );
      return;
    }

    setSelectedSlotForBooking(slot);
    setBookingType('Avaliação Geral');
    setBookingObservation('');
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlotForBooking) return;

    // Validação estrita: Bloqueia agendamento retroativo
    if (isSlotInThePast(selectedSlotForBooking.time, selectedDay)) {
      toast.warning(
        'Horário Passado Indisponível',
        'O horário selecionado já passou da hora atual do computador. Por favor, escolha um horário futuro.'
      );
      return;
    }

    // 1. Horários das 08h às 09h são reservados ao Dr. Frankisney
    if (selectedSlotForBooking.isDoctorOnly || (selectedSlotForBooking.time >= '08:00' && selectedSlotForBooking.time < '09:00')) {
      toast.info(
        'Horário Sob Demanda',
        'Os horários das 08:00 às 09:00 são reservados exclusivamente para o Dr. Frankisney Souza (Administração). Por favor, escolha um dos horários disponíveis a partir das 09:00.'
      );
      return;
    }

    // 2. Regra de Negócio: Um paciente comum não pode marcar dois horários no mesmo dia.
    // Exceção Homologada: Usuário de teste 'everaldozspaciente@gmail.com' pode realizar múltiplos agendamentos para demonstrações e testes da clínica.
    const isTestPatient =
      patientData?.email?.toLowerCase().trim() === 'everaldozspaciente@gmail.com' ||
      patientData?.id === '1b594c6e-400f-4ca7-9a19-282de3ef8832';

    const targetDateKey = `2026-11-${String(selectedDay).padStart(2, '0')}`;

    if (!isTestPatient) {
      // A. Verificação no Supabase: checa se o paciente possui agendamento ativo nesta data específica
      if (patientData?.id) {
        const conflito = await agendaService.verificarConflitoDuploAgendamento(
          patientData.id,
          targetDateKey
        );
        if (!conflito.permitido) {
          toast.warning(
            'Limite de 1 Agendamento por Dia',
            conflito.motivo || 'Você já possui uma consulta marcada para este dia. Não é permitido agendar dois horários na mesma data, a menos que a consulta anterior já tenha sido concluída.'
          );
          return;
        }
      }

      // B. Verificação na sessão atual: checa se o paciente já pré-agendou outro horário para este mesmo dia
      const hasActiveLocalBooking = slots.some((s) => {
        if (s.id === selectedSlotForBooking.id) return false;
        const isMine =
          s.statusLabel === 'Pré-Agendado por Você' ||
          s.detail?.includes('Sua Consulta Pré-Agendada');
        const isConcluido = s.status === 'concluido';
        return isMine && !isConcluido;
      });

      if (hasActiveLocalBooking) {
        toast.warning(
          'Limite de 1 Agendamento por Dia',
          'Regra de Agendamento: Você já possui uma consulta marcada para este dia. Não é permitido agendar dois horários na mesma data, a menos que a consulta anterior já tenha sido concluída.'
        );
        return;
      }
    }

    // Persiste no Supabase se houver dados do paciente
    if (patientData?.id) {
      try {
        await pacientePortalService.criarAgendamentoReal({
          pacienteId: patientData.id,
          patientName: patientData.fullName,
          phone: patientData.phone,
          date: `${selectedDay} de Novembro de 2026`,
          time: selectedSlotForBooking.time,
          type: bookingType,
          notes: bookingObservation,
        });
      } catch (e) {
        console.warn('Erro ao salvar agendamento no Supabase:', e);
      }
    }

    // Atualiza o slot na grade para confirmado no dia selecionado
    setDaySlotsMap((prev) => {
      const currentDaySlots = prev[selectedDay] || INITIAL_SLOTS;
      return {
        ...prev,
        [selectedDay]: currentDaySlots.map((s) =>
          s.id === selectedSlotForBooking.id
            ? {
                ...s,
                status: 'confirmado',
                statusLabel: 'Pré-Agendado por Você',
                badgeColor: 'bg-teal-700 text-white',
                borderColor: 'border-teal-400',
                bgColor: 'bg-teal-50/50',
                detail: `Sua Consulta Pré-Agendada • ${bookingType}`,
                subDetail: 'Aguardando validação da recepção via WhatsApp',
              }
            : s
        ),
      };
    });

    setIsBookingModalOpen(false);

    // Dispara notificação com campainha de recepção dupla para o painel da clínica
    const pName = patientData?.fullName || (patientData as any)?.nome || 'Everaldo Souza da Silva';
    const pPhone = patientData?.phone || (patientData as any)?.telefone || '(65) 99605-5823';
    const pEmail = patientData?.email || 'everaldozspaciente@gmail.com';
    const pDataConsulta = `${getDayOfWeekName(selectedDay)}, ${selectedDay} de Novembro de 2026`;

    emitirNotificacaoClinica({
      tipo: 'novo_agendamento',
      titulo: 'Novo Agendamento Confirmado',
      mensagem: `${pName} agendou ${bookingType} para ${pDataConsulta} às ${selectedSlotForBooking.time}.`,
      detalhes: {
        pacienteNome: pName,
        pacienteTelefone: pPhone,
        pacienteEmail: pEmail,
        dataConsulta: `${pDataConsulta} às ${selectedSlotForBooking.time}`,
        horarioConsulta: selectedSlotForBooking.time,
        procedimento: bookingType,
        dentista: 'Dr. Frankisney Souza',
        origem: 'portal_paciente',
        observacoes: bookingObservation
          ? `Queixa/Observações: ${bookingObservation}`
          : `Solicitado via Portal do Paciente: ${bookingType}.`,
      },
      linkRota: 'agenda',
    });

    toast.success(
      'Pré-Agendamento Solicitado! 🎉',
      `Horário das ${selectedSlotForBooking.time} no dia ${selectedDay} de Novembro reservado com sucesso! Entraremos em contato via WhatsApp para confirmar.`
    );

    if (onScheduleSuccess) {
      onScheduleSuccess(selectedSlotForBooking.time, `${selectedDay} de Novembro de 2026`, bookingType);
    }

    scrollToTop();
  };

  // Card da Fila de Encaixe Imediato (Renderizado na coluna esquerda no desktop e abaixo dos horários no mobile)
  const renderFilaEncaixeCard = () => (
    <div className="bg-gradient-to-br from-teal-500/10 via-[#86f0f3]/25 to-teal-100/40 rounded-2xl p-5 shadow-xs border border-teal-200/90 text-slate-900 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#005f73] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-4 h-4 text-[#89f3f6]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                Fila de Encaixe Imediato
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#005f73] text-[#89f3f6] text-[10px] font-extrabold">
                {filaCount} aguardando
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Reserva prioritária para vagas liberadas por desistência hoje.
            </p>
          </div>
        </div>
      </div>

      {/* ALERTA VISUAL OBRIGATÓRIO DE ENCAIXE */}
      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-[11px] leading-relaxed space-y-1">
        <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Sobreaviso de Encaixe</span>
        </div>
        <p className="text-amber-800">
          A Fila de Encaixe é uma lista de sobreaviso. <strong>Não é garantia de atendimento em horário pré-fixado</strong>, dependendo de cancelamentos de outros pacientes ou intervalo clínico.
        </p>
        <p className="text-teal-800 font-semibold pt-0.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
          <span>Havendo desistência, a alocação é automática com aviso no WhatsApp!</span>
        </p>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={handleEntrarFila}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            inFila
              ? 'bg-emerald-600 text-white'
              : 'bg-[#005f73] hover:bg-[#004655] text-white'
          }`}
        >
          {inFila ? 'Você está na Fila (Aguardando vaga)' : 'Entrar na Fila de Encaixe'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. LAYOUT RESPONSIVO: CALENDÁRIO + GRADE DE ATENDIMENTO         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* COLUNA ESQUERDA: MINI CALENDÁRIO & FILA DE ENCAIXE          */}
        {/* ============================================================ */}
        <div className="xl:col-span-4 flex flex-col gap-5 w-full">
          {/* CARD DO CALENDÁRIO */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#005f73]" />
                <span className="text-base font-bold text-slate-800 tracking-tight">
                  {selectedMonth}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => toast.info('Navegação', 'Visualizando mês anterior.')}
                  className="p-1 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Mês anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Navegação', 'Visualizando próximo mês.')}
                  className="p-1 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Próximo mês"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 text-center text-[11px] text-slate-400 font-bold mb-2">
              <span>DOM</span>
              <span>SEG</span>
              <span>TER</span>
              <span>QUA</span>
              <span>QUI</span>
              <span>SEX</span>
              <span className="text-[#005f73]">SÁB</span>
            </div>

            {/* Grade dos dias de Novembro 2026 (01 a 30) */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold gap-y-1.5 relative text-slate-600">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const todayNum = new Date().getDate();
                const isSelected = selectedDay === day;
                const isToday = day === todayNum;
                const isPastDay = day < todayNum;
                return (
                  <div key={day} className="relative flex items-center justify-center py-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex flex-col items-center justify-center rounded-lg cursor-pointer font-bold transition-all shadow-2xs ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-sm scale-105 ring-1 ring-slate-900'
                          : isToday
                          ? 'bg-[#005f73]/15 text-[#005f73] border border-[#005f73]/40 hover:bg-[#005f73]/25'
                          : isPastDay
                          ? 'bg-slate-100 text-slate-400 hover:bg-slate-200/70'
                          : 'bg-white hover:bg-slate-100 text-slate-800'
                      }`}
                      title={isToday ? `Hoje, ${day} de Novembro` : isPastDay ? `Dia ${day} de Novembro (Passado)` : `Dia ${day} de Novembro`}
                    >
                      <span>{day}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#89f3f6] -mt-0.5" />
                      )}
                    </button>
                    {isToday && !isSelected && (
                      <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#005f73]" />
                    )}
                  </div>
                );
              })}

              {/* Dias subsequentes de Dezembro esmaecidos (1 a 5 para fechar 35 células da grade 5x7) */}
              {[1, 2, 3, 4, 5].map((decDay) => (
                <div key={`dec-${decDay}`} className="flex items-center justify-center py-1">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-300 text-xs font-normal">
                    {decDay}
                  </span>
                </div>
              ))}
            </div>

            {/* Rodapé do Calendário */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                {freeSlotsCount} horários livres para agendar hoje
              </span>
              <button
                type="button"
                onClick={() => toast.info('Novembro 2026', 'Carregando disponibilidade de Novembro.')}
                className="text-[#005f73] hover:text-[#0A9396] font-bold cursor-pointer hover:underline"
              >
                Ver novembro
              </button>
            </div>
          </div>

          {/* CARD FILA DE ENCAIXE IMEDIATO (DESKTOP: Na coluna esquerda sob o calendário) */}
          <div className="hidden xl:block">
            {renderFilaEncaixeCard()}
          </div>
        </div>

        {/* ============================================================ */}
        {/* COLUNA DIREITA: HEADER DA AGENDA + GRADE DE ATENDIMENTO      */}
        {/* ============================================================ */}
        <div className="xl:col-span-8 flex flex-col gap-4 w-full">
          {/* HEADER STATUS BAR (Oculto no mobile para os horários ficarem logo abaixo do calendário) */}
          <div className="hidden sm:flex bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center text-[#00696c] shrink-0">
                <Clock className="w-6 h-6 text-[#005f73]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Agenda Clínica • {getDayOfWeekName(selectedDay)}, {selectedDay} de Novembro de 2026
                  </h1>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Início às 08:00 (consultas de 45 min com 5 min de descanso) • Dr. Frankisney B. Souza (Cadeira 01)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3.5 py-1.5 rounded-full self-start sm:self-auto text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                <strong>Tempo Otimizado:</strong> 45 min recuperados
              </span>
            </div>
          </div>

          {/* BANNER SE TODAS AS VAGAS ESTIVEREM ESGOTADAS */}
          {freeSlotsCount === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-amber-950">
                      Vagas Regulares Esgotadas para este Dia
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-200 text-amber-900 uppercase">
                      Fila de Encaixe Ativa
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-snug mt-1">
                    Todos os horários normais para esta data estão preenchidos. Cadastre-se na <strong>Fila de Encaixe Prioritário</strong>. Se algum paciente desmarcar ou remarcar, o 1º da fila é chamado automaticamente e avisado por WhatsApp! <em>(Atenção: o encaixe não garante horário fixo)</em>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEntrarFila}
                className="px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004655] text-white text-xs font-bold shrink-0 shadow-2xs transition-all cursor-pointer"
              >
                {inFila ? 'Você está na Fila' : 'Entrar na Fila de Encaixe'}
              </button>
            </div>
          )}

          {/* Grade Compacta de Horários Disponíveis (Novo Modelo Anexo 1) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0A9396] shrink-0" />
                  <h2 className="font-extrabold text-base sm:text-lg text-slate-900 capitalize">
                    Horários disponíveis para {getDayOfWeekName(selectedDay)}, {String(selectedDay).padStart(2, '0')} de Novembro:
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium pl-7">
                  Clique no horário desejado para prosseguir com o agendamento da sua consulta.
                </p>
              </div>

              {/* Filtros em Chips */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
                <button
                  type="button"
                  onClick={() => setShiftFilter('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    shiftFilter === 'todos' || shiftFilter === 'livres'
                      ? 'bg-[#005f73] text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Todos ({freeSlotsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShiftFilter('manha')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    shiftFilter === 'manha'
                      ? 'bg-[#005f73] text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Manhã ({slots.filter((s) => s.shift === 'manha' && s.status === 'livre' && !isSlotInThePast(s.time, selectedDay)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setShiftFilter('tarde')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    shiftFilter === 'tarde'
                      ? 'bg-[#005f73] text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Tarde ({slots.filter((s) => s.shift === 'tarde' && s.status === 'livre' && !isSlotInThePast(s.time, selectedDay)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setShiftFilter('noite')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    shiftFilter === 'noite'
                      ? 'bg-[#005f73] text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Noite ({slots.filter((s) => s.shift === 'noite' && s.status === 'livre' && !isSlotInThePast(s.time, selectedDay)).length})
                </button>
              </div>
            </div>

            {/* Grid / Wrap de Botões de Horário (Pills - Anexo 1) */}
            {filteredSlots.filter((s) => s.status === 'livre' && !isSlotInThePast(s.time, selectedDay)).length === 0 ? (
              <div className="p-8 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-semibold text-center space-y-1">
                <p className="font-bold text-sm">Sem horários livres para este dia/turno</p>
                <p className="text-[11px] text-amber-800">
                  Todos os horários desta data já foram preenchidos ou transcorreram pelo horário do computador. Por favor, escolha outro dia no calendário ao lado.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 sm:gap-3.5 pt-1">
                {filteredSlots
                  .filter((s) => s.status === 'livre' && !isSlotInThePast(s.time, selectedDay))
                  .map((slot) => {
                    const isSelected = selectedSlotForBooking?.id === slot.id;
                    const isDoctor = slot.isDoctorOnly || (slot.time >= '08:00' && slot.time < '09:00');

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          if (isDoctor) {
                            toast.info(
                              'Horário Exclusivo do Dr. Frankisney',
                              'Os horários das 08:00 às 09:00 são reservados exclusivamente para o Dr. Frankisney Souza (Administração). Para agendar neste horário, contate a recepção da clínica.'
                            );
                            return;
                          }
                          handleOpenBooking(slot);
                        }}
                        className={`min-w-[86px] sm:min-w-[96px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#005f73] text-white shadow-md scale-105 border-transparent'
                            : isDoctor
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-white hover:bg-slate-50 hover:border-[#005f73] hover:text-[#005f73] text-slate-800 border border-slate-200 hover:shadow-xs active:scale-95'
                        }`}
                        title={isDoctor ? 'Horário exclusivo da Administração' : `Clique para agendar às ${slot.time}`}
                      >
                        {isDoctor && <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                        <span>{slot.time}</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* CARD FILA DE ENCAIXE IMEDIATO (MOBILE: Abaixo dos horários da agenda) */}
          <div className="block xl:hidden">
            {renderFilaEncaixeCard()}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MODAL INTERATIVO DE AGENDAMENTO (SOLICITAR RESERVA)         */}
      {/* ============================================================== */}
      {isBookingModalOpen && selectedSlotForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <Calendar className="w-5 h-5 text-[#005f73]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Confirmar Pré-Agendamento</h4>
                  <p className="text-xs text-slate-500">
                    {selectedSlotForBooking.time} • {getDayOfWeekName(selectedDay)}, {selectedDay} de Novembro de 2026
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Profissional & Local
                </span>
                <p className="font-bold text-slate-900">Dr. Frankisney B. Souza (CRO-5950/MT)</p>
                <p className="text-xs text-slate-500">
                  Cadeira 01 • Consultório Principal • Duração prevista: {selectedSlotForBooking.duration}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Tipo de Atendimento Desejado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Avaliação Geral',
                    'Profilaxia (Limpeza)',
                    'Manutenção / Retorno',
                    'Urgência / Dor',
                  ].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setBookingType(tipo)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        bookingType === tipo
                          ? 'bg-[#005f73] text-white border-[#005f73] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${bookingType === tipo ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{tipo}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Observações ou queixa principal (opcional)
                </label>
                <textarea
                  value={bookingObservation}
                  onChange={(e) => setBookingObservation(e.target.value)}
                  placeholder="Ex: Sensibilidade no dente molar, retorno para manutenção ou placa de bruxismo..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="px-5 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Solicitar Reserva</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODAL DE VISUALIZAÇÃO DE HORÁRIO OCUPADO                    */}
      {/* ============================================================== */}
      {viewSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <Lock className="w-4 h-4 text-[#005f73]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Horário Reservado ({viewSlot.time})
                  </h4>
                  <p className="text-xs text-slate-500">Status: {viewSlot.statusLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Horário:</span>
                <span className="font-bold text-slate-900">{viewSlot.time} ({viewSlot.duration})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Natureza:</span>
                <span className="font-semibold text-slate-800">{viewSlot.detail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sigilo:</span>
                <span className="font-bold text-emerald-700">Protegido por LGPD</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Para agendar um horário com o Dr. Frankisney Souza, selecione um dos horários com o selo
              verde <strong>"Livre"</strong> ou entre na Fila de Encaixe Imediato.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewSlot(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
