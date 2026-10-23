# Portfólio — Plano de Implementação

> Baseado na especificação aprovada em `PROJETO.md` (09/10/2026).
> Status: **aprovado em 09/10/2026; etapa 14 (redesign) acrescentada em 22/10/2026** · execução no chat de desenvolvimento (claude.ai)

> **22/10/2026 — o modelo `docs/modelo.html` substitui esta especificação.** Por decisão do Luige, o site passa a ser exatamente esse modelo (visual, textos, seções e interações), e as regras e decisões anteriores deste arquivo e do `PROJETO.md` deixam de valer onde conflitarem com ele. Diferenças em relação ao modelo: os links de contato são os reais (`src/content/profile.ts`), o idioma continua no cookie com a página entregue pelo servidor, e as fontes vêm do próprio site (não do Google Fonts). Acréscimos pedidos pelo Luige no mesmo dia: textos sem travessão, botão "PRESS TO START" com animação ao passar o mouse, dica "Role a página pra fazer o bot avançar.", moitas desenhadas e balançando, Lua à noite, modo dia com Sol (botão na HUD), nuvens, inventário interativo e cards que reagem ao mouse (o bot comenta cada um). Depois: morros do fundo redondos, gráfico de contribuições do GitHub de volta (na fase "Sobre", no visual do jogo) e as barras de status, que no modelo nunca enchiam, corrigidas.

## Como usar este plano

- Cada etapa é pequena, entrega algo verificável e termina com os critérios de aceite cumpridos.
- **Uma etapa por vez, na ordem.** Uma etapa só começa quando a anterior foi aceita.
- Cada etapa é feita numa branch própria e entra na `main` por pull request, **com o CI verde**.
- Os testes nascem junto com a funcionalidade: cada etapa inclui os testes E2E que provam os seus critérios de aceite.
- Ao concluir uma etapa, o status volta para o chat de gerenciamento.
- Se algo exigir mudar escopo, arquitetura ou design, o desenvolvimento para e a mudança passa pelo gerenciamento antes.

## Visão geral

| # | Etapa | Depende de | Status |
|---|---|---|---|
| 0 | Pré-requisitos (Luige) | — | ✅ Concluída |
| 1 | Setup e deploy inicial | 0 | ✅ Concluída em 09/10/2026 |
| 2 | Base de testes e CI | 1 | ✅ Concluída em 09/10/2026 |
| 3 | Tokens de design e tipografia | 2 | ✅ Concluída em 09/10/2026 |
| 4 | Tema claro/escuro | 3 | ✅ Concluída em 09/10/2026 |
| 5 | Idioma PT/EN | 3 | ✅ Concluída em 09/10/2026 |
| 6 | Layout e seções estáticas | 4, 5 | ✅ Concluída em 10/10/2026 |
| 7 | Integração com o GitHub: cards | 6 | ✅ Concluída em 10/10/2026 |
| 8 | Mídia dos projetos | 7 | ✅ Concluída em 10/10/2026 |
| 9 | Gráfico de contribuições | 7 | ✅ Concluída em 10/10/2026 |
| 10 | SEO e prévia de link | 6 | ✅ Concluída em 10/10/2026 |
| 11 | Auditoria e polimento | 8, 9, 10 | ✅ Concluída em 10/10/2026 |
| 12 | Publicação | 11 | ⏸ Em parte: falta o domínio |
| 13 | Movimento (fora do plano original; seção 5.5) | 11 | ✅ Concluída em 10/10/2026 |
| 14.1 | Redesign: tokens e fontes | 13 | ✅ Concluída em 22/10/2026 |
| 14.2 | Redesign: componentes de apresentação por seção | 14.1 | 🔍 Em revisão (PR) |
| 14.3 | Redesign: cena com o bot | 14.2 |  |
| 14.4 | Redesign: gráfico reestilizado | 14.1 |  |
| 14.5 | Redesign: imagem de prévia e favicon | 14.1 |  |
| 14.6 | Redesign: ajuste final dos testes e auditoria | 14.2 a 14.5 |  |
| 15.1 | Motion no site: abertura com a TV e entradas das fases | motion/ | ✅ Concluída em 22/10/2026 |
| 15.2 | Motion no site: nascer e pôr do sol no botão de tema | 15.1 | ✅ Concluída em 22/10/2026 |
| 15.3 | Motion no site: bugs no chão, pisão e placar | 15.1 | ✅ Concluída em 22/10/2026 |
| 15.4 | Motion no site: efeitos sonoros e música | 15.1 | ✅ Concluída em 22/10/2026 |

---

## Etapa 0 — Pré-requisitos (Luige)

**Antes da etapa 1:**
- [x] Criar token pessoal do GitHub (fine-grained, somente leitura de dados públicos).
- [x] Ativar a exibição de contribuições privadas no perfil das duas contas.

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
- [x] O endereço `.vercel.app` abre a página inicial: https://portfolio-chi-indol-56.vercel.app/
- [x] Nenhum arquivo `.env` aparece no repositório nem no histórico.
- [x] `npm run build` e `npm run lint` passam sem erros.

---

## Etapa 2 — Base de testes e CI

**Objetivo:** a rede de segurança existe antes da primeira funcionalidade.

**Entregas**
- Playwright configurado, com a verificação de acessibilidade (axe) integrada.
- Um teste inicial: a página carrega e não tem violações de acessibilidade.
- Workflow do GitHub Actions que roda lint, build e testes E2E a cada push e pull request.
- Proteção da `main`: merge só com o CI verde.

**Critérios de aceite**
- [x] O CI roda e fica verde num pull request de teste.
- [x] Um teste quebrado de propósito deixa o CI vermelho e bloqueia o merge.

---

## Etapa 3 — Tokens de design e tipografia

**Objetivo:** a fundação visual da especificação (seção 5) aplicada uma única vez, para todo o site usar.

**Entregas**
- Tokens de cor claro/escuro (seção 5.2) como variáveis CSS, expostos no Tailwind.
- Escala de âmbar de 5 níveis para o gráfico.
- IBM Plex Sans e IBM Plex Mono carregadas pelo `next/font`.
- Escala tipográfica: corpo 18px, nome 48px, coluna de até 70 caracteres.

**Critérios de aceite**
- [x] Nenhuma cor escrita direto nos componentes; tudo vem dos tokens.
- [x] As fontes carregam sem deslocamento de layout visível.
- [x] A verificação de acessibilidade não acusa problemas de contraste.

**Ajuste pós-etapa (PR pequeno, antes da etapa 4)**
- Âmbar do tema claro: `#B45309` → `#A84E08`.
- Escala do gráfico refeita: nível 0 = linha; níveis 1 a 4 com contraste mínimo de 3:1 contra o papel nos dois temas (especificação 5.2).
- [ ] Testes de contraste atualizados cobrindo o novo âmbar e os níveis 1 a 4 do gráfico.

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
- **Atenção (Next 16, Cache Components ativo):** ler cookie e cabeçalhos torna a renderização dinâmica. Definir já nesta etapa como a parte dinâmica (idioma, a cada visita) convive com os dados em cache do GitHub (1 hora, etapas 7 e 9), para não refazer nada depois.

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
- [ ] Teste de deslocamento de layout das fontes (etapa 3) repetido com a página completa, que agora tem conteúdo suficiente para deslocar.

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
- Gráfico em largura total abaixo da apresentação, na escala de âmbar (especificação 5.2), com a legenda aprovada, incluindo o total dinâmico formatado conforme o idioma.
- Alternativa textual para leitores de tela (ex.: total de contribuições no período).
- Regras de falha: mantém os últimos dados válidos; sem dados válidos ou com uma conta falhando, o gráfico é ocultado.
- **No celular:** o gráfico rola na horizontal dentro do próprio espaço, começando pelos meses mais recentes. Assim ele mostra sempre os 12 meses da legenda, sem a página inteira rolar para o lado.

**Critérios de aceite**
- [ ] Os números batem com a soma dos gráficos dos dois perfis no GitHub.
- [ ] Teste E2E: com a API falhando e sem cache, o gráfico não aparece e o resto da página continua normal.
- [ ] No celular, a página não rola na horizontal.
- [ ] Leitores de tela recebem a alternativa textual.
- [ ] O total visível na legenda bate com a soma exibida no gráfico.

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
- Rodar a suíte E2E também no WebKit com emulação de celular (Safari no iPhone), além do Chromium usado no CI. Muitos visitantes vão abrir o link pelo app do LinkedIn no celular.

**Critérios de aceite**
- [ ] Lighthouse ≥ 90 em todas as categorias, no celular.
- [ ] Todos os testes E2E verdes, no Chromium e no WebKit (celular).
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

---

## Etapa 14 — Redesign "retrô platformer"

**Objetivo:** implementar a seção 5 revisada e aprovada em 22/10/2026 (decisões nos blocos A a D da seção 13 do `PROJETO.md`). O conteúdo da seção 6 não muda.

**Regras de todas as subetapas**
- Uma subetapa por vez, na ordem da tabela, cada uma numa branch própria e com PR de CI verde.
- Os testes de cada subetapa nascem com ela. Toda asserção nova é vista falhando por uma injeção própria antes de valer, e o PR registra a injeção usada (seção 7).
- O preview em HTML é referência de aparência e de comportamento, não código a copiar. Nada de texto dele entra no site.
- Entre uma subetapa e outra, o site pode ficar visualmente intermediário, mas nunca quebrado: todos os testes verdes, contraste AA e nenhuma rolagem horizontal.

### 14.1 — Tokens e fontes

**Entregas**
- Tokens da seção 5.2 em `src/app/globals.css`, nos dois temas, substituindo os do Grafite: cena, painéis, texto, secundário, linha, amarelo, teal, rosa, destaque de texto e foco por tema.
- Escala verde do gráfico (níveis 1 a 4) e nível 0 = linha.
- Utilitário de sombra dura (5.1.7): deslocada, sem desfoque nem espalhamento, na cor da linha.
- Press Start 2P via `next/font` (latin e latin-ext), ao lado da Plex Sans e da Plex Mono; peso único, sem negrito sintético nos títulos.
- `src/lib/palette.ts` (cores das imagens geradas) com a paleta nova.

**Critérios de aceite**
- [x] Teste de contraste com os pares novos nos dois temas: texto e secundário sobre os dois painéis, destaque de texto, linha a 3:1 ou mais, foco, texto `#1A1A2E` sobre amarelo e sobre teal.
- [x] Escala do gráfico: níveis 1 a 4 a 3:1 ou mais contra o painel, em ordem crescente, nos dois temas.
- [x] Cores só nos tokens (teste de tokens).
- [x] A Press Start 2P carrega; nenhum elemento com ela abaixo de 14 px.
- [x] A Plex continua calibrada, sem deslocamento de layout na troca de fonte.

### 14.2 — Componentes de apresentação por seção

**Entregas**
- **HUD** como cabeçalho fixo: nome, links das seções, contador "CONTRIBUIÇÕES" / "CONTRIBUTIONS" (mesmo total da legenda; some quando o gráfico é ocultado), idioma, tema e GitHub. Abaixo de 640 px, o contador na segunda linha e os links recolhíveis. `scroll-padding-top` com a altura da HUD.
- **Topo:** caixa de diálogo de jogo (borda grossa, cantos retos) com nome, título e apresentação da 6.1, alinhados à esquerda.
- **Placas** MUNDO 1-1 a 1-5 / WORLD 1-1 a 1-5, uma por seção, decorativas (`aria-hidden`), no idioma da página.
- **Experiência:** trilha de checkpoints; o cargo atual destacado só pela cor.
- **Projetos:** cartuchos, com a mídia atual (diagrama com os casos do TCC, vídeo) como rótulo; os casos do TCC no visual novo.
- **Stack:** inventário com os quatro grupos da 6.4 e seus itens.
- **Formação e Contato:** painéis; botões de contato no estilo de jogo, que afundam no `:active`.
- Sombras duras só em painéis, placas, botões e cartuchos; nenhum `text-shadow`; sem hover que mova elementos.

**Critérios de aceite**
- [x] Os textos da seção 6 continuam intactos, e os títulos das seções (h2) são os nomes da seção 6.
- [x] As placas são invisíveis ao leitor de tela e trazem o texto do idioma da página.
- [x] Teste de design: caixa alta e numeração só na placa, na HUD e no balão; mono só em código; sem pontos médios.
- [x] Teste de sombras: desfoque e espalhamento zero, cor igual ao token linha, só nos elementos permitidos; nenhum `text-shadow`.
- [x] O contador da HUD mostra o mesmo total da legenda e some com a API fora do ar e sem cache.
- [x] Cada link da HUD leva à seção com o título visível abaixo da HUD.
- [x] Navegação completa por teclado, com foco visível nas cores de foco do tema.
- [x] Sem violações do axe nos dois temas e nos dois idiomas.
- [x] A 360 px: sem rolagem horizontal, HUD em no máximo duas linhas, idioma e tema visíveis.

### 14.3 — Cena com o bot

**Entregas**
- Cena fixa no rodapé da tela, atrás do conteúdo, sem receber cliques e invisível ao leitor de tela: céu em degradê no fundo da página, estrelas fixas no tema escuro (posições fixas no código, sem `Math.random`), colinas paradas e chão.
- A página reserva o espaço da cena no fim, para o Contato não ficar escondido atrás dela.
- Bot em pixel art original, com dois quadros de caminhada (formato a cargo do desenvolvimento, sem personagens de terceiros).
- Movimento ligado à rolagem com listener **passivo** e **`requestAnimationFrame`**: troca de quadro ao rolar, vira ao rolar para cima, para quando a rolagem para; o chão desliza só com `transform`.
- Balão de fala na Experiência e em Projetos, uma vez por seção por visita, invisível ao leitor de tela, com as falas da 5.5 nos dois idiomas.
- Com `prefers-reduced-motion`: bot e chão parados, balão sem esmaecer.
- Sai o relevo do gráfico (efeito 2 antigo), com os seus testes.

**Critérios de aceite**
- [ ] Nenhuma animação em loop: `document.getAnimations()` chega a zero depois de carregar e depois de rolar.
- [ ] Ao rolar, o bot troca de quadro; ao rolar para cima, vira; quando a rolagem para, para.
- [ ] O balão aparece só na Experiência e em Projetos, uma vez por seção por visita, e é invisível ao leitor de tela.
- [ ] Com movimento reduzido, nada se move.
- [ ] O fim da página (Contato) fica inteiro visível acima da cena.
- [ ] Nenhum texto sobre a cena.

### 14.4 — Gráfico reestilizado

**Entregas**
- Células como blocos de pixel art na escala verde, sobre o painel.
- Preenchimento ao carregar em degraus (`steps`), em até 700 ms; pronto na troca de idioma.
- Mantidos: legenda por conta (regra 13), regra 14, rolagem horizontal no celular começando pelos meses recentes.

**Critérios de aceite**
- [ ] Níveis na escala nova; nível 0 só para dias sem contribuição.
- [ ] Preenchimento em degraus, uma vez, em até 700 ms; nenhum com movimento reduzido.
- [ ] O total da legenda e o do contador batem com a soma do gráfico.

### 14.5 — Imagem de prévia e favicon

**Entregas**
- Pacote `@fontsource/press-start-2p` (OFL). A fonte entra no `next/og` em `.woff`: o `next/og` (Satori) não aceita `.woff2`.
- Imagem de prévia única, noturna, 1200 × 630: céu, colinas, chão, o bot e a caixa de diálogo com nome e título.
- Favicon em SVG com a cabeça do bot; ícone do iPhone no mesmo desenho.

**Critérios de aceite**
- [ ] As imagens de prévia existem, em PNG de 1200 × 630, nos dois idiomas.
- [ ] As cores das imagens geradas são as dos tokens.
- [ ] Favicon e ícone do iPhone próprios, no desenho do bot.

### 14.6 — Ajuste final dos testes e auditoria

**Entregas**
- Revisão de todos os testes contra a seção 5 nova: nada do Grafite sobrando (âmbar, papel, fichas, relevo).
- `PROJETO.md` e `PLANO.md` com o status final.

**Critérios de aceite**
- [ ] Lighthouse ≥ 90 em todas as categorias, no celular, com atenção ao peso das fontes e ao custo do bot na rolagem.
- [ ] Todos os testes E2E verdes no Chromium e no WebKit (celular), inclusive HUD e cena fixas, áreas seguras do iPhone e altura em `svh`.
- [ ] Verificação manual nos dois idiomas e nos dois temas, no celular e no desktop.
- [ ] Nenhum item da seção 5 sem implementação.

---

## Etapa 15 — Animações do motion no site

> Acrescentada em 22/10/2026, a pedido do Luige, depois do vídeo em `motion/`: levar as animações do vídeo para o site, em tempo real. No site, cada animação dispara com uma ação do visitante (abrir a página, rolar até um bloco, clicar), não com o relógio do vídeo; `motion/index.html` é a referência visual.

**Decisões do Luige (22/10/2026)**
- A TV ligando fica no site: faz parte da identidade. Toda visita abre com ela, menos a volta da troca de idioma, que chega pronta.
- Som **ligado por padrão**, em dois controles separados na HUD: efeitos sonoros e música. Os navegadores só liberam áudio depois do primeiro clique ou tecla do visitante, então o som começa nesse momento.

**Regras que valem para as quatro partes**
- Tudo respeita `prefers-reduced-motion`: com ele, nada se move, como hoje.
- Sem JavaScript, tudo aparece parado e visível. Nada fica escondido à espera de um script.
- Só `transform`/`translate`/`scale`/`opacity`/`clip-path` nas animações.

### 15.1 — Abertura com a TV e entradas das fases

**Entregas**
- Abertura (classe `tv` no `<html>`, decidida antes da primeira pintura por `src/lib/intro.ts`): a TV liga (linha clara no meio, imagem abrindo do centro, brilho baixando), a HUD desce, a cena sobe do chão, o bot cai do céu e pousa achatado com poeira, as letras do nome caem uma a uma ganhando a sombra, a frase entra palavra a palavra (a piada depois de uma pausa) e o PRESS TO START salta.
- Entradas: cada bloco `.entra` (placas, títulos, painéis, nós do mapa, cartuchos, inventário, contato) fica escondido até chegar na tela e então anima: a placa cai e quica, o título se digita, o painel surge com mola, a trilha da Experiência se desenha, os cartuchos caem e encaixam, as casas do inventário surgem uma a uma. O que já está na tela quando o JavaScript chega, e tudo na volta da troca de idioma, chega pronto (`.pronto`).
- A fala do bot se digita; o pulo do bot estica e achata; a fase do chefe estoura um confete.

**Critérios de aceite**
- [x] A TV liga ao abrir o site, sem bloquear cliques, e some; na volta da troca de idioma não liga e a página chega pronta.
- [x] Um bloco fora da tela fica escondido até chegar nela e então aparece inteiro.
- [x] Sem JavaScript, nada fica escondido e a TV não liga.
- [x] Com movimento reduzido: sem TV, sem entradas, sem confete.
- [x] Os testes E2E existentes continuam verdes no Chromium e no WebKit.

### 15.2 — Nascer e pôr do sol no botão de tema

**Entregas**
- As cores do tema registradas com `@property`, para transitarem. Só durante a troca pelo botão (classes `amanhece` e `anoitece` no `<html>`, `lib/theme.ts`): o céu e a cena mudam em 1,4 s, a interface vira no meio do caminho (0,35 s), a Lua desce e o Sol nasce, ou o Sol se põe e a Lua nasce, e o horizonte esquenta com o laranja do amanhecer ou do entardecer.
- Navegadores sem `@property` e o movimento reduzido trocam na hora, como antes.

**Critérios de aceite**
- [x] Para o dia: o céu passa por cores intermediárias, a Lua desce e some, o Sol nasce.
- [x] Para a noite: o Sol se põe pelo entardecer e a Lua nasce.
- [x] Com movimento reduzido, a troca é na hora, sem animações.
- [x] A escolha continua salva (teste existente).

### 15.3 — Bugs no chão, pisão e placar

**Entregas**
- A cada 1.800 px rolados para baixo, um bug (pixel art própria, dois quadros de passo) entra pela direita no chão e anda até o bot, correndo junto com o chão quando a página rola; uma rolagem rápida não o passa por baixo do bot.
- A um pulo de distância, o bot pula e pousa nele: o bug achata, sobem cacos e um "+100", e o placar da HUD ganha 100 e pula (`BUG_EVENT`, `Score`).
- Correção da 15.1: a aterrissagem da abertura passa para um elemento próprio (`.corpo`) e não se repete mais depois de um pulo.
- Com movimento reduzido, sem bugs.

**Critérios de aceite**
- [x] Rolar bastante traz um bug; o bot pisa nele, o "+100" aparece e o placar soma 100.
- [x] Com movimento reduzido, nenhum bug aparece.
- [x] O bot não some depois de pular.

### 15.4 — Efeitos sonoros e música

**Entregas**
- `src/lib/som.ts`: motor em Web Audio. A trilha é o tema principal do vídeo (16 compassos, 150 BPM) em loop sem emenda, renderizada uma vez num `OfflineAudioContext` (vozes monofônicas com as notas como automação, para custar pouco). Os efeitos são sintetizados na hora: pulo, pisão, moeda, entradas, confete, dia e noite, seleção e equipar. A fala do bot é muda (decisão de 23/10/2026).
- Dois botões na HUD (`SoundButtons`), efeitos sonoros e música, **ligados por padrão** e salvos no navegador. Como os navegadores só liberam áudio depois de um gesto, o som começa no primeiro clique, toque ou tecla na página (`data-musica` no `<html>` depois disso). Aba escondida pausa o som.
- A 360 px, a HUD com os cinco botões cabe sem cortar.

**Critérios de aceite**
- [x] Efeitos e música começam ligados, cada um com o seu botão, e a escolha fica salva.
- [x] A música começa no primeiro gesto e para no botão.
- [x] A HUD cabe a 360 px.
- [x] O balão de fala do bot não toca som.

