import { closeSync, fstatSync, lstatSync, openSync, unlinkSync } from 'node:fs';

/** Cooperating writers and migration tools must acquire the same exclusive lock. */
export function acquireMarketFileLock(file: string): () => void {
  const path = `${file}.write-lock`;
  const fd = openSync(path, 'wx', 0o600);
  const original = fstatSync(fd);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    try {
      const current = lstatSync(path);
      if (current.dev !== original.dev || current.ino !== original.ino) throw new Error('Market lock changed');
      unlinkSync(path);
    } finally { closeSync(fd); }
  };
}
