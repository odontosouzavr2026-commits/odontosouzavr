import { supabase } from '../lib/supabase';
import { OdontoStatus } from '../components/atendimento/OdontogramView';

export interface OdontogramaItemBackend {
  id?: string;
  paciente_id: string;
  dente: number;
  face: string;
  condicao: OdontoStatus;
  observacao?: string;
  atualizado_em?: string;
}

export interface SalvarProcedimentoDenteParams {
  pacienteId: string;
  dente: number;
  face: string;
  condicao: OdontoStatus;
  procedimentoNome: string;
  preco?: number;
  observacao?: string;
  dentistaNome?: string;
}

export const odontogramaService = {
  /**
   * Obtém os registros do odontograma de um paciente salvos no Supabase
   */
  async getItensByPaciente(pacienteId: string): Promise<OdontogramaItemBackend[]> {
    if (!pacienteId || pacienteId.startsWith('mock-')) return [];
    try {
      const { data, error } = await supabase
        .from('odontograma_itens')
        .select('*')
        .eq('paciente_id', pacienteId);

      if (error) {
        console.warn('[odontogramaService.getItensByPaciente] Aviso:', error.message);
        return [];
      }

      if (!data) return [];

      return data.map((item: any) => ({
        id: item.id,
        paciente_id: item.paciente_id,
        dente: Number(item.dente),
        face: item.face || 'Geral',
        condicao: (item.condicao as OdontoStatus) || 'higido',
        observacao: item.observacao || '',
        atualizado_em: item.atualizado_em,
      }));
    } catch (err) {
      console.error('[odontogramaService.getItensByPaciente] Exceção:', err);
      return [];
    }
  },

  /**
   * Salva o procedimento realizado em um dente específico no banco de dados:
   * 1. Grava no odontograma_itens
   * 2. Registra na evolução do prontuário (evolucoes_prontuario)
   */
  async saveProcedimentoDente(params: SalvarProcedimentoDenteParams): Promise<boolean> {
    const {
      pacienteId,
      dente,
      face,
      condicao,
      procedimentoNome,
      preco = 0,
      observacao = '',
      dentistaNome = 'Dr. Frankisney Souza',
    } = params;

    if (!pacienteId || pacienteId.startsWith('mock-')) {
      return true; // Sucesso simulado para dados mock sem travar a interface
    }

    try {
      // 1. Remove qualquer registro anterior desse dente para o paciente (para atualizar o estado clínico)
      await supabase
        .from('odontograma_itens')
        .delete()
        .match({ paciente_id: pacienteId, dente });

      // 2. Insere o novo estado do dente no Odontograma
      const fullObservacao = `[${procedimentoNome}] Face: ${face} | R$ ${preco.toFixed(2)}${
        observacao ? ` | Obs: ${observacao}` : ''
      }`;

      const { error: errorOdonto } = await supabase.from('odontograma_itens').insert([
        {
          paciente_id: pacienteId,
          dente,
          face,
          condicao,
          observacao: fullObservacao,
          atualizado_em: new Date().toISOString(),
        },
      ]);

      if (errorOdonto) {
        console.warn('[odontogramaService.saveProcedimentoDente] Erro odontograma_itens:', errorOdonto);
      }

      // 3. Registra na tabela de Evolução do Prontuário Clínico
      const descricaoClinica = `Procedimento no Dente ${dente} (Face: ${face}): ${procedimentoNome}. Status: ${
        condicao === 'concluido'
          ? 'Concluído'
          : condicao === 'tratamento'
          ? 'Necessita Tratamento'
          : condicao === 'ausente'
          ? 'Ausente/Extraído'
          : 'Hígido'
      }. Valor: R$ ${preco.toFixed(2)}. ${observacao ? `Notas: ${observacao}` : ''} Realizado por ${dentistaNome}.`;

      await supabase
        .from('evolucoes_prontuario')
        .insert([
          {
            paciente_id: pacienteId,
            descricao: descricaoClinica,
            data_hora: new Date().toISOString(),
          },
        ])
        .catch((err) => {
          console.warn('[odontogramaService.saveProcedimentoDente] Aviso evolucoes_prontuario:', err);
        });

      return true;
    } catch (err) {
      console.error('[odontogramaService.saveProcedimentoDente] Exceção:', err);
      return false;
    }
  },
};
