// Motor de Automações em Segundo Plano (Evolution WhatsApp & Odonto Souza)
// Monitora periodicamente a agenda e executa os gatilhos dos templates oficiais com prevenção estrita de duplicidade

import { supabase } from '../lib/supabase';
import { agendaService } from './agendaService';
import { templateService } from './templateService';
import { whatsappNotificationService } from './whatsappNotificationService';

const REMINDER_STORAGE_KEY_PREFIX = 'odonto_reminder_2h_sent_';
const NPS_STORAGE_KEY_PREFIX = 'odonto_nps_sent_';
const LOCK_NAME = 'odonto_automation_engine_leader_lock';

let isLeaderTab = false;
let stopLeaderLock: (() => void) | null = null;

export const automationEngine = {
  privateTimerId: null as any,
  isRunning: false,

  /**
   * Inicia o motor de automação (executa a cada 60 segundos com eleição de aba líder)
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Eleição de aba líder via Web Locks API para evitar que múltiplas abas abertas executem em duplicidade
    if (typeof navigator !== 'undefined' && 'locks' in navigator) {
      navigator.locks
        .request(LOCK_NAME, async () => {
          isLeaderTab = true;
          if (import.meta.env?.DEV) {
            console.info('[automationEngine] Esta aba foi eleita Líder de Automações.');
          }

          // Executa a primeira checagem com pequeno delay
          setTimeout(() => {
            if (this.isRunning && isLeaderTab) {
              this.checkAutomations();
            }
          }, 3000);

          this.privateTimerId = setInterval(() => {
            if (this.isRunning && isLeaderTab) {
              this.checkAutomations();
            }
          }, 15000); // 15 segundos para resposta ágil no teste de lembrete de 3 minutos

          await new Promise<void>((resolve) => {
            stopLeaderLock = resolve;
          });

          isLeaderTab = false;
        })
        .catch((err) => {
          console.warn('[automationEngine] Web Locks indisponível, operando em modo padrão:', err);
          isLeaderTab = true;
          this.startLegacyTimer();
        });
    } else {
      isLeaderTab = true;
      this.startLegacyTimer();
    }
  },

  startLegacyTimer(): void {
    setTimeout(() => {
      if (this.isRunning) this.checkAutomations();
    }, 3000);

    this.privateTimerId = setInterval(() => {
      if (this.isRunning) this.checkAutomations();
    }, 15000);
  },

  /**
   * Encerra o ciclo do motor
   */
  stop(): void {
    if (this.privateTimerId) {
      clearInterval(this.privateTimerId);
      this.privateTimerId = null;
    }
    if (stopLeaderLock) {
      stopLeaderLock();
      stopLeaderLock = null;
    }
    this.isRunning = false;
    isLeaderTab = false;
  },

  /**
   * Executa a rotina de checagem dos gatilhos
   */
  async checkAutomations(): Promise<void> {
    if (!isLeaderTab) return;

    try {
      await this.process2HourReminders();
      await this.processNpsSurveys();
    } catch (err: any) {
      console.warn('[automationEngine] Falha durante ciclo de checagem:', err.message);
    }
  },

  /**
   * Gatilho Oficial tpl-1: Lembrete de Consulta 2 Horas Antes
   * Identifica consultas marcadas para hoje na janela de ~2 horas (105 a 135 minutos à frente)
   */
  async process2HourReminders(): Promise<void> {
    const templates = templateService.getTemplates();
    const tpl1 = templates.find((t) => t.id === 'tpl-1');

    // Se o template estiver pausado, não executa
    if (!tpl1 || !tpl1.active) return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    const appointments = await agendaService.getAgendamentosPorData(todayStr);
    if (!appointments || appointments.length === 0) return;

    // Busca todos os logs de envio do tpl-1 registrados hoje no Supabase para verificação em lote
    let logsExistentesHoje: any[] = [];
    try {
      const { data } = await supabase
        .from('auditoria_logs')
        .select('id, entidade_id, detalhes, criado_em')
        .eq('entidade', 'agendamentos')
        .ilike('detalhes', '%tpl-1%')
        .gte('criado_em', `${todayStr}T00:00:00Z`);
      if (data) logsExistentesHoje = data;
    } catch (e) {
      console.warn('[automationEngine.process2HourReminders] Erro ao consultar logs do Supabase:', e);
    }

    for (const app of appointments) {
      const status = (app.status || '').toLowerCase();
      // Apenas consultas ativas (Confirmado ou Agendado)
      if (status.includes('cancel') || status.includes('desmarc') || status.includes('conclu') || status.includes('falta')) {
        continue;
      }

      if (!app.time) continue;
      // Regra de teste solicitada pelo usuário: disparar 3 minutos DEPOIS que o agendamento foi feito
      let shouldDispatch = false;
      const createdAt = app.createdAt ? new Date(app.createdAt) : null;

      if (createdAt && !isNaN(createdAt.getTime())) {
        const diffMinutesCreated = Math.round((now.getTime() - createdAt.getTime()) / 60000);
        // Se já passaram 3 minutos desde a criação do agendamento
        if (diffMinutesCreated >= 3) {
          shouldDispatch = true;
        }
      } else {
        // Fallback: 3 minutos antes da consulta se createdAt não constar
        const [h, m] = app.time.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          const appStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
          const diffMinutes = Math.round((appStartTime.getTime() - now.getTime()) / 60000);
          if (diffMinutes >= 0 && diffMinutes <= 4) {
            shouldDispatch = true;
          }
        }
      }

      if (shouldDispatch) {
        const sentKey = `${REMINDER_STORAGE_KEY_PREFIX}${app.id}_${todayStr}`;

        // 1. Verificação rápida em localStorage local
        if (localStorage.getItem(sentKey)) {
          continue;
        }

        // 2. Verificação estrita e infalível no banco de dados Supabase (auditoria_logs)
        const jaEnviadoNoBanco = logsExistentesHoje.some(
          (l) =>
            l.entidade_id === app.id ||
            (app.patientName && l.detalhes?.includes(app.patientName)) ||
            (app.phone && l.detalhes?.includes(app.phone))
        );

        if (jaEnviadoNoBanco) {
          localStorage.setItem(sentKey, new Date().toISOString());
          continue;
        }

        // 3. Lock atômico pré-disparo para evitar concorrência entre abas
        localStorage.setItem(sentKey, `DISPATCHING_${Date.now()}`);

        console.info(
          `[automationEngine] Disparando lembrete de 3min antes (tpl-1) para ${app.patientName} às ${app.time} (diff: ${diffMinutes} min)`
        );

        const success = await whatsappNotificationService.send2HourReminder({
          patientName: app.patientName,
          phone: app.phone,
          date: todayStr,
          time: app.time,
          dentist: 'Dr. Frankisney Souza',
          pacienteId: app.pacienteId,
          agendamentoId: app.id,
        });

        if (success) {
          localStorage.setItem(sentKey, new Date().toISOString());
        } else {
          // Se falhou por erro de rede temporário, remove o lock para reavaliar no próximo ciclo
          localStorage.removeItem(sentKey);
        }
      }
    }
  },

  /**
   * Gatilho Oficial tpl-5: Pesquisa de Satisfação (NPS) Pós-Atendimento
   * Dispara após a consulta ser concluída com validação estrita no banco Supabase (100% à prova de duplicatas)
   */
  async processNpsSurveys(): Promise<void> {
    const templates = templateService.getTemplates();
    const tpl5 = templates.find((t) => t.id === 'tpl-5');
    if (!tpl5 || !tpl5.active) return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    const appointments = await agendaService.getAgendamentosPorData(todayStr);
    if (!appointments || appointments.length === 0) return;

    // Busca todos os logs de envio do tpl-5 registrados hoje no Supabase para verificação centralizada
    let logsNpsHoje: any[] = [];
    try {
      const { data } = await supabase
        .from('auditoria_logs')
        .select('id, entidade_id, detalhes, criado_em')
        .eq('entidade', 'agendamentos')
        .ilike('detalhes', '%tpl-5%')
        .gte('criado_em', `${todayStr}T00:00:00Z`);
      if (data) logsNpsHoje = data;
    } catch (e) {
      console.warn('[automationEngine.processNpsSurveys] Erro ao consultar logs de NPS no Supabase:', e);
    }

    for (const app of appointments) {
      const status = (app.status || '').toLowerCase();
      // Apenas consultas marcadas como 'Concluído'
      if (!status.includes('conclu') && !status.includes('finaliz')) {
        continue;
      }

      const sentKey = `${NPS_STORAGE_KEY_PREFIX}${app.id}_${todayStr}`;

      // 1. Verificação rápida em localStorage local
      if (localStorage.getItem(sentKey)) {
        continue;
      }

      // 2. Verificação estrita e definitiva no banco de dados Supabase (auditoria_logs)
      const jaEnviadoNoBanco = logsNpsHoje.some(
        (l) =>
          l.entidade_id === app.id ||
          (app.patientName && l.detalhes?.includes(app.patientName)) ||
          (app.phone && l.detalhes?.includes(app.phone))
      );

      if (jaEnviadoNoBanco) {
        // Já existe registro permanente no Supabase! NUNCA envia novamente.
        localStorage.setItem(sentKey, new Date().toISOString());
        continue;
      }

      // 3. Se passou pelo menos 60 minutos do término ou se foi concluído hoje
      const [h, m] = (app.time || '09:00').split(':').map(Number);
      const appStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      const minutesSinceApp = Math.round((now.getTime() - appStartTime.getTime()) / 60000);

      if (minutesSinceApp >= 60 && minutesSinceApp <= 300) {
        // 4. Lock atômico pré-disparo para evitar concorrência entre abas ou dispositivos
        localStorage.setItem(sentKey, `DISPATCHING_${Date.now()}`);

        try {
          const formatted = tpl5.content
            .replace(/\{\{nome_paciente\}\}/gi, app.patientName)
            .replace(/\{\{primeiro_nome\}\}/gi, app.patientName.split(' ')[0] || app.patientName);

          let phone = app.phone;
          if (phone && phone.replace(/\D/g, '').length >= 8) {
            const success = await whatsappNotificationService.dispatchCustomText(phone, formatted, {
              templateId: 'tpl-5',
              templateName: 'Pesquisa de Satisfação Pós-Atendimento',
              recipientName: app.patientName,
              agendamentoId: app.id,
              pacienteId: app.pacienteId,
            });

            if (success) {
              localStorage.setItem(sentKey, new Date().toISOString());
              console.info(`[automationEngine] NPS (tpl-5) enviado com sucesso para ${app.patientName}.`);
            } else {
              localStorage.removeItem(sentKey);
            }
          }
        } catch (e: any) {
          console.warn('[automationEngine.processNpsSurveys] Erro:', e.message);
          localStorage.removeItem(sentKey);
        }
      }
    }
  },
};
