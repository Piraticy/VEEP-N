const { getVpnGateConfig, sendJson } = require("../../_utils.cjs");

module.exports = async function handler(request, response) {
  const hostname = Array.isArray(request.query.hostname) ? request.query.hostname[0] : request.query.hostname;

  try {
    const relayConfig = await getVpnGateConfig(hostname);
    response.statusCode = 200;
    response.setHeader("content-type", "application/x-openvpn-profile");
    response.setHeader("content-disposition", `attachment; filename="${relayConfig.filename}"`);
    response.setHeader("cache-control", "no-store");
    response.end(relayConfig.config);
  } catch (error) {
    sendJson(response, 404, {
      error: error instanceof Error ? error.message : "Relay config not found."
    });
  }
};
