// API falsa do GitHub para os testes E2E: dados fixos, sem rede e sem token.
// Uso: node tests/mock-github.mjs [porta]   (padrão: 4010)
//
// Controle (usado pelo teste de renovação):
//   GET  /__estado            → { modo, graphql }   (graphql = pedidos recebidos)
//   POST /__estado  corpo: "dados" | "falha" | "novos"
//     dados: os dados fixos; falha: tudo responde 500; novos: +100 no último dia.
import { createServer } from "node:http";
import { REPOS, USERS, calendarResponse } from "./github-fixtures.mjs";

const PORT = Number(process.argv[2]) || 4010;
const NEW_DATA_BONUS = 100;

let mode = "dados";
let graphqlRequests = 0;

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => resolve(body));
  });
}

createServer(async (request, response) => {
  const url = request.url ?? "/";

  if (url === "/") return response.writeHead(200).end("ok");
  if (url === "/__estado") {
    if (request.method === "POST") mode = (await readBody(request)).trim();
    return json(response, 200, { modo: mode, graphql: graphqlRequests });
  }

  if (url === "/graphql") graphqlRequests++;
  if (mode === "falha") return json(response, 500, { message: "Server Error" });

  if (url === "/graphql" && request.method === "POST") {
    const { variables } = JSON.parse(await readBody(request));
    const known = Object.values(USERS).includes(variables?.login);
    if (!known) return json(response, 200, { data: { user: null } });
    const bonus = mode === "novos" && variables.login === USERS.personal ? NEW_DATA_BONUS : 0;
    return json(response, 200, calendarResponse(variables.login, bonus));
  }

  const match = url.match(/^\/repos\/([^/]+\/[^/?]+)(\/languages)?/);
  const repo = match && REPOS[match[1]];
  if (repo) return json(response, 200, match[2] ? repo.languages : repo.info);
  return json(response, 404, { message: "Not Found" });
}).listen(PORT, () => console.log(`API falsa do GitHub em http://localhost:${PORT}`));
