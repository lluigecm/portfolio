import type { CSSProperties } from "react";
import type { Content } from "@/types/content";

interface Word {
  text: string;
  /** Posição entre as palavras, para a entrada em sequência. */
  index: number;
  bold: boolean;
  /** Última frase ("Quer dizer, ao usuário."): entra depois de uma pausa. */
  joke: boolean;
}

/** A frase em palavras e espaços, como no texto original. */
function split(tag: Content["hero"]["tag"]): (Word | string)[] {
  const cut = tag.after.lastIndexOf(". ");
  const jokeFrom = tag.before.length + tag.bold.length + (cut < 0 ? tag.after.length : cut + 2);
  const out: (Word | string)[] = [];
  let offset = 0;
  let index = 0;
  const parts: [string, boolean][] = [
    [tag.before, false],
    [tag.bold, true],
    [tag.after, false],
  ];
  for (const [part, bold] of parts) {
    for (const piece of part.split(/(\s+)/).filter(Boolean)) {
      out.push(/\s/.test(piece) ? piece : { text: piece, index: index++, bold, joke: offset >= jokeFrom });
      offset += piece.length;
    }
  }
  return out;
}

/*
 * Tela de título. Na abertura (classe "tv", globals.css) as letras do nome caem
 * uma a uma e a frase entra palavra por palavra; para o leitor de tela, a frase
 * vai inteira. PRESS TO START leva ao mapa.
 */
export function Hero({ text }: { text: Content["hero"] }) {
  const { before, bold, after } = text.tag;
  return (
    <section className="hero">
      <div>
        <h1 aria-label={text.name}>
          <span className="typed">
            {[...text.name.toUpperCase()].map((letter, i) => (
              <span key={i} className="l" style={{ "--i": i } as CSSProperties}>
                {letter}
              </span>
            ))}
          </span>
          <span className="cursor" aria-hidden="true" />
        </h1>
        <p className="tag">
          <span className="sr-only">
            {before}
            {bold}
            {after}
          </span>
          <span aria-hidden="true">
            {split(text.tag).map((word, i) => {
              if (typeof word === "string") return word;
              const style = { "--i": word.index } as CSSProperties;
              const className = word.joke ? "w piada" : "w";
              return word.bold ? (
                <b key={i} className={className} style={style}>
                  {word.text}
                </b>
              ) : (
                <span key={i} className={className} style={style}>
                  {word.text}
                </span>
              );
            })}
          </span>
        </p>
        <a className="start px" href="#mapa" data-fala={text.startFala}>
          <span className="arrow">▶</span> {text.start}
        </a>
        <p className="hint">{text.hint}</p>
      </div>
    </section>
  );
}
