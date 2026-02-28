/**
 * SamarthaaMed Clinical Intelligence Platform
 * Backend API Server — Node.js / Express
 *
 * Endpoints:
 *   GET  /api/config          → serves API keys to the frontend
 *   ALL  /api/orthanc-proxy   → reverse-proxies Orthanc PACS requests (avoids CORS)
 *   GET  /health              → uptime check for Render
 */

'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const fetch      = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Security middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,   // frontend sets its own CSP
}));

// Allow requests from the frontend (Netlify / Render static / localhost)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.length === 0 ||       // no restriction configured → allow all
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'xi-api-key', 'x-api-key'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/dicom', limit: '200mb' }));

// Rate limiter — protect config endpoint
const configLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 60,
  message: { error: 'Too many requests — please slow down' },
});

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'samarthaamed-backend', timestamp: new Date().toISOString() });
});

// ─── /api/config ────────────────────────────────────────────────────────────
// Returns API keys to the authenticated frontend.
// Keys are stored as environment variables on Render — never hard-coded.
app.get('/api/config', configLimiter, (req, res) => {
  res.json({
    anthropicKey:      process.env.ANTHROPIC_API_KEY       || '',
    elevenLabsKey:     process.env.ELEVENLABS_API_KEY      || '',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID     || '',
    orthancUrl:        process.env.ORTHANC_URL             || '',
  });
});

// ─── /api/orthanc-proxy ─────────────────────────────────────────────────────
// Reverse-proxies all Orthanc PACS requests through this server so the
// browser never hits Orthanc directly (avoids CORS + hides credentials).
//
// Usage:  GET  /api/orthanc-proxy?path=/studies
//         POST /api/orthanc-proxy?path=/tools/find
//         GET  /api/orthanc-proxy?path=/instances/:id/preview&binary=1
app.all('/api/orthanc-proxy', async (req, res) => {
  const orthancBase = (process.env.ORTHANC_URL || '').replace(/\/$/, '');
  const orthancUser = process.env.ORTHANC_USERNAME || 'orthanc';
  const orthancPass = process.env.ORTHANC_PASSWORD || 'orthanc';

  if (!orthancBase) {
    return res.status(503).json({ error: 'Orthanc not configured on this server' });
  }

  const orthancPath = req.query.path || '/';
  const isBinary    = req.query.binary === '1';
  const isUpload    = req.query.upload === '1';

  const targetUrl = `${orthancBase}${orthancPath}`;
  const authHeader = 'Basic ' + Buffer.from(`${orthancUser}:${orthancPass}`).toString('base64');

  try {
    const fetchOptions = {
      method:  req.method === 'GET' ? 'GET' : req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type':  isUpload ? 'application/dicom' : 'application/json',
      },
    };

    if (['POST', 'PUT'].includes(req.method)) {
      fetchOptions.body = isUpload ? req.body : JSON.stringify(req.body);
    }

    const orthancRes = await fetch(targetUrl, fetchOptions);

    if (isBinary) {
      // Stream image/binary data back as-is
      const buffer = await orthancRes.buffer();
      const ct = orthancRes.headers.get('content-type') || 'application/octet-stream';
      res.set('Content-Type', ct);
      return res.send(buffer);
    }

    // JSON response
    const data = await orthancRes.json();
    res.status(orthancRes.status).json(data);

  } catch (err) {
    console.error('[orthanc-proxy] Error:', err.message);
    res.status(502).json({ error: 'Failed to reach Orthanc server', detail: err.message });
  }
});

// ─── 404 fallback ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ SamarthaaMed backend running on port ${PORT}`);
  console.log(`   Anthropic key:    ${process.env.ANTHROPIC_API_KEY   ? '✅ set' : '⚠️  NOT SET'}`);
  console.log(`   ElevenLabs key:   ${process.env.ELEVENLABS_API_KEY  ? '✅ set' : '⚠️  NOT SET'}`);
  console.log(`   ElevenLabs voice: ${process.env.ELEVENLABS_VOICE_ID ? '✅ set' : '⚠️  NOT SET'}`);
  console.log(`   Orthanc URL:      ${process.env.ORTHANC_URL         ? '✅ set' : '—  not configured'}`);
});
