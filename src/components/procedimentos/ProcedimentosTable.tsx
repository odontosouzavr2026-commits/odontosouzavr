import React from 'react';
import {
  Clock,
  Edit2,
  Trash2,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { ProcedimentoItem, ProcedimentoCategoria } from '../../types/procedimentos';

interface ProcedimentosTableProps {
  procedimentos: ProcedimentoItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (procedimento: ProcedimentoItem) => void;
  onToggleStatus: (procedimento: ProcedimentoItem) => void;
  onOpenNew: () => void;
}

export const ProcedimentosTable: React.FC<ProcedimentosTableProps> = ({
  procedimentos,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onToggleStatus,
  onOpenNew,
}) => {
  const getCategoryBadgeClass = (category: ProcedimentoCategoria) => {
    switch (category) {
      case 'prevencao':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'dentistica':
        return 'bg-teal-50 text-teal-700 border-teal-200/80';
      case 'cirurgia':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'estetica':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'endodontia':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'implantodontia':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300/80';
      case 'ortodontia':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'protese':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'odontopediatria':
        return 'bg-pink-50 text-pink-700 border-pink-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      {/* Tabela Desktop */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3.5 pl-6 pr-3">
                Código
              </th>
              <th scope="col" className="py-3.5 px-3">
                Categoria
              </th>
              <th scope="col" className="py-3.5 px-3">
                Nome do Procedimento
              </th>
              <th scope="col" className="py-3.5 px-3">
                Duração Média
              </th>
              <th scope="col" className="py-3.5 px-3 text-right">
                Valor (R$)
              </th>
              <th scope="col" className="py-3.5 px-4 text-center">
                Status
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {procedimentos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-semibold text-slate-600">Nenhum procedimento cadastrado no momento.</p>
                    <p className="text-xs text-slate-400">Clique em "Novo Procedimento" para cadastrar diretamente no banco de dados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              procedimentos.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors group ${
                    !item.active ? 'bg-slate-50/40 opacity-80' : ''
                  }`}
                >
                  {/* Código */}
                  <td className="py-4 pl-6 pr-3 font-mono text-xs font-semibold text-slate-500">
                    {item.code}
                  </td>

                  {/* Categoria */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeClass(
                        item.category
                      )}`}
                    >
                      {item.categoryLabel}
                    </span>
                  </td>

                  {/* Nome & Descrição */}
                  <td className="py-4 px-3 max-w-xs">
                    <div className="font-semibold text-slate-900 group-hover:text-[#005F73] transition-colors leading-snug">
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="text-xs text-slate-400 truncate mt-0.5 max-w-sm" title={item.description}>
                        {item.description}
                      </div>
                    )}
                  </td>

                  {/* Duração Média */}
                  <td className="py-4 px-3 whitespace-nowrap text-slate-600 text-xs font-medium">
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.durationMinutes} min</span>
                    </span>
                  </td>

                  {/* Valor (R$) */}
                  <td className="py-4 px-3 whitespace-nowrap text-right font-bold text-slate-900">
                    {item.price === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                        Grátis
                      </span>
                    ) : (
                      formatPrice(item.price)
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap text-center">
                    {item.active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Ativo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span>Inativo</span>
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-4 pl-3 pr-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-amber-500 hover:opacity-80 transition-opacity cursor-pointer"
                        title="Editar Procedimento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(item)}
                        className={`p-1.5 rounded-lg hover:opacity-80 transition-opacity cursor-pointer ${
                          item.active
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                        title={item.active ? 'Inativar Procedimento' : 'Reativar Procedimento'}
                      >
                        {item.active ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé com Paginação e Botão Central de Novo Procedimento */}
      <div className="border-t border-slate-100 bg-white px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Info */}
        <div className="text-xs text-slate-500">
          Mostrando <span className="font-semibold text-slate-700">{procedimentos.length > 0 ? 1 : 0}</span> a{' '}
          <span className="font-semibold text-slate-700">{Math.min(procedimentos.length, 6)}</span> de{' '}
          <span className="font-semibold text-slate-700">{totalCount}</span> procedimentos
        </div>

        {/* Botão Central Rápido */}
        <button
          type="button"
          onClick={onOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#005F73] hover:bg-[#004e5e] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Procedimento</span>
        </button>

        {/* Paginação */}
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={() => onPageChange(1)}
            className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center cursor-pointer ${
              currentPage === 1
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1
          </button>

          <button
            type="button"
            onClick={() => onPageChange(2)}
            className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center cursor-pointer ${
              currentPage === 2
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2
          </button>

          <button
            type="button"
            onClick={() => onPageChange(3)}
            className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center cursor-pointer ${
              currentPage === 3
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3
          </button>

          <span className="px-1 text-slate-400">...</span>

          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center cursor-pointer ${
              currentPage === totalPages
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {totalPages}
          </button>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};
