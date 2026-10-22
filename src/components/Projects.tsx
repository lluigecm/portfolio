import { projects, type Project } from "@/content/projects";
import { getRepoStats } from "@/lib/github";
import type { Content, ProjectText, TestProof } from "@/types/content";
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
        const { title, badge, description, proofs, ciLabel } = text[project.id];
        // min-w-0: o trecho de código rola dentro do card, sem alargar a página.
        return (
          <li
            key={project.id}
            data-project={project.id}
            className="min-w-0 overflow-hidden rounded-md border border-linha bg-superficie"
          >
            <Media project={project} text={text[project.id]} diagram={diagram} cases={cases} ui={ui} />
            <div className="p-5 md:p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              {badge && <p className="mt-1 text-sm text-ambar">{badge}</p>}
              <p className="mt-3">{description}</p>
              {proofs && <Proofs proofs={proofs} repo={project.repo} />}
              {project.ci && ciLabel && (
                <a
                  href={project.ci}
                  className="mt-4 inline-block text-sm underline decoration-linha underline-offset-4 hover:decoration-grafite"
                >
                  {ciLabel}
                </a>
              )}
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
  cases: Content["recoveryCases"];
  ui: Content["ui"];
}

function Media({ project, text, diagram, cases, ui }: MediaProps) {
  if (project.media.kind === "video") {
    return (
      <ProjectVideo media={project.media} alt={text.mediaAlt} credit={text.credit} labels={ui.video} />
    );
  }
  if (project.media.kind === "code") {
    const { file, excerpt } = project.media;
    const captionId = `${project.id}-code-caption`;
    // O código não quebra linha: no celular, rola dentro do próprio espaço, pelo
    // dedo ou pelo teclado, como o gráfico. O nome do teste está em português nos
    // dois idiomas, como no arquivo.
    return (
      <figure className="border-b border-linha bg-papel px-4 py-6 md:py-8">
        <pre
          lang="pt-BR"
          role="region"
          tabIndex={0}
          aria-labelledby={captionId}
          className="overflow-x-auto rounded-md border border-linha bg-superficie p-3 font-sans text-xs"
        >
          <code className="font-mono">{excerpt}</code>
        </pre>
        {/* Sem link: o mesmo arquivo já tem link na lista do que os testes provam. */}
        <figcaption id={captionId} className="mt-3 text-sm text-lapis">
          {text.mediaAlt} <code className="font-mono">{file}</code>
        </figcaption>
      </figure>
    );
  }
  // "casos" liga o destaque do caminho no diagrama ao caso escolhido (globals.css).
  return (
    <figure className="casos border-b border-linha bg-papel px-4 py-6 md:py-8">
      <RecoveryDiagram text={diagram} alt={text.mediaAlt} />
      <RecoveryCases text={cases} />
    </figure>
  );
}

const blobUrl = (repo: string, file: string) => `https://github.com/${repo}/blob/main/${file}`;

// O que os testes deste site provam, cada item com o arquivo do teste.
function Proofs({ proofs, repo }: { proofs: TestProof[]; repo: string }) {
  return (
    <ul className="mt-3 space-y-3">
      {proofs.map(({ text, file }) => (
        <li key={file} className="flex flex-col border-l-2 border-linha pl-3">
          <span>{text}</span>
          <a
            href={blobUrl(repo, file)}
            className="self-start text-sm underline decoration-linha underline-offset-4 hover:decoration-grafite"
          >
            <code className="font-mono">{file}</code>
          </a>
        </li>
      ))}
    </ul>
  );
}

// Regra 12: da API, só a data do último push.
function RepoFacts({ stats, labels }: { stats: RepoStats; labels: Content["ui"]["repo"] }) {
  return (
    <dl data-testid="repo-stats" className="mt-4 border-t border-linha pt-4 text-sm">
      <dt className="text-lapis">{labels.updated}</dt>
      <dd>{labels.date(stats.pushedAt)}</dd>
    </dl>
  );
}
