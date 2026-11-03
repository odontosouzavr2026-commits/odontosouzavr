import React, { useState } from 'react';
import {
  Building2,
  Users,
  Calendar,
  FileText,
  Network,
  CheckCircle2,
  AlertCircle,
  Shield,
  Key,
  ExternalLink,
  RefreshCw,
  Plus,
  Save,
  Copy,
  Check,
  Smartphone,
  Server,
  FileCheck,
  CreditCard,
  MessageSquare,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export type ConfigSubmenuId =
  | 'dados-clinica'
  | 'agenda-horarios'
  | 'modelos-documentos'
  | 'integracoes-apis';

interface ConfiguracaoSubmenuViewProps {
  submenuId: ConfigSubmenuId;
  forceMobileView?: boolean;
  onNavigateToTemplates?: () => void;
}

export const ConfiguracaoSubmenuView: React.FC<ConfiguracaoSubmenuViewProps> = ({
  submenuId,
  forceMobileView = false,
  onNavigateToTemplates,
}) => {
  const toast = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(keyName);
    toast.info('Copiado!', `Valor de ${keyName} copiado para a área de transferência.`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSave = () => {
    setIsSaved(true);
    toast.success('Configurações salvas!', 'As alterações do módulo foram atualizadas com sucesso.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 bg-slate-50 flex flex-col space-y-6">
      {/* Toast de Salvo */}
      {isSaved && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-lg text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>Configurações atualizadas com sucesso!</span>
        </div>
      )}

      {/* RENDERIZAÇÃO CONDICIONAL POR SUBMENU */}

      {/* 1. DADOS DA CLÍNICA */}
      {submenuId === 'dados-clinica' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  Dados da Clínica
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Informações cadastrais, registro no CRO-CL, dados fiscais e identidade impressa
              </p>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                  Identificação Jurídica & Responsabilidade Técnica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      defaultValue="ODONTO SOUZA SERVICOS ODONTOLOGICOS LTDA"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Razão Social / Nome Fantasia
                    </label>
                    <input
                      type="text"
                      defaultValue="ODONTO SOUZA LTDA"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">CNPJ</label>
                    <input
                      type="text"
                      defaultValue="67.587.323/0001-02"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Inscrição no CRO-CL (Clínica)
                    </label>
                    <input
                      type="text"
                      defaultValue="CRO-5950/MT"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Responsável Técnico (RT)
                    </label>
                    <input
                      type="text"
                      defaultValue="Dr. Frankisney B. Souza (CRO-5950/MT)"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Inscrição Municipal (IM)
                    </label>
                    <input
                      type="text"
                      defaultValue="8.492.301-0"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                  Localização & Contatos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      defaultValue="Av. Paulista, 1000 - Bela Vista - Conj. 1204"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">CEP</label>
                    <input
                      type="text"
                      defaultValue="01310-100"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Telefone Fixo
                    </label>
                    <input
                      type="text"
                      defaultValue="(66) 3554-2633 / (66) 3554-1390"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      WhatsApp da Clínica
                    </label>
                    <input
                      type="text"
                      defaultValue="(66) 98445-4825"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      E-mail Institucional
                    </label>
                    <input
                      type="email"
                      defaultValue="contato@odontosouza.com.br"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Logomarca da Clínica</h3>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#005F73] transition-colors cursor-pointer bg-slate-50/50">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-[#005F73] text-white flex items-center justify-center font-bold text-xl mb-3 shadow-xs">
                    OS
                  </div>
                  <span className="text-xs font-semibold text-slate-700 block">
                    ODONTO SOUZA
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    PNG, SVG ou JPG (máx. 2MB)
                  </span>
                  <button className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                    Alterar Logo
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Status Cadastral</h3>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Alvará Sanitário:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Vigente (2027)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Certificado Digital:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> A1 ICP-Brasil Ativo
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-slate-500">Plano Cloud:</span>
                  <span className="font-bold text-[#005F73]">Odonto Souza Pro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* 3. AGENDA E HORÁRIOS */}
      {submenuId === 'agenda-horarios' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  Agenda e Horários
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Definição de cadeiras ativas, turnos de funcionamento, bloqueios e tempos de esterilização
              </p>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                Cadeiras Clínicas & Consultórios
              </h3>
              <div className="space-y-3">
                {[
                  {
                    nome: 'Cadeira 01 - Centro Cirúrgico & Geral',
                    dentista: 'Dr. Frankisney Souza (Implantodontia)',
                    cor: 'bg-teal-500',
                  },
                  {
                    nome: 'Cadeira 02 - Consultório Estético & Orto',
                    dentista: 'Dra. Camila Ribeiro (Ortodontia)',
                    cor: 'bg-cyan-500',
                  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${c.cor}`}></div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                          {c.nome}
                        </span>
                        <span className="text-[11px] text-slate-500 block">{c.dentista}</span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Operacional
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                Intervalos & Esterilização Automática
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Tempo Padrão de Atendimento / Consulta
                  </label>
                  <select
                    defaultValue="45"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 font-medium text-slate-800 bg-white"
                  >
                    <option value="30">30 minutos (Consulta Rápida)</option>
                    <option value="45">45 minutos (Padrão Odonto Souza)</option>
                    <option value="60">60 minutos (Procedimentos Cirúrgicos)</option>
                    <option value="90">90 minutos (Tratamento Complexo / Implante)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Intervalo dos Slots da Agenda
                  </label>
                  <select
                    defaultValue="45"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 font-medium text-slate-800 bg-white"
                  >
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos (Padrão Odonto Souza)</option>
                    <option value="60">60 minutos</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Tempo de Esterilização entre Consultas
                  </label>
                  <select
                    defaultValue="15"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 font-medium text-slate-800 bg-white"
                  >
                    <option value="10">10 minutos (Básico)</option>
                    <option value="15">15 minutos (Padrão Odonto Souza)</option>
                    <option value="20">20 minutos (Procedimentos Cirúrgicos)</option>
                    <option value="30">30 minutos (Biossegurança Estendida)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Horário de Atendimento da Clínica
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="time"
                      defaultValue="08:00"
                      className="px-3 py-2 text-sm rounded-lg border border-slate-200"
                    />
                    <input
                      type="time"
                      defaultValue="19:00"
                      className="px-3 py-2 text-sm rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODELOS DE DOCUMENTOS (14 Modelos) */}
      {submenuId === 'modelos-documentos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                    Modelos de Documentos
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#005F73]/10 text-[#005F73] text-xs font-bold">
                    14 Modelos
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Atestados com validação de CID, receituários controlados, termos de consentimento (TCLE) e garantias
              </p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Novo Modelo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                titulo: 'Atestado Odontológico Padrão',
                cat: 'Atestados',
                desc: 'Com opção de inserção de CID e justificativa de repouso.',
                assinatura: 'Carimbo Digital',
              },
              {
                titulo: 'Receituário Antimicrobiano & Controle Especial',
                cat: 'Receitas',
                desc: 'Via dupla automática com dados do paciente e posologia.',
                assinatura: 'Assinatura ICP-Brasil',
              },
              {
                titulo: 'TCLE - Cirurgia de Implante Dentário',
                cat: 'Termos (TCLE)',
                desc: 'Termo de consentimento livre e esclarecido específico.',
                assinatura: 'Assinatura na Tela',
              },
              {
                titulo: 'TCLE - Exodontia de Sisos Inclusos',
                cat: 'Termos (TCLE)',
                desc: 'Riscos, pós-operatório e orientações anestésicas.',
                assinatura: 'Assinatura na Tela',
              },
              {
                titulo: 'Termo de Garantia de Prótese Fixa',
                cat: 'Garantias',
                desc: 'Prazos de manutenção e condições de validade.',
                assinatura: 'Assinado',
              },
              {
                titulo: 'Encaminhamento para Exames Radiográficos',
                cat: 'Encaminhamentos',
                desc: 'Solicitação de Tomografia Cone Beam e Panorâmica.',
                assinatura: 'Carimbo Digital',
              },
            ].map((doc, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A9396] bg-cyan-50 px-2 py-0.5 rounded-md">
                      {doc.cat}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{doc.assinatura}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{doc.titulo}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{doc.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button className="text-slate-600 hover:text-slate-800 font-medium cursor-pointer">
                    Pré-visualizar
                  </button>
                  <button className="text-[#005F73] hover:text-[#004857] font-semibold cursor-pointer">
                    Editar Modelo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. INTEGRAÇÕES E APIS (Item destacado no anexo) */}
      {submenuId === 'integracoes-apis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
                  <Network className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                    Integrações e APIs
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    4 Conectadas
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Conexão com WhatsApp Cloud API, emissor fiscal de NFS-e, gateways de pagamento e Webhooks em tempo real
              </p>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sincronizar APIs</span>
            </button>
          </div>

          {/* Cards de Integrações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta WhatsApp Cloud API */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Meta WhatsApp Cloud API</h3>
                      <span className="text-[11px] text-slate-400">Disparos oficiais & chatbot</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Conectado
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Número verificado: <strong>+55 (11) 98765-4321</strong>. WABA ID vinculado e templates sincronizados.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-mono text-slate-600 truncate">Token: EAAGm0PX...9328X</span>
                  <button
                    onClick={() => copyToClipboard('EAAGm0PX4829103984X9328X', 'meta-token')}
                    className="text-xs text-[#005F73] font-semibold hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    {copiedKey === 'meta-token' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={onNavigateToTemplates}
                  className="text-[#005F73] font-bold hover:underline cursor-pointer"
                >
                  Ver Templates de Mensagens &rarr;
                </button>
                <span className="text-slate-400">Taxa entrega: 99.8%</span>
              </div>
            </div>

            {/* Emissor de NFS-e Municipal */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-[#005F73] flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">NFS-e Prefeitura Municipal</h3>
                      <span className="text-[11px] text-slate-400">Prefeitura de São Paulo (SP)</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Ativo
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Emissão automática de nota fiscal de serviços odontológicos na liquidação do financeiro.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-mono text-slate-600 truncate">Certificado A1: Vence em 14/08/2027</span>
                  <span className="text-emerald-600 font-semibold text-xs">Válido</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Última nota: #4902 (Hoje 14:15)</span>
                <button className="text-[#005F73] font-bold hover:underline cursor-pointer">
                  Configurar RPS
                </button>
              </div>
            </div>

            {/* Gateway de Pagamentos e TEF */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-700 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">TEF / Pix Dinâmico & Cartão</h3>
                      <span className="text-[11px] text-slate-400">Conciliação instantânea</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Operando
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Geração automática de QR Code Pix e integração com maquininha sem fio da recepção.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-mono text-slate-600">Terminal ID: ODN-REC-01</span>
                  <span className="text-slate-500">Taxa Pix: 0%</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Liquidado hoje: R$ 4.850,00</span>
                <button className="text-[#005F73] font-bold hover:underline cursor-pointer">
                  Extrato TEF
                </button>
              </div>
            </div>

            {/* Webhooks Clínicos */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Webhooks de Eventos</h3>
                      <span className="text-[11px] text-slate-400">Disparo em tempo real</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    3 Endpoints
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Notifica sistemas externos quando uma consulta for concluída, cancelada ou paga.
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-mono text-slate-600 truncate">
                    https://api.odontosouza.com.br/hooks
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard('https://api.odontosouza.com.br/hooks', 'webhook-url')
                    }
                    className="text-xs text-[#005F73] font-semibold hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    {copiedKey === 'webhook-url' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Último disparo: 14:30 (200 OK)</span>
                <button className="text-[#005F73] font-bold hover:underline cursor-pointer">
                  Testar Endpoint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
