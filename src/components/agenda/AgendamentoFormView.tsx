import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  UserSearch,
  Plus,
  Stethoscope,
  Info,
  CalendarClock,
  Clock,
  AlertTriangle,
  MessageSquare,
  Check,
  CheckCircle2,
  Lock,
  User,
  X,
  Search,
  ChevronDown,
} from 'lucide-react';
import { AgendaAppointmentItem } from '../../types/agenda';
import { useToast } from '../../contexts/ToastContext';
import { formatCPF } from '../../utils/documentValidation';
import { pacientesService } from '../../services/pacientesService';
import { PacienteItem } from '../../types/pacientes';
import { procedimentosService } from '../../services/procedimentosService';
import { ProcedimentoItem } from '../../types/procedimentos';
import { scrollToTop } from '../../utils/scrollUtils';
import { whatsappNotificationService } from '../../services/whatsappNotificationService';
import { emitirNotificacaoClinica } from '../../contexts/NotificationContext';
import { agendaService } from '../../services/agendaService';

interface AgendamentoFormViewProps {
  initialTime?: string;
  initialDate?: string;
  editingAppointment?: AgendaAppointmentItem | null;
  onSave: (appointment: AgendaAppointmentItem) => void;
  onCancel: () => void;
  isMobile?: boolean;
}

// Horários clínicos de 45 minutos disponíveis das 08h da manhã à meia-noite (00:00)
const CLINICAL_SLOTS = [
  '08:00', // Manhã (Sob demanda)
  '08:15', // Manhã (Sob demanda)
  '08:30', // Manhã (Sob demanda)
  '08:45', // Manhã (Sob demanda)
  '09:00', // 09:00 às 09:45
  '09:45', // 09:45 às 10:30
  '10:30', // 10:30 às 11:15
  '11:15', // 11:15 às 12:00
  '12:00', // 12:00 às 12:45
  '12:45', // 12:45 às 13:30
  '13:30', // 13:30 às 14:15
  '14:15', // 14:15 às 15:00
  '15:00', // 15:00 às 15:45
  '15:45', // 15:45 às 16:30
  '16:30', // 16:30 às 17:15
  '17:15', // 17:15 às 18:00
  '18:00', // 18:00 às 18:45 (Noite)
  '18:45', // 18:45 às 19:30
  '19:30', // 19:30 às 20:15
  '20:15', // 20:15 às 21:00
  '21:00', // 21:00 às 21:45
  '21:45', // 21:45 às 22:30
  '22:30', // 22:30 às 23:15
  '23:15', // 23:15 às 00:00
  '00:00', // Meia-noite / Plantão
];

export const AgendamentoFormView: React.FC<AgendamentoFormViewProps> = ({
  initialTime = '09:00',
  initialDate,
  editingAppointment,
  onSave,
  onCancel,
  isMobile = false,
}) => {
  const toast = useToast();

  // Puxa a data atual local no formato YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Estado dos Pacientes do Banco de Dados
  const [pacientesList, setPacientesList] = useState<PacienteItem[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteItem | null>(null);
  const [patientSearch, setPatientSearch] = useState(editingAppointment?.patientName || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Estado dos Procedimentos Cadastrados (Catálogo Completo da Clínica)
  const [procedimentosList, setProcedimentosList] = useState<ProcedimentoItem[]>([]);
  const [selectedProcedimento, setSelectedProcedimento] = useState<ProcedimentoItem | null>(null);
  const [procedureSearch, setProcedureSearch] = useState(editingAppointment?.procedure || '');
  const [isProcedureDropdownOpen, setIsProcedureDropdownOpen] = useState(false);

  const [chair, setChair] = useState('Dr. Frankisney Souza - Cadeira 01 (Geral & Implantes)');
  const [procedure, setProcedure] = useState(editingAppointment?.procedure || '');
  const [date, setDate] = useState(editingAppointment?.date || initialDate || getTodayDateString());
  const [time, setTime] = useState(editingAppointment?.time || initialTime || '09:00');
  const [isUrgentEncaixe, setIsUrgentEncaixe] = useState(Boolean(editingAppointment?.isEncaixe));
  const [notes, setNotes] = useState(editingAppointment?.notes || '');

  // Sempre rola a tela para o topo absoluto (início) ao abrir o formulário
  useEffect(() => {
    scrollToTop();
  }, []);

  // Sincroniza se editingAppointment mudar
  useEffect(() => {
    if (editingAppointment) {
      if (editingAppointment.date) setDate(editingAppointment.date);
      if (editingAppointment.time) setTime(editingAppointment.time);
      if (editingAppointment.patientName) setPatientSearch(editingAppointment.patientName);
      if (editingAppointment.procedure) {
        setProcedureSearch(editingAppointment.procedure);
        setProcedure(editingAppointment.procedure);
      }
      setIsUrgentEncaixe(Boolean(editingAppointment.isEncaixe));
      setNotes(editingAppointment.notes || '');
    }
  }, [editingAppointment]);

  // Carrega lista de pacientes e procedimentos cadastrados da clínica
  useEffect(() => {
    let isMounted = true;
    pacientesService
      .getPacientes()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setPacientesList(data);
        }
      })
      .catch((err) => console.warn('[AgendamentoFormView] Erro ao carregar pacientes:', err));

    procedimentosService
      .getProcedimentos()
      .then((procs) => {
        if (isMounted && procs && procs.length > 0) {
          setProcedimentosList(procs);
        }
      })
      .catch((err) => console.warn('[AgendamentoFormView] Erro ao carregar procedimentos:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Vincula o paciente selecionado com base em editingAppointment ou digitação
  useEffect(() => {
    if (editingAppointment && pacientesList.length > 0 && !selectedPaciente) {
      const match = pacientesList.find(
        (p) =>
          (editingAppointment.pacienteId && p.id === editingAppointment.pacienteId) ||
          p.name.toLowerCase().trim() === (editingAppointment.patientName || '').toLowerCase().trim()
      );
      if (match) {
        setSelectedPaciente(match);
      }
    }
  }, [pacientesList, editingAppointment, selectedPaciente]);

  // Vincula o procedimento selecionado com base em editingAppointment
  useEffect(() => {
    if (editingAppointment && procedimentosList.length > 0 && !selectedProcedimento) {
      const match = procedimentosList.find(
        (pr) =>
          (editingAppointment.procedimentoId && pr.id === editingAppointment.procedimentoId) ||
          pr.name.toLowerCase().trim() === (editingAppointment.procedure || '').toLowerCase().trim()
      );
      if (match) {
        setSelectedProcedimento(match);
      }
    }
  }, [procedimentosList, editingAppointment, selectedProcedimento]);

  // Filtra procedimentos cadastrados conforme digitação
  const filteredProcedimentos = procedimentosList.filter((p) => {
    if (!procedureSearch.trim()) return true;
    const term = procedureSearch.toLowerCase().trim();
    const matchName = p.name.toLowerCase().includes(term);
    const matchCat = (p.categoryLabel || '').toLowerCase().includes(term);
    const matchDesc = (p.description || '').toLowerCase().includes(term);
    return matchName || matchCat || matchDesc;
  });

  const handleSelectProcedimento = (p: ProcedimentoItem) => {
    setSelectedProcedimento(p);
    setProcedureSearch(p.name);
    setProcedure(p.name);
    setIsProcedureDropdownOpen(false);
  };

  const handleClearProcedimento = () => {
    setSelectedProcedimento(null);
    setProcedureSearch('');
    setIsProcedureDropdownOpen(true);
  };

  // Filtra pacientes por Nome ou por dígitos de CPF
  const filteredPacientes =
    patientSearch.trim().length >= 1 && !selectedPaciente
      ? pacientesList.filter((p) => {
          const searchClean = patientSearch.toLowerCase().trim();
          const searchDigits = patientSearch.replace(/\D/g, '');
          const patientCpfDigits = (p.cpf || '').replace(/\D/g, '');

          const matchName = p.name.toLowerCase().includes(searchClean);
          const matchCpf = searchDigits.length > 0 && patientCpfDigits.includes(searchDigits);

          return matchName || matchCpf;
        })
      : [];

  const handleSelectPaciente = (p: PacienteItem) => {
    setSelectedPaciente(p);
    setPatientSearch(p.name);
    setIsDropdownOpen(false);
  };

  const handleClearPaciente = () => {
    setSelectedPaciente(null);
    setPatientSearch('');
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPatientName = selectedPaciente ? selectedPaciente.name : patientSearch.trim();

    if (!finalPatientName) {
      toast.warning('Atenção', 'Informe ou selecione o paciente para continuar.');
      return;
    }

    if (!time || !date) {
      toast.warning('Atenção', 'Selecione a data e horário do agendamento.');
      return;
    }

    // Regra Estrita: Bloqueio de agendamento retroativo
    const now = new Date();
    const todayStr = getTodayDateString();
    if (!editingAppointment) {
      if (date < todayStr) {
        toast.warning(
          'Data Retroativa Indisponível',
          'Não é permitido realizar agendamentos para datas que já passaram.'
        );
        return;
      }
      if (date === todayStr) {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const [h, m] = time.split(':').map(Number);
        if (h < currentHours || (h === currentHours && m <= currentMinutes)) {
          toast.warning(
            'Horário Retroativo Indisponível',
            'O horário selecionado já passou da hora atual do computador. Por favor, escolha um horário futuro.'
          );
          return;
        }
      }
    }

    const matchedPaciente =
      selectedPaciente ||
      pacientesList.find(
        (p) => p.name.toLowerCase().trim() === finalPatientName.toLowerCase().trim()
      );

    const finalProcedureName = selectedProcedimento
      ? selectedProcedimento.name
      : procedureSearch.trim() || procedure.split(' (')[0];

    if (!finalProcedureName) {
      toast.warning('Atenção', 'Informe ou selecione o procedimento principal.');
      return;
    }

    const matchedProcedimento =
      selectedProcedimento ||
      procedimentosList.find(
        (pr) => pr.name.toLowerCase().trim() === finalProcedureName.toLowerCase().trim()
      );

    // Validação Estrita de Conflito de Horário e Duplo Agendamento (Double Booking)
    const [h, m] = time.split(':').map(Number);
    const [y, mon, d] = date.split('-').map(Number);
    const startDateTime = new Date(y, mon - 1, d, h, m, 0);
    const durationMinutes = matchedProcedimento?.durationMinutes || 45;
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    const conflito = await agendaService.verificarConflitoDuploAgendamento(
      matchedPaciente?.id || finalPatientName,
      date,
      editingAppointment?.id,
      startDateTime,
      endDateTime
    );

    if (!conflito.permitido) {
      toast.warning('Horário Não Permitido', conflito.motivo || 'O paciente já possui um agendamento para este horário.');
      return;
    }

    const resolvedPhone = matchedPaciente?.whatsapp || editingAppointment?.phone;

    const created: AgendaAppointmentItem = {
      id: editingAppointment ? editingAppointment.id : `app-${Date.now()}`,
      date: date,
      time,
      duration: matchedProcedimento ? `${matchedProcedimento.durationMinutes}m` : (editingAppointment?.duration || '45m'),
      patientName: finalPatientName,
      phone: resolvedPhone,
      pacienteId: matchedPaciente?.id || editingAppointment?.pacienteId,
      procedure: finalProcedureName,
      procedimentoId: matchedProcedimento?.id || editingAppointment?.procedimentoId,
      insurance: matchedPaciente?.insuranceLabel || editingAppointment?.insurance || 'PARTICULAR',
      status: editingAppointment?.status || 'Confirmado',
      whatsappConfirmed: true,
      isEncaixe: isUrgentEncaixe,
      notes: notes.trim() || undefined,
    };



    // Emite notificação para o painel com campainha de recepção dupla
    emitirNotificacaoClinica({
      tipo: editingAppointment ? 'alteracao_agendamento' : 'novo_agendamento',
      titulo: editingAppointment ? 'Agendamento Atualizado' : 'Novo Agendamento na Recepção',
      mensagem: `${created.patientName} - ${created.procedure} em ${date} às ${time}.`,
      detalhes: {
        pacienteNome: created.patientName,
        pacienteTelefone: resolvedPhone || '',
        dataConsulta: date,
        horarioConsulta: time,
        procedimento: created.procedure,
        dentista: 'Dr. Frankisney Souza',
        origem: 'recepcao',
        observacoes: created.notes,
      },
      linkRota: 'agenda',
    });

    toast.success(
      editingAppointment ? 'Agendamento atualizado!' : 'Agendamento confirmado!',
      `Consulta para ${created.patientName} em ${date} às ${time} ${editingAppointment ? 'atualizada' : 'agendada'} com sucesso.`
    );
    onSave(created);
  };

  // Dia da semana dinâmico baseado na data escolhida
  const getWeekdayLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('pt-BR', { weekday: 'long' });
      }
    } catch {}
    return 'Hoje';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Top Bar / Navegação de Retorno */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#005F73]" />
          <span>Voltar para Agenda</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {editingAppointment ? 'Editar Agendamento Clínico' : 'Novo Agendamento Clínico'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-[#005F73] border border-teal-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A9396] animate-pulse" />
            Cadeira 01 Disponível
          </span>
        </div>
      </div>

      {/* Card do Formulário */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-7">
        <header className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 border border-[#005F73]/20 flex items-center justify-center text-[#005F73]">
              <Calendar className="w-5 h-5 text-[#005F73]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {editingAppointment
                  ? 'Altere o horário, data, paciente ou observações clínicas do atendimento.'
                  : 'Reserve horários na cadeira clínica, configure duração e envie confirmação de consulta.'}
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECÇÃO 1: Identificação do Paciente */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-[#0A9396] border border-teal-100/80">
                  <UserSearch className="w-4 h-4 text-[#0A9396]" />
                </div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Identificação do Paciente <span className="text-rose-500">*</span>
                </label>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Etapa 1 de 3</span>
            </div>

            {/* SE JÁ SELECIONOU UM PACIENTE DO BANCO */}
            {selectedPaciente ? (
              <div className="bg-white border-2 border-[#0A9396]/50 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#005F73] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {selectedPaciente.initials || selectedPaciente.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 leading-tight">
                        {selectedPaciente.name}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Cadastrado
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      CPF: {selectedPaciente.cpf || 'Não informado'} • Tel: {selectedPaciente.whatsapp || 'Não informado'} • Convênio: {selectedPaciente.insuranceLabel || 'Particular'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearPaciente}
                  className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  Trocar Paciente
                </button>
              </div>
            ) : (
              /* CAMPO DE BUSCA REAL POR NOME OU CPF */
              <div className="relative">
                <div className="bg-white border border-slate-300 rounded-xl p-3 focus-within:border-[#0A9396] focus-within:ring-2 focus-within:ring-[#0A9396]/20 transition flex items-center gap-2">
                  <UserSearch className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Digite o nome ou CPF do paciente para buscar no sistema..."
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none border-none p-0"
                  />
                  {patientSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setPatientSearch('');
                        setIsDropdownOpen(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown de Sugestões em Tempo Real */}
                {isDropdownOpen && filteredPacientes.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {filteredPacientes.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPaciente(p)}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            CPF: {p.cpf || 'Não informado'} • Tel: {p.whatsapp || 'Não informado'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#005F73] bg-[#005F73]/10 px-2 py-0.5 rounded-full">
                          {p.insuranceLabel || 'Particular'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {isDropdownOpen && patientSearch.trim().length >= 2 && filteredPacientes.length === 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl p-3 shadow-lg z-50 text-xs text-slate-500">
                    Nenhum paciente cadastrado encontrado com este termo. Você pode prosseguir digitando o nome para agendar como paciente avulso.
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500">Paciente novo na recepção?</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedPaciente(null);
                  setPatientSearch('Novo Paciente na Recepção');
                  setIsDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0A9396] hover:text-[#005F73] transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Paciente Rápido</span>
              </button>
            </div>
          </div>

          {/* SECÇÃO 2: Detalhes Clínicos & Procedimento */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-[#0A9396] border border-teal-100/80">
                  <Stethoscope className="w-4 h-4 text-[#0A9396]" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Detalhes Clínicos &amp; Procedimento
                </h2>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Etapa 2 de 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Cadeira &amp; Profissional Responsável
                </label>
                <select
                  value={chair}
                  onChange={(e) => setChair(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
                >
                  <option>Dr. Frankisney Souza - Cadeira 01 (Geral &amp; Implantes)</option>
                  <option>Dra. Camila Santos - Cadeira 02 (Ortodontia)</option>
                </select>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Procedimento Principal <span className="text-rose-500">*</span>
                  </label>
                  {selectedProcedimento ? (
                    <span className="text-[11px] font-bold text-emerald-700">
                      {selectedProcedimento.categoryLabel} • {selectedProcedimento.price === 0 ? 'Grátis' : `R$ ${selectedProcedimento.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} ({selectedProcedimento.durationMinutes} min)
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {procedimentosList.length} cadastrados no sistema
                    </span>
                  )}
                </div>

                {/* Campo de Busca / Filtro com Digitação em Tempo Real */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={procedureSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProcedureSearch(val);
                      setProcedure(val);
                      setIsProcedureDropdownOpen(true);
                      const match = procedimentosList.find(
                        (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                      );
                      setSelectedProcedimento(match || null);
                    }}
                    onFocus={() => setIsProcedureDropdownOpen(true)}
                    placeholder="Comece a digitar para filtrar o procedimento (ex: Profilaxia, Canal, Resina, Siso...)"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A9396] focus:border-transparent transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setIsProcedureDropdownOpen(!isProcedureDropdownOpen)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProcedureDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Flutuante com Todos os Procedimentos Cadastrados */}
                {isProcedureDropdownOpen && (
                  <div className="absolute z-30 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {filteredProcedimentos.length > 0 ? (
                      filteredProcedimentos.map((proc) => (
                        <button
                          key={proc.id}
                          type="button"
                          onClick={() => handleSelectProcedimento(proc)}
                          className="w-full text-left p-3 hover:bg-teal-50/40 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#005F73] transition-colors truncate">
                                {proc.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                {proc.categoryLabel}
                              </span>
                            </div>
                            {proc.description && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {proc.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {proc.price === 0 ? (
                              <span className="text-xs sm:text-sm font-black text-emerald-700 block">
                                Grátis
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm font-bold text-emerald-700 block">
                                R$ {proc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                            <span className="text-[10px] font-medium text-slate-400 block">
                              {proc.durationMinutes} min
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                          Nenhum procedimento encontrado com "{procedureSearch}".
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setProcedure(procedureSearch);
                            setIsProcedureDropdownOpen(false);
                          }}
                          className="mt-2 text-xs font-semibold text-[#005F73] hover:underline cursor-pointer"
                        >
                          Usar "{procedureSearch}" como procedimento personalizado
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Alerta de Duração Padrão */}
            <div className="bg-cyan-50/80 border border-cyan-200/90 rounded-xl p-3.5 text-xs text-cyan-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0A9396] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-bold text-[#005F73]">Padrão Odonto Souza:</strong> O atendimento regular dura{' '}
                <strong className="font-bold text-[#005F73]">45 minutos</strong> por consulta.
              </p>
            </div>
          </div>

          {/* SECÇÃO 3: Agendamento & Horário */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-[#0A9396] border border-teal-100/80">
                  <CalendarClock className="w-4 h-4 text-[#0A9396]" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Agendamento &amp; Horário
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-700 capitalize">
                {getWeekdayLabel(date)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Data da Consulta <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={getTodayDateString()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-[#0A9396]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Horário de Início (45 min) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2.5 font-bold text-[#005F73] focus:ring-2 focus:ring-[#0A9396]"
                />

                {/* Chips de Horários: intervalos das 08h da manhã à meia-noite */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                  {CLINICAL_SLOTS.map((slot) => {
                    const isToday = date === getTodayDateString();
                    const now = new Date();
                    const [slotH, slotM] = slot.split(':').map(Number);
                    const isPast = isToday && (slotH < now.getHours() || (slotH === now.getHours() && slotM <= now.getMinutes()));
                    const isBefore9 = slot < '09:00';
                    const isNight = slot >= '18:00' || slot === '00:00';

                    if (isPast && !editingAppointment) {
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            toast.warning(
                              'Horário Passado',
                              'Este horário já passou da hora atual do computador e está indisponível para novos agendamentos.'
                            );
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-400 line-through border border-slate-200 cursor-not-allowed opacity-60"
                          title={`${slot} (Horário Encerrado / Passado)`}
                        >
                          {slot}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                          time === slot
                            ? 'bg-[#005F73] text-white shadow-2xs'
                            : isBefore9
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : isNight
                            ? 'bg-indigo-50/60 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                        title={
                          isBefore9
                            ? 'Horário sob demanda antes das 09:00'
                            : isNight
                            ? `${slot} (Turno Noite / Plantão - 45 min)`
                            : `${slot} (45 min de atendimento)`
                        }
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Intervalos de 45 minutos das 08:00 à meia-noite (00:00). Horários em amarelo (08:00 - 08:45) sob demanda, azul claro (noite) e tachados (já encerrados hoje).
                </p>
              </div>
            </div>

            {/* Aviso de Encaixe */}
            <div className="bg-amber-50 text-amber-900 border border-amber-200/90 rounded-xl p-4 space-y-2.5">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-200 cursor-pointer shadow-2xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isUrgentEncaixe}
                    onChange={(e) => setIsUrgentEncaixe(e.target.checked)}
                    className="w-4 h-4 text-[#005F73] rounded border-amber-300 focus:ring-[#0A9396]"
                  />
                  <span className="text-xs font-bold text-amber-900">
                    Marcar como Encaixe Urgente
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                  Fila Prioritária
                </span>
              </label>
            </div>
          </div>

          {/* SECÇÃO 4: Observações */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-[#0A9396] border border-teal-100/80">
                  <MessageSquare className="w-4 h-4 text-[#0A9396]" />
                </div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Notas de Atendimento
                </label>
              </div>
              <span className="text-[11px] text-slate-400">Opcional</span>
            </div>

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#0A9396] resize-none"
              placeholder="Ex: Queixa principal, dente específico a tratar, observações clínicas..."
            />
          </div>

          {/* Rodapé de Ações */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004e5e] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#005F73]/20 transition active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 text-white" />
              <span>{editingAppointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
