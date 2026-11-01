import React, { useState, useEffect } from 'react';
import {
  Grid,
  FileText,
  Clock,
  Pill,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Check,
  X,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ToothData, ToothCondition, SessionProcedure } from '../../types/clinical';
import { odontogramaService } from '../../services/odontogramaService';

export type ToothType = 'molar' | 'incisivo' | 'canino' | 'pre-molar';
export type OdontoStatus = 'higido' | 'tratamento' | 'concluido' | 'ausente';

interface DenteAnatomicoProps {
  numero: number;
  tipo: ToothType;
  status: OdontoStatus;
  isSuperior: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Componente Anatômico SVG do Dente:
 * Desenha a anatomia realista da coroa e das raízes através de paths vetoriais,
 * expressando a condição clínica do dente exclusivamente por meio de cores e traços.
 */
export const DenteAnatomico: React.FC<DenteAnatomicoProps> = ({
  numero,
  tipo,
  status,
  isSuperior,
  isSelected = false,
  onClick,
}) => {
  // Configuração de cores e estilos dinâmicos com base no status clínico
  const getStyles = () => {
    switch (status) {
      case 'tratamento':
        return {
          fill: '#FEE2E2', // preenchimento leve vermelho
          stroke: '#EF4444', // stroke-red-500
          strokeWidth: 1.8,
          strokeDasharray: undefined,
        };
      case 'concluido':
        return {
          fill: 'rgba(10, 147, 150, 0.20)', // fill-[#0A9396]/20
          stroke: '#0A9396', // stroke-[#0A9396]
          strokeWidth: 1.8,
          strokeDasharray: undefined,
        };
      case 'ausente':
        return {
          fill: 'transparent',
          stroke: '#9CA3AF',
          strokeWidth: 1.4,
          strokeDasharray: '3 3',
        };
      case 'higido':
      default:
        return {
          fill: '#FDFBF7', // Fundo marfim claro
          stroke: '#D1D5DB', // Borda cinza clara
          strokeWidth: 1.4,
          strokeDasharray: undefined,
        };
    }
  };

  const style = getStyles();

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1 p-1 rounded-xl ${
        isSelected
          ? 'bg-sky-50 ring-2 ring-[#005F73] shadow-xs'
          : 'hover:bg-slate-50'
      }`}
      title={`Dente ${numero} • ${tipo} (${status})`}
    >
      {/* 1. NÚMERO FDI: Exibido ACIMA para a arcada superior */}
      {isSuperior && (
        <span
          className={`text-[11px] font-bold leading-none mb-1.5 transition-colors ${
            isSelected ? 'text-[#005F73] font-black' : 'text-slate-600 group-hover:text-slate-900'
          }`}
        >
          {numero}
        </span>
      )}

      {/* 2. DESENHO ANATÔMICO EM SVG (Sem textos internos) */}
      <svg
        width="38"
        height="76"
        viewBox="0 0 44 80"
        className={`overflow-visible ${status === 'ausente' ? 'opacity-40' : ''}`}
      >
        <g transform={isSuperior ? '' : 'rotate(180 22 40)'}>
          {/* ============================================================== */}
          {/* A. RAÍZES ANATÔMICAS (Múltiplas para Molares/Pré, Únicas p/ outros) */}
          {/* ============================================================== */}
          {tipo === 'molar' && (
            // Molar: 3 raízes anatômicas (palatina e duas vestibulares)
            <g>
              {/* Raiz Central */}
              <path
                d="M18,38 C19,26 21,14 22,2 C23,2 25,14 26,26 C26,32 27,38 27,38"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
                opacity="0.85"
              />
              {/* Raiz Esquerda */}
              <path
                d="M8,38 C6,24 4,12 8,2 C11,2 14,5 15,16 C16,24 17,34 17,38"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
              />
              {/* Raiz Direita */}
              <path
                d="M27,38 C27,34 28,24 29,16 C30,5 33,2 36,2 C40,12 38,24 36,38"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
              />
            </g>
          )}

          {tipo === 'pre-molar' && (
            // Pré-molar: 2 raízes cônicas convergentes
            <g>
              <path
                d="M12,38 C10,24 10,12 14,3 C17,2 20,5 20,18 C20,26 21,34 21,38"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
              />
              <path
                d="M23,38 C23,34 24,26 24,18 C24,5 27,2 30,3 C34,12 34,24 32,38"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
              />
            </g>
          )}

          {tipo === 'canino' && (
            // Canino: Raiz única cônica longa e robusta
            <path
              d="M14,38 C14,24 16,10 20,2 C21,0 23,0 24,2 C28,10 30,24 30,38 Z"
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              strokeDasharray={style.strokeDasharray}
            />
          )}

          {tipo === 'incisivo' && (
            // Incisivo: Raiz única afilada
            <path
              d="M15,38 C15,24 17,12 21,3 C22,1 23,1 24,3 C28,12 29,24 29,38 Z"
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              strokeDasharray={style.strokeDasharray}
            />
          )}

          {/* Linha Cervical (Junção Esmalte-Cemento) */}
          <path
            d="M8,38 Q22,35 36,38"
            fill="none"
            stroke={style.stroke}
            strokeWidth={1}
            opacity="0.6"
          />

          {/* ============================================================== */}
          {/* B. COROAS ANATÔMICAS (Formato específico de cada grupo dental) */}
          {/* ============================================================== */}
          {tipo === 'molar' && (
            // Coroa de Molar: Larga com cúspides e fissura oclusal
            <g>
              <path
                d="M6,38 C4,48 5,68 10,75 C14,79 30,79 34,75 C39,68 40,48 38,38 Z"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
              />
              <path
                d="M12,50 Q22,54 32,50 M22,42 L22,70"
                fill="none"
                stroke={style.stroke}
                strokeWidth={1}
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>
          )}

          {tipo === 'pre-molar' && (
            // Coroa de Pré-Molar: 2 cúspides e sulco central
            <g>
              <path
                d="M9,38 C7,48 8,67 12,74 C15,78 29,78 32,74 C36,67 37,48 35,38 Z"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
              />
              <path
                d="M14,52 Q22,55 30,52 M22,44 L22,66"
                fill="none"
                stroke={style.stroke}
                strokeWidth={1}
                opacity="0.75"
              />
            </g>
          )}

          {tipo === 'canino' && (
            // Coroa de Canino: Cúspide pontiaguda proeminente
            <g>
              <path
                d="M10,38 C8,48 9,64 14,72 C17,76 22,78 22,78 C22,78 27,76 30,72 C35,64 36,48 34,38 Z"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
              />
              <path
                d="M22,40 L22,74"
                fill="none"
                stroke={style.stroke}
                strokeWidth={1}
                opacity="0.75"
              />
            </g>
          )}

          {tipo === 'incisivo' && (
            // Coroa de Incisivo: Bordo reto incisal em espátula
            <g>
              <path
                d="M11,38 C9,48 9,66 12,74 C13,77 31,77 32,74 C35,66 35,48 33,38 Z"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
              />
              <path
                d="M14,73 L30,73"
                fill="none"
                stroke={style.stroke}
                strokeWidth={1.5}
                opacity="0.75"
              />
            </g>
          )}

          {/* ============================================================== */}
          {/* C. MARCAÇÃO DE DENTE AUSENTE: "X" por cima de todo o elemento   */}
          {/* ============================================================== */}
          {status === 'ausente' && (
            <g stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <line x1="8" y1="14" x2="36" y2="66" />
              <line x1="36" y1="14" x2="8" y2="66" />
            </g>
          )}
        </g>
      </svg>

      {/* 3. NÚMERO FDI: Exibido ABAIXO para a arcada inferior */}
      {!isSuperior && (
        <span
          className={`text-[11px] font-bold leading-none mt-1.5 transition-colors ${
            isSelected ? 'text-[#005F73] font-black' : 'text-slate-600 group-hover:text-slate-900'
          }`}
        >
          {numero}
        </span>
      )}
    </div>
  );
};

interface OdontogramViewProps {
  onSelectTooth?: (tooth: ToothData) => void;
  selectedToothId?: number;
  patientId?: string;
  patientName?: string;
  onProcedureRegistered?: (newProcedure: SessionProcedure) => void;
}

const PRESET_PROCEDURES = [
  { name: 'Restauração Resina Composta', price: 180, defaultStatus: 'concluido' as OdontoStatus, defaultFace: 'O' },
  { name: 'Tratamento Endodôntico (Canal)', price: 450, defaultStatus: 'concluido' as OdontoStatus, defaultFace: 'Geral' },
  { name: 'Exodontia Simples', price: 220, defaultStatus: 'ausente' as OdontoStatus, defaultFace: 'Geral' },
  { name: 'Coroa Protética em Porcelana', price: 850, defaultStatus: 'concluido' as OdontoStatus, defaultFace: 'Geral' },
  { name: 'Aplicação de Selante', price: 90, defaultStatus: 'concluido' as OdontoStatus, defaultFace: 'O' },
  { name: 'Raspagem Subgengival Local', price: 130, defaultStatus: 'concluido' as OdontoStatus, defaultFace: 'Geral' },
  { name: 'Diagnóstico de Cárie (A Tratar)', price: 0, defaultStatus: 'tratamento' as OdontoStatus, defaultFace: 'O' },
];

const FACES_OPTIONS = [
  { id: 'O', label: 'Oclusal (O)' },
  { id: 'M', label: 'Mesial (M)' },
  { id: 'D', label: 'Distal (D)' },
  { id: 'V', label: 'Vestibular (V)' },
  { id: 'P/L', label: 'Palatina / Lingual' },
  { id: 'Geral', label: 'Dente Completo / Raiz' },
];

export const OdontogramView: React.FC<OdontogramViewProps> = ({
  onSelectTooth,
  selectedToothId: externalSelectedId,
  patientId,
  patientName,
  onProcedureRegistered,
}) => {
  const [activeTab, setActiveTab] = useState<'odontograma' | 'anamnese' | 'evolucoes' | 'prescricoes' | 'exames'>('odontograma');
  const [internalSelectedId, setInternalSelectedId] = useState<number>(26);

  const selectedId = externalSelectedId ?? internalSelectedId;

  // Estado dos 32 dentes da FDI mapeados (todos inicialmente hígidos até registro clínico real)
  const [teethStatus, setTeethStatus] = useState<Record<number, OdontoStatus>>(() => {
    const initial: Record<number, OdontoStatus> = {};
    const fdiList = [
      18, 17, 16, 15, 14, 13, 12, 11,
      21, 22, 23, 24, 25, 26, 27, 28,
      48, 47, 46, 45, 44, 43, 42, 41,
      31, 32, 33, 34, 35, 36, 37, 38
    ];
    fdiList.forEach((d) => {
      initial[d] = 'higido';
    });
    return initial;
  });

  // Modal para cadastrar procedimento no dente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formProcedureName, setFormProcedureName] = useState('Restauração Resina Composta');
  const [formPrice, setFormPrice] = useState<number>(180);
  const [formStatus, setFormStatus] = useState<OdontoStatus>('concluido');
  const [selectedFaces, setSelectedFaces] = useState<string[]>(['O']);
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Carrega status dos dentes gravados no backend Supabase para este paciente
  useEffect(() => {
    if (!patientId || patientId.startsWith('mock-')) return;
    let isMounted = true;
    async function loadBackendOdonto() {
      try {
        const itens = await odontogramaService.getItensByPaciente(patientId!);
        if (isMounted && itens && itens.length > 0) {
          setTeethStatus((prev) => {
            const updated = { ...prev };
            itens.forEach((it) => {
              if (it.dente) {
                updated[it.dente] = it.condicao;
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn('[OdontogramView] Aviso ao carregar itens do banco:', err);
      }
    }
    loadBackendOdonto();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  // Determina o tipo anatômico baseado no número FDI
  const getToothType = (numero: number): ToothType => {
    const lastDigit = numero % 10;
    if (lastDigit === 6 || lastDigit === 7 || lastDigit === 8) return 'molar';
    if (lastDigit === 4 || lastDigit === 5) return 'pre-molar';
    if (lastDigit === 3) return 'canino';
    return 'incisivo';
  };

  const getToothFdiName = (num: number): string => {
    const quad = Math.floor(num / 10);
    const pos = num % 10;
    const names = [
      '',
      'Incisivo Central',
      'Incisivo Lateral',
      'Canino',
      'Primeiro Pré-Molar',
      'Segundo Pré-Molar',
      'Primeiro Molar',
      'Segundo Molar',
      'Terceiro Molar (Siso)',
    ];
    const arcada =
      quad === 1
        ? 'Superior Direito'
        : quad === 2
        ? 'Superior Esquerdo'
        : quad === 3
        ? 'Inferior Esquerdo'
        : 'Inferior Direito';
    return `${names[pos] || 'Elemento'} ${arcada}`;
  };

  // Ao clicar no dente: seleciona e abre o modal para cadastrar o procedimento
  const handleSelect = (numero: number) => {
    setInternalSelectedId(numero);

    const currentStatus = teethStatus[numero] || 'higido';
    if (currentStatus === 'tratamento') {
      setFormProcedureName('Restauração Resina Composta');
      setFormPrice(180);
      setFormStatus('concluido');
    } else if (currentStatus === 'ausente') {
      setFormProcedureName('Exodontia Simples');
      setFormPrice(220);
      setFormStatus('ausente');
    } else {
      setFormProcedureName('Restauração Resina Composta');
      setFormPrice(180);
      setFormStatus('concluido');
    }
    setSelectedFaces(['O']);
    setFormNotes('');
    setIsModalOpen(true);

    if (onSelectTooth) {
      const statusMap: Record<OdontoStatus, ToothCondition> = {
        higido: 'higido',
        tratamento: 'carie',
        concluido: 'restaurado',
        ausente: 'ausente',
      };
      const isSup = numero < 30;
      const quad = Math.floor(numero / 10) as 1 | 2 | 3 | 4;
      onSelectTooth({
        id: numero,
        quadrant: quad,
        arcada: isSup ? 'superior' : 'inferior',
        condition: statusMap[teethStatus[numero] || 'higido'],
        name: `Elemento ${numero} (${getToothType(numero)})`,
      });
    }
  };

  const handleSetStatus = (status: OdontoStatus) => {
    setTeethStatus((prev) => ({
      ...prev,
      [selectedId]: status,
    }));
  };

  const toggleFace = (faceId: string) => {
    if (faceId === 'Geral') {
      setSelectedFaces(['Geral']);
      return;
    }
    setSelectedFaces((prev) => {
      const filtered = prev.filter((f) => f !== 'Geral');
      if (filtered.includes(faceId)) {
        const next = filtered.filter((f) => f !== faceId);
        return next.length === 0 ? ['Geral'] : next;
      } else {
        return [...filtered, faceId];
      }
    });
  };

  const handleSelectPreset = (preset: {
    name: string;
    price: number;
    defaultStatus: OdontoStatus;
    defaultFace?: string;
  }) => {
    setFormProcedureName(preset.name);
    setFormPrice(preset.price);
    setFormStatus(preset.defaultStatus);
    if (preset.defaultFace) {
      setSelectedFaces([preset.defaultFace]);
    }
  };

  // Salva o procedimento realizado no dente no backend (odontograma_itens + evolucoes_prontuario)
  const handleSaveToothProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const facesString = selectedFaces.length > 0 ? selectedFaces.join('/') : 'Geral';

      if (patientId) {
        await odontogramaService.saveProcedimentoDente({
          pacienteId,
          dente: selectedId,
          face: facesString,
          condicao: formStatus,
          procedimentoNome: formProcedureName,
          preco: formPrice,
          observacao: formNotes,
          dentistaNome: 'Dr. Frankisney Souza',
        });
      }

      setTeethStatus((prev) => ({
        ...prev,
        [selectedId]: formStatus,
      }));

      if (onProcedureRegistered) {
        onProcedureRegistered({
          id: `proc-dente-${selectedId}-${Date.now()}`,
          code: `#D${selectedId}`,
          tooth: `Dente ${selectedId}`,
          name: formProcedureName,
          description: `Face: ${facesString}${formNotes ? ` • ${formNotes}` : ''}`,
          dentist: 'Dr. Frankisney Souza',
          price: formPrice,
          status: formStatus === 'concluido' ? 'Executado' : 'Em andamento',
        });
      }

      setToastMsg(`Procedimento no Dente ${selectedId} salvo com sucesso no prontuário!`);
      setTimeout(() => setToastMsg(null), 4000);
      setIsModalOpen(false);
    } catch (err) {
      console.error('[OdontogramView] Erro ao salvar procedimento no dente:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Listas de Dentes
  const q1Teeth = [18, 17, 16, 15, 14, 13, 12, 11]; // Superior Direito
  const q2Teeth = [21, 22, 23, 24, 25, 26, 27, 28]; // Superior Esquerdo
  const q4Teeth = [48, 47, 46, 45, 44, 43, 42, 41]; // Inferior Direito
  const q3Teeth = [31, 32, 33, 34, 35, 36, 37, 38]; // Inferior Esquerdo

  const currentToothStatus = teethStatus[selectedId] || 'higido';
  const currentToothType = getToothType(selectedId);
  const isSelectedSuperior = selectedId < 30;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col">
      {/* Abas Superiores */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-3 bg-slate-50/70 border-b border-slate-200/80">
        <div className="flex items-center gap-1 overflow-x-auto pb-px scrollbar-none">
          <button
            onClick={() => setActiveTab('odontograma')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'odontograma'
                ? 'text-[#005F73] border-b-2 border-[#005F73] bg-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="w-4 h-4 text-[#005F73]" />
            <span>Odontograma Anatômico</span>
          </button>

          <button
            onClick={() => setActiveTab('anamnese')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'anamnese'
                ? 'text-[#005F73] border-b-2 border-[#005F73] bg-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Anamnese &amp; Histórico</span>
          </button>

          <button
            onClick={() => setActiveTab('evolucoes')}
            className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'evolucoes'
                ? 'text-[#005F73] border-b-2 border-[#005F73] bg-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Evoluções Anteriores</span>
          </button>

          <button
            onClick={() => setActiveTab('prescricoes')}
            className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'prescricoes'
                ? 'text-[#005F73] border-b-2 border-[#005F73] bg-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Prescrições / Atestados</span>
          </button>

          <button
            onClick={() => setActiveTab('exames')}
            className={`hidden md:flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'exames'
                ? 'text-[#005F73] border-b-2 border-[#005F73] bg-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Exames &amp; RX</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-[#005F73] bg-cyan-50 px-2.5 py-1 rounded-full border border-[#0A9396]/20">
          Notação FDI (32 Dentes)
        </span>
      </div>

      {activeTab === 'odontograma' && (
        <div className="p-4 sm:p-6 flex flex-col gap-6">
          {/* ============================================================== */}
          {/* MAPA DENTAL CLÍNICO DE ALTA FIDELIDADE                         */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col items-center overflow-x-auto">
            <div className="relative min-w-[720px] w-full flex flex-col items-center">
              {/* Linha Vertical Tracejada Discreta no Centro (Linha Média) */}
              <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-slate-300 pointer-events-none z-10" />

              {/* ------------------------------------------------------------ */}
              {/* 1. ARCADA SUPERIOR (MAXILA: Dentes 18 a 11 e 21 a 28)       */}
              {/* ------------------------------------------------------------ */}
              <div className="w-full flex items-center justify-center gap-4 sm:gap-6 pb-2">
                {/* Quadrante 1 (Superior Direito: 18 a 11) */}
                <div className="flex items-center justify-end gap-1 flex-1">
                  {q1Teeth.map((num) => (
                    <DenteAnatomico
                      key={num}
                      numero={num}
                      tipo={getToothType(num)}
                      status={teethStatus[num] || 'higido'}
                      isSuperior={true}
                      isSelected={selectedId === num}
                      onClick={() => handleSelect(num)}
                    />
                  ))}
                </div>

                {/* Quadrante 2 (Superior Esquerdo: 21 a 28) */}
                <div className="flex items-center justify-start gap-1 flex-1">
                  {q2Teeth.map((num) => (
                    <DenteAnatomico
                      key={num}
                      numero={num}
                      tipo={getToothType(num)}
                      status={teethStatus[num] || 'higido'}
                      isSuperior={true}
                      isSelected={selectedId === num}
                      onClick={() => handleSelect(num)}
                    />
                  ))}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* PLANO OCLUSAL CENTRAL (Linha Horizontal Central Fina)        */}
              {/* ------------------------------------------------------------ */}
              <div className="w-full flex items-center gap-3 my-1">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                  Plano Oclusal
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 2. ARCADA INFERIOR (MANDÍBULA: Dentes 48 a 41 e 31 a 38)     */}
              {/* ------------------------------------------------------------ */}
              <div className="w-full flex items-center justify-center gap-4 sm:gap-6 pt-2">
                {/* Quadrante 4 (Inferior Direito: 48 a 41) */}
                <div className="flex items-center justify-end gap-1 flex-1">
                  {q4Teeth.map((num) => (
                    <DenteAnatomico
                      key={num}
                      numero={num}
                      tipo={getToothType(num)}
                      status={teethStatus[num] || 'higido'}
                      isSuperior={false}
                      isSelected={selectedId === num}
                      onClick={() => handleSelect(num)}
                    />
                  ))}
                </div>

                {/* Quadrante 3 (Inferior Esquerdo: 31 a 38) */}
                <div className="flex items-center justify-start gap-1 flex-1">
                  {q3Teeth.map((num) => (
                    <DenteAnatomico
                      key={num}
                      numero={num}
                      tipo={getToothType(num)}
                      status={teethStatus[num] || 'higido'}
                      isSuperior={false}
                      isSelected={selectedId === num}
                      onClick={() => handleSelect(num)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* LEGENDA SIMPLES (Bolinha + Texto) */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-2xs" />
                <span>Necessita Tratamento</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#0A9396] shadow-2xs" />
                <span>Tratamento Concluído / Planejado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-400 shadow-2xs" />
                <span>Dente Ausente</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FDFBF7] border border-slate-300" />
                <span>Hígido</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PAINEL DE CONTROLE DO DENTE SELECIONADO                         */}
          {/* ============================================================== */}
          <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#005F73] text-white flex flex-col items-center justify-center shadow-xs">
                <span className="text-[10px] uppercase font-bold text-cyan-200 leading-none">Dente</span>
                <span className="text-lg font-black leading-none mt-0.5">{selectedId}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    Elemento {selectedId} • <span className="capitalize">{currentToothType}</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    • Arcada {isSelectedSuperior ? 'Superior (Maxila)' : 'Inferior (Mandíbula)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Status Atual:{' '}
                  <strong
                    className={
                      currentToothStatus === 'tratamento'
                        ? 'text-red-600 font-bold'
                        : currentToothStatus === 'concluido'
                        ? 'text-[#0A9396] font-bold'
                        : currentToothStatus === 'ausente'
                        ? 'text-slate-500 font-bold'
                        : 'text-slate-700'
                    }
                  >
                    {currentToothStatus === 'tratamento' && 'Necessita Tratamento'}
                    {currentToothStatus === 'concluido' && 'Tratamento Concluído / Planejado'}
                    {currentToothStatus === 'ausente' && 'Dente Ausente'}
                    {currentToothStatus === 'higido' && 'Hígido (Saudável)'}
                  </strong>
                </p>
              </div>
            </div>

            {/* Botões de Alteração do Status e Cadastro do Procedimento */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#005F73] hover:bg-[#0A9396] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-[#0A9396]/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Procedimento no Dente {selectedId}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetStatus('tratamento')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentToothStatus === 'tratamento'
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-white hover:bg-red-50 text-red-700 border-red-200 shadow-2xs'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Necessita Tratamento</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetStatus('concluido')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentToothStatus === 'concluido'
                    ? 'bg-[#0A9396] text-white border-[#0A9396] shadow-sm'
                    : 'bg-white hover:bg-teal-50 text-[#005F73] border-[#0A9396]/30 shadow-2xs'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-teal-300" />
                <span>Tratamento Concluído</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetStatus('ausente')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentToothStatus === 'ausente'
                    ? 'bg-slate-600 text-white border-slate-600 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-2xs'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Ausente</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetStatus('higido')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentToothStatus === 'higido'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <span>Hígido</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-6 bg-[#005F73] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 animate-in fade-in slide-in-from-top-4 duration-300 border border-[#89f3f6]/40 max-w-md">
          <Check className="w-5 h-5 text-[#89f3f6] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MODAL DE PROCEDIMENTO NO DENTE ESPECÍFICO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Topo do Modal */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005F73] text-white flex flex-col items-center justify-center shadow-xs">
                  <span className="text-[9px] uppercase font-bold text-cyan-200 leading-none">Dente</span>
                  <span className="text-base font-black leading-none mt-0.5">{selectedId}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cadastrar Procedimento no Dente {selectedId}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {getToothFdiName(selectedId)} {patientName ? `• Paciente: ${patientName}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <form onSubmit={handleSaveToothProcedure} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Presets Rápidos */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Procedimentos Clínicos Frequentes (1 Clique):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROCEDURES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        formProcedureName === p.name
                          ? 'bg-[#005F73] text-white border-[#005F73] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p.name} {p.price > 0 && `(R$ ${p.price})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome do Procedimento */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Descrição do Procedimento:
                </label>
                <input
                  type="text"
                  required
                  value={formProcedureName}
                  onChange={(e) => setFormProcedureName(e.target.value)}
                  placeholder="Ex: Restauração Resina Composta, Canal, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0A9396] focus:border-[#0A9396] outline-none"
                />
              </div>

              {/* Valor do Procedimento (R$) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Valor do Procedimento (R$):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#0A9396] outline-none"
                  />
                </div>
              </div>

              {/* Faces do Dente */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Faces Envolvidas no Dente:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {FACES_OPTIONS.map((face) => {
                    const isChecked = selectedFaces.includes(face.id);
                    return (
                      <button
                        key={face.id}
                        type="button"
                        onClick={() => toggleFace(face.id)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-between transition cursor-pointer ${
                          isChecked
                            ? 'bg-[#005F73]/10 text-[#005F73] border-[#005F73] font-bold'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span>{face.label}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#005F73]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Clínico Resultante no Odontograma */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Condição Resultante no Odontograma:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('concluido')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                      formStatus === 'concluido'
                        ? 'bg-teal-50 border-[#0A9396] text-[#005F73] ring-1 ring-[#0A9396]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#0A9396]" />
                    <span>Concluído</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('tratamento')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                      formStatus === 'tratamento'
                        ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Necessita Tratar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('ausente')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                      formStatus === 'ausente'
                        ? 'bg-slate-100 border-slate-500 text-slate-800 ring-1 ring-slate-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-slate-400" />
                    <span>Dente Ausente</span>
                  </button>
                </div>
              </div>

              {/* Observações Clínicas Adicionais */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Notas Clínicas / Detalhes (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Forramento em CIV, resina Z350 cor A2, oclusão testada com carbono."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0A9396] outline-none resize-none"
                />
              </div>

              {/* Rodapé de Ações */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#005F73] hover:bg-[#0A9396] text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar no Prontuário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outras Abas Clínicas com Conteúdo Informativo */}
      {activeTab === 'anamnese' && (
        <div className="p-5 text-sm text-slate-600 space-y-3">
          <h4 className="font-bold text-slate-900 text-base">Ficha de Anamnese Digital</h4>
          <p>Paciente sem histórico cardiovascular prévio grave, em uso regular de Losartana para controle de pressão arterial. Nega queixas de parestesia ou sangramento gengival espontâneo.</p>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800">
            <strong>Alerta:</strong> Paciente alérgica a Penicilina e Amoxicilina. Preferir Clindamicina ou Azitromicina se profilaxia antibiótica for indicada.
          </div>
        </div>
      )}
      {activeTab === 'evolucoes' && (
        <div className="p-5 text-sm text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Histórico de Sessões Anteriores</h4>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <span className="font-bold text-slate-800">15/02/2025 • Dr. Frankisney Souza</span>
            <p>Profilaxia supragengival, polimento coronário e aplicação tópica de flúor. Detectada lesão cariosa no elemento 26.</p>
          </div>
        </div>
      )}
      {activeTab === 'prescricoes' && (
        <div className="p-5 text-sm text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Prescrições &amp; Atestados</h4>
          <p className="text-xs text-slate-500">Nenhuma prescrição emitida hoje. Clique em Gerar Receita para receitar analgésicos ou anti-inflamatórios.</p>
        </div>
      )}
      {activeTab === 'exames' && (
        <div className="p-5 text-sm text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Radiografias e Exames Anexados</h4>
          <p className="text-xs text-slate-500">2 exames radiográficos associados ao prontuário disponíveis para consulta na galeria lateral.</p>
        </div>
      )}
    </div>
  );
};
