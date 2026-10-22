import type { Content } from "@/types/content";

/*
 * Stack como inventário (seção 5.4): os quatro grupos da seção 6.4, cada item
 * numa casa. Só o visual muda; nada de quantidades.
 */
export function Stack({ text }: { text: Content["stack"] }) {
  return (
    <dl className="grid gap-6">
      {text.map((group) => (
        <div key={group.label}>
          <dt className="text-sm text-secundario">{group.label}</dt>
          <dd className="mt-2">
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item} className="border-2 border-linha bg-painel-2 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
