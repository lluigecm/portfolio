import type { Content } from "@/types/content";

const number = new Intl.NumberFormat("en-US");
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export const en: Content = {
  meta: {
    title: "Luige | Test Automation Developer",
    description:
      "Test automation developer in Brazil. Experience, projects, and live GitHub activity.",
  },
  ui: {
    viewInThisLanguage: "View in English",
    theme: {
      toDark: "Switch to dark theme",
      toLight: "Switch to light theme",
      toggle: "Switch theme",
    },
    video: {
      pause: "Pause video",
      play: "Play video",
    },
    skipToContent: "Skip to content",
    navLabel: "Sections",
    repo: {
      stars: "Stars",
      languages: "Languages",
      updated: "Updated",
      count: (value) => number.format(value),
      date: (iso) => date.format(new Date(iso)),
    },
    nav: {
      experience: "Experience",
      projects: "Projects",
      stack: "Stack",
      education: "Education",
      contact: "Contact",
    },
  },
  hero: {
    name: "Luige",
    title: "Test Automation Developer",
    intro:
      "Automated tests break when the interface changes. At X-Testing, I've been automating tests and processes since 2024. In my undergraduate thesis, I'm researching how those tests can heal themselves.",
    chartCaption: (total) =>
      `${number.format(total)} GitHub contributions over the last 12 months, combining my personal and work accounts.`,
  },
  experience: {
    company: "X-Testing",
    companyDescription:
      "Software quality and testing company based in Salvador, Brazil, providing test and process automation (RPA) services to other companies.",
    roles: [
      {
        title: "Test Automation Developer (Trainee)",
        period: "Apr 2026 to present",
        description:
          "I run test automation projects, from development through maintenance. In an earlier phase of my current project, I integrated the tests with the Microsoft Graph API to validate emails automatically.",
      },
      {
        title: "Test Automation Intern",
        period: "Jul 2024 to Mar 2026",
        description:
          "Optimized existing process automations so they broke less often and needed less maintenance.",
      },
    ],
  },
  projects: {
    autohealing: {
      title: "Auto-Healing for Web UI Tests",
      badge: "Undergraduate thesis, in progress",
      description:
        "E2E tests break when a DOM or CSS change leaves a selector unable to find its element. This prototype searches for the element using structural similarity and stable attributes, then computes a confidence score. Above the threshold, it replaces the selector and logs the change for review. Below it, the test fails just as it would without the mechanism.",
      mediaAlt:
        "Recovery diagram: when the selector can't find the element, heuristics based on stable attributes and structural similarity compute a confidence score from 0 to 1. If the score meets the threshold, the selector is replaced; otherwise, the test fails as usual. Every attempt is logged.",
    },
    mygather: {
      title: "MyGather",
      description:
        "A 2D pixel-art virtual office. When two avatars get close, audio between them turns on by itself. The server validates every move, so nobody gets into a closed room without walking through the door. Built for real use by a small team.",
      mediaAlt:
        "MyGather recording: an avatar walks across the pixel-art office to another one, and audio between them turns on once they are close.",
      credit: "art: LPC (CC-BY-SA 3.0) and DyLESTorm",
    },
  },
  diagram: {
    selectorFails: ["The selector can't", "find the element"],
    heuristics: ["Heuristics: stable attributes", "and structural similarity"],
    score: ["Confidence score (0 to 1)"],
    decision: ["Score ≥", "threshold?"],
    yes: "yes",
    no: "no",
    replaced: ["Selector", "replaced"],
    fails: ["Test fails", "as usual"],
    note: ["Note: every attempt is logged"],
  },
  stack: [
    { label: "Languages", items: ["Python", "TypeScript", "C", "C++"] },
    { label: "Testing and automation", items: ["Playwright", "Robot Framework"] },
    { label: "Parallel computing", items: ["MPI", "OpenMP"] },
  ],
  education: {
    degree: "Bachelor of Science in Computer Science",
    institution: "UESC, State University of Santa Cruz (Bahia, Brazil). Expected completion: 2026.",
    thesis: "Thesis on automatic selector recovery in web UI tests.",
  },
  contact: {
    text: "Want to talk about test automation or one of these projects? Write to me.",
    email: "Send email",
    linkedin: "View LinkedIn profile",
  },
};
