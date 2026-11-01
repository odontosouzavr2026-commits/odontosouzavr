---
trigger: always_on
---

# Regra Obrigatória de Deploy (Responsabilidade & Autorização Prévia)

Diretrizes estritas e permanentes para operações de deploy no projeto OdontoSouza:

1. **RESPONSABILIDADE EXCLUSIVA DO AGENTE:** A função de realizar os deploys do sistema é sempre e exclusivamente do assistente de IA. O usuário não deve ser instruído a realizar deploys manuais.
2. **AUTORIZAÇÃO PRÉVIA OBRIGATÓRIA:** Antes de realizar qualquer deploy (ou disparo de push para a branch `main` que acione o deploy automático na Vercel/GitHub), o assistente DEVE OBRIGATORIAMENTE pedir autorização expressa ao usuário.
3. **NENHUM DEPLOY NÃO AUTORIZADO:** Nenhum deploy pode ser disparado sem a confirmação e aprovação prévia do usuário.
