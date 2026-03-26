export function accentColor(accent) {
  const color = {
    lav: "var(--lav)",
    mint: "var(--mint)",
    amber: "var(--amber)",
    red: "var(--red)",
    cyan: "var(--cyan)",
  }[accent];

  return color || "var(--lav)";
}

export function accentShadow(accent) {
  const shadow = {
    lav: "4px 4px 0 var(--lav)",
    mint: "4px 4px 0 var(--mint)",
    amber: "4px 4px 0 var(--amber)",
    cyan: "4px 4px 0 var(--cyan)",
    red: "4px 4px 0 var(--red)",
  }[accent];

  return shadow || "4px 4px 0 var(--lav)";
}

export function Tag({ label, accent = "lav" }) {
  const c = accentColor(accent);

  return (
    <span className="tag" style={{ borderColor: `${c}66`, color: c, background: `${c}16` }}>
      {label}
    </span>
  );
}

export function LiveDot({ color = "var(--mint)" }) {
  return <span className="live-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />;
}

export function Telemetry({ data, accent = "lav" }) {
  const c = accentColor(accent);
  const pairs = {
    LANG: data.lang,
    LoC: data.loc,
    LICENSE: data.license,
    LAYER: data.layer,
  };

  return (
    <div className="telemetry" style={{ borderColor: `${c}44` }}>
      <div className="telemetry-title">
        <span>system telemetry</span>
        <span className="telemetry-cat">^._.^</span>
      </div>
      {Object.entries(pairs).map(([key, value]) => (
        <div key={key} className="telemetry-item">
          <span className="telemetry-key">{key}:</span>
          <span className="telemetry-value" style={{ color: c }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SectionHeader({ label, desc }) {
  return (
    <div className="section-header fade-in">
      <div className="section-header-top">
        <div className="section-dot" />
        <h2>{label}</h2>
        <span className="section-cat">=^._.^=</span>
      </div>
      {desc ? <p>{desc}</p> : null}
      <div className="section-divider" />
    </div>
  );
}

export function ProjectCard({ project, index }) {
  const c = accentColor(project.accent);

  return (
    <article
      className="panel-card slide-in-up"
      style={{
        animationDelay: `${index * 0.08}s`,
        borderColor: c,
        boxShadow: accentShadow(project.accent),
      }}
    >
      <div className="accent-bar" style={{ background: c }} />
      <div className="panel-card-head">
        <div>
          <div className="panel-card-title-row">
            <span className="project-cat" style={{ color: c }}>
              {project.cat}
            </span>
            <h3 style={{ color: c }}>{project.name}</h3>
            <span className="file-label">{project.file}</span>
          </div>
          <p className="panel-card-tagline">{project.tagline}</p>
        </div>
        <a href={project.href} target="_blank" rel="noopener noreferrer" className="repo-link">
          {project.url}
        </a>
      </div>
      <p className="panel-card-desc">{project.desc}</p>
      <div className="tag-wrap">
        {project.tags.map((tag) => (
          <Tag key={tag} label={tag} accent={project.accent} />
        ))}
      </div>
      <Telemetry data={project.telemetry} accent={project.accent} />
    </article>
  );
}

export function ExpCard({ exp, index }) {
  const c = accentColor(exp.accent);

  return (
    <article
      className="panel-card slide-in-up"
      style={{
        animationDelay: `${index * 0.08}s`,
        borderColor: c,
        boxShadow: accentShadow(exp.accent),
      }}
    >
      <div className="accent-bar" style={{ background: c }} />
      <div className="exp-head">
        <div>
          <div className="exp-title-row">
            <LiveDot color={c} />
            <h3 style={{ color: c }}>{exp.company}</h3>
          </div>
          <p className="exp-role">{exp.role}</p>
        </div>
        <div
          className="exp-period"
          style={{ borderColor: `${c}66`, color: c, background: `${c}16` }}
        >
          {exp.period}
        </div>
      </div>

      <div className="exp-bullets">
        {exp.bullets.map((bullet) => (
          <div key={bullet} className="exp-bullet-row">
            <span style={{ color: c }}>→</span>
            <p>{bullet}</p>
          </div>
        ))}
      </div>

      <div className="tag-wrap">
        {exp.stack.map((stack) => (
          <Tag key={stack} label={stack} accent={exp.accent} />
        ))}
      </div>
    </article>
  );
}

export function MissionCard({ item, index }) {
  const c = accentColor(item.accent);

  return (
    <article
      className="mission-card slide-in-up"
      style={{
        animationDelay: `${index * 0.1}s`,
        borderColor: c,
        boxShadow: accentShadow(item.accent),
      }}
    >
      <div className="mission-card-head">
        <span className="mission-cat" style={{ color: c }}>
          {item.cat}
        </span>
        <h3 style={{ color: c }}>{item.title}</h3>
      </div>
      <p>{item.body}</p>
    </article>
  );
}
