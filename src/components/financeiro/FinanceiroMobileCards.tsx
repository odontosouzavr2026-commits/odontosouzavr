import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TransacaoFinanceira } from '../../types/financeiro';

interface FinanceiroMobileCardsProps {
  transacoes: TransacaoFinanceira[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (transacao: TransacaoFinanceira) => void;
  onDelete: (transacao: TransacaoFinanceira) => void;
  onViewReceipt: (transacao: TransacaoFinanceira) => void;
}

export const FinanceiroMobileCards: React.FC<FinanceiroMobileCardsProps> = ({
  transacoes,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onViewReceipt,
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getStatusBadge = (status: TransacaoFinanceira['status']) => {
    switch (status) {
      case 'pago':
        return (
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            Pago
          </span>
        );
      case 'pendente':
        return (
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
            Pendente
          </span>
        );
      case 'atrasado':
        return (
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
            Atrasado
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {transacoes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-700">Nenhum lançamento encontrado</p>
          <p className="text-xs text-slate-400 mt-1">Tente ajustar o termo de busca ou filtros.</p>
        </div>
      ) : (
        transacoes.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex flex-col gap-3 transition-transform active:scale-[0.99]"
          >
            {/* Linha Superior: Ícone, Entidade, Descrição e Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    item.type === 'receita'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {item.type === 'receita' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 text-sm leading-tight truncate">
                    {item.entityName}
                  </span>
                  <span className="text-xs text-slate-500 truncate mt-0.5">
                    {item.entityDetail}
                  </span>
                </div>
              </div>

              {getStatusBadge(item.status)}
            </div>

            {/* Linha Inferior: Data/Categoria, Valor e Ações */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.date} • {item.category}
                </span>
                <span
                  className={`text-base font-extrabold tracking-tight mt-0.5 ${
                    item.type === 'receita' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {item.type === 'receita' ? '+' : '-'} {formatCurrency(item.amount)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onViewReceipt(item)}
                  aria-label="Ver Recibo"
                  className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  aria-label="Editar"
                  className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-amber-500" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  aria-label="Excluir"
                  className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Paginação Mobile */}
      <div className="py-2 px-1 flex flex-col gap-2.5 items-center">
        <span className="text-xs text-slate-500 font-medium">
          Mostrando {transacoes.length} de {transacoes.length} lançamentos
        </span>
        <div className="flex items-center justify-center gap-2 w-full max-w-xs">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex-1 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="h-9 px-3.5 rounded-xl bg-[#005F73] text-white text-xs font-bold flex items-center justify-center shadow-2xs">
            {currentPage}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex-1 h-9 rounded-xl bg-white border border-slate-200 text-[#005F73] text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
