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

export interface Project {
  id: ProjectId;
  /** Repositório no formato dono/nome. */
  repo: string;
  tags: string[];
  media: VideoMedia | DiagramMedia;
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
];
