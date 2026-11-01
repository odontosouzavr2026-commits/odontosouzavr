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
import { PacienteItem } from './types/pacientes';
import { scrollToTop } from './utils/scrollUtils';

interface AuthUser {
  name: string;
  email: string;
  role: string;
}

const getInitialPath = (): string => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname === '/minhaconta' || pathname.startsWith('/minhaconta')) {
      return 'minhaconta';
    }
  }
  return 'dashboard';
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
  const [activePath, setActivePath] = useState<string>(getInitialPath);
  const [selectedPatient, setSelectedPatient] = useState<PacienteItem | null>(null);

  useEffect(() => {
    scrollToTop();
  }, [activePath]);

  // Sincroniza com histórico do navegador para suportar /minhaconta diretamente
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname === '/minhaconta' || pathname.startsWith('/minhaconta')) {
        setActivePath('minhaconta');
      } else if (activePath === 'minhaconta') {
        setActivePath('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activePath]);

  // ============================================================================
  // RBAC GUARD (ROLE-BASED ACCESS CONTROL)
  // Perfil 'paciente' é estritamente restrito à Área do Paciente (/minhaconta).
  // Qualquer rota administrativa é interceptada e bloqueada.
  // ============================================================================
  const isPacienteRole = currentUser?.role?.toLowerCase() === 'paciente';

  const handleNavigate = (path: string) => {
    // Bloqueia tentativas de navegação para áreas administrativas se for paciente
    if (isPacienteRole && path !== 'minhaconta') {
      console.warn('[RBAC Security Guard] Acesso negado: Perfil paciente restrito a /minhaconta');
      return;
    }

    if (path === 'minhaconta') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/minhaconta') {
        window.history.pushState({}, '', '/minhaconta');
      }
    } else {
      if (typeof window !== 'undefined' && window.location.pathname === '/minhaconta') {
        window.history.pushState({}, '', '/');
      }
    }
    setActivePath(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('odonto_user');
    sessionStorage.removeItem('odonto_user');
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    setActivePath('login');
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role && user.role.toLowerCase() === 'paciente') {
      handleNavigate('minhaconta');
    } else {
      setActivePath('dashboard');
    }
  };

  // Se a rota for /minhaconta ou se o perfil for 'paciente', renderiza a Área do Paciente de forma isolada
  if (activePath === 'minhaconta' || (currentUser && isPacienteRole)) {
    return (
      <MinhaContaView
        currentUser={currentUser}
        onNavigateToAdmin={isPacienteRole ? undefined : () => handleNavigate('dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigateToPaciente={() => handleNavigate('minhaconta')}
      />
    );
  }

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
          onNavigate={(path) => setActivePath(path)}
        />
      )}
      {activePath === 'agenda' && (
        <AgendaView
          onNavigateToAtendimento={(p) => {
            if (p) setSelectedPatient(p);
            setActivePath('atendimento');
          }}
          onNavigateToProcedimentos={() => setActivePath('procedimentos')}
        />
      )}
      {activePath === 'atendimento' && (
        <AtendimentoView
          selectedPatient={selectedPatient}
          onBackToDashboard={() => setActivePath('dashboard')}
          onViewSchedule={() => setActivePath('agenda')}
          onNavigateToPacientes={() => setActivePath('pacientes')}
        />
      )}
      {activePath === 'procedimentos' && (
        <ProcedimentosView />
      )}
      {activePath === 'pacientes' && (
        <PacientesView
          onNavigateToAtendimento={(p) => {
            if (p) setSelectedPatient(p);
            setActivePath('atendimento');
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
          onNavigateToTemplates={() => setActivePath('template-mensagens')}
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
              onClick={() => setActivePath('dashboard')}
              className="px-4 py-2 bg-[#005F73] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#004655] transition-colors cursor-pointer"
            >
              Visão Geral (Dashboard)
            </button>
            <button
              onClick={() => setActivePath('agenda')}
              className="px-4 py-2 bg-[#00696c] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#005F73] transition-colors cursor-pointer"
            >
              Agenda Clínica
            </button>
            <button
              onClick={() => setActivePath('atendimento')}
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
