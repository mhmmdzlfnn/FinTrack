import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const colorOptions = ['fill-neon', 'fill-blue', 'fill-orange']

function fmt(n) {
  if (!n) return 'Rp 0'
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'Jt'
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'K'
  return 'Rp ' + n
}

export default function Target() {
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', goal: '', saved: '', color: 'fill-neon' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const fetchTargets = async () => {
    setLoading(true)
    const { data } = await supabase.from('targets').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTargets(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchTargets() }, [])

  const addTarget = async () => {
    if (!form.name || !form.goal) return setError('Lengkapi nama dan target!')
    setSaving(true); setError('')
    const { error } = await supabase.from('targets').insert([{
      name: form.name,
      goal: parseInt(form.goal),
      saved: parseInt(form.saved) || 0,
      color: form.color,
      user_id: user.id
    }])
    setSaving(false)
    if (error) return setError('Gagal: ' + error.message)
    setForm({ name: '', goal: '', saved: '', color: 'fill-neon' })
    setShowModal(false)
    fetchTargets()
  }

  const updateSaved = async (id, newSaved) => {
    await supabase.from('targets').update({ saved: newSaved }).eq('id', id)
    fetchTargets()
  }

  const deleteTarget = async (id) => {
    if (!confirm('Hapus target ini?')) return
    await supabase.from('targets').delete().eq('id', id)
    fetchTargets()
  }

  const totalSaved = targets.reduce((s, t) => s + t.saved, 0)
  const avgProgress = targets.length > 0 ? Math.round(targets.reduce((s, t) => s + (t.saved / t.goal * 100), 0) / targets.length) : 0

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Target Tabungan</h1>
          <p className="page-subtitle">Pantau progress goalmu</p>
        </div>
        <button className="btn btn-primary hide-on-mobile" onClick={() => setShowModal(true)}>+ Tambah Target</button>
      </div>

      {/* STATS */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Total Ditabung</div>
          <div className="stat-value" style={{ color: 'var(--neon2)' }}>{fmt(totalSaved)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Goal Aktif</div>
          <div className="stat-value" style={{ color: 'var(--neon)' }}>{targets.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rata-rata Progress</div>
          <div className="stat-value" style={{ color: 'var(--neon3)' }}>{avgProgress}%</div>
          <div className="score-bar" style={{ marginTop: 10 }}>
            <div className="score-fill" style={{ width: avgProgress + '%' }} />
          </div>
        </div>
      </div>

      {/* MOBILE ONLY: Tambah button */}
      <div className="show-on-mobile" style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" style={{ width: '100%', padding: '14px 0', fontSize: 14 }} onClick={() => setShowModal(true)}>
          + Tambah Target
        </button>
      </div>

      {/* TARGET LIST */}
      <div className="card">
        <div className="card-title">Target Aktif</div>
        {loading ? (
          <div className="loading"><div className="spinner" /> Memuat...</div>
        ) : targets.length > 0 ? (
          targets.map(t => {
            const pct = Math.min(100, Math.round((t.saved / t.goal) * 100))
            return (
              <div key={t.id} className="target-item">
                <div className="target-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="target-name">{t.name}</div>
                    {pct >= 100 && <span className="card-badge badge-green">✓ Tercapai!</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="target-meta">{fmt(t.saved)} / {fmt(t.goal)}</div>
                    <button
                      onClick={() => deleteTarget(t.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
                      onMouseEnter={e => e.target.style.color = 'var(--red)'}
                      onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                    >✕</button>
                  </div>
                </div>
                <div className="target-bar">
                  <div className={`target-fill ${t.color}`} style={{ width: pct + '%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{pct}% tercapai</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[50000, 100000, 200000].map(add => (
                      <button key={add} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => updateSaved(t.id, t.saved + add)}>
                        +{fmt(add)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-state"><div className="empty-icon">🎯</div><div className="empty-text">Belum ada target tabungan</div></div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">
              Tambah Target Tabungan
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Nama Target</label>
                <input className="form-input" type="text" placeholder="Contoh: Laptop baru..."
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Target (Rp)</label>
                <input className="form-input" type="number" placeholder="5000000"
                  value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Sudah Terkumpul (Rp)</label>
                <input className="form-input" type="number" placeholder="0"
                  value={form.saved} onChange={e => setForm({...form, saved: e.target.value})} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Warna</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['fill-neon', '#00f5c4'], ['fill-blue', '#4d9fff'], ['fill-orange', '#f5a623']].map(([val, color]) => (
                    <div key={val} onClick={() => setForm({...form, color: val})}
                      style={{ width: 32, height: 32, borderRadius: 8, background: color, cursor: 'pointer', border: form.color === val ? '2px solid white' : '2px solid transparent', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</div>}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={addTarget} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Tambah Target'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}