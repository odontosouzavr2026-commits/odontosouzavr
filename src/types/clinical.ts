export type ToothCondition =
  | 'higido'
  | 'restaurado'
  | 'carie'
  | 'canal'
  | 'ausente'
  | 'protese'
  | 'hoje';

export interface ToothData {
  id: number;
  quadrant: 1 | 2 | 3 | 4;
  arcada: 'superior' | 'inferior';
  condition: ToothCondition;
  note?: string;
  name: string;
}

export interface SessionProcedure {
  id: string;
  code: string;
  tooth: string;
  name: string;
  description: string;
  dentist: string;
  price: number;
  status: 'Executado' | 'Em andamento';
}

export interface QueuePatient {
  id: string;
  name: string;
  time: string;
  procedure: string;
  status: 'Na Cadeira' | 'Na Recepção' | 'A caminho' | 'Confirmado';
  arrivalTime?: string;
  avatarUrl?: string;
  initials?: string;
  isEncaixe?: boolean;
}

export interface MedicalAlert {
  type: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
}

export interface ActivePatientInfo {
  id: string;
  name: string;
  prontuario: string;
  cpf: string;
  age: number;
  birthDate: string;
  insurance: string;
  lastVisit: string;
  doctor: string;
  photoUrl: string;
  alerts: MedicalAlert[];
  allergies?: string;
  clinicalNotes?: string;
  isEncaixe?: boolean;
}
