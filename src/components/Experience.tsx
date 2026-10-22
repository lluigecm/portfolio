import type { CSSProperties } from "react";
import type { Content } from "@/types/content";

/* Trilha de checkpoints: o atual pisca em amarelo. Ao entrar, a trilha se desenha e os checkpoints surgem em ordem. */
export function Experience({ text }: { text: Content["experience"] }) {
  return (
    <div className="panel entra">
      <div className="track">
        {text.roles.map((role, i) => (
          <div
            key={role.title}
            className={role.now ? "cp now" : "cp"}
            data-fala={role.fala}
            style={{ "--i": i } as CSSProperties}
          >
            <h3>{role.title}</h3>
            <div className="when">{role.when}</div>
            <ul>
              {role.bullets.map((bullet, j) => (
                <li key={bullet} style={{ "--j": j } as CSSProperties}>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
