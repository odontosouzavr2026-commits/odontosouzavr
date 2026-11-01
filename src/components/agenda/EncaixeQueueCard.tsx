import React, { useState } from 'react';
import { Users, ChevronDown, CheckCircle2 } from 'lucide-react';
import { EncaixeQueueItem } from '../../types/agenda';

interface EncaixeQueueCardProps {
  items?: EncaixeQueueItem[];
  selectedDate?: Date;
  onPuxarEncaixe?: (item: EncaixeQueueItem) => void;
  isMobile?: boolean;
}

export const EncaixeQueueCard: React.FC<EncaixeQueueCardProps> = ({
  items = [],
  selectedDate,
  onPuxarEncaixe,
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const isToday = selectedDate
    ? selectedDate.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR')
    : true;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
      {/* Header com toggle retrátil opcional */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between pb-2 border-b border-slate-100 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-[#005F73]">
            <Users className="w-4 h-4 text-[#005F73]" />
          </div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">
              Fila de Encaixe Imediato
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                items.length > 0
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  : 'bg-slate-100 text-slate-500 border border-slate-200/60'
              }`}
            >
              {items.length > 0 ? `${items.length} ${isToday ? 'hoje' : 'no dia'}` : '0 aguardando'}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </div>

      {/* Lista de Encaixes ou Estado Vazio */}
      {isOpen && (
        <div className="pt-1 animate-in fade-in duration-150">
          {items.length === 0 ? (
            <div className="py-5 px-3 text-center space-y-2 rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Sem Encaixes Pendentes</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Nenhum paciente aguardando vaga na recepção. Os horários livres estão disponíveis para novas consultas normais.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/60 transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        item.priority === 'URGENTE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#005F73] transition-colors truncate">
                          {item.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            item.priority === 'URGENTE'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.reason}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onPuxarEncaixe && onPuxarEncaixe(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      item.priority === 'URGENTE'
                        ? 'bg-[#00696c] hover:bg-[#005F73] text-white shadow-2xs'
                        : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                    }`}
                    type="button"
                  >
                    Puxar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
