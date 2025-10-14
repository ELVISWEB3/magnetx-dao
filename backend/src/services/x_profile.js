"use strict";

// Attempts to enrich an X (Twitter) profile link with follower count and avatar.
// Strategy:
// 1) If TWITTER_BEARER_TOKEN is set, use Twitter API v2 (official).
// 2) Otherwise, fallback to the public syndication endpoint.
// Always fail-soft: return null on any error.

function extractUsername(raw) {
  if (!raw) return null;
  try {
    let s = String(raw).trim();
    // Support @username input
    if (s.startsWith("@")) s = s.slice(1);
    // If it's a raw username without URL
    if (!/^https?:\/\//i.test(s)) return s.split("/")[0];

    const url = new URL(s);
    // Handle x.com or twitter.com
    if (/^(?:www\.)?(x|twitter)\.com$/i.test(url.hostname)) {
      // Path: /username[/...]
      const [username] = url.pathname.replace(/^\//, "").split("/");
      return username || null;
    }
    return null;
  } catch (_) {
    return null;
  }
}

async function enrichViaTwitterV2(username, token) {
  const endpoint = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(
    username
  )}?user.fields=profile_image_url,public_metrics`;
  const r = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const j = await r.json();
  const d = j && j.data;
  if (!d) return null;
  return {
    username: d.username || username,
    profile_image_url: d.profile_image_url || null,
    followers_count:
      d.public_metrics && typeof d.public_metrics.followers_count === "number"
        ? d.public_metrics.followers_count
        : null,
  };
}

async function enrichViaSyndication(username) {
  const endpoint = `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${encodeURIComponent(
    username
  )}`;
  const r = await fetch(endpoint, { headers: { "User-Agent": "curl/8" } });
  if (!r.ok) return null;
  const j = await r.json();
  if (!Array.isArray(j) || !j[0]) return null;
  const d = j[0];
  return {
    username: d.screen_name || username,
    profile_image_url: d.profile_image_url_https || d.profile_image_url || null,
    followers_count:
      typeof d.followers_count === "number" ? d.followers_count : null,
  };
}

async function enrichFromXProfileLink(link) {
  const username = extractUsername(link);
  if (!username) return null;

  // Prefer official API if token is provided
  const token = process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN;
  if (token) {
    try {
      const v2 = await enrichViaTwitterV2(username, token);
      if (v2) return v2;
    } catch (_) {
      // fall through to public endpoint
    }
  }

  // Fallback to public syndication endpoint
  try {
    const s = await enrichViaSyndication(username);
    if (s) return s;
  } catch (_) {
    // ignore
  }
  return null;
}

module.exports = { enrichFromXProfileLink };