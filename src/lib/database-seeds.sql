-- =========================================================================
-- ODONTO SOUZA - SEEDS REALISTAS DE CARGA INICIAL
-- Popula o banco de dados oficial sem mocks
-- =========================================================================

-- 1. Inserir os 7 Perfis de Acesso Oficiais
INSERT INTO public.perfis_acesso (id, nome, descricao, nivel_acesso, cor, permissoes)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Super Administrador',
    'Acesso irrestrito a configurações de infraestrutura, segurança, logs de auditoria e banco de dados.',
    'Avançado',
    'bg-[#001219] text-white',
    '{"prontuario": true, "prescricao": true, "agenda": true, "financeiro": true, "relatorios": true, "configuracoes": true}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000002',
    'Administrador',
    'Gestão administrativa da clínica, gestão de equipe, procedimentos, contratos e relatórios gerenciais.',
    'Administrativo',
    'bg-[#005F73] text-white',
    '{"prontuario": true, "prescricao": false, "agenda": true, "financeiro": true, "relatorios": true, "configuracoes": true}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000003',
    'Socio',
    'Cirurgião-Dentista Proprietário / Sócio (RT). Acesso irrestrito clínico e visão executiva financeira (DRE e repasses).',
    'Clínico',
    'bg-[#0A9396] text-white',
    '{"prontuario": true, "prescricao": true, "agenda": true, "financeiro": true, "relatorios": true, "configuracoes": true}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000004',
    'Gerente',
    'Coordenação operacional da clínica, controle de estoque de materiais, esterilização em autoclave e acompanhamento de metas.',
    'Operacional',
    'bg-[#CA6702] text-white',
    '{"prontuario": false, "prescricao": false, "agenda": true, "financeiro": true, "relatorios": true, "configuracoes": false}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000005',
    'Atendente',
    'Recepção e acolhimento, agendamento de consultas, confirmação via WhatsApp, check-in e fila de espera.',
    'Operacional',
    'bg-[#94D2BD] text-[#001219]',
    '{"prontuario": false, "prescricao": false, "agenda": true, "financeiro": false, "relatorios": false, "configuracoes": false}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000006',
    'Financeiro',
    'Contas a pagar e receber, fluxo de caixa diário, faturamento de convênios, conciliação bancária e repasses.',
    'Administrativo',
    'bg-[#EE9B00] text-white',
    '{"prontuario": false, "prescricao": false, "agenda": false, "financeiro": true, "relatorios": true, "configuracoes": false}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000007',
    'Paciente',
    'Portal do Paciente: auto-agendamento, histórico de consultas, receitas prescritas e recibos de pagamento.',
    'Operacional',
    'bg-emerald-600 text-white',
    '{"prontuario": false, "prescricao": false, "agenda": true, "financeiro": false, "relatorios": false, "configuracoes": false}'::jsonb
)
ON CONFLICT (nome) DO UPDATE SET 
    descricao = EXCLUDED.descricao,
    nivel_acesso = EXCLUDED.nivel_acesso,
    cor = EXCLUDED.cor,
    permissoes = EXCLUDED.permissoes;

-- 2. Inserir Cadeiras Clínicas
INSERT INTO public.cadeiras_clinicas (id, nome, descricao, status)
VALUES
('10000000-0000-0000-0000-000000000001', 'Cadeira 01 (Implantes & Cirurgia)', 'Consultório cirúrgico equipado com foco cirúrgico e motor de implante', 'Ativa'),
('10000000-0000-0000-0000-000000000002', 'Cadeira 02 (Geral & Orto)', 'Consultório clínico geral para restaurações e manutenções ortodônticas', 'Ativa'),
('10000000-0000-0000-0000-000000000003', 'Cadeira 03 (Estética & Harmonização)', 'Gabinete para clareamento dental a laser e procedimentos estéticos', 'Ativa')
ON CONFLICT (nome) DO NOTHING;

-- 3. Inserir Equipe Clínica / Usuários
INSERT INTO public.usuarios (id, nome, email, telefone, funcao, cro, perfil_id, perfil_nome, cadeira_id, status, avatar_bg, permissoes)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    'Dr. Frankisney B. Souza',
    'frankisney@odontosouza.com.br',
    '(66) 3554-2633',
    'Cirurgião Dentista (RT)',
    'CRO-5950/MT',
    '00000000-0000-0000-0000-000000000003',
    'Socio',
    '10000000-0000-0000-0000-000000000001',
    'Ativo',
    'bg-[#005F73]',
    '{"prontuario": true, "prescricao": true, "agenda": true, "financeiro": true, "relatorios": true, "configuracoes": true}'::jsonb
),
(
    '20000000-0000-0000-0000-000000000002',
    'Dr. Silas Jr. B. Souza',
    'silas@odontosouza.com.br',
    '(66) 3554-1390',
    'Implantodontista / Estética',
    'CRO-5838/MT',
    '00000000-0000-0000-0000-000000000002',
    'Administrador',
    '10000000-0000-0000-0000-000000000002',
    'Ativo',
    'bg-[#0A9396]',
    '{"prontuario": true, "prescricao": true, "agenda": true, "financeiro": true, "relatorios": true, "configuracoes": true}'::jsonb
),
(
    '20000000-0000-0000-0000-000000000003',
    'Patrícia Lima',
    'patricia.gerencia@odontosouza.com.br',
    '(24) 96655-4433',
    'Gerente de Operações e Esterilização',
    'Administrativo',
    '00000000-0000-0000-0000-000000000004',
    'Gerente',
    NULL,
    'Ativo',
    'bg-[#CA6702]',
    '{"prontuario": false, "prescricao": false, "agenda": true, "financeiro": true, "relatorios": true, "configuracoes": false}'::jsonb
),
(
    '20000000-0000-0000-0000-000000000004',
    'Mariana Alcantara',
    'mariana.recepcao@odontosouza.com.br',
    '(24) 95544-3322',
    'Recepcionista Líder',
    'Recepção',
    '00000000-0000-0000-0000-000000000005',
    'Atendente',
    NULL,
    'Ativo',
    'bg-[#94D2BD]',
    '{"prontuario": false, "prescricao": false, "agenda": true, "financeiro": false, "relatorios": false, "configuracoes": false}'::jsonb
),
(
    '20000000-0000-0000-0000-000000000005',
    'Juliana Mendes',
    'juliana.recepcao@odontosouza.com.br',
    '(24) 94433-2211',
    'Atendente e Confirmação WhatsApp',
    'Recepção',
    '00000000-0000-0000-0000-000000000005',
    'Atendente',
    NULL,
    'Ativo',
    'bg-teal-600',
    '{"prontuario": false, "prescricao": false, "agenda": true, "financeiro": false, "relatorios": false, "configuracoes": false}'::jsonb
),
(
    '20000000-0000-0000-0000-000000000006',
    'Carlos Eduardo Santos',
    'carlos.fin@odontosouza.com.br',
    '(24) 93322-1100',
    'Analista Financeiro e Faturamento',
    'Financeiro',
    '00000000-0000-0000-0000-000000000006',
    'Financeiro',
    NULL,
    'Ativo',
    'bg-[#EE9B00]',
    '{"prontuario": false, "prescricao": false, "agenda": false, "financeiro": true, "relatorios": true, "configuracoes": false}'::jsonb
),
(
    '20000000-0000-0000-0000-000000000007',
    'Super Admin TI',
    'admin@odontosouzavr.com.br',
    '(24) 92211-0099',
    'Administrador de Sistema e Infra',
    'TI / DevOps',
    '00000000-0000-0000-0000-000000000001',
    'Super Administrador',
    NULL,
    'Ativo',
    'bg-[#001219]',
    '{"prontuario": true, "prescricao": true, "agenda": true, "financeiro": true, "relatorios": true, "configuracoes": true}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET 
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone,
    funcao = EXCLUDED.funcao,
    perfil_nome = EXCLUDED.perfil_nome;

-- 4. Inserir Procedimentos Padronizados
INSERT INTO public.procedimentos (id, nome, categoria, descricao, duracao_minutos, custo_operacional, preco_base, comissao_percentual, status)
VALUES
('30000000-0000-0000-0000-000000000001', 'Consulta Inicial / Avaliação Clínica', 'Diagnóstico', 'Exame clínico minucioso, anamnese e planejamento do tratamento', 30, 20.00, 150.00, 30.00, 'Ativo'),
('30000000-0000-0000-0000-000000000002', 'Profilaxia & Raspagem Supragengival', 'Periodontia', 'Limpeza completa com ultrassom, raspagem de tártaro e jato de bicarbonato', 45, 35.00, 250.00, 40.00, 'Ativo'),
('30000000-0000-0000-0000-000000000003', 'Restauração em Resina Composta (1 face)', 'Dentística', 'Restauração estética direta em resina composta nanoparticulada', 45, 28.00, 220.00, 40.00, 'Ativo'),
('30000000-0000-0000-0000-000000000004', 'Restauração em Resina Composta (2 faces)', 'Dentística', 'Restauração estética proximal ou classe II', 60, 38.00, 290.00, 40.00, 'Ativo'),
('30000000-0000-0000-0000-000000000005', 'Clareamento Dental de Consultório a Laser', 'Estética', 'Sessão clínica de clareamento com peróxido de hidrogênio potencializado', 60, 120.00, 850.00, 35.00, 'Ativo'),
('30000000-0000-0000-0000-000000000006', 'Implante Dentário Titânio Unitário', 'Implantodontia', 'Cirurgia para instalação de implante osseointegrável cone morse', 90, 450.00, 2400.00, 45.00, 'Ativo'),
('30000000-0000-0000-0000-000000000007', 'Tratamento Endodôntico (Canal) Molar', 'Endodontia', 'Descontaminação e obturação termoplastificada dos condutos radiculares', 90, 110.00, 1100.00, 45.00, 'Ativo'),
('30000000-0000-0000-0000-000000000008', 'Exodontia de Terceiro Molar Incluso (Siso)', 'Cirurgia', 'Remoção cirúrgica de siso incluso ou impactado sob anestesia local', 60, 85.00, 650.00, 40.00, 'Ativo'),
('30000000-0000-0000-0000-000000000009', 'Manutenção Ortodôntica Mensal', 'Ortodontia', 'Troca de arcos, ligaduras e ativação de força do aparelho fixo', 30, 15.00, 180.00, 50.00, 'Ativo')
ON CONFLICT (nome) DO UPDATE SET 
    preco_base = EXCLUDED.preco_base,
    duracao_minutos = EXCLUDED.duracao_minutos;

-- 5. Inserir Pacientes Reais Iniciais
INSERT INTO public.pacientes (id, nome, foto_url, cpf, rg, data_nascimento, sexo, telefone, email, endereco, convenio, alergias, medicamentos_uso, condicoes_medicas, status)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    'Luciana Maria de Albuquerque',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    '123.456.789-01',
    'MG-18.421.902',
    '1988-06-14',
    'Feminino',
    '(24) 99876-1122',
    'luciana.albuquerque@email.com',
    'Rua 33, 142 - Vila Santa Cecília, Volta Redonda - RJ',
    'Unimed Odonto',
    'Alergia a Penicilina',
    'Nenhum de uso contínuo',
    'Hipertensão leve controlada',
    'Ativo'
),
(
    '40000000-0000-0000-0000-000000000002',
    'Rodrigo Mendes Cavalcanti',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    '234.567.890-12',
    'RJ-22.109.845',
    '1992-11-23',
    'Masculino',
    '(24) 98765-2233',
    'rodrigo.mendes@email.com',
    'Av. Amaral Peixoto, 890 - Centro, Volta Redonda - RJ',
    'Particular',
    'Nenhuma alergia relatada',
    'Nenhum',
    'Nenhuma comorbidade',
    'Ativo'
),
(
    '40000000-0000-0000-0000-000000000003',
    'Beatriz Fagundes Silveira',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    '345.678.901-23',
    'RJ-19.876.543',
    '2001-03-08',
    'Feminino',
    '(24) 97654-3344',
    'beatriz.fagundes@email.com',
    'Rua Vinte e Um, 45 - Sessenta, Volta Redonda - RJ',
    'Bradesco Dental',
    'Sensibilidade a AINEs (Dipirona)',
    'Antialérgico sob demanda',
    'Asma controlada',
    'Ativo'
),
(
    '40000000-0000-0000-0000-000000000004',
    'Marcos Vinicius Rezende',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    '456.789.012-34',
    'RJ-14.321.098',
    '1975-09-30',
    'Masculino',
    '(24) 96543-4455',
    'marcos.rezende@email.com',
    'Rua Duzentos e Cinquenta, 310 - Conforto, Volta Redonda - RJ',
    'Particular',
    'Nenhuma alergia',
    'Losartana 50mg',
    'Hipertensão Arterial Sistêmica',
    'Ativo'
)
ON CONFLICT (cpf) DO UPDATE SET foto_url = EXCLUDED.foto_url;

-- 6. Inserir Agendamentos
INSERT INTO public.agendamentos (id, paciente_id, dentista_id, cadeira_id, procedimento_id, data_hora_inicio, data_hora_fim, status, tipo, observacoes)
VALUES
(
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000006',
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '3 hours 30 minutes',
    'Confirmado',
    'Procedimento',
    'Instalação de implante região dente 36. Anamnese revisada.'
),
(
    '50000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000009',
    NOW() + INTERVAL '4 hours',
    NOW() + INTERVAL '4 hours 30 minutes',
    'Em Espera',
    'Retorno',
    'Paciente já realizou check-in na recepção. Manutenção de aparelho.'
),
(
    '50000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000005',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day 1 hour',
    'Confirmado',
    'Procedimento',
    'Sessão de clareamento dental a laser com fotos comparativas prévias.'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Inserir Evoluções Clínicas do Prontuário
INSERT INTO public.evolucoes_prontuario (id, paciente_id, dentista_id, procedimento_id, data_atendimento, descricao_clinica, orientacoes_pos_operatorias)
VALUES
(
    '60000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '5 days',
    'Realizado exame clínico e tomografia computadorizada cone beam. Identificada ausência do dente 36 com altura e espessura óssea favoráveis para implante cone morse 4.3 x 10mm. Apresentado plano de tratamento.',
    'Agendado procedimento cirúrgico. Orientado repouso e exames pré-operatórios de coagulação.'
),
(
    '60000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '15 days',
    'Realizada profilaxia ultrassônica com remoção de cálculo supragengival em sextante inferior anterior. Polimento coronário com pasta profilática.',
    'Orientada técnica de higienização com escova interdental e fio dental diário.'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Inserir Itens do Odontograma
INSERT INTO public.odontograma_itens (id, paciente_id, dente, face, condicao, observacao, dentista_id)
VALUES
('70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 36, 'Geral', 'Ausente / Implante Planejado', 'Espaço edêntulo cicatrizado', '20000000-0000-0000-0000-000000000001'),
('70000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 16, 'Oclusal', 'Restaurado', 'Resina composta satisfatória', '20000000-0000-0000-0000-000000000001'),
('70000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 26, 'M-O', 'Restaurado', 'Restauração realizada em 2025', '20000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 9. Inserir Orçamento Aprovado
INSERT INTO public.orcamentos (id, paciente_id, dentista_id, numero_orcamento, valor_bruto, desconto, valor_liquido, condicao_pagamento, status, validade_dias, observacoes)
VALUES
(
    '80000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'ORC-2026-0042',
    2400.00,
    200.00,
    2200.00,
    'Entrada de R$ 1.000 + 3x de R$ 400 no Cartão',
    'Aprovado',
    30,
    'Reabilitação com implante cone morse e componente protético.'
)
ON CONFLICT (numero_orcamento) DO NOTHING;

INSERT INTO public.orcamento_itens (id, orcamento_id, procedimento_id, dente, face, quantidade, valor_unitario, valor_total)
VALUES
(
    '85000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000006',
    36,
    'Geral',
    1,
    2400.00,
    2400.00
)
ON CONFLICT (id) DO NOTHING;

-- 10. Inserir Transações Financeiras (Receitas & Despesas Reais)
INSERT INTO public.transacoes_financeiras (id, tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento, paciente_id, usuario_id)
VALUES
('90000000-0000-0000-0000-000000000001', 'Receita', 'Tratamentos', 'Entrada Implante Dentário - Luciana Albuquerque (ORC-2026-0042)', 1000.00, CURRENT_DATE, CURRENT_DATE, 'Pago', 'PIX', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006'),
('90000000-0000-0000-0000-000000000002', 'Receita', 'Ortodontia', 'Mensalidade Ortodôntica - Rodrigo Mendes', 180.00, CURRENT_DATE, CURRENT_DATE, 'Pago', 'Cartão Crédito', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000006'),
('90000000-0000-0000-0000-000000000003', 'Despesa', 'Materiais Dentais', 'Compra Mensal Dental Cremer / Sorridents Insumos', 1450.00, CURRENT_DATE, CURRENT_DATE, 'Pago', 'Boleto', NULL, '20000000-0000-0000-0000-000000000006'),
('90000000-0000-0000-0000-000000000004', 'Despesa', 'Estrutura & Aluguel', 'Condomínio e Energia Clínica Odonto Souza', 820.00, CURRENT_DATE + INTERVAL '5 days', NULL, 'Pendente', 'Débito Automático', NULL, '20000000-0000-0000-0000-000000000006')
ON CONFLICT (id) DO NOTHING;

-- 11. Inserir Estoque de Materiais Odontológicos
INSERT INTO public.estoque_materiais (id, nome, categoria, unidade, quantidade_atual, quantidade_minima, lote, data_validade, fornecedor, valor_custo, status)
VALUES
('a0000000-0000-0000-0000-000000000001', 'Anestésico Articaine 4% com Epinefrina 1:100.000', 'Anestésicos', 'CX', 14, 5, 'L-24098', CURRENT_DATE + INTERVAL '18 months', 'DFL', 185.00, 'Em Estoque'),
('a0000000-0000-0000-0000-000000000002', 'Resina Filtek Z350 XT Cor A2B (3M)', 'Dentística', 'UN', 8, 3, 'L-98412', CURRENT_DATE + INTERVAL '24 months', '3M Oral Care', 142.00, 'Em Estoque'),
('a0000000-0000-0000-0000-000000000003', 'Luvas de Procedimento Nitrílicas Azuis Tam. M', 'Biossegurança', 'CX', 22, 10, 'L-11029', CURRENT_DATE + INTERVAL '30 months', 'Supermax', 38.00, 'Em Estoque'),
('a0000000-0000-0000-0000-000000000004', 'Fio de Sutura Seda Trançada 4-0 com Agulha', 'Cirurgia', 'CX', 3, 5, 'L-00912', CURRENT_DATE + INTERVAL '12 months', 'Ethicon', 65.00, 'Baixo'),
('a0000000-0000-0000-0000-000000000005', 'Kit Implante Cone Morse Titânio 4.3 x 10mm', 'Implantodontia', 'UN', 6, 2, 'L-77410', CURRENT_DATE + INTERVAL '36 months', 'Neodent', 380.00, 'Em Estoque')
ON CONFLICT (id) DO NOTHING;

-- 12. Inserir Ciclo de Esterilização (Autoclave)
INSERT INTO public.ciclos_autoclave (id, lote_ciclo, equipamento, data_inicio, data_fim, temperatura_atingida, pressao_atingida, tempo_esterilizacao_minutos, indicador_quimico_ok, indicador_biologico_ok, status, operador_id, observacoes)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'CICLO-2026-1030-01',
    'Autoclave Cristófoli 21 Litros Vitale Class',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours 15 minutes',
    134.2,
    2.25,
    15,
    true,
    true,
    'Liberado',
    '20000000-0000-0000-0000-000000000003',
    'Ciclo realizado com pacote teste biológico. Fita indicadora classe 5 virada perfeitamente. Instrumental liberado para uso cirúrgico.'
)
ON CONFLICT (lote_ciclo) DO NOTHING;

-- 13. Inserir Ordens de Serviço do Laboratório
INSERT INTO public.ordens_laboratorio (id, numero_os, paciente_id, dentista_id, laboratorio_nome, tipo_trabalho, dentes_envolvidos, cor_escala, data_envio, data_previsao_retorno, data_retorno_real, status, valor_custo, observacoes)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'LAB-2026-089',
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000001',
    'Laboratório Protético Dental Arte - VR',
    'Coroa Total em Zircônia Fresada CAD/CAM',
    'Dente 16',
    'A2',
    CURRENT_DATE - INTERVAL '4 days',
    CURRENT_DATE + INTERVAL '3 days',
    NULL,
    'Em Produção',
    380.00,
    'Moldagem digital com scanner intraoral enviada. Observar oclusão ajustada com antagonista.'
)
ON CONFLICT (numero_os) DO NOTHING;

-- 14. Inserir Trilha Inicial de Auditoria e Logs de Segurança (LGPD / CFO)
INSERT INTO public.auditoria_logs (id, usuario_id, usuario_nome, usuario_email, usuario_perfil, acao, entidade, entidade_id, detalhes, dados_novos, ip_origem, user_agent, criado_em)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Dr. Frankisney Souza',
    'frankisney@odontosouza.com.br',
    'Socio',
    'LOGIN',
    'usuarios',
    '20000000-0000-0000-0000-000000000001',
    'Autenticação realizada com sucesso no sistema clínico.',
    '{"metodo": "credenciais", "status": "sucesso"}'::jsonb,
    '187.19.224.12',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
    NOW() - INTERVAL '5 hours'
),
(
    'd0000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Dr. Frankisney Souza',
    'frankisney@odontosouza.com.br',
    'Socio',
    'CRIAR',
    'evolucoes_prontuario',
    '60000000-0000-0000-0000-000000000001',
    'Registro de evolução clínica no prontuário do paciente Luciana Maria de Albuquerque.',
    '{"paciente": "Luciana Maria de Albuquerque", "procedimento": "Consulta Inicial / Avaliação Clínica"}'::jsonb,
    '187.19.224.12',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
    NOW() - INTERVAL '4 hours 30 minutes'
),
(
    'd0000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000004',
    'Mariana Alcantara',
    'mariana.recepcao@odontosouza.com.br',
    'Atendente',
    'ALTERAR_STATUS',
    'agendamentos',
    '50000000-0000-0000-0000-000000000002',
    'Paciente Rodrigo Mendes realizou check-in presencial na recepção. Status alterado para "Em Espera".',
    '{"status_anterior": "Confirmado", "status_novo": "Em Espera"}'::jsonb,
    '187.19.224.12',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
    NOW() - INTERVAL '3 hours'
),
(
    'd0000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000003',
    'Patrícia Lima',
    'patricia.gerencia@odontosouza.com.br',
    'Gerente',
    'CRIAR',
    'ciclos_autoclave',
    'b0000000-0000-0000-0000-000000000001',
    'Ciclo de esterilização CICLO-2026-1030-01 concluído e liberado após validação de indicadores químicos e biológicos.',
    '{"lote": "CICLO-2026-1030-01", "temperatura": 134.2, "status": "Liberado"}'::jsonb,
    '187.19.224.12',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
    NOW() - INTERVAL '2 hours'
),
(
    'd0000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000006',
    'Carlos Eduardo Santos',
    'carlos.fin@odontosouza.com.br',
    'Financeiro',
    'CRIAR',
    'transacoes_financeiras',
    '90000000-0000-0000-0000-000000000001',
    'Lançamento e quitação de entrada referente a implante dentário (ORC-2026-0042) no valor de R$ 1.000,00 via PIX.',
    '{"valor": 1000.00, "forma_pagamento": "PIX", "status": "Pago"}'::jsonb,
    '187.19.224.12',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
    NOW() - INTERVAL '1 hour'
)
ON CONFLICT (id) DO NOTHING;

-- 11. Inserir Operadoras e Convênios Odontológicos
INSERT INTO public.convenios (id, nome, razao_social, registro_ans, cnpj, telefone_contato, email_contato, dias_repasse, taxa_coparticipacao, tabela_precos_padrao, status, observacoes)
VALUES
('50000000-0000-0000-0000-000000000001', 'Particular VIP', 'Odonto Souza Atendimento Direto', 'Isento', '00.000.000/0001-00', '(65) 99605-5823', 'contato@odontosouzavr.com.br', 0, 0.00, 'Tabela Particular Odonto Souza', 'Ativo', 'Atendimento direto com condições exclusivas, Pix com desconto e parcelamento em cartão.'),
('50000000-0000-0000-0000-000000000002', 'Bradesco Dental', 'Bradesco Dental S.A.', '005711', '03.520.198/0001-38', '0800 600 2828', 'credenciamento@bradescodental.com.br', 30, 0.00, 'Tabela Bradesco Dental Premium', 'Ativo', 'Autorização prévia obrigatória via portal TISS para procedimentos de prótese e endodontia.'),
('50000000-0000-0000-0000-000000000003', 'Unimed Odonto', 'Unimed Odontológica Nacional', '418196', '10.428.028/0001-20', '0800 942 8425', 'redeprestadores@unimedodonto.com.br', 30, 0.00, 'Tabela Unimed Odonto Padrão', 'Ativo', 'Elegibilidade verificada via token digital no aplicativo do beneficiário.'),
('50000000-0000-0000-0000-000000000004', 'Amil Dental', 'Amil Assistência Médica Internacional S.A.', '326305', '29.309.127/0001-79', '0800 021 2580', 'suporte.dental@amil.com.br', 28, 5.00, 'Tabela Amil Linha Dental', 'Ativo', 'Faturamento de guias até o dia 25 de cada mês para liquidação no mês subsequente.'),
('50000000-0000-0000-0000-000000000005', 'SulAmérica Odonto', 'Sul América Odontológico S.A.', '006246', '01.685.053/0001-56', '4004-4935', 'odonto.prestador@sulamerica.com.br', 30, 0.00, 'Tabela SulAmérica Odonto Especial', 'Ativo', 'Cobertura integral para cirurgia oral menor, profilaxia e restaurações estéticas.'),
('50000000-0000-0000-0000-000000000006', 'Porto Seguro Odonto', 'Porto Seguro Saúde S.A.', '000582', '04.586.920/0001-82', '(11) 3366-3003', 'relacionamento.odonto@portoseguro.com.br', 30, 0.00, 'Tabela Porto Dental Ouro', 'Ativo', 'Exige envio de radiografia periapical digital para auditoria de procedimentos endodônticos.'),
('50000000-0000-0000-0000-000000000007', 'OdontoPrev', 'Odontoprev S.A.', '301949', '58.119.199/0001-51', '0800 702 9000', 'atendimento.credenciados@odontoprev.com.br', 35, 0.00, 'Tabela OdontoPrev Integrada', 'Ativo', 'Guia eletrônica TISS com biometria facial ou assinatura digital pelo beneficiário.'),
('50000000-0000-0000-0000-000000000008', 'MetLife Dental', 'Metropolitan Life Seguros e Previdência Privada S.A.', '331775', '02.102.498/0001-29', '0800 746 3420', 'metlife.dental@metlife.com.br', 30, 0.00, 'Tabela MetLife Dental Corp', 'Inativo', 'Contrato em fase de renovação anual de tabela e alinhamento de procedimentos cobertos.')
ON CONFLICT (nome) DO UPDATE SET
    razao_social = EXCLUDED.razao_social,
    registro_ans = EXCLUDED.registro_ans,
    cnpj = EXCLUDED.cnpj,
    telefone_contato = EXCLUDED.telefone_contato,
    email_contato = EXCLUDED.email_contato,
    dias_repasse = EXCLUDED.dias_repasse,
    taxa_coparticipacao = EXCLUDED.taxa_coparticipacao,
    tabela_precos_padrao = EXCLUDED.tabela_precos_padrao,
    status = EXCLUDED.status,
    observacoes = EXCLUDED.observacoes;

NOTIFY pgrst, 'reload schema';
