const express = require("express");
const router = express.Router();
const urlStore = require("../store");
const Logger = require("../../Logging Middleware/logger");
const logger = new Logger();
require("dotenv").config();
const BASEURL = process.env.BASEURL || "http://localhost:4000"

router.get("/shorturls/:code", async (req, res) => {
    const code = req.params.code;
    if (!code.trim()) {
        await logger.log("backend", "warn", "route", "Shortcode can't be null or undefined")
        return res.status(401).json({ error: "Shortcode can't be null or undefined", success: false })
    }
    if (!urlStore.has(code)) {
        await logger.log("backend", "fatal", "route", `shortcode not found: ${code}`);
        return res.status(404).json({ error: "Short URL not found", success: false });
    }
    const entry = urlStore.get(code);
    const stats = {
        shortLink: `${BASEURL}/${code}`,
        originalUrl: entry.originalUrl,
        createdAt: entry.createdAt,
        expiry: new Date(entry.expiry).toISOString(),
        totalClicks: entry.clicks.length,
        clickDetails: entry.clicks,
    };
    await logger.log("backend", "info", "route", `Stats fetched for ${code}`);
    res.json({ success: true, stats });
})

module.exports = router