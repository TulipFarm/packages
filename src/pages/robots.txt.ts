import type { APIRoute } from 'astro';
import { absoluteUrl, isIndexingEnabled } from '../lib/site';

export const GET: APIRoute = () =>
  new Response(
    isIndexingEnabled()
      ? `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
