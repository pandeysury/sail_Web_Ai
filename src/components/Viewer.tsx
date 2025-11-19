// export default function Viewer({
//   url,
//   close,
//   title = null
// }: {
//   url: string | null
//   title: string | null | undefined
//   // url: { url: string; title: string } | null
//   close: () => void
// }) {
//   return (
//     <aside className={`viewer ${url ? 'visible' : ''}`}>
//       <header className="viewer-head">
//         <span id="url-title">{url ? title : 'Document viewer'}</span>
//         {url && <button onClick={close}>✕</button>}
//       </header>
//       {url && <iframe src={url} title={title||''}></iframe>}
//     </aside>
//   )
// }


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
