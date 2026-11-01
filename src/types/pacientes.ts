export type ConvenioTipo = string;

export type PacienteStatus = 'ativo' | 'inativo' | 'primeira_vez' | 'concluido';

export interface PacienteItem {
  id: string;
  code: string; // e.g. "#4891"
  name: string;
  avatarUrl?: string;
  initials: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  age: number;
  gender?: 'feminino' | 'masculino' | 'outro';
  createdAt?: string;
  insurance: ConvenioTipo;
  insuranceLabel: string;
  whatsapp: string;
  email?: string;
  portalEmail?: string;
  portalPassword?: string;
  address?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  allergies?: string;
  clinicalNotes?: string;
  lastConsultation: {
    date: string;
    time?: string;
    dentist?: string;
    procedure?: string;
    isToday?: boolean;
    isScheduled?: boolean;
    description?: string;
  };
  status: PacienteStatus;
  statusLabel: string;
}

export interface PacientesMetrics {
  totalPatients: number;
  totalGrowth: number;
  newThisMonth: number;
  newThisMonthGrowth: number;
  inActiveTreatment: number;
  treatmentPercentage: number;
  birthdaysThisMonth: number;
}
