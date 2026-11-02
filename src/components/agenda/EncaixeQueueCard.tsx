import React, { useState } from 'react';
import { Users, ChevronDown, CheckCircle2, AlertTriangle, Plus, Clock, Sparkles } from 'lucide-react';
import { EncaixeQueueItem } from '../../types/agenda';

interface EncaixeQueueCardProps {
  items?: EncaixeQueueItem[];
  selectedDate?: Date;
  onPuxarEncaixe?: (item: EncaixeQueueItem) => void;
  onAdicionarEncaixe?: () => void;
  isMobile?: boolean;
}

export const EncaixeQueueCard: React.FC<EncaixeQueueCardProps> = ({
  items = [],
  selectedDate,
  onPuxarEncaixe,
  onAdicionarEncaixe,
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const isToday = selectedDate
    ? selectedDate.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR')
    : true;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
      {/* Header com toggle retrátil e botão de adicionar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-[#005F73] shrink-0">
            <Users className="w-4 h-4 text-[#005F73]" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
              Fila de Encaixe
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 ${
                items.length > 0
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse'
                  : 'bg-slate-100 text-slate-500 border border-slate-200/60'
              }`}
            >
              {items.length > 0 ? `${items.length} ${isToday ? 'hoje' : 'no dia'}` : '0 aguardando'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onAdicionarEncaixe && (
            <button
              onClick={onAdicionarEncaixe}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#005F73] hover:bg-[#004655] text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
              title="Adicionar paciente à Fila de Encaixe"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            aria-label="Alternar exibição da fila"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Conteúdo Retrátil */}
      {isOpen && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          {/* ALERTA VISUAL OBRIGATÓRIO DE ENCAIXE */}
          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-[11px] leading-relaxed flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <span>Alerta Clínico: Sobreaviso de Encaixe</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-200/80 text-amber-900 font-bold uppercase">
                  Regra
                </span>
              </p>
              <p className="text-amber-800 text-[11px]">
                A Fila de Encaixe é uma reserva prioritária para quando a agenda estiver cheia. <strong>Não é garantia de atendimento em horário pré-fixado</strong>, dependendo de cancelamentos ou intervalos na clínica.
              </p>
              <div className="flex items-center gap-1 text-[10px] text-teal-800 font-semibold pt-0.5">
                <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
                <span>Havendo desistência, o 1º da fila é alocado e notificado no WhatsApp na hora.</span>
              </div>
            </div>
          </div>

          {/* Lista de Encaixes ou Estado Vazio */}
          {items.length === 0 ? (
            <div className="py-5 px-3 text-center space-y-2.5 rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Sem Encaixes Pendentes</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 max-w-xs mx-auto">
                  Nenhum paciente na fila de sobreaviso para esta data. Os horários regulares estão livres ou operando normalmente.
                </p>
              </div>

              {onAdicionarEncaixe && (
                <button
                  onClick={onAdicionarEncaixe}
                  type="button"
                  className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-teal-300 text-[#005F73] hover:bg-teal-50 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Colocar Paciente no Encaixe</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/70 transition-all flex items-center justify-between gap-2.5 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Badge da Posição na Fila */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center mb-0.5">
                        #{index + 1}
                      </span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        item.priority === 'URGENTE'
                          ? 'bg-rose-100 text-rose-700'
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
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
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
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.waitTime}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onPuxarEncaixe && onPuxarEncaixe(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs ${
                      item.priority === 'URGENTE'
                        ? 'bg-[#00696c] hover:bg-[#005F73] text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                    type="button"
                    title={`Alocar ${item.name} para um horário agora`}
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
