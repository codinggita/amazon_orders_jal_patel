"use strict";

/**
 * @file searchHelpers.js
 * @description Pure utility functions for the Search module.
 *
 * CONTENTS:
 *  1. escapeRegex       — sanitise user input before building a regex
 *  2. buildRegex        — standard case-insensitive contains-regex
 *  3. buildFuzzyRegex   — loose character-sequence regex (handles typos)
 *  4. buildPrefixRegex  — prefix (starts-with) regex for autocomplete
 *  5. getPagination     — extract & clamp page/limit from req.query
 *  6. buildHighlight    — returns match positions for client-side rendering
 *  7. parseDateRange    — converts YYYY / YYYY-MM / YYYY-MM-DD → { start, end }
 *  8. recordSearch      — write to in-memory recent/popular logs
 *  9. getRecentSearches — read recent log
 * 10. getPopularSearches— read popular frequency map
 *
 * NOTE ON PERSISTENCE:
 * Recent / Popular searches are stored in-memory (per process).
 * For multi-instance / distributed deployments, swap this layer for Redis.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Regex Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escape characters that have special meaning in a regex.
 * Prevents malicious or accidental regex injection from user input.
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Build a standard case-insensitive "contains" regex.
 * @param {string} q - Raw query string from req.query.q
 * @returns {RegExp}
 */
const buildRegex = (q) => new RegExp(escapeRegex(q.trim()), "i");

/**
 * Build a fuzzy regex that tolerates misspellings.
 *
 * Strategy: join each character with `.{0,2}` so that up to 2 extra
 * characters are allowed between any two query characters.
 * This catches common typos like "headfone" → matches "headphone".
 *
 * @param {string} q - Raw query string
 * @returns {RegExp}
 */
const buildFuzzyRegex = (q) => {
  const escaped = escapeRegex(q.trim());
  // Allow 0-2 wildcard chars between each character in the pattern
  const fuzzyPattern = escaped.split("").join(".{0,2}");
  return new RegExp(fuzzyPattern, "i");
};

/**
 * Build a prefix (starts-with) regex for autocomplete suggestions.
 * @param {string} q
 * @returns {RegExp}
 */
const buildPrefixRegex = (q) => new RegExp(`^${escapeRegex(q.trim())}`, "i");

// ─────────────────────────────────────────────────────────────────────────────
// 2. Pagination
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract and normalise pagination params from req.query.
 * Joi has already validated these; this is a convenience parser.
 * @param {Object} query - req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Highlight Metadata
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find all occurrences of `q` inside `text` and return structured
 * highlight metadata (start/end indices + matched text).
 *
 * Clients can use this to wrap matched text in <mark> or apply bold styling
 * without needing to re-run the search on the frontend.
 *
 * @param {string} text - Field value to inspect
 * @param {string} q    - Search term
 * @returns {{ text: string, highlights: Array<{start,end,text}> }}
 */
const buildHighlight = (text, q) => {
  if (!text || typeof text !== "string") return { text: text || "", highlights: [] };

  const regex = new RegExp(`(${escapeRegex(q.trim())})`, "gi");
  const highlights = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    highlights.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
    });
  }

  return { text, highlights };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Date Range Parsing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a validated date query string into an inclusive date range.
 *
 * Supported formats:
 *   "2025"       → full year  (2025-01-01 00:00:00 → 2026-01-01 00:00:00)
 *   "2025-01"    → full month (2025-01-01 00:00:00 → 2025-02-01 00:00:00)
 *   "2025-01-15" → single day (2025-01-15 00:00:00 → 2025-01-15 23:59:59)
 *
 * @param {string} q - Validated date string
 * @returns {{ start: Date, end: Date }}
 */
const parseDateRange = (q) => {
  const parts = q.split("-");

  if (parts.length === 1) {
    // Year only
    const year = parseInt(parts[0], 10);
    return {
      start: new Date(`${year}-01-01T00:00:00.000Z`),
      end: new Date(`${year + 1}-01-01T00:00:00.000Z`),
    };
  }

  if (parts.length === 2) {
    // Year-Month
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-indexed
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1)); // first of next month
    return { start, end };
  }

  // Full date YYYY-MM-DD
  const start = new Date(`${q}T00:00:00.000Z`);
  const end = new Date(`${q}T23:59:59.999Z`);
  return { start, end };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. In-Memory Recent & Popular Search Tracking
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RECENT = 100; // ring buffer size

/** @type {Array<{ q: string, type: string, searchedAt: Date }>} */
const recentSearches = [];

/** @type {Map<string, number>} lowercase-q → search count */
const popularSearchMap = new Map();

/**
 * Record a search query in both recent log and popular frequency map.
 * @param {string} q    - Search term
 * @param {string} type - Route type (e.g. 'global', 'product', 'fuzzy')
 */
const recordSearch = (q, type = "global") => {
  // Prepend to recent (newest first)
  recentSearches.unshift({ q, type, searchedAt: new Date() });
  if (recentSearches.length > MAX_RECENT) recentSearches.pop();

  // Increment frequency counter
  const key = q.toLowerCase().trim();
  popularSearchMap.set(key, (popularSearchMap.get(key) || 0) + 1);
};

/**
 * Get the most recent N searches (newest first).
 * @param {number} limit
 * @returns {Array}
 */
const getRecentSearches = (limit = 10) => recentSearches.slice(0, limit);

/**
 * Get the top N most searched terms by frequency.
 * @param {number} limit
 * @returns {Array<{ q: string, count: number }>}
 */
const getPopularSearches = (limit = 10) =>
  [...popularSearchMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([q, count]) => ({ q, count }));

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  escapeRegex,
  buildRegex,
  buildFuzzyRegex,
  buildPrefixRegex,
  getPagination,
  buildHighlight,
  parseDateRange,
  recordSearch,
  getRecentSearches,
  getPopularSearches,
};
