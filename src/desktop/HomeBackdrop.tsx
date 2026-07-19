import { useIsMobile } from "../utils/useIsMobile";
import "./HomeBackdrop.css";

/**
 * Sfondo decorativo della Home: una "costellazione interpolata" — punti sparsi
 * (dati/stelle) attraversati da una curva morbida che li interpola, su un alone
 * luminoso soffuso; alla fine della curva un razzetto (il "percorso fatto").
 *
 * Due composizioni: su desktop la traiettoria è orizzontale; su mobile
 * (portrait) sarebbe schiacciata, quindi usiamo una traiettoria VERTICALE che
 * sale da in basso-sinistra a in alto-destra, così percorso e razzo restano
 * ben visibili. Puramente decorativo: aria-hidden, non interattivo, molto tenue.
 */

interface Backdrop {
  viewBox: string;
  curve: string;
  dots: [number, number][];
  nodes: [number, number][];
  rocket: [number, number];
  rocketAngle: number; // gradi, ≈ tangente finale della curva
}

const DESKTOP: Backdrop = {
  viewBox: "0 0 1000 700",
  curve:
    "M 60 470 C 85 442 157 315 210 300 C 263 285 325 392 380 380 " +
    "C 435 368 487 238 540 230 C 593 222 647 334 700 330 " +
    "C 753 326 814 240 860 205 C 906 170 956 134 975 120",
  dots: [
    [120, 180], [180, 560], [320, 160], [300, 520], [470, 140], [520, 470],
    [640, 120], [600, 430], [760, 470], [820, 90], [770, 250], [920, 410],
    [160, 360], [700, 560], [400, 165], [250, 450], [560, 600], [860, 330],
    [660, 250],
  ],
  nodes: [[210, 300], [380, 380], [540, 230], [700, 330], [860, 205]],
  rocket: [975, 120],
  rocketAngle: 54,
};

const MOBILE: Backdrop = {
  viewBox: "0 0 480 900",
  curve:
    "M 60 830 C 83 802 185 720 200 660 C 215 600 130 525 150 470 " +
    "C 170 415 298 378 320 330 C 342 282 262 222 280 180 " +
    "C 298 138 405 97 430 80",
  dots: [
    [390, 780], [100, 610], [410, 560], [70, 410], [400, 320], [110, 250],
    [360, 440], [220, 110], [80, 210], [420, 680],
  ],
  nodes: [[200, 660], [150, 470], [320, 330], [280, 180]],
  rocket: [430, 80],
  rocketAngle: 56,
};

export function HomeBackdrop() {
  const isMobile = useIsMobile();
  const c = isMobile ? MOBILE : DESKTOP;

  return (
    <div className="home-backdrop" aria-hidden="true">
      <svg
        className="home-backdrop__svg"
        viewBox={c.viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="hb-aura" cx="42%" cy="44%" r="62%">
            <stop className="home-backdrop__aura-in" offset="0%" />
            <stop className="home-backdrop__aura-out" offset="100%" />
          </radialGradient>
          <linearGradient id="hb-curve" x1="0" y1="0" x2="1" y2="0">
            <stop className="home-backdrop__curve-edge" offset="0%" />
            <stop className="home-backdrop__curve-mid" offset="48%" />
            <stop className="home-backdrop__curve-edge" offset="100%" />
          </linearGradient>
        </defs>

        <rect
          className="home-backdrop__aura"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#hb-aura)"
        />

        <path
          className="home-backdrop__curve"
          d={c.curve}
          fill="none"
          stroke="url(#hb-curve)"
          vectorEffect="non-scaling-stroke"
        />

        {c.dots.map(([x, y]) => (
          <circle key={`d-${x}-${y}`} className="home-backdrop__dot" cx={x} cy={y} r={2.6} />
        ))}
        {c.nodes.map(([x, y]) => (
          <circle key={`n-${x}-${y}`} className="home-backdrop__node" cx={x} cy={y} r={4} />
        ))}

        {/* Razzetto alla fine della curva, in linea con la tangente finale. */}
        <g
          className="home-backdrop__rocket"
          transform={`translate(${c.rocket[0]} ${c.rocket[1]}) rotate(${c.rocketAngle})`}
        >
          <path
            className="home-backdrop__rocket-body"
            d="M0 -15C4.2 -9 4.2 2 3 7L-3 7C-4.2 2 -4.2 -9 0 -15Z"
          />
          <path className="home-backdrop__rocket-fin" d="M-3 3-7.5 9-3 6.5Z" />
          <path className="home-backdrop__rocket-fin" d="M3 3 7.5 9 3 6.5Z" />
          <circle className="home-backdrop__rocket-window" cx="0" cy="-4.5" r="1.7" />
          <path className="home-backdrop__rocket-flame" d="M-2.2 8 0 14.5 2.2 8Z" />
        </g>
      </svg>
    </div>
  );
}
