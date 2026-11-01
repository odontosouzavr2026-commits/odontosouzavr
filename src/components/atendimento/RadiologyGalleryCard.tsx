import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Maximize2,
  Camera,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ComparadorAntesDepoisModal } from './ComparadorAntesDepoisModal';

interface RadiologyGalleryCardProps {
  images?: Array<{ title: string; date: string; url: string }>;
}

export const RadiologyGalleryCard: React.FC<RadiologyGalleryCardProps> = ({
  images = [],
}) => {
  const [selectedImage, setSelectedImage] = useState<{ title: string; date: string; url: string } | null>(null);
  const [captureFeedback, setCaptureFeedback] = useState<string | null>(null);
  const [isComparadorOpen, setIsComparadorOpen] = useState(false);

  const handleCapturePhoto = () => {
    setCaptureFeedback('Foto capturada da câmera intraoral e anexada ao prontuário!');
    setTimeout(() => {
      setCaptureFeedback(null);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 relative">
      {/* Toast Alert */}
      {captureFeedback && (
        <div className="absolute top-3 right-3 left-3 bg-[#005F73] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-20 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#89f3f6]" />
          <span>{captureFeedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#005F73]/10 flex items-center justify-center text-[#005F73]">
            <ImageIcon className="w-4 h-4 text-[#005F73]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Imagens &amp; RX Recentes
            </h2>
            <span className="text-[11px] text-slate-400">
              {images.length > 0 ? `${images.length} exames associados` : '0 exames associados'}
            </span>
          </div>
        </div>

        {images.length > 0 && (
          <button
            onClick={() => setSelectedImage(images[0])}
            className="text-slate-400 hover:text-[#005F73] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Expandir Imagens"
            type="button"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Miniaturas das Radiografias */}
      {images.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-600">Nenhum exame de RX anexado</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Capture fotos intraorais ou anexe radiografias digitais.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {images.map((img) => (
            <div
              key={img.title}
              onClick={() => setSelectedImage(img)}
              className="group relative rounded-xl overflow-hidden bg-slate-900 aspect-square cursor-pointer border border-slate-200/80 shadow-2xs"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-white">
                <p className="text-[11px] font-bold leading-tight truncate">{img.title}</p>
                <p className="text-[9px] text-white/80 mt-0.5">{img.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botões de Ação de Imagens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={handleCapturePhoto}
          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#005F73] transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/60"
          type="button"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Câmera Intraoral</span>
        </button>

        <button
          onClick={() => setIsComparadorOpen(true)}
          className="w-full py-2 rounded-xl bg-[#005F73]/10 hover:bg-[#005F73] hover:text-white text-[#005F73] transition-colors text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-[#005F73]/20"
          type="button"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Antes &amp; Depois (Slider)</span>
        </button>
      </div>

      {/* Modal de Comparação Antes e Depois */}
      <ComparadorAntesDepoisModal
        isOpen={isComparadorOpen}
        onClose={() => setIsComparadorOpen(false)}
        pacienteNome="Mariana Rios"
        dentistaNome="Dr. Frankisney Souza"
      />

      {/* Modal de Zoom da Imagem */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{selectedImage.title}</h3>
                <p className="text-[11px] text-slate-400">Data de Tomada: {selectedImage.date}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black min-h-[350px]">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
