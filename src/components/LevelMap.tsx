import type { Content, LevelId } from "@/types/content";

const NODES: [LevelId, string][] = [
  ["sobre", "1-1"],
  ["exp", "1-2"],
  ["proj", "1-3"],
  ["stack", "1-4"],
  ["edu", "1-5"],
  ["contato", "BOSS"],
];

/* Seleção de fase: um nó por seção, o último é o chefe (contato). */
export function LevelMap({ text }: { text: Content["map"] }) {
  return (
    <section className="map" id="mapa" aria-labelledby="map-h">
      <h2 id="map-h">{text.title}</h2>
      <ol>
        {NODES.map(([id, node]) => (
          <li key={id}>
            <a href={`#${id}`} data-fala={`${node} · ${text.nodes[id].name.toUpperCase()}`}>
              <div className="node">{node}</div>
              <div className="name">{text.nodes[id].name}</div>
              <div className="meta">{text.nodes[id].meta}</div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
