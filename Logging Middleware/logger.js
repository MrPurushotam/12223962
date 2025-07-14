require("dotenv").config();

class Logger {
    constructor() {
        this.BASE_URL = process.env.DEFAULT_URL || "http://20.244.56.144/evaluation-service";
        this.AUTH_TOKEN = null;
        this.init();
    }

    async init() {
        await this.getAuthToken();
    }

    async getAuthToken() {
        const body = {
            email: "purupurushotamjeswani2004@gmail.com",
            name: "Purshotam Jeswani",
            rollNo: "12223962",
            accessCode: process.env.ACCESS_CODE||"",
            clientID: process.env.CLIENT_ID || "",
            clientSecret: process.env.CLIENT_SECRET || ""
        };
        try {
            const resp = await fetch(`${this.BASE_URL}/auth`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await resp.json();
            if (resp.ok) {
                this.AUTH_TOKEN = data.token;
                console.log("[Logger] Auth token received");
            } else {
                console.log("[Logger] Auth failed", data);
            }
        } catch (error) {
            console.error("Error getting auth token:", error);
        }
    }

    async log(stack, level, pkg, message) {
        const LOG_ENDPOINT = `${this.BASE_URL}/logs`;

        const logBody = {
            stack,
            level,
            package: pkg,
            message: message.toLowerCase(),
        };

        const consoleMap = {
            debug: console.debug,
            info: console.info,
            warn: console.warn,
            error: console.error,
            fatal: console.error,
        };
        (consoleMap[level])(`[${stack.toUpperCase()}][${level.toUpperCase()}][${pkg}] ${message.toLowerCase()}`);
        try {
            await fetch(LOG_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.AUTH_TOKEN}`
                },
                body: JSON.stringify(logBody),
            });
        } catch (err) {
            console.error("[Log Error]", err);
        }
    }
}

module.exports = Logger;
