const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { execFile, spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const {
  fetchVpnGateRelays,
  getRelaySourceStatus,
  getVpnGateConfig
} = require("../lib/vpnGate.cjs");

const isDev = Boolean(process.env.VEEP_N_DEV_URL);
let vpnProcess = null;
let vpnLog = [];

function runCommand(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 5000 }, (error, stdout) => {
      resolve(error ? "" : stdout.trim());
    });
  });
}

async function findOpenVpnBinary() {
  const knownPaths = [
    "/opt/homebrew/sbin/openvpn",
    "/usr/local/sbin/openvpn",
    "/usr/sbin/openvpn",
    "/usr/bin/openvpn"
  ];

  for (const binaryPath of knownPaths) {
    try {
      await fs.access(binaryPath);
      return binaryPath;
    } catch {
      // Keep searching common installation paths.
    }
  }

  return runCommand("/bin/sh", ["-lc", "command -v openvpn || true"]);
}

async function getRuntimeStatus() {
  const openVpnPath = await findOpenVpnBinary();
  return {
    platform: process.platform,
    desktop: true,
    openVpnInstalled: Boolean(openVpnPath),
    openVpnPath,
    relaySource: getRelaySourceStatus(),
    vpnRunning: Boolean(vpnProcess && !vpnProcess.killed),
    vpnLog: vpnLog.slice(-12)
  };
}

function appendVpnLog(line) {
  vpnLog = [...vpnLog.slice(-80), line.toString().trim()].filter(Boolean);
}

async function writeRelayProfile(hostname) {
  const relayConfig = await getVpnGateConfig(hostname);
  const targetPath = path.join(app.getPath("downloads"), relayConfig.filename);
  await fs.writeFile(targetPath, relayConfig.config, "utf8");
  return { ...relayConfig, targetPath };
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 700,
    title: "VEEP-N",
    backgroundColor: "#08111f",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    window.loadURL(process.env.VEEP_N_DEV_URL);
  } else {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("vpn:connect", async (_event, request) => {
    if (request.relayHost) {
      const relayConfig = await writeRelayProfile(request.relayHost);

      if (request.nativeConnect) {
        const openVpnPath = await findOpenVpnBinary();

        if (!openVpnPath) {
          return {
            ok: false,
            mode: "profile-ready",
            connectedAt: new Date().toISOString(),
            countryCode: request.countryCode,
            protocol: request.protocol,
            relayHost: request.relayHost,
            relayIp: request.relayIp,
            filePath: relayConfig.targetPath,
            openError: "OpenVPN is not installed on this computer."
          };
        }

        if (vpnProcess && !vpnProcess.killed) {
          vpnProcess.kill("SIGTERM");
        }

        vpnLog = [];
        vpnProcess = spawn(openVpnPath, ["--config", relayConfig.targetPath, "--verb", "3"], {
          stdio: ["ignore", "pipe", "pipe"]
        });

        vpnProcess.stdout.on("data", appendVpnLog);
        vpnProcess.stderr.on("data", appendVpnLog);
        vpnProcess.on("exit", (code) => appendVpnLog(`OpenVPN exited with code ${code}`));

        return {
          ok: true,
          mode: "native",
          connectedAt: new Date().toISOString(),
          countryCode: request.countryCode,
          protocol: request.protocol,
          relayHost: request.relayHost,
          relayIp: request.relayIp,
          filePath: relayConfig.targetPath,
          pid: vpnProcess.pid
        };
      }

      const openError = await shell.openPath(relayConfig.targetPath);

      return {
        ok: !openError,
        mode: "profile-ready",
        connectedAt: new Date().toISOString(),
        countryCode: request.countryCode,
        protocol: request.protocol,
        relayHost: request.relayHost,
        relayIp: request.relayIp,
        filePath: relayConfig.targetPath,
        openError
      };
    }

    return {
      ok: true,
      mode: "simulated",
      connectedAt: new Date().toISOString(),
      countryCode: request.countryCode,
      protocol: request.protocol,
      relayHost: request.relayHost,
      relayIp: request.relayIp
    };
  });

  ipcMain.handle("vpn:disconnect", async () => {
    if (vpnProcess && !vpnProcess.killed) {
      vpnProcess.kill("SIGTERM");
      vpnProcess = null;
    }

    return { ok: true, disconnectedAt: new Date().toISOString() };
  });

  ipcMain.handle("vpn:listRelays", async () => {
    return fetchVpnGateRelays({ limit: 80 });
  });

  ipcMain.handle("vpn:getRuntimeStatus", getRuntimeStatus);

  ipcMain.handle("vpn:exportRelayConfig", async (_event, hostname) => {
    const relayConfig = await writeRelayProfile(hostname);
    return { ok: true, filePath: relayConfig.targetPath, relay: relayConfig.relay };
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
