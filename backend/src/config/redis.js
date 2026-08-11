import { createClient } from 'redis';
import config from './env.js';

let client = null;
let connectionPromise = null;

const getRedisClient = () => {
  if (!config.redis.enabled) return null;

  if (!client) {
    client = createClient({ url: config.redis.url });

    client.on('error', (err) => {
      console.error(`[redis] error :: ${err.message}`);
    });

    client.on('connect', () => console.log('[redis] connected'));
    client.on('reconnecting', () => console.log('[redis] reconnecting...'));
  }

  return client;
};

const connectRedis = async () => {
  if (!config.redis.enabled) {
    console.log('[redis] disabled — using in-memory/no cache');
    return null;
  }

  const c = getRedisClient();
  if (!c) return null;
  if (c.isReady) return c;

  if (!connectionPromise) {
    connectionPromise = c.connect().catch((err) => {
      console.error(`[redis] connect failed :: ${err.message}`);
      connectionPromise = null;
      return null;
    });
  }

  return connectionPromise;
};

const getRedisStatus = () => {
  if (!config.redis.enabled) return 'disabled';
  if (!client) return 'not-connected';
  return client.isReady ? 'connected' : client.isOpen ? 'connecting' : 'disconnected';
};

const disconnectRedis = async () => {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
    connectionPromise = null;
  }
};

export { getRedisClient, connectRedis, getRedisStatus, disconnectRedis };