import React, { useState, useEffect } from 'react';
import {
  Timer,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  CheckCircle,
  ShieldCheck,
  Calendar,
  History,
  BadgeAlert,
  ArrowLeft,
  PlayCircle,
  Zap,
} from 'lucide-react';
import { ToothIcon } from '../common/ToothIcon';
import { ActivePatientInfo } from '../../types/clinical';
import { calculateAge } from '../../utils/dateUtils';

interface ClinicalPatientBannerProps {
  patient: ActivePatientInfo;
  onConclude: () => void;
  onNextPatient: () => void;
  onStartAttendance?: () => void;
  onBackToQueue?: () => void;
  isMobile?: boolean;
}

export const ClinicalPatientBanner: React.FC<ClinicalPatientBannerProps> = ({
  patient,
  onConclude,
  onNextPatient,
  onStartAttendance,
  onBackToQueue,
  isMobile = false,
}) => {
  // Padrão Odonto Souza: 45 minutos por consulta
  const TARGET_SECONDS = 45 * 60; // 2700 segundos

  // Estado de controle do Atendimento
  const [isStarted, setIsStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Reinicia cronômetro quando o paciente mudar
  useEffect(() => {
    setIsStarted(false);
    setSeconds(0);
    setIsPaused(false);
  }, [patient.id, patient.name]);

  // Timer só roda se o atendimento tiver sido iniciado e não estiver pausado
  useEffect(() => {
    if (!isStarted || isPaused) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isPaused]);

  const handleStart = () => {
    setIsStarted(true);
    setIsPaused(false);
    if (onStartAttendance) {
      onStartAttendance();
    }
  };

  const handleReset = () => {
    setSeconds(0);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isOvertime = seconds > TARGET_SECONDS;
  const progressPercent = Math.min(100, (seconds / TARGET_SECONDS) * 100);

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      {/* Informações do Paciente */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-4 min-w-0">
        <div className="relative shrink-0">
          {patient.photoUrl && !patient.photoUrl.includes('unsplash') ? (
            <img
              src={patient.photoUrl}
              alt={patient.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-sm ring-4 ring-[#86f0f3]/40"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#005F73] text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm ring-4 ring-[#86f0f3]/40">
              {patient.name
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'P'}
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ring-2 ring-white transition-colors ${
              isStarted ? 'bg-[#00696c] animate-pulse' : 'bg-amber-400'
            }`}
            title={isStarted ? 'Paciente em Atendimento' : 'Aguardando Início'}
          />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {patient.name}
            </h1>

            {/* Badge de Status Dinâmico */}
            {isStarted ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#95d3be]/30 text-[#00493a] text-[11px] font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00493a] animate-pulse" />
                Em Atendimento
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Aguardando Início
              </span>
            )}

            {patient.isEncaixe && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider shadow-2xs">
                <Zap className="w-3 h-3 fill-white" />
                Encaixe
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#86f0f3]/30 text-[#006e70] text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              {patient.insurance}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
              Pront. #{patient.prontuario}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs mt-0.5">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-700">CPF:</span>
              {patient.cpf}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {patient.birthDate ? calculateAge(patient.birthDate) : patient.age} anos ({patient.birthDate})
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-slate-400" />
              Última consulta: {patient.lastVisit}
            </span>
            <span className="flex items-center gap-1 text-[#005F73] font-semibold">
              <ToothIcon className="w-3.5 h-3.5 text-[#005F73]" />
              {patient.doctor}
            </span>
          </div>
        </div>
      </div>

      {/* Cronômetro com Padrão 45 Minutos e Controles de Atendimento */}
      <div className="flex flex-wrap items-center gap-3 shrink-0 self-start xl:self-center pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100 w-full xl:w-auto justify-between xl:justify-end">
        {/* Bloco Cronômetro: Padrão 45 Minutos Odonto Souza */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all ${
            isOvertime
              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/40'
              : !isStarted
              ? 'bg-slate-50/60 border-slate-200'
              : 'bg-slate-50 border-slate-200/80 shadow-2xs'
          }`}
        >
          <Timer
            className={`w-5 h-5 shrink-0 ${
              isOvertime
                ? 'text-amber-600 animate-pulse'
                : isStarted
                ? 'text-[#0A9396]'
                : 'text-slate-400'
            }`}
          />
          <div className="flex flex-col min-w-[125px]">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Tempo em Cadeira
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#005F73]/10 text-[#005F73]">
                Padrão 45m
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-base font-black font-mono tracking-tight leading-none ${
                  isOvertime
                    ? 'text-amber-700'
                    : isStarted
                    ? 'text-[#005F73]'
                    : 'text-slate-500'
                }`}
              >
                {formatTimer(seconds)}
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">/ 45:00</span>
            </div>

            {/* Barra de Progresso dos 45 Minutos */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOvertime
                    ? 'bg-amber-500'
                    : isStarted
                    ? 'bg-[#0A9396]'
                    : 'bg-slate-300'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CONTROLES: BOTÃO DE INICIAR VS BOTÕES DURANTE ATENDIMENTO      */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2">
          {!isStarted ? (
            /* BOTÃO EM DESTAQUE: INICIAR ATENDIMENTO */
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer animate-pulse hover:animate-none"
              type="button"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Iniciar Atendimento</span>
            </button>
          ) : (
            /* CONTROLES DURANTE A CONSULTA */
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-semibold cursor-pointer"
                type="button"
                title={isPaused ? 'Retomar cronômetro' : 'Pausar cronômetro'}
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" /> : <Pause className="w-4 h-4" />}
                <span>{isPaused ? 'Retomar' : 'Pausar'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                type="button"
                title="Reiniciar cronômetro para 00:00"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onConclude}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#005F73] hover:bg-[#004655] text-white shadow-xs hover:shadow transition-all text-xs font-semibold cursor-pointer"
                type="button"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Concluir Atendimento</span>
              </button>
            </>
          )}

          <button
            onClick={onNextPatient}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-semibold cursor-pointer"
            type="button"
            title="Chamar próximo paciente da fila"
          >
            <SkipForward className="w-4 h-4" />
            <span>Chamar Próximo</span>
          </button>
        </div>
      </div>
    </section>
  );
};
