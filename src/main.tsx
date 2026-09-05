import React from "react";
import ReactDOM from "react-dom/client";
import {
  Activity,
  ChevronDown,
  Circle,
  Download,
  LoaderCircle,
  MapPin,
  Network,
  PlugZap,
  Power,
  RadioTower,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Wifi,
  X
} from "lucide-react";
import "./styles.css";

type Protocol = "WireGuard" | "OpenVPN" | "IKEv2";
type ConnectionStatus = SharedConnectionStatus;

type CountryNode = {
  code: string;
  name: string;
  region: string;
  latency: number;
  load: number;
  bridges: number;
  freeAccess: boolean;
};

const countryCodes = [
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AQ",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BV",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GP",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HM",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PN",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TC",
  "TD",
  "TF",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UM",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW"
] as const;

const regions: Record<string, string> = {
  AD: "Europe",
  AE: "Middle East",
  AF: "Asia",
  AG: "Caribbean",
  AI: "Caribbean",
  AL: "Europe",
  AM: "Asia",
  AO: "Africa",
  AQ: "Antarctica",
  AR: "South America",
  AS: "Oceania",
  AT: "Europe",
  AU: "Oceania",
  AW: "Caribbean",
  AX: "Europe",
  AZ: "Asia",
  BA: "Europe",
  BB: "Caribbean",
  BD: "Asia",
  BE: "Europe",
  BF: "Africa",
  BG: "Europe",
  BH: "Middle East",
  BI: "Africa",
  BJ: "Africa",
  BL: "Caribbean",
  BM: "North America",
  BN: "Asia",
  BO: "South America",
  BQ: "Caribbean",
  BR: "South America",
  BS: "Caribbean",
  BT: "Asia",
  BV: "Antarctica",
  BW: "Africa",
  BY: "Europe",
  BZ: "North America",
  CA: "North America",
  CC: "Oceania",
  CD: "Africa",
  CF: "Africa",
  CG: "Africa",
  CH: "Europe",
  CI: "Africa",
  CK: "Oceania",
  CL: "South America",
  CM: "Africa",
  CN: "Asia",
  CO: "South America",
  CR: "North America",
  CU: "Caribbean",
  CV: "Africa",
  CW: "Caribbean",
  CX: "Oceania",
  CY: "Europe",
  CZ: "Europe",
  DE: "Europe",
  DJ: "Africa",
  DK: "Europe",
  DM: "Caribbean",
  DO: "Caribbean",
  DZ: "Africa",
  EC: "South America",
  EE: "Europe",
  EG: "Africa",
  EH: "Africa",
  ER: "Africa",
  ES: "Europe",
  ET: "Africa",
  FI: "Europe",
  FJ: "Oceania",
  FK: "South America",
  FM: "Oceania",
  FO: "Europe",
  FR: "Europe",
  GA: "Africa",
  GB: "Europe",
  GD: "Caribbean",
  GE: "Asia",
  GF: "South America",
  GG: "Europe",
  GH: "Africa",
  GI: "Europe",
  GL: "North America",
  GM: "Africa",
  GN: "Africa",
  GP: "Caribbean",
  GQ: "Africa",
  GR: "Europe",
  GS: "South America",
  GT: "North America",
  GU: "Oceania",
  GW: "Africa",
  GY: "South America",
  HK: "Asia",
  HM: "Antarctica",
  HN: "North America",
  HR: "Europe",
  HT: "Caribbean",
  HU: "Europe",
  ID: "Asia",
  IE: "Europe",
  IL: "Middle East",
  IM: "Europe",
  IN: "Asia",
  IO: "Asia",
  IQ: "Middle East",
  IR: "Middle East",
  IS: "Europe",
  IT: "Europe",
  JE: "Europe",
  JM: "Caribbean",
  JO: "Middle East",
  JP: "Asia",
  KE: "Africa",
  KG: "Asia",
  KH: "Asia",
  KI: "Oceania",
  KM: "Africa",
  KN: "Caribbean",
  KP: "Asia",
  KR: "Asia",
  KW: "Middle East",
  KY: "Caribbean",
  KZ: "Asia",
  LA: "Asia",
  LB: "Middle East",
  LC: "Caribbean",
  LI: "Europe",
  LK: "Asia",
  LR: "Africa",
  LS: "Africa",
  LT: "Europe",
  LU: "Europe",
  LV: "Europe",
  LY: "Africa",
  MA: "Africa",
  MC: "Europe",
  MD: "Europe",
  ME: "Europe",
  MF: "Caribbean",
  MG: "Africa",
  MH: "Oceania",
  MK: "Europe",
  ML: "Africa",
  MM: "Asia",
  MN: "Asia",
  MO: "Asia",
  MP: "Oceania",
  MQ: "Caribbean",
  MR: "Africa",
  MS: "Caribbean",
  MT: "Europe",
  MU: "Africa",
  MV: "Asia",
  MW: "Africa",
  MX: "North America",
  MY: "Asia",
  MZ: "Africa",
  NA: "Africa",
  NC: "Oceania",
  NE: "Africa",
  NF: "Oceania",
  NG: "Africa",
  NI: "North America",
  NL: "Europe",
  NO: "Europe",
  NP: "Asia",
  NR: "Oceania",
  NU: "Oceania",
  NZ: "Oceania",
  OM: "Middle East",
  PA: "North America",
  PE: "South America",
  PF: "Oceania",
  PG: "Oceania",
  PH: "Asia",
  PK: "Asia",
  PL: "Europe",
  PM: "North America",
  PN: "Oceania",
  PR: "Caribbean",
  PS: "Middle East",
  PT: "Europe",
  PW: "Oceania",
  PY: "South America",
  QA: "Middle East",
  RE: "Africa",
  RO: "Europe",
  RS: "Europe",
  RU: "Europe",
  RW: "Africa",
  SA: "Middle East",
  SB: "Oceania",
  SC: "Africa",
  SD: "Africa",
  SE: "Europe",
  SG: "Asia",
  SH: "Africa",
  SI: "Europe",
  SJ: "Europe",
  SK: "Europe",
  SL: "Africa",
  SM: "Europe",
  SN: "Africa",
  SO: "Africa",
  SR: "South America",
  SS: "Africa",
  ST: "Africa",
  SV: "North America",
  SX: "Caribbean",
  SY: "Middle East",
  SZ: "Africa",
  TC: "Caribbean",
  TD: "Africa",
  TF: "Antarctica",
  TG: "Africa",
  TH: "Asia",
  TJ: "Asia",
  TK: "Oceania",
  TL: "Asia",
  TM: "Asia",
  TN: "Africa",
  TO: "Oceania",
  TR: "Europe",
  TT: "Caribbean",
  TV: "Oceania",
  TW: "Asia",
  TZ: "Africa",
  UA: "Europe",
  UG: "Africa",
  UM: "Oceania",
  US: "North America",
  UY: "South America",
  UZ: "Asia",
  VA: "Europe",
  VC: "Caribbean",
  VE: "South America",
  VG: "Caribbean",
  VI: "Caribbean",
  VN: "Asia",
  VU: "Oceania",
  WF: "Oceania",
  WS: "Oceania",
  YE: "Middle East",
  YT: "Africa",
  ZA: "Africa",
  ZM: "Africa",
  ZW: "Africa"
};

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

const countries: CountryNode[] = countryCodes
  .map((code, index) => ({
    code,
    name: displayNames.of(code) ?? code,
    region: regions[code] ?? "Global",
    latency: 24 + ((index * 37) % 190),
    load: 18 + ((index * 19) % 73),
    bridges: 1 + ((index * 7) % 12),
    freeAccess: index % 5 !== 0
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const regionsList = ["All", ...Array.from(new Set(countries.map((country) => country.region))).sort()];

function getDeviceType(): SharedConnectionState["deviceType"] {
  if (window.veepnDesktop) {
    return "desktop";
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? "mobile" : "web";
}

function getDeviceName(deviceType: SharedConnectionState["deviceType"]) {
  if (window.veepnDesktop) {
    return `Desktop ${navigator.platform}`;
  }

  if (deviceType === "mobile") {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "iOS mobile" : "Android mobile";
  }

  return "Web dashboard";
}

function getStatusLabel(status: ConnectionStatus) {
  if (status === "connected") {
    return "Protected";
  }

  if (status === "connecting") {
    return "Connecting";
  }

  if (status === "disconnecting") {
    return "Disconnecting";
  }

  if (status === "profile-ready") {
    return "Profile ready";
  }

  if (status === "handoff") {
    return "Open desktop";
  }

  return "Idle";
}

function getManualInstallMessage(deviceType: SharedConnectionState["deviceType"]) {
  const userAgent = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIos) {
    return "On iPhone or iPad, open Safari, then Share > Add to Home Screen.";
  }

  if (deviceType === "mobile") {
    return "On Android, open Chrome, then use the browser menu > Add to Home screen.";
  }

  return "Open VEEP-N in Chrome or Edge, then use the address-bar install icon or browser menu > Install app.";
}

function App() {
  const isDesktop = Boolean(window.veepnDesktop);
  const deviceType = React.useMemo(() => getDeviceType(), []);
  const deviceName = React.useMemo(() => getDeviceName(deviceType), [deviceType]);
  const [query, setQuery] = React.useState("");
  const [region, setRegion] = React.useState("All");
  const [protocol, setProtocol] = React.useState<Protocol>("WireGuard");
  const [selected, setSelected] = React.useState<CountryNode>(
    countries.find((country) => country.code === "US") ?? countries[0]
  );
  const [status, setStatus] = React.useState<ConnectionStatus>("idle");
  const [relays, setRelays] = React.useState<PublicRelay[]>([]);
  const [relaysLoading, setRelaysLoading] = React.useState(false);
  const [relayError, setRelayError] = React.useState("");
  const [selectedRelay, setSelectedRelay] = React.useState<PublicRelay | null>(null);
  const [relayExportPath, setRelayExportPath] = React.useState("");
  const [runtimeStatus, setRuntimeStatus] = React.useState<RuntimeStatus | null>(null);
  const [connectionMessage, setConnectionMessage] = React.useState("");
  const [relaySort, setRelaySort] = React.useState<"score" | "speed" | "ping">("score");
  const [sharedState, setSharedState] = React.useState<SharedConnectionState | null>(null);
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = React.useState<"available" | "installed" | "unsupported">(
    window.matchMedia("(display-mode: standalone)").matches ? "installed" : "unsupported"
  );
  const [installMessage, setInstallMessage] = React.useState("");

  const visibleRelays = React.useMemo(() => {
    return relays
      .filter((relay) => {
        const country = countries.find((item) => item.code === relay.countryShort);
        const relayRegion = country?.region ?? "Global";
        const matchesQuery =
          relay.hostname.toLowerCase().includes(query.toLowerCase()) ||
          relay.ip.toLowerCase().includes(query.toLowerCase()) ||
          relay.countryLong.toLowerCase().includes(query.toLowerCase()) ||
          relay.countryShort.toLowerCase().includes(query.toLowerCase());
        const matchesRegion = region === "All" || relayRegion === region;
        return matchesQuery && matchesRegion;
      })
      .sort((a, b) => {
        if (relaySort === "speed") {
          return b.speedMbps - a.speedMbps;
        }

        if (relaySort === "ping") {
          return a.ping - b.ping;
        }

        return b.score - a.score;
      });
  }, [query, region, relaySort, relays]);

  const loadRuntimeStatus = React.useCallback(async () => {
    try {
      const nextStatus = window.veepnDesktop
        ? await window.veepnDesktop.getRuntimeStatus()
        : await fetch("/api/runtime").then((response) => response.json() as Promise<RuntimeStatus>);
      setRuntimeStatus(nextStatus);
    } catch {
      setRuntimeStatus(null);
    }
  }, []);

  const loadSharedState = React.useCallback(async () => {
    if (window.veepnDesktop) {
      return;
    }

    try {
      const nextState = await fetch("/api/connection-state").then(
        (response) => response.json() as Promise<SharedConnectionState>
      );
      setSharedState(nextState);
    } catch {
      setSharedState(null);
    }
  }, []);

  const publishSharedState = React.useCallback(
    async (nextState: Partial<SharedConnectionState>) => {
      if (window.veepnDesktop) {
        return null;
      }

      try {
        const response = await fetch("/api/connection-state", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            countryCode: selectedRelay?.countryShort ?? selected.code,
            countryName: selectedRelay?.countryLong ?? selected.name,
            protocol: selectedRelay ? "OpenVPN" : protocol,
            relayHost: selectedRelay?.hostname ?? "",
            relayIp: selectedRelay?.ip ?? "",
            deviceName,
            deviceType,
            mode: selectedRelay ? "profile" : "demo",
            ...nextState
          })
        });

        const body = (await response.json()) as SharedConnectionState;
        setSharedState(body);
        return body;
      } catch {
        return null;
      }
    },
    [deviceName, deviceType, protocol, selected, selectedRelay]
  );

  const loadRelays = React.useCallback(async () => {
    setRelaysLoading(true);
    setRelayError("");

    try {
      const nextRelays = window.veepnDesktop
        ? await window.veepnDesktop.listRelays()
        : await fetch("/api/relays").then(async (response) => {
            if (!response.ok) {
              const body = (await response.json().catch(() => ({}))) as { error?: string };
              throw new Error(body.error ?? "Relay discovery failed.");
            }
            return (await response.json()) as PublicRelay[];
          });

      setRelays(nextRelays);
      await loadRuntimeStatus();
    } catch (error) {
      setRelayError(error instanceof Error ? error.message : "Could not load public relays.");
      await loadRuntimeStatus();
    } finally {
      setRelaysLoading(false);
    }
  }, [loadRuntimeStatus]);

  React.useEffect(() => {
    void loadRuntimeStatus();
    void loadRelays();
    void loadSharedState();
  }, [loadRelays, loadRuntimeStatus, loadSharedState]);

  React.useEffect(() => {
    if (window.veepnDesktop) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void loadSharedState();
    }, 2500);

    return () => window.clearInterval(interval);
  }, [loadSharedState]);

  React.useEffect(() => {
    if (!window.veepnDesktop && status !== "connecting" && status !== "connected") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void loadRuntimeStatus();
    }, 2200);

    return () => window.clearInterval(interval);
  }, [loadRuntimeStatus, status]);

  React.useEffect(() => {
    if (!window.veepnDesktop && sharedState) {
      setStatus(sharedState.status);
    }
  }, [sharedState]);

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  React.useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallState("available");
      setInstallMessage("");
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setInstallState("installed");
      setInstallMessage("Installed on this device.");
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const canNativeConnect = Boolean(isDesktop && runtimeStatus?.openVpnInstalled && selectedRelay);
  const canRuntimeConnect = Boolean(!isDesktop && runtimeStatus?.openVpnInstalled && selectedRelay);
  const canSystemConnect = Boolean(!isDesktop && !canRuntimeConnect && selectedRelay);
  const relayCountries = new Set(relays.map((relay) => relay.countryShort)).size;
  const runtimeConnection = runtimeStatus?.activeConnection;
  const sharedConnection = sharedState && sharedState.status !== "idle" ? sharedState : null;
  const activeCountryName = selectedRelay?.countryLong ?? runtimeConnection?.countryName ?? sharedConnection?.countryName ?? selected.name;
  const activeCountryCode = selectedRelay?.countryShort ?? runtimeConnection?.countryCode ?? sharedConnection?.countryCode ?? selected.code;
  const activeLatency = selectedRelay?.ping ?? selected.latency;
  const activeLoad = selectedRelay ? selectedRelay.sessions : selected.load;
  const activeRelayHost = selectedRelay?.hostname ?? runtimeConnection?.relayHost ?? sharedConnection?.relayHost ?? "";
  const activeRelayIp = selectedRelay?.ip ?? runtimeConnection?.relayIp ?? sharedConnection?.relayIp ?? "";
  const statusLabel = getStatusLabel(status);
  const activeSession =
    sharedConnection
      ? sharedConnection
      : {
          status,
          countryCode: activeCountryCode,
          countryName: activeCountryName,
          protocol: selectedRelay ? "OpenVPN" : protocol,
          relayHost: activeRelayHost,
          relayIp: activeRelayIp,
          deviceName,
          deviceType,
          mode: canNativeConnect || runtimeConnection ? "native" : canRuntimeConnect ? "container" : selectedRelay ? "profile" : "demo",
          connectedAt: runtimeConnection?.connectedAt ?? (status === "connected" ? new Date().toISOString() : null),
          updatedAt: new Date().toISOString(),
          message: ""
        };
  const readiness = selectedRelay
    ? canNativeConnect
      ? "Desktop tunnel ready"
      : canRuntimeConnect
        ? "App tunnel ready"
        : "Open desktop app"
    : "Bridge demo";
  const primaryActionLabel =
    status === "connecting"
      ? "Connecting..."
      : status === "disconnecting"
        ? "Disconnecting..."
        : selectedRelay
          ? canNativeConnect || canRuntimeConnect
            ? "Connect VPN"
            : "Connect system"
          : "Demo connect";

  React.useEffect(() => {
    if (!runtimeStatus) {
      return;
    }

    if (runtimeStatus.vpnRunning) {
      setStatus("connected");

      if (!window.veepnDesktop && sharedState?.status !== "connected") {
        void publishSharedState({
          status: "connected",
          mode: "container",
          connectedAt: new Date().toISOString(),
          message: `${activeCountryName} tunnel is running.`
        });
      }
      return;
    }

    if (runtimeStatus.openVpnInstalled && (status === "connected" || status === "connecting")) {
      setStatus("idle");

      if (!window.veepnDesktop && sharedState?.status !== "idle") {
        void publishSharedState({
          status: "idle",
          message: "VPN runtime is idle."
        });
      }
    }
  }, [activeCountryName, publishSharedState, runtimeStatus, sharedState?.status, status]);

  function getSystemConnectUrl() {
    if (!selectedRelay) {
      return "";
    }

    const params = new URLSearchParams({
      countryCode: activeCountryCode,
      countryName: activeCountryName,
      relayHost: selectedRelay.hostname,
      relayIp: selectedRelay.ip
    });

    return `veepn://connect?${params.toString()}`;
  }

  async function installWebApp() {
    if (installState === "installed") {
      setInstallMessage("VEEP-N is already installed.");
      return;
    }

    if (!installPrompt) {
      setInstallMessage(getManualInstallMessage(deviceType));
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    if (choice.outcome === "accepted") {
      setInstallState("installed");
      setInstallMessage("Installed on this device.");
      return;
    }

    setInstallState("unsupported");
    setInstallMessage("Install cancelled.");
  }

  async function connect() {
    setStatus("connecting");
    setConnectionMessage("");
    await publishSharedState({
      status: "connecting",
      message: selectedRelay ? `Preparing ${selectedRelay.hostname}` : `Preparing ${activeCountryName}`,
      mode: canNativeConnect || canSystemConnect ? "native" : canRuntimeConnect ? "container" : selectedRelay ? "profile" : "demo"
    });

    if (window.veepnDesktop) {
      const result = await window.veepnDesktop.connect({
        countryCode: activeCountryCode,
        protocol: selectedRelay ? "OpenVPN" : protocol,
        relayHost: selectedRelay?.hostname,
        relayIp: selectedRelay?.ip,
        nativeConnect: canNativeConnect
      });

      if (result.mode === "profile-ready") {
        setRelayExportPath(
          result.openError
            ? `Profile saved, but no OpenVPN app opened it: ${result.filePath}`
            : `Profile opened: ${result.filePath}`
        );
        setStatus("profile-ready");
        return;
      }

      if (result.mode === "native") {
        setConnectionMessage(`OpenVPN process started${result.pid ? ` with PID ${result.pid}` : ""}.`);
      }
    } else if (selectedRelay && canRuntimeConnect) {
      try {
        const response = await fetch("/api/vpn/connect", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            countryCode: activeCountryCode,
            countryName: activeCountryName,
            protocol: "OpenVPN",
            relayHost: selectedRelay.hostname,
            relayIp: selectedRelay.ip,
            deviceName,
            deviceType
          })
        });

        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
          mode?: string;
          pid?: number;
          state?: SharedConnectionState;
        };

        if (!response.ok) {
          throw new Error(body.error ?? "VPN connection failed.");
        }

        setStatus(body.state?.status ?? "connecting");
        setConnectionMessage(
          body.pid ? `Connecting through app runtime with PID ${body.pid}.` : "Connecting through app runtime."
        );
        await loadRuntimeStatus();
        await loadSharedState();
      } catch (error) {
        setStatus("idle");
        setRelayExportPath(error instanceof Error ? error.message : "VPN connection failed.");
        await publishSharedState({
          status: "idle",
          message: error instanceof Error ? error.message : "VPN connection failed."
        });
      }
      return;
    } else if (selectedRelay && canSystemConnect) {
      window.location.href = getSystemConnectUrl();
      setStatus("handoff");
      setConnectionMessage("Opening VEEP-N desktop to start the system VPN.");
      await publishSharedState({
        status: "handoff",
        mode: "native",
        message: `Opening desktop connector for ${selectedRelay.hostname}.`
      });
      return;
    } else if (selectedRelay) {
      await exportRelayConfig();
      setStatus("profile-ready");
      await publishSharedState({
        status: "profile-ready",
        mode: "profile",
        message: `${selectedRelay.hostname} profile is ready on ${deviceName}.`
      });
      return;
    } else {
      await new Promise((resolve) => window.setTimeout(resolve, 1300));
    }
    setStatus("connected");
    await publishSharedState({
      status: "connected",
      mode: canNativeConnect ? "native" : canRuntimeConnect ? "container" : "demo",
      connectedAt: new Date().toISOString(),
      message: canNativeConnect
        ? `${activeCountryName} tunnel is running on ${deviceName}.`
        : `${activeCountryName} demo bridge is active on ${deviceName}.`
    });
  }

  async function disconnect() {
    setStatus("disconnecting");
    await publishSharedState({
      status: "disconnecting",
      message: `Disconnecting ${activeSession.countryName || activeCountryName}.`
    });

    if (window.veepnDesktop) {
      await window.veepnDesktop.disconnect();
    } else {
      await fetch("/api/vpn/disconnect", { method: "POST" }).catch(() => undefined);
      await loadRuntimeStatus();
      await loadSharedState();
    }

    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setStatus("idle");
    setConnectionMessage("");
    await publishSharedState({
      status: "idle",
      message: "Bridge disconnected."
    });
  }

  function chooseRelay(relay: PublicRelay) {
    setSelectedRelay(relay);
    setProtocol("OpenVPN");
    setRelayExportPath("");
    setConnectionMessage("");

    const matchingCountry = countries.find((country) => country.code === relay.countryShort);
    if (matchingCountry) {
      setSelected(matchingCountry);
    }
  }

  async function exportRelayConfig() {
    if (!selectedRelay) {
      return;
    }

    setRelayExportPath("Preparing config...");

    try {
      if (window.veepnDesktop) {
        const result = await window.veepnDesktop.exportRelayConfig(selectedRelay.hostname);
        setRelayExportPath(result.filePath);
        return;
      }

      const response = await fetch(`/api/relays/${encodeURIComponent(selectedRelay.hostname)}/config`);
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Could not export relay config.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `veep-n-${selectedRelay.countryShort.toLowerCase()}-${selectedRelay.hostname}.ovpn`;
      anchor.click();
      URL.revokeObjectURL(url);
      setRelayExportPath("Downloaded OpenVPN config");
    } catch (error) {
      setRelayExportPath(error instanceof Error ? error.message : "Config export failed.");
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="VEEP-N navigation">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={24} strokeWidth={2.2} />
          </div>
          <div>
            <strong>VEEP-N</strong>
            <span>Global VPN bridge</span>
          </div>
        </div>

        <nav className="nav-list">
          <a className="active" href="#connect">
            <PlugZap size={18} /> Connect
          </a>
          <a href="#relays">
            <RadioTower size={18} /> Public relays
          </a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Free access network</span>
            <h1>VEEP-N VPN</h1>
            <p className="topbar-copy">
              Choose a relay, prepare a profile, and watch connection status.
            </p>
            <div className="quick-stats" aria-label="VPN status summary">
              <span>{relays.length} relays</span>
              <span>{relayCountries} countries</span>
              <span>{isDesktop ? "Desktop" : deviceType === "mobile" ? "Mobile" : "Web"}</span>
            </div>
          </div>
          <div className="topbar-actions">
            {!isDesktop && (
              <button
                className={`install-button ${installState}`}
                onClick={installWebApp}
                title="Install VEEP-N as a desktop web app"
              >
                <Download size={15} />
                {installState === "installed" ? "Installed" : "Install app"}
              </button>
            )}
            <div className={`status-pill ${status}`}>
              {status === "connecting" || status === "disconnecting" ? (
                <LoaderCircle className="spin" size={15} />
              ) : (
                <Circle size={10} fill="currentColor" />
              )}
              {statusLabel}
            </div>
          </div>
        </header>
        {installMessage && !isDesktop && <div className="install-hint">{installMessage}</div>}

        <section className={`session-strip ${status}`} aria-live="polite">
          <div className="session-icon">
            {status === "connected" ? (
              <ShieldCheck size={22} />
            ) : status === "profile-ready" ? (
              <Download size={22} />
            ) : status === "handoff" ? (
              <PlugZap size={22} />
            ) : status === "connecting" || status === "disconnecting" ? (
              <LoaderCircle className="spin" size={22} />
            ) : (
              <Power size={22} />
            )}
          </div>
          <div>
            <strong>
              {statusLabel}
              {activeSession.countryName ? ` · ${activeSession.countryName}` : ""}
            </strong>
            <small>
              {activeSession.relayHost || activeSession.protocol || "No relay selected"}
            </small>
          </div>
        </section>

        <section id="connect" className="connection-grid single">
          <div className={`connection-panel ${status}`}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Route</span>
                <h2>
                  {activeCountryName} <span>{activeCountryCode}</span>
                </h2>
              </div>
              <div className="country-orbit" aria-hidden="true">
                <span>{activeCountryCode}</span>
              </div>
            </div>

            <div className={`route-map ${status}`} aria-label="Global route visualization">
              <svg className="route-canvas" viewBox="0 0 1000 260" aria-hidden="true">
                <defs>
                  <linearGradient id="routePrimary" x1="210" y1="164" x2="788" y2="82" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#74e4ae" />
                    <stop offset="0.58" stopColor="#7cc7ff" />
                    <stop offset="1" stopColor="#f0c36a" />
                  </linearGradient>
                  <linearGradient id="routeReturn" x1="788" y1="132" x2="210" y2="176" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7cc7ff" />
                    <stop offset="1" stopColor="#74e4ae" />
                  </linearGradient>
                </defs>
                <path
                  className="land-mass land-one"
                  d="M87 123c34-42 126-57 196-38 45 12 70 36 122 33 58-3 82-35 145-38 80-4 150 41 184 82-46 30-123 48-206 42-80-5-117-32-181-30-62 2-93 30-158 26-56-4-98-29-102-77Z"
                />
                <path
                  className="land-mass land-two"
                  d="M611 71c82-23 177-7 247 40 46 31 55 76 17 103-45 32-139 24-198-11-41-25-41-53-83-72-36-16-82-16-118-18 24-20 65-34 135-42Z"
                />
                <path className="range-ring outer" d="M110 139c106-86 671-86 780 0-109 86-674 86-780 0Z" />
                <path className="range-ring inner" d="M264 132c77-62 403-62 481 0-78 63-404 63-481 0Z" />
                <path className="route-arc route-primary" d="M210 158C341 66 640 39 788 104" />
                <path className="route-arc route-return" d="M788 138C652 207 377 204 210 170" />
                <path className="route-arc route-shadow" d="M210 158C392 132 555 137 788 104" />
                <circle className="signal-dot dot-one" r="6">
                  <animateMotion dur="2.8s" repeatCount="indefinite" path="M210 158C341 66 640 39 788 104" />
                </circle>
                <circle className="signal-dot dot-two" r="4">
                  <animateMotion dur="3.5s" repeatCount="indefinite" path="M788 138C652 207 377 204 210 170" />
                </circle>
              </svg>
              <div className="node home">
                <Wifi size={18} />
              </div>
              <div className="node exit">
                <MapPin size={18} />
              </div>
              <div className="vpn-visual-status">
                {status === "connected" ? (
                  <ShieldCheck size={18} />
                ) : status === "connecting" || status === "disconnecting" ? (
                  <LoaderCircle className="spin" size={18} />
                ) : status === "handoff" ? (
                  <PlugZap size={18} />
                ) : (
                  <Power size={18} />
                )}
                <strong>{statusLabel}</strong>
              </div>
            </div>

            <div className={`connection-meter ${status}`} aria-label={`Connection is ${statusLabel}`}>
              <span />
            </div>

            <div className="metrics">
              <Metric icon={<Activity size={18} />} label="Latency" value={`${activeLatency} ms`} />
              <Metric
                icon={<Server size={18} />}
                label={selectedRelay ? "Relay speed" : "Free bridges"}
                value={selectedRelay ? `${selectedRelay.speedMbps} Mbps` : selected.bridges.toString()}
              />
              <Metric
                icon={<Network size={18} />}
                label={selectedRelay ? "Sessions" : "Load"}
                value={selectedRelay ? selectedRelay.sessions.toString() : `${activeLoad}%`}
              />
            </div>

            <div className="connect-actions">
              {status === "connected" ||
              status === "profile-ready" ||
              status === "handoff" ||
              status === "connecting" ||
              status === "disconnecting" ? (
                <button className="danger-button" onClick={disconnect} disabled={status === "disconnecting"}>
                  <X size={18} /> {status === "profile-ready" || status === "handoff" ? "Clear" : "Disconnect"}
                </button>
              ) : (
                <button
                  className="primary-button"
                  onClick={connect}
                >
                  <PlugZap size={18} />
                  {primaryActionLabel}
                </button>
              )}
              <button
                className="secondary-button"
                disabled={!selectedRelay}
                onClick={exportRelayConfig}
                title="Export the selected relay as an OpenVPN profile"
              >
                <Download size={18} /> Export .ovpn
              </button>
              <span>{readiness}</span>
            </div>
            {selectedRelay && (
              <p className="relay-note">
                {selectedRelay.source} · {selectedRelay.hostname} · logs: {selectedRelay.logType}
              </p>
            )}
            {connectionMessage && <p className="success-note">{connectionMessage}</p>}
            {relayExportPath && <p className="relay-note">{relayExportPath}</p>}
          </div>
        </section>

        <section id="relays" className="relay-section">
          <div className="relay-header">
            <div>
              <span className="eyebrow">{relayError ? "Source blocked" : "Live relays"}</span>
              <h2>Choose a relay</h2>
            </div>
            <div className="relay-actions">
              <div className="mini-segmented" aria-label="Sort relays">
                <button
                  className={relaySort === "score" ? "selected" : ""}
                  onClick={() => setRelaySort("score")}
                >
                  Score
                </button>
                <button
                  className={relaySort === "speed" ? "selected" : ""}
                  onClick={() => setRelaySort("speed")}
                >
                  Speed
                </button>
                <button
                  className={relaySort === "ping" ? "selected" : ""}
                  onClick={() => setRelaySort("ping")}
                >
                  Ping
                </button>
              </div>
              <button className="secondary-button" onClick={loadRelays} disabled={relaysLoading}>
                <RefreshCw size={18} /> {relaysLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="relay-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                aria-label="Search relays"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search relay or country"
              />
            </div>

            <div className="select-wrap">
              <select
                aria-label="Filter by region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                {regionsList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} />
            </div>
          </div>

          {relayError && <div className="error-strip">{relayError}</div>}

          <div className="relay-grid" aria-live="polite">
            {relaysLoading &&
              relays.length === 0 &&
              Array.from({ length: 6 }).map((_, index) => (
                <div className="relay-card loading-card" key={index}>
                  <span />
                  <span />
                  <span />
                </div>
              ))}

            {!relaysLoading && visibleRelays.length === 0 && (
              <div className="empty-state">
                <RadioTower size={26} />
                <strong>No live relays loaded</strong>
                <span>
                  Refresh again or set `VEEP_N_RELAY_CSV_URLS` to trusted VPN Gate CSV mirrors
                  in Docker Compose.
                </span>
              </div>
            )}

            {visibleRelays.slice(0, 12).map((relay) => (
              <button
                key={`${relay.hostname}-${relay.ip}`}
                className={`relay-card ${selectedRelay?.hostname === relay.hostname ? "selected" : ""}`}
                onClick={() => chooseRelay(relay)}
              >
                <span className="relay-topline">
                  <strong>{relay.countryLong}</strong>
                  <span>{relay.countryShort}</span>
                </span>
                <span className="relay-host">{relay.hostname}</span>
                <span className="relay-stats">
                  {relay.ping} ms · {relay.speedMbps} Mbps
                </span>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
