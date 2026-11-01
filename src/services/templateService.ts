import { WhatsAppTemplate, TemplatesMetrics } from '../types/templates';
import { evolutionApiService } from './evolutionApiService';

export interface DispatchLog {
  id: string;
  templateId: string;
  templateName: string;
  recipientName: string;
  phone: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  channel: 'evolution_api' | 'meta_cloud';
}

/**
 * Garante que todas as variáveis dinâmicas (ex: {{nome_paciente}})
 * fiquem entre asteriscos (*{{nome_paciente}}*) para aparecerem em negrito no WhatsApp
 */
export const normalizeVariablesAsterisks = (content: string): string => {
  if (!content) return '';
  // 1. Corrige * {{tag}} * com espaços para *{{tag}}*
  let result = content.replace(/\*\s*\{\{([^}]+)\}\}\s*\*/g, (_, p1) => `*{{${p1.trim()}}}*`);
  // 2. Coloca * em volta de {{tag}} que ainda não esteja entre asteriscos
  result = result.replace(/(?<!\*)\{\{([^}]+)\}\}(?!\*)/g, (_, p1) => `*{{${p1.trim()}}}*`);
  return result;
};

export const INITIAL_OFFICIAL_TEMPLATES: WhatsAppTemplate[] = [
  // 1. Agendamentos (5 templates)
  {
    id: 'tpl-1',
    name: 'Lembrete de Consulta (2h antes)',
    category: 'agendamentos',
    categoryLabel: 'Agendamentos',
    triggerDescription: 'Gatilho automático 2 horas antes da consulta',
    triggerTiming: 'Disparo Automático: 2h antes',
    active: true,
    content:
      'Olá *{{nome_paciente}}*! Lembramos da sua consulta com *{{dentista}}* hoje, dia *{{data_consulta}}* às *{{hora}}*. Por favor, responda 1 para CONFIRMAR ou 2 para REMARCAR.',
    readRate: 98,
    responseRate: 92,
    approvedMeta: true,
  },
  {
    id: 'tpl-2',
    name: 'Confirmação Imediata de Consulta',
    category: 'agendamentos',
    categoryLabel: 'Agendamentos',
    triggerDescription: 'Gatilho automático de 5s pós-agendamento',
    triggerTiming: 'Disparo Automático: 5s após confirmação',
    active: true,
    content:
      'Olá, *{{nome_paciente}}*! Tudo bem? 🦷💙\n\nPassando apenas para avisar que o seu agendamento aqui na Odonto Souza está confirmado! 🎉\n\nConfira os detalhes:\n📅 Data: *{{data_consulta}}*\n⏰ Horário: *{{hora}}*\n📋 Procedimento: *{{procedimento}}*\n\nQualquer imprevisto ou dúvida antes da consulta, é só nos chamar por aqui. Estamos te esperando! ✨',
    readRate: 97,
    extraMetricLabel: 'Adições à Agenda',
    extraMetricValue: '73%',
    secondaryMetricLabel: 'Status',
    secondaryMetricValue: 'Ativo',
    approvedMeta: true,
  },
  {
    id: 'tpl-3',
    name: 'Aviso de Chegada e Pontualidade',
    category: 'agendamentos',
    categoryLabel: 'Agendamentos',
    triggerDescription: 'Reforço de pontualidade na recepção',
    triggerTiming: 'Disparo no dia da consulta',
    active: true,
    content:
      'Olá *{{primeiro_nome}}*! Sua consulta na Odonto Souza é hoje às *{{hora}}* com *{{dentista}}*. Estamos prontos para recebê-lo(a)! Em caso de imprevisto, avise-nos imediatamente.',
    readRate: 99,
    responseRate: 91,
    approvedMeta: true,
  },
  {
    id: 'tpl-4',
    name: 'Solicitação de Remarcação (Opção 2)',
    category: 'agendamentos',
    categoryLabel: 'Agendamentos',
    triggerDescription: 'Resposta automática para opção 2',
    triggerTiming: 'Disparo pós-resposta "2" do paciente',
    active: true,
    content:
      'Entendido, *{{primeiro_nome}}*!\nAcesse seu painel pelo endereço https://app.odontosouzavr.com.br para fazer a Remarcação para um novo horário ou novo dia',
    readRate: 98,
    responseRate: 94,
    approvedMeta: true,
  },
  {
    id: 'tpl-5',
    name: 'Pesquisa de Satisfação Pós-Atendimento',
    category: 'agendamentos',
    categoryLabel: 'Agendamentos',
    triggerDescription: 'Pesquisa NPS automática pós-consulta',
    triggerTiming: '2h após término do atendimento',
    active: true,
    content:
      'Olá *{{primeiro_nome}}*, como foi sua experiência hoje na Odonto Souza? Responda com uma nota de 1 a 5 para nosso atendimento e nos ajude a evoluir sempre!',
    readRate: 91,
    extraMetricLabel: 'NPS Geral',
    extraMetricValue: '96.4',
    secondaryMetricLabel: 'Engajamento',
    secondaryMetricValue: '68%',
    approvedMeta: true,
  },

  // 2. Financeiro (3 templates)
  {
    id: 'tpl-6',
    name: 'Aviso de Vencimento / Boleto & PIX',
    category: 'financeiro',
    categoryLabel: 'Financeiro',
    triggerDescription: 'Gatilho financeiro de conciliação',
    triggerTiming: '3 dias antes do vencimento',
    active: true,
    content:
      'Prezado(a) *{{nome_paciente}}*, informamos que o boleto referente ao tratamento *{{procedimento}}* vence em *{{data_vencimento}}*. Chave PIX: *{{chave_pix_clinica}}*. Link do comprovante: *{{link_fatura}}*.',
    readRate: 94,
    extraMetricLabel: 'Pontualidade',
    extraMetricValue: '+24%',
    secondaryMetricLabel: 'Inadimplência',
    secondaryMetricValue: '-12%',
    approvedMeta: true,
  },
  {
    id: 'tpl-7',
    name: 'Comprovante de Pagamento Confirmado',
    category: 'financeiro',
    categoryLabel: 'Financeiro',
    triggerDescription: 'Recibo automático pós-baixa financeira',
    triggerTiming: 'Disparo imediato após pagamento',
    active: true,
    content:
      'Olá *{{nome_paciente}}*, confirmamos o recebimento do pagamento no valor acordado referente a *{{procedimento}}*. Muito obrigado pela confiança e pontualidade!',
    readRate: 98,
    extraMetricLabel: 'Satisfação Financeira',
    extraMetricValue: '99%',
    secondaryMetricLabel: 'Recibos Entregues',
    secondaryMetricValue: '100%',
    approvedMeta: true,
  },
  {
    id: 'tpl-8',
    name: 'Lembrete de Parcela Vencida (Cobrança Amigável)',
    category: 'financeiro',
    categoryLabel: 'Financeiro',
    triggerDescription: 'Gatilho amigável de recuperação',
    triggerTiming: '2 dias após vencimento em aberto',
    active: false,
    content:
      'Olá *{{primeiro_nome}}*, notamos uma pendência em aberto referente à fatura de *{{data_vencimento}}*. Acesse *{{link_fatura}}* para regularizar via PIX ou fale com nossa equipe.',
    readRate: 89,
    extraMetricLabel: 'Recuperação',
    extraMetricValue: '58%',
    secondaryMetricLabel: 'Status',
    secondaryMetricValue: 'Pausado',
    approvedMeta: true,
  },

  // 3. Pós-Operatório & Retorno (2 templates)
  {
    id: 'tpl-9',
    name: 'Cuidados Pós-Cirúrgicos',
    category: 'pos_op',
    categoryLabel: 'Pós-Operatório & Retorno',
    triggerDescription: 'Gatilho cirúrgico de suporte',
    triggerTiming: '4h após finalização clínica',
    active: true,
    content:
      'Olá *{{nome_paciente}}*, Dr. Frankisney Souza espera que você esteja descansando bem! Lembre-se de aplicar compressas de gelo por 20 min e tomar as medicações prescritas. Em caso de dúvidas, nos contate imediatamente: *{{telefone_clinica}}*.',
    readRate: 98,
    extraMetricLabel: 'Satisfação',
    extraMetricValue: '99.1%',
    secondaryMetricLabel: 'Suporte ativado',
    secondaryMetricValue: '4%',
    approvedMeta: true,
  },
  {
    id: 'tpl-10',
    name: 'Acompanhamento Pós-Procedimento (48h)',
    category: 'pos_op',
    categoryLabel: 'Pós-Operatório & Retorno',
    triggerDescription: 'Checagem de recuperação tecidual',
    triggerTiming: '48h pós-atendimento',
    active: true,
    content:
      'Olá *{{primeiro_nome}}*! Como você está se sentindo após o procedimento de *{{procedimento}}*? A equipe Odonto Souza está à disposição para qualquer dúvida ou revisão.',
    readRate: 97,
    extraMetricLabel: 'Fidelização',
    extraMetricValue: '94%',
    secondaryMetricLabel: 'Feedbacks',
    secondaryMetricValue: '86%',
    approvedMeta: true,
  },

  // 4. Prevenção & Recalls (2 templates)
  {
    id: 'tpl-11',
    name: 'Recall Semestral de Profilaxia',
    category: 'recalls',
    categoryLabel: 'Prevenção & Recalls',
    triggerDescription: 'Gatilho de retorno preventivo',
    triggerTiming: '180 dias após última consulta',
    active: true,
    content:
      'Olá *{{nome_paciente}}*! Já faz 6 meses desde o seu último check-up preventivo na Odonto Souza. Que tal garantir um sorriso saudável? Agende sua profilaxia respondendo aqui!',
    readRate: 92,
    extraMetricLabel: 'Conversão',
    extraMetricValue: '41.8%',
    secondaryMetricLabel: 'Retorno médio',
    secondaryMetricValue: '12 dias',
    approvedMeta: true,
  },
  {
    id: 'tpl-12',
    name: 'Alerta de Troca de Escova e Saúde Bucal',
    category: 'recalls',
    categoryLabel: 'Prevenção & Recalls',
    triggerDescription: 'Gatilho educativo trimestral',
    triggerTiming: '90 dias após última consulta',
    active: true,
    content:
      'Olá *{{primeiro_nome}}*! Sabia que dentistas recomendam trocar a escova a cada 3 meses? Cuide do seu sorriso todos os dias e, se precisar de revisão, agende conosco pelo WhatsApp!',
    readRate: 88,
    extraMetricLabel: 'Engajamento',
    extraMetricValue: '37%',
    secondaryMetricLabel: 'Retorno',
    secondaryMetricValue: '18 dias',
    approvedMeta: true,
  },

  // 5. Relacionamento (2 templates)
  {
    id: 'tpl-13',
    name: 'Felicitações de Aniversário',
    category: 'relacionamento',
    categoryLabel: 'Relacionamento',
    triggerDescription: 'Gatilho de fidelização natalícia',
    triggerTiming: 'Disparo às 09:00 no dia natalício',
    active: true,
    content:
      'Parabéns, *{{nome_paciente}}*! Toda a equipe da Odonto Souza deseja um dia repleto de alegrias e motivos para sorrir! Preparamos um presente especial para sua próxima consulta: *{{cupom_presente}}*.',
    readRate: 95,
    extraMetricLabel: 'NPS Relacional',
    extraMetricValue: '98.2',
    secondaryMetricLabel: 'Uso do cupom',
    secondaryMetricValue: '32%',
    approvedMeta: true,
  },
  {
    id: 'tpl-14',
    name: 'Boas-Vindas à Odonto Souza',
    category: 'relacionamento',
    categoryLabel: 'Relacionamento',
    triggerDescription: 'Primeiro contato acolhedor',
    triggerTiming: 'Disparo pós-cadastro de paciente',
    active: false,
    content:
      'Seja muito bem-vindo(a) à Odonto Souza, *{{nome_paciente}}*! É um privilégio cuidar do seu sorriso. Salve este número em seus contatos para facilitar seus agendamentos.',
    readRate: 94,
    extraMetricLabel: 'Contato Salvo',
    extraMetricValue: '81%',
    secondaryMetricLabel: 'Status',
    secondaryMetricValue: 'Pausado',
    approvedMeta: true,
  },
];

const STORAGE_KEY = 'odonto_whatsapp_templates_v6';
const METRICS_STORAGE_KEY = 'odonto_whatsapp_metrics_v2';
const LOGS_STORAGE_KEY = 'odonto_whatsapp_dispatches_v2';

export const templateService = {
  // Carrega todos os templates salvos (ou inicia com os 14 oficiais)
  getTemplates(): WhatsAppTemplate[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: WhatsAppTemplate[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const synced = parsed.map((item) => {
            const content = normalizeVariablesAsterisks(item.content);
            if (item.id === 'tpl-1') {
              return {
                ...item,
                name: 'Lembrete de Consulta (2h antes)',
                triggerTiming: 'Disparo Automático: 2h antes',
                triggerDescription: 'Gatilho automático 2 horas antes da consulta',
                content,
              };
            }
            if (item.id === 'tpl-2') {
              return {
                ...item,
                name: 'Confirmação Imediata de Consulta',
                triggerTiming: 'Disparo Automático: 5s após confirmação',
                triggerDescription: 'Gatilho automático de 5s pós-agendamento',
                content,
              };
            }
            if (item.id === 'tpl-3') {
              return {
                ...item,
                name: 'Aviso de Chegada e Pontualidade',
                triggerTiming: 'Disparo no dia da consulta',
                triggerDescription: 'Reforço de pontualidade na recepção',
                content,
              };
            }
            if (item.id === 'tpl-4') {
              return {
                ...item,
                name: 'Solicitação de Remarcação (Opção 2)',
                triggerTiming: 'Disparo pós-resposta "2" do paciente',
                triggerDescription: 'Resposta automática para opção 2',
                content:
                  'Entendido, *{{primeiro_nome}}*!\nAcesse seu painel pelo endereço https://app.odontosouzavr.com.br para fazer a Remarcação para um novo horário ou novo dia',
              };
            }
            return { ...item, content };
          });
          return synced;
        }
      }
    } catch (e) {
      console.warn('[templateService] Erro ao ler templates locais:', e);
    }
    // Salva a lista inicial de 14 templates
    this.saveTemplates(INITIAL_OFFICIAL_TEMPLATES);
    return INITIAL_OFFICIAL_TEMPLATES;
  },

  saveTemplates(templates: WhatsAppTemplate[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error('[templateService] Erro ao salvar templates:', e);
    }
  },

  // Alterna o status ativo/pausado de um template
  toggleTemplateActive(id: string): { template: WhatsAppTemplate; allTemplates: WhatsAppTemplate[] } {
    const list = this.getTemplates();
    let updatedTpl: WhatsAppTemplate | null = null;
    const nextList = list.map((item) => {
      if (item.id === id) {
        updatedTpl = { ...item, active: !item.active };
        return updatedTpl;
      }
      return item;
    });

    this.saveTemplates(nextList);
    this.updateMetricsFromTemplates(nextList);

    return {
      template: updatedTpl || list[0],
      allTemplates: nextList,
    };
  },

  // Salva ou atualiza um template
  upsertTemplate(templateData: Omit<WhatsAppTemplate, 'id'>, existingId?: string): WhatsAppTemplate[] {
    const list = this.getTemplates();
    let nextList: WhatsAppTemplate[];

    const normalizedData = {
      ...templateData,
      content: normalizeVariablesAsterisks(templateData.content),
    };

    if (existingId) {
      nextList = list.map((t) => (t.id === existingId ? { ...normalizedData, id: existingId } : t));
    } else {
      const newTpl: WhatsAppTemplate = {
        ...normalizedData,
        id: `tpl-${Date.now()}`,
      };
      nextList = [newTpl, ...list];
    }

    this.saveTemplates(nextList);
    this.updateMetricsFromTemplates(nextList);
    return nextList;
  },

  // Duplica um template existente
  duplicateTemplate(id: string): WhatsAppTemplate[] {
    const list = this.getTemplates();
    const source = list.find((t) => t.id === id);
    if (!source) return list;

    const copy: WhatsAppTemplate = {
      ...source,
      id: `tpl-${Date.now()}`,
      name: `${source.name} (Cópia)`,
    };

    const nextList = [copy, ...list];
    this.saveTemplates(nextList);
    this.updateMetricsFromTemplates(nextList);
    return nextList;
  },

  // Carrega métricas
  getMetrics(): TemplatesMetrics {
    const list = this.getTemplates();
    const activeCount = list.filter((t) => t.active).length;
    const totalCount = list.length;

    try {
      const stored = localStorage.getItem(METRICS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          activeCount,
          totalCount,
        };
      }
    } catch (e) {
      console.warn('[templateService] Erro ao ler métricas:', e);
    }

    const defaultMetrics: TemplatesMetrics = {
      activeCount,
      totalCount,
      sentToday: 45,
      sentGrowth: 18,
      responseRate: 88.4,
      timeSavedDailyHours: 3.2,
    };
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(defaultMetrics));
    return defaultMetrics;
  },

  updateMetricsFromTemplates(templates: WhatsAppTemplate[]): void {
    const current = this.getMetrics();
    current.activeCount = templates.filter((t) => t.active).length;
    current.totalCount = templates.length;
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(current));
  },

  // Disparo Real de Mensagem via Evolution API
  async dispatchTemplateMessage(
    template: WhatsAppTemplate,
    recipient: {
      name: string;
      phone: string;
      dentist?: string;
      date?: string;
      time?: string;
      procedure?: string;
      dueDate?: string;
      pixKey?: string;
      invoiceUrl?: string;
      calendarUrl?: string;
      giftCoupon?: string;
    }
  ): Promise<{ success: boolean; message: string; response?: any }> {
    // 1. Substitui variáveis
    let parsed = normalizeVariablesAsterisks(template.content);
    const primeName = (recipient.name || '').split(' ')[0] || 'Paciente';

    parsed = parsed.replace(/\{\{nome_paciente\}\}/g, recipient.name || 'Paciente');
    parsed = parsed.replace(/\{\{primeiro_nome\}\}/g, primeName);
    parsed = parsed.replace(/\{\{dentista\}\}/g, recipient.dentist || 'Dr. Frankisney Souza');
    parsed = parsed.replace(/\{\{data_consulta\}\}/g, recipient.date || 'hoje');
    parsed = parsed.replace(/\{\{data\}\}/g, recipient.date || 'hoje');
    parsed = parsed.replace(/\{\{hora\}\}/g, recipient.time || '14:30');
    parsed = parsed.replace(/\{\{procedimento\}\}/g, recipient.procedure || 'Consulta Odontológica');
    parsed = parsed.replace(/\{\{data_vencimento\}\}/g, recipient.dueDate || 'próximo dia útil');
    parsed = parsed.replace(/\{\{chave_pix_clinica\}\}/g, recipient.pixKey || 'financeiro@odontosouzavr.com.br');
    parsed = parsed.replace(/\{\{chave_pix\}\}/g, recipient.pixKey || 'financeiro@odontosouzavr.com.br');
    parsed = parsed.replace(/\{\{link_fatura\}\}/g, recipient.invoiceUrl || 'https://odonto.souza/f/recibo');
    parsed = parsed.replace(/\{\{link_calendario\}\}/g, recipient.calendarUrl || 'https://odonto.souza/c/agenda');
    parsed = parsed.replace(/\{\{cupom_presente\}\}/g, recipient.giftCoupon || 'SORRISO-ESPECIAL');
    parsed = parsed.replace(/\{\{telefone_clinica\}\}/g, '(24) 99876-1122');

    // 2. Dispara via Evolution API
    try {
      const resp = await evolutionApiService.sendTextMessage(recipient.phone, parsed);

      // Incrementa métricas
      const metrics = this.getMetrics();
      metrics.sentToday = (metrics.sentToday || 0) + 1;
      localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));

      // Grava log
      this.logDispatch({
        id: `dsp-${Date.now()}`,
        templateId: template.id,
        templateName: template.name,
        recipientName: recipient.name,
        phone: recipient.phone,
        sentAt: new Date().toISOString(),
        status: 'sent',
        channel: 'evolution_api',
      });

      return {
        success: true,
        message: `Mensagem enviada com sucesso para ${recipient.name} via WhatsApp!`,
        response: resp,
      };
    } catch (err: any) {
      console.error('[templateService.dispatchTemplateMessage] Erro:', err.message);
      return {
        success: false,
        message: `Falha no envio WhatsApp: ${err.message || 'Erro desconhecido na Evolution API'}`,
      };
    }
  },

  logDispatch(log: DispatchLog): void {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      const list: DispatchLog[] = stored ? JSON.parse(stored) : [];
      list.unshift(log);
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
    } catch (e) {
      console.warn('[templateService] Erro ao gravar log:', e);
    }
  },

  getDispatchLogs(): DispatchLog[] {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
