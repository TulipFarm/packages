import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { stringify } from "yaml";
import { catalogOrigin, makePack, schemaComment } from "../src/pack.js";
import { presets } from "../src/presets.js";

await mkdir("public", { recursive: true });
const packs = presets.map(makePack);
const expected = new Set(packs.map((pack) => `${pack.name}.yaml`));
for (const file of await readdir("public")) {
  if (file.endsWith(".yaml") && !expected.has(file)) await unlink(`public/${file}`);
}
for (const pack of packs) {
  await writeFile(
    `public/${pack.name}.yaml`,
    schemaComment +
      stringify(pack, {
        lineWidth: 100,
        blockQuote: "literal",
        aliasDuplicateObjects: false,
      })
  );
}
const entries = packs.map(({ name, title, description, category, version }) => ({
  name,
  title,
  description,
  category,
  version,
  url: `${catalogOrigin}/${name}.yaml`,
}));
await writeFile("public/index.json", `${JSON.stringify({ packs: entries }, null, 2)}\n`);
console.log(`Generated ${packs.length} original Packs and catalog entries.`);
