const { getRelaySourceStatus, sendJson } = require("./_utils.cjs");

module.exports = function handler(_request, response) {
  sendJson(response, 200, {
    platform: "vercel",
    desktop: false,
    openVpnInstalled: false,
    openVpnPath: "",
    relaySource: getRelaySourceStatus(),
    vpnRunning: false,
    vpnLog: ["Vercel hosts the web app. Native VPN tunnels run in Docker or the desktop app."]
  });
};
