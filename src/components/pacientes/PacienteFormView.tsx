import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  UserPlus,
  User,
  UserCheck,
  CreditCard,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Search,
  Stethoscope,
  AlertTriangle,
  X,
  Check,
  Lock,
  ChevronDown,
  ShieldCheck,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PacienteItem, ConvenioTipo } from '../../types/pacientes';
import { ConvenioItem } from '../../types/convenios';
import { conveniosService } from '../../services/conveniosService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../contexts/ToastContext';
import { isValidCPF, formatCPF, cleanDigits } from '../../utils/documentValidation';
import { formatCEP } from '../../services/cepService';
import { useViaCep } from '../../hooks/useViaCep';
import { ValidatedInput } from '../common/ValidatedInput';
import { calculateAge } from '../../utils/dateUtils';
import { scrollToTop } from '../../utils/scrollUtils';
import { emitirNotificacaoClinica } from '../../contexts/NotificationContext';

interface PacienteFormViewProps {
  initialData?: PacienteItem | null;
  onSave: (paciente: Omit<PacienteItem, 'id' | 'code' | 'initials'>) => void;
  onCancel: () => void;
  isMobile?: boolean;
}

export const PacienteFormView: React.FC<PacienteFormViewProps> = ({
  initialData,
  onSave,
  onCancel,
  isMobile = false,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Garante que o formulário abra sempre a partir do topo absoluto
  React.useEffect(() => {
    scrollToTop();
  }, []);

  const [name, setName] = useState(initialData?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [cpf, setCpf] = useState(initialData?.cpf || '');
  const [rg, setRg] = useState(initialData?.rg || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [gender, setGender] = useState<'feminino' | 'masculino' | 'outro'>(
    initialData?.gender || 'feminino'
  );
  const [conveniosList, setConveniosList] = useState<ConvenioItem[]>([]);
  const [isLoadingConvenios, setIsLoadingConvenios] = useState(true);
  const [insurance, setInsurance] = useState<string>(
    initialData?.insuranceLabel || initialData?.insurance || ''
  );
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');
  const [email, setEmail] = useState(initialData?.email || '');

  // Endereço
  const [cep, setCep] = useState(initialData?.address?.cep || '');
  const [logradouro, setLogradouro] = useState(initialData?.address?.logradouro || '');
  const [numero, setNumero] = useState(initialData?.address?.numero || '');
  const [complemento, setComplemento] = useState(initialData?.address?.complemento || '');
  const [bairro, setBairro] = useState(initialData?.address?.bairro || '');
  const [cidade, setCidade] = useState(initialData?.address?.cidade || '');
  const [estado, setEstado] = useState(initialData?.address?.estado || '');

  // Carrega convênios cadastrados no banco de dados Supabase
  useEffect(() => {
    let isMounted = true;
    async function carregarConvenios() {
      setIsLoadingConvenios(true);
      try {
        const data = await conveniosService.getConvenios();
        if (!isMounted) return;
        const ativos = data.filter((c) => c.status === 'Ativo');
        const disponiveis = ativos.length > 0 ? ativos : data;
        setConveniosList(disponiveis);

        if (!initialData?.insuranceLabel && !initialData?.insurance) {
          if (disponiveis.length > 0) {
            setInsurance(disponiveis[0].nome);
          }
        } else {
          setInsurance(initialData.insuranceLabel || initialData.insurance || (disponiveis[0]?.nome || ''));
        }
      } catch (err) {
        console.error('[PacienteFormView] Erro ao carregar convênios:', err);
      } finally {
        if (isMounted) setIsLoadingConvenios(false);
      }
    }

    carregarConvenios();
    return () => {
      isMounted = false;
    };
  }, [initialData]);

  // Estados de Validação Estrita (Padrão Odonto Souza)
  const [cpfError, setCpfError] = useState(false);
  const [cpfErrorMessage, setCpfErrorMessage] = useState('');
  const {
    loading: cepLoading,
    error: cepError,
    errorMessage: cepErrorMessage,
    lookupCep,
    clearCepError,
  } = useViaCep();

  // Clínico
  const [allergies, setAllergies] = useState(initialData?.allergies || '');
  const [clinicalNotes, setClinicalNotes] = useState(initialData?.clinicalNotes || '');

  // ============================================================================
  // SECÇÃO 5: CREDENCIAIS DE ACESSO À ÁREA DO PACIENTE (/minhaconta)
  // ============================================================================
  const [portalEmail, setPortalEmail] = useState(initialData?.portalEmail || initialData?.email || '');
  // Na edição, a senha inicia vazia para não forçar a alteração e manter a senha atual inalterada
  const [portalPassword, setPortalPassword] = useState('');
  const [portalConfirmPassword, setPortalConfirmPassword] = useState('');
  const [showPortalPassword, setShowPortalPassword] = useState(false);
  const [showPortalConfirmPassword, setShowPortalConfirmPassword] = useState(false);

  // Sincroniza o e-mail do portal com o e-mail geral automaticamente se estiver em branco
  useEffect(() => {
    if (!initialData && email && !portalEmail) {
      setPortalEmail(email);
    }
  }, [email, initialData, portalEmail]);

  // Checklist de Força da Senha em Tempo Real (Critérios Obrigatórios)
  const minLengthValid = portalPassword.length >= 8;
  const uppercaseValid = /[A-Z]/.test(portalPassword);
  const specialCharValid = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/~`]/.test(portalPassword);
  const passwordsMatch = portalPassword.length > 0 && portalPassword === portalConfirmPassword;

  const validCount = [minLengthValid, uppercaseValid, specialCharValid, passwordsMatch].filter(Boolean).length;

  const getStrengthInfo = () => {
    if (!portalPassword) return { label: 'Não informada', color: 'text-slate-400', width: '0%', barBg: 'bg-slate-200' };
    switch (validCount) {
      case 1:
        return { label: 'Fraca', color: 'text-rose-600', width: '25%', barBg: 'bg-rose-500' };
      case 2:
        return { label: 'Média', color: 'text-amber-600', width: '50%', barBg: 'bg-amber-500' };
      case 3:
        return { label: 'Forte', color: 'text-teal-600', width: '75%', barBg: 'bg-[#0A9396]' };
      case 4:
      default:
        return { label: 'Excelente (Recomendada)', color: 'text-emerald-700 font-bold', width: '100%', barBg: 'bg-emerald-600' };
    }
  };

  const strengthInfo = getStrengthInfo();

  // Validação e formatação de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);

    // Se estava em erro e o usuário digitou 11 dígitos válidos, limpa o erro
    if (cpfError && cleanDigits(formatted).length === 11) {
      if (isValidCPF(formatted)) {
        setCpfError(false);
        setCpfErrorMessage('');
      }
    }
  };

  const handleCpfBlur = () => {
    // Se o campo estiver vazio ou for inválido
    if (!cpf.trim()) {
      setCpfError(true);
      setCpfErrorMessage('CPF inválido. Por favor, verifique os números.');
      return;
    }

    const valid = isValidCPF(cpf);
    if (!valid) {
      setCpfError(true);
      setCpfErrorMessage('CPF inválido. Por favor, verifique os números.');
    } else {
      setCpfError(false);
      setCpfErrorMessage('');
    }
  };

  // Integração ViaCEP com Autopreenchimento e Tratamento de Erro
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setCep(formatted);
    const clean = cleanDigits(formatted);

    // Quando digitar 8 números no CEP, dispara busca automática na API ViaCEP
    if (clean.length === 8) {
      const address = await lookupCep(clean);
      if (address) {
        setLogradouro(address.logradouro || '');
        setBairro(address.bairro || '');
        setCidade(address.localidade || '');
        setEstado(address.uf || '');
      }
    } else if (clean.length < 8 && cepError) {
      clearCepError();
    }
  };

  const handleCepBlur = async () => {
    const clean = cleanDigits(cep);
    if (clean.length > 0 && clean.length < 8) {
      await lookupCep(clean); // Dispara erro visual com "CEP não encontrado ou inválido"
    } else if (clean.length === 8 && !logradouro) {
      const address = await lookupCep(clean);
      if (address) {
        setLogradouro(address.logradouro || '');
        setBairro(address.bairro || '');
        setCidade(address.localidade || '');
        setEstado(address.uf || '');
      }
    }
  };

  const formatPhone = (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.slice(0, 11);
    if (raw.length > 10) {
      return raw.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (raw.length > 6) {
      return raw.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (raw.length > 2) {
      return raw.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    return raw;
  };

  const formatCep = (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.length > 8) raw = raw.slice(0, 8);
    if (raw.length > 5) {
      return raw.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
    }
    return raw;
  };

  const getInsuranceLabel = (ins: string): string => {
    return ins || 'Convênio da Casa';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Formato inválido', 'Por favor, selecione um arquivo de imagem (PNG, JPG, JPEG ou WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Arquivo grande', 'A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      toast.success('Foto carregada', 'Foto de perfil do paciente anexada com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (avatarUrl && avatarUrl.includes('contabostorage.com')) {
      storageService.deleteArquivo(avatarUrl).catch(() => {});
    }
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Foto removida', 'O paciente utilizará o avatar padrão com iniciais.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Campo obrigatório', 'O nome completo do paciente é obrigatório.');
      return;
    }

    // Validação estrita do CPF
    if (!isValidCPF(cpf)) {
      setCpfError(true);
      setCpfErrorMessage('CPF inválido. Por favor, verifique os números.');
      toast.warning('Documento inválido', 'Por favor, corrija o CPF do paciente antes de salvar.');
      return;
    }

    // Se houver erro de CEP pendente
    if (cep && cleanDigits(cep).length > 0 && cepError) {
      toast.warning('Endereço pendente', 'Por favor, corrija ou verifique o CEP informado.');
      return;
    }

    // Validação de Credenciais da Área do Paciente:
    // Na edição, a alteração da senha NÃO é obrigatória.
    // Se o usuário não digitar nova senha, a senha existente é preservada sem alterações.
    const isNewPasswordProvided = portalPassword.trim().length > 0 || portalConfirmPassword.trim().length > 0;

    if (isNewPasswordProvided) {
      if (!minLengthValid || !uppercaseValid || !specialCharValid || !passwordsMatch) {
        toast.warning(
          'Requisitos de Senha Incompletos',
          'Para alterar a senha de acesso, cumpra todos os 4 requisitos do checklist antes de salvar.'
        );
        return;
      }

      if (portalEmail && (!portalEmail.includes('@') || !portalEmail.includes('.'))) {
        toast.warning(
          'E-mail de Acesso Inválido',
          'Por favor, informe um endereço de e-mail de acesso válido para a Área do Paciente.'
        );
        return;
      }
    }

    // Upload seguro da foto para o Contabo S3 se for imagem local/base64
    let finalAvatarUrl = avatarUrl.trim();
    if (finalAvatarUrl.startsWith('data:image/')) {
      setIsUploadingPhoto(true);
      try {
        const uploadRes = await storageService.uploadArquivo({
          file: finalAvatarUrl,
          pacienteId: initialData?.id || `pac-${Date.now()}`,
          categoria: 'perfil',
          filename: `avatar_${Date.now()}.png`,
        });
        if (uploadRes.success && uploadRes.url) {
          finalAvatarUrl = uploadRes.url;
          // Se o paciente já tinha uma foto antiga no S3, remove a anterior
          if (initialData?.avatarUrl && initialData.avatarUrl !== finalAvatarUrl && initialData.avatarUrl.includes('contabostorage.com')) {
            storageService.deleteArquivo(initialData.avatarUrl).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('[PacienteFormView] Aviso ao salvar foto no S3:', err);
      } finally {
        setIsUploadingPhoto(false);
      }
    }

    const age = calculateAge(birthDate);

    onSave({
      name,
      avatarUrl: finalAvatarUrl || undefined,
      cpf: cpf || '000.000.000-00',
      rg: rg.trim() || undefined,
      birthDate,
      age,
      gender,
      insurance,
      insuranceLabel: insurance,
      whatsapp: whatsapp,
      email: email,
      portalEmail: portalEmail.trim() || email.trim(),
      // Envia a nova senha apenas se foi digitada; se não foi mexida, envia undefined para preservar a existente
      portalPassword: isNewPasswordProvided ? portalPassword.trim() : undefined,
      address: {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      },
      allergies: allergies.trim() || undefined,
      clinicalNotes: clinicalNotes.trim() || undefined,
      lastConsultation: initialData?.lastConsultation || {
        date: new Date().toLocaleDateString('pt-BR'),
        time: '15:30',
        dentist: 'Dr. Frankisney Souza',
        procedure: 'Avaliação Inicial & Planejamento',
        isToday: true,
      },
      status: initialData?.status || 'ativo',
      statusLabel: initialData?.statusLabel || 'Ativo',
    });

    if (!initialData) {
      emitirNotificacaoClinica({
        tipo: 'novo_cadastro',
        titulo: 'Novo Paciente Cadastrado',
        mensagem: `${name} foi registrado no sistema como paciente ativo.`,
        detalhes: {
          pacienteNome: name,
          pacienteTelefone: whatsapp || '',
          pacienteEmail: email || portalEmail || '',
          origem: 'recepcao',
          observacoes: `Convênio: ${insurance || 'Convênio da Casa'}. CPF: ${cpf}`,
        },
        linkRota: 'pacientes',
      });
    }

    toast.success(
      initialData ? 'Paciente atualizado!' : 'Paciente cadastrado!',
      `Os dados de ${name} foram salvos com sucesso.`
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Bar / Navegação de Retorno Estilo App Nativa */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#005F73]" />
          <span>Voltar para Pacientes</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {initialData ? 'Edição de Prontuário' : 'Novo Cadastro Clínico'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Base OdontoSouza
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-8 md:p-10 transition-all">
        {/* Cabeçalho do Formulário */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0A9396]">
                <UserPlus className="w-5 h-5 text-[#005F73]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {initialData ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Preencha os dados abaixo para registar ou atualizar o paciente na clínica ODONTO SOUZA.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-lg text-xs text-slate-600 self-start sm:self-auto">
            <span className="text-rose-500 font-bold">*</span> Campos obrigatórios
          </div>
        </div>

        {/* Formulário com as 4 Seções Padronizadas */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECÇÃO 1: Dados Pessoais */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#0A9396]/10 flex items-center justify-center text-[#0A9396]">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                1. Dados Pessoais & Foto do Paciente
              </h2>
            </div>

            {/* Foto de Perfil do Paciente */}
            <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name || 'Foto do Paciente'}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-sm ring-4 ring-[#005F73]/20 border border-white"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shadow-2xs">
                    <User className="w-8 h-8 text-slate-300 mb-1" />
                    <span className="text-[10px] font-semibold text-slate-400">Sem foto</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tirar ou carregar foto"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[#005F73] hover:bg-[#004d5c] text-white shadow-md ring-2 ring-white transition active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Foto do Perfil do Paciente
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Utilizada na identificação visual em consultório, fila da recepção, prontuário clínico e receituários.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#005F73]" />
                    <span>Carregar do Dispositivo / Câmera</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>

                {/* Entrada opcional por URL */}
                <div className="pt-1 max-w-md">
                  <div className="relative">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Ou cole a URL direta da imagem (ex: https://...)"
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:ring-1 focus:ring-[#005F73] outline-none"
                    />
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Nome Completo (ocupa 2 colunas) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mariana Alcantara Costa"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* CPF */}
              <div>
                <ValidatedInput
                  label="CPF"
                  required
                  value={cpf}
                  onChange={handleCpfChange}
                  onBlur={handleCpfBlur}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  error={cpfError}
                  errorMessage={cpfErrorMessage}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  className="font-mono"
                />
              </div>

              {/* RG / Identidade */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  RG / Identidade
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={rg}
                    onChange={(e) => setRg(e.target.value)}
                    placeholder="Ex: 12.345.678-9 SSP/SP"
                    maxLength={25}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition font-mono"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data de Nascimento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-2xs focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition"
                />
              </div>

              {/* Gênero */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gênero
                </label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-2xs focus:ring-2 focus:ring-[#0A9396] focus:border-transparent appearance-none outline-none cursor-pointer"
                  >
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="outro">Outro / Prefiro não informar</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Convênio Odontológico */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Convênio Odontológico
                </label>
                <div className="relative">
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    disabled={isLoadingConvenios}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-2xs focus:ring-2 focus:ring-[#0A9396] focus:border-transparent appearance-none outline-none cursor-pointer disabled:bg-slate-50"
                  >
                    {isLoadingConvenios ? (
                      <option value="" disabled>Carregando convênios...</option>
                    ) : conveniosList.length === 0 ? (
                      <option value="" disabled>Nenhum convênio cadastrado</option>
                    ) : (
                      conveniosList.map((conv) => (
                        <option key={conv.id} value={conv.nome}>
                          {conv.nome}
                        </option>
                      ))
                    )}
                  </select>
                  <ShieldCheck className="w-4 h-4 text-[#0A9396] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* SECÇÃO 2: Contatos */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#0A9396]/10 flex items-center justify-center text-[#0A9396]">
                <Phone className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                2. Contatos
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* WhatsApp / Celular */}
              <div>
                <ValidatedInput
                  label="WhatsApp / Celular"
                  required
                  type="tel"
                  mask="phone"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 98711-2091"
                  leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
                />
                <p className="text-[11px] text-slate-400 mt-1">Usado para lembretes automáticos de agendamento.</p>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@exemplo.com.br"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Para envio de recibos, laudos e receitas digitais.</p>
              </div>
            </div>
          </section>

          {/* SECÇÃO 3: Endereço Residencial */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#0A9396]/10 flex items-center justify-center text-[#0A9396]">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                3. Endereço Residencial
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 pt-1">
              {/* CEP */}
              <div className="md:col-span-2">
                <ValidatedInput
                  label="CEP"
                  value={cep}
                  onChange={handleCepChange}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                  error={cepError}
                  errorMessage={cepErrorMessage}
                  loading={cepLoading}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="font-mono"
                />
              </div>

              {/* Rua / Logradouro */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rua / Logradouro
                </label>
                <input
                  type="text"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  placeholder="Av. Paulista, Alameda dos Anjos..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] outline-none"
                />
              </div>

              {/* Número */}
              <div className="sm:col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] outline-none"
                />
              </div>

              {/* Complemento */}
              <div className="sm:col-span-1 md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Complemento
                </label>
                <input
                  type="text"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto 42, Bloco B, Casa..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] outline-none"
                />
              </div>

              {/* Bairro */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bairro
                </label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bela Vista"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] outline-none"
                />
              </div>

              {/* Cidade */}
              <div className="sm:col-span-1 md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cidade
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0A9396] outline-none"
                />
              </div>

              {/* Estado */}
              <div className="sm:col-span-1 md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-2xs focus:ring-2 focus:ring-[#0A9396] outline-none cursor-pointer"
                >
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MG">MG</option>
                  <option value="PR">PR</option>
                  <option value="SC">SC</option>
                  <option value="RS">RS</option>
                  <option value="BA">BA</option>
                  <option value="DF">DF</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECÇÃO 4: Informações Clínicas Básicas */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                4. Informações Clínicas Básicas
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-1">
              {/* Alergias Destacadas */}
              <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Possui alguma alergia medicamentosa ou substância?</span>
                </div>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Ex: Penicilina, Iodo, Látex, Dipirona... (ou deixar vazio se nenhuma)"
                  className="w-full px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
                />
                <p className="text-[11px] text-rose-700/90 leading-relaxed">
                  Este dado gera um alerta visual destacado no Prontuário e no Atendimento em Consultório.
                </p>
              </div>

              {/* Observações ou Condições Crônicas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observações ou Condições Crônicas
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Ex: Hipertensão arterial compensada, Diabetes Tipo 2, gestante no 2º trimestre, ansiedade odontológica..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs resize-y focus:ring-2 focus:ring-[#0A9396] outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Informações iniciais para o dentista antes da anamnese completa.
                </p>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* SECÇÃO 5: Acesso à Área do Paciente (Criação de Credenciais)   */}
          {/* ============================================================== */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#005F73]/10 flex items-center justify-center text-[#005F73]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">
                    5. Acesso à Área do Paciente
                  </h2>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#005f73] border border-teal-200/80 text-[11px] font-bold">
                Portal /minhaconta
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {initialData
                ? 'Atualize os dados de acesso. A alteração da senha é opcional: deixe em branco para manter a senha atual inalterada.'
                : 'Crie as credenciais para o paciente acessar laudos, receitas em PDF, agendamentos e histórico clínico com perfil exclusivo paciente.'}
            </p>

            {initialData && (
              <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-center gap-2 text-xs text-[#005F73]">
                <ShieldCheck className="w-4 h-4 text-[#005F73] shrink-0" />
                <span>
                  <strong>Senha preservada:</strong> Para manter a senha atual do paciente, basta deixar os campos de senha em branco.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* E-mail de Acesso */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail de Acesso (Login)
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none select-none" />
                  <input
                    type="email"
                    value={portalEmail}
                    onChange={(e) => setPortalEmail(e.target.value)}
                    placeholder="paciente@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#005F73] outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Este e-mail será utilizado para autenticação no portal e recebimento de notificações.
                </p>
              </div>

              {/* Senha de Acesso */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {initialData ? 'Nova Senha (Opcional)' : 'Senha de Acesso'}
                  </label>
                  {initialData && (
                    <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none select-none" />
                  <input
                    type={showPortalPassword ? 'text' : 'password'}
                    value={portalPassword}
                    onChange={(e) => setPortalPassword(e.target.value)}
                    placeholder={initialData ? 'Deixar em branco para manter a atual...' : 'Mínimo 8 caracteres...'}
                    className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#005F73] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPortalPassword(!showPortalPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    title={showPortalPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPortalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {initialData ? 'Confirmar Nova Senha' : 'Confirmar Senha'}
                  </label>
                  {initialData && (
                    <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none select-none" />
                  <input
                    type={showPortalConfirmPassword ? 'text' : 'password'}
                    value={portalConfirmPassword}
                    onChange={(e) => setPortalConfirmPassword(e.target.value)}
                    placeholder={initialData ? 'Repita apenas se for alterar...' : 'Repita a mesma senha...'}
                    className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#005F73] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPortalConfirmPassword(!showPortalConfirmPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    title={showPortalConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPortalConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist Visual de Força da Senha */}
            {(portalPassword.length > 0 || portalConfirmPassword.length > 0) && (
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 animate-in fade-in">
                {/* Barra de Progresso e Classificação */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Força da Senha:</span>
                    <span className={strengthInfo.color}>{strengthInfo.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthInfo.barBg}`}
                      style={{ width: strengthInfo.width }}
                    />
                  </div>
                </div>

                {/* 4 Critérios Solicitados com Validação em Tempo Real */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  {/* 1. Mínimo 8 caracteres */}
                  <div className="flex items-center gap-2">
                    {minLengthValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={minLengthValid ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                      Mínimo de 8 caracteres
                    </span>
                  </div>

                  {/* 2. Pelo menos 1 letra maiúscula */}
                  <div className="flex items-center gap-2">
                    {uppercaseValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={uppercaseValid ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                      Pelo menos 1 letra maiúscula
                    </span>
                  </div>

                  {/* 3. Pelo menos 1 caractere especial */}
                  <div className="flex items-center gap-2">
                    {specialCharValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={specialCharValid ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                      Pelo menos 1 caractere especial (!@#$...)
                    </span>
                  </div>

                  {/* 4. Validação de senhas idênticas */}
                  <div className="flex items-center gap-2">
                    {passwordsMatch ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={passwordsMatch ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                      Senhas idênticas
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Divisória */}
          <hr className="border-slate-100 pt-2" />

          {/* Rodapé de Ações */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-400" />
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isUploadingPhoto}
              className={`w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#005F73] text-white font-bold text-sm hover:bg-[#004b5c] transition shadow-md shadow-[#005F73]/20 flex items-center justify-center gap-2 cursor-pointer ${
                isUploadingPhoto ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isUploadingPhoto ? (
                <>
                  <Upload className="w-4 h-4 animate-spin text-white" />
                  <span>Enviando para o Storage...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{initialData ? 'Atualizar Paciente' : 'Salvar Paciente'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Informativo de Segurança e LGPD */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-2 py-1 gap-2">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Dados protegidos pela LGPD Médica • ODONTO SOUZA</span>
        </div>
        <span className="font-mono text-[11px]">PacienteFormView.tsx</span>
      </div>
    </div>
  );
};
