import { Fragment } from "react";
import { inventory } from "@/content/game";

/* Inventário da stack: as quatro ferramentas principais com borda amarela. */
export function Inventory() {
  return (
    <div className="inv" role="list">
      {inventory.map(({ lines, count, main }) => (
        <div key={lines.join(" ")} className={main ? "slot main" : "slot"} role="listitem">
          <b>
            {lines.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </b>
          <small>×{count}</small>
        </div>
      ))}
    </div>
  );
}
