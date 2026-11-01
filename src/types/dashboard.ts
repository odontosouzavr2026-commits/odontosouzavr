export type AppointmentStatus = 'Aguardando' | 'Confirmado' | 'Em Atendimento' | 'Finalizado' | 'Cancelado';

export interface PatientAppointment {
  id: string;
  time: string;
  name: string;
  initials: string;
  chartNumber: string;
  procedure: string;
  status: AppointmentStatus;
  room?: string;
  dentist?: string;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  comparisonText: string;
  badgeText?: string;
  badgeType?: 'trend-up' | 'live' | 'pill' | 'alert' | 'metric';
  icon: string;
  iconBgColor: string;
  iconColor: string;
  textColor?: string;
  highlightColor?: string;
}

export type TimeFilter = 'Diário' | 'Semanal' | 'Mensal';

export interface VolumeDataPoint {
  label: string;
  realized: number;
  newPatients: number;
  total: number;
}

export interface FinancialDataPoint {
  label: string;
  amount: number;
  formatted: string;
  isCurrent?: boolean;
  isProjected?: boolean;
}
