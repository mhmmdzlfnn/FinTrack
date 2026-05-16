import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Pengaturan() {
  const { user, signOut } = useAuth()
  const [password, setPassword] = useState({ new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'FT'

  const handleUpdatePassword = async () => {
    setMsg({ type: '', text: '' })
    if (password.new !== password.confirm) {
      return setMsg({ type: 'error', text: 'Password tidak cocok!' })
    }
    if (password.new.length < 6) {
      return setMsg({ type: 'error', text: 'Password minimal 6 karakter!' })
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: password.new })
    if (error) {
      setMsg({ type: 'error', text: error.message })
    } else {
      setMsg({ type: 'success', text: 'Password berhasil diperbarui!' })
      setPassword({ new: '', confirm: '' })
    }
    setLoading(false)
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil & Pengaturan</h1>
          <p className="page-subtitle">Kelola akun dan preferensi aplikasimu</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Kolom Kiri: Profil & Preferensi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="card">
            <div className="card-title">Profil Pengguna</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--neon), var(--neon2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: '#11111b', fontFamily: 'var(--font-display)',
                flexShrink: 0
              }}>{initials}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Mahasiswa</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{user?.email}</div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Terdaftar</label>
              <input className="form-input" type="text" value={user?.email || ''} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          </div>

          <div className="card">
            <div className="card-title">Preferensi Aplikasi</div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Mata Uang Utama</label>
              <select className="form-input" defaultValue="IDR">
                <option value="IDR">Rupiah (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Format Tanggal</label>
              <select className="form-input" defaultValue="DDMMYYYY">
                <option value="DDMMYYYY">DD/MM/YYYY (Standar)</option>
                <option value="MMDDYYYY">MM/DD/YYYY</option>
              </select>
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Keamanan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="card">
            <div className="card-title">Keamanan Akun</div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Password Baru</label>
              <input className="form-input" type="password" placeholder="Minimal 6 karakter"
                value={password.new} onChange={e => setPassword({ ...password, new: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Konfirmasi Password Baru</label>
              <input className="form-input" type="password" placeholder="Ulangi password baru"
                value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} />
            </div>

            {msg.text && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                background: msg.type === 'error' ? 'rgba(243,139,168,0.1)' : 'rgba(166,227,161,0.1)', 
                border: `1px solid ${msg.type === 'error' ? 'rgba(243,139,168,0.2)' : 'rgba(166,227,161,0.2)'}`,
                color: msg.type === 'error' ? 'var(--red)' : 'var(--neon)', 
                fontSize: 13
              }}>
                {msg.type === 'error' ? '⚠️ ' : '✅ '} {msg.text}
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleUpdatePassword} disabled={loading || !password.new}>
              {loading ? 'Menyimpan...' : 'Perbarui Password'}
            </button>
          </div>

          <div className="card" style={{ borderColor: 'rgba(243,139,168,0.2)' }}>
            <div className="card-title" style={{ color: 'var(--red)' }}>Danger Zone</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Aksi di bawah ini akan mengeluarkan kamu dari sesi saat ini. Kamu harus login kembali untuk masuk.
            </p>
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={signOut}>
              🚪 Logout dari Perangkat Ini
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
