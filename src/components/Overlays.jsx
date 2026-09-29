import { useEffect, useRef } from "react";

const KEY_ROWS = [
  ["j / k", "Scroll down / up"],
  ["g / G", "Top / bottom"],
  [":home :exp :projects :offduty", "Jump to a section"],
  [":theme", "Toggle light / dark"],
  [":git", "Open GitHub profile"],
  ["Esc", "Close this / leave command mode"],
];

export function HelpModal({ onClose }) {
  const dialogRef = useRef(null);

  // Move focus into the dialog, and give it back to whatever had it on close.
  // Focus the container, not the close button: the Enter that ran :help would
  // otherwise "click" the button and close the dialog immediately.
  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  return (
    <div className="help-backdrop" onClick={onClose} role="presentation">
      <section
        ref={dialogRef}
        className="help-modal"
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="help-title">:help</h2>
        <dl className="facts">
          {KEY_ROWS.map(([key, desc]) => (
            <div key={key} className="facts-row">
              <dt>{key}</dt>
              <dd>{desc}</dd>
            </div>
          ))}
        </dl>
        <button type="button" className="text-button" onClick={onClose}>
          close (Esc)
        </button>
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
