import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error logger for debugging
window.addEventListener('error', (event) => {
  const errDiv = document.createElement('div')
  errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f87171;color:#fff;padding:16px;z-index:99999;font-family:monospace;white-space:pre-wrap;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2)'
  errDiv.textContent = `JS Error: ${event.message}\nAt: ${event.filename}:${event.lineno}:${event.colno}\nError object: ${event.error?.stack || event.error}`
  document.body.appendChild(errDiv)
})

window.addEventListener('unhandledrejection', (event) => {
  const errDiv = document.createElement('div')
  errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#fbbf24;color:#000;padding:16px;z-index:99999;font-family:monospace;white-space:pre-wrap;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2)'
  errDiv.textContent = `Unhandled Rejection: ${event.reason?.message || event.reason}\nStack: ${event.reason?.stack}`
  document.body.appendChild(errDiv)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
