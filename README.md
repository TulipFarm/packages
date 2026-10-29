# TulipFarm Packages

Open-source starting points for business systems. Browse their tables, skills,
agents and workflows, preview example records, and see what each package
includes for a TulipFarm workspace.

The catalog includes marketing content, sales CRM, support desk, leave
management, project tracking and product backlog packages. These are starter
systems, not full replacements for Jira, Linear or Zendesk.

Catalog covers use purpose-specific illustrations, not execution diagrams.
The field previews come from the package definitions; full example records and
grouped resource lists remain on each package's detail page. The main action is
**Install to workspace**, currently disabled until install links are supplied.
JSON remains available as technical source, not the primary user journey.

## Search and sharing

The canonical origin is `https://packages.tulipfarm.ai`, configured in
`src/lib/site.ts`. Each package has its own search description, social image,
usage guide, limits, questions and related links in `src/lib/package-content.ts`.
The HTML includes canonical, Open Graph, Twitter card and JSON-LD metadata.
JSON-LD describes the catalog and package source, not an installed application
or a paid offer.

Local and default builds are `noindex`, with a disallowing `robots.txt` and an
empty sitemap. For a production deployment to the canonical domain, build with
`SITE_INDEXING=true pnpm build`. If `CF_PAGES_BRANCH` is present, it must be
`main`. Never use the indexing-enabled output on a preview host.
The production sitemap contains the homepage and all package detail pages,
not JSON endpoints or the 404 page. Deployment must serve the 404 page with
HTTP 404 and preserve the canonical trailing-slash routes.

Social PNGs are committed assets, so normal builds need no image tool.
After changing their copy, regenerate them with
`node scripts/render-social-images.ts` (requires ImageMagick's `magick` command).
The images are 1200 by 630 pixels. Search indexing and social previews still
need live verification after deployment; local metadata does not prove either.

## Run locally

Use Node 26 and pnpm 11.5.3:

```sh
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 14321
```

Open <http://localhost:14321>. This repository builds a static Astro website;
it has no database, sign-in or installation backend.

```sh
pnpm validate:packages
pnpm check
pnpm lint
pnpm build
pnpm test
pnpm preview --host 127.0.0.1 --port 14321
```

## Deployment

Cloudflare Pages project `tulipfarm-packages` is connected to this repository.
Pull requests receive noindex previews; merges to `main` build and publish to
<https://packages.tulipfarm.ai>. The older Pages project named `packages` is
unrelated and must not be used.

The Pages build uses Node 26.5.0, `PNPM_VERSION=11.5.3` and
`SKIP_DEPENDENCY_INSTALL=1`, with this command and `dist` output directory:

```sh
npm install --global pnpm@11.5.3 && pnpm install --frozen-lockfile && pnpm lint && pnpm check && pnpm build && pnpm test
```

Set `SITE_INDEXING=true` only in the production environment and `false` in
previews. GitHub CI also checks default, production and preview indexing.
Do not bypass its required check when merging. Pages runs its own quality
gates before publishing; a failed build leaves the last deployment serving.
To roll back, select a previous successful production deployment in the Pages
dashboard and choose **Rollback to this deployment**, then revert the source
change through a PR.

The production `pages.dev` alias redirects to the canonical domain. Preview
hosts also receive `X-Robots-Tag: noindex`. No paid service or runtime Worker is
required.

## Package contract

Every package uses the public
[system-package v1 schema](https://tulipfarm.ai/schemas/system-package.v1.json).
Package files live at `packages/<name>/<version>/package.json`. Catalog metadata
is separate from the strict package format.

The site publishes `/catalog.json` and one exact JSON download per version at
`/packages/<name>/<version>/package.json`. Download URLs in the index are
relative to the website origin. The public feed is
<https://packages.tulipfarm.ai/catalog.json>; resolve its `url` and `page` values
against that origin. The feed and versioned JSON allow anonymous cross-origin
browser requests. Package inputs are resolved in a TulipFarm
workspace by its installer, not on this website.

The contents list groups definitions by resource type, not execution order.
The installer must check permissions, collect declared inputs, obtain approvals
and verify the result. A schema-valid package is not proof of a successful
installation. Browsing or downloading never creates resources or connects to an
external provider.

## Contributing

Add a new version directory rather than changing published version bytes. Use
synthetic records, scoped permissions and explicit requirements. Never include
credentials, private workspace IDs or real customer data. Author package content
under MIT, or preserve compatible licensing and attribution.

Update the discovery metadata, run the commands above, and open a pull request.
Package assets are data: the website never executes bundled scripts. Schema and
catalog validation run before every static build.

## License

[MIT](LICENSE), covering this website and the package definitions.
