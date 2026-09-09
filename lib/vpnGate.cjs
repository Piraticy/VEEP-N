const http = require("node:http");
const https = require("node:https");

const DEFAULT_VPN_GATE_CSV_URLS = [
  "http://150.40.105.10:46711/api/iphone/",
  "http://150.40.105.24:38827/api/iphone/",
  "http://160.251.62.107:46080/api/iphone/",
  "http://62.133.35.246:2265/api/iphone/",
  "http://150.40.105.17:50406/api/iphone/",
  "http://150.40.105.12:29202/api/iphone/",
  "https://www.vpngate.net/api/iphone/"
];
const VPN_GATE_CSV_URLS = (
  process.env.VEEP_N_RELAY_CSV_URLS ??
  process.env.VEEP_N_RELAY_CSV_URL ??
  DEFAULT_VPN_GATE_CSV_URLS.join(",")
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_CSV_BYTES = 12 * 1024 * 1024;
const DISCOVERY_CSV_BYTES = Number(process.env.VEEP_N_RELAY_DISCOVERY_BYTES ?? 384 * 1024);
const RELAY_SOURCE_TIMEOUT_MS = Number(process.env.VEEP_N_RELAY_TIMEOUT_MS ?? 5000);

let cachedRelays = [];
let cachedAt = 0;
let activeSourceUrl = VPN_GATE_CSV_URLS[0] ?? DEFAULT_VPN_GATE_CSV_URLS[0];
let lastFetchError = "";

function parseCsvLine(line) {
  const fields = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

    if (character === "\"" && quoted && next === "\"") {
      value += "\"";
      index += 1;
    } else if (character === "\"") {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      fields.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  fields.push(value);
  return fields;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function decodeConfig(configDataBase64) {
  return Buffer.from(configDataBase64, "base64").toString("utf8");
}

function sanitizeRelay(relay) {
  const { configDataBase64, ...safeRelay } = relay;
  return {
    ...safeRelay,
    hasOpenVpnConfig: Boolean(configDataBase64)
  };
}

function parseVpnGateCsv(csv) {
  const lastLineBreak = csv.lastIndexOf("\n");
  const completeCsv = /\r?\n$/.test(csv) || lastLineBreak < 0 ? csv : csv.slice(0, lastLineBreak);
  const lines = completeCsv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const headerLine = lines.find((line) => line.startsWith("#HostName,"));

  if (!headerLine) {
    throw new Error("The relay source did not return a VPN Gate CSV list.");
  }

  const headers = parseCsvLine(headerLine.replace(/^#/, ""));
  const rows = lines.filter((line) => !line.startsWith("*") && !line.startsWith("#"));

  return rows
    .map((line) => {
      const fields = parseCsvLine(line);
      const row = Object.fromEntries(headers.map((header, index) => [header, fields[index] ?? ""]));
      const speedBps = toNumber(row.Speed);
      const uptimeSeconds = toNumber(row.Uptime);

      return {
        hostname: row.HostName,
        ip: row.IP,
        score: toNumber(row.Score),
        ping: toNumber(row.Ping),
        speedBps,
        speedMbps: Math.round((speedBps / 1024 / 1024) * 10) / 10,
        countryLong: row.CountryLong,
        countryShort: row.CountryShort,
        sessions: toNumber(row.NumVpnSessions),
        uptimeDays: Math.round((uptimeSeconds / 86400) * 10) / 10,
        totalUsers: toNumber(row.TotalUsers),
        totalTraffic: toNumber(row.TotalTraffic),
        logType: row.LogType,
        operator: row.Operator,
        message: row.Message,
        protocol: "OpenVPN",
        source: "VPN Gate",
        configDataBase64: row.OpenVPN_ConfigData_Base64
      };
    })
    .filter((relay) => relay.hostname && relay.ip && relay.countryShort && relay.configDataBase64)
    .sort((a, b) => b.score - a.score);
}

function downloadText(sourceUrl, { timeoutMs = RELAY_SOURCE_TIMEOUT_MS, redirectsLeft = 3, lineLimit = 0, signal } = {}) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    let settled = false;
    let lineCount = 0;
    let request;

    const abort = () => {
      if (!settled && request) {
        request.destroy(new Error("Relay source cancelled"));
      }
    };

    const settle = (callback, value) => {
      if (settled) {
        return;
      }

      settled = true;
      signal?.removeEventListener("abort", abort);
      callback(value);
    };

    if (signal?.aborted) {
      settle(reject, new Error("Relay source cancelled"));
      return;
    }

    try {
      parsedUrl = new URL(sourceUrl);
    } catch {
      settle(reject, new Error("Invalid relay source URL"));
      return;
    }

    const client = parsedUrl.protocol === "https:" ? https : http;
    request = client.request(
      parsedUrl,
      {
        headers: {
          accept: "text/csv,*/*",
          "accept-encoding": "identity",
          "user-agent": "VEEP-N/0.1 relay discovery"
        },
        insecureHTTPParser: true,
        timeout: timeoutMs
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const location = response.headers.location;

        if ([301, 302, 303, 307, 308].includes(statusCode) && location) {
          response.resume();

          if (redirectsLeft <= 0) {
            settle(reject, new Error("Too many redirects"));
            return;
          }

          const redirectedUrl = new URL(location, parsedUrl).toString();
          downloadText(redirectedUrl, { timeoutMs, redirectsLeft: redirectsLeft - 1, lineLimit, signal })
            .then((text) => settle(resolve, text))
            .catch((error) => settle(reject, error));
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          settle(reject, new Error(`HTTP ${statusCode}`));
          return;
        }

        const chunks = [];
        let receivedBytes = 0;

        response.on("data", (chunk) => {
          receivedBytes += chunk.length;

          if (receivedBytes > MAX_CSV_BYTES) {
            request.destroy(new Error("Relay CSV response is too large"));
            return;
          }

          chunks.push(chunk);

          if (lineLimit > 0) {
            for (const byte of chunk) {
              if (byte === 10) {
                lineCount += 1;
              }
            }
          }

          if (receivedBytes >= DISCOVERY_CSV_BYTES || (lineLimit > 0 && lineCount >= lineLimit)) {
            settle(resolve, Buffer.concat(chunks).toString("utf8"));
            request.destroy();
            response.destroy();
          }
        });

        response.on("end", () => {
          settle(resolve, Buffer.concat(chunks).toString("utf8"));
        });
      }
    );

    signal?.addEventListener("abort", abort, { once: true });
    request.on("timeout", () => {
      request.destroy(new Error("Relay source timed out"));
    });
    request.on("error", (error) => settle(reject, error));
    request.end();
  });
}

async function fetchCsvFromSource(sourceUrl, { lineLimit = 0, signal } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= 1; attempt += 1) {
    try {
      return await downloadText(sourceUrl, { lineLimit, signal });
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }

  const message = lastError instanceof Error ? lastError.message : "network error";
  throw new Error(message);
}

async function fetchVpnGateRelays({ limit = 80, force = false } = {}) {
  const now = Date.now();

  if (!force && cachedRelays.length > 0 && now - cachedAt < CACHE_TTL_MS) {
    return cachedRelays.slice(0, limit).map(sanitizeRelay);
  }

  const sourceErrors = [];
  const controller = new AbortController();
  const sourceTasks = VPN_GATE_CSV_URLS.map(async (sourceUrl) => {
    try {
      const csv = await fetchCsvFromSource(sourceUrl, { lineLimit: limit + 8, signal: controller.signal });
      const relays = parseVpnGateCsv(csv);

      if (relays.length === 0) {
        throw new Error("No OpenVPN relays found");
      }

      return { sourceUrl, relays };
    } catch (error) {
      const message = error instanceof Error ? error.message : "network error";
      sourceErrors.push(`${sourceUrl}: ${message}`);
      throw error;
    }
  });

  try {
    const { sourceUrl, relays } = await Promise.any(sourceTasks);
    controller.abort();
    cachedRelays = relays;
    cachedAt = now;
    activeSourceUrl = sourceUrl;
    lastFetchError = "";

    return cachedRelays.slice(0, limit).map(sanitizeRelay);
  } catch {
    lastFetchError = sourceErrors.join(" | ");
  }

  if (cachedRelays.length > 0) {
    return cachedRelays.slice(0, limit).map(sanitizeRelay);
  }

  throw new Error(
    `Could not reach a trusted public relay source. Set VEEP_N_RELAY_CSV_URLS to one or more trusted VPN Gate CSV mirrors or proxies. Last errors: ${lastFetchError}`
  );
}

async function getVpnGateConfig(hostname) {
  if (!cachedRelays.length || Date.now() - cachedAt >= CACHE_TTL_MS) {
    await fetchVpnGateRelays({ limit: 200, force: true });
  }

  const relay = cachedRelays.find((item) => item.hostname === hostname);
  if (!relay) {
    throw new Error("Relay not found in the latest VPN Gate list.");
  }

  return {
    filename: `veep-n-${relay.countryShort.toLowerCase()}-${relay.hostname}.ovpn`,
    relay: sanitizeRelay(relay),
    config: decodeConfig(relay.configDataBase64)
  };
}

module.exports = {
  fetchVpnGateRelays,
  getVpnGateConfig,
  parseVpnGateCsv,
  getRelaySourceStatus: () => ({
    activeSourceUrl,
    configuredSources: VPN_GATE_CSV_URLS,
    cachedCount: cachedRelays.length,
    lastFetchedAt: cachedAt ? new Date(cachedAt).toISOString() : null,
    lastFetchError
  })
};
