import { loadCatalog } from '../src/lib/catalog.ts';
import { packageContent } from '../src/lib/package-content.ts';

const entries = await loadCatalog();
const slugs = new Set(entries.map(entry => entry.slug));
for (const slug of Object.keys(packageContent))
  if (!slugs.has(slug)) throw new Error(`Page copy for unknown package: ${slug}`);
for (const entry of entries) {
  const content = packageContent[entry.slug];
  if (!content) throw new Error(`Missing package page content: ${entry.slug}`);
  for (const related of content.related)
    if (related === entry.slug || !slugs.has(related))
      throw new Error(`Invalid related package for ${entry.slug}: ${related}`);
  console.log(
    `${entry.slug}@${entry.version}: ${entry.counts.table} tables, ${entry.counts['seed-row']} seed rows, ${entry.counts.skill} skill, ${entry.counts.agent} read-only assistant, ${entry.counts.workflow} workflow${entry.counts.workflow === 1 ? '' : 's'}`,
  );
}
console.log(
  `Validated ${entries.length} packages: pinned authoritative schema, identities, typed references, seed fields, asset bytes, SHA-256 and page copy. No assets executed or packages installed.`,
);
