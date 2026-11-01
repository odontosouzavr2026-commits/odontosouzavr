import React, { useState, useEffect } from 'react';
import { X, Send, User, Phone, CheckCircle, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { WhatsAppTemplate } from '../../types/templates';
import { useToast } from '../../contexts/ToastContext';
import { pacientesService } from '../../services/pacientesService';
import { PacienteItem } from '../../types/pacientes';
import { templateService } from '../../services/templateService';

interface TestTemplateModalProps {
  template: WhatsAppTemplate | null;
  onClose: () => void;
  onSendSuccess: (patientName: string, phone: string) => void;
}

export const TestTemplateModal: React.FC<TestTemplateModalProps> = ({
  template,
  onClose,
  onSendSuccess,
}) => {
  const toast = useToast();
  const [patientsList, setPatientsList] = useState<PacienteItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState('Everaldo Souza da Silva');
  const [phone, setPhone] = useState('5566992544324');
  const [isSending, setIsSending] = useState(false);

  // Carrega pacientes reais do Supabase
  useEffect(() => {
    let mounted = true;
    const fetchPatients = async () => {
      try {
        const list = await pacientesService.getPacientes();
        if (mounted && list && list.length > 0) {
          setPatientsList(list);
          const first = list[0];
          setSelectedPatientId(first.id);
          setPatientName(first.name);
          if (first.whatsapp) {
            setPhone(first.whatsapp);
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar pacientes para teste:', e);
      }
    };

    fetchPatients();
    return () => {
      mounted = false;
    };
  }, []);

  if (!template) return null;

  const handlePatientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPatientId(val);

    if (val === 'custom') {
      return;
    }

    const found = patientsList.find((p) => p.id === val);
    if (found) {
      setPatientName(found.name);
      if (found.whatsapp) {
        setPhone(found.whatsapp);
      }
    }
  };

  // Substitui variáveis pelo contexto selecionado
  const getParsedMessage = () => {
    let msg = template.content;
    const primeName = patientName.split(' ')[0] || 'Paciente';

    msg = msg.replace(/\{\{nome_paciente\}\}/g, patientName);
    msg = msg.replace(/\{\{primeiro_nome\}\}/g, primeName);
    msg = msg.replace(/\{\{dentista\}\}/g, 'Dr. Frankisney Souza');
    msg = msg.replace(/\{\{data_consulta\}\}/g, new Date().toLocaleDateString('pt-BR'));
    msg = msg.replace(/\{\{data\}\}/g, new Date().toLocaleDateString('pt-BR'));
    msg = msg.replace(/\{\{hora\}\}/g, '14:30');
    msg = msg.replace(/\{\{procedimento\}\}/g, 'Avaliação Odontológica / Restauração');
    msg = msg.replace(/\{\{data_vencimento\}\}/g, new Date().toLocaleDateString('pt-BR'));
    msg = msg.replace(/\{\{chave_pix_clinica\}\}/g, 'financeiro@odontosouzavr.com.br');
    msg = msg.replace(/\{\{chave_pix\}\}/g, 'financeiro@odontosouzavr.com.br');
    msg = msg.replace(/\{\{link_fatura\}\}/g, 'https://odonto.souza/f/recibo');
    msg = msg.replace(/\{\{link_calendario\}\}/g, 'https://odonto.souza/c/agenda');
    msg = msg.replace(/\{\{cupom_presente\}\}/g, 'ODONTODAY-20');
    msg = msg.replace(/\{\{telefone_clinica\}\}/g, '(24) 99876-1122');
    return msg;
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.warning('Telefone ausente', 'Informe o número de telefone de destino com DDD.');
      return;
    }

    setIsSending(true);

    try {
      const result = await templateService.dispatchTemplateMessage(template, {
        name: patientName,
        phone: phone.trim(),
        dentist: 'Dr. Frankisney Souza',
        date: new Date().toLocaleDateString('pt-BR'),
        time: '14:30',
        procedure: 'Avaliação Odontológica',
      });

      if (result.success) {
        toast.success(
          'Mensagem WhatsApp Enviada!',
          `Disparo do template "${template.name}" enviado com sucesso para ${patientName} (${phone}) via Evolution API.`
        );
        onSendSuccess(patientName, phone);
        onClose();
      } else {
        toast.error('Falha no envio WhatsApp', result.message);
      }
    } catch (err: any) {
      toast.error('Erro de envio', err?.message || 'Falha ao conectar com o serviço de WhatsApp.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-[#005F73] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                Disparar Teste de Template (WhatsApp)
              </h2>
              <p className="text-xs text-cyan-200">
                {template.name} • {template.categoryLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSendTest} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Paciente de Teste
              </label>
              <select
                value={selectedPatientId}
                onChange={handlePatientSelectChange}
                className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A9396] cursor-pointer"
              >
                {patientsList.length > 0 ? (
                  patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code || 'Cadastrado'})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="p1">Everaldo Souza da Silva (Prontuário #4891)</option>
                    <option value="p2">Beatriz Fagundes Silveira (Prontuário #4885)</option>
                    <option value="p3">Rodrigo Mendes Cavalcanti (Prontuário #4910)</option>
                  </>
                )}
                <option value="custom">+ Digitar outro paciente</option>
              </select>
            </div>

            {selectedPatientId === 'custom' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome do Paciente
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nome completo do paciente"
                  className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp Destinatário
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 5566992544324"
                className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Com DDI e DDD (ex: 55 66 99254-4324)
              </span>
            </div>
          </div>

          {/* Pré-visualização Real com Variáveis Resolvidas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pré-visualização da Mensagem Real
              </label>
              <span className="text-[11px] font-semibold text-[#005F73] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Tags Dinâmicas Resolvidas
              </span>
            </div>

            <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="bg-white rounded-xl p-3.5 shadow-xs max-w-sm ml-auto border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>ODONTO SOUZA • Atendimento Oficial</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {getParsedMessage()}
                </p>
                <div className="text-[10px] text-slate-400 text-right">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • Pronto p/ envio
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer transition-all"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Disparando via WhatsApp...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Teste Agora</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
