# Portfólio — Especificação do Projeto

> Fonte única de verdade do projeto. Todo chat ou sessão de desenvolvimento deve ler este arquivo antes de começar.
> Última atualização: 09/10/2026 · Status: **especificação aprovada em 09/10/2026** · plano de implementação em `PLANO.md`

---

## 1. Intenção

**Objetivo:** presença profissional. O site não busca vaga nem vende serviços.

**Público:** Brasil e exterior, com o mesmo peso.

**Critério de sucesso:** quem recebe o link entende em menos de 30 segundos quem é Luige e com o que trabalha, e consegue conferir o trabalho por conta própria (repositórios públicos).

**Premissas validadas:**
1. O tráfego vem de links compartilhados (LinkedIn, perfil do GitHub, assinatura de e-mail), não de buscadores.
2. Sem "disponível para vagas" e sem chamadas para contratar. O contato é discreto, no fim da página.
3. O elemento marcante do site é o gráfico de contribuições, no topo.
4. Manutenção mínima: os dados do GitHub mantêm o site atual.

## 2. Escopo

**Inclui:** site de página única, bilíngue (PT/EN), com experiência, dois projetos em cards, stack, formação, contato e gráfico de contribuições do GitHub.

**Não inclui:** blog, currículo em PDF, página de detalhe por projeto, analytics, CMS, área administrativa, conteúdo fora da carreira tech.

## 3. Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Dados do GitHub | `@octokit/rest` (REST) + GraphQL (contribuições) |
| Testes | Playwright (E2E) + verificação automática de acessibilidade |
| CI | GitHub Actions |
| Deploy | Vercel |
| Repositório | Público |

## 4. Regras de arquitetura

### 4.1 Geral
1. Toda chamada ao GitHub fica em `src/lib/github.ts`. Componentes nunca chamam a API diretamente.
2. Busca sempre no servidor, nunca no navegador do visitante.
3. Cache por revalidação, com referência de 1 hora.
4. Tipagem explícita dos dados em `src/types/`.

### 4.2 Segredos e configuração
5. Variáveis de ambiente (em `.env.local` e nas env vars da Vercel), nunca commitadas:
   - `GITHUB_TOKEN`: token pessoal, somente leitura. Nenhuma credencial da conta de trabalho.
   - `GITHUB_PERSONAL_USER`: `lluigecm`
   - `GITHUB_WORK_USER`: usuário da conta de trabalho (fica fora do código porque o repositório é público).
6. Nenhum segredo no histórico do Git, desde o primeiro commit.

### 4.3 Idioma
7. Bilíngue PT/EN na **mesma URL**, com troca por botão.
8. Idioma inicial detectado pelo navegador; **fallback: inglês**.
9. A escolha manual do visitante fica salva e prevalece nas visitas seguintes.
10. O atributo de idioma da página acompanha a troca de PT para EN (leitores de tela).
11. Limitação aceita: buscadores e prévias de link enxergam essencialmente a versão em inglês.

### 4.4 Dados do GitHub
12. **Projetos vêm de uma lista fixa** em `src/content/`, com textos próprios em PT e EN. A API só complementa cada card com estrelas, linguagens e data da última atualização.
13. **Gráfico de contribuições único**, somando dia a dia os últimos 12 meses das contas pessoal e de trabalho.
14. **Falhas:** o site nunca quebra por causa do GitHub.
    - Cards: sem dados da API, aparecem só com os textos próprios.
    - Gráfico: se a atualização falhar, continuam valendo os últimos dados válidos em cache. Se nunca houve dados válidos, ou se uma das contas falhar, o gráfico é ocultado (um gráfico parcial contradiria a legenda).

### 4.5 Tema
15. Tema claro e escuro: segue o sistema, com botão de troca; a escolha manual fica salva.
16. O tema é aplicado antes da primeira renderização (a página não pisca no tema errado).

### 4.6 Mídia e conteúdo
17. Todas as imagens e vídeos ficam dentro do projeto (`public/`), nunca carregados do GitHub ou de outro site.
18. A mídia do MyGather é um **vídeo curto** (convertido do GIF do repositório) com botão de pausa e imagem de capa.
19. O card do MyGather exibe o crédito da arte: "arte: LPC (CC-BY-SA 3.0) e DyLESTorm". A licença exige atribuição.
20. O diagrama do TCC é exibido sobre um painel claro próprio nos dois temas, para não quebrar no tema escuro.
21. O e-mail aparece como link `mailto:`, nunca como texto puro.

### 4.7 Estrutura de pastas

```
src/
  app/              # layout e página única
  components/       # seções e cards
  content/          # textos PT/EN e lista fixa de projetos
  lib/github.ts     # integração com o GitHub (REST + GraphQL)
  types/            # tipos do domínio
public/
  projects/         # imagens, vídeos e capas dos cards
tests/              # testes E2E (Playwright)
.github/workflows/  # CI
.env.local          # segredos (fora do Git)
PROJETO.md          # este documento
PLANO.md            # plano de implementação
```

## 5. Design

### 5.1 Princípios
1. **Uma única peça marcante:** o gráfico de contribuições, em largura total logo abaixo da apresentação. Todo o resto é discreto.
2. **Estrutura é informação:** a linha do tempo aparece só na Experiência, a única sequência real. Sem rótulos decorativos, sem numeração de seções, sem pontos médios separando metadados.
3. **Movimento só em resposta a uma ação** (troca de tema e de idioma), respeitando `prefers-reduced-motion`. Sem animações de entrada nem efeitos de hover decorativos.
4. **Cards de projeto como fichas:** mídia grande, borda fina, sem sombras nem gradientes.
5. Alinhamento à esquerda, coluna estreita (até 70 caracteres por linha).

### 5.2 Cores

| Token | Claro | Escuro |
|---|---|---|
| Papel (fundo) | `#F3F4F5` | `#16181B` |
| Superfície | `#FFFFFF` | `#1E2125` |
| Grafite (texto) | `#1F2328` | `#E6E8EB` |
| Lápis (secundário) | `#5C636B` | `#9AA1A9` |
| Linha (borda) | `#D9DCE0` | `#30353B` |
| Âmbar (destaque) | `#A84E08` | `#E0A458` |

- O âmbar é o único elemento quente e a única cor de destaque.
- Todo texto atende contraste AA (WCAG), com folga: nenhum par texto/fundo abaixo de 5:1 no tema claro para o âmbar.

**Escala do gráfico de contribuições (5 níveis):**
- Nível 0 (sem contribuição) = cor da linha.
- Níveis 1 a 4 em âmbar, cada um com contraste mínimo de **3:1 contra o papel**, nos dois temas (WCAG 1.4.11).
- Referência: claro de ~3,6:1 a ~8,5:1; escuro de ~3,4:1 a ~11:1.
- O total de contribuições aparece em texto visível na legenda, para a cor não ser o único meio de obter a informação.

### 5.3 Tipografia
- **IBM Plex Sans** para todo o texto.
- **IBM Plex Mono** apenas para conteúdo que é código de verdade (ex.: `lluigecm/MyGather` nos cards).
- Corpo em 18px; nome no topo em 48px; escala tipográfica clássica.

### 5.4 Layout

```
┌──────────────────────────────────────────────────────┐
│ Luige   Experiência Projetos Stack Formação Contato  PT/EN ◐ GitHub │
├──────────────────────────────────────────────────────┤
│ Luige                                                 │
│ Desenvolvedor de Automação de Testes                  │
│ Apresentação                                          │
│                                                       │
│ ▓▓▒▒░░▓▓▓▒░░▒▓▓▓▒░▒▓▓░░▒▓▓▓▓▒░▒▓▒░░▓▓▓▒▒░▓▓▒░▓▓▓▒░▒▓▓ │  gráfico, largura total
│ legenda                                               │
├──────────────────────────────────────────────────────┤
│ Experiência   linha do tempo vertical                 │
│ Projetos      dois cards, mídia em destaque           │
│ Stack         grupos em linha                         │
│ Formação                                              │
│ Contato       LinkedIn e e-mail                       │
└──────────────────────────────────────────────────────┘
```

- **Cabeçalho:** nome; links para Experiência, Projetos, Stack, Formação e Contato; botão de idioma; botão de tema; link para o perfil do GitHub.
- No celular, os links das seções podem ser recolhidos; os botões de idioma e tema continuam visíveis.
- Espaçamentos exatos e detalhes de cada seção ficam a cargo do desenvolvimento, seguindo estes princípios.

## 6. Conteúdo

### 6.1 Topo

| | PT | EN |
|---|---|---|
| Nome | Luige | Luige |
| Título | Desenvolvedor de Automação de Testes | Test Automation Developer |
| Apresentação | Testes automatizados quebram quando a interface muda. Na X-Testing, automatizo testes e processos desde 2024. No TCC, pesquiso como esses testes podem se recuperar sozinhos. | Automated tests break when the interface changes. At X-Testing, I've been automating tests and processes since 2024. In my undergraduate thesis, I'm researching how those tests can heal themselves. |
| Legenda do gráfico | {total} contribuições no GitHub nos últimos 12 meses, somando a conta pessoal e a de trabalho. | {total} GitHub contributions over the last 12 months, combining my personal and work accounts. |

`{total}` é dinâmico e formatado conforme o idioma (ex.: 1.234 em PT, 1,234 em EN).

### 6.2 Experiência

**PT**

> **X-Testing**
> Empresa de qualidade e teste de software de Salvador, que presta serviços de automação de testes e de processos (RPA) para outras empresas.
>
> **Desenvolvedor de Automação de Testes (Trainee)**, abr/2026 até hoje
> Conduzo projetos de automação de testes, do desenvolvimento à manutenção. Em uma fase anterior do projeto atual, integrei os testes à Microsoft Graph API para validar e-mails automaticamente.
>
> **Estagiário em Automação de Testes**, jul/2024 a mar/2026
> Otimizei automações de processos existentes para que quebrassem menos e exigissem menos manutenção.

**EN**

> **X-Testing**
> Software quality and testing company based in Salvador, Brazil, providing test and process automation (RPA) services to other companies.
>
> **Test Automation Developer (Trainee)**, Apr 2026 to present
> I run test automation projects, from development through maintenance. In an earlier phase of my current project, I integrated the tests with the Microsoft Graph API to validate emails automatically.
>
> **Test Automation Intern**, Jul 2024 to Mar 2026
> Optimized existing process automations so they broke less often and needed less maintenance.

### 6.3 Projetos

**Auto-Healing em Testes de Interface Web / Auto-Healing for Web UI Tests**
- Repositório: https://github.com/lluigecm/autohealing-e2e-tests
- Selo: TCC, em andamento / undergraduate thesis, in progress
- Mídia: diagrama de arquitetura do TCC (regra 20)
- Tags: TypeScript, Playwright, POM

> **PT:** Testes E2E quebram quando o DOM ou o CSS mudam e o seletor deixa de encontrar o elemento. Este protótipo procura o elemento por similaridade estrutural e atributos estáveis e calcula um score de confiança. Acima do limiar, troca o seletor e registra a troca para revisão. Abaixo, o teste falha como falharia sem o mecanismo.
>
> **EN:** E2E tests break when a DOM or CSS change leaves a selector unable to find its element. This prototype searches for the element using structural similarity and stable attributes, then computes a confidence score. Above the threshold, it replaces the selector and logs the change for review. Below it, the test fails just as it would without the mechanism.

**MyGather**
- Repositório: https://github.com/lluigecm/MyGather
- Mídia: vídeo do áudio por proximidade, a partir de `imgs/microfone_simulado.gif` (regras 18 e 19)
- Tags: TypeScript, Node.js, Socket.io, WebRTC, Canvas

> **PT:** Escritório virtual 2D em pixel art. Quando dois avatares se aproximam, o áudio entre eles liga sozinho. O servidor valida cada movimento, então ninguém entra numa sala fechada sem passar pela porta. Feito para uso real por uma equipe pequena.
>
> **EN:** A 2D pixel-art virtual office. When two avatars get close, audio between them turns on by itself. The server validates every move, so nobody gets into a closed room without walking through the door. Built for real use by a small team.

### 6.4 Stack

| PT | EN | Itens |
|---|---|---|
| Linguagens | Languages | Python, TypeScript, C, C++ |
| Automação e testes | Testing and automation | Playwright, Robot Framework |
| Computação paralela | Parallel computing | MPI, OpenMP |

Next.js entra na lista quando o portfólio estiver no ar.

### 6.5 Formação

> **PT:** **Bacharelado em Ciência da Computação**
> UESC, Universidade Estadual de Santa Cruz (Bahia). Conclusão prevista para 2026.
> TCC sobre recuperação automática de seletores em testes de interface web.
>
> **EN:** **Bachelor of Science in Computer Science**
> UESC, State University of Santa Cruz (Bahia, Brazil). Expected completion: 2026.
> Thesis on automatic selector recovery in web UI tests.

### 6.6 Contato

> **PT:** Quer conversar sobre automação de testes ou sobre algum dos projetos? Me escreva.
> Botões: [Enviar e-mail] [Ver perfil no LinkedIn]
>
> **EN:** Want to talk about test automation or one of these projects? Write to me.
> Buttons: [Send email] [View LinkedIn profile]

### 6.7 Título da aba e prévia de link

| | PT | EN |
|---|---|---|
| Título | Luige \| Desenvolvedor de Automação de Testes | Luige \| Test Automation Developer |
| Descrição | Desenvolvedor de automação de testes no Brasil. Experiência, projetos e atividade no GitHub. | Test automation developer in Brazil. Experience, projects, and live GitHub activity. |

- Imagem de prévia (Open Graph): nome e título no visual Grafite.
- Favicon próprio no visual Grafite.

## 7. Requisitos técnicos

| Requisito | Meta |
|---|---|
| Acessibilidade | WCAG AA: navegação por teclado, foco visível, texto alternativo, contraste, pausa em mídia animada, idioma da página correto |
| Performance | Lighthouse ≥ 90 em todas as categorias, medido no celular |
| Prévia de link | Open Graph e Twitter Card completos |
| Analytics | Nenhum. Nada de rastreamento; o navegador guarda só as preferências de tema e idioma |

### Testes E2E (Playwright, rodando no GitHub Actions a cada push e pull request)
1. A página carrega com todas as seções.
2. A troca de tema funciona e persiste após recarregar.
3. A troca de idioma funciona, persiste após recarregar e atualiza o atributo de idioma.
4. Com a API do GitHub falhando (simulada), os cards aparecem com os textos e o gráfico é ocultado.
5. Verificação automática de acessibilidade sem violações.

## 8. Publicação
- Domínio próprio `.dev`. Nome **pendente**: Luige verifica a disponibilidade (sugestões: `luige.dev`, `lucasluige.dev`, `luigecm.dev`).
- HTTPS pela Vercel.
- Deploy automático a partir do repositório público `lluigecm/portfolio`.
- Endereço provisório: https://portfolio-chi-indol-56.vercel.app/

## 9. Pendências antes do desenvolvimento

- [ ] Nome do domínio comprado
- [ ] Endereço de e-mail exibido no Contato
- [ ] URL do perfil no LinkedIn

## 10. Tarefas do Luige (fora do código)

- [ ] Ativar a exibição de contribuições privadas no perfil das duas contas do GitHub
- [ ] Adicionar descrição e topics ao repositório MyGather
- [ ] Adicionar topics ao repositório do TCC
- [ ] Exportar o diagrama de arquitetura do TCC como imagem
- [ ] Comprar o domínio

## 11. Manutenção de conteúdo

- **Token do GitHub:** criado sem data de vencimento. Se vazar ou houver suspeita, revogar no GitHub e criar outro, atualizando `.env.local` e a Vercel.
- **Dependências:** `npm audit` acusa vulnerabilidades no `braces`, só na cadeia do ESLint (desenvolvimento). Rever a cada atualização do `eslint-config-next`; não aplicar correção forçada.
- **Jan/2027:** atualizar a Formação para "concluído"; revisar o cargo (trainee); acrescentar resultados ao card do TCC após a defesa.

## 12. Fluxo de trabalho

1. **Especificação** (este documento): aprovada pelo Luige no chat de gerenciamento.
2. **Plano de implementação:** escrito no chat de gerenciamento a partir da especificação, em etapas pequenas e verificáveis, e aprovado antes de qualquer código.
3. **Desenvolvimento:** o chat de desenvolvimento executa o plano, etapa por etapa. Não decide escopo nem arquitetura sozinho; mudanças passam pelo gerenciamento e entram aqui antes.
4. Ao concluir cada etapa, o status volta para o chat de gerenciamento, que atualiza este documento.

**Diretrizes de apoio:** skills de brainstorming, frontend-design e copywriting.

## 13. Registro de decisões

| Data | Decisão |
|---|---|
| 09/10/2026 | Next.js (App Router) + TypeScript + Tailwind, deploy na Vercel |
| 09/10/2026 | Sem blog; escopo restrito à carreira tech |
| 09/10/2026 | Dados do GitHub buscados no servidor, com cache e token em env var |
| 09/10/2026 | Bilíngue PT/EN, mesma URL, botão de troca, detecção pelo navegador, fallback EN |
| 09/10/2026 | Página única; projetos só em cards, sem página de detalhe |
| 09/10/2026 | Seções: Sobre, Experiência, Projetos, Stack, Formação, Contato |
| 09/10/2026 | Contato por LinkedIn e e-mail; sem currículo em PDF |
| 09/10/2026 | Cargo exibido como "Desenvolvedor de Automação de Testes (Trainee)" |
| 09/10/2026 | Lista fixa de projetos; gráfico único somando conta pessoal e de trabalho |
| 09/10/2026 | Projetos: TCC e MyGather |
| 09/10/2026 | Público: Brasil e exterior igualmente; objetivo: presença profissional |
| 09/10/2026 | Design Grafite revisado: cinzas frios, âmbar como único destaque, IBM Plex, sem numeração nem mono decorativa |
| 09/10/2026 | Gráfico de contribuições movido para o topo como peça marcante |
| 09/10/2026 | Tema segue o sistema, com botão de troca |
| 09/10/2026 | Sem analytics |
| 09/10/2026 | GIF do MyGather convertido em vídeo com pausa; acessibilidade AA; Lighthouse ≥ 90; testes E2E com Playwright no CI |
| 09/10/2026 | Domínio próprio `.dev`; repositório público |
| 09/10/2026 | Etapa 1 concluída: Next.js 16.4 (React 19.3), Tailwind 4 |
| 09/10/2026 | `.gitattributes` força finais de linha LF (Windows local, CI Linux) |
| 09/10/2026 | Arquivos locais de skills de IA no `.gitignore`; permanecem no commit inicial, sem segredos, sem reescrever o histórico |
| 09/10/2026 | `AGENTS.md` gerado pelo Next.js fica versionado |
| 09/10/2026 | Vulnerabilidades do `braces` (só desenvolvimento) não corrigidas à força; acompanhar atualizações |
| 09/10/2026 | Cache Components (padrão no Next 16): convivência entre idioma dinâmico e dados em cache definida na etapa 5 |
| 09/10/2026 | Token do GitHub sem data de vencimento |
| 09/10/2026 | Etapa 2 concluída: Playwright 1.64, axe restrito às regras WCAG A/AA, testes contra o build de produção |
| 09/10/2026 | CI só no Chromium durante o desenvolvimento; WebKit (celular) entra na auditoria da etapa 11 |
| 09/10/2026 | Ruleset da `main`: merge só por PR com CI verde, sem exceções; bloqueia apagar a branch e force push |
| 09/10/2026 | Etapa 3 concluída: tokens como variáveis CSS, paleta padrão do Tailwind desligada, IBM Plex via `next/font` |
| 09/10/2026 | Âmbar do tema claro ajustado de `#B45309` para `#A84E08` (contraste 4,56 → 5,07 sobre o papel) |
| 09/10/2026 | Gráfico: níveis 1–4 com 3:1 contra o papel; nível 0 = linha; total visível na legenda |
| 09/10/2026 | `adjustFontFallback` sem efeito no Next 16.4; fallback calibrado gerado automaticamente |
