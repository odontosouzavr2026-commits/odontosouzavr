import React from 'react';
import { LayoutDashboard, Calendar, Users, Stethoscope, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  activePath: string;
  onNavigate: (path: string) => void;
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePath,
  onNavigate,
  onOpenDrawer,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center w-14 h-14 transition-colors cursor-pointer ${
            activePath === 'dashboard' ? 'text-[#00696c]' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Dashboard"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">Dashboard</span>
        </button>

        {/* Agenda */}
        <button
          onClick={() => onNavigate('agenda')}
          className={`flex flex-col items-center justify-center w-14 h-14 transition-colors cursor-pointer ${
            activePath === 'agenda' ? 'text-[#00696c]' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Agenda"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Agenda</span>
        </button>

        {/* Pacientes */}
        <button
          onClick={() => onNavigate('pacientes')}
          className={`flex flex-col items-center justify-center w-14 h-14 transition-colors cursor-pointer ${
            activePath === 'pacientes' ? 'text-[#00696c]' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Pacientes"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Pacientes</span>
        </button>

        {/* Atendimento */}
        <button
          onClick={() => onNavigate('atendimento')}
          className={`flex flex-col items-center justify-center w-14 h-14 transition-colors cursor-pointer ${
            activePath === 'atendimento' ? 'text-[#00696c]' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Atendimento"
        >
          <Stethoscope className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Atendimento</span>
        </button>

        {/* Mais (Abre Drawer) */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center w-14 h-14 text-slate-500 hover:text-[#005F73] transition-colors cursor-pointer"
          aria-label="Mais opções e menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Mais</span>
        </button>
      </div>
    </nav>
  );
};
