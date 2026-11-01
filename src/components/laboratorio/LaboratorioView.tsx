import React, { useState, useMemo, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  ChevronRight,
  Eye,
  X,
  Save,
  Check,
  FileText,
  DollarSign,
  Download,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { scrollToTop } from '../../utils/scrollUtils';
import { laboratorioService } from '../../services/laboratorioService';

export type StatusProtese =
  | 'Todos'
  | 'Moldagem / Escaneamento'
  | 'Enviado ao Laboratório'
  | 'Em Confecção'
  | 'Recebido na Recepção'
  | 'Prova Marcada'
  | 'Instalado / Concluído';

export interface PedidoProteseItem {
  id: string;
  osLaboratorio: string;
  pacienteNome: string;
  pacienteProntuario: string;
  dentistaResponsavel: string;
  laboratorioNome: string;
  tipoTrabalho: string;
  elementos: string[]; // ex: ['#11', '#21']
  corEscala: string; // ex: 'BL2', 'A2', '3M2'
  dataEnvio: string;
  dataPrevisaoRetorno: string;
  dataConsultaPaciente?: string;
  valorLaboratorio: number;
  status: Exclude<StatusProtese, 'Todos'>;
  observacoes: string;
  alertaUrgente?: boolean;
}

const INITIAL_PEDIDOS: PedidoProteseItem[] = [];

interface LaboratorioViewProps {
  forceMobileView?: boolean;
}

export const LaboratorioView: React.FC<LaboratorioViewProps> = ({
  forceMobileView = false,
}) => {
  const toast = useToast();
  const [pedidos, setPedidos] = useState<PedidoProteseItem[]>(INITIAL_PEDIDOS);

  // Carregar dados de laboratório do Supabase Self-Hosted
  useEffect(() => {
    let isMounted = true;
    async function loadLab() {
      try {
        const ordensDb = await laboratorioService.getOrdens();
        if (isMounted) {
          setPedidos(ordensDb || []);
        }
      } catch (e) {
        console.warn('Fallback local laboratório:', e);
      }
    }
    loadLab();
    return () => {
      isMounted = false;
    };
  }, []);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusProtese>('Todos');
  const [filtroLaboratorio, setFiltroLaboratorio] = useState('Todos');
  const [filtroDentista, setFiltroDentista] = useState('Todos');

  // View Switching (Regra Arquitetural Mobile-First: Sem Modais)
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');

  // Garante abertura da tela/formulário sempre no início (topo)
  useEffect(() => {
    scrollToTop();
  }, [currentView]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoProteseItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formulário de Novo Pedido
  const [formPaciente, setFormPaciente] = useState('');
  const [formProntuario, setFormProntuario] = useState('#0492');
  const [formDentista, setFormDentista] = useState('Dr. Frankisney Souza');
  const [formLaboratorio, setFormLaboratorio] = useState('Laboratório Precision CAD/CAM');
  const [formTipo, setFormTipo] = useState('Coroa Cerâmica Pura (Zircônia)');
  const [formDentes, setFormDentes] = useState('#11');
  const [formCor, setFormCor] = useState('A2');
  const [formPrevisao, setFormPrevisao] = useState('06/11/2026');
  const [formValor, setFormValor] = useState('380,00');
  const [formObs, setFormObs] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSalvarNovoPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPaciente.trim()) {
      toast.warning('Campo obrigatório', 'Informe o nome do paciente para a OS de prótese.');
      return;
    }
    if (!formTipo.trim()) {
      toast.warning('Campo obrigatório', 'Informe o tipo de trabalho protético.');
      return;
    }

    const novoItem: PedidoProteseItem = {
      id: `LAB-2026-0${pedidos.length + 82}`,
      osLaboratorio: `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      pacienteNome: formPaciente,
      pacienteProntuario: formProntuario,
      dentistaResponsavel: formDentista,
      laboratorioNome: formLaboratorio,
      tipoTrabalho: formTipo,
      elementos: formDentes.split(',').map((s) => s.trim()),
      corEscala: formCor,
      dataEnvio: '28/10/2026',
      dataPrevisaoRetorno: formPrevisao,
      valorLaboratorio: parseFloat(formValor.replace('.', '').replace(',', '.')) || 0,
      status: 'Enviado ao Laboratório',
      observacoes: formObs || 'Ordem de serviço aberta pelo Dr. Frankisney Souza.',
      alertaUrgente: false,
    };

    setPedidos([novoItem, ...pedidos]);
    setCurrentView('list');
    toast.success('Ordem de Serviço criada!', `Trabalho para ${formPaciente} (${formTipo}) enviado ao laboratório.`);

    try {
      await laboratorioService.saveOrdem(novoItem);
    } catch (err) {
      console.warn('Erro ao salvar no Supabase:', err);
    }
  };

  const handleAtualizarStatus = (id: string, novoStatus: Exclude<StatusProtese, 'Todos'>) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p))
    );
    if (pedidoSelecionado && pedidoSelecionado.id === id) {
      setPedidoSelecionado({ ...pedidoSelecionado, status: novoStatus });
    }
    toast.info('Status atualizado', `Pedido protético alterado para: ${novoStatus}`);
  };

  // Filtros
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((item) => {
      const matchBusca =
        busca.trim() === '' ||
        item.pacienteNome.toLowerCase().includes(busca.toLowerCase()) ||
        item.tipoTrabalho.toLowerCase().includes(busca.toLowerCase()) ||
        item.laboratorioNome.toLowerCase().includes(busca.toLowerCase()) ||
        item.id.toLowerCase().includes(busca.toLowerCase()) ||
        item.osLaboratorio.toLowerCase().includes(busca.toLowerCase());

      const matchStatus = filtroStatus === 'Todos' || item.status === filtroStatus;
      const matchLab = filtroLaboratorio === 'Todos' || item.laboratorioNome === filtroLaboratorio;
      const matchDentista =
        filtroDentista === 'Todos' || item.dentistaResponsavel === filtroDentista;

      return matchBusca && matchStatus && matchLab && matchDentista;
    });
  }, [pedidos, busca, filtroStatus, filtroLaboratorio, filtroDentista]);

  // Métricas
  const totalEmProducao = pedidos.filter(
    (p) => p.status === 'Em Confecção' || p.status === 'Enviado ao Laboratório'
  ).length;
  const totalRecebidos = pedidos.filter((p) => p.status === 'Recebido na Recepção').length;
  const totalProvas = pedidos.filter((p) => p.status === 'Prova Marcada').length;
  const pedidosUrgentes = pedidos.filter((p) => p.alertaUrgente);
  const totalInvestimento = pedidos.reduce((acc, p) => acc + (p.valorLaboratorio || 0), 0);

  // Se currentView === 'form': exibe o formulário em tela cheia ocupando 100% da visualização no padrão app nativa
  if (currentView === 'form') {
    return (
      <div className="w-full h-full p-4 md:p-6 animate-in fade-in duration-200 max-w-4xl mx-auto space-y-4">
        {/* Top Bar / Navegação de Retorno Estilo App Nativa */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#005F73]" />
            <span>Voltar para Laboratório &amp; Próteses</span>
          </button>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Emissão de OS Laboratorial
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 sm:p-8">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold">
              <FlaskConical className="w-6 h-6 text-[#005F73]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Novo Pedido Protético
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Emita uma ordem de serviço completa para o laboratório parceiro da clínica.
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvarNovoPedido} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Paciente *
                </label>
                <input
                  type="text"
                  required
                  value={formPaciente}
                  onChange={(e) => setFormPaciente(e.target.value)}
                  placeholder="Nome completo do paciente"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Dentista Solicitante *
                </label>
                <select
                  value={formDentista}
                  onChange={(e) => setFormDentista(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
                >
                  <option value="Dr. Frankisney Souza">Dr. Frankisney Souza (RT)</option>
                  <option value="Dra. Camila Ribeiro">Dra. Camila Ribeiro</option>
                  <option value="Dr. Lucas Ferreira">Dr. Lucas Ferreira</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Laboratório Parceiro *
                </label>
                <select
                  value={formLaboratorio}
                  onChange={(e) => setFormLaboratorio(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
                >
                  <option value="Laboratório Precision CAD/CAM">Laboratório Precision CAD/CAM</option>
                  <option value="Lab Dental Art Prime">Lab Dental Art Prime</option>
                  <option value="Studio Prótese Souza">Studio Prótese Souza</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Trabalho Protético *
                </label>
                <input
                  type="text"
                  required
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  placeholder="Ex: Coroa Cerâmica E-Max, Faceta Zircônia"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Dentes / Elementos *
                </label>
                <input
                  type="text"
                  required
                  value={formDentes}
                  onChange={(e) => setFormDentes(e.target.value)}
                  placeholder="Ex: #11, #21"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Cor Escala Vita *
                </label>
                <input
                  type="text"
                  required
                  value={formCor}
                  onChange={(e) => setFormCor(e.target.value)}
                  placeholder="Ex: A2, BL2, 3M2"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Previsão Retorno *
                </label>
                <input
                  type="text"
                  required
                  value={formPrevisao}
                  onChange={(e) => setFormPrevisao(e.target.value)}
                  placeholder="dd/mm/aaaa"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Observações Técnicas para o Protético
              </label>
              <textarea
                rows={3}
                value={formObs}
                onChange={(e) => setFormObs(e.target.value)}
                placeholder="Detalhes de término cervical, transparência, textura, contato oclusal ou antagonista..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#005F73] text-white text-xs sm:text-sm font-bold hover:bg-[#004857] shadow-xs cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Emitir Ordem de Serviço</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#005F73] text-white shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#89f3f6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0">
              <FlaskConical className="w-6 h-6 text-[#005F73]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  Laboratório & Trabalhos Protéticos
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#005F73]/10 text-[#005F73] font-bold">
                  {pedidos.length} Pedidos
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Acompanhamento em tempo real de coroas, facetas, placas, alinhadores e próteses sobre implante.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView('form')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pedido Protético</span>
          </button>
        </div>
      </div>

      {/* ALERTA DE PRÓTESE COM CONSULTA PRÓXIMA */}
      {pedidosUrgentes.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                Atenção: Consulta agendada com peça protética em confecção!
              </p>
              <p className="text-xs text-amber-700">
                A paciente <strong>Mariana Rios</strong> tem consulta amanhã às 14:00 (Dr. Frankisney Souza) e a Coroa Zircônia #21 ainda consta como "Em Confecção".
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const item = pedidos.find((p) => p.id === 'LAB-2026-081');
              if (item) setPedidoSelecionado(item);
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
          >
            Cobrar Laboratório
          </button>
        </div>
      )}

      {/* 2. CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Em Produção no Lab</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{totalEmProducao}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Aguardando entrega</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Recebidos na Clínica</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-600">{totalRecebidos}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Prontos na recepção</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Provas Agendadas</span>
            <div className="w-8 h-8 rounded-lg bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#005F73]">{totalProvas}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Pacientes confirmados</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Investimento em Lab</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">
              R$ {totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Custo no mês atual</span>
          </div>
        </div>
      </div>

      {/* 3. BARRA DE FILTROS & BUSCA */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por paciente, tipo de trabalho, laboratório, OS..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusProtese)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer"
            >
              <option value="Todos">Status: Todos</option>
              <option value="Moldagem / Escaneamento">Moldagem / Escaneamento</option>
              <option value="Enviado ao Laboratório">Enviado ao Laboratório</option>
              <option value="Em Confecção">Em Confecção</option>
              <option value="Recebido na Recepção">Recebido na Recepção</option>
              <option value="Prova Marcada">Prova Marcada</option>
              <option value="Instalado / Concluído">Instalado / Concluído</option>
            </select>

            <select
              value={filtroLaboratorio}
              onChange={(e) => setFiltroLaboratorio(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer"
            >
              <option value="Todos">Laboratório: Todos</option>
              <option value="Laboratório Precision CAD/CAM">Precision CAD/CAM</option>
              <option value="Lab Dental Art Prime">Dental Art Prime</option>
              <option value="Studio Prótese Souza">Studio Souza</option>
            </select>

            <select
              value={filtroDentista}
              onChange={(e) => setFiltroDentista(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer"
            >
              <option value="Todos">Dentista: Todos</option>
              <option value="Dr. Frankisney Souza">Dr. Frankisney Souza</option>
              <option value="Dra. Camila Ribeiro">Dra. Camila Ribeiro</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. TABELA DE PEDIDOS PROTÉTICOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">OS / Pedido</th>
                <th className="py-3 px-4">Paciente & Dentista</th>
                <th className="py-3 px-4">Trabalho Protético</th>
                <th className="py-3 px-4">Dentes & Cor</th>
                <th className="py-3 px-4">Laboratório</th>
                <th className="py-3 px-4">Previsão Retorno</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidosFiltrados.map((item) => {
                let badgeStatus = 'bg-slate-100 text-slate-700 border-slate-200';
                if (item.status === 'Recebido na Recepção') {
                  badgeStatus = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
                } else if (item.status === 'Em Confecção') {
                  badgeStatus = 'bg-sky-50 text-sky-700 border-sky-200';
                } else if (item.status === 'Prova Marcada') {
                  badgeStatus = 'bg-purple-50 text-purple-700 border-purple-200';
                } else if (item.status === 'Instalado / Concluído') {
                  badgeStatus = 'bg-teal-50 text-teal-800 border-teal-200';
                } else if (item.status === 'Enviado ao Laboratório') {
                  badgeStatus = 'bg-amber-50 text-amber-800 border-amber-200';
                }

                return (
                  <tr
                    key={item.id}
                    onClick={() => setPedidoSelecionado(item)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-xs">{item.id}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.osLaboratorio}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-xs">
                          {item.pacienteNome}
                        </span>
                        <span className="text-[11px] text-[#005F73] font-medium">
                          {item.dentistaResponsavel}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-medium text-slate-800 text-xs block">
                        {item.tipoTrabalho}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0A9396] text-xs">
                          {item.elementos.join(', ')}
                        </span>
                        <span className="text-[11px] text-slate-500">Cor: {item.corEscala}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs text-slate-700 font-medium">
                        {item.laboratorioNome}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-xs">
                          {item.dataPrevisaoRetorno}
                        </span>
                        {item.dataConsultaPaciente && (
                          <span className="text-[10px] text-slate-400">
                            Consulta: {item.dataConsultaPaciente.slice(0, 10)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${badgeStatus}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPedidoSelecionado(item);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 hover:opacity-80 transition-opacity cursor-pointer"
                        title="Ver detalhes da ordem protética"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    Nenhum pedido protético registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL / SLIDE-OVER: DETALHES DO PEDIDO PROTÉTICO                          */}
      {/* ========================================================================= */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setPedidoSelecionado(null)}
          />

          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005F73] text-white flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-[#89f3f6]" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-[#005F73]">
                    {pedidoSelecionado.id} • {pedidoSelecionado.osLaboratorio}
                  </span>
                  <h2 className="text-base font-bold text-slate-800">
                    {pedidoSelecionado.tipoTrabalho}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setPedidoSelecionado(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Box Paciente & Profissional */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Paciente:</span>
                  <span className="font-bold text-slate-800">
                    {pedidoSelecionado.pacienteNome} ({pedidoSelecionado.pacienteProntuario})
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Dentista Solicitante:</span>
                  <span className="font-semibold text-[#005F73]">
                    {pedidoSelecionado.dentistaResponsavel}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Laboratório Parceiro:</span>
                  <span className="font-semibold text-slate-800">
                    {pedidoSelecionado.laboratorioNome}
                  </span>
                </div>
              </div>

              {/* Box Especificações Protéticas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">Elementos / Dentes</span>
                  <span className="text-xs font-bold text-[#0A9396] block mt-0.5">
                    {pedidoSelecionado.elementos.join(', ')}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">Cor Selecionada</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {pedidoSelecionado.corEscala}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">Data de Envio</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {pedidoSelecionado.dataEnvio}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">Previsão Retorno</span>
                  <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                    {pedidoSelecionado.dataPrevisaoRetorno}
                  </span>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Orientações Clínicas & Preparo
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  {pedidoSelecionado.observacoes}
                </div>
              </div>

              {/* Ações Rápidas de Mudança de Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Avançar Status do Trabalho
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleAtualizarStatus(pedidoSelecionado.id, 'Recebido na Recepção')
                    }
                    className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Recebido na Recepção</span>
                  </button>

                  <button
                    onClick={() =>
                      handleAtualizarStatus(pedidoSelecionado.id, 'Prova Marcada')
                    }
                    className="p-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>Prova Marcada</span>
                  </button>

                  <button
                    onClick={() =>
                      handleAtualizarStatus(pedidoSelecionado.id, 'Instalado / Concluído')
                    }
                    className="p-2.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer col-span-2"
                  >
                    <Check className="w-4 h-4 text-teal-600" />
                    <span>Concluir e Instalar na Boca</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Custo de Laboratório: <strong>R$ {pedidoSelecionado.valorLaboratorio.toFixed(2)}</strong>
              </span>
              <button
                onClick={() => setPedidoSelecionado(null)}
                className="px-4 py-2 rounded-lg bg-[#005F73] text-white hover:bg-[#004857] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
