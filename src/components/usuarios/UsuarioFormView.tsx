import React, { useState } from 'react';
import {
  ArrowLeft,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  Briefcase,
  Lock,
  Save,
  Check,
  AlertTriangle,
  Key,
} from 'lucide-react';
import { UsuarioItem, RoleUsuario } from './UsuariosView';
import { useToast } from '../../contexts/ToastContext';
import { ValidatedInput } from '../common/ValidatedInput';
import { scrollToTop } from '../../utils/scrollUtils';

interface UsuarioFormViewProps {
  initialData?: UsuarioItem | null;
  perfisDisponiveis: Array<{
    id: string;
    nome: RoleUsuario;
    descricao: string;
    cor: string;
  }>;
  onSave: (usuario: Partial<UsuarioItem>) => void;
  onCancel: () => void;
  isMobile?: boolean;
}

export const UsuarioFormView: React.FC<UsuarioFormViewProps> = ({
  initialData,
  perfisDisponiveis,
  onSave,
  onCancel,
  isMobile = false,
}) => {
  const toast = useToast();

  // Sempre rola ao topo absoluto quando o formulário é montado
  React.useEffect(() => {
    scrollToTop();
  }, []);

  const [nome, setNome] = useState(initialData?.nome || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [telefone, setTelefone] = useState(initialData?.telefone || '');
  const [funcao, setFuncao] = useState(initialData?.funcao || '');
  const [cro, setCro] = useState(initialData?.cro || '');
  const [role, setRole] = useState<RoleUsuario>(
    initialData?.role || 'Atendente'
  );
  const [cadeira, setCadeira] = useState(
    initialData?.cadeira || 'Cadeira 01 (Implantes & Cirurgia)'
  );
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>(
    initialData?.status || 'Ativo'
  );

  const [permissoes, setPermissoes] = useState(
    initialData?.permissoes || {
      prontuario: false,
      prescricao: false,
      agenda: true,
      financeiro: false,
      relatorios: false,
      configuracoes: false,
    }
  );

  const handleRoleChange = (novoRole: RoleUsuario) => {
    setRole(novoRole);
    // Aplica templates padrões de permissões por perfil
    switch (novoRole) {
      case 'Super Administrador':
        setPermissoes({
          prontuario: true,
          prescricao: true,
          agenda: true,
          financeiro: true,
          relatorios: true,
          configuracoes: true,
        });
        break;
      case 'Administrador':
        setPermissoes({
          prontuario: true,
          prescricao: false,
          agenda: true,
          financeiro: true,
          relatorios: true,
          configuracoes: true,
        });
        break;
      case 'Socio':
        setPermissoes({
          prontuario: true,
          prescricao: true,
          agenda: true,
          financeiro: true,
          relatorios: true,
          configuracoes: true,
        });
        break;
      case 'Gerente':
        setPermissoes({
          prontuario: false,
          prescricao: false,
          agenda: true,
          financeiro: true,
          relatorios: true,
          configuracoes: false,
        });
        break;
      case 'Financeiro':
        setPermissoes({
          prontuario: false,
          prescricao: false,
          agenda: false,
          financeiro: true,
          relatorios: true,
          configuracoes: false,
        });
        break;
      case 'Atendente':
        setPermissoes({
          prontuario: false,
          prescricao: false,
          agenda: true,
          financeiro: false,
          relatorios: false,
          configuracoes: false,
        });
        break;
      case 'Paciente':
        setPermissoes({
          prontuario: false,
          prescricao: false,
          agenda: true,
          financeiro: false,
          relatorios: false,
          configuracoes: false,
        });
        break;
      default:
        setPermissoes({
          prontuario: true,
          prescricao: false,
          agenda: true,
          financeiro: false,
          relatorios: false,
          configuracoes: false,
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.warning('Campo obrigatório', 'Informe o nome completo do membro da equipe.');
      return;
    }

    if (!email.trim()) {
      toast.warning('Campo obrigatório', 'Informe o e-mail institucional ou de acesso.');
      return;
    }

    onSave({
      nome,
      email,
      telefone: telefone || '(11) 99999-0000',
      funcao: funcao || 'Membro Clínico',
      cro: cro || 'Não se aplica',
      role,
      cadeira,
      status,
      permissoes,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Bar / Navegação de Retorno Estilo App Nativa */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#005F73]" />
          <span>Voltar para Usuários</span>
        </button>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
          Gestão de Equipe &amp; Permissões
        </span>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        {/* Header da Página */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0 border border-[#005F73]/20">
              {initialData ? <UserCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {initialData ? `Editar: ${initialData.nome}` : 'Convidar Novo Membro da Equipe'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configuração de cadastro profissional, CRO, cadeira clínica e perfil de acesso.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {status}
            </span>
          </div>
        </div>

        {/* Formulário Em Página */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* SEÇÃO 1: DADOS PESSOAIS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#005F73]/10 text-[#005F73] flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Dados Pessoais e Contato
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dra. Juliana Santos"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  E-mail Institucional ou de Acesso <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@odontosouza.com.br"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <ValidatedInput
                  label="Telefone / WhatsApp"
                  type="tel"
                  mask="phone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: FUNÇÃO CLÍNICA E PERFIL */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#005F73]/10 text-[#005F73] flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Função Clínica &amp; Perfil de Acesso
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Função Clínica
                </label>
                <div className="relative flex items-center">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={funcao}
                    onChange={(e) => setFuncao(e.target.value)}
                    placeholder="Ex: Ortodontista, Implantodontista, Recepção"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Registro de Conselho (CRO) ou Matrícula
                </label>
                <input
                  type="text"
                  value={cro}
                  onChange={(e) => setCro(e.target.value)}
                  placeholder="Ex: CRO-SP 12345 ou Secretaria"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Perfil de Acesso (Tipo de Usuário) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as RoleUsuario)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-white transition-all"
                >
                  {perfisDisponiveis.map((p) => (
                    <option key={p.id} value={p.nome}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {perfisDisponiveis.find((p) => p.nome === role)?.descricao}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Cadeira Principal / Consultório
                </label>
                <select
                  value={cadeira}
                  onChange={(e) => setCadeira(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-white transition-all"
                >
                  <option value="Cadeira 01 (Implantes & Cirurgia)">Cadeira 01 (Implantes & Cirurgia)</option>
                  <option value="Cadeira 02 (Geral & Estética)">Cadeira 02 (Geral & Estética)</option>
                  <option value="Cadeira 03 (Ortodontia & Endodontia)">Cadeira 03 (Ortodontia & Endodontia)</option>
                  <option value="Balcão de Atendimento / Recepção">Balcão de Atendimento / Recepção</option>
                  <option value="Administração / Sem Cadeira Física">Administração / Sem Cadeira Física</option>
                </select>
              </div>
            </div>
          </section>

          {/* SEÇÃO 3: PERMISSÕES DE MÓDULOS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#005F73]/10 text-[#005F73] flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Permissões Granulares de Acesso
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={permissoes.prontuario}
                  onChange={(e) =>
                    setPermissoes({ ...permissoes, prontuario: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#005F73] focus:ring-[#005F73]"
                />
                <span className="text-xs font-semibold text-slate-700">Prontuário Clínico</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={permissoes.prescricao}
                  onChange={(e) =>
                    setPermissoes({ ...permissoes, prescricao: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#005F73] focus:ring-[#005F73]"
                />
                <span className="text-xs font-semibold text-slate-700">Receitas &amp; Atestados</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={permissoes.agenda}
                  onChange={(e) =>
                    setPermissoes({ ...permissoes, agenda: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#005F73] focus:ring-[#005F73]"
                />
                <span className="text-xs font-semibold text-slate-700">Agenda &amp; Encaixes</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={permissoes.financeiro}
                  onChange={(e) =>
                    setPermissoes({ ...permissoes, financeiro: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#005F73] focus:ring-[#005F73]"
                />
                <span className="text-xs font-semibold text-slate-700">Financeiro &amp; Caixa</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={permissoes.relatorios}
                  onChange={(e) =>
                    setPermissoes({ ...permissoes, relatorios: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#005F73] focus:ring-[#005F73]"
                />
                <span className="text-xs font-semibold text-slate-700">Relatórios &amp; DRE</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={permissoes.configuracoes}
                  onChange={(e) =>
                    setPermissoes({ ...permissoes, configuracoes: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#005F73] focus:ring-[#005F73]"
                />
                <span className="text-xs font-semibold text-slate-700">Configurações &amp; APIs</span>
              </label>
            </div>
          </section>

          {/* RODAPÉ DO FORMULÁRIO */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Salvar Alterações do Membro' : 'Salvar & Enviar Convite'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
