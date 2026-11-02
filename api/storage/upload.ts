import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Vercel Serverless Function Config
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
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
    const { fileBase64, pacienteId, categoria, filename, contentType, ano, mes } = req.body || {};

    if (!fileBase64) {
      return res.status(400).json({ error: 'Nenhum conteúdo de arquivo (fileBase64) fornecido.' });
    }

    if (!pacienteId) {
      return res.status(400).json({ error: 'O identificador do paciente (pacienteId) é obrigatório.' });
    }

    // Trata base64 data URI ou base64 puro
    let base64Data = fileBase64;
    let detectedMime = contentType || 'application/octet-stream';

    if (fileBase64.includes(';base64,')) {
      const parts = fileBase64.split(';base64,');
      const mimePart = parts[0];
      base64Data = parts[1];
      if (!contentType && mimePart.startsWith('data:')) {
        detectedMime = mimePart.replace('data:', '');
      }
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // Estrutura hierárquica rigorosa: ANO / MÊS / PACIENTE / CATEGORIA / NOME_ARQUIVO
    const now = new Date();
    const targetAno = ano ? String(ano).trim() : String(now.getFullYear());
    const targetMes = mes ? String(mes).trim().padStart(2, '0') : String(now.getMonth() + 1).padStart(2, '0');
    const cleanPacienteId = String(pacienteId).replace(/[^a-zA-Z0-9_-]/g, '') || 'paciente-geral';
    
    // Categorias permitidas: perfil | exames | documentos | radiografias | receitas | institucional
    const catAllowed = ['perfil', 'exames', 'documentos', 'radiografias', 'receitas', 'institucional'];
    const cleanCategoria = catAllowed.includes(categoria) ? categoria : 'documentos';
    
    const ext = detectedMime.includes('png') ? '.png' : detectedMime.includes('pdf') ? '.pdf' : detectedMime.includes('jpeg') || detectedMime.includes('jpg') ? '.jpg' : '';
    const safeBaseName = filename ? filename.replace(/[^a-zA-Z0-9_.-]/g, '_') : `arquivo_${Date.now()}${ext}`;
    const cleanFilename = safeBaseName.endsWith(ext) ? safeBaseName : `${safeBaseName}${ext}`;

    const objectKey = `${targetAno}/${targetMes}/${cleanPacienteId}/${cleanCategoria}/${cleanFilename}`;

    const s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: detectedMime,
      ACL: 'public-read',
    }));

    const fileUrl = `${endpoint}/${bucketName}/${objectKey}`;

    return res.status(200).json({
      success: true,
      url: fileUrl,
      key: objectKey,
      bucket: bucketName,
      size: buffer.length,
      categoria: cleanCategoria,
      ano: targetAno,
      mes: targetMes,
      pacienteId: cleanPacienteId,
    });
  } catch (err: any) {
    console.error('[Vercel S3 Upload] Erro:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Falha ao fazer upload para o S3 da Contabo.',
    });
  }
}
