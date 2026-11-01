export type TemplateCategoria =
  | 'agendamentos'
  | 'financeiro'
  | 'pos_op'
  | 'recalls'
  | 'relacionamento';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: TemplateCategoria;
  categoryLabel: string;
  triggerDescription: string;
  triggerTiming: string;
  active: boolean;
  content: string;
  readRate: number; // e.g. 96 (%)
  responseRate?: number; // e.g. 89 (%)
  extraMetricLabel?: string; // e.g. "Pontualidade" or "Conversão"
  extraMetricValue?: string; // e.g. "+24%" or "41.8%"
  secondaryMetricLabel?: string;
  secondaryMetricValue?: string;
  approvedMeta: boolean;
}

export interface TemplatesMetrics {
  activeCount: number;
  totalCount: number;
  sentToday: number;
  sentGrowth: number;
  responseRate: number;
  timeSavedDailyHours: number;
}
