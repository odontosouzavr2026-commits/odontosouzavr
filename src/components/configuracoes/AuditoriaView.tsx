import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  Clock,
  Laptop,
  Globe,
  Database,
  Lock,
  ArrowUpDown,
  ChevronRight,
  X,
  Copy,
  Check,
  Printer,
  History,
  Activity,
  Layers,
  DollarSign,
  Users,
  MessageSquare,
  Settings,
  Sparkles,
} from 'lucide-react';

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

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'AUD-2026-9842',
    protocolo: 'ODN-AUD-89210-SP',
    timestamp: '28/10/2026 14:28:12',
    dataHoraISO: '2026-10-28T14:28:12',
    usuarioNome: 'Dr. Frankisney Souza',
    usuarioEmail: 'frankisney@odontosouza.com.br',
    usuarioFuncao: 'Cirurgião-Dentista (RT)',
    usuarioCro: 'CRO-5950/MT',
    avatarBg: 'bg-[#005F73]',
    modulo: 'Prontuário',
    tipoAcao: 'EDIÇÃO',
    nivelRisco: 'Médio',
    titulo: 'Evolução Clínica & Prescrição Antimicrobiana',
    recurso: 'Mariana Rios - Prontuário #0492',
    detalhes:
      'Registro de instalação de implante hexágono externo no elemento #21 com enxerto ósseo particulado. Prescrito Amoxicilina 500mg 8/8h por 7 dias.',
    ipOrigem: '187.54.12.98',
    dispositivo: 'Chrome 124 / Windows 11 (Consultório 01)',
    sessaoId: 'sess_frankisney_9821a',
    status: 'Sucesso',
    hashSha256: '9f83ac02d58bc4e9281a8b9e4f2081d582310b8cf892019a84b5c7e12948cd01',
    alteracoes: [
      { campo: 'Status Dente #21', antes: 'Ausente (Planejado)', depois: 'Implante Instalado' },
      { campo: 'Evolução Clínica', antes: '[Sem registro hoje]', depois: 'Cirurgia sem intercorrências' },
      { campo: 'Prescrição Digital', antes: 'Nenhuma ativa', depois: 'Amoxicilina 500mg + Dipirona 1g' },
    ],
  },
  {
    id: 'AUD-2026-9841',
    protocolo: 'ODN-AUD-89209-SP',
    timestamp: '28/10/2026 14:15:40',
    dataHoraISO: '2026-10-28T14:15:40',
    usuarioNome: 'Roberto Mendes',
    usuarioEmail: 'roberto.financeiro@odontosouza.com.br',
    usuarioFuncao: 'Analista Financeiro & Faturamento',
    avatarBg: 'bg-emerald-700',
    modulo: 'Financeiro',
    tipoAcao: 'CRIAÇÃO',
    nivelRisco: 'Baixo',
    titulo: 'Recebimento de Tratamento via Pix Dinâmico',
    recurso: 'Lançamento #REC-2026-4902 (R$ 350,00)',
    detalhes:
      'Liquidação automática via Webhook TEF/Pix referente à Restauração Resina Estética #26 do paciente Mariana Rios.',
    ipOrigem: '187.54.12.99',
    dispositivo: 'Edge 123 / Windows 10 (Recepção Term. 02)',
    sessaoId: 'sess_roberto_10294b',
    status: 'Sucesso',
    hashSha256: '4f2910ba781d4e028b8cf82910cd98214fa8120b41829e928410bc472019ab92',
    alteracoes: [
      { campo: 'Situação de Liquidação', antes: 'Pendente', depois: 'Pago / Compensado' },
      { campo: 'Forma de Pagamento', antes: 'A definir', depois: 'PIX Instantâneo (QR Code)' },
      { campo: 'NFS-e Vinculada', antes: 'Nenhuma', depois: 'NFS-e #4902 Solicitada' },
    ],
  },
  {
    id: 'AUD-2026-9840',
    protocolo: 'ODN-AUD-89208-SP',
    timestamp: '28/10/2026 13:52:04',
    dataHoraISO: '2026-10-28T13:52:04',
    usuarioNome: 'Camila Secretária',
    usuarioEmail: 'camila.secretaria@odontosouza.com.br',
    usuarioFuncao: 'Coordenadora de Atendimento',
    avatarBg: 'bg-[#0A9396]',
    modulo: 'Agenda',
    tipoAcao: 'EDIÇÃO',
    nivelRisco: 'Baixo',
    titulo: 'Reagendamento de Consulta de Profilaxia',
    recurso: 'Agendamento #AG-2026-819 - Carlos Eduardo Rocha',
    detalhes:
      'Horário remanejado a pedido do paciente pelo WhatsApp para adequar à escala cirúrgica do Dr. Frankisney Souza.',
    ipOrigem: '187.54.12.98',
    dispositivo: 'Firefox 125 / macOS Sonoma (Recepção Term. 01)',
    sessaoId: 'sess_camila_78122c',
    status: 'Sucesso',
    hashSha256: 'a10b8cf892019a84b5c7e12948cd019f83ac02d58bc4e9281a8b9e4f2081d582',
    alteracoes: [
      { campo: 'Data da Consulta', antes: '28/10/2026 15:00', depois: '29/10/2026 10:30' },
      { campo: 'Cadeira Alocada', antes: 'Cadeira 01', depois: 'Cadeira 01 (Implantes)' },
      { campo: 'Profissional', antes: 'Dr. Frankisney Souza', depois: 'Dr. Frankisney Souza' },
    ],
  },
  {
    id: 'AUD-2026-9839',
    protocolo: 'ODN-AUD-89207-SP',
    timestamp: '28/10/2026 11:30:19',
    dataHoraISO: '2026-10-28T11:30:19',
    usuarioNome: 'Roberto Mendes',
    usuarioEmail: 'roberto.financeiro@odontosouza.com.br',
    usuarioFuncao: 'Analista Financeiro & Faturamento',
    avatarBg: 'bg-emerald-700',
    modulo: 'Financeiro',
    tipoAcao: 'EXCLUSÃO',
    nivelRisco: 'Crítico',
    titulo: 'Exclusão de Duplicata Indevida de Despesa',
    recurso: 'Despesa #DESP-2026-0412 (R$ 840,00 - Dental Cremer)',
    detalhes:
      'Lançamento duplicado cancelado após conferência do arquivo XML de NF-e da fornecedora de brocas cirúrgicas.',
    ipOrigem: '187.54.12.99',
    dispositivo: 'Edge 123 / Windows 10 (Recepção Term. 02)',
    sessaoId: 'sess_roberto_10294b',
    status: 'Alerta',
    hashSha256: '7b81920ac41829e928410bc472019ab924f2910ba781d4e028b8cf82910cd982',
    alteracoes: [
      { campo: 'Registro Financeiro', antes: 'Ativo / Provisionado', depois: 'Excluído Definitivamente' },
      { campo: 'Motivo do Cancelamento', antes: 'N/A', depois: 'Nota fiscal lançada em duplicidade' },
    ],
  },
  {
    id: 'AUD-2026-9838',
    protocolo: 'ODN-AUD-89206-SP',
    timestamp: '28/10/2026 10:14:55',
    dataHoraISO: '2026-10-28T10:14:55',
    usuarioNome: 'Sistema Automático (Evolution API)',
    usuarioEmail: 'bot@odontosouza.com.br',
    usuarioFuncao: 'Robô de Automação & Notificações',
    avatarBg: 'bg-teal-600',
    modulo: 'WhatsApp',
    tipoAcao: 'DISPARO',
    nivelRisco: 'Baixo',
    titulo: 'Disparo de Lembrete de Consulta 24h (Meta Cloud)',
    recurso: 'WhatsApp Paciente +55 11 98877-6655 (Pedro Alcantara)',
    detalhes:
      'Template "Lembrete de Consulta (24h)" enviado e confirmado recebimento pela Evolution API. ID de mensagem: wamid.HBgL...',
    ipOrigem: '127.0.0.1 (Internal Service)',
    dispositivo: 'Daemon Node.js / Docker Container #odn-evo',
    sessaoId: 'bot_evo_worker_01',
    status: 'Sucesso',
    hashSha256: '281a8b9e4f2081d582310b8cf892019a84b5c7e12948cd019f83ac02d58bc4e9',
    alteracoes: [
      { campo: 'Status da Mensagem', antes: 'Na Fila', depois: 'Entregue ao Paciente (200 OK)' },
    ],
  },
  {
    id: 'AUD-2026-9837',
    protocolo: 'ODN-AUD-89205-SP',
    timestamp: '28/10/2026 09:05:22',
    dataHoraISO: '2026-10-28T09:05:22',
    usuarioNome: 'Dra. Amanda Rocha',
    usuarioEmail: 'amanda@odontosouza.com.br',
    usuarioFuncao: 'Ortodontista & Estética',
    usuarioCro: 'CRO-SP 94218',
    avatarBg: 'bg-indigo-600',
    modulo: 'Prontuário',
    tipoAcao: 'VISUALIZAÇÃO',
    nivelRisco: 'Baixo',
    titulo: 'Acesso a Tomografia Computadorizada Cone Beam',
    recurso: 'Prontuário #0381 - Lucas Vasconcelos',
    detalhes:
      'Consulta de cortes axiais e oblíquos tomográficos 3D para planejamento ortocirúrgico de mordida cruzada posterior.',
    ipOrigem: '187.54.12.98',
    dispositivo: 'Chrome 124 / Windows 11 (Consultório 02)',
    sessaoId: 'sess_amanda_66419d',
    status: 'Sucesso',
    hashSha256: 'e82910cd98214fa8120b41829e928410bc472019ab924f2910ba781d4e028b8c',
  },
  {
    id: 'AUD-2026-9836',
    protocolo: 'ODN-AUD-89204-SP',
    timestamp: '28/10/2026 08:02:11',
    dataHoraISO: '2026-10-28T08:02:11',
    usuarioNome: 'Dr. Frankisney Souza',
    usuarioEmail: 'frankisney@odontosouza.com.br',
    usuarioFuncao: 'Cirurgião-Dentista (RT)',
    usuarioCro: 'CRO-5950/MT',
    avatarBg: 'bg-[#005F73]',
    modulo: 'Segurança',
    tipoAcao: 'ACESSO/LOGIN',
    nivelRisco: 'Baixo',
    titulo: 'Autenticação no Sistema com Certificado ICP-Brasil',
    recurso: 'Sessão Administrativa Geral (IP Autorizado)',
    detalhes:
      'Login seguro realizado com sucesso no início do turno operacional. Token JWT com validade de 12 horas gerado com duplo fator.',
    ipOrigem: '187.54.12.98',
    dispositivo: 'Chrome 124 / Windows 11 (Consultório 01)',
    sessaoId: 'sess_frankisney_9821a',
    status: 'Sucesso',
    hashSha256: 'c7e12948cd019f83ac02d58bc4e9281a8b9e4f2081d582310b8cf892019a84b5',
  },
  {
    id: 'AUD-2026-9835',
    protocolo: 'ODN-AUD-89203-SP',
    timestamp: '27/10/2026 18:40:02',
    dataHoraISO: '2026-10-27T18:40:02',
    usuarioNome: 'Roberto Mendes',
    usuarioEmail: 'roberto.financeiro@odontosouza.com.br',
    usuarioFuncao: 'Analista Financeiro & Faturamento',
    avatarBg: 'bg-emerald-700',
    modulo: 'Financeiro',
    tipoAcao: 'EXPORTAÇÃO',
    nivelRisco: 'Médio',
    titulo: 'Exportação de DRE & Fechamento Contábil Mensal',
    recurso: 'Relatório DRE Outubro/2026 (Arquivo .XLSX criptografado)',
    detalhes:
      'Geração de planilha financeira completa para envio à contabilidade externa parceira. Registro em conformidade com a LGPD.',
    ipOrigem: '187.54.12.99',
    dispositivo: 'Edge 123 / Windows 10 (Recepção Term. 02)',
    sessaoId: 'sess_roberto_10294b',
    status: 'Sucesso',
    hashSha256: '8b9e4f2081d582310b8cf892019a84b5c7e12948cd019f83ac02d58bc4e9281a',
  },
  {
    id: 'AUD-2026-9834',
    protocolo: 'ODN-AUD-89202-SP',
    timestamp: '27/10/2026 16:19:30',
    dataHoraISO: '2026-10-27T16:19:30',
    usuarioNome: 'Dr. Frankisney Souza',
    usuarioEmail: 'frankisney@odontosouza.com.br',
    usuarioFuncao: 'Cirurgião-Dentista (RT)',
    usuarioCro: 'CRO-5950/MT',
    avatarBg: 'bg-[#005F73]',
    modulo: 'Usuários',
    tipoAcao: 'EDIÇÃO',
    nivelRisco: 'Crítico',
    titulo: 'Atualização de Permissões de Acesso de Colaborador',
    recurso: 'Colaborador Mariana Alcantara (ID #USR-04)',
    detalhes:
      'Concedida permissão temporária para emissão de recibos de consulta na recepção sob supervisão técnica.',
    ipOrigem: '187.54.12.98',
    dispositivo: 'Chrome 124 / Windows 11 (Consultório 01)',
    sessaoId: 'sess_frankisney_9821a',
    status: 'Sucesso',
    hashSha256: '1a8b9e4f2081d582310b8cf892019a84b5c7e12948cd019f83ac02d58bc4e928',
    alteracoes: [
      { campo: 'Permissão Recibos', antes: 'Bloqueado', depois: 'Permitido (Nível 2)' },
    ],
  },
  {
    id: 'AUD-2026-9833',
    protocolo: 'ODN-AUD-89201-SP',
    timestamp: '27/10/2026 14:02:44',
    dataHoraISO: '2026-10-27T14:02:44',
    usuarioNome: 'Camila Secretária',
    usuarioEmail: 'camila.secretaria@odontosouza.com.br',
    usuarioFuncao: 'Coordenadora de Atendimento',
    avatarBg: 'bg-[#0A9396]',
    modulo: 'Pacientes',
    tipoAcao: 'CRIAÇÃO',
    nivelRisco: 'Baixo',
    titulo: 'Cadastro Inicial de Novo Paciente',
    recurso: 'Paciente Beatriz Lemos (CPF: ***.418.908-**)',
    detalhes:
      'Cadastro com ficha anamnese básica e consentimento de tratamento odontológico e LGPD aceito digitalmente.',
    ipOrigem: '187.54.12.98',
    dispositivo: 'Firefox 125 / macOS Sonoma (Recepção Term. 01)',
    sessaoId: 'sess_camila_78122c',
    status: 'Sucesso',
    hashSha256: 'bc4e9281a8b9e4f2081d582310b8cf892019a84b5c7e12948cd019f83ac02d58',
    alteracoes: [
      { campo: 'Ficha Cadastral', antes: 'Inexistente', depois: 'Criada (#PAC-0512)' },
      { campo: 'Aceite LGPD', antes: 'Pendente', depois: 'Assinado em Tela' },
    ],
  },
];

interface AuditoriaViewProps {
  forceMobileView?: boolean;
}

export const AuditoriaView: React.FC<AuditoriaViewProps> = ({
  forceMobileView = false,
}) => {
  const [logs, setLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [busca, setBusca] = useState('');
  const [filtroModulo, setFiltroModulo] = useState<ModuloAuditoria>('Todos');
  const [filtroTipo, setFiltroTipo] = useState<TipoAcao>('Todos');
  const [filtroRisco, setFiltroRisco] = useState<NivelRisco>('Todos');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('Todos');
  const [periodoFiltro, setPeriodoFiltro] = useState<'todos' | 'hoje' | '7dias' | '30dias'>('todos');

  // Estado do Modal de Detalhes (Slide-Over)
  const [logSelecionado, setLogSelecionado] = useState<AuditLogItem | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Recarregar / Sincronizar Logs com feedback visual
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Trilha de auditoria sincronizada com o livro de registros imutável.');
    }, 600);
  };

  // Gerar novo registro de teste em tempo real
  const handleAddLiveLog = () => {
    const agora = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestampStr = `${pad(agora.getDate())}/${pad(agora.getMonth() + 1)}/${agora.getFullYear()} ${pad(
      agora.getHours()
    )}:${pad(agora.getMinutes())}:${pad(agora.getSeconds())}`;

    const newLog: AuditLogItem = {
      id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      protocolo: `ODN-AUD-${Math.floor(10000 + Math.random() * 90000)}-SP`,
      timestamp: timestampStr,
      dataHoraISO: agora.toISOString(),
      usuarioNome: 'Dr. Frankisney Souza',
      usuarioEmail: 'frankisney@odontosouza.com.br',
      usuarioFuncao: 'Cirurgião-Dentista (RT)',
      usuarioCro: 'CRO-5950/MT',
      avatarBg: 'bg-[#005F73]',
      modulo: 'Configurações',
      tipoAcao: 'CRIAÇÃO',
      nivelRisco: 'Baixo',
      titulo: 'Verificação Manual de Integridade de Auditoria',
      recurso: 'Módulo de Governança & Segurança',
      detalhes:
        'Evento registrado manualmente pelo Dr. Frankisney Souza para certificar a rastreabilidade das ações de colaboradores.',
      ipOrigem: '187.54.12.98',
      dispositivo: 'Terminal Principal / Odonto Souza Cloud',
      sessaoId: `sess_audit_${Date.now()}`,
      status: 'Sucesso',
      hashSha256: Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      alteracoes: [
        { campo: 'Auditoria Manual', antes: 'Aguardando', depois: 'Verificada e Aprovada' },
      ],
    };

    setLogs((prev) => [newLog, ...prev]);
    showToast('Novo evento de auditoria gerado e assinado criptograficamente!');
  };

  // Exportar para CSV
  const handleExportCSV = () => {
    const header = [
      'ID',
      'Protocolo',
      'DataHora',
      'Colaborador',
      'Cargo_CRO',
      'Modulo',
      'Acao',
      'Risco',
      'Titulo',
      'Recurso',
      'Detalhes',
      'IP',
      'Dispositivo',
      'Status',
      'Hash_SHA256',
    ];

    const rows = logsFiltrados.map((l) => [
      l.id,
      l.protocolo,
      l.timestamp,
      `"${l.usuarioNome}"`,
      `"${l.usuarioFuncao} ${l.usuarioCro || ''}"`,
      l.modulo,
      l.tipoAcao,
      l.nivelRisco,
      `"${l.titulo}"`,
      `"${l.recurso}"`,
      `"${l.detalhes.replace(/"/g, '""')}"`,
      l.ipOrigem,
      `"${l.dispositivo}"`,
      l.status,
      l.hashSha256,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [header.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `odonto_souza_auditoria_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Relatório completo de auditoria exportado em formato CSV.');
  };

  // Lista de usuários únicos para filtro
  const listaUsuarios = useMemo(() => {
    const users = new Set<string>();
    logs.forEach((l) => users.add(l.usuarioNome));
    return ['Todos', ...Array.from(users)];
  }, [logs]);

  // Filtragem dos logs
  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      // Busca textual
      const matchBusca =
        busca.trim() === '' ||
        log.usuarioNome.toLowerCase().includes(busca.toLowerCase()) ||
        log.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        log.recurso.toLowerCase().includes(busca.toLowerCase()) ||
        log.detalhes.toLowerCase().includes(busca.toLowerCase()) ||
        log.id.toLowerCase().includes(busca.toLowerCase()) ||
        log.ipOrigem.includes(busca.trim()) ||
        log.protocolo.toLowerCase().includes(busca.toLowerCase());

      // Filtro Módulo
      const matchModulo = filtroModulo === 'Todos' || log.modulo === filtroModulo;

      // Filtro Tipo
      const matchTipo = filtroTipo === 'Todos' || log.tipoAcao === filtroTipo;

      // Filtro Risco
      const matchRisco = filtroRisco === 'Todos' || log.nivelRisco === filtroRisco;

      // Filtro Usuário
      const matchUsuario = filtroUsuario === 'Todos' || log.usuarioNome === filtroUsuario;

      // Filtro Período
      let matchPeriodo = true;
      if (periodoFiltro === 'hoje') {
        matchPeriodo = log.timestamp.includes('28/10/2026');
      }

      return matchBusca && matchModulo && matchTipo && matchRisco && matchUsuario && matchPeriodo;
    });
  }, [logs, busca, filtroModulo, filtroTipo, filtroRisco, filtroUsuario, periodoFiltro]);

  // Métricas
  const totalLogs = logs.length;
  const acoesCriticas = logs.filter((l) => l.tipoAcao === 'EXCLUSÃO' || l.nivelRisco === 'Crítico').length;
  const usuariosAtivosCount = useMemo(() => {
    const setUsers = new Set(logs.map((l) => l.usuarioNome));
    return setUsers.size;
  }, [logs]);
  const logsHojeCount = logs.filter((l) => l.timestamp.includes('28/10/2026')).length;

  const copyToClipboard = (text: string, type: 'hash' | 'payload') => {
    navigator.clipboard?.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroModulo('Todos');
    setFiltroTipo('Todos');
    setFiltroRisco('Todos');
    setFiltroUsuario('Todos');
    setPeriodoFiltro('todos');
  };

  const temFiltroAtivo =
    busca !== '' ||
    filtroModulo !== 'Todos' ||
    filtroTipo !== 'Todos' ||
    filtroRisco !== 'Todos' ||
    filtroUsuario !== 'Todos' ||
    periodoFiltro !== 'todos';

  return (
    <div className="w-full h-full p-6 flex flex-col space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#005F73] text-white shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#89f3f6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#005F73]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  Auditoria e Registro de Ações
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Tempo Real Ativo
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#005F73]/10 text-[#005F73] font-semibold">
                  LGPD & CFO Compliant
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Histórico imutável de todas as ações executadas pelos colaboradores da Odonto Souza (prontuários, financeiro, agendamentos e mensagens).
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação do Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Atualizar lista de logs"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-orange-500 hover:opacity-80 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-opacity cursor-pointer"
            title="Exportar dados filtrados para CSV"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleAddLiveLog}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            title="Simular registro de ação em tempo real"
          >
            <Activity className="w-4 h-4 text-[#89f3f6]" />
            <span>Nova Ação Manual</span>
          </button>
        </div>
      </div>

      {/* 2. CARDS DE MÉTRICAS (PADRÃO ODONTO SOUZA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total de Eventos */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Eventos
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalLogs}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                +14% mês
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {logsHojeCount} eventos registrados hoje
            </p>
          </div>
          <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-[#005F73]/5 rounded-full pointer-events-none"></div>
        </div>

        {/* Ações Críticas */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ações Críticas / Exclusões
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                {acoesCriticas}
              </span>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                100% Justificadas
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cancelamentos e alterações com log
            </p>
          </div>
          <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-rose-500/5 rounded-full pointer-events-none"></div>
        </div>

        {/* Colaboradores Auditados */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Colaboradores no Período
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#0A9396]/10 text-[#0A9396] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {usuariosAtivosCount}
              </span>
              <span className="text-[11px] font-semibold text-[#005F73] bg-[#005F73]/10 px-1.5 py-0.5 rounded">
                RT: Dr. Frankisney
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Atividades rastreadas por sessão
            </p>
          </div>
          <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-[#0A9396]/5 rounded-full pointer-events-none"></div>
        </div>

        {/* Integridade & Conformidade */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Integridade do Registro
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                100%
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                SHA-256 Válido
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Assinatura digital e carimbo de tempo
            </p>
          </div>
          <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-emerald-500/5 rounded-full pointer-events-none"></div>
        </div>
      </div>

      {/* 3. BARRA DE FILTROS & BUSCA EM TEMPO REAL */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Campo de Busca Principal */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por colaborador, recurso, protocolo, ação, IP..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-slate-50/50"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Linha */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtro por Módulo */}
            <div className="relative min-w-[130px]">
              <select
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value as ModuloAuditoria)}
                className="w-full appearance-none px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer pr-8"
              >
                <option value="Todos">Módulo: Todos</option>
                <option value="Prontuário">Prontuário</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Agenda">Agenda</option>
                <option value="Pacientes">Pacientes</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Usuários">Usuários</option>
                <option value="Configurações">Configurações</option>
                <option value="Segurança">Segurança</option>
              </select>
              <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Filtro por Tipo de Ação */}
            <div className="relative min-w-[125px]">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoAcao)}
                className="w-full appearance-none px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer pr-8"
              >
                <option value="Todos">Ação: Todas</option>
                <option value="CRIAÇÃO">Criação (+)</option>
                <option value="EDIÇÃO">Edição (✏️)</option>
                <option value="EXCLUSÃO">Exclusão (🗑️)</option>
                <option value="VISUALIZAÇÃO">Visualização (👁️)</option>
                <option value="EXPORTAÇÃO">Exportação (📥)</option>
                <option value="ACESSO/LOGIN">Login / Acesso (🔑)</option>
                <option value="DISPARO">Disparo WhatsApp (💬)</option>
              </select>
              <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Filtro por Colaborador */}
            <div className="relative min-w-[140px]">
              <select
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="w-full appearance-none px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer pr-8"
              >
                <option value="Todos">Colaborador: Todos</option>
                {listaUsuarios
                  .filter((u) => u !== 'Todos')
                  .map((usr) => (
                    <option key={usr} value={usr}>
                      {usr}
                    </option>
                  ))}
              </select>
              <User className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Filtro por Nível de Risco */}
            <div className="relative min-w-[110px]">
              <select
                value={filtroRisco}
                onChange={(e) => setFiltroRisco(e.target.value as NivelRisco)}
                className="w-full appearance-none px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer pr-8"
              >
                <option value="Todos">Risco: Todos</option>
                <option value="Baixo">Baixo</option>
                <option value="Médio">Médio</option>
                <option value="Crítico">Crítico</option>
              </select>
              <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Botão Limpar Filtros */}
            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Limpar todos os filtros aplicados"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Filtros Rápidos / Pills */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-slate-400 text-[11px] font-medium shrink-0">Período:</span>
            {[
              { id: 'todos', label: 'Todos os Registros' },
              { id: 'hoje', label: 'Hoje (28/10)' },
              { id: '7dias', label: 'Últimos 7 dias' },
              { id: '30dias', label: 'Últimos 30 dias' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodoFiltro(p.id as any)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  periodoFiltro === p.id
                    ? 'bg-[#005F73] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 font-medium shrink-0 ml-3">
            Exibindo <strong>{logsFiltrados.length}</strong> de <strong>{totalLogs}</strong> logs
          </span>
        </div>
      </div>

      {/* 4. TABELA DE DADOS DE AUDITORIA (PADRÃO LISTAGEM COM GHOST ICONS) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Data / Hora & Protocolo</th>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Recurso & Detalhes</th>
                <th className="py-3 px-4 hidden md:table-cell">Origem (IP & Dispositivo)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700">Nenhum registro de auditoria encontrado</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Tente ajustar os termos de busca, limpar filtros ou redefinir o período selecionado.
                      </p>
                      <button
                        onClick={limparFiltros}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[#005F73] text-white text-xs font-semibold hover:bg-[#004857] transition-colors"
                      >
                        Redefinir Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                logsFiltrados.map((log) => {
                  // Badge da Ação
                  let badgeAcao = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (log.tipoAcao === 'CRIAÇÃO') {
                    badgeAcao = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (log.tipoAcao === 'EDIÇÃO') {
                    badgeAcao = 'bg-sky-50 text-sky-700 border-sky-200';
                  } else if (log.tipoAcao === 'EXCLUSÃO') {
                    badgeAcao = 'bg-rose-50 text-rose-700 border-rose-200';
                  } else if (log.tipoAcao === 'VISUALIZAÇÃO') {
                    badgeAcao = 'bg-purple-50 text-purple-700 border-purple-200';
                  } else if (log.tipoAcao === 'EXPORTAÇÃO') {
                    badgeAcao = 'bg-amber-50 text-amber-800 border-amber-200';
                  } else if (log.tipoAcao === 'ACESSO/LOGIN') {
                    badgeAcao = 'bg-blue-50 text-blue-700 border-blue-200';
                  } else if (log.tipoAcao === 'DISPARO') {
                    badgeAcao = 'bg-teal-50 text-teal-700 border-teal-200';
                  }

                  // Badge do Módulo
                  let moduloCor = 'text-[#005F73] bg-[#005F73]/10';
                  if (log.modulo === 'Financeiro') moduloCor = 'text-emerald-700 bg-emerald-50';
                  if (log.modulo === 'Agenda') moduloCor = 'text-cyan-700 bg-cyan-50';
                  if (log.modulo === 'WhatsApp') moduloCor = 'text-teal-700 bg-teal-50';
                  if (log.modulo === 'Usuários') moduloCor = 'text-indigo-700 bg-indigo-50';
                  if (log.modulo === 'Segurança') moduloCor = 'text-slate-700 bg-slate-100';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setLogSelecionado(log)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* 1. Data/Hora & Protocolo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {log.timestamp}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {log.id}
                          </span>
                        </div>
                      </td>

                      {/* 2. Colaborador */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-[160px]">
                          <div
                            className={`w-7 h-7 rounded-full ${log.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                          >
                            {log.usuarioNome.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 text-xs truncate">
                              {log.usuarioNome}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {log.usuarioFuncao}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Módulo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${moduloCor}`}
                        >
                          {log.modulo}
                        </span>
                      </td>

                      {/* 4. Ação */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border uppercase ${badgeAcao}`}
                        >
                          {log.tipoAcao}
                        </span>
                      </td>

                      {/* 5. Recurso & Resumo */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs truncate">
                            {log.recurso}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {log.detalhes}
                          </span>
                        </div>
                      </td>

                      {/* 6. Origem (IP & Dispositivo) */}
                      <td className="py-3 px-4 hidden md:table-cell whitespace-nowrap">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-mono text-slate-700">{log.ipOrigem}</span>
                          <span className="text-slate-400 truncate max-w-[150px]">
                            {log.dispositivo}
                          </span>
                        </div>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {log.status === 'Sucesso' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            OK
                          </span>
                        )}
                        {log.status === 'Alerta' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Alerta
                          </span>
                        )}
                        {log.status === 'Bloqueado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Bloqueado
                          </span>
                        )}
                      </td>

                      {/* 8. Botão Ghost de Ação */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogSelecionado(log);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:opacity-80 transition-opacity cursor-pointer"
                          title="Inspecionar detalhes e payload do log"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Trilha de auditoria criptografada e imutável (Art. 16 da LGPD)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Página 1 de 1</span>
            <span className="mx-1">•</span>
            <span>Total de registros: {logsFiltrados.length}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SLIDE-OVER / MODAL DE INSPEÇÃO DETALHADA DO LOG                       */}
      {/* ========================================================================= */}
      {logSelecionado && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setLogSelecionado(null)}
          />

          {/* Painel Lateral (Slide-Over) */}
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-hidden">
            {/* Cabeçalho do Slide-over */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-[#005F73]/5 flex items-start justify-between shrink-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005F73] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#89f3f6]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#005F73] bg-[#005F73]/10 px-2 py-0.5 rounded">
                      {logSelecionado.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Protocolo: {logSelecionado.protocolo}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-800 mt-1 leading-snug">
                    {logSelecionado.titulo}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setLogSelecionado(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Box 1: Colaborador e Identificação */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#005F73]" />
                    Colaborador Responsável
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Sessão Autenticada
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${logSelecionado.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                  >
                    {logSelecionado.usuarioNome.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {logSelecionado.usuarioNome}
                    </p>
                    <p className="text-xs text-[#005F73] font-medium leading-tight mt-0.5">
                      {logSelecionado.usuarioEmail}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{logSelecionado.usuarioFuncao}</span>
                      {logSelecionado.usuarioCro && (
                        <>
                          <span>•</span>
                          <span className="font-semibold">{logSelecionado.usuarioCro}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Contexto da Operação */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Módulo Alvo</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {logSelecionado.modulo}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Tipo de Operação</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {logSelecionado.tipoAcao}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Carimbo de Data/Hora</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {logSelecionado.timestamp}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Nível de Risco</span>
                  <span
                    className={`text-xs font-bold block mt-0.5 ${
                      logSelecionado.nivelRisco === 'Crítico'
                        ? 'text-rose-600'
                        : logSelecionado.nivelRisco === 'Médio'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {logSelecionado.nivelRisco}
                  </span>
                </div>
              </div>

              {/* Box 3: Recurso e Narrativa */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Recurso Manipulado
                </span>
                <p className="text-xs font-bold text-[#005F73] bg-cyan-50/60 p-2.5 rounded-lg border border-cyan-100">
                  {logSelecionado.recurso}
                </p>

                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block pt-2">
                  Detalhamento Técnico da Ação
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {logSelecionado.detalhes}
                </p>
              </div>

              {/* Box 4: Alterações Registradas (Diff Antes vs Depois) se houver */}
              {logSelecionado.alteracoes && logSelecionado.alteracoes.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#005F73]" />
                    Modificações Registradas (Auditoria de Campos)
                  </span>

                  <div className="space-y-2">
                    {logSelecionado.alteracoes.map((alt, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="font-bold text-slate-800">{alt.campo}</div>
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                          <div>
                            <span className="text-slate-400 block font-medium">Antes:</span>
                            <span className="text-rose-600 font-medium block truncate">
                              {alt.antes}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Depois:</span>
                            <span className="text-emerald-700 font-semibold block truncate">
                              {alt.depois}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Box 5: Metadados de Rede & Dispositivo */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Ambiente de Execução & Conexão
                </span>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Endereço IP de Origem:</span>
                  <span className="font-mono font-semibold text-slate-800">{logSelecionado.ipOrigem}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Dispositivo / Navegador:</span>
                  <span className="text-slate-800 font-medium text-right max-w-[260px] truncate">
                    {logSelecionado.dispositivo}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">ID da Sessão JWT:</span>
                  <span className="font-mono text-slate-600">{logSelecionado.sessaoId}</span>
                </div>
              </div>

              {/* Box 6: Assinatura Criptográfica SHA-256 */}
              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 shadow-inner space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Hash SHA-256 (Imutabilidade Criptográfica)
                  </span>
                  <button
                    onClick={() => copyToClipboard(logSelecionado.hashSha256, 'hash')}
                    className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[11px] break-all text-slate-300 bg-slate-800/80 p-2 rounded border border-slate-700">
                  {logSelecionado.hashSha256}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Conformidade CFO Resolução 222</span>
                  <span className="text-emerald-400 font-medium">Bloco Validado</span>
                </div>
              </div>
            </div>

            {/* Rodapé do Slide-Over */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(logSelecionado, null, 2), 'payload')
                }
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>JSON Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Payload JSON</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setLogSelecionado(null)}
                className="px-4 py-2 rounded-lg bg-[#005F73] text-white hover:bg-[#004857] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Fechar Inspeção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
