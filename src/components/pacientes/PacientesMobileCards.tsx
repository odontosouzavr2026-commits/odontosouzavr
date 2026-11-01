import React from 'react';
import {
  Calendar,
  Phone,
  MessageSquare,
  ClipboardList,
  Edit2,
  BellRing,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PacienteItem, ConvenioTipo } from '../../types/pacientes';
import { calculateAge } from '../../utils/dateUtils';

interface PacientesMobileCardsProps {
  pacientes: PacienteItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
  onEdit: (paciente: PacienteItem) => void;
  onOpenProntuario: (paciente: PacienteItem) => void;
  onCallReception?: (paciente: PacienteItem) => void;
  onInviteReturn?: (paciente: PacienteItem) => void;
}

export const PacientesMobileCards: React.FC<PacientesMobileCardsProps> = ({
  pacientes,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPageChange,
  onEdit,
  onOpenProntuario,
  onCallReception,
  onInviteReturn,
}) => {
  const getInsuranceBadgeClass = (insurance: string) => {
    const lower = (insurance || '').toLowerCase();
    if (lower.includes('casa') || lower.includes('particular')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (lower.includes('bradesco')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (lower.includes('uniodonto') || lower.includes('unimed')) {
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    }
    if (lower.includes('amil')) {
      return 'bg-teal-50 text-teal-800 border-teal-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-3">
      {pacientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-700">Nenhum paciente encontrado</p>
          <p className="text-xs text-slate-400 mt-1">Tente remover os filtros ou buscar por outro termo.</p>
        </div>
      ) : (
        pacientes.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 transition-transform active:scale-[0.99] ${
              item.status === 'inativo' ? 'opacity-85' : ''
            }`}
          >
            {/* Header: Avatar, Name, Code, Age, Insurance */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover shadow-2xs ring-2 ring-emerald-500/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-sm ring-2 ring-slate-100">
                      {item.initials}
                    </div>
                  )}
                  <span
                    className={`w-3.5 h-3.5 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-white ${
                      item.status === 'ativo'
                        ? 'bg-emerald-500'
                        : item.status === 'primeira_vez'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                      {item.name}
                    </span>
                    {item.status === 'primeira_vez' && (
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[10px] leading-tight font-extrabold border border-amber-200">
                        1ª VEZ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5 flex-wrap">
                    <span className="font-semibold text-slate-600">{item.code}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">
                      {item.birthDate ? calculateAge(item.birthDate) : item.age} anos
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{item.cpf}</span>
                    {item.rg && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[11px]">RG: {item.rg}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getInsuranceBadgeClass(
                  item.insurance
                )}`}
              >
                {item.insuranceLabel}
              </span>
            </div>

            {/* Informações de Consulta Recente / Agendada */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#005F73]" />
                  <span>
                    {item.lastConsultation.date === 'Sem consultas'
                      ? 'Histórico'
                      : item.lastConsultation.isScheduled
                      ? 'Agendada'
                      : 'Última consulta'}
                  </span>
                </span>
                <span className="font-semibold text-slate-800">
                  {item.lastConsultation.date}
                </span>
              </div>

              {item.lastConsultation.description && (
                <div className="text-[11px] text-slate-500">
                  {item.lastConsultation.description}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Telefone</span>
                </span>
                <span className="font-medium text-slate-700">{item.whatsapp}</span>
              </div>

              {item.allergies && (
                <div className="mt-1 pt-1 border-t border-slate-200/60 text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="truncate">Alergia: {item.allergies}</span>
                </div>
              )}
            </div>

            {/* Ações Mobile */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                {/* Se Helena/1ª Vez -> Chamar Recepção */}
                {item.status === 'primeira_vez' ? (
                  <button
                    type="button"
                    onClick={() => onCallReception && onCallReception(item)}
                    className="h-9 px-3 rounded-xl bg-[#0A9396] hover:bg-[#005F73] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Chamar Recepção</span>
                  </button>
                ) : item.status === 'inativo' ? (
                  <button
                    type="button"
                    onClick={() => onInviteReturn && onInviteReturn(item)}
                    className="h-9 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#005F73] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Convidar Retorno</span>
                  </button>
                ) : (
                  <a
                    href={`https://wa.me/55${item.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onOpenProntuario(item)}
                  className="h-9 px-3 rounded-xl bg-blue-50 text-blue-600 hover:opacity-80 text-xs font-semibold flex items-center gap-1.5 transition-opacity cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                  <span>Prontuário</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onEdit(item)}
                aria-label={`Editar ${item.name}`}
                className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 hover:opacity-80 flex items-center justify-center transition-opacity shrink-0 cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Paginação Mobile */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando{' '}
            <strong className="text-slate-800">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>
            -
            <strong className="text-slate-800">
              {Math.min(currentPage * pageSize, totalCount)}
            </strong>{' '}
            de <strong className="text-slate-800">{totalCount}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Ver:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {[15, 30, 50, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    pageSize === size
                      ? 'bg-[#005F73] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Página <strong className="text-slate-800">{currentPage}</strong> de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 px-3 rounded-lg bg-[#005F73] text-white font-semibold shadow-2xs hover:bg-[#004f60] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Próximo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
