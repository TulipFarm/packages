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
    // Published v1 feed contract: TulipFarm apps reject the feed unless page is the
    // versioned path. It 301-redirects to the canonical unversioned detail page.
    page: `/packages/${entry.slug}/${entry.version}/`,
  }));
  return Response.json({ schema: 'https://tulipfarm.ai/schemas/system-package.v1.json', packages });
};
