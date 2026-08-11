import http from 'http';
import { Server } from 'socket.io';
import config from './config/env.js';
import connectDB from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import app from './app.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientUrl.split(',').map((o) => o.trim()),
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[socket] client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[socket] client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

const start = async () => {
  await connectDB();
  await connectRedis();

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