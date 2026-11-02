import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  Smile,
  UserCheck,
  Layers,
  Lock,
  MessageCircle,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ToothIcon } from '../common/ToothIcon';
import { InstitucionalAgendaSection } from './InstitucionalAgendaSection';
import { avaliacoesService, FALLBACK_AVALIACOES } from '../../services/avaliacoesService';
import { AvaliacaoItem } from '../../types/avaliacoes';

interface InstitucionalViewProps {
  currentUser?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  } | null;
  onLoginSuccess?: (user: { id?: string; email: string; name: string; role: string }) => void;
  onNavigateToPaciente?: () => void;
  onNavigateToAdmin?: () => void;
}

export const InstitucionalView: React.FC<InstitucionalViewProps> = ({
  currentUser,
  onLoginSuccess,
  onNavigateToPaciente,
  onNavigateToAdmin,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [modalLegal, setModalLegal] = useState<'termos' | 'privacidade' | null>(null);
  const [avaliacoesList, setAvaliacoesList] = useState<AvaliacaoItem[]>(FALLBACK_AVALIACOES);

  // Carrega avaliações reais e verificadas do Supabase
  useEffect(() => {
    let isMounted = true;
    avaliacoesService.getAvaliacoesDestaque().then((items) => {
      if (isMounted && items && items.length > 0) {
        setAvaliacoesList(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const getTempoRelativo = (criadoEm?: string) => {
    if (!criadoEm) return 'Recentemente';
    const diffMs = Date.now() - new Date(criadoEm).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    const weeks = Math.floor(diffDays / 7);
    if (weeks < 4) return `Há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    return 'Há mais de 1 ano';
  };

  // Efeito de sombra e background no header ao rolar a página
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const tratamentos = [
    {
      id: 'implantes',
      titulo: 'Implantes & Próteses Dentárias',
      descricao:
        'Recupere a segurança de mastigar e sorrir com implantes guiados e materiais de titânio de alta biocompatibilidade.',
      icone: Layers,
      destaque: 'Tecnologia Guiada',
      duracao: 'Slots de 45 min',
    },
    {
      id: 'estetica',
      titulo: 'Estética & Lentes de Resina',
      descricao:
        'Harmonização anatômica do sorriso com resinas nanoparticuladas e clareamento dental seguro sem hipersensibilidade.',
      icone: Sparkles,
      destaque: 'Resultado Natural',
      duracao: 'Protocolo Personalizado',
    },
    {
      id: 'ortodontia',
      titulo: 'Ortodontia & Alinhadores',
      descricao:
        'Correção precisa de apinhamento e mordida com aparelhos autoligados e alinhadores estéticos discretos.',
      icone: Smile,
      destaque: 'Planejamento Digital',
      duracao: 'Acompanhamento Mensal',
    },
    {
      id: 'endodontia',
      titulo: 'Tratamento de Canal (Sem Dor)',
      descricao:
        'Endodontia mecanizada automatizada com localizador apical eletrônico, permitindo sessões rápidas e confortáveis.',
      icone: ShieldCheck,
      destaque: 'Anestesia Computadorizada',
      duracao: 'Sessão Única',
    },
    {
      id: 'prevencao',
      titulo: 'Profilaxia & Prevenção Periódica',
      descricao:
        'Raspagem com ultrassom cirúrgico, polimento coronário e aplicação tópica de flúor para saúde bucal duradoura.',
      icone: Award,
      destaque: 'Check-up Preventivo',
      duracao: 'Revisão Semestral',
    },
    {
      id: 'cirurgia',
      titulo: 'Extrações & Dentes Sisos',
      descricao:
        'Procedimentos cirúrgicos delicados e com técnicas de preservação óssea e cuidados pós-operatórios acompanhados.',
      icone: HeartHandshake,
      destaque: 'Pós-Operatório Acompanhado',
      duracao: 'Recuperação Rápida',
    },
  ];

  const diferenciais = [
    {
      titulo: 'Convênio da Casa (Sem Mensalidade)',
      descricao:
        'Nosso modelo exclusivo de assistência odontológica direta: você não paga taxas mensais abusivas e usufrui de valores reduzidos e repasse imediato em todos os procedimentos da clínica.',
      badge: 'Exclusivo Odonto Souza',
    },
    {
      titulo: 'Biossegurança & Autoclave Rastreável',
      descricao:
        'Ciclos de esterilização hospitalar monitorados por lote com liberação biológica e química antes de cada atendimento. Sua saúde e segurança em primeiro lugar.',
      badge: 'Padrão Hospitalar',
    },
    {
      titulo: 'Consultas Dedicadas de 45 Minutos',
      descricao:
        'Respeitamos rigorosamente seu tempo. Sem salas de espera lotadas ou atendimentos apressados. Cada paciente conta com dedicação integral do cirurgião-dentista.',
      badge: 'Pontualidade Garantida',
    },
    {
      titulo: 'Área do Paciente Integrada (Online)',
      descricao:
        'Acesse pelo celular seu histórico de consultas, evolução de tratamentos, laudos clínicos e auto-agendamento 24h sem burocracia.',
      badge: 'Tecnologia na Palma da Mão',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#001219] flex flex-col font-sans selection:bg-[#94D2BD] selection:text-[#005F73]">
      {/* ============================================================== */}
      {/* 1. CABEÇALHO FIXO SUPERIOR (NAVBAR INSTITUCIONAL)              */}
      {/* ============================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-3'
            : 'bg-white border-b border-slate-100 py-4 lg:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Marca */}
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#005F73] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl text-[#005F73] leading-tight tracking-tight">
                ODONTO SOUZA
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#0A9396] tracking-wider uppercase">
                Odontologia Integrada & Família
              </span>
            </div>
          </div>

          {/* Menus Desktop */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => scrollToSection('home')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'home' ? 'text-[#005F73]' : 'text-slate-600 hover:text-[#005F73]'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('agenda-online')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'agenda-online' ? 'text-[#005F73]' : 'text-slate-600 hover:text-[#005F73]'
              }`}
            >
              Agenda Online
            </button>
            <button
              onClick={() => scrollToSection('quem-somos')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'quem-somos' ? 'text-[#005F73]' : 'text-slate-600 hover:text-[#005F73]'
              }`}
            >
              Quem Somos
            </button>
            <button
              onClick={() => scrollToSection('tratamentos')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'tratamentos' ? 'text-[#005F73]' : 'text-slate-600 hover:text-[#005F73]'
              }`}
            >
              Tratamentos
            </button>
            <button
              onClick={() => scrollToSection('avaliacoes')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'avaliacoes' ? 'text-[#005F73]' : 'text-slate-600 hover:text-[#005F73]'
              }`}
            >
              Avaliações
            </button>
            <button
              onClick={() => scrollToSection('diferenciais')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'diferenciais' ? 'text-[#005F73]' : 'text-slate-600 hover:text-[#005F73]'
              }`}
            >
              Diferenciais
            </button>
            <button
              onClick={() => scrollToSection('contato')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === 'contato' ? 'text-[#005F73]' : 'text-slate-600 hover:text-[#005F73]'
              }`}
            >
              Contato
            </button>
          </nav>

          {/* Ações Direitas (Área do Paciente + Agendar) */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToPaciente) onNavigateToPaciente();
                else window.location.href = '/minhaconta';
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#005F73] bg-[#005F73]/5 hover:bg-[#005F73]/10 border border-[#005F73]/20 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#0A9396]" />
              <span>Área do Paciente</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('contato')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#005F73] hover:bg-[#004756] shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#94D2BD]" />
              <span>Agendar Consulta</span>
            </button>
          </div>

          {/* Botão Hambúrguer Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToPaciente) onNavigateToPaciente();
                else window.location.href = '/minhaconta';
              }}
              className="p-2 text-[#005F73] bg-[#005F73]/5 rounded-lg border border-[#005F73]/20 sm:hidden"
              title="Área do Paciente"
            >
              <UserCheck className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-[#005F73] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Drawer Mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => scrollToSection('home')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#005F73]"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('agenda-online')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-[#005F73] bg-[#005F73]/5 hover:bg-[#005F73]/10"
              >
                Agenda Online (Horários)
              </button>
              <button
                onClick={() => scrollToSection('quem-somos')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#005F73]"
              >
                Quem Somos
              </button>
              <button
                onClick={() => scrollToSection('tratamentos')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#005F73]"
              >
                Tratamentos
              </button>
              <button
                onClick={() => scrollToSection('avaliacoes')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#005F73]"
              >
                Avaliações (Google 5.0 ⭐)
              </button>
              <button
                onClick={() => scrollToSection('diferenciais')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#005F73]"
              >
                Diferenciais & Convênio da Casa
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#005F73]"
              >
                Contato & Endereço
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigateToPaciente) onNavigateToPaciente();
                  else window.location.href = '/minhaconta';
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-[#005F73] bg-[#005F73]/10 border border-[#005F73]/20"
              >
                <UserCheck className="w-4 h-4 text-[#0A9396]" />
                <span>Acessar Área do Paciente (/minhaconta)</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('contato')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm text-white bg-[#005F73] shadow-md"
              >
                <Calendar className="w-4 h-4 text-[#94D2BD]" />
                <span>Agendar Consulta</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Espaçador para compensar header fixo */}
      <div className="h-16 lg:h-20" />

      {/* ============================================================== */}
      {/* 2. HERO SECTION (BANNER PRINCIPAL)                             */}
      {/* ============================================================== */}
      <section id="home" className="relative overflow-hidden bg-white border-b border-slate-100 py-12 lg:py-20">
        {/* Elemento Gráfico de Fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#94D2BD]/20 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0A9396]/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Coluna Texto (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge de Destaque */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#005F73]/10 border border-[#005F73]/20 text-[#005F73] text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0A9396]" />
                <span>Atendimento de Excelência & Acolhimento Familiar</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#001219] tracking-tight leading-tight sm:leading-none">
                O sorriso que você sempre sonhou, com o{' '}
                <span className="text-[#005F73] underline decoration-[#0A9396] decoration-4 underline-offset-4">
                  cuidado e precisão
                </span>{' '}
                que você merece.
              </h1>

              {/* Parágrafo de Apoio */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Na <strong className="text-[#005F73] font-bold">Odonto Souza</strong>, unimos tecnologia odontológica
                de ponta, rigorosa biossegurança e consultas dedicadas de 45 minutos. Cuidamos do seu sorriso sem pressa,
                com tratamentos sem dor e condições acessíveis com o nosso{' '}
                <strong className="text-[#0A9396] font-bold">Convênio da Casa sem mensalidade</strong>.
              </p>

              {/* Badges de Confiança */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-3 py-2 rounded-xl border border-slate-200">
                  <Star className="w-4 h-4 text-[#EE9B00] fill-[#EE9B00]" />
                  <span>5.0 Estrelas no Google</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-3 py-2 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-[#005F73]" />
                  <span>Biossegurança Hospitalar</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-3 py-2 rounded-xl border border-slate-200">
                  <Clock className="w-4 h-4 text-[#0A9396]" />
                  <span>Pontualidade Britânica</span>
                </div>
              </div>

              {/* Botões de Ação do Hero */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollToSection('agenda-online')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-sm sm:text-base text-white bg-[#005F73] hover:bg-[#004756] shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-5 h-5 text-[#94D2BD]" />
                  <span>Ver Horários & Agendar Consulta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('quem-somos')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Conhecer Nossa Clínica</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Coluna Imagem / Card Destaque (5 cols) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md bg-gradient-to-br from-[#005F73] to-[#0A9396] p-1.5 rounded-3xl shadow-xl">
                <div className="bg-white rounded-[22px] p-6 sm:p-7 space-y-6">
                  {/* Foto de Destaque da Clínica */}
                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
                      alt="Consultório Odontológico Odonto Souza"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-[#005F73]">
                      <ToothIcon className="w-3.5 h-3.5 text-[#0A9396]" />
                      <span>Consultório Principal</span>
                    </div>
                  </div>

                  {/* Resumo Rápido da Experiência */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500 font-medium">Responsável Técnico</span>
                      <span className="text-xs font-bold text-slate-800">Dr. Frankisney Souza (CRO-SP 78.432)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500 font-medium">Tempo de Consulta</span>
                      <span className="text-xs font-bold text-[#005F73]">45 Minutos Padronizados</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Convênio da Casa</span>
                      <span className="text-xs font-bold text-emerald-600">Sem Mensalidade (R$ 0,00)</span>
                    </div>
                  </div>

                  {/* Callout de Avaliação */}
                  <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EE9B00]/15 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-[#EE9B00] fill-[#EE9B00]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Avaliação Máxima no Google</p>
                      <p className="text-[11px] text-slate-500">Mais de centenas de sorrisos transformados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2.5 AGENDA CLÍNICA ONLINE (INTEGRADA COM CONTROLE DE ACESSO)  */}
      {/* ============================================================== */}
      <InstitucionalAgendaSection
        currentUser={currentUser}
        onLoginSuccess={onLoginSuccess}
        onNavigateToPaciente={onNavigateToPaciente}
      />

      {/* ============================================================== */}
      {/* 3. BENTO STATS (NÚMEROS QUE GERAM CONFIANÇA)                  */}
      {/* ============================================================== */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-[#005F73]">+5.000</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Pacientes Atendidos</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-[#0A9396]">100%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Instrumental Esterilizado</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-[#EE9B00]">5.0 ★</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Nota Google Reviews</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">R$ 0,00</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Mensalidade no Plano Próprio</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. QUEM SOMOS                                                  */}
      {/* ============================================================== */}
      <section id="quem-somos" className="py-16 lg:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Imagem do Cirurgião / Consultório */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border-4 border-slate-100 shadow-xl aspect-4/5 bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80"
                  alt="Dr. Frankisney Souza - Responsável Técnico Odonto Souza"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-6 text-white">
                  <p className="font-extrabold text-lg text-white">Dr. Frankisney Souza</p>
                  <p className="text-xs text-[#94D2BD] font-semibold mt-0.5">
                    Cirurgião-Dentista • Responsável Técnico (CRO-SP 78.432)
                  </p>
                  <p className="text-[11px] text-slate-200 mt-2">
                    Dedicação clínica continuada, especialista em reabilitação oral e odontologia preventiva.
                  </p>
                </div>
              </div>
            </div>

            {/* Conteúdo Institucional */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005F73]/10 text-[#005F73] text-xs font-bold">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Nossa Filosofia de Cuidado</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#001219] tracking-tight">
                Mais do que tratamentos odontológicos: construímos relacionamentos de confiança para toda a vida.
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Fundada com a premissa de que ir ao dentista deve ser uma experiência tranquila, acolhedora e previsível,
                a <strong className="text-[#005F73]">Odonto Souza</strong> nasceu para transformar o conceito de saúde
                bucal na região.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-slate-800">Atendimento Individualizado:</strong>
                    <span className="text-sm text-slate-600 block mt-0.5">
                      Não trabalhamos com atendimentos em série. Cada paciente tem 45 minutos exclusivos de atenção
                      clínica com o cirurgião-dentista.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-slate-800">Transparência em Cada Orçamento:</strong>
                    <span className="text-sm text-slate-600 block mt-0.5">
                      Explicação didática de cada fase clínica com apoio visual de odontograma digital e sem surpresas no
                      fechamento financeiro.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#005F73]/10 text-[#005F73] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-slate-800">Acesso Democrático com o Convênio da Casa:</strong>
                    <span className="text-sm text-slate-600 block mt-0.5">
                      Facilitamos o acesso à odontologia de ponta sem cobrar mensalidades ou taxas de adesão.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => scrollToSection('contato')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-[#005F73] bg-[#005F73]/10 hover:bg-[#005F73]/15 transition-colors cursor-pointer"
                >
                  <span>Falar com o Doutor no WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. NOSSOS TRATAMENTOS & ESPECIALIDADES                          */}
      {/* ============================================================== */}
      <section id="tratamentos" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da Seção */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A9396]/10 text-[#0A9396] text-xs font-bold">
              <ToothIcon className="w-3.5 h-3.5" />
              <span>Especialidades Odontológicas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#001219] tracking-tight">
              Tratamentos modernos para transformar e proteger o seu sorriso
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Da prevenção básica aos procedimentos cirúrgicos complexos, oferecemos todo o cuidado bucal em um só lugar.
            </p>
          </div>

          {/* Grid de Tratamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tratamentos.map((item) => {
              const IconComp = item.icone;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#005F73]/40 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#005F73]/10 text-[#005F73] group-hover:bg-[#005F73] group-hover:text-white transition-colors flex items-center justify-center">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-[#0A9396] bg-[#0A9396]/10 px-2.5 py-1 rounded-full">
                        {item.destaque}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#005F73] transition-colors">
                        {item.titulo}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {item.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">{item.duracao}</span>
                    <button
                      type="button"
                      onClick={() => scrollToSection('contato')}
                      className="text-xs font-bold text-[#005F73] group-hover:translate-x-1 transition-transform flex items-center gap-1 cursor-pointer"
                    >
                      <span>Saber Mais</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. AVALIAÇÕES & DEPOIMENTOS (GOOGLE REVIEWS 5.0 ⭐)             */}
      {/* ============================================================== */}
      <section id="avaliacoes" className="py-16 lg:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de Avaliações com Card Google */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EE9B00]/10 text-[#EE9B00] text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#EE9B00]" />
                <span>Avaliações Reais de Pacientes</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#001219] tracking-tight">
                O que dizem as pessoas que confiam o sorriso à Odonto Souza
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                A satisfação dos nossos pacientes é a nossa maior recompensa diária.
              </p>
            </div>

            {/* Selo Google */}
            <div className="bg-[#F8F9FA] border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xl text-[#005F73] shadow-xs">
                G
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#EE9B00]">
                  <Star className="w-4 h-4 fill-[#EE9B00]" />
                  <Star className="w-4 h-4 fill-[#EE9B00]" />
                  <Star className="w-4 h-4 fill-[#EE9B00]" />
                  <Star className="w-4 h-4 fill-[#EE9B00]" />
                  <Star className="w-4 h-4 fill-[#EE9B00]" />
                  <span className="text-xs font-black text-slate-900 ml-1">5.0 / 5.0</span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-0.5">Google Avaliações Verificadas</p>
                <p className="text-[11px] text-slate-500">100% de recomendações positivas</p>
              </div>
            </div>
          </div>

          {/* Grid de Depoimentos Reais dos Pacientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {avaliacoesList.map((av) => (
              <div
                key={av.id}
                className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200"
              >
                <div className="space-y-3">
                  {/* Estrelas */}
                  <div className="flex items-center gap-1 text-[#EE9B00]">
                    {[...Array(Math.max(1, Math.min(5, av.nota || 5)))].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#EE9B00]" />
                    ))}
                  </div>

                  {/* Depoimento */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{av.comentario}"
                  </p>
                </div>

                {/* Paciente */}
                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center gap-3">
                  {av.foto_url ? (
                    <img
                      src={av.foto_url}
                      alt={av.nome_paciente}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#005F73]/10 text-[#005F73] font-bold text-xs flex items-center justify-center border border-[#005F73]/20 shrink-0">
                      {av.nome_paciente.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{av.nome_paciente}</p>
                    <p className="text-[11px] text-[#005F73] font-semibold truncate">
                      {av.canal === 'whatsapp' ? 'Avaliação via WhatsApp' : 'Paciente Verificado'}
                    </p>
                    <span className="text-[10px] text-slate-400">{getTempoRelativo(av.criado_em)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. DIFERENCIAIS & CONVÊNIO DA CASA (SEM MENSALIDADE)          */}
      {/* ============================================================== */}
      <section id="diferenciais" className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#005F73] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            {/* Decorações sutis de fundo */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#0A9396]/30 rounded-full blur-3xl -z-0 translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#94D2BD]/20 rounded-full blur-3xl -z-0 -translate-x-1/4 translate-y-1/4" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Texto do Diferencial */}
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[#94D2BD] text-xs font-bold border border-white/15">
                  <Award className="w-3.5 h-3.5" />
                  <span>Diferencial Inédito na Região</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  Conheça o Convênio da Casa Odonto Souza: Odontologia de alta qualidade, sem taxa mensal.
                </h2>

                <p className="text-sm sm:text-base text-cyan-100 font-normal leading-relaxed">
                  Criamos um modelo direto entre a clínica e a sua família. Sem carência, sem planos terceirizados e
                  sem pagar por aquilo que você não usa. Você agenda, é atendido no melhor padrão técnico e conta com
                  valores acessíveis e repasse imediato.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#94D2BD]" />
                    <span>Mensalidade R$ 0,00</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#94D2BD]" />
                    <span>Sem Carência</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#94D2BD]" />
                    <span>Extensivo à Família</span>
                  </span>
                </div>
              </div>

              {/* Card Destaque Rápido */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="font-extrabold text-base text-[#005F73]">Tabela Convênio da Casa</h4>
                      <p className="text-xs text-slate-500">Ativa em todas as especialidades</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-extrabold">
                      ATIVO
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0A9396] shrink-0" />
                      <span>Avaliação inicial e planejamento cortesia</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0A9396] shrink-0" />
                      <span>Descontos especiais em resinas e clareamento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0A9396] shrink-0" />
                      <span>Valores facilitados em próteses e implantes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0A9396] shrink-0" />
                      <span>Acesso imediato no primeiro atendimento</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => scrollToSection('contato')}
                    className="w-full py-3 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-[#005F73] hover:bg-[#004756] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Quero Atendimento pelo Convênio da Casa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Diferenciais Técnicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {diferenciais.map((dif, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
                <span className="inline-block text-[11px] font-bold text-[#005F73] bg-[#005F73]/10 px-2.5 py-1 rounded-md">
                  {dif.badge}
                </span>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">{dif.titulo}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{dif.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. CONTATO, HORÁRIOS & LOCALIZAÇÃO                             */}
      {/* ============================================================== */}
      <section id="contato" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Informações da Clínica (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005F73]/10 text-[#005F73] text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Localização & Atendimento</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#001219] tracking-tight">
                Estamos prontos para receber você e sua família.
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Entre em contato pelo WhatsApp para tirar dúvidas, agendar sua consulta ou conhecer a clínica pessoalmente.
              </p>

              {/* Cards de Contato */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-[#005F73] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">WhatsApp & Telefone Oficial</p>
                    <a
                      href="https://wa.me/5566992544324"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm sm:text-base font-bold text-[#005F73] hover:underline"
                    >
                      (66) 99254-4324
                    </a>
                    <p className="text-[11px] text-slate-500 mt-0.5">Resposta rápida com confirmação de horário</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-[#0A9396] text-white flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Horário de Funcionamento</p>
                    <p className="text-sm sm:text-base font-bold text-slate-800">
                      Segunda a Sexta: 08:00 às 19:15
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Plantão e urgências sob demanda noturna</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-[#005F73] text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Endereço da Clínica</p>
                    <p className="text-sm sm:text-base font-bold text-slate-800">
                      Clínica Odonto Souza • Consultório Central
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Fácil estacionamento e acessibilidade completa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Caixa Direta de Ação / Agendamento WhatsApp (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="bg-[#F8F9FA] rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[#001219]">Agendamento Direto & Informações</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Preencha ou inicie uma conversa para garantir seu horário com o cirurgião-dentista.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <a
                    href="https://wa.me/5566992544324?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20na%20Odonto%20Souza."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group"
                  >
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Iniciar Agendamento no WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToPaciente) onNavigateToPaciente();
                      else window.location.href = '/minhaconta';
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-[#005F73] border border-[#005F73]/30 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <UserCheck className="w-4 h-4 text-[#0A9396]" />
                    <span>Já sou paciente • Acessar Meu Prontuário (/minhaconta)</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-[#005F73]" />
                    <span>Compromisso Odonto Souza:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Seus dados estão protegidos de acordo com a Lei Geral de Proteção de Dados (LGPD) e diretrizes do
                    Conselho Federal de Odontologia (CFO).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. RODAPÉ INSTITUCIONAL (FOOTER)                              */}
      {/* ============================================================== */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-xs sm:text-sm">
            {/* Coluna 1: Marca & Registro */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#005F73] text-white flex items-center justify-center">
                  <ToothIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-base text-white tracking-tight">ODONTO SOUZA</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Clínica Odontológica Integrada. Cuidando da saúde bucal da sua família com respeito, pontualidade e
                tecnologia.
              </p>
              <p className="text-[11px] text-slate-500">
                Responsável Técnico: Dr. Frankisney Souza • CRO-SP 78.432
              </p>
            </div>

            {/* Coluna 2: Navegação Rápida */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Navegação</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors cursor-pointer">
                    Início
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('quem-somos')} className="hover:text-white transition-colors cursor-pointer">
                    Quem Somos
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('tratamentos')} className="hover:text-white transition-colors cursor-pointer">
                    Tratamentos & Especialidades
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('avaliacoes')} className="hover:text-white transition-colors cursor-pointer">
                    Avaliações dos Pacientes (5.0 ★)
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('diferenciais')} className="hover:text-white transition-colors cursor-pointer">
                    Convênio da Casa (Sem Mensalidade)
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Portais & Acessos */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Acesso ao Sistema</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => {
                      if (onNavigateToPaciente) onNavigateToPaciente();
                      else window.location.href = '/minhaconta';
                    }}
                    className="inline-flex items-center gap-1.5 text-[#94D2BD] hover:underline cursor-pointer font-bold"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Área do Paciente (/minhaconta)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (onNavigateToAdmin) onNavigateToAdmin();
                      else window.location.href = '/paineladmin';
                    }}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Painel Administrativo (/paineladmin)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Contato & Suporte */}
            <div className="space-y-2.5">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Atendimento</p>
              <p className="text-xs text-slate-400">Segunda a Sexta: 08:00 às 19:15</p>
              <p className="text-xs text-slate-400">WhatsApp: (66) 99254-4324</p>
              <a
                href="https://wa.me/5566992544324"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-bold mt-1"
              >
                <span>Falar no WhatsApp Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Faixa Inferior de Direitos, Termos, LGPD e Assinatura ES Solution */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p>© {new Date().getFullYear()} Odonto Souza. Todos os direitos reservados.</p>
              <span className="hidden sm:inline text-slate-700">•</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalLegal('privacidade')}
                  className="hover:text-[#94D2BD] transition-colors underline-offset-2 hover:underline cursor-pointer"
                >
                  Política de Privacidade
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setModalLegal('termos')}
                  className="hover:text-[#94D2BD] transition-colors underline-offset-2 hover:underline cursor-pointer"
                >
                  Termos de Uso
                </button>
              </div>
            </div>

            {/* Construído por ES Solution & Acesso Restrito */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400">
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300 font-medium">
                Construído por <strong className="text-[#94D2BD] font-black tracking-wide">By ES Solution</strong>
              </span>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => {
                  if (onNavigateToAdmin) onNavigateToAdmin();
                  else window.location.href = '/paineladmin';
                }}
                className="hover:text-white transition-colors cursor-pointer text-slate-400"
              >
                Acesso Restrito
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Interativo de Termos de Uso e Política de Privacidade */}
      {modalLegal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005F73]/10 text-[#005F73] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    {modalLegal === 'privacidade' ? 'Política de Privacidade' : 'Termos de Uso'}
                  </h3>
                  <p className="text-xs text-slate-500">Odonto Souza • Conformidade LGPD & CFO</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalLegal(null)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {modalLegal === 'privacidade' ? (
                <>
                  <p>
                    A <strong>Clínica Odonto Souza</strong> valoriza a sua privacidade e tem o compromisso de proteger os
                    dados pessoais e prontuários odontológicos de todos os seus pacientes, em total conformidade com a{' '}
                    <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong> e as normas éticas do{' '}
                    <strong>Conselho Federal de Odontologia (CFO)</strong>.
                  </p>
                  <h4 className="font-bold text-slate-800 text-sm pt-2">1. Coleta e Finalidade dos Dados</h4>
                  <p>
                    Os dados cadastrais (nome, CPF, data de nascimento, telefone/WhatsApp e histórico clínico) são
                    coletados exclusivamente para identificação segura, cumprimento de prontuário clínico e confirmação
                    de agendamentos de consultas.
                  </p>
                  <h4 className="font-bold text-slate-800 text-sm pt-2">2. Armazenamento Seguro e Criptografia</h4>
                  <p>
                    Todas as informações clínicas, exames radiológicos e receitas são armazenadas em servidores seguros
                    com criptografia de ponta a ponta e controle estrito de auditoria (Row-Level Security).
                  </p>
                  <h4 className="font-bold text-slate-800 text-sm pt-2">3. Não Compartilhamento</h4>
                  <p>
                    A Odonto Souza não comercializa, não aluga e não compartilha dados de pacientes com terceiros para
                    fins publicitários.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Bem-vindo ao portal institucional da <strong>Odonto Souza</strong>. Ao navegar neste site ou utilizar
                    nossos canais de agendamento e a Área do Paciente, você concorda com os termos aqui dispostos.
                  </p>
                  <h4 className="font-bold text-slate-800 text-sm pt-2">1. Agendamentos e Horários</h4>
                  <p>
                    As consultas odontológicas são organizadas em intervalos dedicados de 45 minutos. Solicitamos a
                    pontualidade do paciente e comunicação prévia com no mínimo 2 horas de antecedência em caso de
                    remarcação.
                  </p>
                  <h4 className="font-bold text-slate-800 text-sm pt-2">2. Convênio da Casa (Sem Mensalidade)</h4>
                  <p>
                    O Convênio da Casa é um programa próprio de assistência odontológica da clínica, sem cobrança de taxas
                    mensais ou adesão, oferecendo tabela diferenciada e transparente para tratamentos realizados na
                    unidade.
                  </p>
                  <h4 className="font-bold text-slate-800 text-sm pt-2">3. Responsabilidade Técnica</h4>
                  <p>
                    Todos os procedimentos clínicos e odontológicos são realizados sob a supervisão e responsabilidade
                    técnica do cirurgião-dentista <strong>Dr. Frankisney Souza (CRO-SP 78.432)</strong>.
                  </p>
                </>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setModalLegal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#005F73] hover:bg-[#004756] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Entendi e Concordo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
