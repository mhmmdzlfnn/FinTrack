import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TransaksiModal from '../components/TransaksiModal'

const catEmoji = { Makan:'🍜', Transport:'🚌', Nongkrong:'☕', Kuota:'📱', Akademik:'📚', Pemasukan:'💰' }
const catColors = { Makan:'#00f5c4', Transport:'#4d9fff', Nongkrong:'#f5a623', Kuota:'#ff4d6d', Akademik:'#a78bfa', Pemasukan:'#34d399' }

function fmt(n) {
  if (!n) return 'Rp 0'
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'Jt'
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'K'
  return 'Rp ' + n
}

export default function Transaksi() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterType, setFilterType] = useState('')
  const { user } = useAuth()

  const fetchTransactions = async () => {
    setLoading(true)
    const { data } = await supabase.from('transactions').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }

  const deleteTransaction = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return
    await supabase.from('transactions').delete().eq('id', id)
    fetchTransactions()
  }

  useEffect(() => { fetchTransactions() }, [])

  const filtered = transactions.filter(tx =>
    (!search || tx.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || tx.cat === filterCat) &&
    (!filterType || tx.type === filterType)
  )

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Riwayat lengkap pemasukan & pengeluaran</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tambah</button>
      </div>

      {/* FILTER */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input className="form-input" type="text" placeholder="Nama transaksi..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-input" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Semua Kategori</option>
              <option>Makan</option>
              <option>Transport</option>
              <option>Nongkrong</option>
              <option>Kuota</option>
              <option>Akademik</option>
              <option>Pemasukan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Jenis</label>
            <select className="form-input" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">Semua Jenis</option>
              <option value="pemasukan">💰 Pemasukan</option>
              <option value="pengeluaran">💸 Pengeluaran</option>
            </select>
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterCat(''); setFilterType('') }}>
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /> Memuat transaksi...</div>
        ) : filtered.length > 0 ? (
          <div className="tx-list">
            {filtered.map(tx => (
              <div key={tx.id} className="tx-item" style={{ position: 'relative' }}>
                <div className="tx-icon" style={{ background: (catColors[tx.cat] || '#6b6b80') + '22' }}>{catEmoji[tx.cat] || '💸'}</div>
                <div className="tx-info">
                  <div className="tx-name">{tx.name}</div>
                  <div className="tx-cat">{tx.cat} · {tx.date}</div>
                </div>
                <div className={`tx-amount ${tx.type === 'pemasukan' ? 'pos' : 'neg'}`} style={{ marginRight: 12 }}>
                  {tx.type === 'pemasukan' ? '+' : '-'}{fmt(tx.amount)}
                </div>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--red)'}
                  onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                >✕</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-text">{transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi yang cocok'}</div>
          </div>
        )}
      </div>

      {showModal && <TransaksiModal onClose={() => setShowModal(false)} onSuccess={fetchTransactions} />}
    </div>
  )
}