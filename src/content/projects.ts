import type { ProjectId } from "@/types/content";

export interface Project {
  id: ProjectId;
  /** Repositório no formato dono/nome. */
  repo: string;
  tags: string[];
}

// Lista fixa (regra 12). Os textos de cada projeto ficam em pt.ts e en.ts.
export const projects: Project[] = [
  {
    id: "autohealing",
    repo: "lluigecm/autohealing-e2e-tests",
    tags: ["TypeScript", "Playwright", "POM"],
  },
  {
    id: "mygather",
    repo: "lluigecm/MyGather",
    tags: ["TypeScript", "Node.js", "Socket.io", "WebRTC", "Canvas"],
  },
];
