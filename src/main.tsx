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

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isIosBrowser() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function getDeviceType(): SharedConnectionState["deviceType"] {
  if (window.veepnDesktop) {
    return "desktop";
  }

  return isMobileBrowser() ? "mobile" : "web";
}

function getDeviceName(deviceType: SharedConnectionState["deviceType"]) {
  if (window.veepnDesktop) {
    return `Desktop ${navigator.platform}`;
  }

  if (deviceType === "mobile") {
    return isIosBrowser() ? "iOS mobile" : "Android mobile";
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
  if (isIosBrowser()) {
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
  const isMobileClient = deviceType === "mobile";
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
  const canRuntimeConnect = Boolean(!isDesktop && !isMobileClient && runtimeStatus?.openVpnInstalled && selectedRelay);
  const canSystemConnect = Boolean(!isDesktop && !isMobileClient && !canRuntimeConnect && selectedRelay);
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
        : isMobileClient
          ? "Mobile profile"
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
            : isMobileClient
              ? "Download profile"
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
      message: selectedRelay
        ? isMobileClient
          ? `Preparing mobile profile for ${selectedRelay.hostname}`
          : `Preparing ${selectedRelay.hostname}`
        : `Preparing ${activeCountryName}`,
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
      const exported = await exportRelayConfig();
      if (!exported) {
        setStatus("idle");
        await publishSharedState({
          status: "idle",
          mode: "profile",
          message: "Could not prepare the VPN profile."
        });
        return;
      }

      setStatus("profile-ready");
      const message = isMobileClient
        ? "Profile downloaded. Open the .ovpn file in OpenVPN Connect to start the VPN."
        : `${selectedRelay.hostname} profile is ready on ${deviceName}.`;
      setConnectionMessage(message);
      await publishSharedState({
        status: "profile-ready",
        mode: "profile",
        message
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
      return false;
    }

    setRelayExportPath("Preparing config...");

    try {
      if (window.veepnDesktop) {
        const result = await window.veepnDesktop.exportRelayConfig(selectedRelay.hostname);
        setRelayExportPath(result.filePath);
        return true;
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
      anchor.style.display = "none";
      document.body.append(anchor);
      anchor.click();
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        anchor.remove();
      }, 1000);
      setRelayExportPath(isMobileClient ? "Downloaded .ovpn profile" : "Downloaded OpenVPN config");
      return true;
    } catch (error) {
      setRelayExportPath(error instanceof Error ? error.message : "Config export failed.");
      return false;
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
                title="Install VEEP-N on this device"
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
                  <linearGradient id="routeRibbon" x1="170" y1="130" x2="830" y2="130" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#74e4ae" />
                    <stop offset="0.55" stopColor="#7cc7ff" />
                    <stop offset="1" stopColor="#f0c36a" />
                  </linearGradient>
                  <linearGradient id="routePanel" x1="92" y1="130" x2="908" y2="130" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0b1425" stopOpacity="0.12" />
                    <stop offset="0.5" stopColor="#203d56" stopOpacity="0.52" />
                    <stop offset="1" stopColor="#12342f" stopOpacity="0.3" />
                  </linearGradient>
                  <radialGradient id="secureCoreGlow" cx="0" cy="0" r="1" gradientTransform="translate(500 130) rotate(90) scale(92)">
                    <stop stopColor="#7cc7ff" stopOpacity="0.42" />
                    <stop offset="0.45" stopColor="#74e4ae" stopOpacity="0.18" />
                    <stop offset="1" stopColor="#74e4ae" stopOpacity="0" />
                  </radialGradient>
                  <filter id="routeSoftGlow" x="-20%" y="-80%" width="140%" height="260%">
                    <feGaussianBlur stdDeviation="7" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <path id="primaryRoutePath" d="M176 136C294 72 646 52 824 126" />
                  <path id="returnRoutePath" d="M176 144C340 190 660 188 824 136" />
                </defs>
                <path className="visual-plane back" d="M178 52H822L908 130L822 208H178L92 130Z" />
                <path className="visual-plane front" d="M248 83H752L826 130L752 177H248L174 130Z" />
                <path className="circuit-line top-left" d="M130 68H265L368 35" />
                <path className="circuit-line top-right" d="M870 68H735L632 35" />
                <path className="circuit-line bottom-left" d="M130 192H265L368 225" />
                <path className="circuit-line bottom-right" d="M870 192H735L632 225" />
                <path className="route-shadow" d="M176 136C294 72 646 52 824 126C668 166 338 174 176 136Z" />
                <use className="route-ribbon halo" href="#primaryRoutePath" />
                <use className="route-ribbon primary" href="#primaryRoutePath" />
                <use className="route-ribbon secondary" href="#returnRoutePath" />
                <path className="route-rail upper" d="M176 136C330 106 642 96 824 126" />
                <path className="route-rail lower" d="M176 144C338 156 646 162 824 136" />
                <circle className="gateway-aura" cx="500" cy="130" r="62" />
                <path className="gateway-shell" d="M500 58 585 130 500 202 415 130Z" />
                <path className="gateway-panel" d="M500 84 548 130 500 176 452 130Z" />
                <path className="gateway-shield" d="M500 101l28 12v25c0 21-12 35-28 44-16-9-28-23-28-44v-25l28-12Z" />
                <path className="gateway-check" d="m487 135 10 10 21-25" />
                <g className="packet-stream">
                  <rect className="packet packet-one" width="22" height="8" rx="4">
                    <animateMotion dur="2.5s" repeatCount="indefinite">
                      <mpath href="#primaryRoutePath" />
                    </animateMotion>
                  </rect>
                  <rect className="packet packet-two" width="16" height="7" rx="3.5">
                    <animateMotion dur="3.1s" repeatCount="indefinite" begin="-1s">
                      <mpath href="#returnRoutePath" />
                    </animateMotion>
                  </rect>
                  <circle className="packet-dot" r="5">
                    <animateMotion dur="3.8s" repeatCount="indefinite" begin="-1.8s">
                      <mpath href="#primaryRoutePath" />
                    </animateMotion>
                  </circle>
                </g>
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
