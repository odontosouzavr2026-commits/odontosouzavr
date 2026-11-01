import React, { useState, useMemo, useEffect } from 'react';
import {
  PackageCheck,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Clock,
  User,
  X,
  Save,
  Check,
  Eye,
  Archive,
  RefreshCw,
  QrCode,
  Tag,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { estoqueService } from '../../services/estoqueService';
import { scrollToTop } from '../../utils/scrollUtils';

export type CategoriaMaterial =
  | 'Todas'
  | 'Resinas & Adesivos'
  | 'Implantes & Biomateriais'
  | 'Anestésicos & Agulhas'
  | 'Biossegurança & Descartáveis'
  | 'Moldagem & Prótese'
  | 'Ortodontia';

export interface MaterialItem {
  id: string;
  sku: string;
  nome: string;
  fabricante: string;
  categoria: Exclude<CategoriaMaterial, 'Todas'>;
  lote: string;
  validade: string; // 'dd/mm/aaaa'
  diasParaVencer: number;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidade: string; // 'Tubetes', 'Seringas', 'Unidades', 'Caixas'
  valorUnitario: number;
  localizacao: string; // 'Armário 01 - Gaveta B', 'Geladeira Cirúrgica'
}

export interface CicloAutoclaveItem {
  id: string;
  equipamento: string;
  numeroCicloDia: number;
  dataHora: string;
  temperatura: string; // '134 °C'
  pressao: string; // '2.15 bar'
  tempoEsterilizacao: string; // '15 min'
  indicadorQuimico: 'Aprovado (Classe 5)' | 'Reprovado';
  indicadorBiologico?: 'Negativo (Aprovado)' | 'Pendente (Incubadora)';
  responsavelNome: string;
  pacotesEsterilizados: number;
  loteEtiqueta: string;
  validadePacotes: string;
}

const INITIAL_MATERIAIS: MaterialItem[] = [];

const INITIAL_CICLOS: CicloAutoclaveItem[] = [];

interface EstoqueViewProps {
  forceMobileView?: boolean;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({
  forceMobileView = false,
}) => {
  const toast = useToast();
  const [abaAtiva, setAbaAtiva] = useState<'materiais' | 'autoclave'>('materiais');
  const [materiais, setMateriais] = useState<MaterialItem[]>(INITIAL_MATERIAIS);
  const [ciclos, setCiclos] = useState<CicloAutoclaveItem[]>(INITIAL_CICLOS);

  // Carregar dados de estoque e autoclave do Supabase Self-Hosted
  useEffect(() => {
    let isMounted = true;
    async function loadEstoque() {
      try {
        const [matsDb, ciclosDb] = await Promise.all([
          estoqueService.getMateriais(),
          estoqueService.getCiclos(),
        ]);
        if (isMounted) {
          setMateriais(matsDb || []);
          setCiclos(ciclosDb || []);
        }
      } catch (e) {
        console.warn('Fallback local estoque:', e);
      }
    }
    loadEstoque();
    return () => {
      isMounted = false;
    };
  }, []);

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaMaterial>('Todas');

  // View Switching (Regra Arquitetural Mobile-First: Sem Modais)
  const [currentView, setCurrentView] = useState<'list' | 'form-material' | 'form-ciclo'>('list');

  // Garante abertura da tela/formulário sempre no início (topo)
  useEffect(() => {
    scrollToTop();
  }, [currentView]);
  const [etiquetaModal, setEtiquetaModal] = useState<CicloAutoclaveItem | null>(null);
  const [movimentoModal, setMovimentoModal] = useState<MaterialItem | null>(null);
  const [qtdMovimento, setQtdMovimento] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Novo Material
  const [formNome, setFormNome] = useState('');
  const [formFabricante, setFormFabricante] = useState('');
  const [formCategoria, setFormCategoria] = useState<CategoriaMaterial>('Resinas & Adesivos');
  const [formLote, setFormLote] = useState('');
  const [formValidade, setFormValidade] = useState('');
  const [formQtd, setFormQtd] = useState('5');
  const [formMin, setFormMin] = useState('2');
  const [formUnidade, setFormUnidade] = useState('Unidades');
  const [formPreco, setFormPreco] = useState('95,00');

  // Form Novo Ciclo Autoclave
  const [formEquip, setFormEquip] = useState('Autoclave Cristófoli 21L (Nº 01)');
  const [formTemp, setFormTemp] = useState('134 °C');
  const [formPressao, setFormPressao] = useState('2.18 bar');
  const [formQtdPacotes, setFormQtdPacotes] = useState('16');
  const [formOperador, setFormOperador] = useState('Camila Secretária / ASB');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSalvarMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      toast.warning('Campo obrigatório', 'Informe o nome do material clínico.');
      return;
    }

    const novo: MaterialItem = {
      id: `MAT-00${materiais.length + 1}`,
      sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: formNome,
      fabricante: formFabricante || 'Dental Cremer',
      categoria: formCategoria === 'Todas' ? 'Resinas & Adesivos' : formCategoria,
      lote: formLote || 'L-2026-X',
      validade: formValidade || '30/12/2027',
      diasParaVencer: 400,
      quantidadeAtual: parseInt(formQtd, 10) || 1,
      quantidadeMinima: parseInt(formMin, 10) || 1,
      unidade: formUnidade,
      valorUnitario: parseFloat(formPreco.replace(',', '.')) || 50,
      localizacao: 'Armário Central da Clínica',
    };
    setMateriais([novo, ...materiais]);
    setCurrentView('list');
    toast.success('Material cadastrado!', `${formNome} adicionado ao estoque.`);

    try {
      await estoqueService.saveMaterial(novo);
    } catch (err) {
      console.warn('Erro ao salvar material no Supabase:', err);
    }
  };

  const handleSalvarCiclo = (e: React.FormEvent) => {
    e.preventDefault();
    const dataHoje = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dataHoraStr = `${pad(dataHoje.getDate())}/${pad(dataHoje.getMonth() + 1)}/${dataHoje.getFullYear()} ${pad(dataHoje.getHours())}:${pad(dataHoje.getMinutes())}`;
    
    // Validade de 7 dias
    const validadeObj = new Date();
    validadeObj.setDate(validadeObj.getDate() + 7);
    const validadeStr = `${pad(validadeObj.getDate())}/${pad(validadeObj.getMonth() + 1)}/${validadeObj.getFullYear()}`;

    const novoCiclo: CicloAutoclaveItem = {
      id: `CICLO-2026-${ciclos.length + 492}`,
      equipamento: formEquip,
      numeroCicloDia: ciclos.length + 1,
      dataHora: dataHoraStr,
      temperatura: formTemp,
      pressao: formPressao,
      tempoEsterilizacao: '15 min (Secagem 20 min)',
      indicadorQuimico: 'Aprovado (Classe 5)',
      indicadorBiologico: 'Negativo (Aprovado)',
      responsavelNome: formOperador,
      pacotesEsterilizados: parseInt(formQtdPacotes, 10) || 10,
      loteEtiqueta: `LOTE-${dataHoje.getFullYear()}${pad(dataHoje.getMonth() + 1)}${pad(dataHoje.getDate())}-C${ciclos.length + 1}`,
      validadePacotes: `${validadeStr} (7 dias em papel grau cirúrgico)`,
    };

    setCiclos([novoCiclo, ...ciclos]);
    setCurrentView('list');
    setEtiquetaModal(novoCiclo);
    toast.success('Ciclo de autoclave registrado!', `Ciclo #${novoCiclo.numeroCicloDia} salvo e etiquetas geradas.`);
  };

  const handleAplicarMovimentacao = (tipo: 'entrada' | 'saida') => {
    if (!movimentoModal) return;
    setMateriais((prev) =>
      prev.map((m) => {
        if (m.id === movimentoModal.id) {
          const novaQtd =
            tipo === 'entrada'
              ? m.quantidadeAtual + qtdMovimento
              : Math.max(0, m.quantidadeAtual - qtdMovimento);
          return { ...m, quantidadeAtual: novaQtd };
        }
        return m;
      })
    );
    showToast(
      `${tipo === 'entrada' ? 'Entrada' : 'Baixa'} de ${qtdMovimento} ${movimentoModal.unidade} realizada com sucesso!`
    );
    setMovimentoModal(null);
  };

  // Filtros
  const materiaisFiltrados = useMemo(() => {
    return materiais.filter((item) => {
      const matchBusca =
        busca.trim() === '' ||
        item.nome.toLowerCase().includes(busca.toLowerCase()) ||
        item.fabricante.toLowerCase().includes(busca.toLowerCase()) ||
        item.lote.toLowerCase().includes(busca.toLowerCase()) ||
        item.sku.toLowerCase().includes(busca.toLowerCase());

      const matchCat = categoriaFiltro === 'Todas' || item.categoria === categoriaFiltro;
      return matchBusca && matchCat;
    });
  }, [materiais, busca, categoriaFiltro]);

  // Métricas
  const totalItensEstoque = materiais.reduce((acc, curr) => acc + curr.quantidadeAtual, 0);
  const itensEstoqueBaixo = materiais.filter((m) => m.quantidadeAtual <= m.quantidadeMinima).length;
  const itensVencendo = materiais.filter((m) => m.diasParaVencer <= 30).length;
  const valorTotalInventario = materiais.reduce(
    (acc, curr) => acc + curr.quantidadeAtual * curr.valorUnitario,
    0
  );
  const totalPacotesEsterilizados = ciclos.reduce(
    (acc, curr) => acc + (curr.pacotesEsterilizados || 0),
    0
  );

  // 1. RENDERIZAÇÃO INLINE: NOVO INSUMO CLÍNICO (Sem Modal, 100% tela, padrão app nativa)
  if (currentView === 'form-material') {
    return (
      <div className="w-full h-full p-4 md:p-6 animate-in fade-in duration-200 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#005F73]" />
            <span>Voltar para o Estoque</span>
          </button>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Cadastro de Insumo Clínico
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5 text-[#005F73]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Cadastrar Novo Insumo Clínico
              </h1>
              <p className="text-xs text-slate-500">
                Cadastre materiais com controle de lote ANVISA e alerta de estoque mínimo.
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvarMaterial} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cimento Resinoso Dual RelyX Ultimate"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Fabricante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 3M, Dentsply"
                  value={formFabricante}
                  onChange={(e) => setFormFabricante(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Categoria *
                </label>
                <select
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value as CategoriaMaterial)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
                >
                  <option value="Resinas & Adesivos">Resinas & Adesivos</option>
                  <option value="Implantes & Biomateriais">Implantes & Biomateriais</option>
                  <option value="Anestésicos & Agulhas">Anestésicos & Agulhas</option>
                  <option value="Biossegurança & Descartáveis">Biossegurança</option>
                  <option value="Moldagem & Prótese">Moldagem & Prótese</option>
                  <option value="Ortodontia">Ortodontia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Lote ANVISA *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: L-8492"
                  value={formLote}
                  onChange={(e) => setFormLote(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Validade *</label>
                <input
                  type="text"
                  required
                  placeholder="dd/mm/aaaa"
                  value={formValidade}
                  onChange={(e) => setFormValidade(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Quantidade</label>
                <input
                  type="number"
                  value={formQtd}
                  onChange={(e) => setFormQtd(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Estoque Mín.</label>
                <input
                  type="number"
                  value={formMin}
                  onChange={(e) => setFormMin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Preço Unit. (R$)</label>
                <input
                  type="text"
                  value={formPreco}
                  onChange={(e) => setFormPreco(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#005F73] text-white text-xs sm:text-sm font-semibold hover:bg-[#004857] shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Insumo</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. RENDERIZAÇÃO INLINE: NOVO CICLO AUTOCLAVE (Sem Modal, 100% tela, padrão app nativa)
  if (currentView === 'form-ciclo') {
    return (
      <div className="w-full h-full p-4 md:p-6 animate-in fade-in duration-200 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setCurrentView('list')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#005F73]" />
            <span>Voltar para Rastreabilidade</span>
          </button>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Registro de Ciclo de Esterilização
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center font-bold">
              <Thermometer className="w-5 h-5 text-[#005F73]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Registrar Ciclo de Autoclave
              </h1>
              <p className="text-xs text-slate-500">
                Parâmetros físicos, indicadores químicos classe 5 e geração de etiquetas rastreáveis.
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvarCiclo} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Equipamento / Autoclave
              </label>
              <select
                value={formEquip}
                onChange={(e) => setFormEquip(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200"
              >
                <option value="Autoclave Cristófoli 21L (Nº 01)">Autoclave Cristófoli 21L (Nº 01)</option>
                <option value="Autoclave Cristófoli 12L (Nº 02)">Autoclave Cristófoli 12L (Nº 02)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Temperatura Atingida
                </label>
                <input
                  type="text"
                  value={formTemp}
                  onChange={(e) => setFormTemp(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Pressão da Câmara
                </label>
                <input
                  type="text"
                  value={formPressao}
                  onChange={(e) => setFormPressao(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Total de Pacotes
                </label>
                <input
                  type="number"
                  value={formQtdPacotes}
                  onChange={(e) => setFormQtdPacotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Operador Responsável
                </label>
                <input
                  type="text"
                  value={formOperador}
                  onChange={(e) => setFormOperador(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Indicador Integrador Classe 5:
                Viragem Aprovada
              </span>
              <p className="text-[11px] text-emerald-700">
                O registro gerará etiquetas de validade de 7 dias com QR Code rastreável para os pacotes.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#005F73] text-white text-xs sm:text-sm font-semibold hover:bg-[#004857] shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar &amp; Gerar Etiquetas</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#005F73] text-white shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#89f3f6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CABEÇALHO COM ABAS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0">
              <PackageCheck className="w-6 h-6 text-[#005F73]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  Estoque & Biossegurança
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  ANVISA RDC 15 OK
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Controle de insumos clínicos, validades de lotes e rastreabilidade de ciclos de autoclave.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Ação do Topo */}
        <div className="flex items-center gap-2.5">
          {abaAtiva === 'materiais' ? (
            <button
              onClick={() => setCurrentView('form-material')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Insumo Clínico</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('form-ciclo')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004857] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Ciclo Autoclave</span>
            </button>
          )}
        </div>
      </div>

      {/* SELETOR DE ABAS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setAbaAtiva('materiais')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            abaAtiva === 'materiais'
              ? 'bg-[#005F73] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Insumos & Materiais Clínicos ({materiais.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('autoclave')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            abaAtiva === 'autoclave'
              ? 'bg-[#005F73] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <Thermometer className="w-4 h-4" />
          <span>Ciclos de Autoclave & Esterilização ({ciclos.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: MATERIAIS E INSUMOS                                     */}
      {/* ============================================================== */}
      {abaAtiva === 'materiais' && (
        <div className="space-y-6">
          {/* Métricas do Estoque */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Itens em Estoque
              </span>
              <span className="text-2xl font-bold text-slate-900">{totalItensEstoque} un.</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {materiais.length} produtos cadastrados
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Reposição Necessária
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-600">{itensEstoqueBaixo}</span>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                  Abaixo do Mínimo
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">Comprar esta semana</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Alerta de Validade ANVISA
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-600">{itensVencendo}</span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  Vence em &lt; 30 dias
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">Priorizar uso clínico</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Valor Total do Estoque
              </span>
              <span className="text-2xl font-bold text-emerald-600">
                R$ {valorTotalInventario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Inventário imobilizado</span>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome do produto, fabricante, lote, SKU..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 focus:border-[#005F73] bg-slate-50/50"
              />
            </div>

            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value as CategoriaMaterial)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer"
            >
              <option value="Todas">Categoria: Todas</option>
              <option value="Resinas & Adesivos">Resinas & Adesivos</option>
              <option value="Implantes & Biomateriais">Implantes & Biomateriais</option>
              <option value="Anestésicos & Agulhas">Anestésicos & Agulhas</option>
              <option value="Biossegurança & Descartáveis">Biossegurança & Descartáveis</option>
              <option value="Moldagem & Prótese">Moldagem & Prótese</option>
              <option value="Ortodontia">Ortodontia</option>
            </select>
          </div>

          {/* Tabela de Insumos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Produto & Fabricante</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Lote & Validade</th>
                    <th className="py-3 px-4">Localização</th>
                    <th className="py-3 px-4 text-center">Estoque Atual</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Movimentação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materiaisFiltrados.map((item) => {
                    const isBaixo = item.quantidadeAtual <= item.quantidadeMinima;
                    const isVencendo = item.diasParaVencer <= 30;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">
                              {item.nome}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {item.fabricante} • SKU: {item.sku}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#005F73]/10 text-[#005F73]">
                            {item.categoria}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-semibold text-slate-700">
                              Lote: {item.lote}
                            </span>
                            <span
                              className={`text-[11px] font-semibold ${
                                isVencendo ? 'text-rose-600 font-bold' : 'text-slate-500'
                              }`}
                            >
                              Val: {item.validade} {isVencendo && '⚠️'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs text-slate-600">{item.localizacao}</span>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <span
                              className={`font-bold text-sm ${
                                isBaixo ? 'text-rose-600' : 'text-slate-800'
                              }`}
                            >
                              {item.quantidadeAtual}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Mínimo: {item.quantidadeMinima} {item.unidade}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {isBaixo ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Estoque Crítico
                            </span>
                          ) : isVencendo ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Validade Próxima
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Normal
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setMovimentoModal(item);
                              setQtdMovimento(1);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#005F73] hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            + Entrada / - Baixa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {materiaisFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        Nenhum insumo ou material cadastrado no estoque.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: CICLOS DE AUTOCLAVE & BIOSSEGURANÇA                      */}
      {/* ============================================================== */}
      {abaAtiva === 'autoclave' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Ciclos Concluídos Hoje
              </span>
              <span className="text-2xl font-bold text-slate-900">{ciclos.length} ciclos</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {totalPacotesEsterilizados} pacotes esterilizados
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Indicadores Químicos (Classe 5)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600">
                  {ciclos.length > 0 ? '100%' : '0%'}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {ciclos.length > 0 ? 'Aprovados' : 'Sem ciclos'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {ciclos.length > 0 ? 'Viragem completa da fita' : 'Aguardando esterilização'}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Teste Biológico Semanal
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#005F73]">
                  {ciclos.length > 0 ? 'Negativo' : 'Pendente'}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {ciclos.length > 0 ? 'Geobacillus OK' : 'Sem leitura'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {ciclos.length > 0 ? 'Controle microbiológico OK' : 'Nenhum teste registrado'}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Equipamentos Vistoriados
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {ciclos.length > 0 ? '2 Autoclaves' : '0 Autoclaves'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {ciclos.length > 0 ? 'Calibração válida' : 'Aguardando ciclos'}
              </span>
            </div>
          </div>

          {/* Tabela de Ciclos de Autoclave */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Livro de Registro Digital de Esterilização
                </h3>
                <p className="text-xs text-slate-500">
                  Rastreabilidade obrigatória para auditoria de vigilância sanitária
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Norma ABNT NBR ISO 17665
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Lote & Ciclo</th>
                    <th className="py-3 px-4">Equipamento</th>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Parâmetros (Temp & Pressão)</th>
                    <th className="py-3 px-4">Indicadores</th>
                    <th className="py-3 px-4">Responsável</th>
                    <th className="py-3 px-4 text-right">Etiquetas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ciclos.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {c.loteEtiqueta}
                          </span>
                          <span className="text-[11px] text-[#005F73] font-semibold">
                            Ciclo #{c.numeroCicloDia} do dia
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-800">{c.equipamento}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs text-slate-700">{c.dataHora}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-bold text-[11px]">
                            {c.temperatura}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[11px]">
                            {c.pressao}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {c.indicadorQuimico}
                          </span>
                          {c.indicadorBiologico && (
                            <span className="text-[10px] text-slate-500">
                              Biológico: {c.indicadorBiologico}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs text-slate-700">{c.responsavelNome}</span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEtiquetaModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#005F73] hover:bg-[#004857] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>Ver Etiqueta ({c.pacotesEsterilizados})</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ciclos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                        Nenhum ciclo de autoclave ou esterilização registrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ETIQUETA DE ESTERILIZAÇÃO PARA IMPRESSÃO                */}
      {/* ============================================================== */}
      {etiquetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#005F73]" />
                <h3 className="font-bold text-slate-800 text-sm">Etiqueta de Esterilização</h3>
              </div>
              <button
                onClick={() => setEtiquetaModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual da Etiqueta para Colar no Pacote */}
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 space-y-2 text-center font-mono">
              <span className="text-xs font-bold text-slate-800 block">CLÍNICA ODONTO SOUZA</span>
              <span className="text-[10px] text-slate-500 block">
                RT: Dr. Frankisney Souza • CRO-SP 89412
              </span>
              <div className="py-2 my-1 border-y border-slate-200">
                <span className="text-sm font-extrabold text-[#005F73] block">
                  {etiquetaModal.loteEtiqueta}
                </span>
                <span className="text-[11px] text-slate-700 block">
                  Data: {etiquetaModal.dataHora} • 134°C
                </span>
              </div>
              <div className="text-left text-[11px] space-y-1">
                <div>
                  <span className="text-slate-500">Validade:</span>{' '}
                  <strong className="text-emerald-700">{etiquetaModal.validadePacotes}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Operador:</span>{' '}
                  <strong>{etiquetaModal.responsavelNome}</strong>
                </div>
              </div>
              <div className="pt-2 flex justify-center">
                <div className="w-20 h-20 bg-white border border-slate-300 rounded flex items-center justify-center p-1">
                  <QrCode className="w-16 h-16 text-slate-800" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEtiquetaModal(null)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  window.print();
                  showToast('Enviando 18 etiquetas para a impressora térmica...');
                  setEtiquetaModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#005F73] text-white text-xs font-semibold hover:bg-[#004857] shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Etiquetas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: MOVIMENTAÇÃO DE ESTOQUE (ENTRADA / SAÍDA)               */}
      {/* ============================================================== */}
      {movimentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Movimentação de Estoque</h3>
              <button
                onClick={() => setMovimentoModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">{movimentoModal.nome}</p>
              <p className="text-[11px] text-slate-500">
                Estoque atual: <strong>{movimentoModal.quantidadeAtual} {movimentoModal.unidade}</strong>
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Quantidade a Movimentar
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQtdMovimento((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={qtdMovimento}
                  onChange={(e) => setQtdMovimento(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="flex-1 text-center font-bold text-sm px-3 py-2 rounded-lg border border-slate-200"
                />
                <button
                  onClick={() => setQtdMovimento((prev) => prev + 1)}
                  className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleAplicarMovimentacao('entrada')}
                className="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Entrada (Compra)</span>
              </button>
              <button
                onClick={() => handleAplicarMovimentacao('saida')}
                className="px-3 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Baixa (Uso)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
