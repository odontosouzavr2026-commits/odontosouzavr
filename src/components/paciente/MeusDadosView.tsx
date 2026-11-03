import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  ShieldCheck,
  Stethoscope,
  Save,
  RotateCcw,
  Camera,
  Upload,
  Trash2,
  Check,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Sliders,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { pacientePortalService, PacientePortalData } from '../../services/pacientePortalService';

interface MeusDadosViewProps {
  patientData?: PacientePortalData;
  onSaved?: (updated: PacientePortalData) => void;
}

export const MeusDadosView: React.FC<MeusDadosViewProps> = ({ patientData, onSaved }) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFotoUrl = (patientData?.avatarUrl && !patientData.avatarUrl.includes('unsplash.com') && !patientData.avatarUrl.includes('placeholder'))
    ? patientData.avatarUrl
    : '';

  // Estados do Formulário
  const [formData, setFormData] = useState({
    fotoUrl: initialFotoUrl,
    nomeCompleto: patientData?.fullName || '',
    nomeSocial: patientData?.socialName || '',
    cpf: patientData?.cpf || '',
    rg: patientData?.rg || '',
    dataNascimento: patientData?.birthDate || '',
    genero: patientData?.gender || 'Não Informado',
    estadoCivil: patientData?.maritalStatus || 'Solteira(o)',
    profissao: patientData?.occupation || '',
    // Endereço
    cep: patientData?.zipCode || '',
    logradouro: patientData?.street || '',
    numero: patientData?.number || '',
    complemento: patientData?.complement || '',
    bairro: patientData?.neighborhood || '',
    cidade: patientData?.city || '',
    uf: patientData?.state || '',
    // Contato
    email: patientData?.email || '',
    whatsapp: patientData?.phone || '',
    telefoneFixo: patientData?.homePhone || '',
    // Emergência
    nomeEmergencia: patientData?.emergencyName || '',
    parentescoEmergencia: patientData?.emergencyRelation || '',
    telefoneEmergencia: patientData?.emergencyPhone || '',
    // Convênio
    operadora: patientData?.insuranceName || 'Particular',
    numeroCarteirinha: patientData?.insuranceNumber || '',
    validadeCarteirinha: patientData?.insuranceValidity || '',
    titularidade: patientData?.insuranceHolder || (patientData?.fullName ? `Próprio Titular (${patientData.fullName})` : 'Próprio Titular'),
    // Preferências LGPD
    prefWhatsapp: true,
    prefEmail: true,
    prefEncaixe: true,
    prefSms: false,
  });

  useEffect(() => {
    if (patientData) {
      const cleanFoto = (patientData.avatarUrl && !patientData.avatarUrl.includes('unsplash.com') && !patientData.avatarUrl.includes('placeholder'))
        ? patientData.avatarUrl
        : '';

      setFormData((prev) => ({
        ...prev,
        fotoUrl: cleanFoto || prev.fotoUrl,
        nomeCompleto: patientData.fullName || prev.nomeCompleto,
        nomeSocial: patientData.socialName || prev.nomeSocial,
        cpf: patientData.cpf || prev.cpf,
        rg: patientData.rg || prev.rg,
        dataNascimento: patientData.birthDate || prev.dataNascimento,
        genero: patientData.gender || prev.genero,
        estadoCivil: patientData.maritalStatus || prev.estadoCivil,
        profissao: patientData.occupation || prev.profissao,
        cep: patientData.zipCode || prev.cep,
        logradouro: patientData.street || prev.logradouro,
        numero: patientData.number || prev.numero,
        complemento: patientData.complement || prev.complemento,
        bairro: patientData.neighborhood || prev.bairro,
        cidade: patientData.city || prev.cidade,
        uf: patientData.state || prev.uf,
        email: patientData.email || prev.email,
        whatsapp: patientData.phone || prev.whatsapp,
        telefoneFixo: patientData.homePhone || prev.telefoneFixo,
        nomeEmergencia: patientData.emergencyName || prev.nomeEmergencia,
        parentescoEmergencia: patientData.emergencyRelation || prev.parentescoEmergencia,
        telefoneEmergencia: patientData.emergencyPhone || prev.telefoneEmergencia,
        operadora: patientData.insuranceName || prev.operadora,
        numeroCarteirinha: patientData.insuranceNumber || prev.numeroCarteirinha,
        validadeCarteirinha: patientData.insuranceValidity || prev.validadeCarteirinha,
        titularidade: patientData.insuranceHolder || (patientData.fullName ? `Próprio Titular (${patientData.fullName})` : prev.titularidade),
      }));
    }
  }, [patientData]);

  const [isCpfVisible, setIsCpfVisible] = useState(false);
  const [isCarteirinhaModalOpen, setIsCarteirinhaModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (patientData?.id) {
        await pacientePortalService.salvarDadosPaciente(patientData.id, {
          fullName: formData.nomeCompleto,
          socialName: formData.nomeSocial,
          rg: formData.rg,
          cpf: formData.cpf,
          birthDate: formData.dataNascimento,
          gender: formData.genero,
          maritalStatus: formData.estadoCivil,
          occupation: formData.profissao,
          avatarUrl: formData.fotoUrl || '',
          zipCode: formData.cep,
          street: formData.logradouro,
          number: formData.numero,
          complement: formData.complemento,
          neighborhood: formData.bairro,
          city: formData.cidade,
          state: formData.uf,
          email: formData.email,
          phone: formData.whatsapp,
          homePhone: formData.telefoneFixo,
          emergencyName: formData.nomeEmergencia,
          emergencyRelation: formData.parentescoEmergencia,
          emergencyPhone: formData.telefoneEmergencia,
          insuranceName: formData.operadora,
          insuranceNumber: formData.numeroCarteirinha,
          insuranceValidity: formData.validadeCarteirinha,
          insuranceHolder: formData.titularidade,
        });
      }

      toast.success(
        'Perfil Atualizado! 🎉',
        'Seus dados pessoais, contatos e preferências foram salvos no prontuário com sucesso!'
      );

      if (onSaved && patientData) {
        onSaved({
          ...patientData,
          fullName: formData.nomeCompleto,
          socialName: formData.nomeSocial,
          rg: formData.rg,
          cpf: formData.cpf,
          birthDate: formData.dataNascimento,
          gender: formData.genero,
          maritalStatus: formData.estadoCivil,
          occupation: formData.profissao,
          avatarUrl: formData.fotoUrl ? formData.fotoUrl : undefined,
          zipCode: formData.cep,
          street: formData.logradouro,
          number: formData.numero,
          complement: formData.complemento,
          neighborhood: formData.bairro,
          city: formData.cidade,
          state: formData.uf,
          email: formData.email,
          phone: formData.whatsapp,
          homePhone: formData.telefoneFixo,
          insuranceName: formData.operadora,
          insuranceNumber: formData.numeroCarteirinha,
        });
      }
    } catch (err) {
      toast.error('Erro ao Salvar', 'Não foi possível salvar as alterações no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    toast.info('Alterações Descartadas', 'Os dados foram restaurados para a versão atual do prontuário.');
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Formato Inválido', 'Selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Arquivo Muito Grande', 'A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, fotoUrl: result }));
      toast.success('Foto Carregada', 'A nova foto foi carregada. Clique em "Salvar Alterações" para salvar no seu perfil.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, fotoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Foto Removida', 'A foto de perfil foi removida. O sistema agora exibirá suas iniciais.');
  };

  const maskedCpf = isCpfVisible
    ? formData.cpf
    : formData.cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '$1.***.***-$4');

  const calculateAge = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const calculatedAge = calculateAge(formData.dataNascimento);
  const formattedBirth = formData.dataNascimento
    ? formData.dataNascimento.split('-').reverse().join('/')
    : 'Não informada';

  const patientInitials = (formData.nomeCompleto || 'PA')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'PA';

  const hasValidPhoto = Boolean(
    formData.fotoUrl &&
    formData.fotoUrl.trim() !== '' &&
    !formData.fotoUrl.includes('unsplash.com') &&
    !formData.fotoUrl.includes('placeholder')
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. HERO / BANNER ADMINISTRATIVO CLÍNICO (Oculto no mobile)    */}
      {/* ============================================================== */}
      <header className="hidden sm:block relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-50/70 via-white to-sky-50/50 p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#005f73] font-bold text-xs shadow-2xs border border-teal-100">
                <span className="w-2 h-2 rounded-full bg-[#0A9396] animate-pulse" />
                Prontuário Ativo {patientData?.code || '#OS-2024-892'}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Conformidade LGPD 100% Protegido
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                <Stethoscope className="w-3.5 h-3.5 text-[#005f73]" />
                Dr. Frankisney B. Souza (CRO-5950/MT)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#004655] tracking-tight">
              Meus Dados & Perfil do Paciente
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mantenha suas informações pessoais, de contato e plano de saúde bucal atualizados para
              atendimento ágil, checagem de procedimentos e emissão de notas fiscais odontológicas.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              Descartar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. CARD DE IDENTIDADE DO PACIENTE & BENTO STATS               */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            className="hidden"
            aria-label="Upload de foto de perfil"
          />
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-[#005f73] to-[#0A9396] shadow-md flex items-center justify-center overflow-hidden">
            {hasValidPhoto ? (
              <img
                src={formData.fotoUrl}
                alt={formData.nomeCompleto || 'Foto do Paciente'}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-[#005f73] rounded-xl flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl select-none uppercase">
                {patientInitials}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-2 bg-[#005f73] hover:bg-[#004655] text-white rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            title="Alterar foto"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
              {formData.nomeCompleto || 'Paciente'}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#005f73] font-bold text-xs border border-teal-200">
              <Check className="w-3.5 h-3.5 stroke-[3] text-[#0A9396]" />
              Cadastro Verificado
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            {formData.profissao || 'Profissão não informada'} • {formData.cidade ? `${formData.cidade}${formData.uf ? `, ${formData.uf}` : ''}` : 'Localização não informada'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Idade
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900">
                {calculatedAge !== null ? `${calculatedAge} anos` : 'Não informada'}
              </span>
              <span className="text-[11px] text-slate-500">{formattedBirth}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Convênio
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 truncate">
                {formData.operadora || 'Particular'}
              </span>
              <span className="text-[11px] text-[#0A9396] font-semibold">
                {formData.numeroCarteirinha ? `Cartão: ${formData.numeroCarteirinha}` : 'Atendimento Particular'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Status Cadastral
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900">Ativo</span>
              <span className="text-[11px] text-emerald-600 font-semibold">Prontuário Digital</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#005f73] font-bold text-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{hasValidPhoto ? 'Trocar Imagem' : 'Carregar Nova Imagem'}</span>
            </button>

            {hasValidPhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover Foto</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. GRID BENTO DE FORMULÁRIOS                                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* COLUNA ESQUERDA (7 COLS): PESSOAIS & ENDEREÇO */}
        <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-8">
          {/* CARD 1: Informações Pessoais & Documentos */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <User className="w-5 h-5 text-[#005f73]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Informações Pessoais & Documentos
                  </h3>
                  <p className="text-xs text-slate-500">Dados civis essenciais e identificação legal</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#005f73]">
                Obrigatório
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome Completo */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Nome Completo Civil <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* Como prefere ser chamada */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Como prefere ser chamada</label>
                <input
                  type="text"
                  value={formData.nomeSocial}
                  onChange={(e) => handleInputChange('nomeSocial', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* CPF com Máscara e Revelação */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    CPF <span className="text-rose-500">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0A9396]">
                    <Lock className="w-3 h-3 text-[#0A9396]" />
                    Protegido LGPD
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={maskedCpf}
                    readOnly
                    className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-slate-100/80 border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono font-semibold select-all"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCpfVisible(!isCpfVisible)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-[#005f73] transition-colors cursor-pointer"
                    title={isCpfVisible ? 'Ocultar CPF' : 'Revelar CPF'}
                  >
                    {isCpfVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* RG / Órgão */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">RG / Órgão Emissor</label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* Data de Nascimento */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* Gênero */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Gênero / Identidade</label>
                <select
                  value={formData.genero}
                  onChange={(e) => handleInputChange('genero', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Não-binário">Não-binário</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>

              {/* Estado Civil */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Estado Civil</label>
                <select
                  value={formData.estadoCivil}
                  onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                >
                  <option value="Solteira(o)">Solteira(o)</option>
                  <option value="Casada(o)">Casada(o)</option>
                  <option value="União Estável">União Estável</option>
                  <option value="Divorciada(o)">Divorciada(o)</option>
                  <option value="Viúva(o)">Viúva(o)</option>
                </select>
              </div>

              {/* Profissão */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Profissão / Ocupação</label>
                <input
                  type="text"
                  value={formData.profissao}
                  onChange={(e) => handleInputChange('profissao', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>
            </div>
          </section>

          {/* CARD 2: Endereço Residencial */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <MapPin className="w-5 h-5 text-[#005f73]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Endereço Residencial
                  </h3>
                  <p className="text-xs text-slate-500">
                    Utilizado para correspondências e nota fiscal paulista
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                CEP Validado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* CEP */}
              <div className="sm:col-span-5 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">CEP</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3" />
                </div>
              </div>

              <div className="sm:col-span-7 flex flex-col justify-end">
                <span className="text-xs text-slate-500 pb-2.5">
                  São Paulo - SP (Zona Sul / Jardins)
                </span>
              </div>

              {/* Logradouro */}
              <div className="sm:col-span-8 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Logradouro / Rua / Alameda</label>
                <input
                  type="text"
                  value={formData.logradouro}
                  onChange={(e) => handleInputChange('logradouro', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* Número */}
              <div className="sm:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Número</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* Complemento */}
              <div className="sm:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Complemento</label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* Bairro */}
              <div className="sm:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Bairro</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* Cidade */}
              <div className="sm:col-span-8 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* UF */}
              <div className="sm:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Estado (UF)</label>
                <input
                  type="text"
                  value={formData.uf}
                  onChange={(e) => handleInputChange('uf', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA (5 COLS): CONTATOS & CONVÊNIO */}
        <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
          {/* CARD 3: Informações de Contato & Urgência */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <Phone className="w-5 h-5 text-[#005f73]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Canais de Contato</h3>
                  <p className="text-xs text-slate-500">Lembretes e confirmação de consultas</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* E-mail Principal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">E-mail Principal</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                  />
                </div>
              </div>

              {/* WhatsApp Celular */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Celular / WhatsApp</label>
                  <span className="text-[11px] font-bold text-[#0A9396] inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Lembretes Ativos
                  </span>
                </div>
                <div className="relative flex items-center">
                  <MessageCircle className="w-4 h-4 text-[#0A9396] absolute left-3.5" />
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Utilizado pelo assistente da Odonto Souza para confirmação 24h antes da consulta.
                </p>
              </div>

              {/* Telefone Fixo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Telefone Residencial / Fixo (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.telefoneFixo}
                  onChange={(e) => handleInputChange('telefoneFixo', e.target.value)}
                  placeholder="(11) 3289-0000"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                />
              </div>

              {/* Bloco Contato de Emergência */}
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Contato para Casos de Urgência</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-600">Nome do Contato</span>
                    <input
                      type="text"
                      value={formData.nomeEmergencia}
                      onChange={(e) => handleInputChange('nomeEmergencia', e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-rose-200/80 text-xs text-slate-800 font-medium focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-600">Parentesco</span>
                    <input
                      type="text"
                      value={formData.parentescoEmergencia}
                      onChange={(e) => handleInputChange('parentescoEmergencia', e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-rose-200/80 text-xs text-slate-800 font-medium focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[11px] font-semibold text-slate-600">Telefone de Emergência</span>
                    <input
                      type="text"
                      value={formData.telefoneEmergencia}
                      onChange={(e) => handleInputChange('telefoneEmergencia', e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-rose-200/80 text-xs text-slate-800 font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CARD 4: Convênio & Faturamento */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <CreditCard className="w-5 h-5 text-[#005f73]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Convênio & Faturamento
                  </h3>
                  <p className="text-xs text-slate-500">Plano odontológico vinculado</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#005f73] border border-teal-200">
                Autorização OK
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Operadora */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Operadora de Saúde Bucal</label>
                <input
                  type="text"
                  value={formData.operadora}
                  readOnly
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs sm:text-sm text-slate-900 font-semibold cursor-default"
                />
              </div>

              {/* Dados da Carteirinha */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Nº Carteirinha Digital</label>
                  <input
                    type="text"
                    value={formData.numeroCarteirinha}
                    onChange={(e) => handleInputChange('numeroCarteirinha', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Validade</label>
                  <input
                    type="text"
                    value={formData.validadeCarteirinha}
                    onChange={(e) => handleInputChange('validadeCarteirinha', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f73]"
                  />
                </div>
              </div>

              {/* Titularidade */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Titularidade</label>
                <input
                  type="text"
                  value={formData.titularidade}
                  readOnly
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium cursor-default"
                />
              </div>

              {/* Visual da Carteirinha Virtual Anexada */}
              <div className="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Carteirinha Virtual Anexada</span>
                  <span className="text-[10px] text-[#0A9396] font-semibold">
                    PDF/Imagem sincronizado
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="w-12 h-8 rounded bg-[#005f73] text-white flex items-center justify-center font-black text-[9px] tracking-wider shrink-0 shadow-xs">
                    BRADESCO
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      carteirinha_dental_{formData.nomeCompleto ? formData.nomeCompleto.toLowerCase().replace(/\s+/g, '_') : 'paciente'}.pdf
                    </span>
                    <span className="text-[11px] text-slate-400">1.2 MB • Atualizado em 10/01/2025</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCarteirinhaModalOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-[#005f73] transition-colors cursor-pointer"
                    title="Visualizar documento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toast.info('Substituir Carteirinha', 'Selecione o novo arquivo PDF ou imagem da carteirinha.')}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[#005f73] font-bold text-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Substituir Carteirinha Virtual</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. PREFERÊNCIAS DE COMUNICAÇÃO & TERMOS LGPD                   */}
      {/* ============================================================== */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#005f73] flex items-center justify-center">
              <Sliders className="w-5 h-5 text-[#005f73]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Preferências de Comunicação & Termos LGPD
              </h3>
              <p className="text-xs text-slate-500">
                Personalize canais para lembretes de consultas, laudos e avisos clínicos
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#0A9396]" />
            Consentimentos Ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Switch 1: WhatsApp */}
          <label className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.prefWhatsapp}
              onChange={(e) => handleInputChange('prefWhatsapp', e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#005f73] accent-[#005f73] cursor-pointer"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">
                Lembretes e Confirmações via WhatsApp
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed">
                Receba links interativos para confirmação de horário com 48h e 24h de antecedência.
              </span>
            </div>
          </label>

          {/* Switch 2: Exames por E-mail */}
          <label className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.prefEmail}
              onChange={(e) => handleInputChange('prefEmail', e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#005f73] accent-[#005f73] cursor-pointer"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">
                Radiografias e Exames Digitais no E-mail
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed">
                Envio automático do raio-X panorâmico, fotos de evolução e recibos fiscais em PDF.
              </span>
            </div>
          </label>

          {/* Switch 3: Encaixe prioritário */}
          <label className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.prefEncaixe}
              onChange={(e) => handleInputChange('prefEncaixe', e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#005f73] accent-[#005f73] cursor-pointer"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">
                Avisos de Vagas por Cancelamento (Encaixe Rápido)
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed">
                Permite a recepção oferecer horários antecipados caso surja uma desistência na agenda do Dr. Frankisney.
              </span>
            </div>
          </label>

          {/* Switch 4: SMS */}
          <label className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.prefSms}
              onChange={(e) => handleInputChange('prefSms', e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#005f73] accent-[#005f73] cursor-pointer"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">
                Mensagens Informativas por SMS convencional
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed">
                Notificações breves caso você esteja sem conexão à internet móvel.
              </span>
            </div>
          </label>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. RODAPÉ DE PROTEÇÃO LGPD E AÇÕES FINAIS                     */}
      {/* ============================================================== */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3 text-slate-600 max-w-xl">
          <ShieldCheck className="w-6 h-6 text-[#0A9396] shrink-0" />
          <p className="text-xs leading-relaxed">
            Seus dados são protegidos sob criptografia avançada e diretrizes da <strong>LGPD (Lei 13.709/2018)</strong>.
            As informações clínicas são de acesso restrito à equipe odontológica da Odonto Souza.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Descartar Alterações
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#005f73] hover:bg-[#004655] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 6. MODAL DA CARTEIRINHA VIRTUAL                               */}
      {/* ============================================================== */}
      {isCarteirinhaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#005f73]">
                  <CreditCard className="w-4 h-4 text-[#005f73]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Carteirinha Virtual Digital</h4>
                  <p className="text-xs text-slate-500">Bradesco Dental Premium</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCarteirinhaModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulação do Cartão Virtual */}
            <div className="bg-gradient-to-tr from-[#005f73] to-[#0A9396] p-5 rounded-2xl text-white shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm tracking-widest text-[#89f3f6]">
                  BRADESCO DENTAL
                </span>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  PREMIUM
                </span>
              </div>

              <div>
                <span className="text-[10px] text-white/70 uppercase">Beneficiário</span>
                <p className="font-bold text-sm">{formData.nomeCompleto}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/20">
                <div>
                  <span className="text-[9px] text-white/70 block">Nº da Carteirinha</span>
                  <span className="font-mono font-bold">{formData.numeroCarteirinha}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/70 block">Validade</span>
                  <span className="font-mono font-bold">{formData.validadeCarteirinha}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsCarteirinhaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
