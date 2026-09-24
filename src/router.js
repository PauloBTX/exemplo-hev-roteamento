/**
 * Roteia o incidente para o setor responsável identificado pelo Jev.
 * @param {string} team Setor classificado (BACKEND, DATABASE, INFRASTRUCTURE, SECURITY, PAYMENTS)
 * @param {object} incident Dados do incidente
 * @param {object} [options] Opções de roteamento (ex: { quiet: true })
 */
function routeIncident(team, incident, options = {}) {
  const isQuiet = options.quiet === true;

  switch (team) {
    case "BACKEND":
      if (!isQuiet) console.log("Routing incident to BACKEND team");
      // TODO: Send incident to Microsoft Teams group/webhook for BACKEND team
      break;

    case "DATABASE":
      if (!isQuiet) console.log("Routing incident to DATABASE team");
      // TODO: Send incident to Microsoft Teams group/webhook for DATABASE team
      break;

    case "INFRASTRUCTURE":
      if (!isQuiet) console.log("Routing incident to INFRASTRUCTURE team");
      // TODO: Send incident to Microsoft Teams group/webhook for INFRASTRUCTURE team
      break;

    case "SECURITY":
      if (!isQuiet) console.log("Routing incident to SECURITY team");
      // TODO: Send incident to Microsoft Teams group/webhook for SECURITY team
      break;

    case "PAYMENTS":
      if (!isQuiet) console.log("Routing incident to PAYMENTS team");
      // TODO: Send incident to Microsoft Teams group/webhook for PAYMENTS team
      break;

    default:
      if (!isQuiet) console.warn(`Unrecognized team for routing: ${team}`);
      break;
  }
}

module.exports = {
  routeIncident
};
