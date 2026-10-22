import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  /** Texto da placa, ex.: "MUNDO 1-1" (princípio 5.1.2). */
  sign: string;
  children: ReactNode;
}

/*
 * Cada seção é uma fase (seção 5.4): a placa em cima, decorativa e invisível
 * ao leitor de tela, e um painel com o título da seção 6 e o conteúdo.
 */
export function Section({ id, title, sign, children }: Props) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="py-8 md:py-12">
      <p
        aria-hidden="true"
        data-ui="placa"
        className="inline-block border-2 border-linha bg-amarelo px-2 py-1 font-display text-xs text-tinta shadow-dura"
      >
        {sign}
      </p>
      <div
        data-ui="painel"
        className="mt-4 border-4 border-linha bg-painel p-4 shadow-dura-lg md:p-8"
      >
        <h2 id={headingId} className="text-lg">
          {title}
        </h2>
        <div className="mt-6 max-w-texto">{children}</div>
      </div>
    </section>
  );
}
