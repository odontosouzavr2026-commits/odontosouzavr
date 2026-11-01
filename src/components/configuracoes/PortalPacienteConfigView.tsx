import React, { useState } from 'react';
import {
  Globe,
  Copy,
  Check,
  QrCode,
  Smartphone,
  ExternalLink,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { formatPhone } from '../../utils/documentValidation';

export const PortalPacienteConfigView: React.FC = () => {
  const toast = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Configurações
  const [autoAgendamentoAtivo, setAutoAgendamentoAtivo] = useState(true);
  const [envioAnamneseAtivo, setEnvioAnamneseAtivo] = useState(true);
  const [antecedenciaMinima, setAntecedenciaMinima] = useState('4');
  const [exibirPrecos, setExibirPrecos] = useState(false);

  // Simulador do Paciente (Interativo)
  const [simDentista, setSimDentista] = useState('Dr. Frankisney Souza');
  const [simProcedimento, setSimProcedimento] = useState('Avaliação Inicial & Check-up Digital');
  const [simData, setSimData] = useState('Amanhã - 29/10');
  const [simHora, setSimHora] = useState('14:30');
  const [simNome, setSimNome] = useState('');
  const [simWhats, setSimWhats] = useState('');
  const [agendamentoSimuladoConcluido, setAgendamentoSimuladoConcluido] = useState(false);

  const linkPublico = 'https://odontosouza.com.br/agendar';

  const copyLink = () => {
    navigator.clipboard?.writeText(linkPublico);
    setCopiedLink(true);
    toast.info('Link copiado!', 'O link público do portal foi copiado para a área de transferência.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveConfig = () => {
    setIsSaved(true);
    toast.success('Parâmetros salvos!', 'Configurações do Portal do Paciente salvas com sucesso.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleConfirmarSimulacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simNome.trim()) {
      toast.warning('Atenção', 'Informe o nome do paciente na simulação.');
      return;
    }
    setAgendamentoSimuladoConcluido(true);
    toast.success('Simulação confirmada!', `Agendamento teste concluído para ${simNome}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {isSaved && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-lg text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>Configurações do Portal do Paciente salvas com sucesso!</span>
        </div>
      )}

      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Portal do Paciente &amp; Agendamento Online
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Página pública para pacientes agendarem consultas sozinhos e preencherem a anamnese digital via WhatsApp.
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Parâmetros</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Configurações & Link (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card do Link Público & QR Code */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
              Link de Agendamento da Clínica
            </h3>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 truncate">
                {linkPublico}
              </div>
              <button
                onClick={copyLink}
                className="px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-[#89f3f6]" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-[#005F73]" />
                <div>
                  <span className="font-bold text-slate-800 block">QR Code para o Balcão</span>
                  <span className="text-[11px] text-slate-400">
                    Imprima e posicione na recepção para auto check-in
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  window.print();
                }}
                className="text-[#005F73] font-bold hover:underline cursor-pointer"
              >
                Imprimir QR Code
              </button>
            </div>
          </div>

          {/* Card de Regras de Agendamento */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
              Regras e Automações de Atendimento
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Autoagendamento Público Ativo
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Permite que pacientes marquem consultas online sem precisar ligar
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoAgendamentoAtivo}
                  onChange={(e) => setAutoAgendamentoAtivo(e.target.checked)}
                  className="w-5 h-5 text-[#005F73] rounded focus:ring-[#005F73] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Disparo Automático de Anamnese via WhatsApp
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Envia formulário de saúde pré-consulta 24h antes do horário marcado
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={envioAnamneseAtivo}
                  onChange={(e) => setEnvioAnamneseAtivo(e.target.checked)}
                  className="w-5 h-5 text-[#005F73] rounded focus:ring-[#005F73] cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Antecedência Mínima para Agendar Online
                </label>
                <select
                  value={antecedenciaMinima}
                  onChange={(e) => setAntecedenciaMinima(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
                >
                  <option value="2">2 horas antes do horário</option>
                  <option value="4">4 horas antes do horário (Recomendado)</option>
                  <option value="12">12 horas antes</option>
                  <option value="24">24 horas antes (Apenas para o dia seguinte)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Simulador Mobile da Visão do Paciente (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800">
            {/* Notch do celular */}
            <div className="w-28 h-4 bg-slate-800 mx-auto rounded-b-xl mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900"></div>
            </div>

            {/* Tela do Celular */}
            <div className="bg-white rounded-[26px] overflow-hidden min-h-[500px] flex flex-col text-slate-800">
              {/* Header do App Web do Paciente */}
              <div className="bg-[#005F73] p-4 text-white text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-200 block">
                  Agendamento Online
                </span>
                <h4 className="font-extrabold text-sm tracking-tight mt-0.5">
                  ODONTO SOUZA
                </h4>
                <p className="text-[10px] text-cyan-100">Clínica Odontológica Especializada</p>
              </div>

              {agendamentoSimuladoConcluido ? (
                <div className="p-5 flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-900">
                    Consulta Agendada com Sucesso!
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Olá, <strong>{simNome || 'Paciente'}</strong>! Sua consulta com o{' '}
                    <strong>{simDentista}</strong> foi confirmada para <strong>{simData} às {simHora}</strong>.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 w-full text-left">
                    <span>Enviamos os detalhes e o link da sua Anamnese no WhatsApp!</span>
                  </div>
                  <button
                    onClick={() => {
                      setAgendamentoSimuladoConcluido(false);
                      setSimNome('');
                      setSimWhats('');
                    }}
                    className="text-xs text-[#005F73] font-bold hover:underline cursor-pointer pt-2"
                  >
                    Fazer Outro Agendamento
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleConfirmarSimulacao}
                  className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        1. Escolha o Dentista
                      </label>
                      <select
                        value={simDentista}
                        onChange={(e) => setSimDentista(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 font-semibold"
                      >
                        <option value="Dr. Frankisney Souza">Dr. Frankisney Souza (Implantodontia)</option>
                        <option value="Dra. Camila Ribeiro">Dra. Camila Ribeiro (Ortodontia)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        2. Motivo da Consulta
                      </label>
                      <select
                        value={simProcedimento}
                        onChange={(e) => setSimProcedimento(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200"
                      >
                        <option value="Avaliação Inicial & Check-up Digital">
                          Avaliação Inicial &amp; Check-up
                        </option>
                        <option value="Limpeza & Profilaxia">Limpeza &amp; Profilaxia</option>
                        <option value="Dor de Dente / Urgência">Dor de Dente / Urgência</option>
                        <option value="Consulta de Aparelho / Ortodontia">Ortodontia</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        3. Horários Disponíveis
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {['10:00', '11:30', '14:30', '16:00'].map((h) => (
                          <button
                            type="button"
                            key={h}
                            onClick={() => setSimHora(h)}
                            className={`p-1.5 rounded-lg border text-center font-bold text-xs transition-colors cursor-pointer ${
                              simHora === h
                                ? 'bg-[#005F73] text-white border-[#005F73]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1 space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Seu Nome Completo"
                        value={simNome}
                        onChange={(e) => setSimNome(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp com DDD: (11) 98877-6655"
                        maxLength={15}
                        value={simWhats}
                        onChange={(e) => setSimWhats(formatPhone(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer mt-2"
                  >
                    Confirmar Horário com Dentista
                  </button>
                </form>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Simulador em tempo real da interface pública mobile
          </span>
        </div>
      </div>
    </div>
  );
};
