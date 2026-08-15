import mongoose from 'mongoose';
import Block from '../models/BlockModel.js';
import Mute from '../models/MuteModel.js';

export const getBlockedIds = async (userId) => {
  if (!userId) return [];
  const rows = await Block.find({ blocker: userId }).select('blocked').lean();
  return rows.map((r) => new mongoose.Types.ObjectId(r.blocked));
};

export const getMutedIds = async (userId, scope) => {
  if (!userId) return [];
  const query = { muter: userId };
  if (scope) query.scope = { $in: [scope, 'all'] };
  else query.scope = 'all';
  const rows = await Mute.find(query).select('muted').lean();
  return rows.map((r) => new mongoose.Types.ObjectId(r.muted));
};

export const getSuppressedIds = async (userId, muteScope = 'feed') => {
  const [blocked, muted] = await Promise.all([
    getBlockedIds(userId),
    getMutedIds(userId, muteScope),
  ]);
  return [...new Set([...blocked.map(String), ...muted.map(String)])];
};