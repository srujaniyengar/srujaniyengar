import { useEffect, useRef } from "react";

/**
 * True when the focused element is a native form control or editable surface.
 * The global listener yields to the browser there, so typing behaves natively.
 */
function isEditableTarget(element) {
  if (!element) {
    return false;
  }

  const tag = element.tagName;
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
    return true;
  }

  return element.isContentEditable === true;
}

/**
 * Vim-style keyboard layer: one window listener with deterministic cleanup.
 * ":" opens the command line, "/" opens search, j/k move the cursor line,
 * gg/G jump to the ends, n/N step through matches, Esc unwinds everything.
 */
export function useVimBindings({
  inputRef,
  cursor,
  wakeupCat,
  setCmdMode,
  setCmdValue,
  setShowHelp,
}) {
  const pendingG = useRef(0);

  useEffect(() => {
    const onKeyDown = (event) => {
      wakeupCat();

      if (event.key === "Escape") {
        setShowHelp(false);
        setCmdMode(false);
        setCmdValue("");
        inputRef.current?.blur();
        return;
      }

      if (isEditableTarget(document.activeElement)) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === ":" || event.key === "/") {
        event.preventDefault();
        setCmdMode(true);
        setCmdValue(event.key === "/" ? "/" : "");
        // preventDefault above already stops the ":" from being typed, so focus now.
        inputRef.current?.focus();
        return;
      }

      const wasPendingG = Date.now() - pendingG.current < 600;
      pendingG.current = 0;

      switch (event.key) {
        case "j":
          event.preventDefault();
          cursor.move(1);
          break;
        case "k":
          event.preventDefault();
          cursor.move(-1);
          break;
        case "g":
          if (wasPendingG) cursor.goTo(0);
          else pendingG.current = Date.now();
          break;
        case "G":
          cursor.toEnd();
          break;
        case "n":
          cursor.step(1);
          break;
        case "N":
          cursor.step(-1);
          break;
        default:
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inputRef, cursor, wakeupCat, setCmdMode, setCmdValue, setShowHelp]);
}
