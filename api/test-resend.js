export default async function handler(req, res) {
  const apiKey = process.env.RESEND_API_KEY;
  const TO = process.env.CONTACT_EMAIL;

  if (!apiKey || !TO) {
    return res.status(500).json({ error: 'Env vars missing', hasKey: !!apiKey, hasEmail: !!TO });
  }

  const auth = { Authorization: `Bearer ${apiKey}` };

  // Test 1: list api-keys (read auth)
  let listKeys = null;
  try {
    const r = await fetch('https://api.resend.com/api-keys', { headers: auth });
    const text = await r.text();
    let parsed; try { parsed = JSON.parse(text); } catch(_){ parsed = text; }
    listKeys = { status: r.status, body: parsed };
  } catch (err) { listKeys = { error: err.message }; }

  // Test 2: list domains
  let listDomains = null;
  try {
    const r = await fetch('https://api.resend.com/domains', { headers: auth });
    const text = await r.text();
    let parsed; try { parsed = JSON.parse(text); } catch(_){ parsed = text; }
    listDomains = { status: r.status, body: parsed };
  } catch (err) { listDomains = { error: err.message }; }

  // Test 3: send email
  let sendEmail = null;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: TO,
        subject: 'Resend integration self-test',
        text: 'Self-test from Vercel.',
      }),
    });
    const text = await r.text();
    let parsed; try { parsed = JSON.parse(text); } catch(_){ parsed = text; }
    sendEmail = { status: r.status, body: parsed };
  } catch (err) { sendEmail = { error: err.message }; }

  // Char codes of first/last few chars to detect invisible characters
  const charCodesFirst5 = Array.from(apiKey.slice(0, 5)).map(c => c.charCodeAt(0));
  const charCodesLast5 = Array.from(apiKey.slice(-5)).map(c => c.charCodeAt(0));

  return res.status(200).json({
    keyLength: apiKey.length,
    keyFirst3: apiKey.slice(0, 3),
    keyLast4: apiKey.slice(-4),
    charCodesFirst5,
    charCodesLast5,
    to: TO,
    listKeys,
    listDomains,
    sendEmail,
  });
}
