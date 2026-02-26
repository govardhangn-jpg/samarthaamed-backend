/**
 * Netlify Function: /api/config
 *
 * Serves API keys and service URLs from Netlify Environment Variables.
 * Keys are NEVER stored in source code or git — set them in:
 *   Netlify Dashboard → Site → Environment variables
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY    — Claude API key  (sk-ant-…)
 *   ELEVENLABS_API_KEY   — ElevenLabs key  (sk_…)
 *   ELEVENLABS_VOICE_ID  — ElevenLabs Voice ID
 *
 * Optional env vars (for Orthanc/PACS integration):
 *   ORTHANC_URL          — e.g. https://pacs.yourhospital.com
 *   ORTHANC_USER         — Orthanc username
 *   ORTHANC_PASSWORD     — Orthanc password
 */

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const anthropicKey    = process.env.ANTHROPIC_API_KEY    || '';
  const elevenLabsKey   = process.env.ELEVENLABS_API_KEY   || '';
  const elevenLabsVoice = process.env.ELEVENLABS_VOICE_ID  || '';
  const orthancUrl      = process.env.ORTHANC_URL          || '';
  const orthancUser     = process.env.ORTHANC_USER         || '';
  const orthancPassword = process.env.ORTHANC_PASSWORD     || '';

  if (!anthropicKey)  console.warn('[config] WARNING: ANTHROPIC_API_KEY is not set');
  if (!elevenLabsKey) console.warn('[config] WARNING: ELEVENLABS_API_KEY is not set');
  if (!orthancUrl)    console.info('[config] INFO: ORTHANC_URL not set — PACS integration disabled');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
    body: JSON.stringify({
      anthropicKey,
      elevenLabsKey,
      elevenLabsVoiceId: elevenLabsVoice,
      orthancUrl,
      orthancUser,
      orthancPassword,
    }),
  };
};
