import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Headphones,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ToothIcon } from '../common/ToothIcon';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { pacientesService } from '../../services/pacientesService';

// Configurações de Segurança contra Força Bruta
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_SECONDS = 60; // 60 segundos de bloqueio temporário na interface

interface LoginViewProps {
  onLoginSuccess: (user: { id?: string; email: string; role: string; name: string }) => void;
  onNavigateToPaciente?: () => void;
  onNavigateToInstitucional?: () => void;
  isMobilePreview?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToPaciente,
  onNavigateToInstitucional,
  isMobilePreview = false,
}) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ============================================================================
  // SEGURANÇA: CONTROLE DE TENTATIVAS DE LOGIN E BLOQUEIO (ANTI BRUTE-FORCE)
  // ============================================================================
  // Armazena as tentativas em sessionStorage para evitar bypass por recarregamento
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem('odonto_login_failed_attempts');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    try {
      const saved = sessionStorage.getItem('odonto_login_lockout_until');
      if (saved) {
        const timestamp = parseInt(saved, 10);
        return timestamp > Date.now() ? timestamp : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (lockoutUntil) {
      const diff = Math.ceil((lockoutUntil - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    return 0;
  });

  const isLocked = secondsRemaining > 0;

  // Contador regressivo do bloqueio temporário
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsRemaining(0);
        setLockoutUntil(null);
        setFailedAttempts(0);
        sessionStorage.removeItem('odonto_login_lockout_until');
        sessionStorage.removeItem('odonto_login_failed_attempts');
        setErrorMessage(null);
        toast.info('Acesso Desbloqueado 🔓', 'O período de bloqueio temporário encerrou. Você pode tentar acessar novamente.');
        clearInterval(interval);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Se estiver bloqueado, interrompe a tentativa
    if (isLocked) {
      toast.error(
        'Acesso Bloqueado! 🛡️',
        `Aguarde ${secondsRemaining} segundos para realizar uma nova tentativa.`
      );
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.warning('Atenção', 'Por favor, informe seu e-mail de acesso.');
      return;
    }

    if (!password) {
      toast.warning('Atenção', 'Por favor, digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Tenta autenticação real com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!authError && authData?.user) {
        // Sucesso real no Supabase Auth!
        setFailedAttempts(0);
        setLockoutUntil(null);
        sessionStorage.removeItem('odonto_login_failed_attempts');
        sessionStorage.removeItem('odonto_login_lockout_until');

        // Busca dados cadastrais reais nas tabelas do sistema
        let resolvedName = authData.user.user_metadata?.name || '';
        let resolvedRole = authData.user.user_metadata?.role || '';

        try {
          const { data: uRow } = await supabase
            .from('usuarios')
            .select('nome, perfil_nome, funcao')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (uRow) {
            resolvedName = resolvedName || uRow.nome;
            resolvedRole = resolvedRole || uRow.perfil_nome || uRow.funcao;
          }

          if (!resolvedName) {
            const { data: pRow } = await supabase
              .from('pacientes')
              .select('nome, convenio')
              .eq('email', cleanEmail)
              .maybeSingle();

            if (pRow) {
              resolvedName = pRow.nome;
              resolvedRole = 'paciente';
            }
          }
        } catch (dbErr) {
          console.warn('[LoginView] Erro ao buscar perfil complementar:', dbErr);
        }

        const roleNormalized = (resolvedRole || 'paciente').toLowerCase();
        const finalRole = roleNormalized.includes('admin') ? 'Administrador' : roleNormalized;
        const finalName = resolvedName || 'Usuário';

        setIsLoading(false);
        setAuthSuccess(true);
        toast.success(
          finalRole === 'paciente' ? 'Login do Paciente realizado!' : 'Login realizado com sucesso!',
          `Bem-vindo(a), ${finalName}.`
        );

        const userData = {
          id: authData.user.id,
          email: cleanEmail,
          role: finalRole,
          name: finalName,
        };

        if (rememberMe) {
          localStorage.setItem('odonto_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('odonto_user', JSON.stringify(userData));
        }

        setTimeout(() => {
          onLoginSuccess(userData);
        }, 500);
        return;
      }

      // 3. Autenticação via base segura do sistema (PostgreSQL / Bcrypt) para pacientes e usuários
      const systemAuth = await pacientesService.autenticarUsuario(cleanEmail, password);
      if (systemAuth.success && systemAuth.user) {
        setFailedAttempts(0);
        setLockoutUntil(null);
        sessionStorage.removeItem('odonto_login_failed_attempts');
        sessionStorage.removeItem('odonto_login_lockout_until');

        setIsLoading(false);
        setAuthSuccess(true);
        toast.success(
          systemAuth.user.role === 'paciente' ? 'Login do Paciente realizado!' : 'Login realizado com sucesso!',
          `Bem-vindo(a), ${systemAuth.user.name}.`
        );

        const userData = {
          id: systemAuth.user.id,
          email: cleanEmail,
          role: systemAuth.user.role,
          name: systemAuth.user.name,
        };

        if (rememberMe) {
          localStorage.setItem('odonto_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('odonto_user', JSON.stringify(userData));
        }

        setTimeout(() => {
          onLoginSuccess(userData);
        }, 500);
        return;
      }

      // FALHA DE AUTENTICAÇÃO: Incrementa contador e verifica se atingiu 3 tentativas consecutivas
      if (authError) {
        console.warn('[LoginView] Supabase Auth erro:', authError.message);
      }
      setIsLoading(false);
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      sessionStorage.setItem('odonto_login_failed_attempts', String(nextAttempts));

      const isEmailNotConfirmed = authError?.message?.toLowerCase().includes('email not confirmed');

      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockExpiry = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
        setLockoutUntil(lockExpiry);
        setSecondsRemaining(LOCKOUT_DURATION_SECONDS);
        sessionStorage.setItem('odonto_login_lockout_until', String(lockExpiry));

        const lockMsg = `Acesso bloqueado por excesso de tentativas falhas (3 de 3). Por segurança, o acesso foi temporariamente suspenso por ${LOCKOUT_DURATION_SECONDS} segundos. Tente novamente mais tarde ou solicite redefinição à administração.`;
        setErrorMessage(lockMsg);
        toast.error('Acesso Bloqueado! 🛡️', lockMsg);
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - nextAttempts;
        const warnMsg = isEmailNotConfirmed
          ? 'E-mail cadastrado aguardando confirmação de ativação. Tente fazer login novamente.'
          : `E-mail ou senha incorretos. Tentativa ${nextAttempts} de ${MAX_FAILED_ATTEMPTS}. Resta(m) ${remaining} tentativa(s) antes do bloqueio da conta.`;
        setErrorMessage(warnMsg);
        toast.warning('Falha na autenticação', warnMsg);
      }
    } catch (err: any) {
      setIsLoading(false);
      toast.error('Erro de conexão', err?.message || 'Falha ao autenticar.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 font-sans selection:bg-[#86f0f3] selection:text-[#002021]">
      <div className={`w-full max-w-6xl min-h-[calc(100vh-2rem)] flex flex-col ${isMobilePreview ? '' : 'lg:flex-row'} bg-[#eff4ff] rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80`}>
        
        {/* Left Hero Brand Panel (Desktop: 55%, escondido se isMobilePreview ou telas menores) */}
        <div
          className={`${
            isMobilePreview ? 'hidden' : 'hidden lg:flex'
          } lg:w-[55%] bg-[#005f73] relative flex-col justify-between p-10 lg:p-14 overflow-hidden text-white`}
        >
          {/* Decorative Luminous Blur Gradients conforme DESIGN.md */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00696c] rounded-full filter blur-3xl opacity-35 pointer-events-none" />
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#8bd1e8] rounded-full filter blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-[#86f0f3] rounded-full filter blur-[100px] opacity-15 pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10 flex items-center space-x-3.5">
            <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-xl shadow-sm flex items-center justify-center text-white border border-white/20">
              <ToothIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white block">
                Odonto Souza
              </span>
              <span className="block text-[11px] text-[#91d7ee] tracking-wider uppercase font-semibold">
                Sistema Clínico Integrado
              </span>
            </div>
          </div>

          {/* Center Clinical Value Headline */}
          <div className="relative z-10 my-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[#91d7ee] text-xs font-medium mb-6 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#89f3f6] animate-pulse" />
              Versão Clínica 4.2 Pro
            </div>
            <h1 className="text-3xl lg:text-[40px] lg:leading-[48px] font-bold text-white mb-6 tracking-tight">
              Gestão inteligente para a sua clínica odontológica.
            </h1>
            <p className="text-base lg:text-lg text-[#b2ebff] font-normal leading-relaxed max-w-lg">
              Acesse o seu painel para gerenciar agendas, prontuários interativos e o financeiro de forma integrada.
            </p>

            {/* Feature Pills */}
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md pt-4 border-t border-white/15">
              <div className="flex items-center gap-2 text-xs text-cyan-100">
                <Check className="w-4 h-4 text-[#89f3f6] shrink-0" />
                <span>Odontograma 3D e Prontuário</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-100">
                <Check className="w-4 h-4 text-[#89f3f6] shrink-0" />
                <span>Prevenção de conflito de agenda</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-100">
                <Check className="w-4 h-4 text-[#89f3f6] shrink-0" />
                <span>Geração de PDFs e Receituários</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-100">
                <Check className="w-4 h-4 text-[#89f3f6] shrink-0" />
                <span>Integração WhatsApp & Alertas</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div className="relative z-10 flex flex-wrap items-center justify-between text-[#b2ebff] text-xs gap-4 pt-6 border-t border-white/10">
            <span>© 2026 Odonto Souza. Todos os direitos reservados.</span>
            <div className="flex items-center space-x-5">
              <a
                href="https://wa.me/5511987654321"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Headphones className="w-3.5 h-3.5" />
                Suporte Técnico
              </a>
              <span className="hover:text-white transition-colors cursor-pointer">Termos</span>
              <span className="hover:text-white transition-colors cursor-pointer">Privacidade</span>
            </div>
          </div>
        </div>

        {/* Right Side Authentication Form (Desktop: 45% / Mobile: 100%) */}
        <div className={`w-full ${isMobilePreview ? 'w-full' : 'lg:w-[45%]'} flex items-center justify-center p-6 sm:p-10 lg:p-12 relative bg-white`}>
          <div className="w-full max-w-md flex flex-col justify-center">

            {/* Mobile Header Brand (Visível em mobile ou quando isMobilePreview=true) */}
            <div className={`${isMobilePreview ? 'flex' : 'flex lg:hidden'} flex-col items-center text-center pt-2 pb-6`}>
              <div className="w-14 h-14 rounded-2xl bg-[#005f73] flex items-center justify-center shadow-md mb-3 border border-white/20">
                <ToothIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">Odonto Souza</h1>
              <p className="text-xs text-[#00696c] tracking-widest uppercase mt-0.5 font-semibold">
                Sistema Clínico Integrado
              </p>
            </div>

            {/* Card Header */}
            <div className="mb-6 sm:mb-8">
              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[#eff4ff] text-[#004655] items-center justify-center mb-4 border border-[#dce9ff]">
                <ShieldCheck className="w-6 h-6 text-[#005f73]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0b1c30] mb-2 tracking-tight">
                Bem-vindo de volta
              </h2>
              <p className="text-sm text-[#3f484c] font-normal">
                Insira as suas credenciais para acessar o sistema.
              </p>
            </div>

            {/* Alerta de Bloqueio por 3 Tentativas Consecutivas com Falha */}
            {isLocked ? (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm shadow-xs animate-in fade-in slide-in-from-top-1">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-rose-900 text-sm">
                        Acesso Temporariamente Bloqueado
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                        3/3 Falhas
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      O acesso foi suspenso por excesso de tentativas consecutivas com falha. Por conformidade com a LGPD e segurança da clínica, o botão de login foi desativado.
                    </p>
                    <div className="mt-2 pt-2 border-t border-rose-200/80 flex items-center justify-between text-xs text-rose-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-rose-600" />
                        <span>Desbloqueio em:</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 font-mono text-xs">
                        {secondsRemaining}s restantes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm font-medium">
                  {errorMessage}
                </div>
              </div>
            ) : null}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Field 1: E-mail */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#0b1c30]" htmlFor="email">
                  E-mail Profissional
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-5 h-5 absolute left-3.5 text-[#6f797c] pointer-events-none select-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={isLocked}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className={`w-full text-sm rounded-xl pl-11 pr-4 py-3 shadow-xs transition-all border outline-none ${
                      isLocked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#6f797c] focus:bg-white focus:ring-2 focus:ring-[#00696c] border-transparent focus:border-transparent'
                    }`}
                  />
                </div>
              </div>

              {/* Field 2: Senha */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[#0b1c30]" htmlFor="password">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info('Recuperação de Acesso', 'Para redefinir sua senha, entre em contato com o administrador do sistema com segurança.')}
                    className="text-xs text-[#00696c] font-semibold hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-5 h-5 absolute left-3.5 text-[#6f797c] pointer-events-none select-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLocked}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full text-sm rounded-xl pl-11 pr-11 py-3 shadow-xs transition-all border outline-none ${
                      isLocked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#6f797c] focus:bg-white focus:ring-2 focus:ring-[#00696c] border-transparent focus:border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#6f797c] hover:text-[#0b1c30] p-1 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Device Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    id="rememberDevice"
                    type="checkbox"
                    checked={rememberMe}
                    disabled={isLocked}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#005f73] focus:ring-[#005f73] bg-[#eff4ff] border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-[#3f484c] font-medium">
                    Lembrar neste dispositivo
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || authSuccess || isLocked}
                className={`w-full mt-2 font-semibold text-sm sm:text-base py-3.5 px-5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
                  isLocked
                    ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed opacity-75 shadow-none'
                    : authSuccess
                    ? 'bg-[#226150] text-white hover:bg-[#1a4d3f] cursor-default'
                    : 'bg-[#005f73] hover:bg-[#004655] text-white cursor-pointer active:scale-[0.99]'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Acesso Bloqueado ({secondsRemaining}s)</span>
                  </>
                ) : isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    <span>Autenticando...</span>
                  </>
                ) : authSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#9bd9c4]" />
                    <span>Acesso Autorizado! Redirecionando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Mobile Footer Links */}
            <div className="mt-8 flex flex-col items-center text-center space-y-2">
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <a
                  href="https://wa.me/5511987654321"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#3f484c] hover:text-[#005f73] transition-colors"
                >
                  Suporte Técnico
                </a>
                <span>•</span>
                <span className="text-[#3f484c] hover:text-[#005f73] transition-colors cursor-pointer">
                  Termos & Privacidade
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                © 2026 Odonto Souza. Todos os direitos reservados.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
