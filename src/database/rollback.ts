import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function rollbackMigration(migrationName: string) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  console.log('Connecting to database...');

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    const rollbackFile = path.join(
      __dirname,
      'migrations',
      `${migrationName}_down.sql`,
    );

    if (!fs.existsSync(rollbackFile)) {
      throw new Error(`Rollback file not found: ${rollbackFile}`);
    }

    console.log(`Rolling back migration: ${migrationName}`);

    const sql = fs.readFileSync(rollbackFile, 'utf8');

    // Split by statement-breakpoint or semicolon
    const statements = sql
      .split(/-->.*statement-breakpoint.*\n|;/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    }

    console.log('Rollback completed successfully!');
  } catch (error) {
    console.error('Rollback failed!', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get migration name from command line argument
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Usage: tsx src/database/rollback.ts <migration-name>');
  console.error('Example: tsx src/database/rollback.ts 0001_tidy_pyro');
  process.exit(1);
}

rollbackMigration(migrationName)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
