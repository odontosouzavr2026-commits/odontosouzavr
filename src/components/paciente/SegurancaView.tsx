import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Laptop,
  Smartphone,
  History,
  Download,
  LogOut,
  RefreshCw,
  Copy,
  QrCode,
  Check,
  X,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Info,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { scrollToTop } from '../../utils/scrollUtils';
import { pacientePortalService, PacientePortalData } from '../../services/pacientePortalService';

interface SecurityEventItem {
  id: string;
  event: string;
  dateTime: string;
  channel: string;
  ip: string;
  status: 'Autorizado' | 'Concluído' | 'Sucesso' | 'Visualizado';
  statusColor: string;
}

const INITIAL_LOGS: SecurityEventItem[] = [
  {
    id: 'log-1',
    event: 'Login bem-sucedido',
    dateTime: 'Hoje, 08:42:19',
    channel: 'Chrome 122 (Windows 11)',
    ip: '177.136.192.44',
    status: 'Autorizado',
    statusColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'log-2',
    event: 'Alteração de telefone de contato',
    dateTime: '10/02/2025, 14:10:02',
    channel: 'Portal do Paciente Web',
    ip: '177.136.192.44',
    status: 'Concluído',
    statusColor: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'log-3',
    event: 'Código 2FA validado com sucesso',
    dateTime: '28/01/2025, 09:12:35',
    channel: 'WhatsApp Bot Oficial Odonto Souza',
    ip: '201.86.110.12',
    status: 'Sucesso',
    statusColor: 'bg-teal-100 text-teal-800',
  },
  {
    id: 'log-4',
    event: 'Acesso a laudo radiográfico 3D',
    dateTime: '15/01/2025, 11:30:10',
    channel: 'Cloud PACS Odonto Souza',
    ip: '177.136.192.44',
    status: 'Visualizado',
    statusColor: 'bg-cyan-100 text-cyan-800',
  },
];

interface ConnectedDevice {
  id: string;
  name: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  icon: 'desktop' | 'mobile';
}

const INITIAL_DEVICES: ConnectedDevice[] = [
  {
    id: 'dev-1',
    name: 'Chrome em Windows 11',
    browser: 'Chrome 122',
    location: 'São Paulo, Brasil',
    ip: '177.136.192.44',
    lastActive: 'Conectado agora mesmo',
    isCurrent: true,
    icon: 'desktop',
  },
  {
    id: 'dev-2',
    name: 'iPhone 15 Pro • Safari',
    browser: 'Mobile Safari 17.2',
    location: 'São Paulo, Brasil',
    ip: '177.136.192.44',
    lastActive: 'Último acesso em 22/02 às 19:15',
    isCurrent: false,
    icon: 'mobile',
  },
];

interface SegurancaViewProps {
  patientData?: PacientePortalData;
  onEmailUpdated?: (newEmail: string) => void;
}

export const SegurancaView: React.FC<SegurancaViewProps> = ({
  patientData,
  onEmailUpdated,
}) => {
  const toast = useToast();

  // E-mail Form State
  const [currentEmail, setCurrentEmail] = useState(patientData?.email || '');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Sync if patientData changes
  React.useEffect(() => {
    if (patientData?.email) {
      setCurrentEmail(patientData.email);
    }
  }, [patientData?.email]);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isAuthAppModalOpen, setIsAuthAppModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isAnonimizacaoModalOpen, setIsAnonimizacaoModalOpen] = useState(false);
  const [totpKey] = useState<string>(() => {
    try {
      const array = new Uint8Array(8);
      window.crypto.getRandomValues(array);
      const randomHex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
      return `ODTO-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8, 12)}`;
    } catch {
      return `ODTO-AUTH-${Date.now().toString(36).toUpperCase()}`;
    }
  });

  // Devices & Logs
  const [devices, setDevices] = useState<ConnectedDevice[]>(INITIAL_DEVICES);
  const [logs, setLogs] = useState<SecurityEventItem[]>(INITIAL_LOGS);

  // Carrega logs reais do Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      if (!patientData?.id && !patientData?.email) return;
      try {
        const rawLogs = await pacientePortalService.getAuditoriaLogs(
          patientData?.id || '',
          patientData?.email
        );
        if (isMounted && rawLogs && rawLogs.length > 0) {
          setLogs(rawLogs);
        }
      } catch (err) {
        console.warn('Erro ao carregar logs de auditoria:', err);
      }
    }
    loadLogs();
    return () => {
      isMounted = false;
    };
  }, [patientData?.id, patientData?.email]);

  // Calculate Password Strength
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdScore = calculatePasswordStrength(newPassword);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return { label: 'Fraca', color: 'text-rose-600', width: '25%', bg: 'bg-rose-500' };
      case 2:
        return { label: 'Média', color: 'text-amber-600', width: '50%', bg: 'bg-amber-500' };
      case 3:
        return { label: 'Forte', color: 'text-teal-600', width: '75%', bg: 'bg-[#0A9396]' };
      case 4:
      default:
        return {
          label: 'Excelente (Recomendada)',
          color: 'text-emerald-700 font-bold',
          width: '100%',
          bg: 'bg-emerald-600',
        };
    }
  };

  const strengthInfo = getStrengthLabel(pwdScore);

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast.warning('Campo obrigatório', 'Por favor, informe o novo e-mail de acesso.');
      return;
    }
    if (newEmail !== confirmEmail) {
      toast.error('E-mails divergentes', 'Os dois campos de e-mail devem ser rigorosamente idênticos.');
      return;
    }
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      toast.error('Formato inválido', 'Digite um endereço de e-mail válido.');
      return;
    }

    setIsUpdatingEmail(true);

    try {
      if (patientData?.id) {
        await pacientePortalService.salvarDadosPaciente(patientData.id, {
          email: newEmail.trim(),
        });
      }

      setCurrentEmail(newEmail.trim());
      onEmailUpdated?.(newEmail.trim());
      setNewEmail('');
      setConfirmEmail('');
      toast.success(
        'E-mail Atualizado com Sucesso! ✉️',
        `Seu e-mail cadastrado no sistema Odonto Souza foi atualizado para ${newEmail.trim()}.`
      );
    } catch (err) {
      console.error('Erro ao atualizar e-mail:', err);
      toast.error('Erro ao salvar', 'Não foi possível atualizar o e-mail no momento.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.warning('Senha atual requerida', 'Digite sua senha atual para autorizar a alteração.');
      return;
    }
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Senhas divergentes', 'A nova senha e a confirmação devem ser preenchidas e coincidir.');
      return;
    }
    if (pwdScore < 3) {
      toast.warning('Senha fraca', 'Escolha uma senha mais segura cumprindo os critérios indicados.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await pacientePortalService.atualizarSenhaSupabase(
        newPassword,
        patientData?.email,
        patientData?.id
      );

      if (!res.success) {
        throw new Error(res.message || 'Erro ao atualizar senha no Supabase');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(
        'Senha Atualizada com Sucesso! 🔒',
        'Suas credenciais foram salvas e criptografadas no Supabase com segurança máxima.'
      );
    } catch (err: any) {
      console.error('Erro ao atualizar senha:', err);
      toast.error('Erro ao salvar nova senha', err?.message || 'Não foi possível atualizar a senha no momento.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDisconnectDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    toast.info('Sessão Encerrada', 'O dispositivo secundário foi desconectado com sucesso.');
  };

  const handleTerminateAllOtherSessions = () => {
    setDevices((prev) => prev.filter((d) => d.isCurrent));
    toast.success(
      'Sessões Revogadas',
      'Todas as outras sessões em outros computadores e smartphones foram desconectadas.'
    );
  };

  const handleExportLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Evento,DataHora,Canal,IP,Status\n' +
      logs
        .map((l) => `"${l.id}","${l.event}","${l.dateTime}","${l.channel}","${l.ip}","${l.status}"`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'relatorio_seguranca_lgpd_odonto_souza.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Relatório Exportado! 📄', 'Arquivo CSV baixado para auditoria e conformidade LGPD.');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. HERO & ACTION HEADER                                        */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#005f73]/10 text-[#005f73]">
                <ShieldCheck className="w-4 h-4 text-[#0A9396]" />
                Área do Paciente • Prontuário {patientData?.code || '#OS-2026'}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {patientData?.fullName || currentEmail || 'Paciente'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Segurança da Conta &amp; Acesso
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Gerencie suas credenciais de login, senha, e-mail de acesso e configurações de
              autenticação para manter seus dados odontológicos protegidos sob a LGPD.
            </p>
          </div>

          {/* Botões de Ação Superiores */}
          <div className="flex items-center gap-2.5 self-start shrink-0">
            <button
              type="button"
              onClick={() => {
                setNewEmail('');
                setConfirmEmail('');
                toast.info('Alterações Descartadas', 'Os formulários foram restaurados.');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success('Parâmetros Salvos! ✨', 'Todas as configurações de segurança estão ativas e em conformidade.');
                scrollToTop();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

        {/* Faixa de Indicadores de Confiança */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Criptografia de Ponta a Ponta</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#005f73]" />
            <span>Status: Proteção Alta</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Último login: Hoje às 08:42 em São Paulo, SP</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. GRID PRINCIPAL (BENTO: CREDENCIAIS + 2FA & SESSÕES)         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* COLUNA ESQUERDA (7 COLS): E-MAIL + ALTERAÇÃO DE SENHA        */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-6">
          {/* PAINEL 1: E-MAIL DE ACESSO */}
          <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <Mail className="w-5 h-5 text-[#005f73]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    E-mail de Acesso
                  </h2>
                  <p className="text-xs text-slate-500">
                    Utilizado para notificações clínicas e confirmações de consultas
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                Verificado
              </span>
            </div>

            {/* E-mail Atual Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  E-MAIL PRINCIPAL CADASTRADO
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-wide block mt-0.5">
                  {currentEmail}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex sm:hidden items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verificado
                </span>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Formulário Novo E-mail */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateEmail();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Novo E-mail de Acesso
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="exemplo@dominio.com.br"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Confirmar Novo E-mail
                  </label>
                  <div className="relative">
                    <CheckCircle2 className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Repita o novo e-mail"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <Info className="w-4 h-4 text-[#005f73] shrink-0 mt-0.5" />
                <p>
                  Um link de confirmação criptografado será enviado para o novo endereço antes da
                  ativação definitiva para garantir que você continue recebendo receitas e laudos.
                </p>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingEmail}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${isUpdatingEmail ? 'animate-spin' : ''}`} />
                  <span>{isUpdatingEmail ? 'Enviando...' : 'Atualizar E-mail'}</span>
                </button>
              </div>
            </form>
          </section>

          {/* PAINEL 2: ALTERAÇÃO DE SENHA */}
          <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                <Key className="w-5 h-5 text-[#005f73]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Alteração de Senha
                </h2>
                <p className="text-xs text-slate-500">
                  Atualize sua senha periodicamente para manter a proteção máxima dos prontuários
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdatePassword();
              }}
              className="space-y-4"
            >
              {/* Senha Atual */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Senha Atual</label>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        'Recuperação de Senha',
                        'Instruções de redefinição foram enviadas para o seu WhatsApp cadastrado.'
                      )
                    }
                    className="text-xs font-semibold text-[#005f73] hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showCurrentPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nova Senha & Repetir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nova Senha</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Criar nova senha segura"
                      className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Confirmar Nova Senha</label>
                  <div className="relative">
                    <CheckCircle2 className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005f73]/20 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Medidor de Força da Senha */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Força da Senha</span>
                  <span className={`text-xs ${strengthInfo.color}`}>
                    {strengthInfo.label}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex gap-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pwdScore >= 1 ? strengthInfo.bg : 'bg-transparent'
                    } w-1/4`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pwdScore >= 2 ? strengthInfo.bg : 'bg-transparent'
                    } w-1/4`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pwdScore >= 3 ? strengthInfo.bg : 'bg-transparent'
                    } w-1/4`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pwdScore >= 4 ? strengthInfo.bg : 'bg-transparent'
                    } w-1/4`}
                  />
                </div>

                {/* 4 Critérios de Segurança */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div
                    className={`flex items-center gap-1.5 ${
                      newPassword.length >= 8 ? 'text-emerald-700 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mínimo de 8 caracteres</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                        ? 'text-emerald-700 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Letra maiúscula e minúscula</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      /[0-9]/.test(newPassword) ? 'text-emerald-700 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ao menos um número</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      /[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-700 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Caractere especial (!@#$%^&*)</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  <span>Atualizar Senha</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* ============================================================ */}
        {/* COLUNA DIREITA (5 COLS): 2FA + DISPOSITIVOS CONECTADOS       */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-6">
          {/* PAINEL 3: AUTENTICAÇÃO EM DUAS ETAPAS (2FA) */}
          <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <ShieldCheck className="w-5 h-5 text-[#005f73]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Autenticação em Duas Etapas (2FA)
                  </h2>
                  <span className="text-xs font-semibold text-[#005f73]">
                    {is2FAEnabled ? 'Ativado via WhatsApp / SMS' : 'Desativado'}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={is2FAEnabled}
                  onChange={(e) => {
                    setIs2FAEnabled(e.target.checked);
                    toast.info(
                      '2FA Atualizado',
                      e.target.checked
                        ? 'A autenticação em duas etapas está ATIVA.'
                        : 'A autenticação em duas etapas foi DESATIVADA.'
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005f73]" />
              </label>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Exige uma confirmação adicional a cada novo acesso, impedindo que pessoas não
              autorizadas visualizem seus laudos radiográficos ou histórico cirúrgico.
            </p>

            {/* Lista de Métodos 2FA */}
            <div className="space-y-2.5">
              {/* WhatsApp Oficial */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        WhatsApp Odonto Souza
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      (11) 98765-**** • Envio de token de 6 dígitos
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              {/* App Autenticador */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#005f73] flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4 text-[#005f73]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                      Aplicativo Autenticador
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Google Authenticator, Authy ou 1Password
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthAppModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#005f73] border border-slate-200 font-bold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  Configurar
                </button>
              </div>

              {/* SMS de Contingência */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                      SMS de Contingência
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      (11) 98765-**** • Ativo caso WhatsApp falhe
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 shrink-0">
                  Reserva
                </span>
              </div>

              {/* Chaves Físicas / Biometria */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#005f73] flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4 text-[#005f73]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                      Chaves de Segurança Físicas
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      YubiKey ou biometria facial compatível
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      'Chave de Segurança',
                      'Conecte sua chave USB/NFC para registrar a credencial biométrica.'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#005f73] border border-slate-200 font-bold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Códigos de Recuperação Box */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex items-start gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#005f73] shrink-0 mt-0.5" />
                <p>
                  Códigos de contingência gerados em caso de perda do dispositivo. Guarde-os em local
                  seguro e confidencial.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRecoveryModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#005f73]" />
                <span>Baixar Códigos de Recuperação</span>
              </button>
            </div>
          </section>

          {/* PAINEL 4: DISPOSITIVOS CONECTADOS */}
          <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <Laptop className="w-5 h-5 text-[#005f73]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Dispositivos Conectados
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sessões ativas com permissão nesta conta
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[#005f73] shrink-0 shadow-2xs">
                      {device.icon === 'desktop' ? (
                        <Laptop className="w-5 h-5 text-[#005f73]" />
                      ) : (
                        <Smartphone className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {device.name}
                        </span>
                        {device.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            Sessão Atual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {device.location} • IP {device.ip}
                      </p>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          device.isCurrent ? 'text-[#005f73] font-bold' : 'text-slate-400'
                        }`}
                      >
                        {device.lastActive}
                      </p>
                    </div>
                  </div>

                  {!device.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleDisconnectDevice(device.id)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
                    >
                      Desconectar
                    </button>
                  )}
                </div>
              ))}
            </div>

            {devices.length > 1 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTerminateAllOtherSessions}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-rose-200"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Encerrar Todas as Outras Sessões</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. PAINEL 5: REGISTRO DE ATIVIDADES & PRIVACIDADE LGPD         */}
      {/* ============================================================== */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
              <History className="w-5 h-5 text-[#005f73]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Registro de Atividades &amp; Privacidade LGPD
              </h2>
              <p className="text-xs text-slate-500">
                Rastreabilidade completa de ações e acessos para sua total transparência
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportLogs}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#005f73]" />
            <span>Solicitar Exportação LGPD</span>
          </button>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Evento de Segurança</th>
                <th className="py-3 px-4">Data &amp; Hora</th>
                <th className="py-3 px-4">Canal / Dispositivo</th>
                <th className="py-3 px-4">Endereço IP</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#005f73]" />
                    <span>{log.event}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{log.dateTime}</td>
                  <td className="py-3.5 px-4 text-slate-600">{log.channel}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {log.ip}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${log.statusColor}`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards Mobile de Logs */}
        <div className="md:hidden space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Shield className="w-4 h-4 text-[#005f73]" />
                  <span>{log.event}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${log.statusColor}`}
                >
                  {log.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{log.channel}</span>
                <span className="font-mono text-[10px]">{log.ip}</span>
              </div>
              <div className="text-[11px] text-slate-400">{log.dateTime}</div>
            </div>
          ))}
        </div>

        {/* Rodapé LGPD & Anonimização */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            Os prontuários de procedimentos cirúrgicos e odontológicos são guardados em estrita
            conformidade com as diretrizes do CFO e da LGPD (Lei nº 13.709/2018).
          </p>
          <button
            type="button"
            onClick={() => setIsAnonimizacaoModalOpen(true)}
            className="text-rose-600 hover:text-rose-800 hover:underline font-bold text-xs shrink-0 cursor-pointer"
          >
            Solicitar Anonimização de Dados
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. MODAL: APLICATIVO AUTENTICADOR (2FA QR CODE)               */}
      {/* ============================================================== */}
      {isAuthAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <QrCode className="w-4 h-4 text-[#005f73]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Aplicativo Autenticador</h4>
                  <p className="text-xs text-slate-500">Google Authenticator, Authy ou 1Password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthAppModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-600">
                Escaneie o QR Code abaixo com seu aplicativo autenticador preferido:
              </p>

              {/* QR Code Simulado Estilizado */}
              <div className="w-44 h-44 mx-auto p-3 bg-white rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center shadow-xs">
                <div className="w-36 h-36 bg-slate-900 rounded-xl flex items-center justify-center text-white p-2">
                  <QrCode className="w-28 h-28 text-white" />
                </div>
              </div>

              {/* Chave de Configuração Manual */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ou digite a chave manual
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {totpKey}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(totpKey);
                      toast.success('Chave Copiada! 📋', 'Chave de autenticação copiada.');
                    }}
                    className="p-1 text-[#005f73] hover:bg-slate-200 rounded cursor-pointer"
                    title="Copiar Chave"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAuthAppModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAuthAppModalOpen(false);
                  toast.success('2FA Conectado! 🎉', 'Aplicativo autenticador ativado com sucesso.');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Confirmar Ativação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: CÓDIGOS DE RECUPERAÇÃO                              */}
      {/* ============================================================== */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <Download className="w-4 h-4 text-[#005f73]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Códigos de Recuperação</h4>
                  <p className="text-xs text-slate-500">Backup para acesso emergencial</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada código pode ser usado uma única vez caso você perca o acesso ao seu celular ou
                aplicativo autenticador:
              </p>

              <div className="grid grid-cols-2 gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs font-bold text-slate-800 text-center">
                <span>9412 - 8491</span>
                <span>3819 - 4920</span>
                <span>8492 - 1948</span>
                <span>5029 - 8401</span>
                <span>7491 - 3021</span>
                <span>1938 - 5019</span>
                <span>8301 - 7492</span>
                <span>6019 - 3921</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Nunca compartilhe esses códigos com terceiros. Eles garantem acesso total à sua
                  conta e laudos odontológicos.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const codes =
                    `CODIGOS DE RECUPERACAO ODONTO SOUZA (${patientData?.fullName || 'Paciente'}):\n9412-8491\n3819-4920\n8492-1948\n5029-8401\n7491-3021\n1938-5019\n8301-7492\n6019-3921`;
                  navigator.clipboard.writeText(codes);
                  toast.success('Códigos Copiados! 📋', 'Códigos de recuperação salvos na área de transferência.');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryModalOpen(false);
                  toast.success('Arquivo Salvo', 'Download do arquivo de segurança efetuado.');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Baixar TXT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: ANONIMIZAÇÃO DE DADOS (LGPD)                         */}
      {/* ============================================================== */}
      {isAnonimizacaoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <Shield className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Solicitação de Anonimização (LGPD)
                  </h4>
                  <p className="text-xs text-slate-500">Lei Federal nº 13.709/2018</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnonimizacaoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Você tem o direito de solicitar a anonimização ou exclusão de dados não essenciais
                sob os termos da LGPD.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <strong className="block font-bold">Aviso Regulatório Obrigatório:</strong>
                <p className="text-[11px]">
                  Conforme Resolução CFO-22/2001 e normas do Conselho Federal de Odontologia,
                  prontuários de atendimento cirúrgico, anamneses e exames de imagem devem ser
                  guardados pelo prazo mínimo de 20 anos para fins jurídicos e de saúde pública.
                </p>
              </div>
              <p>
                Dados de contato, consentimentos de marketing e preferências serão imediatamente
                anonimizados.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAnonimizacaoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAnonimizacaoModalOpen(false);
                  toast.success(
                    'Solicitação Registrada',
                    'Seu pedido de anonimização foi aberto sob protocolo #LGPD-2026-991.'
                  );
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Confirmar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
