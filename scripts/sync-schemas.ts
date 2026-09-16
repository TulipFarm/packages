import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { appArgument, canonicalSchemas } from "./canonical.js";

const app = appArgument();
if (!app) throw new Error("Usage: pnpm sync-schemas --app /path/to/tulipfarm");
const schemas = await canonicalSchemas(app);
await mkdir("schemas", { recursive: true });
const hashes: Record<string, string> = {};
for (const [name, schema] of Object.entries(schemas)) {
  const bytes = `${JSON.stringify(schema, null, 2)}\n`;
  await writeFile(`schemas/${name}`, bytes);
  hashes[name] = createHash("sha256").update(bytes).digest("hex");
}
const sourceFiles = [
  "apps/docs/scripts/generate-pack-schema.ts",
  "apps/docs/public/schemas/pack/v1.schema.json",
  "packages/schema/src/pack.ts",
  "packages/schema/src/plan.ts",
  "packages/schema/src/agent.ts",
  "packages/schema/src/skill-tool-schemas.ts",
  "packages/schema/src/skill-frontmatter.ts",
  "packages/schema/src/transforms/validate-schema.ts",
  "packages/run-kernel/src/routine/dag-plan.ts",
  "apps/api/src/soul/resource-types/tools.ts",
  "apps/api/src/soul/skills/tools.ts",
  "apps/api/src/soul/agents/tools.ts",
  "apps/api/src/soul/surface-components/tools.ts",
  "packages/surface/src/catalog.ts",
  "packages/surface/src/soul.ts",
];
const sourceHashes = Object.fromEntries(
  await Promise.all(
    sourceFiles.map(async (path) => [
      path,
      createHash("sha256")
        .update(await readFile(`${app}/${path}`))
        .digest("hex"),
    ])
  )
);
const provenance = {
  repository: "https://github.com/TulipFarm/tulipfarm",
  baseCommit: execFileSync("git", ["-C", app, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  note: "Generated from the canonical checkout; source hashes identify in-progress changes beyond baseCommit. Schemas are data snapshots, not a runtime dependency.",
  schemaSha256: hashes,
  sourceSha256: sourceHashes,
};
await writeFile("schemas/provenance.json", `${JSON.stringify(provenance, null, 2)}\n`);
console.log(`Pinned ${Object.keys(schemas).length} canonical schema files.`);
