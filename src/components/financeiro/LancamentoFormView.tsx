import React, { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Building,
  User,
  Stethoscope,
  CheckCircle,
  Clock,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Receipt,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import { TransacaoFinanceira, TransacaoTipo, TransacaoStatus } from '../../types/financeiro';
import { useToast } from '../../contexts/ToastContext';
import { ValidatedInput } from '../common/ValidatedInput';
import { isValidCPFOrCNPJ } from '../../utils/documentValidation';
import { scrollToTop } from '../../utils/scrollUtils';

interface LancamentoFormViewProps {
  initialData?: TransacaoFinanceira | null;
  onSave: (transacao: Omit<TransacaoFinanceira, 'id' | 'txCode'>) => void;
  onCancel: () => void;
  isMobile?: boolean;
}

export const LancamentoFormView: React.FC<LancamentoFormViewProps> = ({
  initialData,
  onSave,
  onCancel,
  isMobile = false,
}) => {
  const toast = useToast();

  // Garante que o formulário abra sempre no início (topo da página)
  React.useEffect(() => {
    scrollToTop();
  }, []);

  const [tipo, setTipo] = useState<TransacaoTipo>(initialData?.type || 'receita');
  const [valorStr, setValorStr] = useState(
    initialData ? initialData.amount.toFixed(2).replace('.', ',') : '350,00'
  );
  const [vencimento, setVencimento] = useState(initialData?.dueDate || '2025-05-18');
  const [competencia, setCompetencia] = useState(initialData?.competence || 'Maio / 2025');
  const [descricao, setDescricao] = useState(
    initialData?.entityDetail || 'Restauração Resina Estética #26'
  );

  // Classificação
  const [categoria, setCategoria] = useState(
    initialData?.category ||
      (tipo === 'receita' ? 'Tratamentos' : 'Materiais & Insumos')
  );
  const [contraparte, setContraparte] = useState(
    initialData?.entityName ||
      (tipo === 'receita' ? 'Mariana Costa' : 'Dental Speed')
  );
  const [documentoContraparte, setDocumentoContraparte] = useState('');
  const [docError, setDocError] = useState(false);
  const [docErrorMessage, setDocErrorMessage] = useState('');
  const [dentista, setDentista] = useState(
    initialData?.dentist || 'Dr. Frankisney B. Souza (CRO-5950/MT) - Cirurgião Dentista'
  );
  const [unidade, setUnidade] = useState(
    initialData?.unit || 'Unidade Principal - Consultório 01 (Lapa)'
  );

  // Liquidação
  const [status, setStatus] = useState<TransacaoStatus>(initialData?.status || 'pago');
  const [formaPagamento, setFormaPagamento] = useState(
    initialData?.paymentMethod || 'PIX Instantâneo (QR Code Dinâmico)'
  );
  const [dataEfetiva, setDataEfetiva] = useState(
    initialData?.effectiveDate || '2025-05-18'
  );

  // Comprovante & Notas
  const [arquivoAnexado, setArquivoAnexado] = useState<string | null>(
    initialData?.receiptFile || 'NFe_MarianaCosta_0492.pdf'
  );
  const [observacoes, setObservacoes] = useState(
    initialData?.notes ||
      'Paciente optou por parcelar saldo restante na sessão de polimento. Emitido cupom fiscal #4902.'
  );

  const categoriasReceita = [
    'Tratamentos Odontológicos Especializados',
    'Ortodontia & Aparelhos',
    'Consultas Clínicas e Profilaxia',
    'Estética & Clareamento Dental',
    'Implantes e Cirurgias',
  ];

  const categoriasDespesa = [
    'Materiais & Insumos Odontológicos',
    'Laboratório de Prótese Dentária',
    'Manutenção de Equipamentos e Autoclave',
    'Honorários e Folha de Pessoal',
    'Aluguel & Infraestrutura Clínica',
    'Marketing Odontológico e Tráfego',
  ];

  const handleTipoChange = (novoTipo: TransacaoTipo) => {
    setTipo(novoTipo);
    if (novoTipo === 'receita') {
      if (!initialData) {
        setDescricao('Restauração Resina Estética #26');
        setContraparte('Mariana Costa');
        setCategoria('Tratamentos Odontológicos Especializados');
        setValorStr('350,00');
      }
    } else {
      if (!initialData) {
        setDescricao('Compra de Resinas e Adesivos - Dental Speed');
        setContraparte('Dental Speed Graph Comércio Ltda');
        setCategoria('Materiais & Insumos Odontológicos');
        setValorStr('840,00');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount =
      parseFloat(valorStr.replace(/\./g, '').replace(',', '.')) || 0;

    if (numericAmount <= 0) {
      toast.warning('Valor inválido', 'Informe um valor maior que R$ 0,00 para o lançamento.');
      return;
    }

    if (!contraparte.trim()) {
      toast.warning('Campo obrigatório', 'Informe o favorecido, paciente ou fornecedor.');
      return;
    }

    if (documentoContraparte.trim() && !isValidCPFOrCNPJ(documentoContraparte)) {
      setDocError(true);
      setDocErrorMessage(
        tipo === 'receita'
          ? 'CPF inválido. Por favor, verifique os números.'
          : 'CNPJ inválido. Por favor, verifique os números.'
      );
      toast.warning('Documento inválido', 'Verifique o CPF/CNPJ antes de prosseguir.');
      return;
    }

    onSave({
      date: new Date().toLocaleDateString('pt-BR'),
      dueDate: vencimento,
      competence: competencia,
      type: tipo,
      entityName: contraparte,
      entityDetail: descricao,
      category: categoria,
      amount: numericAmount,
      status,
      paymentMethod: formaPagamento,
      dentist: dentista,
      unit: unidade,
      effectiveDate: dataEfetiva,
      receiptFile: arquivoAnexado || undefined,
      notes: observacoes,
    });

    toast.success(
      initialData ? 'Lançamento atualizado!' : 'Lançamento registrado!',
      `${tipo === 'receita' ? 'Receita' : 'Despesa'} de R$ ${valorStr} salva com sucesso.`
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Bar / Navegação de Retorno Estilo App Nativa */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#005F73]" />
          <span>Voltar para Financeiro</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {initialData ? 'Edição de Lançamento' : 'Novo Lançamento no Fluxo'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Caixa da Clínica
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Top Header com Segmented Control */}
        <div className="p-5 sm:p-7 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h1>
              {tipo === 'receita' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Entrada (+)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  <span>Saída (-)</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Registre entradas de tratamentos ou saídas operacionais para conciliação bancária imediata da clínica.
            </p>
          </div>

          {/* Segmented Control: Receita / Despesa */}
          <div className="inline-flex p-1.5 rounded-xl bg-slate-200/80 self-start md:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => handleTipoChange('receita')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tipo === 'receita'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Receita</span>
            </button>
            <button
              type="button"
              onClick={() => handleTipoChange('despesa')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tipo === 'despesa'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>Despesa</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-7">
          {/* SECÇÃO 1: Bloco de Destaque Visual (Valor + Vencimento + Competência + Descrição) */}
          <section
            className={`p-5 sm:p-6 rounded-2xl border transition-colors ${
              tipo === 'receita'
                ? 'bg-emerald-50/40 border-emerald-200/70'
                : 'bg-rose-50/40 border-rose-200/70'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-end">
              {/* Valor */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Valor do Lançamento (R$) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
                  <span
                    className={`pl-4 pr-1 font-bold text-lg ${
                      tipo === 'receita' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    R$
                  </span>
                  <input
                    type="text"
                    required
                    value={valorStr}
                    onChange={(e) => setValorStr(e.target.value)}
                    placeholder="0,00"
                    className={`w-full py-2.5 px-2 text-2xl font-black outline-none ${
                      tipo === 'receita' ? 'text-emerald-900' : 'text-rose-700'
                    }`}
                  />
                </div>
              </div>

              {/* Data de Vencimento */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data de Vencimento <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center bg-white rounded-xl border border-slate-300 shadow-xs">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 outline-none rounded-xl"
                  />
                </div>
              </div>

              {/* Competência Contábil */}
              <div className="md:col-span-4 flex flex-col justify-end">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Competência Contábil
                </label>
                <div className="h-11 px-3.5 bg-white rounded-xl border border-slate-300 shadow-xs flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-slate-800">
                    {competencia}
                  </span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Descrição Detalhada */}
              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descrição Detalhada do Registro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Restauração Resina Estética #26 ou Manutenção Preventiva"
                  className="w-full h-11 px-3.5 text-xs sm:text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A9396]"
                />
              </div>
            </div>
          </section>

          {/* SECÇÃO 2: Classificação & Contraparte */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-4 rounded-full bg-[#005F73]" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                Classificação &amp; Contraparte
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria Contábil <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A9396] cursor-pointer"
                >
                  {(tipo === 'receita' ? categoriasReceita : categoriasDespesa).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Contraparte (Paciente vs Fornecedor) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {tipo === 'receita' ? 'Paciente Relacionado *' : 'Fornecedor / Favorecido *'}
                </label>
                <input
                  type="text"
                  required
                  value={contraparte}
                  onChange={(e) => setContraparte(e.target.value)}
                  placeholder={
                    tipo === 'receita'
                      ? 'Ex: Mariana Costa (Prontuário #0492)'
                      : 'Ex: Dental Speed Graph Comércio Ltda'
                  }
                  className="w-full h-11 px-3.5 text-xs sm:text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A9396]"
                />
              </div>

              {/* Documento (CPF / CNPJ) com máscara e validação */}
              <div>
                <ValidatedInput
                  label={tipo === 'receita' ? 'CPF do Paciente' : 'CNPJ / CPF do Fornecedor'}
                  mask="cpf_cnpj"
                  value={documentoContraparte}
                  onChange={(e) => {
                    setDocumentoContraparte(e.target.value);
                    if (docError) {
                      setDocError(false);
                      setDocErrorMessage('');
                    }
                  }}
                  onBlur={() => {
                    if (documentoContraparte.trim() && !isValidCPFOrCNPJ(documentoContraparte)) {
                      setDocError(true);
                      setDocErrorMessage(
                        tipo === 'receita'
                          ? 'CPF inválido. Por favor, verifique os números.'
                          : 'CNPJ inválido. Por favor, verifique os números.'
                      );
                    } else {
                      setDocError(false);
                      setDocErrorMessage('');
                    }
                  }}
                  error={docError}
                  errorMessage={docErrorMessage}
                  placeholder={tipo === 'receita' ? '000.000.000-00' : '00.000.000/0000-00'}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                />
              </div>

              {/* Profissional Executante */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profissional Executante / Aprovador
                </label>
                <select
                  value={dentista}
                  onChange={(e) => setDentista(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A9396] cursor-pointer"
                >
                  <option value="Dr. Frankisney B. Souza (CRO-5950/MT) - Cirurgião Dentista">
                    Dr. Frankisney B. Souza (CRO-5950/MT) - Cirurgião Dentista
                  </option>
                  <option value="Dr. Silas Jr. B. Souza (CRO-5838/MT) - Implantodontista / Estética">
                    Dr. Silas Jr. B. Souza (CRO-5838/MT) - Implantodontista / Estética
                  </option>
                  <option value="Administração Central Odonto Souza">
                    Administração Central Odonto Souza
                  </option>
                </select>
              </div>

              {/* Unidade / Consultório */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unidade de Atendimento / Consultório
                </label>
                <select
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A9396] cursor-pointer"
                >
                  <option value="Unidade Principal - Consultório 01 (Lapa)">
                    Unidade Principal - Consultório 01 (Lapa)
                  </option>
                  <option value="Unidade Principal - Consultório 02 (Cirurgia)">
                    Unidade Principal - Consultório 02 (Cirurgia)
                  </option>
                  <option value="Unidade Jardins - Sala Estética">
                    Unidade Jardins - Sala Estética
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* SECÇÃO 3: Liquidação & Modalidade */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-4 rounded-full bg-[#005F73]" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                Liquidação &amp; Modalidade
              </h2>
            </div>

            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Situação da Liquidação */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Situação de Liquidação <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TransacaoStatus)}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A9396] cursor-pointer"
                  >
                    <option value="pago">Pago / Recebido (Compensado)</option>
                    <option value="pendente">Pendente de Pagamento</option>
                    <option value="atrasado">Atrasado / Em Cobrança</option>
                  </select>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Forma de Pagamento <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A9396] cursor-pointer"
                  >
                    <option value="PIX Instantâneo (QR Code Dinâmico)">
                      PIX Instantâneo (QR Code Dinâmico)
                    </option>
                    <option value="Cartão de Crédito (Maquininha Odonto)">
                      Cartão de Crédito (Maquininha Odonto)
                    </option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro Físico (Caixa Balcão)">
                      Dinheiro Físico (Caixa Balcão)
                    </option>
                    <option value="Boleto Bancário Registrado">
                      Boleto Bancário Registrado
                    </option>
                    <option value="Transferência TED / DOC">
                      Transferência TED / DOC
                    </option>
                  </select>
                </div>
              </div>

              {/* Data Efetiva da Liquidação */}
              {status === 'pago' && (
                <div className="p-4 rounded-xl bg-white border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        Data Efetiva da Liquidação
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Lançamento constará imediatamente no fechamento diário do caixa
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full md:w-60">
                    <input
                      type="date"
                      value={dataEfetiva}
                      onChange={(e) => setDataEfetiva(e.target.value)}
                      className="w-full h-10 px-3 text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A9396]"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECÇÃO 4: Comprovante e Observações Internas */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Anexo de Comprovante */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Comprovante / Nota Fiscal Digital
              </label>
              <div
                onClick={() => setArquivoAnexado('NFe_MarianaCosta_0492.pdf')}
                className="border-2 border-dashed border-slate-300 hover:border-[#0A9396] bg-slate-50/70 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition min-h-[140px]"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-[#005F73] flex items-center justify-center shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Clique para anexar arquivo ou arraste o comprovante
                </div>
                <span className="text-[11px] text-slate-400">
                  Formatos aceitos: PDF, PNG ou JPG (até 15MB)
                </span>

                {arquivoAnexado && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{arquivoAnexado}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Observações Internas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Observações Internas da Clínica
              </label>
              <textarea
                rows={5}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Paciente optou por parcelar saldo restante na sessão de polimento..."
                className="w-full p-3 text-xs sm:text-sm font-medium text-slate-800 bg-slate-50/70 border border-slate-300 rounded-2xl outline-none resize-none focus:ring-2 focus:ring-[#0A9396]"
              />
            </div>
          </section>

          {/* Resumo Rápido da Operação */}
          <div className="p-4 rounded-xl bg-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-[#005F73]" />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Conciliação Financeira Automática
                </span>
                <span className="text-[11px] text-slate-500">
                  Lançamento auditável sob o protocolo ODN-2025-0518
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                Total Líquido
              </span>
              <span
                className={`text-lg sm:text-xl font-extrabold ${
                  tipo === 'receita' ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {tipo === 'receita' ? '+' : '-'} R$ {valorStr}
              </span>
            </div>
          </div>

          {/* Rodapé Fixo de Ações */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                tipo === 'receita'
                  ? 'bg-[#005F73] hover:bg-[#004e5e] shadow-[#005F73]/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{tipo === 'receita' ? 'Salvar Receita' : 'Salvar Despesa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
