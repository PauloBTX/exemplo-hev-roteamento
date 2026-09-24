require("dotenv").config();
const { runJevBenchmark } = require("./benchmark");

const iterations = parseInt(process.argv[2], 10) || 1000;
const concurrency = parseInt(process.argv[3], 10) || 15;

(async () => {
  try {
    await runJevBenchmark(iterations, concurrency);
    process.exit(0);
  } catch (err) {
    console.error("Falha ao executar benchmark:", err.message);
    process.exit(1);
  }
})();
