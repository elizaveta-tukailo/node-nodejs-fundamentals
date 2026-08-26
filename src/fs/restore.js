import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
import { join, dirname, sep } from 'node:path';

const restore = async () => {
  const restoredDirName = 'workspace_restored';
  
  try {
    await readFile('snapshot.json');
  } catch (error) {
    throw new Error('FS operation failed');
  }

  try {
    await readdir(restoredDirName);
    throw new Error('FS operation failed');
  } catch (error) {
    if (error.message !== 'FS operation failed') {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    } else {
      throw error; 
    }
  }

  await mkdir(restoredDirName);

  const snapshotData = JSON.parse(await readFile('snapshot.json', 'utf-8'));

  for (const entry of snapshotData.entries) {
    const restoredPath = join(restoredDirName, entry.path);

    if (entry.type === 'directory') {
      await mkdir(restoredPath, { recursive: true });
    } else if (entry.type === 'file') {
      await mkdir(dirname(restoredPath), { recursive: true });
      
      const fileContentBuffer = Buffer.from(entry.content, 'base64');
      
      await writeFile(restoredPath, fileContentBuffer);
    }
  }

  console.log(`Restore completed: ${snapshotData.entries.length} entries restored.`);
};

await restore();