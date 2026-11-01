export interface ConvenioItem {
  id: string;
  nome: string;
  razaoSocial?: string;
  registroAns?: string;
  cnpj?: string;
  telefoneContato?: string;
  emailContato?: string;
  diasRepasse: number;
  taxaCoparticipacao?: number;
  tabelaPrecosPadrao?: string;
  status: 'Ativo' | 'Inativo';
  observacoes?: string;
  tipoPlano?: 'proprio' | 'operadora';
  cobreMensalidade?: boolean;
  valorMensalidade?: number;
  totalPacientesVinculados?: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type ConvenioFormData = Omit<
  ConvenioItem,
  'id' | 'totalPacientesVinculados' | 'criadoEm' | 'atualizadoEm'
>;
