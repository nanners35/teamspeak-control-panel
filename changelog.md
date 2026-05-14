# Changelog

---

## v1.0.0

Initial release of the TeamSpeak Control Panel.

- Built full-stack dashboard (Node.js + Express + Web UI)
- Multi-server monitoring support
- Real-time status tracking (online/offline, client count)
- Connect and disconnect controls per server
- Automatic reconnect system with safe intervals
- Discord webhook integration (global + per server)
- Settings UI for managing servers dynamically
- Login system with changeable credentials
- Persistent configuration using config.json
- Session handling with timeout and secure cookies
- Compatible with HTTP and HTTPS (reverse proxy support)
- Linux / Proxmox LXC deployment ready
- PM2 support for persistent background running

## v1.1.0
- Added live Discord message updates
- Improved UI performance

## v1.0.1
- Fixed reconnect bug

---

## v0.2.0

Major stability and backend improvements for the TeamSpeak Control Panel.

- Added automatic reconnect recovery after TeamSpeak restarts
- Fixed stale connection states after TeamSpeak socket disconnects
- Added reconnect scheduling after unexpected connection loss
- Prevented manual disconnects from triggering reconnect loops
- Improved disconnect behavior and immediate dashboard status updates
- Added backend connection timeout protection
- Prevented dashboard from getting stuck on "Connecting"
- Improved socket error handling and dead connection cleanup
- Added HTTP + HTTPS compatible session cookie support
- Added reverse proxy support using `trust proxy`
- Improved session persistence and logout handling
- Added rolling session refresh and timeout support
- Improved Linux / Proxmox deployment stability
- Improved reconnect monitoring flow after TeamSpeak recovery
- Updated dashboard backend structure and reliability