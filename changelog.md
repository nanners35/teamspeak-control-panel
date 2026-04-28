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