import { loadCatalog } from '../src/lib/catalog.ts';

const entries = await loadCatalog();
for (const entry of entries) {
  console.log(
    `${entry.slug}@${entry.version}: ${entry.counts.table} tables, ${entry.counts['seed-row']} seed rows, ${entry.counts.skill} skill, ${entry.counts.agent} read-only assistant, ${entry.counts.workflow} manual workflow`,
  );
}
console.log(
  `Validated ${entries.length} packages: pinned authoritative schema, identities, typed references, seed fields, asset bytes and SHA-256. No assets executed or packages installed.`,
);
