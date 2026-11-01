import React, { useState } from 'react';
import { X, FileSpreadsheet, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface BudgetItem {
  id: string;
  procedure: string;
  qty: number;
  unitPrice: number;
}

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [patient, setPatient] = useState('Mariana Silva');
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [paymentPlan, setPaymentPlan] = useState('3x sem juros (Cartão)');
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', procedure: 'Clareamento a Laser', qty: 1, unitPrice: 850 },
    { id: '2', procedure: 'Restauração em Resina (Dente 16)', qty: 1, unitPrice: 280 }
  ]);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        procedure: 'Limpeza & Profilaxia',
        qty: 1,
        unitPrice: 220
      }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BudgetItem, val: any) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: val } : item)));
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.unitPrice * curr.qty, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient.trim()) {
      toast.warning('Campo obrigatório', 'Informe o nome do paciente para o orçamento.');
      return;
    }
    if (items.length === 0) {
      toast.warning('Sem itens', 'Adicione pelo menos um procedimento ao orçamento.');
      return;
    }
    setIsSaved(true);
    toast.success('Orçamento gerado!', `Orçamento de R$ ${total.toFixed(2)} criado para ${patient}.`);
    setTimeout(() => {
      setIsSaved(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#005F73] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">Novo Orçamento Odontológico</h3>
              <p className="text-xs text-cyan-100">Proposta de tratamento e plano financeiro</p>
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
            <h4 className="text-lg font-bold text-slate-900">Orçamento Gerado com Sucesso!</h4>
            <p className="text-sm text-slate-500 mt-1">Disponibilizado para impressão e envio ao WhatsApp do paciente.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
            <div className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paciente Vinculado</label>
                <select
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F73] bg-white"
                >
                  <option>Mariana Silva (#4092)</option>
                  <option>Carlos Eduardo Santos (#3821)</option>
                  <option>Beatriz Lima (#4105)</option>
                  <option>Lucas Mendes (#3940)</option>
                  <option>Fernanda Oliveira (#4112)</option>
                </select>
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Itens do Plano de Tratamento</span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#005F73] hover:text-[#0A9396] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Procedimento
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/70">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-slate-400 w-5 text-center">#{idx + 1}</span>
                      <input
                        type="text"
                        value={item.procedure}
                        onChange={(e) => updateItem(item.id, 'procedure', e.target.value)}
                        placeholder="Nome do procedimento"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-[#005F73]"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500">Qtd:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                            className="w-14 px-2 py-1.5 text-xs rounded border border-slate-300 text-center"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500">R$:</span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1.5 text-xs rounded border border-slate-300 text-right font-medium"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-rose-600 hover:opacity-80 transition-opacity cursor-pointer"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forma de Pagamento e Desconto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condição de Pagamento</label>
                  <select
                    value={paymentPlan}
                    onChange={(e) => setPaymentPlan(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#005F73] bg-white"
                  >
                    <option>À vista com 5% de desconto (Pix/Dinheiro)</option>
                    <option>3x sem juros (Cartão)</option>
                    <option>6x com acréscimo (Cartão)</option>
                    <option>Boleto bancário parcelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Desconto Concedido (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
                  />
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal bruto:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                  <span>Desconto ({discountPercent}%):</span>
                  <span>- R$ {discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total do Orçamento:</span>
                  <span className="text-base text-[#005F73]">R$ {total.toFixed(2)}</span>
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
                Gerar Orçamento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
