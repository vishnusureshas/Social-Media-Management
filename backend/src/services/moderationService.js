import ModerationKeyword from '../models/ModerationKeyword.js';
import { get, set, del } from './cacheService.js';

const CACHE_KEY = 'moderation:keywords:v1';
const CACHE_TTL = 300;

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getActiveKeywords = async () => {
  const cached = await get(CACHE_KEY);
  if (cached) return cached;

  const rows = await ModerationKeyword.find({ isActive: true }).select('keyword matchType').lean();
  const keywords = rows.map((r) => ({
    keyword: r.keyword,
    matchType: r.matchType === 'exact' ? 'exact' : 'includes',
  }));

  await set(CACHE_KEY, keywords, CACHE_TTL);
  return keywords;
};

export const clearKeywordCache = async () => {
  await del(CACHE_KEY);
};

/**
 * Scan free text for any configured moderation keyword.
 * Returns the list of matched keywords (lowercased).
 */
export const scanForKeywords = async (text = '') => {
  if (!text || typeof text !== 'string') return [];
  const keywords = await getActiveKeywords();
  const matches = [];

  for (const { keyword, matchType } of keywords) {
    if (matchType === 'exact') {
      const re = new RegExp(`(?:^|[^a-zA-Z0-9_])(${escapeRegExp(keyword)})(?:$|[^a-zA-Z0-9_])`, 'i');
      if (re.test(text)) matches.push(keyword);
    } else if (text.toLowerCase().includes(keyword)) {
      matches.push(keyword);
    }
  }

  return [...new Set(matches)];
};

/**
 * Flag a content doc as auto-moderated when it matches keywords.
 * Returns `{ flagged, matched, isFlagged }`. When `flagged`, the (already
 * created) document gets `isFlagged = true` so the admin queue surfaces it.
 */
export const autoModerate = async (model, id, text) => {
  const matched = await scanForKeywords(text);
  if (matched.length === 0) return { flagged: false, matched: [], isFlagged: false };

  await model.updateOne({ _id: id }, { $set: { isFlagged: true } });

  return { flagged: true, matched, isFlagged: true };
};

/**
 * Purely boolean check used to reject before persisting.
 */
export const containsFlaggedContent = async (text) => {
  const matched = await scanForKeywords(text);
  return matched.length > 0;
};