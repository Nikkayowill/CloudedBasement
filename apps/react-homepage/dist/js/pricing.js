// Billing toggle (Monthly / Yearly)
let currentBilling = 'monthly';

function toggleBilling() {
  currentBilling = currentBilling === 'monthly' ? 'yearly' : 'monthly';
  
  const slider = document.getElementById('billingSlider');
  const labels = document.querySelectorAll('.billing-label');
  const pricingAmounts = document.querySelectorAll('.pricing-amount');
  const planCtas = document.querySelectorAll('.plan-cta');
  
  // Move slider
  if (currentBilling === 'yearly') {
    slider.style.transform = 'translateX(32px)';
  } else {
    slider.style.transform = 'translateX(0)';
  }
  
  // Update label styles
  labels.forEach(label => {
    const type = label.getAttribute('data-type');
    if (type === currentBilling) {
      label.classList.remove('text-gray-400');
      label.classList.add('text-gray-300', 'font-medium');
    } else {
      label.classList.remove('text-gray-300', 'font-medium');
      label.classList.add('text-gray-400');
    }
  });
  
  // Update pricing
  pricingAmounts.forEach(amount => {
    const monthlyPrice = amount.getAttribute('data-monthly');
    const yearlyPrice = amount.getAttribute('data-yearly');
    const priceValue = amount.querySelector('.price-value');
    const priceInterval = amount.querySelector('.price-interval');
    
    if (currentBilling === 'yearly') {
      priceValue.textContent = '$' + yearlyPrice;
      priceInterval.textContent = '/yr';
    } else {
      priceValue.textContent = '$' + monthlyPrice;
      priceInterval.textContent = '/mo';
    }
  });
  
  // Update CTA button hrefs
  planCtas.forEach(cta => {
    const plan = cta.getAttribute('data-plan');
    cta.href = `/pay?plan=${plan}&interval=${currentBilling}`;
  });
}
