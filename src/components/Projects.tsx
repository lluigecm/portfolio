import type { CSSProperties } from "react";
import { cartridges } from "@/content/game";
import type { Content } from "@/types/content";

/* Cartuchos: cada projeto é um link para o repositório no GitHub. Ao entrar, caem e encaixam. */
export function Projects({ text }: { text: Content["projects"] }) {
  return (
    <div className="carts">
      {cartridges.map((cart, i) => (
        <a
          key={cart.id}
          className="cart entra"
          style={{ "--i": i } as CSSProperties}
          href={cart.href}
          target="_blank"
          rel="noopener"
          data-fala={text.falas[cart.id]}
        >
          <div className="label">
            <small>{cart.label}</small>
            <h3>{cart.title}</h3>
          </div>
          <div className="body">
            <p>{text.descriptions[cart.id]}</p>
            <ul className="tags">
              {cart.tags.map((tag, j) => (
                <li key={tag} style={{ "--j": j } as CSSProperties}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          <div className="go">{text.go}</div>
        </a>
      ))}
    </div>
  );
}
