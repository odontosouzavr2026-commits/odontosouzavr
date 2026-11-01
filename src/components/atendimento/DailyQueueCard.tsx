import React from 'react';
import { Users, Zap } from 'lucide-react';
import { QueuePatient } from '../../types/clinical';

interface DailyQueueCardProps {
  queuePatients?: QueuePatient[];
  activePatientId?: string;
  onSelectQueuePatient?: (patient: QueuePatient) => void;
  onViewSchedule?: () => void;
}

export const DailyQueueCard: React.FC<DailyQueueCardProps> = ({
  queuePatients = [],
  activePatientId,
  onSelectQueuePatient,
  onViewSchedule,
}) => {
  const displayQueue = queuePatients;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#005F73]/10 flex items-center justify-center text-[#005F73]">
            <Users className="w-4 h-4 text-[#005F73]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Fila do Dia
            </h2>
            <span className="text-[11px] text-slate-400">
              {displayQueue.length} {displayQueue.length === 1 ? 'paciente' : 'pacientes'} na lista
            </span>
          </div>
        </div>

        {onViewSchedule && (
          <button
            onClick={onViewSchedule}
            className="text-[#0A9396] hover:text-[#005F73] text-xs font-semibold hover:underline cursor-pointer"
            type="button"
          >
            Ver Agenda
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {displayQueue.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            Nenhum paciente aguardando na fila hoje.
          </div>
        ) : (
          displayQueue.map((p) => {
            const isCurrent = p.id === activePatientId || p.status === 'Na Cadeira';
            return (
              <div
                key={p.id}
                onClick={() => onSelectQueuePatient && onSelectQueuePatient(p)}
                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#86f0f3]/25 border border-[#0A9396]/40 shadow-xs'
                    : p.isEncaixe
                    ? 'bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/90 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-1.5 h-9 rounded-full shrink-0 ${
                      isCurrent
                        ? 'bg-[#0A9396]'
                        : p.isEncaixe
                        ? 'bg-amber-500'
                        : p.status === 'Na Recepção'
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                          isCurrent ? 'text-slate-900' : 'text-slate-800'
                        }`}
                      >
                        {p.name}
                      </span>
                      {p.isEncaixe && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-2xs shrink-0">
                          <Zap className="w-2.5 h-2.5 fill-white" />
                          <span>Encaixe</span>
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium truncate mt-0.5 ${
                        isCurrent
                          ? 'text-[#00696c]'
                          : p.isEncaixe
                          ? 'text-amber-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {p.time} • {p.procedure}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 ml-2">
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-[#00696c] text-white text-[10px] font-bold">
                      Na Cadeira
                    </span>
                  )}
                  {!isCurrent && p.status === 'Na Recepção' && (
                    <>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Na Recepção
                      </span>
                      {p.arrivalTime && (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {p.arrivalTime}
                        </span>
                      )}
                    </>
                  )}
                  {!isCurrent && p.status === 'A caminho' && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-medium">
                      A caminho
                    </span>
                  )}
                  {!isCurrent && p.status === 'Confirmado' && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-medium">
                      Confirmado
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
