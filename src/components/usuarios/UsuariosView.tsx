import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Shield,
  Key,
  Edit2,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  Briefcase,
  Lock,
  X,
  Save,
  Check,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Eye,
  Calendar,
  DollarSign,
  UserCheck,
  Plus,
  FileText,
  Settings,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { UsuarioFormView } from './UsuarioFormView';
import { scrollToTop } from '../../utils/scrollUtils';
import { usuariosService } from '../../services/usuariosService';

export type RoleUsuario =
  | 'Super Administrador'
  | 'Administrador'
  | 'Socio'
  | 'Gerente'
  | 'Atendente'
  | 'Financeiro'
  | 'Paciente'
  | string;

export interface PermissoesPadrao {
  prontuario: boolean;
  prescricao: boolean;
  agenda: boolean;
  financeiro: boolean;
  relatorios: boolean;
  configuracoes: boolean;
}

export interface PerfilItem {
  id: string;
  nome: RoleUsuario;
  descricao: string;
  cor: string;
  usuariosCount: number;
  permissoesPadrao: PermissoesPadrao;
  nivelAcesso: 'Avançado' | 'Clínico' | 'Operacional' | 'Administrativo';
}

export const PERFIS_SISTEMA: PerfilItem[] = [
  {
    id: 'perf-super-admin',
    nome: 'Super Administrador',
    descricao: 'Acesso irrestrito a configurações do servidor, auditoria, banco de dados e gestão de segurança.',
    cor: 'bg-[#001219] text-white',
    usuariosCount: 1,
    nivelAcesso: 'Avançado',
    permissoesPadrao: {
      prontuario: true,
      prescricao: true,
      agenda: true,
      financeiro: true,
      relatorios: true,
      configuracoes: true,
    },
  },
  {
    id: 'perf-admin',
    nome: 'Administrador',
    descricao: 'Gestão administrativa da clínica, gestão de equipe, procedimentos, contratos e relatórios gerais.',
    cor: 'bg-[#005F73] text-white',
    usuariosCount: 1,
    nivelAcesso: 'Administrativo',
    permissoesPadrao: {
      prontuario: true,
      prescricao: false,
      agenda: true,
      financeiro: true,
      relatorios: true,
      configuracoes: true,
    },
  },
  {
    id: 'perf-socio',
    nome: 'Socio',
    descricao: 'Cirurgião-Dentista Sócio / Proprietário. Prontuários, odontograma, cirurgias, DRE e repasses de produção.',
    cor: 'bg-[#0A9396] text-white',
    usuariosCount: 1,
    nivelAcesso: 'Clínico',
    permissoesPadrao: {
      prontuario: true,
      prescricao: true,
      agenda: true,
      financeiro: true,
      relatorios: true,
      configuracoes: true,
    },
  },
  {
    id: 'perf-gerente',
    nome: 'Gerente',
    descricao: 'Coordenação operacional da clínica, controle de estoque, esterilização (autoclaves) e metas de atendimento.',
    cor: 'bg-[#CA6702] text-white',
    usuariosCount: 1,
    nivelAcesso: 'Operacional',
    permissoesPadrao: {
      prontuario: false,
      prescricao: false,
      agenda: true,
      financeiro: true,
      relatorios: true,
      configuracoes: false,
    },
  },
  {
    id: 'perf-atendente',
    nome: 'Atendente',
    descricao: 'Recepção e acolhimento, agendamento de consultas, confirmação via WhatsApp e sala de espera.',
    cor: 'bg-[#94D2BD] text-[#001219]',
    usuariosCount: 2,
    nivelAcesso: 'Operacional',
    permissoesPadrao: {
      prontuario: false,
      prescricao: false,
      agenda: true,
      financeiro: false,
      relatorios: false,
      configuracoes: false,
    },
  },
  {
    id: 'perf-financeiro',
    nome: 'Financeiro',
    descricao: 'Gestão de contas a pagar e receber, fluxo de caixa diário, faturamento de convênios e conciliação bancária.',
    cor: 'bg-[#EE9B00] text-white',
    usuariosCount: 1,
    nivelAcesso: 'Administrativo',
    permissoesPadrao: {
      prontuario: false,
      prescricao: false,
      agenda: false,
      financeiro: true,
      relatorios: true,
      configuracoes: false,
    },
  },
  {
    id: 'perf-paciente',
    nome: 'Paciente',
    descricao: 'Portal do Paciente: consulta de agendamentos, orçamentos, orientações pós-operatórias e recibos.',
    cor: 'bg-emerald-600 text-white',
    usuariosCount: 0,
    nivelAcesso: 'Operacional',
    permissoesPadrao: {
      prontuario: false,
      prescricao: false,
      agenda: true,
      financeiro: false,
      relatorios: false,
      configuracoes: false,
    },
  },
];

export interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  funcao: string;
  cro: string;
  role: RoleUsuario;
  cadeira: string;
  status: 'Ativo' | 'Inativo';
  avatarBg: string;
  permissoes: PermissoesPadrao;
}

const INITIAL_USUARIOS: UsuarioItem[] = [];

interface UsuariosViewProps {
  forceMobileView?: boolean;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({ forceMobileView = false }) => {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>(INITIAL_USUARIOS);
  const [perfis, setPerfis] = useState<PerfilItem[]>(PERFIS_SISTEMA);

  // Carregar dados de equipe e perfis do Supabase Self-Hosted
  useEffect(() => {
    let isMounted = true;
    async function loadEquipe() {
      try {
        const [usersDb, perfisDb] = await Promise.all([
          usuariosService.getUsuarios(),
          usuariosService.getPerfis(),
        ]);
        if (isMounted) {
          setUsuarios(usersDb || []);
          if (perfisDb.length > 0) setPerfis(perfisDb);
        }
      } catch (e) {
        console.warn('Fallback local para equipe:', e);
      }
    }
    loadEquipe();
    return () => {
      isMounted = false;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRole, setFiltroRole] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Navigation tab: 'usuarios' (Membros) | 'perfis' (Tipos de Usuários)
  const [abaUsuarios, setAbaUsuarios] = useState<'usuarios' | 'perfis'>('usuarios');

  // View Switching (Regra Arquitetural Mobile-First: Sem Modais)
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'form-perfil'>('list');
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<UsuarioItem | null>(null);

  // Garante que a tela sempre abra do início ao alternar entre lista e formulários
  useEffect(() => {
    scrollToTop();
  }, [currentView]);

  // Profile editing state
  const [perfilEmEdicao, setPerfilEmEdicao] = useState<PerfilItem | null>(null);
  const [perfilForm, setPerfilForm] = useState<Partial<PerfilItem>>({
    nome: '',
    descricao: '',
    nivelAcesso: 'Clínico',
    cor: 'bg-[#005F73] text-white',
    permissoesPadrao: {
      prontuario: false,
      prescricao: false,
      agenda: true,
      financeiro: false,
      relatorios: false,
      configuracoes: false,
    },
  });

  // Permissions View Modal
  const [isPermissoesModalOpen, setIsPermissoesModalOpen] = useState(false);
  const [usuarioVisualizandoPermissoes, setUsuarioVisualizandoPermissoes] = useState<UsuarioItem | null>(null);

  // Recalculate user count for profiles
  const perfisComContagem = useMemo(() => {
    return perfis.map((p) => ({
      ...p,
      usuariosCount: usuarios.filter((u) => u.role === p.nome).length,
    }));
  }, [perfis, usuarios]);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((user) => {
      const matchSearch =
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.funcao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole =
        filtroRole === 'todos' ||
        (filtroRole === 'dentistas' && user.role.includes('Dentista')) ||
        (filtroRole === 'recepcao' && user.role.includes('Recepção')) ||
        (filtroRole === 'financeiro' && user.role.includes('Financeiro')) ||
        (filtroRole === 'admin' && user.role === 'Super Administrador') ||
        user.role === filtroRole;

      const matchStatus = filtroStatus === 'todos' || user.status === filtroStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }, [usuarios, searchTerm, filtroRole, filtroStatus]);

  // Contadores
  const totalCount = usuarios.length;
  const dentistasCount = usuarios.filter((u) => u.role.includes('Dentista')).length;
  const recepcaoCount = usuarios.filter((u) => u.role.includes('Recepção')).length;
  const financeiroCount = usuarios.filter((u) => u.role.includes('Financeiro') || u.role.includes('Admin')).length;

  const handleOpenNovoUsuario = () => {
    setUsuarioEmEdicao(null);
    setCurrentView('form');
  };

  const handleOpenEditarUsuario = (user: UsuarioItem) => {
    setUsuarioEmEdicao(user);
    setCurrentView('form');
  };

  const handleOpenPermissoes = (user: UsuarioItem) => {
    setUsuarioVisualizandoPermissoes(user);
    setIsPermissoesModalOpen(true);
  };

  const handleSalvarUsuario = async (dados: Partial<UsuarioItem>) => {
    try {
      if (usuarioEmEdicao) {
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuarioEmEdicao.id
              ? ({
                  ...u,
                  ...dados,
                } as UsuarioItem)
              : u
          )
        );
        toast.success('Usuário atualizado com sucesso!', `As alterações de ${dados.nome} foram salvas.`);
        await usuariosService.saveUsuario({ ...dados, id: usuarioEmEdicao.id });
      } else {
        const novoId = String(Date.now());
        const novo: UsuarioItem = {
          id: novoId,
          nome: dados.nome || 'Novo Membro',
          email: dados.email || '',
          telefone: dados.telefone || '(24) 99999-0000',
          funcao: dados.funcao || 'Membro Clínico',
          cro: dados.cro || 'Não se aplica',
          role: dados.role || 'Atendente',
          cadeira: dados.cadeira || 'Consultório Geral',
          status: (dados.status as 'Ativo' | 'Inativo') || 'Ativo',
          avatarBg: 'bg-[#005F73]',
          permissoes: dados.permissoes || {
            prontuario: true,
            prescricao: false,
            agenda: true,
            financeiro: false,
            relatorios: false,
            configuracoes: false,
          },
        };
        setUsuarios((prev) => [novo, ...prev]);
        toast.success('Membro cadastrado com sucesso!', `Acesso habilitado para ${novo.email}.`);
        await usuariosService.saveUsuario(novo);
      }
    } catch (e) {
      console.warn('Erro ao salvar no Supabase:', e);
    }

    setCurrentView('list');
    setUsuarioEmEdicao(null);
  };

  const handleToggleStatus = (id: string) => {
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const novoStatus = u.status === 'Ativo' ? 'Inativo' : 'Ativo';
          toast.info(
            `Status alterado para ${novoStatus}`,
            `O acesso de ${u.nome} foi atualizado.`
          );
          return { ...u, status: novoStatus };
        }
        return u;
      })
    );
  };

  // Gerenciamento de Perfis de Acesso
  const handleOpenNovoPerfil = () => {
    setPerfilEmEdicao(null);
    setPerfilForm({
      nome: '',
      descricao: '',
      nivelAcesso: 'Clínico',
      cor: 'bg-[#005F73] text-white',
      permissoesPadrao: {
        prontuario: false,
        prescricao: false,
        agenda: true,
        financeiro: false,
        relatorios: false,
        configuracoes: false,
      },
    });
    setCurrentView('form-perfil');
  };

  const handleOpenEditarPerfil = (perfil: PerfilItem) => {
    setPerfilEmEdicao(perfil);
    setPerfilForm({ ...perfil });
    setCurrentView('form-perfil');
  };

  const handleSalvarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfilForm.nome || !perfilForm.nome.trim()) {
      toast.warning('Atenção', 'Informe o nome do perfil de acesso.');
      return;
    }

    if (perfilEmEdicao) {
      setPerfis((prev) =>
        prev.map((p) =>
          p.id === perfilEmEdicao.id
            ? ({
                ...p,
                nome: perfilForm.nome!,
                descricao: perfilForm.descricao || '',
                nivelAcesso: perfilForm.nivelAcesso || 'Clínico',
                cor: perfilForm.cor || p.cor,
                permissoesPadrao: perfilForm.permissoesPadrao || p.permissoesPadrao,
              } as PerfilItem)
            : p
        )
      );
      toast.success('Perfil atualizado!', `O perfil "${perfilForm.nome}" foi alterado.`);
    } else {
      const novoPerfil: PerfilItem = {
        id: `perf-${Date.now()}`,
        nome: perfilForm.nome!,
        descricao: perfilForm.descricao || '',
        nivelAcesso: perfilForm.nivelAcesso || 'Clínico',
        cor: perfilForm.cor || 'bg-[#005F73] text-white',
        usuariosCount: 0,
        permissoesPadrao: perfilForm.permissoesPadrao || {
          prontuario: false,
          prescricao: false,
          agenda: true,
          financeiro: false,
          relatorios: false,
          configuracoes: false,
        },
      };
      setPerfis((prev) => [...prev, novoPerfil]);
      toast.success('Novo perfil cadastrado!', `O perfil "${novoPerfil.nome}" foi criado com sucesso.`);
    }

    setCurrentView('list');
    setPerfilEmEdicao(null);
  };

  // 1. RENDERIZAÇÃO DO FORMULÁRIO DE USUÁRIO INLINE (Sem modal, estilo app nativa)
  if (currentView === 'form') {
    return (
      <div className="w-full h-full p-4 md:p-6 animate-in fade-in duration-200">
        <UsuarioFormView
          initialData={usuarioEmEdicao}
          perfisDisponiveis={perfisComContagem}
          onSave={handleSalvarUsuario}
          onCancel={() => {
            setCurrentView('list');
            setUsuarioEmEdicao(null);
          }}
          isMobile={forceMobileView}
        />
      </div>
    );
  }

  // 2. RENDERIZAÇÃO DO FORMULÁRIO DE PERFIL INLINE (Sem modal, estilo app nativa)
  if (currentView === 'form-perfil') {
    return (
      <div className="w-full h-full p-4 md:p-6 animate-in fade-in duration-200 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#005F73]" />
            <span>Voltar para Perfis &amp; Usuários</span>
          </button>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {perfilEmEdicao ? 'Edição de Perfil' : 'Novo Perfil de Acesso'}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#005F73]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {perfilEmEdicao ? `Editar Perfil: ${perfilEmEdicao.nome}` : 'Cadastrar Perfil de Acesso'}
              </h1>
              <p className="text-xs text-slate-500">
                Definição de regras de acesso e permissões padrão para membros da equipe.
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvarPerfil} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Nome do Perfil de Acesso *
              </label>
              <input
                type="text"
                required
                value={perfilForm.nome || ''}
                onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })}
                placeholder="Ex: Auditor Clínico, Protético, Auxiliar de Saúde Bucal"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Nível de Acesso
              </label>
              <select
                value={perfilForm.nivelAcesso || 'Clínico'}
                onChange={(e) =>
                  setPerfilForm({
                    ...perfilForm,
                    nivelAcesso: e.target.value as PerfilItem['nivelAcesso'],
                  })
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
              >
                <option value="Operacional">Operacional (Recepção / Agenda)</option>
                <option value="Clínico">Clínico (Dentistas / Assistentes)</option>
                <option value="Administrativo">Administrativo (Financeiro / Faturamento)</option>
                <option value="Avançado">Avançado (Super Administrador)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Descrição do Papel
              </label>
              <textarea
                rows={2}
                value={perfilForm.descricao || ''}
                onChange={(e) => setPerfilForm({ ...perfilForm, descricao: e.target.value })}
                placeholder="Descreva as responsabilidades e restrições deste perfil..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">
                Permissões Padrão de Módulos
              </label>
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perfilForm.permissoesPadrao?.prontuario}
                    onChange={(e) =>
                      setPerfilForm({
                        ...perfilForm,
                        permissoesPadrao: {
                          ...perfilForm.permissoesPadrao!,
                          prontuario: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#005F73] focus:ring-[#005F73]"
                  />
                  <span>Prontuário Clínico</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perfilForm.permissoesPadrao?.prescricao}
                    onChange={(e) =>
                      setPerfilForm({
                        ...perfilForm,
                        permissoesPadrao: {
                          ...perfilForm.permissoesPadrao!,
                          prescricao: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#005F73] focus:ring-[#005F73]"
                  />
                  <span>Receitas &amp; Atestados</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perfilForm.permissoesPadrao?.agenda}
                    onChange={(e) =>
                      setPerfilForm({
                        ...perfilForm,
                        permissoesPadrao: {
                          ...perfilForm.permissoesPadrao!,
                          agenda: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#005F73] focus:ring-[#005F73]"
                  />
                  <span>Agenda &amp; Encaixes</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perfilForm.permissoesPadrao?.financeiro}
                    onChange={(e) =>
                      setPerfilForm({
                        ...perfilForm,
                        permissoesPadrao: {
                          ...perfilForm.permissoesPadrao!,
                          financeiro: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#005F73] focus:ring-[#005F73]"
                  />
                  <span>Financeiro &amp; Caixa</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perfilForm.permissoesPadrao?.relatorios}
                    onChange={(e) =>
                      setPerfilForm({
                        ...perfilForm,
                        permissoesPadrao: {
                          ...perfilForm.permissoesPadrao!,
                          relatorios: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#005F73] focus:ring-[#005F73]"
                  />
                  <span>Relatórios &amp; DRE</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perfilForm.permissoesPadrao?.configuracoes}
                    onChange={(e) =>
                      setPerfilForm({
                        ...perfilForm,
                        permissoesPadrao: {
                          ...perfilForm.permissoesPadrao!,
                          configuracoes: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#005F73] focus:ring-[#005F73]"
                  />
                  <span>Configurações &amp; APIs</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Perfil</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 bg-slate-50 flex flex-col space-y-6">
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  Usuários e Perfis de Acesso
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#005F73]/10 text-[#005F73] text-xs font-bold">
                  {totalCount} Usuários
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Gestão da equipe clínica, secretárias, perfis de permissão e credenciais
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {abaUsuarios === 'usuarios' ? (
            <button
              onClick={handleOpenNovoUsuario}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Convidar Novo Membro da Equipe</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNovoPerfil}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Perfil de Acesso</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Aba de Navegação: Membros da Equipe vs Tipos de Usuários / Perfis */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setAbaUsuarios('usuarios')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
            abaUsuarios === 'usuarios'
              ? 'text-[#005F73] border-b-2 border-[#005F73]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Membros da Equipe ({totalCount})</span>
          </div>
        </button>

        <button
          onClick={() => setAbaUsuarios('perfis')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
            abaUsuarios === 'perfis'
              ? 'text-[#005F73] border-b-2 border-[#005F73]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Tipos de Usuários &amp; Perfis de Acesso ({perfis.length})</span>
          </div>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: MEMBROS DA EQUIPE */}
      {abaUsuarios === 'usuarios' && (
        <>
          {/* 2. CARDS DE MÉTRICAS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Total da Equipe
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 block">
                  {totalCount}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> 100% Contas Ativas
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Cirurgiões-Dentistas
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 block">
                  {dentistasCount}
                </span>
                <span className="text-[11px] text-cyan-700 font-medium flex items-center gap-1 mt-0.5">
                  <Stethoscope className="w-3 h-3" /> CRO Ativo no Sistema
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0A9396]/10 text-[#0A9396] flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Recepção & Atendimento
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 block">
                  {recepcaoCount}
                </span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" /> Balcão & Agenda
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Administrativo / Gestão
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 block">
                  {financeiroCount}
                </span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Acessos Avançados
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 3. BARRA DE FILTROS E BUSCA */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por profissional, e-mail, CRO ou especialidade..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] transition-all bg-slate-50/50"
              />
            </div>

            {/* Filtros em Tabs / Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filtroRole}
                onChange={(e) => setFiltroRole(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer"
              >
                <option value="todos">Todos os Perfis ({totalCount})</option>
                {perfis.map((p) => (
                  <option key={p.id} value={p.nome}>
                    {p.nome}
                  </option>
                ))}
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer"
              >
                <option value="todos">Todos os Status</option>
                <option value="Ativo">Somente Ativos</option>
                <option value="Inativo">Somente Inativos</option>
              </select>
            </div>
          </div>

          {/* 4. TABELA DE MEMBROS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Profissional / Usuário</th>
                    <th className="px-4 py-3.5">Função / Registro</th>
                    <th className="px-4 py-3.5">Perfil de Acesso</th>
                    <th className="px-4 py-3.5">Cadeira Principal</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">Nenhum usuário encontrado para este filtro.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsuarios.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-default"
                      >
                        {/* Profissional / Usuário */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full ${user.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                            >
                              {user.nome
                                .split(' ')
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 block text-xs sm:text-sm truncate">
                                {user.nome}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Função / Registro */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-semibold text-slate-700 block">
                            {user.funcao}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {user.cro}
                          </span>
                        </td>

                        {/* Perfil de Acesso */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              user.role === 'Super Administrador'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : user.role.includes('Dentista')
                                ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                : user.role.includes('Recepção')
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Cadeira Principal */}
                        <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                          {user.cadeira}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                              user.status === 'Ativo'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                            title="Clique para alternar status"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'Ativo' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                            ></span>
                            {user.status}
                          </button>
                        </td>

                        {/* Ações */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenPermissoes(user)}
                              className="p-1.5 rounded-lg text-blue-600 hover:opacity-80 transition-opacity cursor-pointer"
                              title="Visualizar Permissões de Acesso"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditarUsuario(user)}
                              className="p-1.5 rounded-lg text-amber-500 hover:opacity-80 transition-opacity cursor-pointer"
                              title="Editar Usuário"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* CONTEÚDO DA ABA 2: TIPOS DE USUÁRIOS & PERFIS DE ACESSO */}
      {abaUsuarios === 'perfis' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Tabela de Tipos de Usuários & Matriz de Permissões
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina os papéis institucionais e o que cada perfil tem permissão de visualizar e alterar no sistema.
              </p>
            </div>
            <button
              onClick={handleOpenNovoPerfil}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Perfil</span>
            </button>
          </div>

          {/* Tabela de Perfis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Perfil de Acesso</th>
                    <th className="px-4 py-3.5">Descrição & Escopo</th>
                    <th className="px-4 py-3.5 text-center">Nível</th>
                    <th className="px-4 py-3.5 text-center">Usuários</th>
                    <th className="px-4 py-3.5">Matriz de Permissões Padrão</th>
                    <th className="px-4 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perfisComContagem.map((perfil) => (
                    <tr key={perfil.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Perfil */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                            <Shield className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                            {perfil.nome}
                          </span>
                        </div>
                      </td>

                      {/* Descrição */}
                      <td className="px-4 py-3.5 align-top max-w-xs text-xs text-slate-600">
                        {perfil.descricao}
                      </td>

                      {/* Nível de Acesso */}
                      <td className="px-4 py-3.5 align-top text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {perfil.nivelAcesso}
                        </span>
                      </td>

                      {/* Quantidade de Usuários */}
                      <td className="px-4 py-3.5 align-top text-center">
                        <button
                          onClick={() => {
                            setFiltroRole(perfil.nome);
                            setAbaUsuarios('usuarios');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#005F73]/10 hover:text-[#005F73] text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                          title="Filtrar membros com este perfil"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{perfil.usuariosCount}</span>
                        </button>
                      </td>

                      {/* Matriz de Permissões */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              perfil.permissoesPadrao.prontuario
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {perfil.permissoesPadrao.prontuario ? '✓' : '✕'} Prontuário
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              perfil.permissoesPadrao.prescricao
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {perfil.permissoesPadrao.prescricao ? '✓' : '✕'} Receitas
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              perfil.permissoesPadrao.agenda
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {perfil.permissoesPadrao.agenda ? '✓' : '✕'} Agenda
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              perfil.permissoesPadrao.financeiro
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {perfil.permissoesPadrao.financeiro ? '✓' : '✕'} Financeiro
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              perfil.permissoesPadrao.relatorios
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {perfil.permissoesPadrao.relatorios ? '✓' : '✕'} Relatórios
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              perfil.permissoesPadrao.configuracoes
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {perfil.permissoesPadrao.configuracoes ? '✓' : '✕'} Config
                          </span>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 align-top text-right">
                        <button
                          onClick={() => handleOpenEditarPerfil(perfil)}
                          className="p-1.5 rounded-lg text-amber-500 hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                          title="Editar Perfil de Acesso"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR PERMISSÕES DE UM USUÁRIO */}
      {isPermissoesModalOpen && usuarioVisualizandoPermissoes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsPermissoesModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 z-10 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    Permissões de {usuarioVisualizandoPermissoes.nome}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Perfil: {usuarioVisualizandoPermissoes.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPermissoesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  label: 'Prontuário Clínico & Evolução',
                  allowed: usuarioVisualizandoPermissoes.permissoes.prontuario,
                },
                {
                  label: 'Emissão de Receituários & Atestados',
                  allowed: usuarioVisualizandoPermissoes.permissoes.prescricao,
                },
                {
                  label: 'Gestão da Agenda & Encaixes',
                  allowed: usuarioVisualizandoPermissoes.permissoes.agenda,
                },
                {
                  label: 'Módulo Financeiro & Caixa Diário',
                  allowed: usuarioVisualizandoPermissoes.permissoes.financeiro,
                },
                {
                  label: 'Relatórios Gerenciais & Comissões',
                  allowed: usuarioVisualizandoPermissoes.permissoes.relatorios,
                },
                {
                  label: 'Configurações do Sistema & APIs',
                  allowed: usuarioVisualizandoPermissoes.permissoes.configuracoes,
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-xs"
                >
                  <span className="font-medium text-slate-700">{p.label}</span>
                  {p.allowed ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Liberado
                    </span>
                  ) : (
                    <span className="text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                      Bloqueado
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsPermissoesModalOpen(false)}
                className="px-4 py-2 bg-[#005F73] text-white text-xs font-semibold rounded-lg hover:bg-[#004857] transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
