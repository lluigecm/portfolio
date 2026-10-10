import type { Content } from "@/types/content";

const number = new Intl.NumberFormat("pt-BR");
const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" });

export const pt: Content = {
  meta: {
    title: "Luige | Desenvolvedor de Automação de Testes",
    description:
      "Desenvolvedor de automação de testes no Brasil. Experiência, projetos e atividade no GitHub.",
  },
  ui: {
    viewInThisLanguage: "Ver em português",
    theme: {
      toDark: "Ativar tema escuro",
      toLight: "Ativar tema claro",
      toggle: "Trocar tema",
    },
    skipToContent: "Pular para o conteúdo",
    navLabel: "Seções",
    repo: {
      stars: "Estrelas",
      languages: "Linguagens",
      updated: "Atualizado em",
      count: (value) => number.format(value),
      date: (iso) => date.format(new Date(iso)),
    },
    nav: {
      experience: "Experiência",
      projects: "Projetos",
      stack: "Stack",
      education: "Formação",
      contact: "Contato",
    },
  },
  hero: {
    name: "Luige",
    title: "Desenvolvedor de Automação de Testes",
    intro:
      "Testes automatizados quebram quando a interface muda. Na X-Testing, automatizo testes e processos desde 2024. No TCC, pesquiso como esses testes podem se recuperar sozinhos.",
    chartCaption: (total) =>
      `${number.format(total)} contribuições no GitHub nos últimos 12 meses, somando a conta pessoal e a de trabalho.`,
  },
  experience: {
    company: "X-Testing",
    companyDescription:
      "Empresa de qualidade e teste de software de Salvador, que presta serviços de automação de testes e de processos (RPA) para outras empresas.",
    roles: [
      {
        title: "Desenvolvedor de Automação de Testes (Trainee)",
        period: "abr/2026 até hoje",
        description:
          "Conduzo projetos de automação de testes, do desenvolvimento à manutenção. Em uma fase anterior do projeto atual, integrei os testes à Microsoft Graph API para validar e-mails automaticamente.",
      },
      {
        title: "Estagiário em Automação de Testes",
        period: "jul/2024 a mar/2026",
        description:
          "Otimizei automações de processos existentes para que quebrassem menos e exigissem menos manutenção.",
      },
    ],
  },
  projects: {
    autohealing: {
      title: "Auto-Healing em Testes de Interface Web",
      badge: "TCC, em andamento",
      description:
        "Testes E2E quebram quando o DOM ou o CSS mudam e o seletor deixa de encontrar o elemento. Este protótipo procura o elemento por similaridade estrutural e atributos estáveis e calcula um score de confiança. Acima do limiar, troca o seletor e registra a troca para revisão. Abaixo, o teste falha como falharia sem o mecanismo.",
    },
    mygather: {
      title: "MyGather",
      description:
        "Escritório virtual 2D em pixel art. Quando dois avatares se aproximam, o áudio entre eles liga sozinho. O servidor valida cada movimento, então ninguém entra numa sala fechada sem passar pela porta. Feito para uso real por uma equipe pequena.",
    },
  },
  stack: [
    { label: "Linguagens", items: ["Python", "TypeScript", "C", "C++"] },
    { label: "Automação e testes", items: ["Playwright", "Robot Framework"] },
    { label: "Computação paralela", items: ["MPI", "OpenMP"] },
  ],
  education: {
    degree: "Bacharelado em Ciência da Computação",
    institution:
      "UESC, Universidade Estadual de Santa Cruz (Bahia). Conclusão prevista para 2026.",
    thesis: "TCC sobre recuperação automática de seletores em testes de interface web.",
  },
  contact: {
    text: "Quer conversar sobre automação de testes ou sobre algum dos projetos? Me escreva.",
    email: "Enviar e-mail",
    linkedin: "Ver perfil no LinkedIn",
  },
};
