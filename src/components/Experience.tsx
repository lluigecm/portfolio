import type { Content } from "@/types/content";

/*
 * Linha do tempo vertical: a única sequência real da página (princípio 5.1.2).
 * O ponto em âmbar marca o cargo atual; o texto do período diz o mesmo.
 */
export function Experience({ text }: { text: Content["experience"] }) {
  return (
    <>
      <h3 className="text-lg font-semibold">{text.company}</h3>
      <p className="mt-1 text-lapis">{text.companyDescription}</p>

      <ol className="mt-8 border-l border-linha">
        {text.roles.map((role, index) => (
          <li key={role.title} className="relative pb-8 pl-6 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute top-2.5 -left-[5px] size-[9px] rounded-full border ${
                index === 0 ? "border-ambar bg-ambar" : "border-lapis bg-papel"
              }`}
            />
            <h4 className="font-semibold">{role.title}</h4>
            <p className="text-sm text-lapis">{role.period}</p>
            <p className="mt-2">{role.description}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
