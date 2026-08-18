/** Vercel serverless proxy — serves dynamic sitemap at /sitemap.xml via vercel.json rewrite */
module.exports = async (_req, res) => {
  const apiUrl = (process.env.VITE_API_URL || process.env.API_URL || '').replace(/\/$/, '');

  if (!apiUrl) {
    res.status(503);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/sitemap.xml`, {
      headers: { Accept: 'application/xml' },
    });
    const xml = await response.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(response.ok ? 200 : response.status).send(xml);
  } catch {
    res.status(502);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('Sitemap temporarily unavailable');
  }
};
