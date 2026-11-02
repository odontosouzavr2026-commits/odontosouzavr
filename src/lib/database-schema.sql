-- =========================================================================
-- ODONTO SOUZA - BANCO DE DADOS OFICIAL (POSTGRESQL / SUPABASE SELF-HOSTED)
-- ARQUITETURA: SINGLE-TENANT (CLÍNICA ODONTO SOUZA)
-- 7 PERFIS: Super Administrador, Administrador, Socio, Gerente, Atendente, Financeiro, Paciente
-- =========================================================================

-- 1. Habilitar Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 2. TABELAS ESTRUTURAIS
-- =========================================================================

-- Tabela 1: Perfis de Acesso
CREATE TABLE IF NOT EXISTS public.perfis_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    nivel_acesso VARCHAR(30) NOT NULL,
    cor VARCHAR(30) NOT NULL,
    permissoes JSONB NOT NULL DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 2: Cadeiras Clínicas / Consultórios
CREATE TABLE IF NOT EXISTS public.cadeiras_clinicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'Ativa',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 3: Equipe & Usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(30),
    funcao VARCHAR(100),
    cro VARCHAR(50),
    perfil_id UUID REFERENCES public.perfis_acesso(id) ON DELETE RESTRICT,
    perfil_nome VARCHAR(50) NOT NULL,
    cadeira_id UUID REFERENCES public.cadeiras_clinicas(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Ativo',
    avatar_bg VARCHAR(30) DEFAULT 'bg-[#005F73]',
    permissoes JSONB DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 4: Pacientes
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    foto_url TEXT,
    cpf VARCHAR(20) UNIQUE,
    rg VARCHAR(20),
    data_nascimento DATE,
    sexo VARCHAR(20),
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    endereco TEXT,
    convenio VARCHAR(100) DEFAULT 'Particular',
    numero_carteirinha VARCHAR(50),
    alergias TEXT,
    medicamentos_uso TEXT,
    condicoes_medicas TEXT,
    status VARCHAR(20) DEFAULT 'Ativo',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 4.1: Convênios & Operadoras Parceiras
CREATE TABLE IF NOT EXISTS public.convenios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    razao_social VARCHAR(150),
    registro_ans VARCHAR(20),
    cnpj VARCHAR(20),
    telefone_contato VARCHAR(30),
    email_contato VARCHAR(120),
    dias_repasse INTEGER DEFAULT 30,
    taxa_coparticipacao NUMERIC(5,2) DEFAULT 0.00,
    tabela_precos_padrao VARCHAR(50) DEFAULT 'Padrão Clínica',
    status VARCHAR(20) DEFAULT 'Ativo',
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 5: Catálogo de Procedimentos
CREATE TABLE IF NOT EXISTS public.procedimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL UNIQUE,
    categoria VARCHAR(100) NOT NULL,
    descricao TEXT,
    duracao_minutos INTEGER DEFAULT 30,
    custo_operacional NUMERIC(10,2) DEFAULT 0.00,
    preco_base NUMERIC(10,2) NOT NULL,
    comissao_percentual NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Ativo',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 6: Agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    dentista_id UUID REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    cadeira_id UUID REFERENCES public.cadeiras_clinicas(id) ON DELETE SET NULL,
    procedimento_id UUID REFERENCES public.procedimentos(id) ON DELETE SET NULL,
    data_hora_inicio TIMESTAMPTZ NOT NULL,
    data_hora_fim TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) DEFAULT 'Confirmado',
    tipo VARCHAR(30) DEFAULT 'Consulta',
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 7: Evoluções do Prontuário Clínico
CREATE TABLE IF NOT EXISTS public.evolucoes_prontuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    dentista_id UUID REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    procedimento_id UUID REFERENCES public.procedimentos(id) ON DELETE SET NULL,
    data_atendimento TIMESTAMPTZ DEFAULT NOW(),
    descricao_clinica TEXT NOT NULL,
    orientacoes_pos_operatorias TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 8: Odontograma (Mapeamento Dentário)
CREATE TABLE IF NOT EXISTS public.odontograma_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    dente INTEGER NOT NULL,
    face VARCHAR(20) DEFAULT 'Geral',
    condicao VARCHAR(50) NOT NULL,
    observacao TEXT,
    dentista_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 9: Orçamentos
CREATE TABLE IF NOT EXISTS public.orcamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    dentista_id UUID REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    numero_orcamento VARCHAR(50) UNIQUE NOT NULL,
    valor_bruto NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    desconto NUMERIC(10,2) DEFAULT 0.00,
    valor_liquido NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    condicao_pagamento VARCHAR(100),
    status VARCHAR(30) DEFAULT 'Aprovado',
    validade_dias INTEGER DEFAULT 30,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 10: Itens do Orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE,
    procedimento_id UUID REFERENCES public.procedimentos(id) ON DELETE RESTRICT,
    dente INTEGER,
    face VARCHAR(20),
    quantidade INTEGER DEFAULT 1,
    valor_unitario NUMERIC(10,2) NOT NULL,
    valor_total NUMERIC(10,2) NOT NULL
);

-- Tabela 11: Transações Financeiras (Contas a Pagar / Receber)
CREATE TABLE IF NOT EXISTS public.transacoes_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(20) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) DEFAULT 'Pago',
    forma_pagamento VARCHAR(50),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 12: Estoque de Materiais Odontológicos
CREATE TABLE IF NOT EXISTS public.estoque_materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    unidade VARCHAR(20) DEFAULT 'UN',
    quantidade_atual NUMERIC(10,2) DEFAULT 0,
    quantidade_minima NUMERIC(10,2) DEFAULT 5,
    lote VARCHAR(50),
    data_validade DATE,
    fornecedor VARCHAR(100),
    valor_custo NUMERIC(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Em Estoque',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 13: Movimentações de Estoque
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES public.estoque_materiais(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,
    quantidade NUMERIC(10,2) NOT NULL,
    motivo TEXT,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 14: Ciclos de Esterilização (Autoclave)
CREATE TABLE IF NOT EXISTS public.ciclos_autoclave (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_ciclo VARCHAR(50) NOT NULL UNIQUE,
    equipamento VARCHAR(100) NOT NULL,
    data_inicio TIMESTAMPTZ DEFAULT NOW(),
    data_fim TIMESTAMPTZ,
    temperatura_atingida NUMERIC(5,1) DEFAULT 134.0,
    pressao_atingida NUMERIC(4,2) DEFAULT 2.20,
    tempo_esterilizacao_minutos INTEGER DEFAULT 15,
    indicador_quimico_ok BOOLEAN DEFAULT true,
    indicador_biologico_ok BOOLEAN DEFAULT true,
    status VARCHAR(30) DEFAULT 'Liberado',
    operador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 15: Ordens de Serviço de Laboratório Protético
CREATE TABLE IF NOT EXISTS public.ordens_laboratorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_os VARCHAR(50) NOT NULL UNIQUE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    dentista_id UUID REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    laboratorio_nome VARCHAR(150) NOT NULL,
    tipo_trabalho VARCHAR(100) NOT NULL,
    dentes_envolvidos VARCHAR(50),
    cor_escala VARCHAR(20),
    data_envio DATE NOT NULL,
    data_previsao_retorno DATE NOT NULL,
    data_retorno_real DATE,
    status VARCHAR(30) DEFAULT 'Em Produção',
    valor_custo NUMERIC(10,2) DEFAULT 0.00,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 16: Trilha de Auditoria e Logs de Segurança (LGPD / CFO)
CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    usuario_nome VARCHAR(150),
    usuario_email VARCHAR(150),
    usuario_perfil VARCHAR(50),
    acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(50) NOT NULL,
    entidade_id VARCHAR(100),
    detalhes TEXT NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_origem VARCHAR(50) DEFAULT '127.0.0.1',
    user_agent TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela 18: Avaliações dos Pacientes (NPS & Testemunhos)
CREATE TABLE IF NOT EXISTS public.avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
    nome_paciente VARCHAR(150) NOT NULL,
    foto_url TEXT,
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    canal VARCHAR(30) DEFAULT 'whatsapp',
    destaque_site BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 3. ÍNDICES DE ALTA PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos(data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_dentista ON public.agendamentos(dentista_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON public.agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON public.pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON public.pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_transacoes_vencimento ON public.transacoes_financeiras(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON public.transacoes_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_estoque_status ON public.estoque_materiais(status);
CREATE INDEX IF NOT EXISTS idx_odontograma_paciente ON public.odontograma_itens(paciente_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON public.auditoria_logs(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON public.auditoria_logs(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON public.auditoria_logs(acao);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_destaque ON public.avaliacoes(destaque_site, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_paciente ON public.avaliacoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_agendamento ON public.avaliacoes(agendamento_id);

-- =========================================================================
-- 4. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.perfis_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadeiras_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolucoes_prontuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontograma_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciclos_autoclave ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Global para a Clínica (Single-Tenant Odonto Souza)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'perfis_acesso', 'cadeiras_clinicas', 'usuarios', 'pacientes', 'convenios',
            'procedimentos', 'agendamentos', 'evolucoes_prontuario', 
            'odontograma_itens', 'orcamentos', 'orcamento_itens', 
            'transacoes_financeiras', 'estoque_materiais', 'estoque_movimentacoes', 
            'ciclos_autoclave', 'ordens_laboratorio', 'auditoria_logs', 'avaliacoes'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Acesso_Geral_OdontoSouza" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Acesso_Geral_OdontoSouza" ON public.%I FOR ALL TO public USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
