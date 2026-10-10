import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  children: ReactNode;
}

/*
 * Seção com o nome numa coluna à esquerda e o conteúdo à direita (esboço da
 * seção 5.4). No celular, um embaixo do outro.
 */
export function Section({ id, title, children }: Props) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="grid gap-4 border-t border-linha py-12 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-12 md:py-16"
    >
      <h2 id={headingId} className="text-xl font-semibold">
        {title}
      </h2>
      <div className="max-w-texto">{children}</div>
    </section>
  );
}
