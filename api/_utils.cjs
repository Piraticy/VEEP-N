const {
  fetchVpnGateRelays,
  getRelaySourceStatus,
  getVpnGateConfig
} = require("../lib/vpnGate.cjs");

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(body));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let receivedBytes = 0;

    request.on("data", (chunk) => {
      receivedBytes += chunk.length;

      if (receivedBytes > 64 * 1024) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    request.on("error", reject);
  });
}

function createDefaultConnectionState(message = "No active bridge session.") {
  return {
    status: "idle",
    countryCode: "",
    countryName: "",
    protocol: "",
    relayHost: "",
    relayIp: "",
    deviceName: "",
    deviceType: "web",
    mode: "profile",
    connectedAt: null,
    updatedAt: new Date().toISOString(),
    message
  };
}

module.exports = {
  createDefaultConnectionState,
  fetchVpnGateRelays,
  getRelaySourceStatus,
  getVpnGateConfig,
  readJsonBody,
  sendJson
};
