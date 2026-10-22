import { cartridges } from "@/content/game";
import type { Content } from "@/types/content";

/* Cartuchos: cada projeto é um link para o repositório no GitHub. */
export function Projects({ text }: { text: Content["projects"] }) {
  return (
    <div className="carts">
      {cartridges.map((cart) => (
        <a key={cart.id} className="cart" href={cart.href} target="_blank" rel="noopener">
          <div className="label">
            <small>{cart.label}</small>
            <h3>{cart.title}</h3>
          </div>
          <div className="body">
            <p>{text.descriptions[cart.id]}</p>
            <ul className="tags">
              {cart.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
          <div className="go">{text.go}</div>
        </a>
      ))}
    </div>
  );
}
