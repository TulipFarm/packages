import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parseDocument, stringify } from "yaml";
import {
  artifactTools,
  catalogOrigin,
  categories,
  makePack,
  type Pack,
  schemaComment,
} from "../src/pack.js";
import { type JsonObject, presets } from "../src/presets.js";
import { appModule, canonicalSchemas } from "./canonical.js";

export function object(value: unknown): JsonObject {
  assert(value !== null && typeof value === "object" && !Array.isArray(value), "Expected object");
  return value as JsonObject;
}
export function array(value: unknown): unknown[] {
  assert(Array.isArray(value), "Expected array");
  return value;
}

export function parsePackYaml(source: string): unknown {
  assert(Buffer.byteLength(source) <= 128 * 1024, "Pack exceeds 128 KiB");
  const document = parseDocument(source, { uniqueKeys: true });
  assert.equal(document.errors.length, 0, document.errors.map((error) => error.message).join("\n"));
  assert.equal(document.warnings.length, 0, "Unsupported YAML tags or directives");
  return document.toJS({ maxAliasCount: 0 });
}

export function validateDag(plan: JsonObject): Map<string, Set<string>> {
  const steps = array(plan.steps).map(object);
  const byId = new Map(steps.map((step) => [String(step.id), step]));
  assert.equal(byId.size, steps.length, "Duplicate step ID");
  const ancestors = new Map<string, Set<string>>();
  const active = new Set<string>();
  function visit(id: string): Set<string> {
    const done = ancestors.get(id);
    if (done) return done;
    assert(!active.has(id), `Dependency cycle at ${id}`);
    const step = byId.get(id);
    assert(step, `Unknown dependency ${id}`);
    active.add(id);
    const result = new Set<string>();
    for (const dependency of array(step.needs ?? [])) {
      assert.equal(typeof dependency, "string");
      const parent = String(dependency);
      assert.notEqual(parent, id, "Self dependency");
      result.add(parent);
      for (const ancestor of visit(parent)) result.add(ancestor);
    }
    active.delete(id);
    ancestors.set(id, result);
    return result;
  }
  for (const id of byId.keys()) visit(id);
  for (const step of steps) {
    function walk(value: unknown) {
      if (typeof value === "string") {
        for (const match of value.matchAll(/\$\{([^}]*)\}/g)) {
          const expression = match[1].trim();
          const reference =
            /^states\.([A-Za-z][A-Za-z0-9_]*)\.output(?:\.[A-Za-z][A-Za-z0-9_]*)*$/.exec(
              expression
            );
          assert(
            reference || /^input(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(expression),
            `Unsupported expression ${expression}; use --app for the full compiler`
          );
          if (reference)
            assert(
              ancestors.get(String(step.id))?.has(reference[1]),
              `Undeclared state reference ${reference[1]}`
            );
        }
      } else if (Array.isArray(value)) {
        value.forEach(walk);
      } else if (value !== null && typeof value === "object") {
        Object.values(value).forEach(walk);
      }
    }
    walk(step.input);
    walk(step.prompt);
  }
  return ancestors;
}

const json = async (path: string) => JSON.parse(await readFile(path, "utf8")) as JsonObject;

export async function createValidator() {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats.default(ajv);
  const packSchema = await json("schemas/pack-v1.schema.json");
  const catalogSchema = await json("schemas/catalog-v1.schema.json");
  const toolSchemas = await json("schemas/authoring-tools.json");
  const frontmatterSchema = await json("schemas/agent-frontmatter.schema.json");
  const primitives = await json("schemas/surface-primitives.json");
  const validatePack = ajv.compile(packSchema);
  const validateCatalog = ajv.compile(catalogSchema);
  function check(schema: JsonObject, value: unknown, label: string) {
    const validate = ajv.compile(schema);
    assert(validate(value), `${label}: ${ajv.errorsText(validate.errors, { separator: "; " })}`);
  }
  function tool(name: string, input: unknown) {
    assert(toolSchemas[name], `Unknown or unpinned Tool ${name}`);
    check(object(toolSchemas[name]), input, name);
  }
  function resource(schema: JsonObject) {
    assert.equal(schema.type, "object");
    assert.equal(schema.additionalProperties, false);
    assert(ajv.validateSchema(schema), "Invalid Resource JSON Schema");
    const properties = object(schema.properties);
    const rootExtensions = new Set(["x-unique"]);
    const fieldExtensions = new Set(["x-links", "x-immutable", "x-normalize"]);
    for (const name of Object.keys(schema).filter((name) => name.startsWith("x-"))) {
      assert(rootExtensions.has(name), `Unknown Resource extension ${name}`);
    }
    for (const property of Object.values(properties).map(object)) {
      for (const name of Object.keys(property).filter((name) => name.startsWith("x-"))) {
        assert(fieldExtensions.has(name), `Unknown field extension ${name}`);
      }
      if (property["x-links"]) assert.equal(typeof object(property["x-links"]).target, "string");
      if (property["x-immutable"] !== undefined)
        assert.equal(typeof property["x-immutable"], "boolean");
      for (const normalizer of array(property["x-normalize"] ?? [])) {
        assert(
          ["trim", "lowercase", "uppercase", "slugify", "phone-e164", "email-normalize"].includes(
            String(normalizer)
          ),
          "Unknown normalizer"
        );
      }
    }
    for (const unique of array(schema["x-unique"])) {
      assert(array(unique).length > 0, "Empty unique key");
      for (const field of array(unique))
        assert(Object.hasOwn(properties, String(field)), `Unknown unique field ${String(field)}`);
    }
    assert(array(schema.examples).length > 0, "Missing Resource example");
    for (const example of array(schema.examples)) check(schema, example, "Resource example");
  }
  function surface(template: JsonObject) {
    const propsSchema = object(template.propsSchema);
    const views = object(template.views);
    const usedProps = new Set<string>();
    for (const example of array(template.examples)) {
      check(propsSchema, example, "Surface example");
      function node(value: unknown) {
        const view = object(value);
        const component = object(view.component);
        const key = `${component.name}@${component.version}`;
        assert(primitives[key], `Unknown Surface primitive ${key}`);
        const props = Object.fromEntries(
          Object.entries(object(view.props)).map(([name, prop]) => {
            if (prop !== null && typeof prop === "object" && "$prop" in prop) {
              const pointer = String(object(prop).$prop);
              assert(/^\/[^/]+$/.test(pointer), "Only top-level bindings are used by these Packs");
              usedProps.add(pointer.slice(1));
              return [name, object(example)[pointer.slice(1)]];
            }
            return [name, prop];
          })
        );
        check(object(primitives[key]), props, `${key} bound props`);
        for (const child of array(view.children ?? [])) node(child);
      }
      for (const view of Object.values(views)) node(view);
    }
    assert.deepEqual(
      [...usedProps].sort(),
      Object.keys(object(propsSchema.properties)).sort(),
      "Every Surface prop must be rendered"
    );
    assert.deepEqual(template.events, [], "Presets must remain display-only");
  }
  function pack(value: unknown): Pack {
    assert(validatePack(value), `Pack schema: ${ajv.errorsText(validatePack.errors)}`);
    const pack = value as Pack;
    const previewCharacters = JSON.stringify({
      pack,
      sha256: "0".repeat(64),
      url: `${catalogOrigin}/${pack.name}.yaml`,
    }).length;
    assert(previewCharacters <= 38_000, "Pack preview exceeds the 38,000-character Chat budget");
    const ancestors = validateDag(object(pack.plan));
    const ids = new Set<string>();
    const resources = new Set(
      pack.artifacts.filter((item) => item.kind === "resource").map((item) => item.name)
    );
    for (const artifact of pack.artifacts) {
      const id = `${artifact.kind}:${artifact.name}`;
      assert(!ids.has(id), `Duplicate artifact ${id}`);
      ids.add(id);
      tool(artifactTools[artifact.kind], artifact.template);
      assert.equal(artifact.template[artifact.kind === "surface" ? "slug" : "name"], artifact.name);
      if (artifact.kind === "resource") {
        const schema = object(parsePackYaml(String(artifact.template.schema)));
        resource(schema);
        for (const property of Object.values(object(schema.properties)).map(object)) {
          if (property["x-links"])
            assert(
              resources.has(String(object(property["x-links"]).target)),
              "Unresolved Resource type relation"
            );
        }
      }
      if (artifact.kind === "skill") {
        assert.equal(object(artifact.template.frontmatter).name, artifact.name);
        assert.equal(typeof artifact.template.body, "string");
        assert(!("confirm" in artifact.template), "Never store confirmation tokens in presets");
      }
      if (artifact.kind === "agent") {
        check(frontmatterSchema, artifact.template.frontmatter, "Agent frontmatter");
        const restrictions = object(object(artifact.template.frontmatter).capabilityRestrictions);
        assert.equal(object(restrictions.tools).allowMutating, false);
        assert(!array(object(restrictions.tools).allow).includes("*"), "Broad Tool wildcard");
        for (const skill of array(object(restrictions.skills).allow)) {
          assert(ids.has(`skill:${String(skill)}`), "Agent Skill must be declared first");
        }
      }
      if (artifact.kind === "surface") surface(artifact.template);
    }
    for (const kind of ["resource", "skill", "agent", "surface"]) {
      assert(
        pack.artifacts.some((item) => item.kind === kind),
        `Missing ${kind} preset`
      );
    }
    for (const step of pack.plan.steps) {
      assert(/^[A-Z][A-Za-z0-9]*$/.test(step.id), "Use PascalCase step IDs");
      tool(step.tool, step.input);
      if (step.tool === "skill_create") {
        assert(ancestors.get(step.id)?.has("InspectSkills"), "Audit requires inventory");
        if (step.input.confirm !== undefined) {
          assert.equal(step.id, "ConfirmSkill", "Unexpected Skill confirmation");
          assert.deepEqual(
            step.input,
            {
              name: pack.artifacts.find((artifact) => artifact.kind === "skill")?.name,
              confirm: `\${states.AuditSkill.output.confirm}`,
            },
            "Skill confirmation must use only name and the live audited token reference"
          );
          assert(
            ancestors.get(step.id)?.has("AuditSkill"),
            "Confirmation requires the audited draft"
          );
        }
      }
      if (step.tool === "create_resource_type") {
        assert(ancestors.get(step.id)?.has("InspectResources"), "Creation requires inventory");
        const matching = pack.artifacts.find(
          (item) => item.kind === "resource" && item.name === step.input.name
        );
        assert.deepEqual(step.input, matching?.template, "Plan/preset drift");
      }
    }
    for (const artifact of pack.artifacts) {
      const authoring = pack.plan.steps.find(
        (step) =>
          step.tool === artifactTools[artifact.kind] &&
          step.input[artifact.kind === "surface" ? "slug" : "name"] === artifact.name &&
          step.input.confirm === undefined
      );
      assert(authoring, `Complete graph missing ${artifact.kind}:${artifact.name}`);
      assert.deepEqual(authoring.input, artifact.template, "Plan/preset drift");
    }
    assert(
      pack.plan.steps.some((step) => step.id === "ConfirmSkill"),
      "Missing Skill confirmation"
    );
    assert(ancestors.get("CreateSurface")?.has("ConfirmSkill"), "Surface requires confirmed Skill");
    assert(ancestors.get("CreateAgent")?.has("ConfirmSkill"), "Agent requires confirmed Skill");
    assert(ancestors.get("CreateAgent")?.has("CreateSurface"), "Agent requires published Surface");
    assert(ancestors.get("VerifyAgent")?.has("CreateAgent"), "Verify the published Agent");
    return pack;
  }
  return { pack, tool, check, resource, surface, validateCatalog, validatePack };
}

export async function validateRepository(app?: string): Promise<Pack[]> {
  const validator = await createValidator();
  const provenance = await json("schemas/provenance.json");
  for (const [name, expected] of Object.entries(object(provenance.schemaSha256))) {
    assert.equal(
      createHash("sha256")
        .update(await readFile(`schemas/${name}`))
        .digest("hex"),
      expected,
      `Pinned schema checksum: ${name}`
    );
  }
  const files = (await readdir("public")).filter((file) => file.endsWith(".yaml")).sort();
  assert.equal(files.length, 15, "Expected exactly 15 Packs");
  const packs: Pack[] = [];
  for (const file of files) {
    const source = await readFile(`public/${file}`, "utf8");
    assert(source.startsWith(schemaComment), `Missing language-server schema comment: ${file}`);
    const pack = validator.pack(parsePackYaml(source));
    assert.equal(file, `${pack.name}.yaml`, "Filename/slug mismatch");
    const preset = presets.find((preset) => preset.name === pack.name);
    assert(preset, `Unknown generated Pack ${pack.name}`);
    assert.deepEqual(pack, makePack(preset), `Stale generated output: ${file}; run pnpm generate`);
    packs.push(pack);
  }
  assert.equal(new Set(packs.map((pack) => pack.name)).size, 15, "Duplicate Pack name");
  assert.deepEqual([...new Set(packs.map((pack) => pack.category))].sort(), [...categories].sort());
  const catalog = await json("public/index.json");
  assert(validator.validateCatalog(catalog), "Invalid catalog schema");
  const entries = array(catalog.packs).map(object);
  assert.equal(entries.length, 15);
  assert.equal(new Set(entries.map((entry) => entry.name)).size, 15, "Duplicate catalog entry");
  for (const pack of packs) {
    const { name, title, description, category, version } = pack;
    assert.deepEqual(
      entries.find((entry) => entry.name === name),
      {
        name,
        title,
        description,
        category,
        version,
        url: `${catalogOrigin}/${name}.yaml`,
      },
      `Catalog parity: ${name}`
    );
  }
  if (app) {
    const snapshots = await canonicalSchemas(app);
    for (const [name, expected] of Object.entries(snapshots)) {
      assert.deepEqual(
        await json(`schemas/${name}`),
        JSON.parse(JSON.stringify(expected)),
        `Canonical schema drift: ${name}`
      );
    }
    const [schema, compiler, surface, renderer] = await Promise.all([
      appModule(app, "packages/schema/src/index.ts"),
      appModule(app, "packages/run-kernel/src/routine/dag-plan.ts"),
      appModule(app, "packages/surface/src/index.ts"),
      appModule(app, "apps/api/src/surfaces/renderer-registry.ts"),
    ]);
    for (const pack of packs) {
      schema.validatePackDefinition(pack);
      compiler.compileYamlPlan(stringify(pack.plan));
      for (const artifact of pack.artifacts) {
        if (artifact.kind === "resource")
          schema.validateResourceSchema(parsePackYaml(String(artifact.template.schema)));
        if (artifact.kind === "agent")
          schema.validateAgentFrontmatter(artifact.template.frontmatter);
        if (artifact.kind === "skill") {
          const result = schema.validateSkill({
            name: artifact.name,
            frontmatter: artifact.template.frontmatter,
            body: artifact.template.body,
            content: schema.serializeSkill(artifact.template.frontmatter, artifact.template.body),
          });
          assert(result.valid, result.error);
        }
        if (artifact.kind === "surface") {
          const component = { ...artifact.template, name: `business.${artifact.name}` };
          surface.validateSoulSurfaceComponent(component, renderer.surfaceRendererRegistry);
          for (const example of array(artifact.template.examples)) {
            surface.resolveSoulSurfacePresentation(
              component,
              { channel: "web", surface: "chat" },
              example,
              [component],
              renderer.surfaceRendererRegistry
            );
          }
        }
      }
    }
  }
  return packs;
}
