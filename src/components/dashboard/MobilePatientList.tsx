import React from 'react';
import { ChevronRight, Armchair } from 'lucide-react';
import { PatientAppointment, AppointmentStatus } from '../../types/dashboard';

interface MobilePatientListProps {
  appointments: PatientAppointment[];
  onStatusChange?: (id: string, newStatus: AppointmentStatus) => void;
  onViewAll?: () => void;
}

export const MobilePatientList: React.FC<MobilePatientListProps> = ({
  appointments,
  onStatusChange,
  onViewAll,
}) => {
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

  const nextStatusMap: Record<AppointmentStatus, AppointmentStatus> = {
    Aguardando: 'Confirmado',
    Confirmado: 'Em Atendimento',
    'Em Atendimento': 'Finalizado',
    Finalizado: 'Aguardando',
    Cancelado: 'Aguardando',
  };

  return (
    <section className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-slate-900">
            Próximos Pacientes
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
            {appointments.length} agendados
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="text-[#00696c] text-xs font-semibold flex items-center hover:underline cursor-pointer"
        >
          <span>Ver todos</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* Lista de Pacientes em Cards */}
      <div className="flex flex-col space-y-2">
        {appointments.map((app) => (
          <div
            key={app.id}
            onClick={() => onStatusChange && onStatusChange(app.id, nextStatusMap[app.status])}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 flex items-center justify-between gap-2 transition-all active:scale-[0.99] cursor-pointer"
            title="Toque para alterar status"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${getAvatarColor(app.initials)}`}
              >
                {app.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {app.name}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {app.chartNumber}
                  </span>
                </div>
                <span className="text-xs text-slate-500 truncate">
                  {app.procedure}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 gap-1">
              <span className="text-xs font-bold text-slate-900">{app.time}</span>
              {app.status === 'Aguardando' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#86f0f3]/40 text-[#00696c] text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00696c]"></span>
                  Aguardando
                </span>
              )}
              {app.status === 'Confirmado' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#b0efda] text-[#00493a] text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00493a]"></span>
                  Confirmado
                </span>
              )}
              {app.status === 'Em Atendimento' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
                  Em Atend.
                </span>
              )}
              {app.status === 'Finalizado' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                  Finalizado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Status do consultório rodapé */}
      <div className="p-2.5 rounded-lg bg-slate-100/80 text-slate-600 flex items-center gap-2 text-xs">
        <Armchair className="w-4 h-4 text-[#00696c] shrink-0" />
        <span className="leading-tight">
          <strong>Consultório 1</strong> ocupado com Dra. Amanda • Próximo slot vago às <strong>18:30</strong>
        </span>
      </div>
    </section>
  );
};
