import React, { useState } from 'react';
import {
  FileEdit,
  Bold,
  Italic,
  List,
  Clock,
  Mic,
  MicOff,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const ClinicalEvolutionCard: React.FC = () => {
  const [evolutionText, setEvolutionText] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [lastSaved, setLastSaved] = useState('Aguardando digitação');

  const templates = [
    'Anestesia Articaína 4% (1 tubete)',
    'Isolamento absoluto sem intercorrências',
    'Ajuste oclusal verificado em carbono',
    'Prescrição de Analgésico entregue',
  ];

  const handleAppendTemplate = (text: string) => {
    setEvolutionText((prev) => {
      const trimmed = prev.trim();
      return `${trimmed}\n• ${text}`;
    });
    setLastSaved(`Atualizado às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleInsertTimestamp = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEvolutionText((prev) => `${prev}\n[${timeStr}] `);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setEvolutionText((prev) => `${prev}\n• [Ditado Clínico]: Cavidade limpa e polimerizada por 40 segundos com fotopolimerizador Valo.`);
        setIsRecording(false);
      }, 2500);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 sm:p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0A9396]/10 flex items-center justify-center text-[#0A9396] shrink-0">
            <FileEdit className="w-5 h-5 text-[#0A9396]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Evolução Clínica do Atendimento
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Descreva os detalhes cirúrgicos, anestésicos e recomendações pós-operatórias
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">
          {lastSaved}
        </span>
      </div>

      {/* Templates Rápidos */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-400 font-medium mr-1">Templates rápidos:</span>
        {templates.map((tpl) => (
          <button
            key={tpl}
            onClick={() => handleAppendTemplate(tpl)}
            type="button"
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[#005F73] text-xs font-medium transition-colors cursor-pointer"
          >
            + {tpl}
          </button>
        ))}
      </div>

      {/* Editor Clínico */}
      <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-200 text-slate-700 transition-colors"
              title="Negrito"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-200 text-slate-700 transition-colors"
              title="Itálico"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-200 text-slate-700 transition-colors"
              title="Lista de itens"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <button
              onClick={handleInsertTimestamp}
              type="button"
              className="p-1 rounded hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-[11px]"
              title="Carimbo de Hora"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hora</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecording}
              type="button"
              className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-white hover:bg-slate-200 text-[#005F73] border border-slate-300'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Gravando...' : 'Ditado por Voz'}</span>
            </button>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Assinatura digital Dr. Frankisney Souza ativa
            </span>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          rows={5}
          value={evolutionText}
          onChange={(e) => setEvolutionText(e.target.value)}
          className="w-full p-3.5 bg-white text-slate-800 text-xs sm:text-sm leading-relaxed resize-y focus:outline-none"
          placeholder="Digite aqui o relatório clínico da consulta..."
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Dr. Frankisney Souza • CRO/SP 89.201</span>
        <span className="text-[11px] text-slate-400">Prontuário eletrônico certificado</span>
      </div>
    </div>
  );
};
