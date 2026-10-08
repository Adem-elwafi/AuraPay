import { useEffect, useRef, useState, type RefObject } from "react";

/** Returns [ref, width] and keeps width in sync with the element's size. */
export function useElementWidth<T extends HTMLElement = HTMLElement>(
  initial = 0
): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

export default useElementWidth;
