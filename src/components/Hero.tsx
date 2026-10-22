import type { Content } from "@/types/content";

/* Tela de título: o nome se digita sozinho (globals.css) e PRESS START leva ao mapa. */
export function Hero({ text }: { text: Content["hero"] }) {
  return (
    <section className="hero">
      <div>
        <h1 aria-label={text.name}>
          <span className="typed">{text.name.toUpperCase()}</span>
          <span className="cursor" aria-hidden="true" />
        </h1>
        <p className="tag">
          {text.tag.before}
          <b>{text.tag.bold}</b>
          {text.tag.after}
        </p>
        <a className="start px" href="#mapa">
          {text.start}
        </a>
        <p className="hint">{text.hint}</p>
      </div>
    </section>
  );
}
