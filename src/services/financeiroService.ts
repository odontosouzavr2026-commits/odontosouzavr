import { supabase } from '../lib/supabase';
import { TransacaoFinanceira, TransacaoTipo, TransacaoStatus } from '../types/financeiro';

export const financeiroService = {
  async getTransacoes(): Promise<TransacaoFinanceira[]> {
    try {
      const { data, error } = await supabase.rpc('obter_transacoes_financeiras');
      if (error) {
        console.warn('[financeiroService.getTransacoes] Erro RPC:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      return data.map((t: any) => {
        const type: TransacaoTipo = (t.tipo || '').toLowerCase().includes('receita') ? 'receita' : 'despesa';
        let status: TransacaoStatus = 'pago';
        const st = (t.status || '').toLowerCase();
        if (st.includes('pend')) status = 'pendente';
        else if (st.includes('atras')) status = 'atrasado';

        const d = t.data_vencimento ? new Date(t.data_vencimento) : new Date();
        const dateStr = d.toLocaleDateString('pt-BR');

        return {
          id: t.id,
          txCode: `TX-${t.id.slice(-4).toUpperCase()}`,
          date: dateStr,
          dueDate: t.data_vencimento || new Date().toISOString().split('T')[0],
          competence: 'Fevereiro / 2026',
          type,
          entityName: t.paciente_nome || t.descricao.split('-')[0].trim() || 'Clínica Odonto Souza',
          entityDetail: t.descricao,
          category: t.categoria || 'Geral',
          amount: parseFloat(t.valor) || 0,
          status,
          paymentMethod: t.forma_pagamento || 'PIX',
          dentist: t.usuario_nome || 'Dr. Frankisney Souza',
          receiptFile: `Recibo_${t.id.slice(-4)}.pdf`,
        };
      });
    } catch (err) {
      console.error('[financeiroService.getTransacoes] Exceção:', err);
      return [];
    }
  },

  async saveTransacao(t: Partial<TransacaoFinanceira>): Promise<any> {
    try {
      const payload = {
        id: t.id && !t.id.startsWith('tx-') ? t.id : undefined,
        tipo: t.type === 'receita' ? 'Receita' : 'Despesa',
        categoria: t.category || 'Geral',
        descricao: t.entityDetail || t.entityName || 'Lançamento',
        valor: t.amount,
        data_vencimento: t.dueDate || new Date().toISOString().split('T')[0],
        data_pagamento: t.status === 'pago' ? new Date().toISOString().split('T')[0] : null,
        status: t.status === 'pago' ? 'Pago' : 'Pendente',
        forma_pagamento: t.paymentMethod || 'PIX',
      };

      const { data, error } = await supabase.rpc('salvar_transacao_financeira', { p_dados: payload });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[financeiroService.saveTransacao] Erro:', err);
      throw err;
    }
  },

  async liquidarTransacao(id: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('liquidar_transacao_financeira', { p_id: id });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[financeiroService.liquidarTransacao] Erro:', err);
      throw err;
    }
  },
};
