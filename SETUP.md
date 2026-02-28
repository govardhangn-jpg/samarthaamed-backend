# Samarthaa Session Backend — Setup Guide

## What this is
A Cloudflare Worker that acts as a central session registry.
When a user logs in on their phone, the worker records their token.
If they then open a laptop and log in, the worker records the new token.
The phone's heartbeat then gets `{ valid: false }` and shows "Session Ended".

Free tier is sufficient: 100,000 requests/day, unlimited KV reads.

---

## Step 1 — Create a Cloudflare account
Go to https://cloudflare.com and sign up (free).

---

## Step 2 — Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login        # opens browser to authenticate
```

---

## Step 3 — Create the KV namespace
```bash
wrangler kv:namespace create SESSIONS
```
This outputs something like:
```
{ binding = "SESSIONS", id = "abc123def456..." }
```
Copy the `id` value and paste it into `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SESSIONS"
id      = "abc123def456..."   # ← paste here
```

---

## Step 4 — Deploy
```bash
cd session-backend
npm install
npm run deploy
```
Output will show your worker URL:
```
https://samarthaa-session.YOUR-SUBDOMAIN.workers.dev
```
Copy this URL — you need it in the next step.

---

## Step 5 — Update the frontend
Open `index.html` and find this line near the top of the script:

```javascript
const SESSION_BACKEND_URL = 'https://samarthaa-session.YOUR-SUBDOMAIN.workers.dev';
```

Replace `YOUR-SUBDOMAIN` with your actual Cloudflare subdomain.

---

## Step 6 — Test it
Open two different browsers (e.g. Chrome + Firefox) and log in with the same user.
The first session should show "Session Ended" within 20 seconds.

---

## Step 7 — (Optional) Restrict CORS to your domain
In `src/worker.js`, change:
```javascript
'Access-Control-Allow-Origin': '*',
```
to:
```javascript
'Access-Control-Allow-Origin': 'https://your-app.netlify.app',
```

---

## Viewing active sessions (owner only)
Open this URL in your browser:
```
https://samarthaa-session.YOUR-SUBDOMAIN.workers.dev/session/status?code=INV-2026-OWNER-001
```
Returns JSON list of all currently active sessions with device info and IP.

---

## Monitoring logs
```bash
npm run tail
```
Streams live request logs from the worker.

---

## Costs
- Cloudflare Workers free tier: 100,000 requests/day
- KV free tier: 100,000 reads/day, 1,000 writes/day
- With 10 users polling every 20s: ~43,200 requests/day — well within free tier
- Paid plan ($5/month) gives 10M requests/day if you ever need it
