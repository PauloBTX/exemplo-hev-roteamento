require("dotenv").config();
const express = require("express");
const { classifyIncidentWithJev } = require("./jev");
const { routeIncident } = require("./router");
const { getIncidentByType } = require("./incidents");
const { runJevBenchmark } = require("./benchmark");

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

/**
 * GET /benchmark
 * Executa N requisições (padrão: 1000) contra o Jev para medir a distribuição
 * entre os setores do routeIncident e a margem de erro.
 * Query params opcionais: ?iterations=1000&concurrency=15
 */
app.get("/benchmark", async (req, res) => {
  // Aumenta timeout do socket para suportar o lote de 1000 requisições
  req.setTimeout(600000); // 10 minutos
  res.setTimeout(600000);

  const iterations = parseInt(req.query.iterations, 10) || 1000;
  const concurrency = parseInt(req.query.concurrency, 10) || 15;

  try {
    const benchmarkResult = await runJevBenchmark(iterations, concurrency);
    return res.status(200).json(benchmarkResult);
  } catch (error) {
    console.error(`[ERRO NO BENCHMARK] ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Servidor de Roteamento com Jev rodando na porta ${PORT}`);
  console.log(`Endpoint de incidente: POST http://localhost:${PORT}/incident`);
  console.log(`Simulações disponíveis: GET http://localhost:${PORT}/simulate/[backend|database|infrastructure|security|payments|random]`);
  console.log(`Benchmark / Margem de Erro: GET http://localhost:${PORT}/benchmark?iterations=1000\n`);
});
