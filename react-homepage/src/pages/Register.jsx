import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResponsiveNav from '../components/ResponsiveNav';
import Footer from '../sections/Footer';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const [csrf, setCsrf] = useState('');
  const [botCode, setBotCode] = useState('');
  const [botInput, setBotInput] = useState('');

  const error   = searchParams.get('error') || '';
  const success  = searchParams.get('success') || '';
  const email    = searchParams.get('email') || '';

  const botCorrect = botInput.length > 0 && botInput === botCode;
  const submitReady = csrf && botCorrect;

  useEffect(() => {
    fetch('/api/csrf-token', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCsrf(d.csrfToken))
      .catch(() => {});
    fetch('/api/auth/bot-challenge', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setBotCode(d.botCode))
      .catch(() => {});
  }, []);

  const inputClass = 'w-full px-4 py-2.5 bg-black/40 border border-blue-500/30 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all';

  const botInputClass = `w-full px-4 py-2.5 bg-black/40 border rounded text-white text-center font-mono text-lg tracking-[0.3em] uppercase placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
    botInput.length === 0
      ? 'border-red-500/50'
      : botCorrect
      ? 'border-green-500/50 focus:ring-green-500/50'
      : 'border-red-500/50'
  }`;

  return (
    <div className="funnel">
      <ResponsiveNav />

      <main className="pt-14">
        <section className="funnel-section funnel-bg-solution">
          <div className="funnel-prose">
            <div className="max-w-md mx-auto w-full">
              <h1 className="funnel-heading-1 text-center mb-8">Create Account</h1>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded mb-5 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-2.5 rounded mb-5 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  {success}
                </div>
              )}

              <div className="funnel-card-featured p-8">
                <form method="POST" action="/register" className="space-y-5">
                  <input type="hidden" name="_csrf" value={csrf} />
                  <input type="hidden" name="fingerprint" value="" />

                  <div>
                    <label htmlFor="reg-email" className="block funnel-body-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>Email</label>
                    <input
                      id="reg-email"
                      type="email"
                      name="email"
                      required
                      defaultValue={email}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block funnel-body-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>Password</label>
                    <input
                      id="reg-password"
                      type="password"
                      name="password"
                      minLength={8}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-confirm" className="block funnel-body-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>Confirm Password</label>
                    <input
                      id="reg-confirm"
                      type="password"
                      name="confirmPassword"
                      minLength={8}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block funnel-body-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>
                      Verify you're human
                    </label>
                    <p className="funnel-body-sm mb-2" style={{ color: '#9ca3af' }}>Type this code exactly as shown</p>
                    <div className="bg-black/60 border border-blue-500/40 rounded px-4 py-3 mb-2 text-center">
                      <span className="text-2xl font-mono font-bold text-blue-400 tracking-[0.3em]">
                        {botCode || '······'}
                      </span>
                    </div>
                    <input
                      type="text"
                      name="botCode"
                      value={botInput}
                      onChange={(e) => setBotInput(e.target.value.toUpperCase())}
                      required
                      maxLength={6}
                      placeholder="TYPE CODE HERE"
                      className={botInputClass}
                    />
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      name="acceptTerms"
                      required
                      className="mt-0.5 w-4 h-4 cursor-pointer accent-blue-500"
                    />
                    <label htmlFor="acceptTerms" className="funnel-body-sm cursor-pointer" style={{ color: '#9ca3af' }}>
                      I agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                        Terms of Service
                      </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!submitReady}
                    className="funnel-btn funnel-btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Register
                  </button>
                </form>

                <div className="flex items-center my-5">
                  <div className="flex-1 border-t border-blue-500/20" />
                  <span className="px-4 funnel-body-sm" style={{ color: '#6b7280' }}>or</span>
                  <div className="flex-1 border-t border-blue-500/20" />
                </div>

                <a
                  href="/auth/google"
                  className="w-full flex items-center justify-center gap-3 py-2.5 bg-white text-gray-800 font-medium rounded hover:bg-gray-100 transition-all"
                >
                  <GoogleIcon />
                  Sign up with Google
                </a>

                <p className="text-center funnel-body-sm mt-5" style={{ color: '#9ca3af' }}>
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Login</a>
                </p>
                <div className="mt-5 pt-5 border-t border-blue-500/20 text-center">
                  <p className="funnel-body-sm" style={{ color: '#6b7280' }}>
                    By registering, you agree to our{' '}
                    <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">Terms</a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
