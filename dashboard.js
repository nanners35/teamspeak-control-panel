const fs = require("fs");
const express = require("express");
const session = require("express-session");
const tsMonitor = require("./teamspeak-connect");

const app = express();
const PORT = 3000;

// ======================
// CONFIG LOADING / SAVING
// ======================
function loadConfig() {
    try {
        const loaded = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

        if (!loaded.auth) {
            loaded.auth = {
                username: "admin",
                password: "admin123"
            };
        }

        if (!loaded.webhookUrl) {
            loaded.webhookUrl = "";
        }

        if (!Array.isArray(loaded.servers)) {
            loaded.servers = [];
        }

        return loaded;

    } catch {
        return {
            auth: {
                username: "admin",
                password: "admin123"
            },
            webhookUrl: "",
            servers: []
        };
    }
}

let config = loadConfig();

function saveConfig() {
    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));
}

// ======================
// RUNTIME STATE
// ======================
let startTime = Date.now();
let connecting = false;

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "change_this_to_secure_random_string",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }
}));

app.use(express.static("public"));

// ======================
// AUTH ROUTES
// ======================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === config.auth?.username &&
        password === config.auth?.password
    ) {
        req.session.auth = true;
        return res.json({ success: true });
    }

    res.status(401).json({ error: "invalid credentials" });
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ success: true });
    });
});

// ======================
// UPDATE LOGIN CREDENTIALS
// ======================
app.post("/auth/update", (req, res) => {
    if (!req.session.auth) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized"
        });
    }

    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.json({
            success: false,
            error: "Missing username or password"
        });
    }

    config.auth = {
        username,
        password
    };

    saveConfig();

    res.json({ success: true });
});

// ======================
// SETTINGS ROUTES
// ======================
app.get("/settings", (req, res) => {
    res.json(config);
});

app.post("/settings", (req, res) => {
    const body = req.body || {};

    config.webhookUrl = body.webhookUrl || config.webhookUrl || "";

    if (Array.isArray(body.servers)) {
        config.servers = body.servers.map((s, i) => ({
            name: s.name || `Server ${i + 1}`,
            tsHost: s.tsHost || "",
            displayHost: s.displayHost || "",
            tsQueryPort: Number(s.tsQueryPort || 10011),
            tsPort: Number(s.tsPort || 9987),
            tsUser: s.tsUser || "",
            tsPass: s.tsPass || "",
            webhookUrl: s.webhookUrl || ""
        }));
    }

    saveConfig();

    res.json({ success: true });
});

// ======================
// CONNECT ROUTE
// ======================
app.post("/connect", async (req, res) => {
    if (connecting) {
        return res.json({
            success: false,
            error: "Already connecting..."
        });
    }

    connecting = true;

    try {
        if (req.body && typeof req.body.index === "number") {
            const i = req.body.index;
            const server = config.servers[i];

            if (!server) {
                return res.json({
                    success: false,
                    error: "Invalid server index"
                });
            }

            await tsMonitor.connectServer(server, i, {
                webhookUrl: config.webhookUrl
            });

            tsMonitor.startMonitor(server, i, {
                webhookUrl: config.webhookUrl
            });

            return res.json({ success: true });
        }

        const results = await tsMonitor.connectAll(config.servers || [], {
            webhookUrl: config.webhookUrl
        });

        res.json({
            success: true,
            results
        });

    } catch (err) {
        res.json({
            success: false,
            error: err.message
        });

    } finally {
        setTimeout(() => {
            connecting = false;
        }, 3000);
    }
});

// ======================
// DISCONNECT ROUTE
// ======================
app.post("/disconnect", async (req, res) => {
    try {
        const index = req.body?.index;

        if (typeof index !== "number") {
            return res.json({
                success: false,
                error: "Missing server index"
            });
        }

        await tsMonitor.disconnectServer(index);

        res.json({ success: true });

    } catch (err) {
        res.json({
            success: false,
            error: err.message
        });
    }
});

// ======================
// STATUS ROUTE
// ======================
app.get("/status", (req, res) => {
    res.json({
        uptime: Date.now() - startTime,
        servers: tsMonitor.getAllStatuses(config.servers || [])
    });
});

// ======================
// SERVER START
// ======================
app.listen(PORT, () => {
    console.log(`Running at http://localhost:${PORT}`);
});