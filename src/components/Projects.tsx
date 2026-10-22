import { projects, type Project } from "@/content/projects";
import { getRepoStats } from "@/lib/github";
import type { Content, ProjectText } from "@/types/content";
import type { RepoStats } from "@/types/github";
import { ProjectVideo } from "./ProjectVideo";
import { RecoveryCases } from "./RecoveryCases";
import { RecoveryDiagram } from "./RecoveryDiagram";

interface Props {
  text: Content["projects"];
  diagram: Content["diagram"];
  cases: Content["recoveryCases"];
  ui: Content["ui"];
}

/*
 * Fichas dos projetos: mídia grande no topo, borda fina, sem sombra
 * (princípio 5.1.4). Textos próprios sempre; os dados do GitHub entram
 * quando a API responde.
 */
export async function Projects({ text, diagram, cases, ui }: Props) {
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
            className="overflow-hidden rounded-md border border-linha bg-painel-2"
          >
            <Media project={project} text={text[project.id]} diagram={diagram} cases={cases} ui={ui} />
            <div className="p-5 md:p-6">
              <h3 className="text-base">{title}</h3>
              {badge && <p className="mt-1 text-sm text-destaque">{badge}</p>}
              <p className="mt-3">{description}</p>
              <p className="mt-4 text-sm text-secundario">{project.tags.join(", ")}</p>
              {stats[index] && <RepoFacts stats={stats[index]} labels={labels} />}
              <a
                href={`https://github.com/${project.repo}`}
                className="mt-4 inline-block text-sm underline decoration-linha underline-offset-4 hover:decoration-texto"
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
  cases: Content["recoveryCases"];
  ui: Content["ui"];
}

function Media({ project, text, diagram, cases, ui }: MediaProps) {
  if (project.media.kind === "video") {
    return (
      <ProjectVideo media={project.media} alt={text.mediaAlt} credit={text.credit} labels={ui.video} />
    );
  }
  // "casos" liga o destaque do caminho no diagrama ao caso escolhido (globals.css).
  return (
    <figure className="casos border-b border-linha bg-painel px-4 py-6 md:py-8">
      <RecoveryDiagram text={diagram} alt={text.mediaAlt} />
      <RecoveryCases text={cases} />
    </figure>
  );
}

// Regra 12: da API, só a data do último push.
function RepoFacts({ stats, labels }: { stats: RepoStats; labels: Content["ui"]["repo"] }) {
  return (
    <dl data-testid="repo-stats" className="mt-4 border-t border-linha pt-4 text-sm">
      <dt className="text-secundario">{labels.updated}</dt>
      <dd>{labels.date(stats.pushedAt)}</dd>
    </dl>
  );
}
