import React, { useState } from 'react';
import { Code2, Copy, Check, ChevronDown } from 'lucide-react';

interface DynamicVariablesTrayProps {
  isMobile?: boolean;
  onSelectTag?: (tag: string) => void;
}

export const DynamicVariablesTray: React.FC<DynamicVariablesTrayProps> = ({
  isMobile = false,
  onSelectTag,
}) => {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const variables = [
    '*{{nome_paciente}}*',
    '*{{primeiro_nome}}*',
    '*{{data_consulta}}*',
    '*{{hora}}*',
    '*{{dentista}}*',
    '*{{procedimento}}*',
    '*{{chave_pix}}*',
    '*{{link_fatura}}*',
    '*{{telefone_clinica}}*',
  ];

  const handleCopy = (tag: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tag);
    }
    setCopiedTag(tag);
    if (onSelectTag) onSelectTag(tag);
    setTimeout(() => {
      setCopiedTag(null);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-3">
      <div
        onClick={() => isMobile && setIsOpen(!isOpen)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none cursor-pointer sm:cursor-default"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005F73]">
            <Code2 className="w-4 h-4 text-[#005F73]" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Variáveis Dinâmicas Disponíveis
            </h3>
            <p className="text-xs text-slate-400">
              {isMobile ? 'Toque para copiar as tags' : 'Clique em qualquer tag para copiar rapidamente'}
            </p>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 self-end sm:self-auto"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {variables.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleCopy(tag)}
                className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
                  copiedTag === tag
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 scale-95'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#005F73] border-slate-200'
                }`}
              >
                <span>{tag}</span>
                {copiedTag === tag ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005F73] transition-colors" />
                )}
              </button>
            ))}
          </div>

          {copiedTag && (
            <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-fit animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Tag <strong>{copiedTag}</strong> copiada para a área de transferência!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
