import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, Bell, Clock, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';

interface ConfigurarGatilhosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const STORAGE_TRIGGER_KEY = 'odonto_trigger_config_v3';

export const ConfigurarGatilhosModal: React.FC<ConfigurarGatilhosModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [gatilho24h, setGatilho24h] = useState('2');
  const [gatilhoFinanceiro, setGatilhoFinanceiro] = useState('3');
  const [gatilhoPosOp, setGatilhoPosOp] = useState('4');
  const [gatilhoRecall, setGatilhoRecall] = useState('180');
  const [horaAniversario, setHoraAniversario] = useState('09:00');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRIGGER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gatilho24h) setGatilho24h(parsed.gatilho24h);
        if (parsed.gatilhoFinanceiro) setGatilhoFinanceiro(parsed.gatilhoFinanceiro);
        if (parsed.gatilhoPosOp) setGatilhoPosOp(parsed.gatilhoPosOp);
        if (parsed.gatilhoRecall) setGatilhoRecall(parsed.gatilhoRecall);
        if (parsed.horaAniversario) setHoraAniversario(parsed.horaAniversario);
      }
    } catch (e) {
      console.warn('Erro ao carregar gatilhos:', e);
    }
  }, [isOpen]);

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_TRIGGER_KEY,
        JSON.stringify({
          gatilho24h,
          gatilhoFinanceiro,
          gatilhoPosOp,
          gatilhoRecall,
          horaAniversario,
        })
      );
    } catch (e) {
      console.error('Erro ao salvar gatilhos:', e);
    }
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-[#005F73] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                Configurar Gatilhos Automáticos
              </h2>
              <p className="text-xs text-cyan-200">
                Regras de disparo automático com a Evolution WhatsApp API
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status WhatsApp */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Evolution WhatsApp: Instância "atendimento" Ativa</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
              WhatsApp v2
            </span>
          </div>

          {/* Gatilho 1: Lembrete de Consulta */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Lembrete de Consulta</span>
              <span className="text-slate-500">Antecedência do envio antes da consulta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={gatilho24h}
                onChange={(e) => setGatilho24h(e.target.value)}
                className="w-16 h-8 px-2 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
              />
              <span className="text-slate-500 font-medium">horas</span>
            </div>
          </div>

          {/* Gatilho 2: Aviso Financeiro */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Aviso de Vencimento</span>
              <span className="text-slate-500">Dias antes da data de cobrança</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={gatilhoFinanceiro}
                onChange={(e) => setGatilhoFinanceiro(e.target.value)}
                className="w-16 h-8 px-2 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
              />
              <span className="text-slate-500 font-medium">dias</span>
            </div>
          </div>

          {/* Gatilho 3: Pós-Operatório */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Cuidados Pós-Cirúrgicos</span>
              <span className="text-slate-500">Tempo após finalização clínica</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={gatilhoPosOp}
                onChange={(e) => setGatilhoPosOp(e.target.value)}
                className="w-16 h-8 px-2 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
              />
              <span className="text-slate-500 font-medium">horas</span>
            </div>
          </div>

          {/* Gatilho 4: Recall Semestral */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Recall de Profilaxia</span>
              <span className="text-slate-500">Intervalo desde o último retorno</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={gatilhoRecall}
                onChange={(e) => setGatilhoRecall(e.target.value)}
                className="w-16 h-8 px-2 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
              />
              <span className="text-slate-500 font-medium">dias</span>
            </div>
          </div>

          {/* Gatilho 5: Aniversário */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Mensagem de Aniversário</span>
              <span className="text-slate-500">Horário do disparo no dia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="time"
                value={horaAniversario}
                onChange={(e) => setHoraAniversario(e.target.value)}
                className="h-8 px-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-[#005F73] hover:bg-[#004e5e] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Gatilhos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
