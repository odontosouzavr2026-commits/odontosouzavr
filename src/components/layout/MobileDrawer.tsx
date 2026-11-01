import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  LayoutDashboard,
  Stethoscope,
  Calendar,
  Layers,
  Users,
  DollarSign,
  FileText,
  Settings,
  ChevronDown,
  MessageSquare,
  LogOut,
  Building2,
  Network,
  UserCog,
  HelpCircle,
  Wifi,
  ShieldCheck,
  FlaskConical,
  PackageCheck,
  Globe,
} from 'lucide-react';
import { ToothIcon } from '../common/ToothIcon';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
  onOpenHelp?: () => void;
  onLogout?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activePath,
  onNavigate,
  onOpenHelp,
  onLogout,
}) => {
  const configSubRoutes = [
    'agenda-horarios',
    'modelos-documentos',
    'integracoes-apis',
    'template-mensagens',
    'templates-whatsapp',
    'conexoes',
    'auditoria',
    'portal-paciente',
    'configuracoes',
  ];

  // Sempre inicia fechado ao abrir o sistema
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // Fecha o menu de configurações imediatamente se mudar para outro menu
  useEffect(() => {
    if (!configSubRoutes.includes(activePath)) {
      setIsConfigOpen(false);
    }
  }, [activePath]);

  if (!isOpen) return null;

  const handleLinkClick = (path: string) => {
    if (!configSubRoutes.includes(path)) {
      setIsConfigOpen(false);
    }
    onNavigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Aside */}
      <aside
        className="relative w-[82%] max-w-[320px] h-full bg-[#005f73] text-white flex flex-col justify-between shadow-2xl z-10 pt-safe pb-safe animate-in slide-in-from-left duration-300"
        role="dialog"
        aria-label="Menu de Navegação Principal"
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#89f3f6] shrink-0">
                <ToothIcon className="w-5 h-5 text-[#89f3f6]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[16px] leading-tight tracking-tight text-white">
                  ODONTO SOUZA
                </span>
                <span className="text-[10px] tracking-wider uppercase text-cyan-200/80 font-medium">
                  Clínica Odontológica
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Doctor Profile Card */}
          <div className="p-3.5 mx-3 my-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[14px] text-white truncate leading-tight">
                Dr. Frankisney Souza
              </span>
              <span className="text-[11px] text-cyan-200/80 truncate leading-tight mt-0.5">
                Cirurgião-Dentista
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 py-1 flex flex-col space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => handleLinkClick('dashboard')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'dashboard'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* Agenda */}
            <button
              onClick={() => handleLinkClick('agenda')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'agenda'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Agenda</span>
            </button>

            {/* Atendimento */}
            <button
              onClick={() => handleLinkClick('atendimento')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'atendimento'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <Stethoscope className="w-5 h-5 shrink-0" />
              <span>Atendimento</span>
            </button>

            {/* Procedimentos */}
            <button
              onClick={() => handleLinkClick('procedimentos')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'procedimentos'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <Layers className="w-5 h-5 shrink-0" />
              <span>Procedimentos</span>
            </button>

            {/* Pacientes */}
            <button
              onClick={() => handleLinkClick('pacientes')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'pacientes'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span>Pacientes</span>
            </button>

            {/* Convênios */}
            <button
              onClick={() => handleLinkClick('convenios')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'convenios'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>Convênios</span>
            </button>

            {/* Laboratório */}
            <button
              onClick={() => handleLinkClick('laboratorio')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'laboratorio'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <FlaskConical className="w-5 h-5 shrink-0" />
              <span>Laboratório</span>
            </button>

            {/* Estoque */}
            <button
              onClick={() => handleLinkClick('estoque')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'estoque'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <PackageCheck className="w-5 h-5 shrink-0" />
              <span>Estoque</span>
            </button>

            {/* Financeiro */}
            <button
              onClick={() => handleLinkClick('financeiro')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'financeiro'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <DollarSign className="w-5 h-5 shrink-0" />
              <span>Financeiro</span>
            </button>

            {/* Relatórios */}
            <button
              onClick={() => handleLinkClick('relatorios')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'relatorios'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span>Relatórios</span>
            </button>

            {/* Usuários */}
            <button
              onClick={() => handleLinkClick('usuarios')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors w-full text-left cursor-pointer ${
                activePath === 'usuarios'
                  ? 'bg-[#0a9396] text-white font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <UserCog className="w-5 h-5 shrink-0" />
              <span>Usuários</span>
            </button>

            {/* Configurações Accordion */}
            <div className="pt-1">
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white/90 bg-white/5 font-medium text-[14px] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  <span>Configurações</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isConfigOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isConfigOpen && (
                <div className="pl-6 pr-2 pt-1 pb-1 space-y-1 animate-in fade-in duration-150">
                  {[
                    { id: 'agenda-horarios', label: 'Agenda e Horários', icon: Calendar },
                    { id: 'modelos-documentos', label: 'Modelos de Documentos', icon: FileText, badge: '14' },
                    { id: 'integracoes-apis', label: 'Integrações e APIs', icon: Network },
                    { id: 'template-mensagens', label: 'Template de Mensagens', icon: MessageSquare },
                    { id: 'conexoes', label: 'Conexões', icon: Wifi },
                    { id: 'auditoria', label: 'Auditoria e Logs', icon: ShieldCheck, badge: 'LGPD' },
                    { id: 'portal-paciente', label: 'Portal & Agendamento', icon: Globe, badge: 'Online' },
                  ].map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive =
                      activePath === sub.id ||
                      (sub.id === 'template-mensagens' && activePath === 'templates-whatsapp');

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleLinkClick(sub.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-colors text-left cursor-pointer ${
                          isSubActive
                            ? 'bg-white text-[#005F73] font-bold shadow-xs'
                            : 'text-cyan-100 hover:text-white hover:bg-white/5 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SubIcon
                            className={`w-4 h-4 shrink-0 ${
                              isSubActive ? 'text-[#005F73]' : 'text-cyan-200'
                            }`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </div>
                        {sub.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                              isSubActive
                                ? 'bg-[#005F73]/15 text-[#005F73]'
                                : 'bg-white/20 text-white'
                            }`}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* User Quick Actions & Logout Footer */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
          <button
            onClick={() => handleLinkClick('dados-clinica')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activePath === 'dados-clinica'
                ? 'bg-white text-[#005F73] font-bold'
                : 'text-cyan-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Dados da Clínica</span>
          </button>
          <button
            onClick={() => {
              onClose();
              if (onOpenHelp) onOpenHelp();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-cyan-100 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Ajuda e Suporte</span>
          </button>
          <button
            onClick={() => {
              onClose();
              if (onLogout) {
                onLogout();
              } else {
                handleLinkClick('login');
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-200 hover:text-rose-100 hover:bg-rose-500/20 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
