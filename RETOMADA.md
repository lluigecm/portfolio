# Retomada do trabalho (arquivo temporário)

> Estado do trabalho em andamento nesta branch, para retomar numa nova sessão.
> **Apagar este arquivo antes do merge na `main`.**
> Última atualização: 18/10/2026.

## Pedido do Luige

"Ainda acho muito estático meu portfólio. Meio que não representa muito do meu trabalho."
Ele aprovou investigar os repositórios dele e implementar as recomendações **por partes**,
nesta branch (`claude/amazing-dijkstra-pd5s0q`). Nada vai para a `main` sem ele avaliar e aprovar.

## Recomendações aprovadas para implementar (em ordem)

1. **Casos reais no diagrama do TCC.** Abaixo do diagrama, opções "score acima do limiar" e
   "score abaixo do limiar" (e, se houver nos dados, um falso positivo). Ao escolher, o caminho
   no `RecoveryDiagram` fica destacado em âmbar, e aparecem seletor original, mutação do DOM,
   score, limiar, decisão e a linha de log real, com link para o commit/arquivo no repositório
   do protótipo. Dados fixos em `src/content` (regras 12 e 20 não mudam).
2. **Experiência com casos concretos.** Depende de conteúdo que só o Luige tem (o que pode contar
   da X-Testing, sem nomear clientes). Não inventar.
3. **Legenda do gráfico separando as contas.** "{total}: {trabalho} na conta de trabalho,
   {privadas} delas em repositórios privados, e {pessoal} na pessoal". `restrictedContributionsCount`
   só da conta de trabalho; some se for 0. Mesma consulta GraphQL. Opcional: alternar Tudo/Trabalho/Pessoal.
4. **Demo "quebre a interface"** no card do TCC (grande; depois da 1), usando o cálculo real do
   score do protótipo, se for portável.
5. **O portfólio como amostra de testes** (card ou linha com links para os `.spec` e o CI).
   Pendente: Luige decidir como descrever a autoria (o `PLANO.md` diz que a implementação foi
   feita em chat com IA).
6. **Gráfico explorável por semana** (depois da 3).

Também: pôr o `PROJETO.md` em dia (código cita "seção 5.5", que não existe; 5.1.3 proíbe hover
mas o relevo existe; seção 10 x `PLANO.md` etapa 0 sobre contribuições privadas; `PLANO.md`
ainda marca a etapa 4 como "Próxima"; 6.4 sem a categoria Web).

## Repositórios investigados

- `lluigecm/autohealing-e2e-tests` (público): protótipo do TCC. Tem `healing/` (score em
  `healing/decision/confidenceScore.ts`, `decide.ts`, `recovery.ts`, heurísticas em
  `healing/heuristics/`), `mutation/catalog.ts` e resultados reais em
  `experiments/results/2026-10-12T16-32-03-131Z/` e `experiments/analysis/` (RESUMO.md, tabelas
  07 recuperação, 09/10/22 falso positivo, 19 sensibilidade do limiar, 20 scores por entrada).
- `lluigecm/TCC` (**privado**, monografia LaTeX): só para decidir; nada dele vai literalmente ao site.
- `lluigecm/lluigecm` (README do perfil): se apresenta como "Test Automation & RPA developer".
- Outros públicos a avaliar: MyGather, Parallel-Computing-Lab, FitTrack, TAC-1,
  Weather_Assistant_Pico_W, Intepolation-Methods.

## Estado

- [x] Branch atualizada com a `main` (PR #21).
- [x] Suíte de referência verde localmente: 113 testes (chromium, api-fora-do-ar, renovacao).
      WebKit não existe neste ambiente; o CI cobre.
- [x] Levantamento dos repositórios (resultados em `experiments/analysis` do protótipo; monografia
      privada ainda em rascunho, cap. 5 vazio; regra de recuperação da tese diverge da do protótipo,
      por isso o site não cita a taxa geral).
- [x] Parte 1: casos reais no diagrama do TCC (M1-T8, M5-T8, M5-T10). Commit "Parte 1". Revisão
      adversarial em seguida.
- [x] Parte 1: CI verde (inclusive WebKit). Revisão adversarial das partes 1 e 3 feita: 3 achados
      confirmados e corrigidos (limiar "provisório" nos três casos, lang="en" no texto em inglês,
      plural "os testes"); 13 descartados pelo verificador.
- [x] Parte 3: legenda por conta (trabalho, pessoal e privadas da de trabalho). Commit "Parte 3".
      Depende de o Luige confirmar que a conta de trabalho mostra as privadas no perfil; se não
      mostrar, o trecho das privadas some sozinho.
- [ ] Parte 4: demo interativa.
- [ ] Partes 2, 5 e 6: aguardam respostas do Luige.

## Perguntas em aberto para o Luige

1. O que pode contar da X-Testing (tipos de sistema, setor, números reais)? A empresa aprova?
2. O trabalho da X-Testing acontece no GitHub com a conta de trabalho? Aceita mostrar o volume
   dessa conta separado?
3. Como descrever a autoria da suíte de testes deste site?
4. O orientador permite mostrar casos/resultados do TCC antes da defesa?

## Como rodar os testes neste ambiente (nuvem)

O Playwright 1.64 procura um Chromium que não vem instalado. Criar `playwright.local.config.ts`
(fora do Git, em `.git/info/exclude`) que reaproveita `playwright.config.ts` com
`launchOptions.executablePath = "/opt/pw-browsers/chromium"` e rodar:
`npx playwright test -c playwright.local.config.ts --project=chromium --project=api-fora-do-ar --project=renovacao`.
