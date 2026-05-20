import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/transaksi', icon: '💳', label: 'Transaksi' },
  { to: '/target', icon: '🎯', label: 'Target Tabungan' },
  { to: '/simulasi', icon: '🧮', label: 'Simulasi' },
  { to: '/pengaturan', icon: '⚙️', label: 'Pengaturan' },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'FT'
  const emailShort = user?.email?.length > 20 ? user.email.slice(0, 18) + '...' : user?.email

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo-container">
        <div className="sidebar-logo-text">FinTrack</div>
        <div className="sidebar-logo-sub">Student Finance</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-header">Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle — desktop only */}
      <div className="theme-toggle-row hide-on-mobile">
        <span style={{ fontSize: 12 }}>{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <div className="theme-toggle-thumb" />
        </button>
      </div>

      {/* User */}
      <div className="sidebar-user-container">
        <div className="sidebar-user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-email">{emailShort}</div>
            <div className="user-status">Mahasiswa</div>
          </div>
        </div>
      </div>
    </aside>
  )
}