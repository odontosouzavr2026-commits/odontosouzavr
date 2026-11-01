import { supabase } from '../lib/supabase';
import { UsuarioItem, PerfilItem, RoleUsuario } from '../components/usuarios/UsuariosView';

export const usuariosService = {
  async getUsuarios(): Promise<UsuarioItem[]> {
    try {
      const { data, error } = await supabase.rpc('obter_usuarios_sistema');
      if (error) {
        console.warn('[usuariosService.getUsuarios] Erro RPC:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      return data.map((u: any) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone || '(24) 99999-0000',
        funcao: u.funcao || 'Membro Clínico',
        cro: u.cro || 'Não se aplica',
        role: (u.perfil_nome as RoleUsuario) || 'Atendente',
        cadeira: u.cadeira_nome || 'Consultório Geral',
        status: u.status === 'Inativo' ? 'Inativo' : 'Ativo',
        avatarBg: u.avatar_bg || 'bg-[#005F73]',
        permissoes: u.permissoes || {
          prontuario: true,
          prescricao: false,
          agenda: true,
          financeiro: false,
          relatorios: false,
          configuracoes: false,
        },
      }));
    } catch (err) {
      console.error('[usuariosService.getUsuarios] Exceção:', err);
      return [];
    }
  },

  async getPerfis(): Promise<PerfilItem[]> {
    try {
      const { data, error } = await supabase.rpc('obter_perfis_acesso');
      if (error) {
        console.warn('[usuariosService.getPerfis] Erro RPC:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      return data.map((p: any) => ({
        id: p.id,
        nome: p.nome as RoleUsuario,
        descricao: p.descricao,
        cor: p.cor || 'bg-[#005F73] text-white',
        usuariosCount: 1,
        nivelAcesso: (p.nivel_acesso as any) || 'Operacional',
        permissoesPadrao: p.permissoes || {
          prontuario: true,
          prescricao: false,
          agenda: true,
          financeiro: false,
          relatorios: false,
          configuracoes: false,
        },
      }));
    } catch (err) {
      console.error('[usuariosService.getPerfis] Exceção:', err);
      return [];
    }
  },

  async saveUsuario(u: Partial<UsuarioItem>): Promise<any> {
    try {
      const payload = {
        id: u.id && u.id.length > 10 ? u.id : undefined,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone,
        funcao: u.funcao,
        cro: u.cro,
        perfil_nome: u.role,
        status: u.status || 'Ativo',
        avatar_bg: u.avatarBg || 'bg-[#005F73]',
        permissoes: u.permissoes,
      };

      const { data, error } = await supabase.rpc('salvar_usuario_sistema', { p_dados: payload });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[usuariosService.saveUsuario] Erro:', err);
      throw err;
    }
  },
};
