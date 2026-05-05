export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const series_id = req.query.series_id;
  const api_key   = req.query.api_key;

  if (!series_id || !api_key) {
    return res.status(400).json({ error: 'Missing series_id or api_key' });
  }

  // Use URL constructor instead of url.parse() to avoid deprecation warning
  const fredUrl = new URL('https://api.stlouisfed.org/fred/series/observations');
  fredUrl.searchParams.set('series_id',        series_id);
  fredUrl.searchParams.set('api_key',          api_key);
  fredUrl.searchParams.set('file_type',        'json');
  fredUrl.searchParams.set('observation_start','1950-01-01');
  fredUrl.searchParams.set('sort_order',       'asc');

  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(fredUrl.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(response.status).json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'FRED API request timed out' });
    }
    return res.status(500).json({ error: err.message });
  }
}
