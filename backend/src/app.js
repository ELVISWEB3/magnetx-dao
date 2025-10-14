"use strict";
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const formsRouter = require("./routes/forms");

const app = express();

// Trust reverse proxy headers (for correct IPs)
app.set("trust proxy", true);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Security headers
app.use(helmet());

// CORS (production only, no localhost)
const corsOrigin = process.env.CORS_ORIGIN || "*"; // you can restrict later by setting env
const corsOptions = {
  origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((s) => s.trim()),
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || "60", 10),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Dropdown data endpoints (static for now)
app.get("/api/community", (req, res) => {
  res.json({ "1": "DEFI", "2": "NFTs", "3": "Traffic" });
});
app.get("/api/skill", (req, res) => {
  res.json({ "1": "Communication", "2": "Social Media  Management", "3": "Content writing" });
});
app.get("/api/category", (req, res) => {
  res.json({ "1": "Airdrop", "2": "Etc", "3": "Etc" });
});

// Forms routes
app.use("/api/forms", formsRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "not_found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "internal_error" });
});

module.exports = app;
