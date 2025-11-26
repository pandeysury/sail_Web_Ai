
// ChatSection.tsx - Keep this as your ChatSection component
import { useEffect, useState } from 'react'
import showdown from 'showdown'

interface ChatSectionProps {
  clientId: string
  convId: string
  openDoc: (ref: { url: string; title: string }) => void
  onNewMessage: (msg: string) => void;
}

interface Reference {
  url: string
  title: string
}

interface Message {
  role: string
  content: string
  references?: Reference[]
}

const md = new showdown.Converter({ simplifiedAutoLink: true, tables: true, emoji: true })

export default function ChatSection({ clientId, convId, openDoc, onNewMessage }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [convId])

  // async function loadHistory() {
  //   setMessages([]);
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`/api/history?conversation_id=${convId}&client_id=${clientId}`);
  //     if (!res.ok) return;

  //     const data = await res.json();
  //     if (Array.isArray(data) && data.length > 0) {
  //       const parsed: Message[] = data.map((m: any) => {
  //         if (m.role === 'assistant' && m.content?.startsWith('[REFS]')) {
  //           try {
  //             return { role: 'assistant', content: '', references: JSON.parse(m.content.slice(6)) };
  //           } catch {
  //             return { role: 'assistant', content: m.content };
  //           }
  //         }
  //         return {
  //           role: m.role,
  //           content: m.role === 'assistant' ? md.makeHtml(m.content) : m.content,
  //           references: m.references,
  //         };
  //       });
  //       setMessages(parsed);
  //       console.log(parsed, 'parsed');
  //       if (messages.length === 0) {
  //         const firstRef = parsed.find(m => m.references?.length)?.references?.[0];
  //         if (firstRef) openDoc(firstRef);
  //       }

  //     }
  //   } catch (err) {
  //     console.error('History load failed:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // } 
async function loadHistory() {
  setMessages([]);
  setLoading(true);

  try {
    const res = await fetch(`/api/history?conversation_id=${convId}&client_id=${clientId}`);
    if (!res.ok) return;

    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const parsed: Message[] = data.map((m: any) => {

        // --------- FIX: Handle [REFS] with HTML parsing ---------
        if (m.role === "assistant" && m.content?.startsWith("[REFS]")) {
          const html = m.content.slice(6); // remove “[REFS]”

          // Parse HTML into DOM
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const links = doc.querySelectorAll("a.ref-link");

          // Extract refs from <a> tags
          const refs: Reference[] = Array.from(links).map(a => ({
            url: a.getAttribute("data-url") || "",
            title: a.getAttribute("data-title") || "",
          }));

          return { role: "assistant", content: "", references: refs };
        }

        // Normal assistant/user message
        return {
          role: m.role,
          content: m.role === "assistant" ? md.makeHtml(m.content) : m.content,
          references: m.references,
        };
      });

      setMessages(parsed);
      console.log(parsed, "parsed");

      // --------- Auto open reference for history & conv switching ---------
      if (parsed.length > 0) {
        const firstRef = parsed.find(m => m.references?.length)?.references?.[0];
        if (firstRef) openDoc(firstRef);
      }
    }

  } catch (err) {
    console.error("History load failed:", err);
  } finally {
    setLoading(false);
  }
}


  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    
    const q = input.trim()
    const userMsg: Message = { role: 'user', content: q }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    onNewMessage(q)
    setInput('')

    try {
      const res = await fetch(`/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, client_id: clientId, conversation_id: convId }),
      })
      const data = await res.json()
      
      const aiMsg: Message = { 
        role: 'assistant', 
        content: md.makeHtml(data.answer || ''),
        references: data.references || []
      }
      
      setMessages((prev) => [...prev, aiMsg])
      setLoading(false)
      // Auto-open first reference if available
      if (data.references && data.references.length > 0) {
        openDoc(data.references[0])
      }
      
      //console.log('🤖 Ask response:', data.references)

    } catch (err) {
      console.error('Ask error', err)
    }
  }

  return (
    <>
      <style>{`
        .chat {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }

        .glass1 {
          background: background: var#1754ff(--accent);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .page-title {
          padding: 16px 20px;
          margin: 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          margin: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .msg {
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 85%;
          word-wrap: break-word;
        }

        .msg.u {
          background: #5b6cf2;
          color: white;
          align-self: flex-end;
          margin-left: auto;
        }

        .msg.ai {
          background: #f3f4f6;
          color: #1a1a1a;
          align-self: flex-start;
          display: flex;
          flex-direction: column;
        }

        /* References styling */
        .references {
          margin-top: 16px;
          padding: 12px 16px;
          background: #f0f3ff;
          border-left: 3px solid #5b6cf2;
          border-radius: 6px;
        }

        .references strong {
          display: block;
          color: #1a1a1a;
          font-size: 14px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .references-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .reference-link {
          color: #5b6cf2;
          text-decoration: none;
          font-size: 13px;
          line-height: 1.6;
          transition: all 0.2s ease;
          padding: 2px 0;
          display: block;
          cursor: pointer;
        }

        .reference-link:hover {
          color: #4757d9;
          text-decoration: underline;
        }

        .composer {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .composer textarea {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: none;
          min-height: 40px;
          max-height: 120px;
          transition: border-color 0.2s;
        }

        .composer textarea:focus {
          outline: none;
          border-color: #5b6cf2;
        }

        #send-btn {
          padding: 10px 16px;
          background: #5b6cf2;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #send-btn:hover {
          background: #4757d9;
        }

        #send-btn:active {
          transform: scale(0.98);
        }

        .i-send::before {
          content: "➤";
          font-size: 16px;
        }

        /* Scrollbar styling */
        .messages::-webkit-scrollbar {
          width: 8px;
        }

        .messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .messages::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .msg.ai.typing {
          background: #f3f4f6;
          padding: 12px 16px;
          width: fit-content;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }

        .dots {
          display: flex;
          gap: 6px;
        }

        .dots span {
          width: 8px;
          height: 8px;
          background: #5b6cf2;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.4);
            opacity: 0.6;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <section className="chat glass">
        <h2 className="page-title">Chat To SMS Docs</h2>

        <ul className="messages">
          {messages.map((m, i) => (
            <li key={i} className={`msg ${m.role === 'user' ? 'u' : 'ai'}`}>
              <div dangerouslySetInnerHTML={{ __html: m.content }} />
              
              {/* References Section */}
              {m.role === 'assistant' && m.references && m.references.length > 0 && (
                <div className="references">
                  <strong>References</strong>
                  <div className="references-list">
                    {m.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          openDoc(ref)
                        }}
                        className="reference-link"
                      >
                        {ref.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
          {/* {loading && <li className="msg ai">...</li>} */}
          {loading && (
            <li className="msg ai typing">
              <div className="dots">
                <span></span><span></span><span></span>
              </div>
            </li>
          )}
        </ul>

        <form className="composer glass" onSubmit={sendMessage}>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything …"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e)
              }
            }}
          />
          <button id="send-btn" type="submit">
            <i className="i-send"></i>
          </button>
        </form>
      </section>
    </>
  )
}