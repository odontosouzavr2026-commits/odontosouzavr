import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';
import { SessionProcedure } from '../../types/clinical';

interface SessionProceduresCardProps {
  procedures: SessionProcedure[];
  onAddProcedure: (newProc: SessionProcedure) => void;
  onRemoveProcedure: (id: string) => void;
}

export const SessionProceduresCard: React.FC<SessionProceduresCardProps> = ({
  procedures,
  onAddProcedure,
  onRemoveProcedure,
}) => {
  const [searchProcedure, setSearchProcedure] = useState('');
  const [selectedTooth, setSelectedTooth] = useState('Dente 26 (Atual)');

  const handleQuickInsert = () => {
    if (!searchProcedure.trim()) return;

    const newProc: SessionProcedure = {
      id: Math.random().toString(),
      code: `#8100${Math.floor(10 + Math.random() * 89)}`,
      tooth: selectedTooth.replace(' (Atual)', ''),
      name: searchProcedure,
      description: 'Procedimento registrado em sessão clínica',
      dentist: 'Dr. Frankisney Souza',
      price: 180,
      status: 'Em andamento',
    };

    onAddProcedure(newProc);
    setSearchProcedure('');
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 sm:p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#005F73]/10 flex items-center justify-center text-[#005F73] shrink-0">
            <Stethoscope className="w-5 h-5 text-[#005F73]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Procedimentos da Sessão
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lançamento de procedimentos executados hoje para cobrança e prontuário
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSearchProcedure('Aplicação Tópica de Flúor');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#005F73] text-white hover:bg-[#004655] transition-colors text-xs font-semibold shadow-xs cursor-pointer"
          type="button"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Procedimento</span>
        </button>
      </div>

      {/* Tabela de Procedimentos (Desktop) */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-100 bg-slate-50/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-4">Código / Dente</th>
              <th className="py-2.5 px-4">Procedimento</th>
              <th className="py-2.5 px-4">Profissional</th>
              <th className="py-2.5 px-4 text-right">Valor Tabela</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 text-sm">
            {procedures.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-slate-400 text-xs font-medium">
                  Nenhum procedimento registrado nesta sessão clínica até o momento.
                </td>
              </tr>
            ) : (
              procedures.map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#005F73]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-xs font-bold">
                        {proc.tooth}
                      </span>
                      <span className="text-slate-400 text-xs">{proc.code}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{proc.name}</div>
                    <div className="text-xs text-slate-500">{proc.description}</div>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-700">
                    {proc.dentist}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                    R$ {proc.price.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {proc.status === 'Executado' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#95d3be]/40 text-[#00493a] text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00493a]" />
                        Executado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#86f0f3]/40 text-[#006e70] text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00696c]" />
                        Em andamento
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onRemoveProcedure(proc.id)}
                      className="p-1 rounded text-rose-600 hover:opacity-80 transition-opacity cursor-pointer"
                      title="Remover"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards de Procedimentos (Mobile) */}
      <div className="sm:hidden flex flex-col gap-2">
        {procedures.length === 0 ? (
          <div className="py-6 px-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200 font-medium">
            Nenhum procedimento registrado nesta sessão clínica até o momento.
          </div>
        ) : (
          procedures.map((proc) => (
            <div key={proc.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#005F73] text-white text-[10px] font-bold">
                      {proc.tooth}
                    </span>
                    <span className="text-[11px] text-slate-400">{proc.code}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">{proc.name}</p>
                  <p className="text-[11px] text-slate-500">{proc.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#005F73] block">
                    R$ {proc.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#95d3be]/40 text-[#00493a] text-[10px] font-semibold mt-1">
                    {proc.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Seletor Rápido de Novo Procedimento Inline */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col md:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={searchProcedure}
            onChange={(e) => setSearchProcedure(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickInsert()}
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005F73]"
            placeholder="Buscar código ou nome do procedimento (ex: Extração, Coroa, Raspagem)..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedTooth}
            onChange={(e) => setSelectedTooth(e.target.value)}
            className="h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005F73]"
          >
            <option>Dente 26 (Atual)</option>
            <option>Dente 17</option>
            <option>Arcada Geral</option>
            <option>Dente 36</option>
            <option>Dente 46</option>
          </select>
          <button
            onClick={handleQuickInsert}
            className="h-10 px-4 rounded-lg bg-[#00696c] hover:bg-[#005F73] text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs cursor-pointer flex items-center gap-1"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Inserir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
