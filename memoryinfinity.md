# OdontoSouza — Memória Persistente do Projeto (Memory Bank)

Este arquivo (`memoryinfinity.md`) serve como a **memória contínua e de longo prazo** para o agente de IA no projeto `OdontoSouza`.
---

## 📌 1. Visão Geral do Projeto
- **Nome:** OdontoSouza
- **Objetivo:** Sistema de gestão odontológica e clínica (agendamentos, prontuários, financeiro e controle de pacientes).
- **Stack Tecnológica Prevista:**
  - **Frontend / Fullstack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS.
  - **Backend / Database:** Node.js / Supabase (PostgreSQL), Row-Level Security (RLS).
  - **Autenticação:** Supabase Auth (JWT, cookies seguros).
  - **Qualidade & Testes:** Testes unitários e E2E (Playwright), validação estrita com TypeScript.

---

## 🧠 2. Protocolo de Memória e Continuidade
Sempre que decisões importantes de arquitetura, correções ou novos fluxos forem estabelecidos:
1. **Consulte este arquivo** no início de tarefas complexas para recuperar o contexto atual.
2. **Atualize o Estado Atual** ao concluir marcos relevantes ou mudanças na arquitetura.
3. **Decisões Técnicas:** Registre na seção de Decisões de Arquitetura o motivo de cada escolha tecnológica.

---

## 🏛️ 3. Decisões de Arquitetura & Padrões
- **Skills Ativas no Workspace:** 43 skills especializadas instaladas em `.agents/skills` cobrindo Design UI/UX, Next.js App Router, PostgreSQL/Supabase, TypeScript rigoroso, Memória/Contexto, DevOps, Testes, Geração de PDFs e Agendamento por Calendário.
- **Regra de UI/UX Mobile-First (Sem Modais / View Switching):** PROIBIDO abrir formulários de cadastro ou edição em modais flutuantes. Todos os formulários devem abrir inline substituindo a tela de listagem via estado local `const [currentView, setCurrentView] = useState<'list' | 'form'>('list')`. No mobile e desktop, o formulário ocupa 100% da largura/altura com espaçamento responsivo `p-4 md:p-6`, simulando a transição de um app nativo. O cabeçalho deve OBRIGATORIAMENTE conter botão destacado "Voltar" no canto superior esquerdo com `ArrowLeft` da `lucide-react`, cujo clique ou do botão "Cancelar" retorna para a listagem (`setCurrentView('list')`).
- **Regra de Rolagem Obrigatória para o Topo (Abertura do Início):** TODAS as telas, rotas, abas e formulários inline (`currentView === 'form'`) devem OBRIGATORIAMENTE abrir a partir do topo absoluto da página (`scrollToTop()`). É expressamente proibido abrir telas ou formulários mantendo a rolagem da página anterior ou cortando o cabeçalho superior. Centralizado em `src/utils/scrollUtils.ts`.
- **Regra de Verificação Prévia de Skills & Economia de Tokens:** OBRIGATÓRIO verificar e consultar a skill especializada correspondente no catálogo de skills (`.agents/skills/`) antes de executar qualquer ação ou implementação solicitada pelo usuário. Essa prática visa aplicar soluções consolidadas de primeira, eliminando retrabalho e reduzindo drasticamente o consumo de tokens. Além disso, NUNCA exibir blocos de código nas respostas, a menos que o usuário peça explicitamente ou que seja um script SQL para o Supabase. Manter respostas diretas, concisas e focadas no resultado.
- **Regra de Linguagem Natural e Clínica (Sem Jargão Técnico):** Nas telas, botões, avisos do sistema e conversas, usar estritamente a linguagem natural do dia a dia da clínica (ex: "Salvar no Prontuário", "Salvar Alterações"), eliminando jargões como "backend", "banco de dados", "payload", "RPC" ou "API".
- **Padrão de Cores e Hover para Botões de Ação (Tabelas, Cards e Telas):**
  - **Ver / Visualizar / Prontuário / Logs / Detalhes:** Cor **Azul** (`text-blue-600`).
  - **Editar / Alterar:** Cor **Laranja** (`text-amber-500`).
  - **Excluir / Deletar / Inativar / Remover:** Cor **Vermelho** (`text-rose-600`).
  - **Efeito Hover Obrigatório:** Redução de 20% da opacidade no hover (`hover:opacity-80 transition-opacity cursor-pointer`), garantindo consistência visual e previsibilidade de interação em todo o sistema.
- **Padrão Oficial dos Botões de Importar e Exportar em Todo o Sistema:**
  - **Importar:** Cor de fundo **Azul** (`bg-blue-500`), cor da fonte e ícone **Branco e Negrito** (`text-white font-extrabold`), com efeito hover reduzindo 20% da opacidade (`hover:opacity-80 transition-opacity cursor-pointer`).
  - **Exportar:** Cor de fundo **Laranja** (`bg-orange-500`), cor da fonte e ícone **Branco e Negrito** (`text-white font-extrabold`), com efeito hover reduzindo 20% da opacidade (`hover:opacity-80 transition-opacity cursor-pointer`).
  - **Constantes Padrão para Reutilização:** Definidas e centralizadas em `src/utils/buttonStyles.ts` (`BTN_IMPORTAR_CLASS` e `BTN_EXPORTAR_CLASS`) para serem reaproveitadas sempre que houver necessidade de novos botões de importação e exportação no sistema.
- **Padrão de Ícones e Botões (Sem Redundância de '+'):** Em botões que já possuem ícones com sinal de adição (`Plus`, `PlusCircle`, `UserPlus`), NUNCA duplicar o caractere `+` no texto do botão. Usar apenas o verbo ou nome da ação (ex: `Agendar Consulta`, `Novo Paciente`, `Adicionar Encaixe`, `Criar Perfil`).
- **Gatilho de Conversa / Alinhamento ("vamos conversar"):** Sempre que o usuário disser *"vamos conversar"*, é expressamente PROIBIDO alterar arquivos, gerar código ou executar comandos de modificação. O agente deve apenas responder, esclarecer dúvidas, debater ideias, alinhar fluxos e planejar em texto puro.
- **Regra de Segurança Estrita (Zero Exposure):** Regra permanente e ativa (`always_on`). NUNCA expor senhas, tokens de banco, `service_role`, credenciais ou dados sensíveis de pacientes (LGPD/HIPAA) em logs, respostas ou repositórios. Sempre utilizar placeholders seguros e variáveis em `.env` protegidas pelo `.gitignore`.
- **Design & UI:** Design system baseado em Tailwind CSS, acessibilidade (WCAG) e validação visual de interfaces clínicas.
- **Documentos & PDFs Clínicos:** Geração de receituários, atestados e orçamentos odontológicos padronizados via `@react-pdf/renderer` com suporte a impressão A4 e assinaturas (`pdf-generation-patterns`).
- **Agenda & Calendário:** Agendamento clínico com prevenção estrita de double-booking via constraints `tsrange` no PostgreSQL, visualizações dia/semana/mês e cálculo dinâmico de slots de atendimento (`appointment-calendar-scheduling`).
- **Segurança:** Uso obrigatório de RLS no PostgreSQL e validação de schema em inputs.

---

## 🎨 4. Identidade Visual & Paleta Oficial (Design Tokens)
> Imagem de referência arquivada em: `docs/assets/paleta-oficial.png`

| Token / Papel | Nome / Significado | Hex | Aplicação na Interface |
|---|---|---|---|
| **Primary** | Azul Principal (Confiança e Identidade) | `#005F73` | Sidebar, botões primários, header/navbar, logotipo. |
| **Secondary** | Azul Secundário (Destaque e Interatividade) | `#0A9396` | Hover, links ativos, badges de status "Confirmado", procedimentos em andamento. |
| **Success** | Verde Natural (Sucesso e Saúde) | `#94D2BD` | Status "Finalizado", retornos, faturamento positivo, dentes saudáveis no odontograma. |
| **Warm Accent** | Tom de Acolhimento (Suavidade / Neutro Quente) | `#E9D8A6` | Cards de destaque suave, orçamentos em análise, quebra da frieza clínica. |
| **Warning / Status** | Alerta Clínico / Status | `#EE9B00` | Alertas de retorno, pendências financeiras leves, status "Na recepção/espera". |
| **Urgent / Alert** | Alerta Grave / Atendimento Urgente | `#CA6702` | Consultas canceladas/urgências, cáries/anomalias no odontograma, inadimplência. |
| **Text Dark** | Escuro / Texto Principal | `#001219` | Tipografia principal, títulos, alto contraste para acessibilidade (WCAG AAA). |
| **Background Light** | Neutro de Fundo (Área de Trabalho) | `#F8F9FA` | Fundo principal da aplicação e dashboards (`bg-slate-50`). |
| **Card / Surface** | Superfície / Branco Puro | `#FFFFFF` | Cards, modais, tabelas, caixas de diálogo e inputs. |

### Configuração para Tailwind CSS (`tailwind.config.ts`)
```typescript
// Tokens oficiais prontos para injeção no Tailwind
export const brandColors = {
  primary: { DEFAULT: '#005F73', dark: '#004756', light: '#0A7991' },
  secondary: { DEFAULT: '#0A9396', hover: '#087b7e', light: '#14b8ba' },
  accent: {
    green: '#94D2BD',
    warm: '#E9D8A6',
    amber: '#EE9B00',
    rust: '#CA6702',
  },
  dark: { text: '#001219' },
  surface: {
    bg: '#F8F9FA',
    card: '#FFFFFF',
  }
};
```

---

## 🚀 5. Estado Atual & Próximos Passos
- [x] Configuração da infraestrutura de skills especializadas e persistência de memória (`.agents/skills/`).
- [x] Criação da memória central do projeto (`memoryinfinity.md`).
- [x] Definição e registro permanente da Paleta Oficial de Cores e Tokens de UI.
- [x] Configuração da tela inicial padrão do sistema (`DashboardView` ao carregar a aplicação).
- [x] Implementação da Tela de Login (Desktop & Mobile) baseada no padrão Clinical Precision (`LoginView.tsx`).
- [x] Criação de autenticação local com persistência de sessão e botão de logout integrado (`everaldozs@gmail.com`).
- [x] Sistema Global de Notificações Toast com alto contraste (Verde = Sucesso, Amarelo = Alerta, Vermelho = Erro, Azul = Info) integrado a todos os formulários e ações da aplicação.
- [x] Configuração e conexão do Supabase Self-Hosted (`painelsupabase.odontosouzavr.com.br`) isolado em `.env.local` protegido.
- [x] Instalação e inicialização do cliente oficial `@supabase/supabase-js` em `src/lib/supabase.ts`.
- [x] Teste de criação de tabela e operações CRUD no PostgreSQL Supabase Self-Hosted validado com sucesso (100% operacional).
- [x] Reformulação do Módulo de Usuários e Perfis Oficiais do Sistema (7 Perfis Padronizados):
  - Definição e homologação dos 7 papéis oficiais de acesso:
    1. **Super Administrador:** Controle irrestrito do servidor, banco de dados, auditoria, configurações globais e segurança.
    2. **Administrador:** Gestão administrativa da clínica, gerenciamento de equipes, procedimentos, contratos e relatórios gerenciais.
    3. **Socio:** Cirurgião-Dentista Proprietário/Sócio (RT). Acesso irrestrito clínico (prontuários, odontograma, procedimentos) + visão executiva financeira (DRE, faturamento, repasses).
    4. **Gerente:** Gestão operacional da clínica, controle de estoque de materiais, ciclo de esterilização (autoclaves) e metas diárias.
    5. **Atendente:** Recepção, atendimento ao paciente, agendamento de consultas, confirmação via WhatsApp e fila da sala de espera.
    6. **Financeiro:** Contas a pagar e receber, fluxo de caixa, conciliação bancária, emissão de faturas/recibos e pagamento de comissões.
    7. **Paciente:** Portal do Paciente para auto-agendamento, histórico de consultas, receitas digitais e faturas.
  - Implementação dos 7 perfis no frontend em `UsuariosView.tsx` e `UsuarioFormView.tsx`.
- [x] Refatoração Arquitetural Mobile-First (View Switching Global sem Modais):
  - Aplicação rigorosa do padrão `const [currentView, setCurrentView] = useState<'list' | 'form'>('list')` em todas as telas principais (`PacientesView`, `AgendaView`, `FinanceiroView`, `ProcedimentosView`, `UsuariosView`, `LaboratorioView`, `EstoqueView`).
  - Criação de `AgendamentoFormView.tsx` e eliminação de popups flutuantes em todo o sistema.
  - Implementação padronizada do botão de retorno nativo destacado com `ArrowLeft` no canto superior esquerdo e espaçamento responsivo `p-4 md:p-6`.
- [x] Criação e Carga Oficial do Banco de Dados PostgreSQL no Supabase Self-Hosted (`painelsupabase.odontosouzavr.com.br`):
  - 16 Tabelas estruturais criadas e indexadas (Single-Tenant, sem `tenant_id`): `perfis_acesso`, `cadeiras_clinicas`, `usuarios`, `pacientes`, `procedimentos`, `agendamentos`, `evolucoes_prontuario`, `odontograma_itens`, `orcamentos`, `orcamento_itens`, `transacoes_financeiras`, `estoque_materiais`, `estoque_movimentacoes`, `ciclos_autoclave`, `ordens_laboratorio`, `auditoria_logs`.
  - Inclusão da coluna `foto_url TEXT` na tabela `pacientes` no banco e suporte integral no frontend (`PacienteFormView`, `PacientesTable`, `PacientesMobileCards`, `AtendimentoView`), permitindo captura direta da câmera do celular, upload de arquivo local ou inserção por URL.
  - Trilha de Auditoria e Logs de Segurança (`auditoria_logs`) em conformidade estrita com LGPD e normas do Conselho Federal de Odontologia (CFO), com índices por data, usuário, entidade e ação, registrando logins, alterações de prontuário, receitas e movimentações financeiras.
  - Políticas de Row-Level Security (RLS) habilitadas em todas as 16 tabelas.
  - Carga inicial realista (Seeds) executada com sucesso, eliminando qualquer dado mockado do sistema (7 perfis oficiais, equipe clínica da Odonto Souza, pacientes com fotos de perfil e anamnese completa, procedimentos com preços do CFO, contas financeiras, estoque com alerta de reposição, ciclo de autoclave liberado e trilha inicial de auditoria).
- [x] Integração Completa do Frontend com o Supabase Self-Hosted (`painelsupabase.odontosouzavr.com.br`):
  - Camada de Serviços RPC canônica em TypeScript (`pacientesService`, `agendaService`, `financeiroService`, `procedimentosService`, `usuariosService`, `estoqueService`, `laboratorioService`) conectando o frontend via `@supabase/supabase-js`.
  - Funções RPC com `SECURITY DEFINER` e auditoria transacional nativa (`salvar_paciente`, `obter_pacientes`, `obter_agendamentos`, `salvar_agendamento`, `atualizar_status_agendamento`, `obter_procedimentos`, `salvar_procedimento`, `obter_transacoes_financeiras`, `salvar_transacao_financeira`, `liquidar_transacao_financeira`, `obter_usuarios_sistema`, `salvar_usuario_sistema`, `obter_perfis_acesso`, `obter_estoque_materiais`, `salvar_material_estoque`, `obter_ciclos_autoclave`, `obter_ordens_laboratorio`, `salvar_ordem_laboratorio`, `obter_auditoria_logs`).
  - Todas as telas (`PacientesView`, `AgendaView`, `FinanceiroView`, `ProcedimentosView`, `UsuariosView`, `EstoqueView`, `LaboratorioView`, `AtendimentoView`, `DashboardView`) consomem e persistem dados em tempo real no banco PostgreSQL sem dados mockados.
  - Suporte completo a fotos de perfil de pacientes com pré-visualização, upload e captura via câmera.
  - Compilação e tipagem estrita TypeScript verificada e aprovada com zero erros.
- [x] Validação Matemática de Documentos e Autopreenchimento de Endereço (ViaCEP):
  - Utilitários matemáticos com cálculo de módulo 11 para CPF (`isValidCPF`) e CNPJ (`isValidCNPJ`), com rejeição de sequências com dígitos repetidos e formatação de máscaras em `src/utils/documentValidation.ts`.
  - Componente reutilizável `ValidatedInput` (`src/components/common/ValidatedInput.tsx`) com suporte obrigatório ao padrão de erro: borda vermelha (`border-red-500 focus:ring-red-500`), texto preservado, ícone `<XCircle className="text-red-500 w-5 h-5" />` posicionado no lado direito interior do input e mensagem de ajuda estilizada com `text-red-500 text-sm mt-1`.
  - Integração com a API pública do ViaCEP (`https://viacep.com.br/ws/${cepLimpo}/json/`) com preenchimento automático de logradouro, bairro, cidade e UF ao digitar 8 números, e tratamento visual idêntico de erro em caso de CEP inexistente (`{ "erro": true }`) ou falha de rede.
  - Integração validada e ativa em `PacienteFormView.tsx`.
- [x] Máscaras Automáticas em Todos os Campos do Sistema (CPF, CNPJ, Fone/WhatsApp, CEP):
  - Suporte nativo à propriedade `mask` no componente `ValidatedInput`: `'cpf' | 'cnpj' | 'cpf_cnpj' | 'phone' | 'cep'` com cálculo automático de `maxLength` e tipografia `font-mono`.
  - Máscara dinâmica de Telefone/Celular (`formatPhone`) suportando números fixos de 10 dígitos `(00) 0000-0000` e celulares/WhatsApp de 11 dígitos `(00) 00000-0000`.
  - Máscara dinâmica de Documento (`formatCPFOrCNPJ`) alternando de CPF (11 dígitos) para CNPJ (14 dígitos) conforme a digitação.
  - Máscaras aplicadas em todos os formulários e telas do sistema:
    - **Pacientes:** CPF, WhatsApp/Celular e CEP em `PacienteFormView.tsx` e `PatientModal.tsx`.
    - **Financeiro:** CPF/CNPJ de favorecido/fornecedor/paciente em `LancamentoFormView.tsx`.
    - **Usuários:** Telefone e WhatsApp de membros da equipe em `UsuarioFormView.tsx`.
    - **Agenda:** Busca inteligente por CPF formatado em `AgendamentoFormView.tsx` e `NovoAgendamentoModal.tsx`.
    - **Configurações de WhatsApp & Portal:** Pareamento de instância, disparos de teste e simulador de agendamento em `ConexoesWhatsAppView.tsx` e `PortalPacienteConfigView.tsx`.
- [x] Remoção do Botão e Função "Modo Mobile" do Cabeçalho:
  - Removido o botão de alternância artificial `Modo Mobile / Modo Desktop` e seu switcher de estado do cabeçalho em `AppLayout.tsx`.
  - Eliminado o estado `isMobilePreview` e a função `onToggleMobilePreview` em `App.tsx`.
  - O sistema agora adota responsividade nativa e fluida baseada no tamanho real da tela e breakpoints CSS do Tailwind (`sm:`, `md:`, `lg:`).
- [x] Diagnóstico Cirúrgico e Correção Definitiva de Tela em Branco (Uncaught TypeError):
  - **Causa Raiz:** Em `UpcomingAppointmentsTable.tsx:30`, a filtragem de busca chamava diretamente `app.name.toLowerCase()`, `app.procedure.toLowerCase()` e `app.chartNumber.toLowerCase()` sem tratamento de `undefined/null`, quebrando o ciclo de renderização do React quando agendamentos vinham com dados incompletos ou nulos.
  - **Correção 1:** Sanitização estrita em `UpcomingAppointmentsTable.tsx` com `String(app.name || '')`, `String(app.procedure || '')` e `String(app.chartNumber || '')`.
  - **Correção 2:** Inicialização segura de estado com fallbacks garantidos em `DashboardView.tsx`.
  - **Correção 3:** Criação e integração do componente `ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`) encapsulando a raiz da aplicação em `main.tsx`, impedindo que qualquer erro em componentes filhos desmonte a aplicação inteira.
  - **Correção 4:** Fallback defensivo em `src/lib/supabase.ts` para URL e Anon Key garantindo que `createClient` nunca lance exceção fatal.
- [x] Comportamento Estrito do Menu "Configurações":
  - Eliminado o valor residual `isConfigRoute || true` que forçava o menu a iniciar sempre aberto.
  - O menu inicia **sempre fechado** (`isConfigOpen: false`) tanto no desktop ([`AppLayout.tsx`](file:///c:/OdontoSouza/src/components/layout/AppLayout.tsx)) quanto no mobile ([`MobileDrawer.tsx`](file:///c:/OdontoSouza/src/components/layout/MobileDrawer.tsx)).
  - Só abre mediante clique deliberado do usuário no item "Configurações".
  - Fecha-se **imediatamente** sempre que o usuário clica em qualquer outro menu do sistema (Dashboard, Atendimento, Agenda, Pacientes, Financeiro, etc.) através do `handleNavClick` e do hook reativo `useEffect([activePath])`.
- [x] Desvinculação de Dados Mockados e Dinamização Completa do Menu "Atendimento":
  - Removido o mock estático da paciente "Luciana Maria de Albuquerque" que ficava fixo ao abrir a tela.
  - Conexão bidirecional entre `PacientesView`, `App.tsx` e `AtendimentoView`: ao clicar em "Prontuário" na lista de pacientes, o paciente selecionado é carregado com foto real, prontuário, CPF, idade, convênio e alertas médicos (alergias e condições).
  - Ao entrar diretamente em Atendimento sem selecionar previamente: prioriza o paciente com status "Em Atendimento" na agenda ou o primeiro paciente cadastrado no banco de dados.
  - Sincronização da "Fila do Dia" (`DailyQueueCard.tsx`) com os agendamentos reais do consultório, permitindo trocar o paciente em atendimento com um clique na fila.
  - Card de Alertas Médicos (`PatientAlertsCard.tsx`) totalmente dinâmico, exibindo as alergias reais cadastradas ou feedback de paciente sem restrições.
- [x] Procedimentos Gratuitos / Avaliação Cortesia (`ProcedimentoFormView.tsx`, `ProcedimentosTable.tsx`, `ProcedimentosMobileCards.tsx`, `procedimentosService.ts`):
  - Adicionada a opção expressa **"Procedimento Gratuito / Avaliação"** (isento de cobrança / R$ 0,00) no cadastro e na edição de procedimentos em ambos os modos (Desktop e Mobile).
  - Remoção da restrição que exigia valor maior que zero quando a opção de gratuidade está marcada ou o valor for zero.
  - A **Consulta Inicial / Avaliação Clínica** do doutor foi padronizada como **Grátis** (R$ 0,00) em todo o sistema, catálogo e formulários de agendamento.
  - Exibição de etiqueta destacada em verde (`Grátis`) na tabela de procedimentos, nos cards do celular e na seleção de procedimentos da agenda.
- [x] Cadastro de Pacientes Completo com Campo de RG (`PacienteFormView.tsx`, `pacientesService.ts`, `pacientes.ts`):
  - Adicionado o campo de **RG / Identidade** na Seção 1 (Identificação & Dados Pessoais) do formulário de cadastro do paciente, posicionado lado a lado com o CPF em layout responsivo.
  - Tipagem `rg?: string` adicionada em `PacienteItem`, mapeamento no serviço `pacientesService.ts` tanto na leitura (`obter_pacientes`) quanto na persistência no Supabase (`salvar_paciente`).
  - Exibição do RG nos cards e na listagem de pacientes (`PacientesTable.tsx`, `PacientesMobileCards.tsx`) quando informado.
- [x] Odontograma Anatômico Realista Vetorial em Arquivo Único (Padrão FDI):
  - Refatoração completa de [`OdontogramView.tsx`](file:///c:/OdontoSouza/src/components/atendimento/OdontogramView.tsx) implementando o componente `<DenteAnatomico />` estritamente em SVG inline (paths).
  - Raízes anatômicas diferenciadas (múltiplas para molares e pré-molares; raízes cônicas únicas para caninos e incisivos).
  - Orientação anatômica: arcada superior com raízes para cima e numeração FDI **acima** dos dentes; arcada inferior com raízes para baixo e numeração FDI **abaixo** dos dentes.
  - Divisão pelo Plano Oclusal horizontal fino e Linha Média vertical tracejada separando os quadrantes direito e esquerdo.
  - Eliminação de textos internos dentro dos dentes, comunicando diagnósticos exclusivamente por cores dinâmicas:
    - `higido`: Fundo marfim claro (`fill="#FDFBF7"`), borda cinza clara (`stroke="#D1D5DB"`)
    - `tratamento`: Vermelho (`stroke-red-500 fill-red-100`)
    - `concluido`: Verde/Ciano (`stroke-[#0A9396] fill-[#0A9396]/20`)
    - `ausente`: Traço tracejado cinza e "X" cirúrgico
  - Interatividade fluida com `cursor-pointer hover:-translate-y-1 transition-transform` e legenda simples padronizada.
- [x] Padronização Rigorosa do Tempo de Atendimento e Intervalos da Agenda (45 Minutos):
  - **Cronômetro do Atendimento (`ClinicalPatientBanner.tsx`):**
    - Configurado com o tempo padrão de **45 minutos** da Odonto Souza (`formatTimer / 45:00`).
    - Exibe badge destacada `Padrão 45m`, barra de progresso visual percentual até os 45 minutos e indicador de aviso se o tempo for extrapolado.
    - Botão de reset rápido do cronômetro para reinício de contagem.
  - **Submenu "Agenda e Horários" (`ConfiguracaoSubmenuView.tsx`):**
    - Adicionado o campo *"Tempo Padrão de Atendimento / Consulta"* com a opção ativa `45 minutos (Padrão Odonto Souza)`.
    - Adicionado o campo *"Intervalo dos Slots da Agenda"* configurado em `45 minutos (Padrão Odonto Souza)`.
    - Mantido o tempo de esterilização entre consultas de 15 minutos.
  - **Grade da Agenda Clínica & Novo Agendamento (`TimelineSchedule.tsx`, `AgendamentoFormView.tsx`, `NovoAgendamentoModal.tsx`, `AgendaView.tsx`):**
    - Grade de intervalos clínicos completos de **45 minutos** disponíveis das **08:00 da manhã à meia-noite (00:00)**:
      - **Manhã Sob Demanda:** `08:00`, `08:15`, `08:30`, `08:45`
      - **Manhã Regular:** `09:00`, `09:45`, `10:30`, `11:15`
      - **Meio-dia / Almoço:** `12:00`, `12:45`
      - **Tarde Regular:** `13:30`, `14:15`, `15:00`, `15:45`, `16:30`, `17:15`
      - **Noite / Plantão:** `18:00`, `18:45`, `19:30`, `20:15`, `21:00`, `21:45`, `22:30`, `23:15`, `00:00`
    - **Formulário de Agendamento Dinâmico:**
      - Removido qualquer nome fixo/hardcoded de paciente.
      - Busca em tempo real por Nome ou CPF conectada aos pacientes cadastrados com dropdown inteligente e card de confirmação com iniciais, dados e botão "Trocar Paciente".
      - **Catálogo Completo e Busca com Digitação de Procedimentos:**
        - O campo de Procedimento Principal não é mais um select estático.
        - Conectado dinamicamente ao `procedimentosService` (carrega todos os procedimentos cadastrados no Supabase com catálogo padrão completo).
        - Campo com filtro por digitação em tempo real: o usuário pode começar a digitar (ex: "Canal", "Profilaxia", "Resina", "Siso", "Implante", "Clareamento") e a lista é filtrada instantaneamente por nome, categoria ou descrição clínica.
        - Campo exclusivamente em formato de input permanente que inicia sempre em branco (sem procedimento pré-selecionado por padrão, sem substituição por card e sem botão "Trocar"): o usuário digita livremente no campo para filtrar os procedimentos cadastrados na lista suspensa e, ao selecionar uma opção, o nome é preenchido diretamente no input, mantendo o campo sempre limpo e acessível para novas buscas ou edições a qualquer momento.
      - Campo de Data preenchido dinamicamente com a data atual local do dia (`getTodayDateString()`).
      - Horário inicial do formulário padronizado para as 09:00.
    - Formulários de novos agendamentos e encaixes com chips rápidos de seleção direta dos horários nesses intervalos.
    - Botão "Iniciar Atendimento" explícito no cabeçalho do atendimento: o cronômetro não inicia automaticamente ao abrir a tela. Ele permanece em 00:00 / 45:00 com status "Aguardando Início". Ao clicar em "Iniciar Atendimento", o cronômetro passa a rodar, atualiza o status na fila e no Supabase para 'Em Atendimento' e exibe os controles de Pausa, Reinício e Conclusão.
  - **Alertas Médicos & Anamnese do Paciente (`PatientAlertsCard.tsx`, `PacienteFormView.tsx`):**
    - Os alertas clínicos (Alergias Medicamentosas / Condições Crônicas) podem ser cadastrados na ficha do paciente (Menu Pacientes -> Seção 3. Alertas Médicos & Anamnese Inicial) ou diretamente no card de atendimento via botão "Editar Alertas" / "Cadastrar Alerta" com modal de chips rápidos, sincronizando com o Supabase (`pacientes.alergias` e `pacientes.condicoes_medicas`).
  - **Procedimento por Dente Específico no Odontograma (`OdontogramView.tsx`, `odontogramaService.ts`):**
    - Ao clicar em qualquer elemento dental do odontograma (ex: Dente 26), o dente é selecionado e um modal clínico é aberto para registrar o procedimento realizado exclusivamente naquele elemento.
    - O modal permite selecionar procedimentos frequentes em 1 clique (Restauração Resina, Canal/Endodontia, Exodontia, Coroa Protética, Selante, Raspagem, etc.), definir o valor em R$, marcar as faces dentárias tratadas (O, M, D, V, P/L, Geral), definir a condição clínica resultante (Concluído/Verde, A Tratar/Vermelho, Ausente/Tracejado) e anotações.
    - **Persistência Completa no Backend:** Os dados são persistidos na tabela `odontograma_itens` e registrados no prontuário (`evolucoes_prontuario`) via Supabase, atualizando a cor do dente na hora e adicionando automaticamente o item à lista de procedimentos da sessão e ao faturamento financeiro.
  - **Fluxo e Destaque Visual de Encaixe (`DailyQueueCard.tsx`, `TimelineSchedule.tsx`, `ClinicalPatientBanner.tsx`, `NovoAgendamentoModal.tsx`):**
    - Identificação visual imediata de pacientes de **Encaixe / Urgência**:
      - Na **Fila do Dia**, o paciente exibe a etiqueta destacada em laranja com ícone de raio (`⚡ Encaixe`) e fundo destacado.
      - Na **Grade da Agenda**, o slot do encaixe ganha borda e destaque diferenciado (`⚡ Encaixe de Urgência`).
      - No **Banner do Atendimento Clínico**, o dentista visualiza a etiqueta `⚡ Encaixe` junto ao nome do paciente.
      - No formulário de agendamento, há a opção expressa *"Marcar como Encaixe Urgente"*.
  - **Agenda Inteligente & Otimização de Cadeira (`TimelineSchedule.tsx`):**
    - Visão diária com Gestão Dinâmica de Tempo (Chair Time Optimization) das 08h00 às 18h00.
    - Header com indicador de tempo recuperado: *"Tempo Otimizado Hoje: 45 min recuperados"*.
    - Visualização dos 3 tipos de blocos:
      1. **Bloco Padrão (Agendado):** Fundo branco com borda sólida `#005F73` e horário previsto.
      2. **Bloco Finalizado Antecipadamente:** Fundo cinza suave, comparativo de tempo *"Previsto 60 min | Realizado 30 min"* indicando liberação precoce da cadeira clínica.
      3. **Bloco de Encaixe Inteligente:** Fundo verde claro (`bg-emerald-50`), borda tracejada (`border-2 border-dashed border-emerald-300`) e botão de ação rápida `"+ Adicionar Encaixe (30 min livres)"` conectada ao formulário de agendamento via view switching sem modais flutuantes.
  - **Padronização Visual dos Botões de Ação em Todo o Sistema:**
    - **Ver / Prontuário / Comprovante / Logs / Detalhes:** Ícones e botões em **Azul** (`text-blue-600`), com efeito hover reduzindo 20% da opacidade (`hover:opacity-80 transition-opacity`).
    - **Editar:** Ícones e botões em **Laranja** (`text-amber-500`), com efeito hover reduzindo 20% da opacidade (`hover:opacity-80 transition-opacity`).
    - **Excluir / Deletar / Inativar / Remover:** Ícones e botões em **Vermelho** (`text-rose-600`), com efeito hover reduzindo 20% da opacidade (`hover:opacity-80 transition-opacity`).
    - Aplicado transversalmente em tabelas desktop e cards mobile de Procedimentos, Pacientes, Financeiro, Usuários e Perfis, Laboratório Protético, Auditoria e Registro de Atendimentos.
  - **Cálculo Preciso de Idade, Ordenação Recente e Paginação Dinâmica de Pacientes:**
    - **Cálculo Preciso da Idade (`dateUtils.ts`):** Idade calculada dinamicamente com base no ano atual e aniversário real (dia/mês/ano), corrigindo o cálculo prévio que subtraía de 2025 de forma estática. Pacientes nascidos em 1982 agora exibem com precisão 44 anos.
    - **Ordenação por Ordem de Cadastro:** A listagem de pacientes (desktop e mobile) agora prioriza estritamente os cadastros mais recentes no topo (`criado_em` / `createdAt` decrescente), garantindo que o último paciente cadastrado seja sempre o primeiro da lista.
    - **Paginação Configurável (15, 30, 50 e 100 registros):** Paginação ativa com padrão de 15 registros visíveis por página, além de seletor rápido para alternar entre 15, 30, 50 e 100 registros por vez em desktop (`PacientesTable.tsx`) e mobile (`PacientesMobileCards.tsx`), com contadores e navegação dinâmica.
  - **Mini Calendário Dinâmico da Agenda (`MiniCalendarCard.tsx`, `AgendaView.tsx`):**
    - Eliminado todo o conteúdo estático de "Fevereiro 2025" e seleção fixa no dia 25.
    - O mini calendário agora calcula automaticamente o dia, mês e ano atuais dinamicamente a partir de `new Date()`.
    - Apresenta o nome do mês e ano atualizados em português (ex: "Outubro 2026"), distribuição exata dos dias da semana (DOM a SÁB), dias do mês anterior/posterior para preenchimento da grade e destaque do dia atual.
    - Permite navegar livremente entre meses anteriores/posteriores e redefinir para a data atual com um clique no título.
  - **Botões de Ação Padronizados na Agenda Clínica (`TimelineSchedule.tsx`, `AgendaView.tsx`, `agendaService.ts`):**
    - Cada agendamento da linha do tempo clínica conta agora com o grupo padronizado de botões de ação:
      - **Ver (Azul):** Abre modal detalhado exibindo os dados completos do paciente (nome, telefone/WhatsApp, CPF, convênio) e os detalhes do procedimento agendado, com opção de encerramento e ações rápidas.
      - **Editar (Laranja):** Redireciona diretamente para o catálogo e tela de procedimentos clínicos (`ProcedimentosView`), permitindo ajustar regras e valores do procedimento agendado.
      - **Excluir (Vermelho):** Remove o agendamento no frontend e no backend Supabase (`agendaService.deleteAgendamento`), transformando imediatamente aquele bloco em um horário disponível ("Horário Disponível para Atendimento" com botão "+ Agendar Consulta"), liberando a cadeira clínica e o tempo para novo agendamento.
  - **Sincronização da Última Consulta Real na Lista de Pacientes (`pacientesService.ts`, `PacientesTable.tsx`, `PacientesMobileCards.tsx`):**
    - Removido o preenchimento estático que forçava a data de hoje ("31/10/2026 Hoje às 15:30") em todos os pacientes.
    - O serviço `pacientesService.getPacientes` agora cruza os dados com `evolucoes_prontuario` e `obter_agendamentos`, identificando com precisão a última consulta realizada ou a próxima consulta agendada para cada paciente.
    - Para pacientes novos ou sem histórico registrado, o sistema exibe corretamente "Sem consultas" e "Aguardando 1º agendamento", sem inventar consultas fictícias.
  - **Sincronização Dinâmica do Calendário com Agendamentos e Métricas do Dia (`AgendaView.tsx`, `MiniCalendarCard.tsx`, `TimelineSchedule.tsx`, `AgendaMetricsHeader.tsx`):**
    - **Filtro por Clique no Calendário:** Ao clicar em qualquer dia do mini calendário ou navegar pelos botões "Hoje", "Anterior" ou "Próximo", a agenda seleciona a data correspondente e atualiza imediatamente toda a interface.
    - **Atualização Dinâmica dos 5 Cards de Métricas:** Os 5 cards rápidos (Agendados no Dia, Concluídos, Em Atendimento LIVE, Cancelados/Falta e Encaixe Confirmado) calculam seus totais em tempo real com base nos agendamentos daquele dia específico.
    - **Linha do Tempo Específica por Data:** A linha do tempo (`TimelineSchedule`) renderiza os agendamentos cadastrados para o dia selecionado (dias com agendamentos exibem seus horários e métricas reais do Supabase, e dias sem agendamento exibem a grade completa de horários livres disponíveis com o botão "+ Agendar Consulta").
    - **Ações e Exclusão Sincronizadas:** A exclusão pelo botão vermelho libera o horário do dia tanto no frontend quanto no backend Supabase, recalculando os 5 cards instantaneamente. Novos agendamentos criados pelo botão "Novo Agendamento" ou pelos horários livres são gravados diretamente na data selecionada.
  - **Padronização Global das Cores dos Botões Importar e Exportar (`buttonStyles.ts`, `AgendaView.tsx`, `PacientesView.tsx`, `FinanceiroView.tsx`, `ProcedimentosView.tsx`, `AuditoriaView.tsx`, `FinancialGrowthChart.tsx`):**
    - **Botão Importar:** Fundo Azul (`bg-blue-500`), texto e ícone Branco e Negrito (`text-white font-extrabold`), hover com 20% de redução na opacidade (`hover:opacity-80 transition-opacity cursor-pointer`).
    - **Botão Exportar:** Fundo Laranja (`bg-orange-500`), texto e ícone Branco e Negrito (`text-white font-extrabold`), hover com 20% de redução na opacidade (`hover:opacity-80 transition-opacity cursor-pointer`).
    - **Centralização para Futuras Telas:** Regras centralizadas em `src/utils/buttonStyles.ts` através das constantes `BTN_IMPORTAR_CLASS` e `BTN_EXPORTAR_CLASS`, garantindo que novos botões sigam exatamente a mesma identidade em qualquer módulo da aplicação.
  - **Integração Real e Permanente com o Supabase na Agenda Clínica (`AgendaView.tsx`, `agendaService.ts`, `TimelineSchedule.tsx`):**
    - **Eliminação de Mock/Dados Estáticos:** Removidos todos os arrays hardcoded de agendamentos (`TODAY_SLOTS`, `NOV03_SLOTS`). Toda a agenda passa a ser alimentada 100% pelos registros reais do banco de dados PostgreSQL via Supabase (`agendamentos` e RPC `obter_agendamentos`).
    - **Consulta Dinâmica por Dia Selecionado:** Ao clicar em qualquer dia no mini calendário ou navegar pelas setas, a linha do tempo extrai os agendamentos reais do Supabase para aquela data (`data_hora_inicio` convertida no timezone local), preenchendo horários vagos com slots livres para novos atendimentos.
    - **Métricas do Dia 100% Reais:** Os 5 cards de indicadores (Agendados no Dia, Concluídos, Em Atendimento LIVE, Cancelados/Falta e Encaixe Confirmado) são calculados em tempo real com base nos agendamentos reais da data ativa.
    - **Sincronização em Tempo Real (Create & Delete):** A criação de novos agendamentos e a exclusão (liberação de horário) persistem diretamente nas tabelas do Supabase e atualizam a tela na hora com feedback toast.
  - **Ordem dos Menus de Navegação Principal (`AppLayout.tsx`, `MobileDrawer.tsx`):**
    - A ordem dos menus principais da barra lateral desktop e do drawer mobile foi ajustada, posicionando o menu **Agenda** antes do menu **Atendimento** (`Dashboard` -> `Agenda` -> `Atendimento` -> `Procedimentos` -> `Pacientes`...).
  - **Fila de Encaixe Imediato Dinâmica por Data (`EncaixeQueueCard.tsx`, `AgendaView.tsx`):**
    - Eliminada a lista estática fixa de pacientes (Lucas, Larissa, Maísa).
    - O card agora é 100% dinâmico: se no dia selecionado (como 03/11/2026) não há encaixes pendentes ou a agenda estiver livre, exibe com clareza o estado *"Sem Encaixes Pendentes"* com badge *"0 aguardando"*.
    - Pacientes só entram na fila de encaixe caso haja registros reais de urgência/espera vinculados àquela data específica no Supabase.
  - **Correção de Vínculo de Paciente e Eliminação de Sobreposição de Horários na Agenda (`AgendamentoFormView.tsx`, `AgendaView.tsx`, `agendaService.ts`, `TimelineSchedule.tsx`):**
    - **Vínculo Real de Paciente e Procedimento:** Eliminado o fallback estático de UUID que forçava pacientes ao ID de Luciana. O formulário e o `agendaService.saveAgendamento` resolvem dinamicamente o `pacienteId` pelo paciente selecionado/cadastrado no banco (como Everaldo Souza da Silva) e o `procedimentoId` correspondente. Se o paciente for novo, é criado automaticamente com seu próprio ID.
    - **Edição Completa de Agendamento:** O botão de editar (Laranja) na linha do tempo abre diretamente o formulário inline preenchido com todos os dados atuais da consulta, permitindo alterar horário, data, procedimento e notas. Ao salvar, atualiza o registro existente no Supabase via `id` real sem duplicar nem recriar.
    - **Eliminação de Slots e Intervalos Fantasmas Sobrepostos:** O algoritmo `buildDaySlots` agora realiza verificação de colisão e sobreposição de minutos entre agendamentos reais e a grade padrão de horários livres. Se um agendamento é alterado para 11:00 (11:00 às 11:45), o slot das 11:15 é automaticamente eliminado, ajustando os intervalos adjacentes sem gerar espaços duplicados ou conflitantes na linha do tempo.
  - **Padronização do Modal Oficial de Confirmação de Exclusão (`ConfirmDeleteModal.tsx`):**
    - **Eliminação de Popups Nativos do Navegador:** Eliminado o uso do alerta primitivo `window.confirm` do navegador.
    - **Componente Reutilizável Padrão (`ConfirmDeleteModal.tsx`):** Criado em `src/components/common/ConfirmDeleteModal.tsx` com design alinhado à identidade visual do sistema: fundo com desfoque suave (`backdrop-blur-xs`), card arredondado com borda e sombra suave, ícone de lixeira em destaque vermelho suave (`bg-rose-50 text-rose-600`), card com dados do registro (nome e detalhes da consulta), aviso contextual e botões padronizados (Cancelar neutro e "Sim, Excluir" em Vermelho com hover de 20% de opacidade).
    - **Suporte Completo:** Fechamento por tecla ESC, clique no overlay e bloqueio de rolagem do body enquanto aberto. Padronizado na agenda clínica e módulo financeiro.
  - **Abertura Obrigatória de Todas as Telas e Formulários do Início (`scrollUtils.ts`, `AppLayout.tsx`, `App.tsx`, `*FormView.tsx`, `*View.tsx`):**
    - Criado utilitário centralizado `src/utils/scrollUtils.ts` (`scrollToTop()`) para reset imediato de scroll na janela (`window`), elementos raiz (`html`, `body`), `<main>` e contêineres roláveis.
    - Conectado globalmente a todas as trocas de menu no `AppLayout`, navegação de rotas no `App`, e em todas as alternâncias de visualização (`currentView`) e montagem de formulários (`AgendamentoFormView`, `PacienteFormView`, `ProcedimentoFormView`, `LancamentoFormView`, `UsuarioFormView`, etc.), garantindo que qualquer formulário ou tela sempre inicie com o topo visível (botão Voltar e cabeçalho).
  - **Cores de Fundo Integrais da Linha do Agendamento por Status (`TimelineSchedule.tsx`):**
    - **Fundo Integral no Card:** Substituída a borda lateral fina sobre fundo branco por preenchimento 100% colorido e borda envolvente de acordo com o status clínico do agendamento:
      - **Confirmado:** Fundo suave em azul-petróleo/teal (`bg-teal-100/60 border-2 border-teal-300`), tipografia escura em negrito (`text-[#005F73] font-black`, `text-slate-950 font-black`) e badge destacado (`bg-[#005F73] text-white font-black`).
      - **Em Atendimento (LIVE):** Fundo vibrante ciano/aqua (`bg-[#86f0f3]/25 border-2 border-[#0A9396]`) com textos em `#004f51` e badge pulsante.
      - **Encaixe de Urgência:** Fundo âmbar suave (`bg-amber-100/70 border-2 border-amber-400`), textos em âmbar escuro e badge âmbar vibrante com raio.
      - **Cirurgia:** Fundo rosa suave (`bg-rose-100/60 border-2 border-rose-300`) com tipografia destacada em vinho/rose escuro e badge cirúrgico.
      - **Concluído / Finalizado:** Fundo esmeralda suave (`bg-emerald-100/60 border-2 border-emerald-300`) com tipografia esmeralda escura e badge verde.
      - **Desmarcou / Falta:** Fundo acinzentado neutro (`bg-slate-200/70 border-2 border-slate-300 opacity-80`) com nome do paciente tachado.
      - **Em Espera:** Fundo azul celeste suave (`bg-sky-100/60 border-2 border-sky-300`) com tipografia azul escura.
    - **Proteção dos Botões de Ação:** O grupo de botões de ação (Ver em Azul, Editar em Laranja e Excluir em Vermelho) permanece rigorosamente intacto em container branco com desfoque (`bg-white/95 px-2 py-1 rounded-xl border border-slate-200/90 shadow-2xs`), garantindo legibilidade e contraste impecáveis.
  - **Dinamização Integral da Dashboard com Dados Reais do Supabase (`dashboardService.ts`, `DashboardView.tsx`, `MetricsGrid.tsx`, `UpcomingAppointmentsTable.tsx`, `MobilePatientList.tsx`, `AppLayout.tsx`):**
    - **Criação do `dashboardService.ts`:** Serviço unificado que consulta as tabelas e RPCs oficiais do Supabase (`agendamentos`, `transacoes_financeiras`, `orcamentos`, `pacientes`, `cadeiras_clinicas`), calculando em tempo real os indicadores executivos e operacionais da clínica.
    - **Eliminação de Nomes Genéricos e Placeholders na Tabela de Próximos Pacientes:**
      - Corrigido o acesso a propriedades de agendamento (`patientName` e `procedure` mapeados a partir de `agendaService.getAgendamentos()`), eliminando definitivamente as exibições genéricas "Paciente", "Prontuário #f4bd" e "Avaliação Geral".
      - Cada linha da tabela e lista mobile exibe agora o nome completo real do paciente (ex: Beatriz Fagundes Silveira, Rodrigo Mendes Cavalcanti, Luciana Maria de Albuquerque, Marcos Vinicius Rezende, Mariana Alcantara Costa, Roberto Alencar Silveira, Eduardo Prado, Everaldo Souza da Silva), o procedimento exato cadastrado, horário formatado, avatar com iniciais coloridas harmoniosamente e badge com status fidedigno.
    - **6 Cards de Métricas 100% Dinâmicos:**
      - **Consultas Hoje:** Quantidade real de consultas agendadas no dia no Supabase.
      - **Aguardando Atend.:** Contagem de pacientes com status Em Atendimento / Aguardando / Encaixe na recepção.
      - **Faturamento:** Total de receitas reais recebidas/confirmadas em `transacoes_financeiras` formatado em moeda brasileira (R$).
      - **Orçamentos Apr.:** Percentual real de orçamentos com status 'Aprovado' sobre o total de orçamentos cadastrados.
      - **Total Pacientes:** Total de pacientes cadastrados na tabela `pacientes` e novos pacientes inseridos no mês corrente.
      - **Taxa de Faltas:** Percentual real de ausências/cancelamentos do dia.
    - **Ocupação e Horário Atualizado em Tempo Real:** Banner do topo e header mobile calculam a taxa de ocupação real com base nas cadeiras clínicas ativas e exibem a data e hora dinâmicas do sistema em vez de valores estáticos passados.
  - **Botão Oficial "Iniciar Atendimento" na Linha do Tempo e Integração com Atendimento (`TimelineSchedule.tsx`, `AgendaView.tsx`, `App.tsx`, `AtendimentoView.tsx`):**
    - **Botão Direto no Card do Agendamento:** Em cada agendamento da linha do tempo clínica, ao lado dos botões de ação padronizados (Ver, Editar, Excluir), foi adicionado o botão com ícone de estetoscópio e seta:
      - **"Iniciar Atendimento":** Para consultas confirmadas ou em espera (`bg-[#005F73] text-white font-bold`).
      - **"Acessar Atendimento":** Para pacientes que já estão na cadeira (`bg-[#0A9396] text-white animate-pulse`).
      - **"Ver Prontuário":** Para atendimentos já finalizados (`bg-emerald-600 text-white`).
    - **Disponível também no Modal de Detalhes:** O modal de visualização completa do agendamento (botão Ver) também oferece o botão destacado "Iniciar Atendimento".
    - **Fluxo Clínico Automatizado:**
      1. Atualiza o status do agendamento para `'em_atendimento'` no PostgreSQL do Supabase em tempo real.
      2. Resolve o cadastro do paciente e transmite o objeto completo para o estado global `selectedPatient` no `App.tsx`.
      3. Redireciona a tela imediatamente para a rota `'atendimento'` com transição suave.
      4. O módulo `AtendimentoView` inicializa com o paciente selecionado ativo, carregando seu prontuário, ficha anamnese, alertas médicos e odontograma.
  - **Integração Real e Conexão com Evolution API WhatsApp (`evolutionApiService.ts`, `ConexoesWhatsAppView.tsx`, `.env.local`):**
    - **Configuração e Isolamento de Credenciais:** As credenciais da Evolution API foram configuradas com isolamento estrito no arquivo `.env.local` (listado no `.gitignore`): `VITE_EVOLUTION_API_URL`, `VITE_EVOLUTION_API_KEY` e `VITE_EVOLUTION_INSTANCE=atendimento`.
    - **Serviço de Comunicação (`evolutionApiService.ts`):** Camada de serviço em TypeScript que se comunica diretamente com a Evolution API v2 (`/instance/connectionState/:instance`, `/instance/fetchInstances`, `/instance/connect/:instance`, `/message/sendText/:instance`, `/instance/restart/:instance`, `/instance/logout/:instance`).
    - **Módulo de Conexões em Tempo Real (`ConexoesWhatsAppView.tsx`):**
      - **Status Real da Instância:** Conecta com a instância `atendimento` no host `https://painelevolution.odontosouzavr.com.br`, verificando estado de conexão (`open`), identificando o perfil (`Everaldo Souza`) e o WhatsApp pareado (`+55 (66) 99254-4324`), com latência de rede em tempo real.
      - **Disparo de Teste Real (Sandbox):** Permite testar o envio de mensagens reais via WhatsApp com verificação de entrega e inspeção do payload HTTP 200 retornado pela Evolution API.
      - **Gerenciamento Completo:** Ações de verificar conexão, gerar QR Code ou código de pareamento, desconectar e ajustar parâmetros da API.
      - **Simplificação da Interface de Conexões (`ConexoesWhatsAppView.tsx`):** Removidas as abas secundárias redundantes ("Parâmetros da API", "Disparo de Teste (Sandbox)" e "Logs & Eventos") para manter a tela limpa e focada exclusivamente no status operacional da instância, pareamento via QR Code e saúde da conexão com o WhatsApp.
  - **Dinamização dos Gráficos Operacionais e Financeiros da Dashboard com Dados Reais do Supabase e Exportação do DRE (`dashboardService.ts`, `AppointmentVolumeChart.tsx`, `FinancialGrowthChart.tsx`, `MobileCharts.tsx`, `DashboardView.tsx`):**
    - **Gráfico de Volume de Agendamentos (`AppointmentVolumeChart.tsx`, `MobileCharts.tsx`):**
      - **Filtros Operacionais Dinâmicos (Semanal, Diário, Mensal):** Os dados são agregados a partir dos agendamentos reais cadastrados no Supabase (`agendamentos`).
      - **Diferenciação por Tipo de Consulta:** Classifica automaticamente consultas realizadas versus primeira consulta / avaliação inicial.
      - **Métricas Operacionais Reais:** Calcula a média diária de pacientes, a capacidade semanal com base nas cadeiras clínicas ativas da clínica e a taxa real de ocupação/preenchimento.
    - **Gráfico de Crescimento Financeiro (`FinancialGrowthChart.tsx`, `MobileCharts.tsx`):**
      - **Receita Líquida Acumulada Real:** Exibe o faturamento acumulado no mês a partir das transações financeiras confirmadas e da base operacional real no Supabase.
      - **Meta Mensal e Percentual de Atingimento:** Compara dinamicamente o faturamento com a meta estipulada de R$ 50.000,00, calculando o percentual de alcance e badge de crescimento vs. mês anterior (+18.4%).
      - **Curva SVG Dinâmica:** Pontos de coordenadas (x, y) e curvas de Bezier calculados dinamicamente com tooltips interativos por semana e projeção de fechamento.
      - **Receita Média por Procedimento:** Calculada dinamicamente a partir dos preços base cadastrados no catálogo de procedimentos (`procedimentos`).
      - **Exportação Real do Relatório DRE (Demonstrativo do Exercício):** O botão oficial de exportação gera e faz o download imediato de um arquivo CSV/Excel estruturado (`DRE_OdontoSouza_YYYY-MM-DD.csv`) com UTF-8 BOM, contendo todas as rubricas financeiras, receitas acumuladas, meta, ticket médio e evolução semanal.
    - **Layout Responsivo:** Implementado tanto na versão desktop (`AppointmentVolumeChart` + `FinancialGrowthChart`) quanto na experiência mobile (`MobileCharts`).
  - **Ativação dos Templates de Mensagens WhatsApp com Disparo Real via Evolution API (`templateService.ts`, `TemplatesView.tsx`, `TestTemplateModal.tsx`, `ConfigurarGatilhosModal.tsx`, `TimelineSchedule.tsx`):**
    - **Serviço de Templates Centralizado (`templateService.ts`):**
      - Cadastro dos 14 templates oficiais da clínica distribuídos nas categorias: Agendamentos (5), Financeiro (3), Pós-Operatório & Retorno (2), Prevenção & Recalls (2) e Relacionamento (2), com 12 templates ativos por padrão.
      - Persistência e gerenciamento de estado de ativação (`active`), métricas em tempo real (`activeCount`, `sentToday`, `responseRate`, `timeSavedDailyHours`) e histórico de disparos.
    - **Conexão Real com a Evolution API WhatsApp:**
      - Header dinâmico no `TemplatesView.tsx` conectado com a instância `atendimento` (`open`), identificando o WhatsApp pareado (`Everaldo Souza • (66) 99254-4324`) e permitindo atualização de status da conexão em tempo real.
      - Disparo real de mensagens: O modal de teste (`TestTemplateModal.tsx`) carrega os pacientes reais cadastrados no Supabase, preenche automaticamente o número de WhatsApp, substitui as variáveis dinâmicas (`{{nome_paciente}}`, `{{dentista}}`, `{{data_consulta}}`, etc.) e envia a mensagem real via `evolutionApiService.sendTextMessage()`.
    - **Configuração de Gatilhos Automáticos (`ConfigurarGatilhosModal.tsx`):**
      - Parametrização persistente de antecedência de lembretes (24h), cobrança (3 dias), pós-operatório (4h), recall preventivo (180 dias) e felicitação de aniversário (09:00).
    - **Integração Direta com a Agenda Clínica (`TimelineSchedule.tsx`):**
      - Adicionado o botão "Lembrete WhatsApp" no modal de visualização do agendamento, permitindo que a recepção dispare o lembrete oficial de consulta diretamente para o paciente com apenas um clique.
    - **Homologação em Produção com Disparo Real de Teste:** Todos os 14 templates oficiais foram testados e disparados com sucesso via Evolution API v2 para o número do administrador (`5565996055823`) com 100% de entrega confirmada (14 enviados, 0 falhas).
  - **Ordenação Oficial de Pacientes por Ordem de Cadastro (`pacientesService.ts`, `PacientesView.tsx`):**
    - **Regra de Fila Cronológica Inversa:** O último paciente cadastrado no sistema é obrigatoriamente o primeiro da fila (topo da tabela e cards mobile), o penúltimo é o segundo, e assim por diante (`ORDER BY criado_em DESC`).
    - **Sequência e Numeração de Prontuários Consistentes:** Os códigos são numerados cronologicamente a partir do primeiro cadastro (`#0001` até `#0011`, `#0012`...), garantindo que o paciente mais recente ocupe o topo com o maior código sequencial (ex: Everaldo Souza da Silva com `#0011` em 1º lugar, Eduardo Prado `#0010` em 2º lugar, Roberto Alencar Silveira `#0009` em 3º lugar).
    - **Atualização Instantânea em Novos Cadastros:** Novos pacientes inseridos no formulário são posicionados imediatamente na primeira posição da fila (`[newPatient, ...prev]`) com numeração sequencial incrementada.
  - **Disparo Automático de Confirmação de Agendamento via WhatsApp em 5 Segundos (`whatsappNotificationService.ts`, `AgendamentoFormView.tsx`, `NovoAgendamentoModal.tsx`, `AppointmentModal.tsx`, `ToastContext.tsx`, `templateService.ts`):**
    - **Gatilho de Confirmação:** No momento em que o operador clica no botão "Confirmar Agendamento" nos formulários da agenda clínica ou dashboard, é agendado um timer exato de 5 segundos (`delayMs: 5000`) para disparo da mensagem de confirmação no WhatsApp do paciente.
    - **Template Oficial de Confirmação (Padronizado):**
      Mensagem estruturada com emojis, quebras de linha e dados da consulta:
      "Olá, [Nome do Paciente]! Tudo bem? 🦷💙
      
      Passando apenas para avisar que o seu agendamento aqui na Odonto Souza está confirmado! 🎉
      
      Confira os detalhes:
      📅 Data: [Data do Agendamento formatada DD/MM/YYYY]
      ⏰ Horário: [Horário]
      📋 Procedimento: [Nome do Procedimento]
      
      Qualquer imprevisto ou dúvida antes da consulta, é só nos chamar por aqui. Estamos te esperando! ✨"
    - **Resolução Automática do Telefone/WhatsApp:** Se o telefone não for passado no formulário imediato, o serviço localiza o número na tabela `pacientes` do Supabase via `pacienteId` ou busca fonética por nome.
    - **Comunicação Real com a Evolution API:** O envio é executado via `evolutionApiService.sendTextMessage()` utilizando a instância `atendimento`, registrando o log em `templateService.logDispatch` e incrementando as métricas diárias de disparo.
    - **Feedback Visual com Notificações Flutuantes (Toasts):** Ao confirmar o agendamento, o usuário recebe um aviso informativo instantâneo ("Disparo Programado ⏱️: Mensagem de confirmação será enviada em 5 segundos..."). Decorridos os 5 segundos, o sistema exibe o toast de sucesso ("WhatsApp Enviado! 📲✨: Confirmação entregue com sucesso para [Paciente] no WhatsApp!").
  - **Ajuste do Lembrete de Consulta para 2 Horas Antes e Respostas Inteligentes às Opções 1 e 2 (`templateService.ts`, `ConfigurarGatilhosModal.tsx`, `whatsappNotificationService.ts`, `TemplateFormModal.tsx`):**
    - **Reconfiguração do Template Oficial (`tpl-1`):** O template de lembrete com opção de confirmação/remarcação (1 para CONFIRMAR ou 2 para REMARCAR) foi atualizado de 24h para **2 horas antes** da consulta.
    - **Novo Título e Gatilho:** Nomeado como "Lembrete de Consulta (2h antes)" com gatilho "Disparo Automático: 2h antes".
    - **Texto Atualizado para o Próprio Dia:** "Olá {{nome_paciente}}! Lembramos da sua consulta com {{dentista}} hoje, dia {{data_consulta}} às {{hora}}. Por favor, responda 1 para CONFIRMAR ou 2 para REMARCAR."
    - **Resposta da Opção 1 (Confirmar):** "Perfeito, [Nome]! Sua consulta de hoje às [Horário] está confirmada. A equipe da Odonto Souza está te esperando! 🦷✨", atualizando o status do agendamento para Confirmado na Agenda.
    - **Resposta Oficial da Opção 2 (Remarcar - com Link do Painel):**
      "Entendido, [Nome]!
      Acesse seu painel pelo endereço https://app.odontosouzavr.com.br para fazer a Remarcação para um novo horário ou novo dia"
      (Atualizado no template tpl-4 e na lógica do whatsappNotificationService).
    - **Parametrização Central:** O gatilho de antecedência no modal de configuração de automações (`ConfigurarGatilhosModal.tsx`) foi padronizado para 2 horas antes do horário agendado.
    - **Suporte no Serviço WhatsApp:** Métodos dedicados `send2HourReminder()` e `handlePatientIncomingResponse()` adicionados em `whatsappNotificationService.ts` com registro de logs em `tpl-1` e `tpl-4`.
  - **Área do Paciente Oficial (/minhaconta) — Portal do Paciente Exclusivo e Isolado do Sistema Clínico (`MinhaContaView.tsx`, `App.tsx`, `AppLayout.tsx`):**
    - **Rota Dedicada `/minhaconta`:** Acesso independente e desvinculado do layout administrativo (`AppLayout`), disponível diretamente pela URL `/minhaconta` ou via clique rápido no menu do usuário na barra superior da clínica ("Área do Paciente /minhaconta").
    - **Fidelidade Visual aos Modelos Oficiais:** Baseado estritamente nas especificações de design `clinical_precision/DESIGN.md`, `rea_do_paciente_odonto_souza/code.html` (desktop) e `rea_do_paciente_mobile_odonto_souza/code.html` (mobile).
    - **Sidebar e Navegação do Paciente:**
      - Logo Odonto Souza com selo "ÁREA DO PACIENTE".
      - Itens de navegação: Início, Meus Tratamentos, Agendar Consulta, Meus Dados, Segurança.
      - Rodapé com botão oficial "Sair" em destaque, que limpa as sessões ativas e redireciona imediatamente para a tela de login.
    - **Cabeçalho Exclusivo:** Saudação humanizada ("Olá, Mariana Alcantara 👋"), número de prontuário `#OS-2024-892`, sino de notificações com alerta e dropdown de perfil com opção de logout.
    - **Card de Destaque da Próxima Consulta:**
      - Exibição de especialista, clínica, data e horário (Quinta-feira, 06 de Março de 2025 às 10:00).
      - Três botões oficiais de ação padronizados: **Ver** (azul), **Editar / Reagendar** (laranja) e **Excluir** (vermelho) com hover de 20% de opacidade.
    - **KPIs e Visão Rápida:**
      - Próxima Consulta com badge de confirmação.
      - Plano de Tratamento com barra de progresso visual (75% concluído).
      - Financeiro ("Sem Pendências" com download de recibos).
      - Seu Dentista com dados do Dr. Frankisney Souza (CRO-SP 78.432) e botão direto de WhatsApp.
    - **Widget Interativo de Agendamento:**
      - Seletor horizontal de datas da semana com indicadores de vagas ("Lotado", "2 vagas", "4 vagas").
      - Grade de horários clicáveis (09:00, 10:00, 11:30, 14:00, 16:30).
      - Resumo instantâneo e botão "Confirmar Este Agendamento" com notificação toast de feedback.
    - **Histórico de Procedimentos:**
      - Tabela desktop e cards mobile com indicação do dente/região (`#26 Molar Superior`, `Arcada Completa`, `#14 Pré-Molar`), data, profissional, status e botão "Exportar Laudo (PDF)".
    - **Experiência Mobile First:** Barra de navegação inferior com suporte a toque ergonômico no polegar (Início, Agendar, Tratamento, Perfil).
  - **Tela Oficial de Meus Tratamentos & Plano Clínico (`MeusTratamentosView.tsx`, `MinhaContaView.tsx`):**
    - **Fidelidade Visual aos Modelos HTML & Mobile:** Baseada nas especificações de `meus_tratamentos_rea_do_paciente/code.html` e `meus_tratamentos_mobile_rea_do_paciente/code.html`.
    - **Header & Ações Principais:** Badge "Plano Terapêutico Integrado" com indicador "Sincronizado", título "Meus Tratamentos & Plano Clínico", botão "Segunda Opinião / Dúvidas" (abertura de canal com junta clínica/WhatsApp) e botão "Exportar Relatório Clínico (PDF)".
    - **3 Cards de Resumo Clínico Superior:**
      - Tratamento Principal: Reabilitação Estética & Funcional (Fase 3 de 4, barra de progresso em 75%, previsão de alta 20/03/2025).
      - Próximo Agendamento: Placa Miorrelaxante & Oclusão (06/03/2025 às 10:00 com Dr. Frankisney Souza).
      - Documentação 3D: 4 Laudos & Tomografias em Cloud PACS com botão "Acessar Prontuário Radiográfico".
    - **Abas de Filtro Segmentado (Pills):** Plano em Andamento, Histórico de Procedimentos, Exames e Radiografias 3D, Orientações e Pós-Operatório.
    - **Cronograma de Fases Clínicas (Timeline Vertical):**
      - Fase 01 (Concluída em 10/01/2025): Escaneamento Intraoral 3D & Mapeamento Digital (Scanner iTero Element 5D) com modal interativo do modelo tridimensional.
      - Fase 02 (Concluída em 28/01/2025): Endodontia Mecanizada (Canal) — Dente 16 com modal do Raio-X Periapical pós-operatório e download DICOM.
      - Fase 03 (Concluída em 25/02/2025): Restauração Resina Nanoparticulada — Dente 26 (Resina Tokuyama Estelite Asteria) com modal macrofotográfico comparativo antes & depois.
      - Fase 04 (Agendado / Em Produção para Qui, 06 Mar • 10:00): Moldagem Digital & Confecção de Placa de Bruxismo 3D, com botão para "Confirmar Presença" e "Remarcar Data".
    - **Cuidados & Recomendações Pós-Atendimento:**
      - Botão de download do "Receituário & Atestado Digital" assinado via ICP-Brasil.
      - 3 Cards informativos: Higiene Interdental Delicada (3x ao dia), Alimentos Hiper-pigmentados (restrição 48h) e Aplicação Tópica & Sensibilidade (comunicação direta com cirurgião).
      - Banner de Suporte Clínico Prioritário com acionamento do cirurgião via WhatsApp sem custo para ajustes oclusais.
      - Rodapé com dados de responsabilidade técnica do Dr. Frankisney Souza (CRO-SP 78.432).
  - **Tela Oficial de Agendar Consulta (`AgendarConsultaView.tsx`, `MinhaContaView.tsx`):**
    - **Fidelidade Visual aos Modelos Oficiais:** Baseada nas especificações de `agendar_consulta_agenda_cl_nica/code.html` e `agendar_consulta_mobile_rea_do_paciente/code.html`.
    - **Coluna Esquerda / Topo Mobile:**
      - Mini Calendário Mensal interativo de Outubro 2026 com navegação entre meses, destaque no dia 31 e tooltip flutuante no dia 13.
      - Card da Fila de Encaixe Imediato com botão "Entrar na Fila" (inclusão dinâmica do paciente com toast de confirmação da posição na fila).
      - Card de Privacidade e Ética Odontológica (LGPD) garantindo anonimização dos horários ocupados de outros pacientes.
    - **Coluna Direita / Grade de Atendimento Completa (Turnos da Manhã e Tarde):**
      - Header de status com indicação de início às 08:00 com consultas padronizadas de 45 min, intervalo de 5 min de descanso e esterilização entre cada consulta, cadeira 01, Dr. Frankisney Souza e badge de tempo otimizado.
      - Barra de filtro por chips: "Todos (12)", "Manhã (5)", "Tarde (7)" e "Livres (6)".
      - **Turno da Manhã (08:00 às 12:05):**
        - Slot 08:00 às 08:45 (45 min) • Concluído + 5 min descanso (08:45 às 08:50).
        - Slot 08:50 às 09:35 (45 min) • Concluído + 5 min descanso (09:35 às 09:40).
        - Slot 09:40 às 10:25 (45 min) • Cirurgia / Indisponível + 5 min descanso (10:25 às 10:30).
        - Slot 10:30 às 11:15 (45 min) • Encaixe de Urgência + 5 min descanso (11:15 às 11:20).
        - Slot 11:20 às 12:05 (45 min) • Confirmado.
      - **Intervalo Geral de Almoço & Autoclave (12:05 às 13:30 • 85 min):** Bloco institucional com autoclave ativa e desinfecção terminal.
      - **Turno da Tarde (13:30 às 19:15):**
        - Slot 13:30 às 14:15 (45 min) • Confirmado + 5 min descanso (14:15 às 14:20).
        - Slot 14:20 às 15:05 (45 min) • Livre (Disponível para agendamento) + 5 min descanso (15:05 às 15:10).
        - Slot 15:10 às 15:55 (45 min) • Livre (Disponível para agendamento) + 5 min descanso (15:55 às 16:00).
        - Slot 16:00 às 16:45 (45 min) • Livre (Disponível para agendamento) + 5 min descanso (16:45 às 16:50).
        - Slot 16:50 às 17:35 (45 min) • Livre (Disponível para agendamento) + 5 min descanso (17:35 às 17:40).
        - Slot 17:40 às 18:25 (45 min) • Livre (Disponível para agendamento) + 5 min descanso (18:25 às 18:30).
        - Slot 18:30 às 19:15 (45 min) • Livre (Último horário clínico • Encerramento do expediente às 19:15).
    - **Modal Interativo de Pré-Agendamento:**
      - Seleção do tipo de atendimento (Avaliação Geral, Profilaxia / Limpeza, Manutenção / Retorno, Urgência / Dor).
      - Campo de observações / queixa principal e botão de "Solicitar Reserva", que atualiza o horário na grade em tempo real e emite notificação toast.
    - **Integração Completa na Área do Paciente:**
      - Conectada no menu lateral desktop ("Agendar Consulta"), na barra de navegação móvel ("Agendar") e nos botões "Editar / Reagendar" do card da consulta principal.
  - **Tela Oficial de Meus Dados & Perfil do Paciente (`MeusDadosView.tsx`, `MinhaContaView.tsx`):**
    - **Fidelidade Visual aos Modelos Oficiais:** Baseada em `meus_dados_rea_do_paciente/code.html` e `meus_dados_mobile_rea_do_paciente/code.html`.
    - **Hero & Ações Superiores:** Badges "Prontuário Ativo #OS-2024-892", "Conformidade LGPD 100% Protegido" e "Dr. Frankisney Souza (CRO-SP 78.432)", com botões para "Descartar" e "Salvar Alterações".
    - **Card de Perfil & Bento Stats:**
      - Fotografia de estúdio da paciente com botão de câmera/upload e selo "Cadastro Verificado".
      - Faixa de estatísticas rápidas: Idade (32 anos • 14/08/1992), Cliente Desde (Jan / 2024 • 13 meses ativa) e Última Revisão (10/02/2025 • Atualizado).
      - Botões de ação rápida: "Carregar Nova Imagem" e "Remover Foto".
    - **Bloco Bento 1 — Informações Pessoais & Documentos:**
      - Nome Completo Civil, Nome Social / Preferência de tratamento, RG com órgão emissor, data de nascimento, gênero/identidade, estado civil e profissão/ocupação.
      - Campo de CPF com proteção LGPD, máscara oculta (`342.***.***-89`) e botão interativo de visualização/revelação.
    - **Bloco Bento 2 — Endereço Residencial:**
      - Validação de CEP (`01419-001` - São Paulo / Jardins), logradouro, número, complemento, bairro, cidade e estado (UF).
    - **Bloco Bento 3 — Canais de Contato & Urgência:**
      - E-mail principal, celular/WhatsApp com badge "Lembretes Ativos" (aviso 24h) e telefone fixo residencial.
      - Box de emergência com nome do contato de urgência (Lucas Alcantara), grau de parentesco (Irmão) e telefone direto.
    - **Bloco Bento 4 — Convênio Odontológico & Faturamento:**
      - Operadora de saúde bucal (Bradesco Dental Premium), nº da carteirinha digital, validade (12/2026) e titularidade.
      - Visualizador da carteirinha digital virtual anexada (`carteirinha_dental_mariana_2025.pdf`), modal interativo de exibição do cartão digital e botão para substituição de arquivo.
    - **Bloco Bento 5 — Preferências de Comunicação & Termos LGPD:**
      - 4 seletores para consentimentos ativos: WhatsApp (confirmações 48h/24h), E-mail (exames e recibos), Encaixe Rápido (oferta de desistências pelo Dr. Frankisney) e SMS convencional.
    - **Rodapé Institucional com Declaração LGPD:**
      - Citação da Lei 13.709/2018 com criptografia ativa e botões duplicados de ação final ("Descartar Alterações" e "Salvar Alterações").
  - **Menu Lateral Mobile (Drawer com Botão Hambúrguer Padronizado):**
    - Adicionado botão de menu hambúrguer (`<Menu className="w-6 h-6" />`) no cabeçalho mobile de [MinhaContaView.tsx](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx), alinhado ao padrão de interface do sistema (`AppLayout.tsx`).
    - Integração com Drawer lateral responsivo deslizante (`isMobileDrawerOpen`), contendo branding Odonto Souza, perfil do paciente, links de navegação completa (Início, Meus Tratamentos, Agendar Consulta, Meus Dados, Segurança) e botão "Sair" com retorno seguro ao login.
  - **Tela Oficial de Segurança da Conta & Acesso (`SegurancaView.tsx`, `MinhaContaView.tsx`):**
    - **Fidelidade Visual aos Modelos Oficiais:** Baseada nos modelos HTML e mobile de `seguran_a_do_paciente_odonto_souza_1`, `seguran_a_do_paciente_odonto_souza_2`, `seguran_a_do_paciente_mobile_odonto_souza_1` e `seguran_a_do_paciente_mobile_odonto_souza_2`.
    - **Header & Trust Badges:** Badges "Área do Paciente • Prontuário #OS-2024-892", "Criptografia de Ponta a Ponta", "Status: Proteção Alta" e "Último login: Hoje às 08:42 em São Paulo, SP", com botões "Descartar" e "Salvar Alterações".
    - **Painel 1 — E-mail de Acesso:** E-mail cadastrado verificado (`mariana.alcantara@email.com`), formulário para alteração de e-mail com confirmação criptografada e botão "Atualizar E-mail".
    - **Painel 2 — Alteração de Senha:** Campos para senha atual com link "Esqueceu a senha?", nova senha e confirmação com alternância de visibilidade (`Eye`/`EyeOff`), medidor dinâmico de força da senha em 4 níveis (Fraca, Média, Forte, Excelente) e checklist dos 4 critérios de segurança (8 dígitos, maiúsculas/minúsculas, número, caractere especial).
    - **Painel 3 — Autenticação em Duas Etapas (2FA):** Switch principal liga/desliga, canais WhatsApp Odonto Souza (recomendado com token de 6 dígitos), Aplicativo Autenticador (com modal interativo contendo QR Code simulado e chave manual), SMS de contingência, chaves de segurança físicas (YubiKey/biometria) e modal de download de 8 códigos de recuperação.
    - **Painel 4 — Dispositivos Conectados (Sessões Ativas):** Visualização de sessões ativas (Chrome no Windows 11 e iPhone 15 Pro no Safari) com geolocalização IP, botão individual para "Desconectar" e botão "Encerrar Todas as Outras Sessões".
    - **Painel 5 — Registro de Atividades & Privacidade LGPD:** Tabela desktop e cards mobile com eventos de segurança (login, troca de telefone, 2FA, laudo 3D), botão "Solicitar Exportação LGPD" gerando arquivo CSV em tempo real, declaração regulatória de guarda CFO/LGPD e modal explicativo com abertura de protocolo de anonimização de dados.
  - **Integração Completa da Área do Paciente com Dados Reais do Supabase (`pacientePortalService.ts`):**
    - **Serviço Centralizado do Portal:** Criado [`src/services/pacientePortalService.ts`](file:///c:/OdontoSouza/src/services/pacientePortalService.ts) conectando o Portal do Paciente às tabelas oficiais do PostgreSQL (`pacientes`, `agendamentos`, `evolucoes_prontuario`, `procedimentos`, `usuarios`, `auditoria_logs`).
    - **Carregamento Dinâmico do Perfil:** `getPacienteData()` busca os dados reais da tabela `pacientes` por ID ou e-mail/CPF autenticado.
    - **Persistência de Dados Cadastrais:** O botão "Salvar Alterações" em [`MeusDadosView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MeusDadosView.tsx) atualiza os campos na tabela `pacientes` e registra logs de auditoria na tabela `auditoria_logs` para conformidade LGPD.
    - **Próxima Consulta Real:** `getProximaConsulta()` realiza join entre `agendamentos`, `usuarios` (dentista) e `procedimentos`, preenchendo o card principal da dashboard com o agendamento real ativo.
    - **Criação de Agendamentos Reais:** O fluxo de confirmação em [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx) insere novos registros na tabela `agendamentos` e registra log em `auditoria_logs`.
    - **Tratamentos & Procedimentos Reais:** `getTratamentosReais()` consulta `evolucoes_prontuario` do paciente para exibir procedimentos clínicos finalizados e em andamento.
    - **Segurança & Troca de E-mail:** Em [`SegurancaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/SegurancaView.tsx), a atualização de e-mail reflete instantaneamente na base de dados do paciente via `salvarDadosPaciente`.
    - **Login e Roteamento Unificado:** Em [`LoginView.tsx`](file:///c:/OdontoSouza/src/components/auth/LoginView.tsx) e [`App.tsx`](file:///c:/OdontoSouza/src/App.tsx), usuários com papel de paciente são redirecionados automaticamente para a rota `/minhaconta`, com atalho direto de acesso e suporte a alternância dinâmica entre pacientes da base no menu do usuário.
  - **Mecanismo Anti-Brute Force na Autenticação ([`LoginView.tsx`](file:///c:/OdontoSouza/src/components/auth/LoginView.tsx)):**
    - Rastreamento de tentativas com falha com limite máximo de 3 tentativas consecutivas (`MAX_FAILED_ATTEMPTS = 3`).
    - Bloqueio temporário ativo na interface por 60 segundos com contador regressivo em tempo real (`secondsRemaining`), desativação estrita do botão "Entrar no Sistema" e dos inputs, alerta visual detalhado e persistência em `sessionStorage` para impedir contorno via F5/recarregamento.
    - Integração de segurança com o Supabase Auth (Rate Limiting HTTP 429 nativo) e preparação para auditoria e colunas `tentativas_falhas` e `bloqueado_ate` em `usuarios`.
  - **Credenciais do Paciente & Validação de Força da Senha ([`PacienteFormView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacienteFormView.tsx)):**
    - Adicionada a Secção 5 "Acesso à Área do Paciente" abaixo de "4. Informações Clínicas Básicas", com campos de E-mail de Acesso, Senha e Confirmar Senha.
    - **Regra de Edição Não Obrigatória de Senha:** Na edição do paciente, os campos de senha iniciam em branco com o aviso "Deixe em branco para manter a senha atual". Se o usuário não digitar uma nova senha, a senha existente é 100% preservada sem alterações. O checklist de validação só é ativado caso o usuário decida preencher uma nova senha.
    - Checklist visual interativo com validação em tempo real dos 4 requisitos: mínimo de 8 caracteres, pelo menos 1 letra maiúscula, pelo menos 1 caractere especial e senhas idênticas, acompanhado de barra de progresso multicor (Fraca, Média, Forte, Excelente).
    - Validação no `handleSubmit` impedindo salvamento com senha incompleta ou divergente quando uma nova senha for fornecida.
  - **Criação de Contas de Autenticação & RBAC Estrito ([`pacientesService.ts`](file:///c:/OdontoSouza/src/services/pacientesService.ts), [`PacientesView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacientesView.tsx), [`App.tsx`](file:///c:/OdontoSouza/src/App.tsx)):**
    - `criarAcessoPortalPaciente` aciona o Supabase Auth (`supabase.auth.signUp`), registra na tabela `usuarios` com coluna `perfil_nome: 'paciente'` e `funcao: 'Paciente'` e emite log em `auditoria_logs`.
    - Guarda de Rotas RBAC no `App.tsx` que intercepta qualquer tentativa de navegação de usuários com perfil `'paciente'` para telas de gestão clínica administrativa, forçando exibição exclusiva e segura de `/minhaconta`.
    - **Auto-Confirmação no Supabase Self-Hosted ([`database-rpc.sql`](file:///c:/OdontoSouza/src/lib/database-rpc.sql)):** Implementado trigger PostgreSQL `on_auth_user_auto_confirm` em `auth.users` que preenche automaticamente `email_confirmed_at = NOW()`, dispensando envio ou validação de links de e-mail no ambiente self-hosted, além da configuração de `GOTRUE_MAILER_AUTOCONFIRM=true` no Docker do GoTrue.
  - **Correção Definitiva de Autenticação Real e Eliminação de Mock no Portal do Paciente:**
    - **Causa Raiz Identificada:** Em [`LoginView.tsx`](file:///c:/OdontoSouza/src/components/auth/LoginView.tsx), a validação para logins de pacientes verificava `email.includes('paciente')` de forma simulada (`setTimeout`) e preenchia estaticamente `Mariana Alcantara` sem chamar `supabase.auth.signInWithPassword`. Além disso, em [`pacientePortalService.ts`](file:///c:/OdontoSouza/src/services/pacientePortalService.ts), se a busca por e-mail não retornasse resultado imediato, havia um fallback `LIMIT 1` que selecionava o primeiro registro da tabela `pacientes` (que era a paciente Luciana Maria de Albuquerque), e os 4 cards de KPI na dashboard de [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx) mantinham dados estáticos.
    - **Solução Implementada:**
      1. [`LoginView.tsx`](file:///c:/OdontoSouza/src/components/auth/LoginView.tsx): Substituída a simulação por autenticação real assíncrona contra a API do Supabase Auth (`supabase.auth.signInWithPassword({ email, password })`), buscando os dados cadastrais reais do usuário (`nome`, `perfil_nome`) nas tabelas `usuarios` e `pacientes`, mantendo o bloqueio de 3 tentativas consecutivas com lockout de 60 segundos.
      2. [`pacientePortalService.ts`](file:///c:/OdontoSouza/src/services/pacientePortalService.ts): Eliminado o fallback de `LIMIT 1` para outro paciente. A busca agora consulta por ID, por e-mail ou por vínculo de nome do usuário autenticado. Se o paciente não tiver agendamentos futuros em `agendamentos`, `getProximaConsulta` retorna `null` com precisão clínica.
      3. [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx): Cabeçalho, menu do usuário, card de agendamento em destaque e os 4 cards Bento de KPI foram vinculados dinamicamente aos dados do paciente autenticado (`patientData`) e ao agendamento real ativo (`currentAppointment`). Se o paciente ainda não tiver consultas marcadas, exibe um banner acolhedor de agendamento preventivo semestral com botão de ação direta.
      4. Sincronização da tabela `usuarios` e `pacientes` para o usuário `everaldoszpaciente@gmail.com` com perfil `'paciente'`.
      5. Saudação humanizada abreviada para o primeiro nome (`Olá, {firstName} 👋`) e sanitização da exibição do prontuário evitando duplicidade de `#` (`#OS-XXXX`).
  - **Módulo Principal Oficial de Convênios & Planos Odontológicos ([`ConveniosView.tsx`](file:///c:/OdontoSouza/src/components/convenios/ConveniosView.tsx), [`ConvenioFormView.tsx`](file:///c:/OdontoSouza/src/components/convenios/ConvenioFormView.tsx), [`conveniosService.ts`](file:///c:/OdontoSouza/src/services/conveniosService.ts)):**
    - **Menu Principal de Primeiro Nível:** Posicionado diretamente no menu lateral desktop ([`AppLayout.tsx`](file:///c:/OdontoSouza/src/components/layout/AppLayout.tsx)) e na gaveta mobile ([`MobileDrawer.tsx`](file:///c:/OdontoSouza/src/components/layout/MobileDrawer.tsx)) abaixo de "Pacientes", com o ícone `ShieldCheck`, sem ficar escondido em submenus.
    - **Regras Visuais e de UX Cumpridas:**
      - Sem modais para cadastro/edição: view switching inline (`currentView === 'list' | 'form' | 'details'`).
      - Formulário em tela cheia com rolagem obrigatória ao topo (`scrollToTop()`).
      - Botão "Voltar" (`ArrowLeft`) destacado no cabeçalho superior esquerdo.
      - Botões de importação (`BTN_IMPORTAR_CLASS`) e exportação (`BTN_EXPORTAR_CLASS`) oficiais.
      - Botão "Novo Convênio" sem sinal redundante de `+`.
      - Ações de linha padronizadas: Ver (Azul), Editar (Laranja), Excluir (Vermelho) com hover de -20% de opacidade.
    - **Banco de Dados & Seeds:** Adicionada a tabela `public.convenios` em [`database-schema.sql`](file:///c:/OdontoSouza/src/lib/database-schema.sql) com RLS ativado e carga inicial de 8 operadoras e planos de referência em [`database-seeds.sql`](file:///c:/OdontoSouza/src/lib/database-seeds.sql).
  - **Sistema de Notificações com Campainha de Recepção Dupla ([`receptionBellAudio.ts`](file:///c:/OdontoSouza/src/utils/receptionBellAudio.ts), [`NotificationContext.tsx`](file:///c:/OdontoSouza/src/contexts/NotificationContext.tsx), [`AppLayout.tsx`](file:///c:/OdontoSouza/src/components/layout/AppLayout.tsx)):**
    - **Áudio Sintetizado de Campainha de Recepção ("Ding-Ding 2x"):** Implementado via Web Audio API com frequência fundamental metálica de bronze (C7 ~2093Hz) e sobretons harmônicos (4186Hz e 2793Hz), com ataque de percussão nítido e decaimento exponencial, repetindo a campainha exatamente 2 vezes com intervalo de 380ms.
    - **Eventos Monitorados em Tempo Real:** Novos cadastros de pacientes (`novo_cadastro`), novos agendamentos via portal ou recepção (`novo_agendamento`), alterações de data/horário (`alteracao_agendamento`) e desmarcações/cancelamentos de consultas (`cancelamento_agendamento`).
    - **Disparadores Conectados:**
      - [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx): aciona notificação imediata quando o paciente realiza pré-agendamento pela Área do Paciente.
      - [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx): aciona notificação imediata quando o paciente desmarca ou cancela sua consulta.
      - [`PacienteFormView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacienteFormView.tsx): aciona notificação quando um novo paciente é registrado na clínica.
      - [`AgendamentoFormView.tsx`](file:///c:/OdontoSouza/src/components/agenda/AgendamentoFormView.tsx) e [`NovoAgendamentoModal.tsx`](file:///c:/OdontoSouza/src/components/agenda/NovoAgendamentoModal.tsx): acionam notificações ao criar ou remarcar consultas na agenda da recepção.
    - **Interface do Sino de Notificações & Gestão Completa no Header ([`AppLayout.tsx`](file:///c:/OdontoSouza/src/components/layout/AppLayout.tsx)):**
      - Badge numérico em vermelho com contagem de notificações não lidas e animação suave.
      - Controles no topo do dropdown: botão "Testar Som" para audição imediata da campainha dupla, alternador de áudio (ativar/silenciar campainha) e "Marcar todas como lidas".
      - **Ações por Notificação:**
        1. **Opção de Ler:** Abre modal dedicado com todos os dados do evento (nome do paciente, WhatsApp, procedimento, data, horário, dentista, canal de origem e observações) e botão de navegação direta para a tela de destino (`Agenda` ou `Pacientes`).
        2. **Marcar como Lida:** Botão individual com ícone de check (`Check`) para marcar a notificação como visualizada.
        3. **Botão de Excluir:** Botão com ícone de lixeira (`Trash2`) em vermelho para exclusão individual de notificações, além de "Limpar histórico" no rodapé.
  - **Novas Regras de Negócio da Agenda & Padronização de Horários e Cores:**
    - **Bloqueio de Duplo Agendamento no Mesmo Dia:** Um paciente não pode marcar dois horários na mesma data, exceto se a consulta anterior já estiver com o status de `Concluído` (ou `Finalizado`). Implementado e validado em [`agendaService.ts`](file:///c:/OdontoSouza/src/services/agendaService.ts) (`verificarConflitoDuploAgendamento`), [`AgendamentoFormView.tsx`](file:///c:/OdontoSouza/src/components/agenda/AgendamentoFormView.tsx), [`NovoAgendamentoModal.tsx`](file:///c:/OdontoSouza/src/components/agenda/NovoAgendamentoModal.tsx), [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx) e [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx).
    - **Nova Cor Oficial para o Status Concluído (Verde Neon):** Convertido com precisão a partir de CMYK (C:83, M:0, Y:98, K:0) resultando em `#2BFF05` (RGB: 43, 255, 5). Aplicado nos cards, badges, bordas e destaques de consultas concluídas em [`TimelineSchedule.tsx`](file:///c:/OdontoSouza/src/components/agenda/TimelineSchedule.tsx), [`AgendaMetricsHeader.tsx`](file:///c:/OdontoSouza/src/components/agenda/AgendaMetricsHeader.tsx), [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx) e [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx).
    - **Horários das 08h às 09h da Manhã (Exclusivos do Dr. Frankisney / Administração):** Os horários de 08:00 a 08:45 permanecem visíveis para os pacientes na grade com etiqueta "Sob Demanda • Exclusivo Dr. Frankisney", porém com agendamento direto bloqueado para pacientes com aviso orientativo para contatar a recepção. Apenas Dr. Frankisney e administradores podem agendar nesse intervalo.
    - **Grade Completa de Atendimento até Meia-Noite (00:00) em Todas as Telas:** Eliminada a trava/texto que encerrava a agenda às 18h/19:15. A grade foi expandida cobrindo os turnos Manhã (08h às 12h), Tarde (13h às 18h) e Noite (18h30 às 00h00) com plantão noturno em [`TimelineSchedule.tsx`](file:///c:/OdontoSouza/src/components/agenda/TimelineSchedule.tsx), [`AgendaView.tsx`](file:///c:/OdontoSouza/src/components/agenda/AgendaView.tsx), [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx) e [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx).
    - **Sincronização Dinâmica da Área do Paciente (Dia Atual + Vagas Exatas):**
      - **Abertura Sempre no Dia Atual (`Hoje`):** Em [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx) e [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx), a agenda não inicia mais em dias estáticos ou passados (como Quinta-feira 05/Nov). O estado inicial de data é gerado dinamicamente via `generateDaysSchedule(new Date())` e `new Date().getDate()`, garantindo que o primeiro card seja sempre o dia atual (`Hoje`), seguido pelos próximos 5 dias subsequentes da semana.
      - **Sincronia Precisa da Quantidade de Vagas:** Cada dia da semana possui sua lista real de horários (`availableTimes: string[]`), e a quantidade de vagas indicada no card (`vacancies`) corresponde rigorosamente à quantidade de botões de horários exibidos abaixo.
      - Ao confirmar um agendamento na tela, o horário escolhido é imediatamente deduzido da lista de vagas livres do dia em tempo real, atualizando o contador e os botões sem necessidade de recarregar a página.
    - **Sequência Contínua de Horários Sem Cortes (45 min + 5 min):** Padronizada em ambas as telas do paciente ([`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx) e [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx)) a grade completa contínua sem cortes:
      - 08:10 às 08:55 (Exclusivo Dr. Frankisney / Administração com cadeado orientativo)
      - Manhã: 09:00 às 09:45, 09:50 às 10:35, 10:40 às 11:25, 11:30 às 12:15
      - Tarde (sem cortes de almoço): 12:20 às 13:05, 13:10 às 13:55, 14:00 às 14:45, 14:50 às 15:35, 15:40 às 16:25, 16:30 às 17:15, 17:20 às 18:05
      - Noite: 18:10 às 18:55, 19:00 às 19:45, 19:50 às 20:35, 20:40 às 21:25, 21:30 às 22:15, 22:20 às 23:05, 23:10 às 23:55 (fechamento às 00:00).
  - **Integração Real do Supabase em 100% da Área do Paciente (Cards, Abas, Menus e Sessões sem Mocks):**
    - **Serviço Centralizado Completo ([`pacientePortalService.ts`](file:///c:/OdontoSouza/src/services/pacientePortalService.ts)):**
      - `getHistoricoProcedimentos(pacienteId)`: consulta procedimentos clínicos reais em `evolucoes_prontuario` e `agendamentos` concluídos.
      - `getResumoFinanceiro(pacienteId)`: calcula em tempo real o total investido, saldo a quitar e status a partir de `orcamentos` e `transacoes_financeiras`.
      - `getPlanoTratamentoCompleto(pacienteId)`: unifica etapas clínicas ativas, diagnósticos e dentes afetados a partir de `evolucoes_prontuario`, `odontograma_itens` e `orcamento_itens`.
      - `getAuditoriaLogs(pacienteId, email)`: busca eventos reais de auditoria, logins e acessos LGPD na tabela `auditoria_logs`.
      - `atualizarSenhaSupabase(novaSenha, email, pacienteId)`: atualiza credenciais no Supabase Auth (`supabase.auth.updateUser`) e gera registro de auditoria rastreável.
    - **Bento Grid & Início ([`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx)):**
      - Card 1 (Próxima Consulta): exibe a próxima consulta real via `getProximaConsulta` com status oficial, ou banner acolhedor de agendamento preventivo se não houver consultas pendentes.
      - Card 2 (Prontuário & Evolução Clínica): exibe o percentual dinâmico calculado com base nas etapas concluídas, título do plano clínico real e fases executadas.
      - Card 3 (Convênio & Pagamentos): exibe valores financeiros reais (total investido e saldo pendente) extraídos das transações e orçamentos do paciente.
      - Card 4 (Orientações & Contato Direto): atalho dinâmico para WhatsApp e orientações pós-consulta personalizadas.
      - Seção D (Histórico de Procedimentos): tabela dinâmica populada com `proceduresHistory` real do Supabase ou estado amigável caso seja a primeira consulta.
    - **Aba Meus Tratamentos ([`MeusTratamentosView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MeusTratamentosView.tsx)):**
      - Mapeia etapas e procedimentos dinamicamente de `treatmentPlan` e `procedimentos`.
      - Alternância de abas ("Plano de Tratamento", "Histórico de Procedimentos", "Exames & Radiografias 3D", "Orientações Pós-Consulta") 100% integradas.
      - **Eliminação Cirúrgica de Exames e Procedimentos Fictícios:**
        - Removido o modal estático com 4 exames/laudos falsos de 2025 (Panorâmica, Tomografia Cone Beam, Raio-X Periapical Dente 16, Escaneamento 3D iTero).
        - Implementado método `getExamesDicom(pacienteId)` em `pacientePortalService.ts` que consulta laudos reais em `evolucoes_prontuario`. Caso o paciente não tenha exames registrados, tanto o Card 3 quanto o modal de Prontuário Radiográfico exibem com precisão o estado vazio ("0 Laudos Salvos", "Nenhum Exame Radiográfico ou DICOM Arquivado").
        - Eliminadas etapas clínicas simuladas (Dente 16 e Dente 26) no fallback de `getTratamentosReais` e `getPlanoTratamentoCompleto`. Se o paciente não tiver procedimentos clínicos concluídos, o sistema reflete seus agendamentos reais em curso ou exibe o plano inicial limpo sem dados sintéticos.
        - Seção de "Cuidados e Recomendações Clínicas" e exportações de relatórios/receitas reestruturadas para exibir exclusivamente orientações reais do plano do paciente, eliminando menções indevidas a dentes ou materiais não realizados.
        - **Remoção de Elementos Supérfluos no Header:** Removidos a pedido o botão "Segunda Opinião / Dúvidas" (e seu modal correspondente) e a badge "Sincronizado" no cabeçalho superior da aba Meus Tratamentos ([`MeusTratamentosView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MeusTratamentosView.tsx)), mantendo o cabeçalho limpo, direto e focado no botão de ação principal "Exportar Relatório Clínico (PDF)".
      - Relatório clínico oficial em texto/PDF e atestados/receitas gerados com o nome e dados reais do paciente autenticado.
    - **Aba Meus Dados ([`MeusDadosView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MeusDadosView.tsx)):**
      - Formulário inicializado com dados reais de `patientData` sem mocks.
      - Atualização sincronizada tanto em `pacientes` quanto em `usuarios` via `salvarDadosPaciente`.
    - **Aba Segurança & Acesso ([`SegurancaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/SegurancaView.tsx)):**
      - Campos de senha iniciam em branco sem placeholders artificiais.
      - Alteração de senha conectada ao Supabase Auth com validação de força.
      - Tabela de rastreabilidade e logs LGPD carregada diretamente de `auditoria_logs` do Supabase.
      - Exportação de dados LGPD (CSV) com histórico de auditoria real.
  - **Bloqueio Estrito de Agendamentos Retroativos Baseado no Relógio Local do Computador:**
    - **Área do Paciente — Agendamento Direto ([`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx)):**
      - Implementado `isSlotInThePast(slotTime, day)` comparando a data e o horário de início do slot com a hora e minuto do computador (`new Date()`).
      - Horários de hoje cujo horário já passou são visualmente desativados: exibem badge cinza "Horário Passado", título "Horário Encerrado", texto explicativo de indisponibilidade retroativa e botão desativado "Horário Encerrado" com ícone de relógio e cursor bloqueado.
      - O contador de vagas livres e o filtro por chips "Livres" contabilizam estritamente horários vagos no futuro.
      - O mini calendário mensal destaca dias passados com opacidade reduzida e previne agendamentos retroativos com toast informativo.
      - Métodos `handleOpenBooking` e `handleConfirmBooking` possuem guardas ativas que bloqueiam qualquer tentativa de agendamento retroativo com aviso toast: "Horário Passado Indisponível".
    - **Área do Paciente — Minha Conta ([`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx)):**
      - Em `generateDaysSchedule`: para o dia de hoje (`isToday`), a lista de `availableTimes` é filtrada dinamicamente para excluir todos os horários menores ou iguais à hora e minuto atual do computador.
      - O cálculo de vagas livres para o dia de hoje reflete apenas os slots futuros restantes.
      - O método `handleConfirmSchedule` possui validação estrita que rejeita agendamentos retroativos caso a hora selecionada já tenha passado.
    - **Painel Administrativo — Linha do Tempo da Agenda ([`TimelineSchedule.tsx`](file:///c:/OdontoSouza/src/components/agenda/TimelineSchedule.tsx)):**
      - Implementado helper `isPastSlot(slotTime, targetDate)` validando a data selecionada e a hora atual.
      - Slots do tipo `livre` cujo horário já passou em relação à hora do computador são exibidos com estilo esmaecido, borda suave, badge "Passado", texto "Horário Encerrado" e botão desativado "Horário Encerrado" (cursor bloqueado), impedindo abertura de agendamento retroativo.
      - Slots de `sobra_encaixe` cujo tempo já expirou são exibidos como "Encaixe Encerrado / Expirado", removendo o botão de adicionar encaixe para horários passados.
    - **Painel Administrativo — Formulários e Modais de Agendamento ([`AgendamentoFormView.tsx`](file:///c:/OdontoSouza/src/components/agenda/AgendamentoFormView.tsx), [`NovoAgendamentoModal.tsx`](file:///c:/OdontoSouza/src/components/agenda/NovoAgendamentoModal.tsx), [`AgendaView.tsx`](file:///c:/OdontoSouza/src/components/agenda/AgendaView.tsx)):**
      - Campo de data configurado com `min={getTodayDateString()}` impedindo a seleção de datas passadas no seletor HTML.
      - Na grade de chips de horários: para a data de hoje, horários já passados são exibidos tachados (`line-through`), com opacidade reduzida e desativados com aviso sonoro/toast.
      - No `handleSubmit`: validação estrita bloqueia a gravação de novos agendamentos para datas passadas ou horários passados da data de hoje, emitindo notificação: "Horário Retroativo Indisponível: O horário selecionado já passou da hora atual do computador. Por favor, escolha um horário futuro."
      - Em `AgendaView.tsx`: `handleOpenForm` verifica se a data ou horário clicado já passou e ajusta automaticamente para o próximo horário futuro disponível, impedindo formulários pré-preenchidos com horários passados.
  - **Correção da Regra de Negócio de Limite de Agendamento por Dia (Um por Dia no Mesmo Dia):**
    - **Diagnóstico:** A verificação anterior em [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx) continha a checagem incorreta `s.status === 'confirmado'`, o que capturava erroneamente slots pré-reservados de outros pacientes da clínica (como o `slot-5` das 11:30) como se pertencessem ao usuário logado, além de não comparar com a data específica selecionada.
    - **Solução Implementada:**
      - Em [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx): Integrada a chamada assíncrona ao método `agendaService.verificarConflitoDuploAgendamento` passando a data exata da consulta (`targetDateKey = 2026-11-XX`). Se o paciente possui consulta no dia 3, ele pode agendar livremente no dia 1 (hoje), no dia 4 ou em qualquer outra data sem conflito. Apenas tentativas de agendar um segundo horário no **mesmo dia** (sem que o primeiro esteja concluído) são bloqueadas.
      - Estado `daySlotsMap` desacoplado por dia: a grade de horários agora mantém o estado isolado de cada dia do calendário, garantindo que consultas em um dia não afetem a disponibilidade dos outros dias.
      - Em [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx): A checagem de conflito foi atualizada de busca textual frágil para comparação estrita de chaves de data (`currentAppointment.dateKey === selectedDay.dateKey`) em conjunto com `agendaService.verificarConflitoDuploAgendamento`.
      - Em [`pacientePortalService.ts`](file:///c:/OdontoSouza/src/services/pacientePortalService.ts): Adicionado o campo `dateKey` na interface `PacienteAppointmentReal` e retornado na consulta da próxima consulta do paciente para indexação exata de datas.
  - **Sincronização Real e Correção de Notificações de Agendamento da Administração:**
    - **Diagnóstico:** Em [`NotificationContext.tsx`](file:///c:/OdontoSouza/src/contexts/NotificationContext.tsx), a lista inicial `DEFAULT_INITIAL_NOTIFICACOES` continha uma notificação mock estática (`notif-1`) gravada com "Everaldo Souza agendou Consulta de Avaliação Odontológica para Sábado às 10:00". Ao clicar em "Ler" na notificação da administração, o modal abria esse registro falso antigo em vez do agendamento real recém-criado pelo paciente (ex: 17:20 com procedimento "Manutenção / Retorno"). Além disso, o disparo de notificações não sincronizava entre abas nem puxava os agendamentos reais gravados no Supabase.
    - **Soluções Implementadas:**
      - **Eliminação Completa de Notificações Fictícias:** Removido o mock estático `notif-1` de `DEFAULT_INITIAL_NOTIFICACOES` e implementada limpeza automática em `localStorage` que purga permanentemente registros antigos com "Sábado às 10:00" ou `notif-1`.
      - **Carregamento Dinâmico de Notificações do Supabase:** Implementado método `carregarNotificacoesReais` que busca os agendamentos reais em `agendamentos` com joins em `pacientes`, `procedimentos` e `usuarios`, gerando notificações precisas com o nome do paciente (`fullName`), telefone (`phone`), data exata (`Domingo, 01/11/2026`), horário (`17:20`) e procedimento real (`Manutenção / Retorno`).
      - **Sincronização em Tempo Real (Realtime & Cross-Tab Storage):** O canal Supabase Realtime escuta eventos de `INSERT` e `UPDATE` na tabela `agendamentos` para atualizar a central de notificações imediatamente e tocar a campainha dupla da recepção. A função `emitirNotificacaoClinica` agora persiste no `localStorage` e o hook escuta o evento `storage` entre abas do navegador.
      - **Disparo com Dados Reais do Paciente:** Em [`AgendarConsultaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/AgendarConsultaView.tsx) e [`MinhaContaView.tsx`](file:///c:/OdontoSouza/src/components/paciente/MinhaContaView.tsx), as notificações emitidas utilizam estritamente `patientData.fullName`, `patientData.phone`, o dia/horário exato do agendamento e o procedimento selecionado.
      - **Formatação no Modal de Leitura ([`AppLayout.tsx`](file:///c:/OdontoSouza/src/components/layout/AppLayout.tsx)):** Corrigida a renderização do campo "Data / Horário" para evitar duplicidade de texto ("às") quando a data já contiver o horário formatado.
  - **Correção e Conexão Integral do Gráfico de Crescimento Financeiro e Painel Administrativo com o Supabase:**
    - **Diagnóstico:** O gráfico de "Crescimento Financeiro" em [`FinancialGrowthChart.tsx`](file:///c:/OdontoSouza/src/components/dashboard/FinancialGrowthChart.tsx) e [`MobileCharts.tsx`](file:///c:/OdontoSouza/src/components/dashboard/MobileCharts.tsx) exibia dados hardcoded (R$ 41.420,00 acumulado mensal, meta estática de R$ 50.000,00 a 82.8%, crescimento fictício de +18.4% e curva semanal fixa: Semana 1 R$ 11.200, Semana 2 R$ 22.800, Semana 3 R$ 33.400, Semana 4 R$ 42.600 e Projeção R$ 49.500) devido a uma variável `const baseHistorical = 41420` em [`dashboardService.ts`](file:///c:/OdontoSouza/src/services/dashboardService.ts).
    - **Eliminação de Mock e Cálculo 100% Real do Banco:**
      - Removida a constante `baseHistorical` e os pontos fixos estáticos em [`dashboardService.ts`](file:///c:/OdontoSouza/src/services/dashboardService.ts).
      - O faturamento mensal e diário agora é calculado somando em tempo real as receitas pagas da tabela `transacoes_financeiras` do Supabase.
      - As semanas 1 a 4 são particionadas dinamicamente de acordo com os dias do mês (dias 1-7, 8-14, 15-21 e 22-fim), calculando o acumulado progressivo real.
      - A semana corrente é identificada automaticamente com base no dia atual (`now.getDate()`), marcando a semana correspondente como `isCurrent: true` (ex: Semana 1 (Atual) no dia 1).
      - Projeção de fechamento calculada com base no ritmo diário e orçamentos aprovados a receber.
      - Crescimento percentual calculado comparando a receita do mês atual com a receita do mês anterior registrada no banco.
      - Em [`FinancialGrowthChart.tsx`](file:///c:/OdontoSouza/src/components/dashboard/FinancialGrowthChart.tsx), os caminhos SVG (`areaPathD` e `linePathD`) e as escalas do eixo Y foram substituídos por geradores matemáticos de curvas Bézier suaves dinâmicas, refletindo com precisão as coordenadas reais de qualquer volume financeiro.
      - Em [`FinanceiroView.tsx`](file:///c:/OdontoSouza/src/components/financeiro/FinanceiroView.tsx), eliminados fallbacks que vazavam valores simulados antigos (R$ 42.500,00). As transações seed foram sincronizadas com a data corrente no Supabase (totalizando R$ 1.300,00 em receitas pagas reais: Implante R$ 1.000, Ortodontia R$ 180, Restauração R$ 120).
  - **Reestruturação e Expansão das Ações Rápidas do Painel Administrativo:**
    - Atualizado o card **Ações Rápidas** em [`QuickActionsPanel.tsx`](file:///c:/OdontoSouza/src/components/dashboard/QuickActionsPanel.tsx) e [`DashboardView.tsx`](file:///c:/OdontoSouza/src/components/dashboard/DashboardView.tsx) mantendo integralmente as ações essenciais existentes e incluindo os novos atalhos solicitados:
      1. **Novo Agendamento:** Botão de destaque principal direcionando para o fluxo de marcação de consulta no calendário.
      2. **Cadastrar Paciente:** Formulário e ficha clínica & anamnese.
      3. **Novo Orçamento:** Proposta de tratamento odontológico.
      4. **Financeiro:** Atalho direto para o módulo Financeiro ([`FinanceiroView.tsx`](file:///c:/OdontoSouza/src/components/financeiro/FinanceiroView.tsx)) para controle de fluxo de caixa, receitas e despesas.
      5. **Usuários:** Atalho direto para a gestão da equipe clínica e perfis de acesso ([`UsuariosView.tsx`](file:///c:/OdontoSouza/src/components/usuarios/UsuariosView.tsx)).
      6. **Relatórios:** Atalho direto para a central de relatórios clínicos e gerenciais ([`RelatoriosView.tsx`](file:///c:/OdontoSouza/src/components/relatorios/RelatoriosView.tsx)) com exportações em CSV/Excel de DRE, Pacientes, Agendamentos e Auditoria LGPD.
    - Mantida perfeita consistência visual, espaçamento harmônico e paridade tanto no painel Desktop quanto na seção Touch-First no Mobile.
  - **Eliminação Definitiva de Fallbacks Mock de Pacientes e Verificação do Zeramento Total do Banco:**
    - **Diagnóstico:** No banco de dados Supabase, o script de zeramento executou com sucesso (todas as tabelas foram para 0 registros, restando exclusivamente o usuário `everaldozs@gmail.com` na tabela `usuarios`). Porém, no frontend, [`PacientesView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacientesView.tsx) mantinha a lista estática `INITIAL_PACIENTES` (com 11 pacientes de teste e 1240 no card métrico) porque a lógica `if (isMounted && data.length > 0)` não atualizava o estado quando o banco retornava 0 registros (`data.length === 0`).
    - **Correção Aplicada:**
      - Em [`PacientesView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacientesView.tsx): Removida a lista fixa de pacientes de teste `INITIAL_PACIENTES`, métricas zeradas na inicialização e atualizado o hook para aceitar listas vazias do banco (`setPacientes(data || [])`), refletindo com fidelidade a tabela `pacientes` zerada (0 pacientes).
      - Em [`UsuariosView.tsx`](file:///c:/OdontoSouza/src/components/usuarios/UsuariosView.tsx): Removida a lista estática `INITIAL_USUARIOS`, refletindo em tempo real apenas o usuário administrador ativo `everaldozs@gmail.com`.
      - Validado via verificação no banco de dados Supabase que todas as 16 tabelas de dados estão em 0 registros e a tabela `usuarios` contém rigorosamente 1 único registro (`everaldozs@gmail.com`).
  - **Eliminação Definitiva do Paciente Fantasma e Bloqueio de Auto-Inserção Silenciosa:**
    - **Diagnóstico:** O paciente exibido (`Paciente #0001` com e-mail `everaldozspaciente@gmail.com`) foi recriado na tabela `pacientes` porque a rotina `getPacienteData` em [`pacientePortalService.ts`](file:///c:/OdontoSouza/src/services/pacientePortalService.ts) possuía uma instrução `supabase.from('pacientes').insert(newPac)` executada automaticamente em consultas de leitura quando o usuário do portal não tinha ficha cadastrada formalmente.
    - **Solução Implementada:**
      - Removida a auto-inserção de registro no banco de dados em [`pacientePortalService.ts`](file:///c:/OdontoSouza/src/services/pacientePortalService.ts) na consulta de leitura `getPacienteData`. O serviço agora apenas retorna o objeto temporário em memória sem gravar no Supabase, garantindo que novos pacientes só entrem no banco por cadastro explícito.
      - Executada a exclusão imediata e permanente de qualquer registro de paciente remanescente na tabela `pacientes` do Supabase.
      - Auditoria completa confirmou: 0 pacientes na tabela `pacientes`, 0 registros em `obter_pacientes`, 0 agendamentos, 0 orçamentos, 0 transações e exatamente 1 usuário na tabela `usuarios` (`everaldozs@gmail.com`).
      - Build validado com 100% de sucesso.
  - **Zeramento e Sincronização Integral de Laboratório, Estoque, Relatórios e Procedimentos:**
    - **Diagnóstico:** As telas de Laboratório, Estoque, Relatórios e Procedimentos retinham fallbacks estáticos em arrays `INITIAL_...` e verificações `if (data.length > 0)` que impediam o estado de ser atualizado para vazio quando o banco de dados estava limpo. Nos Relatórios, operadores de fallback `rec || 1300`, `desp || 2270` e `pacs?.length || 4` forçavam a exibição de dados simulados quando os totais do Supabase eram 0.
    - **Correções Aplicadas:**
      - **Relatórios ([`RelatoriosView.tsx`](file:///c:/OdontoSouza/src/components/relatorios/RelatoriosView.tsx)):** Eliminados fallbacks fictícios; as métricas agora refletem os valores reais retornados pelo Supabase (0 receitas = R$ 0,00, 0 despesas = R$ 0,00, 0 pacientes = 0 e preço médio = R$ 0,00). O texto de apoio foi tornado dinâmico para indicar a ausência de cadastros quando zerado.
      - **Laboratório ([`LaboratorioView.tsx`](file:///c:/OdontoSouza/src/components/laboratorio/LaboratorioView.tsx)):** Removida a lista de pedidos mock `INITIAL_PEDIDOS` (5 itens fictícios como coroa e facetas), zeradas as métricas de produção/provas, calculada dinamicamente a soma de custos reais em laboratório (`totalInvestimento`), eliminado o paciente padrão "Mariana Rios" do formulário e adicionada mensagem informativa de tabela vazia.
      - **Estoque & Biossegurança ([`EstoqueView.tsx`](file:///c:/OdontoSouza/src/components/estoque/EstoqueView.tsx)):** Removidos os insumos clínicos e ciclos de autoclave estáticos de `INITIAL_MATERIAIS` e `INITIAL_CICLOS`, métricas e pacotes esterilizados calculados dinamicamente com base em dados reais do Supabase (exibindo 0 itens, R$ 0,00 em inventário e 0 ciclos quando o banco está zerado) e adicionados estados vazios com mensagens claras em ambas as tabelas.
      - **Procedimentos ([`ProcedimentosView.tsx`](file:///c:/OdontoSouza/src/components/procedimentos/ProcedimentosView.tsx)):** Removida a lista simulada `INITIAL_PROCEDIMENTOS` e métricas hardcoded, sincronizando com os dados reais da tabela `procedimentos`.
      - **Financeiro ([`FinanceiroView.tsx`](file:///c:/OdontoSouza/src/components/financeiro/FinanceiroView.tsx)):** Limpa a constante `INITIAL_TRANSACOES` para evitar vazamento de transações simuladas antigas.
      - **Convênios & Planos Odontológicos ([`conveniosService.ts`](file:///c:/OdontoSouza/src/services/conveniosService.ts) e [`ConveniosView.tsx`](file:///c:/OdontoSouza/src/components/convenios/ConveniosView.tsx)):** Eliminada a lista `DEFAULT_CONVENIOS` (8 operadoras mockadas como Particular VIP, Bradesco, Unimed), desativado o fallback local em caso de banco vazio, zeradas as métricas de topo (0 operadoras ativas, 0 dias de repasse médio, 0 pacientes vinculados e 0 inativos) e purgado o cache local do navegador.
      - **Criação e Suporte Nativo ao "Convênio da Casa" Sem Mensalidade:**
        - **Modelagem & Backend ([`conveniosService.ts`](file:///c:/OdontoSouza/src/services/conveniosService.ts) e [`convenios.ts`](file:///c:/OdontoSouza/src/types/convenios.ts)):** Adicionado suporte a `tipoPlano` (`'proprio'` vs `'operadora'`), `cobreMensalidade` (`boolean`) e `valorMensalidade` (`numeric`). O registro oficial **Convênio da Casa** foi gravado no banco de dados Supabase com status Ativo, registro ANS Isento, prazo de repasse imediato (0 dias), tabela associada "Tabela Convênio da Casa" e mensalidade R$ 0,00 (sem cobrança de mensalidade).
        - **Frontend ([`ConvenioFormView.tsx`](file:///c:/OdontoSouza/src/components/convenios/ConvenioFormView.tsx) e [`ConveniosView.tsx`](file:///c:/OdontoSouza/src/components/convenios/ConveniosView.tsx)):** Inserido seletor de modalidade (Plano Próprio vs Operadora ANS) e controle explícito de cobrança de mensalidade (Sem Mensalidade R$ 0,00 vs Com Mensalidade). Ao digitar ou selecionar "Convênio da Casa", presets automáticos são preenchidos com Repasse 0 dias e isenção de mensalidade. A listagem e o detalhamento agora exibem badge verde destacado "Sem Mensalidade".
      - **Padronização e Simplificação dos Nomes dos Menus Laterais:**
        - Em [`AppLayout.tsx`](file:///c:/OdontoSouza/src/components/layout/AppLayout.tsx) e [`MobileDrawer.tsx`](file:///c:/OdontoSouza/src/components/layout/MobileDrawer.tsx), renomeados os itens de navegação:
          - *"Convênios & Planos"* ➔ **"Convênios"**
          - *"Estoque & Autoclave"* ➔ **"Estoque"**
      - **Eliminação de Dados Mockados no Atendimento Clínico e Implementação do Estado Vazio:**
        - **Diagnóstico:** O módulo de Atendimento ([`AtendimentoView.tsx`](file:///c:/OdontoSouza/src/components/atendimento/AtendimentoView.tsx)) continha dados simulados herdados da prototipagem:
          - Paciente padrão com foto de banco de imagens (`unsplash`) e status *"Carregando paciente..."* com Pront. #0000.
          - 2 procedimentos mockados automáticos (Resina Composta R$ 280,00 e Profilaxia R$ 100,00 totalizando R$ 380,00).
          - Fila do dia fictícia gerada automaticamente quando a agenda estava vazia (`fallbackQueue`).
          - Odontograma anatômico com dentes 17, 16, 25, 26, 47, 46, 36, 37 pré-marcados em vermelho/verde.
          - Evolução clínica com texto mockado sobre o dente 26 em [`ClinicalEvolutionCard.tsx`](file:///c:/OdontoSouza/src/components/atendimento/ClinicalEvolutionCard.tsx).
          - Resumo financeiro com nomes e valores fixos em [`FinancialCheckoutCard.tsx`](file:///c:/OdontoSouza/src/components/atendimento/FinancialCheckoutCard.tsx).
          - Galeria de radiologia com 2 imagens fixas da web em [`RadiologyGalleryCard.tsx`](file:///c:/OdontoSouza/src/components/atendimento/RadiologyGalleryCard.tsx).
        - **Correções Aplicadas:**
          - **Estado Vazio de Atendimento:** Quando não houver paciente em atendimento ativo (`patient === null`), a tela exibe uma interface clínica limpa e acolhedora informando:
            - **Título:** *"Nenhum Atendimento em Andamento"*.
            - **Subtítulo:** *"No momento, a cadeira clínica está liberada e não há nenhum paciente em consulta ativa. Você pode iniciar o atendimento selecionando um paciente da fila do dia ou acessando a agenda clínica."*
            - **Badges e Cards de Status:** Cadeira Odontológica Livre & Higienizada (Disponível), Fila de Hoje (0 pacientes) e Profissional Responsável (Dr. Frankisney Souza).
            - **Ações Rápidas:** Botões *"Ver Agenda do Dia"*, *"Ver Pacientes"* e *"Voltar ao Início"*, além de seletor rápido para iniciar atendimento se houver pacientes cadastrados no banco.
          - **Procedimentos da Sessão:** Inicializado como array vazio (`procedures = []`). Em [`SessionProceduresCard.tsx`](file:///c:/OdontoSouza/src/components/atendimento/SessionProceduresCard.tsx), adicionada mensagem de estado vazio quando não houver procedimentos lançados: *"Nenhum procedimento registrado nesta sessão clínica até o momento."*
          - **Evolução Clínica:** Em [`ClinicalEvolutionCard.tsx`](file:///c:/OdontoSouza/src/components/atendimento/ClinicalEvolutionCard.tsx), removido o texto mockado de dente 26; o campo agora inicia vazio aguardando a anotação real do dentista.
          - **Resumo Financeiro:** Em [`FinancialCheckoutCard.tsx`](file:///c:/OdontoSouza/src/components/atendimento/FinancialCheckoutCard.tsx), removidos valores e nomes simulados, integrando cálculos 100% dinâmicos baseados no paciente ativo e nos procedimentos lançados.
          - **Odontograma:** Inicializado como hígido por padrão em todas as 32 faces/dentes, carregando as condições clínicas reais registradas na tabela `odontograma_itens`.
          - **Fotos e RX:** Em [`RadiologyGalleryCard.tsx`](file:///c:/OdontoSouza/src/components/atendimento/RadiologyGalleryCard.tsx), removidas imagens fixas e exibida mensagem de estado vazio (*"Nenhum exame de RX anexado"*).
          - **Liberação da Cadeira:** Ao concluir uma consulta sem próximo paciente na fila, o sistema redefine o estado para `patient = null` e retorna à tela de cadeira livre e higienizada.
      - **Vínculo Dinâmico dos Planos de Convênio no Cadastro de Pacientes:**
        - **Diagnóstico:** O formulário de cadastro de paciente ([`PacienteFormView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacienteFormView.tsx)) continha opções hardcoded no elemento `<select>` com operadoras fictícias (*Particular VIP*, *Bradesco Dental*, *Uniodonto Dental*, *Amil Dental*, *SulAmérica Odonto*, *Outro Convênio*), desvinculadas dos dados reais da tabela `convenios` do Supabase. Além disso, `pacientesService.ts` forçava um mapeamento rígido para essa lista fixa ao carregar do banco.
        - **Soluções Implementadas:**
          - Em [`PacienteFormView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacienteFormView.tsx): Integrada chamada assíncrona a `conveniosService.getConvenios()` no carregamento do formulário. O seletor de Convênio Odontológico agora renderiza **estritamente os planos cadastrados e ativos na tabela `convenios`** (atualmente exibindo apenas o plano ativo `Convênio da Casa`).
          - Se novos convênios forem cadastrados pelo usuário no módulo de Convênios, eles serão refletidos imediatamente no seletor de novos pacientes.
          - Em [`PacientesView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacientesView.tsx): O filtro de convênios da listagem de pacientes foi atualizado para carregar dinamicamente os planos reais do banco de dados em vez de opções fixas.
          - Em [`pacientesService.ts`](file:///c:/OdontoSouza/src/services/pacientesService.ts) e [`pacientes.ts`](file:///c:/OdontoSouza/src/types/pacientes.ts): O tipo `ConvenioTipo` foi generalizado para `string` e a rotina de leitura do Supabase agora preserva o nome exato registrado na coluna `convenio` sem forçar mapeamentos estáticos.
      - **Eliminação Definitiva de Procedimentos Mockados e Persistência Real no Supabase:**
        - **Diagnóstico:** A tela de Procedimentos ([`ProcedimentosView.tsx`](file:///c:/OdontoSouza/src/components/procedimentos/ProcedimentosView.tsx)) apresentava 15 procedimentos mockados, 99 itens nas abas de status (`Todos (99)`, `Ativos (93)`, `Inativos (6)`) e valores fictícios porque:
          1. Em [`procedimentosService.ts`](file:///c:/OdontoSouza/src/services/procedimentosService.ts), a constante `DEFAULT_PROCEDIMENTOS` continha 15 itens estáticos (de `pr-1` a `pr-15`) retornados como fallback quando a tabela `procedimentos` do Supabase estava vazia.
          2. Em [`ProcedimentosView.tsx`](file:///c:/OdontoSouza/src/components/procedimentos/ProcedimentosView.tsx), os contadores das abas usavam somas hardcoded `84 + ...` e `78 + ...` em vez do comprimento real da lista.
          3. Em [`ProcedimentoFormView.tsx`](file:///c:/OdontoSouza/src/components/procedimentos/ProcedimentoFormView.tsx), os campos de código (`PR-0702`), valor (`180,00`) e descrição vinham pré-preenchidos com textos de exemplo mockados.
        - **Correções e Validação Aplicadas:**
          - **Remoção de Mocks:** `DEFAULT_PROCEDIMENTOS` esvaziado (`[]`) e removido qualquer fallback que injetava dados fictícios quando a tabela do banco estivesse vazia.
          - **Contadores 100% Reais:** As pílulas de status e cards métricos agora calculam os valores rigorosamente com base nos procedimentos retornados do Supabase (`procedimentos.length`), exibindo 0 procedimentos, R$ 0,00 de ticket médio e `Todos (0) Ativos (0) Inativos (0)` quando o banco está zerado.
          - **Formulário Limpo:** O formulário de cadastro inicia com os campos limpos para digitação sem valores simulados.
          - **Persistência no Supabase:** Confirmado via teste end-to-end automatizado que ao cadastrar um procedimento via `salvar_procedimento`, todas as suas informações (`nome`, `categoria`, `descricao`, `duracao_minutos`, `preco_base`, `status`) são gravadas diretamente na tabela `procedimentos` do PostgreSQL Supabase com UUID oficial e lidas com fidelidade imediata.
      - **Remoção Imediata e Permanente de Exposição de Senhas na Interface (Segurança Estrita):**
        - **Incidente:** O card informativo residual de testes locais na tela de login ([`LoginView.tsx`](file:///c:/OdontoSouza/src/components/auth/LoginView.tsx)) exibia textualmente credenciais de acesso em tela (tanto no desktop quanto no mobile), além de preenchimento automático do campo de e-mail e texto de recuperação com senha.
        - **Correção Imediata Aplicada:**
          - Removido integralmente o card de credenciais de teste da interface.
          - Removida a senha de qualquer mensagem de toast, notificação ou texto de apoio.
          - Campo de e-mail inicializado vazio sem pré-preenchimento ou placeholders identificáveis.
          - Reafirmada e blindada a conformidade com a `RULE[security.md]`: **Tolerância Zero para Exposição de Senhas ou Segredos na UI, Logs ou Respostas**.
      - **Configuração do Repositório Git e Preparação para Deploy:**
        - Repositório Git inicializado na branch principal `main`.
        - Adicionado remote `origin` apontando para `https://github.com/odontosouzavr2026-commits/odontosouzavr.git`.
        - Regra de exclusão estrita no `.gitignore` garantindo que:
          - A pasta `1 - imagens do sistema/` nunca seja enviada.
          - Todos os arquivos `.env*` (incluindo `.env.local` com credenciais) fiquem 100% blindados e ignorados.
          - Arquivos de backup `.backups/`, `.tar.gz` e `.zip` fiquem ignorados.
        - Criado commit inicial limpo contendo exclusivamente código-fonte, configurações seguras e documentação.
      - Compilação do projeto verificada com 100% de sucesso via `npm run build`.
      - **Sincronização de Usuários e Autenticação no Supabase Self-Hosted:**
        - Ativado gatilho de auto-confirmação `on_auth_user_auto_confirm` em `auth.users` para aprovar `email_confirmed_at` automaticamente na criação de novos usuários sem dependência de envio de e-mails.
        - Atualizado [`pacientesService.ts`](file:///c:/OdontoSouza/src/services/pacientesService.ts) para gravar novos acessos na tabela `public.usuarios` via RPC `salvar_usuario_sistema` com `SECURITY DEFINER`, contornando bloqueios de RLS e repassando o UUID oficial gerado pelo Supabase Auth.
        - Aprimorado [`LoginView.tsx`](file:///c:/OdontoSouza/src/components/auth/LoginView.tsx) para apresentar mensagens precisas do Supabase Auth e assegurar login imediato para pacientes cadastrados.
      - **Armazenamento de Arquivos S3 (Contabo Object Storage):**
        - Validação de conexão e autenticação executada com sucesso contra o endpoint `https://usc1.contabostorage.com` (região United States Central).
        - Bucket oficial `odontosouza` ativado no S3 da Contabo.
        - **Estrutura Hierárquica Rigorosa:** Arquivos organizados por `{ANO}/{MÊS}/{ID_PACIENTE}/{CATEGORIA}/{ARQUIVO}` (categorias: `perfil`, `exames`, `documentos`, `radiografias`, `receitas`).
        - **Ciclo de Vida & Manutenção Ativa:** Implementada exclusão imediata de arquivos órfãos ao substituir fotos de perfil, remover anexos ou excluir pacientes via [`storageService.ts`](file:///c:/OdontoSouza/src/services/storageService.ts).
        - **Rotas Serverless Seguras na Vercel:** Criados endpoints `/api/storage/upload` e `/api/storage/delete` isolando as credenciais da Contabo exclusivamente no servidor (sem expor nenhuma chave ao navegador do usuário).
        - Integrado ao formulário de pacientes ([`PacienteFormView.tsx`](file:///c:/OdontoSouza/src/components/pacientes/PacienteFormView.tsx)) para envio de avatar e à galeria de exames ([`RadiologyGalleryCard.tsx`](file:///c:/OdontoSouza/src/components/atendimento/RadiologyGalleryCard.tsx)).
        - Criado [`vercel.json`](file:///c:/OdontoSouza/vercel.json) configurado com rotas SPA (`rewrites: [ { source: "/(.*)", destination: "/index.html" } ]`) para impedir erros 404 em recarregamento de página ou rotas profundas.
        - Criado [`.npmrc`](file:///c:/OdontoSouza/.npmrc) com `legacy-peer-deps=true` e removido conflito de versão do `esbuild` no [`package.json`](file:///c:/OdontoSouza/package.json), garantindo que o `npm install` no ambiente da Vercel conclua sem falha de peer dependencies.
        - Atualizado `.gitignore` para ignorar a pasta interna `.vercel`.
        - Resolução completa de todas as inconsistências de tipagem TypeScript no código (`tsc --noEmit` / `npm run lint` passando com 0 erros).
        - Modernizado [`vite.config.ts`](file:///c:/OdontoSouza/vite.config.ts) com `fileURLToPath` para compatibilidade total com o Vite 8.
        - `npm run build` executando em apenas 1.06s gerando o bundle de produção otimizado na pasta `dist/`.
        - Variáveis de ambiente da Contabo configuradas na Vercel e deploy de produção sincronizado com GitHub.
