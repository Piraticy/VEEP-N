const { createDefaultConnectionState, sendJson } = require("../_utils.cjs");

module.exports = function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    state: createDefaultConnectionState("Live web mode cleared.")
  });
};
