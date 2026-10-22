import type { Content } from "@/types/content";

/* Trilha de checkpoints: o atual pisca em amarelo. */
export function Experience({ text }: { text: Content["experience"] }) {
  return (
    <div className="panel">
      <div className="track">
        {text.roles.map((role) => (
          <div key={role.title} className={role.now ? "cp now" : "cp"}>
            <h3>{role.title}</h3>
            <div className="when">{role.when}</div>
            <ul>
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
