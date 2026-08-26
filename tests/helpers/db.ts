import fs from 'fs';

export async function loadFreshDb(databaseUrl: string) {
  process.env.DATABASE_URL = databaseUrl;
  if (fs.existsSync(databaseUrl)) fs.unlinkSync(databaseUrl);
  const { sequelize } = await import('../../src/config/database.js');
  const { seed } = await import('../../src/config/seed.js');
  await sequelize.sync({ force: true });
  await seed();
  return { sequelize };
}
