import { getContributions } from "@/lib/github";
import type { Content } from "@/types/content";
import { ContributionChart } from "./ContributionChart";

export async function Hero({ text }: { text: Content["hero"] }) {
  // Regra 14: sem dados válidos, o gráfico não aparece e o resto segue normal.
  const contributions = await getContributions();

  return (
    <div className="py-16 md:py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{text.name}</h1>
      <p className="mt-2 text-xl text-lapis">{text.title}</p>
      <p className="mt-8 max-w-texto">{text.intro}</p>
      {contributions && (
        <ContributionChart
          contributions={contributions}
          caption={text.chartCaption(contributions.total)}
          month={text.chartMonth}
        />
      )}
    </div>
  );
}
