import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  User,
  CheckCircle2,
  Calendar,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';

export interface ItemRepasse {
  id: string;
  data: string;
  pacienteNome: string;
  dentistaNome: string;
  procedimento: string;
  valorTratamento: number;
  percentualComissao: number; // ex: 45
  deducaoLaboratorio: number;
  valorRepasseLiquido: number;
  status: 'Liberado' | 'Liquidado' | 'Aguardando Pagto Paciente';
}

const INITIAL_REPASSES: ItemRepasse[] = [
  {
    id: 'REP-001',
    data: '25/10/2026',
    pacienteNome: 'Mariana Rios',
    dentistaNome: 'Dr. Frankisney Souza',
    procedimento: 'Instalação de Implante Hexágono Externo #21',
    valorTratamento: 2200.0,
    percentualComissao: 50,
    deducaoLaboratorio: 380.0,
    valorRepasseLiquido: 910.0, // (2200 - 380) * 0.50
    status: 'Liberado',
  },
  {
    id: 'REP-002',
    data: '24/10/2026',
    pacienteNome: 'Carlos Eduardo Rocha',
    dentistaNome: 'Dr. Frankisney Souza',
    procedimento: 'Placa Miorrelaxante de Bruxismo',
    valorTratamento: 650.0,
    percentualComissao: 40,
    deducaoLaboratorio: 150.0,
    valorRepasseLiquido: 200.0, // (650 - 150) * 0.40
    status: 'Liquidado',
  },
  {
    id: 'REP-003',
    data: '22/10/2026',
    pacienteNome: 'Beatriz Lemos',
    dentistaNome: 'Dra. Camila Ribeiro',
    procedimento: 'Instalação de Aparelho Autoligado Metálico',
    valorTratamento: 1400.0,
    percentualComissao: 45,
    deducaoLaboratorio: 0.0,
    valorRepasseLiquido: 630.0,
    status: 'Liberado',
  },
  {
    id: 'REP-004',
    data: '20/10/2026',
    pacienteNome: 'Pedro Alcantara',
    dentistaNome: 'Dra. Camila Ribeiro',
    procedimento: 'Manutenção Ortodôntica Mensal',
    valorTratamento: 180.0,
    percentualComissao: 50,
    deducaoLaboratorio: 0.0,
    valorRepasseLiquido: 90.0,
    status: 'Liquidado',
  },
  {
    id: 'REP-005',
    data: '18/10/2026',
    pacienteNome: 'Juliana Castro',
    dentistaNome: 'Dr. Lucas Ferreira',
    procedimento: 'Tratamento Endodôntico Molar #16 (3 Canais)',
    valorTratamento: 950.0,
    percentualComissao: 50,
    deducaoLaboratorio: 0.0,
    valorRepasseLiquido: 475.0,
    status: 'Liberado',
  },
];

export const RepassesComissoesTab: React.FC = () => {
  const [repasses, setRepasses] = useState<ItemRepasse[]>(INITIAL_REPASSES);
  const [dentistaSelecionado, setDentistaSelecionado] = useState<string>('Todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('Todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLiquidarRepasse = (id: string) => {
    setRepasses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Liquidado' } : r))
    );
    showToast('Repasse marcado como Liquidado com comprovante gerado!');
  };

  const handleLiquidarTodos = () => {
    setRepasses((prev) =>
      prev.map((r) =>
        (dentistaSelecionado === 'Todos' || r.dentistaNome === dentistaSelecionado) &&
        r.status === 'Liberado'
          ? { ...r, status: 'Liquidado' }
          : r
      )
    );
    showToast('Todos os repasses liberados do profissional foram liquidados!');
  };

  const repassesFiltrados = useMemo(() => {
    return repasses.filter((item) => {
      const matchDentista =
        dentistaSelecionado === 'Todos' || item.dentistaNome === dentistaSelecionado;
      const matchStatus = statusFiltro === 'Todos' || item.status === statusFiltro;
      return matchDentista && matchStatus;
    });
  }, [repasses, dentistaSelecionado, statusFiltro]);

  // Métricas
  const totalFaturadoTratamentos = repassesFiltrados.reduce(
    (acc, curr) => acc + curr.valorTratamento,
    0
  );
  const totalCustosLab = repassesFiltrados.reduce(
    (acc, curr) => acc + curr.deducaoLaboratorio,
    0
  );
  const totalLiberadoParaRepasse = repassesFiltrados
    .filter((r) => r.status === 'Liberado')
    .reduce((acc, curr) => acc + curr.valorRepasseLiquido, 0);
  const totalJaLiquidado = repassesFiltrados
    .filter((r) => r.status === 'Liquidado')
    .reduce((acc, curr) => acc + curr.valorRepasseLiquido, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#005F73] text-white shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#89f3f6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header do Submódulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Comissões &amp; Repasses a Cirurgiões-Dentistas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cálculo automatizado por produção e liquidação, com dedução transparente de custos protéticos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={dentistaSelecionado}
            onChange={(e) => setDentistaSelecionado(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 cursor-pointer"
          >
            <option value="Todos">Profissional: Todos</option>
            <option value="Dr. Frankisney Souza">Dr. Frankisney Souza (RT)</option>
            <option value="Dra. Camila Ribeiro">Dra. Camila Ribeiro (Orto)</option>
            <option value="Dr. Lucas Ferreira">Dr. Lucas Ferreira (Endo)</option>
          </select>

          <button
            onClick={handleLiquidarTodos}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Liquidar Repasses Liberados</span>
          </button>
        </div>
      </div>

      {/* 2. Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
            Produção Bruta Gerada
          </span>
          <span className="text-2xl font-bold text-slate-900">
            R$ {totalFaturadoTratamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Tratamentos finalizados</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
            Custos Protéticos Dedutíveis
          </span>
          <span className="text-2xl font-bold text-slate-700">
            R$ {totalCustosLab.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Boletos de laboratórios</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
            Liberado para Pagamento
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#005F73]">
              R$ {totalLiberadoParaRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Pendente
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">A transferir via Pix</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
            Total Já Liquidado no Mês
          </span>
          <span className="text-2xl font-bold text-emerald-600">
            R$ {totalJaLiquidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Comprovantes assinados</span>
        </div>
      </div>

      {/* 3. Tabela de Repasses */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Extrato Individual de Procedimentos Executados
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              {repassesFiltrados.length} lançamentos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="Todos">Status: Todos</option>
              <option value="Liberado">Liberado</option>
              <option value="Liquidado">Liquidado</option>
              <option value="Aguardando Pagto Paciente">Aguardando Pagto</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Dentista</th>
                <th className="py-3 px-4">Paciente & Procedimento</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">% Repasse</th>
                <th className="py-3 px-4 text-right">Dedução Lab</th>
                <th className="py-3 px-4 text-right">Líquido do Profissional</th>
                <th className="py-3 px-4 text-center">Situação</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repassesFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium text-xs">
                    {item.data}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-[#005F73] text-xs">{item.dentistaNome}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-xs">
                        {item.pacienteNome}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.procedimento}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap font-medium text-slate-700">
                    R$ {item.valorTratamento.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-slate-800">
                    {item.percentualComissao}%
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap text-rose-600 text-xs">
                    {item.deducaoLaboratorio > 0
                      ? `- R$ ${item.deducaoLaboratorio.toFixed(2)}`
                      : 'R$ 0,00'}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap font-extrabold text-emerald-700 text-sm">
                    R$ {item.valorRepasseLiquido.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {item.status === 'Liquidado' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Liquidado
                      </span>
                    ) : item.status === 'Liberado' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        Liberado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Pendente
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {item.status === 'Liberado' ? (
                      <button
                        onClick={() => handleLiquidarRepasse(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Pagar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          window.print();
                          showToast('Imprimindo recibo de honorários odontológicos...');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#005F73] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Imprimir Recibo de Honorários"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
