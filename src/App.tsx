/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { AtendimentoView } from './components/atendimento/AtendimentoView';
import { AgendaView } from './components/agenda/AgendaView';
import { ProcedimentosView } from './components/procedimentos/ProcedimentosView';
import { PacientesView } from './components/pacientes/PacientesView';
import { FinanceiroView } from './components/financeiro/FinanceiroView';
import { TemplatesView } from './components/templates/TemplatesView';
import { UsuariosView } from './components/usuarios/UsuariosView';
import { RelatoriosView } from './components/relatorios/RelatoriosView';
import {
  ConfiguracaoSubmenuView,
  ConfigSubmenuId,
} from './components/configuracoes/ConfiguracaoSubmenuView';
import { ConexoesWhatsAppView } from './components/configuracoes/ConexoesWhatsAppView';
import { AuditoriaView } from './components/configuracoes/AuditoriaView';
import { LaboratorioView } from './components/laboratorio/LaboratorioView';
import { EstoqueView } from './components/estoque/EstoqueView';
import { PortalPacienteConfigView } from './components/configuracoes/PortalPacienteConfigView';
import { ConveniosView } from './components/convenios/ConveniosView';
import { MinhaContaView } from './components/paciente/MinhaContaView';
import { LoginView } from './components/auth/LoginView';
import { InstitucionalView } from './components/institucional/InstitucionalView';
import { PacienteItem } from './types/pacientes';
import { scrollToTop } from './utils/scrollUtils';
import { automationEngine } from './services/automationEngine';
import { supabase } from './lib/supabase';

interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export type AppRoute = 'institucional' | 'paciente' | 'admin';

interface RouteState {
  currentRoute: AppRoute;
  activePath: string;
}

export const isAppSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname.startsWith('app.') || hostname.includes('app.odontosouzavr');
};

const getInitialRouteState = (): RouteState => {
  if (typeof window !== 'undefined') {
    const isApp = isAppSubdomain();
    const pathname = window.location.pathname;

    // Se estiver acessando via subdomínio app. (ex: app.odontosouzavr.com.br)
    if (isApp) {
      if (pathname === '/minhaconta' || pathname.startsWith('/minhaconta')) {
        return { currentRoute: 'paciente', activePath: 'minhaconta' };
      }
      return { currentRoute: 'admin', activePath: 'dashboard' };
    }

    // Rota administrativa explícita
    if (pathname === '/paineladmin' || pathname.startsWith('/paineladmin')) {
      return { currentRoute: 'admin', activePath: 'dashboard' };
    }
    // Rota /login redireciona para /paineladmin
    if (pathname === '/login') {
      window.history.replaceState({}, '', '/paineladmin');
      return { currentRoute: 'admin', activePath: 'dashboard' };
    }
    // Rota do paciente explícita
    if (pathname === '/minhaconta' || pathname.startsWith('/minhaconta')) {
      return { currentRoute: 'paciente', activePath: 'minhaconta' };
    }
    // Raiz ou qualquer rota pública (localhost:5173 ou odontosouzavr.com.br)
    return { currentRoute: 'institucional', activePath: 'home' };
  }
  return { currentRoute: 'institucional', activePath: 'home' };
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('odonto_user') || sessionStorage.getItem('odonto_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [routeState, setRouteState] = useState<RouteState>(() => getInitialRouteState());
  const currentRoute = routeState.currentRoute;
  const activePath = routeState.activePath;

  const setActivePath = (path: string) => {
    setRouteState((prev) => ({ ...prev, activePath: path }));
  };

  const [selectedPatient, setSelectedPatient] = useState<PacienteItem | null>(null);

  useEffect(() => {
    scrollToTop();
  }, [activePath, currentRoute]);

  // Inicializa o motor de automações do WhatsApp (lembretes de 2h, NPS, etc.)
  useEffect(() => {
    automationEngine.start();
    return () => {
      automationEngine.stop();
    };
  }, []);

  // Sincroniza estado de autenticação real do Supabase com proteção contra adulteração local
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('odonto_user');
        sessionStorage.removeItem('odonto_user');
        localStorage.removeItem('odonto_notificacoes_clinicas_v1');
        setCurrentUser(null);
      } else if (session?.user && (!currentUser || currentUser.email !== session.user.email)) {
        const uRole = session.user.user_metadata?.role || (currentUser?.role || 'Administrador');
        const uName = session.user.user_metadata?.name || (currentUser?.name || 'Usuário');
        const authUser: AuthUser = {
          name: uName,
          email: session.user.email || '',
          role: uRole,
        };
        setCurrentUser(authUser);
        localStorage.setItem('odonto_user', JSON.stringify(authUser));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);

  // Sincroniza com histórico do navegador para suportar /, /minhaconta e /paineladmin
  useEffect(() => {
    const handlePopState = () => {
      const isApp = isAppSubdomain();
      const pathname = window.location.pathname;

      if (isApp) {
        if (pathname === '/minhaconta' || pathname.startsWith('/minhaconta')) {
          setRouteState({
            currentRoute: 'paciente',
            activePath: 'minhaconta',
          });
        } else {
          setRouteState((prev) => ({
            currentRoute: 'admin',
            activePath: prev.activePath === 'home' ? 'dashboard' : prev.activePath,
          }));
        }
        return;
      }

      if (pathname === '/paineladmin' || pathname.startsWith('/paineladmin')) {
        setRouteState((prev) => ({
          currentRoute: 'admin',
          activePath: prev.activePath === 'minhaconta' || prev.activePath === 'home' ? 'dashboard' : prev.activePath,
        }));
      } else if (pathname === '/minhaconta' || pathname.startsWith('/minhaconta')) {
        setRouteState({
          currentRoute: 'paciente',
          activePath: 'minhaconta',
        });
      } else {
        setRouteState({
          currentRoute: 'institucional',
          activePath: 'home',
        });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ============================================================================
  // RBAC GUARD (ROLE-BASED ACCESS CONTROL)
  // Perfil 'paciente' é estritamente restrito à Área do Paciente (/minhaconta).
  // Qualquer tentativa de acessar /paineladmin é interceptada e bloqueada.
  // ============================================================================
  const isPacienteRole = currentUser?.role?.toLowerCase() === 'paciente';

  useEffect(() => {
    if (currentUser && isPacienteRole && currentRoute === 'admin') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/minhaconta') {
        window.history.replaceState({}, '', '/minhaconta');
      }
      setRouteState({
        currentRoute: 'paciente',
        activePath: 'minhaconta',
      });
    }
  }, [currentUser, isPacienteRole, currentRoute]);

  const handleNavigate = (path: string) => {
    // Bloqueia tentativas de navegação para áreas administrativas se for paciente
    if (isPacienteRole && (path === 'paineladmin' || (path !== 'minhaconta' && path !== '/' && path !== 'institucional'))) {
      console.warn('[RBAC Security Guard] Acesso negado: Perfil paciente restrito a /minhaconta');
      return;
    }

    if (path === '/' || path === 'institucional' || path === 'home') {
      if (isAppSubdomain()) {
        if (typeof window !== 'undefined') {
          window.location.href = 'https://odontosouzavr.com.br';
        }
        return;
      }
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      setRouteState({
        currentRoute: 'institucional',
        activePath: 'home',
      });
      return;
    }

    if (path === 'minhaconta') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/minhaconta') {
        window.history.pushState({}, '', '/minhaconta');
      }
      setRouteState({
        currentRoute: 'paciente',
        activePath: 'minhaconta',
      });
      return;
    }

    if (path === 'paineladmin' || path === 'dashboard') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/paineladmin') {
        window.history.pushState({}, '', '/paineladmin');
      }
      setRouteState({
        currentRoute: 'admin',
        activePath: 'dashboard',
      });
      return;
    }

    // Navegações internas do painel administrativo
    if (typeof window !== 'undefined' && window.location.pathname !== '/paineladmin') {
      window.history.pushState({}, '', '/paineladmin');
    }
    setRouteState({
      currentRoute: 'admin',
      activePath: path,
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // silencioso
    }
    localStorage.removeItem('odonto_user');
    sessionStorage.removeItem('odonto_user');
    localStorage.removeItem('odonto_notificacoes_clinicas_v1');
    localStorage.removeItem('odonto_evo_api_key');
    setCurrentUser(null);
    if (isAppSubdomain()) {
      setRouteState({
        currentRoute: 'admin',
        activePath: 'dashboard',
      });
      return;
    }
    if (currentRoute === 'admin') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/paineladmin') {
        window.history.pushState({}, '', '/paineladmin');
      }
      setRouteState({
        currentRoute: 'admin',
        activePath: 'dashboard',
      });
    } else {
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      setRouteState({
        currentRoute: 'institucional',
        activePath: 'home',
      });
    }
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role && user.role.toLowerCase() === 'paciente') {
      handleNavigate('minhaconta');
    } else {
      if (typeof window !== 'undefined' && window.location.pathname !== '/paineladmin') {
        window.history.pushState({}, '', '/paineladmin');
      }
      setRouteState({
        currentRoute: 'admin',
        activePath: 'dashboard',
      });
    }
  };

  // 1. Rota Institucional (Raiz / no localhost:5173 ou odontosouzavr.com.br)
  if (currentRoute === 'institucional') {
    return (
      <InstitucionalView
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onNavigateToPaciente={() => handleNavigate('minhaconta')}
        onNavigateToAdmin={() => handleNavigate('paineladmin')}
      />
    );
  }

  // 2. Rota Área do Paciente (/minhaconta ou usuário logado com perfil paciente)
  if (currentRoute === 'paciente' || (currentUser && isPacienteRole)) {
    return (
      <MinhaContaView
        currentUser={currentUser}
        onNavigateToInstitucional={() => handleNavigate('/')}
        onNavigateToAdmin={isPacienteRole ? undefined : () => handleNavigate('paineladmin')}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Rota Administrativa (/paineladmin)
  // Se não estiver logado, exibe a tela de login do painel administrativo
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigateToPaciente={() => handleNavigate('minhaconta')}
        onNavigateToInstitucional={() => handleNavigate('/')}
      />
    );
  }

    // Se estiver logado como paciente, bloqueia e redireciona para a área do paciente
    if (isPacienteRole) {
      return (
        <MinhaContaView
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      );
    }

    // Usuário autenticado da equipe clínica/administrativa
    const isConfigSubmenu = [
      'dados-clinica',
      'agenda-horarios',
      'modelos-documentos',
      'integracoes-apis',
    ].includes(activePath);

    return (
      <AppLayout
        activePath={activePath}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        {activePath === 'dashboard' && (
          <DashboardView
            onNavigate={(path) => handleNavigate(path)}
          />
        )}
        {activePath === 'agenda' && (
          <AgendaView
            onNavigateToAtendimento={(p) => {
              if (p) setSelectedPatient(p);
              handleNavigate('atendimento');
            }}
            onNavigateToProcedimentos={() => handleNavigate('procedimentos')}
          />
        )}
        {activePath === 'atendimento' && (
          <AtendimentoView
            selectedPatient={selectedPatient}
            onBackToDashboard={() => handleNavigate('dashboard')}
            onViewSchedule={() => handleNavigate('agenda')}
            onNavigateToPacientes={() => handleNavigate('pacientes')}
          />
        )}
        {activePath === 'procedimentos' && (
          <ProcedimentosView />
        )}
        {activePath === 'pacientes' && (
          <PacientesView
            onNavigateToAtendimento={(p) => {
              if (p) setSelectedPatient(p);
              handleNavigate('atendimento');
            }}
          />
        )}
        {activePath === 'convenios' && (
          <ConveniosView />
        )}
        {activePath === 'laboratorio' && (
          <LaboratorioView />
        )}
        {activePath === 'estoque' && (
          <EstoqueView />
        )}
        {activePath === 'financeiro' && (
          <FinanceiroView />
        )}
        {activePath === 'usuarios' && (
          <UsuariosView />
        )}
        {activePath === 'relatorios' && (
          <RelatoriosView onNavigate={handleNavigate} />
        )}
        {(activePath === 'template-mensagens' || activePath === 'templates-whatsapp') && (
          <TemplatesView />
        )}
        {activePath === 'conexoes' && (
          <ConexoesWhatsAppView />
        )}
        {activePath === 'auditoria' && (
          <AuditoriaView />
        )}
        {activePath === 'portal-paciente' && (
          <div className="w-full h-full p-6 bg-slate-50">
            <PortalPacienteConfigView />
          </div>
        )}
        {isConfigSubmenu && (
          <ConfiguracaoSubmenuView
            submenuId={activePath as ConfigSubmenuId}
            onNavigateToTemplates={() => handleNavigate('template-mensagens')}
          />
        )}
        {activePath !== 'dashboard' &&
          activePath !== 'agenda' &&
          activePath !== 'atendimento' &&
          activePath !== 'procedimentos' &&
          activePath !== 'pacientes' &&
          activePath !== 'convenios' &&
          activePath !== 'laboratorio' &&
          activePath !== 'estoque' &&
          activePath !== 'financeiro' &&
          activePath !== 'usuarios' &&
          activePath !== 'relatorios' &&
          activePath !== 'template-mensagens' &&
          activePath !== 'templates-whatsapp' &&
          activePath !== 'conexoes' &&
          activePath !== 'auditoria' &&
          activePath !== 'portal-paciente' &&
          !isConfigSubmenu && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-center shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 capitalize mb-2">
              Módulo: {activePath}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Módulo em desenvolvimento estruturado de acordo com as diretrizes do ODONTO SOUZA.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleNavigate('dashboard')}
                className="px-4 py-2 bg-[#005F73] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#004655] transition-colors cursor-pointer"
              >
                Visão Geral (Dashboard)
              </button>
              <button
                onClick={() => handleNavigate('agenda')}
                className="px-4 py-2 bg-[#00696c] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#005F73] transition-colors cursor-pointer"
              >
                Agenda Clínica
              </button>
              <button
                onClick={() => handleNavigate('atendimento')}
                className="px-4 py-2 bg-[#0A9396] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#00696c] transition-colors cursor-pointer"
              >
                Atendimento Clínico
              </button>
            </div>
          </div>
        )}
      </AppLayout>
    );
}
