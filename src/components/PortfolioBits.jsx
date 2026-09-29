import { SmallCat } from "./Cats";

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

export function Ext({ href, children }) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    children
  );
}

export function SectionHeader({ id, label, cat }) {
  return (
    <h2 className="ln" id={`${id}-title`}>
      <span className="md">## </span>
      {label}
      {cat ? <SmallCat face={cat} /> : null}
    </h2>
  );
}

export function Tokens({ items }) {
  return items?.length ? (
    <p className="ln tokens">
      {items.map((item) => (
        <code key={item}>{item}</code>
      ))}
    </p>
  ) : null;
}

export function ExpEntry({ exp }) {
  return (
    <div className="entry">
      <h3 className="ln">
        <span className="md">### </span>
        {exp.company} <span className="date">{period(exp)}</span>
      </h3>
      <p className="ln role">
        <span className="md">*</span>
        {exp.role}
        <span className="md">*</span>
      </p>
      <p className="ln">{exp.summary}</p>
      {exp.bullets?.length ? (
        <ul>
          {exp.bullets.map((bullet) => (
            <li key={bullet} className="ln">
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
      <Tokens items={exp.stack} />
    </div>
  );
}

export function ProjectEntry({ project }) {
  return (
    <div className="entry">
      <h3 className="ln">
        <span className="md">### </span>
        <Ext href={project.url}>{project.name}</Ext>{" "}
        <span className="file">{FILE_LABEL[project.name]}</span>
      </h3>
      <p className="ln">
        {project.summary}
        {project.demo ? (
          <>
            {" "}
            <Ext href={project.demo}>[demo]</Ext>
          </>
        ) : null}
      </p>
      <Tokens items={project.tags} />
    </div>
  );
}
