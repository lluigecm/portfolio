import type { Content } from "@/types/content";

export function Education({ text }: { text: Content["education"] }) {
  return (
    <>
      <h3 className="text-base">{text.degree}</h3>
      <p className="mt-1">{text.institution}</p>
      <p className="mt-1 text-secundario">{text.thesis}</p>
    </>
  );
}
