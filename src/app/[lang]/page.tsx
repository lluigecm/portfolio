import { notFound } from "next/navigation";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Education } from "@/components/Education";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { Hud } from "@/components/Hud";
import { Inventory } from "@/components/Inventory";
import { Level } from "@/components/Level";
import { LevelMap } from "@/components/LevelMap";
import { Projects } from "@/components/Projects";
import { Scene } from "@/components/Scene";
import { Stars } from "@/components/Stars";
import { getContent } from "@/content";
import { isLocale } from "@/lib/locale";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const text = getContent(lang);

  return (
    <>
      <a href="#content" className="skip">
        {text.ui.skipToContent}
      </a>
      <Stars />
      <div className="crt" aria-hidden="true" />
      <Hud locale={lang} />
      <main id="content">
        <Hero text={text.hero} />
        <div className="wrap">
          <LevelMap text={text.map} />
          <Level id="sobre" sign="WORLD 1-1" title={text.about.title}>
            <About text={text.about} />
          </Level>
          <Level id="exp" sign="WORLD 1-2" title={text.experience.title}>
            <Experience text={text.experience} />
          </Level>
          <Level id="proj" sign="WORLD 1-3" title={text.projects.title}>
            <Projects text={text.projects} />
          </Level>
          <Level id="stack" sign="WORLD 1-4" title={text.stack.title}>
            <Inventory />
          </Level>
          <Level id="edu" sign="WORLD 1-5" title={text.education.title}>
            <Education text={text.education} />
          </Level>
          <Level id="contato" sign="BOSS STAGE" title={text.contact.title} boss>
            <Contact text={text.contact} />
          </Level>
        </div>
      </main>
      <Scene lines={text.bubble} />
    </>
  );
}
