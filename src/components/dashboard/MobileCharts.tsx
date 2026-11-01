import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { TimeFilter, VolumeDataPoint } from '../../types/dashboard';
import { DashboardChartData } from '../../services/dashboardService';

interface MobileChartsProps {
  data?: DashboardChartData;
}

export const MobileCharts: React.FC<MobileChartsProps> = ({ data }) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('Semanal');

  const defaultWeekly: VolumeDataPoint[] = [
    { label: 'Seg', realized: 10, newPatients: 4, total: 14 },
    { label: 'Ter', realized: 13, newPatients: 5, total: 18 },
    { label: 'Qua', realized: 9, newPatients: 3, total: 12 },
    { label: 'Qui', realized: 16, newPatients: 6, total: 22 },
    { label: 'Sex', realized: 12, newPatients: 4, total: 16 },
    { label: 'Sáb', realized: 6, newPatients: 2, total: 8 },
  ];

  const defaultDaily: VolumeDataPoint[] = [
    { label: '08h', realized: 2, newPatients: 1, total: 3 },
    { label: '10h', realized: 4, newPatients: 1, total: 5 },
    { label: '12h', realized: 1, newPatients: 0, total: 1 },
    { label: '14h', realized: 5, newPatients: 2, total: 7 },
    { label: '16h', realized: 3, newPatients: 1, total: 4 },
    { label: '18h', realized: 1, newPatients: 1, total: 2 },
  ];

  const defaultMonthly: VolumeDataPoint[] = [
    { label: 'Sem 1', realized: 48, newPatients: 14, total: 62 },
    { label: 'Sem 2', realized: 52, newPatients: 18, total: 70 },
    { label: 'Sem 3', realized: 45, newPatients: 12, total: 57 },
    { label: 'Sem 4', realized: 58, newPatients: 21, total: 79 },
  ];

  const weeklyData = data?.volume?.weekly?.length ? data.volume.weekly : defaultWeekly;
  const dailyData = data?.volume?.daily?.length ? data.volume.daily : defaultDaily;
  const monthlyData = data?.volume?.monthly?.length ? data.volume.monthly : defaultMonthly;

  const currentData =
    activeFilter === 'Diário'
      ? dailyData
      : activeFilter === 'Mensal'
      ? monthlyData
      : weeklyData;

  const dailyAverage = data?.volume?.dailyAverage || '14.5';
  const currentRevenue = data?.financial?.formattedRevenue || 'R$ 0,00';
  const growth = data?.financial?.growthPercentage ?? 0;
  const goal = data?.financial?.monthlyGoal
    ? Math.round(data.financial.monthlyGoal).toLocaleString('pt-BR')
    : '50.000';
  const goalPercent = data?.financial?.goalPercentage ?? 0;

  const maxTotal = Math.max(...currentData.map((d) => d.total), 10);
  const chartHeight = 70;
  const chartBaseline = 95;

  return (
    <section className="flex flex-col space-y-4">
      {/* Card 1: Volume de Agendamentos (BarChart) */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-semibold text-slate-900 block leading-tight">
              Volume de Agendamentos
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Média: {dailyAverage} pacientes/dia
            </span>
          </div>
        </div>

        {/* Abas Diário / Semanal / Mensal */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
          {(['Diário', 'Semanal', 'Mensal'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`py-1.5 text-xs rounded-md text-center transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-white text-[#004655] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Bar Chart Inline SVG Dinâmico */}
        <div className="w-full pt-2">
          <svg
            aria-label="Gráfico de Agendamentos"
            className="w-full h-28 overflow-visible"
            viewBox="0 0 320 120"
          >
            {/* Linhas de Apoio */}
            <line stroke="#d3e4fe" strokeDasharray="3,3" strokeWidth="1" x1="10" x2="310" y1="20" y2="20" />
            <line stroke="#d3e4fe" strokeDasharray="3,3" strokeWidth="1" x1="10" x2="310" y1="60" y2="60" />
            <line stroke="#d3e4fe" strokeWidth="1" x1="10" x2="310" y1={chartBaseline} y2={chartBaseline} />

            {/* Barras dinâmicas */}
            {currentData.map((d, i) => {
              const count = currentData.length;
              const spacing = 280 / count;
              const barWidth = count > 5 ? 20 : 32;
              const x = 20 + i * spacing + (spacing - barWidth) / 2;
              const barHeight = maxTotal > 0 ? (d.total / maxTotal) * chartHeight : 0;
              const y = chartBaseline - barHeight;
              const isPeak = d.total === maxTotal;

              return (
                <g key={d.label}>
                  <rect
                    fill={isPeak ? '#005f73' : '#00696c'}
                    height={Math.max(2, barHeight)}
                    opacity={isPeak ? 1 : 0.85}
                    rx="4"
                    width={barWidth}
                    x={x}
                    y={y}
                  />
                  {isPeak && (
                    <text
                      className="fill-[#005f73] text-[10px] font-bold font-sans"
                      textAnchor="middle"
                      x={x + barWidth / 2}
                      y={Math.max(14, y - 4)}
                    >
                      {d.total}
                    </text>
                  )}
                  <text
                    className="fill-[#3f484c] text-[10px] font-sans"
                    textAnchor="middle"
                    x={x + barWidth / 2}
                    y="112"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Card 2: Crescimento Financeiro (AreaChart) */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-base font-semibold text-slate-900 block leading-tight">
              Crescimento Financeiro
            </span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {currentRevenue}
            </span>
            <span className="text-[11px] text-[#00493a] inline-flex items-center gap-0.5 font-semibold mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +{growth}% vs mês anterior
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Meta: R$ {goal}</span>
            <span className="text-[11px] text-[#00696c] font-bold block mt-0.5">{goalPercent}% alcançado</span>
          </div>
        </div>

        {/* Area Chart Inline SVG */}
        <div className="w-full pt-1">
          <svg
            aria-label="Gráfico de Receita Acumulada"
            className="w-full h-24 overflow-visible"
            viewBox="0 0 320 90"
          >
            <defs>
              <linearGradient id="areaGradMobile" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#95d3be" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#95d3be" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid horizontal sutil */}
            <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="320" y1="85" y2="85" />
            <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="320" y1="45" y2="45" />
            {/* Área sombreada */}
            <polygon
              fill="url(#areaGradMobile)"
              points="10,75 50,68 100,58 150,62 200,42 260,32 310,18 310,85 10,85"
            />
            {/* Linha do gráfico */}
            <polyline
              fill="none"
              points="10,75 50,68 100,58 150,62 200,42 260,32 310,18"
              stroke="#00493a"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
            {/* Ponto de pico atual */}
            <circle cx="310" cy="18" fill="#00493a" r="4.5" stroke="#ffffff" strokeWidth="2" />
          </svg>
        </div>

        {/* Indicadores de semana */}
        <div className="flex items-center justify-between pt-1 text-slate-500 text-[11px]">
          <span>Semana 1</span>
          <span>Semana 2</span>
          <span>Semana 3</span>
          <span className="font-bold text-slate-900">Semana 4 (Atual)</span>
        </div>
      </div>
    </section>
  );
};
