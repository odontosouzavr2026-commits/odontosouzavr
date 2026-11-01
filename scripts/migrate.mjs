import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler .env.local de forma segura
const envPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('[ERRO] Arquivo .env.local não encontrado.');
  process.exit(1);
}

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

if (!supabaseUrl || !serviceKey) {
  console.error('[ERRO] VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados em .env.local.');
  process.exit(1);
}

const queryEndpoint = `${supabaseUrl}/pg/query`;

async function executeSql(sql, stepName) {
  console.log(`[INFO] Executando: ${stepName}...`);
  try {
    const res = await fetch(queryEndpoint, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[FALHA em ${stepName}]: Status ${res.status}`);
      console.error(errText);
      return false;
    }

    console.log(`[SUCESSO] ${stepName} concluído com êxito!`);
    return true;
  } catch (err) {
    console.error(`[EXCEÇÃO em ${stepName}]:`, err.message);
    return false;
  }
}

async function run() {
  const schemaPath = path.resolve(__dirname, '../src/lib/database-schema.sql');
  const seedsPath = path.resolve(__dirname, '../src/lib/database-seeds.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedsSql = fs.readFileSync(seedsPath, 'utf8');

  const schemaOk = await executeSql(schemaSql, 'Criação de Tabelas, RLS e Índices (Schema)');
  if (!schemaOk) {
    console.error('[ABORTADO] Falha no schema. Não prosseguindo para os seeds.');
    process.exit(1);
  }

  const seedsOk = await executeSql(seedsSql, 'Carga de Dados Realistas (Seeds)');
  if (!seedsOk) {
    console.error('[ABORTADO] Falha nos seeds.');
    process.exit(1);
  }

  console.log('[CONCLUÍDO] Banco de dados do Odonto Souza configurado e populado com 100% de sucesso!');
}

run();
