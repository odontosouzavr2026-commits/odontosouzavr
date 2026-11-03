// Vercel Serverless Function: Validação Server-Side do Google reCAPTCHA v2 Invisível

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token do reCAPTCHA ausente.' });
  }

  const secretKey =
    process.env.RECAPTCHA_SECRET_KEY ||
    '6LeaVg4uAAAAAN1aql2oLJprs6gDo0kOTYt8XYeG';

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const googleData = await googleRes.json();
    return res.status(200).json(googleData);
  } catch (err: any) {
    console.error('[verify-recaptcha] Erro ao validar com Google:', err?.message);
    return res.status(500).json({ success: false, error: 'Erro interno ao validar reCAPTCHA.' });
  }
}
