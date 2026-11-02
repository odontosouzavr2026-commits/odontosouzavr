import React, { useState } from 'react';
import { X, Calendar, Clock, User, Stethoscope, FileText, CheckCircle2 } from 'lucide-react';
import { PatientAppointment } from '../../types/dashboard';
import { useToast } from '../../contexts/ToastContext';
import { whatsappNotificationService } from '../../services/whatsappNotificationService';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<PatientAppointment, 'id'>) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const toast = useToast();
  const [patientName, setPatientName] = useState('');
  const [time, setTime] = useState('14:00');
  const [date, setDate] = useState('2026-10-30');
  const [procedure, setProcedure] = useState('Limpeza & Profilaxia');
  const [dentist, setDentist] = useState('Dr. Frankisney Souza');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      toast.warning('Campo obrigatório', 'Informe o nome do paciente.');
      return;
    }

    const initials = patientName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');

    onSave({
      name: patientName,
      time,
      initials: initials || 'PX',
      chartNumber: `#${Math.floor(4000 + Math.random() * 900)}`,
      procedure,
      status: 'Confirmado',
      dentist,
      room: 'Consultório 1'
    });



    setIsSuccess(true);
    toast.success('Agendamento criado!', `Consulta para ${patientName} às ${time} agendada com sucesso.`);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setPatientName('');
      setNotes('');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#005F73] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">Novo Agendamento</h3>
              <p className="text-xs text-cyan-100">Marcar consulta no calendário clínico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Agendamento Realizado!</h4>
            <p className="text-sm text-slate-500 mt-1">A consulta foi adicionada à agenda do consultório.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
            <div className="p-6 space-y-4 flex-1">
              {/* Paciente */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome do Paciente *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Ex: Camila Nogueira"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Data & Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Data *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Horário *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Procedimento & Cirurgião */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Procedimento
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={procedure}
                      onChange={(e) => setProcedure(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73] bg-white text-slate-800"
                    >
                      <option>Limpeza &amp; Profilaxia</option>
                      <option>Restauração em Resina (Dente 16)</option>
                      <option>Manutenção Ortodôntica</option>
                      <option>Avaliação de Implante</option>
                      <option>Clareamento a Laser</option>
                      <option>Extração de Siso</option>
                      <option>Tratamento de Canal (Endodontia)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Profissional
                  </label>
                  <select
                    value={dentist}
                    onChange={(e) => setDentist(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73] bg-white text-slate-800"
                  >
                    <option>Dr. Frankisney Souza (Cirurgião-Dentista)</option>
                    <option>Dra. Amanda (Ortodontia)</option>
                    <option>Dr. Renato (Implantodontia)</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observações Clínicas
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Paciente com sensibilidade; preferência de horário pela manhã..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#005F73] hover:bg-[#004655] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Agendamento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
