# Regra de Verificação Prévia de Skills & Economia de Tokens

Diretriz obrigatória e permanente para o projeto OdontoSouza:

1. **VERIFICAÇÃO PRÉVIA DE SKILLS:** Antes de executar qualquer ação, comando ou implementação solicitada pelo usuário, consulte obrigatoriamente a lista de skills disponíveis no workspace (`.agents/skills/`) ou no ambiente e utilize/leia as instruções da skill correspondente (ex: `nextjs-app-router-patterns`, `react-state-management`, `tailwind-design-system`, `auth-implementation-patterns`, `backend-architect`, `appointment-calendar-scheduling`, etc.).
2. **ECONOMIA ESTRITA DE TOKENS:** 
   - Nunca gere blocos de código desnecessários nas respostas ao usuário (a menos que explicitamente solicitado).
   - Mantenha respostas curtas, diretas e objetivas.
   - Utilize as melhores práticas consolidadas das skills para evitar retrabalho, testes redundantes e consumo excessivo de contexto.
3. **LINGUAGEM NATURAL E CLÍNICA (ZERO JARGÃO TÉCNICO):**
   - Nunca utilize jargões técnicos de programação nos botões, telas, rótulos ou mensagens visíveis para o usuário (evite termos como "Backend", "Banco de dados", "Payload", "RPC", "API", etc.).
   - Utilize sempre termos naturais e clínicos do dia a dia da clínica (ex: "Salvar no Prontuário", "Salvar Alterações", "Confirmar Procedimento").
4. **GATILHO "VAMOS CONVERSAR":** Quando o usuário disser *"vamos conversar"*, não altere arquivos nem programe nada. Apenas converse, explique, escute e tire dúvidas em texto.
