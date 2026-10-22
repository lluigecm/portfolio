import type { Content } from "@/types/content";

const number = new Intl.NumberFormat("pt-BR");
const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" });
const month = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });

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
    video: {
      pause: "Pausar vídeo",
      play: "Reproduzir vídeo",
    },
    skipToContent: "Pular para o conteúdo",
    navLabel: "Seções",
    repo: {
      updated: "Atualizado em",
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
    chartCaption: ({ total, personal, work, workPrivate }) => {
      // As privadas só aparecem se a conta de trabalho as mostra no perfil.
      const hidden = workPrivate > 0 ? `, ${number.format(workPrivate)} delas em repositórios privados,` : "";
      return `${number.format(total)} contribuições no GitHub nos últimos 12 meses: ${number.format(work)} na conta de trabalho${hidden} e ${number.format(personal)} na pessoal.`;
    },
    chartMonth: (iso) => month.format(new Date(iso)),
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
        "Testes E2E quebram quando o DOM ou o CSS mudam e o seletor deixa de encontrar o elemento. Este protótipo procura o elemento por similaridade estrutural e atributos estáveis e calcula um score de confiança, ajustado pelo texto do elemento. Acima do limiar, troca o seletor e registra a troca para revisão. Abaixo, o teste falha como falharia sem o mecanismo.",
      mediaAlt:
        "Diagrama da recuperação: quando o seletor não encontra o elemento, heurísticas de atributos estáveis e de similaridade estrutural calculam um score de confiança de 0 a 1, ajustado pelo texto do elemento. Se o score for maior ou igual ao limiar, o seletor é substituído; se não, o teste falha normalmente. Cada tentativa fica registrada em log.",
    },
    mygather: {
      title: "MyGather",
      description:
        "Escritório virtual 2D em pixel art. Quando dois avatares se aproximam, o áudio entre eles liga sozinho. O servidor valida cada movimento, então ninguém entra numa sala fechada sem passar pela porta. Feito para uso real por uma equipe pequena.",
      mediaAlt:
        "Gravação do MyGather: um avatar atravessa o escritório em pixel art até outro, e o áudio entre os dois liga quando eles ficam próximos.",
      credit: "arte: LPC (CC-BY-SA 3.0) e DyLESTorm",
    },
  },
  diagram: {
    selectorFails: ["O seletor não encontra", "o elemento"],
    heuristics: ["Heurísticas: atributos estáveis", "e similaridade estrutural"],
    score: ["Score de confiança (0 a 1),", "ajustado pelo texto do elemento"],
    decision: ["Score ≥", "limiar?"],
    yes: "sim",
    no: "não",
    replaced: ["Seletor", "substituído"],
    fails: ["O teste falha", "normalmente"],
    note: ["Nota: cada tentativa fica", "registrada em log"],
  },
  recoveryCases: {
    legend: "Casos reais do protótipo",
    intro:
      "Da rodada de 12/10/2026, na página de um livro do books.toscrape.com, o site usado nos experimentos. Escolha uma mudança para ver o caminho que o mecanismo seguiu.",
    fields: {
      selector: "Seletor do teste",
      change: "Mudança na página",
      candidate: "Candidato",
      score: "Score",
      outcome: "Resultado",
    },
    logLabel: "Trecho da linha de log desta tentativa",
    logLink: "Ver a linha completa no repositório",
    cases: {
      "price-renamed": {
        label: "Classe do preço renomeada",
        summary:
          "Uma refatoração de CSS renomeia a classe do preço, e o seletor deixa de encontrar o elemento. A estrutura aponta o mesmo parágrafo, na mesma posição, e o texto confere.",
        change: [{ code: '<p class="price_color">' }, " vira ", { code: '<p class="m1-price_color" id="m1-M1-T8">' }],
        candidate: ["o mesmo parágrafo, com o texto ", { code: "£45.17" }],
        score: "1,00: estrutura idêntica e texto igual, acima do limiar provisório de 0,7",
        outcome:
          "Seletor substituído. Os testes passaram nas 96 execuções com essa mudança; sem o mecanismo, falharam todas.",
      },
      "price-removed": {
        label: "Preço removido",
        summary:
          "Agora o preço some de verdade: é um defeito, e o teste precisa falhar. A disponibilidade ocupa a posição do preço, então a estrutura confere, mas o texto não, e o score cai pela metade.",
        change: ["o parágrafo ", { code: '<p class="price_color">' }, " é removido"],
        candidate: [
          "o parágrafo seguinte, ",
          { code: '<p class="instock availability">' },
          ", com o texto ",
          { code: "In stock (19 available)", lang: "en" },
          " no lugar de ",
          { code: "£45.17" },
        ],
        score: "0,50: estrutura idêntica (1,00), reduzida à metade porque o texto não confere; abaixo do limiar provisório de 0,7",
        outcome:
          "Seletor mantido. Os testes falharam nas 96 execuções, como deveriam: o mecanismo não escondeu o defeito.",
      },
      "rating-removed": {
        label: "Estrelas removidas: falso positivo",
        summary:
          "A classificação por estrelas não tem texto: a nota fica só na classe. Sem o elemento, a estrutura aponta o vizinho, e não há texto para conferir. Foi o único falso positivo da rodada, e o repositório o registra como limitação do método.",
        change: ["o parágrafo ", { code: '<p class="star-rating Two">' }, " é removido"],
        candidate: ["o vizinho de cima, ", { code: '<p class="instock availability">' }, ": o elemento errado"],
        score: "0,925: estrutura quase idêntica e nenhum texto para conferir, acima do limiar provisório de 0,7",
        outcome:
          "Seletor substituído pelo elemento errado nas 48 execuções. Os testes falharam mesmo assim, porque a nota lida virou 0, mas a troca é justamente o erro que o mecanismo deveria evitar.",
      },
    },
  },
  stack: [
    { label: "Linguagens", items: ["Python", "TypeScript", "C", "C++"] },
    { label: "Automação e testes", items: ["Playwright", "Robot Framework"] },
    { label: "Web", items: ["Next.js", "Node.js"] },
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
