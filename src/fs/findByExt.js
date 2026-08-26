import { readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const findByExt = async () => {

  const args = process.argv.slice(2);
  

  const extIndex = args.indexOf('--ext');
  let ext = '.txt'; 
  
  if (extIndex !== -1) {

    if (args[extIndex + 1]) {
      ext = args[extIndex + 1].startsWith('.') ? args[extIndex + 1] : `.${args[extIndex + 1]}`;
    }
  }

  const rootPath = process.cwd();

  try {
    await readdir(rootPath);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const foundFiles = [];

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
        await scanDirectory(fullPath);
      } 
      else if (dirent.isFile()) {
        if (dirent.name.endsWith(ext)) {
          const relativePath = relative(rootPath, fullPath).split(sep).join('/');
          foundFiles.push(relativePath);
        }
      }
    }
  };

  await scanDirectory(rootPath);

  foundFiles.sort((a, b) => a.localeCompare(b));
  
  if (foundFiles.length > 0) {
    console.log(foundFiles.join('\n'));
  }
};

await findByExt();