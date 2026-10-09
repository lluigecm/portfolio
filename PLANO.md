# Portfólio — Plano de Implementação

> Baseado na especificação aprovada em `PROJETO.md` (09/10/2026).
> Status: **aprovado em 09/10/2026** · execução no chat de desenvolvimento (claude.ai)

## Como usar este plano

- Cada etapa é pequena, entrega algo verificável e termina com os critérios de aceite cumpridos.
- **Uma etapa por vez, na ordem.** Uma etapa só começa quando a anterior foi aceita.
- Cada etapa é feita numa branch própria e entra na `main` por pull request, **com o CI verde**.
- Os testes nascem junto com a funcionalidade: cada etapa inclui os testes E2E que provam os seus critérios de aceite.
- Ao concluir uma etapa, o status volta para o chat de gerenciamento.
- Se algo exigir mudar escopo, arquitetura ou design, o desenvolvimento para e a mudança passa pelo gerenciamento antes.

## Visão geral

| # | Etapa | Depende de |
|---|---|---|
| 0 | Pré-requisitos (Luige) | — |
| 1 | Setup e deploy inicial | 0 |
| 2 | Base de testes e CI | 1 |
| 3 | Tokens de design e tipografia | 2 |
| 4 | Tema claro/escuro | 3 |
| 5 | Idioma PT/EN | 3 |
| 6 | Layout e seções estáticas | 4, 5 |
| 7 | Integração com o GitHub: cards | 6 |
| 8 | Mídia dos projetos | 7 |
| 9 | Gráfico de contribuições | 7 |
| 10 | SEO e prévia de link | 6 |
| 11 | Auditoria e polimento | 8, 9, 10 |
| 12 | Publicação | 11 |

---

## Etapa 0 — Pré-requisitos (Luige)

**Antes da etapa 1:**
- [ ] Criar token pessoal do GitHub (fine-grained, somente leitura de dados públicos).
- [ ] Ativar a exibição de contribuições privadas no perfil das duas contas.

**Antes da etapa 6:** endereço de e-mail e URL do LinkedIn.
**Antes da etapa 8:** diagrama do TCC exportado como imagem.
**Antes da etapa 12:** domínio comprado.

---

## Etapa 1 — Setup e deploy inicial

**Objetivo:** projeto criado, versionado e publicado desde o primeiro dia.

**Entregas**
- Projeto Next.js com TypeScript, Tailwind, ESLint, App Router e diretório `src/`.
- Estrutura de pastas da especificação (seção 4.7).
- `.gitignore` cobrindo `.env*`.
- Repositório público no GitHub, com `PROJETO.md` e `PLANO.md` na raiz.
- Projeto conectado à Vercel, com deploy automático a partir da `main`.
- Variáveis de ambiente cadastradas na Vercel (`GITHUB_TOKEN`, `GITHUB_PERSONAL_USER`, `GITHUB_WORK_USER`).

**Critérios de aceite**
- [ ] O endereço `.vercel.app` abre a página inicial.
- [ ] Nenhum arquivo `.env` aparece no repositório nem no histórico.
- [ ] `npm run build` e `npm run lint` passam sem erros.

---

## Etapa 2 — Base de testes e CI

**Objetivo:** a rede de segurança existe antes da primeira funcionalidade.

**Entregas**
- Playwright configurado, com a verificação de acessibilidade (axe) integrada.
- Um teste inicial: a página carrega e não tem violações de acessibilidade.
- Workflow do GitHub Actions que roda lint, build e testes E2E a cada push e pull request.
- Proteção da `main`: merge só com o CI verde.

**Critérios de aceite**
- [ ] O CI roda e fica verde num pull request de teste.
- [ ] Um teste quebrado de propósito deixa o CI vermelho e bloqueia o merge.

---

## Etapa 3 — Tokens de design e tipografia

**Objetivo:** a fundação visual da especificação (seção 5) aplicada uma única vez, para todo o site usar.

**Entregas**
- Tokens de cor claro/escuro (seção 5.2) como variáveis CSS, expostos no Tailwind.
- Escala de âmbar de 5 níveis para o gráfico.
- IBM Plex Sans e IBM Plex Mono carregadas pelo `next/font`.
- Escala tipográfica: corpo 18px, nome 48px, coluna de até 70 caracteres.

**Critérios de aceite**
- [ ] Nenhuma cor escrita direto nos componentes; tudo vem dos tokens.
- [ ] As fontes carregam sem deslocamento de layout visível.
- [ ] A verificação de acessibilidade não acusa problemas de contraste.

---

## Etapa 4 — Tema claro/escuro

**Objetivo:** regras 15 e 16 da especificação.

**Entregas**
- O tema segue o sistema na primeira visita.
- Botão de troca, acessível por teclado e com rótulo para leitores de tela.
- Escolha manual salva no navegador.
- Tema aplicado antes da primeira renderização.
- Transição discreta na troca, desativada com `prefers-reduced-motion`.

**Critérios de aceite**
- [ ] Teste E2E: alternar o tema, recarregar e o tema escolhido continua.
- [ ] Teste E2E: com o sistema em modo escuro e nenhuma escolha salva, a página abre escura.
- [ ] Verificação manual: recarregar no tema escuro não mostra nenhum instante de tela clara.

---

## Etapa 5 — Idioma PT/EN

**Objetivo:** regras 7 a 11 da especificação.

**Entregas**
- Todos os textos da seção 6 em `src/content/`, em PT e EN, com a mesma estrutura.
- Idioma detectado no servidor pelo navegador do visitante (`Accept-Language`), com fallback EN.
- Escolha manual salva num cookie de preferência, para o servidor já entregar a página no idioma certo (sem trocar o texto depois que a página aparece). É um cookie funcional, não de rastreamento.
- Botão de troca de idioma, acessível por teclado.
- Atributo `lang` da página atualizado com o idioma.

**Critérios de aceite**
- [ ] Teste E2E: navegador em português abre em PT.
- [ ] Teste E2E: navegador em outro idioma (ex.: alemão) abre em EN.
- [ ] Teste E2E: trocar para o outro idioma, recarregar e a escolha continua.
- [ ] Teste E2E: o atributo `lang` acompanha a troca.

---

## Etapa 6 — Layout e seções estáticas

**Objetivo:** a página completa com todo o conteúdo que não depende do GitHub.

**Entregas**
- Cabeçalho da seção 5.4: nome, links das seções, botões de idioma e tema, link para o GitHub. Comportamento no celular.
- Seções Sobre (sem o gráfico ainda), Experiência (linha do tempo), Stack, Formação e Contato, com os textos aprovados.
- Contato com e-mail em `mailto:` e link do LinkedIn.
- Responsivo do celular ao desktop.

**Critérios de aceite**
- [ ] Teste E2E: todas as seções estão presentes, nos dois idiomas.
- [ ] Teste E2E: os links do cabeçalho levam às seções certas.
- [ ] Navegação completa por teclado, com foco sempre visível.
- [ ] Revisão visual contra os princípios de design (seção 5.1): sem numeração, sem mono decorativa, sem animações de entrada.

---

## Etapa 7 — Integração com o GitHub: cards

**Objetivo:** regras 1 a 6, 12 e 14 da especificação, para os cards de projeto.

**Entregas**
- `src/lib/github.ts` com a busca dos dados dos repositórios, no servidor, com revalidação de 1 hora.
- Tipos em `src/types/`.
- Lista fixa dos dois projetos em `src/content/`.
- Cards com textos próprios, tags, link do repositório (`lluigecm/...` em IBM Plex Mono) e os dados da API (estrelas, linguagens, última atualização).
- **URL base da API configurável por variável de ambiente** (`GITHUB_API_URL`). Motivo: as chamadas acontecem no servidor, então o Playwright não consegue interceptá-las pelo navegador. Para testar a falha, o teste aponta essa variável para um endereço que falha.

**Critérios de aceite**
- [ ] Os cards mostram os dados reais dos dois repositórios.
- [ ] Teste E2E: com a API falhando, os cards aparecem só com os textos próprios e a página não quebra.
- [ ] O token não aparece em nenhum arquivo entregue ao navegador.

---

## Etapa 8 — Mídia dos projetos

**Objetivo:** regras 17 a 20 da especificação.

**Entregas**
- GIF do MyGather convertido em vídeo leve (MP4/WebM), com imagem de capa e botão de pausa.
- Crédito da arte no card do MyGather.
- Diagrama do TCC sobre painel claro nos dois temas.
- Textos alternativos em PT e EN.

**Critérios de aceite**
- [ ] O vídeo pode ser pausado pelo teclado.
- [ ] Com `prefers-reduced-motion`, o vídeo não toca sozinho.
- [ ] O diagrama do TCC fica legível no tema escuro.
- [ ] A mídia carrega de `public/`, sem chamadas a outros sites.

---

## Etapa 9 — Gráfico de contribuições

**Objetivo:** a peça marcante do site (princípio 5.1.1), com as regras 13 e 14.

**Entregas**
- Busca via GraphQL do calendário de contribuições das duas contas, somado dia a dia, últimos 12 meses.
- Gráfico em largura total abaixo da apresentação, na escala de âmbar, com a legenda aprovada.
- Alternativa textual para leitores de tela (ex.: total de contribuições no período).
- Regras de falha: mantém os últimos dados válidos; sem dados válidos ou com uma conta falhando, o gráfico é ocultado.
- **No celular:** o gráfico rola na horizontal dentro do próprio espaço, começando pelos meses mais recentes. Assim ele mostra sempre os 12 meses da legenda, sem a página inteira rolar para o lado.

**Critérios de aceite**
- [ ] Os números batem com a soma dos gráficos dos dois perfis no GitHub.
- [ ] Teste E2E: com a API falhando e sem cache, o gráfico não aparece e o resto da página continua normal.
- [ ] No celular, a página não rola na horizontal.
- [ ] Leitores de tela recebem a alternativa textual.

---

## Etapa 10 — SEO e prévia de link

**Objetivo:** seção 6.7 da especificação.

**Entregas**
- Título e descrição por idioma.
- Imagem de prévia (Open Graph e Twitter Card) com nome e título no visual Grafite.
- Favicon.
- Endereço base configurável, usando o `.vercel.app` até o domínio existir.

**Critérios de aceite**
- [ ] A prévia aparece corretamente num inspetor de links (ex.: o Post Inspector do LinkedIn).
- [ ] A aba mostra o título certo nos dois idiomas.

---

## Etapa 11 — Auditoria e polimento

**Objetivo:** cumprir as metas da seção 7 e revisar o todo.

**Entregas**
- Lighthouse no celular, com correções até a meta.
- Revisão de acessibilidade manual (teclado e leitor de tela) além da automática.
- Revisão crítica do design contra a seção 5, com a pergunta da skill de frontend: "o que dá para tirar?".
- Revisão final dos textos nos dois idiomas.

**Critérios de aceite**
- [ ] Lighthouse ≥ 90 em todas as categorias, no celular.
- [ ] Todos os testes E2E verdes.
- [ ] Nenhum item da especificação sem implementação.

---

## Etapa 12 — Publicação

**Objetivo:** seção 8 da especificação.

**Entregas**
- Domínio `.dev` configurado na Vercel, com HTTPS.
- Endereço base atualizado para o domínio.
- Links atualizados: perfil do LinkedIn, perfil do GitHub, assinatura de e-mail.

**Critérios de aceite**
- [ ] O domínio abre o site com HTTPS.
- [ ] A prévia de link mostra o domínio novo.
- [ ] Verificação final completa nos dois idiomas e nos dois temas, no celular e no desktop.
