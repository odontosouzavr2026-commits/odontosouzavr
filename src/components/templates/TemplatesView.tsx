import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Sliders,
  Search,
  CheckCircle,
  Phone,
  Zap,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  WhatsAppTemplate,
  TemplateCategoria,
  TemplatesMetrics,
} from '../../types/templates';
import { TemplatesMetricsRow } from './TemplatesMetricsRow';
import { TemplateCard } from './TemplateCard';
import { DynamicVariablesTray } from './DynamicVariablesTray';
import { TemplateFormModal } from './TemplateFormModal';
import { TestTemplateModal } from './TestTemplateModal';
import { ConfigurarGatilhosModal } from './ConfigurarGatilhosModal';
import { templateService } from '../../services/templateService';
import { evolutionApiService } from '../../services/evolutionApiService';
import { scrollToTop } from '../../utils/scrollUtils';

interface TemplatesViewProps {
  forceMobileView?: boolean;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  forceMobileView = false,
}) => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() =>
    templateService.getTemplates()
  );
  const [metrics, setMetrics] = useState<TemplatesMetrics>(() =>
    templateService.getMetrics()
  );

  // Status Real da Conexão WhatsApp
  const [waState, setWaState] = useState<'open' | 'connecting' | 'close' | 'refused' | string>('open');
  const [waProfile, setWaProfile] = useState<string>('Odonto Souza • (66) 98445-4825');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [onlyActiveFilter, setOnlyActiveFilter] = useState<boolean>(true);

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [testingTemplate, setTestingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isGatilhosModalOpen, setIsGatilhosModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const { state } = await evolutionApiService.getConnectionState();
      setWaState(state);
      const details = await evolutionApiService.fetchInstanceDetails();
      if (details) {
        const name = details.profileName || 'WhatsApp OdontoSouza';
        const jid = details.ownerJid ? details.ownerJid.split('@')[0] : '';
        const formatted = jid
          ? `+${jid.slice(0, 2)} (${jid.slice(2, 4)}) ${jid.slice(4)}`
          : '(66) 98445-4825';
        setWaProfile(`${name} • ${formatted}`);
      }
    } catch (e) {
      console.warn('Erro ao verificar conexão WhatsApp:', e);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  useEffect(() => {
    scrollToTop();
    checkConnection();
  }, []);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleToggleActive = (tpl: WhatsAppTemplate) => {
    const { template: updated, allTemplates } = templateService.toggleTemplateActive(tpl.id);
    setTemplates(allTemplates);
    setMetrics(templateService.getMetrics());

    showToast(
      updated.active
        ? `Template "${updated.name}" ativado com sucesso para disparos automáticos!`
        : `Template "${updated.name}" foi pausado.`
    );
  };

  const handleOpenNew = () => {
    setEditingTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (tpl: WhatsAppTemplate) => {
    setEditingTemplate(tpl);
    setIsFormModalOpen(true);
  };

  const handleDuplicate = (tpl: WhatsAppTemplate) => {
    const updated = templateService.duplicateTemplate(tpl.id);
    setTemplates(updated);
    setMetrics(templateService.getMetrics());
    showToast(`Template duplicado com sucesso!`);
  };

  const handleSaveTemplate = (data: Omit<WhatsAppTemplate, 'id'>) => {
    const updated = templateService.upsertTemplate(data, editingTemplate?.id);
    setTemplates(updated);
    setMetrics(templateService.getMetrics());

    showToast(
      editingTemplate
        ? `Template "${data.name}" atualizado com sucesso!`
        : `Novo template "${data.name}" cadastrado e ativado!`
    );

    setIsFormModalOpen(false);
    setEditingTemplate(null);
  };

  const handleTestSuccess = (patientName: string, phone: string) => {
    setMetrics(templateService.getMetrics());
    showToast(`Mensagem WhatsApp enviada com sucesso para ${patientName} (${phone})!`);
  };

  // Contagem dinâmica por categoria
  const categoryCounts = useMemo(() => {
    return {
      todos: templates.length,
      agendamentos: templates.filter((t) => t.category === 'agendamentos').length,
      financeiro: templates.filter((t) => t.category === 'financeiro').length,
      pos_op: templates.filter((t) => t.category === 'pos_op').length,
      recalls: templates.filter((t) => t.category === 'recalls').length,
      relacionamento: templates.filter((t) => t.category === 'relacionamento').length,
    };
  }, [templates]);

  // Filtragem
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesSearch =
        searchQuery === '' ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === 'todos' || tpl.category === activeCategory;

      const matchesActive = onlyActiveFilter ? tpl.active : true;

      return matchesSearch && matchesCategory && matchesActive;
    });
  }, [templates, searchQuery, activeCategory, onlyActiveFilter]);

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#005F73] text-white rounded-xl shadow-lg border border-[#0A9396] text-xs sm:text-sm font-semibold animate-slideDown">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Quick Actions */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Automação e Templates (WhatsApp)
            </h1>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                waState === 'open'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                  : 'bg-amber-50 text-amber-800 border-amber-200/60'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {waState === 'open' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    waState === 'open' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="text-xs font-semibold">
                {waState === 'open' ? 'Evolution WhatsApp Conectado' : 'WhatsApp Desconectado'}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-full font-semibold border border-slate-200">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{waProfile}</span>
              <button
                type="button"
                onClick={checkConnection}
                disabled={isCheckingConnection}
                className="ml-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Atualizar status da conexão"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isCheckingConnection ? 'animate-spin' : ''}`}
                />
              </button>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Gerencie gatilhos automáticos, disparos de mensagens e modelos personalizados para comunicação com pacientes na clínica ODONTO SOUZA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setIsGatilhosModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#005F73] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Configurar Gatilhos</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004e5e] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#005F73]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Template</span>
          </button>
        </div>
      </div>

      {/* 4 Cards de Métricas (Bento Grid) */}
      <TemplatesMetricsRow metrics={metrics} isMobile={forceMobileView} />

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título ou tag..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 transition-all"
            />
          </div>

          {/* Toggle de Apenas Ativos vs Todos */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-medium text-slate-500">Exibição:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOnlyActiveFilter(true)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  onlyActiveFilter
                    ? 'bg-white text-[#005F73] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Apenas Ativos ({metrics.activeCount})
              </button>
              <button
                type="button"
                onClick={() => setOnlyActiveFilter(false)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  !onlyActiveFilter
                    ? 'bg-white text-[#005F73] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({metrics.totalCount})
              </button>
            </div>
          </div>
        </div>

        {/* Pílulas de Categorias */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setActiveCategory('todos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'todos'
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({categoryCounts.todos})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('agendamentos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'agendamentos'
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Agendamentos ({categoryCounts.agendamentos})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('financeiro')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'financeiro'
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Financeiro ({categoryCounts.financeiro})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('pos_op')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'pos_op'
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pós-Operatório &amp; Retorno ({categoryCounts.pos_op})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('recalls')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'recalls'
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Prevenção &amp; Recalls ({categoryCounts.recalls})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('relacionamento')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'relacionamento'
                ? 'bg-[#005F73] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Relacionamento ({categoryCounts.relacionamento})
          </button>
        </div>
      </div>

      {/* Grid de Templates (3 colunas no desktop, stack no mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onToggleActive={handleToggleActive}
            onTest={(tpl) => setTestingTemplate(tpl)}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
          />
        ))}
      </div>

      {/* Tray de Variáveis Dinâmicas */}
      <DynamicVariablesTray isMobile={forceMobileView} />

      {/* Modais de Suporte */}
      <TemplateFormModal
        key={editingTemplate ? editingTemplate.id : 'new-template'}
        isOpen={isFormModalOpen}
        initialData={editingTemplate}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
      />

      <TestTemplateModal
        template={testingTemplate}
        onClose={() => setTestingTemplate(null)}
        onSendSuccess={handleTestSuccess}
      />

      <ConfigurarGatilhosModal
        isOpen={isGatilhosModalOpen}
        onClose={() => setIsGatilhosModalOpen(false)}
        onSave={() => showToast('Parâmetros de gatilhos automáticos atualizados com sucesso!')}
      />
    </div>
  );
};
