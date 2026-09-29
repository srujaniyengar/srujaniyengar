import { Ext, ExpEntry, ProjectEntry, SectionHeader } from "./PortfolioBits";

function Fact({ k, children }) {
  return (
    <div className="ln facts-row">
      <dt>{k}:</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Section({ id, label, children }) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      {label ? <SectionHeader id={id} label={label} /> : null}
      {children}
    </section>
  );
}

export function HomePanel({ p }) {
  const current = p.experience.find((exp) => !exp.end);
  const { github, linkedin, email, x } = p.links;
  const contacts = [
    ["email", email, `mailto:${email}`],
    ["linkedin", linkedin.replace(/^https:\/\/(www\.)?/, ""), linkedin],
    ["github", github.replace(/^https:\/\//, ""), github],
    ["x", x.replace(/^https:\/\//, ""), x],
  ];

  return (
    <Section id="home">
      <div className="hero">
        <div>
          <h1 className="ln" id="home-title">
            <span className="md"># </span>
            {p.name}
          </h1>
          <p className="ln lead">
            <span className="md">&gt; </span>
            {p.headline}
          </p>
          <p className="ln">{p.intro}</p>
        </div>
      </div>

      <dl className="facts">
        {current ? (
          <Fact k="now">
            {current.role} @ {current.company}
          </Fact>
        ) : null}
        <Fact k="study">
          {p.education.degree}, {p.education.school}, {p.education.end}
        </Fact>
        <Fact k="base">{p.location}</Fact>
        {contacts.map(([key, text, href]) => (
          <Fact key={key} k={key}>
            <Ext href={href}>{text}</Ext>
          </Fact>
        ))}
      </dl>

      <dl className="facts">
        {Object.entries(p.skills).map(([group, items]) => (
          <Fact key={group} k={group.toLowerCase()}>
            <span className="list">[{items.join(", ")}]</span>
          </Fact>
        ))}
      </dl>
    </Section>
  );
}

export function ExpPanel({ p }) {
  return (
    <Section id="exp" label="Experience">
      {p.experience.map((exp) => (
        <ExpEntry key={exp.company} exp={exp} />
      ))}
    </Section>
  );
}

export function ProjectsPanel({ p }) {
  const featured = p.projects.filter((project) => project.featured);
  const others = p.projects.filter((project) => !project.featured);

  return (
    <Section id="projects" label="Projects">
      {featured.map((project) => (
        <ProjectEntry key={project.name} project={project} />
      ))}
      {others.length ? (
        <div className="entry">
          <h3 className="ln">
            <span className="md">### </span>
            Other projects
          </h3>
          <ul>
            {others.map((project) => (
              <li key={project.name} className="ln">
                <Ext href={project.url}>{project.name}</Ext>{" "}
                <span className="dim">{project.summary}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}

export function OffDutyPanel({ p }) {
  const { chivalry2, chess } = p.offDuty ?? {};

  return (
    <Section id="offduty" label="Off duty">
      <dl className="facts">
        {chivalry2 ? (
          <Fact k="chivalry 2">
            <span className="num">lvl {chivalry2.level}</span>
            {chivalry2.note ? `, ${chivalry2.note}` : ""}
          </Fact>
        ) : null}
        {chess ? (
          <Fact k="chess">
            <span className="num">{chess.rating}</span> on {chess.site}
          </Fact>
        ) : null}
      </dl>
    </Section>
  );
}
