import { useCallback, useEffect, useRef, useState } from "react";

const lines = () => Array.from(document.querySelectorAll(".buffer .ln"));

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A vim cursor over the buffer's lines (every element with class "ln"):
 * j/k move it, gg/G jump, "/" searches, n/N step through matches.
 * Search matches are painted with the CSS Custom Highlight API when the
 * browser has it; the matching lines are marked either way.
 */
export function useCursor(scrollerRef, notify) {
  const [cursor, setCursor] = useState(0);
  const [count, setCount] = useState(0);
  const matches = useRef([]);
  const term = useRef("");

  useEffect(() => setCount(lines().length), []);

  useEffect(() => {
    const all = lines();
    all.forEach((el, i) => el.classList.toggle("cursorline", i === cursor));
    if (cursor === all.length - 1) {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
    } else {
      all[cursor]?.scrollIntoView({ block: "nearest" });
    }
  }, [cursor, scrollerRef]);

  const clamp = useCallback((i) => Math.max(0, Math.min(lines().length - 1, i)), []);

  // If the reader scrolled the cursor line off screen, resume from the first visible line.
  const anchored = useCallback(() => {
    const all = lines();
    const box = scrollerRef.current?.getBoundingClientRect();
    const el = all[cursor];
    if (!box || !el) return cursor;
    const r = el.getBoundingClientRect();
    if (r.bottom >= box.top && r.top <= box.bottom) return cursor;
    const first = all.findIndex((line) => line.getBoundingClientRect().bottom >= box.top);
    return first === -1 ? cursor : first;
  }, [cursor, scrollerRef]);

  const move = useCallback((delta) => setCursor(clamp(anchored() + delta)), [anchored, clamp]);
  const goTo = useCallback((i) => setCursor(clamp(i)), [clamp]);
  const toEnd = useCallback(() => setCursor(lines().length - 1), []);

  const clearSearch = useCallback(() => {
    lines().forEach((el) => el.classList.remove("match"));
    window.CSS?.highlights?.delete("search");
    matches.current = [];
  }, []);

  const search = useCallback(
    (raw) => {
      clearSearch();
      const query = raw.trim();
      term.current = query;
      if (!query) return;
      // Two regexes on purpose: a global one carries lastIndex between calls.
      const has = new RegExp(escapeRegExp(query), "i");
      const every = new RegExp(escapeRegExp(query), "gi");
      const all = lines();
      const hits = [];
      const ranges = [];
      all.forEach((el, i) => {
        if (!has.test(el.textContent)) return;
        hits.push(i);
        el.classList.add("match");
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          for (const m of node.data.matchAll(every)) {
            const range = new Range();
            range.setStart(node, m.index);
            range.setEnd(node, m.index + m[0].length);
            ranges.push(range);
          }
        }
      });
      if (window.CSS?.highlights && window.Highlight) {
        window.CSS.highlights.set("search", new window.Highlight(...ranges));
      }
      matches.current = hits;
      if (!hits.length) {
        notify(`E486: Pattern not found: ${query}`);
        return;
      }
      const from = anchored();
      const next = hits.find((i) => i >= from) ?? hits[0];
      setCursor(next);
      notify(`${hits.length} line${hits.length === 1 ? "" : "s"} match /${query}`);
    },
    [anchored, clearSearch, notify]
  );

  const step = useCallback(
    (dir) => {
      const hits = matches.current;
      if (!hits.length) {
        notify(
          term.current
            ? `E486: Pattern not found: ${term.current}`
            : "E35: No previous regular expression"
        );
        return;
      }
      const from = anchored();
      const next =
        dir > 0
          ? (hits.find((i) => i > from) ?? hits[0])
          : (hits.findLast((i) => i < from) ?? hits.at(-1));
      setCursor(next);
      if ((dir > 0 && next <= from) || (dir < 0 && next >= from)) {
        notify(
          dir > 0 ? "search hit BOTTOM, continuing at TOP" : "search hit TOP, continuing at BOTTOM"
        );
      }
    },
    [anchored, notify]
  );

  return { cursor, count, move, goTo, toEnd, search, step, clearSearch };
}
