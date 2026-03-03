// Password strength meter using zxcvbn when available.
// Falls back to a local heuristic scorer if zxcvbn is not present.

window.addEventListener('DOMContentLoaded', function() {
  function isTargetPasswordInput(input) {
    const form = input.closest('form');
    if (!form) return false;

    const action = form.getAttribute('action') || '';
    if (action === '/register' && input.name === 'password') return true;
    if (action.startsWith('/reset-password') && input.name === 'password') return true;
    if (action === '/change-password' && (input.name === 'newPassword' || input.id === 'newPassword')) return true;
    return false;
  }

  function fallbackScore(value) {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    if (value.length >= 12) score++;
    return Math.min(score, 4);
  }

  const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'))
    .filter(isTargetPasswordInput);

  passwordInputs.forEach(function(input) {
    // Only add meter if not already present
    if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('password-strength-meter')) {
      const meter = document.createElement('div');
      meter.className = 'password-strength-meter mt-2 h-2 w-full rounded-full bg-slate-700/70 overflow-hidden';
      meter.innerHTML = '<div class="strength-bar h-2 rounded-full transition-all duration-300 ease-out"></div>';
      input.parentNode.insertBefore(meter, input.nextSibling);

      const feedback = document.createElement('div');
      feedback.className = 'password-strength-feedback text-xs mt-1 text-slate-300 leading-relaxed';
      input.parentNode.insertBefore(feedback, meter.nextSibling);

      input.addEventListener('input', function() {
        const val = input.value;
        let score = 0;
        let feedbackMsg = '';
        let labelMsg = '';
        if (window.zxcvbn) {
          const result = zxcvbn(val);
          score = result.score;
          // Feedback from zxcvbn
          feedbackMsg = result.feedback.suggestions.join(' ');
          if (!feedbackMsg && result.feedback.warning) feedbackMsg = result.feedback.warning;
          // Modern custom suggestions
          if (val) {
            const suggestions = [];
            if (!/[A-Z]/.test(val)) suggestions.push('Add an uppercase letter');
            if (!/[a-z]/.test(val)) suggestions.push('Add a lowercase letter');
            if (!/[0-9]/.test(val)) suggestions.push('Add a number');
            if (!/[^A-Za-z0-9]/.test(val)) suggestions.push('Add a special character (!@#$)');
            if (val.length < 12) suggestions.push('Use 12+ characters for best security');
            if (suggestions.length && score < 4) feedbackMsg = suggestions.join('. ') + '.';
          }
          // Custom label for context
          if (!val) {
            labelMsg = '';
          } else if (val.length < 8) {
            labelMsg = 'Too short (min 8 characters)';
          } else if (score === 0) {
            labelMsg = 'Very weak';
          } else if (score === 1) {
            labelMsg = 'Weak';
          } else if (score === 2) {
            labelMsg = 'Medium';
          } else if (score === 3) {
            labelMsg = 'Good';
          } else if (score === 4) {
            labelMsg = 'Strong password!';
          }
        } else if (val) {
          score = fallbackScore(val);
          const suggestions = [];
          if (!/[A-Z]/.test(val)) suggestions.push('Add an uppercase letter');
          if (!/[a-z]/.test(val)) suggestions.push('Add a lowercase letter');
          if (!/[0-9]/.test(val)) suggestions.push('Add a number');
          if (!/[^A-Za-z0-9]/.test(val)) suggestions.push('Add a special character');
          if (val.length < 12) suggestions.push('Use 12+ characters for best security');
          if (suggestions.length && score < 4) feedbackMsg = suggestions.join('. ') + '.';
          if (val.length < 8) {
            labelMsg = 'Too short (min 8 characters)';
          } else if (score === 0 || score === 1) {
            labelMsg = 'Weak';
          } else if (score === 2) {
            labelMsg = 'Medium';
          } else if (score === 3) {
            labelMsg = 'Good';
          } else {
            labelMsg = 'Strong password!';
          }
        }
        // Set bar color and width
        const bar = meter.querySelector('.strength-bar');
        const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
        bar.className = 'strength-bar h-2 rounded-full transition-all ' + colors[score];
        bar.style.width = val ? ((score + 1) * 20) + '%' : '0%';
        // Set feedback
        feedback.innerHTML = labelMsg ? `<span class='font-semibold'>${labelMsg}</span>` : '';
        if (feedbackMsg) {
          feedback.innerHTML += `<span class='ml-2'>${feedbackMsg}</span>`;
        }
      });
    }
  });
});
