// Vim-style file labels, keyed by project name. Presentation only; facts live in profile.json.
const FILE_LABEL = {
  "Lab Control Plane": "lab-control-plane.js",
  Bucellarii: "bucellarii.c",
  Gravity: "gravity_sim.ts",
  Deston: "deston.rs",
  GhostLink: "ghostlink.rs",
  ByeByeSeg: "byebyeseg.c",
  NiftyGoGo: "niftygogo.go",
};

export function period(item) {
  return `${item.start} – ${item.end ?? "present"}`;
}

export function SectionHeader({ id, label }) {
  return (
    <h2 className="section-header" id={`${id}-title`}>
      <span className="dim"># </span>
      {label}
    </h2>
  );
}

export function Stack({ items }) {
  return items?.length ? <p className="stack">{items.join(" · ")}</p> : null;
}

export function ExpCard({ exp }) {
  return (
    <article className="card">
      <div className="card-head">
        <h3>{exp.company}</h3>
        <span className="dim">{period(exp)}</span>
      </div>
      <p className="role">{exp.role}</p>
      <p>{exp.summary}</p>
      {exp.bullets?.length ? (
        <ul>
          {exp.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      <Stack items={exp.stack} />
    </article>
  );
}

export function ProjectCard({ project }) {
  return (
    <article className="card">
      <div className="card-head">
        <h3>
          {project.url ? (
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </h3>
        <span className="dim">{FILE_LABEL[project.name]}</span>
      </div>
      <p>
        {project.summary}
        {project.demo ? (
          <>
            {" "}
            <a href={project.demo} target="_blank" rel="noopener noreferrer">
              demo
            </a>
          </>
        ) : null}
      </p>
      <Stack items={project.tags} />
    </article>
  );
}
