import type { Content } from "@/types/content";

const number = new Intl.NumberFormat("en-US");
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

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
      updated: "Updated",
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
    chartCaption: ({ total, personal, work, workPrivate }) => {
      // As privadas só aparecem se a conta de trabalho as mostra no perfil.
      const hidden = workPrivate > 0 ? `, ${number.format(workPrivate)} of them in private repositories,` : "";
      return `${number.format(total)} GitHub contributions over the last 12 months: ${number.format(work)} on my work account${hidden} and ${number.format(personal)} on my personal one.`;
    },
    chartMonth: (iso) => month.format(new Date(iso)),
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
          "I optimized existing process automations so they broke less often and needed less maintenance.",
      },
    ],
  },
  projects: {
    autohealing: {
      title: "Auto-Healing for Web UI Tests",
      badge: "Undergraduate thesis, in progress",
      description:
        "E2E tests break when a DOM or CSS change leaves a selector unable to find its element. This prototype searches for the element using structural similarity and stable attributes, then computes a confidence score, adjusted by the element's text. Above the threshold, it replaces the selector and logs the change for review. Below it, the test fails just as it would without the mechanism.",
      mediaAlt:
        "Recovery diagram: when the selector can't find the element, heuristics based on stable attributes and structural similarity compute a confidence score from 0 to 1, adjusted by the element's text. If the score meets the threshold, the selector is replaced; otherwise, the test fails as usual. Every attempt is logged.",
    },
    mygather: {
      title: "MyGather",
      description:
        "A 2D pixel-art virtual office. When two avatars get close, audio between them turns on by itself. The server validates every move, so nobody gets into a closed room without walking through the door. Built for real use by a small team.",
      mediaAlt:
        "MyGather recording: an avatar walks across the pixel-art office to another one, and audio between them turns on once they are close.",
      credit: "art: LPC (CC-BY-SA 3.0) and DyLESTorm",
    },
    portfolio: {
      title: "This site",
      description:
        "This portfolio is a testing project too. An end-to-end Playwright suite runs on every push in Chromium and in WebKit, Safari's engine, emulating an iPhone, against production builds and a fake GitHub API. Nothing reaches main unless it passes. Among other things, it proves that:",
      proofs: [
        {
          text: "with the GitHub API down, the page stays up: the cards keep only their own text and the chart is hidden",
          file: "tests/api-fora-do-ar.spec.ts",
        },
        {
          text: "if a data refresh fails, the last valid data stays online and updates on its own once the API is back",
          file: "tests/renovacao.spec.ts",
        },
        {
          text: "the GitHub token never shows up in any file sent to the browser",
          file: "tests/github.spec.ts",
        },
        {
          text: "axe finds no WCAG A or AA violations, in both themes, in Portuguese and in English",
          file: "tests/a11y.ts",
        },
      ],
      ciLabel: "See the runs on GitHub Actions",
      mediaAlt: "One of the suite's tests, copied from",
    },
  },
  diagram: {
    selectorFails: ["The selector can't", "find the element"],
    heuristics: ["Heuristics: stable attributes", "and structural similarity"],
    score: ["Confidence score (0 to 1),", "adjusted by the element's text"],
    decision: ["Score ≥", "threshold?"],
    yes: "yes",
    no: "no",
    replaced: ["Selector", "replaced"],
    fails: ["Test fails", "as usual"],
    note: ["Note: every attempt is logged"],
  },
  recoveryCases: {
    legend: "Real cases from the prototype",
    intro:
      "From the Oct 12, 2026 run, on a book page at books.toscrape.com, the site used in the experiments. Pick a change to see the path the mechanism took.",
    fields: {
      selector: "Test selector",
      change: "Page change",
      candidate: "Candidate",
      score: "Score",
      outcome: "Outcome",
    },
    logLabel: "Excerpt of this attempt's log line",
    logLink: "See the full line in the repository",
    cases: {
      "price-renamed": {
        label: "Price class renamed",
        summary:
          "A CSS refactor renames the price's class, and the selector can no longer find the element. The structure points to the same paragraph, in the same position, and the text matches.",
        change: [{ code: '<p class="price_color">' }, " becomes ", { code: '<p class="m1-price_color" id="m1-M1-T8">' }],
        candidate: ["the same paragraph, with the text ", { code: "£45.17" }],
        score: "1.00: identical structure and matching text, above the provisional threshold of 0.7",
        outcome:
          "Selector replaced. The tests passed in all 96 runs with this change; without the mechanism, every one failed.",
      },
      "price-removed": {
        label: "Price removed",
        summary:
          "Now the price is really gone: that's a defect, and the test has to fail. The availability line takes the price's position, so the structure matches, but the text doesn't, and the score is cut in half.",
        change: ["the ", { code: '<p class="price_color">' }, " paragraph is removed"],
        candidate: [
          "the next paragraph, ",
          { code: '<p class="instock availability">' },
          ", with the text ",
          { code: "In stock (19 available)" },
          " instead of ",
          { code: "£45.17" },
        ],
        score: "0.50: identical structure (1.00), halved because the text doesn't match; below the provisional threshold of 0.7",
        outcome:
          "Selector kept. The tests failed in all 96 runs, as they should: the mechanism didn't hide the defect.",
      },
      "rating-removed": {
        label: "Star rating removed: false positive",
        summary:
          "The star rating has no text: the rating lives only in the class. With the element gone, the structure points to its neighbor, and there's no text to check. It was the run's only false positive, and the repository records it as a limitation of the method.",
        change: ["the ", { code: '<p class="star-rating Two">' }, " paragraph is removed"],
        candidate: ["the neighbor above it, ", { code: '<p class="instock availability">' }, ": the wrong element"],
        score: "0.925: nearly identical structure and no text to check, above the provisional threshold of 0.7",
        outcome:
          "Selector replaced with the wrong element in all 48 runs. The tests failed anyway, because the rating they read became 0, but the swap is exactly the mistake the mechanism should avoid.",
      },
    },
  },
  stack: [
    { label: "Languages", items: ["Python", "TypeScript", "C", "C++"] },
    { label: "Testing and automation", items: ["Playwright", "Robot Framework"] },
    { label: "Web", items: ["Next.js", "Node.js"] },
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
