import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('YOUR_PROJECT')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else {
        if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return }
        const { error } = await signUp(email, password, fullName)
        if (error) setError(error.message)
        else setSuccess('Account request sent! Your admin will verify and activate your account.')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* ── Logo & Brand ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <img
            src="./westpaq_logo-01.png"
            alt="Westpaq"
            style={{ height: 64, width: 'auto', objectFit: 'contain', marginBottom: 14 }}
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          {/* Fallback if logo fails to load */}
          <div style={{
            display: 'none', width: 64, height: 64, background: 'var(--red)',
            borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'white',
            fontSize: 22, marginBottom: 14,
          }}>W</div>

          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--charcoal)', letterSpacing: '-0.3px' }}>
            WESTPAQ
          </div>
          <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 3, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Travel Log System
          </div>
        </div>

        {/* ── Setup warning (only shows if Supabase not configured) ── */}
        {isDemo && (
          <div className="config-banner" style={{ marginBottom: 20 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <strong>Setup required:</strong> Add your Supabase credentials and run the SQL schema before using this system.
            </div>
          </div>
        )}

        {/* ── Form heading ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 4 }}>
            {mode === 'login' ? 'Sign in' : 'Request Access'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--mist)' }}>
            {mode === 'login' ? 'Enter your credentials to continue' : 'Submit your details and an admin will activate your account'}
          </p>
        </div>

        {/* ── Error / Success messages ── */}
        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>
        )}
        {success && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
            {success}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. John Smith"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@westpaq.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
              required
              minLength={mode === 'signup' ? 8 : undefined}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 4, justifyContent: 'center', padding: '11px 16px', fontSize: 14 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
            {mode === 'login' ? 'Sign In' : 'Submit Request'}
          </button>
        </form>

        {/* ── Toggle mode ── */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--mist)' }}>
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500 }}
              >
                Request access
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500 }}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--smoke)', textAlign: 'center', fontSize: 11, color: 'var(--silver)' }}>
          Westpaq Engineering Nigeria Limited · Internal System
        </div>

      </div>
    </div>
  )
}
