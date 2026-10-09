import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <>
      {/* Cabeçalho provisório; o definitivo entra na etapa 6. */}
      <header className="flex justify-end px-6 pt-6">
        <ThemeToggle />
      </header>
      <main className="max-w-texto px-6 py-16">
        <h1 className="text-3xl font-semibold">Luige</h1>
        <p className="mt-2 text-lg text-lapis">Test Automation Developer</p>
      </main>
    </>
  );
}
