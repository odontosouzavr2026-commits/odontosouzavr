---
trigger: always_on
---

# Regra de Segurança Estrita (Proteção de Segredos e Credenciais)

Diretrizes obrigatórias e permanentes para o projeto OdontoSouza:

1. **PROIBIDO EXPOR SEGREDOS:** Nunca exiba, imprima, compartilhe ou comite chaves privadas, senhas de banco de dados, `SERVICE_ROLE_KEY`, tokens JWT privados, senhas de usuários ou variáveis confidenciais de ambiente em respostas, logs ou arquivos versionados.
2. **ISOLAMENTO DE VARIÁVEIS:** Credenciais e chaves devem residir exclusivamente em arquivos `.env` ou `.env.local`, os quais **obrigatoriamente** devem permanecer listados no `.gitignore`.
3. **MÁSCARA E PLACEHOLDERS:** Ao instruir configurações ou criar exemplos, use sempre placeholders seguros (ex: `sua_chave_anon_aqui`, `SUA_SENHA_FORTE`, `[CHAVE_OCULTA]`).
4. **PROTEÇÃO DE DADOS DE SAÚDE (LGPD/HIPAA):** Dados pessoais, médicos ou odontológicos de pacientes nunca devem ser expostos fora do escopo seguro da aplicação com RLS (Row-Level Security).
