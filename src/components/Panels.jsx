import { ExpCard, ProjectCard, SectionHeader } from "./PortfolioBits";

function Fact({ k, children }) {
  return (
    <div className="facts-row">
      <dt>{k}</dt>
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
      <h1 id="home-title">{p.name}</h1>
      <p className="lead">{p.headline}</p>
      <p>{p.intro}</p>
      <dl className="facts">
        {current ? (
          <Fact k="now">
            {current.role}, {current.company}
          </Fact>
        ) : null}
        <Fact k="study">
          {p.education.degree}, {p.education.school}, {p.education.end}
        </Fact>
        <Fact k="base">{p.location}</Fact>
        {contacts.map(([key, text, href]) => (
          <Fact key={key} k={key}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          </Fact>
        ))}
      </dl>
      <p className="stack">
        {Object.entries(p.skills).map(([group, items]) => (
          <span key={group} className="skill-line">
            <span className="dim">{group.toLowerCase()}:</span> {items.join(" · ")}
          </span>
        ))}
      </p>
    </Section>
  );
}

export function ExpPanel({ p }) {
  return (
    <Section id="exp" label="Experience">
      {p.experience.map((exp) => (
        <ExpCard key={exp.company} exp={exp} />
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
        <ProjectCard key={project.name} project={project} />
      ))}
      {others.length ? (
        <>
          <h3 className="subhead">Other projects</h3>
          <ul className="plain-list">
            {others.map((project) => (
              <li key={project.name}>
                {project.url ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}{" "}
                <span className="dim">{project.summary}</span>
              </li>
            ))}
          </ul>
        </>
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
            level {chivalry2.level}
            {chivalry2.note ? `, ${chivalry2.note}` : ""}
          </Fact>
        ) : null}
        {chess ? (
          <Fact k="chess">
            {chess.rating} on {chess.site}
          </Fact>
        ) : null}
      </dl>
      <pre className="offduty-cat" aria-hidden="true">
        {" /\\_/\\\n( o.o )\n > ^ <"}
      </pre>
    </Section>
  );
}
