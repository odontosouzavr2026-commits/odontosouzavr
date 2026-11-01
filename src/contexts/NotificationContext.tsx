import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificacaoClinica, NotificacaoTipo, NotificacaoDetalhes } from '../types/notificacoes';
import { playReceptionBell2x } from '../utils/receptionBellAudio';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

interface NotificationContextData {
  notificacoes: NotificacaoClinica[];
  unreadCount: number;
  somHabilitado: boolean;
  notificacaoSelecionada: NotificacaoClinica | null;
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

// Notificações padrão somente se não houver dados reais carregados do Supabase
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

  // Carrega agendamentos reais diretamente do Supabase e sincroniza as notificações
  const carregarNotificacoesReais = useCallback(async () => {
    try {
      const { data: ags, error } = await supabase
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
        .order('data_hora_inicio', { ascending: false })
        .limit(15);

      if (!error && ags && ags.length > 0) {
        const notificacoesReais: NotificacaoClinica[] = ags.map((ag: any) => {
          const startDate = new Date(ag.data_hora_inicio);
          const timeStr = startDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const dateStr = startDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
          const pacNome = ag.pacientes?.nome || 'Paciente';

          // Extrai o nome do procedimento real
          let procNome = ag.procedimentos?.nome;
          if (!procNome && ag.observacoes?.includes('Portal do Paciente: ')) {
            procNome = ag.observacoes.split('Portal do Paciente: ')[1].split('.')[0].trim();
          }
          if (!procNome) {
            procNome = ag.tipo || 'Consulta Odontológica';
          }

          return {
            id: `notif-ag-${ag.id}`,
            tipo: 'novo_agendamento' as const,
            titulo: 'Novo Agendamento Confirmado',
            mensagem: `${pacNome} agendou ${procNome} para ${capitalizedDate} às ${timeStr}.`,
            dataHora: ag.criado_em || ag.data_hora_inicio,
            lida: false,
            detalhes: {
              pacienteNome: pacNome,
              pacienteTelefone: ag.pacientes?.telefone || '(65) 99605-5823',
              pacienteEmail: ag.pacientes?.email || '',
              dataConsulta: `${capitalizedDate} às ${timeStr}`,
              horarioConsulta: timeStr,
              procedimento: procNome,
              dentista: ag.usuarios?.nome || 'Dr. Frankisney Souza',
              origem: 'portal_paciente',
              observacoes: ag.observacoes || 'Agendado pelo sistema da clínica.',
            },
            linkRota: 'agenda' as const,
          };
        });

        setNotificacoes((prev) => {
          // Remove mocks legados e registros duplicados
          const semMocks = prev.filter(
            (n) =>
              n.id !== 'notif-1' &&
              !n.mensagem?.includes('Sábado às 10:00') &&
              !n.detalhes?.dataConsulta?.includes('Próximo Sábado') &&
              !n.id.startsWith('notif-ag-')
          );
          const idsExistentes = new Set(notificacoesReais.map((n) => n.id));
          const manter = semMocks.filter((n) => !idsExistentes.has(n.id));
          return [...notificacoesReais, ...manter];
        });
      }
    } catch (e) {
      console.warn('Erro ao carregar notificações reais:', e);
    }
  }, []);

  useEffect(() => {
    carregarNotificacoesReais();
  }, [carregarNotificacoesReais]);

  // Sincroniza notificações entre abas do navegador
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

      setNotificacoes((prev) => [nova, ...prev]);

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
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }, []);

  const marcarTodasComoLidas = useCallback(() => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    toast.success('Notificações', 'Todas as notificações foram marcadas como lidas.');
  }, [toast]);

  const excluirNotificacao = useCallback(
    (id: string) => {
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
      if (notificacaoSelecionada?.id === id) {
        setNotificacaoSelecionada(null);
      }
    },
    [notificacaoSelecionada]
  );

  const limparTodas = useCallback(() => {
    setNotificacoes([]);
    setNotificacaoSelecionada(null);
    toast.info('Notificações', 'Histórico de notificações foi limpo.');
  }, [toast]);

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
            if (somHabilitado) {
              playReceptionBell2x();
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'agendamentos' },
          () => {
            carregarNotificacoesReais();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[NotificationContext] Supabase Realtime channel indisponível:', err);
    }
  }, [adicionarNotificacao]);

  return (
    <NotificationContext.Provider
      value={{
        notificacoes,
        unreadCount,
        somHabilitado,
        notificacaoSelecionada,
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
 * Função utilitária global para despachar notificações de qualquer lugar do app
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

    window.dispatchEvent(
      new CustomEvent('odonto:notificacao', { detail: dados })
    );
  }
}
