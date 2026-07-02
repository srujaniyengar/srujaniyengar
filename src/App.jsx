import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { HelpModal, Notif } from "./components/Overlays";
import {
  DistPanel,
  ExpPanel,
  HomePanel,
  KernelPanel,
  MissionPanel,
  OffDutyPanel,
} from "./components/Panels";
import { NAV, COMMANDS } from "./data/content";
import { themes } from "./data/themes";
import { useThemeStore } from "./store/themeStore";
import { useVimBindings } from "./hooks/useVimBindings";

function toCssVarName(tokenName) {
  return `--${tokenName.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
}

export default function App() {
  const [activeNav, setActiveNav] = useState("home");
  const [sidebarFocus, setSidebarFocus] = useState(false);
  const [sidebarIdx, setSidebarIdx] = useState(0);
  const [cmdValue, setCmdValue] = useState("");
  const [cmdMode, setCmdMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notif, setNotif] = useState({ msg: "", visible: false });
  const [catState, setCatState] = useState("awake");
  const [isCompact, setIsCompact] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const inputRef = useRef(null);
  const contentRef = useRef(null);
  const idleTimer = useRef(null);

  const themeId = useThemeStore((state) => state.themeId);
  const setThemeId = useThemeStore((state) => state.setThemeId);
  const cycleTheme = useThemeStore((state) => state.cycleTheme);

  const activeTheme = useMemo(() => themes[themeId] || themes.terminalDark, [themeId]);

  const notify = useCallback((msg, duration = 2400) => {
    setNotif({ msg, visible: true });
    window.setTimeout(() => {
      setNotif((prev) => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  const wakeupCat = useCallback(() => {
    setCatState("awake");
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      setCatState("sleeping");
    }, 5200);
  }, []);

  const navigate = useCallback(
    (id) => {
      setActiveNav(id);
      setSidebarIdx(NAV.findIndex((item) => item.id === id));
      setSidebarFocus(false);
      setCmdMode(false);
      setMobileNavOpen(false);
      wakeupCat();
    },
    [wakeupCat]
  );

  const handleCommand = useCallback(
    (rawValue) => {
      const cmd = rawValue.trim().toLowerCase();
      if (!cmd) {
        return;
      }

      if (cmd === ":theme") {
        cycleTheme();
        notify("theme cycled");
        return;
      }

      if (cmd.startsWith(":theme ")) {
        const candidate = cmd.replace(":theme", "").trim();
        if (themes[candidate]) {
          setThemeId(candidate);
          notify(`theme set: ${themes[candidate].label}`);
        } else {
          notify(`unknown theme: ${candidate}`);
        }
        return;
      }

      const target = COMMANDS[cmd];
      if (!target) {
        notify(`E492: Not an editor command: ${cmd}`);
        return;
      }

      if (target === "__help") {
        setShowHelp(true);
        return;
      }
      if (target === "__git") {
        window.open("https://github.com/srujaniyengar", "_blank", "noopener,noreferrer");
        notify("opening github profile");
        return;
      }
      if (target === "__coffee") {
        wakeupCat();
        notify("cat colony online =^._.^=");
        return;
      }
      if (target === "__q") {
        notify("E37: No write since last change. Use :q! perhaps?");
        return;
      }
      if (target === "__q!") {
        notify("you cannot quit. the cats said no.");
        return;
      }
      if (target === "__w") {
        notify("portfolio saved");
        return;
      }
      if (target === "__wq") {
        notify("saved, but still not quitting");
        return;
      }

      navigate(target);
      notify(`navigated to ${target}`);
    },
    [cycleTheme, navigate, notify, setThemeId, wakeupCat]
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(activeTheme.colors).forEach(([tokenName, value]) => {
      root.style.setProperty(toCssVarName(tokenName), value);
    });
    root.setAttribute("data-theme", themeId);
  }, [activeTheme, themeId]);

  useEffect(() => {
    idleTimer.current = window.setTimeout(() => {
      setCatState("sleeping");
    }, 5200);

    return () => {
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      const compact = window.innerWidth < 980;
      setIsCompact(compact);
      if (!compact) {
        setMobileNavOpen(false);
      }
    };

    // Mount gate: the initial render is SSR-safe (isCompact = false); the real
    // viewport is measured only after the component is mounted in the browser.
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useVimBindings({
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
  });

  const currentNav = NAV.find((item) => item.id === activeNav);
  // The active navigable surface: mobile drawer when compact, else the sidebar.
  const navActive = isCompact ? mobileNavOpen : sidebarFocus;
  const modeLabel = cmdMode ? "COMMAND" : navActive ? "NAV" : "NORMAL";

  return (
    <div className="app-shell">
      <header className="topline">
        <div className="mode-pill">{modeLabel}</div>
        <div className="path-label">~/srujan/{activeNav}</div>
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setMobileNavOpen((prev) => !prev)}
        >
          {mobileNavOpen ? "close nav" : "open nav"}
        </button>
      </header>

      <div className="workspace-body">
        <aside
          className={`sidebar ${isCompact ? "compact" : ""} ${mobileNavOpen ? "open" : ""}`}
          aria-hidden={isCompact && !mobileNavOpen ? true : undefined}
          inert={isCompact && !mobileNavOpen ? true : undefined}
        >
          <div className="sidebar-head">
            <span>system navigator</span>
            <span className="sidebar-cat" title={catState === "sleeping" ? "sleeping" : "awake"}>
              {catState === "sleeping" ? "z^._.^z" : "(^._.^)"}
            </span>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {NAV.map((item, index) => {
              const isActive = activeNav === item.id;
              const isSelected = navActive && sidebarIdx === index;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${isActive ? "active" : ""} ${isSelected ? "selected" : ""}`}
                  onClick={() => navigate(item.id)}
                >
                  <span>{item.label}</span>
                  {isActive ? <span>^._.^</span> : null}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-foot">:help for keybindings · hjkl enabled</div>
        </aside>

        <main className="main-area">
          <div className="section-chip-row" role="tablist" aria-label="Sections">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={activeNav === item.id}
                aria-controls={`panel-${item.id}`}
                className={`section-chip ${activeNav === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id)}
              >
                {item.short}.md
              </button>
            ))}
            <ThemeSwitcher themeId={themeId} onChangeTheme={setThemeId} onCycleTheme={cycleTheme} />
          </div>

          <section
            ref={contentRef}
            className="content-scroll"
            role="tabpanel"
            id={`panel-${activeNav}`}
            aria-labelledby={`tab-${activeNav}`}
            tabIndex={0}
          >
            {activeNav === "home" ? <HomePanel /> : null}
            {activeNav === "exp" ? <ExpPanel /> : null}
            {activeNav === "kernel" ? <KernelPanel /> : null}
            {activeNav === "dist" ? <DistPanel /> : null}
            {activeNav === "mission" ? <MissionPanel /> : null}
            {activeNav === "offduty" ? <OffDutyPanel /> : null}
          </section>
        </main>
      </div>

      <footer className="command-footer">
        <button
          type="button"
          className="command-trigger"
          onClick={() => {
            setCmdMode(true);
            window.requestAnimationFrame(() => inputRef.current?.focus());
          }}
        >
          <span aria-hidden="true">:</span>
          <span className="sr-only">Open command input</span>
        </button>

        <input
          ref={inputRef}
          value={cmdValue}
          onChange={(event) => {
            setCmdValue(event.target.value);
            wakeupCat();
          }}
          onFocus={() => setCmdMode(true)}
          onBlur={() => {
            if (!cmdValue) {
              setCmdMode(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleCommand(`:${cmdValue}`);
              setCmdValue("");
              setCmdMode(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={cmdMode ? "" : "type : for commands (try :help, :mission, :chiv, :theme)"}
          className="command-input"
          aria-label="Command input"
        />

        <div className="status-right">
          <span>-- {modeLabel} --</span>
          <span>{currentNav?.label}</span>
          <span>{themes[themeId]?.label}</span>
          <span>{catState === "sleeping" ? "zzZ ^._.^" : "(^._.^)ﾉ"}</span>
        </div>
      </footer>

      {showHelp ? <HelpModal onClose={() => setShowHelp(false)} /> : null}
      <Notif msg={notif.msg} visible={notif.visible} />
    </div>
  );
}
