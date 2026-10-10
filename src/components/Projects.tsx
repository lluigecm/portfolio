import { projects } from "@/content/projects";
import { getRepoStats } from "@/lib/github";
import type { Content } from "@/types/content";
import type { RepoStats } from "@/types/github";

/*
 * Fichas dos projetos: borda fina, sem sombra (princípio 5.1.4).
 * Textos próprios sempre; os dados do GitHub entram quando a API responde.
 * A mídia entra na etapa 8.
 */
export async function Projects({ text, labels }: { text: Content["projects"]; labels: Content["ui"]["repo"] }) {
  const stats = await Promise.all(projects.map((project) => getRepoStats(project.repo)));

  return (
    <ul className="grid gap-6">
      {projects.map((project, index) => {
        const { title, badge, description } = text[project.id];
        return (
          <li
            key={project.id}
            data-project={project.id}
            className="rounded-md border border-linha bg-superficie p-5 md:p-6"
          >
            <h3 className="text-lg font-semibold">{title}</h3>
            {badge && <p className="mt-1 text-sm text-ambar">{badge}</p>}
            <p className="mt-3">{description}</p>
            <p className="mt-4 text-sm text-lapis">{project.tags.join(", ")}</p>
            {stats[index] && <RepoFacts stats={stats[index]} labels={labels} />}
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

function RepoFacts({ stats, labels }: { stats: RepoStats; labels: Content["ui"]["repo"] }) {
  const facts = [
    [labels.stars, labels.count(stats.stars)],
    [labels.languages, stats.languages.join(", ")],
    [labels.updated, labels.date(stats.pushedAt)],
  ].filter(([, value]) => value);

  return (
    <dl data-testid="repo-stats" className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-linha pt-4 text-sm">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="text-lapis">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
