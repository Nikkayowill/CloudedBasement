// Password generator for registration and reset password forms
window.addEventListener('DOMContentLoaded', function() {
  function generatePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
  function setPassword(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  // Support multiple forms (register, reset)
  document.querySelectorAll('form').forEach(form => {
    const passwordInput = form.querySelector('input[name="password"]');
    const genBtn = form.querySelector('#generatePasswordBtn');
    if (passwordInput && genBtn) {
      genBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const pw = generatePassword();
        setPassword(passwordInput, pw);
        // Optionally fill confirm password if present
        const confirmInput = form.querySelector('input[name="confirmPassword"]');
        if (confirmInput) setPassword(confirmInput, pw);
      });
    }
  });
});
