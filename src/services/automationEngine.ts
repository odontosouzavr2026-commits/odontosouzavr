// Motor de Automações em Segundo Plano (Evolution WhatsApp & Odonto Souza)
// Monitora periodicamente a agenda e executa os gatilhos dos templates oficiais (ex: Lembrete 2h antes)

import { agendaService } from './agendaService';
import { templateService } from './templateService';
import { whatsappNotificationService } from './whatsappNotificationService';

const REMINDER_STORAGE_KEY_PREFIX = 'odonto_reminder_2h_sent_';
const NPS_STORAGE_KEY_PREFIX = 'odonto_nps_sent_';

export const automationEngine = {
  privateTimerId: null as any,
  isRunning: false,

  /**
   * Inicia o motor de automação (executa a cada 60 segundos)
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Executa a primeira checagem com pequeno delay para estabilização da aplicação
    setTimeout(() => {
      this.checkAutomations();
    }, 3000);

    this.privateTimerId = setInterval(() => {
      this.checkAutomations();
    }, 60000);

    console.info('[automationEngine] Motor de automações WhatsApp iniciado com sucesso.');
  },

  /**
   * Encerra o ciclo do motor
   */
  stop(): void {
    if (this.privateTimerId) {
      clearInterval(this.privateTimerId);
      this.privateTimerId = null;
    }
    this.isRunning = false;
  },

  /**
   * Executa a rotina de checagem dos gatilhos
   */
  async checkAutomations(): Promise<void> {
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

    for (const app of appointments) {
      const status = (app.status || '').toLowerCase();
      // Apenas consultas ativas (Confirmado ou Agendado)
      if (status.includes('cancel') || status.includes('desmarc') || status.includes('conclu') || status.includes('falta')) {
        continue;
      }

      if (!app.time) continue;
      const [h, m] = app.time.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;

      const appStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      const diffMinutes = Math.round((appStartTime.getTime() - now.getTime()) / 60000);

      // Janela de disparo: entre 105 e 135 minutos antes da consulta (aproximadamente 2 horas)
      if (diffMinutes >= 105 && diffMinutes <= 135) {
        const sentKey = `${REMINDER_STORAGE_KEY_PREFIX}${app.id}_${todayStr}`;
        if (localStorage.getItem(sentKey)) {
          // Já enviado hoje para este agendamento
          continue;
        }

        console.info(
          `[automationEngine] Disparando lembrete de 2h antes (tpl-1) para ${app.patientName} às ${app.time}`
        );

        const success = await whatsappNotificationService.send2HourReminder({
          patientName: app.patientName,
          phone: app.phone,
          date: todayStr,
          time: app.time,
          dentist: 'Dr. Frankisney Souza',
          pacienteId: app.pacienteId,
        });

        if (success) {
          localStorage.setItem(sentKey, new Date().toISOString());
        }
      }
    }
  },

  /**
   * Gatilho Oficial tpl-5: Pesquisa de Satisfação (NPS) Pós-Atendimento
   * Dispara após a consulta ser concluída
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

    for (const app of appointments) {
      const status = (app.status || '').toLowerCase();
      // Apenas consultas marcadas como 'Concluído'
      if (!status.includes('conclu') && !status.includes('finaliz')) {
        continue;
      }

      const sentKey = `${NPS_STORAGE_KEY_PREFIX}${app.id}_${todayStr}`;
      if (localStorage.getItem(sentKey)) {
        continue;
      }

      // Se passou pelo menos 60 minutos do término ou se foi concluído hoje
      const [h, m] = (app.time || '09:00').split(':').map(Number);
      const appStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      const minutesSinceApp = Math.round((now.getTime() - appStartTime.getTime()) / 60000);

      if (minutesSinceApp >= 60 && minutesSinceApp <= 300) {
        // Dispara mensagem de NPS
        try {
          const formatted = tpl5.content
            .replace(/\{\{nome_paciente\}\}/gi, app.patientName)
            .replace(/\{\{primeiro_nome\}\}/gi, app.patientName.split(' ')[0] || app.patientName);

          let phone = app.phone;
          if (phone && phone.replace(/\D/g, '').length >= 8) {
            await whatsappNotificationService.dispatchCustomText(phone, formatted, {
              templateId: 'tpl-5',
              templateName: 'Pesquisa de Satisfação Pós-Atendimento',
              recipientName: app.patientName,
            });
            localStorage.setItem(sentKey, new Date().toISOString());
          }
        } catch (e: any) {
          console.warn('[automationEngine.processNpsSurveys] Erro:', e.message);
        }
      }
    }
  },
};
