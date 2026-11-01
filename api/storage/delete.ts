import { S3Client, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST ou DELETE.' });
  }

  const accessKeyId = process.env.CONTABO_ACCESS_KEY;
  const secretAccessKey = process.env.CONTABO_SECRET_KEY;
  const endpoint = process.env.CONTABO_ENDPOINT || 'https://usc1.contabostorage.com';
  const bucketName = process.env.CONTABO_BUCKET || 'odontosouza';
  const region = process.env.CONTABO_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    return res.status(500).json({ error: 'Credenciais do Contabo S3 não configuradas no servidor.' });
  }

  try {
    const { key, url, pacienteId, ano, mes, fullCleanup } = req.body || {};

    const s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    // CENÁRIO 1: Exclusão recursiva de toda a pasta do paciente (quando o paciente é excluído do sistema)
    if (fullCleanup && pacienteId) {
      const cleanPacienteId = String(pacienteId).replace(/[^a-zA-Z0-9_-]/g, '');
      const prefix = ano && mes ? `${ano}/${mes}/${cleanPacienteId}/` : '';

      // Lista todos os arquivos da pasta do paciente
      const listCmd = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix || undefined,
      });
      const listed = await s3.send(listCmd);

      // Filtra apenas objetos que contenham o pacienteId no caminho
      const objectsToDelete = (listed.Contents || [])
        .filter((item) => item.Key && item.Key.includes(`/${cleanPacienteId}/`))
        .map((item) => ({ Key: item.Key! }));

      if (objectsToDelete.length > 0) {
        await s3.send(new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: objectsToDelete,
            Quiet: false,
          },
        }));
      }

      return res.status(200).json({
        success: true,
        message: `Pasta do paciente "${cleanPacienteId}" limpa com sucesso.`,
        deletedCount: objectsToDelete.length,
        deletedKeys: objectsToDelete.map((o) => o.Key),
      });
    }

    // CENÁRIO 2: Exclusão de arquivo individual (por Key ou por URL completa)
    let targetKey = key;
    if (!targetKey && url) {
      // Extrai a key a partir da URL completa: https://usc1.contabostorage.com/odontosouza/{KEY}
      const marker = `/${bucketName}/`;
      if (url.includes(marker)) {
        targetKey = url.split(marker)[1];
      }
    }

    if (!targetKey) {
      return res.status(400).json({ error: 'Nenhuma chave (key) ou URL de arquivo fornecida para exclusão.' });
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: targetKey,
    }));

    return res.status(200).json({
      success: true,
      message: `Arquivo "${targetKey}" excluído do bucket com sucesso.`,
      deletedKey: targetKey,
    });
  } catch (err: any) {
    console.error('[Vercel S3 Delete] Erro:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Falha ao excluir arquivo do S3 da Contabo.',
    });
  }
}
