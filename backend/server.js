require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[startup] MONGO_URI is required');
    process.exit(1);
  }
  try {
    await connectDB(uri);
  } catch (err) {
    console.error('[startup] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[server] Invoice API listening on http://localhost:${PORT}`);
    console.log(`[server] Health: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received — shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 8000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  start();
}

module.exports = { start };
