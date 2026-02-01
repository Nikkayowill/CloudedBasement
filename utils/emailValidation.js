const dns = require('dns').promises;

// List of disposable/temporary email domains to block
const disposableEmailDomains = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'mailinator.com',
  'maildrop.cc',
  'temp-mail.org',
  'yopmail.com',
  'fakeinbox.com',
  'trashmail.com',
  'getnada.com',
  'temp-mail.io',
  'mohmal.com',
  'emailondeck.com',
  'mintemail.com',
  'sharklasers.com',
  'guerrillamail.info',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'grr.la'
];

// Common fake/test domains that technically exist but aren't real
const fakeTestDomains = [
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'test.org',
  'localhost',
  'invalid',
  'fake.com',
  'notreal.com',
  'noemail.com',
  'nomail.com'
];

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
}

function isFakeTestEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return fakeTestDomains.includes(domain);
}

// Check if domain has valid MX records
async function hasMXRecords(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (err) {
    // Domain doesn't exist or has no MX records
    return false;
  }
}

// Full email validation
async function validateEmailDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return { valid: false, reason: 'Invalid email format' };
  }
  
  if (isDisposableEmail(email)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed' };
  }
  
  if (isFakeTestEmail(email)) {
    return { valid: false, reason: 'Please use a real email address' };
  }
  
  // Skip MX check for fake test domains (they have MX records but shouldn't be allowed)
  // MX check for other domains to catch typos like "gmial.com"
  const hasMX = await hasMXRecords(email);
  if (!hasMX) {
    return { valid: false, reason: 'Email domain does not exist or cannot receive mail' };
  }
  
  return { valid: true };
}

module.exports = {
  isDisposableEmail,
  isFakeTestEmail,
  hasMXRecords,
  validateEmailDomain,
  disposableEmailDomains,
  fakeTestDomains
};
