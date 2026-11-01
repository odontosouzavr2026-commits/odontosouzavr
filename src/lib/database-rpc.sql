-- =========================================================================
-- ODONTO SOUZA - API RPC CANÔNICA (POSTGRESQL / SUPABASE)
-- Comunicação direta, blindada e de alta performance entre Frontend e Banco
-- =========================================================================

-- 1. MÓDULO PACIENTES
CREATE OR REPLACE FUNCTION public.obter_pacientes()
RETURNS SETOF public.pacientes
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.pacientes ORDER BY nome ASC;
$$;

CREATE OR REPLACE FUNCTION public.salvar_paciente(p_dados JSONB)
RETURNS public.pacientes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_paciente public.pacientes;
    v_id UUID;
BEGIN
    v_id := COALESCE((p_dados->>'id')::UUID, gen_random_uuid());

    INSERT INTO public.pacientes (
        id, nome, foto_url, cpf, rg, data_nascimento, sexo,
        telefone, email, endereco, convenio, numero_carteirinha,
        alergias, medicamentos_uso, condicoes_medicas, status, atualizado_em
    ) VALUES (
        v_id,
        p_dados->>'nome',
        p_dados->>'foto_url',
        p_dados->>'cpf',
        p_dados->>'rg',
        (p_dados->>'data_nascimento')::DATE,
        p_dados->>'sexo',
        p_dados->>'telefone',
        p_dados->>'email',
        p_dados->>'endereco',
        COALESCE(p_dados->>'convenio', 'Particular'),
        p_dados->>'numero_carteirinha',
        p_dados->>'alergias',
        p_dados->>'medicamentos_uso',
        p_dados->>'condicoes_medicas',
        COALESCE(p_dados->>'status', 'Ativo'),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        foto_url = COALESCE(EXCLUDED.foto_url, public.pacientes.foto_url),
        cpf = COALESCE(EXCLUDED.cpf, public.pacientes.cpf),
        rg = EXCLUDED.rg,
        data_nascimento = EXCLUDED.data_nascimento,
        sexo = EXCLUDED.sexo,
        telefone = EXCLUDED.telefone,
        email = EXCLUDED.email,
        endereco = EXCLUDED.endereco,
        convenio = EXCLUDED.convenio,
        numero_carteirinha = EXCLUDED.numero_carteirinha,
        alergias = EXCLUDED.alergias,
        medicamentos_uso = EXCLUDED.medicamentos_uso,
        condicoes_medicas = EXCLUDED.condicoes_medicas,
        status = EXCLUDED.status,
        atualizado_em = NOW()
    RETURNING * INTO v_paciente;

    -- Registrar na Trilha de Auditoria
    INSERT INTO public.auditoria_logs (acao, entidade, entidade_id, detalhes, dados_novos)
    VALUES (
        'SALVAR',
        'pacientes',
        v_paciente.id::text,
        'Paciente ' || v_paciente.nome || ' gravado via sistema clínico.',
        to_jsonb(v_paciente)
    );

    RETURN v_paciente;
END;
$$;

-- 2. MÓDULO AGENDAMENTOS
CREATE OR REPLACE FUNCTION public.obter_agendamentos()
RETURNS TABLE (
    id UUID,
    paciente_id UUID,
    paciente_nome VARCHAR,
    paciente_telefone VARCHAR,
    paciente_foto_url TEXT,
    dentista_id UUID,
    dentista_nome VARCHAR,
    cadeira_id UUID,
    cadeira_nome VARCHAR,
    procedimento_id UUID,
    procedimento_nome VARCHAR,
    procedimento_preco NUMERIC,
    data_hora_inicio TIMESTAMPTZ,
    data_hora_fim TIMESTAMPTZ,
    status VARCHAR,
    tipo VARCHAR,
    observacoes TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    a.id,
    a.paciente_id,
    p.nome AS paciente_nome,
    p.telefone AS paciente_telefone,
    p.foto_url AS paciente_foto_url,
    a.dentista_id,
    u.nome AS dentista_nome,
    a.cadeira_id,
    c.nome AS cadeira_nome,
    a.procedimento_id,
    pr.nome AS procedimento_nome,
    pr.preco_base AS procedimento_preco,
    a.data_hora_inicio,
    a.data_hora_fim,
    a.status,
    a.tipo,
    a.observacoes
  FROM public.agendamentos a
  LEFT JOIN public.pacientes p ON p.id = a.paciente_id
  LEFT JOIN public.usuarios u ON u.id = a.dentista_id
  LEFT JOIN public.cadeiras_clinicas c ON c.id = a.cadeira_id
  LEFT JOIN public.procedimentos pr ON pr.id = a.procedimento_id
  ORDER BY a.data_hora_inicio ASC;
$$;

CREATE OR REPLACE FUNCTION public.salvar_agendamento(p_dados JSONB)
RETURNS public.agendamentos
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agendamento public.agendamentos;
    v_id UUID;
BEGIN
    v_id := COALESCE((p_dados->>'id')::UUID, gen_random_uuid());

    INSERT INTO public.agendamentos (
        id, paciente_id, dentista_id, cadeira_id, procedimento_id,
        data_hora_inicio, data_hora_fim, status, tipo, observacoes, atualizado_em
    ) VALUES (
        v_id,
        (p_dados->>'paciente_id')::UUID,
        (p_dados->>'dentista_id')::UUID,
        (p_dados->>'cadeira_id')::UUID,
        (p_dados->>'procedimento_id')::UUID,
        (p_dados->>'data_hora_inicio')::TIMESTAMPTZ,
        (p_dados->>'data_hora_fim')::TIMESTAMPTZ,
        COALESCE(p_dados->>'status', 'Confirmado'),
        COALESCE(p_dados->>'tipo', 'Consulta'),
        p_dados->>'observacoes',
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        paciente_id = COALESCE(EXCLUDED.paciente_id, public.agendamentos.paciente_id),
        dentista_id = COALESCE(EXCLUDED.dentista_id, public.agendamentos.dentista_id),
        cadeira_id = EXCLUDED.cadeira_id,
        procedimento_id = EXCLUDED.procedimento_id,
        data_hora_inicio = EXCLUDED.data_hora_inicio,
        data_hora_fim = EXCLUDED.data_hora_fim,
        status = EXCLUDED.status,
        tipo = EXCLUDED.tipo,
        observacoes = EXCLUDED.observacoes,
        atualizado_em = NOW()
    RETURNING * INTO v_agendamento;

    INSERT INTO public.auditoria_logs (acao, entidade, entidade_id, detalhes, dados_novos)
    VALUES (
        'AGENDAR',
        'agendamentos',
        v_agendamento.id::text,
        'Agendamento atualizado para ' || to_char(v_agendamento.data_hora_inicio, 'DD/MM/YYYY HH24:MI'),
        to_jsonb(v_agendamento)
    );

    RETURN v_agendamento;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_status_agendamento(p_id UUID, p_status VARCHAR)
RETURNS public.agendamentos
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agendamento public.agendamentos;
BEGIN
    UPDATE public.agendamentos
    SET status = p_status, atualizado_em = NOW()
    WHERE id = p_id
    RETURNING * INTO v_agendamento;

    INSERT INTO public.auditoria_logs (acao, entidade, entidade_id, detalhes)
    VALUES ('ALTERAR_STATUS', 'agendamentos', p_id::text, 'Status de agendamento alterado para: ' || p_status);

    RETURN v_agendamento;
END;
$$;

-- 3. MÓDULO PROCEDIMENTOS
CREATE OR REPLACE FUNCTION public.obter_procedimentos()
RETURNS SETOF public.procedimentos
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.procedimentos ORDER BY categoria ASC, nome ASC;
$$;

CREATE OR REPLACE FUNCTION public.salvar_procedimento(p_dados JSONB)
RETURNS public.procedimentos
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_proc public.procedimentos;
    v_id UUID;
BEGIN
    v_id := COALESCE((p_dados->>'id')::UUID, gen_random_uuid());

    INSERT INTO public.procedimentos (
        id, nome, categoria, descricao, duracao_minutos,
        custo_operacional, preco_base, comissao_percentual, status
    ) VALUES (
        v_id,
        p_dados->>'nome',
        p_dados->>'categoria',
        p_dados->>'descricao',
        COALESCE((p_dados->>'duracao_minutos')::INTEGER, 30),
        COALESCE((p_dados->>'custo_operacional')::NUMERIC, 0.00),
        (p_dados->>'preco_base')::NUMERIC,
        COALESCE((p_dados->>'comissao_percentual')::NUMERIC, 0.00),
        COALESCE(p_dados->>'status', 'Ativo')
    )
    ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        categoria = EXCLUDED.categoria,
        descricao = EXCLUDED.descricao,
        duracao_minutos = EXCLUDED.duracao_minutos,
        custo_operacional = EXCLUDED.custo_operacional,
        preco_base = EXCLUDED.preco_base,
        comissao_percentual = EXCLUDED.comissao_percentual,
        status = EXCLUDED.status
    RETURNING * INTO v_proc;

    RETURN v_proc;
END;
$$;

-- 4. MÓDULO FINANCEIRO
CREATE OR REPLACE FUNCTION public.obter_transacoes_financeiras()
RETURNS TABLE (
    id UUID,
    tipo VARCHAR,
    categoria VARCHAR,
    descricao TEXT,
    valor NUMERIC,
    data_vencimento DATE,
    data_pagamento DATE,
    status VARCHAR,
    forma_pagamento VARCHAR,
    paciente_id UUID,
    paciente_nome VARCHAR,
    usuario_id UUID,
    usuario_nome VARCHAR,
    criado_em TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.tipo,
    t.categoria,
    t.descricao,
    t.valor,
    t.data_vencimento,
    t.data_pagamento,
    t.status,
    t.forma_pagamento,
    t.paciente_id,
    p.nome AS paciente_nome,
    t.usuario_id,
    u.nome AS usuario_nome,
    t.criado_em
  FROM public.transacoes_financeiras t
  LEFT JOIN public.pacientes p ON p.id = t.paciente_id
  LEFT JOIN public.usuarios u ON u.id = t.usuario_id
  ORDER BY t.data_vencimento DESC;
$$;

CREATE OR REPLACE FUNCTION public.salvar_transacao_financeira(p_dados JSONB)
RETURNS public.transacoes_financeiras
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trans public.transacoes_financeiras;
    v_id UUID;
BEGIN
    v_id := COALESCE((p_dados->>'id')::UUID, gen_random_uuid());

    INSERT INTO public.transacoes_financeiras (
        id, tipo, categoria, descricao, valor,
        data_vencimento, data_pagamento, status, forma_pagamento,
        paciente_id, usuario_id
    ) VALUES (
        v_id,
        p_dados->>'tipo',
        p_dados->>'categoria',
        p_dados->>'descricao',
        (p_dados->>'valor')::NUMERIC,
        (p_dados->>'data_vencimento')::DATE,
        (p_dados->>'data_pagamento')::DATE,
        COALESCE(p_dados->>'status', 'Pago'),
        p_dados->>'forma_pagamento',
        (p_dados->>'paciente_id')::UUID,
        (p_dados->>'usuario_id')::UUID
    )
    ON CONFLICT (id) DO UPDATE SET
        tipo = EXCLUDED.tipo,
        categoria = EXCLUDED.categoria,
        descricao = EXCLUDED.descricao,
        valor = EXCLUDED.valor,
        data_vencimento = EXCLUDED.data_vencimento,
        data_pagamento = EXCLUDED.data_pagamento,
        status = EXCLUDED.status,
        forma_pagamento = EXCLUDED.forma_pagamento,
        paciente_id = EXCLUDED.paciente_id,
        usuario_id = EXCLUDED.usuario_id
    RETURNING * INTO v_trans;

    RETURN v_trans;
END;
$$;

CREATE OR REPLACE FUNCTION public.liquidar_transacao_financeira(p_id UUID)
RETURNS public.transacoes_financeiras
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trans public.transacoes_financeiras;
BEGIN
    UPDATE public.transacoes_financeiras
    SET status = 'Pago', data_pagamento = CURRENT_DATE
    WHERE id = p_id
    RETURNING * INTO v_trans;

    RETURN v_trans;
END;
$$;

-- 5. MÓDULO EQUIPE & USUÁRIOS
CREATE OR REPLACE FUNCTION public.obter_usuarios_sistema()
RETURNS TABLE (
    id UUID,
    nome VARCHAR,
    email VARCHAR,
    telefone VARCHAR,
    funcao VARCHAR,
    cro VARCHAR,
    perfil_id UUID,
    perfil_nome VARCHAR,
    cadeira_id UUID,
    cadeira_nome VARCHAR,
    status VARCHAR,
    avatar_bg VARCHAR,
    permissoes JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.nome,
    u.email,
    u.telefone,
    u.funcao,
    u.cro,
    u.perfil_id,
    u.perfil_nome,
    u.cadeira_id,
    c.nome AS cadeira_nome,
    u.status,
    u.avatar_bg,
    u.permissoes
  FROM public.usuarios u
  LEFT JOIN public.cadeiras_clinicas c ON c.id = u.cadeira_id
  ORDER BY u.nome ASC;
$$;

CREATE OR REPLACE FUNCTION public.salvar_usuario_sistema(p_dados JSONB)
RETURNS public.usuarios
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user public.usuarios;
    v_id UUID;
BEGIN
    v_id := COALESCE((p_dados->>'id')::UUID, gen_random_uuid());

    INSERT INTO public.usuarios (
        id, nome, email, telefone, funcao, cro,
        perfil_id, perfil_nome, cadeira_id, status, avatar_bg, permissoes, atualizado_em
    ) VALUES (
        v_id,
        p_dados->>'nome',
        p_dados->>'email',
        p_dados->>'telefone',
        p_dados->>'funcao',
        p_dados->>'cro',
        (p_dados->>'perfil_id')::UUID,
        COALESCE(p_dados->>'perfil_nome', 'Atendente'),
        (p_dados->>'cadeira_id')::UUID,
        COALESCE(p_dados->>'status', 'Ativo'),
        COALESCE(p_dados->>'avatar_bg', 'bg-[#005F73]'),
        COALESCE(p_dados->'permissoes', '{}'::jsonb),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        telefone = EXCLUDED.telefone,
        funcao = EXCLUDED.funcao,
        cro = EXCLUDED.cro,
        perfil_id = EXCLUDED.perfil_id,
        perfil_nome = EXCLUDED.perfil_nome,
        cadeira_id = EXCLUDED.cadeira_id,
        status = EXCLUDED.status,
        permissoes = EXCLUDED.permissoes,
        atualizado_em = NOW()
    RETURNING * INTO v_user;

    RETURN v_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.obter_perfis_acesso()
RETURNS SETOF public.perfis_acesso
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.perfis_acesso ORDER BY nome ASC;
$$;

-- 6. MÓDULO ESTOQUE & AUTOCLAVE
CREATE OR REPLACE FUNCTION public.obter_estoque_materiais()
RETURNS SETOF public.estoque_materiais
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.estoque_materiais ORDER BY nome ASC;
$$;

CREATE OR REPLACE FUNCTION public.salvar_material_estoque(p_dados JSONB)
RETURNS public.estoque_materiais
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mat public.estoque_materiais;
    v_id UUID;
BEGIN
    v_id := COALESCE((p_dados->>'id')::UUID, gen_random_uuid());

    INSERT INTO public.estoque_materiais (
        id, nome, categoria, unidade, quantidade_atual,
        quantidade_minima, lote, data_validade, fornecedor, valor_custo, status
    ) VALUES (
        v_id,
        p_dados->>'nome',
        p_dados->>'categoria',
        COALESCE(p_dados->>'unidade', 'UN'),
        COALESCE((p_dados->>'quantidade_atual')::NUMERIC, 0),
        COALESCE((p_dados->>'quantidade_minima')::NUMERIC, 5),
        p_dados->>'lote',
        (p_dados->>'data_validade')::DATE,
        p_dados->>'fornecedor',
        COALESCE((p_dados->>'valor_custo')::NUMERIC, 0.00),
        COALESCE(p_dados->>'status', 'Em Estoque')
    )
    ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        categoria = EXCLUDED.categoria,
        unidade = EXCLUDED.unidade,
        quantidade_atual = EXCLUDED.quantidade_atual,
        quantidade_minima = EXCLUDED.quantidade_minima,
        lote = EXCLUDED.lote,
        data_validade = EXCLUDED.data_validade,
        fornecedor = EXCLUDED.fornecedor,
        valor_custo = EXCLUDED.valor_custo,
        status = EXCLUDED.status,
        atualizado_em = NOW()
    RETURNING * INTO v_mat;

    RETURN v_mat;
END;
$$;

CREATE OR REPLACE FUNCTION public.obter_ciclos_autoclave()
RETURNS SETOF public.ciclos_autoclave
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.ciclos_autoclave ORDER BY data_inicio DESC;
$$;

-- 7. MÓDULO LABORATÓRIO PROTÉTICO
CREATE OR REPLACE FUNCTION public.obter_ordens_laboratorio()
RETURNS TABLE (
    id UUID,
    numero_os VARCHAR,
    paciente_id UUID,
    paciente_nome VARCHAR,
    dentista_id UUID,
    dentista_nome VARCHAR,
    laboratorio_nome VARCHAR,
    tipo_trabalho VARCHAR,
    dentes_envolvidos VARCHAR,
    cor_escala VARCHAR,
    data_envio DATE,
    data_previsao_retorno DATE,
    data_retorno_real DATE,
    status VARCHAR,
    valor_custo NUMERIC,
    observacoes TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    o.id,
    o.numero_os,
    o.paciente_id,
    p.nome AS paciente_nome,
    o.dentista_id,
    u.nome AS dentista_nome,
    o.laboratorio_nome,
    o.tipo_trabalho,
    o.dentes_envolvidos,
    o.cor_escala,
    o.data_envio,
    o.data_previsao_retorno,
    o.data_retorno_real,
    o.status,
    o.valor_custo,
    o.observacoes
  FROM public.ordens_laboratorio o
  LEFT JOIN public.pacientes p ON p.id = o.paciente_id
  LEFT JOIN public.usuarios u ON u.id = o.dentista_id
  ORDER BY o.data_envio DESC;
$$;

-- 8. MÓDULO AUDITORIA & LOGS
CREATE OR REPLACE FUNCTION public.obter_auditoria_logs()
RETURNS SETOF public.auditoria_logs
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.auditoria_logs ORDER BY criado_em DESC LIMIT 100;
$$;

-- 9. AUTO-CONFIRMAÇÃO DE USUÁRIOS NO SUPABASE SELF-HOSTED (SEM NECESSIDADE DE LINK DE E-MAIL)
CREATE OR REPLACE FUNCTION public.auto_confirm_novo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  IF NEW.confirmed_at IS NULL THEN
    NEW.confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Gatilho automático antes da inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_novo_usuario();

-- Atualiza usuários pré-existentes que não confirmaram
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- CONCEDER PERMISSÕES UNIVERSAIS DE EXECUÇÃO RPC
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
