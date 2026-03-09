const { validationResult } = require('express-validator');
const { sendContactEmail } = require('../../services/email');
const { validateEmailDomain } = require('../../src/utils/emailValidation');

// JSON API handler — used by POST /api/contact from the React Contact page
exports.submitContactJson = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, message } = req.body;

  // Validate email domain is real
  const emailCheck = await validateEmailDomain(email);
  if (!emailCheck.valid) {
    return res.status(400).json({ error: emailCheck.reason });
  }

  // Mask email for logging (show first and last char of local-part, and domain)
  const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    if (local.length <= 2) return '*@' + domain;
    return local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] + '@' + domain;
  };
  const maskedEmail = maskEmail(email);
  console.log('Contact form received:', { name, email: maskedEmail, message: (message || '').substring(0, 50) + '...' });

  // Send email to business inbox
  const result = await sendContactEmail(name, email, message);

  if (!result.success) {
    console.error('Failed to send contact email:', result.error);
    return res.status(500).json({ success: false, error: result.error || 'Failed to send contact email' });
  }
  res.json({ success: true });
};
