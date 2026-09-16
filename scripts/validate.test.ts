import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { artifactTools, makePack } from "../src/pack.js";
import { presets } from "../src/presets.js";
import { createValidator, parsePackYaml, validateDag, validateRepository } from "./validation.js";

test("all fifteen generated Packs and examples validate offline", async () => {
  assert.equal((await validateRepository()).length, 15);
});

test("every Pack has a complete graph for every artifact and the separate Skill confirmation", () => {
  for (const preset of presets) {
    const pack = makePack(preset);
    for (const artifact of pack.artifacts) {
      const authoringStep = pack.plan.steps.find(
        (step) =>
          step.tool === artifactTools[artifact.kind] &&
          step.input[artifact.kind === "surface" ? "slug" : "name"] === artifact.name &&
          step.input.confirm === undefined
      );
      assert(authoringStep, `${pack.name}: missing ${artifact.kind} authoring step`);
      assert.deepEqual(authoringStep.input, artifact.template);
    }
    const confirmation = pack.plan.steps.find((step) => step.id === "ConfirmSkill");
    assert(confirmation, `${pack.name}: missing Skill confirmation step`);
    assert.deepEqual(confirmation.needs, ["AuditSkill"]);
    assert.equal(confirmation.input.confirm, `\${states.AuditSkill.output.confirm}`);
    const ancestors = validateDag(pack.plan);
    assert(ancestors.get("CreateAgent")?.has("ConfirmSkill"));
    assert(ancestors.get("CreateAgent")?.has("CreateSurface"));
  }
});

test("the README wire example validates against the canonical Pack shape", async () => {
  const validator = await createValidator();
  const readme = await readFile("README.md", "utf8");
  const examples = [...readme.matchAll(/```yaml\n([\s\S]*?)```/g)];
  assert.equal(examples.length, 1);
  for (const example of examples) {
    const pack = parsePackYaml(example[1]);
    assert(validator.validatePack(pack), "README Pack must match the canonical schema");
  }
});

test("reject unknown Pack fields and unsupported categories", async () => {
  const validator = await createValidator();
  const pack = makePack(presets[0]);
  assert.throws(() => validator.pack({ ...pack, install: true }), /Pack schema/);
  assert.throws(() => validator.pack({ ...pack, category: "Finance" }), /Pack schema/);
});

test("a structurally valid Pack must still fit the complete Chat result budget", async () => {
  const validator = await createValidator();
  const pack = makePack(presets[0]);
  const skill = pack.artifacts.find((artifact) => artifact.kind === "skill");
  assert(skill);
  skill.template.body = "a".repeat(38_000);
  assert.throws(() => validator.pack(pack), /Chat budget/);
});

test("reject invalid Tool arguments rather than accepting arbitrary preset objects", async () => {
  const validator = await createValidator();
  assert.throws(() => validator.tool("fictional_install", {}), /Unknown/);
  assert.throws(
    () => validator.tool("create_resource_type", { name: "lead", schema: {} }),
    /string/
  );
  assert.throws(
    () => validator.tool("agent_create", { name: "lead", body: "", grantAll: true }),
    /additional properties/
  );
});

test("reject dependency cycles, duplicate IDs, missing dependencies and output leaks", () => {
  const step = (id: string, needs: string[] = []) => ({ id, needs, tool: "skill_list", input: {} });
  assert.throws(() => validateDag({ steps: [step("A", ["B"]), step("B", ["A"])] }), /cycle/);
  assert.throws(() => validateDag({ steps: [step("A"), step("A")] }), /Duplicate/);
  assert.throws(() => validateDag({ steps: [step("A", ["Missing"])] }), /Unknown dependency/);
  assert.throws(() => validateDag({ steps: [step("A", ["A"])] }), /Self dependency/);
  const reference = `\${states.A.output.confirm}`;
  assert.throws(
    () =>
      validateDag({
        steps: [step("A"), { ...step("B"), input: { value: reference } }],
      }),
    /Undeclared/
  );
  assert.doesNotThrow(() =>
    validateDag({
      steps: [step("A"), { ...step("B", ["A"]), input: { value: reference } }],
    })
  );
});

test("reject malformed YAML, duplicate keys, aliases and oversized files", () => {
  assert.throws(() => parsePackYaml("kind: Pack\nkind: Plan\n"));
  assert.throws(() => parsePackYaml("a: &shared [one]\nb: *shared\n"));
  assert.throws(() => parsePackYaml("a: !unknown value\n"));
  assert.throws(() => parsePackYaml(" ".repeat(128 * 1024 + 1)), /128 KiB/);
});

test("read-only Agent ceilings and audit boundary cannot silently disappear", async () => {
  const validator = await createValidator();
  const pack = makePack(presets[0]);
  const agent = pack.artifacts.find((artifact) => artifact.kind === "agent");
  assert(agent);
  agent.template.frontmatter = { capabilityRestrictions: { tools: { allowMutating: true } } };
  assert.throws(() => validator.pack(pack));
  const bypass = makePack(presets[0]);
  const confirmation = bypass.plan.steps.find((step) => step.id === "ConfirmSkill");
  assert(confirmation);
  confirmation.input = { name: "lead-qualification-procedure", confirm: "fabricated" };
  assert.throws(() => validator.pack(bypass), /confirmation/);
  const incomplete = makePack(presets[0]);
  incomplete.plan.steps = incomplete.plan.steps.filter((step) => step.id !== "ConfirmSkill");
  assert.throws(() => validator.pack(incomplete), /Unknown dependency/);
});

test("invalid Resource examples and unrendered Surface props fail", async () => {
  const validator = await createValidator();
  assert.throws(
    () =>
      validator.resource({
        type: "object",
        additionalProperties: false,
        properties: { state: { type: "string", enum: ["open"] } },
        required: ["state"],
        "x-unique": [["state"]],
        examples: [{ state: "invented" }],
      }),
    /Resource example/
  );
  const pack = makePack(presets[0]);
  const surface = pack.artifacts.find((artifact) => artifact.kind === "surface");
  assert(surface);
  surface.template.views = {
    default: { component: { name: "Text", version: "1.0" }, props: { text: "Ignores all data" } },
  };
  assert.throws(() => validator.pack(pack), /Every Surface prop/);
});
