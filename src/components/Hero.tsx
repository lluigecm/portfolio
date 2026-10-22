import { getContributions } from "@/lib/github";
import type { Content } from "@/types/content";
import { ContributionChart } from "./ContributionChart";

const panel = "border-4 border-linha bg-painel shadow-dura-lg";

/*
 * Topo (seção 5.4): caixa de diálogo de jogo, com borda grossa e cantos retos,
 * alinhada à esquerda; abaixo, o gráfico num painel próprio.
 */
export async function Hero({ text }: { text: Content["hero"] }) {
  // Regra 14: sem dados válidos, o gráfico não aparece e o resto segue normal.
  const contributions = await getContributions();

  return (
    <div className="py-10 md:py-16">
      <div data-ui="painel" className={`${panel} p-6 md:p-8`}>
        <h1 className="text-3xl text-destaque">{text.name}</h1>
        <p className="mt-4 text-xl text-secundario">{text.title}</p>
        <p className="mt-6 max-w-texto">{text.intro}</p>
      </div>
      {contributions && (
        <div data-ui="painel" className={`${panel} mt-8 p-4 md:p-6`}>
          <ContributionChart
            contributions={contributions}
            caption={text.chartCaption(contributions)}
            month={text.chartMonth}
          />
        </div>
      )}
    </div>
  );
}
