import fs from 'node:fs';
import path from 'node:path';

export async function safeWriteFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return await fs.promises.writeFile(filePath, content);
}
