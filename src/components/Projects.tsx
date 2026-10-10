import { projects } from "@/content/projects";
import type { Content } from "@/types/content";

/*
 * Fichas dos projetos: borda fina, sem sombra (princípio 5.1.4).
 * Os dados do GitHub (etapa 7) e a mídia (etapa 8) entram depois.
 */
export function Projects({ text }: { text: Content["projects"] }) {
  return (
    <ul className="grid gap-6">
      {projects.map((project) => {
        const { title, badge, description } = text[project.id];
        return (
          <li key={project.id} className="rounded-md border border-linha bg-superficie p-5 md:p-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            {badge && <p className="mt-1 text-sm text-ambar">{badge}</p>}
            <p className="mt-3">{description}</p>
            <p className="mt-4 text-sm text-lapis">{project.tags.join(", ")}</p>
            <a
              href={`https://github.com/${project.repo}`}
              className="mt-4 inline-block text-sm underline decoration-linha underline-offset-4 hover:decoration-grafite"
            >
              <code className="font-mono">{project.repo}</code>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
