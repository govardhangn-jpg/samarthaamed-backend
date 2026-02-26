/**
 * Netlify Function: /api/config
 *
 * Serves API keys from Netlify Environment Variables to the frontend.
 * Keys are NEVER stored in source code or git — set them in:
 *   Netlify Dashboard → Site → Environment variables
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY   — your Claude API key  (sk-ant-…)
 *   ELEVENLABS_API_KEY  — your ElevenLabs key  (sk_…)
 *   ELEVENLABS_VOICE_ID — your ElevenLabs voice ID
 */

exports.handler = async function (event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const anthropicKey   = process.env.ANTHROPIC_API_KEY   || '';
  const elevenLabsKey  = process.env.ELEVENLABS_API_KEY  || '';
  const elevenLabsVoice = process.env.ELEVENLABS_VOICE_ID || '';

  // Warn in function logs if any key is missing (visible in Netlify function logs)
  if (!anthropicKey)    console.warn('[config] WARNING: ANTHROPIC_API_KEY is not set');
  if (!elevenLabsKey)   console.warn('[config] WARNING: ELEVENLABS_API_KEY is not set');
  if (!elevenLabsVoice) console.warn('[config] WARNING: ELEVENLABS_VOICE_ID is not set');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      // Prevent the response being cached or stored by the browser
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
    body: JSON.stringify({
      anthropicKey,
      elevenLabsKey,
      elevenLabsVoiceId: elevenLabsVoice,
    }),
  };
};
