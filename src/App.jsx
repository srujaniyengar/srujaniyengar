import { useCallback, useEffect, useRef, useState } from "react";
import profile from "../profile.json";
import { HelpModal, Notif } from "./components/Overlays";
import { ExpPanel, HomePanel, OffDutyPanel, ProjectsPanel } from "./components/Panels";
import { PetCat, usePet } from "./components/Pet";
import { NAV, COMMANDS } from "./data/nav";
import { useCursor } from "./hooks/useCursor";
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
  const [scrollPct, setScrollPct] = useState("Top");
  const [openMsg, setOpenMsg] = useState("");

  const inputRef = useRef(null);
  const contentRef = useRef(null);

  const notify = useCallback((msg, duration = 2400) => {
    setNotif({ msg, visible: true });
    window.setTimeout(() => {
      setNotif((prev) => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  const pet = usePet();
  const cursor = useCursor(contentRef, notify);

  const navigate = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNav(id);
    setCmdMode(false);
  }, []);

  const handleCommand = useCallback(
    (rawValue) => {
      const cmd = rawValue.trim();
      if (!cmd || cmd === ":") {
        return;
      }

      if (cmd.startsWith("/")) {
        cursor.search(cmd.slice(1));
        return;
      }

      const lower = cmd.toLowerCase();

      if (/^:\d+$/.test(lower)) {
        cursor.goTo(Number(lower.slice(1)) - 1);
        return;
      }

      const open = lower.match(/^:e\s+(\S+)/);
      if (open) {
        const id = open[1].replace(/\.md$/, "");
        if (NAV.some((item) => item.id === id)) {
          navigate(id);
        } else {
          notify(`E345: Can't find file "${open[1]}" in path`);
        }
        return;
      }

      const target = COMMANDS[lower];
      if (!target) {
        notify(`E492: Not an editor command: ${lower}`);
        return;
      }

      const actions = {
        __help: () => setShowHelp(true),
        __ls: () => notify(NAV.map((item, i) => `${i + 1} "${item.label}"`).join("   "), 4000),
        __noh: cursor.clearSearch,
        __theme: () => notify(`theme: ${toggleTheme()}`),
        __pet: pet.pet,
        __feed: pet.feed,
        __cat: pet.status,
        __git: () => {
          window.open(profile.links.github, "_blank", "noopener,noreferrer");
          notify("opening github profile");
        },
        __q: () => notify("E37: No write since last change. Use :q! perhaps?"),
        "__q!": () => notify("you cannot quit. the cat said no."),
        __w: () => notify(`"portfolio.md" ${cursor.count}L written`),
        __wq: () => notify("saved, but still not quitting"),
      };

      if (actions[target]) {
        actions[target]();
        return;
      }
      navigate(target);
    },
    [cursor, navigate, notify, pet, toggleTheme]
  );

  // Vim's message when a file opens: "portfolio.md" 49L, 3.2K
  useEffect(() => {
    if (!cursor.count) return undefined;
    const text = document.querySelector(".buffer")?.textContent ?? "";
    const bytes = new TextEncoder().encode(text).length;
    setOpenMsg(`"portfolio.md" ${cursor.count}L, ${(bytes / 1024).toFixed(1)}K`);
    const timer = window.setTimeout(() => setOpenMsg(""), 5000);
    return () => window.clearTimeout(timer);
  }, [cursor.count]);

  // Active section = last one whose top has passed the upper third of the scroller;
  // at the very bottom it is the last section, however short. Also vim's Top/N%/Bot.
  useEffect(() => {
    const root = contentRef.current;
    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight;
      const atBottom = root.scrollTop >= max - 4;
      setScrollPct(
        root.scrollTop <= 0
          ? "Top"
          : atBottom
            ? "Bot"
            : `${Math.round((root.scrollTop / max) * 100)}%`
      );
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

  useVimBindings({
    inputRef,
    cursor,
    wakeupCat: pet.wake,
    setCmdMode,
    setCmdValue,
    setShowHelp,
  });

  const modeLabel = cmdMode ? "COMMAND" : "NORMAL";
  const searching = cmdValue.startsWith("/");

  return (
    <div className={`app-shell ${pet.feeding ? "feeding" : ""}`.trim()}>
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

        <PetCat pet={pet} alert={cmdMode} />
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
          <span aria-hidden="true">{searching ? " " : ":"}</span>
          <span className="sr-only">Open command input</span>
        </button>

        <input
          ref={inputRef}
          value={cmdValue}
          onChange={(event) => {
            setCmdValue(event.target.value);
            pet.wake();
          }}
          onFocus={() => setCmdMode(true)}
          onBlur={() => {
            if (!cmdValue) {
              setCmdMode(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleCommand(searching ? cmdValue : `:${cmdValue.replace(/^:/, "")}`);
              setCmdValue("");
              setCmdMode(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={cmdMode ? "" : openMsg || "type : for commands, / to search, :help"}
          className="command-input"
          aria-label="Command or search input"
        />

        <button
          type="button"
          className={`feed-btn ${pet.feeding ? "armed" : ""}`.trim()}
          onClick={pet.feed}
          aria-pressed={pet.feeding}
          title="Drop a mouse for the cat"
        >
          {pet.feeding ? "click to drop · esc" : "feed"}
        </button>

        <div className="status-right" aria-hidden="true">
          <span className="status-mode">-- {modeLabel} --</span>
          <span>{pet.sleeping ? "z^._.^z" : pet.happy ? "(^.^)♥" : "(^._.^)/"}</span>
          <span className="status-file">{activeNav}.md</span>
          <span className="status-pos">{cursor.cursor + 1},1</span>
          <span className="status-pos">{scrollPct}</span>
        </div>
      </footer>

      {showHelp ? <HelpModal onClose={() => setShowHelp(false)} /> : null}
      <Notif msg={notif.msg} visible={notif.visible} />
    </div>
  );
}
