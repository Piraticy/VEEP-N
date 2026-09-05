const { getRelaySourceStatus, sendJson } = require("./_utils.cjs");

module.exports = function handler(_request, response) {
  sendJson(response, 200, {
    ok: true,
    service: "veep-n",
    runtime: "vercel-web",
    relaySource: getRelaySourceStatus()
  });
};
