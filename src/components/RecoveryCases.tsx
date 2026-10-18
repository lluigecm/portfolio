import type { ReactNode } from "react";
import { logExcerpt, originalSelector, recoveryCases } from "@/content/recovery-cases";
import type { RecoveryCasesText, RichText } from "@/types/content";

/*
 * Casos reais do protótipo do TCC, abaixo do diagrama (seção 6.3). Cada opção
 * mostra o seu caso e destaca no diagrama o caminho que o mecanismo seguiu.
 * Tudo em HTML e CSS (globals.css, :has() sobre o radio marcado): funciona sem
 * JavaScript, e as setas do teclado trocam de caso como em qualquer grupo de
 * opções. Sem caso escolhido, o diagrama fica como sempre foi.
 */
export function RecoveryCases({ text }: { text: RecoveryCasesText }) {
  const { fields } = text;
  return (
    <div className="mx-auto mt-6 max-w-texto">
      <fieldset>
        <legend className="font-semibold">{text.legend}</legend>
        <p className="mt-1 text-sm text-lapis">{text.intro}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {recoveryCases.map(({ id, path }) => (
            <label
              key={id}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-linha bg-superficie px-3 py-2 text-sm has-checked:border-ambar"
            >
              <input
                type="radio"
                name="recovery-case"
                value={id}
                data-caminho={path}
                className="accent-ambar"
              />
              {text.cases[id].label}
            </label>
          ))}
        </div>
      </fieldset>

      {recoveryCases.map(({ id, log, source }) => {
        const item = text.cases[id];
        return (
          <div key={id} data-caso={id} className="mt-4 text-sm">
            <p>{item.summary}</p>
            <dl className="mt-3 grid gap-x-4 md:grid-cols-[11rem_1fr]">
              <Field term={fields.selector}>
                <code className="font-mono">{originalSelector(log)}</code>
              </Field>
              <Field term={fields.change}>
                <Rich text={item.change} />
              </Field>
              <Field term={fields.candidate}>
                <Rich text={item.candidate} />
              </Field>
              <Field term={fields.score}>{item.score}</Field>
              <Field term={fields.outcome}>{item.outcome}</Field>
            </dl>
            <p className="mt-3 text-lapis">{text.logLabel}</p>
            {/* O pre fica na fonte do corpo: a mono é só do código (seção 5.3). */}
            <pre className="mt-1 rounded-md border border-linha bg-superficie p-3 font-sans text-xs whitespace-pre-wrap [overflow-wrap:anywhere]">
              <code className="font-mono">{logExcerpt(log)}</code>
            </pre>
            <a
              href={source}
              className="mt-2 inline-block underline decoration-linha underline-offset-4 hover:decoration-grafite"
            >
              {text.logLink}
            </a>
          </div>
        );
      })}
    </div>
  );
}

function Field({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="mt-2 text-lapis md:mt-1">{term}</dt>
      <dd className="md:mt-1">{children}</dd>
    </>
  );
}

function Rich({ text }: { text: RichText }) {
  return text.map((part, i) =>
    typeof part === "string" ? (
      part
    ) : (
      <code key={i} lang={part.lang} className="font-mono [overflow-wrap:anywhere]">
        {part.code}
      </code>
    ),
  );
}
