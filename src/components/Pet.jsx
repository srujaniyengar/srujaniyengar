import { useCallback, useEffect, useRef, useState } from "react";

const PETS_KEY = "cat-pets";
const IDLE_MS = 15000;
const PURRS = ["purr", "mrrp", "*headbutt*", "prrt?", "*slow blink*"];

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

const EYES = {
  center: "( o.o )",
  left: "(o.o  )",
  right: "(  o.o)",
  happy: "( ^.^ )",
  blink: "( -.- )",
  sleep: "( -.- )",
  alert: "( O.O )",
};

/** The cat itself. Its eyes follow the cursor; click or tap it to pet it. */
export function PetCat({ pet, alert = false, className = "" }) {
  const ref = useRef(null);
  const [look, setLook] = useState("center");
  const [blink, setBlink] = useState(false);

  // Eyes follow the pointer when the cat is awake. Only on devices with a real
  // pointer; on touch screens the cat just looks straight ahead.
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
        setLook(dx < -40 ? "left" : dx > 40 ? "right" : "center");
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

  const eyes = pet.sleeping
    ? EYES.sleep
    : pet.happy
      ? EYES.happy
      : alert
        ? EYES.alert
        : blink
          ? EYES.blink
          : EYES[look];
  const ears = pet.sleeping ? " /\\_/\\  z" : " /\\_/\\";
  const paws = pet.happy ? " > ^ <  ♥" : " > ^ <";

  return (
    <button
      ref={ref}
      type="button"
      className={`pet ${pet.sleeping ? "asleep" : ""} ${className}`.trim()}
      onClick={pet.pet}
      title="pet the cat"
      aria-label="Pet the cat"
    >
      <pre aria-hidden="true">{[ears, eyes, paws].join("\n")}</pre>
    </button>
  );
}
