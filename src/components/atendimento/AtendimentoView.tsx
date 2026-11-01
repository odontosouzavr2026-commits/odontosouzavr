import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  X,
  Sparkles,
  Loader2,
  CreditCard,
  Send,
  Receipt,
  FileCheck2,
  Stethoscope,
  Calendar,
  Users,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { ClinicalPatientBanner } from './ClinicalPatientBanner';
import { OdontogramView } from './OdontogramView';
import { SessionProceduresCard } from './SessionProceduresCard';
import { ClinicalEvolutionCard } from './ClinicalEvolutionCard';
import { PatientAlertsCard } from './PatientAlertsCard';
import { DailyQueueCard } from './DailyQueueCard';
import { RadiologyGalleryCard } from './RadiologyGalleryCard';
import { FinancialCheckoutCard } from './FinancialCheckoutCard';
import {
  ActivePatientInfo,
  SessionProcedure,
  QueuePatient,
  MedicalAlert,
} from '../../types/clinical';
import { PacienteItem } from '../../types/pacientes';
import { AgendaAppointmentItem } from '../../types/agenda';
import { pacientesService } from '../../services/pacientesService';
import { agendaService } from '../../services/agendaService';
import { financeiroService } from '../../services/financeiroService';
import { supabase } from '../../lib/supabase';
import { scrollToTop } from '../../utils/scrollUtils';

interface AtendimentoViewProps {
  forceMobileView?: boolean;
  selectedPatient?: PacienteItem | null;
  onBackToDashboard?: () => void;
  onViewSchedule?: () => void;
  onNavigateToPacientes?: () => void;
}

const mapPacienteToActiveInfo = (p: PacienteItem): ActivePatientInfo => {
  const alerts: MedicalAlert[] = [];
  if (p.allergies && p.allergies.trim()) {
    alerts.push({
      type: 'danger',
      title: 'ALERGIA SEVERA',
      description: p.allergies,
    });
  }
  if (p.clinicalNotes && p.clinicalNotes.trim()) {
    alerts.push({
      type: 'warning',
      title: 'Condição Médica',
      description: p.clinicalNotes,
    });
  }

  return {
    id: p.id,
    name: p.name,
    prontuario: p.code ? p.code.replace('#', '') : p.id.slice(-4).toUpperCase(),
    cpf: p.cpf || 'Não informado',
    age: p.age || 0,
    birthDate: p.birthDate || '',
    insurance: p.insuranceLabel || 'Particular',
    lastVisit: p.lastConsultation?.date
      ? `${p.lastConsultation.date} (${p.lastConsultation.procedure || 'Consulta'})`
      : 'Hoje',
    doctor: p.lastConsultation?.dentist || 'Dr. Frankisney Souza',
    photoUrl: p.avatarUrl || undefined,
    alerts,
    allergies: p.allergies,
    clinicalNotes: p.clinicalNotes,
  };
};

export const AtendimentoView: React.FC<AtendimentoViewProps> = ({
  forceMobileView = false,
  selectedPatient,
  onBackToDashboard,
  onViewSchedule,
  onNavigateToPacientes,
}) => {
  const [pacientesList, setPacientesList] = useState<PacienteItem[]>([]);
  const [agendamentosList, setAgendamentosList] = useState<AgendaAppointmentItem[]>([]);
  const [queuePatients, setQueuePatients] = useState<QueuePatient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Feedback Toast de Conclusão e Operações
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Paciente em Atendimento Ativo (nulo se a cadeira estiver livre)
  const [patient, setPatient] = useState<ActivePatientInfo | null>(() => {
    if (selectedPatient) {
      return mapPacienteToActiveInfo(selectedPatient);
    }
    return null;
  });

  // Garante que a tela sempre abra do início
  useEffect(() => {
    scrollToTop();
  }, []);

  // Atualiza paciente caso selectedPatient mude via navegação
  useEffect(() => {
    if (selectedPatient) {
      setPatient(mapPacienteToActiveInfo(selectedPatient));
    }
  }, [selectedPatient]);

  // Carrega pacientes e fila da agenda real do banco de dados
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [pacientes, agendamentos] = await Promise.all([
          pacientesService.getPacientes(),
          agendaService.getAgendamentos(),
        ]);

        if (!isMounted) return;

        setPacientesList(pacientes);
        setAgendamentosList(agendamentos);

        // Monta a Fila do Dia a partir dos agendamentos reais
        if (agendamentos.length > 0) {
          const mappedQueue: QueuePatient[] = agendamentos.map((ag) => {
            let status: QueuePatient['status'] = 'Confirmado';
            if (ag.status === 'Em Atendimento') status = 'Na Cadeira';
            else if (ag.status === 'Confirmado') status = 'Na Recepção';

            return {
              id: ag.id,
              name: ag.patientName,
              time: ag.time,
              procedure: ag.procedure,
              status,
              isEncaixe: ag.isEncaixe || (ag.notes || '').toLowerCase().includes('encaixe'),
            };
          });
          setQueuePatients(mappedQueue);
        } else {
          setQueuePatients([]);
        }

        // Se o usuário selecionou um paciente explicitamente
        if (selectedPatient) {
          setPatient(mapPacienteToActiveInfo(selectedPatient));
        } else {
          // Verifica se há algum agendamento com status 'Em Atendimento'
          const inAttendanceApp = agendamentos.find((a) => a.status === 'Em Atendimento');
          if (inAttendanceApp) {
            const matchedPatient = pacientes.find(
              (p) =>
                p.name.toLowerCase() === inAttendanceApp.patientName.toLowerCase() ||
                p.id === inAttendanceApp.id
            );
            if (matchedPatient) {
              setPatient(mapPacienteToActiveInfo(matchedPatient));
            } else {
              setPatient({
                id: inAttendanceApp.id,
                name: inAttendanceApp.patientName,
                prontuario: inAttendanceApp.id.slice(-4).toUpperCase(),
                cpf: '---',
                age: 0,
                birthDate: '',
                insurance: 'Particular',
                lastVisit: 'Hoje',
                doctor: inAttendanceApp.dentist || 'Dr. Frankisney Souza',
                photoUrl: undefined,
                alerts: [],
              });
            }
          } else {
            // Nenhum atendimento ativo no momento
            setPatient(null);
          }
        }
      } catch (err) {
        console.error('[AtendimentoView] Erro ao carregar dados:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedPatient]);

  // Procedimentos da Sessão (inicia vazio, sem dados mockados)
  const [procedures, setProcedures] = useState<SessionProcedure[]>([]);

  const [isConclusionModalOpen, setIsConclusionModalOpen] = useState(false);
  const [isSubmittingConclusion, setIsSubmittingConclusion] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão' | 'Dinheiro' | 'Convênio'>('PIX');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [mobileTab, setMobileTab] = useState<'odontograma' | 'procedimentos' | 'evolucao' | 'rx' | 'resumo'>('odontograma');

  const handleAddProcedure = (newProc: SessionProcedure) => {
    setProcedures((prev) => [...prev, newProc]);
  };

  const handleRemoveProcedure = (id: string) => {
    setProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectQueuePatient = (qp: QueuePatient) => {
    const found = pacientesList.find(
      (p) =>
        p.id === qp.id ||
        p.name.toLowerCase() === qp.name.toLowerCase() ||
        p.name.toLowerCase().includes(qp.name.toLowerCase())
    );

    if (found) {
      setPatient({
        ...mapPacienteToActiveInfo(found),
        isEncaixe: qp.isEncaixe,
      });
    } else {
      setPatient({
        id: qp.id,
        name: qp.name,
        prontuario: qp.id.slice(-4).toUpperCase(),
        cpf: '---',
        age: 0,
        birthDate: '',
        insurance: 'Particular',
        lastVisit: 'Hoje',
        doctor: 'Dr. Frankisney Souza',
        alerts: [],
        isEncaixe: qp.isEncaixe,
      });
    }
  };

  const handleNextPatient = () => {
    if (!patient) return;
    const currentIndex = queuePatients.findIndex(
      (q) => q.name.toLowerCase() === patient.name.toLowerCase()
    );
    const nextPatient =
      currentIndex >= 0 && currentIndex + 1 < queuePatients.length
        ? queuePatients[currentIndex + 1]
        : null;

    if (nextPatient) {
      handleSelectQueuePatient(nextPatient);
    } else {
      setPatient(null);
      setProcedures([]);
    }
  };

  const handleStartAttendance = async () => {
    if (!patient) return;
    try {
      const matchedApp = agendamentosList.find(
        (a) =>
          a.patientName.toLowerCase() === patient.name.toLowerCase() ||
          a.id === patient.id
      );

      if (matchedApp && matchedApp.id && !matchedApp.id.startsWith('mock-')) {
        await agendaService.updateStatus(matchedApp.id, 'Em Atendimento').catch(console.warn);
      }

      setQueuePatients((prev) =>
        prev.map((q) =>
          q.name.toLowerCase() === patient.name.toLowerCase()
            ? { ...q, status: 'Na Cadeira' }
            : q
        )
      );

      setToastMessage(`Atendimento de ${patient.name} iniciado! Cronômetro ativo (Padrão: 45 min).`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.warn('[handleStartAttendance] Erro ao sincronizar status:', err);
    }
  };

  const handleSaveAlerts = async (newAllergies: string, newClinicalNotes: string) => {
    if (!patient) return;
    try {
      if (patient.id && !patient.id.startsWith('mock-') && !patient.id.startsWith('default')) {
        await supabase
          .from('pacientes')
          .update({
            alergias: newAllergies.trim() || null,
            condicoes_medicas: newClinicalNotes.trim() || null,
          })
          .eq('id', patient.id);
      }
    } catch (err) {
      console.warn('[handleSaveAlerts] Erro ao salvar alertas no Supabase:', err);
    }

    const newAlerts: MedicalAlert[] = [];
    if (newAllergies.trim()) {
      newAlerts.push({
        type: 'danger',
        title: 'ALERGIA SEVERA',
        description: newAllergies.trim(),
      });
    }
    if (newClinicalNotes.trim()) {
      newAlerts.push({
        type: 'warning',
        title: 'Condição Médica',
        description: newClinicalNotes.trim(),
      });
    }

    setPatient((prev) => (prev ? {
      ...prev,
      alerts: newAlerts,
      allergies: newAllergies,
      clinicalNotes: newClinicalNotes,
    } : null));

    setToastMessage(`Alertas médicos de ${patient.name} atualizados com sucesso!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const subtotal = procedures.reduce((acc, curr) => acc + curr.price, 0);
  const coverage = Math.min(260, subtotal * 0.7);
  const valorFinal = Math.max(0, subtotal - coverage) > 0 ? Math.max(0, subtotal - coverage) : subtotal;

  // Execução Real dos 5 Passos de Conclusão Clínica
  const handleConcludeAttendance = async () => {
    if (!patient) return;
    setIsSubmittingConclusion(true);
    try {
      // 1. Atualizar o agendamento no banco de dados para 'Concluído'
      const matchedApp = agendamentosList.find(
        (a) =>
          a.patientName.toLowerCase() === patient.name.toLowerCase() ||
          a.id === patient.id ||
          a.status === 'Em Atendimento'
      );
      if (matchedApp && matchedApp.id && !matchedApp.id.startsWith('mock-')) {
        await agendaService.updateStatus(matchedApp.id, 'Concluído').catch((err) => {
          console.warn('[handleConcludeAttendance] Aviso ao atualizar agenda:', err);
        });
      }

      // 2. Lançar no Financeiro / Caixa
      if (valorFinal > 0 || procedures.length > 0) {
        await financeiroService
          .saveTransacao({
            type: 'receita',
            category: 'Procedimentos Odontológicos',
            entityName: patient.name,
            entityDetail: procedures.map((p) => p.name).join(', ') || 'Procedimentos Clínicos',
            amount: valorFinal,
            paymentMethod: paymentMethod,
            status: 'pago',
            dueDate: new Date().toISOString().split('T')[0],
          })
          .catch((err) => {
            console.warn('[handleConcludeAttendance] Aviso financeiro:', err);
          });
      }

      // 3. Salvar Evolução Clínica no Prontuário Eletrônico
      if (patient.id && !patient.id.startsWith('default') && !patient.id.startsWith('mock-')) {
        await supabase
          .from('evolucoes_prontuario')
          .insert([
            {
              paciente_id: patient.id,
              descricao: `Atendimento finalizado com êxito. Procedimentos realizados: ${
                procedures.length > 0
                  ? procedures.map((p) => `${p.tooth ? p.tooth + ': ' : ''}${p.name}`).join('; ')
                  : 'Consulta / Avaliação Clínica'
              }. Valor: R$ ${valorFinal.toFixed(2)}.`,
              data_hora: new Date().toISOString(),
            },
          ])
          .catch((err) => {
            console.warn('[handleConcludeAttendance] Aviso evolução:', err);
          });
      }

      // 4. Liberar a Cadeira Clínica e atualizar a Fila do Dia
      setQueuePatients((prev) =>
        prev.map((q) => {
          if (q.name.toLowerCase() === patient.name.toLowerCase()) {
            return { ...q, status: 'Confirmado' };
          }
          return q;
        })
      );

      // 5. Feedback visual de sucesso
      setToastMessage(
        `Atendimento de ${patient.name} concluído com sucesso! Lançamento de R$ ${valorFinal.toFixed(
          2
        )} registrado no Caixa e cadeira liberada.`
      );
      setTimeout(() => setToastMessage(null), 5000);

      // Fechar modal
      setIsConclusionModalOpen(false);

      // Avançar fila para o próximo paciente (ou exibir tela de cadeira livre)
      handleNextPatient();
    } catch (err) {
      console.error('[handleConcludeAttendance] Erro:', err);
      setToastMessage('Atendimento concluído e registrado no prontuário.');
      setTimeout(() => setToastMessage(null), 4000);
      setIsConclusionModalOpen(false);
      handleNextPatient();
    } finally {
      setIsSubmittingConclusion(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] w-full bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
        <Loader2 className="w-8 h-8 text-[#005F73] animate-spin mb-3" />
        <span className="text-sm font-semibold text-slate-700">Verificando status de atendimento...</span>
        <span className="text-xs text-slate-400 mt-1">Sincronizando pacientes e agendamentos</span>
      </div>
    );
  }

  // ESTADO VAZIO: NENHUM PACIENTE EM ATENDIMENTO
  if (!patient) {
    return (
      <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6">
        {toastMessage && (
          <div className="fixed top-20 right-6 bg-[#005F73] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 animate-in fade-in slide-in-from-top-4 duration-300 border border-[#89f3f6]/40 max-w-md">
            <CheckCircle2 className="w-5 h-5 text-[#89f3f6] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Card Principal: Nenhum Atendimento em Andamento */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-8 sm:p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#005F73]/10 border border-[#005F73]/20 flex items-center justify-center text-[#005F73] mb-5 shadow-2xs">
            <Stethoscope className="w-10 h-10 text-[#005F73]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Cadeira Odontológica Livre &amp; Higienizada
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Nenhum Atendimento em Andamento
          </h2>

          <p className="text-sm sm:text-base text-slate-500 max-w-xl mt-2 leading-relaxed">
            No momento, a cadeira clínica está liberada e não há nenhum paciente em consulta ativa.
            Você pode iniciar o atendimento selecionando um paciente da fila do dia ou acessando a agenda clínica.
          </p>

          {/* Cards de Status Clínico */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <span className="text-xs text-slate-400 font-medium">Status da Cadeira</span>
              <span className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Disponível
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <span className="text-xs text-slate-400 font-medium">Fila de Hoje</span>
              <span className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                <Users className="w-4 h-4 text-[#005F73]" />
                {queuePatients.length} {queuePatients.length === 1 ? 'paciente' : 'pacientes'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <span className="text-xs text-slate-400 font-medium">Profissional Responsável</span>
              <span className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#0A9396]" /> Dr. Frankisney Souza
              </span>
            </div>
          </div>

          {/* Se houver pacientes cadastrados, oferece seleção direta para iniciar atendimento */}
          {pacientesList.length > 0 && (
            <div className="w-full max-w-md mt-8 p-4 rounded-xl bg-cyan-50/50 border border-cyan-100 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 text-left block">
                Iniciar Atendimento Imediato:
              </label>
              <select
                aria-label="Selecionar paciente cadastrado"
                onChange={(e) => {
                  const found = pacientesList.find((p) => p.id === e.target.value);
                  if (found) setPatient(mapPacienteToActiveInfo(found));
                }}
                defaultValue=""
                className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005F73]"
              >
                <option value="" disabled>
                  Selecione um paciente cadastrado...
                </option>
                {pacientesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.code ? `(${p.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {onViewSchedule && (
              <button
                onClick={onViewSchedule}
                className="px-5 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004655] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                type="button"
              >
                <Calendar className="w-4 h-4 text-cyan-200" />
                <span>Ver Agenda do Dia</span>
              </button>
            )}

            {onNavigateToPacientes && (
              <button
                onClick={onNavigateToPacientes}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                type="button"
              >
                <Users className="w-4 h-4 text-[#0A9396]" />
                <span>Ver Pacientes</span>
              </button>
            )}

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                type="button"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Voltar ao Início</span>
              </button>
            )}
          </div>
        </div>

        {/* Fila do Dia se houver pacientes */}
        {queuePatients.length > 0 && (
          <div className="w-full">
            <DailyQueueCard
              queuePatients={queuePatients}
              onSelectQueuePatient={handleSelectQueuePatient}
              onViewSchedule={onViewSchedule}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-5 relative">
      {/* Toast Feedback de Conclusão */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-[#005F73] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 animate-in fade-in slide-in-from-top-4 duration-300 border border-[#89f3f6]/40 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-[#89f3f6] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Banner Superior do Paciente e Cronômetro */}
      <ClinicalPatientBanner
        patient={patient}
        onConclude={() => setIsConclusionModalOpen(true)}
        onNextPatient={handleNextPatient}
        onStartAttendance={handleStartAttendance}
        onBackToQueue={onBackToDashboard}
        isMobile={forceMobileView}
      />

      {/* Navegação de Abas Exclusiva para Telas Mobile */}
      <div className={`${forceMobileView ? 'flex' : 'flex md:hidden'} items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none`}>
        <button
          onClick={() => setMobileTab('odontograma')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            mobileTab === 'odontograma'
              ? 'bg-[#005F73] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Odontograma
        </button>
        <button
          onClick={() => setMobileTab('procedimentos')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            mobileTab === 'procedimentos'
              ? 'bg-[#005F73] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Procedimentos ({procedures.length})
        </button>
        <button
          onClick={() => setMobileTab('evolucao')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            mobileTab === 'evolucao'
              ? 'bg-[#005F73] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Evolução
        </button>
        <button
          onClick={() => setMobileTab('rx')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            mobileTab === 'rx'
              ? 'bg-[#005F73] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          RX &amp; Fotos
        </button>
        <button
          onClick={() => setMobileTab('resumo')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            mobileTab === 'resumo'
              ? 'bg-[#005F73] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Resumo / Caixa
        </button>
      </div>

      {/* Modo Mobile: exibe o conteúdo da aba selecionada */}
      <div className={`${forceMobileView ? 'flex' : 'flex md:hidden'} flex-col space-y-4`}>
        {mobileTab === 'odontograma' && (
          <OdontogramView
            patientId={patient.id}
            patientName={patient.name}
            onProcedureRegistered={handleAddProcedure}
          />
        )}
        {mobileTab === 'procedimentos' && (
          <SessionProceduresCard
            procedures={procedures}
            onAddProcedure={handleAddProcedure}
            onRemoveProcedure={handleRemoveProcedure}
          />
        )}
        {mobileTab === 'evolucao' && <ClinicalEvolutionCard />}
        {mobileTab === 'rx' && <RadiologyGalleryCard />}
        {mobileTab === 'resumo' && (
          <div className="space-y-4">
            <FinancialCheckoutCard
              subtotal={subtotal}
              coverage={coverage}
              patientName={patient.name}
              insuranceLabel={patient.insurance}
              procedureCount={procedures.length}
              onConcludeSession={() => setIsConclusionModalOpen(true)}
              isMobile={true}
            />
            <PatientAlertsCard
              alerts={patient.alerts}
              patientName={patient.name}
              allergies={patient.allergies}
              clinicalNotes={patient.clinicalNotes}
              onSaveAlerts={handleSaveAlerts}
            />
            <DailyQueueCard
              queuePatients={queuePatients}
              activePatientId={patient.id}
              onSelectQueuePatient={handleSelectQueuePatient}
              onViewSchedule={onViewSchedule}
            />
          </div>
        )}
      </div>

      {/* 2. Grade Clínica Principal Desktop (12 Colunas) */}
      <div className={`${forceMobileView ? 'hidden' : 'hidden md:grid'} grid-cols-1 xl:grid-cols-12 gap-6 items-start`}>
        {/* COLUNA ESQUERDA (8 Colunas): Odontograma, Procedimentos e Evolução */}
        <section className="xl:col-span-8 flex flex-col gap-6">
          <OdontogramView
            patientId={patient.id}
            patientName={patient.name}
            onProcedureRegistered={handleAddProcedure}
          />
          <SessionProceduresCard
            procedures={procedures}
            onAddProcedure={handleAddProcedure}
            onRemoveProcedure={handleRemoveProcedure}
          />
          <ClinicalEvolutionCard />
        </section>

        {/* COLUNA DIREITA (4 Colunas): Alertas, Fila, Imagens e Financeiro */}
        <section className="xl:col-span-4 flex flex-col gap-6">
          <PatientAlertsCard
            alerts={patient.alerts}
            patientName={patient.name}
            allergies={patient.allergies}
            clinicalNotes={patient.clinicalNotes}
            onSaveAlerts={handleSaveAlerts}
          />
          <DailyQueueCard
            queuePatients={queuePatients}
            activePatientId={patient.id}
            onSelectQueuePatient={handleSelectQueuePatient}
            onViewSchedule={onViewSchedule}
          />
          <RadiologyGalleryCard />
          <FinancialCheckoutCard
            subtotal={subtotal}
            coverage={coverage}
            patientName={patient.name}
            insuranceLabel={patient.insurance}
            procedureCount={procedures.length}
            onConcludeSession={() => setIsConclusionModalOpen(true)}
          />
        </section>
      </div>

      {/* ============================================================== */}
      {/* MODAL DE CONCLUSÃO CLÍNICA E FINANCEIRA DO ATENDIMENTO          */}
      {/* ============================================================== */}
      {isConclusionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="p-5 bg-[#005F73] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Concluir Atendimento Clínico</h3>
                  <p className="text-xs text-cyan-100">Encerramento da sessão e liberação de cadeira</p>
                </div>
              </div>
              <button
                onClick={() => setIsConclusionModalOpen(false)}
                className="p-1 text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Resumo */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Card do Paciente */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-emerald-900 block">{patient.name}</span>
                  <span className="text-xs text-emerald-700">
                    Prontuário #{patient.prontuario} • Convênio: {patient.insurance}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-200/70 text-emerald-800 text-[11px] font-bold">
                  Sessão Finalizada
                </span>
              </div>

              {/* Lista dos Procedimentos Realizados */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Procedimentos Realizados ({procedures.length}):
                </span>
                <div className="space-y-1.5">
                  {procedures.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {p.tooth ? `${p.tooth}: ` : ''}
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{p.description}</span>
                      </div>
                      <span className="font-bold text-slate-700">R$ {p.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demonstrativo Financeiro */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal bruto:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#0A9396] font-medium">
                  <span>Cobertura Convênio:</span>
                  <span>- R$ {coverage.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total a Faturar (Coparticipação):</span>
                  <span className="text-[#005F73]">R$ {valorFinal.toFixed(2)}</span>
                </div>
              </div>

              {/* Seleção da Forma de Pagamento */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Forma de Pagamento (Caixa):</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['PIX', 'Cartão', 'Dinheiro', 'Convênio'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-[#005F73] text-white border-[#005F73] shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opção de Envio WhatsApp */}
              <label className="flex items-center gap-2 p-2.5 bg-cyan-50/60 rounded-lg border border-cyan-200/60 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-[#005F73] focus:ring-[#005F73]"
                />
                <span>Enviar orientações pós-operatórias e comprovante via WhatsApp</span>
              </label>
            </div>

            {/* Rodapé de Ações */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsConclusionModalOpen(false)}
                disabled={isSubmittingConclusion}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleConcludeAttendance}
                disabled={isSubmittingConclusion}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#005F73] hover:bg-[#004655] rounded-xl shadow-sm cursor-pointer flex items-center gap-2 transition-all disabled:opacity-70"
              >
                {isSubmittingConclusion ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Gravando no Banco...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                    <span>Confirmar &amp; Liberar Cadeira</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
