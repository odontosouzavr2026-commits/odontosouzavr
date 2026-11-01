import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split(/\r?\n/);

let supabaseUrl = '';
let serviceKey = '';

for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.replace('VITE_SUPABASE_URL=', '').replace(/^["']|["']$/g, '').trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    serviceKey = line.replace('SUPABASE_SERVICE_ROLE_KEY=', '').replace(/^["']|["']$/g, '').trim();
  }
}

async function queryTable(tableName, cols) {
  const queryEndpoint = `${supabaseUrl}/pg/query`;
  const res = await fetch(queryEndpoint, {
    method: 'POST',
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `SELECT ${cols} FROM public.${tableName} LIMIT 5;` })
  });
  return await res.json();
}

async function runCheck() {
  console.log('=== AUDITORIA DE DADOS NO POSTGRESQL (ODONTO SOUZA) ===\n');

  console.log('1. PERFIS DE ACESSO (7 PERFIS OFICIAIS):');
  const perfis = await queryTable('perfis_acesso', 'nome, nivel_acesso, cor');
  console.table(perfis);

  console.log('\n2. EQUIPE CLÍNICA & USUÁRIOS:');
  const usuarios = await queryTable('usuarios', 'nome, email, perfil_nome, funcao');
  console.table(usuarios);

  console.log('\n3. PACIENTES CADASTRADOS (COM ANAMNESE E CONTATOS):');
  const pacientes = await queryTable('pacientes', 'nome, cpf, telefone, convenio');
  console.table(pacientes);

  console.log('\n4. PROCEDIMENTOS ODONTOLÓGICOS (TABELA DE PREÇOS):');
  const procs = await queryTable('procedimentos', 'nome, categoria, preco_base, duracao_minutos');
  console.table(procs);

  console.log('\n5. TRANSAÇÕES FINANCEIRAS:');
  const fin = await queryTable('transacoes_financeiras', 'tipo, categoria, descricao, valor, status');
  console.table(fin);

  console.log('\n6. ESTOQUE & INSUMOS CLÍNICOS:');
  const est = await queryTable('estoque_materiais', 'nome, unidade, quantidade_atual, status');
  console.table(est);

  console.log('\n7. CICLOS DE AUTOCLAVE:');
  const auto = await queryTable('ciclos_autoclave', 'lote_ciclo, equipamento, status');
  console.table(auto);

  console.log('\n8. ORDENS DE LABORATÓRIO (PRÓTESES):');
  const lab = await queryTable('ordens_laboratorio', 'numero_os, tipo_trabalho, dentes_envolvidos, status');
  console.table(lab);

  console.log('\n9. TRILHA DE AUDITORIA & LOGS DE SEGURANÇA (LGPD / CFO):');
  const audit = await queryTable('auditoria_logs', 'usuario_nome, usuario_perfil, acao, entidade, detalhes');
  console.table(audit);
}

runCheck();
