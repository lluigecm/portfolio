import type { ItemId, ProjectId } from "@/types/content";

/*
 * Dados do modelo que não mudam com o idioma: cartuchos, inventário e status.
 * Os textos traduzidos ficam em pt.ts e en.ts.
 */
export const cartridges: { id: ProjectId; label: string; title: string; href: string; tags: string[] }[] = [
  {
    id: "autohealing",
    label: "CARTRIDGE 01 · TCC",
    title: "Autohealing E2E Tests",
    href: "https://github.com/lluigecm/autohealing-e2e-tests",
    tags: ["Playwright", "TypeScript", "Self-healing", "E2E"],
  },
  {
    id: "mygather",
    label: "CARTRIDGE 02",
    title: "MyGather",
    href: "https://github.com/lluigecm/MyGather",
    tags: ["WebRTC", "Realtime", "Canvas", "Node"],
  },
];

/** Casas do inventário; `lines` quebra o nome em linhas, `main` tem borda amarela. */
export const inventory: { id: ItemId; lines: string[]; count: number; main?: boolean }[] = [
  { id: "playwright", lines: ["Playwright"], count: 99, main: true },
  { id: "typescript", lines: ["TypeScript"], count: 99, main: true },
  { id: "python", lines: ["Python"], count: 99, main: true },
  { id: "robot", lines: ["Robot", "Framework"], count: 88, main: true },
  { id: "java", lines: ["Java"], count: 60 },
  { id: "c", lines: ["C / C++"], count: 55 },
  { id: "next", lines: ["Next.js"], count: 50 },
  { id: "mpi", lines: ["MPI", "OpenMP"], count: 45 },
  { id: "git", lines: ["Git"], count: 80 },
  { id: "cicd", lines: ["CI/CD"], count: 60 },
];

/** Barras de status da fase "Sobre", de 0 a 100. */
export const stats = { automation: 92, playwright: 88, rpa: 85 };
