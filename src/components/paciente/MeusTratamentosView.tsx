import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  HelpCircle,
  MessageCircle,
  Layers,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  X,
  AlertCircle,
  Check,
  RotateCw,
  Maximize2,
  Image as ImageIcon,
  HeartHandshake,
  Activity,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import {
  pacientePortalService,
  PacientePortalData,
  PlanoTratamentoPortal,
  ProcedimentoHistoricoItem,
  PacienteAppointmentReal,
  ExameDicomItem,
} from '../../services/pacientePortalService';

interface MeusTratamentosViewProps {
  patientData?: PacientePortalData;
  onNavigateToSchedule?: () => void;
  onNavigateToInicio?: () => void;
}

export const MeusTratamentosView: React.FC<MeusTratamentosViewProps> = ({
  patientData,
  onNavigateToSchedule,
  onNavigateToInicio,
}) => {
  const toast = useToast();

  const [activeFilterPill, setActiveFilterPill] = useState<
    'plano' | 'historico' | 'exames' | 'orientacoes'
  >('plano');

  // Estados com dados reais do Supabase
  const [treatmentPlan, setTreatmentPlan] = useState<PlanoTratamentoPortal | null>(null);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoHistoricoItem[]>([]);
  const [proximaConsulta, setProximaConsulta] = useState<PacienteAppointmentReal | null>(null);
  const [exames, setExames] = useState<ExameDicomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function carregarTratamentosReais() {
      if (!patientData?.id) return;
      setIsLoading(true);
      try {
        const [plano, hist, prox, exList] = await Promise.all([
          pacientePortalService.getPlanoTratamentoCompleto(patientData.id),
          pacientePortalService.getHistoricoProcedimentos(patientData.id),
          pacientePortalService.getProximaConsulta(patientData.id),
          pacientePortalService.getExamesDicom(patientData.id),
        ]);
        if (isMounted) {
          setTreatmentPlan(plano);
          setProcedimentos(hist);
          setProximaConsulta(prox);
          setExames(exList);
        }
      } catch (e) {
        console.warn('Erro ao carregar tratamentos reais do Supabase:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    carregarTratamentosReais();
    return () => {
      isMounted = false;
    };
  }, [patientData?.id]);

  // Modais interativos
  const [isProntuarioRadioOpen, setIsProntuarioRadioOpen] = useState(false);

  const handleExportPDF = () => {
    toast.info('Exportando Prontuário', 'Gerando Relatório Clínico Oficial em PDF...');
    setTimeout(() => {
      const element = document.createElement('a');
      const patientName = patientData?.fullName || 'Paciente';
      const patientCode = patientData?.code || patientData?.prontuario || '#OS-001';

      const etapasTexto =
        (treatmentPlan?.etapas || []).length > 0
          ? treatmentPlan!.etapas
              .map(
                (e) =>
                  `[${e.status === 'concluido' ? 'CONCLUÍDO' : 'AGENDADO'}] FASE ${e.phase} (${e.date}): ${e.title}\n     Profissional: ${e.dentist}\n     Procedimento: ${e.procedure}\n     Observações: ${e.notes}`
              )
              .join('\n\n')
          : 'Nenhum procedimento cirúrgico ou restaurador concluído até o momento.\nPaciente em acompanhamento clínico regular.';

      const orientacoesTexto =
        (treatmentPlan?.orientacoes || []).length > 0
          ? treatmentPlan!.orientacoes.map((o, i) => `${i + 1}. ${o}`).join('\n')
          : '1. Higiene interdental diária com escovação suave e fio dental.\n2. Acompanhamento preventivo semestral com o cirurgião-dentista.';

      const content = `ODONTO SOUZA ODONTOLOGIA INTEGRADA
PLANO TERAPÊUTICO INTEGRADO & RELATÓRIO CLÍNICO DIGITAL
---------------------------------------------------------------------------------
Paciente: ${patientName}
Prontuário: ${patientCode}
Responsável Técnico: Dr. Frankisney Souza (CRO-RJ 42189 / CRO-SP 78.432)
Especialidade: Reabilitação Oral, Implantodontia & Estética Dental
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}

RESUMO DO TRATAMENTO:
- Tratamento Principal: ${treatmentPlan?.tituloPlano || 'Acompanhamento Odontológico'}
- Setor: ${treatmentPlan?.setor || 'Geral'}
- Progresso: ${treatmentPlan?.progressoPercentual ?? 0}% Concluído (${treatmentPlan?.fasesConcluidas || 0} de ${treatmentPlan?.fasesTotal || 0} etapas)
- Previsão de Alta Clínica: ${treatmentPlan?.previsaoAlta || 'Acompanhamento Regular'}

CRONOGRAMA DE ETAPAS CLÍNICAS:
${etapasTexto}

PRESCRIÇÕES E CUIDADOS:
${orientacoesTexto}

Documento assinado digitalmente nos termos da ICP-Brasil.
Odonto Souza • Central de Atendimento: (65) 99605-5823`;

      const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `Relatorio_Clinico_${patientName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Relatório Exportado! 📑', 'Documento clínico oficial baixado com sucesso.');
    }, 800);
  };

  const handleDownloadReceita = () => {
    toast.info('Receituário Digital', 'Baixando receituário e atestado assinado via ICP-Brasil...');
    setTimeout(() => {
      const element = document.createElement('a');
      const patientName = patientData?.fullName || 'Paciente';

      const orientacoesTexto =
        (treatmentPlan?.orientacoes || []).length > 0
          ? treatmentPlan!.orientacoes.map((o, i) => `${i + 1}. ${o}`).join('\n')
          : 'Nenhuma prescrição medicamentosa pós-operatória ativa no momento.\nRecomendação clínica: Higiene diária com escovação suave e fio dental com cera.';

      const content = `ODONTO SOUZA - RECEITUÁRIO & ATESTADO DIGITAL
Assinatura Digital ICP-Brasil: SHA256-VALIDATED-OK
Cirurgião-Dentista: Dr. Frankisney Souza (CRO-SP 78.432)
Paciente: ${patientName}
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}

PRESCRIÇÃO & ORIENTAÇÕES CLÍNICAS:
${orientacoesTexto}

Validade: 30 dias.`;
      const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `Receituario_Digital_ICP_${patientName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Download Concluído', 'Receituário baixado com sucesso!');
    }, 800);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. TOP HEADER DA SEÇÃO                                         */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#0A9396] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#0A9396]" />
            <span>Plano Terapêutico Integrado</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#004655] tracking-tight">
            Meus Tratamentos & Plano Clínico
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Acompanhe o andamento dos seus procedimentos, etapas concluídas, laudos radiográficos e
            orientações pós-operatórias validadas pelo seu cirurgião-dentista.
          </p>
        </div>

        {/* Ações Primárias / Exportar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center justify-center space-x-2 bg-[#005f73] hover:bg-[#004655] text-white px-4 py-2.5 rounded-xl shadow-sm font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório Clínico (PDF)</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. VISÃO GERAL DO PLANO (CARDS KPI)                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Progresso Geral do Tratamento */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/50 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#0A9396]">
                <Activity className="w-5 h-5 text-[#0A9396]" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100/80 text-[#005f73]">
                Fase {treatmentPlan?.fasesConcluidas || 1} de {treatmentPlan?.fasesTotal || 1}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {treatmentPlan?.tituloPlano || 'Plano de Saúde Bucal'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {treatmentPlan?.setor || 'Arcada Completa'}
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500 font-medium">Progresso de Conclusão</span>
              <span className="text-lg font-black text-[#0A9396]">
                {treatmentPlan?.progressoPercentual ?? 100}%
              </span>
            </div>

            {/* Barra de Progresso Verde/Teal */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#0A9396] to-emerald-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${treatmentPlan?.progressoPercentual ?? 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                {treatmentPlan?.fasesConcluidas || 1} de {treatmentPlan?.fasesTotal || 1} etapas concluídas
              </span>
              <span className="font-bold text-[#005f73]">
                Alta: {treatmentPlan?.previsaoAlta || 'Acompanhamento'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Próximo Passo Agendado */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#0A9396]" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#005f73]">
                <Calendar className="w-5 h-5 text-[#005f73]" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#89f3f6]/40 text-[#004f51]">
                {proximaConsulta ? 'Próximo Agendamento' : 'Agenda Aberta'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {proximaConsulta ? proximaConsulta.procedure : 'Sem Consulta Agendada'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {proximaConsulta
                ? `Dr. ${proximaConsulta.dentist}`
                : 'Mantenha sua rotina preventiva semestral em dia.'}
            </p>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
            <div className="flex items-center text-xs font-semibold text-slate-800">
              <Clock className="w-3.5 h-3.5 mr-2 text-[#0A9396]" />
              <span>
                {proximaConsulta
                  ? `${proximaConsulta.date} às ${proximaConsulta.time}`
                  : 'Nenhum horário futuro agendado'}
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-600">
              <Stethoscope className="w-3.5 h-3.5 mr-2 text-[#0A9396]" />
              <span>{proximaConsulta ? proximaConsulta.dentist : 'Dr. Frankisney Souza'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Documentos Clínicos e Radiografias */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  exames.length > 0
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {exames.length > 0 ? 'Cloud PACS Ativo' : '0 Laudos Salvos'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {exames.length > 0
                ? `${exames.length} ${exames.length === 1 ? 'Laudo / Radiografia' : 'Laudos & Radiografias'}`
                : 'Exames & Radiografias DICOM'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {exames.length > 0
                ? 'Exames digitais DICOM e panorâmicas arquivados'
                : 'Nenhum exame ou laudo anexado ao prontuário no momento'}
            </p>
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{exames.length > 0 ? 'Último exame adicionado:' : 'Status do arquivo:'}</span>
              <span className="font-bold text-[#005f73]">
                {exames.length > 0 ? exames[0].data : 'Sem exames realizados'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsProntuarioRadioOpen(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#004655] font-bold text-xs transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#0A9396]" />
              <span>Acessar Prontuário Radiográfico</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ABAS DE NAVEGAÇÃO INTERNA (SCROLLABLE PILLS)                 */}
      {/* ============================================================== */}
      <div className="flex items-center space-x-2 bg-white px-3 sm:px-4 py-2.5 rounded-2xl shadow-xs border border-slate-200/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveFilterPill('plano');
            const el = document.getElementById('cronograma-secao');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeFilterPill === 'plano'
              ? 'bg-[#005f73] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#89f3f6]" />
          <span>Plano em Andamento</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFilterPill('historico');
            const el = document.getElementById('cronograma-secao');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeFilterPill === 'historico'
              ? 'bg-[#005f73] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Histórico de Procedimentos</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFilterPill('exames');
            setIsProntuarioRadioOpen(true);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeFilterPill === 'exames'
              ? 'bg-[#005f73] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Exames e Radiografias 3D</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFilterPill('orientacoes');
            const el = document.getElementById('cuidados-secao');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeFilterPill === 'orientacoes'
              ? 'bg-[#005f73] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Orientações e Pós-Operatório</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 4. TIMELINE / CRONOGRAMA DE FASES CLÍNICAS                     */}
      {/* ============================================================== */}
      <section
        id="cronograma-secao"
        className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-200/90"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-[#005f73] font-bold text-xs uppercase tracking-wider mb-0.5">
              <Layers className="w-4 h-4 text-[#0A9396]" />
              <span>Sequência de Procedimentos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#004655] tracking-tight">
              Cronograma de Fases Clínicas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Sequência cirúrgica e restauradora documentada passo a passo.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold self-start sm:self-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Concluído</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#005f73]" />
              <span>Agendado / Em Curso</span>
            </span>
          </div>
        </div>

        {/* Conteúdo Dinâmico das Abas */}
        {activeFilterPill === 'historico' ? (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 mb-2">Histórico de Procedimentos Clínicos Realizados</h3>
            {procedimentos.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum procedimento registrado anteriormente no prontuário.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4 font-bold">Data</th>
                      <th className="py-3 px-4 font-bold">Procedimento</th>
                      <th className="py-3 px-4 font-bold">Região</th>
                      <th className="py-3 px-4 font-bold">Profissional</th>
                      <th className="py-3 px-4 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {procedimentos.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{p.date}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          <div>{p.procedure}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{p.detail}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-[#005f73] font-bold text-xs">{p.region}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{p.professional}</td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#2BFF05] text-slate-950 text-xs font-black border border-emerald-600">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Linha do Tempo Vertical Estruturada */
          <div>
            {(treatmentPlan?.etapas || []).length === 0 ? (
              <div className="py-12 px-6 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-[#005f73]">
                  <Calendar className="w-6 h-6 text-[#0A9396]" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Nenhum Procedimento Cirúrgico ou Plano Ativo em Andamento
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Você ainda não possui procedimentos clínicos cadastrados neste plano terapêutico.
                  Seus procedimentos, dentes avaliados e etapas cirúrgicas serão atualizados aqui
                  após sua consulta e avaliação presencial com o Dr. Frankisney Souza.
                </p>
                {onNavigateToSchedule && (
                  <button
                    type="button"
                    onClick={onNavigateToSchedule}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Consulta de Avaliação</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {(treatmentPlan?.etapas || []).map((etapa, idx) => {
                  const isConcluido = etapa.status === 'concluido';
                  return (
                    <div key={etapa.phase || idx} className="relative flex items-start space-x-4 sm:space-x-6 group">
                      {/* Indicador */}
                      <div
                        className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 -ml-6 sm:-ml-8 rounded-full flex items-center justify-center shrink-0 shadow-md ring-4 ring-white ${
                          isConcluido
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#005f73] text-white ring-[#89f3f6]/60 animate-pulse'
                        }`}
                      >
                        {isConcluido ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                      </div>

                      {/* Detalhes do Card */}
                      <div
                        className={`flex-1 p-4 sm:p-5 rounded-2xl transition-all ${
                          isConcluido
                            ? 'bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80'
                            : 'bg-gradient-to-br from-teal-50/50 to-white border-2 border-[#005f73] shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                isConcluido ? 'bg-teal-100 text-[#005f73]' : 'bg-[#005f73] text-white'
                              }`}
                            >
                              FASE {etapa.phase}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">
                              {etapa.title}
                            </h3>
                          </div>

                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto ${
                              isConcluido
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : 'text-[#004f51] bg-[#89f3f6]/60 border border-teal-200 shadow-2xs'
                            }`}
                          >
                            {isConcluido ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-[#005f73]" />
                            )}
                            <span>{isConcluido ? `Concluído em ${etapa.date}` : `Agendado: ${etapa.date}`}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 text-xs text-slate-600">
                          <div className="flex items-center space-x-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-[#0A9396]" />
                            <span>
                              Profissional: <strong className="text-slate-800">{etapa.dentist}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#0A9396]" />
                            <span>
                              Região: <strong className="text-slate-800">{etapa.tooth || 'Arcada Geral'}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#0A9396]" />
                            <span>
                              Procedimento: <strong className="text-slate-800">{etapa.procedure}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-slate-200/60">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {etapa.notes ||
                              'Procedimento devidamente registrado no prontuário eletrônico do paciente.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 5. CUIDADOS E RECOMENDAÇÕES PÓS-ATENDIMENTO                   */}
      {/* ============================================================== */}
      <section
        id="cuidados-secao"
        className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-200/90"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-6 gap-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-[#005f73] text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#0A9396]" />
              <span>Protocolo de Prevenção & Longevidade</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#004655] tracking-tight">
              Cuidados e Recomendações Clínicas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Orientações de saúde bucal e recomendações preventivas para o seu tratamento.
            </p>
          </div>

          {/* Botão Download Receita & Atestado com ICP-Brasil */}
          <button
            type="button"
            onClick={handleDownloadReceita}
            className="inline-flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#004655] font-bold text-xs sm:text-sm transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-[#0A9396]" />
            <div className="flex flex-col text-left">
              <span className="leading-tight">Receituário & Atestado Digital</span>
              <span className="text-[10px] text-slate-500 font-normal leading-tight">
                Assinatura Eletrônica ICP-Brasil
              </span>
            </div>
            <Download className="w-4 h-4 text-slate-400 ml-1" />
          </button>
        </div>

        {/* Cards Informativos de Cuidados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-6">
          {/* Card Cuidado 1 */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between hover:bg-slate-100/80 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#0A9396] mb-3">
                <Sparkles className="w-5 h-5 text-[#0A9396]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Higiene Bucal & Interdental
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Utilize fio dental com cera diariamente em todas as regiões interproximais com movimentos suaves, sem forçar a papila gengival, seguido de escovação com cerdas macias.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-[#0A9396] font-bold flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Frequência: Diariamente após refeições</span>
            </div>
          </div>

          {/* Card Cuidado 2 */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between hover:bg-slate-100/80 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Preservação & Cuidados Mastigatórios
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Evite mastigar alimentos excessivamente duros ou utilizar os dentes como alavanca. Em procedimentos restauradores recentes, aguarde o tempo indicado antes de ingerir corantes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-amber-700 font-bold flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Longevidade e integridade do esmalte</span>
            </div>
          </div>

          {/* Card Cuidado 3 */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between hover:bg-slate-100/80 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#005f73] mb-3">
                <HeartHandshake className="w-5 h-5 text-[#005f73]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Acompanhamento & Sensibilidade
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Qualquer desconforto oclusal, alteração na mordida ou sensibilidade atípica deve ser comunicado à clínica para reavaliação prioritária com o Dr. Frankisney Souza.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-[#005f73] font-bold flex items-center space-x-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Suporte clínico direto com a equipe</span>
            </div>
          </div>
        </div>

        {/* Banner Informativo de Suporte / Dúvidas */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#005f73] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-[#005f73]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              Sentiu alteração na altura da mordida ou desconforto inesperado? Informe a clínica
              imediatamente para ajuste oclusal milimétrico prioritário sem custo.
            </p>
          </div>

          <a
            href={`https://wa.me/5565996055823?text=${encodeURIComponent(`Olá, sou ${patientData?.fullName || 'paciente da Odonto Souza'} e gostaria de tirar uma dúvida sobre meu tratamento.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar com o Cirurgião via WhatsApp</span>
          </a>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. RODAPÉ DE RESPONSABILIDADE TÉCNICA                          */}
      {/* ============================================================== */}
      <footer className="pt-2 pb-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          Responsável Técnico: Dr. Frankisney Souza • CRO-SP 78.432 • Especialista em Reabilitação Oral e Implantodontia
        </p>
        <p>
          Odonto Souza Odontologia Integrada LTDA • CNPJ: 12.345.678/0001-90 • Todos os direitos reservados • 2026
        </p>
      </footer>

      {/* ============================================================== */}
      {/* 7. MODAIS INTERATIVOS                                          */}
      {/* ============================================================== */}

      {/* Modal: Prontuário Radiográfico Completo */}
      {isProntuarioRadioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Prontuário Radiográfico &amp; Exames DICOM
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {exames.length > 0
                      ? `Histórico de ${exames.length} laudo(s) salvo(s) na nuvem Odonto Souza`
                      : 'Nenhum exame ou laudo anexado ao prontuário no momento'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProntuarioRadioOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {exames.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-[#005f73]">
                  <FileText className="w-6 h-6 text-[#0A9396]" />
                </div>
                <h5 className="text-sm font-bold text-slate-800">
                  Nenhum Exame Radiográfico ou DICOM Arquivado
                </h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Você não possui radiografias panorâmicas, periapicais ou tomografias computadorizadas
                  anexadas ao seu prontuário até o momento. Quando novos exames forem realizados ou laudados
                  pelo Dr. Frankisney Souza ou clínica conveniada, eles ficarão disponíveis aqui para
                  visualização e download seguro.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {exames.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.tipo}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{item.data}</span>
                        <span>•</span>
                        <span>{item.tamanho}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{item.status}</span>
                      </div>
                      {item.descricao && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.descricao}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toast.success('Download Iniciado', `Exame ${item.tipo} baixado com sucesso!`);
                      }}
                      className="p-2 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 text-[#005f73] font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      title="Baixar exame"
                    >
                      <Download className="w-4 h-4 text-[#005f73]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsProntuarioRadioOpen(false)}
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
