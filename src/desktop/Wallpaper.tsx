import "./Wallpaper.css";

/**
 * Sfondo del sito: fondo pieno con una leggera vignettatura. La griglia a
 * puntini è stata rimossa per non confondersi con i punti dell'interpolazione
 * della Home (vedi HomeBackdrop).
 */
export function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden="true">
      <div className="wallpaper__vignette" />
    </div>
  );
}
