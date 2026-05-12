import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts'

const catColors = { Makan:'#00f5c4', Transport:'#4d9fff', Nongkrong:'#f5a623', Kuota:'#ff4d6d', Akademik:'#a78bfa', Pemasukan:'#34d399' }
const catEmoji = { Makan:'🍜', Transport:'🚌', Nongkrong:'☕', Kuota:'📱', Akademik:'📚', Pemasukan:'💰' }

function fmt(n) {
  if (!n) return 'Rp 0'
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'Jt'
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'K'
  return 'Rp ' + n
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{label || payload[0]?.name}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || 'var(--neon)' }}>{fmt(p.value)}</div>)}
    </div>
  )
  return null
}

export default function Statistik() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('transactions').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setTransactions(data || []); setLoading(false) })
  }, [])

  const expense = transactions.filter(t => t.type === 'pengeluaran')
  const income = transactions.filter(t => t.type === 'pemasukan')

  const catData = Object.entries(
    expense.reduce((acc, t) => { acc[t.cat] = (acc[t.cat] || 0) + t.amount; return acc }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const topCat = catData[0]
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0)
  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const saveRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0

  const monthlyData = (() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const key = d.toISOString().slice(0, 7)
      const label = d.toLocaleString('id-ID', { month: 'short' })
      const exp = expense.filter(t => t.date?.startsWith(key)).reduce((s, t) => s + t.amount, 0)
      months.push({ label, pengeluaran: exp })
    }
    return months
  })()

  if (loading) return <div className="loading"><div className="spinner" /> Memuat statistik...</div>

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Statistik</h1>
          <p className="page-subtitle">Analisis mendalam pengeluaranmu</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">Distribusi Pengeluaran <span className="card-badge badge-green">Pie</span></div>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={4}>
                  {catData.map((entry, i) => <Cell key={i} fill={catColors[entry.name] || '#6b6b80'} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-icon">🥧</div><div className="empty-text">Belum ada data pengeluaran</div></div>
          )}
        </div>

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
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Pengeluaran per Kategori <span className="card-badge badge-blue">Bar</span></div>
        {catData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData}>
              <XAxis dataKey="name" tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b80', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {catData.map((entry, i) => <Cell key={i} fill={catColors[entry.name] || '#6b6b80'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">Belum ada data</div></div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Tren 6 Bulan Terakhir <span className="card-badge badge-orange">Line</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="label" tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b6b80', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="pengeluaran" stroke="#4d9fff" strokeWidth={2} dot={{ fill: '#4d9fff', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detail kategori */}
      {catData.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">Detail per Kategori</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {catData.map(cat => (
              <div key={cat.name} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{catEmoji[cat.name] || '💸'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</div>
                  <div style={{ fontSize: 12, color: catColors[cat.name] || 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{fmt(cat.value)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
