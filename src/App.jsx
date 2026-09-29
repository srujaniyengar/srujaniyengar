import { useCallback, useEffect, useRef, useState } from "react";
import profile from "../profile.json";
import { HelpModal, Notif } from "./components/Overlays";
import { ExpPanel, HomePanel, OffDutyPanel, ProjectsPanel } from "./components/Panels";
import { NAV, COMMANDS } from "./data/nav";
import { useVimBindings } from "./hooks/useVimBindings";

const THEME_KEY = "theme";

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

// null = follow the OS light/dark setting; "dark" / "light" = explicit choice via :theme.
function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme) {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    try {
      if (theme) localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage blocked: the choice just lasts for this visit.
    }
  }, [theme]);

  const toggle = useCallback(() => {
    const systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const current = theme ?? (systemLight ? "light" : "dark");
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    return next;
  }, [theme]);

  return toggle;
}

export default function App() {
  const toggleTheme = useTheme();

  const [activeNav, setActiveNav] = useState("home");
  const [cmdValue, setCmdValue] = useState("");
  const [cmdMode, setCmdMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notif, setNotif] = useState({ msg: "", visible: false });
  const [catState, setCatState] = useState("awake");

  const inputRef = useRef(null);
  const contentRef = useRef(null);
  const idleTimer = useRef(null);

  const notify = useCallback((msg, duration = 2400) => {
    setNotif({ msg, visible: true });
    window.setTimeout(() => {
      setNotif((prev) => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  const wakeupCat = useCallback(() => {
    setCatState("awake");
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setCatState("sleeping"), 5200);
  }, []);

  const navigate = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNav(id);
    setCmdMode(false);
  }, []);

  const handleCommand = useCallback(
    (rawValue) => {
      const cmd = rawValue.trim().toLowerCase();
      if (!cmd || cmd === ":") {
        return;
      }

      const target = COMMANDS[cmd];
      if (!target) {
        notify(`E492: Not an editor command: ${cmd}`);
        return;
      }

      const actions = {
        __help: () => setShowHelp(true),
        __theme: () => notify(`theme: ${toggleTheme()}`),
        __git: () => {
          window.open(profile.links.github, "_blank", "noopener,noreferrer");
          notify("opening github profile");
        },
        __q: () => notify("E37: No write since last change. Use :q! perhaps?"),
        "__q!": () => notify("you cannot quit. the cat said no."),
        __w: () => notify("portfolio saved"),
        __wq: () => notify("saved, but still not quitting"),
      };

      if (actions[target]) {
        actions[target]();
        return;
      }
      navigate(target);
    },
    [navigate, notify, toggleTheme]
  );

  // Active section = last one whose top has passed the upper third of the scroller;
  // at the very bottom it is the last section, however short.
  useEffect(() => {
    const root = contentRef.current;
    const onScroll = () => {
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight - 4;
      const line = root.getBoundingClientRect().top + root.clientHeight / 3;
      const passed = NAV.filter(({ id }) => {
        const el = document.getElementById(id);
        return el && el.getBoundingClientRect().top <= line;
      });
      const id = atBottom ? NAV[NAV.length - 1].id : (passed.at(-1)?.id ?? NAV[0].id);
      setActiveNav(id);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    idleTimer.current = window.setTimeout(() => setCatState("sleeping"), 5200);
    return () => window.clearTimeout(idleTimer.current);
  }, []);

  useVimBindings({
    inputRef,
    contentRef,
    wakeupCat,
    setCmdMode,
    setCmdValue,
    setShowHelp,
  });

  const modeLabel = cmdMode ? "COMMAND" : "NORMAL";

  return (
    <div className="app-shell">
      <header className="topline">
        <div className="mode-pill">{modeLabel}</div>
        <div className="path-label">~/srujan/{activeNav}</div>
      </header>

      <div className="workspace">
        <aside className="tree" aria-label="Sections">
          <p className="tree-title">&quot; NERDTree</p>
          <p className="dim">~/srujan/</p>
          <p className="tree-dir">▾ portfolio/</p>
          <ul>
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={activeNav === item.id ? "active" : undefined}
                  aria-current={activeNav === item.id ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(item.id);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <pre className="cat tree-cat" aria-hidden="true">
            {catState === "sleeping"
              ? "  /\\_/\\\n ( -.- ) zz\n  > ^ <"
              : "  /\\_/\\\n ( o.o )\n  > ^ <"}
          </pre>
        </aside>

        <main ref={contentRef} className="content-scroll" tabIndex={-1}>
          <nav className="tabline" aria-label="Sections">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeNav === item.id ? "active" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="buffer">
            <HomePanel p={profile} />
            <ExpPanel p={profile} />
            <ProjectsPanel p={profile} />
            <OffDutyPanel p={profile} />
            <div className="tildes" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i}>~</span>
              ))}
            </div>
          </div>
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
              handleCommand(`:${cmdValue.replace(/^:/, "")}`);
              setCmdValue("");
              setCmdMode(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={cmdMode ? "" : "type : for commands, :help"}
          className="command-input"
          aria-label="Command input"
        />

        <div className="status-right" aria-hidden="true">
          <span className="status-mode">-- {modeLabel} --</span>
          <span>{catState === "sleeping" ? "z^._.^z" : "(^._.^)/"}</span>
          <span className="status-file">{activeNav}.md</span>
        </div>
      </footer>

      {showHelp ? <HelpModal onClose={() => setShowHelp(false)} /> : null}
      <Notif msg={notif.msg} visible={notif.visible} />
    </div>
  );
}
