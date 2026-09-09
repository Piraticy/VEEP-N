/// <reference types="vite/client" />

interface Window {
  veepnDesktop?: {
    connect: (request: {
      countryCode: string;
      protocol: "WireGuard" | "OpenVPN" | "IKEv2";
      relayHost?: string;
      relayIp?: string;
      nativeConnect?: boolean;
    }) => Promise<{
      ok: boolean;
      mode: "simulated" | "native" | "container" | "profile-ready";
      connectedAt: string;
      countryCode: string;
      protocol: string;
      relayHost?: string;
      relayIp?: string;
      filePath?: string;
      openError?: string;
      pid?: number;
    }>;
    disconnect: () => Promise<{ ok: boolean; disconnectedAt: string }>;
    getRuntimeStatus: () => Promise<RuntimeStatus>;
    listRelays: () => Promise<PublicRelay[]>;
    exportRelayConfig: (hostname: string) => Promise<{
      ok: boolean;
      filePath: string;
      relay: PublicRelay;
    }>;
  };
  MSStream?: unknown;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

type PublicRelay = {
  hostname: string;
  ip: string;
  score: number;
  ping: number;
  speedBps: number;
  speedMbps: number;
  countryLong: string;
  countryShort: string;
  sessions: number;
  uptimeDays: number;
  totalUsers: number;
  totalTraffic: number;
  logType: string;
  operator: string;
  message: string;
  protocol: "OpenVPN";
  source: "VPN Gate";
  hasOpenVpnConfig: boolean;
};

type RelaySourceStatus = {
  activeSourceUrl: string;
  configuredSources: string[];
  cachedCount: number;
  lastFetchedAt: string | null;
  lastFetchError: string;
};

type RuntimeStatus = {
  platform: string;
  desktop: boolean;
  openVpnInstalled: boolean;
  openVpnPath: string;
  relaySource: RelaySourceStatus;
  vpnRunning: boolean;
  vpnConnecting?: boolean;
  vpnLog: string[];
  activeConnection?: {
    countryCode: string;
    countryName: string;
    protocol: string;
    relayHost: string;
    relayIp: string;
    connectedAt: string;
  } | null;
};

type SharedConnectionStatus = "idle" | "connecting" | "connected" | "profile-ready" | "handoff" | "disconnecting";

type SharedConnectionState = {
  status: SharedConnectionStatus;
  countryCode: string;
  countryName: string;
  protocol: string;
  relayHost: string;
  relayIp: string;
  deviceName: string;
  deviceType: "web" | "desktop" | "mobile";
  mode: "demo" | "profile" | "native" | "container";
  connectedAt: string | null;
  updatedAt: string;
  message: string;
};
