const { classifyIncidentWithJev, ALLOWED_TEAMS } = require("./jev");
const { routeIncident } = require("./router");
const { getRandomIncident } = require("./incidents");

/**
 * Executa um benchmark com N iterações, sorteando incidentes aleatórios e medindo
 * a distribuição de rotas e a margem de erro da classificação com o Jev.
 * 
 * @param {number} totalIterations Quantidade de requisições a executar (default: 1000)
 * @param {number} concurrency Concorrência de requisições simultâneas (default: 15)
 * @returns {Promise<object>}
 */
async function runJevBenchmark(totalIterations = 1000, concurrency = 15) {
  const startTime = Date.now();

  const routesDistribution = {};
  ALLOWED_TEAMS.forEach(team => {
    routesDistribution[team] = 0;
  });

  const categoryStats = {};
  ALLOWED_TEAMS.forEach(team => {
    categoryStats[team] = {
      expectedCount: 0,
      correctCount: 0,
      incorrectCount: 0
    };
  });

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let completed = 0;

  console.log(`\n========================================`);
  console.log(`INICIANDO BENCHMARK JEV: ${totalIterations} REQUISIÇÕES`);
  console.log(`Concorrência: ${concurrency} requisições paralelas simultâneas`);
  console.log(`========================================\n`);

  // Gerador de tarefas
  const tasks = Array.from({ length: totalIterations }, (_, i) => i + 1);

  // Pool de concorrência com Workers
  async function worker(items) {
    for (const id of items) {
      const incident = getRandomIncident();
      const expectedTeam = incident.expectedTeam;

      categoryStats[expectedTeam].expectedCount++;

      try {
        const classification = await classifyIncidentWithJev(incident);
        const actualTeam = classification.team;

        // Executa o roteamento (modo silencioso para não poluir terminal)
        routeIncident(actualTeam, incident, { quiet: true });

        // Incrementa contagem de rota
        if (routesDistribution[actualTeam] !== undefined) {
          routesDistribution[actualTeam]++;
        } else {
          routesDistribution[actualTeam] = 1;
        }

        totalSuccess++;

        // Checagem de acurácia
        if (actualTeam === expectedTeam) {
          totalCorrect++;
          categoryStats[expectedTeam].correctCount++;
        } else {
          totalIncorrect++;
          categoryStats[expectedTeam].incorrectCount++;
          console.warn(`[DIVERGÊNCIA #${id}] Esperado: ${expectedTeam} | Recebido: ${actualTeam}`);
        }
      } catch (err) {
        totalFailed++;
        console.error(`[FALHA NA REQUISIÇÃO #${id}] ${err.message}`);
      }

      completed++;
      if (completed % 100 === 0 || completed === totalIterations) {
        process.stdout.write(`Progresso: ${completed}/${totalIterations} (${Math.round((completed / totalIterations) * 100)}%)\r`);
      }
    }
  }

  // Divide as tarefas em filas para cada worker paralelo
  const chunks = Array.from({ length: concurrency }, () => []);
  tasks.forEach((task, idx) => {
    chunks[idx % concurrency].push(task);
  });

  // Executa os workers em paralelo
  await Promise.all(chunks.map(chunk => worker(chunk)));

  console.log("\n");

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(2);
  const throughputRps = (totalSuccess / (durationMs / 1000)).toFixed(2);

  const accuracy = totalSuccess > 0 ? ((totalCorrect / totalSuccess) * 100).toFixed(2) : "0.00";
  const errorRate = totalSuccess > 0 ? ((totalIncorrect / totalSuccess) * 100).toFixed(2) : "0.00";

  const detailsByCategory = {};
  ALLOWED_TEAMS.forEach(team => {
    const stats = categoryStats[team];
    const teamAccuracy = stats.expectedCount > 0 
      ? ((stats.correctCount / stats.expectedCount) * 100).toFixed(2) 
      : "100.00";

    detailsByCategory[team] = {
      expectedTotal: stats.expectedCount,
      routedToTeam: routesDistribution[team],
      correct: stats.correctCount,
      incorrect: stats.incorrectCount,
      accuracyPercentage: `${teamAccuracy}%`
    };
  });

  // Log formatado no terminal
  console.log(`========================================`);
  console.log(`RESULTADO DO BENCHMARK (${totalIterations} REQUISIÇÕES)`);
  console.log(`========================================`);
  console.log(`Tempo total: ${durationSec}s | Throughput: ${throughputRps} req/s`);
  console.log(`Requisições com sucesso: ${totalSuccess}/${totalIterations}`);
  if (totalFailed > 0) {
    console.log(`Requisições com erro de rede: ${totalFailed}`);
  }
  console.log(`\nDistribuição por RouteIncident:`);
  ALLOWED_TEAMS.forEach(team => {
    const count = routesDistribution[team];
    const pct = totalSuccess > 0 ? ((count / totalSuccess) * 100).toFixed(1) : "0.0";
    console.log(`  - ${team.padEnd(16)}: ${count} (${pct}%)`);
  });
  console.log(`\nPrecisão e Margem de Erro:`);
  console.log(`  - Decisões Corretas: ${totalCorrect}`);
  console.log(`  - Decisões Incorretas: ${totalIncorrect}`);
  console.log(`  - Taxa de Acurácia: ${accuracy}%`);
  console.log(`  - Margem de Erro:   ${errorRate}%`);
  console.log(`========================================\n`);

  return {
    totalRequests: totalIterations,
    successfulRequests: totalSuccess,
    failedRequests: totalFailed,
    durationSeconds: parseFloat(durationSec),
    throughputRps: parseFloat(throughputRps),
    routesDistribution,
    metrics: {
      correctDecisions: totalCorrect,
      incorrectDecisions: totalIncorrect,
      accuracyPercentage: `${accuracy}%`,
      errorRatePercentage: `${errorRate}%`
    },
    detailsByCategory
  };
}

module.exports = {
  runJevBenchmark
};
