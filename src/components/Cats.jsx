import { useEffect, useState } from "react";

const HERO = (eyes) => [
  "   |\\__/,|   (`\\",
  `   |${eyes}  |__ _) )`,
  " _.( T   )  `  /",
  "((_ `^--' /_<  \\",
  "`` `-'(((/  (((/",
];

// The one moving thing on the page: a blink every few seconds, off for reduced motion.
export function HeroCat() {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    let close;
    const timer = window.setInterval(() => {
      setBlink(true);
      close = window.setTimeout(() => setBlink(false), 180);
    }, 3800);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(close);
    };
  }, []);

  return (
    <pre className="cat hero-cat" aria-hidden="true">
      {HERO(blink ? "- -" : "o o").join("\n")}
    </pre>
  );
}

export function SmallCat({ face = "=^._.^=" }) {
  return (
    <span className="cat small-cat" aria-hidden="true">
      {face}
    </span>
  );
}

export function SittingCat() {
  return (
    <pre className="cat" aria-hidden="true">
      {" /\\_/\\\n( o.o )\n > ^ <"}
    </pre>
  );
}
