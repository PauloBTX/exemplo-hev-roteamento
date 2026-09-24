/**
 * Roteia o incidente para o setor responsável identificado pelo Jev.
 * @param {string} team Setor classificado (BACKEND, DATABASE, INFRASTRUCTURE, SECURITY, PAYMENTS)
 * @param {object} incident Dados do incidente
 */
function routeIncident(team, incident) {
  switch (team) {
    case "BACKEND":
      console.log("Routing incident to BACKEND team");
      // TODO: Send incident to Microsoft Teams group/webhook for BACKEND team
      break;

    case "DATABASE":
      console.log("Routing incident to DATABASE team");
      // TODO: Send incident to Microsoft Teams group/webhook for DATABASE team
      break;

    case "INFRASTRUCTURE":
      console.log("Routing incident to INFRASTRUCTURE team");
      // TODO: Send incident to Microsoft Teams group/webhook for INFRASTRUCTURE team
      break;

    case "SECURITY":
      console.log("Routing incident to SECURITY team");
      // TODO: Send incident to Microsoft Teams group/webhook for SECURITY team
      break;

    case "PAYMENTS":
      console.log("Routing incident to PAYMENTS team");
      // TODO: Send incident to Microsoft Teams group/webhook for PAYMENTS team
      break;

    default:
      console.warn(`Unrecognized team for routing: ${team}`);
      break;
  }
}

module.exports = {
  routeIncident
};
