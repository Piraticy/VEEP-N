const { readJsonBody, sendJson } = require("../_utils.cjs");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  await readJsonBody(request).catch(() => ({}));
  sendJson(response, 501, {
    error: "Live Vercel mode cannot start a VPN tunnel. Use Docker or the desktop app to connect through the app."
  });
};
