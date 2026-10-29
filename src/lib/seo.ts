import type { CatalogEntry } from './catalog';
import { getPackageContent } from './package-content';
import { absoluteUrl, site } from './site';

const publisher = {
  '@type': 'Organization',
  '@id': 'https://tulipfarm.ai/#organization',
  name: 'TulipFarm',
  url: 'https://tulipfarm.ai/',
  logo: absoluteUrl('/favicon.svg'),
  sameAs: ['https://github.com/TulipFarm'],
};

const website = {
  '@type': 'WebSite',
  '@id': absoluteUrl('/#website'),
  name: site.name,
  url: absoluteUrl('/'),
  description: site.description,
  inLanguage: 'en',
  publisher: { '@id': publisher['@id'] },
};

export function catalogSchema(entries: CatalogEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      publisher,
      website,
      {
        '@type': 'CollectionPage',
        '@id': absoluteUrl('/#webpage'),
        name: site.name,
        description: site.description,
        url: absoluteUrl('/'),
        isPartOf: { '@id': website['@id'] },
        inLanguage: 'en',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: entries.length,
          itemListElement: entries.map((entry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: entry.document.package.title,
            url: absoluteUrl(entry.detailPath),
          })),
        },
      },
    ],
  };
}

export function packageSchema(entry: CatalogEntry) {
  const content = getPackageContent(entry.slug);
  const url = absoluteUrl(entry.detailPath);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      publisher,
      website,
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `${content.title} · ${site.name}`,
        description: content.description,
        inLanguage: 'en',
        isPartOf: { '@id': website['@id'] },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: { '@id': `${url}#package` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'All packages', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: entry.document.package.title, item: url },
        ],
      },
      {
        '@type': 'SoftwareSourceCode',
        '@id': `${url}#package`,
        name: entry.document.package.title,
        description: content.introduction,
        url,
        version: entry.version,
        programmingLanguage: 'JSON',
        runtimePlatform: 'TulipFarm',
        license: 'https://github.com/TulipFarm/packages/blob/main/LICENSE',
        codeRepository: `https://github.com/TulipFarm/packages/tree/main/packages/${entry.slug}/${entry.version}`,
        image: absoluteUrl(`/social/${entry.slug}.png`),
        publisher: { '@id': publisher['@id'] },
      },
    ],
  };
}
