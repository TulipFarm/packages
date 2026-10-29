import type { APIRoute } from 'astro';
import { loadCatalog } from '../lib/catalog';

export const GET: APIRoute = async () => {
  const packages = (await loadCatalog()).map(entry => ({
    name: entry.slug,
    version: entry.version,
    title: entry.document.package.title,
    description: entry.document.package.description,
    license: entry.document.package.license,
    category: entry.category,
    tags: entry.tags,
    url: entry.downloadPath,
    page: entry.detailPath,
  }));
  return Response.json({ schema: 'https://tulipfarm.ai/schemas/system-package.v1.json', packages });
};
