export const site = {
  url: 'https://packages.tulipfarm.ai',
  name: 'TulipFarm Packages',
  description:
    'Explore open-source packages for sales, support, marketing, HR and product work. See the tables, skills, agents and workflows for your TulipFarm workspace.',
};

export function absoluteUrl(path: string) {
  return new URL(path, `${site.url}/`).href;
}

export function isIndexingEnabled() {
  return (
    import.meta.env.PROD &&
    process.env.SITE_INDEXING === 'true' &&
    (!process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_BRANCH === 'main')
  );
}
