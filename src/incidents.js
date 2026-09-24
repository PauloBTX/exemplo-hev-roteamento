const predefinedIncidents = {
  backend: {
    service: "orders-api",
    environment: "production",
    statusCode: 500,
    message: "TypeError: Cannot read properties of undefined while processing POST /orders",
    details: "Unhandled exception in OrderController.createOrder at line 142"
  },
  database: {
    service: "checkout-api",
    environment: "production",
    statusCode: 500,
    message: "Database connection pool exhausted. Timeout acquiring connection after 30000ms.",
    details: "PostgreSQL pool limit reached (max_connections=100)"
  },
  infrastructure: {
    service: "worker-service",
    environment: "production",
    statusCode: 503,
    message: "Container restarted because memory usage exceeded the configured limit.",
    details: "Kubernetes pod evicted: OOMKilled with exit code 137"
  },
  security: {
    service: "auth-service",
    environment: "production",
    statusCode: 401,
    message: "JWT signature validation failures increased significantly from multiple IP addresses.",
    details: "Over 500 failed JWT verifications in 60s from subnet 185.220.101.0/24"
  },
  payments: {
    service: "billing-service",
    environment: "production",
    statusCode: 502,
    message: "Payment gateway timeout caused 73% of checkout transactions to fail.",
    details: "Gateway provider returned HTTP 504 Gateway Timeout during PIX charge creation"
  }
};

/**
 * Retorna um incidente pré-definido pelo tipo ou um aleatório
 * @param {string} type Tipo do incidente ('backend', 'database', 'infrastructure', 'security', 'payments', 'random')
 * @returns {object|null}
 */
function getIncidentByType(type) {
  const normalizedType = (type || "").toLowerCase();

  if (normalizedType === "random") {
    const keys = Object.keys(predefinedIncidents);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return predefinedIncidents[randomKey];
  }

  return predefinedIncidents[normalizedType] || null;
}

module.exports = {
  predefinedIncidents,
  getIncidentByType
};
