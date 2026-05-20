import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TransaksiModal from '../components/TransaksiModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

const catEmoji = { Makan:'🍜', Transport:'🚌', Nongkrong:'☕', Kuota:'📱', Akademik:'📚', Menabung:'🏦', Pemasukan:'💰' }
const catColors = { Makan:'#60a5fa', Transport:'#34d399', Nongkrong:'#fbbf24', Kuota:'#f87171', Akademik:'#a78bfa', Menabung:'#2dd4bf', Pemasukan:'#4ade80' }

function fmt(n) {
  if (!n) return 'Rp 0'
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'Jt'
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'K'
  return 'Rp ' + n
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{fmt(p.value)}</div>)}
    </div>
  )
  return null
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { user } = useAuth()

  const fetchTransactions = async () => {
    setLoading(true)
    const { data } = await supabase.from('transactions').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setTransactions(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchTransactions() }, [])

  const income = transactions.filter(t => t.type === 'pemasukan').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + t.amount, 0)
  const savings = income - expense
  const score = Math.min(100, Math.max(0, Math.round((savings / (income || 1)) * 100)))

  // Perbandingan bulan ini vs bulan lalu
  const thisMonth = new Date().toISOString().slice(0, 7)
  const lastMonthDate = new Date(); lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
  const lastMonth = lastMonthDate.toISOString().slice(0, 7)

  const thisIncome  = transactions.filter(t => t.type === 'pemasukan'   && t.date?.startsWith(thisMonth)).reduce((s,t) => s+t.amount, 0)
  const thisExpense = transactions.filter(t => t.type === 'pengeluaran'  && t.date?.startsWith(thisMonth)).reduce((s,t) => s+t.amount, 0)
  const lastIncome  = transactions.filter(t => t.type === 'pemasukan'   && t.date?.startsWith(lastMonth)).reduce((s,t) => s+t.amount, 0)
  const lastExpense = transactions.filter(t => t.type === 'pengeluaran'  && t.date?.startsWith(lastMonth)).reduce((s,t) => s+t.amount, 0)

  const pctChange = (curr, prev) => {
    if (prev === 0 && curr === 0) return null
    if (prev === 0) return 100
    return Math.round(((curr - prev) / prev) * 100)
  }
  const incomePct  = pctChange(thisIncome, lastIncome)
  const expensePct = pctChange(thisExpense, lastExpense)

  // Category breakdown
  const catData = Object.entries(
    transactions.filter(t => t.type === 'pengeluaran').reduce((acc, t) => {
      acc[t.cat] = (acc[t.cat] || 0) + t.amount
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const topCat = catData[0]
  const saveRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0

  // Monthly trend (last 6 months)
  const monthlyData = (() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = d.toISOString().slice(0, 7)
      const label = d.toLocaleString('id-ID', { month: 'short' })
      const inc = transactions.filter(t => t.date?.startsWith(key) && t.type === 'pemasukan').reduce((s, t) => s + t.amount, 0)
      const exp = transactions.filter(t => t.date?.startsWith(key) && t.type === 'pengeluaran').reduce((s, t) => s + t.amount, 0)
      months.push({ label, pemasukan: inc, pengeluaran: exp })
    }
    return months
  })()

  const recent = transactions.slice(0, 5)

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} — Ringkasan keuanganmu</p>
        </div>
        <button className="btn btn-primary hide-on-mobile" onClick={() => setShowModal(true)}>+ Tambah Transaksi</button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pemasukan</div>
          <div className="stat-value" style={{ color: 'var(--neon)' }}>{fmt(income)}</div>
          <div className="stat-change">
            {incomePct !== null
              ? <span style={{ color: incomePct >= 0 ? 'var(--neon2)' : 'var(--red)' }}>
                  {incomePct >= 0 ? '↑' : '↓'} {Math.abs(incomePct)}% vs bulan lalu
                </span>
              : <span style={{ color: 'var(--muted)' }}>Bulan ini</span>
            }
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pengeluaran</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{fmt(expense)}</div>
          <div className="stat-change">
            {expensePct !== null
              ? <span style={{ color: expensePct <= 0 ? 'var(--neon2)' : 'var(--red)' }}>
                  {expensePct >= 0 ? '↑' : '↓'} {Math.abs(expensePct)}% vs bulan lalu
                </span>
              : <span style={{ color: 'var(--muted)' }}>Bulan ini</span>
            }
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tabungan</div>
          <div className="stat-value" style={{ color: 'var(--neon2)' }}>{fmt(Math.max(0, savings))}</div>
          <div className="stat-change" style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>Sisa uang</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Health Score</div>
          <div className="stat-value" style={{ color: 'var(--neon3)' }}>{score}</div>
          <div className="score-bar" style={{ marginTop: 10 }}>
            <div className="score-fill" style={{ width: score + '%' }} />
          </div>
        </div>
      </div>

      {/* MOBILE ONLY: Tombol tambah transaksi dipindah ke sini */}
      <div className="show-on-mobile" style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" style={{ width: '100%', padding: '14px 0', fontSize: 14 }} onClick={() => setShowModal(true)}>
          + Tambah Transaksi
        </button>
      </div>

      {/* CHARTS ROW */}
      <div className="grid-3-1">
        <div className="card">
          <div className="card-title">
            Pengeluaran per Kategori
            <span className="card-badge badge-green">Bulan ini</span>
          </div>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catData}>
                <XAxis dataKey="name" tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b6b80', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {catData.map((entry, i) => <Cell key={i} fill={catColors[entry.name] || '#6b6b80'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">Belum ada data transaksi</div></div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Distribusi</div>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {catData.map((entry, i) => <Cell key={i} fill={catColors[entry.name] || '#6b6b80'} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-icon">🥧</div><div className="empty-text">Belum ada data</div></div>
          )}
        </div>
      </div>

      {/* ANALISIS & INSIGHT (Dari Statistik) */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Insight Otomatis</div>
          <div>
            {topCat ? (
              <div className="score-tip good">🏆 Pengeluaran terbesar ada di <strong>{topCat.name}</strong> ({fmt(topCat.value)})</div>
            ) : null}
            <div className={`score-tip ${saveRate >= 20 ? 'good' : saveRate >= 0 ? 'warn' : 'bad'}`} style={{ marginTop: 8 }}>
              💰 Saving rate kamu: <strong>{saveRate}%</strong>
              {saveRate >= 20 ? ' — bagus!' : saveRate >= 0 ? ' — bisa lebih baik' : ' — waspada!'}
            </div>
            {catData.length > 1 && (
              <div className="score-tip warn" style={{ marginTop: 8 }}>
                📊 Kamu punya <strong>{catData.length}</strong> kategori pengeluaran aktif
              </div>
            )}
            <div className="score-tip good" style={{ marginTop: 8 }}>
              📝 Total <strong>{transactions.length}</strong> transaksi tercatat
            </div>
          </div>
        </div>

        {catData.length > 0 ? (
          <div className="card">
            <div className="card-title">Detail per Kategori</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {catData.slice(0, 6).map(cat => (
                <div key={cat.name} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{catEmoji[cat.name] || '💸'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: catColors[cat.name] || 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{fmt(cat.value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-title">Detail per Kategori</div>
            <div className="empty-state" style={{ padding: '24px' }}><div className="empty-text">Belum ada data</div></div>
          </div>
        )}
      </div>

      {/* BOTTOM ROW */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            Transaksi Terbaru
            <span className="card-badge badge-blue">5 terbaru</span>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner" /> Memuat...</div>
          ) : recent.length > 0 ? (
            <div className="tx-list">
              {recent.map(tx => (
                <div key={tx.id} className="tx-item">
                  <div className="tx-icon" style={{ background: (catColors[tx.cat] || '#6b6b80') + '22' }}>{catEmoji[tx.cat] || '💸'}</div>
                  <div className="tx-info">
                    <div className="tx-name">{tx.name}</div>
                    <div className="tx-cat">{tx.cat} · {tx.date}</div>
                  </div>
                  <div className={`tx-amount ${tx.type === 'pemasukan' ? 'pos' : 'neg'}`}>
                    {tx.type === 'pemasukan' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-icon">💳</div><div className="empty-text">Belum ada transaksi</div></div>
          )}
        </div>

        <div className="card">
          <div className="card-title">
            Tren Bulanan
            <span className="card-badge badge-orange">6 bulan</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="label" tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b80', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="pemasukan" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 3 }} />
              <Line type="monotone" dataKey="pengeluaran" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showModal && <TransaksiModal onClose={() => setShowModal(false)} onSuccess={fetchTransactions} />}
    </div>
  )
}