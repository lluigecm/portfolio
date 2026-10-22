import type { Content } from "@/types/content";

export const en: Content = {
  meta: {
    title: "Luige — Test automation & RPA",
    description: "Test automation and RPA. I hunt bugs before they reach the final player — I mean, the user.",
  },
  ui: {
    skipToContent: "Skip to content",
  },
  hud: {
    lvl: "LVL: TRAINEE @ X-TESTING",
    score: "BUGS CAUGHT",
  },
  hero: {
    name: "Luige",
    tag: {
      before: "Test automation and RPA. I hunt ",
      bold: "bugs",
      after: " before they reach the final player — I mean, the user.",
    },
    start: "▶ PRESS START",
    hint: "Scroll to make the bot walk. Each section is a level.",
  },
  map: {
    title: "Level select",
    nodes: {
      sobre: { name: "About", meta: "who's playing" },
      exp: { name: "Experience", meta: "X-Testing" },
      proj: { name: "Projects", meta: "2 cartridges" },
      stack: { name: "Stack", meta: "inventory" },
      edu: { name: "Education", meta: "UESC" },
      contato: { name: "Contact", meta: "final stage" },
    },
  },
  about: {
    title: "About",
    paragraphs: [
      "I'm Lucas Luige — everyone just calls me Luige. I study Computer Science at UESC and work with automation: E2E testing with Playwright and TypeScript, RPA with Python and Robot Framework.",
      "My thesis is about tests that fix themselves when the UI changes. I like software that can take a hit.",
    ],
    hp: "Bahia, BR",
    automation: "Automation",
    coffee: "Café",
  },
  experience: {
    title: "Experience",
    roles: [
      {
        title: "Trainee · X-Testing",
        when: "Apr 2026 — now · current checkpoint",
        now: true,
        bullets: [
          "Run automation projects end to end, from planning to reporting.",
          "E2E suites in Playwright/TypeScript with Page Object Model architecture.",
          "RPA bots in Python and Robot Framework for repetitive processes.",
        ],
      },
      {
        title: "Test automation intern · X-Testing",
        when: "Jul 2024 — Mar 2026",
        bullets: [
          "First professional automation work: Playwright, Robot Framework and test pipelines.",
          "Grew from small tasks to owning whole projects.",
        ],
      },
    ],
  },
  projects: {
    title: "Projects",
    descriptions: {
      autohealing:
        "Self-healing mechanism for web UI tests: when a selector breaks, the test relocates the element instead of failing.",
      mygather:
        "2D virtual office built from scratch: walk your character around and audio/video turn on by proximity, like a real room.",
    },
    go: "▶ View on GitHub",
  },
  stack: {
    title: "Inventory",
  },
  education: {
    title: "Education",
    degree: "B.Sc. in Computer Science",
    when: "UESC — Universidade Estadual de Santa Cruz · expected graduation: end of 2026",
    description:
      "Focus on parallel computing (MPI/OpenMP) and software engineering. Thesis on self-healing automated tests.",
  },
  contact: {
    title: "CONTINUE? ▶ YES",
    text: "No PDF resume, no form. If you want to talk automation, testing or a project, this is the door.",
    foot: "Built with Next.js · live GitHub data",
  },
  bubble: {
    sobre: "THAT'S HIM. LUIGE.",
    exp: "CURRENT CHECKPOINT: TRAINEE.",
    proj: "TWO CARTRIDGES ON GITHUB.",
    stack: "INVENTORY IS FULL.",
    edu: "ALMOST GRADUATED.",
    contato: "GO ON, SAY HI.",
  },
};
