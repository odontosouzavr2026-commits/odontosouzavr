import { supabase } from '../lib/supabase';
import { PedidoProteseItem, StatusProtese } from '../components/laboratorio/LaboratorioView';

export const laboratorioService = {
  async getOrdens(): Promise<PedidoProteseItem[]> {
    try {
      const { data, error } = await supabase.rpc('obter_ordens_laboratorio');
      if (error) {
        console.warn('[laboratorioService.getOrdens] Erro RPC:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      return data.map((o: any) => {
        let status: Exclude<StatusProtese, 'Todos'> = 'Em Confecção';
        const st = (o.status || '').toLowerCase();
        if (st.includes('recebid')) status = 'Recebido na Recepção';
        else if (st.includes('prova')) status = 'Prova Marcada';
        else if (st.includes('instal') || st.includes('concl')) status = 'Instalado / Concluído';
        else if (st.includes('enviad')) status = 'Enviado ao Laboratório';

        const dEnvio = o.data_envio ? new Date(o.data_envio).toLocaleDateString('pt-BR') : '25/02/2026';
        const dRetorno = o.data_previsao_retorno ? new Date(o.data_previsao_retorno).toLocaleDateString('pt-BR') : '05/03/2026';

        return {
          id: o.id,
          osLaboratorio: o.numero_os || `OS-${o.id.slice(-4).toUpperCase()}`,
          pacienteNome: o.paciente_nome || 'Paciente',
          pacienteProntuario: `#${o.paciente_id ? o.paciente_id.slice(-4).toUpperCase() : '0000'}`,
          dentistaResponsavel: o.dentista_nome || 'Dr. Frankisney Souza',
          laboratorioNome: o.laboratorio_nome || 'Laboratório Dental Arte',
          tipoTrabalho: o.tipo_trabalho || 'Prótese Fixa',
          elementos: o.dentes_envolvidos ? [o.dentes_envolvidos] : ['#16'],
          corEscala: o.cor_escala || 'A2',
          dataEnvio: dEnvio,
          dataPrevisaoRetorno: dRetorno,
          valorLaboratorio: parseFloat(o.valor_custo) || 0,
          status,
          observacoes: o.observacoes || '',
        };
      });
    } catch (err) {
      console.error('[laboratorioService.getOrdens] Exceção:', err);
      return [];
    }
  },

  async saveOrdem(ordem: Partial<PedidoProteseItem>): Promise<any> {
    try {
      const payload = {
        id: ordem.id && !ordem.id.startsWith('LAB-') ? ordem.id : undefined,
        numero_os: ordem.osLaboratorio || `OS-${Math.floor(1000 + Math.random() * 9000)}`,
        paciente_id: '40000000-0000-0000-0000-000000000001',
        dentista_id: '20000000-0000-0000-0000-000000000001',
        laboratorio_nome: ordem.laboratorioNome || 'Laboratório Protético Dental Arte - VR',
        tipo_trabalho: ordem.tipoTrabalho || 'Coroa em Zircônia',
        dentes_envolvidos: ordem.elementos?.join(', ') || '#16',
        cor_escala: ordem.corEscala || 'A2',
        data_envio: new Date().toISOString().split('T')[0],
        data_previsao_retorno: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: ordem.status || 'Em Produção',
        valor_custo: ordem.valorLaboratorio || 0,
        observacoes: ordem.observacoes || '',
      };

      const { data, error } = await supabase.rpc('salvar_ordem_laboratorio', { p_dados: payload });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[laboratorioService.saveOrdem] Erro:', err);
      throw err;
    }
  },
};
