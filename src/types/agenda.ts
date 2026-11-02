export type AppointmentScheduleStatus =
  | 'Concluído'
  | 'Em Atendimento'
  | 'Confirmado'
  | 'Desmarcou'
  | 'Bloqueado'
  | 'Disponível'
  | 'Encaixe de Urgência'
  | 'Em Espera'
  | string;

export interface AgendaAppointmentItem {
  id: string;
  pacienteId?: string;
  procedimentoId?: string;
  dentistaId?: string;
  date?: string; // Formato YYYY-MM-DD
  time: string;
  endTime?: string;
  duration: string;
  patientName: string;
  phone?: string;
  cpf?: string;
  procedure: string;
  insurance?: string;
  status: AppointmentScheduleStatus;
  isFirstVisit?: boolean;
  whatsappConfirmed?: boolean;
  isVip?: boolean;
  isSurgery?: boolean;
  isEncaixe?: boolean;
  cancellationNotice?: string;
  notes?: string;
  actionButtonLabel?: string;
  createdAt?: string;
}

export interface EncaixeQueueItem {
  id: string;
  name: string;
  initials: string;
  priority: 'URGENTE' | 'ROTINA';
  reason: string;
  waitTime?: string;
}

export interface AgendaMetricsData {
  scheduled: number;
  completed: number;
  inChair: number;
  cancelled: number;
  encaixes: number;
}
