import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Download } from 'lucide-react';
import { DashboardChartData, FinancialChartPoint } from '../../services/dashboardService';

interface FinancialGrowthChartProps {
  data?: DashboardChartData['financial'];
}

export const FinancialGrowthChart: React.FC<FinancialGrowthChartProps> = ({ data }) => {
  const defaultPoints: FinancialChartPoint[] = [
    { label: 'Semana 1 (Atual)', value: 'R$ 0,00', amount: 0, x: 65, y: 190, isCurrent: true },
    { label: 'Semana 2', value: 'R$ 0,00', amount: 0, x: 190, y: 190 },
    { label: 'Semana 3', value: 'R$ 0,00', amount: 0, x: 305, y: 190 },
    { label: 'Semana 4', value: 'R$ 0,00', amount: 0, x: 435, y: 190 },
    { label: 'Proj.', value: 'R$ 0,00', amount: 0, x: 515, y: 190, isProjected: true },
  ];

  const points = data?.points && data.points.length > 0 ? data.points : defaultPoints;
  const initialIdx = points.findIndex((p) => p.isCurrent);
  const [activePointIndex, setActivePointIndex] = useState<number>(initialIdx >= 0 ? initialIdx : 0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const idx = points.findIndex((p) => p.isCurrent);
    if (idx >= 0) {
      setActivePointIndex(idx);
    }
  }, [data]);

  const currentRevenueFormatted = data?.formattedRevenue || 'R$ 0,00';
  const monthlyGoalFormatted = data?.monthlyGoal
    ? `R$ ${Math.round(data.monthlyGoal).toLocaleString('pt-BR')}`
    : 'R$ 50.000';
  const goalPercentage = data?.goalPercentage ?? 0;
  const growthPercentage = data?.growthPercentage ?? 0;
  const avgProcedure = data?.averageProcedureRevenue
    ? `R$ ${data.averageProcedureRevenue},00`
    : 'R$ 0,00';

  const handleExportDRE = () => {
    try {
      const dateStr = new Date().toLocaleDateString('pt-BR');
      const timeStr = new Date().toLocaleTimeString('pt-BR');
      const csvRows = [
        ['DEMONSTRATIVO DE RESULTADO DO EXERCÍCIO (DRE) - CLÍNICA ODONTOSOUZA'],
        [`Data de Emissão: ${dateStr} às ${timeStr}`],
        [''],
        ['Indicador / Rubrica', 'Valor'],
        ['Receita Líquida Acumulada no Mês', currentRevenueFormatted],
        ['Meta Financeira Mensal', `${monthlyGoalFormatted},00`],
        ['Percentual Atingido da Meta', `${goalPercentage}%`],
        ['Crescimento vs Mês Anterior', `+${growthPercentage}%`],
        ['Receita Média por Procedimento Cadastrado', avgProcedure],
        [''],
        ['Evolução Semanal', 'Receita Estimada'],
      ];

      points.forEach((pt) => {
        csvRows.push([pt.label, pt.value]);
      });

      const csvContent = '\uFEFF' + csvRows.map((row) => row.join(';')).join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `DRE_OdontoSouza_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToastMessage('Relatório DRE exportado com sucesso!');
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    } catch (e) {
      console.error('Falha ao exportar DRE:', e);
      setToastMessage('Erro ao gerar relatório DRE.');
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
  };

  const currentPoint = points[activePointIndex] || points[0] || { x: 65, y: 190, value: 'R$ 0,00' };

  // Gera curva Bézier suave entre os pontos informados
  const generateSmoothPath = (pts: FinancialChartPoint[]) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const pCurrent = pts[i];
      const pNext = pts[i + 1];
      const dx = pNext.x - pCurrent.x;
      const cp1x = pCurrent.x + dx * 0.4;
      const cp1y = pCurrent.y;
      const cp2x = pNext.x - dx * 0.4;
      const cp2y = pNext.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pNext.x} ${pNext.y}`;
    }
    return path;
  };

  // Linha contínua até semana 4
  const linePoints = points.slice(0, 4);
  const linePathD = generateSmoothPath(linePoints);

  // Área preenchida até o ponto final (projeção)
  const areaSmooth = generateSmoothPath(points);
  const lastPt = points[points.length - 1] || { x: 515, y: 190 };
  const firstPt = points[0] || { x: 65, y: 190 };
  const areaPathD = `${areaSmooth} L ${lastPt.x} 190 L ${firstPt.x} 190 Z`;

  const p3 = points[3] || { x: 435, y: 190 };
  const p4 = points[4] || { x: 515, y: 190 };

  // Escala dinâmica para os rótulos do eixo Y
  const monthlyGoalVal = data?.monthlyGoal || 50000;
  const maxScale = Math.max(monthlyGoalVal, 5000);
  const formatYLabel = (val: number) => {
    if (val >= 1000) {
      const k = val / 1000;
      return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
    }
    return String(Math.round(val));
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in duration-200 z-10">
          <CheckCircle className="w-3.5 h-3.5" />
          {toastMessage}
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00696c]" />
              <h2 className="text-base text-slate-900 font-semibold">Crescimento Financeiro</h2>
            </div>
            <p className="text-xs text-slate-500">Receita líquida acumulada mensal</p>
          </div>
          <div className="flex items-center gap-2 bg-[#b0efda]/40 px-3 py-1 rounded-full self-start sm:self-auto border border-[#95d3be]/40">
            <TrendingUp className="w-4 h-4 text-[#00493a]" />
            <span className="text-xs text-[#00493a] font-bold">+{growthPercentage}% vs mês ant.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-3 mb-4">
          <span className="text-2xl sm:text-3xl text-slate-900 font-bold tracking-tight">
            {currentRevenueFormatted}
          </span>
          <span className="text-xs text-slate-400">
            Meta mensal: {monthlyGoalFormatted} ({goalPercentage}%)
          </span>
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full h-64 pt-2">
          <svg
            className="w-full h-full overflow-visible"
            fill="none"
            viewBox="0 0 540 220"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#95d3be" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#95d3be" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#95d3be" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="45" x2="520" y1="20" y2="20" />
            <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="45" x2="520" y1="65" y2="65" />
            <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="45" x2="520" y1="110" y2="110" />
            <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="45" x2="520" y1="155" y2="155" />
            <line stroke="#CBD5E1" strokeWidth="1.5" x1="45" x2="520" y1="190" y2="190" />

            {/* Y Axis Labels */}
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="35" y="24">
              {formatYLabel(maxScale)}
            </text>
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="35" y="69">
              {formatYLabel(maxScale * 0.75)}
            </text>
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="35" y="114">
              {formatYLabel(maxScale * 0.5)}
            </text>
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="35" y="159">
              {formatYLabel(maxScale * 0.25)}
            </text>
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="35" y="193">
              0k
            </text>

            {/* Area Path (Smooth curve) */}
            <path
              d={areaPathD}
              fill="url(#areaGradient)"
            />

            {/* Main Line Stroke */}
            <path
              d={linePathD}
              fill="none"
              stroke="#00696c"
              strokeLinecap="round"
              strokeWidth="3"
            />

            {/* Target projection dotted line */}
            <line
              opacity="0.6"
              stroke="#004655"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              x1={p3.x}
              x2={p4.x}
              y1={p3.y}
              y2={p4.y}
            />

            {/* Dynamic Tooltip */}
            <g className="transition-all duration-200">
              <rect
                fill="#004655"
                height="25"
                rx="5"
                width="98"
                x={currentPoint.x - 49}
                y={Math.max(4, currentPoint.y - 37)}
              />
              <polygon
                fill="#004655"
                points={`${currentPoint.x - 5},${Math.max(4, currentPoint.y - 37) + 25} ${
                  currentPoint.x + 5
                },${Math.max(4, currentPoint.y - 37) + 25} ${currentPoint.x},${
                  Math.max(4, currentPoint.y - 37) + 29
                }`}
              />
              <text
                fill="#ffffff"
                fontFamily="Inter"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
                x={currentPoint.x}
                y={Math.max(4, currentPoint.y - 37) + 16}
              >
                {currentPoint.value}
              </text>
            </g>

            {/* Interactive Data Circles */}
            {points.map((pt, idx) => (
              <g
                key={pt.label}
                className="cursor-pointer"
                onClick={() => setActivePointIndex(idx)}
                onMouseEnter={() => setActivePointIndex(idx)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  fill={pt.isProjected ? '#00696c' : '#ffffff'}
                  r={activePointIndex === idx ? 6 : 4.5}
                  stroke="#00696c"
                  strokeWidth={activePointIndex === idx ? 3 : 2.5}
                  className="transition-transform hover:scale-125"
                />
                {/* Invisible hover target */}
                <circle cx={pt.x} cy={pt.y} fill="transparent" r="16" />

                {/* X Axis Labels */}
                <text
                  fill={
                    pt.isCurrent
                      ? '#004655'
                      : activePointIndex === idx
                      ? '#005F73'
                      : '#64748B'
                  }
                  fontFamily="Inter"
                  fontSize="12"
                  fontWeight={pt.isCurrent || activePointIndex === idx ? '600' : '400'}
                  textAnchor="middle"
                  x={pt.x}
                  y="208"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-2 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 text-xs border-t border-slate-100 gap-2">
        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Receita média por procedimento: {avgProcedure}
        </span>
        <button
          onClick={handleExportDRE}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:opacity-80 text-white font-extrabold text-xs shadow-2xs transition-opacity cursor-pointer"
          type="button"
        >
          <span>Exportar Relatório DRE</span>
          <Download className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
};
