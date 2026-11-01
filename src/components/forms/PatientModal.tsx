import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, AlertTriangle, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { ValidatedInput } from '../common/ValidatedInput';
import { isValidCPF } from '../../utils/documentValidation';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState(false);
  const [cpfErrorMessage, setCpfErrorMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [allergies, setAllergies] = useState('');
  const [hypertension, setHypertension] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Campo obrigatório', 'Informe o nome completo do paciente.');
      return;
    }

    if (cpf.trim() && !isValidCPF(cpf)) {
      setCpfError(true);
      setCpfErrorMessage('CPF inválido. Por favor, verifique os números.');
      toast.warning('Documento inválido', 'Por favor, corrija o CPF do paciente antes de salvar.');
      return;
    }

    setIsSaved(true);
    toast.success('Paciente cadastrado!', `Ficha clínica de ${name} salva com sucesso.`);
    setTimeout(() => {
      setIsSaved(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#005F73] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">Cadastrar Paciente</h3>
              <p className="text-xs text-cyan-100">Ficha clínica &amp; dados cadastrais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSaved ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Paciente Cadastrado com Sucesso!</h4>
            <p className="text-sm text-slate-500 mt-1">Prontuário gerado e disponível para atendimento.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
            <div className="p-6 space-y-5 flex-1">
              {/* Section 1: Dados Pessoais */}
              <div>
                <h4 className="text-xs font-bold text-[#005F73] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 1. Dados Pessoais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Roberto Alencar"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73]"
                    />
                  </div>
                  <div>
                    <ValidatedInput
                      label="CPF"
                      mask="cpf"
                      value={cpf}
                      onChange={(e) => {
                        setCpf(e.target.value);
                        if (cpfError) {
                          setCpfError(false);
                          setCpfErrorMessage('');
                        }
                      }}
                      onBlur={() => {
                        if (cpf.trim() && !isValidCPF(cpf)) {
                          setCpfError(true);
                          setCpfErrorMessage('CPF inválido. Por favor, verifique os números.');
                        } else {
                          setCpfError(false);
                          setCpfErrorMessage('');
                        }
                      }}
                      placeholder="000.000.000-00"
                      error={cpfError}
                      errorMessage={cpfErrorMessage}
                      leftIcon={<CreditCard className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contato */}
              <div>
                <h4 className="text-xs font-bold text-[#005F73] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> 2. Contato &amp; Notificações
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <ValidatedInput
                      label="WhatsApp / Telefone"
                      required
                      type="tel"
                      mask="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      leftIcon={<Phone className="w-4 h-4 text-emerald-600" />}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="paciente@email.com"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Anamnese Rápida */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> 3. Alertas Médicos &amp; Anamnese
                </h4>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hypertension}
                        onChange={(e) => setHypertension(e.target.checked)}
                        className="rounded text-[#005F73] focus:ring-[#005F73]"
                      />
                      Hipertenso
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={diabetes}
                        onChange={(e) => setDiabetes(e.target.checked)}
                        className="rounded text-[#005F73] focus:ring-[#005F73]"
                      />
                      Diabético
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Alergias a Medicamentos (ex: Penicilina, Dipirona):</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="Nenhuma alergia relatada"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73] bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#005F73] hover:bg-[#004655] rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salvar Paciente
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
