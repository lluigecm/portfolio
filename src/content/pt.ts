import type { Content } from "@/types/content";

export const pt: Content = {
  meta: {
    title: "Luige — Automação de testes & RPA",
    description:
      "Automação de testes e RPA. Eu caço bugs antes que eles cheguem ao jogador final — quer dizer, ao usuário.",
  },
  ui: {
    skipToContent: "Pular para o conteúdo",
  },
  hud: {
    lvl: "LVL: TRAINEE @ X-TESTING",
    score: "BUGS CAÇADOS",
  },
  hero: {
    name: "Luige",
    tag: {
      before: "Automação de testes e RPA. Eu caço ",
      bold: "bugs",
      after: " antes que eles cheguem ao jogador final — quer dizer, ao usuário.",
    },
    start: "▶ PRESS START",
    hint: "Role a página pra fazer o bot andar. Cada seção é uma fase.",
  },
  map: {
    title: "Seleção de fase",
    nodes: {
      sobre: { name: "Sobre", meta: "quem é o jogador" },
      exp: { name: "Experiência", meta: "X-Testing" },
      proj: { name: "Projetos", meta: "2 cartuchos" },
      stack: { name: "Stack", meta: "inventário" },
      edu: { name: "Formação", meta: "UESC" },
      contato: { name: "Contato", meta: "fase final" },
    },
  },
  about: {
    title: "Sobre",
    paragraphs: [
      "Sou Lucas Luige, mas todo mundo me chama de Luige. Estudo Ciência da Computação na UESC e trabalho com automação: testes E2E com Playwright e TypeScript, RPA com Python e Robot Framework.",
      "Meu TCC é sobre testes que se consertam sozinhos quando a interface muda. Gosto de software que aguenta pancada.",
    ],
    hp: "Bahia, BR",
    automation: "Automação",
    coffee: "Café",
  },
  experience: {
    title: "Experiência",
    roles: [
      {
        title: "Trainee · X-Testing",
        when: "abr 2026 — hoje · checkpoint atual",
        now: true,
        bullets: [
          "Conduzo projetos de automação de ponta a ponta, do planejamento ao relatório.",
          "Suítes E2E em Playwright/TypeScript com arquitetura Page Object Model.",
          "Robôs RPA em Python e Robot Framework pra processos repetitivos.",
        ],
      },
      {
        title: "Estagiário de automação de testes · X-Testing",
        when: "jul 2024 — mar 2026",
        bullets: [
          "Primeiro contato com automação profissional: Playwright, Robot Framework e pipelines de teste.",
          "Evoluí de tarefas pontuais até assumir projetos inteiros.",
        ],
      },
    ],
  },
  projects: {
    title: "Projetos",
    descriptions: {
      autohealing:
        "Mecanismo de self-healing para testes de interface web: quando um seletor quebra, o teste encontra o elemento de novo em vez de falhar.",
      mygather:
        "Escritório virtual 2D feito do zero: você anda com o personagem e o áudio e vídeo ligam por proximidade, como numa sala de verdade.",
    },
    go: "▶ Ver no GitHub",
  },
  stack: {
    title: "Inventário",
  },
  education: {
    title: "Formação",
    degree: "Bacharelado em Ciência da Computação",
    when: "UESC — Universidade Estadual de Santa Cruz · conclusão prevista: fim de 2026",
    description:
      "Ênfase em computação paralela (MPI/OpenMP) e engenharia de software. TCC em self-healing de testes automatizados.",
  },
  contact: {
    title: "CONTINUE? ▶ SIM",
    text: "Sem currículo em PDF, sem formulário. Se quiser conversar sobre automação, testes ou um projeto, é por aqui.",
    foot: "Feito em Next.js · dados do GitHub ao vivo",
  },
  bubble: {
    sobre: "É ESSE AQUI, O LUIGE.",
    exp: "CHECKPOINT ATUAL: TRAINEE.",
    proj: "DOIS CARTUCHOS NO GITHUB.",
    stack: "INVENTÁRIO CHEIO.",
    edu: "FALTA POUCO PRO DIPLOMA.",
    contato: "VAI LÁ, MANDA UM OI.",
  },
};
