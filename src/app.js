// src/app.js
// Express application setup (middleware, basic routes, error handling).

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const violationRoutes = require("./routes/violation.routes");

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// JSON parsing
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/violations", violationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("[ERROR] Unhandled error:", err);
  const statusCode = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;

