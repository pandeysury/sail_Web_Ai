// src/components/MainLayout.tsx
import { useState, useEffect } from 'react';
import NavBar from './NavBar';
import ChatSection from './ChatSection';
import Viewer from './Viewer';
import './../assets/style.css';          // same CSS you already had

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MainLayout() {
  const [clientId, setClientId] = useState(() => localStorage.getItem('userDomain') || 'rsms');
  const [convId, setConvId] = useState(() => `c_${Math.random().toString(36).slice(2, 10)}`);
  const [doc, setDoc] = useState<{ url: string; title: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [threads, setThreads] = useState<{ id: string; title: string }[]>([]);
  const STORAGE_PREFIX = `${clientId}_`;

  /* ---------- all your original helpers ---------- */
  useEffect(() => {
    const userDomain = localStorage.getItem('userDomain');
    if (userDomain && userDomain !== clientId) {
      setClientId(userDomain);
    }
  }, []);

  const loadThreads = () => {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}THREADS`);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    const list = ids.map((id) => ({
      id,
      title: localStorage.getItem(`${STORAGE_PREFIX}${id}_title`) || 'Untitled',
    }));
    if (!ids.includes(convId)) {
      list.push({ id: convId, title: localStorage.getItem(`${STORAGE_PREFIX}${convId}_title`) || 'Untitled' });
    }
    setThreads(list);
  };

  const deleteThread = (id: string) => {
    if (!confirm('Delete this conversation?')) return;
    const ids = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}THREADS`) || '[]');
    const filtered = ids.filter((tid: string) => tid !== id);
    localStorage.setItem(`${STORAGE_PREFIX}THREADS`, JSON.stringify(filtered));
    localStorage.removeItem(`${STORAGE_PREFIX}${id}_title`);
    if (id === convId) newChat();
    else loadThreads();
  };

  const switchConversation = (id: string) => {
    if (id === convId) {
      setShowHistory(false);
      return;
    }
    setConvId(id);
    setDoc(null);
    setShowHistory(false);
  };

  function openDoc(ref: { url: string; title: string }) {
    setDoc(ref);
  }

  function closeDoc() {
    setDoc(null);
  }

  function newChat() {
    setConvId(`c_${Math.random().toString(36).slice(2, 10)}`);
    setDoc(null);
    loadThreads();
  }

  const saveTitle = (msg: string) => {
    const key = `${STORAGE_PREFIX}${convId}_title`;
    if (!localStorage.getItem(key) || localStorage.getItem(key) === 'Untitled') {
      localStorage.setItem(key, msg.slice(0, 40));
      const ids = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}THREADS`) || '[]');
      if (!ids.includes(convId)) {
        ids.push(convId);
        localStorage.setItem(`${STORAGE_PREFIX}THREADS`, JSON.stringify(ids));
      }
      loadThreads();
    }
  };

  /* ---------- the exact JSX you already had ---------- */
  return (
    <div className="app">
      <NavBar
        onNewChat={newChat}
        onHistoryClick={() => {
          loadThreads();
          setShowHistory((prev) => !prev);
        }}
        clientLabel={clientId}
      />
      <p className="notice">AI answers can be inaccurate – always verify.</p>

      <main className="workspace two-col-layout">
        <section className="left-panel">
          <ChatSection
            clientId={clientId}
            convId={convId}
            openDoc={openDoc}
            onNewMessage={(msg) => {
              if (localStorage.getItem(`${STORAGE_PREFIX}${convId}_title`) === null) {
                saveTitle(msg);
              }
            }}
          />
        </section>
        <section className="right-panel">
          <Viewer
            url={doc ? `${API_BASE_URL}${doc.url}` : null}
            title={doc?.title ?? null}
            close={closeDoc}
          />
        </section>
      </main>

      <footer className="page-foot">Powered by Safe Lane IT</footer>

      <div className={`history-pane glass ${showHistory ? 'open' : ''}`}>
        <header className="history-header">
          <span>Chat History</span>
          <button onClick={() => setShowHistory(false)} className="history-close">X</button>
        </header>
        <nav id="thread-list" className="thread-list">
          {threads.length === 0 ? (
            <p className="no-history">No history yet</p>
          ) : (
            threads.map((t) => (
              <div
                key={t.id}
                className={`thread ${t.id === convId ? 'active' : ''}`}
                onClick={() => switchConversation(t.id)}
              >
                <span className="thread-title">{t.title}</span>
                <button
                  className="thread-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(t.id);
                  }}
                >
                  X
                </button>
              </div>
            ))
          )}
        </nav>
      </div>
    </div>
  );
}