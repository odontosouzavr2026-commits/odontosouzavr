import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  User,
  PhoneCall,
  MapPin,
  AlertTriangle,
  Check,
  MessageSquare,
  Maximize2,
} from 'lucide-react';
import { PacienteItem, ConvenioTipo } from '../../types/pacientes';
import { ConvenioItem } from '../../types/convenios';
import { conveniosService } from '../../services/conveniosService';

interface PacientesSlideOverProps {
  isOpen: boolean;
  initialData?: PacienteItem | null;
  onClose: () => void;
  onSave: (paciente: Omit<PacienteItem, 'id' | 'code' | 'initials'>) => void;
  onExpandToFullForm?: () => void;
}

export const PacientesSlideOver: React.FC<PacientesSlideOverProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
  onExpandToFullForm,
}) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('1994-06-15');
  const [gender, setGender] = useState<'feminino' | 'masculino' | 'outro'>('feminino');
  const [conveniosList, setConveniosList] = useState<ConvenioItem[]>([]);
  const [isLoadingConvenios, setIsLoadingConvenios] = useState(true);
  const [insurance, setInsurance] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phoneFixed, setPhoneFixed] = useState('');
  const [email, setEmail] = useState('');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidadeUf, setCidadeUf] = useState('São Paulo / SP');
  const [allergies, setAllergies] = useState('');

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

        if (initialData) {
          setInsurance(initialData.insuranceLabel || initialData.insurance || (disponiveis[0]?.nome || ''));
        } else {
          setInsurance(disponiveis[0]?.nome || '');
        }
      } catch (err) {
        console.error('[PacientesSlideOver] Erro ao carregar convênios:', err);
      } finally {
        if (isMounted) setIsLoadingConvenios(false);
      }
    }

    carregarConvenios();
    return () => {
      isMounted = false;
    };
  }, [initialData, isOpen]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCpf(initialData.cpf);
      setBirthDate(initialData.birthDate || '1994-06-15');
      setGender(initialData.gender || 'feminino');
      setInsurance(initialData.insuranceLabel || initialData.insurance);
      setWhatsapp(initialData.whatsapp);
      setEmail(initialData.email || '');
      setCep(initialData.address?.cep || '');
      setLogradouro(initialData.address?.logradouro || '');
      setNumero(initialData.address?.numero || '');
      setComplemento(initialData.address?.complemento || '');
      setBairro(initialData.address?.bairro || '');
      setCidadeUf(
        initialData.address?.cidade && initialData.address?.estado
          ? `${initialData.address.cidade} / ${initialData.address.estado}`
          : 'São Paulo / SP'
      );
      setAllergies(initialData.allergies || '');
    } else {
      setName('');
      setCpf('');
      setBirthDate('');
      setGender('feminino');
      setWhatsapp('');
      setPhoneFixed('');
      setEmail('');
      setCep('');
      setLogradouro('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCidadeUf('');
      setAllergies('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const [cidade, estado] = cidadeUf.split('/').map((s) => s.trim());

    const birthYear = parseInt(birthDate.split('-')[0], 10) || 1994;
    const age = Math.max(1, 2025 - birthYear);

    const getInsuranceLabel = (ins: string): string => {
      return ins || 'Convênio da Casa';
    };

    onSave({
      name,
      avatarUrl: initialData?.avatarUrl,
      cpf: cpf || '',
      birthDate,
      age,
      gender,
      insurance,
      insuranceLabel: insurance,
      whatsapp: whatsapp,
      email: email,
      address: {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade: cidade || 'São Paulo',
        estado: estado || 'SP',
      },
      allergies: allergies.trim() || undefined,
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
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop com blur suave */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out">
          {/* Topo do Slide-over */}
          <div className="p-5 sm:p-6 bg-[#005F73] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {initialData ? 'Editar Paciente' : 'Cadastro de Novo Paciente'}
                </h2>
                <p className="text-xs text-teal-100">
                  Preencha as informações clínicas e pessoais para abrir prontuário
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onExpandToFullForm && (
                <button
                  type="button"
                  onClick={onExpandToFullForm}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Expandir em Tela Cheia"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Corpo com Scroll */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Grupo 1: Dados Pessoais & Documentos */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                <User className="w-4 h-4 text-[#005F73]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  1. Dados Pessoais &amp; Documentos
                </h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mariana Alcantara Costa"
                    className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 focus:border-[#005F73] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CPF <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 focus:border-[#005F73] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data de Nascimento <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 focus:border-[#005F73] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sexo Biológico
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 cursor-pointer"
                    >
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                      <option value="outro">Outro / Não Informar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Convênio Odontológico
                    </label>
                    <select
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      disabled={isLoadingConvenios}
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 cursor-pointer disabled:bg-slate-100"
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
                  </div>
                </div>
              </div>
            </div>

            {/* Grupo 2: Contato & Notificações */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                <PhoneCall className="w-4 h-4 text-[#005F73]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Contato &amp; Notificações
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Celular / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full pl-9 pr-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 focus:border-[#005F73]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone Fixo (Opcional)
                    </label>
                    <input
                      type="tel"
                      value={phoneFixed}
                      onChange={(e) => setPhoneFixed(e.target.value)}
                      placeholder="(11) 3456-7890"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 focus:border-[#005F73]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Principal
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@exemplo.com.br"
                    className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30 focus:border-[#005F73]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="whatsapp-notify"
                    checked={notifyWhatsapp}
                    onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                    className="w-4 h-4 text-[#005F73] border-slate-300 rounded focus:ring-[#005F73] cursor-pointer"
                  />
                  <label htmlFor="whatsapp-notify" className="text-xs text-slate-600 cursor-pointer">
                    Enviar lembretes de consultas e confirmações via WhatsApp
                  </label>
                </div>
              </div>
            </div>

            {/* Grupo 3: Endereço Residencial */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-[#005F73]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Endereço Residencial
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      placeholder="01310-100"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      placeholder="Av. Paulista"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="1000"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Apto 124 - Bloco B"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Bela Vista"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / UF</label>
                    <input
                      type="text"
                      value={cidadeUf}
                      onChange={(e) => setCidadeUf(e.target.value)}
                      placeholder="São Paulo / SP"
                      className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grupo 4: Alertas Clínicos Rápidos */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <h4 className="text-xs font-bold text-amber-900">Atenção Médica / Anamnese Prévia</h4>
              </div>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: Alérgico a penicilina, hipertenso, diabético..."
                className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <p className="text-[11px] text-amber-700 mt-1">
                Essas notas serão projetadas automaticamente no cabeçalho do prontuário.
              </p>
            </div>
          </form>

          {/* Rodapé Fixo com Botões */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#005F73] hover:bg-[#004959] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Paciente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
