/**
 * Netlify Function: /api/config
 * 
 * Serves API keys securely from Netlify environment variables to the browser.
 * Keys are NEVER hardcoded — set them in:
 *   Netlify Dashboard → Site → Environment variables
 * 
 * Required env vars:
 *   ANTHROPIC_API_KEY      — Claude AI key
 *   ELEVENLABS_API_KEY     — ElevenLabs TTS key
 *   ELEVENLABS_VOICE_ID    — ElevenLabs voice ID
 * 
 * Optional:
 *   ORTHANC_URL            — Orthanc PACS server URL
 */

exports.handler = async function (event, context) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
      // Don't cache — keys may be rotated
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    },
    body: JSON.stringify({
      anthropicKey:      process.env.ANTHROPIC_API_KEY      || '',
      elevenLabsKey:     process.env.ELEVENLABS_API_KEY     || '',
      elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID    || '',
      orthancUrl:        process.env.ORTHANC_URL            || ''
    })
  };
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
}
