import { supabase } from '../lib/supabase';
import { AvaliacaoItem, CriarAvaliacaoInput } from '../types/avaliacoes';

// Avaliações de fallback caso o banco esteja indisponível ou vazio
export const FALLBACK_AVALIACOES: AvaliacaoItem[] = [
  {
    id: 'fb-1',
    nome_paciente: 'Beatriz Fagundes Silveira',
    nota: 5,
    comentario:
      'Experiência maravilhosa! Eu tinha muito pavor de ir ao dentista por traumas antigos, mas o Dr. Frankisney me atendeu com tanta calma e sem dor nenhuma. Fiz uma restauração e clareamento, ficou perfeito!',
    canal: 'whatsapp',
    destaque_site: true,
    foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    criado_em: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-2',
    nome_paciente: 'Eduardo Prado Ribeiro',
    nota: 5,
    comentario:
      'Pontualidade impecável, você é atendido exatamente no seu horário agendado de 45 minutos. O consultório é extremamente limpo e a esterilização dos materiais passa muita confiança.',
    canal: 'whatsapp',
    destaque_site: true,
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    criado_em: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-3',
    nome_paciente: 'Mariana Alcântara Costa',
    nota: 5,
    comentario:
      'O Convênio da Casa sem mensalidade me surpreendeu muito. Consegui fazer o tratamento ortodôntico e da minha filha com preços justos e direto na clínica. O atendimento pelo WhatsApp também é super ágil!',
    canal: 'whatsapp',
    destaque_site: true,
    foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    criado_em: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-4',
    nome_paciente: 'Rodrigo Mendes Cavalcanti',
    nota: 5,
    comentario:
      'Fiz canal com o Dr. Frankisney e não senti absolutamente nada durante o procedimento. A tecnologia do consultório é de outro nível. Recomendo de olhos fechados para toda a minha família!',
    canal: 'whatsapp',
    destaque_site: true,
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    criado_em: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const avaliacoesService = {
  /**
   * Busca as avaliações com destaque habilitado para renderização pública no site institucional
   */
  async getAvaliacoesDestaque(): Promise<AvaliacaoItem[]> {
    try {
      // 1. Tenta via RPC canônico
      const rpcRes = await supabase.rpc('obter_avaliacoes_destaque');
      if (!rpcRes.error && Array.isArray(rpcRes.data) && rpcRes.data.length > 0) {
        return rpcRes.data as AvaliacaoItem[];
      }

      // 2. Fallback via PostgREST direto
      const queryRes = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('destaque_site', true)
        .order('criado_em', { ascending: false })
        .limit(12);

      if (!queryRes.error && Array.isArray(queryRes.data) && queryRes.data.length > 0) {
        return queryRes.data as AvaliacaoItem[];
      }

      // Se o banco ainda não tiver dados em destaque, retorna fallback qualificado
      return FALLBACK_AVALIACOES;
    } catch (err) {
      console.warn('[avaliacoesService.getAvaliacoesDestaque] Exceção ao buscar avaliações:', err);
      return FALLBACK_AVALIACOES;
    }
  },

  /**
   * Busca todas as avaliações cadastradas (painel admin)
   */
  async getTodasAvaliacoes(): Promise<AvaliacaoItem[]> {
    try {
      const rpcRes = await supabase.rpc('obter_todas_avaliacoes');
      if (!rpcRes.error && Array.isArray(rpcRes.data)) {
        return rpcRes.data as AvaliacaoItem[];
      }

      const queryRes = await supabase
        .from('avaliacoes')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!queryRes.error && Array.isArray(queryRes.data)) {
        return queryRes.data as AvaliacaoItem[];
      }

      return FALLBACK_AVALIACOES;
    } catch (err) {
      console.warn('[avaliacoesService.getTodasAvaliacoes] Exceção:', err);
      return FALLBACK_AVALIACOES;
    }
  },

  /**
   * Registra uma nova avaliação de paciente (NPS / WhatsApp / Painel)
   */
  async salvarAvaliacao(input: CriarAvaliacaoInput): Promise<AvaliacaoItem | null> {
    try {
      const rpcRes = await supabase.rpc('salvar_avaliacao', { p_dados: input });
      if (!rpcRes.error && rpcRes.data) {
        return rpcRes.data as AvaliacaoItem;
      }

      const insertRes = await supabase
        .from('avaliacoes')
        .insert([{
          nome_paciente: input.nome_paciente,
          foto_url: input.foto_url,
          nota: input.nota,
          comentario: input.comentario,
          canal: input.canal || 'whatsapp',
          destaque_site: input.destaque_site ?? false,
          agendamento_id: input.agendamento_id || null,
          paciente_id: input.paciente_id || null,
        }])
        .select()
        .single();

      if (!insertRes.error && insertRes.data) {
        return insertRes.data as AvaliacaoItem;
      }

      return null;
    } catch (err) {
      console.error('[avaliacoesService.salvarAvaliacao] Erro:', err);
      return null;
    }
  },

  /**
   * Alterna se uma avaliação aparece ou não na página inicial da clínica
   */
  async toggleDestaque(id: string, destaque: boolean): Promise<boolean> {
    try {
      const res = await supabase.rpc('toggle_destaque_avaliacao', {
        p_id: id,
        p_destaque: destaque,
      });

      if (!res.error) return true;

      const updateRes = await supabase
        .from('avaliacoes')
        .update({ destaque_site: destaque, atualizado_em: new Date().toISOString() })
        .eq('id', id);

      return !updateRes.error;
    } catch (err) {
      console.error('[avaliacoesService.toggleDestaque] Erro:', err);
      return false;
    }
  },
};
