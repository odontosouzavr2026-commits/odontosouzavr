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

interface FinanceiroTableProps {
  transacoes: TransacaoFinanceira[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (transacao: TransacaoFinanceira) => void;
  onDelete: (transacao: TransacaoFinanceira) => void;
  onViewReceipt: (transacao: TransacaoFinanceira) => void;
}

export const FinanceiroTable: React.FC<FinanceiroTableProps> = ({
  transacoes,
  totalCount,
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Pago</span>
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Pendente</span>
          </span>
        );
      case 'atrasado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Atrasado</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-3.5 pl-6 pr-4">
                Data / ID
              </th>
              <th scope="col" className="py-3.5 px-4">
                Descrição / Entidade
              </th>
              <th scope="col" className="py-3.5 px-4">
                Categoria
              </th>
              <th scope="col" className="py-3.5 px-4">
                Tipo
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Valor
              </th>
              <th scope="col" className="py-3.5 px-4 text-center">
                Status
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-6 text-center">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {transacoes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium">Nenhum lançamento financeiro encontrado.</p>
                    <p className="text-xs text-slate-400">Ajuste os filtros de busca, tipo ou mês.</p>
                  </div>
                </td>
              </tr>
            ) : (
              transacoes.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Data / ID */}
                  <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-xs">
                        {item.date}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {item.txCode}
                      </span>
                    </div>
                  </td>

                  {/* Descrição / Entidade */}
                  <td className="py-4 px-4 min-w-[240px]">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-[#005F73] transition-colors leading-tight">
                        {item.entityName}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">
                        {item.entityDetail}
                      </span>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                      {item.category}
                    </span>
                  </td>

                  {/* Tipo */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {item.type === 'receita' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        <span>Receita</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                        <ArrowDownRight className="w-4 h-4 text-rose-600" />
                        <span>Despesa</span>
                      </span>
                    )}
                  </td>

                  {/* Valor */}
                  <td className="py-4 px-4 whitespace-nowrap text-right font-extrabold text-sm tracking-tight">
                    {item.type === 'receita' ? (
                      <span className="text-emerald-700">+ {formatCurrency(item.amount)}</span>
                    ) : (
                      <span className="text-rose-600">- {formatCurrency(item.amount)}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap text-center">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Ações */}
                  <td className="py-4 pl-4 pr-6 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(item)}
                        className="p-1.5 rounded-lg text-blue-600 hover:opacity-80 transition-opacity cursor-pointer"
                        title="Ver Comprovante / Recibo"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-amber-500 hover:opacity-80 transition-opacity cursor-pointer"
                        title="Editar Lançamento"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-rose-600 hover:opacity-80 transition-opacity cursor-pointer"
                        title="Excluir Lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação do Rodapé */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          Mostrando <strong className="text-slate-800">{transacoes.length}</strong> de{' '}
          <strong className="text-slate-800">{totalCount}</strong> lançamentos
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-[#005F73] text-white font-bold flex items-center justify-center">
            {currentPage}
          </div>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
