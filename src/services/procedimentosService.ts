import { supabase } from '../lib/supabase';
import { ProcedimentoItem, ProcedimentoCategoria } from '../types/procedimentos';

export const DEFAULT_PROCEDIMENTOS: ProcedimentoItem[] = [];

function mapDatabaseToProcedimento(p: any): ProcedimentoItem {
  const cat = (p.categoria || '').toLowerCase();
  let category: ProcedimentoCategoria = 'dentistica';
  if (cat.includes('prev') || cat.includes('periodon')) category = 'prevencao';
  else if (cat.includes('cirurg')) category = 'cirurgia';
  else if (cat.includes('estet')) category = 'estetica';
  else if (cat.includes('endo')) category = 'endodontia';
  else if (cat.includes('impl')) category = 'implantodontia';
  else if (cat.includes('orto')) category = 'ortodontia';
  else if (cat.includes('prot')) category = 'protese';

  return {
    id: p.id,
    code: (p.id || '').slice(-4).toUpperCase(),
    name: p.nome,
    category,
    categoryLabel: p.categoria || 'Geral',
    description: p.descricao || '',
    durationMinutes: p.duracao_minutos || 45,
    price: parseFloat(p.preco_base) || 0,
    active: p.status !== 'Inativo',
    showInOdontogram: true,
    syncWithDrSouza: true,
  };
}

export const procedimentosService = {
  async getProcedimentos(): Promise<ProcedimentoItem[]> {
    try {
      // 1. Tentar obter via RPC customizada
      const { data: rpcData, error: rpcError } = await supabase.rpc('obter_procedimentos');
      if (!rpcError && Array.isArray(rpcData)) {
        return rpcData.map(mapDatabaseToProcedimento);
      }

      // 2. Se a RPC não estiver disponível, buscar diretamente na tabela 'procedimentos'
      const { data: tableData, error: tableError } = await supabase
        .from('procedimentos')
        .select('*')
        .order('nome', { ascending: true });

      if (!tableError && Array.isArray(tableData)) {
        return tableData.map(mapDatabaseToProcedimento);
      }

      return [];
    } catch (err) {
      console.error('[procedimentosService.getProcedimentos] Erro:', err);
      return [];
    }
  },

  async saveProcedimento(p: Partial<ProcedimentoItem>): Promise<any> {
    try {
      const payload = {
        id: p.id && !p.id.startsWith('pr-') ? p.id : undefined,
        nome: p.name,
        categoria: p.categoryLabel || p.category,
        descricao: p.description || null,
        duracao_minutos: p.durationMinutes || 45,
        preco_base: p.price ?? 0,
        status: p.active !== false ? 'Ativo' : 'Inativo',
      };

      const { data, error } = await supabase.rpc('salvar_procedimento', { p_dados: payload });
      if (error) {
        // Fallback direto na tabela 'procedimentos'
        if (payload.id) {
          const { data: updateData, error: updateError } = await supabase
            .from('procedimentos')
            .update({
              nome: payload.nome,
              categoria: payload.categoria,
              descricao: payload.descricao,
              duracao_minutos: payload.duracao_minutos,
              preco_base: payload.preco_base,
              status: payload.status,
            })
            .eq('id', payload.id)
            .select();

          if (updateError) throw updateError;
          return updateData?.[0] || updateData;
        } else {
          const { data: insertData, error: insertError } = await supabase
            .from('procedimentos')
            .insert({
              nome: payload.nome,
              categoria: payload.categoria,
              descricao: payload.descricao,
              duracao_minutos: payload.duracao_minutos,
              preco_base: payload.preco_base,
              status: payload.status,
            })
            .select();

          if (insertError) throw insertError;
          return insertData?.[0] || insertData;
        }
      }
      return data;
    } catch (err) {
      console.error('[procedimentosService.saveProcedimento] Erro:', err);
      throw err;
    }
  },

  async deleteProcedimento(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('procedimentos').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[procedimentosService.deleteProcedimento] Erro:', err);
      throw err;
    }
  },
};
