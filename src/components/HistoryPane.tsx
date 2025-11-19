export default function HistoryPane({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
  clientId: string
}) {
  return (
    <div className={`history-pane glass ${open ? 'open' : ''}`}>
      <header>
        <span>Chat History</span>
        <button onClick={onClose}>✕</button>
      </header>
      <nav id="thread-list">
        <p>No history yet</p>
      </nav>
    </div>
  )
}
