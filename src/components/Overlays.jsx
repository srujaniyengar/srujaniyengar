export function HelpModal({ onClose }) {
  const keyRows = [
    ["h", "Toggle sidebar focus"],
    ["j / k", "Move selection in sidebar"],
    ["Enter", "Open selected section"],
    ["g / G", "Scroll top / bottom"],
    [":home", "Navigate to Home"],
    [":exp", "Navigate to Experience"],
    [":kernel", "Navigate to Kernel / Networking"],
    [":dist", "Navigate to Distributed Systems"],
    [":mission", "Navigate to Mission"],
    [":chiv", "Navigate to Off Duty / Chivalry 2"],
    [":git", "Open GitHub profile"],
    [":coffee", "Wake the cat colony"],
    ["Esc", "Close modal / clear command mode"],
  ];

  return (
    <div className="help-backdrop" onClick={onClose} role="presentation">
      <section className="help-modal" onClick={(event) => event.stopPropagation()}>
        <h3>:help - systems navigator</h3>
        <div className="help-grid">
          {keyRows.map(([key, desc]) => (
            <div key={key} className="help-grid-row">
              <span>{key}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
        <pre className="help-cat" aria-hidden="true">
          {`    /\\_____/\\
   /  o   o  \\
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)`}
        </pre>
        <p className="help-footer">Press Esc or click outside to close</p>
      </section>
    </div>
  );
}

export function Notif({ msg, visible }) {
  return (
    <div className={`notif ${visible ? "show" : ""}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
