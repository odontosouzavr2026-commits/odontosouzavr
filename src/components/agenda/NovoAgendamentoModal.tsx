import React, { useState, useEffect } from 'react';
import {
  Calendar,
  X,
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
import { whatsappNotificationService } from '../../services/whatsappNotificationService';
import { emitirNotificacaoClinica } from '../../contexts/NotificationContext';
import { agendaService } from '../../services/agendaService';

interface NovoAgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: AgendaAppointmentItem) => void;
  initialTime?: string;
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

export const NovoAgendamentoModal: React.FC<NovoAgendamentoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTime = '09:00',
  isMobile = false,
}) => {
  const toast = useToast();

  const getTodayDateString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [pacientesList, setPacientesList] = useState<PacienteItem[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteItem | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Estado dos Procedimentos Cadastrados
  const [procedimentosList, setProcedimentosList] = useState<ProcedimentoItem[]>([]);
  const [selectedProcedimento, setSelectedProcedimento] = useState<ProcedimentoItem | null>(null);
  const [procedureSearch, setProcedureSearch] = useState('');
  const [isProcedureDropdownOpen, setIsProcedureDropdownOpen] = useState(false);

  const [chair, setChair] = useState('Dr. Frankisney Souza - Cadeira 01 (Geral & Implantes)');
  const [procedure, setProcedure] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(initialTime || '09:00');
  const [isUrgentEncaixe, setIsUrgentEncaixe] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    pacientesService
      .getPacientes()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setPacientesList(data);
        }
      })
      .catch((err) => console.warn('[NovoAgendamentoModal] Erro ao carregar pacientes:', err));

    procedimentosService
      .getProcedimentos()
      .then((procs) => {
        if (isMounted && procs && procs.length > 0) {
          setProcedimentosList(procs);
        }
      })
      .catch((err) => console.warn('[NovoAgendamentoModal] Erro ao carregar procedimentos:', err));

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtra procedimentos cadastrados
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
    if (date < todayStr) {
      toast.warning(
        'Data Retroativa Indisponível',
        'Não é possível realizar agendamentos para datas que já passaram.'
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

    const matchedPaciente =
      selectedPaciente ||
      pacientesList.find(
        (p) => p.name.toLowerCase().trim() === finalPatientName.toLowerCase().trim()
      );

    // Validação da Regra de Negócio: Não marcar 2 horários no mesmo dia para o mesmo paciente,
    // a não ser que o horário anterior já esteja concluído.
    const conflito = await agendaService.verificarConflitoDuploAgendamento(
      matchedPaciente?.id || finalPatientName,
      date
    );

    if (!conflito.permitido) {
      toast.warning('Limite de Agendamento por Dia', conflito.motivo || 'O paciente já possui um agendamento para este dia.');
      return;
    }

    const finalProcedureName = selectedProcedimento
      ? selectedProcedimento.name
      : procedureSearch.trim() || procedure.split(' (')[0];

    if (!finalProcedureName) {
      toast.warning('Atenção', 'Informe ou selecione o procedimento principal.');
      return;
    }

    const created: AgendaAppointmentItem = {
      id: Math.random().toString(),
      date,
      time,
      duration: selectedProcedimento ? `${selectedProcedimento.durationMinutes}m` : '45m',
      patientName: finalPatientName,
      phone: matchedPaciente?.whatsapp,
      pacienteId: matchedPaciente?.id,
      procedure: finalProcedureName,
      insurance: matchedPaciente?.insuranceLabel || 'PARTICULAR',
      status: 'Confirmado',
      whatsappConfirmed: true,
      isEncaixe: isUrgentEncaixe,
      notes: notes.trim() || undefined,
    };

    // Disparo automático da confirmação no WhatsApp do paciente após 5 segundos
    whatsappNotificationService.scheduleAppointmentConfirmation({
      patientName: finalPatientName,
      phone: matchedPaciente?.whatsapp,
      date,
      time,
      procedure: finalProcedureName,
      pacienteId: matchedPaciente?.id,
      delayMs: 5000,
    });

    // Emite notificação para a clínica com campainha dupla
    emitirNotificacaoClinica({
      tipo: 'novo_agendamento',
      titulo: 'Novo Agendamento Confirmado',
      mensagem: `${created.patientName} - ${created.procedure} em ${date} às ${time}.`,
      detalhes: {
        pacienteNome: created.patientName,
        pacienteTelefone: matchedPaciente?.whatsapp || '',
        dataConsulta: date,
        horarioConsulta: time,
        procedimento: created.procedure,
        dentista: 'Dr. Frankisney Souza',
        origem: 'recepcao',
        observacoes: created.notes,
      },
      linkRota: 'agenda',
    });

    setIsSuccess(true);
    toast.success(
      'Agendamento confirmado!',
      `Consulta para ${created.patientName} em ${date} às ${time} agendada com sucesso.`
    );
    setTimeout(() => {
      setIsSuccess(false);
      onSave(created);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden ${
          isMobile ? 'animate-in slide-in-from-bottom' : 'animate-in zoom-in-95'
        } duration-200`}
        role="dialog"
      >
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden bg-white">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#005F73]">
              <Calendar className="w-4 h-4 text-[#005F73]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#0A9396] uppercase tracking-wider block">
                Recepção • Cadeira 01
              </span>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                Novo Agendamento
              </h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <form id="new-appointment-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1. SELEÇÃO DE PACIENTE */}
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-teal-50 text-[#0A9396]">
                    <UserSearch className="w-3.5 h-3.5 text-[#0A9396]" />
                  </div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Identificação do Paciente <span className="text-rose-500">*</span>
                  </label>
                </div>
                <span className="text-[11px] font-medium text-slate-400">Etapa 1 de 3</span>
              </div>

              {selectedPaciente ? (
                <div className="bg-white border-2 border-[#0A9396]/50 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#005F73] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedPaciente.initials || selectedPaciente.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {selectedPaciente.name}
                        </span>
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                          Cadastrado
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        CPF: {selectedPaciente.cpf || 'Não informado'} • Tel: {selectedPaciente.whatsapp || 'Não informado'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearPaciente}
                    className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    Alterar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="bg-white border border-slate-300 rounded-lg p-2.5 focus-within:border-[#0A9396] focus-within:ring-2 focus-within:ring-[#0A9396]/20 transition flex items-center gap-2">
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
                      placeholder="Buscar paciente por nome ou CPF..."
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none border-none p-0"
                    />
                    {patientSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setPatientSearch('');
                          setIsDropdownOpen(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {isDropdownOpen && filteredPacientes.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {filteredPacientes.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPaciente(p)}
                          className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
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
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg z-50 text-xs text-slate-500">
                      Nenhum paciente cadastrado encontrado. Você pode continuar digitando para agendar como paciente avulso.
                    </div>
                  )}
                </div>
              )}

              <div className="mt-1 flex items-center justify-between">
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

            {/* 2. DETALHES CLÍNICOS */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Cadeira &amp; Profissional
                  </label>
                  <select
                    value={chair}
                    onChange={(e) => setChair(e.target.value)}
                    className="w-full bg-slate-50 sm:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-[#0A9396]"
                  >
                    <option>Dr. Frankisney Souza - Cadeira 01 (Geral &amp; Implantes)</option>
                    <option>Dra. Camila Santos - Cadeira 02 (Ortodontia)</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      Procedimento Principal <span className="text-rose-500">*</span>
                    </label>
                    {selectedProcedimento ? (
                      <span className="text-[10px] font-bold text-emerald-700">
                        {selectedProcedimento.categoryLabel} • {selectedProcedimento.price === 0 ? 'Grátis' : `R$ ${selectedProcedimento.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} ({selectedProcedimento.durationMinutes}m)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {procedimentosList.length} cadastrados
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                      placeholder="Comece a digitar para filtrar o procedimento..."
                      className="w-full pl-8 pr-8 py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
                    />
                    <button
                      type="button"
                      onClick={() => setIsProcedureDropdownOpen(!isProcedureDropdownOpen)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProcedureDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {isProcedureDropdownOpen && (
                    <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {filteredProcedimentos.length > 0 ? (
                        filteredProcedimentos.map((proc) => (
                          <button
                            key={proc.id}
                            type="button"
                            onClick={() => handleSelectProcedimento(proc)}
                            className="w-full text-left p-2.5 hover:bg-teal-50/40 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-[#005F73] transition-colors block truncate">
                                {proc.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {proc.categoryLabel}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              {proc.price === 0 ? (
                                <span className="text-xs font-black text-emerald-700 block">
                                  Grátis
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-emerald-700 block">
                                  R$ {proc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 block">
                                {proc.durationMinutes} min
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center">
                          <p className="text-xs text-slate-500">
                            Nenhum procedimento com "{procedureSearch}".
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setProcedure(procedureSearch);
                              setIsProcedureDropdownOpen(false);
                            }}
                            className="mt-1 text-xs font-semibold text-[#005F73] hover:underline cursor-pointer"
                          >
                            Usar "{procedureSearch}" como avulso
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-cyan-50/80 border border-cyan-200/90 rounded-xl p-3 text-xs text-cyan-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#0A9396] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-bold text-[#005F73]">Padrão Odonto Souza:</strong> 45 minutos por atendimento clínico.
                </p>
              </div>
            </div>

            {/* 3. AGENDAMENTO & HORÁRIO */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Data da Consulta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={getTodayDateString()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 sm:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-[#0A9396]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Horário de Início (45 min) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 sm:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm px-3 py-2 font-bold text-[#005F73] focus:ring-2 focus:ring-[#0A9396]"
                  />

                  {/* Chips de Horários: das 08h da manhã à meia-noite */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5 max-h-32 overflow-y-auto pr-1">
                    {CLINICAL_SLOTS.map((slot) => {
                      const isToday = date === getTodayDateString();
                      const now = new Date();
                      const [slotH, slotM] = slot.split(':').map(Number);
                      const isPast = isToday && (slotH < now.getHours() || (slotH === now.getHours() && slotM <= now.getMinutes()));
                      const isBefore9 = slot < '09:00';
                      const isNight = slot >= '18:00' || slot === '00:00';

                      if (isPast) {
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
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400 line-through border border-slate-200 cursor-not-allowed opacity-60"
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
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
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
                </div>
              </div>

              {/* Aviso de Encaixe */}
              <div className="bg-amber-50 text-amber-900 border border-amber-200/90 rounded-xl p-3 space-y-2">
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 cursor-pointer shadow-2xs">
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

            {/* 4. NOTAS */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Observações Clínicas (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 sm:bg-white border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#0A9396] resize-none"
                placeholder="Ex: Queixa de dor, dente específico a tratar..."
              />
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            form="new-appointment-form"
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#005F73] hover:bg-[#004e5e] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#005F73]/20 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Agendamento</span>
          </button>
        </div>
      </div>
    </div>
  );
};
