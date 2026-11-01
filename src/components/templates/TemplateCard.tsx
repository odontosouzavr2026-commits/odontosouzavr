import React from 'react';
import {
  Clock,
  CheckCircle,
  Send,
  Pencil,
  Copy,
  MoreVertical,
  MessageSquare,
  Play,
  RotateCcw,
} from 'lucide-react';
import { WhatsAppTemplate } from '../../types/templates';

interface TemplateCardProps {
  template: WhatsAppTemplate;
  onToggleActive: (template: WhatsAppTemplate) => void;
  onTest: (template: WhatsAppTemplate) => void;
  onEdit: (template: WhatsAppTemplate) => void;
  onDuplicate: (template: WhatsAppTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onToggleActive,
  onTest,
  onEdit,
  onDuplicate,
}) => {
  const getCategoryBadgeClass = (category: WhatsAppTemplate['category']) => {
    switch (category) {
      case 'agendamentos':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'financeiro':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'pos_op':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'recalls':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'relacionamento':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Render message bubble with highlighted variables *{{...}}* ou {{...}}
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\*\{\{[^}]+\}\}\*|\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      const isStarred = part.startsWith('*{{') && part.endsWith('}}*');
      const isPlain = part.startsWith('{{') && part.endsWith('}}');
      if (isStarred || isPlain) {
        return (
          <span
            key={index}
            className="inline-block bg-[#005F73]/15 text-[#005F73] font-bold px-1.5 py-0.5 rounded text-[11px] mx-0.5 font-mono shadow-2xs"
            title="Variável dinâmica em negrito no WhatsApp"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-xs p-5 flex flex-col justify-between space-y-4 border transition-all hover:shadow-md ${
        template.active ? 'border-slate-200/90' : 'border-slate-200/60 opacity-80 bg-slate-50/40'
      }`}
    >
      <div className="space-y-3">
        {/* Header do Card: Categoria, Meta Check e Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                template.category
              )}`}
            >
              {template.categoryLabel}
            </span>
            {template.approvedMeta && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Aprovado Meta</span>
              </span>
            )}
          </div>

          {/* Switch de Ativação */}
          <button
            type="button"
            onClick={() => onToggleActive(template)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer flex items-center px-0.5 ${
              template.active ? 'bg-[#0A9396]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                template.active ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Título & Gatilho */}
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">
            {template.name}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-[#0A9396] text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-[#0A9396] shrink-0" />
            <span>{template.triggerTiming}</span>
          </div>
        </div>

        {/* Simulação do Balão de Mensagem WhatsApp */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed space-y-2 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-200/60">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005F73]">
              <MessageSquare className="w-3 h-3 text-[#005F73]" />
              <span>WhatsApp Template</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ODN-META-MSG</span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            {renderMessageContent(template.content)}
          </p>
        </div>
      </div>

      {/* Estatísticas & Rodapé de Ações */}
      <div className="pt-2 space-y-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {template.extraMetricLabel ? (
              <>
                {template.extraMetricLabel}:{' '}
                <strong className="text-slate-900 font-bold">
                  {template.extraMetricValue}
                </strong>
              </>
            ) : (
              <>
                Taxa de Leitura:{' '}
                <strong className="text-slate-900 font-bold">
                  {template.readRate}%
                </strong>
              </>
            )}
          </span>

          <span>
            {template.secondaryMetricLabel ? (
              <>
                {template.secondaryMetricLabel}:{' '}
                <strong className="text-emerald-700 font-bold">
                  {template.secondaryMetricValue}
                </strong>
              </>
            ) : (
              <>
                Respostas:{' '}
                <strong className="text-slate-900 font-bold">
                  {template.responseRate}%
                </strong>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Botão Testar */}
          <button
            type="button"
            onClick={() => onTest(template)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#005F73] hover:text-white text-[#005F73] font-bold text-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Testar</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(template)}
              className="p-2 rounded-lg text-amber-500 hover:opacity-80 transition-opacity cursor-pointer"
              title="Editar Template"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDuplicate(template)}
              className="p-2 rounded-lg text-slate-400 hover:text-[#005F73] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Duplicar Template"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
