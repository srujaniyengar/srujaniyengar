import { EXPERIENCE, MISSION, OFF_DUTY, PROJECTS } from "../data/content";
import { ExpCard, MissionCard, ProjectCard, SectionHeader, Tag } from "./PortfolioBits";
import {
  AnimatedAsciiCat,
  AsciiBox,
  CatConstellation,
  CatParade,
  GuardianColony,
} from "./AsciiCats";

export function HomePanel() {
  return (
    <section className="panel-enter home-panel">
      <article className="hero-card">
        <div className="scanline" aria-hidden="true" />
        <CatConstellation />
        <AsciiBox
          className="hero-frame"
          lines={["SRUJAN IYENGAR  ·  SYSTEMS ENGINEER", '"The Stack Below The Stack"']}
        />

        <h1>Srujan Iyengar</h1>
        <p className="hero-subtitle">
          eBPF · Rust · Go · Kernel Networking · Distributed Algorithms
        </p>

        <p className="hero-copy">
          I build at the boundary where software meets hardware. From XDP kernel hooks to async Rust
          load balancers, I focus on performance, fault-tolerance, and behavior under real
          production pressure.
        </p>

        <div className="tag-wrap">
          {[
            ["eBPF / XDP", "lav"],
            ["Rust Systems", "mint"],
            ["Distributed Algorithms", "amber"],
            ["Kernel Networking", "lav"],
            ["Reliability Engineering", "cyan"],
          ].map(([label, accent]) => (
            <Tag key={label} label={label} accent={accent} />
          ))}
        </div>
      </article>

      <article className="quick-stats-grid">
        {[
          ["6", "Systems Projects", "var(--lav)"],
          ["2", "Internships", "var(--mint)"],
          ["99.9", "Reliability Obsession", "var(--amber)"],
          ["0", "unsafe blocks in Deston", "var(--cyan)"],
        ].map(([n, label, color]) => (
          <div
            key={label}
            className="quick-stat"
            style={{ borderColor: `${color}66`, boxShadow: `2px 2px 0 ${color}` }}
          >
            <span style={{ color }}>{n}</span>
            <p>{label}</p>
          </div>
        ))}
      </article>

      <article className="contact-card">
        <div className="small-title">contact</div>
        <div className="contact-row">
          <span>github</span>
          <span>→</span>
          <a href="https://github.com/srujaniyengar" target="_blank" rel="noreferrer">
            github.com/srujaniyengar
          </a>
        </div>
        <div className="contact-row">
          <span>mission</span>
          <span>→</span>
          <span>Scalable fault-tolerant distributed systems</span>
        </div>
        <div className="contact-row">
          <span>base</span>
          <span>→</span>
          <span>Chennai, India</span>
        </div>
      </article>

      <article className="guardians-card">
        <div className="small-title">system guardians</div>
        <GuardianColony />
        <p className="guardians-caption">cats are watching the packets and the scheduler</p>
      </article>

      <CatParade />
    </section>
  );
}

export function ExpPanel() {
  return (
    <section className="panel-enter">
      <SectionHeader
        label="Experience"
        desc="Production engineering across backend systems and site reliability."
      />
      {EXPERIENCE.map((exp, index) => (
        <ExpCard key={exp.company} exp={exp} index={index} />
      ))}
      <pre className="section-cat-art" aria-hidden="true">
        {`  /\\_/\\
 ( u.u )   on-call ready
  > v <
  |   |`}
      </pre>
    </section>
  );
}

export function KernelPanel() {
  return (
    <section className="panel-enter">
      <SectionHeader
        label="Kernel / Networking"
        desc="Projects operating at L2-L4 with eBPF hooks, XDP filters, and encrypted transport."
      />
      {PROJECTS.kernel.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
      <pre className="section-cat-art" aria-hidden="true">
        {`    /\\_/\\
   ( -.- )  // sleeping in ring-0
    > z <
   /|   |\\`}
      </pre>
    </section>
  );
}

export function DistPanel() {
  return (
    <section className="panel-enter">
      <SectionHeader
        label="Distributed Systems"
        desc="Load balancers, allocators, routing simulation, and real-time terminal systems."
      />
      {PROJECTS.dist.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
      <pre className="section-cat-art" aria-hidden="true">
        {`   /\\_/\\  /\\_/\\
  ( ^.^ )( ^.^ )  // load balanced cats
   > ~ <  > ~ <
   |   |  |   |`}
      </pre>
    </section>
  );
}

export function MissionPanel() {
  return (
    <section className="panel-enter">
      <SectionHeader
        label="Mission"
        desc="Building scalable and fault-tolerant distributed systems with distributed algorithms."
      />

      <article className="mission-hero">
        <h3>{MISSION.headline}</h3>
        <p>{MISSION.subheadline}</p>
        <AnimatedAsciiCat accent="var(--mint)" className="mission-hero-cat" />
      </article>

      <div className="mission-grid">
        {MISSION.pillars.map((item, index) => (
          <MissionCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

export function OffDutyPanel() {
  return (
    <section className="panel-enter">
      <SectionHeader
        label="Off Duty"
        desc="When I am not coding or building projects, I play Chivalry 2."
      />

      <article className="offduty-card">
        <h3>{OFF_DUTY.title}</h3>
        {OFF_DUTY.rank ? <div className="offduty-rank">{OFF_DUTY.rank}</div> : null}
        <p>{OFF_DUTY.body}</p>

        {OFF_DUTY.compactCats?.length ? (
          <div className="offduty-cat-row" aria-label="Rotating compact ASCII cats">
            <span className="offduty-cat-label">cat loadout</span>
            <AnimatedAsciiCat
              frames={OFF_DUTY.compactCats}
              intervalMs={1050}
              className="offduty-rotating-cat"
              accent="var(--mint)"
            />
            <span className="offduty-cat-count">
              {OFF_DUTY.compactCats.length} compact variants
            </span>
          </div>
        ) : null}

        <ul className="offduty-list">
          {OFF_DUTY.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        <pre className="offduty-cat" aria-hidden="true">
          {OFF_DUTY.cats.join("\n")}
        </pre>
      </article>
    </section>
  );
}
