/**
 * Scrolls to a dashboard anchor (e.g. "#transactions").
 * Some sections exist twice (mobile + "-desktop" variant) with one hidden via CSS;
 * scrollIntoView() on a display:none element does nothing, so pick the visible one.
 */
export function scrollToAnchor(hash: string): boolean {
  if (!hash || hash === "#") return false;
  const id = hash.replace(/^#/, "");
  const candidates = [id, `${id}-desktop`]
    .map((candidate) => document.getElementById(candidate))
    .filter((el): el is HTMLElement => el !== null);
  const target = candidates.find((el) => el.getClientRects().length > 0);
  if (!target) return false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default scrollToAnchor;
