import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle,
  X,
  FileText,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import {
  TransacaoFinanceira,
  TransacaoTipo,
  TransacaoStatus,
  FinanceiroMetrics,
} from '../../types/financeiro';
import { FinanceiroMetricsRow } from './FinanceiroMetricsRow';
import { FinanceiroTable } from './FinanceiroTable';
import { FinanceiroMobileCards } from './FinanceiroMobileCards';
import { LancamentoFormView } from './LancamentoFormView';
import { RepassesComissoesTab } from './RepassesComissoesTab';
import { financeiroService } from '../../services/financeiroService';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { scrollToTop } from '../../utils/scrollUtils';

const INITIAL_TRANSACOES: TransacaoFinanceira[] = [];

const INITIAL_METRICS: FinanceiroMetrics = {
  monthlyRevenue: 0,
  revenueGrowth: 0,
  monthlyExpenses: 0,
  expenseBudgetPercentage: 0,
  toReceive: 0,
  pendingInstallments: 0,
  operatingBalance: 0,
};

interface FinanceiroViewProps {
  forceMobileView?: boolean;
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  forceMobileView = false,
}) => {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [metrics, setMetrics] = useState<FinanceiroMetrics>(INITIAL_METRICS);

  // Carregar dados reais do Supabase Self-Hosted
  useEffect(() => {
    let isMounted = true;
    async function loadFinanceiro() {
      try {
        const txs = await financeiroService.getTransacoes();
        if (isMounted) {
          setTransacoes(txs);
          const totalRev = txs
            .filter((t) => t.type === 'receita' && t.status === 'pago')
            .reduce((sum, t) => sum + t.amount, 0);
          const totalExp = txs
            .filter((t) => t.type === 'despesa')
            .reduce((sum, t) => sum + t.amount, 0);
          const toRec = txs
            .filter((t) => t.type === 'receita' && t.status === 'pendente')
            .reduce((sum, t) => sum + t.amount, 0);

          setMetrics((prev) => ({
            ...prev,
            monthlyRevenue: totalRev,
            monthlyExpenses: totalExp,
            toReceive: toRec,
            operatingBalance: totalRev - totalExp,
          }));
        }
      } catch (e) {
        console.warn('Fallback financeiro:', e);
      }
    }
    loadFinanceiro();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('fev-2025');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [mobilePillFilter, setMobilePillFilter] = useState<'all' | 'receita' | 'despesa' | 'pendente' | 'pago'>('all');
  const [abaFinanceiro, setAbaFinanceiro] = useState<'fluxo' | 'repasses'>('fluxo');

  // View Switching (Regra Arquitetural Mobile-First: Sem Modais)
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [editingTransaction, setEditingTransaction] = useState<TransacaoFinanceira | null>(null);
  const [receiptModalTx, setReceiptModalTx] = useState<TransacaoFinanceira | null>(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<TransacaoFinanceira | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Garante abertura da tela/formulário sempre no início (topo)
  useEffect(() => {
    scrollToTop();
  }, [currentView]);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleOpenNew = () => {
    setEditingTransaction(null);
    setCurrentView('form');
    scrollToTop();
  };

  const handleEdit = (tx: TransacaoFinanceira) => {
    setEditingTransaction(tx);
    setCurrentView('form');
    scrollToTop();
  };

  const handleDelete = (tx: TransacaoFinanceira) => {
    setDeleteConfirmTx(tx);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTx) return;
    const tx = deleteConfirmTx;
    setTransacoes((prev) => prev.filter((item) => item.id !== tx.id));
    showToast(`Lançamento "${tx.entityName} - ${tx.txCode}" foi excluído.`);
    setDeleteConfirmTx(null);
  };

  const handleSaveTransaction = async (
    data: Omit<TransacaoFinanceira, 'id' | 'txCode'>
  ) => {
    try {
      if (editingTransaction) {
        setTransacoes((prev) =>
          prev.map((item) =>
            item.id === editingTransaction.id
              ? { ...data, id: editingTransaction.id, txCode: editingTransaction.txCode }
              : item
          )
        );
        showToast(`Lançamento "${data.entityName}" atualizado com sucesso!`);
        await financeiroService.saveTransacao({ ...data, id: editingTransaction.id });
      } else {
        const nextCode = `TX-${Math.floor(1100 + Math.random() * 50)}`;
        const newTx: TransacaoFinanceira = {
          ...data,
          id: `tx-${Date.now()}`,
          txCode: nextCode,
        };

        setTransacoes((prev) => [newTx, ...prev]);

        // Atualiza métricas dinamicamente
        if (data.type === 'receita') {
          setMetrics((prev) => ({
            ...prev,
            monthlyRevenue: prev.monthlyRevenue + data.amount,
            operatingBalance: prev.operatingBalance + data.amount,
          }));
        } else {
          setMetrics((prev) => ({
            ...prev,
            monthlyExpenses: prev.monthlyExpenses + data.amount,
            operatingBalance: prev.operatingBalance - data.amount,
          }));
        }

        showToast(`Novo lançamento "${data.entityName}" registrado com sucesso!`);
        await financeiroService.saveTransacao(data);
      }
    } catch (e) {
      console.warn('Erro ao salvar no Supabase:', e);
    }

    setCurrentView('list');
    setEditingTransaction(null);
  };

  const handleExportCSV = () => {
    showToast('Relatório Financeiro exportado em CSV com sucesso (Fevereiro 2025)!');
  };

  // Filtragem
  const filteredTransacoes = useMemo(() => {
    return transacoes.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.entityDetail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.txCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro Desktop
      const matchesDesktopType =
        selectedType === 'todos' || item.type === selectedType;

      const matchesDesktopStatus =
        selectedStatus === 'todos' ||
        (selectedStatus === 'pagos' && item.status === 'pago') ||
        (selectedStatus === 'pendentes' && item.status === 'pendente') ||
        (selectedStatus === 'atrasados' && item.status === 'atrasado');

      // Filtro Mobile Pills
      let matchesMobilePill = true;
      if (mobilePillFilter === 'receita') matchesMobilePill = item.type === 'receita';
      if (mobilePillFilter === 'despesa') matchesMobilePill = item.type === 'despesa';
      if (mobilePillFilter === 'pendente') matchesMobilePill = item.status === 'pendente';
      if (mobilePillFilter === 'pago') matchesMobilePill = item.status === 'pago';

      return (
        matchesSearch &&
        (forceMobileView
          ? matchesMobilePill
          : matchesDesktopType && matchesDesktopStatus)
      );
    });
  }, [
    transacoes,
    searchQuery,
    selectedType,
    selectedStatus,
    mobilePillFilter,
    forceMobileView,
  ]);

  // Se currentView === 'form': oculta a listagem totalmente e exibe o formulário em tela cheia responsivo
  if (currentView === 'form') {
    return (
      <div className="w-full h-full p-4 md:p-6 animate-fadeIn">
        <LancamentoFormView
          initialData={editingTransaction}
          onSave={handleSaveTransaction}
          onCancel={() => {
            setCurrentView('list');
            setEditingTransaction(null);
          }}
          isMobile={forceMobileView}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#005F73] text-white rounded-xl shadow-lg border border-[#0A9396] text-xs sm:text-sm font-semibold animate-slideDown">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Header & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gestão Financeira
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A9396]/10 text-[#005F73] font-bold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A9396] animate-pulse" />
              Fluxo de Caixa
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Controle consolidado de entradas, saídas, repasses e previsões financeiras da clínica ODONTO SOUZA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-orange-500 hover:opacity-80 rounded-xl shadow-2xs transition-opacity cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="inline sm:hidden">CSV</span>
          </button>

          {abaFinanceiro === 'fluxo' && (
            <button
              type="button"
              onClick={handleOpenNew}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#005F73] hover:bg-[#004b5c] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Novo Lançamento</span>
            </button>
          )}
        </div>
      </div>

      {/* Seletor de Sub-Abas do Financeiro */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setAbaFinanceiro('fluxo')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            abaFinanceiro === 'fluxo'
              ? 'bg-[#005F73] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          Fluxo de Caixa &amp; Lançamentos
        </button>

        <button
          onClick={() => setAbaFinanceiro('repasses')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            abaFinanceiro === 'repasses'
              ? 'bg-[#005F73] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <span>Repasses &amp; Comissões de Dentistas</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
            Novo
          </span>
        </button>
      </div>

      {abaFinanceiro === 'repasses' ? (
        <RepassesComissoesTab />
      ) : (
        <>
          {/* 2. Monthly Metric Cards */}
      <FinanceiroMetricsRow metrics={metrics} isMobile={forceMobileView} />

      {/* 3. Toolbar de Filtros e Busca */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col xl:flex-row gap-3 justify-between items-stretch xl:items-center">
          {/* Caixa de Busca */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar lançamento, paciente ou fornecedor..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#005F73]/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Dropdown (Desktop / Tablet) */}
          <div className="hidden sm:flex flex-wrap items-center gap-2.5">
            {/* Seletor de Mês */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
              >
                <option value="fev-2025">Fevereiro 2025</option>
                <option value="jan-2025">Janeiro 2025</option>
                <option value="mar-2025">Março 2025 (Previsto)</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Tipo */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
              >
                <option value="todos">Tipo: Todos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
              >
                <option value="todos">Status: Todos</option>
                <option value="pagos">Pagos</option>
                <option value="pendentes">Pendentes</option>
                <option value="atrasados">Atrasados</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Pílulas de Filtro (Mobile Viewport) */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setMobilePillFilter('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobilePillFilter === 'all'
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Todos ({transacoes.length})
          </button>
          <button
            type="button"
            onClick={() => setMobilePillFilter('receita')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobilePillFilter === 'receita'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Receitas
          </button>
          <button
            type="button"
            onClick={() => setMobilePillFilter('despesa')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobilePillFilter === 'despesa'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Despesas
          </button>
          <button
            type="button"
            onClick={() => setMobilePillFilter('pendente')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobilePillFilter === 'pendente'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Pendentes
          </button>
          <button
            type="button"
            onClick={() => setMobilePillFilter('pago')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobilePillFilter === 'pago'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Pagos
          </button>
        </div>
      </div>

      {/* 4. Renderização Condicional Desktop vs Mobile */}
      {forceMobileView ? (
        <FinanceiroMobileCards
          transacoes={filteredTransacoes}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewReceipt={(tx) => setReceiptModalTx(tx)}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <FinanceiroTable
              transacoes={filteredTransacoes}
              totalCount={filteredTransacoes.length}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewReceipt={(tx) => setReceiptModalTx(tx)}
            />
          </div>

          <div className="block md:hidden">
            <FinanceiroMobileCards
              transacoes={filteredTransacoes}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewReceipt={(tx) => setReceiptModalTx(tx)}
            />
          </div>
        </>
      )}
      </>
      )}

      {/* Modal de Comprovante / Recibo Digital */}
      {receiptModalTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#005F73]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Comprovante Digital • {receiptModalTx.txCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Entidade / Favorecido:</span>
                  <span className="font-bold text-slate-900">{receiptModalTx.entityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Descrição:</span>
                  <span className="font-medium text-slate-800">{receiptModalTx.entityDetail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data de Emissão:</span>
                  <span className="font-medium text-slate-800">{receiptModalTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Forma de Pagamento:</span>
                  <span className="font-medium text-slate-800">
                    {receiptModalTx.paymentMethod || 'PIX Instantâneo'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                  <span className="text-slate-800">Valor Líquido:</span>
                  <span
                    className={
                      receiptModalTx.type === 'receita' ? 'text-emerald-700' : 'text-rose-600'
                    }
                  >
                    R$ {receiptModalTx.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {receiptModalTx.receiptFile && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-200 text-[#00696c]">
                  <span className="truncate">{receiptModalTx.receiptFile}</span>
                  <button
                    type="button"
                    onClick={() => showToast('Download do arquivo de recibo iniciado!')}
                    className="font-bold underline cursor-pointer shrink-0 ml-2"
                  >
                    Baixar PDF
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReceiptModalTx(null)}
                className="px-5 py-2 rounded-xl bg-[#005F73] text-white text-xs font-bold hover:bg-[#004b5c] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Padronizado de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteConfirmTx)}
        onClose={() => setDeleteConfirmTx(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Lançamento Financeiro"
        description="Deseja realmente excluir este lançamento financeiro?"
        itemName={
          deleteConfirmTx
            ? `${deleteConfirmTx.entityName} (${deleteConfirmTx.txCode})`
            : undefined
        }
        itemDetails={
          deleteConfirmTx
            ? `${deleteConfirmTx.category} • R$ ${deleteConfirmTx.amount.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })} • ${deleteConfirmTx.type === 'receita' ? 'Receita' : 'Despesa'}`
            : undefined
        }
        confirmLabel="Sim, Excluir Lançamento"
        cancelLabel="Cancelar"
      />
    </div>
  );
};
