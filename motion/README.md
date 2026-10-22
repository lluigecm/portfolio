# Motion do portfólio

Um "trailer" de 47 segundos do site, no mesmo visual retrô: a TV liga, a cena sobe, o bot cai do céu, o nome se digita, PRESS TO START, e a página "rola" fase por fase enquanto o bot anda, pisa em bugs e comenta cada seção. No meio o dia nasce (botão de tema da HUD), na fase do chefe o sol se põe, e no fim tem confete e a TV desliga. A trilha chiptune (150 BPM) e os efeitos são sintetizados pela própria página, sincronizados com a animação.

Os textos, cores, morros, moitas, Lua, Sol, nuvens e o bot vêm do site (`src/content`, `src/app/globals.css`, `src/components`). Os bugs inimigos, o confete e a trilha existem só no vídeo. O gráfico "XP no GitHub" do vídeo é ilustrativo: não usa os dados reais e não mostra números.

## Ver no navegador

```bash
npx serve motion        # ou qualquer servidor estático
```

Abra a página e clique em **PRESS TO START** (o clique libera o som). Espaço pausa, ← e → pulam 5 s, R recomeça.

Parâmetros na URL:

| Parâmetro | Efeito |
|---|---|
| `?lang=en` | versão em inglês (padrão: português) |
| `?url=meusite.dev` | mostra o endereço do site no quadro final |
| `?t=12.5` | congela a animação nesse instante |

## Gerar o vídeo

Precisa do `ffmpeg` no PATH e do Chromium do Playwright (`npx playwright install chromium`).

```bash
npm run motion                          # motion/out/luige-motion-pt.mp4 e -en.mp4
npm run motion -- --lang pt             # só um idioma
npm run motion -- --url meusite.dev     # com o endereço do site no fim
npm run motion -- --stills 3.5,14,41    # só imagens desses instantes, para conferir
```

Saída: MP4 H.264 1920×1080 a 60 fps com áudio AAC, pronto para LinkedIn e afins. Outras opções: `--fps 30`, `--workers 2`, `--out pasta`.

## Como funciona

`index.html` tem uma função `render(t)` que desenha o quadro do instante `t` a partir de uma linha do tempo fixa (sem animações CSS nem sorteios sem semente), e uma `synth(taxa)` que gera a trilha a partir dos mesmos instantes. Ao vivo, o relógio é o do áudio; na gravação, `render.mjs` chama `motion.seek(t)` quadro a quadro, tira um print de cada um e entrega ao ffmpeg em paralelo.

Fontes: Press Start 2P e VT323 (SIL Open Font License), em `fonts/`.
