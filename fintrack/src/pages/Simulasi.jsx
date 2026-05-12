import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'

function fmt(n) {
  if (n >= 1000000000) return 'Rp ' + (n / 1000000000).toFixed(2) + ' M'
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + ' Jt'
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'K'
  return 'Rp ' + n
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--surface2)', border: '1px solid rgba(0,245,196,0.3)', borderRadius: 8, padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--neon)' }}>{fmt(payload[0]?.value)}</div>
    </div>
  )
  return null
}

export default function Simulasi() {
  const [PV, setPV] = useState(1000000)
  const [r, setR] = useState(8)
  const [n, setN] = useState(10)
  const [monthly, setMonthly] = useState(200000)
  const [data, setData] = useState([])

  useEffect(() => {
    const rate = r / 100
    const points = []
    for (let t = 0; t <= n; t++) {
      const A = PV * Math.pow(1 + rate, t) +
        (monthly > 0 ? monthly * (Math.pow(1 + rate / 12, t * 12) - 1) / (rate / 12) : 0)
      points.push({ label: t === 0 ? 'Now' : t + ' thn', value: Math.round(A) })
    }
    setData(points)
  }, [PV, r, n, monthly])

  const finalValue = data[data.length - 1]?.value || 0
  const totalInvested = PV + (monthly * n * 12)
  const profit = finalValue - totalInvested

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Simulasi Investasi</h1>
          <p className="page-subtitle">Hitung pertumbuhan uangmu dengan bunga majemuk</p>
        </div>
      </div>

      {/* FORMULA */}
      <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--muted)', letterSpacing: 2 }}>
          A = P × (1 + r/n)^(nt) + PMT × [(1 + r/n)^(nt) − 1] / (r/n)
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>
        {/* INPUTS */}
        <div className="card">
          <div className="card-title">Parameter Simulasi</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {[
              { label: 'Modal Awal (PV)', val: PV, setVal: setPV, min: 100000, max: 50000000, step: 100000, display: fmt(PV) },
              { label: 'Return Tahunan r', val: r, setVal: setR, min: 1, max: 30, step: 0.5, display: r + '%' },
              { label: 'Durasi (Tahun n)', val: n, setVal: setN, min: 1, max: 40, step: 1, display: n + ' tahun' },
              { label: 'Tambahan per Bulan', val: monthly, setVal: setMonthly, min: 0, max: 5000000, step: 50000, display: fmt(monthly) },
            ].map(({ label, val, setVal, min, max, step, display }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--neon)' }}>{display}</span>
                </div>
                <input type="range" className="slider" min={min} max={max} step={step} value={val}
                  onChange={e => setVal(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
            ))}
          </div>

          {/* RESULT */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--neon)', textShadow: '0 0 30px rgba(0,245,196,0.3)' }}>
              {fmt(finalValue)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1.5, marginTop: 4 }}>
              NILAI AKHIR INVESTASI
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 18, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>MODAL TOTAL</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--neon2)' }}>{fmt(totalInvested)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>KEUNTUNGAN</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: profit >= 0 ? 'var(--neon)' : 'var(--red)' }}>{fmt(profit)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CHART */}
        <div className="card">
          <div className="card-title">
            Proyeksi Pertumbuhan
            <span className="card-badge badge-green">{n} tahun</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <defs>
                <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f5c4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00f5c4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b80', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#00f5c4" strokeWidth={2.5}
                dot={false} activeDot={{ r: 6, fill: '#00f5c4', stroke: '#000', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
