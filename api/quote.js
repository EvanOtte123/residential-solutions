import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const TO = process.env.CONTACT_EMAIL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY || !TO) {
    return res.status(500).json({ error: 'Server email not configured' });
  }

  const { service, name, email, phone, details } = req.body || {};

  if (!name || !email || !phone || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (String(phone).replace(/\D/g, '').length < 7) {
    return res.status(400).json({ error: 'Invalid phone' });
  }

  const text = [
    'New job request from the website:',
    '',
    `Service:  ${service}`,
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Phone:    ${phone}`,
    '',
    'Details:',
    details && details.trim() ? details : '(none provided)',
    '',
    '— Sent from the Residential Solutions LLC website',
  ].join('\n');

  try {
    const { error } = await resend.emails.send({
      from: 'Residential Solutions <onboarding@resend.dev>',
      to: TO,
      reply_to: email,
      subject: `Quote request: ${service} — ${name}`,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Email provider error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send failure:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
