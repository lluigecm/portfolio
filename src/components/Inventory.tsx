"use client";

import { Fragment, type KeyboardEvent, useRef, useState } from "react";
import { inventory } from "@/content/game";
import type { Content } from "@/types/content";

/*
 * Inventário da stack: cada casa é um botão que equipa o item e mostra os
 * detalhes no quadro de baixo. As setas ← e → andam entre as casas (Home e End
 * vão às pontas). Sem JavaScript, o quadro mostra o primeiro item.
 */
export function Inventory({ text }: { text: Content["stack"] }) {
  const [selected, setSelected] = useState(0);
  const slots = useRef<(HTMLButtonElement | null)[]>([]);
  const item = inventory[selected];
  const details = text.items[item.id];

  function choose(index: number) {
    setSelected(index);
    slots.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const last = inventory.length - 1;
    const focused = slots.current.findIndex((slot) => slot === event.target);
    const from = focused >= 0 ? focused : selected;
    const moves: Record<string, number> = {
      ArrowRight: from === last ? 0 : from + 1,
      ArrowLeft: from === 0 ? last : from - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    choose(moves[event.key]);
  }

  return (
    <>
      <p className="inv-hint">{text.hint}</p>
      <ul className="inv" onKeyDown={onKeyDown}>
        {inventory.map(({ id, lines, count, main }, i) => (
          <li key={id}>
            <button
              ref={(el) => {
                slots.current[i] = el;
              }}
              type="button"
              className={main ? "slot main" : "slot"}
              aria-pressed={i === selected}
              aria-controls="item-info"
              data-fala={`ITEM: ${lines.join(" ").toUpperCase()} ×${count}`}
              onClick={() => choose(i)}
            >
              <b>
                {lines.map((line, j) => (
                  <Fragment key={line}>
                    {j > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </b>
              <small>×{count}</small>
            </button>
          </li>
        ))}
      </ul>
      <div className="panel item-info" id="item-info" aria-live="polite" data-testid="item-info">
        <p className="item-label px">{text.selected}</p>
        <div className="item-head">
          <p className="item-name px">{item.lines.join(" ")}</p>
          <span className="item-cat px">{details.category}</span>
          <b className="item-count">×{item.count}</b>
        </div>
        <p>{details.description}</p>
        <div className="bar">
          <i style={{ width: `${item.count}%` }} />
        </div>
      </div>
    </>
  );
}
