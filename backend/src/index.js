import http from 'http';
import { Server } from 'socket.io';
import config from './config/env.js';
import connectDB from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import app from './app.js';
import initSocket from './sockets/index.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientUrl.split(',').map((o) => o.trim()),
    credentials: true,
  },
});

initSocket(io);

app.set('io', io);

const start = async () => {
  await connectDB();
  await connectRedis();

  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      '[warning] Cloudinary is NOT configured. Image/video uploads will fail. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env'
    );
  }

  server.listen(config.port, () => {
    console.log(`[server] running in ${config.env} mode on port ${config.port}`);
    console.log(`[server] health check: http://localhost:${config.port}/api/v1/health`);
  });
};

process.on('unhandledRejection', (err) => {
  console.error(`[fatal] unhandled rejection :: ${err.message}`);
  disconnectRedis().finally(() => server.close(() => process.exit(1)));
});

process.on('uncaughtException', (err) => {
  console.error(`[fatal] uncaught exception :: ${err.message}`);
  disconnectRedis().finally(() => server.close(() => process.exit(1)));
});

start();