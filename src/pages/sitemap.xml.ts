import type { APIRoute } from 'astro';
import { loadCatalog } from '../lib/catalog';
import { absoluteUrl, isIndexingEnabled } from '../lib/site';

export const GET: APIRoute = async () => {
  const paths = isIndexingEnabled() ? ['/', ...(await loadCatalog()).map(entry => entry.detailPath)] : [];
  const urls = paths.map(path => `<url><loc>${absoluteUrl(path)}</loc></url>`).join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  );
};
