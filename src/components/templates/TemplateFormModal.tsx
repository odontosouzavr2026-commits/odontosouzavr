import React, { useState, useEffect } from 'react';
import { X, Check, MessageSquare, Plus, Code2 } from 'lucide-react';
import { WhatsAppTemplate, TemplateCategoria } from '../../types/templates';
import { useToast } from '../../contexts/ToastContext';

interface TemplateFormModalProps {
  isOpen: boolean;
  initialData?: WhatsAppTemplate | null;
  onClose: () => void;
  onSave: (template: Omit<WhatsAppTemplate, 'id'>) => void;
}

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const toast = useToast();
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<TemplateCategoria>(
    initialData?.category || 'agendamentos'
  );
  const [triggerTiming, setTriggerTiming] = useState(
    initialData?.triggerTiming || 'Disparo Automático: 2h antes'
  );
  const [content, setContent] = useState(
    initialData?.content ||
      'Olá *{{nome_paciente}}*! Lembramos da sua consulta com *{{dentista}}* hoje, dia *{{data_consulta}}* às *{{hora}}*. Por favor, responda 1 para CONFIRMAR ou 2 para REMARCAR.'
  );
  const [isActive, setIsActive] = useState(initialData ? initialData.active : true);

  // Sincroniza os campos sempre que um novo template for aberto para edição
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'agendamentos');
      setTriggerTiming(initialData.triggerTiming || 'Disparo Automático: 2h antes');
      setContent(initialData.content || '');
      setIsActive(initialData.active !== undefined ? initialData.active : true);
    } else {
      setName('');
      setCategory('agendamentos');
      setTriggerTiming('Disparo Automático: 2h antes');
      setContent(
        'Olá *{{nome_paciente}}*! Lembramos da sua consulta com *{{dentista}}* hoje, dia *{{data_consulta}}* às *{{hora}}*. Por favor, responda 1 para CONFIRMAR ou 2 para REMARCAR.'
      );
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const categoryOptions: { value: TemplateCategoria; label: string }[] = [
    { value: 'agendamentos', label: 'Agendamentos' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'pos_op', label: 'Clínico & Pós-Op' },
    { value: 'recalls', label: 'Prevenção & Recall' },
    { value: 'relacionamento', label: 'Relacionamento' },
  ];

  const quickTags = [
    '*{{nome_paciente}}*',
    '*{{data_consulta}}*',
    '*{{hora}}*',
    '*{{dentista}}*',
    '*{{procedimento}}*',
    '*{{chave_pix}}*',
  ];

  const handleInsertTag = (tag: string) => {
    setContent((prev) => prev + ' ' + tag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Campo obrigatório', 'Informe o título do template.');
      return;
    }
    if (!content.trim()) {
      toast.warning('Conteúdo vazio', 'Escreva a mensagem do template.');
      return;
    }

    const selectedCat = categoryOptions.find((c) => c.value === category);

    onSave({
      name,
      category,
      categoryLabel: selectedCat?.label || 'Agendamentos',
      triggerDescription: 'Gatilho configurado',
      triggerTiming,
      active: isActive,
      content,
      readRate: initialData?.readRate || 95,
      responseRate: initialData?.responseRate || 85,
      approvedMeta: true,
    });

    toast.success('Template salvo!', `O modelo "${name}" foi salvo com sucesso.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-[#005F73] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                {initialData ? 'Editar Template WhatsApp' : 'Novo Template WhatsApp'}
              </h2>
              <p className="text-xs text-cyan-200">
                Padrão em conformidade com as diretrizes da Meta Cloud API
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Nome do Template */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Título do Modelo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lembrete de Consulta (2h antes)"
              className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
            />
          </div>

          {/* Categoria e Gatilho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TemplateCategoria)}
                className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A9396] cursor-pointer"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Disparo / Gatilho
              </label>
              <input
                type="text"
                value={triggerTiming}
                onChange={(e) => setTriggerTiming(e.target.value)}
                placeholder="Ex: Disparo Automático: 2h antes"
                className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
              />
            </div>
          </div>

          {/* Conteúdo da Mensagem */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Texto do Template <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {content.length} caracteres
              </span>
            </div>

            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite a mensagem padrão..."
              className="w-full p-3 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
            />

            {/* Inserção rápida de variáveis */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Code2 className="w-3 h-3" /> Inserir tag:
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[#005F73] text-[11px] font-mono font-bold cursor-pointer"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Status Ativo Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">
              Disponível para disparos automáticos
            </span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center px-0.5 ${
                isActive ? 'bg-[#0A9396]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  isActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Footer de Ações */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#005F73] hover:bg-[#004e5e] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#005F73]/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Template</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
