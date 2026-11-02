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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove permanentemente quaisquer notificações mock legadas
          return parsed.filter(
            (n: any) =>
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

          const notifId = `notif-ag-${ag.id}`;
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
        // Notificações manuais que não vieram do Supabase agendamentos/pacientes
        const idsExistentes = new Set(todasReais.map((n) => n.id));
        const manuais = prev.filter(
          (n) =>
            !idsExistentes.has(n.id) &&
            !n.id.startsWith('notif-ag-') &&
            !n.id.startsWith('notif-pac-') &&
            n.id !== 'notif-1' &&
            !n.mensagem?.includes('Sábado às 10:00') &&
            !n.detalhes?.dataConsulta?.includes('Próximo Sábado')
        );

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

        return [...todasReais, ...manuais].sort(
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
          setNotificacoes((prev) => {
            if (prev.some((n) => n.id === payload.id || n.mensagem === payload.mensagem)) {
              return prev;
            }
            return [payload, ...prev];
          });

          if (somHabilitado) {
            playReceptionBell2x();
          }
          toast.info(payload.titulo, payload.mensagem);
        } else if (type === 'REFRESH_NOTIFICACOES') {
          carregarNotificacoesReais();
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
        tipo: NotificacaoTipo;
        titulo: string;
        mensagem: string;
        detalhes?: NotificacaoDetalhes;
        linkRota?: 'agenda' | 'pacientes' | 'dashboard' | 'atendimento';
      },
      tocarSom: boolean = true
    ) => {
      const nova: NotificacaoClinica = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        tipo: dados.tipo,
        titulo: dados.titulo,
        mensagem: dados.mensagem,
        dataHora: new Date().toISOString(),
        lida: false,
        detalhes: dados.detalhes,
        linkRota: dados.linkRota,
      };

      setNotificacoes((prev) => {
        // Evita duplicar notificações com a mesma mensagem recebida nos últimos 5 segundos
        const duplicada = prev.some(
          (n) =>
            n.mensagem === dados.mensagem &&
            Math.abs(new Date(n.dataHora).getTime() - Date.now()) < 5000
        );
        if (duplicada) return prev;
        return [nova, ...prev];
      });

      // Toca a campainha de recepção 2x se habilitado
      if (tocarSom && somHabilitado) {
        playReceptionBell2x();
      }

      // Alerta visual Toast de alta visibilidade
      toast.info(dados.titulo, dados.mensagem);
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
      const currentRead = getReadIds();
      currentRead.add(id);
      saveReadIds(currentRead);

      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
      if (notificacaoSelecionada?.id === id) {
        setNotificacaoSelecionada(null);
      }
    },
    [notificacaoSelecionada]
  );

  const limparTodas = useCallback(() => {
    const currentRead = getReadIds();
    notificacoes.forEach((n) => currentRead.add(n.id));
    saveReadIds(currentRead);

    setNotificacoes([]);
    setNotificacaoSelecionada(null);
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
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  detalhes?: NotificacaoDetalhes;
  linkRota?: 'agenda' | 'pacientes' | 'dashboard' | 'atendimento';
}): void {
  if (typeof window !== 'undefined') {
    const nova: NotificacaoClinica = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      tipo: dados.tipo,
      titulo: dados.titulo,
      mensagem: dados.mensagem,
      dataHora: new Date().toISOString(),
      lida: false,
      detalhes: dados.detalhes,
      linkRota: dados.linkRota,
    };

    // 1. Salva em localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: NotificacaoClinica[] = raw ? JSON.parse(raw) : [];
      const limpo = list.filter(
        (n) =>
          n.id !== 'notif-1' &&
          !n.mensagem?.includes('Sábado às 10:00') &&
          !n.detalhes?.dataConsulta?.includes('Próximo Sábado')
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify([nova, ...limpo]));
    } catch {
      // silencioso
    }

    // 2. Dispara BroadcastChannel para todas as abas da aplicação
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'NOVA_NOTIFICACAO', payload: nova });
        bc.close();
      }
    } catch {
      // silencioso
    }

    // 3. Dispara CustomEvent local para a aba atual
    window.dispatchEvent(
      new CustomEvent('odonto:notificacao', { detail: dados })
    );
  }
}
