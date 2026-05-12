import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Transaksi from './pages/Transaksi'
import Statistik from './pages/Statistik'
import Target from './pages/Target'
import Simulasi from './pages/Simulasi'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transaksi" element={<Transaksi />} />
            <Route path="/statistik" element={<Statistik />} />
            <Route path="/target" element={<Target />} />
            <Route path="/simulasi" element={<Simulasi />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
