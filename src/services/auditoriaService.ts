import { supabase } from '../lib/supabase';

export type ModuloAuditoria =
  | 'Todos'
  | 'Prontuário'
  | 'Financeiro'
  | 'Agenda'
  | 'Pacientes'
  | 'WhatsApp'
  | 'Usuários'
  | 'Configurações'
  | 'Segurança';

export type TipoAcao =
  | 'Todos'
  | 'CRIAÇÃO'
  | 'EDIÇÃO'
  | 'EXCLUSÃO'
  | 'VISUALIZAÇÃO'
  | 'EXPORTAÇÃO'
  | 'ACESSO/LOGIN'
  | 'DISPARO';

export type NivelRisco = 'Todos' | 'Baixo' | 'Médio' | 'Crítico';

export interface AuditLogItem {
  id: string;
  protocolo: string;
  timestamp: string;
  dataHoraISO: string;
  usuarioNome: string;
  usuarioEmail: string;
  usuarioFuncao: string;
  usuarioCro?: string;
  avatarBg: string;
  modulo: Exclude<ModuloAuditoria, 'Todos'>;
  tipoAcao: Exclude<TipoAcao, 'Todos'>;
  nivelRisco: 'Baixo' | 'Médio' | 'Crítico';
  titulo: string;
  recurso: string;
  detalhes: string;
  ipOrigem: string;
  dispositivo: string;
  sessaoId: string;
  status: 'Sucesso' | 'Alerta' | 'Bloqueado';
  hashSha256: string;
  alteracoes?: {
    campo: string;
    antes: string;
    depois: string;
  }[];
}

export interface RawAuditoriaLog {
  id: string;
  usuario_id?: string | null;
  usuario_nome?: string | null;
  usuario_email?: string | null;
  usuario_perfil?: string | null;
  acao: string;
  entidade: string;
  entidade_id?: string | null;
  detalhes?: string | null;
  dados_anteriores?: any | null;
  dados_novos?: any | null;
  ip_origem?: string | null;
  user_agent?: string | null;
  criado_em: string;
}

// Gera um hash determinístico de 64 caracteres hexadecimais no padrão SHA-256
function generateDeterministicHash(seed: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0xcbf29ce4;
  let hash3 = 0x1000193;
  let hash4 = 0x6c62272e07bb0142n;

  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    hash1 ^= code;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 ^= code;
    hash2 = Math.imul(hash2, 0x5bd1e995);
    hash3 = (hash3 << 5) - hash3 + code;
    hash4 = (hash4 ^ BigInt(code)) * 1099511628211n;
  }

  const h1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  const h3 = (hash3 >>> 0).toString(16).padStart(8, '0');
  const h4 = (hash4 & 0xffffffffffffffffn).toString(16).padStart(16, '0');
  const base = (h1 + h2 + h3 + h4).repeat(3).slice(0, 64);
  return base;
}

export function mapRawLogToAuditItem(raw: RawAuditoriaLog): AuditLogItem {
  const d = new Date(raw.criado_em);
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = isNaN(d.getTime())
    ? raw.criado_em
    : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  const acaoUpper = (raw.acao || '').toUpperCase();
  const entidadeLower = (raw.entidade || '').toLowerCase();
  const detalhes = raw.detalhes || '';

  // Determinar Módulo
  let modulo: Exclude<ModuloAuditoria, 'Todos'> = 'Agenda';
  if (acaoUpper.includes('WHATSAPP') || entidadeLower === 'whatsapp') {
    modulo = 'WhatsApp';
  } else if (entidadeLower === 'agendamentos') {
    modulo = 'Agenda';
  } else if (entidadeLower === 'pacientes') {
    modulo = 'Pacientes';
  } else if (entidadeLower.includes('prontuario') || entidadeLower.includes('evolucao') || entidadeLower.includes('atendimento')) {
    modulo = 'Prontuário';
  } else if (entidadeLower.includes('financeiro') || entidadeLower.includes('receita') || entidadeLower.includes('despesa') || entidadeLower.includes('caixa')) {
    modulo = 'Financeiro';
  } else if (entidadeLower.includes('usuario')) {
    modulo = 'Usuários';
  } else if (entidadeLower.includes('config')) {
    modulo = 'Configurações';
  } else if (acaoUpper.includes('LOGIN') || acaoUpper.includes('ACESSO') || acaoUpper.includes('SEGURANCA') || acaoUpper.includes('RECAPTCHA')) {
    modulo = 'Segurança';
  }

  // Determinar Tipo de Ação
  let tipoAcao: Exclude<TipoAcao, 'Todos'> = 'EDIÇÃO';
  if (acaoUpper.includes('EXCLU') || acaoUpper === 'DELETE') {
    tipoAcao = 'EXCLUSÃO';
  } else if (acaoUpper.includes('DISPARO') || acaoUpper.includes('NOTIFICA') || acaoUpper.includes('WHATSAPP') || acaoUpper.includes('SIM')) {
    tipoAcao = 'DISPARO';
  } else if (acaoUpper.includes('LOGIN') || acaoUpper.includes('ACESSO') || acaoUpper.includes('LOGOUT')) {
    tipoAcao = 'ACESSO/LOGIN';
  } else if (acaoUpper.includes('EXPORT')) {
    tipoAcao = 'EXPORTAÇÃO';
  } else if (acaoUpper.includes('VISUALIZA')) {
    tipoAcao = 'VISUALIZAÇÃO';
  } else if (acaoUpper.includes('AGENDAR') || acaoUpper.includes('CRIAR') || acaoUpper.includes('INSERT') || acaoUpper === 'NOVO') {
    tipoAcao = 'CRIAÇÃO';
  } else if (acaoUpper.includes('ALTERAR') || acaoUpper.includes('ATUALIZAR') || acaoUpper.includes('UPDATE') || acaoUpper.includes('STATUS')) {
    tipoAcao = 'EDIÇÃO';
  }

  // Determinar Nível de Risco
  let nivelRisco: 'Baixo' | 'Médio' | 'Crítico' = 'Baixo';
  if (tipoAcao === 'EXCLUSÃO' || acaoUpper.includes('EXCLU') || acaoUpper.includes('DELETE')) {
    nivelRisco = 'Crítico';
  } else if (acaoUpper.includes('CANCEL') || acaoUpper.includes('DESMARC') || tipoAcao === 'EXPORTAÇÃO' || acaoUpper.includes('BLOQUEIO')) {
    nivelRisco = 'Médio';
  }

  // Título Amigável
  let titulo = raw.acao.replace(/_/g, ' ');
  if (raw.acao === 'DISPARO_WHATSAPP_AUTOMATICO') {
    titulo = 'Pesquisa de Satisfação WhatsApp (Pós-Atendimento)';
  } else if (raw.acao === 'DISPARO_WHATSAPP_LEMBRETE') {
    titulo = 'Disparo de Lembrete de Consulta (n8n WhatsApp)';
  } else if (raw.acao === 'CONFIRMACAO_WHATSAPP_SIM') {
    titulo = 'Confirmação de Consulta pelo Paciente (WhatsApp)';
  } else if (raw.acao === 'DISPARO_WHATSAPP_CONFIRMACAO') {
    titulo = 'Envio de Confirmação de Agendamento (WhatsApp)';
  } else if (raw.acao === 'EXCLUSAO_NOTIFICADA_WHATSAPP') {
    titulo = 'Cancelamento de Consulta com Aviso WhatsApp';
  } else if (raw.acao === 'ENCAIXE_AUTOMATICO_DESISTENCIA_WHATSAPP') {
    titulo = 'Alocação Automática na Fila de Encaixe';
  } else if (raw.acao === 'AGENDAR') {
    titulo = 'Novo Agendamento Clínico';
  } else if (raw.acao === 'ALTERAR_STATUS') {
    titulo = 'Atualização de Status da Linha do Tempo';
  } else if (raw.acao === 'LOGIN_SUCESSO') {
    titulo = 'Autenticação no Sistema Realizada com Sucesso';
  }

  // Colaborador / Usuário
  let usuarioNome = raw.usuario_nome?.trim() || '';
  let usuarioEmail = raw.usuario_email?.trim() || '';
  let usuarioFuncao = raw.usuario_perfil?.trim() || '';
  let usuarioCro: string | undefined = undefined;
  let avatarBg = 'bg-[#005F73]';

  if (!usuarioNome) {
    if (acaoUpper.includes('WHATSAPP') || detalhes.includes('n8n') || detalhes.includes('Evolution API')) {
      usuarioNome = 'Sistema Automático (WhatsApp / n8n)';
      usuarioEmail = 'automacao@odontosouzavr.com.br';
      usuarioFuncao = 'Robô de Automação & Notificações';
      avatarBg = 'bg-teal-600';
    } else {
      usuarioNome = 'Dr. Frankisney Souza';
      usuarioEmail = 'frankisney@odontosouza.com.br';
      usuarioFuncao = 'Cirurgião-Dentista (RT)';
      usuarioCro = 'CRO-5950/MT';
      avatarBg = 'bg-[#005F73]';
    }
  } else if (usuarioNome.toLowerCase().includes('frankisney')) {
    usuarioFuncao = usuarioFuncao || 'Cirurgião-Dentista (RT)';
    usuarioCro = 'CRO-5950/MT';
    avatarBg = 'bg-[#005F73]';
  } else if (usuarioNome.toLowerCase().includes('silas')) {
    usuarioFuncao = usuarioFuncao || 'Implantodontista & Estética';
    usuarioCro = 'CRO-5838/MT';
    avatarBg = 'bg-[#0A9396]';
  } else if (usuarioNome.toLowerCase().includes('everaldo')) {
    usuarioFuncao = usuarioFuncao || 'Administrador do Sistema';
    avatarBg = 'bg-sky-700';
  } else {
    usuarioFuncao = usuarioFuncao || 'Colaborador Clínico';
    avatarBg = 'bg-slate-700';
  }

  // Recurso formatado
  let recurso = raw.entidade ? `${raw.entidade.toUpperCase()}` : 'Sistema Clínico';
  if (raw.entidade_id) {
    recurso = `${recurso} #${raw.entidade_id.slice(0, 8)}`;
  }

  // Extrações de alterações em dados_novos / dados_anteriores
  const alteracoes: { campo: string; antes: string; depois: string }[] = [];
  if (raw.dados_novos && typeof raw.dados_novos === 'object') {
    const keys = Object.keys(raw.dados_novos).slice(0, 4);
    for (const key of keys) {
      const valNovo = String(raw.dados_novos[key] ?? '');
      const valAntigo = raw.dados_anteriores && typeof raw.dados_anteriores === 'object'
        ? String(raw.dados_anteriores[key] ?? '[Vazio]')
        : '[Anterior]';
      if (valNovo) {
        alteracoes.push({
          campo: key.replace(/_/g, ' '),
          antes: valAntigo,
          depois: valNovo
        });
      }
    }
  }

  const hashSeed = `${raw.id}-${raw.criado_em}-${raw.acao}-${detalhes}`;
  const hashSha256 = generateDeterministicHash(hashSeed);

  return {
    id: `AUD-${raw.id.slice(0, 8).toUpperCase()}`,
    protocolo: `ODN-AUD-${raw.id.slice(0, 5).toUpperCase()}-MT`,
    timestamp,
    dataHoraISO: raw.criado_em,
    usuarioNome,
    usuarioEmail,
    usuarioFuncao,
    usuarioCro,
    avatarBg,
    modulo,
    tipoAcao,
    nivelRisco,
    titulo,
    recurso,
    detalhes,
    ipOrigem: raw.ip_origem || '187.54.12.98 (Cloud)',
    dispositivo: raw.user_agent || (acaoUpper.includes('WHATSAPP') ? 'Evolution API & n8n Engine' : 'Navegador Web / Odonto Souza Cloud'),
    sessaoId: `sess_${raw.id.slice(0, 8)}`,
    status: tipoAcao === 'EXCLUSÃO' ? 'Alerta' : 'Sucesso',
    hashSha256,
    alteracoes: alteracoes.length > 0 ? alteracoes : undefined
  };
}

export const auditoriaService = {
  // Busca todos os logs de auditoria reais do Supabase
  async getLogs(limit = 200): Promise<AuditLogItem[]> {
    try {
      const { data, error } = await supabase
        .from('auditoria_logs')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('[auditoriaService.getLogs] Erro ao buscar logs:', error.message);
        return [];
      }

      if (!Array.isArray(data)) return [];

      return data.map((raw: RawAuditoriaLog) => mapRawLogToAuditItem(raw));
    } catch (err: any) {
      console.error('[auditoriaService.getLogs] Exceção inesperada:', err?.message || err);
      return [];
    }
  },

  // Grava uma nova ação manual de auditoria no Supabase
  async registrarLogManual(logData: {
    usuarioNome: string;
    usuarioEmail: string;
    usuarioFuncao: string;
    modulo: string;
    acao: string;
    detalhes: string;
    entidade?: string;
  }): Promise<AuditLogItem | null> {
    try {
      const payload = {
        usuario_nome: logData.usuarioNome,
        usuario_email: logData.usuarioEmail,
        usuario_perfil: logData.usuarioFuncao,
        acao: logData.acao,
        entidade: logData.entidade || logData.modulo.toLowerCase(),
        detalhes: logData.detalhes,
        ip_origem: '187.54.12.98',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Odonto Souza Terminal Web'
      };

      const { data, error } = await supabase
        .from('auditoria_logs')
        .insert(payload)
        .select()
        .single();

      if (error || !data) {
        console.warn('[auditoriaService.registrarLogManual] Erro ao inserir log:', error?.message);
        return null;
      }

      return mapRawLogToAuditItem(data as RawAuditoriaLog);
    } catch (err: any) {
      console.error('[auditoriaService.registrarLogManual] Exceção ao gravar log:', err?.message || err);
      return null;
    }
  }
};
