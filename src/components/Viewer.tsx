
type ViewerProps = {
  url: string | null
  title: string | null
  close: () => void
}

export default function Viewer({ url, title, close }: ViewerProps) {
  return (
    <aside className={`viewer ${url ? 'visible' : ''}`}>
      <header className="viewer-head">
        <span id="url-title">{url ? title || 'Document viewer' : 'Document viewer'}</span>
        {url && <button onClick={close}>✕</button>}
      </header>
      {url && <iframe src={url} title={title || 'Document viewer'}></iframe>}
    </aside>
  )
}
