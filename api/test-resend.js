export default async function handler(req, res) {
  const apiKey = process.env.RESEND_API_KEY;
  const TO = process.env.CONTACT_EMAIL;

  if (!apiKey || !TO) {
    return res.status(500).json({ error: 'Env vars missing', hasKey: !!apiKey, hasEmail: !!TO });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: TO,
        subject: 'Resend integration self-test',
        text: 'If you see this in Austins inbox, Resend is working from Vercel. This was triggered from /api/test-resend.',
      }),
    });

    const body = await response.text();
    let parsed;
    try { parsed = JSON.parse(body); } catch(_){ parsed = body; }

    return res.status(200).json({
      resendHttpStatus: response.status,
      resendOk: response.ok,
      resendResponse: parsed,
      keyLength: apiKey.length,
      keyFirst3: apiKey.slice(0, 3),
      keyLast4: apiKey.slice(-4),
      to: TO,
    });
  } catch (err) {
    return res.status(500).json({ error: 'fetch failed', message: err.message });
  }
}
