import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const viewerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(viewerRoot, '..');

const sourceDir = path.resolve(repoRoot, 'examples');
const destDir = path.resolve(viewerRoot, 'public', 'examples');

const sourceEntries = await fs.readdir(sourceDir);
const sourceFiles = sourceEntries.filter((name) => name.endsWith('.pbc.md'));

await fs.rm(destDir, { recursive: true, force: true });
await fs.mkdir(destDir, { recursive: true });

for (const name of sourceFiles) {
  await fs.copyFile(path.join(sourceDir, name), path.join(destDir, name));
}

console.log(`Synced ${sourceFiles.length} example(s) to viewer/public/examples/`);

