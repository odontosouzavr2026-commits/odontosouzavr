import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Calendar,
  Layers,
  Users,
  DollarSign,
  FileText,
  Settings,
  ChevronDown,
  LogOut,
  Clock,
  Bell,
  User,
  PanelLeftClose,
  PanelLeft,
  Menu,
  MessageSquare,
  Building2,
  Network,
  UserCog,
  HelpCircle,
  X,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Wifi,
  FlaskConical,
  PackageCheck,
  Globe,
  UserCheck,
  Volume2,
  VolumeX,
  Eye,
  Trash2,
  Check,
  AlertCircle,
  UserPlus,
  BellRing,
} from 'lucide-react';
import { ToothIcon } from '../common/ToothIcon';
import { MobileDrawer } from './MobileDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { scrollToTop } from '../../utils/scrollUtils';
import { useNotifications } from '../../contexts/NotificationContext';

interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  onNavigate?: (path: string) => void;
  currentUser?: CurrentUser | null;
  onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activePath = 'dashboard',
  onNavigate,
  currentUser,
  onLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const d = new Date();
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  });
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentDateTime(`${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseEnterUser = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
      userMenuTimeoutRef.current = null;
    }
    setIsUserMenuOpen(true);
  };

  const handleMouseLeaveUser = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (userMenuTimeoutRef.current) {
        clearTimeout(userMenuTimeoutRef.current);
      }
    };
  }, []);

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

  // Fecha o menu de configurações imediatamente caso a rota ativa não seja de configurações
  useEffect(() => {
    if (!configSubRoutes.includes(activePath)) {
      setIsConfigOpen(false);
    }
  }, [activePath]);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement | null>(null);

  const {
    notificacoes,
    unreadCount,
    somHabilitado,
    notificacaoSelecionada,
    marcarComoLida,
    marcarTodasComoLidas,
    excluirNotificacao,
    limparTodas,
    lerNotificacao,
    fecharModalLeitura,
    toggleSom,
    testarSom,
  } = useNotifications();

  // Fecha dropdown de notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Agora';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `Há ${diffMin} min`;
      if (diffHours < 24) return `Há ${diffHours} h`;
      if (diffDays === 1) return 'Ontem';
      return `Há ${diffDays} dias`;
    } catch {
      return 'Recente';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'atendimento', label: 'Atendimento', icon: Stethoscope },
    { id: 'procedimentos', label: 'Procedimentos', icon: Layers },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'convenios', label: 'Convênios', icon: ShieldCheck },
    { id: 'laboratorio', label: 'Laboratório', icon: FlaskConical },
    { id: 'estoque', label: 'Estoque', icon: PackageCheck },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'usuarios', label: 'Usuários', icon: UserCog },
  ];

  useEffect(() => {
    scrollToTop();
  }, [activePath]);

  const handleNavClick = (id: string) => {
    scrollToTop();
    // Ao clicar em qualquer outro menu fora de configurações, fecha imediatamente
    if (!configSubRoutes.includes(id)) {
      setIsConfigOpen(false);
    }
    if (onNavigate) onNavigate(id);
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-800 flex flex-col font-sans">
      {/* Mobile Drawer (Sidebar Aberta conforme screenshot do modelo) */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activePath={activePath}
        onNavigate={handleNavClick}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR (Aparece em telas lg+)                         */}
      {/* ============================================================== */}
      <aside
        className={`fixed left-0 top-0 h-full bg-[#005f73] text-white z-40 hidden lg:flex flex-col justify-between shadow-lg transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Header / Logo */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-[#89f3f6] shrink-0">
                  <ToothIcon className="w-5 h-5 text-[#89f3f6]" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col transition-opacity">
                    <span className="font-bold text-sm tracking-tight text-white truncate">
                      ODONTO SOUZA
                    </span>
                    <span className="text-[10px] text-[#91d7ee] tracking-wider uppercase truncate">
                      Clínica Odonto
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-1 flex items-center justify-center cursor-pointer"
                title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
              >
                {isCollapsed ? (
                  <PanelLeft className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1 p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={item.label}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#00696c] text-white shadow-xs font-semibold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}

              {/* Configurações Accordion */}
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    if (isCollapsed) setIsCollapsed(false);
                    setIsConfigOpen((prev) => !prev);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  }`}
                  title="Configurações"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 shrink-0" />
                    {!isCollapsed && (
                      <span className="text-xs sm:text-sm font-medium">Configurações</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={`w-4 h-4 text-white/70 transition-transform ${
                        isConfigOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {!isCollapsed && isConfigOpen && (
                  <div className="flex flex-col pl-4 pr-2 py-1.5 gap-1.5">
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
                          onClick={() => handleNavClick(sub.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                            isSubActive
                              ? 'bg-white text-[#005F73] font-bold shadow-xs'
                              : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                          }`}
                          title={sub.label}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <SubIcon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isSubActive ? 'text-[#005F73]' : 'text-white/70'
                              }`}
                            />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1.5 shrink-0 ${
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

          {/* Footer Logout */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  handleNavClick('login');
                }
              }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/80 hover:bg-red-500/20 hover:text-white transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="Sair da Conta"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-xs sm:text-sm font-medium">Sair</span>}
            </button>
          </div>
        </aside>

      {/* ============================================================== */}
      {/* HEADER PRINCIPAL                                              */}
      {/* ============================================================== */}
      <header
        className={`fixed top-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ease-in-out ${
          isCollapsed
            ? 'left-0 lg:left-20'
            : 'left-0 lg:left-64'
        }`}
      >
        {/* Left header: Hamburger (mobile) or Title */}
        <div className="flex items-center gap-2.5">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:text-[#005F73] active:bg-slate-100 transition-colors cursor-pointer flex lg:hidden -ml-1"
            aria-label="Abrir menu lateral"
            title="Abrir menu lateral"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Dental Logo icon (Mobile header style) */}
          <div className="w-9 h-9 rounded-lg bg-[#004655] flex items-center justify-center text-white shrink-0 flex lg:hidden">
            <ToothIcon className="w-5 h-5 text-[#89f3f6]" />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-[#004655] lg:text-slate-900 leading-tight tracking-tight">
                ODONTO SOUZA
              </span>
              <span className="hidden sm:inline text-lg">👋</span>
            </div>
            <span className="text-[11px] text-slate-500 leading-none mt-0.5">
              Olá, {currentUser?.name || 'Dr. Frankisney Souza'}
            </span>
          </div>
        </div>

        {/* Right header */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Clock badge on desktop */}
          <div className="hidden md:flex items-center gap-2 text-slate-600 text-xs font-medium bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-[#005F73]" />
            <span>{currentDateTime}</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-[#005F73] hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="Notificações da Clínica"
              aria-label="Notificações da Clínica"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3 px-3 z-50 animate-in fade-in duration-150 flex flex-col">
                {/* Header do Dropdown */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Notificações
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-200">
                        {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Botão de Testar Som de Campainha (Ding-Ding 2x) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        testarSom();
                      }}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                      title="Testar Campainha de Recepção (Ding-Ding 2x)"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline text-[10px] font-bold text-amber-700">Testar Som</span>
                    </button>

                    {/* Mute/Unmute toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSom();
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        somHabilitado
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={
                        somHabilitado
                          ? 'Campainha ativa (clique para silenciar)'
                          : 'Campainha silenciada (clique para ativar)'
                      }
                    >
                      {somHabilitado ? (
                        <Volume2 className="w-3.5 h-3.5" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Marcar todas lidas */}
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={marcarTodasComoLidas}
                        className="text-[11px] text-[#005F73] hover:underline font-semibold cursor-pointer ml-1"
                        title="Marcar todas como lidas"
                      >
                        Lidas
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de Notificações */}
                <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
                  {notificacoes.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                      Nenhuma notificação no momento
                    </div>
                  ) : (
                    notificacoes.map((n) => {
                      const isUnread = !n.lida;
                      const iconBg =
                        n.tipo === 'novo_cadastro'
                          ? 'bg-emerald-100 text-emerald-700'
                          : n.tipo === 'alteracao_agendamento'
                          ? 'bg-amber-100 text-amber-700'
                          : n.tipo === 'cancelamento_agendamento'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-sky-100 text-sky-700';

                      return (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition-all border ${
                            isUnread
                              ? 'bg-sky-50/70 border-sky-200/80 shadow-xs'
                              : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Ícone por tipo */}
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}
                            >
                              {n.tipo === 'novo_cadastro' && <UserPlus className="w-3.5 h-3.5" />}
                              {n.tipo === 'novo_agendamento' && <Calendar className="w-3.5 h-3.5" />}
                              {n.tipo === 'alteracao_agendamento' && <Clock className="w-3.5 h-3.5" />}
                              {n.tipo === 'cancelamento_agendamento' && <AlertCircle className="w-3.5 h-3.5" />}
                              {n.tipo !== 'novo_cadastro' &&
                                n.tipo !== 'novo_agendamento' &&
                                n.tipo !== 'alteracao_agendamento' &&
                                n.tipo !== 'cancelamento_agendamento' && (
                                  <Bell className="w-3.5 h-3.5" />
                                )}
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <p
                                  className={`text-xs truncate ${
                                    isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                                  }`}
                                >
                                  {n.titulo}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {formatRelativeTime(n.dataHora)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                                {n.mensagem}
                              </p>

                              {/* Ações: Ler, Marcar como lida, Excluir */}
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                                <div className="flex items-center gap-1.5">
                                  {/* Botão de Ler */}
                                  <button
                                    type="button"
                                    onClick={() => lerNotificacao(n)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#005F73]/10 hover:bg-[#005F73] text-[#005F73] hover:text-white transition-colors cursor-pointer"
                                    title="Visualizar detalhes completos"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Ler
                                  </button>

                                  {/* Botão de Marcar como lida */}
                                  {isUnread && (
                                    <button
                                      type="button"
                                      onClick={() => marcarComoLida(n.id)}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                                      title="Marcar como lida"
                                    >
                                      <Check className="w-3 h-3" />
                                      Lida
                                    </button>
                                  )}
                                </div>

                                {/* Botão de Excluir */}
                                <button
                                  type="button"
                                  onClick={() => excluirNotificacao(n.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Excluir notificação"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer do Dropdown */}
                {notificacoes.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between px-1 text-[10px] text-slate-500">
                    <span>
                      {notificacoes.length} registro{notificacoes.length > 1 ? 's' : ''} • Som 2x{' '}
                      {somHabilitado ? 'ativo' : 'mudo'}
                    </span>
                    <button
                      type="button"
                      onClick={limparTodas}
                      className="text-rose-600 hover:underline font-semibold cursor-pointer"
                      title="Excluir todas as notificações"
                    >
                      Limpar histórico
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User profile with suspended dropdown (Menu Suspenso no ícone do usuário) */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnterUser}
            onMouseLeave={handleMouseLeaveUser}
          >
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-full sm:rounded-xl hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005F73]/20"
              aria-label="Menu do Usuário"
              aria-expanded={isUserMenuOpen}
              title="Menu do Usuário (Passe o mouse ou clique)"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#004655] hover:bg-[#005F73] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-[#005F73]/20">
                <User className="w-4 h-4 text-white stroke-[2.2]" />
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser ? currentUser.name : 'Dr. Everaldo Souza'}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {currentUser ? currentUser.role : 'Administrador'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block ${
                  isUserMenuOpen ? 'rotate-180 text-[#005F73]' : ''
                }`}
              />
            </button>

            {/* Menu Suspenso (Dropdown) */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-full pt-2 w-72 sm:w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseEnter={handleMouseEnterUser}
                onMouseLeave={handleMouseLeaveUser}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
                  {/* Cabeçalho do Menu Suspenso */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-50 to-[#005F73]/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#004655] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-[#005F73]/20">
                        <User className="w-5 h-5 text-white stroke-[2.2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {currentUser ? currentUser.name : 'Dr. Everaldo Souza'}
                        </p>
                        <p className="text-xs text-[#005F73] font-medium truncate">
                          {currentUser ? currentUser.email : 'everaldozs@gmail.com'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-[#0A9396]/15 text-[#005F73]">
                            {currentUser ? currentUser.role : 'Administrador'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Itens do Menu Suspenso */}
                  <div className="p-1.5 space-y-0.5">
                    {/* 1. Dados da Clínica */}
                    <button
                      onClick={() => {
                        handleNavClick('dados-clinica');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-700 hover:text-[#005F73] hover:bg-[#005F73]/5 transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#005F73]/10 text-slate-600 group-hover:text-[#005F73] flex items-center justify-center shrink-0 transition-colors">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-[#005F73]">
                            Dados da Clínica
                          </p>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                            Ativo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          CNPJ, endereço, CRO-CL e horários
                        </p>
                      </div>
                    </button>

                    {/* 1.1 Ver Site Institucional */}
                    <button
                      onClick={() => {
                        handleNavClick('/');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-700 hover:text-[#005F73] hover:bg-[#005F73]/5 transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 transition-colors">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-[#005F73]">
                            Site Institucional
                          </p>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            odontosouzavr.com.br
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Visualizar página pública da clínica
                        </p>
                      </div>
                    </button>

                    {/* 1.2 Área do Paciente (/minhaconta) */}
                    <button
                      onClick={() => {
                        handleNavClick('minhaconta');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-700 hover:text-[#005F73] hover:bg-[#005F73]/5 transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 group-hover:bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 transition-colors">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-[#005F73]">
                            Área do Paciente
                          </p>
                          <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded font-bold">
                            /minhaconta
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Visualizar portal exclusivo do paciente
                        </p>
                      </div>
                    </button>

                    {/* 2. Ajuda */}
                    <button
                      onClick={() => {
                        setIsHelpModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-700 hover:text-[#005F73] hover:bg-[#005F73]/5 transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#005F73]/10 text-slate-600 group-hover:text-[#005F73] flex items-center justify-center shrink-0 transition-colors">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-[#005F73]">
                            Ajuda
                          </p>
                          <span className="text-[10px] text-[#005F73] bg-[#005F73]/10 px-1.5 py-0.5 rounded font-semibold">
                            Suporte
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Tutoriais, manuais e suporte WhatsApp
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* 3. Sair */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          handleNavClick('login');
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-rose-600 hover:bg-rose-50 transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-rose-700">Sair</p>
                        <p className="text-[11px] text-rose-500">
                          Encerrar sessão com segurança
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* CORPO PRINCIPAL COM CONTEÚDO                                   */}
      {/* ============================================================== */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <main className="relative w-full pt-20 pb-24 px-3 sm:px-6 flex-1">
          {children}
        </main>
      </div>

      {/* ============================================================== */}
      {/* BARRA DE NAVEGAÇÃO INFERIOR MOBILE                             */}
      {/* ============================================================== */}
      <MobileBottomNav
        activePath={activePath}
        onNavigate={handleNavClick}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* ============================================================== */}
      {/* MODAL AJUDA E SUPORTE                                          */}
      {/* ============================================================== */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#005F73] to-[#0A9396] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <HelpCircle className="w-5 h-5 text-[#89f3f6]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Central de Ajuda & Suporte</h3>
                  <p className="text-xs text-cyan-100">Odonto Souza • Atendimento Especializado</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
              {/* Card WhatsApp */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Suporte Imediato via WhatsApp</p>
                    <p className="text-xs text-emerald-700">(11) 98765-4321 • Seg a Sex, 08h às 19h</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/5511987654321?text=Ol%C3%A1%2C+preciso+de+ajuda+no+sistema+Odonto+Souza"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <span>Chamar no WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Contatos adicionais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-[#005F73] font-semibold mb-1">
                    <Mail className="w-4 h-4" />
                    <span>E-mail do Suporte</span>
                  </div>
                  <p className="text-slate-600 font-mono text-[11px]">suporte@odontosouza.com.br</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Resposta em até 2 horas úteis</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-[#005F73] font-semibold mb-1">
                    <Phone className="w-4 h-4" />
                    <span>Plantão Clínico</span>
                  </div>
                  <p className="text-slate-600 font-mono text-[11px]">0800 123 4567 (Gratuito)</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Emergências de sistema 24/7</p>
                </div>
              </div>

              {/* Guias Rápidos */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Tópicos e Tutoriais Rápidos
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    {
                      titulo: 'Como alterar Dados da Clínica e CNPJ',
                      desc: 'Passe o mouse no ícone do usuário e selecione "Dados da Clínica".',
                      action: () => {
                        setIsHelpModalOpen(false);
                        handleNavClick('dados-clinica');
                      },
                    },
                    {
                      titulo: 'Gerenciamento de Usuários e Permissões',
                      desc: 'Acesse o menu Usuários abaixo de Relatórios para gerenciar dentistas, secretárias e acessos.',
                      action: () => {
                        setIsHelpModalOpen(false);
                        handleNavClick('usuarios');
                      },
                    },
                    {
                      titulo: 'Automação de Mensagens no WhatsApp',
                      desc: 'Configure templates oficiais e disparos 2h antes da consulta.',
                      action: () => {
                        setIsHelpModalOpen(false);
                        handleNavClick('template-mensagens');
                      },
                    },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-[#005F73]/5 border border-slate-200 hover:border-[#005F73]/30 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 group-hover:text-[#005F73]">
                          {item.titulo}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#005F73] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Rodapé institucional */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Versão do Sistema: v2.4.0 (Build 2026.10-LTS)</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sistemas Operacionais
                </span>
              </div>
            </div>

            {/* Rodapé botão */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Leitura de Notificação da Clínica */}
      {notificacaoSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notificacaoSelecionada.tipo === 'novo_cadastro'
                      ? 'bg-emerald-100 text-emerald-700'
                      : notificacaoSelecionada.tipo === 'alteracao_agendamento'
                      ? 'bg-amber-100 text-amber-700'
                      : notificacaoSelecionada.tipo === 'cancelamento_agendamento'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {notificacaoSelecionada.tipo === 'novo_cadastro' && <UserPlus className="w-5 h-5" />}
                  {notificacaoSelecionada.tipo === 'novo_agendamento' && <Calendar className="w-5 h-5" />}
                  {notificacaoSelecionada.tipo === 'alteracao_agendamento' && <Clock className="w-5 h-5" />}
                  {notificacaoSelecionada.tipo === 'cancelamento_agendamento' && (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {notificacaoSelecionada.tipo !== 'novo_cadastro' &&
                    notificacaoSelecionada.tipo !== 'novo_agendamento' &&
                    notificacaoSelecionada.tipo !== 'alteracao_agendamento' &&
                    notificacaoSelecionada.tipo !== 'cancelamento_agendamento' && (
                      <Bell className="w-5 h-5" />
                    )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {notificacaoSelecionada.titulo}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {formatRelativeTime(notificacaoSelecionada.dataHora)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Recebida em{' '}
                    {notificacaoSelecionada.dataHora
                      ? new Date(notificacaoSelecionada.dataHora).toLocaleString('pt-BR')
                      : 'recente'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fecharModalLeitura}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensagem Principal */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
              {notificacaoSelecionada.mensagem}
            </div>

            {/* Detalhes do Evento */}
            {notificacaoSelecionada.detalhes && (
              <div className="bg-white rounded-xl border border-slate-100 p-3.5 space-y-2 text-xs">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Dados do Evento
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {notificacaoSelecionada.detalhes.pacienteNome && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Paciente:</span>
                      <strong className="text-slate-800">
                        {notificacaoSelecionada.detalhes.pacienteNome}
                      </strong>
                    </div>
                  )}

                  {notificacaoSelecionada.detalhes.pacienteTelefone && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Contato WhatsApp:</span>
                      <span className="text-slate-700 font-medium">
                        {notificacaoSelecionada.detalhes.pacienteTelefone}
                      </span>
                    </div>
                  )}

                  {notificacaoSelecionada.detalhes.dataConsulta && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Data / Horário:</span>
                      <span className="text-slate-800 font-semibold">
                        {notificacaoSelecionada.detalhes.dataConsulta}
                        {notificacaoSelecionada.detalhes.horarioConsulta &&
                          !notificacaoSelecionada.detalhes.dataConsulta.includes(notificacaoSelecionada.detalhes.horarioConsulta)
                            ? ` às ${notificacaoSelecionada.detalhes.horarioConsulta}`
                            : ''}
                      </span>
                    </div>
                  )}

                  {notificacaoSelecionada.detalhes.procedimento && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Procedimento:</span>
                      <span className="text-teal-700 font-semibold">
                        {notificacaoSelecionada.detalhes.procedimento}
                      </span>
                    </div>
                  )}

                  {notificacaoSelecionada.detalhes.dentista && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Profissional:</span>
                      <span className="text-slate-700">
                        {notificacaoSelecionada.detalhes.dentista}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block text-[10px]">Canal de Origem:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {notificacaoSelecionada.detalhes.origem === 'portal_paciente'
                        ? 'Portal do Paciente'
                        : 'Recepção da Clínica'}
                    </span>
                  </div>
                </div>

                {notificacaoSelecionada.detalhes.observacoes && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <span className="text-slate-400 block text-[10px]">Observações:</span>
                    <p className="text-slate-600 italic">
                      {notificacaoSelecionada.detalhes.observacoes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  excluirNotificacao(notificacaoSelecionada.id);
                  fecharModalLeitura();
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Notificação
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fecharModalLeitura}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                {notificacaoSelecionada.linkRota && (
                  <button
                    type="button"
                    onClick={() => {
                      const rota = notificacaoSelecionada.linkRota!;
                      fecharModalLeitura();
                      setShowNotifications(false);
                      handleNavClick(rota);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#005F73] hover:bg-[#0A9396] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Ir para {notificacaoSelecionada.linkRota === 'agenda' ? 'Agenda' : 'Pacientes'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
