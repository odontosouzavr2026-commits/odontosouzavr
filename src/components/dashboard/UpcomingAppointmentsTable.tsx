import React, { useState } from 'react';
import { Calendar, Filter, ChevronRight, Clock, Armchair, Search, CheckCircle2 } from 'lucide-react';
import { PatientAppointment, AppointmentStatus } from '../../types/dashboard';

interface UpcomingAppointmentsTableProps {
  appointments: PatientAppointment[];
  onStatusChange?: (id: string, newStatus: AppointmentStatus) => void;
}

export const UpcomingAppointmentsTable: React.FC<UpcomingAppointmentsTableProps> = ({
  appointments,
}) => {
  const [statusFilter, setStatusFilter] = useState<'Todos' | AppointmentStatus>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);

  const getAvatarColor = (initials: string) => {
    const palette = [
      'bg-[#86f0f3] text-[#006e70]',
      'bg-[#b2ebff] text-[#004655]',
      'bg-[#d3e4fe] text-[#0b1c30]',
      'bg-[#89f3f6] text-[#002021]',
      'bg-[#b0efda] text-[#00493a]',
      'bg-amber-100 text-amber-900',
      'bg-purple-100 text-purple-900',
      'bg-emerald-100 text-emerald-900',
      'bg-sky-100 text-sky-900',
      'bg-rose-100 text-rose-900',
    ];
    let sum = 0;
    for (let i = 0; i < initials.length; i++) sum += initials.charCodeAt(i);
    return palette[sum % palette.length];
  };

  const filteredAppointments = (appointments || []).filter((app) => {
    if (!app) return false;
    const matchesStatus = statusFilter === 'Todos' || app.status === statusFilter;
    const nameStr = String(app.name || '');
    const procStr = String(app.procedure || '');
    const chartStr = String(app.chartNumber || '');
    const query = String(searchQuery || '').toLowerCase();

    const matchesSearch =
      nameStr.toLowerCase().includes(query) ||
      procStr.toLowerCase().includes(query) ||
      chartStr.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
      <div>
        {/* Table Header Control */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#005F73] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#005F73]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base text-slate-900 font-semibold leading-tight">
                  Próximos Pacientes do Dia
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#b2ebff] text-[#001f27] font-semibold">
                  {appointments.length} agendados
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fluxo da recepção e consultórios odontológicos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showFilterBar
                  ? 'bg-[#005F73] text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              type="button"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtro</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('Todos');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#005F73]/10 text-[#005F73] hover:bg-[#005F73]/15 transition-colors text-xs font-semibold"
              type="button"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Filter / Search Bar */}
        {showFilterBar && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2.5 items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar paciente ou procedimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
              />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(['Todos', 'Aguardando', 'Confirmado', 'Em Atendimento'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? 'bg-[#005F73] text-white font-medium shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-lg font-semibold">Horário</th>
                <th className="py-3 px-4 font-semibold">Paciente</th>
                <th className="py-3 px-4 font-semibold">Procedimento</th>
                <th className="py-3 px-4 rounded-r-lg font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-sm">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    Nenhum paciente encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Horário */}
                    <td className="py-3.5 px-4 font-semibold text-[#005F73]">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded border border-slate-200/50">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs">{app.time}</span>
                      </div>
                    </td>

                    {/* Paciente */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(app.initials)}`}
                        >
                          {app.initials}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-800 block leading-snug group-hover:text-[#005F73] transition-colors">
                            {app.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            Prontuário {app.chartNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Procedimento */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      {app.procedure}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-right">
                      {app.status === 'Aguardando' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Aguardando
                        </span>
                      )}
                      {app.status === 'Confirmado' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#b0efda] text-[#00493a] text-[11px] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#00696c]"></span>
                          Confirmado
                        </span>
                      )}
                      {app.status === 'Em Atendimento' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                          Em Atendimento
                        </span>
                      )}
                      {app.status === 'Finalizado' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Finalizado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick summary footer inside patient card */}
      <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-4 py-2.5 rounded-lg border border-slate-100 gap-1.5">
        <span className="flex items-center gap-1.5 font-medium">
          <Armchair className="w-4 h-4 text-[#005F73]" />
          Consultório 1 ocupado com Dra. Amanda
        </span>
        <span className="text-[11px] text-[#0A9396] font-semibold">
          Próximo slot vago: 18:30
        </span>
      </div>
    </div>
  );
};
