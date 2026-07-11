import { useEffect, useRef, useState } from "react";
import "./Wallpaper.css";

/**
 * Sfondo del desktop: una griglia a puntini (quaderno millimetrato) con un
 * readout di coordinate in basso a destra, in monospace, che segue il mouse.
 * Riferimento discreto al background da matematico/simulazioni Monte Carlo
 * del proprietario — un dettaglio, non un effetto vistoso.
 */
export function Wallpaper() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setCoords({ x: e.clientX, y: e.clientY });
      });
    }
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div className="wallpaper" aria-hidden="true">
      <div className="wallpaper__grid" />
      <div className="wallpaper__vignette" />
      <div className="wallpaper__coords">
        x:{String(coords.x).padStart(4, "0")} y:
        {String(coords.y).padStart(4, "0")}
      </div>
    </div>
  );
}
