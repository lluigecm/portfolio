import { profile } from "@/content/profile";
import type { Content } from "@/types/content";

/* Fase final: os dois caminhos de contato e o rodapé. */
export function Contact({ text }: { text: Content["contact"] }) {
  return (
    <>
      <p>{text.text}</p>
      <div className="btns">
        <a className="btn" href={profile.linkedin} target="_blank" rel="noopener">
          LinkedIn
        </a>
        <a className="btn alt" href={`mailto:${profile.email}`}>
          E-mail
        </a>
      </div>
      <div className="foot">
        <span>{text.foot}</span>
        <span className="px">lluigecm.dev © 2026</span>
      </div>
    </>
  );
}
