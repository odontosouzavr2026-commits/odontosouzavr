import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NotificacaoClinica, NotificacaoTipo, NotificacaoDetalhes } from '../types/notificacoes';
import { playReceptionBell2x } from '../utils/receptionBellAudio';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

interface NotificationContextData {
  notificacoes: NotificacaoClinica[];
  unreadCount: number;
  somHabilitado: boolean;
  notificacaoSelecionada: NotificacaoClinica | null;
  carregarNotificacoesReais: () => Promise<void>;
  adicionarNotificacao: (
    dados: {
      tipo: NotificacaoTipo;
      titulo: string;
      mensagem: string;
      detalhes?: NotificacaoDetalhes;
      linkRota?: 'agenda' | 'pacientes' | 'dashboard' | 'atendimento';
    },
    tocarSom?: boolean
  ) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  excluirNotificacao: (id: string) => void;
  limparTodas: () => void;
  lerNotificacao: (notif: NotificacaoClinica) => void;
  fecharModalLeitura: () => void;
  toggleSom: () => void;
  testarSom: () => void;
}

const NotificationContext = createContext<NotificationContextData>(
  {} as NotificationContextData
);

const STORAGE_KEY = 'odonto_clinica_notificacoes_v2';
const SOUND_STORAGE_KEY = 'odonto_notificacoes_som_habilitado';
const READ_STORAGE_KEY = 'odonto_notificacoes_lidas_ids_v2';
const DELETED_STORAGE_KEY = 'odonto_notificacoes_deleted_ids_v2';
const CLEARED_AT_STORAGE_KEY = 'odonto_notificacoes_cleared_at_v2';
const BROADCAST_CHANNEL_NAME = 'odonto_clinica_notifications_channel_v2';

// Helper para ler IDs lidos do localStorage
function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

// Helper para ler IDs excluídos do localStorage
function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

// Helper para salvar IDs excluídos no localStorage
function saveDeletedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // silencioso
  }
}

// Helper para ler o timestamp de quando o usuário limpou o histórico
function getClearedAt(): number {
  try {
    const raw = localStorage.getItem(CLEARED_AT_STORAGE_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

// Helper para salvar o timestamp de limpeza do histórico
function saveClearedAt(timestamp: number): void {
  try {
    localStorage.setItem(CLEARED_AT_STORAGE_KEY, String(timestamp));
  } catch {
    // silencioso
  }
}

// Fingerprint canônico para desduplicação estrita de notificações de agendamentos e pacientes
export const getNotifFingerprint = (n: {
  id?: string;
  detalhes?: NotificacaoDetalhes;
  mensagem?: string;
}): string => {
  if (n.detalhes?.pacienteNome && n.detalhes?.horarioConsulta) {
    const pac = n.detalhes.pacienteNome.toLowerCase().trim();
    const hora = (n.detalhes.horarioConsulta || '').trim();
    return `ag_${pac}_${hora}`;
  }
  return n.id || n.mensagem || '';
};

// Helper para salvar IDs lidos no localStorage
function saveReadIds(ids: Set<string>): void {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // silencioso
  }
}

const DEFAULT_INITIAL_NOTIFICACOES: NotificacaoClinica[] = [];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toast = useToast();

  const [notificacoes, setNotificacoes] = useState<NotificacaoClinica[]>(() => {
    try {
      const deletedIds = getDeletedIds();
      const clearedAt = getClearedAt();
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove notificações excluídas ou anteriores ao momento em que o histórico foi limpo
          return parsed.filter(
            (n: any) =>
              !deletedIds.has(n.id) &&
              (clearedAt === 0 || new Date(n.dataHora).getTime() > clearedAt) &&
              n.id !== 'notif-1' &&
              !n.mensagem?.includes('Sábado às 10:00') &&
              !n.detalhes?.dataConsulta?.includes('Próximo Sábado')
          );
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_INITIAL_NOTIFICACOES;
  });

  const [somHabilitado, setSomHabilitado] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [notificacaoSelecionada, setNotificacaoSelecionada] =
    useState<NotificacaoClinica | null>(null);

  // Referência para controlar se é a primeira carga
  const isFirstLoadRef = useRef(true);

  // Carrega agendamentos e pacientes reais diretamente do Supabase e sincroniza as notificações
  const carregarNotificacoesReais = useCallback(async () => {
    try {
      const readIds = getReadIds();
      const deletedIds = getDeletedIds();
      const clearedAt = getClearedAt();

      // 1. Busca agendamentos recentes ordenados por criação
      const { data: ags, error: agsError } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora_inicio,
          status,
          tipo,
          observacoes,
          criado_em,
          pacientes (id, nome, telefone, email),
          procedimentos (nome),
          usuarios (nome)
        `)
        .order('criado_em', { ascending: false })
        .limit(20);

      // 2. Busca pacientes recentes ordenados por criação
      const { data: pacs, error: pacsError } = await supabase
        .from('pacientes')
        .select('id, nome, telefone, email, criado_em')
        .order('criado_em', { ascending: false })
        .limit(10);

      const notificacoesAgendamentos: NotificacaoClinica[] = [];
      if (!agsError && ags && ags.length > 0) {
        ags.forEach((ag: any) => {
          const notifId = `notif-ag-${ag.id}`;
          // Se foi individualmente excluído pelo usuário, não reexibe
          if (deletedIds.has(notifId)) return;

          // Se o usuário limpou o histórico e esta notificação é anterior à limpeza, não reexibe
          const notifTime = new Date(ag.criado_em || ag.data_hora_inicio).getTime();
          if (clearedAt > 0 && notifTime <= clearedAt) return;

          const startDate = new Date(ag.data_hora_inicio);
          const timeStr = startDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo',
          });
          const dateStr = startDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Sao_Paulo',
          });
          const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
          const pacNome = ag.pacientes?.nome || 'Paciente';

          let procNome = ag.procedimentos?.nome;
          if (!procNome && ag.observacoes?.includes('Portal do Paciente: ')) {
            procNome = ag.observacoes.split('Portal do Paciente: ')[1].split('.')[0].trim();
          }
          if (!procNome) {
            procNome = ag.tipo || 'Avaliação Gratuita';
          }

          notificacoesAgendamentos.push({
            id: notifId,
            tipo: 'novo_agendamento',
            titulo: 'Novo Agendamento Confirmado',
            mensagem: `${pacNome} agendou ${procNome} para ${capitalizedDate} às ${timeStr}.`,
            dataHora: ag.criado_em || ag.data_hora_inicio,
            lida: readIds.has(notifId),
            detalhes: {
              pacienteNome: pacNome,
              pacienteTelefone: ag.pacientes?.telefone || '(65) 99605-5823',
              pacienteEmail: ag.pacientes?.email || '',
              dataConsulta: `${capitalizedDate} às ${timeStr}`,
              horarioConsulta: timeStr,
              procedimento: procNome,
              dentista: ag.usuarios?.nome || 'Dr. Frankisney Souza',
              origem: ag.observacoes?.includes('Site Institucional')
                ? 'site_institucional'
                : ag.observacoes?.includes('Portal do Paciente')
                ? 'portal_paciente'
                : 'sistema',
              observacoes: ag.observacoes || 'Agendado pelo sistema da clínica.',
            },
            linkRota: 'agenda',
          });
        });
      }

      const notificacoesPacientes: NotificacaoClinica[] = [];
      if (!pacsError && pacs && pacs.length > 0) {
        pacs.forEach((pac: any) => {
          const notifId = `notif-pac-${pac.id}`;
          if (deletedIds.has(notifId)) return;

          const notifTime = new Date(pac.criado_em || new Date().toISOString()).getTime();
          if (clearedAt > 0 && notifTime <= clearedAt) return;

          notificacoesPacientes.push({
            id: notifId,
            tipo: 'novo_cadastro',
            titulo: 'Novo Paciente Cadastrado',
            mensagem: `${pac.nome} foi registrado no sistema clínico.`,
            dataHora: pac.criado_em || new Date().toISOString(),
            lida: readIds.has(notifId),
            detalhes: {
              pacienteNome: pac.nome,
              pacienteTelefone: pac.telefone || '',
              pacienteEmail: pac.email || '',
              origem: 'sistema',
            },
            linkRota: 'pacientes',
          });
        });
      }

      // Unifica e ordena todas as notificações reais do Supabase por data decrescente
      const todasReais = [...notificacoesAgendamentos, ...notificacoesPacientes].sort(
        (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
      );

      setNotificacoes((prev) => {
        const seenFps = new Set<string>();
        const deduped: NotificacaoClinica[] = [];

        // 1. Prioridade absoluta para as notificações reais do Supabase
        for (const n of todasReais) {
          const fp = getNotifFingerprint(n);
          if (!seenFps.has(fp)) {
            seenFps.add(fp);
            deduped.push(n);
          }
        }

        // 2. Preserva notificações manuais apenas se NÃO pertencerem a um agendamento já presente
        const idsExistentes = new Set(todasReais.map((n) => n.id));
        const manuais = prev.filter(
          (n) =>
            !idsExistentes.has(n.id) &&
            !deletedIds.has(n.id) &&
            (clearedAt === 0 || new Date(n.dataHora).getTime() > clearedAt) &&
            !n.id.startsWith('notif-ag-') &&
            !n.id.startsWith('notif-pac-') &&
            n.id !== 'notif-1' &&
            !n.mensagem?.includes('Sábado às 10:00') &&
            !n.detalhes?.dataConsulta?.includes('Próximo Sábado')
        );

        for (const m of manuais) {
          const fp = getNotifFingerprint(m);
          if (!seenFps.has(fp)) {
            seenFps.add(fp);
            deduped.push(m);
          }
        }

        // Detecta se há algum agendamento novo que acabou de chegar (não existia no estado anterior)
        if (!isFirstLoadRef.current && somHabilitado) {
          const prevIds = new Set(prev.map((n) => n.id));
          const recemCriadas = notificacoesAgendamentos.filter((n) => {
            if (prevIds.has(n.id)) return false;
            // Se foi criado nos últimos 60 segundos
            const diffMs = Date.now() - new Date(n.dataHora).getTime();
            return diffMs >= 0 && diffMs < 60000;
          });

          if (recemCriadas.length > 0) {
            playReceptionBell2x();
            const topNova = recemCriadas[0];
            toast.info(topNova.titulo, topNova.mensagem);
          }
        }

        isFirstLoadRef.current = false;

        return deduped.sort(
          (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
        );
      });
    } catch (e) {
      console.warn('Erro ao carregar notificações reais:', e);
    }
  }, [somHabilitado, toast]);

  // Carga inicial no mount
  useEffect(() => {
    carregarNotificacoesReais();
  }, [carregarNotificacoesReais]);

  // Polling automático e contínuo a cada 12 segundos para sincronização perfeita em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      carregarNotificacoesReais();
    }, 12000);

    return () => clearInterval(timer);
  }, [carregarNotificacoesReais]);

  // BroadcastChannel para sincronização instantânea entre abas
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};

        if (type === 'NOVA_NOTIFICACAO' && payload) {
          const fpPayload = getNotifFingerprint(payload);
          let added = false;
          setNotificacoes((prev) => {
            if (prev.some((n) => n.id === payload.id || n.mensagem === payload.mensagem || getNotifFingerprint(n) === fpPayload)) {
              return prev;
            }
            added = true;
            return [payload, ...prev];
          });

          if (added) {
            if (somHabilitado) {
              playReceptionBell2x();
            }
            toast.info(payload.titulo, payload.mensagem);
          }
        } else if (type === 'REFRESH_NOTIFICACOES') {
          carregarNotificacoesReais();
        } else if (type === 'LIMPAR_NOTIFICACOES') {
          setNotificacoes([]);
          setNotificacaoSelecionada(null);
        } else if (type === 'EXCLUIR_NOTIFICACAO' && payload?.id) {
          setNotificacoes((prev) => prev.filter((n) => n.id !== payload.id));
        }
      };

      return () => {
        channel.close();
      };
    } catch (err) {
      console.warn('[NotificationContext] Erro ao instanciar BroadcastChannel:', err);
    }
  }, [somHabilitado, toast, carregarNotificacoesReais]);

  // Sincroniza notificações entre abas do navegador via StorageEvent (fallback)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNotificacoes(
              parsed.filter(
                (n: any) =>
                  n.id !== 'notif-1' &&
                  !n.mensagem?.includes('Sábado às 10:00') &&
                  !n.detalhes?.dataConsulta?.includes('Próximo Sábado')
              )
            );
          }
        } catch {
          // silencioso
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Salva no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notificacoes));
    } catch {
      // silencioso
    }
  }, [notificacoes]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(somHabilitado));
    } catch {
      // silencioso
    }
  }, [somHabilitado]);

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  // Função principal para emitir notificação
  const adicionarNotificacao = useCallback(
    (
      dados: {
        id?: string;
        tipo: NotificacaoTipo;
        titulo: string;
        mensagem: string;
        detalhes?: NotificacaoDetalhes;
        linkRota?: 'agenda' | 'pacientes' | 'dashboard' | 'atendimento';
      },
      tocarSom: boolean = true
    ) => {
      const nova: NotificacaoClinica = {
        id: dados.id || ('notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)),
        tipo: dados.tipo,
        titulo: dados.titulo,
        mensagem: dados.mensagem,
        dataHora: new Date().toISOString(),
        lida: false,
        detalhes: dados.detalhes,
        linkRota: dados.linkRota,
      };

      const fpNova = getNotifFingerprint(nova);
      let wasAdded = false;

      setNotificacoes((prev) => {
        const duplicada = prev.some((n) => {
          if (n.id === nova.id || n.mensagem === dados.mensagem) return true;
          return getNotifFingerprint(n) === fpNova;
        });
        if (duplicada) return prev;
        wasAdded = true;
        return [nova, ...prev];
      });

      // Toca a campainha e exibe Toast apenas se não for duplicata
      if (wasAdded) {
        if (tocarSom && somHabilitado) {
          playReceptionBell2x();
        }
        toast.info(dados.titulo, dados.mensagem);
      }
    },
    [somHabilitado, toast]
  );

  const marcarComoLida = useCallback((id: string) => {
    const currentRead = getReadIds();
    currentRead.add(id);
    saveReadIds(currentRead);

    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }, []);

  const marcarTodasComoLidas = useCallback(() => {
    const currentRead = getReadIds();
    notificacoes.forEach((n) => currentRead.add(n.id));
    saveReadIds(currentRead);

    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    toast.success('Notificações', 'Todas as notificações foram marcadas como lidas.');
  }, [notificacoes, toast]);

  const excluirNotificacao = useCallback(
    (id: string) => {
      const currentDeleted = getDeletedIds();
      currentDeleted.add(id);
      saveDeletedIds(currentDeleted);

      const currentRead = getReadIds();
      currentRead.add(id);
      saveReadIds(currentRead);

      setNotificacoes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // silencioso
        }
        return updated;
      });

      if (notificacaoSelecionada?.id === id) {
        setNotificacaoSelecionada(null);
      }

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage({ type: 'EXCLUIR_NOTIFICACAO', payload: { id } });
          channel.close();
        } catch {
          // silencioso
        }
      }
    },
    [notificacaoSelecionada]
  );

  const limparTodas = useCallback(() => {
    const now = Date.now();
    saveClearedAt(now);

    const currentDeleted = getDeletedIds();
    notificacoes.forEach((n) => currentDeleted.add(n.id));
    saveDeletedIds(currentDeleted);

    const currentRead = getReadIds();
    notificacoes.forEach((n) => currentRead.add(n.id));
    saveReadIds(currentRead);

    setNotificacoes([]);
    setNotificacaoSelecionada(null);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {
      // silencioso
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type: 'LIMPAR_NOTIFICACOES', payload: { clearedAt: now } });
        channel.close();
      } catch {
        // silencioso
      }
    }

    toast.info('Notificações', 'Histórico de notificações foi limpo.');
  }, [notificacoes, toast]);

  const lerNotificacao = useCallback(
    (notif: NotificacaoClinica) => {
      marcarComoLida(notif.id);
      setNotificacaoSelecionada({ ...notif, lida: true });
    },
    [marcarComoLida]
  );

  const fecharModalLeitura = useCallback(() => {
    setNotificacaoSelecionada(null);
  }, []);

  const toggleSom = useCallback(() => {
    setSomHabilitado((prev) => {
      const next = !prev;
      if (next) {
        playReceptionBell2x();
        toast.success('Som Habilitado 🔔', 'Campainha de recepção ativada (Ding-Ding 2x).');
      } else {
        toast.info('Som Desativado 🔕', 'Notificações sonoras foram silenciadas.');
      }
      return next;
    });
  }, [toast]);

  const testarSom = useCallback(() => {
    playReceptionBell2x();
    toast.info('Campainha da Recepção 🔔', 'Som metálico reproduzido 2x (Ding-Ding!).');
  }, [toast]);

  // Listener global via eventos customizados da janela para desacoplar chamadas
  useEffect(() => {
    const handleCustomNotification = (event: Event) => {
      const customEvent = event as CustomEvent<{
        tipo: NotificacaoTipo;
        titulo: string;
        mensagem: string;
        detalhes?: NotificacaoDetalhes;
        linkRota?: 'agenda' | 'pacientes' | 'dashboard' | 'atendimento';
      }>;
      if (customEvent.detail) {
        adicionarNotificacao(customEvent.detail, true);
      }
    };

    window.addEventListener('odonto:notificacao', handleCustomNotification);
    return () => {
      window.removeEventListener('odonto:notificacao', handleCustomNotification);
    };
  }, [adicionarNotificacao]);

  // Listener Realtime com Supabase (quando conectado ao backend)
  useEffect(() => {
    try {
      const channel = supabase
        .channel('clinica-notificacoes-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'pacientes' },
          (payload: any) => {
            const pac = payload.new;
            adicionarNotificacao({
              tipo: 'novo_cadastro',
              titulo: 'Novo Paciente Cadastrado!',
              mensagem: `${pac.nome || 'Novo paciente'} foi cadastrado no sistema.`,
              detalhes: {
                pacienteNome: pac.nome,
                pacienteTelefone: pac.telefone,
                pacienteEmail: pac.email,
                origem: 'sistema',
              },
              linkRota: 'pacientes',
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'agendamentos' },
          () => {
            carregarNotificacoesReais();
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'agendamentos' },
          () => {
            carregarNotificacoesReais();
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            // Se o WebSocket do Supabase Realtime estiver inacessível no gateway,
            // remove o canal para evitar loops infinitos de reconexão no console.
            // A sincronização permanece 100% ativa via BroadcastChannel e Polling.
            supabase.removeChannel(channel);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[NotificationContext] Supabase Realtime channel indisponível:', err);
    }
  }, [adicionarNotificacao, carregarNotificacoesReais]);

  return (
    <NotificationContext.Provider
      value={{
        notificacoes,
        unreadCount,
        somHabilitado,
        notificacaoSelecionada,
        carregarNotificacoesReais,
        adicionarNotificacao,
        marcarComoLida,
        marcarTodasComoLidas,
        excluirNotificacao,
        limparTodas,
        lerNotificacao,
        fecharModalLeitura,
        toggleSom,
        testarSom,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser utilizado dentro de NotificationProvider');
  }
  return context;
};

/**
 * Função utilitária global para despachar notificações de qualquer lugar do app (todas as abas e serviços)
 */
export function emitirNotificacaoClinica(dados: {
  id?: string;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  detalhes?: NotificacaoDetalhes;
  linkRota?: 'agenda' | 'pacientes' | 'dashboard' | 'atendimento';
}): void {
  if (typeof window !== 'undefined') {
    const notifId = dados.id || ('notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
    const nova: NotificacaoClinica = {
      id: notifId,
      tipo: dados.tipo,
      titulo: dados.titulo,
      mensagem: dados.mensagem,
      dataHora: new Date().toISOString(),
      lida: false,
      detalhes: dados.detalhes,
      linkRota: dados.linkRota,
    };

    const fpNova = getNotifFingerprint(nova);

    // 1. Salva em localStorage apenas se não houver duplicata
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: NotificacaoClinica[] = raw ? JSON.parse(raw) : [];
      const limpo = list.filter(
        (n) =>
          n.id !== 'notif-1' &&
          !n.mensagem?.includes('Sábado às 10:00') &&
          !n.detalhes?.dataConsulta?.includes('Próximo Sábado')
      );
      const jaExiste = limpo.some((n) => n.id === nova.id || getNotifFingerprint(n) === fpNova);
      if (!jaExiste) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([nova, ...limpo]));
      }
    } catch {
      // silencioso
    }

    // 2. Dispara BroadcastChannel para outras abas da aplicação
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'NOVA_NOTIFICACAO', payload: nova });
        bc.close();
      }
    } catch {
      // silencioso
    }

    // 3. Dispara CustomEvent local para a aba atual com o ID preservado
    window.dispatchEvent(
      new CustomEvent('odonto:notificacao', { detail: { ...dados, id: notifId } })
    );
  }
}
