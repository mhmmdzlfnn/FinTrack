import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/transaksi', icon: '💳', label: 'Transaksi' },
  { to: '/statistik', icon: '📈', label: 'Statistik' },
  { to: '/target', icon: '🎯', label: 'Target Tabungan' },
  { to: '/simulasi', icon: '🧮', label: 'Simulasi' },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Ambil inisial dari email
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'FT'
  const emailShort = user?.email?.length > 20 ? user.email.slice(0, 18) + '...' : user?.email

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 100, padding: '28px 0'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 28px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--neon)', textShadow: '0 0 20px rgba(0,245,196,0.4)' }}>
          FinTrack
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
          Student Finance
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px 0', flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', padding: '8px 24px 4px' }}>
          Menu
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 24px', cursor: 'pointer', transition: 'all 0.2s',
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: isActive ? 'var(--neon)' : 'var(--muted)',
              background: isActive ? 'rgba(0,245,196,0.04)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--neon)' : '3px solid transparent',
              boxShadow: isActive ? 'inset 0 0 20px rgba(0,245,196,0.03)' : 'none',
            })}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--neon), var(--neon2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#000', fontFamily: 'var(--font-display)',
            flexShrink: 0
          }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emailShort}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Mahasiswa</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '8px 0', background: 'rgba(255,77,109,0.1)',
          border: '1px solid rgba(255,77,109,0.2)', borderRadius: 8,
          color: 'var(--red)', fontSize: 12, fontFamily: 'var(--font-body)',
          fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,109,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,77,109,0.1)'}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}