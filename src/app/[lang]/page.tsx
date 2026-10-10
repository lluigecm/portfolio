import { notFound } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { content, getContent } from "@/content";
import { isLocale } from "@/lib/locale";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const text = getContent(lang);
  const other = lang === "pt" ? "en" : "pt";

  return (
    <>
      {/* Cabeçalho provisório; o definitivo entra na etapa 6. */}
      <header className="flex justify-end gap-2 px-6 pt-6">
        <LanguageToggle target={other} label={content[other].ui.viewInThisLanguage} />
        <ThemeToggle labels={text.ui.theme} />
      </header>
      <main className="max-w-texto px-6 py-16">
        <h1 className="text-3xl font-semibold">{text.hero.name}</h1>
        <p className="mt-2 text-lg text-lapis">{text.hero.title}</p>
      </main>
    </>
  );
}
