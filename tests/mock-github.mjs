// API falsa do GitHub para os testes E2E: dados fixos, sem rede e sem token.
// Uso: node tests/mock-github.mjs (porta 4010).
import { createServer } from "node:http";

// As estrelas continuam aqui de propósito: os testes provam que o site não as mostra.
export const REPOS = {
  "lluigecm/autohealing-e2e-tests": {
    info: { stargazers_count: 7, pushed_at: "2026-09-15T12:00:00Z" },
    languages: { TypeScript: 9000, JavaScript: 1000 },
  },
  "lluigecm/MyGather": {
    info: { stargazers_count: 1234, pushed_at: "2026-08-01T12:00:00Z" },
    languages: { TypeScript: 50000, HTML: 4000, CSS: 3000, JavaScript: 100 },
  },
};

const PORT = 4010;

createServer((request, response) => {
  const match = request.url?.match(/^\/repos\/([^/]+\/[^/?]+)(\/languages)?/);
  const repo = match && REPOS[match[1]];
  if (request.url === "/") {
    response.writeHead(200).end("ok");
  } else if (repo) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(match[2] ? repo.languages : repo.info));
  } else {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ message: "Not Found" }));
  }
}).listen(PORT, () => console.log(`API falsa do GitHub em http://localhost:${PORT}`));
