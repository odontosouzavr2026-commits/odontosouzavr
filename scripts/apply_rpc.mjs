import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const lines = envContent.split(/\r?\n/);
let supabaseUrl = lines.find(l => l.startsWith('VITE_SUPABASE_URL=')).replace('VITE_SUPABASE_URL=', '').replace(/['"]/g, '').trim();
let serviceKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')).replace('SUPABASE_SERVICE_ROLE_KEY=', '').replace(/['"]/g, '').trim();

async function applyRpc() {
  const rpcPath = path.resolve(__dirname, '../src/lib/database-rpc.sql');
  const rpcSql = fs.readFileSync(rpcPath, 'utf8');

  console.log('[APLICANDO FUNÇÕES RPC NO SUPABASE SELF-HOSTED]...');
  const res = await fetch(`${supabaseUrl}/pg/query`, {
    method: 'POST',
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: rpcSql })
  });

  if (!res.ok) {
    console.error('[ERRO AO APLICAR RPC]:', await res.text());
    process.exit(1);
  }

  console.log('[SUCESSO] Todas as funções RPC do sistema Odonto Souza foram registradas e liberadas!');
}

applyRpc();
