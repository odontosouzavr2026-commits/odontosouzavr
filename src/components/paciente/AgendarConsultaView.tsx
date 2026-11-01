import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
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
  Headphones,
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
        const patientApp = apps.find(
          (a) =>
            (a.pacienteId && a.pacienteId === patientData.id) ||
            (a.patientName && a.patientName.toLowerCase().trim() === patientData.fullName?.toLowerCase().trim())
        );
        if (patientApp) {
          setDaySlotsMap((prev) => {
            const baseSlots = prev[selectedDay] || INITIAL_SLOTS;
            return {
              ...prev,
              [selectedDay]: baseSlots.map((s) => {
                if (s.time === patientApp.time) {
                  return {
                    ...s,
                    status: 'confirmado',
                    statusLabel: 'Sua Consulta Agendada',
                    badgeColor: 'bg-[#005f73] text-white font-bold',
                    borderColor: 'border-[#005f73]',
                    bgColor: 'bg-teal-50/70',
                    detail: `Sua Consulta Confirmada • ${patientApp.procedure || 'Consulta'}`,
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

  const handleEntrarFila = () => {
    if (inFila) {
      toast.info('Fila de Encaixe', 'Você já está cadastrado na fila de encaixe prioritário.');
      return;
    }
    setInFila(true);
    setFilaCount((prev) => prev + 1);
    toast.success(
      'Fila de Encaixe Confirmada! ⚡',
      'Você entrou na Fila de Encaixe Imediato (Posição #2). Você receberá um aviso no WhatsApp em caso de desistência hoje.'
    );
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

    // 2. Regra de Negócio: Um paciente não pode marcar dois horários no mesmo dia.
    // Pode agendar em dias diferentes (ex: dia 1 e dia 3), mas nunca dois no mesmo dia,
    // exceto se a consulta anterior na mesma data já estiver concluída.
    const targetDateKey = `2026-11-${String(selectedDay).padStart(2, '0')}`;

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
    const pEmail = patientData?.email || 'everaldoszpaciente@gmail.com';
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

          {/* CARD FILA DE ENCAIXE IMEDIATO */}
          <div className="bg-gradient-to-br from-teal-500/10 via-[#86f0f3]/25 to-teal-100/40 rounded-2xl p-5 shadow-xs border border-teal-200/90 text-slate-900">
            <div className="flex items-start justify-between gap-3 mb-2">
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
                      {filaCount} hoje
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Seja notificado por SMS/WhatsApp caso ocorra cancelamento ou desistência hoje.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleEntrarFila}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  inFila
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#005f73] hover:bg-[#004655] text-white'
                }`}
              >
                {inFila ? 'Você está na Fila (Posição #2)' : 'Entrar na Fila'}
              </button>
            </div>
          </div>

          {/* LGPD E PRIVACIDADE CARD */}
          <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-[#005f73] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#0A9396]" />
              <span>Privacidade e Ética Odontológica (LGPD)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Em total respeito à Lei Geral de Proteção de Dados e ao sigilo médico-odontológico, a
              agenda exibe apenas os blocos de horário vagos e confirmações anônimas. Nenhum
              prontuário ou identificador de terceiros é compartilhado.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1 font-medium">
              <Headphones className="w-3.5 h-3.5 text-[#005f73]" />
              <span>Dúvidas com horários? Entre em contato pelo ramal clínico.</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* COLUNA DIREITA: HEADER DA AGENDA + GRADE DE ATENDIMENTO      */}
        {/* ============================================================ */}
        <div className="xl:col-span-8 flex flex-col gap-4 w-full">
          {/* HEADER STATUS BAR */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                  Início às 08:00 (consultas de 45 min com 5 min de descanso) • Dr. Frankisney Souza (Cadeira 01)
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

          {/* SUB-HEADER DA GRADE COM ABAS DE FILTRO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-800">Grade de Atendimento</h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {filteredSlots.length} de {slots.length} horários
              </span>
            </div>

            {/* Filtros em Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setShiftFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  shiftFilter === 'todos'
                    ? 'bg-[#005f73] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                Todos ({slots.length})
              </button>
              <button
                type="button"
                onClick={() => setShiftFilter('manha')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  shiftFilter === 'manha'
                    ? 'bg-[#005f73] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                Manhã ({slots.filter((s) => s.shift === 'manha').length})
              </button>
              <button
                type="button"
                onClick={() => setShiftFilter('tarde')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  shiftFilter === 'tarde'
                    ? 'bg-[#005f73] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                Tarde ({slots.filter((s) => s.shift === 'tarde').length})
              </button>
              <button
                type="button"
                onClick={() => setShiftFilter('noite')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  shiftFilter === 'noite'
                    ? 'bg-[#005f73] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                Noite ({slots.filter((s) => s.shift === 'noite').length})
              </button>
              <button
                type="button"
                onClick={() => setShiftFilter('livres')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  shiftFilter === 'livres'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                }`}
              >
                Livres ({freeSlotsCount})
              </button>
            </div>
          </div>

          {/* LISTA DE CARDS DE HORÁRIO (TIMELINE SLOTS) */}
          <div className="flex flex-col gap-3 w-full">
            {filteredSlots.map((slot, index) => {
              const isPast = isSlotInThePast(slot.time, selectedDay);
              const isLivre = slot.status === 'livre';
              const nextSlot = slots[slots.findIndex((s) => s.id === slot.id) + 1];

              // Estilização dinâmica para horários passados
              const cardBgColor = isPast && isLivre ? 'bg-slate-100/70 opacity-60' : slot.bgColor;
              const cardBorderColor = isPast && isLivre ? 'border-slate-300' : slot.borderColor;

              return (
                <React.Fragment key={slot.id}>
                  <div
                    className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 ${
                      cardBgColor
                    } border-2 ${cardBorderColor}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Bloco de Horário e Informações */}
                      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                        {/* Horário */}
                        <div className="flex flex-col text-left pl-1 min-w-[78px] shrink-0">
                          <span className={`text-base sm:text-lg font-black tracking-tight leading-none ${
                            isPast && isLivre ? 'text-slate-400 line-through' : 'text-slate-900'
                          }`}>
                            {slot.time}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 mt-1">
                            {slot.time} - {slot.endTime}
                          </span>
                          <span className={`text-[10px] font-extrabold mt-0.5 ${
                            isPast && isLivre ? 'text-slate-400' : 'text-[#005f73]'
                          }`}>
                            {slot.duration}
                          </span>
                        </div>

                        <div className="h-10 w-[1px] bg-slate-200 hidden sm:block shrink-0" />

                        {/* Status e Detalhes */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm sm:text-base font-bold ${
                                isPast && isLivre
                                  ? 'text-slate-500'
                                  : isLivre
                                  ? 'text-emerald-700'
                                  : 'text-slate-900'
                              }`}
                            >
                              {isPast && isLivre ? 'Horário Encerrado' : isLivre ? 'Livre' : 'Reservado'}
                            </span>

                            <span
                              className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs ${
                                isPast && isLivre
                                  ? 'bg-slate-200 text-slate-600 border border-slate-300'
                                  : slot.badgeColor
                              }`}
                            >
                              {isPast && isLivre ? 'Horário Passado' : slot.statusLabel}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1 truncate">
                            {isPast && isLivre
                              ? 'Horário já transcorrido hoje • Indisponível para agendamento retroativo'
                              : slot.detail}
                          </p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {isLivre ? (
                          isPast ? (
                            <button
                              type="button"
                              disabled
                              className="bg-slate-200 text-slate-500 text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-80"
                              title="Horário já passou da hora do computador. Agendamento retroativo bloqueado."
                            >
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Horário Encerrado</span>
                            </button>
                          ) : slot.isDoctorOnly || (slot.time >= '08:00' && slot.time < '09:00') ? (
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(
                                  'Horário Exclusivo do Dr. Frankisney',
                                  'Os horários das 08:00 às 09:00 são reservados exclusivamente para o Dr. Frankisney Souza (Administração). Para agendar neste horário, contate a recepção da clínica.'
                                );
                              }}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                              title="Horário Sob Demanda (Dr. Frankisney / Administração)"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Sob Demanda (Dr. Frankisney)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenBooking(slot)}
                              className="bg-[#005f73] hover:bg-[#004655] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                              <span>Agendar Horário</span>
                            </button>
                          )
                        ) : (
                          <div className="flex items-center gap-1 bg-white/90 border border-slate-200 rounded-full px-2 py-1 shadow-2xs">
                            {/* Visualizar (Azul) */}
                            <button
                              type="button"
                              onClick={() => setViewSlot(slot)}
                              className="p-1.5 text-blue-600 hover:opacity-80 transition-opacity rounded-full hover:bg-slate-100 cursor-pointer"
                              title="Visualizar detalhes da disponibilidade"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Editar (Laranja) */}
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(
                                  'Acesso Restrito',
                                  'Horários reservados para outros pacientes são protegidos por sigilo (LGPD).'
                                );
                              }}
                              className="p-1.5 text-amber-500 hover:opacity-80 transition-opacity rounded-full hover:bg-slate-100 cursor-pointer"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Excluir (Vermelho) */}
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(
                                  'Horário Ocupado',
                                  'Cancelamentos só podem ser realizados pelo próprio paciente ou pela recepção.'
                                );
                              }}
                              className="p-1.5 text-rose-600 hover:opacity-80 transition-opacity rounded-full hover:bg-slate-100 cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divisor de 5 min de descanso e esterilização entre consultas */}
                  {slot.restMinutes === 5 && nextSlot && (shiftFilter === 'todos' || shiftFilter === slot.shift) && (
                    <div className="flex items-center justify-center my-0.5">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] text-slate-600 font-semibold shadow-2xs">
                        <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          5 min de descanso clínico &amp; higienização da cadeira ({slot.endTime} às {nextSlot.time})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Intervalo de Almoço & Autoclave Geral */}
                  {slot.restMinutes === 85 && (shiftFilter === 'todos' || shiftFilter === 'manha') && (
                    <div className="my-1.5 rounded-2xl p-4 sm:p-5 border-l-4 border-l-[#005f73] bg-gradient-to-r from-slate-100 via-teal-50/40 to-slate-100 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 shrink-0 text-left sm:text-center">
                          <span className="text-base sm:text-lg font-black text-slate-800 block">12:05</span>
                          <span className="text-xs font-bold text-slate-500 block">85 min</span>
                        </div>
                        <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              Intervalo de Almoço &amp; Biossegurança Geral
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#005f73]/10 text-[#005f73]">
                              Autoclave Ativa
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ciclo de autoclave, esterilização terminal dos consultórios e intervalo da equipe (12:05 às 13:30)
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-teal-800 bg-white px-3 py-1 rounded-lg border border-teal-200 self-start sm:self-auto shadow-2xs">
                        Turno da Tarde inicia às 13:30
                      </span>
                    </div>
                  )}

                  {/* Transição Turno Tarde -> Noite */}
                  {slot.time === '17:40' && (shiftFilter === 'todos' || shiftFilter === 'tarde') && (
                    <div className="flex items-center justify-center my-1.5">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-bold shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Início do Turno Noturno &amp; Atendimento Estendido (18:30 às 00:00)</span>
                      </div>
                    </div>
                  )}

                  {/* Encerramento da Agenda à Meia-Noite (00:00) */}
                  {slot.time === '23:30' && (shiftFilter === 'todos' || shiftFilter === 'noite') && (
                    <div className="flex items-center justify-center my-1 text-xs text-slate-500 font-semibold gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-slate-400" />
                      <span>Encerramento do plantão clínico às 00:00 (Meia-noite)</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
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
                <p className="font-bold text-slate-900">Dr. Frankisney Souza (CRO-SP 78.432)</p>
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
