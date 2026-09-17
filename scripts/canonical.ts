import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { JsonObject } from "../src/presets.js";

export function appArgument(): string | undefined {
  const index = process.argv.indexOf("--app");
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error("--app requires a checkout path");
  return resolve(value);
}

export function appModule(app: string, path: string) {
  return import(pathToFileURL(resolve(app, path)).href);
}

interface ToolDefinition {
  name: string;
  inputSchema: JsonObject;
}

export async function canonicalSchemas(app: string) {
  const [pack, agent, skill, resources, skills, agents, surfaces, catalog] = await Promise.all([
    appModule(app, "packages/schema/src/pack.ts"),
    appModule(app, "packages/schema/src/agent.ts"),
    appModule(app, "packages/schema/src/skill-tool-schemas.ts"),
    appModule(app, "apps/api/src/soul/resource-types/tools.ts"),
    appModule(app, "apps/api/src/soul/skills/tools.ts"),
    appModule(app, "apps/api/src/soul/agents/tools.ts"),
    appModule(app, "apps/api/src/soul/surface-components/tools.ts"),
    appModule(app, "packages/surface/src/catalog.ts"),
  ]);
  const allTools: ToolDefinition[] = [
    ...resources.RESOURCE_TYPE_TOOLS,
    ...skills.SKILL_TOOLS,
    ...agents.AGENT_TOOLS,
    ...surfaces.SURFACE_COMPONENT_TOOLS,
  ];
  const used = new Set([
    "create_resource_type",
    "list_resource_types",
    "resource_type_schema",
    "skill_create",
    "skill_list",
    "agent_create",
    "agent_get",
    "agent_list",
    "surface_component_create",
    "surface_component_get",
    "surface_component_list",
  ]);
  const toolSchemas = Object.fromEntries(
    allTools.filter((tool) => used.has(tool.name)).map((tool) => [tool.name, tool.inputSchema])
  );
  for (const name of used) {
    if (!toolSchemas[name]) throw new Error(`Canonical Tool not found: ${name}`);
  }
  const components: Array<{ name: string; version: string; propsSchema: JsonObject }> =
    catalog.SHIPPED_SURFACE_COMPONENTS;
  return {
    "pack-v1.schema.json": JSON.parse(
      await readFile(resolve(app, "apps/docs/public/schemas/pack/v1.schema.json"), "utf8")
    ),
    "catalog-v1.schema.json": pack.PackCatalogSchema,
    "authoring-tools.json": toolSchemas,
    "agent-frontmatter.schema.json": agent.AgentFrontmatterSchema,
    "skill-create.schema.json": skill.SKILL_CREATE_SCHEMA,
    "surface-primitives.json": Object.fromEntries(
      components
        .filter((component) => ["Section", "RecordTable", "Text"].includes(component.name))
        .map((component) => [`${component.name}@${component.version}`, component.propsSchema])
    ),
  } as Record<string, JsonObject>;
}
