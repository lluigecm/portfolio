import type { Content } from "@/types/content";

export function Hero({ text }: { text: Content["hero"] }) {
  return (
    <div className="py-16 md:py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{text.name}</h1>
      <p className="mt-2 text-xl text-lapis">{text.title}</p>
      <p className="mt-8 max-w-texto">{text.intro}</p>
      {/* O gráfico de contribuições entra aqui, em largura total (etapa 9). */}
    </div>
  );
}
