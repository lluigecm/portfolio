import { notFound } from "next/navigation";
import { Contact } from "@/components/Contact";
import { Education } from "@/components/Education";
import { Experience } from "@/components/Experience";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Section } from "@/components/Section";
import { Stack } from "@/components/Stack";
import { getContent } from "@/content";
import { isLocale } from "@/lib/locale";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const text = getContent(lang);

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-md focus:bg-superficie focus:px-4 focus:py-2"
      >
        {text.ui.skipToContent}
      </a>
      <Header locale={lang} />
      <main id="content" className="mx-auto max-w-5xl px-6">
        <Hero text={text.hero} />
        <Section id="experience" title={text.ui.nav.experience}>
          <Experience text={text.experience} />
        </Section>
        <Section id="projects" title={text.ui.nav.projects}>
          <Projects text={text.projects} />
        </Section>
        <Section id="stack" title={text.ui.nav.stack}>
          <Stack text={text.stack} />
        </Section>
        <Section id="education" title={text.ui.nav.education}>
          <Education text={text.education} />
        </Section>
        <Section id="contact" title={text.ui.nav.contact}>
          <Contact text={text.contact} />
        </Section>
      </main>
    </>
  );
}
