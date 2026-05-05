export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { series_id, api_key } = req.query;

  if (!series_id || !api_key) {
    return res.status(400).json({ error: 'Missing series_id or api_key' });
  }

  const url = `https://api.stlouisfed.org/fred/series/observations`
    + `?series_id=${encodeURIComponent(series_id)}`
    + `&api_key=${encodeURIComponent(api_key)}`
    + `&file_type=json`
    + `&observation_start=1967-01-01`
    + `&sort_order=asc`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
