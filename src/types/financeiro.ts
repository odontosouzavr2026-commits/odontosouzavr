export type TransacaoTipo = 'receita' | 'despesa';

export type TransacaoStatus = 'pago' | 'pendente' | 'atrasado';

export interface TransacaoFinanceira {
  id: string;
  txCode: string; // e.g. "TX-1092"
  date: string;
  dueDate: string;
  competence: string;
  type: TransacaoTipo;
  entityName: string;
  entityDetail: string;
  category: string;
  amount: number;
  status: TransacaoStatus;
  paymentMethod?: string;
  dentist?: string;
  unit?: string;
  effectiveDate?: string;
  receiptFile?: string;
  notes?: string;
}

export interface FinanceiroMetrics {
  monthlyRevenue: number;
  revenueGrowth: number;
  monthlyExpenses: number;
  expenseBudgetPercentage: number;
  toReceive: number;
  pendingInstallments: number;
  operatingBalance: number;
}
