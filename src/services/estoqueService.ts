import { supabase } from '../lib/supabase';
import { MaterialItem, CicloAutoclaveItem, CategoriaMaterial } from '../components/estoque/EstoqueView';

export const estoqueService = {
  async getMateriais(): Promise<MaterialItem[]> {
    try {
      const { data, error } = await supabase.rpc('obter_estoque_materiais');
      if (error) {
        console.warn('[estoqueService.getMateriais] Erro RPC:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      return data.map((m: any) => {
        const cat = (m.categoria || '').toLowerCase();
        let categoria: Exclude<CategoriaMaterial, 'Todas'> = 'Biossegurança & Descartáveis';
        if (cat.includes('resina') || cat.includes('dentist')) categoria = 'Resinas & Adesivos';
        else if (cat.includes('anest')) categoria = 'Anestésicos & Agulhas';
        else if (cat.includes('impl')) categoria = 'Implantes & Biomateriais';
        else if (cat.includes('prot') || cat.includes('mold')) categoria = 'Moldagem & Prótese';
        else if (cat.includes('orto')) categoria = 'Ortodontia';

        const valDate = m.data_validade ? new Date(m.data_validade) : new Date(Date.now() + 180 * 86400000);
        const diffDays = Math.ceil((valDate.getTime() - Date.now()) / (1000 * 3600 * 24));

        return {
          id: m.id,
          sku: `SKU-${m.id.slice(-4).toUpperCase()}`,
          nome: m.nome,
          fabricante: m.fornecedor || 'Dental Cremer',
          categoria,
          lote: m.lote || 'L-PADRAO',
          validade: valDate.toLocaleDateString('pt-BR'),
          diasParaVencer: diffDays > 0 ? diffDays : 0,
          quantidadeAtual: parseFloat(m.quantidade_atual) || 0,
          quantidadeMinima: parseFloat(m.quantidade_minima) || 5,
          unidade: m.unidade || 'Unidades',
          valorUnitario: parseFloat(m.valor_custo) || 0,
          localizacao: 'Armário Geral',
        };
      });
    } catch (err) {
      console.error('[estoqueService.getMateriais] Exceção:', err);
      return [];
    }
  },

  async saveMaterial(mat: Partial<MaterialItem>): Promise<any> {
    try {
      const payload = {
        id: mat.id && mat.id.length > 10 ? mat.id : undefined,
        nome: mat.nome,
        categoria: mat.categoria,
        unidade: mat.unidade,
        quantidade_atual: mat.quantidadeAtual,
        quantidade_minima: mat.quantidadeMinima,
        lote: mat.lote,
        fornecedor: mat.fabricante,
        valor_custo: mat.valorUnitario,
        status: (mat.quantidadeAtual ?? 0) <= (mat.quantidadeMinima ?? 0) ? 'Baixo' : 'Em Estoque',
      };

      const { data, error } = await supabase.rpc('salvar_material_estoque', { p_dados: payload });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[estoqueService.saveMaterial] Erro:', err);
      throw err;
    }
  },

  async getCiclos(): Promise<CicloAutoclaveItem[]> {
    try {
      const { data, error } = await supabase.rpc('obter_ciclos_autoclave');
      if (error) {
        console.warn('[estoqueService.getCiclos] Erro RPC:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      return data.map((c: any, index: number) => ({
        id: c.id,
        equipamento: c.equipamento,
        numeroCicloDia: index + 1,
        dataHora: new Date(c.data_inicio).toLocaleString('pt-BR'),
        temperatura: `${c.temperatura_atingida || 134}°C`,
        pressao: `${c.pressao_atingida || 2.2} bar`,
        tempoEsterilizacao: `${c.tempo_esterilizacao_minutos || 15} min`,
        indicadorQuimicoVirado: c.indicador_quimico_ok !== false,
        indicadorBiologicoOk: c.indicador_biologico_ok !== false,
        operador: 'Patrícia Lima (Gerente)',
        status: c.status === 'Liberado' ? 'Liberado' : 'Em Andamento',
        pacotesLiberados: 12,
        observacoes: c.observacoes,
      }));
    } catch (err) {
      console.error('[estoqueService.getCiclos] Exceção:', err);
      return [];
    }
  },
};
