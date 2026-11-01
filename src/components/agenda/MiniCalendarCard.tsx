import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarCardProps {
  selectedDate?: Date;
  selectedDay?: number;
  selectedMonth?: number; // 0-11
  selectedYear?: number;
  onSelectDay?: (day: number) => void;
  onSelectDate?: (date: Date) => void;
}

export const MiniCalendarCard: React.FC<MiniCalendarCardProps> = ({
  selectedDate,
  selectedDay,
  selectedMonth,
  selectedYear,
  onSelectDay,
  onSelectDate,
}) => {
  const today = new Date();

  // O calendário sempre inicializa sincronizado com selectedDate ou data de hoje
  const [viewDate, setViewDate] = useState<Date>(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(selectedYear ?? today.getFullYear(), selectedMonth ?? today.getMonth(), 1)
  );

  const [currentDay, setCurrentDay] = useState<number>(
    selectedDate ? selectedDate.getDate() : (selectedDay ?? today.getDate())
  );

  // Sincroniza viewDate e currentDay quando selectedDate mudar externamente
  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      setCurrentDay(selectedDate.getDate());
    }
  }, [selectedDate]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Verifica se o mês e o ano visualizados correspondem ao mês e ano atuais
  const isCurrentMonth =
    viewMonth === today.getMonth() && viewYear === today.getFullYear();

  // Nome do mês com inicial maiúscula e ano (ex: "Outubro 2026")
  const rawMonthName = viewDate.toLocaleDateString('pt-BR', { month: 'long' });
  const monthName = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);
  const title = `${monthName} ${viewYear}`;

  // Cálculos precisos dos dias do mês
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Domingo, 1 = Segunda, etc.
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Dias do mês anterior para preencher a primeira linha
  const prevMonthDays: number[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  // Dias do mês atual
  const currentMonthDays: number[] = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    currentMonthDays.push(d);
  }

  // Dias do próximo mês para completar a grade
  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const targetGridCells = totalCells > 35 ? 42 : 35;
  const nextMonthDaysCount = targetGridCells - totalCells;
  const nextMonthDays: number[] = [];
  for (let d = 1; d <= nextMonthDaysCount; d++) {
    nextMonthDays.push(d);
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setCurrentDay(day);
    if (onSelectDay) onSelectDay(day);
    if (onSelectDate) onSelectDate(new Date(viewYear, viewMonth, day));
  };

  const handlePrevMonthDayClick = (day: number) => {
    const newMonth = viewMonth - 1;
    const newYear = viewYear;
    const newDate = new Date(newYear, newMonth, day);
    setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    setCurrentDay(day);
    if (onSelectDay) onSelectDay(day);
    if (onSelectDate) onSelectDate(newDate);
  };

  const handleNextMonthDayClick = (day: number) => {
    const newMonth = viewMonth + 1;
    const newYear = viewYear;
    const newDate = new Date(newYear, newMonth, day);
    setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    setCurrentDay(day);
    if (onSelectDay) onSelectDay(day);
    if (onSelectDate) onSelectDate(newDate);
  };

  const handleResetToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setCurrentDay(now.getDate());
    if (onSelectDay) onSelectDay(now.getDate());
    if (onSelectDate) onSelectDate(now);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handleResetToToday}
          className="text-sm font-bold text-slate-800 hover:text-[#005F73] transition-colors cursor-pointer text-left"
          title="Clique para voltar para a data de hoje"
        >
          {title}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            aria-label="Mês anterior"
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="Próximo mês"
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            type="button"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
        <span>DOM</span>
        <span>SEG</span>
        <span>TER</span>
        <span>QUA</span>
        <span>QUI</span>
        <span>SEX</span>
        <span>SÁB</span>
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 text-center text-xs font-medium gap-y-1">
        {/* Dias do mês anterior */}
        {prevMonthDays.map((d) => (
          <button
            key={`prev-${d}`}
            type="button"
            onClick={() => handlePrevMonthDayClick(d)}
            className="py-1.5 text-slate-300 hover:text-slate-500 rounded-lg transition-colors cursor-pointer"
          >
            {d}
          </button>
        ))}

        {/* Dias do mês atual */}
        {currentMonthDays.map((d) => {
          const isToday = isCurrentMonth && d === today.getDate();
          const isSelected = selectedDate
            ? selectedDate.getDate() === d &&
              selectedDate.getMonth() === viewMonth &&
              selectedDate.getFullYear() === viewYear
            : currentDay === d;

          let btnClass = 'text-slate-700 hover:bg-slate-100 font-medium';
          if (isSelected) {
            btnClass = 'bg-slate-900 text-white shadow-xs font-bold';
          } else if (isToday) {
            btnClass = 'bg-cyan-100 text-[#00696c] font-bold border border-cyan-300';
          }

          return (
            <button
              key={`current-${d}`}
              type="button"
              onClick={() => handleDayClick(d)}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer ${btnClass}`}
              title={isToday ? `Hoje, dia ${d}` : `Dia ${d}`}
            >
              {d}
            </button>
          );
        })}

        {/* Dias do próximo mês */}
        {nextMonthDays.map((d) => (
          <button
            key={`next-${d}`}
            type="button"
            onClick={() => handleNextMonthDayClick(d)}
            className="py-1.5 text-slate-300 hover:text-slate-500 rounded-lg transition-colors cursor-pointer"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};
