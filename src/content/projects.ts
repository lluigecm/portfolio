import type { ProjectId } from "@/types/content";

/** Vídeo curto em public/projects/ (regras 17 e 18). */
export interface VideoMedia {
  kind: "video";
  /** WebM primeiro: o Chromium de código aberto não toca H.264. */
  webm: string;
  mp4: string;
  poster: string;
  width: number;
  height: number;
}

/** Diagrama da recuperação, desenhado no site (regra 20). */
export interface DiagramMedia {
  kind: "diagram";
}

/** Trecho literal de um teste da suíte; tests/este-site.spec.ts confere com o arquivo. */
export interface CodeMedia {
  kind: "code";
  file: string;
  excerpt: string;
}

export interface Project {
  id: ProjectId;
  /** Repositório no formato dono/nome. */
  repo: string;
  tags: string[];
  media: VideoMedia | DiagramMedia | CodeMedia;
  /** Execuções do CI, quando o card fala da suíte de testes. */
  ci?: string;
}

// Lista fixa (regra 12). Os textos de cada projeto ficam em pt.ts e en.ts.
export const projects: Project[] = [
  {
    id: "autohealing",
    repo: "lluigecm/autohealing-e2e-tests",
    tags: ["TypeScript", "Playwright", "POM"],
    media: { kind: "diagram" },
  },
  {
    id: "mygather",
    repo: "lluigecm/MyGather",
    tags: ["TypeScript", "Node.js", "Socket.io", "WebRTC", "Canvas"],
    // Convertido de imgs/microfone_simulado.gif, recortado na área do mapa.
    media: {
      kind: "video",
      webm: "/projects/mygather.webm",
      mp4: "/projects/mygather.mp4",
      poster: "/projects/mygather-capa.webp",
      width: 882,
      height: 472,
    },
  },
  {
    id: "portfolio",
    repo: "lluigecm/portfolio",
    tags: ["TypeScript", "Next.js", "Playwright", "axe-core", "GitHub Actions"],
    media: {
      kind: "code",
      file: "tests/api-fora-do-ar.spec.ts",
      excerpt: `test("com a API fora do ar e sem cache, o gráfico não aparece", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("contribution-chart")).toHaveCount(0);
  await expect(page.locator("figcaption#contribution-caption")).toHaveCount(0);
});`,
    },
    ci: "https://github.com/lluigecm/portfolio/actions/workflows/ci.yml",
  },
];
