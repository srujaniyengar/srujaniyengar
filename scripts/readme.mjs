// Renders readme.md from profile.json. Edit profile.json, then run: node scripts/readme.mjs
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const p = JSON.parse(readFileSync(new URL("profile.json", root), "utf8"));

const link = (text, url) => (url ? `[${text}](${url})` : text);
const current = p.experience.find((e) => !e.end);

const experience = p.experience.map((e) => {
  const head = `**${e.company}**, ${e.role} (${e.start} to ${e.end ?? "present"}).`;
  if (e.end) return `${head}\n${e.summary}`;
  return [`${head}\n${e.summary}\n`, ...e.bullets.map((b) => `- ${b}`)].join("\n");
});

const project = (x) => {
  const demo = x.demo ? ` ([demo](${x.demo}))` : "";
  return `- **${link(x.name, x.url)}**: ${x.summary}${demo}`;
};
const featured = p.projects.filter((x) => x.featured).map(project);
const others = p.projects.filter((x) => !x.featured).map((x) => link(x.name, x.url));

const skills = Object.entries(p.skills).map(([k, v]) => `**${k}:** ${v.join(", ")}  `);

const { site, linkedin, x, email } = p.links;
const intro = [
  p.headline + (current ? `. ${current.role} at ${current.company}.` : "."),
  `${p.education.degree}, ${p.education.school}, ${p.education.end}. Based in ${p.location}.`,
];

const out = `<!-- Generated from profile.json by scripts/readme.mjs. Do not edit by hand. -->

# ${p.name}

${intro.join("  \n")}

## Now

${experience.join("\n\n")}

## Projects

${featured.join("\n")}

Also: ${others.join(", ")}.

## Skills

${skills.join("\n")}

## Contact

${link("Website", site)} · ${link("LinkedIn", linkedin)} · ${link("X", x)} · ${email}
`;

writeFileSync(new URL("readme.md", root), out);
