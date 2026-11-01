import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Save,
  X,
  CreditCard,
} from 'lucide-react';
import { ConvenioItem, ConvenioFormData } from '../../types/convenios';
import { useToast } from '../../contexts/ToastContext';
import { scrollToTop } from '../../utils/scrollUtils';

interface ConvenioFormViewProps {
  initialData?: ConvenioItem | null;
  onSave: (dados: ConvenioFormData) => void;
  onCancel: () => void;
  isMobile?: boolean;
}

export const ConvenioFormView: React.FC<ConvenioFormViewProps> = ({
  initialData,
  onSave,
  onCancel,
  isMobile = false,
}) => {
  const toast = useToast();

  useEffect(() => {
    scrollToTop();
  }, []);

  const isCasaInitial = (initialData?.nome || '').toLowerCase().includes('casa');
  const [nome, setNome] = useState(initialData?.nome || '');
  const [tipoPlano, setTipoPlano] = useState<'proprio' | 'operadora'>(
    initialData?.tipoPlano || (isCasaInitial ? 'proprio' : 'operadora')
  );
  const [cobreMensalidade, setCobreMensalidade] = useState<boolean>(
    initialData?.cobreMensalidade ?? false
  );
  const [valorMensalidade, setValorMensalidade] = useState<number>(
    initialData?.valorMensalidade ?? 0
  );
  const [razaoSocial, setRazaoSocial] = useState(initialData?.razaoSocial || '');
  const [registroAns, setRegistroAns] = useState(initialData?.registroAns || '');
  const [cnpj, setCnpj] = useState(initialData?.cnpj || '');
  const [telefoneContato, setTelefoneContato] = useState(initialData?.telefoneContato || '');
  const [emailContato, setEmailContato] = useState(initialData?.emailContato || '');
  const [diasRepasse, setDiasRepasse] = useState<number>(
    initialData?.diasRepasse ?? (isCasaInitial ? 0 : 30)
  );
  const [taxaCoparticipacao, setTaxaCoparticipacao] = useState<number>(
    initialData?.taxaCoparticipacao ?? 0
  );
  const [tabelaPrecosPadrao, setTabelaPrecosPadrao] = useState(
    initialData?.tabelaPrecosPadrao || (isCasaInitial ? 'Tabela Convênio da Casa' : 'Tabela Padrão Clínica')
  );
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>(initialData?.status || 'Ativo');
  const [observacoes, setObservacoes] = useState(initialData?.observacoes || '');

  const [errors, setErrors] = useState<{ nome?: string }>({});

  const handleNomeChange = (val: string) => {
    setNome(val);
    if (errors.nome) setErrors({});

    // Se o usuário estiver criando ou renomeando para "Convênio da Casa", aplica presets automáticos
    if (val.toLowerCase().includes('casa')) {
      setTipoPlano('proprio');
      setCobreMensalidade(false);
      setValorMensalidade(0);
      setDiasRepasse(0);
      if (!registroAns || registroAns === '005711') setRegistroAns('Isento');
      if (!razaoSocial) setRazaoSocial('Odonto Souza Atendimento Próprio');
      if (tabelaPrecosPadrao === 'Tabela Padrão Clínica') setTabelaPrecosPadrao('Tabela Convênio da Casa');
    }
  };

  const handleTipoPlanoChange = (novoTipo: 'proprio' | 'operadora') => {
    setTipoPlano(novoTipo);
    if (novoTipo === 'proprio') {
      setCobreMensalidade(false);
      setValorMensalidade(0);
      setDiasRepasse(0);
      setRegistroAns('Isento');
      if (!razaoSocial) setRazaoSocial('Odonto Souza Atendimento Próprio');
      setTabelaPrecosPadrao('Tabela Convênio da Casa');
    } else {
      setDiasRepasse(30);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErrors({ nome: 'Por favor, informe o nome comercial do convênio ou plano.' });
      toast.warning('Atenção', 'O nome do convênio é obrigatório.');
      return;
    }

    const payload: ConvenioFormData = {
      nome: nome.trim(),
      razaoSocial: razaoSocial.trim() || undefined,
      registroAns: registroAns.trim() || (tipoPlano === 'proprio' ? 'Isento' : undefined),
      cnpj: cnpj.trim() || undefined,
      telefoneContato: telefoneContato.trim() || undefined,
      emailContato: emailContato.trim() || undefined,
      diasRepasse: tipoPlano === 'proprio' ? 0 : (Number(diasRepasse) || 0),
      taxaCoparticipacao: Number(taxaCoparticipacao) || 0,
      tabelaPrecosPadrao: tabelaPrecosPadrao.trim() || (tipoPlano === 'proprio' ? 'Tabela Convênio da Casa' : 'Tabela Padrão Clínica'),
      status,
      observacoes: observacoes.trim() || undefined,
      tipoPlano,
      cobreMensalidade,
      valorMensalidade: cobreMensalidade ? valorMensalidade : 0,
    };

    onSave(payload);
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-screen bg-[#f8f9ff]">
      {/* ============================================================== */}
      {/* 1. CABEÇALHO SUPERIOR (PADRÃO RESPONSIVO COM BOTÃO VOLTAR)     */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer group"
              title="Voltar para a listagem de convênios"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#005f73] text-[11px] font-extrabold border border-teal-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0A9396]" />
                  <span>{initialData ? 'Edição de Convênio' : 'Novo Convênio & Plano'}</span>
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    status === 'Ativo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {status}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                {initialData ? initialData.nome : 'Cadastrar Operadora ou Plano Odontológico'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Descartar</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Convênio</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. CORPO DO FORMULÁRIO (ESTRUTURA BENTO CARDS EM TELA CHEIA)  */}
      {/* ============================================================== */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Identificação Oficial */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005f73]">
                <Building2 className="w-4 h-4 text-[#005f73]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  1. Identificação da Operadora & Plano
                </h3>
                <p className="text-xs text-slate-500">
                  Dados institucionais e regulatórios perante a Agência Nacional de Saúde Suplementar (ANS).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {/* Nome Comercial / Fantasia */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Nome do Convênio / Plano <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Ex: Convênio da Casa, Bradesco Dental, Unimed Odonto"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                    errors.nome ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all`}
                />
                {errors.nome && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.nome}</span>
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Status da Parceria
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Ativo' | 'Inativo')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all font-semibold"
                >
                  <option value="Ativo">Ativo (Disponível para Pacientes)</option>
                  <option value="Inativo">Inativo (Suspenso / Em Negociação)</option>
                </select>
              </div>

              {/* Razão Social */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Razão Social da Operadora
                </label>
                <input
                  type="text"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Ex: Bradesco Dental S.A."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all"
                />
              </div>

              {/* Registro ANS */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Código de Registro ANS
                </label>
                <input
                  type="text"
                  value={registroAns}
                  onChange={(e) => setRegistroAns(e.target.value)}
                  placeholder="Ex: 005711 (ou Isento)"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all font-mono"
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  CNPJ da Operadora
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all font-mono"
                />
              </div>

              {/* Telefone de Autorização */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Telefone / Central de Autorizações
                </label>
                <input
                  type="text"
                  value={telefoneContato}
                  onChange={(e) => setTelefoneContato(e.target.value)}
                  placeholder="0800 ou telefone do TISS"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all"
                />
              </div>

              {/* E-mail de Contato / Credenciamento */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  E-mail de Faturamento / Suporte
                </label>
                <input
                  type="email"
                  value={emailContato}
                  onChange={(e) => setEmailContato(e.target.value)}
                  placeholder="autorizacoes@operadora.com.br"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Regras Financeiras & TISS */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005f73]">
                <CreditCard className="w-4 h-4 text-[#005f73]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  2. Parâmetros Financeiros & Prazos de Repasse
                </h3>
                <p className="text-xs text-slate-500">
                  Definições para previsão de caixa, conciliação de faturamento e liquidação de guias.
                </p>
              </div>
            </div>

            {/* Configuração de Modalidade e Mensalidade */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Modalidade do Convênio / Plano
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Defina se é um plano próprio da clínica (Convênio da Casa) ou operadora externa ANS.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTipoPlanoChange('proprio')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tipoPlano === 'proprio'
                        ? 'bg-[#005f73] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Convênio da Casa (Próprio)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoPlanoChange('operadora')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tipoPlano === 'operadora'
                        ? 'bg-[#005f73] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Operadora ANS
                  </button>
                </div>
              </div>

              {/* Cobrança de Mensalidade */}
              <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Cobrança de Mensalidade
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {!cobreMensalidade
                      ? 'Sem cobrança de mensalidade: O paciente não paga taxa mensal fixa, pagando apenas pelos procedimentos realizados.'
                      : 'Com mensalidade recorrente configurada para o beneficiário.'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCobreMensalidade(false);
                      setValorMensalidade(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !cobreMensalidade
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ✓ Sem Mensalidade (R$ 0,00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCobreMensalidade(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      cobreMensalidade
                        ? 'bg-[#005f73] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Com Mensalidade
                  </button>
                </div>
              </div>

              {!cobreMensalidade && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Plano sem mensalidade:</strong> O paciente usufrui dos benefícios do Convênio da Casa com isenção total de mensalidade e anuidade.
                  </span>
                </div>
              )}

              {cobreMensalidade && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor da Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={valorMensalidade}
                    onChange={(e) => setValorMensalidade(parseFloat(e.target.value) || 0)}
                    className="w-48 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 font-semibold"
                    placeholder="0,00"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Prazo de Repasse */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Prazo Médio de Repasse (Dias)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={diasRepasse}
                    onChange={(e) => setDiasRepasse(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all font-semibold"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    dias úteis
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {diasRepasse === 0 ? 'Repasse imediato (Particular)' : `Liquidação estimada em até ${diasRepasse} dias após envio da guia.`}
                </p>
              </div>

              {/* Taxa de Coparticipação */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Coparticipação do Paciente (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={taxaCoparticipacao}
                    onChange={(e) => setTaxaCoparticipacao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all font-semibold"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Percentual pago diretamente pelo paciente na clínica se aplicável.
                </p>
              </div>

              {/* Tabela de Preços Padronizada */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Tabela de Preços Associada
                </label>
                <select
                  value={tabelaPrecosPadrao}
                  onChange={(e) => setTabelaPrecosPadrao(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all font-semibold"
                >
                  <option value="Tabela Convênio da Casa">Tabela Convênio da Casa</option>
                  <option value="Tabela Particular Odonto Souza">Tabela Particular Odonto Souza</option>
                  <option value="Tabela Bradesco Dental Premium">Tabela Bradesco Dental Premium</option>
                  <option value="Tabela Unimed Odonto Padrão">Tabela Unimed Odonto Padrão</option>
                  <option value="Tabela Amil Linha Dental">Tabela Amil Linha Dental</option>
                  <option value="Tabela SulAmérica Odonto Especial">Tabela SulAmérica Odonto Especial</option>
                  <option value="Tabela Porto Dental Ouro">Tabela Porto Dental Ouro</option>
                  <option value="Tabela OdontoPrev Integrada">Tabela OdontoPrev Integrada</option>
                  <option value="Tabela MetLife Dental Corp">Tabela MetLife Dental Corp</option>
                  <option value="Tabela Padrão Clínica">Tabela Padrão Clínica</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Define o rol e valores contratados com a operadora.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Regras Clínicas & Observações */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005f73]">
                <FileText className="w-4 h-4 text-[#005f73]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  3. Diretrizes Clínicas & Observações de Cobertura
                </h3>
                <p className="text-xs text-slate-500">
                  Orientações para a recepção e cirurgiões dentistas sobre autorização prévia, carências e envio de exames.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <textarea
                rows={4}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Exige raio-x inicial para procedimentos endodônticos; autorização prévia por token no app; limite de 4 restaurações por sessão..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 focus:border-[#005f73] transition-all resize-y"
              />
              <p className="text-[11px] text-slate-400">
                Estas observações serão exibidas para a recepção durante o agendamento e emissão de guias.
              </p>
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#0A9396] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Convênio</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
