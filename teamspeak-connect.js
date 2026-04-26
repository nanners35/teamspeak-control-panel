const { TeamSpeak } = require("ts3-nodejs-library");

const monitors = {};

function makeStatus() {
    return {
        connected: false,
        clients: 0,
        lastUpdate: null,
        lastError: null,
        reconnecting: false
    };
}

// ----------------------
// DISCORD STATUS EMBED
// ----------------------
async function sendStatusEmbed(webhookUrl, server, status, message, color) {
    if (!webhookUrl) return;

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "TeamSpeak Monitor",
                embeds: [
                    {
                        title: "TeamSpeak Server Status",
                        color,
                        fields: [
                            {
                                name: "Server",
                                value: server.name || "Unknown",
                                inline: true
                            },
                            {
                                name: "Status",
                                value: status,
                                inline: true
                            },
                            {
                                name: "Address",
                                value: server.displayHost || server.tsHost,
                                inline: false
                            },
                            {
                                name: "Details",
                                value: message || "No extra details",
                                inline: false
                            }
                        ],
                        footer: {
                            text: "Live TeamSpeak Monitoring"
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            })
        });
    } catch (err) {
        console.error("Webhook error:", err.message);
    }
}

// ----------------------
// MONITOR SETUP
// ----------------------
function ensureMonitor(index) {
    const key = String(index);

    if (!monitors[key]) {
        monitors[key] = {
            ts: null,
            status: makeStatus(),
            interval: null,
            reconnectTimeout: null,
            wasOnline: false,
            listenersAttached: false
        };
    }

    return monitors[key];
}

// ----------------------
// CONNECT SINGLE SERVER
// ----------------------
async function connectServer(server, index, options = {}) {
    const monitor = ensureMonitor(index);
    const webhookUrl = server.webhookUrl || options.webhookUrl;

    try {
        if (monitor.ts) {
            await monitor.ts.quit().catch(() => {});
            monitor.ts = null;
        }

        monitor.status.reconnecting = true;
        monitor.status.lastError = null;

        monitor.ts = await TeamSpeak.connect({
            host: server.tsHost,
            queryport: server.tsQueryPort,
            serverport: server.tsPort,
            username: server.tsUser,
            password: server.tsPass,
            nickname: `DiscordPanelBot-${index + 1}`
        });

        // Prevent unhandled socket crashes
        monitor.ts.on("error", async (err) => {
            console.error(`TeamSpeak socket error for ${server.name}:`, err.message);

            const wasOnline = monitor.wasOnline;

            monitor.status.connected = false;
            monitor.status.reconnecting = true;
            monitor.status.lastError = err.message;
            monitor.wasOnline = false;

            if (wasOnline) {
                await sendStatusEmbed(
                    webhookUrl,
                    server,
                    "🔴 OFFLINE",
                    `Connection dropped.\nError: ${err.message}`,
                    15158332
                );
            }

            scheduleReconnect(server, index, options);
        });

        monitor.ts.on("close", async () => {
            console.error(`TeamSpeak connection closed for ${server.name}`);

            const wasOnline = monitor.wasOnline;

            monitor.status.connected = false;
            monitor.status.reconnecting = true;
            monitor.status.lastError = "Connection closed";
            monitor.wasOnline = false;

            if (wasOnline) {
                await sendStatusEmbed(
                    webhookUrl,
                    server,
                    "🔴 OFFLINE",
                    "Connection closed.",
                    15158332
                );
            }

            scheduleReconnect(server, index, options);
        });

        monitor.status.connected = true;
        monitor.status.reconnecting = false;
        monitor.status.lastUpdate = new Date().toISOString();
        monitor.status.lastError = null;

        if (!monitor.wasOnline) {
            await sendStatusEmbed(
                webhookUrl,
                server,
                "🟢 ONLINE",
                "Server connection restored successfully.",
                3066993
            );
        }

        monitor.wasOnline = true;

        console.log(`Connected to ${server.name}`);
        return true;

    } catch (err) {
        monitor.status.connected = false;
        monitor.status.reconnecting = false;
        monitor.status.lastError = err.message;

        console.error(`TeamSpeak connect error for ${server.name}:`, err.message);

        throw err;
    }
}

// ----------------------
// UPDATE STATUS
// ----------------------
async function updateServerStatus(server, index, options = {}) {
    const monitor = ensureMonitor(index);
    const webhookUrl = server.webhookUrl || options.webhookUrl;

    if (!monitor.ts) return;

    try {
        const clients = await monitor.ts.clientList();

        const realClients = clients.filter(client => {
            return client.type !== 1 && client.clientType !== 1;
        });

        monitor.status.clients = realClients.length;
        monitor.status.connected = true;
        monitor.status.reconnecting = false;
        monitor.status.lastUpdate = new Date().toISOString();
        monitor.status.lastError = null;

        if (!monitor.wasOnline) {
            await sendStatusEmbed(
                webhookUrl,
                server,
                "🟢 ONLINE",
                "Server connection restored successfully.",
                3066993
            );
        }

        monitor.wasOnline = true;

    } catch (err) {
        const wasOnline = monitor.wasOnline;

        monitor.status.connected = false;
        monitor.status.reconnecting = true;
        monitor.status.lastError = err.message;
        monitor.wasOnline = false;

        if (wasOnline) {
            await sendStatusEmbed(
                webhookUrl,
                server,
                "🔴 OFFLINE",
                `Connection dropped.\nError: ${err.message}`,
                15158332
            );
        }

        console.error(`Status error for ${server.name}:`, err.message);

        scheduleReconnect(server, index, options);
    }
}

// ----------------------
// AUTO RECONNECT EVERY 10 MINUTES
// ----------------------
function scheduleReconnect(server, index, options = {}) {
    const monitor = ensureMonitor(index);

    if (monitor.manualDisconnect) return;
    if (monitor.reconnectTimeout) return;

    const delay = 600000; // 10 minutes

    console.log(`Reconnect scheduled in 10 minutes for ${server.name}`);

    monitor.status.reconnecting = true;

    monitor.reconnectTimeout = setTimeout(async () => {
        monitor.reconnectTimeout = null;

        try {
            await connectServer(server, index, options);
            startMonitor(server, index, options);
        } catch (err) {
            monitor.status.connected = false;
            monitor.status.reconnecting = true;
            monitor.status.lastError = err.message;

            scheduleReconnect(server, index, options);
        }
    }, delay);
}

// ----------------------
// CONNECT ALL SERVERS
// ----------------------
async function connectAll(servers = [], options = {}) {
    const results = [];

    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];

        try {
            await connectServer(server, i, options);
            startMonitor(server, i, options);

            results.push({
                index: i,
                name: server.name,
                success: true
            });

        } catch (err) {
            results.push({
                index: i,
                name: server.name,
                success: false,
                error: err.message
            });

            scheduleReconnect(server, i, options);
        }
    }

    return results;
}

// ----------------------
// START MONITOR LOOP
// ----------------------
function startMonitor(server, index, options = {}) {
    const monitor = ensureMonitor(index);

    if (monitor.interval) {
        clearInterval(monitor.interval);
    }

    updateServerStatus(server, index, options);

    monitor.interval = setInterval(() => {
        updateServerStatus(server, index, options);
    }, 10000);
}

// ----------------------
// STATUS FOR DASHBOARD
// ----------------------
function getAllStatuses(servers = []) {
    return servers.map((server, index) => {
        const status = monitors[String(index)]?.status || makeStatus();

        return {
            index,
            name: server.name,
            host: server.tsHost,
            port: server.tsPort,
            online: status.connected,
            reconnecting: status.reconnecting,
            clients: status.clients,
            lastUpdate: status.lastUpdate,
            lastError: status.lastError
        };
    });
}

async function disconnectServer(index) {
    const monitor = monitors[String(index)];

    if (!monitor) {
        return false;
    }

    // Stop status polling
    if (monitor.interval) {
        clearInterval(monitor.interval);
        monitor.interval = null;
    }

    // Stop pending reconnect
    if (monitor.reconnectTimeout) {
        clearTimeout(monitor.reconnectTimeout);
        monitor.reconnectTimeout = null;
    }

    // Mark as manually disconnected
    monitor.manualDisconnect = true;

    // Close TeamSpeak connection
    if (monitor.ts) {
        await monitor.ts.quit().catch(() => {});
        monitor.ts = null;
    }

    // Reset status
    monitor.status.connected = false;
    monitor.status.reconnecting = false;
    monitor.status.clients = 0;
    monitor.status.lastError = "Manually disconnected";
    monitor.status.lastUpdate = new Date().toISOString();
    monitor.wasOnline = false;

    console.log(`Manually disconnected server index ${index}`);

    return true;
}

module.exports = {
    connectServer,
    connectAll,
    disconnectServer,
    startMonitor,
    getAllStatuses
};