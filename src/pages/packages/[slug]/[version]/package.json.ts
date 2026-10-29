import type { APIRoute, GetStaticPaths } from 'astro';
import { loadCatalog } from '../../../../lib/catalog';

export const getStaticPaths: GetStaticPaths = async () =>
  (await loadCatalog()).map(entry => ({
    params: { slug: entry.slug, version: entry.version },
    props: { raw: entry.raw },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(props.raw, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
