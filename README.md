# VEEP-N

VEEP-N is a web and desktop VPN bridge interface for choosing an exit country,
preparing secure tunnel settings, and connecting through provider-backed VPN
endpoints.

## What is included

- React web app with a global country picker.
- Electron desktop shell sharing the same UI.
- Installable mobile PWA shell for Android and iOS browsers.
- Custom VEEP-N app icon and favicon.
- Shared Docker web connection state so another browser/device can see the
  current bridge status.
- Docker OpenVPN runner for app-managed relay connection testing.
- Connection state, protocol controls, secure-mode toggles, and endpoint-token
  input.
- Public OpenVPN relay discovery from VPN Gate.
- `.ovpn` profile export for a selected public relay.
- Electron desktop OpenVPN launch when `openvpn` is installed on the computer.

## Important note

A real VPN cannot be provided by UI code alone. Production VPN access requires
servers or trusted provider endpoints in each country, bandwidth funding, abuse
prevention, credential management, and compliance with local laws.

The current app is the product shell, relay-discovery layer, and OpenVPN profile
exporter. It can find public VPN Gate relays when the relay source is reachable,
and the Electron desktop app can start an OpenVPN process for a selected public
relay when OpenVPN is installed and the OS allows the tunnel permissions.

Docker mode can also start OpenVPN inside the VEEP-N container. This proves and
tracks the tunnel from the app runtime. It does not make the host computer or
phone route all traffic through the VPN; full-device routing still belongs in a
native desktop/mobile app because the operating system must grant VPN
permissions.

Vercel mode hosts the live web/PWA experience and serverless relay/profile APIs.
It cannot start OpenVPN because hosted serverless functions do not expose a VPN
tunnel device or long-running system process.

Android and iOS are supported as an installable web app for discovery, status,
and profile export. Native one-tap mobile VPN tunneling requires a platform
VPN extension/app wrapper because mobile browsers cannot create VPN tunnels by
themselves.

## Public relay discovery

VEEP-N uses VPN Gate's CSV relay list by default:

```text
https://www.vpngate.net/api/iphone/
```

Some networks block or reset this source. The app includes several current VPN
Gate mirror CSV URLs from VPN Gate's public mirror list, and Docker Compose
passes the same list explicitly. To use your own trusted mirrors or proxy, set:

```bash
VEEP_N_RELAY_CSV_URLS=https://mirror-one.example/api/iphone/,https://mirror-two.example/api/iphone/
```

Public volunteer VPN relays can be unstable, slow, or logged. Do not treat them
as private infrastructure that VEEP-N controls.

## Run the web app

```bash
npm install
npm run dev
```

## Run the desktop app

```bash
npm install
npm run desktop
```

## Run with Docker Desktop

```bash
docker compose up --build
```

Then open:

```text
http://localhost:8095
```

The container serves the built web app, relay API routes, and an app-managed
OpenVPN runner. Docker Compose grants `NET_ADMIN` and `/dev/net/tun` so the
container can create a tunnel.

Phones on the same network can open the Docker host address and install VEEP-N
from the browser. The Docker backend keeps a shared connection-status record, so
mobile and desktop browser views show the same connecting/profile-ready/connected
state.

## Deploy on Vercel

The project includes `vercel.json` and Vercel API functions for:

- relay discovery
- runtime status
- OpenVPN profile download
- graceful live-mode connect/disconnect responses

Vercel is the live web/PWA host. Use Docker or Electron for app-managed native
VPN tunnel testing.
