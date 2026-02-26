// src/server.js
// Main server entry point: loads environment, starts Express app, and initializes the Telegram bot.

require("dotenv").config();

const http = require("http");
const app = require("./app");

// Initialize Telegram bot (side-effect import)
require("./bot/telegram.bot");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`[SERVER] Smart Traffic Violation Management System running on port ${PORT}`);
});

