// Custom client-side validation for registration and reset password forms
window.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form[action="/register"], form[action^="/reset-password"]');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      let firstError = null;
      let errorMsg = '';
      // Email
      const email = form.querySelector('input[name="email"]');
      if (email && !email.value.trim()) {
        errorMsg = 'Email is required.';
        firstError = email;
      }
      // Password
      const password = form.querySelector('input[name="password"]');
      if (!errorMsg && password && !password.value.trim()) {
        errorMsg = 'Password is required.';
        firstError = password;
      }
      // Confirm Password
      const confirm = form.querySelector('input[name="confirmPassword"]');
      if (!errorMsg && confirm && !confirm.value.trim()) {
        errorMsg = 'Please confirm your password.';
        firstError = confirm;
      }
      // Terms (register only)
      const terms = form.querySelector('input[name="acceptTerms"]');
      if (!errorMsg && terms && !terms.checked) {
        errorMsg = 'You must accept the Terms of Service.';
        firstError = terms;
      }
      // Bot code (register only)
      const bot = form.querySelector('input[name="botCode"]');
      if (!errorMsg && bot && !bot.value.trim()) {
        errorMsg = 'Verification code is required.';
        firstError = bot;
      }
      if (errorMsg) {
        e.preventDefault();
        showFormError(form, errorMsg);
        if (firstError && typeof firstError.focus === 'function') firstError.focus();
      }
    });
  });

  function showFormError(form, msg) {
    let errorDiv = form.parentNode.querySelector('.form-error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'form-error-message bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded mb-5 text-sm flex items-center gap-2';
      errorDiv.innerHTML = '<svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>';
      form.parentNode.insertBefore(errorDiv, form);
    }
    errorDiv.style.display = '';
    errorDiv.querySelector('svg').nextSibling && errorDiv.removeChild(errorDiv.querySelector('svg').nextSibling);
    errorDiv.appendChild(document.createTextNode(msg));
  }
});
