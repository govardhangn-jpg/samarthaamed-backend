/**
 * Netlify Function: /api/orthanc-proxy
 *
 * Proxies all Orthanc REST API calls server-side, solving the CORS problem.
 * The browser never talks directly to Orthanc — everything goes through here.
 *
 * Usage:  GET/POST /api/orthanc-proxy?path=/studies
 *         GET      /api/orthanc-proxy?path=/instances/ID/preview&binary=1
 */

exports.handler = async function (event, context) {
  const orthancUrl  = process.env.ORTHANC_URL      || '';
  const orthancUser = process.env.ORTHANC_USER     || '';
  const orthancPass = process.env.ORTHANC_PASSWORD || '';

  if (!orthancUrl) {
    return {
      statusCode: 503,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'ORTHANC_URL not configured' }),
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  const path   = event.queryStringParameters?.path || '/system';
  const binary = event.queryStringParameters?.binary === '1';
  const url    = orthancUrl.replace(/\/$/, '') + path;

  const headers = {
    'Accept': binary ? 'image/jpeg' : 'application/json',
    'Content-Type': 'application/json',
  };
  if (orthancUser) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${orthancUser}:${orthancPass}`).toString('base64');
  }

  try {
    const fetchOpts = {
      method:  event.httpMethod === 'POST' ? 'POST' : 'GET',
      headers,
    };
    if (event.httpMethod === 'POST' && event.body) {
      fetchOpts.body = event.body;
    }

    const res = await fetch(url, fetchOpts);

    if (binary) {
      // Return image as base64
      const buf = await res.arrayBuffer();
      return {
        statusCode: res.status,
        headers: { ...corsHeaders(), 'Content-Type': res.headers.get('Content-Type') || 'image/jpeg' },
        body: Buffer.from(buf).toString('base64'),
        isBase64Encoded: true,
      };
    }

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (err) {
    console.error('[orthanc-proxy] Error:', err.message);
    return {
      statusCode: 502,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message }),
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store',
  };
}
