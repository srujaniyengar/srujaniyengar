import { useCallback, useEffect, useRef, useState } from "react";

const PETS_KEY = "cat-pets";
const IDLE_MS = 15000;
const PURRS = ["purr", "mrrp", "*headbutt*", "prrt?", "*slow blink*", "*kneads*"];

function readPets() {
  try {
    return Number(localStorage.getItem(PETS_KEY)) || 0;
  } catch {
    return 0;
  }
}

/**
 * One digital pet, shared by every <PetCat> on the page.
 * It sleeps when you leave it alone, wakes when you type, scroll or click,
 * and gets happy when petted or fed. Pets are remembered per browser.
 */
export function usePet(notify) {
  const [sleeping, setSleeping] = useState(false);
  const [happy, setHappy] = useState(false);
  const [pets, setPets] = useState(readPets);
  const idleTimer = useRef(null);
  const happyTimer = useRef(null);

  const wake = useCallback(() => {
    setSleeping(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setSleeping(true), IDLE_MS);
  }, []);

  const cheer = useCallback(
    (msg) => {
      wake();
      setHappy(true);
      window.clearTimeout(happyTimer.current);
      happyTimer.current = window.setTimeout(() => setHappy(false), 2500);
      notify(msg);
    },
    [notify, wake]
  );

  const pet = useCallback(() => {
    setPets((n) => {
      const next = n + 1;
      try {
        localStorage.setItem(PETS_KEY, String(next));
      } catch {
        // No storage: the count just lasts for this visit.
      }
      return next;
    });
    cheer(PURRS[Math.floor(Math.random() * PURRS.length)]);
  }, [cheer]);

  const feed = useCallback(() => cheer("nom nom nom"), [cheer]);

  const status = useCallback(() => {
    const mood = happy ? "happy" : sleeping ? "asleep" : "awake";
    notify(`cat: ${mood} · petted ${pets} time${pets === 1 ? "" : "s"}`);
  }, [happy, notify, pets, sleeping]);

  useEffect(() => {
    wake();
    window.addEventListener("click", wake);
    window.addEventListener("scroll", wake, { capture: true, passive: true });
    return () => {
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(happyTimer.current);
      window.removeEventListener("click", wake);
      window.removeEventListener("scroll", wake, { capture: true });
    };
  }, [wake]);

  return { sleeping, happy, pets, wake, pet, feed, status };
}

// Tail frames: suffixes for the cat's last three lines. Wags F0 → F1 → F2 → F1.
const TAIL = [
  ["", "  __", "_/"],
  ["   _", "  /", "_/"],
  ["  /", "  |", "_/"],
];
const TAIL_ORDER = [0, 1, 2, 1];
const TAIL_ASLEEP = ["", "", "_,"];

// Pupil glyph by vertical look: up, level, down.
const PUPIL = { "-1": "°", 0: "o", 1: "." };

// Each eye is a 3-character socket; the pupil sits at index 1 + horizontal look.
function socket(glyph, h) {
  const cells = [" ", " ", " "];
  cells[1 + h] = glyph;
  return cells.join("");
}

/**
 * The cat itself. Eyes follow the pointer in every direction (nine looks:
 * the compass points plus straight ahead); click or tap it to pet it.
 */
export function PetCat({ pet, alert = false, className = "" }) {
  const ref = useRef(null);
  const [look, setLook] = useState({ h: 0, v: 0 });
  const [blink, setBlink] = useState(false);
  const [hover, setHover] = useState(false);
  const [wag, setWag] = useState(0);

  // The tail wags while the cat is awake, faster when it is happy.
  useEffect(() => {
    if (pet.sleeping || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const timer = window.setInterval(
      () => setWag((w) => (w + 1) % TAIL_ORDER.length),
      pet.happy ? 220 : 650
    );
    return () => window.clearInterval(timer);
  }, [pet.sleeping, pet.happy]);

  useEffect(() => {
    if (pet.sleeping || !window.matchMedia("(hover: hover)").matches) {
      return undefined;
    }
    let frame = 0;
    const onMove = (event) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const box = ref.current?.getBoundingClientRect();
        if (!box || !box.width) return;
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height * 0.3);
        const step = (d, dead) => (d < -dead ? -1 : d > dead ? 1 : 0);
        setLook({ h: step(dx, 40), v: step(dy, 60) });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
    };
  }, [pet.sleeping]);

  // A blink every few seconds is the only unprompted motion on the page.
  useEffect(() => {
    if (pet.sleeping || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    let open;
    const timer = window.setInterval(() => {
      setBlink(true);
      open = window.setTimeout(() => setBlink(false), 160);
    }, 4200);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(open);
    };
  }, [pet.sleeping]);

  let eye;
  let h = look.h;
  if (pet.sleeping || blink) {
    eye = "-";
    h = 0;
  } else if (pet.happy) {
    eye = "^";
    h = 0;
  } else if (alert || hover) {
    eye = "O";
  } else {
    eye = PUPIL[look.v];
  }

  const tail = pet.sleeping ? TAIL_ASLEEP : TAIL[TAIL_ORDER[wag]];
  const lines = [
    pet.sleeping ? "    /\\_____/\\  z" : "    /\\_____/\\",
    `   / ${socket(eye, h)} ${socket(eye, h)} \\`,
    `  ( ==  ${pet.happy ? "w" : "^"}  == )`,
    "   )         (",
    `  (           )${tail[0]}`,
    ` ( (  )   (  ) )${tail[1]}`,
    `(__(__)___(__)__)${tail[2]}`,
  ];

  return (
    <button
      ref={ref}
      type="button"
      className={`pet ${pet.sleeping ? "asleep" : ""} ${className}`.trim()}
      onClick={pet.pet}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="pet the cat"
      aria-label="Pet the cat"
    >
      <pre aria-hidden="true">{lines.join("\n")}</pre>
    </button>
  );
}
