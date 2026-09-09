const fs = require("node:fs");
const fsp = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { execFile, spawn } = require("node:child_process");
const {
  fetchVpnGateRelays,
  getRelaySourceStatus,
  getVpnGateConfig
} = require("./lib/vpnGate.cjs");

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "0.0.0.0";
const distDir = path.join(__dirname, "dist");
let connectionState = createDefaultConnectionState();
let vpnProcess = null;
let vpnLog = [];
let vpnProfilePath = "";
let intentionalDisconnect = false;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function createDefaultConnectionState() {
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
    message: "No active bridge session."
  };
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

function updateConnectionState(input) {
  const allowedStatuses = new Set(["idle", "connecting", "connected", "profile-ready", "handoff", "disconnecting"]);
  const allowedDeviceTypes = new Set(["web", "desktop", "mobile"]);
  const allowedModes = new Set(["demo", "profile", "native", "container"]);
  const status = allowedStatuses.has(input.status) ? input.status : connectionState.status;

  connectionState = {
    status,
    countryCode: String(input.countryCode ?? connectionState.countryCode ?? "").slice(0, 8),
    countryName: String(input.countryName ?? connectionState.countryName ?? "").slice(0, 80),
    protocol: String(input.protocol ?? connectionState.protocol ?? "").slice(0, 32),
    relayHost: String(input.relayHost ?? connectionState.relayHost ?? "").slice(0, 120),
    relayIp: String(input.relayIp ?? connectionState.relayIp ?? "").slice(0, 64),
    deviceName: String(input.deviceName ?? connectionState.deviceName ?? "").slice(0, 80),
    deviceType: allowedDeviceTypes.has(input.deviceType) ? input.deviceType : connectionState.deviceType,
    mode: allowedModes.has(input.mode) ? input.mode : connectionState.mode,
    connectedAt:
      status === "connected"
        ? String(input.connectedAt ?? connectionState.connectedAt ?? new Date().toISOString())
        : status === "idle"
          ? null
          : connectionState.connectedAt,
    updatedAt: new Date().toISOString(),
    message: String(input.message ?? connectionState.message ?? "").slice(0, 180)
  };

  if (status === "idle") {
    connectionState = {
      ...createDefaultConnectionState(),
      updatedAt: connectionState.updatedAt,
      message: connectionState.message || "Bridge disconnected."
    };
  }

  return connectionState;
}

function appendVpnLog(line) {
  const text = line.toString().trim();

  if (!text) {
    return;
  }

  vpnLog = [...vpnLog.slice(-100), text];

  if (text.includes("Initialization Sequence Completed")) {
    updateConnectionState({
      status: "connected",
      mode: "container",
      connectedAt: new Date().toISOString(),
      deviceType: connectionState.deviceType,
      message: "VPN tunnel is connected in the app runtime."
    });
  }
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 5000 }, (error, stdout) => {
      resolve(error ? "" : stdout.trim());
    });
  });
}

async function findOpenVpnBinary() {
  const knownPaths = ["/usr/sbin/openvpn", "/usr/bin/openvpn", "/sbin/openvpn", "/bin/openvpn"];

  for (const binaryPath of knownPaths) {
    try {
      await fsp.access(binaryPath);
      return binaryPath;
    } catch {
      // Continue through common container paths.
    }
  }

  return runCommand("/bin/sh", ["-lc", "command -v openvpn || true"]);
}

async function prepareContainerProfile(hostname) {
  const relayConfig = await getVpnGateConfig(hostname);
  const authPath = path.join(os.tmpdir(), "veep-n-vpngate-auth.txt");
  const targetPath = path.join(os.tmpdir(), relayConfig.filename);
  const config = /^auth-user-pass\s*$/m.test(relayConfig.config)
    ? relayConfig.config.replace(/^auth-user-pass\s*$/m, `auth-user-pass ${authPath}`)
    : `${relayConfig.config.trim()}\nauth-user-pass ${authPath}\n`;

  await fsp.writeFile(authPath, "vpn\nvpn\n", { encoding: "utf8", mode: 0o600 });
  await fsp.writeFile(targetPath, config, "utf8");
  return { ...relayConfig, targetPath };
}

async function connectContainerVpn(input) {
  if (!input.relayHost) {
    throw new Error("Choose a relay before connecting.");
  }

  const openVpnPath = await findOpenVpnBinary();

  if (!openVpnPath) {
    throw new Error("OpenVPN is not installed in this runtime.");
  }

  if (vpnProcess && !vpnProcess.killed) {
    intentionalDisconnect = true;
    vpnProcess.kill("SIGTERM");
  }

  const relayConfig = await prepareContainerProfile(input.relayHost);
  vpnLog = [];
  vpnProfilePath = relayConfig.targetPath;
  updateConnectionState({
    status: "connecting",
    countryCode: input.countryCode,
    countryName: input.countryName,
    protocol: "OpenVPN",
    relayHost: input.relayHost,
    relayIp: input.relayIp,
    deviceName: input.deviceName,
    deviceType: input.deviceType,
    mode: "container",
    message: `Connecting to ${input.countryName || input.relayHost}.`
  });

  vpnProcess = spawn(
    openVpnPath,
    [
      "--config",
      vpnProfilePath,
      "--verb",
      "3",
      "--auth-nocache",
      "--pull-filter",
      "ignore",
      "redirect-gateway"
    ],
    {
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  vpnProcess.stdout.on("data", appendVpnLog);
  vpnProcess.stderr.on("data", appendVpnLog);
  vpnProcess.on("exit", (code) => {
    appendVpnLog(`OpenVPN exited with code ${code}`);
    vpnProcess = null;

    if (intentionalDisconnect) {
      intentionalDisconnect = false;
      return;
    }

    if (connectionState.status !== "disconnecting") {
      updateConnectionState({
        status: "idle",
        message: code === 0 ? "VPN disconnected." : "VPN connection stopped before it became active."
      });
    }
  });

  return {
    ok: true,
    mode: "container",
    pid: vpnProcess.pid,
    relay: relayConfig.relay,
    state: connectionState
  };
}

async function disconnectContainerVpn() {
  updateConnectionState({
    status: "disconnecting",
    message: "Disconnecting VPN tunnel."
  });

  if (vpnProcess && !vpnProcess.killed) {
    intentionalDisconnect = true;
    vpnProcess.kill("SIGTERM");
  } else {
    vpnProcess = null;
  }

  updateConnectionState({
    status: "idle",
    message: "VPN disconnected."
  });

  return { ok: true, state: connectionState };
}

function sendFile(response, filePath) {
  const extension = path.extname(filePath);
  response.writeHead(200, {
    "content-type": contentTypes[extension] ?? "application/octet-stream",
    "cache-control": extension === ".html" ? "no-store" : "public, max-age=3600"
  });
  fs.createReadStream(filePath).pipe(response);
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      service: "veep-n",
      runtime: "docker-web",
      relaySource: getRelaySourceStatus()
    });
    return true;
  }

  if (url.pathname === "/api/runtime") {
    const openVpnPath = await findOpenVpnBinary();
    const vpnProcessRunning = Boolean(vpnProcess && !vpnProcess.killed);
    const vpnRunning = vpnProcessRunning && connectionState.status === "connected";
    sendJson(response, 200, {
      platform: "web",
      desktop: false,
      openVpnInstalled: Boolean(openVpnPath),
      openVpnPath,
      relaySource: getRelaySourceStatus(),
      vpnRunning,
      vpnConnecting: vpnProcessRunning && connectionState.status === "connecting",
      vpnLog: vpnLog.slice(-12),
      activeConnection:
        vpnRunning
          ? {
              countryCode: connectionState.countryCode,
              countryName: connectionState.countryName,
              protocol: connectionState.protocol,
              relayHost: connectionState.relayHost,
              relayIp: connectionState.relayIp,
              connectedAt: connectionState.connectedAt ?? connectionState.updatedAt
            }
          : null
    });
    return true;
  }

  if (url.pathname === "/api/connection-state") {
    if (request.method === "GET") {
      sendJson(response, 200, connectionState);
      return true;
    }

    if (request.method === "POST") {
      try {
        sendJson(response, 200, updateConnectionState(await readJsonBody(request)));
      } catch (error) {
        sendJson(response, 400, {
          error: error instanceof Error ? error.message : "Could not update connection state."
        });
      }
      return true;
    }

    sendJson(response, 405, { error: "Method not allowed." });
    return true;
  }

  if (url.pathname === "/api/relays") {
    try {
      sendJson(response, 200, await fetchVpnGateRelays({ limit: 36 }));
    } catch (error) {
      sendJson(response, 502, {
        error: error instanceof Error ? error.message : "Relay discovery failed."
      });
    }
    return true;
  }

  if (url.pathname === "/api/vpn/connect") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }

    try {
      sendJson(response, 200, await connectContainerVpn(await readJsonBody(request)));
    } catch (error) {
      updateConnectionState({
        status: "idle",
        message: error instanceof Error ? error.message : "VPN connection failed."
      });
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "VPN connection failed.",
        vpnLog: vpnLog.slice(-12)
      });
    }
    return true;
  }

  if (url.pathname === "/api/vpn/disconnect") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }

    sendJson(response, 200, await disconnectContainerVpn());
    return true;
  }

  const configMatch = url.pathname.match(/^\/api\/relays\/([^/]+)\/config$/);
  if (configMatch) {
    try {
      const relayConfig = await getVpnGateConfig(decodeURIComponent(configMatch[1]));
      response.writeHead(200, {
        "content-type": "application/x-openvpn-profile",
        "content-disposition": `attachment; filename="${relayConfig.filename}"`,
        "cache-control": "no-store"
      });
      response.end(relayConfig.config);
    } catch (error) {
      sendJson(response, 404, {
        error: error instanceof Error ? error.message : "Relay config not found."
      });
    }
    return true;
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (await handleApi(request, response, url)) {
    return;
  }

  const normalizedPath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(distDir, normalizedPath);
  const filePath =
    fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
      ? requestedPath
      : path.join(distDir, "index.html");

  sendFile(response, filePath);
});

server.listen(port, host, () => {
  console.log(`VEEP-N listening on http://${host}:${port}`);
});
