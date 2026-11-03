import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserPlus,
  Lock,
  ArrowRight,
  ArrowLeft,
  Filter,
  Check,
  X,
  Sparkles,
  Phone,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  CreditCard,
  Building,
  AlertTriangle,
  Info,
  Key,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { agendaService } from '../../services/agendaService';
import { pacientePortalService } from '../../services/pacientePortalService';
import { procedimentosService } from '../../services/procedimentosService';
import { ProcedimentoItem } from '../../types/procedimentos';
import { conveniosService } from '../../services/conveniosService';
import { ConvenioItem } from '../../types/convenios';
import { pacientesService } from '../../services/pacientesService';
import { isValidCPF, formatCPF, formatPhone, cleanDigits } from '../../utils/documentValidation';
import { formatCEP } from '../../services/cepService';
import { useViaCep } from '../../hooks/useViaCep';
import { emitirNotificacaoClinica } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';
import { ToothIcon } from '../common/ToothIcon';
import { recaptchaService } from '../../services/recaptchaService';

export interface InstitucionalAgendaProps {
  currentUser?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  } | null;
  onLoginSuccess?: (user: { id?: string; email: string; name: string; role: string }) => void;
  onNavigateToPaciente?: () => void;
}

interface SlotSchedule {
  id: string;
  time: string;
  endTime: string;
  duration: string;
  shift: 'manha' | 'tarde' | 'noite';
  status: 'livre' | 'ocupado' | 'passado' | 'doutor_apenas';
  label: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export const InstitucionalAgendaSection: React.FC<InstitucionalAgendaProps> = ({
  currentUser,
  onLoginSuccess,
  onNavigateToPaciente,
}) => {
  const toast = useToast();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [activeShift, setActiveShift] = useState<'todos' | 'manha' | 'tarde' | 'noite' | 'livres'>('todos');
  
  // Catálogo Dinâmico de Procedimentos da Tabela 'procedimentos'
  const [procedimentosList, setProcedimentosList] = useState<ProcedimentoItem[]>([]);
  const [isLoadingProcedimentos, setIsLoadingProcedimentos] = useState<boolean>(false);
  const [selectedProcedure, setSelectedProcedure] = useState<string>('Consulta / Avaliação Clínica Inicial');
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>('');
  
  // Agendamento selecionado para reserva
  const [selectedSlot, setSelectedSlot] = useState<SlotSchedule | null>(null);
  const [patientNotes, setPatientNotes] = useState<string>('');

  // Identificação inteligente de perfil: Paciente Real vs Membro da Equipe (Admin/Dentista)
  const isPatientUser = Boolean(
    currentUser && currentUser.role?.toLowerCase() === 'paciente'
  );
  const isStaffUser = Boolean(
    currentUser && currentUser.role && currentUser.role.toLowerCase() !== 'paciente'
  );
  
  // Modais de Agendamento e Autenticação Inteligente
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'cadastro'>('cadastro');
  
  // Campos de Login do Paciente
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState<string | null>(null);

  // Convênios Ativos do Banco de Dados
  const [conveniosList, setConveniosList] = useState<ConvenioItem[]>([]);

  // Estados do Cadastro Completo de Paciente (Replicando PacienteFormView sem foto)
  const [regName, setRegName] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regRg, setRegRg] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regGender, setRegGender] = useState<'feminino' | 'masculino' | 'outro'>('feminino');
  const [regInsurance, setRegInsurance] = useState('Particular');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // Endereço Residencial
  const [regCep, setRegCep] = useState('');
  const [regLogradouro, setRegLogradouro] = useState('');
  const [regNumero, setRegNumero] = useState('');
  const [regComplemento, setRegComplemento] = useState('');
  const [regBairro, setRegBairro] = useState('');
  const [regCidade, setRegCidade] = useState('');
  const [regEstado, setRegEstado] = useState('');

  // Informações Clínicas
  const [regAllergies, setRegAllergies] = useState('');
  const [regClinicalNotes, setRegClinicalNotes] = useState('');

  // Credenciais de Acesso ao Portal (/minhaconta)
  const [regPortalEmail, setRegPortalEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Validação Estrita de Documentos e Endereço
  const [cpfError, setCpfError] = useState(false);
  const [cpfErrorMessage, setCpfErrorMessage] = useState('');
  const { loading: cepLoading, error: cepError, errorMessage: cepErrorMessage, lookupCep, clearCepError } = useViaCep();
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Carrega convênios ativos para o formulário de cadastro
  useEffect(() => {
    conveniosService.getConvenios().then((list) => {
      const active = list.filter((c) => c.status === 'Ativo');
      setConveniosList(active.length > 0 ? active : list);
      if (active.length > 0) {
        setRegInsurance(active[0].nome);
      }
    }).catch(() => {});
  }, []);

  // Sincroniza e-mail de acesso com o e-mail principal digitado
  useEffect(() => {
    if (regEmail && !regPortalEmail) {
      setRegPortalEmail(regEmail);
    }
  }, [regEmail, regPortalEmail]);

  // Checklist de Força da Senha em Tempo Real
  const minLengthValid = regPassword.length >= 8;
  const uppercaseValid = /[A-Z]/.test(regPassword);
  const specialCharValid = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/~`]/.test(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;
  const validCount = [minLengthValid, uppercaseValid, specialCharValid, passwordsMatch].filter(Boolean).length;

  const getStrengthInfo = () => {
    if (!regPassword) return { label: 'Não informada', color: 'text-slate-400', width: '0%', barBg: 'bg-slate-200' };
    switch (validCount) {
      case 1:
        return { label: 'Fraca', color: 'text-rose-600', width: '25%', barBg: 'bg-rose-500' };
      case 2:
        return { label: 'Média', color: 'text-amber-600', width: '50%', barBg: 'bg-amber-500' };
      case 3:
        return { label: 'Forte', color: 'text-teal-600', width: '75%', barBg: 'bg-[#0A9396]' };
      case 4:
      default:
        return { label: 'Excelente (Recomendada)', color: 'text-emerald-700 font-bold', width: '100%', barBg: 'bg-emerald-600' };
    }
  };
  const strengthInfo = getStrengthInfo();

  // Handlers para CPF e CEP
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setRegCpf(formatted);
    if (cpfError && cleanDigits(formatted).length === 11) {
      if (isValidCPF(formatted)) {
        setCpfError(false);
        setCpfErrorMessage('');
      }
    }
  };

  const handleCpfBlur = () => {
    if (!regCpf.trim()) {
      setCpfError(true);
      setCpfErrorMessage('CPF é obrigatório.');
      return;
    }
    if (!isValidCPF(regCpf)) {
      setCpfError(true);
      setCpfErrorMessage('CPF inválido. Por favor, confira os números digitados.');
    } else {
      setCpfError(false);
      setCpfErrorMessage('');
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setRegCep(formatted);
    const clean = cleanDigits(formatted);
    if (clean.length === 8) {
      const address = await lookupCep(clean);
      if (address) {
        setRegLogradouro(address.logradouro || '');
        setRegBairro(address.bairro || '');
        setRegCidade(address.localidade || '');
        setRegEstado(address.uf || '');
      }
    } else if (clean.length < 8 && cepError) {
      clearCepError();
    }
  };

  // Armazenamento Seguro de Agendamento Pendente (Memória de Sessão)
  const PENDING_BOOKING_KEY = 'odonto_pending_booking';

  // Grade Oficial de Slots de 45 minutos (08:10 às 23:55)
  const baseSlots: SlotSchedule[] = [
    // Manhã (Dr. Frankisney exclusivo 08:10 às 08:55)
    { id: 's-1', time: '08:10', endTime: '08:55', duration: '45 min', shift: 'manha', status: 'doutor_apenas', label: 'Sob Demanda • Dr. Frankisney' },
    { id: 's-2', time: '09:00', endTime: '09:45', duration: '45 min', shift: 'manha', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-3', time: '09:50', endTime: '10:35', duration: '45 min', shift: 'manha', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-4', time: '10:40', endTime: '11:25', duration: '45 min', shift: 'manha', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-5', time: '11:30', endTime: '12:15', duration: '45 min', shift: 'manha', status: 'livre', label: 'Disponível para Agendamento' },
    // Tarde Contínua sem Cortes
    { id: 's-6', time: '12:20', endTime: '13:05', duration: '45 min', shift: 'tarde', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-7', time: '13:10', endTime: '13:55', duration: '45 min', shift: 'tarde', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-8', time: '14:00', endTime: '14:45', duration: '45 min', shift: 'tarde', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-9', time: '14:50', endTime: '15:35', duration: '45 min', shift: 'tarde', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-10', time: '15:40', endTime: '16:25', duration: '45 min', shift: 'tarde', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-11', time: '16:30', endTime: '17:15', duration: '45 min', shift: 'tarde', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-12', time: '17:20', endTime: '18:05', duration: '45 min', shift: 'tarde', status: 'livre', label: 'Disponível para Agendamento' },
    // Noite
    { id: 's-13', time: '18:10', endTime: '18:55', duration: '45 min', shift: 'noite', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-14', time: '19:00', endTime: '19:45', duration: '45 min', shift: 'noite', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-15', time: '19:50', endTime: '20:35', duration: '45 min', shift: 'noite', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-16', time: '20:40', endTime: '21:25', duration: '45 min', shift: 'noite', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-17', time: '21:30', endTime: '22:15', duration: '45 min', shift: 'noite', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-18', time: '22:20', endTime: '23:05', duration: '45 min', shift: 'noite', status: 'livre', label: 'Disponível para Agendamento' },
    { id: 's-19', time: '23:10', endTime: '23:55', duration: '45 min', shift: 'noite', status: 'livre', label: 'Disponível para Agendamento' },
  ];

  // Lista de horários já reservados no banco de dados para a data selecionada
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Helper: Verifica se o slot já passou em relação ao relógio local
  const isPastSlot = (slotTime: string, targetDate: Date): boolean => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    if (selDay < today) return true;
    if (selDay > today) return false;

    const [h, m] = slotTime.split(':').map(Number);
    const slotMinutes = h * 60 + m;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return slotMinutes <= nowMinutes;
  };

  // Busca agendamentos reais gravados no Supabase para ocultar horários já ocupados
  const fetchBookedSlots = async (targetDate: Date) => {
    setIsLoadingSlots(true);
    try {
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const targetDateKey = `${y}-${m}-${d}`;

      // Consulta agendamentos diretamente na tabela do Supabase
      const { data, error } = await supabase
        .from('agendamentos')
        .select('data_hora_inicio, data_hora_fim, status');

      let appointments: any[] = data || [];
      if (error || !appointments || appointments.length === 0) {
        appointments = (await agendaService.getAgendamentos()) as any[];
      }

      // Filtra estritamente agendamentos do dia selecionado que NÃO estejam cancelados
      const occupiedTimes: string[] = [];
      (appointments || []).forEach((ag: any) => {
        const agDate = new Date(ag.data_hora_inicio || ag.dataHoraInicio);
        const agY = agDate.getFullYear();
        const agM = String(agDate.getMonth() + 1).padStart(2, '0');
        const agD = String(agDate.getDate()).padStart(2, '0');
        const agDateKey = `${agY}-${agM}-${agD}`;

        if (agDateKey === targetDateKey) {
          const st = (ag.status || '').toLowerCase();
          const isCancelled = st.includes('cancel') || st.includes('desmarc') || st.includes('falta');
          if (!isCancelled) {
            const timeStr = agDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            occupiedTimes.push(timeStr);
          }
        }
      });

      setBookedTimes(occupiedTimes);
    } catch (err) {
      console.warn('[InstitucionalAgenda] Erro ao buscar horários ocupados:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Carrega e sincroniza em tempo real as reservas na data selecionada via REST API segura
  useEffect(() => {
    fetchBookedSlots(selectedDate);
    recaptchaService.loadScript();

    // Sincronização periódica inteligente via HTTPS/REST (elimina erros ruidosos de WebSocket no console)
    const syncInterval = setInterval(() => {
      fetchBookedSlots(selectedDate);
    }, 15000);

    return () => {
      clearInterval(syncInterval);
    };
  }, [selectedDate]);

  // Processa slots do dia ativo mantendo estritamente os horários futuros e NÃO AGENDADOS (livres de verdade)
  const availableSlots: SlotSchedule[] = baseSlots.filter((s) => {
    // 1. Remove qualquer horário que já passou da hora atual
    if (isPastSlot(s.time, selectedDate)) return false;
    
    // 2. REGRA DO USUÁRIO: Se o horário já foi agendado no banco, O MESMO DEVE SUMIR da página institucional para evitar duplicidade!
    if (bookedTimes.includes(s.time)) return false;

    // 3. Remove slots marcados como ocupados ou passados
    if (s.status === 'ocupado' || s.status === 'passado') return false;

    return true;
  });

  // Filtro de turnos aplicados exclusivamente sobre os horários disponíveis
  const filteredSlots = availableSlots.filter((s) => {
    if (activeShift === 'todos' || activeShift === 'livres') return true;
    return s.shift === activeShift;
  });

  // Quantidade de horários livres reais no dia
  const vagasLivres = availableSlots.filter((s) => s.status === 'livre').length;

  // Formata data do dia selecionado em português
  const formattedSelectedDate = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Busca lista dinâmica de procedimentos da tabela 'procedimentos' no Supabase
  const fetchProcedimentos = async () => {
    setIsLoadingProcedimentos(true);
    try {
      const procs = await procedimentosService.getProcedimentos();
      const activeProcs = (procs || []).filter((p) => p.active !== false);
      setProcedimentosList(activeProcs);
      if (activeProcs.length > 0) {
        setSelectedProcedure((prev) => {
          const match = activeProcs.find((p) => p.name === prev || p.id === selectedProcedureId);
          return match ? match.name : activeProcs[0].name;
        });
        setSelectedProcedureId((prevId) => {
          const match = activeProcs.find((p) => p.id === prevId);
          return match ? match.id : activeProcs[0].id;
        });
      }
    } catch (err) {
      console.warn('[InstitucionalAgenda] Erro ao buscar da tabela procedimentos:', err);
    } finally {
      setIsLoadingProcedimentos(false);
    }
  };

  useEffect(() => {
    fetchProcedimentos();
  }, []);

  // Ao abrir o modal de confirmação, busca novamente para refletir quaisquer cadastros novos feitos no Supabase
  useEffect(() => {
    if (isConfirmModalOpen) {
      fetchProcedimentos();
    }
  }, [isConfirmModalOpen]);

  // ==============================================================
  // NAVEGAÇÃO DO MINI CALENDÁRIO
  // ==============================================================
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Gera os dias da grade do mês
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Preenchimento do mês seguinte até fechar 35 ou 42 dias
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    const today = new Date();
    const isToday = (d: Date) =>
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    const isSelected = (d: Date) =>
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear();

    const isPastDate = (d: Date) => {
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return d < startOfToday;
    };

    return days.map((item, idx) => {
      const past = isPastDate(item.date);
      const selected = isSelected(item.date);
      const current = isToday(item.date);

      return (
        <button
          key={idx}
          type="button"
          disabled={past}
          onClick={() => {
            if (!past) {
              setSelectedDate(item.date);
              toast.info('Data Selecionada', `Carregando horários para ${item.date.toLocaleDateString('pt-BR')}`);
            }
          }}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${
            selected
              ? 'bg-[#005F73] text-white shadow-md scale-105'
              : current
              ? 'border-2 border-[#005F73] text-[#005F73] font-black'
              : past
              ? 'text-slate-300 opacity-40 cursor-not-allowed'
              : item.isCurrentMonth
              ? 'text-slate-700 hover:bg-slate-100 hover:text-[#005F73] cursor-pointer'
              : 'text-slate-400 opacity-60 hover:bg-slate-50 cursor-pointer'
          }`}
        >
          {item.dayNumber}
        </button>
      );
    });
  };

  // ==============================================================
  // FLUXO INTELIGENTE DE SELEÇÃO E AGENDAMENTO
  // ==============================================================
  const handleSlotClick = (slot: SlotSchedule) => {
    if (slot.status === 'passado') {
      toast.warning('Horário Encerrado', 'Este horário já passou. Por favor, escolha um horário futuro disponível.');
      return;
    }

    if (slot.status === 'doutor_apenas') {
      toast.info(
        'Horário Sob Demanda',
        'Os horários das 08:10 às 08:55 são exclusivos do Dr. Frankisney Souza. Por favor, selecione a partir das 09:00 ou contate nossa recepção.'
      );
      return;
    }

    setSelectedSlot(slot);

    // Regra Solicitada: Ao clicar em reservar, chama SEMPRE PRIMEIRO a tela para o paciente escolher o procedimento
    setIsConfirmModalOpen(true);
  };

  const handleSolicitarEncaixeInstitucional = () => {
    const encaixeSlot: SlotSchedule = {
      id: `encaixe-${Date.now()}`,
      time: '11:00',
      endTime: '11:45',
      duration: '45 min',
      shift: 'manha',
      status: 'livre',
      label: 'Fila de Encaixe Prioritária',
    };
    setSelectedSlot(encaixeSlot);
    setPatientNotes('Solicitação de Fila de Encaixe Prioritária via Site Institucional (Sobreaviso sem garantia de horário fixo).');
    setIsConfirmModalOpen(true);
  };

  // Ação ao avançar a partir da tela de escolha de procedimento
  const handleProceedFromConfirm = () => {
    if (!selectedSlot) return;

    // Se já estiver logado como paciente, confirma direto no nome dele
    if (isPatientUser && currentUser) {
      executeFinalBooking(currentUser);
      return;
    }

    // Se NÃO for paciente autenticado (visitante ou membro da equipe):
    // Salva a intenção com data, horário, procedimento escolhido e observações
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(
      selectedDate.getDate()
    ).padStart(2, '0')}`;

    const pendingData = {
      slotId: selectedSlot.id,
      time: selectedSlot.time,
      endTime: selectedSlot.endTime,
      duration: selectedSlot.duration,
      dateKey,
      formattedDate: formattedSelectedDate,
      procedure: selectedProcedure,
      procedureId: selectedProcedureId,
      notes: patientNotes,
    };

    try {
      sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(pendingData));
    } catch (err) {
      console.warn('Erro ao salvar pendingBooking:', err);
    }

    // Fecha a tela de escolha de procedimento
    setIsConfirmModalOpen(false);

    // Abre o MODAL DE IDENTIFICAÇÃO DO PACIENTE (LOGIN COM OPÇÃO DE CADASTRO)
    setAuthMode('login');
    setRegistrationSuccessMsg(null);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  // Executa a gravação do agendamento real no banco de dados Supabase com bloqueio estrito de concorrência
  const executeFinalBooking = async (userToBook: { id?: string; email?: string; name: string; whatsapp?: string; telefone?: string }) => {
    if (!selectedSlot) return;
    if (isSubmittingBooking) return;
    setIsSubmittingBooking(true);

    try {
      // 0. Validação silenciosa e invisível com Google reCAPTCHA
      const recaptcha = await recaptchaService.execute();
      if (recaptcha.token) {
        recaptchaService.verifyTokenOnServer(recaptcha.token).catch(() => {});
      }

      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(
        selectedDate.getDate()
      ).padStart(2, '0')}`;

      const startDateTime = `${dateKey}T${selectedSlot.time}:00`;
      const endDateTime = `${dateKey}T${selectedSlot.endTime}:00`;

      const resolvedPhone = (userToBook as any).whatsapp || (userToBook as any).telefone || (userToBook as any).phone || regWhatsapp.trim() || undefined;

      const isEncaixe = selectedSlot.id.startsWith('encaixe-');

      // 1. Salva via agendaService com validação estrita de duplo agendamento e disparo automático de WhatsApp
      await agendaService.saveAgendamento({
        pacienteId: userToBook.id || undefined,
        pacienteNome: userToBook.name || 'Paciente Odonto Souza',
        pacienteEmail: userToBook.email || undefined,
        pacienteTelefone: resolvedPhone,
        phone: resolvedPhone,
        patientName: userToBook.name || 'Paciente Odonto Souza',
        procedure: selectedProcedure,
        procedimentoId: selectedProcedureId || undefined,
        procedimentoNome: selectedProcedure,
        date: dateKey,
        time: selectedSlot.time,
        dataHoraInicio: startDateTime,
        dataHoraFim: endDateTime,
        status: isEncaixe ? 'Encaixe de Urgência' : 'Confirmado',
        tipo: isEncaixe ? 'Encaixe' : 'Consulta',
        isEncaixe: isEncaixe,
        observacoes: patientNotes ? `[Site Institucional] ${patientNotes}` : isEncaixe ? 'Fila de Encaixe solicitada via Site Institucional' : 'Agendamento realizado via Página Institucional',
        notes: patientNotes ? `[Site Institucional] ${patientNotes}` : isEncaixe ? 'Fila de Encaixe solicitada via Site Institucional' : 'Agendamento realizado via Página Institucional',
      });

      // Atualiza imediatamente a lista de horários ocupados para o horário sumir da grade pública
      await fetchBookedSlots(selectedDate);

      // 2. Emite notificação sonora e central com campainha dupla da recepção
      emitirNotificacaoClinica({
        tipo: 'novo_agendamento',
        titulo: 'Novo Agendamento via Site Institucional 🦷✨',
        mensagem: `${userToBook.name} agendou ${selectedProcedure} para ${formattedSelectedDate} às ${selectedSlot.time}.`,
        detalhes: {
          pacienteNome: userToBook.name,
          pacienteTelefone: resolvedPhone || '',
          pacienteEmail: userToBook.email || '',
          dataConsulta: `${formattedSelectedDate} às ${selectedSlot.time}`,
          horarioConsulta: selectedSlot.time,
          procedimento: selectedProcedure,
          dentista: 'Dr. Frankisney Souza',
          origem: 'site_institucional',
          observacoes: patientNotes ? `[Site Institucional] ${patientNotes}` : 'Agendamento realizado via Página Institucional',
        },
        linkRota: 'agenda',
      });

      // 3. Limpa memória pendente
      sessionStorage.removeItem(PENDING_BOOKING_KEY);

      setIsConfirmModalOpen(false);
      setIsAuthModalOpen(false);

      toast.success(
        'Consulta Agendada com Sucesso! 🎉🦷',
        `Tudo pronto, ${userToBook.name}! Sua consulta para ${formattedSelectedDate} às ${selectedSlot.time} está confirmada. Enviamos os detalhes para o seu WhatsApp.`
      );
    } catch (err: any) {
      console.error('[InstitucionalAgenda] Erro ao gravar agendamento:', err);
      toast.error('Não foi possível agendar', err?.message || 'Horário indisponível ou já agendado.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Confirmação quando o paciente já está logado
  const handleConfirmDirect = () => {
    if (!currentUser || isSubmittingBooking) return;
    executeFinalBooking(currentUser);
  };

  // Submissão do Formulário Completo de Cadastro de Paciente (Replicando PacienteFormView sem foto)
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validações dos campos obrigatórios
    if (!regName.trim()) {
      setAuthError('Por favor, informe seu nome completo.');
      return;
    }
    if (!regCpf.trim() || !isValidCPF(regCpf)) {
      setCpfError(true);
      setCpfErrorMessage('CPF inválido. Por favor, confira os números digitados.');
      setAuthError('Por favor, informe um CPF válido.');
      return;
    }
    if (!regBirthDate) {
      setAuthError('Por favor, informe sua data de nascimento.');
      return;
    }
    if (!regWhatsapp.trim()) {
      setAuthError('Por favor, informe seu Celular / WhatsApp.');
      return;
    }
    const cleanEmail = (regPortalEmail || regEmail).trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Por favor, informe um e-mail válido para acesso.');
      return;
    }
    if (!minLengthValid || !uppercaseValid || !specialCharValid) {
      setAuthError('A senha deve conter no mínimo 8 caracteres, 1 letra maiúscula e 1 caractere especial.');
      return;
    }
    if (!passwordsMatch) {
      setAuthError('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    // Função de tradução de erros técnicos para mensagens clínicas amigáveis (sem jargões)
    const getFriendlyErrorMessage = (err: any): string => {
      const raw = String(err?.message || err || '');
      if (
        raw.includes('usuarios_email_key') ||
        raw.includes('pacientes_email_key') ||
        raw.toLowerCase().includes('already registered') ||
        raw.toLowerCase().includes('email_exists')
      ) {
        return 'Este e-mail já possui cadastro no sistema. Por favor, volte e faça o login.';
      }
      if (raw.includes('pacientes_cpf_key')) {
        return 'Este CPF já possui cadastro no sistema. Por favor, volte e faça o login com seu e-mail cadastrado.';
      }
      if (raw.toLowerCase().includes('violates unique constraint')) {
        return 'Já existe um cadastro com estas informações no sistema. Por favor, volte e faça o login.';
      }
      if (raw.toLowerCase().includes('violates foreign key constraint') || raw.includes('fkey')) {
        return 'Não foi possível associar os dados do agendamento. Tente novamente.';
      }
      if (raw.toLowerCase().includes('invalid input syntax for type uuid')) {
        return 'Identificador de registro inválido.';
      }
      if (raw.toLowerCase().includes('email logins are disabled') || raw.toLowerCase().includes('invalid login credentials')) {
        return 'E-mail ou senha incorretos. Verifique suas credenciais.';
      }
      return raw || 'Ocorreu um erro ao processar. Por favor, tente novamente.';
    };

    setIsAuthLoading(true);

    try {
      // 0. Verifica previamente se o e-mail já possui cadastro na clínica para orientar o login imediatamente via Toast
      try {
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id, email, nome')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (existingUser) {
          setIsAuthLoading(false);
          toast.warning(
            'Usuário já cadastrado!',
            'Este e-mail já possui cadastro no sistema. Por favor, volte e faça o login.'
          );
          setAuthEmail(cleanEmail);
          setAuthPassword('');
          setRegistrationSuccessMsg(
            'Este e-mail já possui cadastro na clínica. Digite sua senha abaixo para efetuar o login e confirmar o agendamento.'
          );
          setAuthMode('login');
          setAuthError(null);
          return;
        }
      } catch (checkErr) {
        console.warn('Verificação de e-mail existente:', checkErr);
      }

      // 1. Grava o cadastro completo do paciente na tabela public.pacientes
      const savedPatient = await pacientesService.savePaciente({
        name: regName.trim(),
        cpf: regCpf.trim(),
        rg: regRg.trim() || undefined,
        birthDate: regBirthDate,
        gender: regGender,
        whatsapp: regWhatsapp.trim(),
        email: cleanEmail,
        address: {
          cep: regCep.trim(),
          logradouro: regLogradouro.trim(),
          numero: regNumero.trim(),
          complemento: regComplemento.trim(),
          bairro: regBairro.trim(),
          cidade: regCidade.trim(),
          estado: regEstado.trim(),
        },
        insurance: regInsurance,
        insuranceLabel: regInsurance,
        allergies: regAllergies.trim() || undefined,
        clinicalNotes: regClinicalNotes.trim() || undefined,
        status: 'ativo',
      });

      const pacienteId = savedPatient?.id;

      // 2. Cria credenciais de autenticação no Supabase Auth e em public.usuarios (perfil: paciente)
      const credRes = await pacientesService.criarAcessoPortalPaciente({
        nome: regName.trim(),
        email: cleanEmail,
        senha: regPassword,
        telefone: regWhatsapp.trim(),
        pacienteId,
      });

      if (!credRes.success) {
        throw new Error(credRes.error || 'Falha ao registrar credenciais de acesso no banco de dados.');
      }

      // 3. Regra Obrigatória: Redireciona o paciente para a tela de Login
      setAuthEmail(cleanEmail);
      setAuthPassword('');
      setRegistrationSuccessMsg(
        `Cadastro de ${regName.trim()} realizado com sucesso! 🎉 Digite sua senha abaixo para efetuar o login e confirmar o agendamento da sua consulta.`
      );
      setAuthMode('login');
      toast.success(
        'Cadastro Realizado com Sucesso!',
        'Agora faça login com sua senha para efetuar a reserva na agenda.'
      );
    } catch (err: any) {
      console.error('[InstitucionalAgenda] Erro ao cadastrar paciente:', err);
      const rawMsg = String(err?.message || err || '');
      const isDuplicate =
        rawMsg.includes('usuarios_email_key') ||
        rawMsg.includes('pacientes_email_key') ||
        rawMsg.toLowerCase().includes('already registered') ||
        rawMsg.toLowerCase().includes('duplicate key');

      if (isDuplicate) {
        toast.warning(
          'Usuário já cadastrado!',
          'Este e-mail já possui cadastro no sistema. Por favor, volte e faça o login.'
        );
        setAuthEmail(cleanEmail);
        setAuthPassword('');
        setRegistrationSuccessMsg(
          'Este e-mail já possui cadastro na clínica. Digite sua senha abaixo para efetuar o login e confirmar o agendamento.'
        );
        setAuthMode('login');
        setAuthError(null);
      } else {
        const friendly = getFriendlyErrorMessage(err);
        toast.error('Atenção ao Cadastrar', friendly);
        setAuthError(friendly);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Submissão do Modal de Login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Por favor, informe seu e-mail.');
      return;
    }

    if (!authPassword) {
      setAuthError('Por favor, digite sua senha.');
      return;
    }

    setIsAuthLoading(true);

    try {
      // 1. Autentica via pacientesService (com validação bcrypt no PostgreSQL)
      const authRes = await pacientesService.autenticarUsuario(cleanEmail, authPassword);

      if (!authRes.success || !authRes.user) {
        throw new Error(authRes.error || 'E-mail ou senha incorretos. Verifique suas credenciais.');
      }

      const loggedUser = authRes.user;

      localStorage.setItem('odonto_user', JSON.stringify(loggedUser));
      if (onLoginSuccess) onLoginSuccess(loggedUser);

      // 2. Regra Solicitada: Depois de logar com sucesso, fecha modal de login,
      // efetua a reserva e notifica o painel da clínica
      setIsAuthModalOpen(false);
      await executeFinalBooking(loggedUser);
    } catch (err: any) {
      const friendlyMsg = String(err?.message || '').includes('senha incorretos')
        ? 'E-mail ou senha incorretos. Verifique suas credenciais.'
        : err?.message || 'Falha na autenticação. Verifique os dados digitados.';
      toast.error('Falha no Login', friendlyMsg);
      setAuthError(friendlyMsg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <section id="agenda-online" className="py-12 lg:py-16 bg-[#F8F9FA] border-b border-slate-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção de Agendamento */}
        <div className="text-center max-w-5xl mx-auto space-y-2.5 mb-10 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#005F73]/10 text-[#005F73] text-xs font-bold border border-[#005F73]/15">
            <Calendar className="w-4 h-4 text-[#0A9396]" />
            <span>Agendamento Inteligente em Tempo Real</span>
          </div>
          <h2 className="text-[clamp(16px,3.6vw,32px)] font-black text-[#001219] tracking-tight whitespace-nowrap text-center">
            <span className="whitespace-nowrap">Reserve sua consulta com o Dr. Frankisney Souza</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Selecione o melhor dia e horário abaixo. Consultas estruturadas de 45 minutos com total pontualidade e biossegurança.
          </p>
        </div>

        {/* ============================================================== */}
        {/* GRID PRINCIPAL: MINI CALENDÁRIO (ESQ) + GRADE DA AGENDA (DIR)  */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA ESQUERDA: MINI CALENDÁRIO & INFORMAÇÕES (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              {/* Header do Mês e Navegação */}
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-slate-900 capitalize">
                  {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Mês anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Próximo mês"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dias da Semana (DOM a SÁB) */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400">
                {WEEKDAYS.map((w, idx) => (
                  <div key={idx} className="py-1">
                    {w}
                  </div>
                ))}
              </div>

              {/* Grade de Dias do Calendário */}
              <div className="grid grid-cols-7 gap-1 place-items-center">{renderCalendarDays()}</div>

              {/* Legenda do Calendário */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005F73]" />
                  <span>Selecionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-[#005F73]" />
                  <span>Hoje</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 opacity-60" />
                  <span>Encerrado</span>
                </div>
              </div>
            </div>

            {/* Card de Destaque da Cadeira Clínica */}
            <div className="bg-gradient-to-br from-[#005F73] to-[#0A9396] text-white rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#94D2BD]">
                  <ToothIcon className="w-5 h-5 text-[#94D2BD]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Consultório Central • Cadeira 01</h4>
                  <p className="text-xs text-cyan-100">Dr. Frankisney B. Souza (CRO-5950/MT)</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/15 text-xs text-cyan-100">
                <div className="flex items-center justify-between">
                  <span>Duração Padrão:</span>
                  <strong className="text-white">45 minutos por paciente</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Esterilização Entre Pacientes:</span>
                  <strong className="text-[#94D2BD]">Rigorosa (15 min)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vagas Livres no Dia:</span>
                  <strong className="text-white font-black">{vagasLivres} horários</strong>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: GRADE DE HORÁRIOS DA AGENDA CLÍNICA (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header da Agenda com Data e Badge de Tempo Otimizado */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base text-slate-900 capitalize">
                      Agenda Clínica • {formattedSelectedDate}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Início às 08:10 (consultas de 45 min) • Dr. Frankisney Souza (Cadeira 01)
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tempo Otimizado: 45 min por atendimento</span>
              </div>
            </div>

            {/* ALERTA VISUAL DE ENCAIXE / AGENDA LOTADA */}
            {availableSlots.length === 0 && (
              <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm sm:text-base text-amber-950">
                        Agenda Lotada para {formattedSelectedDate}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 uppercase">
                        Apenas Encaixe
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed max-w-xl">
                      Todos os horários regulares para esta data estão preenchidos. Disponibilizamos a <strong>Fila de Encaixe Prioritária</strong>. <em>Aviso importante: o encaixe não é garantia de atendimento em horário pré-fixado</em>, dependendo de cancelamentos de outros pacientes ou intervalo clínico. Havendo desistência, o 1º da fila assume o horário e recebe a confirmação no WhatsApp.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSolicitarEncaixeInstitucional}
                  className="px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004655] text-white text-xs font-bold shrink-0 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  Entrar na Fila de Encaixe
                </button>
              </div>
            )}

            {/* Barra de Filtro de Turnos (Somente Vagas Disponíveis) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveShift('todos')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeShift === 'todos' || activeShift === 'livres'
                    ? 'bg-[#005F73] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todas as Vagas Livres ({availableSlots.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveShift('manha')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeShift === 'manha' ? 'bg-[#005F73] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Manhã ({availableSlots.filter((s) => s.shift === 'manha').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveShift('tarde')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeShift === 'tarde' ? 'bg-[#005F73] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Tarde ({availableSlots.filter((s) => s.shift === 'tarde').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveShift('noite')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeShift === 'noite' ? 'bg-[#005F73] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Noite ({availableSlots.filter((s) => s.shift === 'noite').length})
              </button>
            </div>

            {/* Grade Compacta de Horários Disponíveis (Novo Modelo Anexo 1) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0A9396] shrink-0" />
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 capitalize">
                    Horários disponíveis para {formattedSelectedDate}:
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium pl-7">
                  Clique no horário desejado para prosseguir com o agendamento da sua consulta.
                </p>
              </div>

              {filteredSlots.length === 0 ? (
                <div className="p-8 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-semibold text-center space-y-1">
                  <p className="font-bold text-sm">Sem horários vagos neste turno</p>
                  <p className="text-[11px] text-amber-800">
                    Todos os horários para este turno já foram preenchidos ou encerrados pelo horário atual. Por favor,
                    selecione outro turno acima ou escolha outra data no calendário ao lado.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 sm:gap-3.5 pt-1">
                  {filteredSlots.map((slot) => {
                    const isDoctor = slot.status === 'doutor_apenas';
                    const isSelected = selectedSlot?.id === slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        className={`min-w-[86px] sm:min-w-[96px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#005F73] text-white shadow-md scale-105 border-transparent'
                            : isDoctor
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-white hover:bg-slate-50 hover:border-[#005F73] hover:text-[#005F73] text-slate-800 border border-slate-200 hover:shadow-xs active:scale-95'
                        }`}
                        title={isDoctor ? 'Horário exclusivo da Administração' : `Clique para reservar às ${slot.time}`}
                      >
                        {isDoctor && <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                        <span>{slot.time}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: CONFIRMAÇÃO DO AGENDAMENTO (PACIENTE JÁ LOGADO)       */}
      {/* ============================================================== */}
      {isConfirmModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Confirmar Reserva de Consulta</h3>
                  <p className="text-xs text-slate-500">Dr. Frankisney Souza • Cadeira 01</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detalhes do Horário */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              {isPatientUser && currentUser && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Paciente Autenticado:</span>
                  <strong className="text-slate-900 font-bold">{currentUser.name}</strong>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Data da Consulta:</span>
                <strong className="text-slate-900 font-bold capitalize">{formattedSelectedDate}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Horário Previsto:</span>
                <strong className="text-[#005F73] font-black">{selectedSlot.time} às {selectedSlot.endTime} (45 min)</strong>
              </div>
            </div>

            {/* Procedimento */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tipo de Procedimento / Queixa Principal:</label>

              {isLoadingProcedimentos ? (
                <div className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 animate-pulse flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005F73]" />
                  <span>Carregando opções...</span>
                </div>
              ) : (
                <select
                  value={selectedProcedureId || selectedProcedure}
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = procedimentosList.find((p) => p.id === val || p.name === val);
                    if (found) {
                      setSelectedProcedureId(found.id);
                      setSelectedProcedure(found.name);
                    } else {
                      setSelectedProcedureId('');
                      setSelectedProcedure(val);
                    }
                  }}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#005F73] focus:border-transparent outline-none cursor-pointer"
                >
                  {procedimentosList.length > 0 ? (
                    procedimentosList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.price > 0 ? `(R$ ${p.price.toFixed(2).replace('.', ',')})` : '(Sob Avaliação)'}
                      </option>
                    ))
                  ) : (
                    <option value="Consulta / Avaliação Clínica Inicial">
                      Consulta / Avaliação Clínica Inicial
                    </option>
                  )}
                </select>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Observações adicionais (opcional):</label>
              <textarea
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Ex: Primeira vez no consultório, sinto sensibilidade no dente molar..."
                rows={2}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#005F73] focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmittingBooking}
                onClick={isPatientUser && currentUser ? handleConfirmDirect : handleProceedFromConfirm}
                className={`flex-1 py-3 rounded-xl bg-[#005F73] hover:bg-[#004756] text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmittingBooking ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isPatientUser && currentUser ? (
                  <>
                    <Check className="w-4 h-4 text-[#94D2BD]" />
                    <span>{isSubmittingBooking ? 'Confirmando...' : 'Confirmar Agendamento'}</span>
                  </>
                ) : (
                  <>
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4 text-[#94D2BD]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: AUTENTICAÇÃO INTELIGENTE (LOGIN / CADASTRO COMPLETO) */}
      {/* ============================================================== */}
      {isAuthModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`bg-white rounded-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 transition-all duration-300 ${
              authMode === 'cadastro' ? 'max-w-3xl max-h-[92vh] overflow-y-auto' : 'max-w-md'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#005F73] text-white flex items-center justify-center shrink-0">
                  <ToothIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {authMode === 'login'
                      ? 'Identificação do Paciente'
                      : 'Cadastro Completo de Paciente'}
                  </h3>
                  <p className="text-[11px] text-[#0A9396] font-bold">
                    Garantindo sua reserva para {selectedSlot.time} ({selectedDate.toLocaleDateString('pt-BR')})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {authMode === 'login' ? (
              /* MODO 1: TELA DE LOGIN DO PACIENTE */
              <div className="space-y-4">
                {/* Mensagem de Sucesso pós-cadastro */}
                {registrationSuccessMsg ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cadastro Concluído com Sucesso!</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      {registrationSuccessMsg}
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 flex items-start gap-2.5 text-xs text-teal-900 leading-relaxed">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      Para confirmar a sua reserva no horário das <strong>{selectedSlot.time}</strong>, entre com seu e-mail e senha. A consulta será gravada no sistema imediatamente!
                    </span>
                  </div>
                )}

                {/* Formulário de Login */}
                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">E-mail Cadastrado:</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Senha de Acesso:</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        className="w-full text-xs font-medium pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mensagem de Erro */}
                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Botão de Submissão */}
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-3 rounded-xl bg-[#005F73] hover:bg-[#004756] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                  >
                    {isAuthLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Acessando e Confirmando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#94D2BD]" />
                        <span>Entrar e Confirmar Horário</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Opção Destacada: "Não tenho cadastro" */}
                <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                  <p className="text-xs text-slate-500 font-medium">
                    Ainda não possui cadastro na clínica?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('cadastro');
                      setAuthError(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border-2 border-[#005F73]/30 hover:border-[#005F73] text-[#005F73] hover:bg-[#005F73]/5 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-[#005F73]" />
                    <span>Não tenho cadastro — Criar cadastro novo</span>
                  </button>
                </div>
              </div>
            ) : (
              /* MODO 3: FORMULÁRIO COMPLETO DE CADASTRO DO PACIENTE (REPLICANDO O PAINEL ADMINISTRATIVO) */
              <div className="space-y-6">
                {/* Barra de Retorno ao Login */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/70 border border-teal-200/70">
                  <div className="flex items-center gap-2 text-xs text-teal-900 font-medium">
                    <Sparkles className="w-4 h-4 text-[#005F73]" />
                    <span>Já possui cadastro na Odonto Souza?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className="text-xs font-bold text-[#005F73] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Fazer Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                  {/* SEÇÃO 1: DADOS PESSOAIS & IDENTIFICAÇÃO */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#005F73]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        1. Dados Pessoais & Identificação
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {/* Nome Completo */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Nome Completo *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Ex: Maria dos Santos"
                            className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                          />
                        </div>
                      </div>

                      {/* CPF */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">CPF *</label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={regCpf}
                            onChange={handleCpfChange}
                            onBlur={handleCpfBlur}
                            placeholder="000.000.000-00"
                            className={`w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border outline-none ${
                              cpfError ? 'border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-300 focus:ring-2 focus:ring-[#005F73]'
                            }`}
                          />
                        </div>
                        {cpfError && (
                          <p className="text-[11px] text-rose-600 font-semibold">{cpfErrorMessage}</p>
                        )}
                      </div>

                      {/* RG */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">RG / Identidade (opcional)</label>
                        <input
                          type="text"
                          value={regRg}
                          onChange={(e) => setRegRg(e.target.value)}
                          placeholder="Ex: 00.000.000-0"
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                        />
                      </div>

                      {/* Data de Nascimento */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Data de Nascimento *</label>
                        <input
                          type="date"
                          required
                          value={regBirthDate}
                          onChange={(e) => setRegBirthDate(e.target.value)}
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                        />
                      </div>

                      {/* Sexo */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Sexo *</label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as any)}
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#005F73] outline-none cursor-pointer"
                        >
                          <option value="feminino">Feminino</option>
                          <option value="masculino">Masculino</option>
                          <option value="outro">Outro / Prefiro não informar</option>
                        </select>
                      </div>

                      {/* Convênio */}
                      <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Convênio Odontológico</label>
                        <select
                          value={regInsurance}
                          onChange={(e) => setRegInsurance(e.target.value)}
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#005F73] outline-none cursor-pointer"
                        >
                          <option value="Particular">Particular (Sem Convênio)</option>
                          <option value="Convênio da Casa">Convênio da Casa (Plano Próprio Odonto Souza)</option>
                          {conveniosList
                            .filter((c) => c.nome !== 'Particular' && c.nome !== 'Convênio da Casa')
                            .map((c) => (
                              <option key={c.id} value={c.nome}>
                                {c.nome}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 2: CONTATO & COMUNICAÇÃO */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#005F73]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        2. Contato & Comunicação
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Celular / WhatsApp */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Celular / WhatsApp *</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            value={regWhatsapp}
                            onChange={(e) => setRegWhatsapp(formatPhone(e.target.value))}
                            placeholder="(24) 99999-9999"
                            className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                          />
                        </div>
                      </div>

                      {/* E-mail */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">E-mail Principal *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 3: ENDEREÇO RESIDENCIAL */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#005F73]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        3. Endereço Residencial (ViaCEP Automático)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {/* CEP */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">CEP</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={regCep}
                            onChange={handleCepChange}
                            placeholder="00000-000"
                            className="w-full text-xs font-medium pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                          />
                          {cepLoading && (
                            <Loader2 className="w-3.5 h-3.5 text-[#005F73] animate-spin absolute right-3 top-3" />
                          )}
                        </div>
                        {cepError && (
                          <p className="text-[11px] text-rose-600 font-semibold">{cepErrorMessage}</p>
                        )}
                      </div>

                      {/* Logradouro / Rua */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Logradouro / Rua</label>
                        <input
                          type="text"
                          value={regLogradouro}
                          onChange={(e) => setRegLogradouro(e.target.value)}
                          placeholder="Ex: Avenida Brasil"
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                        />
                      </div>

                      {/* Número */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Número</label>
                        <input
                          type="text"
                          value={regNumero}
                          onChange={(e) => setRegNumero(e.target.value)}
                          placeholder="Ex: 120"
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                        />
                      </div>

                      {/* Complemento */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Complemento</label>
                        <input
                          type="text"
                          value={regComplemento}
                          onChange={(e) => setRegComplemento(e.target.value)}
                          placeholder="Apto 101, Bloco B"
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                        />
                      </div>

                      {/* Bairro */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Bairro</label>
                        <input
                          type="text"
                          value={regBairro}
                          onChange={(e) => setRegBairro(e.target.value)}
                          placeholder="Ex: Centro"
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                        />
                      </div>

                      {/* Cidade */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Cidade</label>
                        <input
                          type="text"
                          value={regCidade}
                          onChange={(e) => setRegCidade(e.target.value)}
                          placeholder="Ex: Volta Redonda"
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                        />
                      </div>

                      {/* UF / Estado */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Estado (UF)</label>
                        <input
                          type="text"
                          maxLength={2}
                          value={regEstado}
                          onChange={(e) => setRegEstado(e.target.value.toUpperCase())}
                          placeholder="RJ"
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 4: HISTÓRICO CLÍNICO (OPCIONAL) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#005F73]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        4. Histórico Clínico & Alergias (Opcional)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Alergias Conhecidas</label>
                        <textarea
                          rows={2}
                          value={regAllergies}
                          onChange={(e) => setRegAllergies(e.target.value)}
                          placeholder="Ex: Alergia a Dipirona, Látex ou Penicilina (deixe em branco se nenhuma)"
                          className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Condições Médicas / Queixa Principal</label>
                        <textarea
                          rows={2}
                          value={regClinicalNotes}
                          onChange={(e) => setRegClinicalNotes(e.target.value)}
                          placeholder="Ex: Hipertensão controlada, queixa de dor no dente superior direito..."
                          className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005F73] outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 5: CREDENCIAIS DE ACESSO AO PORTAL DO PACIENTE (/minhaconta) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#005F73]" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        5. Credenciais de Acesso ao Portal (/minhaconta)
                      </h4>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                      {/* E-mail de Acesso */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">E-mail para Login *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            required
                            value={regPortalEmail}
                            onChange={(e) => setRegPortalEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#005F73] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Senha */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Senha de Acesso *</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type={showRegPassword ? 'text' : 'password'}
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Mínimo 8 caracteres"
                              className="w-full text-xs font-medium pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#005F73] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirmar Senha */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Confirmar Senha *</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type={showRegConfirmPassword ? 'text' : 'password'}
                              required
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Repita sua senha"
                              className="w-full text-xs font-medium pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#005F73] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Medidor de Força e Checklist */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Força da Senha:</span>
                          <span className={strengthInfo.color}>{strengthInfo.label}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${strengthInfo.barBg}`}
                            style={{ width: strengthInfo.width }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-600">
                          <span className={`flex items-center gap-1 ${minLengthValid ? 'text-emerald-700 font-bold' : ''}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${minLengthValid ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                            Mínimo 8 caracteres
                          </span>
                          <span className={`flex items-center gap-1 ${uppercaseValid ? 'text-emerald-700 font-bold' : ''}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${uppercaseValid ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                            Pelo menos 1 maiúscula
                          </span>
                          <span className={`flex items-center gap-1 ${specialCharValid ? 'text-emerald-700 font-bold' : ''}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${specialCharValid ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                            1 caractere especial (!@#$)
                          </span>
                          <span className={`flex items-center gap-1 ${passwordsMatch ? 'text-emerald-700 font-bold' : ''}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                            Senhas conferem
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informação sobre a foto (pode ser feita depois) */}
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center gap-2.5 text-xs text-blue-900">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Foto de Perfil:</strong> Você poderá adicionar sua foto de perfil posteriormente, acessando sua <strong>Área do Paciente</strong>.
                    </span>
                  </div>

                  {/* Mensagem de Erro Geral */}
                  {authError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Botões de Ação do Cadastro */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                      }}
                      className="w-full sm:w-1/3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                    >
                      Voltar para Login
                    </button>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full sm:w-2/3 py-3 rounded-xl bg-[#005F73] hover:bg-[#004756] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isAuthLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Gravando Cadastro...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#94D2BD]" />
                          <span>Finalizar Cadastro e Ir para Login</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
