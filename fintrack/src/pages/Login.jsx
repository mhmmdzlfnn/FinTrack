import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(''); setSuccess('')

    if (!form.email || !form.password) return setError('Email dan password wajib diisi!')
    if (mode === 'register' && form.password !== form.confirm) return setError('Password tidak cocok!')
    if (form.password.length < 6) return setError('Password minimal 6 karakter!')

    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) { setError('Email atau password salah!'); setLoading(false); return }
      navigate('/dashboard')
    } else {
      const { error } = await signUp(form.email, form.password)
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Registrasi berhasil! Cek email kamu untuk konfirmasi, lalu login.')
      setMode('login')
      setForm({ email: form.email, password: '', confirm: '' })
    }

    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 600px 400px at 20% 30%, rgba(166,227,161,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 500px 500px at 80% 70%, rgba(137,180,250,0.05) 0%, transparent 70%)
        `
      }} />

      <div style={{ width: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
            color: 'var(--neon)',
            letterSpacing: -1
          }}>FinTrack</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: 2 }}>
            STUDENT FINANCE TRACKER
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 36,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'var(--surface2)', borderRadius: 12,
            padding: 4, marginBottom: 28, border: '1px solid var(--border)'
          }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '9px 0', border: 'none', borderRadius: 9,
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: mode === m ? 'var(--neon)' : 'transparent',
                  color: mode === m ? '#11111b' : 'var(--muted)',
                  boxShadow: mode === m ? '0 2px 8px rgba(166,227,161,0.2)' : 'none'
                }}>
                {m === 'login' ? '🔑 Login' : '✨ Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="kamu@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey} autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey} />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Konfirmasi Password</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                  onKeyDown={handleKey} />
              </div>
            )}
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)',
              color: 'var(--red)', fontSize: 13
            }}>⚠️ {error}</div>
          )}
          {success && (
            <div style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(166,227,161,0.1)', border: '1px solid rgba(166,227,161,0.2)',
              color: 'var(--neon)', fontSize: 13
            }}>✅ {success}</div>
          )}

          {/* Submit */}
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', marginTop: 20, padding: '13px 0', fontSize: 14, borderRadius: 12 }}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Login ke Dashboard →' : 'Buat Akun →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          Data keuanganmu aman & terenkripsi 🔒
        </div>
      </div>
    </div>
  )
}