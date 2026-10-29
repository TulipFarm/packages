# TulipFarm packages

This public MIT repository contains exact system packages and their Astro catalog.
Never include private workspace data, credentials or internal links.

Use Node 26 and pnpm. Run `pnpm validate:packages`, `pnpm check`, `pnpm lint`
and `pnpm build` before proposing changes. Use Oxfmt and Oxlint, not Prettier or
ESLint. Keep package JSON version bytes unchanged after publication; add a new
version instead. The published system-package schema is authoritative.

Use Sprout components and TulipFarm tokens. Previews never install packages or
claim that a package has run. Keep essential content and downloads usable without
JavaScript. Treat package text as data, never code to execute.

Work in branches and open PRs. Show UI behavior to the maintainer before adding
or changing behavior tests. Do not configure hosting or enable live installation
without approval.
