import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Clock,
  ClipboardList,
  Sparkles,
  Info,
  Check,
  X,
  PlusCircle,
  Tag,
  Layers,
  Timer,
  Hash,
} from 'lucide-react';
import { ProcedimentoItem, ProcedimentoCategoria } from '../../types/procedimentos';
import { useToast } from '../../contexts/ToastContext';
import { scrollToTop } from '../../utils/scrollUtils';

interface ProcedimentoFormViewProps {
  initialData?: ProcedimentoItem | null;
  onSave: (procedimento: Omit<ProcedimentoItem, 'id'>) => void;
  onCancel: () => void;
  isMobile?: boolean;
}

export const ProcedimentoFormView: React.FC<ProcedimentoFormViewProps> = ({
  initialData,
  onSave,
  onCancel,
  isMobile = false,
}) => {
  const toast = useToast();

  // Sempre rola para o topo no momento da abertura do formulário
  useEffect(() => {
    scrollToTop();
  }, []);

  const [code, setCode] = useState(initialData?.code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<ProcedimentoCategoria>(initialData?.category || 'prevencao');
  const [isFree, setIsFree] = useState<boolean>(initialData ? initialData.price === 0 : false);
  const [priceStr, setPriceStr] = useState(
    initialData
      ? initialData.price === 0
        ? '0,00'
        : initialData.price.toFixed(2).replace('.', ',')
      : ''
  );
  const [duration, setDuration] = useState<number>(initialData?.durationMinutes || 45);
  const [isActive, setIsActive] = useState<boolean>(initialData ? initialData.active : true);
  const [description, setDescription] = useState(initialData?.description || '');
  const [showInOdontogram, setShowInOdontogram] = useState(
    initialData?.showInOdontogram ?? true
  );
  const [syncWithDrSouza, setSyncWithDrSouza] = useState(
    initialData?.syncWithDrSouza ?? true
  );

  const durationOptions = [15, 30, 45, 60, 75, 90];

  const categoryLabels: Record<ProcedimentoCategoria, string> = {
    prevencao: 'Prevenção',
    dentistica: 'Dentística Restauradora',
    cirurgia: 'Cirurgia Bucomaxilofacial',
    estetica: 'Estética Dental',
    endodontia: 'Endodontia',
    implantodontia: 'Implantodontia',
    ortodontia: 'Ortodontia',
    protese: 'Prótese Dentária',
    odontopediatria: 'Odontopediatria',
  };

  const handleSuggestCode = () => {
    const randomCode = `PR-0${Math.floor(100 + Math.random() * 900)}`;
    setCode(randomCode);
  };

  const handleToggleFree = (checked: boolean) => {
    setIsFree(checked);
    if (checked) {
      setPriceStr('0,00');
    } else {
      if (priceStr === '0,00' || priceStr === '0' || !priceStr.trim()) {
        setPriceStr('150,00');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Campo obrigatório', 'Informe o nome do procedimento.');
      return;
    }

    const numericPrice = isFree
      ? 0
      : parseFloat(priceStr.replace(/\./g, '').replace(',', '.')) || 0;

    if (!isFree && numericPrice <= 0) {
      toast.warning(
        'Atenção ao valor',
        'Informe o valor do procedimento ou marque a opção "Procedimento Gratuito / Cortesia".'
      );
      return;
    }

    onSave({
      code,
      name,
      category,
      categoryLabel: categoryLabels[category],
      description,
      durationMinutes: duration,
      price: numericPrice,
      active: isActive,
      showInOdontogram,
      syncWithDrSouza,
    });

    toast.success(
      initialData ? 'Procedimento atualizado!' : 'Procedimento cadastrado!',
      `${name} (${code}) salvo na tabela de procedimentos com sucesso.`
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Bar / Navegação de Retorno Estilo App Nativa */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onCancel}
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#005F73]" />
          <span>Voltar para Procedimentos</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {initialData ? 'Edição de Procedimento' : 'Novo Procedimento Clínico'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Tabela Particular 2025
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-8 relative">
        {/* Header do Formulário */}
        <header className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5 text-[#005F73]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {initialData ? 'Editar Procedimento' : 'Cadastrar Procedimento'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Preencha os detalhes para adicionar um novo serviço ao catálogo da clínica.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-fit">
              <span className="text-rose-500 font-bold">*</span> Campos obrigatórios para cobrança e agenda
            </div>
          </div>
        </header>

        {/* Formulário com Seções */}
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* SECÇÃO 1: Informações Básicas */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
              <div className="p-1.5 rounded-lg bg-[#0A9396]/10 text-[#0A9396]">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                1. Informações Básicas
              </h2>
              <span className="text-xs text-slate-400 font-normal">Identificação e taxonomia</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
              {/* Código */}
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Código <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestCode}
                    className="inline-flex items-center gap-1 text-[#0A9396] hover:text-[#005F73] text-[11px] font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#0A9396]" />
                    <span>Auto</span>
                  </button>
                </div>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: 0101"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396]"
                  />
                </div>
              </div>

              {/* Nome do Procedimento */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome do Procedimento <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Profilaxia e Raspagem Supra Gengival"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Nome visível no orçamento e prontuário do paciente.</p>
              </div>

              {/* Categoria Clínica */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria Clínica <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProcedimentoCategoria)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] appearance-none cursor-pointer"
                  >
                    <option value="prevencao">Prevenção</option>
                    <option value="dentistica">Dentística</option>
                    <option value="cirurgia">Cirurgia</option>
                    <option value="protese">Prótese</option>
                    <option value="ortodontia">Ortodontia</option>
                    <option value="endodontia">Endodontia</option>
                    <option value="estetica">Estética Dental</option>
                    <option value="implantodontia">Implantodontia</option>
                    <option value="odontopediatria">Odontopediatria</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Define cor e agrupamento nos relatórios.</p>
              </div>
            </div>
          </section>

          {/* SECÇÃO 2: Valores, Duração & Reserva de Cadeira */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
              <div className="p-1.5 rounded-lg bg-[#0A9396]/10 text-[#0A9396]">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                2. Valores, Duração &amp; Reserva de Cadeira
              </h2>
              <span className="text-xs text-slate-400 font-normal">Impacto direto na agenda e caixa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
              {/* Valor do Procedimento (R$) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Valor Base Particular (R$) <span className="text-rose-500">*</span>
                  </label>
                  {isFree && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      GRÁTIS
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-sm text-[#00696c]">R$</span>
                  <input
                    type="text"
                    required
                    value={isFree ? '0,00' : priceStr}
                    disabled={isFree}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPriceStr(val);
                      const num = parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
                      if (num === 0 && val.trim() !== '') {
                        setIsFree(true);
                      }
                    }}
                    placeholder="0,00"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl text-base font-bold shadow-2xs focus:ring-2 focus:ring-[#0A9396] transition-all ${
                      isFree
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {/* Opção Procedimento Grátis / Avaliação Cortesia */}
                <label className="flex items-center gap-2.5 mt-2.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => handleToggleFree(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-emerald-950 block leading-tight">
                      Procedimento Gratuito / Avaliação
                    </span>
                    <span className="text-[10px] text-emerald-700 block leading-tight">
                      Isento de cobrança (R$ 0,00).
                    </span>
                  </div>
                </label>
              </div>

              {/* Duração Estimada */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Duração Estimada <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-[#0A9396] font-semibold">{duration} min</span>
                </div>
                {/* Touch Chips Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDuration(opt)}
                      className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        duration === opt
                          ? 'bg-[#005F73] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {opt} min
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Bloqueio automático na Agenda Clínica.</p>
              </div>

              {/* Status no Catálogo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status no Catálogo
                </label>
                <div className="h-[42px] flex items-center justify-between px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                    <span>{isActive ? 'Disponível para Venda' : 'Inativo / Pausado'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer flex items-center px-0.5 ${
                      isActive ? 'bg-[#00696c]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Quando inativo, fica oculto para orçamentos.</p>
              </div>
            </div>
          </section>

          {/* SECÇÃO 3: Detalhes Clínicos & Odontograma */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
              <div className="p-1.5 rounded-lg bg-[#0A9396]/10 text-[#0A9396]">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                3. Detalhes &amp; Prontuário
              </h2>
              <span className="text-xs text-slate-400 font-normal">Instruções para a equipe clínica</span>
            </div>

            <div className="space-y-4 pt-1">
              {/* Descrição Técnica */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Descrição Técnica / Observações do Serviço
                  </label>
                  <span className="text-[11px] text-slate-400">{description.length}/300 caracteres</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Profilaxia completa com jato de bicarbonato, raspagem periodontal de cálculo supragengival..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 shadow-2xs resize-none focus:ring-2 focus:ring-[#0A9396]"
                />
              </div>

              {/* Comportamento no Prontuário Eletrônico */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Comportamento no Prontuário Eletrônico
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={showInOdontogram}
                      onChange={(e) => setShowInOdontogram(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#005F73] focus:ring-[#0A9396]"
                    />
                    <span>
                      Exibir no seletor rápido do <strong className="text-slate-900">Odontograma Interativo</strong>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={syncWithDrSouza}
                      onChange={(e) => setSyncWithDrSouza(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#005F73] focus:ring-[#0A9396]"
                    />
                    <span>Sincronizar valor com a tabela de procedimentos padrão do Dr. Frankisney Souza</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Callout Informativo */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#005F73]/5 border border-[#005F73]/15 text-xs text-slate-700">
            <Info className="w-4 h-4 text-[#005F73] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#005F73]">Impacto Imediato no Sistema Clínico:</p>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                Ao salvar, este procedimento estará disponível instantaneamente no catálogo de{' '}
                <strong>Gestão de Procedimentos</strong>, na <strong>Agenda de Consultório</strong> e na emissão de novos{' '}
                <strong>Prontuários &amp; Orçamentos</strong>.
              </p>
            </div>
          </div>

          {/* Rodapé de Ações */}
          <footer className="pt-4 border-t border-slate-200/80 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-400" />
              Cancelar
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004e5e] text-white font-bold text-xs sm:text-sm transition shadow-md shadow-[#005F73]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Salvar Procedimento</span>
            </button>
          </footer>
        </form>
      </div>

      {/* Rodapé Técnico Institucional */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 px-2 py-1 gap-1">
        <span>ODONTO SOUZA • Módulo de Configurações Clínicas</span>
        <span className="font-mono">ProcedimentoFormView.tsx</span>
      </div>
    </div>
  );
};
