import fs from 'node:fs';
import path from 'node:path';

const getDbFilePath = () => {
  const url = process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
  const filePath = url.startsWith('file:') ? url.replace(/^file:/, '') : url;
  const normalized = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  return normalized;
};

const main = async () => {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }
  process.stdout.write(`Ensured DB exists at: ${filePath}\n`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

