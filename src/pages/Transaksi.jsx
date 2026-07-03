import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TransaksiModal from '../components/TransaksiModal'

const catEmoji = { Makan:'🍜', Transport:'🚌', Nongkrong:'☕', Kuota:'📱', Akademik:'📚', Menabung:'🏦', Pemasukan:'💰' }
const catColors = { Makan:'#60a5fa', Transport:'#34d399', Nongkrong:'#fbbf24', Kuota:'#f87171', Akademik:'#a78bfa', Menabung:'#2dd4bf', Pemasukan:'#4ade80' }

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

  const printReceipt = (tx) => {
    const printWindow = window.open('', '_blank', 'width=600,height=600')
    if (!printWindow) return

    const formattedAmount = Number(tx.amount).toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Transaksi - ${tx.name}</title>
          <style>
            @page {
              size: 80mm 200mm;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              color: #000;
              background: #fff;
              font-size: 13px;
              line-height: 1.4;
              width: 80mm;
              box-sizing: border-box;
            }
            .receipt {
              width: 100%;
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 2px;
            }
            .subtitle {
              text-align: center;
              font-size: 10px;
              margin-bottom: 15px;
            }
            .separator {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
            }
            .label {
              color: #333;
            }
            .value {
              text-align: right;
              font-weight: bold;
            }
            .amount-section {
              text-align: center;
              margin: 15px 0;
            }
            .amount-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .amount-val {
              font-size: 20px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">FINTRACK RECEIPT</div>
            <div class="subtitle">Catatan Finansial Pribadi</div>
            <div class="separator"></div>
            
            <div class="row">
              <span class="label">ID Transaksi:</span>
              <span class="value">TX-${String(tx.id).slice(0, 8).toUpperCase()}</span>
            </div>
            <div class="row">
              <span class="label">Tanggal:</span>
              <span class="value">${tx.date}</span>
            </div>
            <div class="row">
              <span class="label">Kategori:</span>
              <span class="value">${tx.cat}</span>
            </div>
            <div class="row">
              <span class="label">Jenis:</span>
              <span class="value">${tx.type === 'pemasukan' ? 'Pemasukan (+)' : 'Pengeluaran (-)'}</span>
            </div>

            <div class="separator"></div>
            
            <div class="row" style="flex-direction: column; align-items: flex-start;">
              <span class="label">Keterangan:</span>
              <span class="value" style="text-align: left; margin-top: 2px;">${tx.name}</span>
            </div>

            <div class="separator"></div>

            <div class="amount-section">
              <div class="amount-label">Jumlah</div>
              <div class="amount-val">
                ${tx.type === 'pemasukan' ? '+' : '-'}${formattedAmount}
              </div>
            </div>

            <div class="separator"></div>
            <div class="footer">
              Terima Kasih Telah Menggunakan FinTrack<br>
              fintrack.pages.dev
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 200);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const printReport = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    const totalPemasukan = filtered
      .filter(tx => tx.type === 'pemasukan')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const totalPengeluaran = filtered
      .filter(tx => tx.type === 'pengeluaran')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const selisih = totalPemasukan - totalPengeluaran

    const formatCurrency = (val) => {
      return val.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Transaksi FinTrack</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #1e293b;
              background: #fff;
              font-size: 13px;
              line-height: 1.5;
              padding: 10px;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .brand {
              font-size: 22px;
              font-weight: bold;
              color: #2563eb;
            }
            .title {
              font-size: 15px;
              font-weight: 600;
              text-align: right;
            }
            .date-info {
              font-size: 11px;
              color: #64748b;
              text-align: right;
              margin-top: 4px;
            }
            .summary-cards {
              display: flex;
              gap: 12px;
              margin-bottom: 20px;
            }
            .summary-card {
              flex: 1;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 10px 14px;
              background: #f8fafc;
            }
            .card-label {
              font-size: 9px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
              margin-bottom: 2px;
            }
            .card-value {
              font-size: 14px;
              font-weight: bold;
            }
            .card-value.pos { color: #16a34a; }
            .card-value.neg { color: #dc2626; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              border-bottom: 1px solid #e2e8f0;
              padding: 8px 10px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 600;
              color: #334155;
            }
            tr:nth-child(even) td {
              background-color: #f8fafc;
            }
            .amount {
              font-family: monospace;
              font-weight: bold;
              text-align: right;
            }
            .amount.pos { color: #16a34a; }
            .amount.neg { color: #dc2626; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="brand">FinTrack</div>
            <div>
              <div class="title">LAPORAN TRANSAKSI</div>
              <div class="date-info">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="summary-card">
              <div class="card-label">Total Pemasukan</div>
              <div class="card-value pos">${formatCurrency(totalPemasukan)}</div>
            </div>
            <div class="summary-card">
              <div class="card-label">Total Pengeluaran</div>
              <div class="card-value neg">${formatCurrency(totalPengeluaran)}</div>
            </div>
            <div class="summary-card">
              <div class="card-label">Selisih (Net)</div>
              <div class="card-value ${selisih >= 0 ? 'pos' : 'neg'}">${formatCurrency(selisih)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 15%">Tanggal</th>
                <th style="width: 40%">Nama Transaksi</th>
                <th style="width: 15%">Kategori</th>
                <th style="width: 15%">Jenis</th>
                <th style="width: 15%" class="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(tx => `
                <tr>
                  <td>${tx.date}</td>
                  <td>${tx.name}</td>
                  <td>${tx.cat}</td>
                  <td>${tx.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</td>
                  <td class="amount ${tx.type === 'pemasukan' ? 'pos' : 'neg'}">
                    ${tx.type === 'pemasukan' ? '+' : '-'}${formatCurrency(tx.amount)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 200);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Riwayat lengkap pemasukan & pengeluaran</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={printReport}>🖨️ Cetak Laporan</button>
          <button className="btn btn-primary hide-on-mobile" onClick={() => setShowModal(true)}>+ Tambah</button>
        </div>
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
              <option>Menabung</option>
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

      {/* MOBILE ONLY: Tambah button */}
      <div className="show-on-mobile" style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" style={{ width: '100%', padding: '14px 0', fontSize: 14 }} onClick={() => setShowModal(true)}>
          + Tambah Transaksi
        </button>
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
                  onClick={() => printReceipt(tx)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, padding: 4, marginRight: 8, borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--neon)'}
                  onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                  title="Cetak Struk"
                >🖨️</button>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--red)'}
                  onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                  title="Hapus Transaksi"
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