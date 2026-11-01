export type NotificacaoTipo =
  | 'novo_cadastro'
  | 'novo_agendamento'
  | 'alteracao_agendamento'
  | 'cancelamento_agendamento'
  | 'sistema';

export interface NotificacaoDetalhes {
  pacienteNome?: string;
  pacienteTelefone?: string;
  pacienteEmail?: string;
  dataConsulta?: string;
  horarioConsulta?: string;
  procedimento?: string;
  dentista?: string;
  origem?: 'portal_paciente' | 'recepcao' | 'sistema';
  motivo?: string;
  observacoes?: string;
}

export interface NotificacaoClinica {
  id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  dataHora: string;
  lida: boolean;
  detalhes?: NotificacaoDetalhes;
  linkRota?: 'agenda' | 'pacientes' | 'dashboard' | 'atendimento';
}
