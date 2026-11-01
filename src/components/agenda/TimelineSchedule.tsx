import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Timer,
  Zap,
  ArrowRight,
  User,
  Eye,
  Pencil,
  Trash2,
  X,
  FileText,
  Calendar,
  Stethoscope,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { agendaService } from '../../services/agendaService';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { templateService } from '../../services/templateService';

export interface TimelineSlot {
  id: string;
  pacienteId?: string;
  procedimentoId?: string;
  type: 'agendado' | 'livre' | 'intervalo' | 'sobra_encaixe';
  time: string;
  endTime?: string;
  duration: string;
  patientName?: string;
  phone?: string;
  cpf?: string;
  procedure?: string;
  insurance?: string;
  status?: string;
  notes?: string;
  isEarlyFinish?: boolean;
  earlyFinishText?: string;
  chairFreedMinutes?: number;
  isDemand?: boolean;
  isCurrentSession?: boolean;
  isUrgent?: boolean;
  isSurgery?: boolean;
  actionButtonLabel?: string;
  statusLabelRight?: string;
}

const INITIAL_SLOTS: TimelineSlot[] = [
  {
    id: 'slot-0815',
    type: 'agendado',
    time: '08:15',
    endTime: '08:45',
    duration: '30 min',
    patientName: 'Beatriz Lima Souza',
    phone: '(24) 98765-4321',
    cpf: '321.654.987-00',
    procedure: 'Profilaxia e polimento coronário realizado antes da abertura regular.',
    insurance: 'Particular',
    status: 'Concluído (08:15 - 08:45)',
    isDemand: true,
    statusLabelRight: '08:15 às 08:45',
    notes: 'Profilaxia dental completa e aplicação de flúor pré-agendada sob demanda.',
  },
  {
    id: 'slot-0900',
    type: 'agendado',
    time: '09:00',
    endTime: '09:45',
    duration: 'Real 25 min',
    patientName: 'Ricardo Mendes Silveira',
    phone: '(24) 99123-4567',
    cpf: '456.789.123-44',
    procedure: 'Tratamento Endodôntico (Canal #16)',
    insurance: 'BRADESCO DENTAL',
    status: 'Finalizado às 09:25',
    isEarlyFinish: true,
    earlyFinishText: 'Previsto 45 min | Realizado 25 min',
    chairFreedMinutes: 20,
    statusLabelRight: 'Finalizado às 09:25',
    notes: 'Tratamento de canal finalizado antes do tempo previsto. Cadeira higienizada.',
  },
  {
    id: 'slot-0925',
    type: 'sobra_encaixe',
    time: '09:25',
    endTime: '09:45',
    duration: '20 min',
    notes: 'Tempo livre gerado pelo término antecipado (09:25 às 09:45).',
  },
  {
    id: 'slot-0945',
    type: 'agendado',
    time: '09:45',
    endTime: '10:30',
    duration: '45 min',
    patientName: 'Carlos Eduardo Neves',
    phone: '(24) 98111-2233',
    cpf: '789.123.456-88',
    procedure: 'Restauração Resina Estética #26',
    insurance: 'BRADESCO DENTAL',
    status: 'Em Atendimento (09:45 - 10:30)',
    isCurrentSession: true,
    actionButtonLabel: 'Acessar Atendimento',
    notes: 'Restauração em resina composta estética no elemento dental #26.',
  },
  {
    id: 'slot-1030',
    type: 'agendado',
    time: '10:30',
    endTime: '11:15',
    duration: '45 min',
    patientName: 'Mariana Alcantara Costa',
    phone: '(24) 97222-3344',
    cpf: '234.567.890-11',
    procedure: 'Avaliação de Dor Aguda • Dente #26',
    insurance: 'UNIMED ODONTO',
    status: 'Encaixe de Urgência',
    isUrgent: true,
    actionButtonLabel: 'Chamar p/ Cadeira',
    notes: 'Paciente atendida em caráter de urgência com dor aguda no dente #26.',
  },
  {
    id: 'slot-1115',
    type: 'agendado',
    time: '11:15',
    endTime: '12:00',
    duration: '45 min',
    patientName: 'Juliana Fontes Castro',
    phone: '(24) 99333-4455',
    cpf: '567.890.123-99',
    procedure: 'Clareamento Dental Laser',
    insurance: 'PARTICULAR',
    status: 'Confirmado',
    statusLabelRight: 'Aguardando Horário',
    notes: 'Segunda sessão de clareamento dental de consultório a laser.',
  },
  {
    id: 'slot-1200',
    type: 'intervalo',
    time: '12:00',
    endTime: '13:30',
    duration: '90 min',
    notes: 'Higienização da clínica e ciclo de autoclave (12:00 às 13:30).',
  },
  {
    id: 'slot-1330',
    type: 'agendado',
    time: '13:30',
    endTime: '14:15',
    duration: '45 min',
    patientName: 'Roberto Alencar Silveira',
    phone: '(24) 98444-5566',
    cpf: '678.901.234-55',
    procedure: 'Instalação de Prótese Sobre Implante',
    insurance: 'BRADESCO DENTAL',
    status: 'Confirmado',
    statusLabelRight: 'Aguardando Horário',
    notes: 'Instalação da coroa definitiva de zircônia sobre implante.',
  },
  {
    id: 'slot-1415',
    type: 'agendado',
    time: '14:15',
    endTime: '15:00',
    duration: '45 min',
    patientName: 'Eduardo Prado',
    phone: '(24) 97555-6677',
    cpf: '890.123.456-77',
    procedure: 'Exodontia Dente Incluso 3º Molar #38',
    insurance: 'BRADESCO DENTAL',
    status: 'Cirurgia',
    isSurgery: true,
    actionButtonLabel: 'Ficha Pré-Op',
    notes: 'Cirurgia de terceiro molar inferior incluso. Anamnese cirúrgica preenchida.',
  },
  {
    id: 'slot-1500',
    type: 'livre',
    time: '15:00',
    endTime: '15:45',
    duration: '45 min',
    notes: 'Horário Disponível para Atendimento (15:00 às 15:45)',
  },
  {
    id: 'slot-1545',
    type: 'livre',
    time: '15:45',
    endTime: '16:30',
    duration: '45 min',
    notes: 'Horário Disponível para Atendimento (15:45 às 16:30)',
  },
  {
    id: 'slot-1630',
    type: 'livre',
    time: '16:30',
    endTime: '17:15',
    duration: '45 min',
    notes: 'Horário Disponível para Atendimento (16:30 às 17:15)',
  },
  {
    id: 'slot-1715',
    type: 'livre',
    time: '17:15',
    endTime: '18:00',
    duration: '45 min',
    notes: 'Horário Disponível para Atendimento (17:15 às 18:00)',
  },
  {
    id: 'slot-1800',
    type: 'livre',
    time: '18:00',
    endTime: '18:45',
    duration: '45 min',
    notes: 'Turno Noturno Disponível (18:00 às 18:45)',
  },
  {
    id: 'slot-1845',
    type: 'livre',
    time: '18:45',
    endTime: '19:30',
    duration: '45 min',
    notes: 'Turno Noturno Disponível (18:45 às 19:30)',
  },
  {
    id: 'slot-1930',
    type: 'livre',
    time: '19:30',
    endTime: '20:15',
    duration: '45 min',
    notes: 'Turno Noturno Disponível (19:30 às 20:15)',
  },
  {
    id: 'slot-2015',
    type: 'livre',
    time: '20:15',
    endTime: '21:00',
    duration: '45 min',
    notes: 'Turno Noturno Disponível (20:15 às 21:00)',
  },
  {
    id: 'slot-2100',
    type: 'livre',
    time: '21:00',
    endTime: '21:45',
    duration: '45 min',
    notes: 'Atendimento Estendido (21:00 às 21:45)',
  },
  {
    id: 'slot-2145',
    type: 'livre',
    time: '21:45',
    endTime: '22:30',
    duration: '45 min',
    notes: 'Atendimento Estendido (21:45 às 22:30)',
  },
  {
    id: 'slot-2230',
    type: 'livre',
    time: '22:30',
    endTime: '23:15',
    duration: '45 min',
    notes: 'Plantão Noturno (22:30 às 23:15)',
  },
  {
    id: 'slot-2315',
    type: 'livre',
    time: '23:15',
    endTime: '00:00',
    duration: '45 min',
    notes: 'Plantão Noturno até Meia-Noite (23:15 às 00:00)',
  },
];

interface TimelineScheduleProps {
  selectedDate?: Date;
  slots?: TimelineSlot[];
  onEditSlot?: (slot: TimelineSlot) => void;
  onDeleteSlot?: (slot: TimelineSlot) => void;
  onAccessAtendimento?: (slot: TimelineSlot) => void;
  onOpenNewAppointment?: (time?: string) => void;
  onNavigateToProcedimentos?: () => void;
  isMobile?: boolean;
}

export const TimelineSchedule: React.FC<TimelineScheduleProps> = ({
  selectedDate,
  slots: propSlots,
  onEditSlot,
  onDeleteSlot,
  onAccessAtendimento,
  onOpenNewAppointment,
  onNavigateToProcedimentos,
  isMobile = false,
}) => {
  const toast = useToast();
  const [localSlots, setLocalSlots] = useState<TimelineSlot[]>(INITIAL_SLOTS);
  const slots = propSlots ?? localSlots;
  const [viewModalSlot, setViewModalSlot] = useState<TimelineSlot | null>(null);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<TimelineSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);

  const handleSendWhatsAppNotification = async (slot: TimelineSlot) => {
    if (!slot.phone) {
      toast.warning('Telefone ausente', 'O paciente não possui número de telefone/WhatsApp cadastrado.');
      return;
    }

    const tpls = templateService.getTemplates();
    const reminderTpl =
      tpls.find((t) => t.category === 'agendamentos' && t.active) || tpls[0];
    if (!reminderTpl) {
      toast.warning('Template indisponível', 'Nenhum template ativo de agendamento encontrado.');
      return;
    }

    setIsSendingWhatsApp(true);
    try {
      const dateStr = selectedDate
        ? selectedDate.toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');

      const res = await templateService.dispatchTemplateMessage(reminderTpl, {
        name: slot.patientName || 'Paciente',
        phone: slot.phone,
        dentist: 'Dr. Frankisney Souza',
        date: dateStr,
        time: slot.time,
        procedure: slot.procedure || 'Consulta Odontológica',
      });

      if (res.success) {
        toast.success(
          'WhatsApp Enviado!',
          `Lembrete "${reminderTpl.name}" enviado com sucesso para ${slot.patientName} (${slot.phone})!`
        );
      } else {
        toast.error('Falha no envio WhatsApp', res.message);
      }
    } catch (e: any) {
      toast.error('Erro de envio', e?.message || 'Falha ao conectar com o serviço de WhatsApp.');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const isPastSlot = (slotTime: string, targetDate?: Date): boolean => {
    const now = new Date();
    const d = targetDate || now;

    // Comparação do dia do calendário
    const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetZero = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    if (targetZero < nowZero) return true;
    if (targetZero > nowZero) return false;

    // Mesmo dia (hoje): compara horário com a hora atual do computador
    const [sh, sm] = slotTime.split(':').map(Number);
    if (isNaN(sh)) return false;
    const currentH = now.getHours();
    const currentM = now.getMinutes();

    return sh < currentH || (sh === currentH && sm <= currentM);
  };

  // Ação Iniciar / Acessar Atendimento Clínico
  const handleStartAttendance = (item: TimelineSlot) => {
    toast.info(
      'Iniciando Atendimento',
      `Abrindo o atendimento de ${item.patientName || 'paciente'} no menu Atendimento...`
    );
    if (onAccessAtendimento) {
      onAccessAtendimento(item);
    }
  };

  // Formatação amigável do dia selecionado
  const formattedDateTitle = selectedDate
    ? (() => {
        const s = selectedDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        return s.charAt(0).toUpperCase() + s.slice(1);
      })()
    : 'Padrão Odonto Souza';

  // Ação Ver: Abre modal com os dados do paciente e o procedimento
  const handleView = (item: TimelineSlot) => {
    setViewModalSlot(item);
  };

  // Ação Editar: Abre a edição do agendamento clínico (ou procedimentos)
  const handleEdit = (item: TimelineSlot) => {
    if (onEditSlot) {
      onEditSlot(item);
      return;
    }
    toast.info(
      'Procedimentos Clínicos',
      `Abrindo tela de procedimentos para consulta e edição de "${item.procedure || 'procedimento'}"...`
    );
    if (onNavigateToProcedimentos) {
      onNavigateToProcedimentos();
    }
  };

  // Ação Excluir: Abre o modal estilizado padronizado de confirmação de exclusão
  const handleRequestDelete = (item: TimelineSlot) => {
    setDeleteConfirmSlot(item);
  };

  // Confirmação da Exclusão: Apaga da agenda no frontend e no backend e libera o espaço para um novo agendamento
  const handleConfirmDelete = async () => {
    if (!deleteConfirmSlot) return;
    const item = deleteConfirmSlot;
    setIsDeleting(true);

    try {
      // 1. Apaga do backend (Supabase)
      await agendaService.deleteAgendamento(item.id);

      // 2. Apaga da agenda no frontend e libera o espaço imediatamente
      if (onDeleteSlot) {
        onDeleteSlot(item);
      } else {
        setLocalSlots((prev) =>
          prev.map((slot) => {
            if (slot.id === item.id) {
              return {
                id: `livre-${item.time}-${Date.now()}`,
                type: 'livre',
                time: item.time,
                endTime: item.endTime || '12:00',
                duration: item.duration || '45 min',
                notes: `Horário Disponível para Atendimento (${item.time} às ${item.endTime || '...'}). Espaço liberado para novo agendamento.`,
              };
            }
            return slot;
          })
        );
      }

      toast.success(
        'Horário Liberado com Sucesso',
        `O agendamento de ${item.patientName} foi removido e o horário das ${item.time} está liberado para nova consulta.`
      );

      if (viewModalSlot?.id === item.id) {
        setViewModalSlot(null);
      }
      setDeleteConfirmSlot(null);
    } catch (err) {
      toast.error('Erro na Exclusão', 'Não foi possível excluir o agendamento no momento.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ================================================================ */}
      {/* 1. HEADER DA AGENDA INTELIGENTE COM OTIMIZAÇÃO DE CADEIRA        */}
      {/* ================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5 text-[#005F73]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Agenda Clínica • {formattedDateTitle}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500">
              Início às 09:00 (consultas de 45 min) • Dr. Frankisney Souza (Cadeira 01)
            </p>
          </div>
        </div>

        {/* Resumo Rápido no Topo: Tempo Otimizado */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-extrabold tracking-tight">
              Tempo Otimizado Hoje: 45 min recuperados
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. TIMELINE VERTICAL DIÁRIA                                      */}
      {/* ================================================================ */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs space-y-3.5">
        {slots.map((item) => {
          const isPast = isPastSlot(item.time, selectedDate);

          // --------------------------------------------------------------
          // BLOCO DISPONÍVEL (LIBERADO PARA NOVO AGENDAMENTO)
          // --------------------------------------------------------------
          if (item.type === 'livre') {
            return (
              <div
                key={item.id}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border-2 border-dashed ${
                  isPast
                    ? 'border-slate-300 bg-slate-100/60 opacity-60'
                    : 'border-slate-300/80 bg-slate-50/50 hover:bg-slate-50'
                } transition-colors animate-fadeIn`}
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="text-left md:text-center w-16 shrink-0">
                    <span className={`text-sm font-extrabold ${isPast ? 'text-slate-400 line-through' : 'text-slate-500'} block`}>
                      {item.time}
                    </span>
                    <span className={`text-[11px] font-bold ${isPast ? 'text-slate-400' : 'text-[#005F73]'} block`}>
                      {isPast ? 'Passado' : 'Livre'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className={`text-sm font-semibold ${isPast ? 'text-slate-500' : 'text-slate-600'}`}>
                      {isPast
                        ? `Horário Encerrado (${item.time} às ${item.endTime || '...'}). Não disponível para agendamento retroativo.`
                        : (item.notes || `Horário Disponível para Atendimento (${item.time} às ${item.endTime || '...'}).`)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {isPast ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-400 bg-slate-200/80 rounded-lg border border-slate-300 cursor-not-allowed flex items-center gap-1.5"
                      type="button"
                      title="Horário já transcorrido. Não é permitido agendamento retroativo."
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Horário Encerrado</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenNewAppointment && onOpenNewAppointment(item.time)}
                      className="px-4 py-1.5 text-xs font-bold text-[#005F73] hover:text-white bg-white hover:bg-[#005F73] rounded-lg border border-[#005F73]/40 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      type="button"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Agendar Consulta</span>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // --------------------------------------------------------------
          // BLOCO INTERVALO / ALMOÇO
          // --------------------------------------------------------------
          if (item.type === 'intervalo') {
            return (
              <div
                key={item.id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border-l-4 border-l-slate-400 bg-slate-100/70 border border-slate-200"
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="text-left md:text-center w-16 shrink-0">
                    <span className="text-sm font-bold text-slate-600 block">{item.time}</span>
                    <span className="text-[11px] font-bold text-slate-400 block">{item.duration}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 block">
                      Intervalo de Almoço &amp; Esterilização Geral
                    </span>
                    <p className="text-[11px] text-slate-500">{item.notes}</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-end md:self-auto">
                  Almoço
                </span>
              </div>
            );
          }

          // --------------------------------------------------------------
          // BLOCO SOBRA DE ENCAIXE INTELIGENTE
          // --------------------------------------------------------------
          if (item.type === 'sobra_encaixe') {
            if (isPast) {
              return (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-100/50 opacity-60"
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div className="text-left md:text-center w-16 shrink-0">
                      <span className="text-sm font-bold text-slate-400 line-through block">{item.time}</span>
                      <span className="text-[11px] font-bold text-slate-400 block">{item.duration}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-500">Encaixe Encerrado ({item.time})</span>
                      <p className="text-xs text-slate-400">Tempo de encaixe já expirado para o momento atual.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-200 px-3 py-1 rounded-lg">Expirado</span>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-50/80 transition-all shadow-xs"
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="text-left md:text-center w-16 shrink-0">
                    <span className="text-sm font-black text-emerald-900 block">{item.time}</span>
                    <span className="text-[11px] font-extrabold text-emerald-700 block">{item.duration}</span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        Oportunidade de Encaixe Inteligente
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 uppercase tracking-tight">
                        Vácuo Recuperado
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-medium">{item.notes}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => onOpenNewAppointment && onOpenNewAppointment(item.time)}
                    className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Adicionar Encaixe (20 min livres)</span>
                  </button>
                </div>
              </div>
            );
          }

          // --------------------------------------------------------------
          // BLOCO DE AGENDAMENTO REGULAR (PACIENTE NA CADEIRA / FILA)
          // --------------------------------------------------------------
          const st = (item.status || '').toLowerCase();

          // Define tema visual com cor de fundo integral de acordo com o status
          let theme = {
            cardClass:
              'bg-teal-100/60 hover:bg-teal-100/80 border-2 border-teal-300 shadow-sm',
            timeClass: 'text-[#005F73] font-black',
            durationClass: 'text-[#0A9396] font-extrabold',
            nameClass: 'text-slate-950 font-black',
            procedureClass: 'text-[#004655] font-bold',
            detailsClass: 'text-[#005F73] font-bold',
            badgeClass:
              'bg-[#005F73] text-white font-black border border-[#004756] shadow-2xs',
            badgeText: item.status || 'Confirmado',
            bulletColor: 'text-[#0A9396]',
          };

          if (item.isCurrentSession || st.includes('atendimento')) {
            theme = {
              cardClass:
                'bg-[#86f0f3]/25 hover:bg-[#86f0f3]/35 border-2 border-[#0A9396] shadow-sm relative overflow-hidden',
              timeClass: 'text-[#004f51] font-black',
              durationClass: 'text-[#004f51] font-extrabold',
              nameClass: 'text-slate-950 font-black',
              procedureClass: 'text-[#004f51] font-bold',
              detailsClass: 'text-[#005F73] font-bold',
              badgeClass:
                'bg-[#0A9396] text-white font-black border border-[#004f51]/30 shadow-2xs',
              badgeText: item.status || 'Em Atendimento',
              bulletColor: 'text-[#0A9396]',
            };
          } else if (
            item.isUrgent ||
            st.includes('urgência') ||
            st.includes('urgencia') ||
            st.includes('encaixe')
          ) {
            theme = {
              cardClass:
                'bg-amber-100/70 hover:bg-amber-100/90 border-2 border-amber-400 shadow-sm',
              timeClass: 'text-amber-950 font-black',
              durationClass: 'text-amber-800 font-extrabold',
              nameClass: 'text-slate-950 font-black',
              procedureClass: 'text-amber-950 font-bold',
              detailsClass: 'text-amber-900 font-bold',
              badgeClass:
                'bg-amber-500 text-white font-black border border-amber-600 shadow-2xs',
              badgeText: 'Encaixe de Urgência',
              bulletColor: 'text-amber-500',
            };
          } else if (item.isSurgery || st.includes('cirurgia')) {
            theme = {
              cardClass:
                'bg-rose-100/60 hover:bg-rose-100/80 border-2 border-rose-300 shadow-sm',
              timeClass: 'text-rose-950 font-black',
              durationClass: 'text-rose-800 font-extrabold',
              nameClass: 'text-slate-950 font-black',
              procedureClass: 'text-rose-950 font-bold',
              detailsClass: 'text-rose-900 font-bold',
              badgeClass:
                'bg-rose-600 text-white font-black border border-rose-700 shadow-2xs',
              badgeText: 'Cirurgia',
              bulletColor: 'text-rose-400',
            };
          } else if (st.includes('conclu') || st.includes('finaliz') || item.isEarlyFinish) {
            theme = {
              cardClass:
                'bg-[#2BFF05]/15 hover:bg-[#2BFF05]/25 border-2 border-[#2BFF05] shadow-sm',
              timeClass: 'text-slate-900 font-black',
              durationClass: 'text-slate-800 font-extrabold',
              nameClass: 'text-slate-950 font-black',
              procedureClass: 'text-slate-900 font-bold',
              detailsClass: 'text-slate-800 font-bold',
              badgeClass:
                'bg-[#2BFF05] text-slate-950 font-black border border-emerald-600 shadow-2xs',
              badgeText: item.isEarlyFinish
                ? (item.earlyFinishText || 'Finalizado Antecipado')
                : (item.status || 'Concluído'),
              bulletColor: 'text-[#2BFF05]',
            };
          } else if (st.includes('cancel') || st.includes('desmarc') || st.includes('falta')) {
            theme = {
              cardClass:
                'bg-slate-200/70 hover:bg-slate-200/90 border-2 border-slate-300 opacity-80',
              timeClass: 'text-slate-700 font-black',
              durationClass: 'text-slate-600 font-bold',
              nameClass: 'text-slate-700 font-bold line-through',
              procedureClass: 'text-slate-600 font-bold',
              detailsClass: 'text-slate-600 font-bold',
              badgeClass:
                'bg-slate-500 text-white font-black border border-slate-600 shadow-2xs',
              badgeText: item.status || 'Desmarcou',
              bulletColor: 'text-slate-400',
            };
          } else if (st.includes('espera') || st.includes('aguard')) {
            theme = {
              cardClass:
                'bg-sky-100/60 hover:bg-sky-100/80 border-2 border-sky-300 shadow-sm',
              timeClass: 'text-sky-950 font-black',
              durationClass: 'text-sky-800 font-extrabold',
              nameClass: 'text-slate-950 font-black',
              procedureClass: 'text-sky-950 font-bold',
              detailsClass: 'text-sky-900 font-bold',
              badgeClass:
                'bg-sky-600 text-white font-black border border-sky-700 shadow-2xs',
              badgeText: item.status || 'Em Espera',
              bulletColor: 'text-sky-400',
            };
          }

          return (
            <div
              key={item.id}
              className={`group flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl transition-colors ${theme.cardClass}`}
            >
              <div className="flex items-start md:items-center gap-4">
                <div className="text-left md:text-center w-16 shrink-0">
                  <span className={`text-sm block ${theme.timeClass}`}>{item.time}</span>
                  <span className={`text-[11px] block ${theme.durationClass}`}>{item.duration}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm ${theme.nameClass}`}>{item.patientName}</span>

                    {/* Badge do Status Principal com Cor Harmoniosa */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${theme.badgeClass}`}
                    >
                      {item.isUrgent && <Zap className="w-2.5 h-2.5 fill-white" />}
                      {item.isCurrentSession && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                      {item.isEarlyFinish && <CheckCircle2 className="w-3 h-3 text-white" />}
                      <span>{theme.badgeText}</span>
                    </span>

                    {/* Badges Adicionais Contextuais */}
                    {item.isDemand && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        Consulta Antecipada (Sob Demanda)
                      </span>
                    )}

                    {item.isSurgery && !theme.badgeText.includes('Cirurgia') && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900 border border-rose-300">
                        Cirurgia
                      </span>
                    )}
                  </div>

                  <p className="text-xs flex flex-wrap items-center gap-1.5">
                    <span className={theme.procedureClass}>{item.procedure}</span>
                    {item.chairFreedMinutes && (
                      <>
                        <span className={theme.bulletColor}>•</span>
                        <span className="text-emerald-800 font-extrabold">
                          Cadeira liberada {item.chairFreedMinutes} min antes
                        </span>
                      </>
                    )}
                    <span className={theme.bulletColor}>•</span>
                    <span className={theme.detailsClass}>{item.insurance}</span>
                  </p>
                </div>
              </div>

              {/* Área de Ações e Status */}
              <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
                {/* BOTÕES DE AÇÃO PADRONIZADOS DO SISTEMA (INTOCADOS) */}
                <div className="inline-flex items-center gap-1 bg-white/95 px-2 py-1 rounded-xl border border-slate-200/90 shadow-2xs backdrop-blur-xs">
                  {/* Ver: Azul */}
                  <button
                    type="button"
                    onClick={() => handleView(item)}
                    className="p-1.5 rounded-lg text-blue-600 hover:opacity-80 transition-opacity cursor-pointer"
                    title="Ver dados do paciente e procedimento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Editar: Laranja */}
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded-lg text-amber-500 hover:opacity-80 transition-opacity cursor-pointer"
                    title="Editar agendamento"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Excluir: Vermelho */}
                  <button
                    type="button"
                    onClick={() => handleRequestDelete(item)}
                    className="p-1.5 rounded-lg text-rose-600 hover:opacity-80 transition-opacity cursor-pointer"
                    title="Excluir agendamento e liberar horário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* BOTÃO PARA INICIAR / ACESSAR O ATENDIMENTO CLÍNICO DO PACIENTE */}
                {!st.includes('cancel') && !st.includes('desmarc') && !st.includes('falta') && (
                  <button
                    type="button"
                    onClick={() => handleStartAttendance(item)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      item.isCurrentSession || st.includes('atendimento')
                        ? 'bg-[#0A9396] hover:bg-[#00696c] text-white animate-pulse'
                        : st.includes('conclu')
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#005F73] hover:bg-[#004959] text-white'
                    }`}
                    title={`Abrir o atendimento de ${item.patientName || 'paciente'} no menu Atendimento`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>
                      {item.isCurrentSession || st.includes('atendimento')
                        ? 'Acessar Atendimento'
                        : st.includes('conclu')
                        ? 'Ver Prontuário'
                        : 'Iniciar Atendimento'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {item.actionButtonLabel === 'Chamar p/ Cadeira' && !st.includes('atendimento') && (
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        'Paciente Chamado',
                        `Notificação enviada para a recepção: ${item.patientName} chamado para a Cadeira 01.`
                      )
                    }
                    className="px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 shadow-xs transition-colors cursor-pointer"
                  >
                    Chamar p/ Cadeira
                  </button>
                )}

                {item.actionButtonLabel === 'Ficha Pré-Op' && !st.includes('atendimento') && (
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        'Ficha Cirúrgica Pré-Op',
                        `Abrindo prontuário e ficha pré-operatória de ${item.patientName}...`
                      )
                    }
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/80 shadow-xs transition-colors cursor-pointer"
                  >
                    Ficha Pré-Op
                  </button>
                )}

                {item.statusLabelRight && (
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    {item.statusLabelRight}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* 3. MODAL DE DETALHES ("VER DADOS DO PACIENTE E PROCEDIMENTO")    */}
      {/* ================================================================ */}
      {viewModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Detalhes do Agendamento Clínico
                  </h3>
                  <p className="text-xs text-slate-500">
                    Horário: {viewModalSlot.time} às {viewModalSlot.endTime || '12:00'} ({viewModalSlot.duration})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewModalSlot(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dados do Paciente */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Dados do Paciente
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#005F73] border border-teal-200">
                  {viewModalSlot.insurance || 'Particular'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#005F73]" />
                {viewModalSlot.patientName}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Telefone / WhatsApp</span>
                  <span className="font-semibold text-slate-800">{viewModalSlot.phone || '(24) 99876-1122'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">CPF</span>
                  <span className="font-semibold text-slate-800">{viewModalSlot.cpf || '123.456.789-01'}</span>
                </div>
              </div>
            </div>

            {/* Dados do Procedimento */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Procedimento Clínico Agendado
              </span>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0A9396]" />
                {viewModalSlot.procedure}
              </p>
              <div className="text-xs text-slate-600 pt-1 flex items-center gap-2">
                <span className="font-semibold text-slate-700">Status Clínico:</span>
                <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                  {viewModalSlot.status || 'Confirmado'}
                </span>
              </div>
              {viewModalSlot.notes && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                  <span className="font-bold text-slate-700 block mb-0.5">Observações:</span>
                  {viewModalSlot.notes}
                </div>
              )}
            </div>

            {/* Ações do Rodapé do Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleRequestDelete(viewModalSlot)}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:opacity-80 rounded-xl transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Agendamento</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isSendingWhatsApp}
                  onClick={() => handleSendWhatsAppNotification(viewModalSlot)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Enviar lembrete de consulta do template ativo via WhatsApp"
                >
                  {isSendingWhatsApp ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                  <span>{isSendingWhatsApp ? 'Enviando...' : 'Lembrete WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const slot = viewModalSlot;
                    setViewModalSlot(null);
                    handleStartAttendance(slot);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#005F73] hover:bg-[#004959] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Iniciar Atendimento</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewModalSlot(null);
                    handleEdit(viewModalSlot);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-500 hover:opacity-80 rounded-xl shadow-xs transition-opacity flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar Agendamento</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewModalSlot(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Padronizado de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteConfirmSlot)}
        onClose={() => {
          if (!isDeleting) setDeleteConfirmSlot(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Agendamento"
        description="Deseja realmente excluir este agendamento clínico da linha do tempo?"
        itemName={deleteConfirmSlot?.patientName}
        itemDetails={
          deleteConfirmSlot
            ? `Consulta às ${deleteConfirmSlot.time}${
                deleteConfirmSlot.endTime ? ` às ${deleteConfirmSlot.endTime}` : ''
              } • ${deleteConfirmSlot.procedure || 'Procedimento Clínico'}`
            : undefined
        }
        confirmLabel="Sim, Excluir Horário"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
};
