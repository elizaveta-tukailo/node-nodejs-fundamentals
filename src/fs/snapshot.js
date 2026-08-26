import { readdir, writeFile, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const snapshot = async () => {
  const rootPath = process.cwd();
  const ignoredDirs = new Set(['node_modules', '.git', 'dist']);
  const entries = [];

  const scanDirectory = async (currentDir) => {
    let dirents;
    try {
      dirents = await readdir(currentDir, { withFileTypes: true });
    } catch (error) {
      console.warn(`Cannot read directory: ${currentDir}`, error.message);
      return;
    }

    for (const dirent of dirents) {
      const fullPath = join(currentDir, dirent.name);

      if (dirent.isDirectory()) {
        if (ignoredDirs.has(dirent.name)) continue;

        const relativeDirPath = relative(rootPath, fullPath).split(sep).join('/');
        entries.push({
          path: relativeDirPath,
          type: 'directory',
        });

        await scanDirectory(fullPath);
      } 
      else if (dirent.isFile() || dirent.isSymbolicLink()) {
        const fileBuffer = await readFile(fullPath);
        const fileContentBase64 = fileBuffer.toString('base64');

        const relativeFilePath = relative(rootPath, fullPath).split(sep).join('/');

        entries.push({
          path: relativeFilePath,
          type: 'file',
          size: fileBuffer.length,
          content: fileContentBase64,
        });
      }
    }
  };

  await scanDirectory(rootPath);
  
  const snapshotData = {
    rootPath,
    entries,
  };

  await writeFile('snapshot.json', JSON.stringify(snapshotData, null, 2));
  console.log(`Snapshot created: ${entries.length} files found.`);
};

await snapshot();