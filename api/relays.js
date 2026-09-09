const { fetchVpnGateRelays, sendJson } = require("./_utils.cjs");

module.exports = async function handler(_request, response) {
  try {
    sendJson(response, 200, await fetchVpnGateRelays({ limit: 36 }));
  } catch (error) {
    sendJson(response, 502, {
      error: error instanceof Error ? error.message : "Relay discovery failed."
    });
  }
};
