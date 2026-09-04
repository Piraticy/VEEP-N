import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { fetchVpnGateRelays, getRelaySourceStatus, getVpnGateConfig } = require("./lib/vpnGate.cjs");

function sendJson(response: import("node:http").ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "veep-n-relay-api",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (request.url === "/api/relays") {
            try {
              sendJson(response, 200, await fetchVpnGateRelays({ limit: 80 }));
            } catch (error) {
              sendJson(response, 502, {
                error: error instanceof Error ? error.message : "Relay discovery failed."
              });
            }
            return;
          }

          if (request.url === "/api/runtime") {
            sendJson(response, 200, {
              platform: "web",
              desktop: false,
              openVpnInstalled: false,
              openVpnPath: "",
              relaySource: getRelaySourceStatus(),
              vpnRunning: false,
              vpnLog: []
            });
            return;
          }

          const match = request.url?.match(/^\/api\/relays\/([^/]+)\/config$/);
          if (match) {
            try {
              const relayConfig = await getVpnGateConfig(decodeURIComponent(match[1]));
              response.statusCode = 200;
              response.setHeader("Content-Type", "application/x-openvpn-profile");
              response.setHeader(
                "Content-Disposition",
                `attachment; filename="${relayConfig.filename}"`
              );
              response.end(relayConfig.config);
            } catch (error) {
              sendJson(response, 404, {
                error: error instanceof Error ? error.message : "Relay config not found."
              });
            }
            return;
          }

          next();
        });
      }
    }
  ],
  server: {
    port: 5173
  },
  build: {
    outDir: "dist"
  }
});
