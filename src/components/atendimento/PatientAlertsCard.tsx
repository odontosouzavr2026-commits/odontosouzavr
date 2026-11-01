import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Edit3, PlusCircle, X, Check, HeartPulse, ShieldAlert } from 'lucide-react';
import { MedicalAlert } from '../../types/clinical';

interface PatientAlertsCardProps {
  alerts?: MedicalAlert[];
  patientName?: string;
  allergies?: string;
  clinicalNotes?: string;
  onSaveAlerts?: (allergies: string, clinicalNotes: string) => Promise<void>;
}

export const PatientAlertsCard: React.FC<PatientAlertsCardProps> = ({
  alerts = [],
  patientName,
  allergies = '',
  clinicalNotes = '',
  onSaveAlerts,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempAllergies, setTempAllergies] = useState(allergies);
  const [tempClinicalNotes, setTempClinicalNotes] = useState(clinicalNotes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTempAllergies(allergies);
    setTempClinicalNotes(clinicalNotes);
  }, [allergies, clinicalNotes]);

  const hasAlerts = alerts && alerts.length > 0;
  const hasHighRisk = alerts.some((a) => a.type === 'danger');

  const handleOpenModal = () => {
    setTempAllergies(allergies);
    setTempClinicalNotes(clinicalNotes);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveAlerts) {
      setIsModalOpen(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSaveAlerts(tempAllergies, tempClinicalNotes);
      setIsModalOpen(false);
    } catch (err) {
      console.error('[PatientAlertsCard] Erro ao salvar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const addAllergyChip = (chip: string) => {
    if (!tempAllergies.trim()) {
      setTempAllergies(chip);
    } else if (!tempAllergies.toLowerCase().includes(chip.toLowerCase())) {
      setTempAllergies(`${tempAllergies}, ${chip}`);
    }
  };

  const addConditionChip = (chip: string) => {
    if (!tempClinicalNotes.trim()) {
      setTempClinicalNotes(chip);
    } else if (!tempClinicalNotes.toLowerCase().includes(chip.toLowerCase())) {
      setTempClinicalNotes(`${tempClinicalNotes}, ${chip}`);
    }
  };

  return (
    <>
      {/* CARD PRINCIPAL */}
      {!hasAlerts ? (
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-4 sm:p-5 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-emerald-800">
                Alertas Médicos do Paciente
              </h2>
            </div>
            {onSaveAlerts && (
              <button
                type="button"
                onClick={handleOpenModal}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition shadow-2xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Cadastrar Alerta</span>
              </button>
            )}
          </div>
          <p className="text-xs text-emerald-700">
            Nenhuma restrição médica, alergia ou condição de alto risco cadastrada para este paciente.
          </p>
        </div>
      ) : (
        <div
          className={`rounded-xl p-4 sm:p-5 flex flex-col gap-3 shadow-2xs border ${
            hasHighRisk ? 'bg-red-50/70 border-red-200/90' : 'bg-amber-50/70 border-amber-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${hasHighRisk ? 'text-red-700' : 'text-amber-700'}`}>
              <AlertTriangle
                className={`w-5 h-5 shrink-0 ${hasHighRisk ? 'text-red-600' : 'text-amber-600'}`}
              />
              <h2 className={`text-sm sm:text-base font-bold ${hasHighRisk ? 'text-red-800' : 'text-amber-800'}`}>
                Alertas Médicos do Paciente
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-bold text-white px-2 py-0.5 rounded-full tracking-wider ${
                  hasHighRisk ? 'bg-red-600' : 'bg-amber-600'
                }`}
              >
                {hasHighRisk ? 'Atenção Especial' : 'Observação'}
              </span>
              {onSaveAlerts && (
                <button
                  type="button"
                  onClick={handleOpenModal}
                  title="Editar Alertas Médicos"
                  className="p-1 rounded-md hover:bg-white/60 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Atenção prévia a prescrições, procedimentos e anestésicos:
          </p>

          <div className="flex flex-col gap-2 mt-0.5">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2.5 rounded-lg bg-white shadow-2xs border text-xs ${
                  alert.type === 'danger' ? 'border-red-100' : 'border-amber-100'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    alert.type === 'danger' ? 'bg-red-600' : 'bg-amber-500'
                  }`}
                />
                <span
                  className={`font-bold ${
                    alert.type === 'danger' ? 'text-red-700' : 'text-amber-800'
                  }`}
                >
                  {alert.title}:
                </span>
                <span className="text-slate-800 font-medium">{alert.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PARA CADASTRO / EDIÇÃO RÁPIDA DE ALERTAS NA TELA DE ATENDIMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Cadastrar Alertas Médicos & Anamnese
                  </h3>
                  {patientName && (
                    <p className="text-xs text-slate-500">Paciente: {patientName}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Campo 1: Alergias Medicamentosas */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <label htmlFor="allergies-input">
                    Alergias a Medicamentos / Substâncias (Alerta Vermelho):
                  </label>
                </div>
                <input
                  id="allergies-input"
                  type="text"
                  value={tempAllergies}
                  onChange={(e) => setTempAllergies(e.target.value)}
                  placeholder="Ex: Alergia a Penicilina, Dipirona, Látex..."
                  className="w-full px-3 py-2 bg-rose-50/30 border border-rose-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
                />
                {/* Chips rápidos */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Atalhos rápidos:</span>
                  {['Penicilina', 'Dipirona', 'AAS', 'Látex', 'Iodo', 'Anti-inflamatórios'].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => addAllergyChip(chip)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                      >
                        + {chip}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Campo 2: Condições Médicas */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                  <label htmlFor="clinical-notes-input">
                    Condições Médicas / Crônicas (Alerta Amarelo):
                  </label>
                </div>
                <textarea
                  id="clinical-notes-input"
                  rows={2}
                  value={tempClinicalNotes}
                  onChange={(e) => setTempClinicalNotes(e.target.value)}
                  placeholder="Ex: Hipertensão leve controlada, Diabetes Tipo 2, Gestante 2º trimestre..."
                  className="w-full px-3 py-2 bg-amber-50/30 border border-amber-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none resize-none"
                />
                {/* Chips rápidos */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Atalhos rápidos:</span>
                  {[
                    'Hipertensão leve controlada',
                    'Diabetes Tipo 2',
                    'Cardiopata',
                    'Gestante',
                    'Asma',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => addConditionChip(chip)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rodapé de Ações */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#005F73] hover:bg-[#0A9396] text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alertas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};