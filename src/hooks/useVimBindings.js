import { useEffect } from "react";

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
 * `:` opens the command line, j/k/g/G scroll the page, Esc unwinds everything.
 */
export function useVimBindings({
  inputRef,
  contentRef,
  wakeupCat,
  setCmdMode,
  setCmdValue,
  setShowHelp,
}) {
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

      if (event.key === ":") {
        event.preventDefault();
        setCmdMode(true);
        setCmdValue("");
        window.requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }

      const content = contentRef.current;
      if (!content) {
        return;
      }

      if (event.key === "g") {
        content.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (event.key === "G") {
        content.scrollTo({ top: content.scrollHeight, behavior: "smooth" });
      }
      if (event.key === "j") {
        content.scrollBy({ top: 66, behavior: "smooth" });
      }
      if (event.key === "k") {
        content.scrollBy({ top: -66, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inputRef, contentRef, wakeupCat, setCmdMode, setCmdValue, setShowHelp]);
}
