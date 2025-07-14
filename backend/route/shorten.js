const express = require("express");
const { nanoid } = require("nanoid");
const router = express.Router();
const urlStore = require("../store");
const Logger = require("../../Logging Middleware/logger");
const logger = new Logger();

require("dotenv").config();
const BASEURL = process.env.BASEURL || "http://localhost:4000"

const getExpiry = (validityMins = 30) => Date.now() + validityMins * 60 * 1000;

router.post("/shorturls", async (req, res) => {
    const { url, shortcode, validity } = req.body;
    if (!url) {
        await logger.log("backend", "error", "route", "url missing");
        return res.status(400).json({ error: "Url is required", success: false });
    }
    let code = shortcode || nanoid(6);
    if (urlStore.has(code)) {
        await logger.log("backend", "error", "route", `shortcode already exists : ${code}`);
        return res.status(409).json({ error: "shortcode already exists", success: false });
    }
    const expiry = getExpiry(validity || 30)
    urlStore.set(code, {
        url,
        expiry: expiry,
        createdAt: new Date().toISOString(),
        clicks: [],
    });

    const shortUrl = `${BASEURL}/${code}`
    await logger.log("backend", "info", "service", `Shortened URL: ${shortUrl}`);
    res.json({ shortUrl, success: true, expiry: new Date(expiry).toISOString() });
});

router.get("/:code", async (req, res) => {
    const { code } = req.params;

    if (!urlStore.has(code)) {
        await logger.log("backend", "fatal", "route", `shortcode not found: ${code}`);
        return res.status(404).json({ error: "Short URL not found", success: false });
    }
    const entry = urlStore.get(code);
    const { url, expiry } = urlStore.get(code);

    if (Date.now() > expiry) {
        urlStore.delete(code);
        await logger.log("backend", "info", "service", `Link expired: ${code}`);
        return res.status(410).json({ error: "Short URL expired", success: false });
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;

    let geo = {
        country: "India",
        region: "Punjab",
        city: "Jalandhar"
    };

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        console.log(data)
        if (data.status === "success") {
            geo = {
                country: data.country || "unknown",
                region: data.regionName || "unknown",
                city: data.city || "unknown"
            };
        }
    } catch (error) {
        await logger.log("backend", "warn", "service", `Failed to fetch geo for IP: ${ip}`);
    }

    entry.clicks.push({
        timestamp: new Date().toISOString(),
        referrer: req.headers.referer || "direct",
        geo
    });

    await logger.log("backend", "info", "route", `Redirecting to ${url} from ${geo.country}, ${geo.city}`);
    res.redirect(url);
});

module.exports = router;
