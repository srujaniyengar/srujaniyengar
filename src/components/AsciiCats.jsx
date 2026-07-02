import { useEffect, useState } from "react";

const expressionFrames = [
  "(^._.^)",
  "(=^.^=)",
  "(^-.-^)",
  "(=^o.o^=)",
  "(>^.^<)",
  "|\\---/|",
  "/\\_/\\",
  "( o.o )",
  ">(='.'=)<",
  "(=T.T=)",
  "==_Y_==",
  "(_/\\_)",
];

const webCompactCats = [
  "|\\---/|",
  "/\\_/\\",
  "( o.o )",
  "( o o )",
  "(=^.^=)",
  "(=^o.o^=)",
  "(^._.^)",
  "(^._.^)~",
  "(=T.T=)",
  "(='.'=)",
  "> ^ <",
  "==_Y_==",
  "=^._.^=",
  "(_/\\_)",
];

const constellationSlots = [
  { top: "8%", left: "8%", delay: "0s" },
  { top: "22%", left: "72%", delay: "0.6s" },
  { top: "44%", left: "14%", delay: "1.2s" },
  { top: "58%", left: "66%", delay: "1.6s" },
  { top: "78%", left: "35%", delay: "2s" },
  { top: "18%", left: "45%", delay: "2.4s" },
];

const paradeTracks = [
  "/\\_/\\  (=^.^=)  ^-.-^  (=^o.o^=)  ( >.< )  (^._.^)~  /\\_/\\",
  "|\\---/|  (='.'=)  ( o.o )  ==_Y_==  (=T.T=)  > ^ <  |\\---/|",
  "(=^.^=)  /\\_/\\  (=^x^=)  (^._.^)  ( o o )  (_/\\_)  (=^.^=)",
];

const colonyFrames = [
  [
    "  /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\",
    " ( ^.^ ) ( -.^ ) ( ^.o ) ( u.u ) ( ^.^ ) ( -.o )",
    "  > ~ <   > ~ <   > ~ <   > ~ <   > ~ <   > ~ <",
    "  |   |   |   |   |   |   |   |   |   |   |   |",
  ],
  [
    "  /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\",
    " ( o.o ) ( ^.^ ) ( o.o ) ( u.u ) ( ^.^ ) ( o.o )",
    "  > ~ <   > ~ <   > ~ <   > ~ <   > ~ <   > ~ <",
    "  |   |   |   |   |   |   |   |   |   |   |   |",
  ],
  [
    "  /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\   /\\_/\\",
    " ( o_o ) ( ^.^ ) ( o_o ) ( ^.^ ) ( o_o ) ( ^.^ )",
    " ==_Y_== ==_Y_== ==_Y_== ==_Y_== ==_Y_== ==_Y_==",
    "  /   \\   /   \\   /   \\   /   \\   /   \\   /   \\",
  ],
];

export function AnimatedAsciiCat({
  frames = expressionFrames,
  intervalMs = 1400,
  className = "",
  accent = "var(--lav)",
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [frames, intervalMs]);

  return (
    <span
      className={`animated-ascii-cat ${className}`}
      style={{ color: accent }}
      aria-hidden="true"
    >
      {frames[index]}
    </span>
  );
}

export function CatConstellation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase((prev) => (prev + 1) % webCompactCats.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="cat-constellation" aria-hidden="true">
      {constellationSlots.map((slot, idx) => (
        <span
          key={`constellation-cat-${idx}`}
          className="cat-node"
          style={{
            top: slot.top,
            left: slot.left,
            animationDelay: slot.delay,
          }}
        >
          {webCompactCats[(phase + idx * 2) % webCompactCats.length]}
        </span>
      ))}
    </div>
  );
}

export function CatParade() {
  // One continuous ribbon, rendered twice so the -50% marquee loops seamlessly
  // instead of scrolling into empty space.
  const ribbon = `${paradeTracks.join("     ")}     `;

  return (
    <div className="cat-parade" aria-hidden="true">
      <div className="parade-track">
        <span>{ribbon}</span>
        <span>{ribbon}</span>
      </div>
    </div>
  );
}

/**
 * Self-aligning ASCII box. The border and right edge are computed from the
 * longest line via padEnd, so the frame can never drift out of alignment the
 * way hand-padded art does.
 */
export function AsciiBox({ lines, className = "" }) {
  const width = Math.max(...lines.map((line) => line.length)) + 4;
  const bar = "─".repeat(width);
  const body = lines.map((line) => `│  ${line.padEnd(width - 2)}│`);
  const rows = [`┌${bar}┐`, ...body, `└${bar}┘`];

  return (
    <pre className={`ascii-box ${className}`.trim()} aria-hidden="true">
      {rows.join("\n")}
    </pre>
  );
}

export function GuardianColony() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % colonyFrames.length);
    }, 1900);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <pre className="guardian-colony" aria-hidden="true">
      {colonyFrames[frame].join("\n")}
    </pre>
  );
}
