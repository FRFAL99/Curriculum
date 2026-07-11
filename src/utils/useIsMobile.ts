import { useEffect, useState } from "react";

/**
 * Stesso breakpoint usato in CSS (vedi Desktop.css, Window.css) per il
 * passaggio al layout mobile. Centralizzato qui per evitare che JS e CSS
 * finiscano fuori sincrono.
 */
export const MOBILE_BREAKPOINT = 640;

function getQuery() {
  return `(max-width: ${MOBILE_BREAKPOINT}px)`;
}

/**
 * true se il viewport è sotto il breakpoint mobile. Si aggiorna su resize
 * (es. rotazione dello schermo) tramite matchMedia, senza polling.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(getQuery()).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(getQuery());
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
