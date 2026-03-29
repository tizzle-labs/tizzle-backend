import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigrations() {
  console.log('Connecting to database...');

  // Parse DATABASE_URL or use individual params
  const databaseUrl = process.env.DATABASE_URL;

  let pool: Pool;

  if (databaseUrl) {
    // Try to parse URL
    try {
      const url = new URL(databaseUrl);
      pool = new Pool({
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading /
        ssl: false,
      });
    } catch (error) {
      console.error('Error parsing DATABASE_URL:', error);
      throw error;
    }
  } else {
    throw new Error('DATABASE_URL is not defined');
  }

  const db = drizzle(pool);

  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: './src/database/migrations' });

  console.log('Migrations completed!');

  await pool.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
