
export default function NavBar({
  clientLabel,
  onHistoryClick,
  onNewChat
}: {
  clientLabel: string
  onHistoryClick: () => void
  onNewChat: () => void
}) {
  return (
    <header className="nav glass">
      <div className="brand">
        <span className="logo">⚓</span> Safe Lanes
      </div>

      <div className="nav-actions" id="navActions">
        <button id="history-btn" className="action" title="Chat History" onClick={onHistoryClick}>
          <i className="i-history"></i><span>History</span>
        </button>
        <button id="new-chat" className="action" title="New Chat" onClick={onNewChat}>
          <i className="i-plus"></i><span>New</span>
        </button>
        <span className="client-badge glass1">Client: {clientLabel}</span>
      </div>
    </header>
  )
}
