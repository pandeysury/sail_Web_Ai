// src/components/ChatSection/ChatSection.tsx
import { useEffect, useState } from 'react';
import showdown from 'showdown';
import FeedbackButtons from './FeedbackButtons';
import './ChatSection.css';

interface ChatSectionProps {
  clientId: string;
  convId: string;
  openDoc: (ref: { url: string; title: string }) => void;
  onNewMessage: (msg: string) => void;
}

interface Reference {
  url: string;
  title: string;
}

interface Message {
  role: string;
  content: string;
  references?: Reference[];
  question?: string; // Store the original question for feedback
}

const md = new showdown.Converter({
  simplifiedAutoLink: true,
  tables: true,
  emoji: true,
});

// Robust HTML stripping function
function stripHtml(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

export default function ChatSection({
  clientId,
  convId,
  openDoc,
  onNewMessage,
}: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [convId]);

  async function loadHistory() {
    setMessages([]);
    setLoading(true);
    try {
      const userDomain = localStorage.getItem('userDomain') || clientId;
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/history?conversation_id=${convId}&client_id=${userDomain}`
      );
      if (!res.ok) return;
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const parsed: Message[] = data.map((m) => {
          if (m.role === 'assistant' && m.content?.startsWith('[REFS]')) {
            const html = m.content.slice(6);
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a.ref-link');
            const refs: Reference[] = Array.from(links).map((a) => ({
              url: a.getAttribute('data-url') || '',
              title: a.getAttribute('data-title') || '',
            }));
            return { role: 'assistant', content: '', references: refs };
          }
          return {
            role: m.role,
            content:
              m.role === 'assistant' ? md.makeHtml(m.content) : m.content,
            references: m.references,
          };
        });
        setMessages(parsed);

        const firstRef = parsed.find((m) => m.references?.length)?.references?.[0];
        if (firstRef) openDoc(firstRef);
      }
    } catch (err) {
      console.error('History load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const q = input.trim();
    const userMsg: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    onNewMessage(q);
    setInput('');

    try {
      const userDomain = localStorage.getItem('userDomain') || clientId;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          client_id: userDomain,
          conversation_id: convId,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const aiMsg: Message = {
          role: 'assistant',
          content: `Error: ${errorData.detail || 'Something went wrong'}`,
          references: [],
          question: q,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      const aiMsg: Message = {
        role: 'assistant',
        content: md.makeHtml(data.answer || 'No answer received'),
        references: data.references || [],
        question: q,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      if (data.references?.length) openDoc(data.references[0]);
    } catch (err) {
      console.error('Ask error', err);
    }
  }

  return (
    <section className="chat glass">
      <h2 className="chat-title">Chat To SMS Docs</h2>

      <ul className="messages">
        {messages.map((m, i) => (
          <li key={i} className={`msg ${m.role === 'user' ? 'u' : 'ai'}`}>
            {/* Message content wrapper */}
            <div className="msg-content">
              <div dangerouslySetInnerHTML={{ __html: m.content }} />
            </div>

            {/* References section - outside content wrapper for full width */}
            {m.role === 'assistant' && m.references && m.references.length > 0 && (
              <div className="references">
                <strong>References</strong>
                <div className="references-list">
                  {m.references.map((ref, idx) => (
                    <a
                      key={idx}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openDoc(ref);
                      }}
                      className="reference-link"
                    >
                      {ref.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback buttons for AI responses */}
            {m.role === 'assistant' && m.question && (
              <FeedbackButtons
                conversationId={convId}
                clientId={clientId}
                question={m.question}
                answer={stripHtml(m.content)} // Strip HTML for plain text
              />
            )}
          </li>
        ))}

        {loading && (
          <li className="msg ai typing">
            <div className="dots">
              <span />
              <span />
              <span />
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
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <button id="send-btn" type="submit">
          <i className="i-send" />
        </button>
      </form>
    </section>
  );
}