import { supabase } from '../lib/supabase';
import { PacienteItem, ConvenioTipo, PacienteStatus } from '../types/pacientes';
import { calculateAge } from '../utils/dateUtils';
import { storageService } from './storageService';

export const pacientesService = {
  async getPacientes(): Promise<PacienteItem[]> {
    try {
      // Busca pacientes, agendamentos e evoluções em paralelo para calcular a última consulta real de cada um
      const [pacientesRes, agendamentosRes, evolucoesRes] = await Promise.all([
        supabase.rpc('obter_pacientes'),
        Promise.resolve(supabase.rpc('obter_agendamentos')).then((r) => r.data || []).catch(() => []),
        Promise.resolve(supabase.from('evolucoes_prontuario').select('*')).then((r) => r.data || []).catch(() => []),
      ]);

      const data = pacientesRes.data;
      if (pacientesRes.error) {
        console.warn('[pacientesService.getPacientes] Erro ao buscar do Supabase:', pacientesRes.error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      const agendamentos: any[] = Array.isArray(agendamentosRes) ? agendamentosRes : [];
      const evolucoes: any[] = Array.isArray(evolucoesRes) ? evolucoesRes : [];

      // Ordena primeiramente por ordem cronológica de cadastro (crescente) para atribuir o código sequencial (#0001, #0002...)
      const sortedAsc = [...data].sort((a: any, b: any) => {
        const timeA = new Date(a.criado_em || a.created_at || 0).getTime();
        const timeB = new Date(b.criado_em || b.created_at || 0).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return (a.id || '').localeCompare(b.id || '');
      });

      const codeMap = new Map<string, string>();
      sortedAsc.forEach((p: any, idx: number) => {
        const numStr = String(idx + 1).padStart(4, '0');
        codeMap.set(p.id, `#${numStr}`);
      });

      const mapped: PacienteItem[] = data.map((p: any) => {
        const initials = (p.nome || 'P')
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        const age = p.data_nascimento ? calculateAge(p.data_nascimento) : 30;

        const insurance: ConvenioTipo = p.convenio || 'Convênio da Casa';
        const insuranceLabel = p.convenio || 'Convênio da Casa';

        const statusLower = (p.status || 'ativo').toLowerCase();
        let status: PacienteStatus = 'ativo';
        if (statusLower.includes('inativo')) status = 'inativo';
        else if (statusLower.includes('primeira')) status = 'primeira_vez';
        else if (statusLower.includes('concluido')) status = 'concluido';

        const createdAt = p.criado_em || p.created_at || undefined;

        // Busca o agendamento e evolução reais do paciente
        const pAg = agendamentos.filter((a) => a.paciente_id === p.id);
        const pEv = evolucoes.filter((e) => e.paciente_id === p.id);

        let lastConsultation: PacienteItem['lastConsultation'];

        // Se houver agendamento futuro
        const futureAg = pAg.find((a) => new Date(a.data_hora_inicio).getTime() > Date.now());

        if (futureAg) {
          const d = new Date(futureAg.data_hora_inicio);
          const isToday = d.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR');
          lastConsultation = {
            date: d.toLocaleDateString('pt-BR'),
            time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            dentist: futureAg.dentista_nome || 'Dr. Frankisney Souza',
            procedure: futureAg.procedimento_nome || 'Consulta Odontológica',
            isScheduled: true,
            isToday,
            description: isToday
              ? `Agendada para hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
              : `Agendada (${futureAg.procedimento_nome || 'Consulta'})`,
          };
        } else if (pEv.length > 0) {
          const latestEv = [...pEv].sort(
            (a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()
          )[0];
          const d = new Date(latestEv.data_atendimento);
          const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
          const isToday = diffDays === 0;

          let desc = '';
          if (diffDays === 0) desc = 'Hoje (Atendimento Clínico)';
          else if (diffDays === 1) desc = 'Ontem (Atendimento Clínico)';
          else if (diffDays > 1 && diffDays <= 30) desc = `Há ${diffDays} dias (Atendimento Prontuário)`;
          else desc = d.toLocaleDateString('pt-BR');

          lastConsultation = {
            date: d.toLocaleDateString('pt-BR'),
            time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            dentist: 'Dr. Frankisney Souza',
            procedure: 'Atendimento Prontuário',
            isScheduled: false,
            isToday,
            description: desc,
          };
        } else if (pAg.length > 0) {
          const latestAg = [...pAg].sort(
            (a, b) => new Date(b.data_hora_inicio).getTime() - new Date(a.data_hora_inicio).getTime()
          )[0];
          const d = new Date(latestAg.data_hora_inicio);
          const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
          const isToday = diffDays === 0;

          let desc = '';
          if (diffDays === 0) {
            desc = `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (${latestAg.dentista_nome || 'Dr. Frankisney Souza'})`;
          } else if (diffDays === 1) {
            desc = `Ontem (${latestAg.procedimento_nome || 'Consulta'})`;
          } else if (diffDays > 1 && diffDays <= 30) {
            desc = `Há ${diffDays} dias (${latestAg.procedimento_nome || 'Consulta'})`;
          } else {
            desc = `${latestAg.procedimento_nome || 'Consulta'}`;
          }

          lastConsultation = {
            date: d.toLocaleDateString('pt-BR'),
            time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            dentist: latestAg.dentista_nome || 'Dr. Frankisney Souza',
            procedure: latestAg.procedimento_nome || 'Consulta Odontológica',
            isScheduled: false,
            isToday,
            description: desc,
          };
        } else {
          lastConsultation = {
            date: 'Sem consultas',
            time: '',
            dentist: '',
            procedure: 'Nenhum atendimento',
            isScheduled: false,
            isToday: false,
            description: 'Aguardando 1º agendamento',
          };
        }

        return {
          id: p.id,
          code: codeMap.get(p.id) || `#${p.id.slice(-4).toUpperCase()}`,
          name: p.nome,
          avatarUrl: p.foto_url || undefined,
          initials,
          cpf: p.cpf || '',
          rg: p.rg || undefined,
          birthDate: p.data_nascimento || '1990-01-01',
          age: age > 0 ? age : 30,
          gender: (p.sexo?.toLowerCase() as any) || 'feminino',
          insurance,
          insuranceLabel: p.convenio || 'Particular',
          whatsapp: p.telefone || '',
          email: p.email || '',
          allergies: p.alergias || undefined,
          clinicalNotes: p.condicoes_medicas || undefined,
          lastConsultation,
          status,
          statusLabel: p.status || 'Ativo',
          createdAt,
        };
      });

      // Organiza por ordem de cadastro: o último cadastro deve ser o primeiro da fila, o penúltimo o segundo, etc.
      mapped.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        const numA = parseInt((a.code || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt((b.code || '').replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numB - numA;
        return (b.id || '').localeCompare(a.id || '');
      });

      return mapped;
    } catch (err) {
      console.error('[pacientesService.getPacientes] Exceção:', err);
      return [];
    }
  },

  async savePaciente(paciente: Partial<PacienteItem>): Promise<PacienteItem | null> {
    try {
      const payload = {
        id: paciente.id && !paciente.id.startsWith('pac-') ? paciente.id : undefined,
        nome: paciente.name,
        foto_url: paciente.avatarUrl,
        cpf: paciente.cpf,
        rg: paciente.rg,
        data_nascimento: paciente.birthDate,
        sexo: paciente.gender,
        telefone: paciente.whatsapp,
        email: paciente.email,
        endereco:
          typeof paciente.address === 'object' && paciente.address !== null
            ? `${paciente.address.logradouro || ''}, ${paciente.address.numero || ''}${
                paciente.address.complemento ? ' - ' + paciente.address.complemento : ''
              } - ${paciente.address.bairro || ''}, ${paciente.address.cidade || ''}/${
                paciente.address.estado || ''
              } - CEP: ${paciente.address.cep || ''}`.trim()
            : (paciente as any).endereco || '',
        convenio: paciente.insuranceLabel || paciente.insurance,
        alergias: paciente.allergies,
        condicoes_medicas: paciente.clinicalNotes,
        status: paciente.statusLabel || paciente.status,
      };

      const { data, error } = await supabase.rpc('salvar_paciente', { p_dados: payload });

      if (error) {
        console.error('[pacientesService.savePaciente] Erro RPC:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('[pacientesService.savePaciente] Exceção:', err);
      throw err;
    }
  },

  // ============================================================================
  // CRIAÇÃO DE CREDENCIAIS & RBAC (SUPABASE AUTH + TABELA USUARIOS)
  // ============================================================================
  async criarAcessoPortalPaciente(dados: {
    nome: string;
    email: string;
    senha?: string;
    telefone?: string;
    pacienteId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanEmail = dados.email.trim().toLowerCase();
      if (!cleanEmail || !dados.senha) {
        return { success: false, error: 'E-mail e senha são obrigatórios para criar o acesso.' };
      }

      // 1. Salva e cria credenciais via RPC SECURITY DEFINER salvar_usuario_sistema
      // Grava em public.usuarios e auth.users com hash bcrypt de segurança
      const { data, error: rpcError } = await supabase.rpc('salvar_usuario_sistema', {
        p_dados: {
          acao: 'cadastrar',
          id: dados.pacienteId || undefined,
          paciente_id: dados.pacienteId || undefined,
          nome: dados.nome.trim(),
          email: cleanEmail,
          senha: dados.senha,
          telefone: dados.telefone || null,
          funcao: 'Paciente',
          perfil_nome: 'paciente',
          status: 'Ativo',
        },
      });

      if (rpcError) {
        console.error('[pacientesService.criarAcessoPortalPaciente] Erro ao gravar usuário:', rpcError.message);
        return { success: false, error: rpcError.message || 'Falha ao registrar credenciais no banco.' };
      }

      // 2. Registra log na trilha de auditoria para conformidade LGPD
      try {
        await supabase.from('auditoria_logs').insert({
          acao: 'CRIAR_ACESSO_PORTAL_PACIENTE',
          entidade: 'usuarios',
          entidade_id: cleanEmail,
          detalhes: `Conta de acesso criada com perfil estrito 'paciente' para ${dados.nome}.`,
          dados_novos: { email: cleanEmail, perfil_nome: 'paciente' },
        });
      } catch (logErr) {
        // Silencioso se tabela não aceitar insert direto
      }

      return { success: true, user: data };
    } catch (err: any) {
      console.error('[pacientesService.criarAcessoPortalPaciente] Exceção:', err);
      return { success: false, error: err?.message || 'Falha ao registrar credenciais.' };
    }
  },

  // ============================================================================
  // AUTENTICAÇÃO SEGURA DE PACIENTE / USUÁRIO (VIA RPC COM CRIPTOGRAFIA BCRYPT)
  // ============================================================================
  async autenticarUsuario(
    email: string,
    senha: string
  ): Promise<{ success: boolean; user?: { id: string; email: string; name: string; role: string }; error?: string }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !senha) {
        return { success: false, error: 'Por favor, preencha seu e-mail e senha.' };
      }

      // Autentica via RPC SECURITY DEFINER salvar_usuario_sistema com modo login e validação pgcrypto
      const { data, error } = await supabase.rpc('salvar_usuario_sistema', {
        p_dados: {
          acao: 'login',
          email: cleanEmail,
          senha: senha,
        },
      });

      if (error) {
        console.warn('[pacientesService.autenticarUsuario] Erro retornado pela RPC:', error.message);
        return {
          success: false,
          error: error.message || 'E-mail ou senha incorretos. Verifique suas credenciais.',
        };
      }

      if (!data) {
        return { success: false, error: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
      }

      // Localiza o ID do paciente na tabela pacientes para vínculo integral da agenda
      let resolvedName = data.nome || 'Paciente';
      let resolvedId = data.id;

      try {
        const { data: pRow } = await supabase
          .from('pacientes')
          .select('id, nome')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (pRow) {
          if (pRow.nome) resolvedName = pRow.nome;
          if (pRow.id) resolvedId = pRow.id;
        }
      } catch {}

      return {
        success: true,
        user: {
          id: resolvedId,
          email: cleanEmail,
          name: resolvedName,
          role: data.perfil_nome || 'paciente',
        },
      };
    } catch (err: any) {
      console.error('[pacientesService.autenticarUsuario] Exceção:', err);
      return { success: false, error: err?.message || 'Falha ao autenticar.' };
    }
  },

  // ============================================================================
  // EXCLUSÃO EM CASCATA DE PACIENTE (PACIENTES, AGENDAMENTOS, USUÁRIOS E AUTH)
  // ============================================================================
  async excluirPacienteCascata(pacienteId: string, email?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!pacienteId && !email) {
        return { success: false, error: 'Identificador do paciente não informado.' };
      }

      // 1. Executa a função canônica RPC com privilégios SECURITY DEFINER no PostgreSQL
      const { data: rpcData, error: rpcError } = await supabase.rpc('excluir_paciente_cascata', {
        p_paciente_id: pacienteId,
        p_email: email || null,
      });

      if (rpcError) {
        console.warn('[pacientesService.excluirPacienteCascata] RPC aviso, aplicando fallback manual:', rpcError.message);

        // Fallback direto nas tabelas do Supabase caso a RPC apresente qualquer falha de rota
        // a) Agendamentos
        await supabase.from('agendamentos').delete().eq('paciente_id', pacienteId);

        // b) Prontuário, Odontograma e Orçamentos
        await supabase.from('evolucoes_prontuario').delete().eq('paciente_id', pacienteId);
        await supabase.from('odontograma_itens').delete().eq('paciente_id', pacienteId);
        await supabase.from('orcamentos').delete().eq('paciente_id', pacienteId);
        await supabase.from('transacoes_financeiras').delete().eq('paciente_id', pacienteId);

        // c) Tabela Pacientes
        const { error: delPacError } = await supabase.from('pacientes').delete().eq('id', pacienteId);
        if (delPacError) {
          console.error('[pacientesService.excluirPacienteCascata] Erro ao deletar paciente:', delPacError.message);
          return { success: false, error: delPacError.message };
        }

        // d) Tabela Usuários (apenas perfis de paciente, protegendo corpo clínico/admin)
        if (email) {
          await supabase
            .from('usuarios')
            .delete()
            .ilike('email', email.trim())
            .in('perfil_nome', ['paciente', 'Paciente', '']);
        }
      }

      // 2. Limpeza em cascata de arquivos armazenados no bucket S3 Contabo
      try {
        await storageService.deletePastaPaciente(pacienteId);
      } catch (s3Err) {
        console.warn('[pacientesService.excluirPacienteCascata] Aviso S3 (não impeditivo):', s3Err);
      }

      return { success: true };
    } catch (err: any) {
      console.error('[pacientesService.excluirPacienteCascata] Exceção inesperada:', err);
      return { success: false, error: err?.message || 'Falha ao realizar exclusão em cascata.' };
    }
  },
};
