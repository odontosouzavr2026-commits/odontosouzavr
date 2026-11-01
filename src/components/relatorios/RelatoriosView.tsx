import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Stethoscope,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { scrollToTop } from '../../utils/scrollUtils';

interface RelatoriosViewProps {
  onNavigate?: (path: string) => void;
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({ onNavigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('mes-atual');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    totalPacientes: 0,
    totalAgendamentos: 0,
    totalProcedimentos: 0,
    precoMedioProcedimento: 0,
  });

  useEffect(() => {
    scrollToTop();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Pacientes count
      const { data: pacs } = await supabase.from('pacientes').select('id');
      // Agendamentos count
      const { data: ags } = await supabase.from('agendamentos').select('id');
      // Transações
      const { data: txs } = await supabase.from('transacoes_financeiras').select('tipo, valor, status');
      let rec = 0;
      let desp = 0;
      if (txs) {
        txs.forEach((t) => {
          const v = Number(t.valor) || 0;
          if ((t.tipo || '').toLowerCase().includes('receita') && (t.status || '').toLowerCase() === 'pago') {
            rec += v;
          } else if ((t.tipo || '').toLowerCase().includes('despesa')) {
            desp += v;
          }
        });
      }

      // Procedimentos preço médio
      const { data: procs } = await supabase.from('procedimentos').select('preco_base');
      let avg = 0;
      if (procs && procs.length > 0) {
        avg = Math.round(procs.reduce((acc, p) => acc + Number(p.preco_base || 0), 0) / procs.length);
      }

      setStats({
        totalReceitas: rec,
        totalDespesas: desp,
        totalPacientes: pacs ? pacs.length : 0,
        totalAgendamentos: ags ? ags.length : 0,
        totalProcedimentos: procs ? procs.length : 0,
        precoMedioProcedimento: avg,
      });
    } catch (e) {
      console.warn('Erro ao carregar estatísticas para relatórios:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))].join(
        '\r\n'
      );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Relatório "${filename}" baixado com sucesso!`);
  };

  // 1. Exportar DRE Financeiro
  const handleExportDRE = async () => {
    try {
      const { data: txs } = await supabase.from('transacoes_financeiras').select('*');
      const rows: (string | number)[][] = [];
      (txs || []).forEach((t) => {
        rows.push([
          t.tipo || '',
          t.descricao || '',
          t.categoria || '',
          `R$ ${Number(t.valor || 0).toFixed(2).replace('.', ',')}`,
          t.data_pagamento || t.data_vencimento || '',
          t.status || '',
          t.forma_pagamento || '',
        ]);
      });
      exportCSV(
        'DRE_Financeiro_OdontoSouza',
        ['Tipo', 'Descrição', 'Categoria', 'Valor', 'Data', 'Status', 'Forma de Pagamento'],
        rows
      );
    } catch {
      showToast('Erro ao exportar relatório financeiro.');
    }
  };

  // 2. Exportar Lista de Pacientes
  const handleExportPacientes = async () => {
    try {
      const { data: pacs } = await supabase.from('pacientes').select('*');
      const rows: (string | number)[][] = [];
      (pacs || []).forEach((p) => {
        rows.push([
          p.nome || '',
          p.cpf || '',
          p.telefone || '',
          p.email || '',
          p.convenio || 'Particular',
          p.status || 'Ativo',
          p.criado_em ? p.criado_em.slice(0, 10) : '',
        ]);
      });
      exportCSV(
        'Pacientes_OdontoSouza',
        ['Nome Completo', 'CPF', 'Telefone', 'E-mail', 'Convênio', 'Status', 'Data de Cadastro'],
        rows
      );
    } catch {
      showToast('Erro ao exportar pacientes.');
    }
  };

  // 3. Exportar Agendamentos
  const handleExportAgendamentos = async () => {
    try {
      const { data: ags } = await supabase.from('agendamentos').select('*');
      const rows: (string | number)[][] = [];
      (ags || []).forEach((a) => {
        const dt = a.data_hora_inicio ? new Date(a.data_hora_inicio).toLocaleString('pt-BR') : '';
        rows.push([a.id.slice(0, 8), dt, a.status || 'Confirmado', a.tipo || 'Normal', a.observacoes || '']);
      });
      exportCSV('Agendamentos_OdontoSouza', ['Código', 'Data/Horário', 'Status', 'Tipo', 'Observações'], rows);
    } catch {
      showToast('Erro ao exportar agendamentos.');
    }
  };

  // 4. Exportar Auditoria LGPD
  const handleExportAuditoria = async () => {
    try {
      const { data: logs } = await supabase.from('auditoria_logs').select('*');
      const rows: (string | number)[][] = [];
      (logs || []).forEach((l) => {
        rows.push([
          l.criado_em ? new Date(l.criado_em).toLocaleString('pt-BR') : '',
          l.usuario_nome || '',
          l.usuario_perfil || '',
          l.acao || '',
          l.entidade || '',
          l.detalhes || '',
        ]);
      });
      exportCSV(
        'Auditoria_LGPD_OdontoSouza',
        ['Data/Hora', 'Usuário', 'Perfil', 'Ação', 'Entidade', 'Detalhes'],
        rows
      );
    } catch {
      showToast('Erro ao exportar auditoria.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in duration-200 z-50">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#005F73] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Relatórios Clínicos &amp; Gerenciais
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Exportação de dados consolidados em conformidade com CFO e LGPD
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
          >
            <option value="mes-atual">Mês Corrente (Novembro/2026)</option>
            <option value="mes-anterior">Mês Anterior (Outubro/2026)</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Ano Completo (2026)</option>
          </select>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-2xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas Consolidadas dos Relatórios */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Receitas Pagas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalReceitas)}</span>
          <span className="text-[11px] text-slate-500 mt-1">Dados reais do Supabase</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Despesas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalDespesas)}</span>
          <span className="text-[11px] text-slate-500 mt-1">Insumos &amp; fixos registrados</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#005F73] uppercase tracking-wider">Pacientes Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-[#b2ebff]/50 text-[#005F73] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{stats.totalPacientes}</span>
          <span className="text-[11px] text-slate-500 mt-1">Com ficha e anamnese</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Preço Médio Proced.</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.precoMedioProcedimento)}</span>
          <span className="text-[11px] text-slate-500 mt-1">
            {stats.totalProcedimentos > 0 ? `${stats.totalProcedimentos} procedimentos em tabela` : 'Sem procedimentos cadastrados'}
          </span>
        </div>
      </div>

      {/* Cards de Exportação de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: DRE Financeiro */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Demonstrativo DRE Financeiro</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Relatório analítico de fluxo de caixa com receitas liquidadas, despesas operacionais, categorias e saldo líquido apurado.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Formato CSV / Excel
            </span>
            <button
              onClick={handleExportDRE}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-orange-500 hover:opacity-80 rounded-xl shadow-2xs transition-opacity cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar DRE</span>
            </button>
          </div>
        </div>

        {/* Card 2: Lista Completa de Pacientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cadastro Geral de Pacientes</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Relação cadastral completa com contatos (WhatsApp, e-mail), CPF, plano/convênio e histórico de cadastro.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Formato CSV / Excel
            </span>
            <button
              onClick={handleExportPacientes}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-orange-500 hover:opacity-80 rounded-xl shadow-2xs transition-opacity cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Pacientes</span>
            </button>
          </div>
        </div>

        {/* Card 3: Histórico de Agendamentos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 text-[#005F73] flex items-center justify-center shrink-0 border border-cyan-200/60">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Agendamentos &amp; Ocupação Clínica</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Histórico de agendamentos no período, consultas concluídas, confirmadas, cancelamentos e taxa de ocupação das cadeiras.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-[#005F73] bg-cyan-50 px-2 py-0.5 rounded-full">
              Formato CSV / Excel
            </span>
            <button
              onClick={handleExportAgendamentos}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-orange-500 hover:opacity-80 rounded-xl shadow-2xs transition-opacity cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Agendamentos</span>
            </button>
          </div>
        </div>

        {/* Card 4: Auditoria e Conformidade LGPD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Auditoria &amp; Logs de Segurança (LGPD)</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Trilha completa de auditoria com rastreabilidade de acessos a prontuários, logins, alterações de status e IP de origem.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              Rastreabilidade CFO/LGPD
            </span>
            <button
              onClick={handleExportAuditoria}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-orange-500 hover:opacity-80 rounded-xl shadow-2xs transition-opacity cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Auditoria</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
