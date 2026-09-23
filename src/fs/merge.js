import { readdir, writeFile, readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';

const merge = async () => {
  const rootPath = process.cwd();

  const PARTS_DIR = join(rootPath, 'parts');
  const OUTPUT_FILE = join(rootPath, 'merged.txt');

  const args = process.argv.slice(2);
  const filesFlagIndex = args.indexOf('--files');

  let filesToMerge = [];

  try {
    if (filesFlagIndex !== -1) {
      const filesArg = args[filesFlagIndex + 1];
      if (!filesArg) {
        throw new Error('no --files value');
      }

      filesToMerge = filesArg.split(',').map((f) => f.trim());

      for (const file of filesToMerge) {
        const fileStat = await stat(join(PARTS_DIR, file));
        if (!fileStat.isFile()) {
          throw new Error(`not a file: ${file}`);
        }
      }
    } else {
      const entries = await readdir(PARTS_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && extname(entry.name).toLowerCase() === '.txt') {
          filesToMerge.push(entry.name);
        }
      }

      filesToMerge.sort();

      if (filesToMerge.length === 0) {
        throw new Error('no .txt files');
      }
    }

    const contents = [];
    for (const file of filesToMerge) {
      contents.push(await readFile(join(PARTS_DIR, file), 'utf8'));
    }

    await mkdir(dirname(OUTPUT_FILE), { recursive: true });
    await writeFile(OUTPUT_FILE, contents.join(''), 'utf8');
  } catch (err) {
    throw new Error('FS operation failed');
  }
};

await merge();