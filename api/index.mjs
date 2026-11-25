import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../server/src/config/env.mjs';
import { createRepository } from '../server/src/repositories/index.mjs';
import { createApp } from '../server/src/app.mjs';
import { seedDatabase } from '../server/db/seed.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let cachedPromise = null;

async function getAppServer() {
  if (!cachedPromise) {
    cachedPromise = (async () => {
      const config = loadConfig();
      const repo = await createRepository(config);
      if (repo.type === 'postgres') {
        for (const file of ['001_init.sql', '002_system_upgrade.sql']) {
          const sql = await fs.readFile(path.resolve(__dirname, `../server/db/migrations/${file}`), 'utf8');
          await repo.pool.query(sql);
        }
      }
      await seedDatabase(repo);
      const { server } = createApp({ repo, config });
      return server;
    })().catch((err) => {
      cachedPromise = null;
      throw err;
    });
  }
  return cachedPromise;
}

export default async function handler(req, res) {
  const server = await getAppServer();
  server.emit('request', req, res);
}
