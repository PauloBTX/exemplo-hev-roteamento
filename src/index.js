require("dotenv").config();
const express = require("express");
const { classifyIncidentWithJev } = require("./jev");
const { routeIncident } = require("./router");
const { getIncidentByType } = require("./incidents");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * Exibe os logs formatados no terminal conforme o padrão solicitado
 */
function logIncidentProcessing(incident, classification) {
  const confidencePercent = Math.round(classification.confidence * 100);

  console.log("----------------------------------------");
  console.log("NEW INCIDENT\n");
  console.log(`Service: ${incident.service || "unknown"}`);
  console.log(`Message: ${incident.message || "No message provided"}\n`);
  console.log("JEV DECISION\n");
  console.log(`Team: ${classification.team}`);
  console.log(`Confidence: ${confidencePercent}%\n`);
  console.log("ROUTING\n");
  console.log(`${classification.team} → TODO Microsoft Teams`);
  console.log("----------------------------------------\n");
}

/**
 * Função central para processar, classificar e rotear um incidente
 */
async function processIncident(incident) {
  if (!incident || !incident.message) {
    throw new Error("Dados do incidente incompletos. O campo 'message' é obrigatório.");
  }

  // 1. Classificação com Jev
  const classification = await classifyIncidentWithJev(incident);

  // 2. Log formatado no terminal
  logIncidentProcessing(incident, classification);

  // 3. Roteamento (com simulação do Microsoft Teams)
  routeIncident(classification.team, incident);

  // 4. Retorno formatado
  return {
    incident: {
      service: incident.service,
      message: incident.message
    },
    classification: {
      team: classification.team,
      confidence: classification.confidence,
      probabilities: classification.probabilities
    }
  };
}

/**
 * POST /incident
 * Recebe dados do incidente no corpo da requisição e classifica com o Jev
 */
app.post("/incident", async (req, res) => {
  try {
    const incidentData = req.body;
    const result = await processIncident(incidentData);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[ERRO NO INCIDENTE] ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /simulate/:type
 * Dispara uma simulação baseada em incidentes pré-definidos (ou aleatório)
 */
app.get("/simulate/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const incident = getIncidentByType(type);

    if (!incident) {
      return res.status(400).json({
        error: `Tipo de simulação inválido: '${type}'. Tipos permitidos: backend, database, infrastructure, security, payments, random.`
      });
    }

    const result = await processIncident(incident);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[ERRO NA SIMULAÇÃO] ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Servidor de Roteamento com Jev rodando na porta ${PORT}`);
  console.log(`Endpoint de incidente: POST http://localhost:${PORT}/incident`);
  console.log(`Simulações disponíveis: GET http://localhost:${PORT}/simulate/[backend|database|infrastructure|security|payments|random]\n`);
});
