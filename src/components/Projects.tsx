import { projects, type Project } from "@/content/projects";
import { getRepoStats } from "@/lib/github";
import type { Content, ProjectText } from "@/types/content";
import type { RepoStats } from "@/types/github";
import { ProjectVideo } from "./ProjectVideo";
import { RecoveryDiagram } from "./RecoveryDiagram";

interface Props {
  text: Content["projects"];
  diagram: Content["diagram"];
  ui: Content["ui"];
}

/*
 * Fichas dos projetos: mídia grande no topo, borda fina, sem sombra
 * (princípio 5.1.4). Textos próprios sempre; os dados do GitHub entram
 * quando a API responde.
 */
export async function Projects({ text, diagram, ui }: Props) {
  const stats = await Promise.all(projects.map((project) => getRepoStats(project.repo)));
  const labels = ui.repo;

  return (
    <ul className="grid gap-6">
      {projects.map((project, index) => {
        const { title, badge, description } = text[project.id];
        return (
          <li
            key={project.id}
            data-project={project.id}
            className="overflow-hidden rounded-md border border-linha bg-superficie"
          >
            <Media project={project} text={text[project.id]} diagram={diagram} ui={ui} />
            <div className="p-5 md:p-6">
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}

interface MediaProps {
  project: Project;
  text: ProjectText;
  diagram: Content["diagram"];
  ui: Content["ui"];
}

function Media({ project, text, diagram, ui }: MediaProps) {
  if (project.media.kind === "video") {
    return (
      <ProjectVideo media={project.media} alt={text.mediaAlt} credit={text.credit} labels={ui.video} />
    );
  }
  return (
    <figure className="border-b border-linha bg-papel px-4 py-6 md:py-8">
      <RecoveryDiagram text={diagram} alt={text.mediaAlt} />
    </figure>
  );
}

function RepoFacts({ stats, labels }: { stats: RepoStats; labels: Content["ui"]["repo"] }) {
  const facts = [
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
