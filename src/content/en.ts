import type { Content } from "@/types/content";

const number = new Intl.NumberFormat("en-US");
const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const shortMonth = (iso: string) => month.format(new Date(iso)).toUpperCase();

export const en: Content = {
  meta: {
    title: "Luige · Test automation and RPA",
    description: "Test automation and RPA. I hunt bugs before they reach the final player. I mean, the user.",
  },
  ui: {
    skipToContent: "Skip to content",
    theme: { toggle: "Day or night", toDay: "Switch to day mode", toNight: "Switch to night mode" },
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
      after: " before they reach the final player. I mean, the user.",
    },
    start: "PRESS TO START",
    startFala: "LET'S PLAY!",
    hint: "Scroll to make the bot move forward.",
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
      "I'm Lucas Luige, but everyone just calls me Luige. I study Computer Science at UESC and work with automation: E2E testing with Playwright and TypeScript, RPA with Python and Robot Framework.",
      "My thesis is about tests that fix themselves when the UI changes. I like software that can take a hit.",
    ],
    hp: "Bahia, BR",
    automation: "Automation",
    coffee: "Café",
    statsFala: "COFFEE AT MAX LEVEL.",
  },
  chart: {
    title: "GitHub XP",
    caption: ({ total, personal, work, workPrivate }) => {
      // As privadas só aparecem se a conta de trabalho as mostra no perfil.
      const hidden = workPrivate > 0 ? `, ${number.format(workPrivate)} of them in private repositories,` : "";
      return `${number.format(total)} GitHub contributions over the last 12 months: ${number.format(work)} on my work account${hidden} and ${number.format(personal)} on my personal one.`;
    },
    month: (iso) => month.format(new Date(iso)),
    day: (iso, count) => {
      const day = `${shortMonth(iso)} ${Number(iso.slice(8))}`;
      if (count === 0) return `${day}: REST DAY.`;
      return `${day}: ${number.format(count)} ${count === 1 ? "CONTRIBUTION" : "CONTRIBUTIONS"}`;
    },
  },
  experience: {
    title: "Experience",
    roles: [
      {
        title: "Trainee · X-Testing",
        when: "Apr 2026 to now · current checkpoint",
        now: true,
        fala: "GAME SAVED HERE.",
        bullets: [
          "Run automation projects end to end, from planning to reporting.",
          "E2E suites in Playwright/TypeScript with Page Object Model architecture.",
          "RPA bots in Python and Robot Framework for repetitive processes.",
        ],
      },
      {
        title: "Test automation intern · X-Testing",
        when: "Jul 2024 to Mar 2026",
        fala: "WHERE IT ALL STARTED.",
        bullets: [
          "First professional automation work: Playwright, Robot Framework and test pipelines.",
          "Grew from small tasks to working on key projects.",
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
    falas: {
      autohealing: "THIS ONE FIXES ITSELF.",
      mygather: "GET CLOSE TO TALK.",
    },
    go: "▶ View on GitHub",
  },
  stack: {
    title: "Inventory",
    hint: "Pick an item to see its details.",
    selected: "Equipped item",
    items: {
      playwright: { category: "Testing", description: "Main weapon. E2E suites at work and the thesis prototype." },
      typescript: { category: "Language", description: "The language of my E2E suites, my thesis and this site." },
      python: { category: "Language", description: "RPA bots for repetitive processes." },
      robot: { category: "RPA", description: "Keyword-driven tests and bots, since my internship." },
      java: { category: "Language", description: "A language from my degree at UESC." },
      c: { category: "Language", description: "The base of my parallel computing work at UESC." },
      next: { category: "Framework", description: "This very site is built with it." },
      mpi: { category: "Parallelism", description: "Parallel computing, the focus of my degree." },
      git: { category: "Tool", description: "Version control on every project." },
      cicd: { category: "Tool", description: "Test pipelines running on every push." },
    },
  },
  education: {
    title: "Education",
    degree: "B.Sc. in Computer Science",
    when: "UESC, Universidade Estadual de Santa Cruz · expected graduation: end of 2026",
    description:
      "Focus on parallel computing (MPI/OpenMP) and software engineering. Thesis on self-healing automated tests.",
    fala: "THESIS IN THE OVEN.",
  },
  contact: {
    title: "CONTINUE? ▶ YES",
    text: "No PDF resume, no form. If you want to talk automation, testing or a project, this is the door.",
    foot: "Built with Next.js · live GitHub data",
    linkedinFala: "LET'S CONNECT!",
    emailFala: "SAY HI!",
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
