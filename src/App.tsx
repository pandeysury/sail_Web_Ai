import { useState, useEffect } from 'react'
import NavBar from './components/NavBar'
import ChatSection from './components/ChatSection'
import Viewer from './components/Viewer'
import './assets/style.css'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function App() {
  const [clientId, setClientId] = useState('rsms')
  //const [clientLabel, setClientLabel] = useState('RSMS')
  const [convId, setConvId] = useState(() => `c_${Math.random().toString(36).slice(2, 10)}`)
  const [doc, setDoc] = useState<{ url: string; title: string } | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const slug = pathSegments[0] || ''
    const id = slug || 'rsms'
    setClientId(id)
    //setClientLabel(id.toUpperCase())
  }, [])

  function openDoc(ref: { url: string; title: string }) {
    setDoc(ref)
  }

  function closeDoc() {
    setDoc(null)
  }

  function newChat() {
    setConvId(`c_${Math.random().toString(36).slice(2, 10)}`)
    setDoc(null)
  }

  return (
    <div className="app">
      {/* NAVBAR */}
      <NavBar
        onNewChat={newChat}
        onHistoryClick={() => setShowHistory(!showHistory)}
        clientLabel={clientId}
      />

      {/* NOTICE */}
      <p className="notice">AI answers can be inaccurate – always verify.</p>

      {/* MAIN WORKSPACE: chat (left) + viewer (right) */}
      <main className="workspace two-col-layout">
        <section className="left-panel">
          <ChatSection clientId={clientId} convId={convId} openDoc={openDoc} />
        </section>
        <section className="right-panel">
          {/* <Viewer url={`${API_BASE_URL+doc?.url}`} title={doc?.title ?? null} close={closeDoc} /> */}
        <Viewer
          url={doc ? `${API_BASE_URL}${doc.url}` : null}
          title={doc?.title ?? null}
          close={closeDoc}
        />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="page-foot">Powered by Safe Lane IT</footer>

      {/* HISTORY PANEL */}
      <div className={`history-pane glass ${showHistory ? 'open' : ''}`}>
        <header>
          <span>Chat History</span>
          <button onClick={() => setShowHistory(false)}>✕</button>
        </header>
        <nav id="thread-list">
          <p className="placeholder">No history loaded yet</p>
        </nav>
      </div>
    </div>
  )
}
