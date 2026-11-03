// Serviço de Notificações Automáticas via WhatsApp (Evolution API)
// Disparo automático de confirmação de agendamentos com contagem regressiva de 5 segundos

import { evolutionApiService } from './evolutionApiService';
import { templateService } from './templateService';
import { supabase } from '../lib/supabase';
import { agendaService } from './agendaService';

export interface ScheduleConfirmationParams {
  patientName: string;
  phone?: string;
  date: string; // YYYY-MM-DD ou DD/MM/YYYY
  time: string; // HH:MM
  procedure: string;
  pacienteId?: string;
  delayMs?: number; // Padrão 5000ms (5 segundos)
}

/**
 * Converte data YYYY-MM-DD para DD/MM/YYYY amigável ao paciente
 */
export const formatAppointmentDate = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
};

/**
 * Monta o texto exato da mensagem de confirmação solicitado para a Odonto Souza
 */
export const buildAppointmentConfirmationMessage = (params: {
  patientName: string;
  date: string;
  time: string;
  procedure: string;
}): string => {
  const formattedDate = formatAppointmentDate(params.date);
  return `Olá, *${params.patientName}*! Tudo bem? 🦷💙

Passando apenas para avisar que o seu agendamento aqui na Odonto Souza está confirmado! 🎉

Confira os detalhes:
📅 Data: *${formattedDate}*
⏰ Horário: *${params.time}*
📋 Procedimento: *${params.procedure}*

Qualquer imprevisto ou dúvida antes da consulta, é só nos chamar por aqui. Estamos te esperando! ✨`;
};

/**
 * Monta o texto do lembrete de consulta 2 horas antes (tpl-1)
 */
export const build2HourReminderMessage = (params: {
  patientName: string;
  dentist?: string;
  date: string;
  time: string;
}): string => {
  const formattedDate = formatAppointmentDate(params.date);
  const dentistName = params.dentist || 'Dr. Frankisney B. Souza';
  return `Olá *${params.patientName}*! Lembramos da sua consulta com *${dentistName}* no dia *${formattedDate}* às *${params.time}* na clínica Odonto Souza.\n\nPor favor, responda:\n*1* para *CONFIRMAR*\n*2* para *REMARCAR*`;
};

/**
 * Resposta automática caso o paciente responda "1" (Confirmar Consulta)
 */
export const buildOption1ConfirmReply = (params: {
  patientName: string;
  time?: string;
}): string => {
  const firstName = params.patientName.split(' ')[0] || params.patientName;
  const timeStr = params.time ? ` de hoje às *${params.time}*` : ' de hoje';
  return `Perfeito, *${firstName}*! Sua consulta${timeStr} está confirmada. A equipe da Odonto Souza está te esperando! 🦷✨`;
};

/**
 * Resposta automática caso o paciente responda "2" (Remarcar Consulta)
 * Conforme solicitação do usuário:
 * "Entendido, [Nome]!\nAcesse seu painel pelo endereço https://app.odontosouzavr.com.br para fazer a Remarcação para um novo horário ou novo dia"
 */
export const buildOption2RescheduleReply = (params: {
  patientName: string;
}): string => {
  const firstName = params.patientName.split(' ')[0] || params.patientName;
  return `Entendido, *${firstName}*!\nAcesse seu painel pelo endereço https://app.odontosouzavr.com.br para fazer a Remarcação para um novo horário ou novo dia`;
};

/**
 * Mensagem disparada quando um paciente na Fila de Encaixe é promovido automaticamente para uma vaga desmarcada
 */
export const buildEncaixePromovidoMessage = (params: {
  patientName: string;
  date: string;
  time: string;
  dentist?: string;
  procedure?: string;
}): string => {
  const firstName = params.patientName.split(' ')[0] || params.patientName;
  const formattedDate = formatAppointmentDate(params.date);
  const dentistName = params.dentist || 'Dr. Frankisney B. Souza';
  return `Olá, *${firstName}*! 🎉 Boas notícias!\n\nUma vaga abriu na agenda e você foi adiantado(a) da *Fila de Encaixe* prioritária da clínica Odonto Souza! 🦷✨\n\nConfira os dados do seu agendamento:\n📅 Data: *${formattedDate}*\n⏰ Horário: *${params.time}*\n👨‍⚕️ Profissional: *${dentistName}*\n📋 Procedimento: *${params.procedure || 'Consulta Odontológica'}*\n📍 Local: *Clínica Odonto Souza*\n\nSeu agendamento já está confirmado. Esperamos você na clínica! Se precisar de algo, responda a esta mensagem.`;
};

export const whatsappNotificationService = {
  /**
   * Agenda e dispara a confirmação de agendamento via WhatsApp exatamente após 5 segundos
   */
  scheduleAppointmentConfirmation(params: ScheduleConfirmationParams): number {
    const delay = params.delayMs ?? 5000;

    // Dispara notificação visual imediata de que o disparo ocorrerá em 5 segundos
    window.dispatchEvent(
      new CustomEvent('app_toast', {
        detail: {
          type: 'info',
          title: 'WhatsApp Programado ⏱️',
          message: `Mensagem de confirmação será enviada para ${params.patientName} em 5 segundos...`,
          duration: 4000,
        },
      })
    );

    // Timeout de 5 segundos
    const timerId = window.setTimeout(async () => {
      try {
        let phone = params.phone;

        // Se não tiver telefone ou for curto, tenta buscar no Supabase
        const cleanDigits = (phone || '').replace(/\D/g, '');
        if (cleanDigits.length < 8) {
          if (params.pacienteId) {
            const { data } = await supabase
              .from('pacientes')
              .select('telefone')
              .eq('id', params.pacienteId)
              .maybeSingle();
            if (data?.telefone) {
              phone = data.telefone;
            }
          }

          if (!phone && params.patientName) {
            const { data } = await supabase
              .from('pacientes')
              .select('telefone')
              .ilike('nome', params.patientName.trim())
              .maybeSingle();
            if (data?.telefone) {
              phone = data.telefone;
            }
          }
        }

        const validDigits = (phone || '').replace(/\D/g, '');
        if (!phone || validDigits.length < 8) {
          console.warn('[whatsappNotificationService] Paciente sem telefone cadastrado:', params.patientName);
          window.dispatchEvent(
            new CustomEvent('app_toast', {
              detail: {
                type: 'warning',
                title: 'WhatsApp Não Enviado',
                message: `Paciente ${params.patientName} não possui telefone/WhatsApp cadastrado para receber a confirmação.`,
                duration: 5000,
              },
            })
          );
          return;
        }

        const tpl = templateService.getTemplates().find((t) => t.id === 'tpl-2');
        if (tpl && !tpl.active) {
          console.info('[whatsappNotificationService] Template tpl-2 está pausado. Disparo cancelado.');
          return;
        }

        const formattedDate = formatAppointmentDate(params.date);
        let messageText = '';

        if (tpl && tpl.content) {
          messageText = tpl.content
            .replace(/\{\{nome_paciente\}\}/gi, params.patientName)
            .replace(/\{\{primeiro_nome\}\}/gi, params.patientName.split(' ')[0] || params.patientName)
            .replace(/\{\{data_consulta\}\}/gi, formattedDate)
            .replace(/\{\{hora\}\}/gi, params.time)
            .replace(/\{\{procedimento\}\}/gi, params.procedure)
            .replace(/\{\{dentista\}\}/gi, 'Dr. Frankisney B. Souza')
            .replace(/\{\{telefone_clinica\}\}/gi, '(66) 98445-4825')
            .replace(/\{\{chave_pix_clinica\}\}/gi, 'financeiro@odontosouzavr.com.br')
            .replace(/\{\{link_fatura\}\}/gi, 'https://app.odontosouzavr.com.br');
        } else {
          messageText = buildAppointmentConfirmationMessage({
            patientName: params.patientName,
            date: params.date,
            time: params.time,
            procedure: params.procedure,
          });
        }

        // Envio real via Evolution API
        await evolutionApiService.sendTextMessage(phone, messageText);

        // Registra log do disparo
        templateService.logDispatch({
          id: `dsp-${Date.now()}`,
          templateId: 'tpl-2',
          templateName: 'Confirmação Imediata de Consulta',
          recipientName: params.patientName,
          phone,
          sentAt: new Date().toISOString(),
          status: 'sent',
          channel: 'evolution_api',
        });

        // Grava auditoria permanente no Supabase
        try {
          await supabase.from('auditoria_logs').insert({
            entidade: 'agendamentos',
            acao: 'DISPARO_WHATSAPP_CONFIRMACAO',
            detalhes: `Confirmação de agendamento (tpl-2) enviada via WhatsApp para ${params.patientName} (${phone}) - ${params.date} às ${params.time}.`,
          });
        } catch (e) {
          // silencioso
        }

        // Atualiza métricas
        const metrics = templateService.getMetrics();
        metrics.sentToday = (metrics.sentToday || 0) + 1;
        localStorage.setItem('odonto_templates_metrics_v1', JSON.stringify(metrics));

        // Toast de sucesso na tela
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: {
              type: 'success',
              title: 'WhatsApp Enviado! 📲✨',
              message: `Confirmação de agendamento entregue com sucesso para ${params.patientName} no WhatsApp!`,
              duration: 5000,
            },
          })
        );
      } catch (err: any) {
        console.error('[whatsappNotificationService] Falha ao enviar WhatsApp:', err);
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: {
              type: 'warning',
              title: 'Falha no Envio WhatsApp',
              message: `Não foi possível entregar a confirmação para ${params.patientName}: ${err.message || 'Verifique a conexão da instância.'}`,
              duration: 6000,
            },
          })
        );
      }
    }, delay);

    return timerId;
  },

  /**
   * Envia o lembrete de consulta 2h antes (template oficial tpl-1)
   */
  async send2HourReminder(params: {
    patientName: string;
    phone?: string;
    date: string;
    time: string;
    dentist?: string;
    pacienteId?: string;
    agendamentoId?: string;
  }): Promise<boolean> {
    try {
      let phone = params.phone;
      if (!phone || phone.replace(/\D/g, '').length < 8) {
        if (params.pacienteId) {
          const { data } = await supabase
            .from('pacientes')
            .select('telefone')
            .eq('id', params.pacienteId)
            .maybeSingle();
          if (data?.telefone) phone = data.telefone;
        }

        if (!phone && params.patientName) {
          const { data } = await supabase
            .from('pacientes')
            .select('telefone')
            .ilike('nome', params.patientName.trim())
            .maybeSingle();
          if (data?.telefone) phone = data.telefone;
        }
      }

      if (!phone || phone.replace(/\D/g, '').length < 8) {
        window.dispatchEvent(
          new CustomEvent('app_toast', {
            detail: {
              type: 'warning',
              title: 'Lembrete 2h Não Enviado',
              message: `Paciente ${params.patientName} não possui telefone/WhatsApp cadastrado.`,
              duration: 5000,
            },
          })
        );
        return false;
      }

      const tpl = templateService.getTemplates().find((t) => t.id === 'tpl-1');
      if (tpl && !tpl.active) {
        console.info('[whatsappNotificationService] Template tpl-1 está pausado. Disparo cancelado.');
        return false;
      }

      const formattedDate = formatAppointmentDate(params.date);
      const dentistName = params.dentist || 'Dr. Frankisney B. Souza';
      let msg = '';

      if (tpl && tpl.content) {
        msg = tpl.content
          .replace(/\{\{nome_paciente\}\}/gi, params.patientName)
          .replace(/\{\{primeiro_nome\}\}/gi, params.patientName.split(' ')[0] || params.patientName)
          .replace(/\{\{data_consulta\}\}/gi, formattedDate)
          .replace(/\{\{hora\}\}/gi, params.time)
          .replace(/\{\{dentista\}\}/gi, dentistName)
          .replace(/\{\{telefone_clinica\}\}/gi, '(66) 98445-4825');
      } else {
        msg = build2HourReminderMessage(params);
      }

      // Envio universal por texto formatado (1 para CONFIRMAR, 2 para REMARCAR) compatível com WhatsApp Web, Desktop e Celulares
      await evolutionApiService.sendTextMessage(phone, msg);

      templateService.logDispatch({
        id: `dsp-${Date.now()}`,
        templateId: 'tpl-1',
        templateName: 'Lembrete de Consulta (2h antes)',
        recipientName: params.patientName,
        phone,
        sentAt: new Date().toISOString(),
        status: 'sent',
        channel: 'evolution_api',
      });

      // Grava auditoria permanente no Supabase
      try {
        await supabase.from('auditoria_logs').insert({
          entidade: 'agendamentos',
          entidade_id: params.agendamentoId || null,
          acao: 'DISPARO_WHATSAPP_LEMBRETE',
          detalhes: `Lembrete (tpl-1) entregue para ${params.patientName} (${phone}) - Consulta às ${params.time}.`,
        });
      } catch (e) {}

      const metrics = templateService.getMetrics();
      metrics.sentToday = (metrics.sentToday || 0) + 1;
      localStorage.setItem('odonto_whatsapp_metrics_v2', JSON.stringify(metrics));

      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: {
            type: 'success',
            title: 'Lembrete WhatsApp Enviado! 📲',
            message: `Lembrete de consulta entregue para ${params.patientName} via WhatsApp.`,
            duration: 5000,
          },
        })
      );
      return true;
    } catch (err: any) {
      console.error('[whatsappNotificationService.send2HourReminder] Erro:', err);
      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: {
            type: 'warning',
            title: 'Falha no Lembrete 2h',
            message: `Erro ao enviar lembrete de 2h para ${params.patientName}: ${err.message}`,
            duration: 6000,
          },
        })
      );
      return false;
    }
  },

  /**
   * Processa a resposta do paciente ("1" para confirmar, "2" para remarcar)
   */
  async handlePatientIncomingResponse(params: {
    phone: string;
    messageText: string;
    patientName?: string;
  }): Promise<{ handled: boolean; replySent?: string; actionTaken?: string }> {
    const text = params.messageText.trim().toLowerCase();
    const isOption1 = text === '1' || text.startsWith('1 ') || text === 'confirmar' || text.includes('confirmo');
    const isOption2 = text === '2' || text.startsWith('2 ') || text === 'remarcar' || text.includes('remarc');

    if (!isOption1 && !isOption2) {
      return { handled: false };
    }

    // Identifica o paciente e consulta de hoje
    let patientName = params.patientName;
    let appointmentId: string | undefined;
    let appointmentTime: string | undefined;

    try {
      const appointments = await agendaService.getAgendamentos();
      const todayKey = new Date().toISOString().split('T')[0];
      const cleanDigits = params.phone.replace(/\D/g, '');

      const found = appointments.find((a) => {
        const appDigits = (a.phone || '').replace(/\D/g, '');
        const matchPhone =
          (appDigits && cleanDigits && (appDigits.includes(cleanDigits) || cleanDigits.includes(appDigits))) ||
          (patientName && a.patientName.toLowerCase().trim() === patientName.toLowerCase().trim());
        return a.date === todayKey && matchPhone;
      });

      if (found) {
        appointmentId = found.id;
        appointmentTime = found.time;
        if (!patientName) patientName = found.patientName;
      }
    } catch (e) {
      console.warn('[whatsappNotificationService] Erro ao buscar agendamento:', e);
    }

    const finalName = patientName || 'Paciente';

    if (isOption1) {
      // 1: Confirmar consulta
      if (appointmentId) {
        try {
          await agendaService.updateStatus(appointmentId, 'confirmado');
        } catch (e) {
          console.warn('[handlePatientIncomingResponse] Erro updateStatus:', e);
        }
      }
      const reply = buildOption1ConfirmReply({ patientName: finalName, time: appointmentTime });
      await evolutionApiService.sendTextMessage(params.phone, reply);

      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: {
            type: 'success',
            title: 'Consulta Confirmada via WhatsApp! 📲',
            message: `${finalName} respondeu "1" e confirmou a consulta de hoje às ${appointmentTime || ''}.`,
            duration: 6000,
          },
        })
      );

      return { handled: true, replySent: reply, actionTaken: 'confirmado' };
    } else {
      // 2: Remarcar consulta
      if (appointmentId) {
        try {
          await agendaService.updateStatus(appointmentId, 'desmarcou');
        } catch (e) {
          console.warn('[handlePatientIncomingResponse] Erro updateStatus:', e);
        }
      }
      const reply = buildOption2RescheduleReply({ patientName: finalName });
      await evolutionApiService.sendTextMessage(params.phone, reply);

      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: {
            type: 'warning',
            title: 'Solicitação de Remarcação ⚠️',
            message: `${finalName} respondeu "2" para remarcar. Link do painel enviado via WhatsApp!`,
            duration: 6000,
          },
        })
      );

      return { handled: true, replySent: reply, actionTaken: 'remarcacao_solicitada' };
    }
  },

  /**
   * Disparo genérico para outros templates automatizados (ex: NPS, Boas-Vindas)
   */
  async dispatchCustomText(
    phone: string,
    text: string,
    meta: {
      templateId: string;
      templateName: string;
      recipientName: string;
      agendamentoId?: string;
      pacienteId?: string;
    }
  ): Promise<boolean> {
    try {
      await evolutionApiService.sendTextMessage(phone, text);

      templateService.logDispatch({
        id: `dsp-${Date.now()}`,
        templateId: meta.templateId,
        templateName: meta.templateName,
        recipientName: meta.recipientName,
        phone,
        sentAt: new Date().toISOString(),
        status: 'sent',
        channel: 'evolution_api',
      });

      const metrics = templateService.getMetrics();
      metrics.sentToday = (metrics.sentToday || 0) + 1;
      localStorage.setItem('odonto_whatsapp_metrics_v2', JSON.stringify(metrics));

      try {
        await supabase.from('auditoria_logs').insert({
          entidade: 'agendamentos',
          entidade_id: meta.agendamentoId || null,
          acao: 'DISPARO_WHATSAPP_AUTOMATICO',
          detalhes: `${meta.templateName} (${meta.templateId}) entregue para ${meta.recipientName} (${phone}).`,
        });
      } catch (e) {}

      return true;
    } catch (err: any) {
      console.warn('[whatsappNotificationService.dispatchCustomText] Erro:', err.message);
      return false;
    }
  },

  /**
   * Notifica um paciente da Fila de Encaixe que uma vaga abriu e sua consulta foi agendada
   */
  async notifyEncaixePromovido(params: {
    patientName: string;
    phone?: string;
    date: string;
    time: string;
    dentist?: string;
    procedure?: string;
    pacienteId?: string;
  }): Promise<boolean> {
    try {
      let phone = params.phone;
      const cleanDigits = (phone || '').replace(/\D/g, '');

      if (cleanDigits.length < 8) {
        if (params.pacienteId) {
          const { data } = await supabase
            .from('pacientes')
            .select('telefone')
            .eq('id', params.pacienteId)
            .maybeSingle();
          if (data?.telefone) phone = data.telefone;
        }

        if (!phone && params.patientName) {
          const { data } = await supabase
            .from('pacientes')
            .select('telefone')
            .ilike('nome', params.patientName.trim())
            .maybeSingle();
          if (data?.telefone) phone = data.telefone;
        }
      }

      if (!phone || phone.replace(/\D/g, '').length < 8) {
        console.warn('[whatsappNotificationService] Encaixe promovido sem telefone para envio:', params.patientName);
        return false;
      }

      const messageText = buildEncaixePromovidoMessage({
        patientName: params.patientName,
        date: params.date,
        time: params.time,
        dentist: params.dentist || 'Dr. Frankisney B. Souza',
        procedure: params.procedure || 'Consulta Odontológica',
      });

      await evolutionApiService.sendTextMessage(phone, messageText);

      templateService.logDispatch({
        id: `dsp-encaixe-${Date.now()}`,
        templateId: 'tpl-encaixe-promovido',
        templateName: 'Chamada de Fila de Encaixe',
        recipientName: params.patientName,
        phone,
        sentAt: new Date().toISOString(),
        status: 'sent',
        channel: 'evolution_api',
      });

      const metrics = templateService.getMetrics();
      metrics.sentToday = (metrics.sentToday || 0) + 1;
      localStorage.setItem('odonto_whatsapp_metrics_v2', JSON.stringify(metrics));

      try {
        await supabase.from('auditoria_logs').insert({
          entidade: 'agendamentos',
          acao: 'ENCAIXE_AUTOMATICO_WHATSAPP',
          detalhes: `Paciente ${params.patientName} (${phone}) alocado automaticamente da fila de encaixe para a vaga das ${params.time} em ${params.date} e notificado no WhatsApp.`,
        });
      } catch (e) {}

      // Notificação visual de sucesso
      window.dispatchEvent(
        new CustomEvent('app_toast', {
          detail: {
            type: 'success',
            title: 'Encaixe Notificado! 📲🎉',
            message: `${params.patientName} recebeu os dados do agendamento no WhatsApp para as ${params.time}!`,
            duration: 5000,
          },
        })
      );

      return true;
    } catch (err: any) {
      console.error('[whatsappNotificationService.notifyEncaixePromovido] Erro ao notificar paciente de encaixe:', err);
      return false;
    }
  },
};
