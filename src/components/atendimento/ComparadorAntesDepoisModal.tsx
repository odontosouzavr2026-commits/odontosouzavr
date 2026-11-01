import React, { useState, useRef } from 'react';
import {
  Sparkles,
  X,
  Upload,
  Download,
  Share2,
  CheckCircle2,
  Sliders,
  SplitSquareVertical,
  Columns,
  Maximize2,
  Camera,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ComparadorAntesDepoisModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteNome?: string;
  dentistaNome?: string;
}

export const ComparadorAntesDepoisModal: React.FC<ComparadorAntesDepoisModalProps> = ({
  isOpen,
  onClose,
  pacienteNome = 'Mariana Rios',
  dentistaNome = 'Dr. Frankisney Souza',
}) => {
  const toast = useToast();
  const [sliderPos, setSliderPos] = useState(50);
  const [modoVisualizacao, setModoVisualizacao] = useState<'slider' | 'lado_a_lado'>('slider');
  const [casoSelecionado, setCasoSelecionado] = useState<'facetas' | 'clareamento'>('facetas');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Imagens de Alta Fidelidade para Demonstração de Casos Estéticos
  const casos = {
    facetas: {
      titulo: 'Reabilitação Estética Anterior (#13 ao #23)',
      procedimento: 'Facetas Laminadas Cerâmicas E-Max e Implante #21',
      antesUrl:
        'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
      depoisUrl:
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
      dataAntes: '12/03/2026',
      dataDepois: '28/10/2026',
      corAntes: 'Escala Vita A3.5 (Desalinhamento e fratura)',
      corDepois: 'Escala Vita BL2 (Harmonização do sorriso)',
    },
    clareamento: {
      titulo: 'Clareamento Dental Combinado (Consultório + Caseiro)',
      procedimento: 'Peróxido de Hidrogênio 35% + Moldeiras 16%',
      antesUrl:
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
      depoisUrl:
        'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
      dataAntes: '05/09/2026',
      dataDepois: '24/10/2026',
      corAntes: 'A3 (Amarelamento e manchas de café)',
      corDepois: 'B1 (Luminosidade natural)',
    },
  };

  const caso = casos[casoSelecionado];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005F73] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#89f3f6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Comparador Visual: Antes &amp; Depois
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A9396]/15 text-[#005F73]">
                  Demonstração Clínica
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Paciente: <strong>{pacienteNome}</strong> • Dentista Responsável:{' '}
                <strong>{dentistaNome}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setModoVisualizacao('slider')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  modoVisualizacao === 'slider'
                    ? 'bg-white text-[#005F73] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Slider Interativo</span>
              </button>
              <button
                onClick={() => setModoVisualizacao('lado_a_lado')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  modoVisualizacao === 'lado_a_lado'
                    ? 'bg-white text-[#005F73] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Lado a Lado</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Seletor de Casos */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCasoSelecionado('facetas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  casoSelecionado === 'facetas'
                    ? 'bg-[#005F73] text-white border-[#005F73]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Caso 01: Facetas E-Max &amp; Implante
              </button>
              <button
                onClick={() => setCasoSelecionado('clareamento')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  casoSelecionado === 'clareamento'
                    ? 'bg-[#005F73] text-white border-[#005F73]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Caso 02: Clareamento Conjugado
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Procedimento: <strong>{caso.procedimento}</strong>
            </span>
          </div>

          {/* ÁREA DE VISUALIZAÇÃO INTERATIVA */}
          {modoVisualizacao === 'slider' ? (
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full aspect-video sm:aspect-[16/9] max-h-[460px] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-200 shadow-md bg-slate-900"
            >
              {/* Imagem do DEPOIS (Fundo total) */}
              <img
                src={caso.depoisUrl}
                alt="Depois do Tratamento"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute top-4 right-4 bg-emerald-700/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                DEPOIS ({caso.dataDepois})
              </div>

              {/* Imagem do ANTES (Recortada pela posição do slider) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={caso.antesUrl}
                  alt="Antes do Tratamento"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{
                    width: containerRef.current?.clientWidth || '100%',
                    height: '100%',
                  }}
                  draggable={false}
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  ANTES ({caso.dataAntes})
                </div>
              </div>

              {/* Linha Divisória do Slider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-[#005F73] text-white shadow-lg border-2 border-white flex items-center justify-center">
                  <Sliders className="w-4 h-4 rotate-90 text-[#89f3f6]" />
                </div>
              </div>

              {/* Dica no rodapé */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full pointer-events-none">
                ↔ Arraste o mouse ou dedo para comparar o Antes e Depois
              </div>
            </div>
          ) : (
            /* Modo Lado a Lado */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-sm">
                <img
                  src={caso.antesUrl}
                  alt="Antes"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/85 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  ANTES ({caso.dataAntes})
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-xs">
                  <span className="font-semibold block">{caso.corAntes}</span>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-sm">
                <img
                  src={caso.depoisUrl}
                  alt="Depois"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-emerald-700/85 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  DEPOIS ({caso.dataDepois})
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-xs">
                  <span className="font-semibold block">{caso.corDepois}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cards de Comparativo Técnico */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">
                Situação Inicial (Antes)
              </span>
              <p className="font-bold text-slate-800 mt-0.5">{caso.corAntes}</p>
              <span className="text-slate-400 text-[11px] block mt-1">
                Data do Registro: {caso.dataAntes}
              </span>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs">
              <span className="text-[11px] font-bold uppercase text-emerald-700 block">
                Resultado Conquistado (Depois)
              </span>
              <p className="font-bold text-emerald-900 mt-0.5">{caso.corDepois}</p>
              <span className="text-emerald-700 text-[11px] block mt-1">
                Finalizado por: Dr. Frankisney Souza ({caso.dataDepois})
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.success('Foto anexada!', 'Foto intraoral anexada ao prontuário do paciente com sucesso.');
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#005F73]" />
              <span>Anexar Nova Foto</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#005F73] text-white hover:bg-[#004857] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Fechar Visualizador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
