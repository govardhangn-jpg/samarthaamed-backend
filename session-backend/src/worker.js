/**
 * Samarthaa Session Management Worker
 * ─────────────────────────────────────────────────────────────────
 * Cloudflare Worker + KV store that enforces one active session
 * per user across ALL devices and browsers.
 *
 * KV key schema:
 *   session:{invitationCode}  →  { token, loginTime, device, ip, expiresAt }
 *
 * Endpoints:
 *   POST /session/register   — login: register new session (kicks old one)
 *   POST /session/validate   — heartbeat: check if token is still active
 *   POST /session/logout     — logout: remove session from KV
 *   GET  /session/status     — admin: list all active sessions (owner only)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  'https://samarthaamed.netlify.app',         // restrict to your domain in production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Allowed invitation codes — mirrors validInvitations in the frontend.
// Only these codes can register sessions. Add new users here when you
// add them to the frontend validInvitations object.
const VALID_CODES = new Set([
  'INV-2026-OWNER-001',
  'INV-2026-OWNER-002',
  'INV-2026-DEMO-GEN-001',
  'INV-2026-DENTAL-SUJAY-001',
  'INV-2026-DEMO-BOPANNA-001',
]);

// Owner codes that can call /session/status
const OWNER_CODES = new Set([
  'INV-2026-OWNER-001',
  'INV-2026-OWNER-002',
]);

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      if (request.method === 'POST' && url.pathname === '/session/register') {
        return await handleRegister(request, env);
      }
      if (request.method === 'POST' && url.pathname === '/session/validate') {
        return await handleValidate(request, env);
      }
      if (request.method === 'POST' && url.pathname === '/session/logout') {
        return await handleLogout(request, env);
      }
      if (request.method === 'GET' && url.pathname === '/session/status') {
        return await handleStatus(request, env);
      }
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error('Worker error:', err);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};

// ── POST /session/register ────────────────────────────────────────
// Called on login. Overwrites any existing session for this user.
// The previous session (any device) will detect its token is gone
// on next heartbeat and show the kick overlay.
async function handleRegister(request, env) {
  const body = await request.json().catch(() => null);
  if (!body?.invitationCode || !body?.token) {
    return json({ error: 'invitationCode and token are required' }, 400);
  }

  const { invitationCode, token, device, expiryDays = 1 } = body;

  if (!VALID_CODES.has(invitationCode)) {
    return json({ error: 'Invalid invitation code' }, 403);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const expiresAt = now + (expiryDays * 24 * 60 * 60 * 1000);

  const sessionData = {
    token,
    loginTime:  new Date(now).toISOString(),
    device:     device || 'unknown',
    ip,
    expiresAt,
  };

  // KV TTL is in seconds — auto-expire the key after expiryDays
  await env.SESSIONS.put(
    `session:${invitationCode}`,
    JSON.stringify(sessionData),
    { expirationTtl: expiryDays * 24 * 60 * 60 }
  );

  return json({ success: true, registeredAt: sessionData.loginTime });
}

// ── POST /session/validate ────────────────────────────────────────
// Called every 20s as a heartbeat. Returns { valid: true/false }.
// If false, the frontend shows the "Session Ended" overlay.
async function handleValidate(request, env) {
  const body = await request.json().catch(() => null);
  if (!body?.invitationCode || !body?.token) {
    return json({ valid: false, reason: 'missing_fields' });
  }

  const { invitationCode, token } = body;

  const raw = await env.SESSIONS.get(`session:${invitationCode}`);
  if (!raw) {
    return json({ valid: false, reason: 'no_session' });
  }

  let sessionData;
  try { sessionData = JSON.parse(raw); }
  catch(e) { return json({ valid: false, reason: 'corrupt_data' }); }

  // Check token matches AND not expired
  if (sessionData.token !== token) {
    return json({ valid: false, reason: 'session_displaced', 
      message: 'Your account was signed in from another device.' });
  }

  if (Date.now() > sessionData.expiresAt) {
    return json({ valid: false, reason: 'session_expired' });
  }

  return json({ valid: true });
}

// ── POST /session/logout ──────────────────────────────────────────
// Called on logout. Deletes the KV key so the session is fully gone.
async function handleLogout(request, env) {
  const body = await request.json().catch(() => null);
  if (!body?.invitationCode || !body?.token) {
    return json({ error: 'invitationCode and token are required' }, 400);
  }

  const { invitationCode, token } = body;

  // Only delete if the token matches (prevent another session from logging out this user)
  const raw = await env.SESSIONS.get(`session:${invitationCode}`);
  if (raw) {
    let sessionData;
    try { sessionData = JSON.parse(raw); } catch(e) {}
    if (sessionData?.token === token) {
      await env.SESSIONS.delete(`session:${invitationCode}`);
    }
  }

  return json({ success: true });
}

// ── GET /session/status ───────────────────────────────────────────
// Owner-only: list all active sessions. Pass ?code=INV-2026-OWNER-001
async function handleStatus(request, env) {
  const url    = new URL(request.url);
  const code   = url.searchParams.get('code');

  if (!OWNER_CODES.has(code)) {
    return json({ error: 'Unauthorized' }, 403);
  }

  // List all session keys in KV
  const list = await env.SESSIONS.list({ prefix: 'session:' });
  const sessions = [];

  for (const key of list.keys) {
    const raw = await env.SESSIONS.get(key.name);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        sessions.push({
          user:      key.name.replace('session:', ''),
          loginTime: data.loginTime,
          device:    data.device,
          ip:        data.ip,
          expiresAt: new Date(data.expiresAt).toISOString(),
        });
      } catch(e) {}
    }
  }

  return json({ activeSessions: sessions, count: sessions.length });
}

// ── Helpers ───────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}
