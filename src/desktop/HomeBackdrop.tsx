import "./HomeBackdrop.css";

/**
 * Sfondo decorativo della Home: una "costellazione interpolata" — punti sparsi
 * (dati/stelle) attraversati da una curva morbida che li interpola, su un alone
 * luminoso soffuso. Richiamo al background matematico (interpolazione) con un
 * tono contemplativo. Puramente decorativo: aria-hidden, non interattivo, molto
 * tenue per non disturbare la leggibilità della chat.
 */

// Punti sparsi (fuori dalla curva) — la "costellazione". Alcuni non vengono
// raggiunti dalla curva: punti "da interpolare" ancora scollegati.
const DOTS: [number, number][] = [
  [120, 180], [180, 560], [320, 160], [300, 520], [470, 140], [520, 470],
  [640, 120], [600, 430], [760, 470], [820, 90], [770, 250], [920, 410],
  [160, 360], [700, 560], [400, 165], [250, 450], [560, 600], [860, 330],
  [660, 250],
];

// Nodi attraversati dalla curva di interpolazione (leggermente più marcati).
const NODES: [number, number][] = [
  [210, 300], [380, 380], [540, 230], [700, 330], [860, 205],
];

// Spline morbida (Catmull-Rom → Bézier) che interpola i nodi. La coda sale
// verso l'alto-destra: la curva termina in ROCKET_AT "lanciando" il razzo, che
// è ruotato sulla tangente finale (ROCKET_ANGLE) per restare in traiettoria.
const CURVE =
  "M 60 470 C 85 442 157 315 210 300 C 263 285 325 392 380 380 " +
  "C 435 368 487 238 540 230 C 593 222 647 334 700 330 " +
  "C 753 326 814 240 860 205 C 906 170 956 134 975 120";

const ROCKET_AT: [number, number] = [975, 120];
const ROCKET_ANGLE = 54; // gradi, ≈ tangente finale della curva

export function HomeBackdrop() {
  return (
    <div className="home-backdrop" aria-hidden="true">
      <svg
        className="home-backdrop__svg"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="hb-aura" cx="40%" cy="42%" r="62%">
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
          width="1000"
          height="700"
          fill="url(#hb-aura)"
        />

        <path
          className="home-backdrop__curve"
          d={CURVE}
          fill="none"
          stroke="url(#hb-curve)"
          vectorEffect="non-scaling-stroke"
        />

        {DOTS.map(([x, y]) => (
          <circle key={`d-${x}-${y}`} className="home-backdrop__dot" cx={x} cy={y} r={2.5} />
        ))}
        {NODES.map(([x, y]) => (
          <circle key={`n-${x}-${y}`} className="home-backdrop__node" cx={x} cy={y} r={4} />
        ))}

        {/* Razzetto alla fine della curva: il "percorso fatto" che spicca il volo,
            in linea con la tangente finale della traiettoria. */}
        <g
          className="home-backdrop__rocket"
          transform={`translate(${ROCKET_AT[0]} ${ROCKET_AT[1]}) rotate(${ROCKET_ANGLE})`}
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
