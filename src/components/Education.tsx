import type { Content } from "@/types/content";

export function Education({ text }: { text: Content["education"] }) {
  return (
    <div className="edu">
      <div className="panel" data-fala={text.fala}>
        <h3>{text.degree}</h3>
        <div className="when">{text.when}</div>
        <p>{text.description}</p>
      </div>
    </div>
  );
}
