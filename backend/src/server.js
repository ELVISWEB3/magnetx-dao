"use strict";
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// If running behind a proxy (e.g., Render/Heroku/NGINX), trust it for correct IPs
app.set("trust proxy", true);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Security headers
app.use(helmet());

// CORS
const corsOrigin = process.env.CORS_ORIGIN || "*";
const corsOptions = {
  origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((s) => s.trim()),
};
app.use(cors(corsOptions));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || "60", 10),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Forms routes
const formsRouter = require("./routes/forms");
app.use("/api/forms", formsRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "not_found" }));

// Error handler
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "internal_error" });
});

const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
