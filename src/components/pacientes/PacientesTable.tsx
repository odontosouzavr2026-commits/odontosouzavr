import React from 'react';
import {
  ClipboardList,
  Pencil,
  Wallet,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { PacienteItem, ConvenioTipo } from '../../types/pacientes';
import { calculateAge } from '../../utils/dateUtils';

interface PacientesTableProps {
  pacientes: PacienteItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
  onEdit: (paciente: PacienteItem) => void;
  onOpenProntuario: (paciente: PacienteItem) => void;
  onOpenFinanceiro: (paciente: PacienteItem) => void;
  onDelete?: (paciente: PacienteItem) => void;
}

export const PacientesTable: React.FC<PacientesTableProps> = ({
  pacientes,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPageChange,
  onEdit,
  onOpenProntuario,
  onOpenFinanceiro,
  onDelete,
}) => {
  const getInsuranceBadgeClass = (insurance: string) => {
    const lower = (insurance || '').toLowerCase();
    if (lower.includes('casa') || lower.includes('particular')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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
    if (lower.includes('sulamerica')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-3.5 pl-6 pr-4">
                Paciente
              </th>
              <th scope="col" className="py-3.5 px-4">
                Contato
              </th>
              <th scope="col" className="py-3.5 px-4">
                Convênio
              </th>
              <th scope="col" className="py-3.5 px-4">
                Última Consulta
              </th>
              <th scope="col" className="py-3.5 px-4 text-center">
                Status
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-6 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {pacientes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium">Nenhum paciente encontrado com os filtros selecionados.</p>
                    <p className="text-xs text-slate-400">Tente buscar por outro termo ou limpar os filtros.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pacientes.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors group ${
                    item.status === 'inativo' ? 'bg-slate-50/30 opacity-75' : ''
                  }`}
                >
                  {/* Paciente */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
                            {item.initials}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                            item.status === 'ativo'
                              ? 'bg-emerald-500'
                              : item.status === 'primeira_vez'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 group-hover:text-[#005F73] transition-colors truncate">
                            {item.name}
                          </span>
                          {item.status === 'primeira_vez' ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              1ª Vez
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-[#005F73] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              {item.code}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          CPF: {item.cpf} {item.rg ? `• RG: ${item.rg}` : ''} •{' '}
                          <span className="font-medium text-slate-600">
                            {item.birthDate ? calculateAge(item.birthDate) : item.age} anos
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contato */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="flex items-center text-xs font-medium text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                        <span>{item.whatsapp}</span>
                      </div>
                      {item.email && (
                        <div className="flex items-center text-xs text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                          <span className="truncate max-w-[170px]">{item.email}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Convênio */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getInsuranceBadgeClass(
                        item.insurance
                      )}`}
                    >
                      {item.insuranceLabel}
                    </span>
                  </td>

                  {/* Última Consulta */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div>
                      {item.lastConsultation.date === 'Sem consultas' ? (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Sem consultas
                        </span>
                      ) : item.lastConsultation.isScheduled ? (
                        <span className="text-xs font-bold text-amber-700">
                          {item.lastConsultation.date}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-800">
                          {item.lastConsultation.date}
                        </span>
                      )}
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.lastConsultation.description ||
                          (item.lastConsultation.time
                            ? `${item.lastConsultation.time} (${item.lastConsultation.dentist || 'Dr. Frankisney Souza'})`
                            : item.lastConsultation.procedure)}
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap text-center">
                    {item.status === 'ativo' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Ativo</span>
                      </span>
                    ) : item.status === 'primeira_vez' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>1ª Vez</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Inativo</span>
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-4 pl-4 pr-6 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenProntuario(item)}
                        className="p-2 text-blue-600 hover:opacity-80 transition-opacity rounded-lg cursor-pointer"
                        title="Abrir Prontuário Clínico / Atendimento"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-2 text-amber-500 hover:opacity-80 transition-opacity rounded-lg cursor-pointer"
                        title="Editar Dados do Paciente"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenFinanceiro(item)}
                        className="p-2 text-emerald-600 hover:opacity-80 transition-opacity rounded-lg cursor-pointer"
                        title="Histórico Financeiro"
                      >
                        <Wallet className="w-4 h-4" />
                      </button>

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="p-2 text-rose-600 hover:opacity-80 transition-opacity rounded-lg cursor-pointer"
                          title="Excluir Paciente (Cascata)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <p>
            Mostrando{' '}
            <span className="font-semibold text-slate-700">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            a{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-slate-700">{totalCount.toLocaleString('pt-BR')}</span>{' '}
            pacientes
          </p>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Exibir:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              {[15, 30, 50, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    pageSize === size
                      ? 'bg-[#005F73] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <span className="text-slate-400">por vez</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 7) return true;
              return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
            })
            .reduce<(number | string)[]>((acc, p, idx, arr) => {
              if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                acc.push('...');
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-1 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p as number)}
                  className={`w-7 h-7 rounded-lg font-semibold flex items-center justify-center cursor-pointer transition-all ${
                    currentPage === p
                      ? 'border border-[#005F73] bg-[#005F73] text-white shadow-2xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-medium"
          >
            <span>Próximo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
