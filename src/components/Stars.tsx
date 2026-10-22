/*
 * 70 estrelas piscando no céu. Posições sorteadas com semente fixa: saem iguais
 * no servidor e no navegador, sem JavaScript na página.
 */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const next = random(1445);
const STARS = Array.from({ length: 70 }, () => ({
  left: `${(next() * 100).toFixed(2)}%`,
  top: `${(next() * 70).toFixed(2)}%`,
  animationDelay: `${(next() * 3).toFixed(2)}s`,
}));

export function Stars() {
  return (
    <div className="stars" aria-hidden="true">
      {STARS.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </div>
  );
}
