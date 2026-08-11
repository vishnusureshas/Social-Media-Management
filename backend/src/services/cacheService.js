import { getRedisClient } from '../config/redis.js';
import config from '../config/env.js';

const PREFIX = 'nexus:';

const get = async (key) => {
  const c = getRedisClient();
  if (!c?.isReady) return null;
  try {
    const raw = await c.get(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const set = async (key, value, ttlSeconds = config.redis.cacheTtl) => {
  const c = getRedisClient();
  if (!c?.isReady) return false;
  try {
    await c.set(PREFIX + key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch {
    return false;
  }
};

const del = async (key) => {
  const c = getRedisClient();
  if (!c?.isReady) return false;
  try {
    await c.del(PREFIX + key);
    return true;
  } catch {
    return false;
  }
};

const delByPattern = async (pattern) => {
  const c = getRedisClient();
  if (!c?.isReady) return;
  try {
    const keys = await c.keys(PREFIX + pattern);
    if (keys.length > 0) await c.del(keys);
  } catch {
    /* ignore */
  }
};

export { get, set, del, delByPattern };