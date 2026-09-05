const { createDefaultConnectionState, readJsonBody, sendJson } = require("./_utils.cjs");

module.exports = async function handler(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, createDefaultConnectionState("Live web mode is ready."));
    return;
  }

  if (request.method === "POST") {
    const body = await readJsonBody(request).catch(() => ({}));
    sendJson(response, 200, {
      ...createDefaultConnectionState(body.message ?? "Live web mode is ready."),
      ...body,
      status: body.status === "connected" ? "profile-ready" : body.status ?? "idle",
      mode: body.mode === "native" || body.mode === "container" ? "profile" : body.mode ?? "profile",
      connectedAt: null,
      updatedAt: new Date().toISOString()
    });
    return;
  }

  sendJson(response, 405, { error: "Method not allowed." });
};
