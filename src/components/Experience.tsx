import type { Content } from "@/types/content";

/*
 * Linha do tempo vertical, como trilha de checkpoints: a única sequência real da
 * página (princípio 5.1.2). O checkpoint na cor de destaque marca o cargo atual,
 * só pela cor; o texto do período diz o mesmo.
 */
export function Experience({ text }: { text: Content["experience"] }) {
  return (
    <>
      <h3 className="text-base">{text.company}</h3>
      <p className="mt-1 text-secundario">{text.companyDescription}</p>

      <ol className="mt-8 border-l-4 border-dotted border-linha">
        {text.roles.map((role, index) => (
          <li key={role.title} className="relative pb-8 pl-7 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute top-1 -left-[12px] size-5 border-4 border-linha ${
                index === 0 ? "bg-destaque" : "bg-painel-2"
              }`}
            />
            <h4 className="font-semibold">{role.title}</h4>
            <p className="text-sm text-secundario">{role.period}</p>
            <p className="mt-2">{role.description}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
