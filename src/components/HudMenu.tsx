"use client";

import { useRef } from "react";

interface Props {
  /** Nome acessível do botão que abre a lista. */
  label: string;
  navLabel: string;
  links: { href: string; label: string }[];
}

/*
 * Links das seções recolhidos abaixo de 1024 px (seção 5.4), num <details>:
 * abre e fecha sem JavaScript. Com JavaScript, a lista também fecha ao escolher
 * uma seção, para não ficar aberta por cima do conteúdo.
 */
export function HudMenu({ label, navLabel, links }: Props) {
  const details = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={details} className="group lg:hidden">
      <summary
        aria-label={label}
        className="inline-flex h-10 min-w-10 cursor-pointer list-none items-center justify-center border-2 border-linha bg-painel px-2 group-open:bg-amarelo group-open:text-tinta [&::-webkit-details-marker]:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 12 12" className="size-4" shapeRendering="crispEdges">
          <path d="M1 2h10v2H1zM1 5h10v2H1zM1 8h10v2H1z" fill="currentColor" />
        </svg>
      </summary>
      <nav
        aria-label={navLabel}
        className="absolute inset-x-0 top-full border-b-4 border-linha bg-painel-2"
      >
        <ul className="mx-auto grid max-w-5xl gap-1 px-4 py-3">
          {links.map(({ href, label: text }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => details.current?.removeAttribute("open")}
                className="inline-block py-2 hover:text-destaque"
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
