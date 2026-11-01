import { supabase } from '../lib/supabase';
import { ConvenioItem, ConvenioFormData } from '../types/convenios';

export const DEFAULT_CONVENIOS: ConvenioItem[] = [];

const LOCAL_STORAGE_KEY = 'odonto_convenios_cache';

export const conveniosService = {
  // 1. Busca todos os convênios
  async getConvenios(): Promise<ConvenioItem[]> {
    try {
      const { data, error } = await supabase
        .from('convenios')
        .select('*')
        .order('nome', { ascending: true });

      if (!error && Array.isArray(data)) {
        // Tenta buscar contagem real de pacientes por convênio
        let countMap: Record<string, number> = {};
        try {
          const { data: pacs } = await supabase.from('pacientes').select('convenio');
          if (pacs) {
            pacs.forEach((p: any) => {
              if (p.convenio) {
                const cName = p.convenio.trim().toLowerCase();
                countMap[cName] = (countMap[cName] || 0) + 1;
              }
            });
          }
        } catch {
          // ignora falha secundária de contagem
        }

        const items = data.map((row: any) => {
          let obs = row.observacoes || '';
          let tipoPlano: 'proprio' | 'operadora' = 'operadora';
          let cobreMensalidade = false;
          let valorMensalidade = 0;

          if (
            row.nome.toLowerCase().includes('casa') ||
            (row.razao_social || '').toLowerCase().includes('próprio') ||
            row.dias_repasse === 0
          ) {
            tipoPlano = 'proprio';
          }

          if (obs.startsWith('{') && obs.endsWith('}')) {
            try {
              const parsed = JSON.parse(obs);
              tipoPlano = parsed.tipoPlano || tipoPlano;
              cobreMensalidade = parsed.cobreMensalidade ?? false;
              valorMensalidade = parsed.valorMensalidade ?? 0;
              obs = parsed.detalhes || '';
            } catch {
              // ignore
            }
          }

          return {
            id: row.id,
            nome: row.nome,
            razaoSocial: row.razao_social,
            registroAns: row.registro_ans,
            cnpj: row.cnpj,
            telefoneContato: row.telefone_contato,
            emailContato: row.email_contato,
            diasRepasse: row.dias_repasse ?? 0,
            taxaCoparticipacao: Number(row.taxa_coparticipacao) || 0,
            tabelaPrecosPadrao: row.tabela_precos_padrao || (tipoPlano === 'proprio' ? 'Tabela Convênio da Casa' : 'Padrão Clínica'),
            status: (row.status as 'Ativo' | 'Inativo') || 'Ativo',
            observacoes: obs,
            tipoPlano,
            cobreMensalidade,
            valorMensalidade,
            totalPacientesVinculados: countMap[row.nome.trim().toLowerCase()] || 0,
            criadoEm: row.criado_em,
            atualizadoEm: row.atualizado_em,
          };
        });

        this.salvarCacheLocal(items);
        return items;
      }
    } catch (err) {
      console.warn('[conveniosService.getConvenios] Erro ao buscar do Supabase:', err);
    }

    // Se o banco estiver vazio, limpa qualquer resquício do cache antigo
    this.limparCacheLocal();
    return [];
  },

  // 2. Busca convênio por ID
  async getConvenioById(id: string): Promise<ConvenioItem | null> {
    const list = await this.getConvenios();
    return list.find((c) => c.id === id) || null;
  },

  // 3. Salva ou atualiza um convênio
  async salvarConvenio(dados: ConvenioFormData, id?: string): Promise<ConvenioItem> {
    const targetId = id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'conv-' + Date.now());

    const tipoPlano =
      dados.tipoPlano || (dados.nome.toLowerCase().includes('casa') ? 'proprio' : 'operadora');
    const cobreMensalidade = dados.cobreMensalidade ?? false;
    const valorMensalidade = dados.valorMensalidade ?? 0;

    const obsMetadata = JSON.stringify({
      tipoPlano,
      cobreMensalidade,
      valorMensalidade,
      detalhes: dados.observacoes || '',
    });

    const payloadDb: any = {
      id: targetId,
      nome: dados.nome.trim(),
      razao_social: dados.razaoSocial?.trim() || (tipoPlano === 'proprio' ? 'Odonto Souza Atendimento Próprio' : undefined),
      registro_ans: dados.registroAns?.trim() || (tipoPlano === 'proprio' ? 'Isento' : undefined),
      cnpj: dados.cnpj?.trim(),
      telefone_contato: dados.telefoneContato?.trim(),
      email_contato: dados.emailContato?.trim(),
      dias_repasse: tipoPlano === 'proprio' ? 0 : (dados.diasRepasse ?? 0),
      taxa_coparticipacao: dados.taxaCoparticipacao || 0,
      tabela_precos_padrao: dados.tabelaPrecosPadrao || (tipoPlano === 'proprio' ? 'Tabela Convênio da Casa' : 'Padrão Clínica'),
      status: dados.status || 'Ativo',
      observacoes: obsMetadata,
      atualizado_em: new Date().toISOString(),
    };

    let savedItem: ConvenioItem = {
      id: targetId,
      ...dados,
      tipoPlano,
      cobreMensalidade,
      valorMensalidade,
      totalPacientesVinculados: 0,
      atualizadoEm: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from('convenios').upsert(payloadDb).select().single();
      if (data && !error) {
        savedItem = {
          id: data.id,
          nome: data.nome,
          razaoSocial: data.razao_social,
          registroAns: data.registro_ans,
          cnpj: data.cnpj,
          telefoneContato: data.telefone_contato,
          emailContato: data.email_contato,
          diasRepasse: data.dias_repasse ?? 0,
          taxaCoparticipacao: Number(data.taxa_coparticipacao) || 0,
          tabelaPrecosPadrao: data.tabela_precos_padrao,
          status: data.status,
          observacoes: dados.observacoes,
          tipoPlano,
          cobreMensalidade,
          valorMensalidade,
          criadoEm: data.criado_em,
          atualizadoEm: data.atualizado_em,
        };
      }
    } catch (err) {
      console.warn('[conveniosService.salvarConvenio] Erro ao sincronizar com banco:', err);
    }

    // Atualiza cache local
    const currentList = await this.getConvenios();
    const idx = currentList.findIndex((c) => c.id === targetId);
    let updatedList: ConvenioItem[];

    if (idx >= 0) {
      updatedList = [...currentList];
      updatedList[idx] = { ...currentList[idx], ...savedItem };
    } else {
      updatedList = [savedItem, ...currentList];
    }

    this.salvarCacheLocal(updatedList);
    return savedItem;
  },

  // 4. Exclui um convênio
  async excluirConvenio(id: string): Promise<boolean> {
    try {
      await supabase.from('convenios').delete().eq('id', id);
    } catch (err) {
      console.warn('[conveniosService.excluirConvenio] Erro Supabase:', err);
    }

    const currentList = await this.getConvenios();
    const filtered = currentList.filter((c) => c.id !== id);
    this.salvarCacheLocal(filtered);
    return true;
  },

  // 5. Alterna status Ativo / Inativo
  async alternarStatusConvenio(id: string, novoStatus: 'Ativo' | 'Inativo'): Promise<boolean> {
    try {
      await supabase.from('convenios').update({ status: novoStatus, atualizado_em: new Date().toISOString() }).eq('id', id);
    } catch (err) {
      console.warn('[conveniosService.alternarStatusConvenio] Erro Supabase:', err);
    }

    const currentList = await this.getConvenios();
    const updated = currentList.map((c) => (c.id === id ? { ...c, status: novoStatus } : c));
    this.salvarCacheLocal(updated);
    return true;
  },

  salvarCacheLocal(list: ConvenioItem[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // silencioso
    }
  },

  limparCacheLocal(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // silencioso
    }
  },
};
