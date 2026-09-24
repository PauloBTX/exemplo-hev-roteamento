const ALLOWED_TEAMS = [
  "BACKEND",
  "DATABASE",
  "INFRASTRUCTURE",
  "SECURITY",
  "PAYMENTS"
];

const TEAM_CRITERIA = {
  BACKEND: "Erros de API, lógica da aplicação, endpoints, exceções, validações, bugs e comportamento incorreto do backend.",
  DATABASE: "Problemas de banco de dados, conexão, timeout, queries, pool de conexões, deadlocks, replicação ou indisponibilidade do banco.",
  INFRASTRUCTURE: "Problemas de servidor, container, CPU, memória, disco, rede, DNS, deploy, proxy, balanceador ou infraestrutura.",
  SECURITY: "Tentativas de acesso indevido, autenticação suspeita, ataques, credenciais, tokens, vulnerabilidades ou comportamento relacionado à segurança.",
  PAYMENTS: "Problemas de pagamento, cobrança, gateway de pagamento, transações, cartão, PIX, recusas ou processamento financeiro."
};

/**
 * Converte o objeto de incidente em texto formatado para o state do Jev
 * @param {object} incident 
 * @returns {string}
 */
function formatIncidentState(incident) {
  const parts = [];

  if (incident.service) parts.push(`Service: ${incident.service}`);
  if (incident.environment) parts.push(`Environment: ${incident.environment}`);
  if (incident.statusCode) parts.push(`HTTP Status: ${incident.statusCode}`);
  if (incident.message) parts.push(`Message: ${incident.message}`);
  if (incident.details) parts.push(`Details: ${incident.details}`);

  return parts.join("\n");
}

/**
 * Classifica um incidente utilizando o modelo Jev da TypeSafe AI via OpenRouter Decisions API
 * @param {object} incident
 * @returns {Promise<{ team: string, confidence: number, probabilities: Record<string, number> }>}
 */
async function classifyIncidentWithJev(incident) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "sua_chave_aqui") {
    throw new Error("OPENROUTER_API_KEY não configurada. Defina sua chave no arquivo .env.");
  }

  const state = formatIncidentState(incident);

  const payload = {
    model: "~typesafe/jev-latest",
    state: state,
    questions: {
      team: {
        type: "choice",
        instructions: "Qual setor é o principal responsável por investigar este incidente?",
        criteria: TEAM_CRITERIA
      }
    }
  };

  let response;
  try {
    response = await fetch("https://openrouter.ai/api/alpha/decisions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (networkError) {
    throw new Error(`Falha de conexão com a OpenRouter Decisions API: ${networkError.message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter retornou erro HTTP ${response.status}: ${errorBody}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`Resposta do OpenRouter não é um JSON válido: ${parseError.message}`);
  }

  const answer = data?.answers?.team;
  if (!answer || !answer.choice) {
    throw new Error(`Resposta do modelo Jev inválida ou incompleta: ${JSON.stringify(data)}`);
  }

  const selectedTeam = answer.choice;
  if (!ALLOWED_TEAMS.includes(selectedTeam)) {
    throw new Error(`Categoria retornada pelo Jev (${selectedTeam}) não é reconhecida.`);
  }

  return {
    team: selectedTeam,
    confidence: answer.confidence ?? 1,
    probabilities: answer.probabilities ?? { [selectedTeam]: 1 }
  };
}

module.exports = {
  classifyIncidentWithJev,
  formatIncidentState,
  ALLOWED_TEAMS
};
