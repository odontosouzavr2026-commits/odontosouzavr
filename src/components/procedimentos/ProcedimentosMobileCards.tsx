import React from 'react';
import {
  Clock,
  Edit2,
  Trash2,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ProcedimentoItem, ProcedimentoCategoria } from '../../types/procedimentos';

interface ProcedimentosMobileCardsProps {
  procedimentos: ProcedimentoItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (procedimento: ProcedimentoItem) => void;
  onToggleStatus: (procedimento: ProcedimentoItem) => void;
  onOpenNew: () => void;
}

export const ProcedimentosMobileCards: React.FC<ProcedimentosMobileCardsProps> = ({
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
    <div className="space-y-3">
      {procedimentos.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-700">Nenhum procedimento cadastrado no momento</p>
          <p className="text-xs text-slate-400 mt-1">Toque no botão abaixo para cadastrar diretamente no banco de dados.</p>
        </div>
      ) : (
        procedimentos.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all ${
              !item.active ? 'bg-slate-50/60 opacity-85' : ''
            }`}
          >
            {/* Top Row: Code, Category, Status */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  #{item.code}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getCategoryBadgeClass(
                    item.category
                  )}`}
                >
                  {item.categoryLabel}
                </span>
              </div>

              {item.active ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ativo</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Inativo</span>
                </span>
              )}
            </div>

            {/* Name and Description */}
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Price & Duration */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {item.price === 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Grátis
                  </span>
                ) : (
                  <span className="text-base font-extrabold text-[#005F73]">
                    {formatPrice(item.price)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{item.durationMinutes} min</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-500 bg-amber-50 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleStatus(item)}
                  className={`p-1.5 rounded-lg hover:opacity-80 transition-opacity cursor-pointer ${
                    item.active
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-emerald-600 bg-emerald-50'
                  }`}
                  title={item.active ? 'Inativar' : 'Reativar'}
                >
                  {item.active ? (
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Mobile Pagination */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Anterior</span>
        </button>

        <span className="text-slate-600 font-medium">
          Pág. <strong className="text-slate-900">{currentPage}</strong> de {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Próxima</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating or Mobile Bottom Action */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onOpenNew}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#005F73] text-white font-bold text-sm shadow-md shadow-[#005F73]/20 hover:bg-[#004e5e] transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Procedimento</span>
        </button>
      </div>
    </div>
  );
};
