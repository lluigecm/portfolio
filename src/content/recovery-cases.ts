// Casos reais da rodada principal do protótipo do TCC (seção 6.3), sem tradução.
// Cada linha de log é cópia literal do arquivo de resultado no repositório
// lluigecm/autohealing-e2e-tests. Os links apontam para um commit fixo, para a
// linha citada não mudar de lugar.
// Os textos de cada caso ficam em pt.ts e en.ts.
import type { RecoveryCaseId } from "@/types/content";

const REPO = "https://github.com/lluigecm/autohealing-e2e-tests";
const COMMIT = "577cc0b7eb86e4241415351f3f8b8dce81b57191";
const RUN = "experiments/results/2026-10-12T16-32-03-131Z";

/** Saída do diagrama que o caso percorre. */
export type RecoveryPath = "replaced" | "fails";

export interface RecoveryCase {
  id: RecoveryCaseId;
  path: RecoveryPath;
  /** Linha do log JSONL, como está no arquivo. */
  log: string;
  /** Endereço da linha no GitHub. */
  source: string;
}

const line = (file: string, n: number) => `${REPO}/blob/${COMMIT}/${RUN}/${file}#L${n}`;

export const recoveryCases: RecoveryCase[] = [
  // M1-T8: classe do preço renomeada; recuperação correta.
  {
    id: "price-renamed",
    path: "replaced",
    log: String.raw`{"decision":"replace","url":"/catalogue/its-only-the-himalayas_981/index.html","originalSelector":".product_main p.price_color","candidate":"locator('body > :nth-child(2) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(2)')","score":1,"threshold":0.7,"contributingHeuristics":[{"heuristic":"structural-similarity","score":1,"matched":true,"ambiguous":false,"candidateCount":1}],"flags":[],"reason":null,"decidedAt":"2026-10-12T16:49:27.527Z","rawScore":1,"factors":{"disagreement":1,"ambiguity":1,"text":1},"textSimilarity":1,"heuristics":[{"heuristic":"stable-attributes","applicable":false,"matched":false,"score":0,"ambiguous":false,"candidateCount":0,"candidate":null},{"heuristic":"structural-similarity","applicable":true,"matched":true,"score":1,"ambiguous":false,"candidateCount":1,"candidate":"locator('body > :nth-child(2) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(2)')"}],"candidateIsOracle":true,"run":{"entryId":"M1-T8","testId":"tests/product-details.spec.ts › produto de \"Travel\" exibe o preço no formato esperado e a informação de estoque","repetition":1,"condition":"healing-on"},"timings":{"detectionWaitMs":5008.806299999997,"recoveryMs":17.421900000001187,"actionMs":2.344700000001467}}`,
    source: line("healing-on/M1-T8/attempt-1/healing-w0.jsonl", 11),
  },
  // M5-T8: preço removido (defeito); o mecanismo não troca.
  {
    id: "price-removed",
    path: "fails",
    log: String.raw`{"decision":"fail","url":"/catalogue/its-only-the-himalayas_981/index.html","originalSelector":".product_main p.price_color","candidate":"locator('body > :nth-child(2) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(2)')","score":0.5,"threshold":0.7,"contributingHeuristics":[{"heuristic":"structural-similarity","score":1,"matched":true,"ambiguous":false,"candidateCount":1}],"flags":["text-corroboration-divergent"],"reason":null,"decidedAt":"2026-10-12T19:09:34.171Z","rawScore":1,"factors":{"disagreement":1,"ambiguity":1,"text":0.5},"textSimilarity":0,"heuristics":[{"heuristic":"stable-attributes","applicable":false,"matched":false,"score":0,"ambiguous":false,"candidateCount":0,"candidate":null},{"heuristic":"structural-similarity","applicable":true,"matched":true,"score":1,"ambiguous":false,"candidateCount":1,"candidate":"locator('body > :nth-child(2) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(2)')"}],"candidateIsOracle":false,"run":{"entryId":"M5-T8","testId":"tests/product-details.spec.ts › abre o primeiro produto de \"Travel\" a partir da listagem e exibe título, preço e disponibilidade","repetition":1,"condition":"healing-on"},"timings":{"detectionWaitMs":5014.1612000000005,"recoveryMs":30.944299999999203,"actionMs":null}}`,
    source: line("healing-on/M5-T8/attempt-1/healing-w20.jsonl", 1),
  },
  // M5-T10: estrelas removidas (defeito); o único falso positivo da rodada.
  {
    id: "rating-removed",
    path: "replaced",
    log: String.raw`{"decision":"replace","url":"/catalogue/its-only-the-himalayas_981/index.html","originalSelector":".product_main p.star-rating","candidate":"locator('body > :nth-child(2) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(3)')","score":0.925,"threshold":0.7,"contributingHeuristics":[{"heuristic":"structural-similarity","score":0.925,"matched":true,"ambiguous":false,"candidateCount":1}],"flags":["text-corroboration-unavailable"],"reason":null,"decidedAt":"2026-10-12T19:33:09.967Z","rawScore":0.925,"factors":{"disagreement":1,"ambiguity":1,"text":1},"textSimilarity":null,"heuristics":[{"heuristic":"stable-attributes","applicable":false,"matched":false,"score":0,"ambiguous":false,"candidateCount":0,"candidate":null},{"heuristic":"structural-similarity","applicable":true,"matched":true,"score":0.925,"ambiguous":false,"candidateCount":1,"candidate":"locator('body > :nth-child(2) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(3)')"}],"candidateIsOracle":false,"run":{"entryId":"M5-T10","testId":"tests/product-details.spec.ts › produto de \"Travel\" exibe uma classificação por estrelas válida (1 a 5)","repetition":1,"condition":"healing-on"},"timings":{"detectionWaitMs":5016.3925,"recoveryMs":20.16439999999966,"actionMs":4.158699999999953}}`,
    source: line("healing-on/M5-T10/attempt-1/healing-w10.jsonl", 1),
  },
];

/** Campos da linha de log mostrados no site, na ordem em que aparecem no arquivo. */
export const LOG_FIELDS = [
  "decision",
  "originalSelector",
  "score",
  "threshold",
  "rawScore",
  "factors",
  "textSimilarity",
  "flags",
] as const;

/** Trecho da linha de log com os campos de LOG_FIELDS, formatado para leitura. */
export function logExcerpt(log: string): string {
  const entry = JSON.parse(log) as Record<string, unknown>;
  const excerpt = Object.fromEntries(LOG_FIELDS.map((field) => [field, entry[field]]));
  return JSON.stringify(excerpt, null, 2);
}

/** Seletor que o teste usava, tirado da própria linha de log. */
export function originalSelector(log: string): string {
  return (JSON.parse(log) as { originalSelector: string }).originalSelector;
}
