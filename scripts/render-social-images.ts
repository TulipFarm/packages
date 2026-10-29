import { mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { packageContent } from '../src/lib/package-content.ts';
import { site } from '../src/lib/site.ts';

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mark = (await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8'))
  .replace(/<svg[^>]*>/, '')
  .replace('</svg>', '');
const images = [
  { slug: 'packages', title: 'Systems you can build on.', description: site.description },
  ...Object.entries(packageContent).map(([slug, content]) => ({ slug, ...content })),
];
const directory = new URL('../public/social/', import.meta.url);
await mkdir(directory, { recursive: true });

for (const image of images) {
  const lines: string[] = [];
  for (const word of image.description.split(' ')) {
    const last = lines.at(-1);
    if (last && last.length + word.length < 65) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#f3f7f2"/>
    <g transform="translate(66 54) scale(.5)" fill="#188038">${mark}</g>
    <g fill="#203528" font-family="Arial, sans-serif">
      <text x="146" y="98" font-size="30" font-weight="700">${site.name}</text>
      <text x="72" y="264" font-size="54" font-weight="700">${escape(image.title)}</text>
      ${lines.map((line, index) => `<text x="72" y="${336 + index * 40}" font-size="28">${escape(line)}</text>`).join('')}
      <text x="72" y="554" font-size="24">packages.tulipfarm.ai</text>
    </g>
    <path d="M72 472h1056" stroke="#bfd3c3"/>
    <g transform="translate(1020 514) scale(.4)" fill="#188038">${mark}</g>
  </svg>`;
  const result = spawnSync('magick', ['svg:-', new URL(`${image.slug}.png`, directory).pathname], {
    input: svg,
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr);
  console.log(`Rendered ${image.slug}.png`);
}
