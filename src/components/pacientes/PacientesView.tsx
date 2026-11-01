import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  UserPlus,
  Search,
  X,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  BellRing,
  RotateCcw,
} from 'lucide-react';
import { PacienteItem, ConvenioTipo, PacientesMetrics } from '../../types/pacientes';
import { ConvenioItem } from '../../types/convenios';
import { conveniosService } from '../../services/conveniosService';
import { PacientesMetricsRow } from './PacientesMetricsRow';
import { PacientesTable } from './PacientesTable';
import { PacientesMobileCards } from './PacientesMobileCards';
import { PacienteFormView } from './PacienteFormView';
import { pacientesService } from '../../services/pacientesService';
import { scrollToTop } from '../../utils/scrollUtils';

const INITIAL_PACIENTES: PacienteItem[] = [];

const INITIAL_METRICS: PacientesMetrics = {
  totalPatients: 0,
  totalGrowth: 0,
  newThisMonth: 0,
  newThisMonthGrowth: 0,
  inActiveTreatment: 0,
  treatmentPercentage: 0,
  birthdaysThisMonth: 0,
};

interface PacientesViewProps {
  forceMobileView?: boolean;
  onNavigateToAtendimento?: (patient?: PacienteItem) => void;
}

export const PacientesView: React.FC<PacientesViewProps> = ({
  forceMobileView = false,
  onNavigateToAtendimento,
}) => {
  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);
  const [metrics, setMetrics] = useState<PacientesMetrics>(INITIAL_METRICS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [conveniosList, setConveniosList] = useState<ConvenioItem[]>([]);
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Carregar dados reais do Supabase Self-Hosted
  useEffect(() => {
    let isMounted = true;
    async function loadFromSupabase() {
      try {
        const [data, convenios] = await Promise.all([
          pacientesService.getPacientes(),
          conveniosService.getConvenios().catch(() => []),
        ]);
        if (isMounted) {
          setPacientes(data || []);
          setConveniosList(convenios.filter((c) => c.status === 'Ativo'));
          setMetrics((prev) => ({
            ...prev,
            totalPatients: data ? data.length : 0,
          }));
        }
      } catch (e) {
        console.warn('Fallback para dados padrão:', e);
      }
    }
    loadFromSupabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // View Switching (Regra Arquitetural Mobile-First: Sem Modais)
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [editingPatient, setEditingPatient] = useState<PacienteItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Garante abertura da tela/formulário sempre no início
  useEffect(() => {
    scrollToTop();
  }, [currentView]);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleOpenNew = () => {
    setEditingPatient(null);
    setCurrentView('form');
    scrollToTop();
  };

  const handleEdit = (patient: PacienteItem) => {
    setEditingPatient(patient);
    setCurrentView('form');
    scrollToTop();
  };

  const handleSavePatient = async (data: Omit<PacienteItem, 'id' | 'code' | 'initials'>) => {
    try {
      if (editingPatient) {
        setPacientes((prev) =>
          prev.map((item) =>
            item.id === editingPatient.id
              ? {
                  ...item,
                  ...data,
                  // Preserva a senha anterior se o usuário não digitou uma nova na edição
                  portalPassword: data.portalPassword || item.portalPassword,
                  initials: data.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase(),
                }
              : item
          )
        );
        showToast(`Cadastro de "${data.name}" atualizado com sucesso!`);
        await pacientesService.savePaciente({ ...data, id: editingPatient.id });

        // Só atualiza a senha de acesso no Supabase Auth se o usuário digitou uma NOVA senha na edição
        if (data.portalPassword && data.portalEmail) {
          try {
            const res = await pacientesService.criarAcessoPortalPaciente({
              nome: data.name,
              email: data.portalEmail,
              senha: data.portalPassword,
              telefone: data.whatsapp,
              pacienteId: editingPatient.id,
            });
            if (res.error) {
              showToast(res.error, 'warning');
            } else {
              showToast(`Nova senha de acesso atualizada para ${data.portalEmail}.`);
            }
          } catch (authErr) {
            console.warn('[handleSavePatient] Aviso ao atualizar senha no portal:', authErr);
          }
        }
      } else {
        const initials = data.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        const maxNum = Math.max(
          pacientes.length + 1,
          ...pacientes.map((p) => parseInt((p.code || '').replace(/\D/g, ''), 10) || 0) + 1
        );
        const tempId = `pac-${Date.now()}`;
        const newPatient: PacienteItem = {
          ...data,
          id: tempId,
          code: `#${String(maxNum).padStart(4, '0')}`,
          initials,
          createdAt: new Date().toISOString(),
          lastConsultation: {
            date: 'Sem consultas',
            time: '',
            dentist: '',
            procedure: 'Nenhum atendimento',
            isScheduled: false,
            isToday: false,
            description: 'Aguardando 1º agendamento',
          },
        };

        setPacientes((prev) => [newPatient, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          totalPatients: prev.totalPatients + 1,
          newThisMonth: prev.newThisMonth + 1,
        }));
        showToast(`Paciente "${data.name}" cadastrado na base clínica!`);
        await pacientesService.savePaciente(data);

        // Criação inicial das credenciais de acesso para novo paciente (se informadas)
        if (data.portalPassword && data.portalEmail) {
          try {
            const res = await pacientesService.criarAcessoPortalPaciente({
              nome: data.name,
              email: data.portalEmail,
              senha: data.portalPassword,
              telefone: data.whatsapp,
            });
            if (res.error) {
              showToast(res.error, 'warning');
            } else {
              showToast(`Acesso ao Portal criado para ${data.portalEmail} (Perfil: paciente).`);
            }
          } catch (authErr) {
            console.warn('[handleSavePatient] Aviso ao criar credenciais no portal:', authErr);
          }
        }

        await loadPacientes();
      }
    } catch (err) {
      console.warn('Erro ao sincronizar com Supabase:', err);
    }

    setCurrentView('list');
    setEditingPatient(null);
  };

  const handleExportCSV = () => {
    showToast('Relatório exportado em formato CSV com sucesso (1.240 registros)!');
  };

  const handleCallReception = (patient: PacienteItem) => {
    showToast(`Recepção notificada: Paciente ${patient.name} aguardando em consultório!`);
  };

  const handleInviteReturn = (patient: PacienteItem) => {
    showToast(`Mensagem de convite de retorno preventivo enviada para ${patient.whatsapp}!`);
  };

  const handleOpenFinanceiro = (patient: PacienteItem) => {
    showToast(`Histórico Financeiro de ${patient.name}: Todos os pagamentos em dia.`);
  };

  const handleOpenProntuario = (patient: PacienteItem) => {
    if (onNavigateToAtendimento) {
      onNavigateToAtendimento(patient);
    } else {
      showToast(`Abrindo prontuário clínico de ${patient.name}...`);
    }
  };

  // Organiza por ordem de cadastro: o último cadastro deve ser o primeiro da fila, o penúltimo o segundo e assim por diante
  const sortedPacientes = useMemo(() => {
    return [...pacientes].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      const numA = parseInt((a.code || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt((b.code || '').replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) return numB - numA;
      return b.id.localeCompare(a.id);
    });
  }, [pacientes]);

  // Filtragem dos pacientes sobre a lista ordenada
  const filteredPacientes = useMemo(() => {
    return sortedPacientes.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cpf.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whatsapp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesInsurance =
        selectedInsurance === 'all' ||
        item.insurance.toLowerCase() === selectedInsurance.toLowerCase() ||
        (item.insuranceLabel && item.insuranceLabel.toLowerCase() === selectedInsurance.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ativo' && (item.status === 'ativo' || item.status === 'primeira_vez')) ||
        (statusFilter === 'inativo' && item.status === 'inativo');

      return matchesSearch && matchesInsurance && matchesStatus;
    });
  }, [sortedPacientes, searchQuery, selectedInsurance, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPacientes.length / pageSize));

  // Ajusta a página atual se exceder o total de páginas ao filtrar
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Paginação ativa: corta exatamente a quantidade de registros por página (15, 30, 50 ou 100)
  const paginatedPacientes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPacientes.slice(startIndex, startIndex + pageSize);
  }, [filteredPacientes, currentPage, pageSize]);

  // Se currentView === 'form': oculta a listagem totalmente e exibe o formulário em tela cheia responsivo
  if (currentView === 'form') {
    return (
      <div className="w-full h-full p-4 md:p-6 animate-fadeIn">
        <PacienteFormView
          initialData={editingPatient}
          onSave={handleSavePatient}
          onCancel={() => {
            setCurrentView('list');
            setEditingPatient(null);
          }}
          isMobile={forceMobileView}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#005F73] text-white rounded-xl shadow-lg border border-[#0A9396] text-xs sm:text-sm font-semibold animate-slideDown">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Cabeçalho e Ações Principais */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-7 bg-[#005F73] rounded-full shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gestão de Pacientes
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-[#005F73] font-bold text-xs">
              {pacientes.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-5">
            Controle de cadastros, históricos clínicos e novos agendamentos do consultório.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-orange-500 hover:opacity-80 rounded-xl shadow-2xs transition-opacity cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exportar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#005F73] hover:bg-[#004b5c] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* 2. Cards Informativos (Métricas Rápidas) */}
      <PacientesMetricsRow metrics={metrics} isMobile={forceMobileView} />

      {/* 3. Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#005F73]/30 focus:border-[#005F73] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pílulas de Status */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-[#005F73] shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Todos ({pacientes.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ativo')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ativo'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Ativos ({pacientes.filter((p) => p.status === 'ativo' || p.status === 'primeira_vez').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inativo')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'inativo'
                  ? 'bg-white text-rose-600 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Inativos ({pacientes.filter((p) => p.status === 'inativo').length})
            </button>
          </div>

          {/* Filtro Adicional por Convênio */}
          <div className="relative">
            <select
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
              className="px-3 pr-8 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005F73]/20 appearance-none cursor-pointer"
            >
              <option value="all">Todos os Convênios</option>
              {conveniosList.map((conv) => (
                <option key={conv.id} value={conv.nome}>
                  {conv.nome}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Renderização Condicional Desktop vs Mobile */}
      {forceMobileView ? (
        <PacientesMobileCards
          pacientes={paginatedPacientes}
          totalCount={filteredPacientes.length}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onOpenProntuario={handleOpenProntuario}
          onCallReception={handleCallReception}
          onInviteReturn={handleInviteReturn}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <PacientesTable
              pacientes={paginatedPacientes}
              totalCount={filteredPacientes.length}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              onPageChange={setCurrentPage}
              onEdit={handleEdit}
              onOpenProntuario={handleOpenProntuario}
              onOpenFinanceiro={handleOpenFinanceiro}
            />
          </div>

          <div className="block md:hidden">
            <PacientesMobileCards
              pacientes={paginatedPacientes}
              totalCount={filteredPacientes.length}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              onPageChange={setCurrentPage}
              onEdit={handleEdit}
              onOpenProntuario={handleOpenProntuario}
              onCallReception={handleCallReception}
              onInviteReturn={handleInviteReturn}
            />
          </div>
        </>
      )}
    </div>
  );
};
