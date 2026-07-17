import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const base = 'https://seaedu.ac.in/backend/themes/pixel/images';

const assets = [
  [`${base}/campus-img.jpg`, 'assets/img/hero/campus-main.jpg'],
  [`${base}/campus-information-img.jpg`, 'assets/img/hero/campus-life.jpg'],
  [`${base}/campus-infrastructurr.jpeg`, 'assets/img/hero/campus-infrastructure.jpg'],
  [`${base}/about-2-1.png`, 'assets/img/about/trust-story.png'],
  ...['seacet', 'degree', 'seacon', 'sealaw', 'seapu', 'icse', 'seasb', 'seaiti', 'seabed']
    .flatMap((group) => [1, 2, 3, 4].map((number) => [
      `${base}/gallery/${group}${number}.jpg`,
      `assets/img/gallery/${group}-${number}.jpg`,
    ])),
];

for (const [url, relativePath] of assets) {
  const output = resolve(root, relativePath);
  await mkdir(dirname(output), { recursive: true });
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  await writeFile(output, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${relativePath}`);
}
