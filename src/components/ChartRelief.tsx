"use client";

import { useEffect } from "react";

/*
 * Relevo no gráfico (seção 5.5, efeito 2): com o mouse sobre o gráfico, as
 * células perto do cursor sobem e crescem na proporção do nível do dia; dias
 * sem contribuição não se mexem. Sem sombra: o relevo é só deslocamento e
 * ampliação (princípio 5.1.4).
 *
 * Parâmetros do protótipo aprovado (intensidade 6), proporcionais à célula,
 * para a sensação ser a mesma em qualquer largura. Medidas em unidades do SVG.
 */
const MAX_LIFT = 0.65; // × tamanho da célula, nível 4 sob o cursor
const MAX_SCALE = 1.21; // nível 4 sob o cursor
const RADIUS = 7.5; // em células, com queda em cosseno até a borda
const MAX_LEVEL = 4;
// Mesma duração da transição em globals.css, para tirar o will-change depois dela.
const TRANSITION_MS = 120;

interface Props {
  svgId: string;
  /** Tamanho da célula e distância entre centros, em unidades do SVG. */
  cell: number;
  step: number;
}

export function ChartRelief({ svgId, cell, step }: Props) {
  useEffect(() => {
    const element = document.getElementById(svgId);
    if (!(element instanceof SVGSVGElement)) return;
    const svg = element;
    // Só com mouse; nada em telas de toque nem com movimento reduzido.
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const cells = [...svg.querySelectorAll<SVGRectElement>("rect[data-level]")].map((rect) => ({
      rect,
      x: rect.x.baseVal.value + cell / 2,
      y: rect.y.baseVal.value + cell / 2,
      weight: Number(rect.dataset.level) / MAX_LEVEL,
    }));

    let ready = false;
    let pointer: DOMPoint | null = null;
    let frame = 0;
    let cleanup = 0;

    function render() {
      frame = 0;
      for (const item of cells) {
        let strength = 0;
        if (pointer && item.weight > 0) {
          const distance = Math.hypot(item.x - pointer.x, item.y - pointer.y) / step;
          if (distance < RADIUS) strength = item.weight * 0.5 * (1 + Math.cos((Math.PI * distance) / RADIUS));
        }
        item.rect.style.transform =
          strength > 0
            ? `translateY(${(-MAX_LIFT * cell * strength).toFixed(2)}px) scale(${(1 + (MAX_SCALE - 1) * strength).toFixed(3)})`
            : "";
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }

    function onMove(event: PointerEvent) {
      if (!ready || event.pointerType !== "mouse") return;
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      pointer = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      window.clearTimeout(cleanup);
      svg.classList.add("grafico-relevo-ativo");
      schedule();
    }

    function onLeave() {
      pointer = null;
      schedule();
      // will-change só durante a animação: sai depois que as células voltam.
      cleanup = window.setTimeout(() => svg.classList.remove("grafico-relevo-ativo"), TRANSITION_MS);
    }

    // Só começa depois que o preenchimento (efeito 1) termina.
    Promise.allSettled(svg.getAnimations({ subtree: true }).map((animation) => animation.finished)).then(
      () => {
        ready = true;
        svg.classList.add("grafico-relevo");
      },
    );

    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerleave", onLeave);
    return () => {
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
      window.clearTimeout(cleanup);
    };
  }, [svgId, cell, step]);

  return null;
}
