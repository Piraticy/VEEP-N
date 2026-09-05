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
let mainWindow = null;
let pendingDeepLink = null;
let activeNativeConnection = null;

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
    vpnLog: vpnLog.slice(-12),
    activeConnection: activeNativeConnection
  };
}

function appendVpnLog(line) {
  vpnLog = [...vpnLog.slice(-80), line.toString().trim()].filter(Boolean);
}

async function writeRelayProfile(hostname) {
  const relayConfig = await getVpnGateConfig(hostname);
  const authPath = path.join(app.getPath("userData"), "vpngate-auth.txt");
  const targetPath = path.join(app.getPath("downloads"), relayConfig.filename);
  const quotedAuthPath = `"${authPath.replaceAll('"', '\\"')}"`;
  const config = /^auth-user-pass\s*$/m.test(relayConfig.config)
    ? relayConfig.config.replace(/^auth-user-pass\s*$/m, `auth-user-pass ${quotedAuthPath}`)
    : `${relayConfig.config.trim()}\nauth-user-pass ${quotedAuthPath}\n`;

  await fs.writeFile(authPath, "vpn\nvpn\n", { encoding: "utf8", mode: 0o600 });
  await fs.writeFile(targetPath, config, "utf8");
  return { ...relayConfig, targetPath };
}

function parseDeepLink(url) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "veepn:" || parsedUrl.hostname !== "connect") {
      return null;
    }

    return {
      countryCode: parsedUrl.searchParams.get("countryCode") ?? "",
      countryName: parsedUrl.searchParams.get("countryName") ?? "",
      protocol: "OpenVPN",
      relayHost: parsedUrl.searchParams.get("relayHost") ?? "",
      relayIp: parsedUrl.searchParams.get("relayIp") ?? "",
      nativeConnect: true
    };
  } catch {
    return null;
  }
}

async function connectRelayNative(request) {
  if (!request.relayHost) {
    return {
      ok: false,
      mode: "profile-ready",
      openError: "No relay host was provided."
    };
  }

  const relayConfig = await writeRelayProfile(request.relayHost);
  const openVpnPath = await findOpenVpnBinary();

  if (!openVpnPath) {
    const openError = await shell.openPath(relayConfig.targetPath);
    activeNativeConnection = null;

    return {
      ok: false,
      mode: "profile-ready",
      connectedAt: new Date().toISOString(),
      countryCode: request.countryCode,
      protocol: request.protocol,
      relayHost: request.relayHost,
      relayIp: request.relayIp,
      filePath: relayConfig.targetPath,
      openError: openError || "OpenVPN CLI is not installed. The profile was opened for a VPN client."
    };
  }

  if (vpnProcess && !vpnProcess.killed) {
    vpnProcess.kill("SIGTERM");
  }

  vpnLog = [];
  activeNativeConnection = {
    countryCode: request.countryCode,
    countryName: request.countryName,
    protocol: request.protocol,
    relayHost: request.relayHost,
    relayIp: request.relayIp,
    connectedAt: new Date().toISOString()
  };
  vpnProcess = spawn(openVpnPath, ["--config", relayConfig.targetPath, "--verb", "3", "--auth-nocache"], {
    stdio: ["ignore", "pipe", "pipe"]
  });

  vpnProcess.stdout.on("data", appendVpnLog);
  vpnProcess.stderr.on("data", appendVpnLog);
  vpnProcess.on("exit", (code) => {
    appendVpnLog(`OpenVPN exited with code ${code}`);
    vpnProcess = null;
    activeNativeConnection = null;
  });

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

async function handleDeepLink(url) {
  const request = parseDeepLink(url);

  if (!request) {
    return;
  }

  if (!app.isReady()) {
    pendingDeepLink = url;
    return;
  }

  appendVpnLog(`System link requested: ${request.relayHost}`);
  await connectRelayNative(request);

  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
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
    mainWindow.loadURL(process.env.VEEP_N_DEV_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("veepn", process.execPath, [path.resolve(process.argv[1])]);
  } else {
    app.setAsDefaultProtocolClient("veepn");
  }

  app.on("second-instance", (_event, commandLine) => {
    const deepLink = commandLine.find((item) => item.startsWith("veepn://"));
    if (deepLink) {
      void handleDeepLink(deepLink);
    }
  });

  app.on("open-url", (event, url) => {
    event.preventDefault();
    void handleDeepLink(url);
  });
}

app.whenReady().then(() => {
  ipcMain.handle("vpn:connect", async (_event, request) => {
    if (request.relayHost) {
      if (request.nativeConnect) {
        return connectRelayNative(request);
      }

      const relayConfig = await writeRelayProfile(request.relayHost);
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
    activeNativeConnection = null;

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

  if (pendingDeepLink) {
    void handleDeepLink(pendingDeepLink);
    pendingDeepLink = null;
  }

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
