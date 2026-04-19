import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const PLAN_CONFIG = {
  basic: { name: 'Basic', monthly: 15, yearly: 162, description: 'Perfect for side projects', was: 25 },
  pro: { name: 'Pro', monthly: 35, yearly: 378, description: 'Best Value • For production apps', was: 60 },
  premium: { name: 'Premium', monthly: 65, yearly: 702, description: 'For serious projects', was: 90 },
};

function loadStripeScript() {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      if (window.Stripe || existing.readyState === 'complete') {
        resolve();
        return;
      }

      let settled = false;

      const cleanup = () => {
        existing.removeEventListener('load', onLoad);
        existing.removeEventListener('error', onError);
        clearInterval(pollId);
        clearTimeout(timeoutId);
      };

      const onLoad = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const onError = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Failed to load Stripe script'));
      };

      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onError, { once: true });

      const pollId = setInterval(() => {
        if (window.Stripe) {
          onLoad();
        }
      }, 250);

      const timeoutId = setTimeout(() => {
        if (window.Stripe) {
          onLoad();
          return;
        }
        onError();
      }, 8000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Stripe script'));
    document.head.appendChild(script);
  });
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [csrfToken, setCsrfToken] = useState('');
  const [stripeKey, setStripeKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const stripeRef = useRef(null);
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);

  const cardNumberContainerRef = useRef(null);
  const cardExpiryContainerRef = useRef(null);
  const cardCvcContainerRef = useRef(null);

  const validatedPlan = useMemo(() => {
    const requested = searchParams.get('plan');
    return PLAN_CONFIG[requested] ? requested : 'basic';
  }, [searchParams]);

  const interval = useMemo(() => {
    const requested = searchParams.get('interval');
    return requested === 'yearly' ? 'yearly' : 'monthly';
  }, [searchParams]);

  const plan = PLAN_CONFIG[validatedPlan];
  const displayPrice = interval === 'yearly' ? plan.yearly : plan.monthly;
  const intervalLabel = interval === 'yearly' ? 'Yearly Billing' : 'Monthly Billing';
  const intervalShort = interval === 'yearly' ? '/year' : '/month';
  const displayedError = fieldErrors.cardNumber || fieldErrors.cardExpiry || fieldErrors.cardCvc || error;

  useEffect(() => {
    let isMounted = true;

    async function setup() {
      try {
        const [csrfRes, stripeRes] = await Promise.all([
          fetch('/api/csrf-token', { credentials: 'include' }),
          fetch('/api/stripe/config', { credentials: 'include' }),
        ]);

        if (!csrfRes.ok) throw new Error('Failed to initialize checkout form.');
        if (!stripeRes.ok) throw new Error('Failed to load payment configuration.');

        const csrfData = await csrfRes.json();
        const stripeData = await stripeRes.json();

        if (!stripeData.publishableKey) {
          throw new Error('Payment configuration is missing.');
        }

        await loadStripeScript();

        if (!isMounted) return;

        setCsrfToken(csrfData.csrfToken || '');
        setStripeKey(stripeData.publishableKey);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load checkout.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    setup();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!stripeKey || !window.Stripe) return;
    if (!cardNumberContainerRef.current || !cardExpiryContainerRef.current || !cardCvcContainerRef.current) return;
    if (cardNumberRef.current || cardExpiryRef.current || cardCvcRef.current) return;

    const stripe = window.Stripe(stripeKey);
    const elements = stripe.elements();

    const elementStyle = {
      base: {
        color: '#e0e6f0',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '16px',
        '::placeholder': { color: '#8892a0' },
      },
      invalid: {
        color: '#ef4444',
      },
    };

    const cardNumber = elements.create('cardNumber', { style: elementStyle });
    const cardExpiry = elements.create('cardExpiry', { style: elementStyle });
    const cardCvc = elements.create('cardCvc', { style: elementStyle });

    cardNumber.mount(cardNumberContainerRef.current);
    cardExpiry.mount(cardExpiryContainerRef.current);
    cardCvc.mount(cardCvcContainerRef.current);

    const onChange = (fieldId, event) => {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldId]: event.error ? event.error.message : '',
      }));
    };

    cardNumber.on('change', (event) => onChange('cardNumber', event));
    cardExpiry.on('change', (event) => onChange('cardExpiry', event));
    cardCvc.on('change', (event) => onChange('cardCvc', event));

    stripeRef.current = stripe;
    cardNumberRef.current = cardNumber;
    cardExpiryRef.current = cardExpiry;
    cardCvcRef.current = cardCvc;

    return () => {
      cardNumber.destroy();
      cardExpiry.destroy();
      cardCvc.destroy();
      cardNumberRef.current = null;
      cardExpiryRef.current = null;
      cardCvcRef.current = null;
      stripeRef.current = null;
    };
  }, [stripeKey]);

  async function onSubmit(e) {
    e.preventDefault();

    if (!stripeRef.current || !cardNumberRef.current) {
      setError('Payment form is not ready yet.');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Cardholder name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ plan: validatedPlan, interval, _csrf: csrfToken }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to start payment.');
      }

      const { error: stripeError, paymentIntent } = await stripeRef.current.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardNumberRef.current,
          billing_details: {
            name: cardholderName.trim(),
          },
        },
      });

      if (stripeError) {
        let message = stripeError.message || 'Payment failed.';
        if (stripeError.decline_code === 'insufficient_funds') {
          message = 'Your card has insufficient funds.';
        } else if (stripeError.decline_code === 'card_velocity_exceeded') {
          message = 'Your card was declined for too many attempts in a short time.';
        }
        throw new Error(message);
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        const params = new URLSearchParams({
          plan: validatedPlan,
          interval,
        });

        if (typeof data.subscriptionId === 'string' && data.subscriptionId.trim()) {
          params.append('subscription_id', data.subscriptionId.trim());
        }

        window.location.href = `/payment-success?${params.toString()}`;
        return;
      }

      throw new Error(`Payment status: ${paymentIntent?.status || 'unknown'}. Please contact support.`);
    } catch (err) {
      setError(err.message || 'Payment failed.');
      setSubmitting(false);
    }
  }

  return (
    <PageLayout>
      <section className="funnel-section funnel-bg-trust">
        <div className="funnel-wide" style={{ maxWidth: '40rem' }}>
          <div className="funnel-card" style={{ padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div className="funnel-kicker" style={{ marginBottom: '0.5rem' }}>{intervalLabel}</div>
              <h1 className="funnel-heading-2" style={{ marginBottom: '0.375rem' }}>{plan.name}</h1>
              <p className="funnel-body-sm" style={{ marginBottom: '0.75rem' }}>{plan.description}</p>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7fd6ff' }}>
                ${displayPrice}
                <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 400 }}>{intervalShort}</span>
              </div>
              {interval === 'yearly' ? (
                <p className="funnel-body-sm" style={{ color: '#86efac' }}>Save 10% with yearly billing.</p>
              ) : (
                <p className="funnel-body-sm">Early Adopter price was ${plan.was}, locked for life.</p>
              )}
            </div>

            {loading && <p className="funnel-body-sm">Loading checkout...</p>}

            {!loading && (
              <form onSubmit={onSubmit}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label className="funnel-body-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Cardholder Name</label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="John Doe"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.375rem',
                      color: '#f5f5f5',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label className="funnel-body-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Card Number</label>
                  <div
                    ref={cardNumberContainerRef}
                    style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.375rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="funnel-body-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>Expiry</label>
                    <div
                      ref={cardExpiryContainerRef}
                      style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.375rem' }}
                    />
                  </div>
                  <div>
                    <label className="funnel-body-sm" style={{ display: 'block', marginBottom: '0.25rem' }}>CVC</label>
                    <div
                      ref={cardCvcContainerRef}
                      style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.375rem' }}
                    />
                  </div>
                </div>

                {displayedError && (
                  <p className="funnel-body-sm" style={{ color: '#fca5a5', marginBottom: '0.75rem' }}>{displayedError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || submitting || !csrfToken}
                  className="funnel-btn funnel-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', opacity: loading || submitting || !csrfToken ? 0.7 : 1 }}
                >
                  {submitting ? 'Processing...' : 'Complete Payment'}
                </button>
              </form>
            )}

            <p className="funnel-body-sm" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              Powered by Stripe • Secure SSL encryption
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
