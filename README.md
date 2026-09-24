# Jev Incident Router ⚡

Demonstração prática do modelo **Jev** da TypeSafe AI (`~typesafe/jev-latest`) utilizando a **Decisions API** do OpenRouter para classificar e rotear incidentes de backend em tempo real.

O Jev é um modelo *"System One"*: em vez de gerar texto conversacional com risco de alucinação e alta latência, ele toma decisões probabilísticas, estruturadas e tipadas com extrema velocidade e baixo custo.

---

## 🚀 Como Executar

### 1. Instalar as dependências

```bash
npm install
```

### 2. Configurar as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e configure sua chave do OpenRouter:

```env
OPENROUTER_API_KEY=sua_chave_aqui
PORT=3000
```

### 3. Iniciar o servidor

```bash
npm start
```

Ou em modo de desenvolvimento (com auto-reload do Node):

```bash
npm run dev
```

---

## 📡 Endpoints e Exemplos de Uso

### 1. Enviar Incidente Personalizado (`POST /incident`)

Envia um erro ou incidente customizado para classificação imediata:

```bash
curl -X POST http://localhost:3000/incident \
  -H "Content-Type: application/json" \
  -d '{
    "service": "checkout-api",
    "environment": "production",
    "statusCode": 500,
    "message": "Database connection pool exhausted",
    "details": "Timeout acquiring connection after 30000ms"
  }'
```

**Exemplo de Resposta:**

```json
{
  "incident": {
    "service": "checkout-api",
    "message": "Database connection pool exhausted"
  },
  "classification": {
    "team": "DATABASE",
    "confidence": 1,
    "probabilities": {
      "BACKEND": 0,
      "DATABASE": 1,
      "INFRASTRUCTURE": 0,
      "SECURITY": 0,
      "PAYMENTS": 0
    }
  }
}
```

---

### 2. Simular Incidentes Pré-definidos (`GET /simulate/:type`)

Simula incidentes reais de backend para teste rápido no navegador ou terminal:

- **Backend / Lógica da aplicação:**
  ```bash
  curl http://localhost:3000/simulate/backend
  ```

- **Banco de Dados / Conexões:**
  ```bash
  curl http://localhost:3000/simulate/database
  ```

- **Infraestrutura / Servidores / Pods:**
  ```bash
  curl http://localhost:3000/simulate/infrastructure
  ```

- **Segurança / Autenticação suspeita:**
  ```bash
  curl http://localhost:3000/simulate/security
  ```

- **Pagamentos / Gateways:**
  ```bash
  curl http://localhost:3000/simulate/payments
  ```

- **Aleatório (sorteia um dos cenários acima):**
  ```bash
  curl http://localhost:3000/simulate/random
  ```

---

### 3. Benchmark de 1000 Requisições e Margem de Erro (`GET /benchmark`)

Executa um teste em lote de **1000 requisições** contra o Jev sorteando exemplos aleatórios. No final, exibe a distribuição exata entre os setores no `routeIncident`, a taxa de acurácia e a margem de erro.

- **Via HTTP (Navegador ou cURL):**
  ```bash
  curl http://localhost:3000/benchmark
  ```
  *Parâmetros opcionais:*
  `http://localhost:3000/benchmark?iterations=1000&concurrency=25`

- **Ou direto via CLI:**
  ```bash
  npm run benchmark
  ```

**Exemplo de Resposta do Benchmark:**

```json
{
  "totalRequests": 1000,
  "successfulRequests": 1000,
  "failedRequests": 0,
  "durationSeconds": 14.39,
  "throughputRps": 69.5,
  "routesDistribution": {
    "BACKEND": 207,
    "DATABASE": 191,
    "INFRASTRUCTURE": 197,
    "SECURITY": 195,
    "PAYMENTS": 210
  },
  "metrics": {
    "correctDecisions": 1000,
    "incorrectDecisions": 0,
    "accuracyPercentage": "100.00%",
    "errorRatePercentage": "0.00%"
  },
  "detailsByCategory": {
    "BACKEND": { "expectedTotal": 207, "routedToTeam": 207, "correct": 207, "incorrect": 0, "accuracyPercentage": "100.00%" },
    "DATABASE": { "expectedTotal": 191, "routedToTeam": 191, "correct": 191, "incorrect": 0, "accuracyPercentage": "100.00%" },
    "INFRASTRUCTURE": { "expectedTotal": 197, "routedToTeam": 197, "correct": 197, "incorrect": 0, "accuracyPercentage": "100.00%" },
    "SECURITY": { "expectedTotal": 195, "routedToTeam": 195, "correct": 195, "incorrect": 0, "accuracyPercentage": "100.00%" },
    "PAYMENTS": { "expectedTotal": 210, "routedToTeam": 210, "correct": 210, "incorrect": 0, "accuracyPercentage": "100.00%" }
  }
}
```

---

## 📂 Estrutura do Projeto

```text
.
├── .env                  # Chave da API e configurações locais
├── .env.example          # Modelo de variáveis de ambiente
├── .gitignore            # Ignora node_modules e .env
├── package.json          # Dependências mínimas (Express, dotenv)
├── README.md             # Instruções de uso e documentação
└── src/
    ├── incidents.js      # Catálogo de incidentes pré-definidos para simulação
    ├── index.js          # Servidor Express, rotas e logs formatados
    ├── jev.js            # Integração com a Decisions API do OpenRouter (~typesafe/jev-latest)
    └── router.js         # Função routeIncident() com os TODOs para Microsoft Teams
```
