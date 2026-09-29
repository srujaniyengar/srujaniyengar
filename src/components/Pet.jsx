import { useCallback, useEffect, useRef, useState } from "react";

const PETS_KEY = "cat-pets";
const IDLE_MS = 15000;
const SAY_MS = 2500;
const PURRS = ["purr", "mrrp", "*headbutt*", "prrt?", "*slow blink*", "*kneads*"];

function readPets() {
  try {
    return Number(localStorage.getItem(PETS_KEY)) || 0;
  } catch {
    return 0;
  }
}

/**
 * One digital pet. It sleeps when you leave it alone, wakes when you type,
 * scroll or click, and gets happy when petted or fed. Whatever it says shows
 * in a speech bubble over the cat. Pets are remembered per browser.
 */
export function usePet() {
  const [sleeping, setSleeping] = useState(false);
  const [happy, setHappy] = useState(false);
  const [saying, setSaying] = useState("");
  const [pets, setPets] = useState(readPets);
  const [feeding, setFeeding] = useState(false); // waiting for a click to drop a mouse
  const [mouse, setMouse] = useState(null); // clientX of the dropped mouse
  const idleTimer = useRef(null);
  const happyTimer = useRef(null);
  const sayTimer = useRef(null);

  const say = useCallback((msg) => {
    setSaying(msg);
    window.clearTimeout(sayTimer.current);
    sayTimer.current = window.setTimeout(() => setSaying(""), SAY_MS);
  }, []);

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
      happyTimer.current = window.setTimeout(() => setHappy(false), SAY_MS);
      say(msg);
    },
    [say, wake]
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

  // Feeding is a two-step so ordinary clicks stay ordinary: press feed (or :feed),
  // then the next click anywhere drops a mouse there. Escape or feed again cancels.
  const feed = useCallback(() => setFeeding((f) => !f), []);
  const eat = useCallback(() => {
    setMouse(null);
    cheer("nom nom nom");
  }, [cheer]);

  useEffect(() => {
    if (!feeding) return undefined;
    say("food?");
    const onClick = (event) => {
      if (event.target.closest?.(".feed-btn")) return; // the button toggles itself
      event.preventDefault();
      event.stopPropagation();
      setMouse(event.clientX);
      setFeeding(false);
      wake();
    };
    const onKey = (event) => {
      if (event.key === "Escape") setFeeding(false);
    };
    window.addEventListener("click", onClick, { capture: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("keydown", onKey);
    };
  }, [feeding, say, wake]);

  const status = useCallback(() => {
    const mood = happy ? "happy" : sleeping ? "asleep" : "awake";
    say(`${mood} · petted ${pets} time${pets === 1 ? "" : "s"}`);
  }, [happy, pets, say, sleeping]);

  useEffect(() => {
    wake();
    window.addEventListener("click", wake);
    window.addEventListener("scroll", wake, { capture: true, passive: true });
    return () => {
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(happyTimer.current);
      window.clearTimeout(sayTimer.current);
      window.removeEventListener("click", wake);
      window.removeEventListener("scroll", wake, { capture: true });
    };
  }, [wake]);

  return { sleeping, happy, saying, pets, feeding, mouse, wake, pet, feed, eat, status };
}

// Tail frames: suffixes for the cat's last three lines. Wags F0 → F1 → F2 → F1.
const TAIL = [
  ["", "  __", "_/"],
  ["   _", "  /", "_/"],
  ["  /", "  |", "_/"],
];
const TAIL_ORDER = [0, 1, 2, 1];
const TAIL_ASLEEP = ["", "", "_,"];

// Bottom row of the cat: paws alternate while it walks.
const PAWS = ["(__(__)___(__)__)", "(_(__)_____(__)_)"];
const STRIDE_PX = 3;
const STRIDE_MS = 90;
const RUN_PX = 8; // chasing a mouse
const RUN_MS = 40;
const MOUSE = "<:3)~~~";

// Pupil glyph by vertical look: up, level, down.
const PUPIL = { "-1": "°", 0: "o", 1: "." };

// Each eye is a 3-character socket; the pupil sits at index 1 + horizontal look.
function socket(glyph, h) {
  const cells = [" ", " ", " "];
  cells[1 + h] = glyph;
  return cells.join("");
}

/**
 * The cat itself. It wanders along the bottom of its parent: strolls a while,
 * sits a while, turns at the edges, and stops to be petted. Eyes follow the
 * pointer in every direction; click or tap it to pet it.
 */
export function PetCat({ pet, alert = false, className = "" }) {
  const ref = useRef(null);
  const [look, setLook] = useState({ h: 0, v: 0 });
  const [blink, setBlink] = useState(false);
  const [hover, setHover] = useState(false);
  const [wag, setWag] = useState(0);
  const [walk, setWalk] = useState({ x: 24, dir: 1, moving: false, step: 0 });
  const walkRef = useRef(walk);
  walkRef.current = walk;
  const phase = useRef(0); // ticks left in the current stroll or sit

  // A dropped mouse overrides the stroll: the cat runs to it and eats it.
  const { mouse, eat } = pet;
  useEffect(() => {
    if (mouse == null) return undefined;
    const timer = window.setInterval(() => {
      const el = ref.current;
      const box = el?.parentElement?.getBoundingClientRect();
      if (!box) return;
      const max = Math.max(0, box.width - el.offsetWidth);
      const target = Math.min(Math.max(mouse - box.left - el.offsetWidth / 2, 0), max);
      const w = walkRef.current;
      const d = target - w.x;
      if (Math.abs(d) <= RUN_PX) {
        setWalk({ ...w, x: target, moving: false });
        eat();
        return;
      }
      setWalk({
        x: w.x + Math.sign(d) * RUN_PX,
        dir: Math.sign(d),
        moving: true,
        step: w.step ^ 1,
      });
    }, RUN_MS);
    return () => window.clearInterval(timer);
  }, [mouse, eat]);

  useEffect(() => {
    const still =
      pet.sleeping ||
      pet.happy ||
      pet.mouse != null ||
      hover ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return undefined;
    const timer = window.setInterval(() => {
      setWalk((w) => {
        if (phase.current-- <= 0) {
          phase.current = 20 + Math.floor(Math.random() * 60);
          return { ...w, moving: !w.moving };
        }
        if (!w.moving) return w;
        const el = ref.current;
        const max = Math.max(0, (el?.parentElement?.clientWidth ?? 0) - (el?.offsetWidth ?? 0));
        let { x, dir } = w;
        x += dir * STRIDE_PX;
        if (x <= 0 || x >= max) {
          dir = -dir;
          x = Math.min(Math.max(x, 0), max);
        }
        return { x, dir, moving: true, step: w.step ^ 1 };
      });
    }, STRIDE_MS);
    return () => window.clearInterval(timer);
  }, [pet.sleeping, pet.happy, pet.mouse, hover]);

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

  // The art is drawn with the tail on the right, so it is mirrored when the cat
  // walks right; the pupils are flipped back so they still follow the pointer.
  const mirrored = walk.dir === 1;
  let eye;
  let h = mirrored ? -look.h : look.h;
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
    `${PAWS[walk.moving ? walk.step : 0]}${tail[2]}`,
  ];

  const floorLeft = ref.current?.parentElement?.getBoundingClientRect().left ?? 0;

  return (
    <>
      {pet.mouse != null ? (
        <span className="mouse" aria-hidden="true" style={{ left: pet.mouse - floorLeft }}>
          {MOUSE}
        </span>
      ) : null}
      <button
        ref={ref}
        type="button"
        className={`pet ${pet.sleeping ? "asleep" : ""} ${className}`.trim()}
        style={{ transform: `translateX(${walk.x}px)` }}
        onClick={pet.pet}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title="pet the cat"
        aria-label="Pet the cat"
      >
        <span className={`pet-say ${pet.saying ? "show" : ""}`} role="status" aria-live="polite">
          {pet.saying}
        </span>
        <pre aria-hidden="true" style={{ transform: `scaleX(${mirrored ? -1 : 1})` }}>
          {lines.join("\n")}
        </pre>
      </button>
    </>
  );
}
