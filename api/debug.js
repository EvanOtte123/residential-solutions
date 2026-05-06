export default function handler(req, res) {
  const key = process.env.RESEND_API_KEY || '';
  const email = process.env.CONTACT_EMAIL || '';

  return res.status(200).json({
    hasResendKey: !!key,
    keyLength: key.length,
    keyStartsWithRe: key.startsWith('re_'),
    keyHasLeadingSpace: key !== key.trimStart(),
    keyHasTrailingSpace: key !== key.trimEnd(),
    keyFirst3: key.slice(0, 3),
    keyLast4: key.slice(-4),
    hasContactEmail: !!email,
    contactEmail: email,
    nodeVersion: process.version,
  });
}
