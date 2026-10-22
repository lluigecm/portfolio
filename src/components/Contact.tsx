import { profile } from "@/content/profile";
import type { Content } from "@/types/content";

/* Fase final: os dois caminhos de contato e o rodapé, que entram em sequência. */
export function Contact({ text }: { text: Content["contact"] }) {
  return (
    <>
      <p className="entra">{text.text}</p>
      <div className="btns entra">
        <a className="btn" href={profile.linkedin} target="_blank" rel="noopener" data-fala={text.linkedinFala}>
          LinkedIn
        </a>
        <a className="btn alt" href={`mailto:${profile.email}`} data-fala={text.emailFala}>
          E-mail
        </a>
      </div>
      <div className="foot entra">
        <span>{text.foot}</span>
        <span className="px">lluigecm.dev © 2026</span>
      </div>
    </>
  );
}
