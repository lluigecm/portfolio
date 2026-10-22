import type { ProjectId } from "@/types/content";

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
export const inventory: { lines: string[]; count: number; main?: boolean }[] = [
  { lines: ["Playwright"], count: 99, main: true },
  { lines: ["TypeScript"], count: 99, main: true },
  { lines: ["Python"], count: 99, main: true },
  { lines: ["Robot", "Framework"], count: 88, main: true },
  { lines: ["Java"], count: 60 },
  { lines: ["C / C++"], count: 55 },
  { lines: ["Next.js"], count: 50 },
  { lines: ["MPI", "OpenMP"], count: 45 },
  { lines: ["Git"], count: 80 },
  { lines: ["CI/CD"], count: 60 },
];

/** Barras de status da fase "Sobre", de 0 a 100. */
export const stats = { automation: 92, playwright: 88, rpa: 85 };
