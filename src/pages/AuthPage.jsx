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
        else setSuccess('Account created! Check your email to confirm, or ask your admin to verify your account.')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">WU</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--charcoal)' }}>
              Westpaq · UTC
            </div>
            <div style={{ fontSize: 12, color: 'var(--mist)', marginTop: 2 }}>
              Bonga North Project — Travel Log
            </div>
          </div>
        </div>

        {isDemo && (
          <div className="config-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <strong>Setup required:</strong> Edit <code>src/lib/supabase.js</code> and add your Supabase URL and API key, then run the SQL schema. See README.md for instructions.
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 4 }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--mist)' }}>
            {mode === 'login' ? 'Access the travel log system' : 'Request access to the system'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
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

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: 'center' }}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--mist)' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                Request access
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
