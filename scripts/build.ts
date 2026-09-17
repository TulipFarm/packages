import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { validateRepository } from "./validation.js";

const packs = await validateRepository();
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
await cp("LICENSE", "dist/LICENSE");
for (const pack of packs) {
  await cp(`public/${pack.name}.yaml`, `dist/${pack.name}`);
}
const headers = [
  "/*",
  "  X-Content-Type-Options: nosniff",
  "  Access-Control-Allow-Origin: *",
  "  Cache-Control: public, max-age=300",
  "  Content-Security-Policy: default-src 'none'; frame-ancestors 'none'",
  "",
  "/index.json",
  "  Content-Type: application/json; charset=utf-8",
  "",
  ...packs.flatMap((pack) => [
    `/${pack.name}.yaml`,
    "  Content-Type: application/yaml; charset=utf-8",
    "",
    `/${pack.name}`,
    "  Content-Type: application/yaml; charset=utf-8",
    "",
  ]),
].join("\n");
await writeFile("dist/_headers", headers);
console.log(
  `Built dist/: catalog, ${packs.length} YAML files, ${packs.length} extensionless aliases, and static headers. Not deployed.`
);
