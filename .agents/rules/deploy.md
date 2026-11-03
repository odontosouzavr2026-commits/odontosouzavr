---
trigger: always_on
---

# Regra Obrigatória de Deploy (Cadência de 5 Alterações & Responsabilidade)

Diretrizes estritas e permanentes para operações de deploy no projeto OdontoSouza:

1. **RESPONSABILIDADE EXCLUSIVA DO AGENTE:** A função de realizar os deploys do sistema é sempre e exclusivamente do assistente de IA. O usuário não deve ser instruído a realizar deploys manuais.
2. **CADÊNCIA DE DEPLOY A CADA 5 ALTERAÇÕES:** A cada lote de **5 (cinco) alterações/tarefas concluídas**, o assistente deve obrigatoriamente consolidar as mudanças, rodar a verificação de integridade/build (`npm run build`) e **executar o deploy automaticamente** para a branch `main` (Vercel).
3. **DEPLOY SOB DEMANDA:** Sempre que o usuário solicitar explicitamente o deploy (ex: *"faça o deploy"*), o assistente deve executar o deploy imediatamente, independentemente do contador de alterações.
4. **CONTADOR DE ALTERAÇÕES:** O assistente deve manter a contagem de tarefas/alterações implementadas desde o último deploy e sinalizar ao usuário a posição atual no ciclo (ex: *"Alteração 1 de 5"*, *"Alteração 5 de 5 — executando deploy automático"*).
