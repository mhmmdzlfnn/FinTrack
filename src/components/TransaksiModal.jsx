import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function TransaksiModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', cat: 'Makan', amount: '', type: 'pengeluaran' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!form.name || !form.amount) return setError('Lengkapi semua field ya!')
    setLoading(true)
    setError('')
    const { error } = await supabase.from('transactions').insert([{
      name: form.name,
      cat: form.cat,
      amount: parseInt(form.amount),
      type: form.type,
      date: new Date().toISOString().slice(0, 10),
      user_id: user.id
    }])
    setLoading(false)
    if (error) return setError('Gagal simpan: ' + error.message)
    onSuccess?.()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          Tambah Transaksi
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Jenis</label>
            <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="pengeluaran">💸 Pengeluaran</option>
              <option value="pemasukan">💰 Pemasukan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-input" value={form.cat} onChange={e => setForm({...form, cat: e.target.value})}>
              <option>Makan</option>
              <option>Transport</option>
              <option>Nongkrong</option>
              <option>Kuota</option>
              <option>Akademik</option>
              <option>Menabung</option>
              <option>Pemasukan</option>
            </select>
          </div>
          <div className="form-group form-full">
            <label className="form-label">Nama / Keterangan</label>
            <input className="form-input" type="text" placeholder="Contoh: Makan siang warteg..."
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group form-full">
            <label className="form-label">Nominal (Rp)</label>
            <input className="form-input" type="number" placeholder="50000"
              value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          </div>
        </div>

        {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </div>
      </div>
    </div>
  )
}