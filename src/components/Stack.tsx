import type { Content } from "@/types/content";

export function Stack({ text }: { text: Content["stack"] }) {
  return (
    <dl className="grid gap-4">
      {text.map((group) => (
        <div key={group.label}>
          <dt className="text-sm text-lapis">{group.label}</dt>
          <dd>{group.items.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}
