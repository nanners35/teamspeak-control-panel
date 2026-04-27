🚀 TeamSpeak Control Panel

A full-stack web dashboard for monitoring and managing multiple TeamSpeak servers in real time.

🔐 Default Login
Username: admin
Password: admin123

👉 Change these after first login.

✨ Features
🔹 Multi-server support
🔹 Real-time status monitoring (online/offline, client count)
🔹 Connect / Disconnect servers from UI
🔹 Automatic reconnect with safe retry intervals
🔹 Per-server Discord webhook alerts
🔹 Clean, modern web interface
🔹 JSON-based configuration (no database required)
🖥️ Tech Stack
Backend: Node.js + Express
Frontend: HTML, CSS, JavaScript
Integration: TeamSpeak Server Query + Discord Webhooks
📂 Project Structure
/opt/ts-monitor/
│
├── dashboard.js
├── teamspeak-connect.js
├── config.example.json
├── config.json              # ❌ DO NOT COMMIT
│
├── public/
│   ├── index.html
│   ├── settings.html
│   └── login.html
⚙️ Linux Setup (Debian / Ubuntu / Proxmox LXC)
1. Install dependencies
apt update
apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
2. Clone the repo
cd /opt
git clone https://github.com/nanners35/ts-monitor.js.git
mv ts-monitor.js ts-monitor
cd ts-monitor
3. Install project dependencies
npm install
4. Configuration

Configuration is handled via a local JSON file for authentication, server connections, and webhook settings.

⚠️ Sensitive data is stored locally and should never be committed to GitHub.

5. Start the server
node dashboard.js
6. Open in browser
http://YOUR-SERVER-IP:3000
🔄 Run in Background (Recommended)
npm install -g pm2
pm2 start dashboard.js --name ts-panel
pm2 save
pm2 startup
🔔 Discord Webhooks

Supports:

Global webhook (fallback)
Per-server webhook override

Events:

🟢 Server online
🔴 Server offline
🧠 How It Works
Uses TeamSpeak ServerQuery to connect to servers
Polls status at safe intervals
Tracks connection state per server
Handles reconnect logic automatically
Sends webhook alerts on state changes
⚡ Reliability Features
Prevents reconnect loops
Manual disconnect override
Handles socket timeouts
Avoids TeamSpeak anti-flood limits
🔮 Future Improvements
Live Discord panel (edit message instead of spam)
Public status page
Role-based authentication
WebSocket real-time updates
Metrics dashboard
⚠️ Security Notes
❌ Do NOT commit config.json
🔐 Rotate exposed webhooks or passwords
📁 Use .gitignore to protect secrets
💡 Author

Built by Eugene J

👍 This version does a few things right:
Keeps setup dead simple
Doesn’t overwhelm users with config details
Still looks clean + legit
Matches what you actually built
