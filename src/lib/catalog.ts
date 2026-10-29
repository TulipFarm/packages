import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export type ResourceKind = 'table' | 'seed-row' | 'skill' | 'agent' | 'workflow' | 'integration' | 'file';
export type Category = 'Marketing' | 'Sales' | 'Support' | 'HR' | 'Engineering' | 'Product';
type Reference = { kind: 'resource'; resourceKind: ResourceKind; key: string };
type Field = {
  key: string;
  label: string;
  kind: string;
  required: boolean;
  target?: Reference;
  cardinality?: string;
  maxLength?: number;
  options?: Array<{ key: string; label: string; retired: boolean }>;
};
type RowValue = { kind: string; value?: unknown; option?: string; options?: string[]; rows?: Reference[] } | null;
export type PackageResource = {
  key: string;
  kind: ResourceKind;
  label?: string;
  name?: string;
  fields?: Field[];
  table?: Reference;
  values?: Record<string, RowValue>;
  definition?: { name: string; instructions: string };
  files?: Array<{ path: string; asset: string }>;
  [key: string]: unknown;
};
export interface PackageDocument {
  $schema: string;
  formatVersion: number;
  package: { name: string; title: string; description: string; version: string; license: string };
  requires: { platform: string; capabilities: string[] };
  inputs: Array<{ key: string; kind: string; title: string; [key: string]: unknown }>;
  resources: PackageResource[];
  assets: Array<{
    key: string;
    path: string;
    encoding: 'utf8' | 'base64';
    content: string;
    size: number;
    sha256: string;
  }>;
  outputs: Array<{ key: string; resource: Reference }>;
}
export interface CatalogEntry {
  slug: string;
  version: string;
  category: Category;
  tags: string[];
  useCases: string[];
  detailPath: `/packages/${string}/${string}/`;
  downloadPath: `/packages/${string}/${string}/package.json`;
  raw: string;
  document: PackageDocument;
  resources: Array<{
    key: string;
    kind: ResourceKind;
    title: string;
    description: string;
    dependencies: string[];
    fields: Array<{ label: string; kind: string; required: boolean }>;
  }>;
  counts: Record<ResourceKind, number>;
}
const root = resolve(process.cwd());
const schemaUrl = 'https://tulipfarm.ai/schemas/system-package.v1.json';
const hash = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function unique(values: string[], label: string) {
  assert(new Set(values).size === values.length, `Duplicate ${label}`);
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function references(value: unknown): Array<Reference | { kind: 'input'; inputKind: string; key: string }> {
  if (Array.isArray(value)) return value.flatMap(references);
  if (!object(value) || value.kind === 'literal') return [];
  if (value.kind === 'resource' && typeof value.resourceKind === 'string' && typeof value.key === 'string')
    return [value as Reference];
  if (value.kind === 'input' && typeof value.inputKind === 'string' && typeof value.key === 'string')
    return [value as { kind: 'input'; inputKind: string; key: string }];
  return Object.values(value).flatMap(references);
}
async function validator() {
  const pin = JSON.parse(await readFile(resolve(root, 'catalog/schema-pin.json'), 'utf8')) as {
    url: string;
    sha256: string;
  };
  assert(pin.url === schemaUrl && /^[a-f0-9]{64}$/.test(pin.sha256), 'Invalid authoritative schema pin');
  const cache = resolve(root, 'catalog/system-package.v1.schema.json');
  let bytes: Buffer;
  try {
    bytes = await readFile(cache);
  } catch (error) {
    if (!(object(error) && error.code === 'ENOENT')) throw error;
    const response = await fetch(pin.url, { signal: AbortSignal.timeout(20000) });
    assert(response.ok, `Schema fetch failed: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    assert(hash(bytes) === pin.sha256, 'Authoritative schema changed: review and explicitly update the pin');
    await writeFile(cache, bytes, { flag: 'wx' });
  }
  assert(hash(bytes) === pin.sha256, 'Schema cache digest mismatch; refusing unverified schema');
  const schema = JSON.parse(bytes.toString('utf8'));
  assert(schema.$id === schemaUrl, 'Unexpected schema identity');
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile<PackageDocument>(schema);
}
function checkDocument(doc: PackageDocument) {
  for (const [label, items] of Object.entries({
    resources: doc.resources,
    inputs: doc.inputs,
    assets: doc.assets,
    outputs: doc.outputs,
  }))
    unique(
      items.map(item => item.key),
      label,
    );
  unique(
    doc.assets.map(asset => asset.path),
    'asset paths',
  );
  unique(doc.requires.capabilities, 'capabilities');
  const resources = new Map(doc.resources.map(resource => [resource.key, resource]));
  const inputs = new Map(doc.inputs.map(input => [input.key, input]));
  const assets = new Map(doc.assets.map(asset => [asset.key, asset]));
  for (const ref of references([doc.resources, doc.outputs])) {
    assert(
      ref.kind === 'resource'
        ? resources.get(ref.key)?.kind === ref.resourceKind
        : inputs.get(ref.key)?.kind === ref.inputKind,
      `Invalid typed reference: ${ref.key}`,
    );
  }
  let bytesTotal = 0;
  for (const asset of doc.assets) {
    const bytes = Buffer.from(asset.content, asset.encoding);
    assert(
      asset.encoding !== 'base64' || bytes.toString('base64') === asset.content,
      `Noncanonical base64: ${asset.key}`,
    );
    assert(bytes.length === asset.size && hash(bytes) === asset.sha256, `Asset integrity mismatch: ${asset.key}`);
    bytesTotal += bytes.length;
  }
  assert(bytesTotal <= 32 * 1024 * 1024, 'Package assets exceed 32 MiB');
  const capabilities: Record<ResourceKind, string> = {
    table: 'tables',
    'seed-row': 'seed-rows',
    skill: 'skills',
    agent: 'agents',
    workflow: 'workflows',
    integration: 'integration-bindings',
    file: 'files',
  };
  for (const resource of doc.resources) {
    assert(doc.requires.capabilities.includes(capabilities[resource.kind]), `Missing capability for ${resource.key}`);
    if (resource.kind === 'table') {
      unique(
        resource.fields!.map(field => field.key),
        `${resource.key} fields`,
      );
      for (const field of resource.fields!)
        if (field.options)
          unique(
            field.options.map(option => option.key),
            `${resource.key}.${field.key} options`,
          );
    }
    if (resource.kind === 'skill') {
      assert(resource.requestedState === 'enabled', `Assistant skill must request enablement: ${resource.key}`);
      unique(
        resource.files!.map(file => file.path),
        `${resource.key} paths`,
      );
      assert(
        resource.files!.some(file => file.path === 'SKILL.md'),
        `Missing SKILL.md: ${resource.key}`,
      );
      for (const file of resource.files!) assert(assets.has(file.asset), `Unknown asset: ${file.asset}`);
    }
    if (resource.kind === 'agent') {
      const definition = resource.definition as Record<string, unknown>;
      assert(
        Array.isArray(definition.tools) && definition.tools.every(tool => tool === 'rows.list' || tool === 'rows.get'),
        `Non-read-only assistant tools: ${resource.key}`,
      );
      for (const key of ['scope', 'limits']) {
        const grants = resource[key];
        assert(
          Array.isArray(grants) &&
            grants.every(
              grant =>
                object(grant) &&
                Array.isArray(grant.permissions) &&
                grant.permissions.every(permission => permission === 'table.row.read'),
            ),
          `Non-read-only assistant ${key}: ${resource.key}`,
        );
      }
      assert(
        resource.requestedState === 'active' && Array.isArray(resource.schedules) && resource.schedules.length === 0,
        `Unexpected assistant activation: ${resource.key}`,
      );
    }
    if (resource.kind === 'workflow') {
      assert(
        object(resource.trigger) && resource.trigger.kind === 'manual' && resource.requestedState === 'saved',
        `Expected saved manual workflow: ${resource.key}`,
      );
      assert(
        Array.isArray(resource.steps) &&
          resource.steps.every(step => object(step) && (step.kind === 'human' || step.kind === 'agent')),
        `Unexpected workflow action: ${resource.key}`,
      );
    }
    if (resource.kind === 'seed-row') {
      const table = resources.get(resource.table!.key)!;
      const fields = new Map(table.fields!.map(field => [field.key, field]));
      for (const field of table.fields!)
        assert(
          !field.required || resource.values![field.key] != null,
          `Missing required value: ${resource.key}.${field.key}`,
        );
      for (const [key, value] of Object.entries(resource.values!)) {
        const field = fields.get(key);
        assert(field, `Unknown seed field: ${resource.key}.${key}`);
        if (value === null) continue;
        assert(value.kind === field.kind, `Seed kind mismatch: ${resource.key}.${key}`);
        if (value.kind === 'text')
          assert(
            typeof value.value === 'string' && value.value.length <= field.maxLength!,
            `Text too long: ${resource.key}.${key}`,
          );
        for (const option of value.options ?? (value.option ? [value.option] : []))
          assert(
            field.options?.some(candidate => candidate.key === option && !candidate.retired),
            `Unknown or retired option: ${resource.key}.${key}`,
          );
        if (value.rows) {
          assert(
            field.cardinality !== 'one' || value.rows.length === 1,
            `Invalid relationship cardinality: ${resource.key}.${key}`,
          );
          for (const row of value.rows)
            assert(
              resources.get(row.key)?.table?.key === field.target?.key,
              `Wrong relationship table: ${resource.key}.${key}`,
            );
        }
      }
    }
  }
}
function title(resource: PackageResource, doc: PackageDocument): string {
  if (resource.label || resource.name || resource.definition?.name)
    return resource.label ?? resource.name ?? resource.definition!.name;
  if (resource.kind === 'seed-row') {
    const values = Object.values(resource.values ?? {});
    const text = values.find(value => value?.kind === 'text' && typeof value.value === 'string');
    if (text) return String(text.value);
  }
  if (resource.kind === 'skill') {
    const asset = doc.assets.find(item => item.key === resource.files?.find(file => file.path === 'SKILL.md')?.asset);
    const heading = asset?.content.match(/^# (.+)$/m)?.[1];
    if (heading) return `${heading} procedure`;
  }
  return resource.key
    .split('-')
    .map(part => part[0]!.toUpperCase() + part.slice(1))
    .join(' ');
}
function describe(resource: PackageResource, doc: PackageDocument): string {
  if (resource.kind === 'table')
    return `${resource.fields!.length} fields: ${resource.fields!.map(field => field.label).join(', ')}.`;
  if (resource.kind === 'agent') return resource.definition!.instructions;
  if (resource.kind === 'skill')
    return 'A bundled SKILL.md with domain-specific review steps, evidence rules, and human decision boundaries.';
  if (resource.kind === 'workflow')
    return 'Manually started review: a person confirms the request, then the read-only assistant prepares recommendations.';
  if (resource.kind === 'seed-row')
    return `Fictional example row in ${title(
      doc.resources.find(item => item.key === resource.table!.key)!,
      doc,
    )}.`;
  return `Declared ${resource.kind} resource.`;
}
export async function loadCatalog(): Promise<CatalogEntry[]> {
  const validate = await validator();
  const metadata: unknown = JSON.parse(await readFile(resolve(root, 'catalog/catalog.json'), 'utf8'));
  assert(Array.isArray(metadata), 'Catalog metadata must be an array');
  const categories = ['Marketing', 'Sales', 'Support', 'HR', 'Engineering', 'Product'];
  const identities: string[] = [];
  const entries: CatalogEntry[] = [];
  for (const entry of metadata) {
    assert(object(entry), 'Invalid catalog metadata');
    assert(
      Object.keys(entry).sort().join(',') === 'category,slug,tags,useCases,version',
      'Unexpected discovery metadata fields',
    );
    assert(typeof entry.slug === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(entry.slug), 'Invalid catalog slug');
    assert(typeof entry.version === 'string' && /^\d+\.\d+\.\d+$/.test(entry.version), 'Invalid catalog version');
    assert(typeof entry.category === 'string' && categories.includes(entry.category), 'Invalid category');
    assert(
      Array.isArray(entry.tags) &&
        entry.tags.length > 0 &&
        entry.tags.every(tag => typeof tag === 'string' && tag.trim()),
      'Invalid tags',
    );
    assert(
      Array.isArray(entry.useCases) &&
        entry.useCases.length === 3 &&
        entry.useCases.every(item => typeof item === 'string' && item.trim()),
      'Expected three supported use cases',
    );
    unique(entry.tags, 'tags');
    unique(entry.useCases, 'use cases');
    const identity = `${entry.slug}/${entry.version}`;
    identities.push(identity);
    const bytes = await readFile(resolve(root, 'packages', identity, 'package.json'));
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    assert(Buffer.from(raw).equals(bytes), `Source must be exact UTF-8 without a BOM: ${identity}`);
    const doc: unknown = JSON.parse(raw);
    assert(validate(doc), `${identity}: ${JSON.stringify(validate.errors)}`);
    assert(
      doc.$schema === schemaUrl &&
        doc.package.name === entry.slug &&
        doc.package.version === entry.version &&
        doc.package.license === 'MIT',
      `Package identity or license mismatch: ${identity}`,
    );
    checkDocument(doc);
    const counts: Record<ResourceKind, number> = {
      table: 0,
      'seed-row': 0,
      skill: 0,
      agent: 0,
      workflow: 0,
      integration: 0,
      file: 0,
    };
    const resources = doc.resources.map(resource => {
      counts[resource.kind]++;
      return {
        key: resource.key,
        kind: resource.kind,
        title: title(resource, doc),
        description: describe(resource, doc),
        dependencies: [
          ...new Set(
            references(resource)
              .filter(ref => ref.kind === 'resource')
              .map(ref => ref.key),
          ),
        ],
        fields: (resource.fields ?? []).map(({ label, kind, required }) => ({ label, kind, required })),
      };
    });
    entries.push({
      slug: entry.slug,
      version: entry.version,
      category: entry.category as Category,
      tags: entry.tags,
      useCases: entry.useCases,
      detailPath: `/packages/${entry.slug}/${entry.version}/`,
      downloadPath: `/packages/${entry.slug}/${entry.version}/package.json`,
      raw,
      document: doc,
      resources,
      counts,
    });
  }
  unique(identities, 'package identities');
  const disk: string[] = [];
  for (const slug of await readdir(resolve(root, 'packages'), { withFileTypes: true })) {
    assert(slug.isDirectory(), `Unexpected packages entry: ${slug.name}`);
    for (const version of await readdir(resolve(root, 'packages', slug.name), { withFileTypes: true })) {
      assert(version.isDirectory(), `Unexpected version entry: ${slug.name}/${version.name}`);
      disk.push(`${slug.name}/${version.name}`);
    }
  }
  assert(disk.sort().join('\n') === identities.sort().join('\n'), 'Package directories and catalog identities differ');
  return entries.sort((a, b) => a.slug.localeCompare(b.slug, 'en') || a.version.localeCompare(b.version, 'en'));
}
