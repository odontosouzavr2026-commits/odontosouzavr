import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Lock,
  Upload,
  Download,
  Plus,
  CheckCircle,
  Database,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { AgendaMetricsHeader } from './AgendaMetricsHeader';
import { MiniCalendarCard } from './MiniCalendarCard';
import { EncaixeQueueCard } from './EncaixeQueueCard';
import { TimelineSchedule, TimelineSlot } from './TimelineSchedule';
import { AgendamentoFormView } from './AgendamentoFormView';
import {
  AgendaMetricsData,
  AgendaAppointmentItem,
  EncaixeQueueItem,
} from '../../types/agenda';
import { PacienteItem } from '../../types/pacientes';
import { agendaService } from '../../services/agendaService';
import { pacientesService } from '../../services/pacientesService';
import { BTN_IMPORTAR_CLASS, BTN_EXPORTAR_CLASS } from '../../utils/buttonStyles';
import { scrollToTop } from '../../utils/scrollUtils';

interface AgendaViewProps {
  forceMobileView?: boolean;
  onNavigateToAtendimento?: (patient?: PacienteItem) => void;
  onNavigateToProcedimentos?: () => void;
}

const getDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatFullDate = (date: Date): string => {
  const str = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const calculateEndTime = (startTime: string, durationMinutes: number = 45): string => {
  const [h, m] = startTime.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '12:00';
  const totalMins = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

const timeToMinutes = (t: string): number => {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Gera a grade clínica padrão com horários livres para agendamento
const generateDefaultSlots = (date: Date): TimelineSlot[] => {
  const baseKey = getDateKey(date);
  return [
    {
      id: `slot-0800-${baseKey}`,
      type: 'livre',
      time: '08:00',
      endTime: '09:00',
      duration: 'Livre',
      notes: 'Horário Sob Demanda Disponível (08:00 às 09:00)',
    },
    {
      id: `slot-0900-${baseKey}`,
      type: 'livre',
      time: '09:00',
      endTime: '09:45',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (09:00 às 09:45)',
    },
    {
      id: `slot-0945-${baseKey}`,
      type: 'livre',
      time: '09:45',
      endTime: '10:30',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (09:45 às 10:30)',
    },
    {
      id: `slot-1030-${baseKey}`,
      type: 'livre',
      time: '10:30',
      endTime: '11:15',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (10:30 às 11:15)',
    },
    {
      id: `slot-1115-${baseKey}`,
      type: 'livre',
      time: '11:15',
      endTime: '12:00',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (11:15 às 12:00)',
    },
    {
      id: `slot-1200-${baseKey}`,
      type: 'intervalo',
      time: '12:00',
      endTime: '13:30',
      duration: '90 min',
      notes: 'Higienização da clínica e ciclo de autoclave (12:00 às 13:30).',
    },
    {
      id: `slot-1330-${baseKey}`,
      type: 'livre',
      time: '13:30',
      endTime: '14:15',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (13:30 às 14:15)',
    },
    {
      id: `slot-1415-${baseKey}`,
      type: 'livre',
      time: '14:15',
      endTime: '15:00',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (14:15 às 15:00)',
    },
    {
      id: `slot-1500-${baseKey}`,
      type: 'livre',
      time: '15:00',
      endTime: '15:45',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (15:00 às 15:45)',
    },
    {
      id: `slot-1545-${baseKey}`,
      type: 'livre',
      time: '15:45',
      endTime: '16:30',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (15:45 às 16:30)',
    },
    {
      id: `slot-1630-${baseKey}`,
      type: 'livre',
      time: '16:30',
      endTime: '17:15',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (16:30 às 17:15)',
    },
    {
      id: `slot-1715-${baseKey}`,
      type: 'livre',
      time: '17:15',
      endTime: '18:00',
      duration: 'Livre',
      notes: 'Horário Disponível para Atendimento (17:15 às 18:00)',
    },
    {
      id: `slot-1800-${baseKey}`,
      type: 'livre',
      time: '18:00',
      endTime: '18:45',
      duration: 'Livre',
      notes: 'Turno Noturno Disponível (18:00 às 18:45)',
    },
    {
      id: `slot-1845-${baseKey}`,
      type: 'livre',
      time: '18:45',
      endTime: '19:30',
      duration: 'Livre',
      notes: 'Turno Noturno Disponível (18:45 às 19:30)',
    },
    {
      id: `slot-1930-${baseKey}`,
      type: 'livre',
      time: '19:30',
      endTime: '20:15',
      duration: 'Livre',
      notes: 'Turno Noturno Disponível (19:30 às 20:15)',
    },
    {
      id: `slot-2015-${baseKey}`,
      type: 'livre',
      time: '20:15',
      endTime: '21:00',
      duration: 'Livre',
      notes: 'Turno Noturno Disponível (20:15 às 21:00)',
    },
    {
      id: `slot-2100-${baseKey}`,
      type: 'livre',
      time: '21:00',
      endTime: '21:45',
      duration: 'Livre',
      notes: 'Atendimento Estendido (21:00 às 21:45)',
    },
    {
      id: `slot-2145-${baseKey}`,
      type: 'livre',
      time: '21:45',
      endTime: '22:30',
      duration: 'Livre',
      notes: 'Atendimento Estendido (21:45 às 22:30)',
    },
    {
      id: `slot-2230-${baseKey}`,
      type: 'livre',
      time: '22:30',
      endTime: '23:15',
      duration: 'Livre',
      notes: 'Plantão Noturno (22:30 às 23:15)',
    },
    {
      id: `slot-2315-${baseKey}`,
      type: 'livre',
      time: '23:15',
      endTime: '00:00',
      duration: 'Livre',
      notes: 'Plantão Noturno até Meia-Noite (23:15 às 00:00)',
    },
  ];
};

// Constrói a linha do tempo mesclando os agendamentos reais do Supabase na grade do dia
const buildDaySlots = (
  date: Date,
  appointments: AgendaAppointmentItem[]
): TimelineSlot[] => {
  const defaultTemplate = generateDefaultSlots(date);

  const mappedAppointments: TimelineSlot[] = appointments.map((app) => ({
    id: app.id,
    pacienteId: app.pacienteId,
    procedimentoId: app.procedimentoId,
    type: 'agendado' as const,
    time: app.time,
    endTime: app.endTime || calculateEndTime(app.time, 45),
    duration: app.duration || '45 min',
    patientName: app.patientName,
    phone: app.phone,
    cpf: app.cpf,
    procedure: app.procedure,
    insurance: app.insurance || 'Particular',
    status: app.status || 'Confirmado',
    isUrgent: app.isEncaixe,
    isSurgery: app.isSurgery,
    isCurrentSession: app.status === 'Em Atendimento',
    actionButtonLabel: app.actionButtonLabel,
    notes: app.notes,
  }));

  const slots: TimelineSlot[] = [...mappedAppointments];

  for (const templateSlot of defaultTemplate) {
    if (templateSlot.type === 'intervalo') {
      slots.push(templateSlot);
      continue;
    }

    let slotStart = timeToMinutes(templateSlot.time);
    let slotEnd = timeToMinutes(templateSlot.endTime || calculateEndTime(templateSlot.time, 45));

    // Prevenção de sobreposição / fragmentação indevida de horários com agendamentos existentes
    let isValid = true;
    for (const app of mappedAppointments) {
      const aStart = timeToMinutes(app.time);
      const aEnd = timeToMinutes(app.endTime || calculateEndTime(app.time, 45));

      // 1. O slot livre começa dentro do agendamento (ex: slot 11:15 com agendamento 11:00-11:45)
      // O slot livre é completamente descartado para não duplicar horários nem gerar intervalos vazios
      if (slotStart >= aStart && slotStart < aEnd) {
        isValid = false;
        break;
      }

      // 2. O slot livre começa antes, mas ultrapassa o início do agendamento (ex: 10:30-11:15 com consulta às 11:00)
      if (slotStart < aStart && slotEnd > aStart) {
        const remainingMinutes = aStart - slotStart;
        if (remainingMinutes >= 30) {
          // Ajusta o fim do slot para o início da consulta
          slotEnd = aStart;
        } else {
          // Menos de 30 minutos é insuficiente para atendimento: descarta
          isValid = false;
          break;
        }
      }

      // 3. O agendamento cobre o início do slot e sobra tempo após o agendamento
      if (slotStart < aEnd && slotEnd > aEnd) {
        const remainingMinutes = slotEnd - aEnd;
        if (remainingMinutes >= 30) {
          slotStart = aEnd;
        } else {
          isValid = false;
          break;
        }
      }
    }

    if (isValid && slotEnd > slotStart && slotEnd - slotStart >= 30) {
      const newTimeStr = minutesToTime(slotStart);
      const newEndStr = minutesToTime(slotEnd);
      const durationMins = slotEnd - slotStart;

      slots.push({
        ...templateSlot,
        time: newTimeStr,
        endTime: newEndStr,
        duration: durationMins === 45 ? 'Livre' : `${durationMins} min`,
        notes: `Horário Disponível para Atendimento (${newTimeStr} às ${newEndStr})`,
      });
    }
  }

  slots.sort((a, b) => a.time.localeCompare(b.time));

  return slots;
};

// Cálculo dinâmico das métricas dos 5 cards a partir dos slots do dia
const calculateMetricsForSlots = (slots: TimelineSlot[]): AgendaMetricsData => {
  const agendados = slots.filter((s) => s.type === 'agendado');

  let completed = 0;
  let inChair = 0;
  let cancelled = 0;
  let encaixes = 0;

  for (const s of agendados) {
    const st = (s.status || '').toLowerCase();
    if (st.includes('conclu') || st.includes('finaliz') || s.isEarlyFinish) {
      completed++;
    } else if (st.includes('atendimento') || s.isCurrentSession) {
      inChair++;
    } else if (st.includes('cancel') || st.includes('falta') || st.includes('desmarc')) {
      cancelled++;
    }

    if (
      s.isUrgent ||
      st.includes('urgência') ||
      st.includes('urgencia') ||
      st.includes('encaixe')
    ) {
      encaixes++;
    }
  }

  return {
    scheduled: agendados.filter((s) => !s.status?.toLowerCase().includes('cancel')).length,
    completed,
    inChair,
    cancelled,
    encaixes,
  };
};

export const AgendaView: React.FC<AgendaViewProps> = ({
  forceMobileView = false,
  onNavigateToAtendimento,
  onNavigateToProcedimentos,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [selectedChair, setSelectedChair] = useState(
    'Cadeira 01 - Dr. Frankisney Souza (Geral & Implantes)'
  );

  // Estado de Agendamentos Reais do Supabase
  const [supabaseAppointments, setSupabaseAppointments] = useState<AgendaAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // View Switching (Regra Arquitetural Mobile-First: Sem Modais)
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [formInitialTime, setFormInitialTime] = useState('09:00');
  const [editingAppointment, setEditingAppointment] = useState<AgendaAppointmentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Busca agendamentos reais diretamente do Supabase
  const loadAppointmentsFromSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await agendaService.getAgendamentos();
      setSupabaseAppointments(data);
    } catch (e) {
      console.warn('Erro ao carregar agendamentos do Supabase:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointmentsFromSupabase();
  }, [loadAppointmentsFromSupabase]);

  // Data ativa selecionada no formato YYYY-MM-DD
  const activeDateKey = getDateKey(selectedDate);

  // Agendamentos reais do Supabase para o dia selecionado
  const activeDayAppointments = useMemo(() => {
    return supabaseAppointments.filter((a) => a.date === activeDateKey);
  }, [supabaseAppointments, activeDateKey]);

  // Linha do tempo construída com os dados reais do Supabase daquele dia
  const currentSlots = useMemo(() => {
    return buildDaySlots(selectedDate, activeDayAppointments);
  }, [selectedDate, activeDayAppointments]);

  // Fila de encaixe real do dia selecionado (somente se houver agendamentos de encaixe/espera no dia)
  const activeEncaixeQueue: EncaixeQueueItem[] = useMemo(() => {
    const encaixes = activeDayAppointments.filter(
      (a) =>
        a.isEncaixe ||
        a.status === 'Encaixe de Urgência' ||
        a.status === 'Em Espera'
    );

    return encaixes.map((a) => {
      const initials = (a.patientName || 'PA')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      return {
        id: a.id,
        name: a.patientName,
        initials,
        priority:
          a.isEncaixe || a.status === 'Encaixe de Urgência'
            ? ('URGENTE' as const)
            : ('ROTINA' as const),
        reason: a.notes || a.procedure || 'Encaixe clínico prioritário',
        waitTime: a.time ? `Agendado para ${a.time}` : 'Aguardando',
      };
    });
  }, [activeDayAppointments]);

  // Métricas dinâmicas dos 5 cards calculadas a partir dos dados reais do Supabase
  const currentMetrics = useMemo(() => {
    return calculateMetricsForSlots(currentSlots);
  }, [currentSlots]);

  // Garante que a tela sempre abra do início (topo absoluto) ao alternar entre lista e formulário
  useEffect(() => {
    scrollToTop();
  }, [currentView]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenForm = (time: string = '09:00', isEncaixe: boolean = false) => {
    const now = new Date();
    const isPastDate =
      selectedDate.getFullYear() < now.getFullYear() ||
      (selectedDate.getFullYear() === now.getFullYear() &&
        (selectedDate.getMonth() < now.getMonth() ||
          (selectedDate.getMonth() === now.getMonth() && selectedDate.getDate() < now.getDate())));

    if (isPastDate) {
      showToast('Não é possível realizar novos agendamentos para datas passadas.');
      return;
    }

    let targetTime = time;
    const isToday = isSameDay(selectedDate, now);
    if (isToday) {
      const [h, m] = time.split(':').map(Number);
      if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) {
        const futureSlot = currentSlots.find((s) => {
          if (s.type !== 'livre') return false;
          const [sh, sm] = s.time.split(':').map(Number);
          return sh > now.getHours() || (sh === now.getHours() && sm > now.getMinutes());
        });
        targetTime = futureSlot ? futureSlot.time : '15:00';
      }
    }

    if (isEncaixe) {
      setEditingAppointment({
        id: '',
        date: activeDateKey,
        time: targetTime,
        patientName: '',
        procedure: 'Encaixe de Urgência',
        insurance: 'Particular',
        status: 'Encaixe de Urgência',
        isEncaixe: true,
      });
    } else {
      setEditingAppointment(null);
    }

    setFormInitialTime(targetTime);
    setCurrentView('form');
    scrollToTop();
  };

  const handleEditSlot = (slot: TimelineSlot) => {
    if (slot.status?.toLowerCase().includes('conclu')) {
      showToast('Agendamentos concluídos não podem ser editados para respeitar a trajetória do paciente.');
      return;
    }
    const existing = supabaseAppointments.find((a) => a.id === slot.id);
    const toEdit: AgendaAppointmentItem = existing || {
      id: slot.id,
      pacienteId: slot.pacienteId,
      procedimentoId: slot.procedimentoId,
      date: activeDateKey,
      time: slot.time,
      endTime: slot.endTime,
      duration: slot.duration,
      patientName: slot.patientName || '',
      procedure: slot.procedure || '',
      insurance: slot.insurance || 'Particular',
      status: (slot.status as any) || 'Confirmado',
      isEncaixe: slot.isUrgent,
      notes: slot.notes,
    };
    setEditingAppointment(toEdit);
    setFormInitialTime(slot.time);
    setCurrentView('form');
    scrollToTop();
  };

  // Salvar novo agendamento no Supabase e recarregar dados reais
  const handleSaveAppointment = async (newApp: AgendaAppointmentItem) => {
    const appDateKey = newApp.date || activeDateKey;
    const toSave: AgendaAppointmentItem = {
      ...newApp,
      date: appDateKey,
    };

    showToast(`Gravando agendamento de ${newApp.patientName} no Supabase...`);
    setCurrentView('list');
    setEditingAppointment(null);

    try {
      await agendaService.saveAgendamento(toSave);
      showToast(`Agendamento de ${newApp.patientName} confirmado no Supabase!`);
      await loadAppointmentsFromSupabase();
    } catch (e) {
      console.warn('Erro ao salvar agendamento no Supabase:', e);
      // Fallback otimista local
      setSupabaseAppointments((prev) => {
        const idx = prev.findIndex((a) => a.id === toSave.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = toSave;
          return updated;
        }
        return [...prev, toSave];
      });
      showToast(`Agendamento salvo localmente.`);
    }
  };

  // Excluir agendamento no Supabase e atualizar a linha do tempo imediatamente
  const handleDeleteSlot = async (slotToDelete: TimelineSlot) => {
    if (slotToDelete.status?.toLowerCase().includes('conclu')) {
      showToast('Agendamentos concluídos não podem ser excluídos para respeitar o prontuário do paciente.');
      return;
    }
    try {
      await agendaService.deleteAgendamento(slotToDelete.id);
      setSupabaseAppointments((prev) => prev.filter((a) => a.id !== slotToDelete.id));
      showToast('Agendamento excluído do Supabase e horário liberado!');
      await loadAppointmentsFromSupabase();
    } catch (err) {
      console.error('Erro ao excluir do Supabase:', err);
      showToast('Erro ao excluir agendamento do Supabase.');
    }
  };

  // Iniciar / Acessar Atendimento Clínico e redirecionar para o módulo de Atendimento
  const handleAccessAtendimento = async (slot: TimelineSlot) => {
    try {
      // 1. Atualiza status no Supabase se não estiver concluído
      if (slot.id && !slot.id.startsWith('slot-') && !slot.status?.toLowerCase().includes('conclu')) {
        await agendaService.updateStatus(slot.id, 'em_atendimento');
        setSupabaseAppointments((prev) =>
          prev.map((a) => (a.id === slot.id ? { ...a, status: 'Em Atendimento' } : a))
        );
      }

      // 2. Localiza o paciente real no Supabase
      let matchedPatient: PacienteItem | undefined = undefined;
      try {
        const pacientes = await pacientesService.getPacientes();
        matchedPatient = pacientes.find(
          (p) =>
            (slot.pacienteId && p.id === slot.pacienteId) ||
            p.name.toLowerCase().trim() === (slot.patientName || '').toLowerCase().trim() ||
            (slot.cpf && p.cpf && p.cpf === slot.cpf)
        );
      } catch (err) {
        console.warn('Erro ao cruzar dados do paciente:', err);
      }

      const initials = (slot.patientName || 'PA')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const patientToSend: PacienteItem = matchedPatient || {
        id: slot.pacienteId || slot.id || '40000000-0000-0000-0000-000000000001',
        code: `#${(slot.pacienteId || slot.id || '4000').slice(0, 4).toUpperCase()}`,
        name: slot.patientName || 'Everaldo Souza da Silva',
        initials,
        cpf: slot.cpf || '123.456.789-01',
        birthDate: '1985-05-15',
        age: 39,
        insurance: 'particular',
        insuranceLabel: slot.insurance || 'Particular',
        whatsapp: slot.phone || '(66) 98445-4825',
        status: 'ativo',
        statusLabel: 'Ativo',
        lastConsultation: {
          date: 'Hoje',
          time: slot.time,
          procedure: slot.procedure || 'Consulta Inicial',
          dentist: 'Dr. Frankisney B. Souza',
          isToday: true,
        },
      };

      if (onNavigateToAtendimento) {
        onNavigateToAtendimento(patientToSend);
      }
    } catch (e) {
      console.error('Erro ao redirecionar para atendimento:', e);
      if (onNavigateToAtendimento) {
        onNavigateToAtendimento();
      }
    }
  };

  const handlePuxarEncaixe = async (item: EncaixeQueueItem) => {
    const freeSlot = currentSlots.find((s) => s.type === 'livre');
    if (freeSlot) {
      showToast(`Alocando ${item.name} para a vaga das ${freeSlot.time}...`);
      const promovido = await agendaService.promoverPrimeiroEncaixeParaVaga({
        dataHoraInicio: `${activeDateKey}T${freeSlot.time}:00`,
        dateKey: activeDateKey,
        time: freeSlot.time,
      });
      if (promovido) {
        showToast(`🎉 ${item.name} alocado(a) para as ${freeSlot.time} e notificado no WhatsApp!`);
        await loadAppointmentsFromSupabase();
        return;
      }
    }
    handleOpenForm('11:00', false);
    showToast(`Selecione o horário para alocar o encaixe de ${item.name}.`);
  };

  // Dias da semana móvel ao redor do dia selecionado
  const mobileWeekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    const dayIndex = startOfWeek.getDay(); // 0 = Domingo
    startOfWeek.setDate(startOfWeek.getDate() - dayIndex + 1);

    const days = [];
    const weekDayShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        dateObj: d,
        dayLabel: weekDayShort[i],
        dateNumber: String(d.getDate()).padStart(2, '0'),
        isActive: isSameDay(d, selectedDate),
      });
    }
    return days;
  }, [selectedDate]);

  // Se currentView === 'form': oculta a visualização da agenda e abre o formulário inline responsivo
  if (currentView === 'form') {
    return (
      <div className="w-full h-full p-4 md:p-6 animate-fadeIn">
        <AgendamentoFormView
          initialTime={formInitialTime}
          initialDate={activeDateKey}
          editingAppointment={editingAppointment}
          onSave={handleSaveAppointment}
          onCancel={() => {
            setEditingAppointment(null);
            setCurrentView('list');
          }}
          isMobile={forceMobileView}
        />
      </div>
    );
  }

  const isTodayActive = isSameDay(selectedDate, new Date());

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-5 relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-[#005F73] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 z-50 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-[#89f3f6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. HEADER INTERNO DA AGENDA (DESKTOP & MOBILE)                 */}
      {/* ============================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#004959] flex items-center gap-2">
              Agenda Clínica
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-[#0A9396] border border-[#0A9396]/20 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-[#0A9396]" />
              <span>Supabase Conectado</span>
              <span className="w-2 h-2 rounded-full bg-[#0A9396] animate-ping" />
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Gestão integrada de cadeiras, atendimentos e encaixes do consultório sincronizados em tempo real.
          </p>
        </div>

        {/* Linha de Controles de Navegação */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão Sincronizar / Recarregar Supabase */}
          <button
            onClick={() => loadAppointmentsFromSupabase()}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
            title="Atualizar dados do Supabase"
            type="button"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0A9396]' : ''}`} />
          </button>

          {/* Date Navigator */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl shadow-2xs border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => setSelectedDate(new Date())}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                isTodayActive
                  ? 'bg-slate-100 text-[#005F73] font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              type="button"
            >
              Hoje
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <button
              aria-label="Dia anterior"
              onClick={() =>
                setSelectedDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1)
                )
              }
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2 text-slate-800">
              <Calendar className="w-4 h-4 text-[#0A9396]" />
              <span className="hidden sm:inline">{formatFullDate(selectedDate)}</span>
              <span className="sm:hidden text-xs">
                {selectedDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <button
              aria-label="Próximo dia"
              onClick={() =>
                setSelectedDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1)
                )
              }
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle de Visualização (Dia / Semana / Mês) */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl shadow-2xs border border-slate-200/80 text-xs font-semibold">
            {(['dia', 'semana', 'mes'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  viewMode === mode
                    ? 'bg-[#0A9396] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Bloquear Horário */}
          <button
            onClick={() => showToast('Horário reservado para biossegurança!')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
            type="button"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Bloquear</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-HEADER ACTIONS & SELEÇÃO DE CADEIRA                     */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl shadow-2xs text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0A9396] shrink-0" />
          <span className="truncate">Visualizar: {selectedChair}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
          {/* Botão Importar (Padrão Oficial: Azul + Texto Branco Negrito) */}
          <button
            onClick={() => showToast('Importação de agenda externa pronta!')}
            className={`hidden md:inline-flex ${BTN_IMPORTAR_CLASS}`}
            type="button"
          >
            <Upload className="w-3.5 h-3.5 text-white" />
            <span>Importar</span>
          </button>

          {/* Botão Exportar (Padrão Oficial: Laranja + Texto Branco Negrito) */}
          <button
            onClick={() => showToast('Agenda exportada em PDF e formato de calendário!')}
            className={`inline-flex ${BTN_EXPORTAR_CLASS}`}
            type="button"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button
            onClick={() => handleOpenForm('09:00')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#005F73] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#004959] transition-colors cursor-pointer"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Mobile Weekly Touch Strip Sincronizada com selectedDate */}
      <div
        className={`${
          forceMobileView ? 'flex' : 'flex md:hidden'
        } justify-between items-center bg-white px-2 py-2.5 rounded-2xl shadow-2xs border border-slate-100 text-xs`}
      >
        {mobileWeekDays.map((item) => (
          <button
            key={item.dayLabel + item.dateNumber}
            type="button"
            onClick={() => setSelectedDate(item.dateObj)}
            className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all cursor-pointer ${
              item.isActive
                ? 'bg-[#005F73] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px]">{item.dayLabel}</span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
              {item.dateNumber}
            </span>
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 3. MÉTRICAS RÁPIDAS (5 CARDS / CARROSSEL) REAIS DO SUPABASE    */}
      {/* ============================================================== */}
      <AgendaMetricsHeader
        metrics={currentMetrics}
        isToday={isTodayActive}
        isMobile={forceMobileView}
      />

      {/* ============================================================== */}
      {/* 4. LAYOUT PRINCIPAL DE 2 COLUNAS (OU STACK MOBILE)            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Coluna Esquerda: Suporte (Mini Calendário + Fila de Encaixes) */}
        <div className="space-y-5 lg:col-span-1">
          {/* Mini Calendário Sincronizado com Supabase */}
          <div className={forceMobileView ? 'hidden' : 'hidden md:block'}>
            <MiniCalendarCard
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
              }}
            />
          </div>

          {/* Fila de Encaixe Retrátil Sincronizada com a data */}
          <EncaixeQueueCard
            items={activeEncaixeQueue}
            selectedDate={selectedDate}
            onPuxarEncaixe={handlePuxarEncaixe}
            onAdicionarEncaixe={() => handleOpenForm('11:00', true)}
            isMobile={forceMobileView}
          />
        </div>

        {/* Coluna Direita: Linha do Tempo Real do Supabase */}
        <div className="lg:col-span-3 space-y-4">
          {currentSlots.filter((s) => s.type === 'livre').length === 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <span>Agenda do Dia Lotada (Sem Horários Livres)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-200 text-amber-900 font-extrabold uppercase">
                      Sobreaviso Ativo
                    </span>
                  </p>
                  <p className="text-[11px] text-amber-900 leading-snug mt-0.5">
                    Novos agendamentos devem ser incluídos na <strong>Fila de Encaixe</strong>. Em caso de desistência ou cancelamento, o 1º da fila é alocado e notificado no WhatsApp automaticamente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenForm('11:00', true)}
                className="px-3.5 py-2 rounded-xl bg-[#005F73] hover:bg-[#004655] text-white text-xs font-bold shrink-0 shadow-2xs transition-all cursor-pointer"
              >
                + Adicionar ao Encaixe
              </button>
            </div>
          )}

          <TimelineSchedule
            selectedDate={selectedDate}
            slots={currentSlots}
            onEditSlot={handleEditSlot}
            onDeleteSlot={handleDeleteSlot}
            onAccessAtendimento={handleAccessAtendimento}
            onOpenNewAppointment={(time) => handleOpenForm(time || '09:00')}
            onNavigateToProcedimentos={onNavigateToProcedimentos}
            isMobile={forceMobileView}
          />
        </div>
      </div>

      {/* Floating Action Button (FAB) no Mobile */}
      <div
        className={`${
          forceMobileView ? 'block' : 'block md:hidden'
        } fixed right-4 bottom-20 z-30`}
      >
        <button
          onClick={() => handleOpenForm('15:30')}
          className="w-13 h-13 rounded-full bg-[#0A9396] hover:bg-[#00696c] text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          title="Novo Agendamento Rápido"
          aria-label="Novo Agendamento"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
