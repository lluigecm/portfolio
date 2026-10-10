import { profile } from "@/content/profile";
import type { Content } from "@/types/content";

const button = "inline-flex items-center rounded-md border border-linha px-4 py-2 hover:border-grafite";

export function Contact({ text }: { text: Content["contact"] }) {
  return (
    <>
      <p>{text.text}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {/* Regra 21: o e-mail só aparece como link mailto:. */}
        <a href={`mailto:${profile.email}`} className={button}>
          {text.email}
        </a>
        <a href={profile.linkedin} className={button}>
          {text.linkedin}
        </a>
      </div>
    </>
  );
}
