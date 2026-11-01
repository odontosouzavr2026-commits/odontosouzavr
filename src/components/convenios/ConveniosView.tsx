import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Building2,
  Plus,
  Search,
  Filter,
  X,
  Eye,
  Pencil,
  Trash2,
  Download,
  Upload,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Percent,
  Calendar,
  RotateCcw,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { ConvenioItem, ConvenioFormData } from '../../types/convenios';
import { conveniosService } from '../../services/conveniosService';
import { ConvenioFormView } from './ConvenioFormView';
import { useToast } from '../../contexts/ToastContext';
import { scrollToTop } from '../../utils/scrollUtils';
import {
  BTN_IMPORTAR_CLASS,
  BTN_EXPORTAR_CLASS,
  ACTION_BUTTON_CLASSES,
} from '../../utils/buttonStyles';

export const ConveniosView: React.FC = () => {
  const toast = useToast();

  const [convenios, setConvenios] = useState<ConvenioItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'details'>('list');
  const [editingConvenio, setEditingConvenio] = useState<ConvenioItem | null>(null);
  const [viewingConvenio, setViewingConvenio] = useState<ConvenioItem | null>(null);

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Ativo' | 'Inativo'>('todos');

  // Modal de confirmação de exclusão
  const [convenioToDelete, setConvenioToDelete] = useState<ConvenioItem | null>(null);

  useEffect(() => {
    carregarConvenios();
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [currentView]);

  const carregarConvenios = async () => {
    setIsLoading(true);
    try {
      const data = await conveniosService.getConvenios();
      setConvenios(data);
    } catch (err) {
      toast.error('Erro', 'Não foi possível carregar a lista de convênios.');
    } finally {
      setIsLoading(false);
    }
  };

  // Métricas de topo
  const metrics = useMemo(() => {
    const total = convenios.length;
    const ativos = convenios.filter((c) => c.status === 'Ativo').length;
    const inativos = convenios.filter((c) => c.status === 'Inativo').length;
    const totalPacientes = convenios.reduce((acc, c) => acc + (c.totalPacientesVinculados || 0), 0);
    const mediaRepasse =
      convenios.length > 0
        ? Math.round(convenios.reduce((acc, c) => acc + (c.diasRepasse || 0), 0) / convenios.length)
        : 0;

    return { total, ativos, inativos, totalPacientes, mediaRepasse };
  }, [convenios]);

  // Lista filtrada
  const filteredConvenios = useMemo(() => {
    return convenios.filter((c) => {
      const matchSearch =
        c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.razaoSocial || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.registroAns || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.cnpj || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'todos' || c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [convenios, searchQuery, statusFilter]);

  // Handlers
  const handleAddNew = () => {
    setEditingConvenio(null);
    setCurrentView('form');
  };

  const handleEdit = (c: ConvenioItem) => {
    setEditingConvenio(c);
    setCurrentView('form');
  };

  const handleView = (c: ConvenioItem) => {
    setViewingConvenio(c);
    setCurrentView('details');
  };

  const handleSave = async (dados: ConvenioFormData) => {
    try {
      await conveniosService.salvarConvenio(dados, editingConvenio?.id);
      toast.success(
        editingConvenio ? 'Convênio Atualizado! 🛡️' : 'Convênio Cadastrado! 🎉',
        `A operadora ${dados.nome} foi salva com sucesso no sistema clínico.`
      );
      await carregarConvenios();
      setCurrentView('list');
    } catch {
      toast.error('Erro ao Salvar', 'Não foi possível registrar o convênio.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!convenioToDelete) return;
    try {
      await conveniosService.excluirConvenio(convenioToDelete.id);
      toast.warning('Convênio Removido', `O registro de ${convenioToDelete.nome} foi excluído.`);
      setConvenioToDelete(null);
      await carregarConvenios();
    } catch {
      toast.error('Erro', 'Não foi possível excluir o convênio.');
    }
  };

  const handleToggleStatus = async (c: ConvenioItem) => {
    const nextStatus = c.status === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      await conveniosService.alternarStatusConvenio(c.id, nextStatus);
      toast.info('Status Atualizado', `${c.nome} foi alterado para ${nextStatus}.`);
      await carregarConvenios();
    } catch {
      toast.error('Erro', 'Não foi possível alterar o status.');
    }
  };

  const handleExportCSV = () => {
    toast.info('Exportando Dados', 'Gerando arquivo de convênios cadastrados...');
    const header = 'Nome,Razão Social,Registro ANS,CNPJ,Prazo Repasse (Dias),Coparticipação (%),Status,Pacientes\n';
    const rows = filteredConvenios
      .map(
        (c) =>
          `"${c.nome}","${c.razaoSocial || ''}","${c.registroAns || ''}","${c.cnpj || ''}",${c.diasRepasse},${c.taxaCoparticipacao || 0},"${c.status}",${c.totalPacientesVinculados || 0}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convenios_odonto_souza_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exportação Concluída', 'Arquivo CSV baixado com sucesso!');
  };

  const handleImportClick = () => {
    toast.info('Importar Convênios', 'Selecione uma planilha CSV ou XML padrão TISS para importar.');
  };

  // Se a tela ativa for o formulário inline, renderiza o formulário substituindo a listagem
  if (currentView === 'form') {
    return (
      <ConvenioFormView
        initialData={editingConvenio}
        onSave={handleSave}
        onCancel={() => {
          setEditingConvenio(null);
          setCurrentView('list');
        }}
      />
    );
  }

  // Se a tela ativa for a visualização detalhada
  if (currentView === 'details' && viewingConvenio) {
    return (
      <div className="w-full flex-1 flex flex-col min-h-screen bg-[#f8f9ff]">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewingConvenio(null);
                  setCurrentView('list');
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Voltar para a lista"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
              </button>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#005f73] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  Prontuário de Operadora
                </span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  {viewingConvenio.nome}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleEdit(viewingConvenio)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:opacity-80 text-white font-bold text-xs sm:text-sm shadow-xs transition-opacity cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Editar Convênio</span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#005f73] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-[#8bd1e8]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{viewingConvenio.nome}</h2>
                  <p className="text-xs text-slate-500">{viewingConvenio.razaoSocial || 'Sem razão social cadastrada'}</p>
                </div>
              </div>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold w-max ${
                  viewingConvenio.status === 'Ativo'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {viewingConvenio.status === 'Ativo' ? '● Parceria Ativa' : '○ Parceria Inativa'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Registro ANS</span>
                <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                  {viewingConvenio.registroAns || 'Isento / Não informado'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">CNPJ</span>
                <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                  {viewingConvenio.cnpj || 'Não informado'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Mensalidade</span>
                <p className="text-sm font-black text-emerald-700 mt-0.5">
                  {viewingConvenio.cobreMensalidade && (viewingConvenio.valorMensalidade ?? 0) > 0
                    ? `R$ ${viewingConvenio.valorMensalidade?.toFixed(2).replace('.', ',')}/mês`
                    : 'Sem Mensalidade (R$ 0,00)'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Prazo de Repasse</span>
                <p className="text-sm font-black text-[#005f73] mt-0.5">
                  {viewingConvenio.diasRepasse === 0 ? 'Imediato (0 dias)' : `${viewingConvenio.diasRepasse} dias`}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Coparticipação</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {viewingConvenio.taxaCoparticipacao ? `${viewingConvenio.taxaCoparticipacao}%` : 'Sem coparticipação'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Central de Autorizações</span>
                <p className="text-xs text-slate-700">
                  <strong>Telefone:</strong> {viewingConvenio.telefoneContato || 'Não cadastrado'}
                </p>
                <p className="text-xs text-slate-700">
                  <strong>E-mail:</strong> {viewingConvenio.emailContato || 'Não cadastrado'}
                </p>
                <p className="text-xs text-slate-700">
                  <strong>Tabela Padrão:</strong> {viewingConvenio.tabelaPrecosPadrao || 'Padrão Clínica'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Diretrizes Clínicas & Observações</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {viewingConvenio.observacoes || 'Nenhuma observação especial de cobertura registrada para esta operadora.'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col min-h-screen bg-[#f8f9ff]">
      {/* ============================================================== */}
      {/* 1. CABEÇALHO DO MÓDULO                                         */}
      {/* ============================================================== */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#005f73] text-[11px] font-extrabold border border-teal-100">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0A9396]" />
                <span>Gestão Clínica & Financeira</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-semibold">
                {metrics.ativos} convênios ativos
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Convênios &amp; Planos Odontológicos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cadastro oficial de operadoras, credenciamentos ANS, regras de repasse e diretrizes de autorização.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Importar Padrão do Sistema (Azul) */}
            <button
              type="button"
              onClick={handleImportClick}
              className={BTN_IMPORTAR_CLASS}
              title="Importar lista de convênios via arquivo"
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>

            {/* Exportar Padrão do Sistema (Laranja) */}
            <button
              type="button"
              onClick={handleExportCSV}
              className={BTN_EXPORTAR_CLASS}
              title="Exportar convênios em formato CSV"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            {/* Novo Convênio (Sem redundância de '+') */}
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#005f73] hover:bg-[#0A9396] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Convênio</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. CONTEÚDO PRINCIPAL (MÉTRICAS + TABELA / CARDS)              */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* BENTO STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#005f73]" />
            <div className="flex items-center justify-between text-[#005f73] mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Operadoras Ativas
              </span>
              <ShieldCheck className="w-4 h-4 text-[#005f73]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.ativos}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.total} cadastradas no total
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A9396]" />
            <div className="flex items-center justify-between text-[#0A9396] mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Média de Repasse
              </span>
              <Clock className="w-4 h-4 text-[#0A9396]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.mediaRepasse} <span className="text-sm font-bold text-slate-500">dias</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Previsão de conciliação TISS
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Pacientes Vinculados
              </span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.totalPacientes}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Com planos cadastrados na clínica
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Em Negociação / Inativos
              </span>
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.inativos}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Contratos suspensos ou em revisão
            </p>
          </div>
        </div>

        {/* BARRA DE PESQUISA & FILTRO */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, ANS ou CNPJ..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Filtrar:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'todos' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({convenios.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Ativo')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'Ativo' ? 'bg-white text-[#005f73] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ativos ({metrics.ativos})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Inativo')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'Inativo' ? 'bg-white text-slate-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inativos ({metrics.inativos})
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. TABELA DESKTOP DE CONVÊNIOS                                */}
        {/* ============================================================== */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Operadora / Convênio</th>
                  <th className="py-3.5 px-4">Registro ANS &amp; CNPJ</th>
                  <th className="py-3.5 px-4">Prazo Repasse</th>
                  <th className="py-3.5 px-4 text-center">Pacientes</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredConvenios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">Nenhum convênio encontrado</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Ajuste os filtros de busca ou cadastre uma nova operadora parceira.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredConvenios.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Operadora / Convênio */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73] shrink-0 font-bold shadow-2xs">
                            <ShieldCheck className="w-5 h-5 text-[#0A9396]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 block leading-tight">
                                {c.nome}
                              </span>
                              {(c.tipoPlano === 'proprio' || c.nome.toLowerCase().includes('casa') || !c.cobreMensalidade) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Sem Mensalidade
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 truncate block max-w-xs mt-0.5">
                              {c.razaoSocial || c.tabelaPrecosPadrao || 'Odonto Souza Atendimento Próprio'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ANS & CNPJ */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-800 block">
                          ANS: {c.registroAns || 'Isento'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                          {c.cnpj || 'CNPJ não informado'}
                        </span>
                      </td>

                      {/* Prazo Repasse & Coparticipação */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#005f73] block">
                          {c.diasRepasse === 0 ? 'Imediato (0 dias)' : `${c.diasRepasse} dias úteis`}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {c.cobreMensalidade && (c.valorMensalidade ?? 0) > 0
                            ? `Mensalidade: R$ ${c.valorMensalidade?.toFixed(2).replace('.', ',')}`
                            : 'Mensalidade: Gratuita (R$ 0,00)'}
                        </span>
                      </td>

                      {/* Total Pacientes */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs">
                          {c.totalPacientesVinculados || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          title="Clique para alternar status"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            c.status === 'Ativo'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'Ativo' ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                          <span>{c.status}</span>
                        </button>
                      </td>

                      {/* Ações Padronizadas: Ver = Azul, Editar = Laranja, Excluir = Vermelho */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ver: Azul */}
                          <button
                            type="button"
                            onClick={() => handleView(c)}
                            className={ACTION_BUTTON_CLASSES.view}
                            title="Ver detalhes da operadora"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Editar: Laranja */}
                          <button
                            type="button"
                            onClick={() => handleEdit(c)}
                            className={ACTION_BUTTON_CLASSES.edit}
                            title="Editar convênio"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Excluir: Vermelho */}
                          <button
                            type="button"
                            onClick={() => setConvenioToDelete(c)}
                            className={ACTION_BUTTON_CLASSES.delete}
                            title="Remover convênio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. CARDS MOBILE (RESPONSIVO PARA CELULARES)                    */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredConvenios.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600">Nenhum convênio encontrado</p>
              <p className="text-xs text-slate-400 mt-1">Ajuste os filtros de busca.</p>
            </div>
          ) : (
            filteredConvenios.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73] shrink-0 font-bold">
                      <ShieldCheck className="w-5 h-5 text-[#0A9396]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{c.nome}</h3>
                        {(c.tipoPlano === 'proprio' || c.nome.toLowerCase().includes('casa') || !c.cobreMensalidade) && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Sem Mensalidade
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ANS: {c.registroAns || 'Isento'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(c)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      c.status === 'Ativo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.status}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Repasse</span>
                    <span className="font-bold text-[#005f73]">
                      {c.diasRepasse === 0 ? 'Imediato' : `${c.diasRepasse} dias`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Pacientes</span>
                    <span className="font-bold text-slate-800">{c.totalPacientesVinculados || 0} cobertos</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleView(c)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:opacity-80 transition-opacity"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(c)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs hover:opacity-80 transition-opacity"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConvenioToDelete(c)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:opacity-80 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ============================================================== */}
      {/* 5. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO                            */}
      {/* ============================================================== */}
      {convenioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Remover Convênio?</h4>
                <p className="text-xs text-slate-500">Essa ação desativará a operadora parceira.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza de que deseja excluir o convênio{' '}
              <strong className="text-slate-900">{convenioToDelete.nome}</strong>?
              Os pacientes vinculados manterão seus prontuários preservados.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConvenioToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
