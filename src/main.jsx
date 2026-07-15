import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// SW only in production — its cache-first strategy serves stale modules against the dev server.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
  } else {
    // clean up any SW registered by an earlier visit so dev isn't served from cache
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()))
    caches?.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
