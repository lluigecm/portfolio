import { profile } from "@/content/profile";
import type { Content } from "@/types/content";

// Botões de jogo (seção 5.4): amarelo marca o que é interativo; afundam ao
// serem pressionados (seção 5.5), sem mover nada no hover.
const button =
  "inline-flex items-center border-4 border-linha bg-amarelo px-4 py-2 text-tinta shadow-dura active:translate-x-1 active:translate-y-1 active:shadow-none";

export function Contact({ text }: { text: Content["contact"] }) {
  return (
    <>
      <p>{text.text}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {/* Regra 21: o e-mail só aparece como link mailto:. */}
        <a href={`mailto:${profile.email}`} data-ui="botao" className={button}>
          {text.email}
        </a>
        <a href={profile.linkedin} data-ui="botao" className={button}>
          {text.linkedin}
        </a>
      </div>
    </>
  );
}
