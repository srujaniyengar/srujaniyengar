import { useState, useEffect, useRef, useCallback } from "react";

// ── GOOGLE FONT INJECTION ──────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&display=swap";
document.head.appendChild(fontLink);

const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #050505; }
  :root {
    --bg: #050505; --bg2: #0e0e0e; --bg3: #141414; --bg4: #1a1a1a;
    --lav: #B8B5FF; --lav-dim: #7a77cc; --lav-glow: #B8B5FF44;
    --mint: #98FFD9; --mint-dim: #5ecca8; --mint-glow: #98FFD944;
    --amber: #FFD166; --red: #FF6B6B; --cyan: #79C7E3;
    --text: #E8E8E8; --text-dim: #777; --text-mid: #aaa;
    --border: 2px solid var(--lav); --shadow: 4px 4px 0px var(--lav);
    --shadow-mint: 4px 4px 0px var(--mint);
    --font: 'JetBrains Mono', 'Fira Code', monospace;
  }
  * { font-family: var(--font); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--lav-dim); border-radius: 0; }
  ::selection { background: var(--lav); color: #050505; }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 6px var(--mint-glow); }
    50% { box-shadow: 0 0 18px var(--mint), 0 0 4px var(--mint); }
  }
  @keyframes blink-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes slide-in-left { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes slide-in-up { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes fade-in { from{opacity:0} to{opacity:1} }
  @keyframes float-cat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes shimmer {
    0%{background-position:200% center}
    100%{background-position:-200% center}
  }
  @keyframes scanline {
    0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)}
  }
  .slide-in-left { animation: slide-in-left 0.25s ease forwards; }
  .slide-in-up { animation: slide-in-up 0.3s ease forwards; }
  .fade-in { animation: fade-in 0.3s ease forwards; }
  .panel-enter { animation: slide-in-up 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .cursor-blink { animation: blink-cursor 1s step-end infinite; }
  .live-dot { animation: pulse-glow 2s ease-in-out infinite; }
  .cat-float { animation: float-cat 3s ease-in-out infinite; }
`;
document.head.appendChild(style);

// ── DATA ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: "home", label: "[01] Home", short: "home" },
  { id: "exp", label: "[02] Experience", short: "exp" },
  { id: "kernel", label: "[03] Kernel / Networking", short: "kernel" },
  { id: "dist", label: "[04] Distributed Systems", short: "dist" },
];

const PROJECTS = {
  kernel: [
    {
      id: "bucellarii",
      name: "Bucellarii",
      file: "Bucellarii.c",
      tagline: "Zero-Trust IoT Overlay via eBPF/XDP",
      desc: "Kernel-level packet filter that enforces Zero-Trust IoT policies at XDP ingress — frames are dropped before they ever touch the network stack. Achieves sub-microsecond enforcement latency by bypassing the kernel's socket layer entirely.",
      url: "github.com/srujaniyengar/Bucellarii",
      href: "https://github.com/srujaniyengar/Bucellarii",
      tags: ["eBPF", "XDP", "Go", "C++", "Zero-Trust", "IoT"],
      telemetry: { lang: "C / Go / eBPF", loc: "~3,200 LoC", license: "MIT", layer: "L2 / Kernel" },
      accent: "lav",
      cat: `=^._.^=`,
      catLabel: "kernel-cat",
    },
    {
      id: "ghostlink",
      name: "GhostLink",
      file: "GhostLink.rs",
      tagline: "Serverless P2P E2EE over KCP (Reliable UDP)",
      desc: "Serverless peer-to-peer messaging with X25519 ECDH key exchange and ChaCha20-Poly1305 encryption. Built on KCP for reliable, ordered delivery over raw UDP — no TCP overhead, no central server.",
      url: "github.com/srujaniyengar/GhostLink",
      href: "https://github.com/srujaniyengar/GhostLink",
      tags: ["Rust", "KCP", "UDP", "X25519", "E2EE", "P2P"],
      telemetry: {
        lang: "Rust",
        loc: "~2,100 LoC",
        license: "Apache-2.0",
        layer: "L4 / Transport",
      },
      accent: "mint",
      cat: `^-.-^`,
      catLabel: "ghost-cat",
    },
  ],
  dist: [
    {
      id: "deston",
      name: "Deston",
      file: "Deston.rs",
      tagline: "Rust L4 / L7 Load Balancer · Tokio Async",
      desc: "Full L4/L7 load balancer in Rust using Tokio for async I/O and Hyper for HTTP. Implements weighted round-robin, least-connections, and consistent hashing — all with zero unsafe blocks and sub-millisecond p99 latency.",
      url: "github.com/srujaniyengar/Deston",
      href: "https://github.com/srujaniyengar/Deston",
      tags: ["Rust", "Tokio", "Hyper", "L4", "L7", "Async"],
      telemetry: { lang: "Rust", loc: "~4,500 LoC", license: "MIT", layer: "L4–L7" },
      accent: "lav",
      cat: `(=^o.o^=)`,
      catLabel: "balancer-cat",
    },
    {
      id: "byebyeseg",
      name: "ByeByeSeg",
      file: "ByeByeSeg.cpp",
      tagline: "Custom Allocator + Borrow-Checker for C/C++",
      desc: "A custom memory allocator built on raw sbrk syscalls that brings Rust-style borrow-checking semantics to C/C++. Tracks ownership at compile time via a thin type-wrapper layer, catching double-frees and use-after-free before they run.",
      url: "github.com/srujaniyengar/ByeByeSeg",
      href: "https://github.com/srujaniyengar/ByeByeSeg",
      tags: ["C", "C++", "sbrk", "Allocator", "Memory Safety"],
      telemetry: {
        lang: "C / C++",
        loc: "~1,800 LoC",
        license: "MIT",
        layer: "Userspace / Syscall",
      },
      accent: "amber",
      cat: `/>_<\\`,
      catLabel: "alloc-cat",
    },
    {
      id: "gravitysim",
      name: "Gravity Sim",
      file: "Gravity_Sim.ts",
      tagline: "Topology-Aware Routing Simulation · Thundering Herd",
      desc: "Interactive simulation of topology-aware routing algorithms designed to model and eliminate thundering-herd cache stampedes. Visualizes real-time packet flow dynamics, back-pressure propagation, and load distribution across a configurable node graph.",
      url: "github.com/srujaniyengar/Gravity_Sim",
      href: "https://github.com/srujaniyengar/Gravity_Sim",
      tags: ["TypeScript", "React", "D3.js", "Simulation", "Distributed"],
      telemetry: {
        lang: "TypeScript / React",
        loc: "~2,900 LoC",
        license: "MIT",
        layer: "Distributed / Sim",
      },
      accent: "mint",
      cat: `(^._.^)~`,
      catLabel: "sim-cat",
    },
    {
      id: "niftygogo",
      name: "NiftyGoGo",
      file: "NiftyGoGo.go",
      tagline: "Go TUI · Real-Time Crypto via Binance WebSocket",
      desc: "High-performance terminal UI for live crypto data via Binance's WebSocket API. Built with Bubble Tea and Lipgloss — sparkline charts, multi-pair tracking, and 60fps TUI rendering with < 1MB memory footprint.",
      url: "github.com/srujaniyengar/NiftyGoGo",
      href: "https://github.com/srujaniyengar/NiftyGoGo",
      tags: ["Go", "Bubble Tea", "WebSocket", "TUI", "Binance"],
      telemetry: { lang: "Go", loc: "~1,400 LoC", license: "MIT", layer: "Userspace / TUI" },
      accent: "cyan",
      cat: `=( ^.^ )=`,
      catLabel: "tui-cat",
    },
  ],
};

const EXPERIENCE = [
  {
    company: "TruckHai",
    role: "Backend Engineering Intern",
    period: "2024",
    stack: ["Go", "WhatsApp Business API", "PostgreSQL", "Redis", "gRPC"],
    accent: "lav",
    bullets: [
      "Built a high-throughput WhatsApp messaging engine in Go — handling webhook ingestion, template dispatch, and delivery-state tracking at scale.",
      "Designed idempotent message queues to guarantee at-least-once delivery under network partitions across logistics workflows.",
      "Reduced p95 API latency by 38% via connection pooling, prepared statements, and Redis-backed session caching.",
      "Authored integration tests and runbooks for on-call reliability in a production logistics environment.",
    ],
  },
  {
    company: "G5 Infotech",
    role: "Site Reliability Engineering Intern",
    period: "2023",
    stack: ["Prometheus", "Grafana", "PostgreSQL", "Python", "AlertManager"],
    accent: "mint",
    bullets: [
      "Instrumented services with Prometheus exporters and built Grafana dashboards covering latency, error rate, and saturation (USE model).",
      "Configured AlertManager routing trees for PagerDuty escalation — eliminating alert fatigue by 60% through intelligent grouping and inhibition rules.",
      "Ran EXPLAIN ANALYZE on 40+ slow queries; rewrote three critical paths with partial indexes and materialized views — 4× throughput improvement.",
      "Authored SLO definitions and burn-rate alerts for two core services, raising MTTR visibility across the team.",
    ],
  },
];

const COMMANDS = {
  ":home": "home",
  ":exp": "exp",
  ":kernel": "kernel",
  ":dist": "dist",
  ":projects": "kernel",
  ":git": "__git",
  ":coffee": "__coffee",
  ":help": "__help",
  ":q": "__q",
  ":q!": "__q!",
  ":w": "__w",
  ":wq": "__wq",
};

// ── HELPERS ────────────────────────────────────────────────────────────────
const accentColor = (a) =>
  ({
    lav: "var(--lav)",
    mint: "var(--mint)",
    amber: "var(--amber)",
    red: "var(--red)",
    cyan: "var(--cyan)",
  })[a] || "var(--lav)";

const accentShadow = (a) =>
  ({
    lav: "4px 4px 0px var(--lav)",
    mint: "4px 4px 0px var(--mint)",
    amber: "4px 4px 0px var(--amber)",
    cyan: "4px 4px 0px var(--cyan)",
  })[a] || "4px 4px 0px var(--lav)";

// ── SUB-COMPONENTS ─────────────────────────────────────────────────────────

function Telemetry({ data, accent }) {
  const c = accentColor(accent);
  return (
    <div
      style={{
        border: `1px solid ${c}44`,
        background: "#0a0a0a",
        padding: "14px 18px",
        marginTop: 20,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px 24px",
      }}
    >
      <div
        style={{
          color: "var(--text-dim)",
          fontSize: 10,
          letterSpacing: 2,
          marginBottom: 4,
          gridColumn: "1/-1",
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>── SYSTEM TELEMETRY ──</span>
        <span style={{ opacity: 0.35 }}>^._.^</span>
      </div>
      {Object.entries({
        LANG: data.lang,
        LoC: data.loc,
        LICENSE: data.license,
        LAYER: data.layer,
      }).map(([k, v]) => (
        <div key={k} style={{ fontSize: 11 }}>
          <span style={{ color: "var(--text-dim)" }}>{k}: </span>
          <span style={{ color: c, fontWeight: 700 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function Tag({ label, accent }) {
  const c = accentColor(accent || "lav");
  return (
    <span
      style={{
        border: `1px solid ${c}55`,
        color: c,
        fontSize: 10,
        padding: "2px 9px",
        background: `${c}10`,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </span>
  );
}

function LiveDot({ color = "var(--mint)" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        background: color,
        borderRadius: 0,
        boxShadow: `0 0 8px ${color}`,
        animation: "pulse-glow 2s ease-in-out infinite",
      }}
    />
  );
}

function ProjectCard({ project, index }) {
  const c = accentColor(project.accent);
  return (
    <div
      className="slide-in-up"
      style={{
        animationDelay: `${index * 0.06}s`,
        border: `2px solid ${c}`,
        boxShadow: accentShadow(project.accent),
        background: "var(--bg2)",
        padding: "22px 24px",
        marginBottom: 20,
        transition: "transform 0.15s, box-shadow 0.15s",
        cursor: "default",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translate(-2px,-2px)";
        e.currentTarget.style.boxShadow = `6px 6px 0px ${c}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translate(0,0)";
        e.currentTarget.style.boxShadow = accentShadow(project.accent);
      }}
    >
      {/* accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c }} />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{ color: c, fontSize: 11, fontWeight: 700, opacity: 0.75, letterSpacing: 1 }}
            >
              {project.cat}
            </span>
            <span style={{ color: c, fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
              {project.name}
            </span>
            <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{project.file}</span>
          </div>
          <div style={{ color: "var(--text-mid)", fontSize: 12, marginBottom: 12 }}>
            {project.tagline}
          </div>
        </div>
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--cyan)",
            fontSize: 11,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            whiteSpace: "nowrap",
            textDecorationColor: "var(--cyan)44",
            transition: "text-decoration-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = "var(--cyan)")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = "var(--cyan)44")}
        >
          ↗ {project.url}
        </a>
      </div>

      <div style={{ color: "var(--text-dim)", fontSize: 12, lineHeight: 1.8, marginBottom: 14 }}>
        {project.desc}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {project.tags.map((t) => (
          <Tag key={t} label={t} accent={project.accent} />
        ))}
      </div>

      <Telemetry data={project.telemetry} accent={project.accent} />
    </div>
  );
}

function ExpCard({ exp, index }) {
  const c = accentColor(exp.accent);
  return (
    <div
      className="slide-in-up"
      style={{
        animationDelay: `${index * 0.08}s`,
        border: `2px solid ${c}`,
        boxShadow: accentShadow(exp.accent),
        background: "var(--bg2)",
        padding: "22px 26px",
        marginBottom: 22,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <LiveDot color={c} />
            <span style={{ color: c, fontSize: 18, fontWeight: 800 }}>{exp.company}</span>
          </div>
          <div style={{ color: "var(--amber)", fontSize: 12, fontWeight: 600 }}>{exp.role}</div>
        </div>
        <div
          style={{
            border: `1px solid ${c}44`,
            padding: "4px 12px",
            color: c,
            fontSize: 11,
            background: `${c}10`,
          }}
        >
          {exp.period}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        {exp.bullets.map((b, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12, lineHeight: 1.7 }}
          >
            <span style={{ color: c, marginTop: 2, flexShrink: 0 }}>→</span>
            <span style={{ color: "var(--text-dim)" }}>{b}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {exp.stack.map((t) => (
          <Tag key={t} label={t} accent={exp.accent} />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ label, desc }) {
  return (
    <div style={{ marginBottom: 28 }} className="fade-in">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            background: "var(--lav)",
            boxShadow: "0 0 12px var(--lav)",
          }}
        />
        <span
          style={{
            color: "var(--lav)",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -1,
            background: "linear-gradient(90deg, var(--lav), var(--mint))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {label}
        </span>
        <span style={{ color: "var(--lav)", fontSize: 11, opacity: 0.4, marginLeft: "auto" }}>
          =^._.^=
        </span>
      </div>
      {desc && (
        <div style={{ color: "var(--text-dim)", fontSize: 12, paddingLeft: 24 }}>{desc}</div>
      )}
      <div
        style={{
          marginTop: 16,
          height: 1,
          background: "linear-gradient(90deg, var(--lav)44, transparent)",
        }}
      />
    </div>
  );
}

// ── PANELS ─────────────────────────────────────────────────────────────────

function HomePanel() {
  return (
    <div className="panel-enter" style={{ padding: "0 0 40px" }}>
      {/* Hero */}
      <div
        style={{
          border: "2px solid var(--lav)",
          boxShadow: "4px 4px 0px var(--lav)",
          background: "var(--bg2)",
          padding: "32px 32px 28px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* scanline effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "var(--lav)",
          }}
        />

        <pre
          style={{
            color: "var(--lav)",
            fontSize: 11,
            lineHeight: 1.5,
            marginBottom: 20,
            opacity: 0.7,
            letterSpacing: 0,
            fontWeight: 300,
          }}
        >{`┌─────────────────────────────────────────────────────┐
│  SRUJAN IYENGAR  ·  SYSTEMS ENGINEER                │
│  "The Stack Below The Stack"                        │
└─────────────────────────────────────────────────────┘`}</pre>

        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: -1,
            marginBottom: 10,
            background: "linear-gradient(135deg, var(--lav) 0%, var(--mint) 60%, var(--lav) 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}
        >
          Srujan Iyengar
        </div>

        <div style={{ color: "var(--mint)", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          eBPF · Rust · Go · Kernel Networking · Distributed Systems
        </div>

        <div style={{ color: "var(--text-dim)", fontSize: 12, lineHeight: 1.9, maxWidth: 560 }}>
          I build at the boundary where software touches hardware. From XDP kernel hooks to async
          Rust load balancers — I care about what happens in the{" "}
          <span style={{ color: "var(--lav)" }}>nanoseconds before userspace</span>.
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "eBPF / XDP", c: "lav" },
            { label: "Rust Systems", c: "mint" },
            { label: "Kernel Networking", c: "lav" },
            { label: "Memory Allocators", c: "amber" },
            { label: "Async Runtimes", c: "mint" },
          ].map(({ label, c }) => (
            <Tag key={label} label={label} accent={c} />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          { n: "6", label: "Systems Projects", c: "var(--lav)" },
          { n: "2", label: "Internships", c: "var(--mint)" },
          { n: "∞", label: "Kernel Curiosity", c: "var(--amber)" },
          { n: "0", label: "unsafe blocks in Deston", c: "var(--cyan)" },
        ].map(({ n, label, c }) => (
          <div
            key={label}
            style={{
              border: `1px solid ${c}44`,
              background: "var(--bg2)",
              padding: "16px 18px",
              boxShadow: `2px 2px 0px ${c}44`,
            }}
          >
            <div style={{ color: c, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{n}</div>
            <div style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Links */}
      <div
        style={{
          border: "1px solid var(--lav)33",
          background: "var(--bg2)",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            color: "var(--text-dim)",
            fontSize: 10,
            letterSpacing: 2,
            marginBottom: 12,
            fontWeight: 700,
          }}
        >
          ── CONTACT ──
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              key: "github",
              val: "github.com/srujaniyengar",
              href: "https://github.com/srujaniyengar",
              c: "var(--lav)",
            },
            { key: "stack", val: '"The Stack Below the Stack"', c: "var(--mint)" },
            { key: "base", val: "Chennai, India", c: "var(--text-mid)" },
          ].map(({ key, val, href, c }) => (
            <div
              key={key}
              style={{ fontSize: 12, display: "flex", gap: 12, alignItems: "baseline" }}
            >
              <span style={{ color: "var(--text-dim)", minWidth: 60 }}>{key}</span>
              <span style={{ color: "var(--lav-dim)" }}>→</span>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: c, textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  {val}
                </a>
              ) : (
                <span style={{ color: c }}>{val}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, color: "var(--text-dim)", fontSize: 11, textAlign: "center" }}>
        <span style={{ color: "var(--lav)", textShadow: "0 0 8px var(--lav)" }}>Press :help</span>{" "}
        for keybindings · use <span style={{ color: "var(--mint)" }}>hjkl</span> to navigate
      </div>

      {/* ASCII cat colony */}
      <div
        style={{
          marginTop: 32,
          border: "1px solid var(--lav)22",
          background: "var(--bg2)",
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            color: "var(--text-dim)",
            fontSize: 10,
            letterSpacing: 2,
            marginBottom: 14,
            fontWeight: 700,
          }}
        >
          ── SYSTEM GUARDIANS ──
        </div>
        <pre
          style={{
            color: "var(--lav)",
            fontSize: 11,
            lineHeight: 1.6,
            opacity: 0.55,
            whiteSpace: "pre",
          }}
        >{`  /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\
 ( ^.^ ) ( -.^ ) ( ^.o ) ( u.u ) ( ^.^ ) ( -.o )
  > ~ <   > ~ <   > ~ <   > ~ <   > ~ <   > ~ <
  |   |   |   |   |   |   |   |   |   |   |   |`}</pre>
        <div
          style={{
            color: "var(--text-dim)",
            fontSize: 10,
            marginTop: 10,
            opacity: 0.4,
            textAlign: "center",
          }}
        >
          all six projects, watching the kernel
        </div>
      </div>
    </div>
  );
}

function ExpPanel() {
  return (
    <div className="panel-enter">
      <SectionHeader
        label="Experience"
        desc="Production engineering across backend systems and site reliability."
      />
      {EXPERIENCE.map((exp, i) => (
        <ExpCard key={exp.company} exp={exp} index={i} />
      ))}
      <pre
        style={{
          color: "var(--mint)",
          fontSize: 11,
          opacity: 0.25,
          lineHeight: 1.55,
          textAlign: "center",
          marginTop: 24,
        }}
      >{`  /\\_/\\
 ( u.u )   on-call ready
  > v <
  |   |`}</pre>
    </div>
  );
}

function KernelPanel() {
  return (
    <div className="panel-enter">
      <SectionHeader
        label="Kernel / Networking"
        desc="Projects operating at L2–L4 — eBPF hooks, XDP filters, and encrypted P2P transport."
      />
      {PROJECTS.kernel.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} />
      ))}
      <pre
        style={{
          color: "var(--lav)",
          fontSize: 11,
          opacity: 0.2,
          lineHeight: 1.55,
          textAlign: "center",
          marginTop: 20,
        }}
      >{`    /\\_/\\
   ( -.- )  // sleeping in ring-0
    > z <
   /|   |\\`}</pre>
    </div>
  );
}

function DistPanel() {
  return (
    <div className="panel-enter">
      <SectionHeader
        label="Distributed Systems"
        desc="Load balancers, allocators, routing simulations, and real-time TUIs."
      />
      {PROJECTS.dist.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} />
      ))}
      <pre
        style={{
          color: "var(--mint)",
          fontSize: 11,
          opacity: 0.2,
          lineHeight: 1.55,
          textAlign: "center",
          marginTop: 20,
        }}
      >{`   /\\_/\\  /\\_/\\
  ( ^.^ )( ^.^ )  // load balanced cats
   > ~ <  > ~ <
   |   |  |   |`}</pre>
    </div>
  );
}

// ── HELP MODAL ─────────────────────────────────────────────────────────────
function HelpModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.88)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fade-in 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          border: "2px solid var(--lav)",
          boxShadow: "6px 6px 0px var(--lav)",
          background: "var(--bg2)",
          padding: "30px 36px",
          minWidth: 400,
          maxWidth: 520,
          animation: "slide-in-up 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <div style={{ color: "var(--lav)", fontSize: 14, fontWeight: 800, marginBottom: 20 }}>
          :help — Srujan's System Navigator
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: "10px 16px",
            fontSize: 12,
          }}
        >
          {[
            ["h", "Toggle sidebar focus"],
            ["j / k", "Move selection up/down"],
            ["Enter", "Open selected section"],
            ["g / G", "Scroll to top / bottom"],
            [":home", "Navigate → Home"],
            [":exp", "Navigate → Experience"],
            [":kernel", "Navigate → Kernel/Net"],
            [":dist", "Navigate → Distributed"],
            [":git", "Open GitHub profile"],
            [":coffee", "=^._.^=  Important command"],
            [":help", "Show this panel"],
            ["Esc", "Close modal / clear cmd"],
          ].map(([key, desc]) => (
            <>
              <span style={{ color: "var(--amber)", fontWeight: 700 }}>{key}</span>
              <span style={{ color: "var(--text-dim)" }}>{desc}</span>
            </>
          ))}
        </div>

        <pre
          style={{
            marginTop: 22,
            color: "var(--lav)",
            fontSize: 12,
            textAlign: "center",
            opacity: 0.5,
            lineHeight: 1.55,
          }}
        >{`    /\\_____/\\
   /  o   o  \\
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)
    ^._.^  meow.rs — purring at 60fps`}</pre>

        <div style={{ marginTop: 16, color: "var(--text-dim)", fontSize: 11, textAlign: "center" }}>
          Press Esc or click outside to close
        </div>
      </div>
    </div>
  );
}

// ── NOTIFICATION ────────────────────────────────────────────────────────────
function Notif({ msg, visible }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 52,
        right: 20,
        border: "2px solid var(--mint)",
        boxShadow: "3px 3px 0px var(--mint)",
        background: "var(--bg2)",
        padding: "8px 16px",
        fontSize: 12,
        color: "var(--mint)",
        zIndex: 100,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.2s ease",
        pointerEvents: "none",
      }}
    >
      {msg}
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState("home");
  const [sidebarFocus, setSidebar] = useState(false);
  const [sidebarIdx, setSidebarIdx] = useState(0);
  const [cmdValue, setCmdValue] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [notif, setNotif] = useState({ msg: "", visible: false });
  const [catState, setCatState] = useState("awake"); // awake | sleeping
  const [cmdMode, setCmdMode] = useState(false);

  const inputRef = useRef(null);
  const contentRef = useRef(null);
  const idleTimer = useRef(null);

  const notify = useCallback((msg, duration = 2500) => {
    setNotif({ msg, visible: true });
    setTimeout(() => setNotif((n) => ({ ...n, visible: false })), duration);
  }, []);

  const wakeupCat = useCallback(() => {
    setCatState("awake");
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setCatState("sleeping"), 5000);
  }, []);

  useEffect(() => {
    idleTimer.current = setTimeout(() => setCatState("sleeping"), 5000);
    return () => clearTimeout(idleTimer.current);
  }, []);

  const navigate = useCallback(
    (id) => {
      setActiveNav(id);
      setSidebarIdx(NAV.findIndex((n) => n.id === id));
      setSidebar(false);
      setCmdMode(false);
      wakeupCat();
    },
    [wakeupCat]
  );

  const handleCommand = useCallback(
    (raw) => {
      const cmd = raw.trim().toLowerCase();
      const target = COMMANDS[cmd];
      if (!target) {
        if (cmd) notify(`E492: Not an editor command: ${cmd}`);
        return;
      }
      if (target === "__help") {
        setShowHelp(true);
        return;
      }
      if (target === "__git") {
        window.open("https://github.com/srujaniyengar", "_blank");
        notify("↗ Opening GitHub...");
        return;
      }
      if (target === "__coffee") {
        notify("=^._.^=  `brew install focus` — running...");
        return;
      }
      if (target === "__q") {
        notify("E37: No write since last change. Use :q! perhaps?");
        return;
      }
      if (target === "__q!") {
        notify("You cannot quit. Srujan won't let you.  ^._.^");
        return;
      }
      if (target === "__w") {
        notify("Portfolio saved. ✓");
        return;
      }
      if (target === "__wq") {
        notify("Saved! ...but you still can't quit.  ^._.^");
        return;
      }
      navigate(target);
      notify(`Navigated → ${target}`);
    },
    [navigate, notify]
  );

  useEffect(() => {
    const onKey = (e) => {
      wakeupCat();

      if (e.key === "Escape") {
        setShowHelp(false);
        setCmdMode(false);
        setCmdValue("");
        setSidebar(false);
        inputRef.current?.blur();
        return;
      }

      const isTyping = document.activeElement === inputRef.current;

      if (e.key === ":" && !isTyping) {
        e.preventDefault();
        setCmdMode(true);
        setCmdValue("");
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }

      if (isTyping) return;

      if (e.key === "h") {
        e.preventDefault();
        setSidebar((s) => !s);
        return;
      }
      if (sidebarFocus) {
        if (e.key === "j") {
          e.preventDefault();
          setSidebarIdx((i) => Math.min(i + 1, NAV.length - 1));
        }
        if (e.key === "k") {
          e.preventDefault();
          setSidebarIdx((i) => Math.max(i - 1, 0));
        }
        if (e.key === "Enter") {
          e.preventDefault();
          navigate(NAV[sidebarIdx].id);
        }
        return;
      }
      if (e.key === "g") {
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (e.key === "G") {
        contentRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
      }
      if (e.key === "j") {
        contentRef.current?.scrollBy({ top: 60, behavior: "smooth" });
      }
      if (e.key === "k") {
        contentRef.current?.scrollBy({ top: -60, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarFocus, sidebarIdx, navigate, wakeupCat]);

  const currentNav = NAV.find((n) => n.id === activeNav);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        userSelect: "none",
      }}
    >
      {/* ── VIM AIRLINE ─────────────────────────────── */}
      <div
        style={{
          height: 30,
          display: "flex",
          alignItems: "center",
          background: "var(--lav)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "#050505",
            color: "var(--lav)",
            padding: "0 18px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: 2,
          }}
        >
          {cmdMode ? "COMMAND" : sidebarFocus ? "VISUAL" : "NORMAL"}
        </div>
        <div
          style={{ color: "#050505", fontWeight: 700, fontSize: 12, padding: "0 16px", flex: 1 }}
        >
          ~/srujan/{activeNav}
        </div>
        <div
          style={{
            color: "#050505",
            fontSize: 11,
            padding: "0 16px",
            display: "flex",
            gap: 20,
            opacity: 0.7,
          }}
        >
          <span>utf-8</span>
          <span>unix</span>
          <span>srujan@systems</span>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── SIDEBAR ─────────────────────────────── */}
        <div
          style={{
            width: 240,
            minWidth: 240,
            borderRight: "2px solid var(--lav)",
            background: "var(--bg2)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            // on mobile, hide
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px 10px",
              borderBottom: "1px solid #1e1e1e",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                color: "var(--lav)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                flex: 1,
              }}
            >
              SYSTEM NAVIGATOR
            </div>
            <div
              className="cat-float"
              style={{
                fontSize: 11,
                cursor: "default",
                color: catState === "sleeping" ? "var(--text-dim)" : "var(--lav)",
                letterSpacing: 1,
              }}
              title={catState === "sleeping" ? "zzZ..." : "(^._.^)"}
            >
              {catState === "sleeping" ? "z^._.^z" : "(^._.^)"}
            </div>
          </div>

          <div style={{ padding: "12px 0", flex: 1, overflowY: "auto" }}>
            {NAV.map((nav, i) => {
              const isActive = activeNav === nav.id;
              const isSelected = sidebarFocus && sidebarIdx === i;
              return (
                <div
                  key={nav.id}
                  onClick={() => {
                    navigate(nav.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 18px",
                    cursor: "pointer",
                    background: isActive ? "#1a1a2e" : isSelected ? "#151515" : "transparent",
                    borderLeft: isActive ? "3px solid var(--lav)" : "3px solid transparent",
                    color: isActive ? "var(--lav)" : isSelected ? "var(--text)" : "var(--text-dim)",
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 400,
                    transition: "all 0.1s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "#111";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {isActive && <span style={{ fontSize: 10 }}>▶</span>}
                  <span>{nav.label}</span>
                  {isActive && (
                    <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5 }}>^._.^</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar hint */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid #1a1a1a",
              fontSize: 10,
              color: "var(--lav)",
              textShadow: "0 0 8px var(--lav)",
              letterSpacing: 0.5,
            }}
          >
            Press :help for keys · <span style={{ color: "var(--mint)" }}>hjkl</span>
          </div>
        </div>

        {/* ── TAB BAR + CONTENT ───────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tabs */}
          <div
            style={{
              height: 34,
              display: "flex",
              alignItems: "center",
              background: "var(--bg2)",
              borderBottom: "2px solid var(--lav)",
              overflowX: "auto",
              flexShrink: 0,
              scrollbarWidth: "none",
            }}
          >
            {NAV.map((nav) => (
              <div
                key={nav.id}
                onClick={() => navigate(nav.id)}
                style={{
                  height: "100%",
                  padding: "0 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  cursor: "pointer",
                  color: activeNav === nav.id ? "var(--lav)" : "var(--text-dim)",
                  background: activeNav === nav.id ? "var(--bg)" : "transparent",
                  borderTop:
                    activeNav === nav.id ? "1px solid var(--lav)" : "1px solid transparent",
                  borderRight: "1px solid #1e1e1e",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.1s",
                }}
              >
                {activeNav === nav.id && (
                  <span style={{ fontSize: 9, color: "var(--mint)" }}>◆</span>
                )}
                {nav.short}.md
                {activeNav === nav.id && <span style={{ fontSize: 9, opacity: 0.5 }}>×</span>}
              </div>
            ))}
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "28px 32px",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--lav-dim) transparent",
            }}
          >
            {activeNav === "home" && <HomePanel />}
            {activeNav === "exp" && <ExpPanel />}
            {activeNav === "kernel" && <KernelPanel />}
            {activeNav === "dist" && <DistPanel />}
          </div>
        </div>
      </div>

      {/* ── COMMAND FOOTER ──────────────────────────── */}
      <div
        style={{
          height: 34,
          background: "var(--bg2)",
          borderTop: "2px solid var(--lav)",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 4,
          flexShrink: 0,
        }}
      >
        <span
          onClick={() => {
            setCmdMode(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          style={{ color: "var(--lav)", fontWeight: 700, fontSize: 14, cursor: "text" }}
        >
          :
        </span>
        <input
          ref={inputRef}
          value={cmdValue}
          onChange={(e) => {
            setCmdValue(e.target.value);
            wakeupCat();
          }}
          onFocus={() => setCmdMode(true)}
          onBlur={() => {
            if (!cmdValue) setCmdMode(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCommand(":" + cmdValue);
              setCmdValue("");
              setCmdMode(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={cmdMode ? "" : "type : to enter command mode"}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text)",
            fontSize: 12,
            flex: 1,
            caretColor: "var(--lav)",
            fontFamily: "var(--font)",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 20,
            fontSize: 11,
            color: "var(--text-dim)",
            alignItems: "center",
          }}
        >
          <span style={{ opacity: 0.5 }}>
            -- {cmdMode ? "COMMAND" : sidebarFocus ? "SIDEBAR" : "NORMAL"} --
          </span>
          <span style={{ opacity: 0.4 }}>{currentNav?.label}</span>
          <span
            style={{
              color: catState === "sleeping" ? "var(--text-dim)" : "var(--lav-dim)",
              fontSize: 12,
              transition: "color 0.5s",
            }}
          >
            {catState === "sleeping" ? "zzZ ^._.^" : "(^._.^)ﾉ"}
          </span>
        </div>
      </div>

      {/* ── MODALS & OVERLAYS ────────────────────────── */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <Notif msg={notif.msg} visible={notif.visible} />
    </div>
  );
}
