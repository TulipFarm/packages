# TulipFarm Packs

Original, declarative Pack templates and a static catalog. Nothing here installs itself.

## Read on / Skip

- Read on for Pack presets, catalog entries, validation, or static hosting.
- Skip for TulipFarm runtime changes; those belong to the main application repository.

## Map

| Path | Owns |
| --- | --- |
| `src/presets.ts` | Fifteen original domain presets, fields, procedures, examples. |
| `src/pack.ts` | Shared conservative artifact and installation Plan composition. |
| `public/` | Generated public YAML and `index.json`; static hosting input. |
| `schemas/` | Pinned canonical Pack and authoring Tool schemas plus provenance. |
| `scripts/` | Generation, offline validation, canonical compatibility, tests, static build. |
| `.github/workflows/validate.yml` | Offline contract, test, type, and build checks; no deployment. |
| `README.md` | Installation, adaptation, authoring, provenance, and hosting. |

## Rules

- Use pnpm and TypeScript. Never add credentials or runtime Soul files.
- Edit presets/composition, then run `pnpm generate`; commit public output with its source.
- Preserve SkillAudit then human confirmation; never manufacture a confirmation token.
- Preset Agents are read-only. Broader authority requires an explicit operator decision.
- Do not reference an unpublished custom Agent or assume a provider is connected.
- Record instances are Records; schemas are Resource types. Chat is the public interface.
- Only copy canonical schemas with `pnpm sync-schemas --app <checkout>`; preserve provenance.
- Validate with `pnpm validate && pnpm test && pnpm typecheck && pnpm build`.
- No commit, push, domain provisioning, or deployment without explicit authorization.

See [README](README.md) for the hosting contract and authoring process.
