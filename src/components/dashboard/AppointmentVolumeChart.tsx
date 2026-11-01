import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { TimeFilter, VolumeDataPoint } from '../../types/dashboard';
import { DashboardChartData } from '../../services/dashboardService';

interface AppointmentVolumeChartProps {
  data?: DashboardChartData['volume'];
}

export const AppointmentVolumeChart: React.FC<AppointmentVolumeChartProps> = ({ data }) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('Semanal');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fallback defaults se ainda não carregou do Supabase
  const defaultWeeklyData: VolumeDataPoint[] = [
    { label: 'Seg', realized: 10, newPatients: 4, total: 14 },
    { label: 'Ter', realized: 13, newPatients: 5, total: 18 },
    { label: 'Qua', realized: 9, newPatients: 3, total: 12 },
    { label: 'Qui', realized: 16, newPatients: 6, total: 22 },
    { label: 'Sex', realized: 12, newPatients: 4, total: 16 },
    { label: 'Sáb', realized: 6, newPatients: 2, total: 8 },
  ];

  const defaultDailyData: VolumeDataPoint[] = [
    { label: '08h', realized: 2, newPatients: 1, total: 3 },
    { label: '10h', realized: 4, newPatients: 1, total: 5 },
    { label: '12h', realized: 1, newPatients: 0, total: 1 },
    { label: '14h', realized: 5, newPatients: 2, total: 7 },
    { label: '16h', realized: 3, newPatients: 1, total: 4 },
    { label: '18h', realized: 1, newPatients: 1, total: 2 },
  ];

  const defaultMonthlyData: VolumeDataPoint[] = [
    { label: 'Sem 1', realized: 48, newPatients: 14, total: 62 },
    { label: 'Sem 2', realized: 52, newPatients: 18, total: 70 },
    { label: 'Sem 3', realized: 45, newPatients: 12, total: 57 },
    { label: 'Sem 4', realized: 58, newPatients: 21, total: 79 },
  ];

  const weeklyData = data?.weekly && data.weekly.length > 0 ? data.weekly : defaultWeeklyData;
  const dailyData = data?.daily && data.daily.length > 0 ? data.daily : defaultDailyData;
  const monthlyData = data?.monthly && data.monthly.length > 0 ? data.monthly : defaultMonthlyData;

  const dailyAverage = data?.dailyAverage || '14.5';
  const weeklyCapacity = data?.weeklyCapacity || 120;
  const occupancyRate = data?.occupancyRate || 75;

  const currentData =
    activeFilter === 'Diário'
      ? dailyData
      : activeFilter === 'Mensal'
      ? monthlyData
      : weeklyData;

  const maxTotal = Math.max(...currentData.map((d) => d.total), 10);
  const chartHeight = 160;
  const chartYBaseline = 190;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0A9396]" />
              <h2 className="text-base text-slate-900 font-semibold">
                Volume de Agendamentos
              </h2>
            </div>
            <p className="text-xs text-slate-500">Distribuição por período operacional</p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg gap-1 self-start sm:self-auto">
            {(['Diário', 'Semanal', 'Mensal'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[#005F73] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Metric subtitle indicator */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#00696C]"></span>
            <span>Consultas Realizadas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#89F3F6]"></span>
            <span>Primeira Consulta</span>
          </div>
          <span className="sm:ml-auto text-xs font-semibold text-[#00696C]">
            {activeFilter === 'Semanal'
              ? `Média: ${dailyAverage} / dia`
              : activeFilter === 'Diário'
              ? `Média: ${(currentData.reduce((acc, d) => acc + d.total, 0) / (currentData.length || 1)).toFixed(1)} / turno`
              : `Média: ${(currentData.reduce((acc, d) => acc + d.total, 0) / (currentData.length || 1)).toFixed(1)} / sem`}
          </span>
        </div>

        {/* SVG Bar Chart */}
        <div className="relative w-full h-64 pt-2">
          <svg
            className="w-full h-full overflow-visible"
            fill="none"
            viewBox="0 0 540 220"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid Lines */}
            <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="520" y1="20" y2="20" />
            <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="520" y1="65" y2="65" />
            <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="520" y1="110" y2="110" />
            <line stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="520" y1="155" y2="155" />
            <line stroke="#CBD5E1" strokeWidth="1.5" x1="40" x2="520" y1="190" y2="190" />

            {/* Y Axis Labels */}
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="32" y="24">
              {Math.round(maxTotal)}
            </text>
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="32" y="69">
              {Math.round(maxTotal * 0.75)}
            </text>
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="32" y="114">
              {Math.round(maxTotal * 0.5)}
            </text>
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="32" y="159">
              {Math.round(maxTotal * 0.25)}
            </text>
            <text fill="#64748B" fontFamily="Inter" fontSize="11" textAnchor="end" x="32" y="193">
              0
            </text>

            {/* Bars */}
            {currentData.map((item, index) => {
              const count = currentData.length;
              const spacing = 450 / count;
              const startX = 65 + index * spacing;
              const barWidth = count > 5 ? 30 : 42;

              const totalHeight = maxTotal > 0 ? (item.total / maxTotal) * chartHeight : 0;
              const realizedHeight = maxTotal > 0 ? (item.realized / maxTotal) * chartHeight : 0;

              const totalY = chartYBaseline - totalHeight;
              const realizedY = chartYBaseline - realizedHeight;

              const isHovered = hoveredIndex === index;

              return (
                <g
                  key={item.label}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Top Bar (New patients / Total stack) */}
                  <rect
                    fill="#89F3F6"
                    height={Math.max(0, totalHeight)}
                    opacity={isHovered ? 1 : 0.85}
                    rx="4"
                    width={barWidth}
                    x={startX}
                    y={totalY}
                  />

                  {/* Bottom Bar (Realized appointments) */}
                  <rect
                    fill="#00696C"
                    height={Math.max(0, realizedHeight)}
                    rx="4"
                    width={barWidth}
                    x={startX}
                    y={realizedY}
                  />

                  {/* Floating Tooltip when hovered */}
                  {isHovered && (
                    <g className="animate-in fade-in duration-150">
                      <rect
                        fill="#004655"
                        height="24"
                        rx="5"
                        width="76"
                        x={startX + barWidth / 2 - 38}
                        y={Math.max(4, totalY - 28)}
                      />
                      <polygon
                        fill="#004655"
                        points={`${startX + barWidth / 2 - 5},${Math.max(4, totalY - 28) + 24} ${
                          startX + barWidth / 2 + 5
                        },${Math.max(4, totalY - 28) + 24} ${startX + barWidth / 2},${
                          Math.max(4, totalY - 28) + 28
                        }`}
                      />
                      <text
                        fill="#ffffff"
                        fontFamily="Inter"
                        fontSize="11"
                        fontWeight="600"
                        textAnchor="middle"
                        x={startX + barWidth / 2}
                        y={Math.max(4, totalY - 28) + 16}
                      >
                        {item.total} pac.
                      </text>
                    </g>
                  )}

                  {/* X Axis Label */}
                  <text
                    fill={isHovered ? '#004655' : '#64748B'}
                    fontFamily="Inter"
                    fontSize="12"
                    fontWeight={isHovered ? '600' : '400'}
                    textAnchor="middle"
                    x={startX + barWidth / 2}
                    y="208"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-2 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 text-xs border-t border-slate-100 gap-1">
        <span>Capacidade total: {weeklyCapacity} atendimentos/sem</span>
        <span className="text-[#0A9396] font-semibold">Taxa de preenchimento: {occupancyRate}%</span>
      </div>
    </div>
  );
};
