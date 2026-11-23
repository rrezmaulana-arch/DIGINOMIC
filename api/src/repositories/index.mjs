import { createMemoryRepo } from './memoryRepo.mjs';
import { createPostgresRepo } from './postgresRepo.mjs';

export async function createRepository(config) {
  if (config.databaseUrl) {
    return createPostgresRepo(config.databaseUrl);
  }
  return createMemoryRepo();
}
