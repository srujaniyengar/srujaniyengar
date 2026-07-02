import { useEffect } from "react";
import { NAV } from "../data/content";

/**
 * True when the currently focused element is a native form control or any
 * editable surface. Used by the "Elite Bailout": if this returns true the
 * global keydown listener yields completely to the browser so typing,
 * option selection, and caret movement behave natively.
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
 * Isolated Vim-style keyboard layer for the portfolio shell.
 *
 * Design contract:
 * - No component reaches into the DOM to bind keys; all global keyboard state
 *   lives here behind a single window listener with deterministic cleanup.
 * - The Elite Bailout guarantees zero hijacking of native form controls.
 * - Sidebar (desktop) and mobile drawer share one navigation model so `j`/`k`
 *   never dead-end on small viewports.
 */
export function useVimBindings({
  isCompact,
  sidebarFocus,
  mobileNavOpen,
  sidebarIdx,
  inputRef,
  contentRef,
  navigate,
  wakeupCat,
  setSidebarFocus,
  setMobileNavOpen,
  setSidebarIdx,
  setCmdMode,
  setCmdValue,
  setShowHelp,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      wakeupCat();

      // Escape is intentionally global: it unwinds every transient surface
      // (help modal, command mode, sidebar/drawer focus) from anywhere.
      if (event.key === "Escape") {
        setShowHelp(false);
        setCmdMode(false);
        setCmdValue("");
        setSidebarFocus(false);
        setMobileNavOpen(false);
        inputRef.current?.blur();
        return;
      }

      // Elite Bailout: any editable/native form element gets the browser's
      // native behavior with no interference whatsoever.
      if (isEditableTarget(document.activeElement)) {
        return;
      }

      if (event.key === ":") {
        event.preventDefault();
        setCmdMode(true);
        setCmdValue("");
        window.requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }

      // One navigation model for both layouts: on compact viewports the mobile
      // drawer is the navigable surface; otherwise it is the desktop sidebar.
      const navActive = isCompact ? mobileNavOpen : sidebarFocus;

      if (event.key === "h") {
        event.preventDefault();
        if (isCompact) {
          setMobileNavOpen((prev) => !prev);
        } else {
          setSidebarFocus((prev) => !prev);
        }
        return;
      }

      if (navActive) {
        if (event.key === "j") {
          event.preventDefault();
          setSidebarIdx((prev) => Math.min(prev + 1, NAV.length - 1));
        }
        if (event.key === "k") {
          event.preventDefault();
          setSidebarIdx((prev) => Math.max(prev - 1, 0));
        }
        if (event.key === "Enter") {
          event.preventDefault();
          navigate(NAV[sidebarIdx].id);
        }
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
        // Dynamic bottom via measured content height — no magic pixel constant.
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
  }, [
    isCompact,
    sidebarFocus,
    mobileNavOpen,
    sidebarIdx,
    navigate,
    wakeupCat,
    inputRef,
    contentRef,
    setSidebarFocus,
    setMobileNavOpen,
    setSidebarIdx,
    setCmdMode,
    setCmdValue,
    setShowHelp,
  ]);
}
