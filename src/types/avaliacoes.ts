export interface AvaliacaoItem {
  id: string;
  agendamento_id?: string | null;
  paciente_id?: string | null;
  nome_paciente: string;
  foto_url?: string | null;
  nota: number;
  comentario: string;
  canal?: string;
  destaque_site: boolean;
  criado_em: string;
  atualizado_em?: string;
}

export type CriarAvaliacaoInput = Omit<AvaliacaoItem, 'id' | 'criado_em' | 'atualizado_em'> & {
  id?: string;
  criado_em?: string;
};
