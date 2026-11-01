export type ProcedimentoCategoria =
  | 'prevencao'
  | 'dentistica'
  | 'cirurgia'
  | 'estetica'
  | 'endodontia'
  | 'implantodontia'
  | 'ortodontia'
  | 'protese'
  | 'odontopediatria';

export interface ProcedimentoItem {
  id: string;
  code: string;
  name: string;
  category: ProcedimentoCategoria;
  categoryLabel: string;
  description: string;
  durationMinutes: number;
  price: number;
  active: boolean;
  showInOdontogram?: boolean;
  syncWithDrSouza?: boolean;
}

export interface ProcedimentosMetrics {
  totalActive: number;
  newThisMonth: number;
  mostPerformedName: string;
  mostPerformedPercentage: number;
  mostPerformedSessions: number;
  ticketMedio: number;
  ticketMedioGrowth: number;
  activeSpecialtiesCount: number;
}
