import * as fs from 'fs';
import * as path from 'path';

/**
 * Auto-generate rollback SQL from migration files
 * This script analyzes the latest migration and creates a corresponding _down.sql file
 */

const MIGRATIONS_DIR = path.join(__dirname, '../src/database/migrations');

interface ParsedStatement {
  type:
    | 'CREATE_TABLE'
    | 'ALTER_TABLE_ADD'
    | 'ALTER_TABLE_DROP'
    | 'DROP_TABLE'
    | 'CREATE_INDEX'
    | 'DROP_INDEX'
    | 'CREATE_TYPE'
    | 'DO_BLOCK'
    | 'UNKNOWN';
  tableName?: string;
  columnName?: string;
  indexName?: string;
  typeName?: string;
  original: string;
}

function parseStatement(statement: string): ParsedStatement {
  const trimmed = statement.trim().toUpperCase();

  // DO blocks (usually for constraints or types)
  if (trimmed.startsWith('DO $')) {
    return {
      type: 'DO_BLOCK',
      original: statement,
    };
  }

  // CREATE TYPE
  if (trimmed.includes('CREATE TYPE')) {
    const match = statement.match(/CREATE TYPE "?public"?\."?(\w+)"?/i);
    return {
      type: 'CREATE_TYPE',
      typeName: match?.[1],
      original: statement,
    };
  }

  // CREATE TABLE
  if (trimmed.startsWith('CREATE TABLE')) {
    const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?"?(\w+)"?/i);
    return {
      type: 'CREATE_TABLE',
      tableName: match?.[1],
      original: statement,
    };
  }

  // ALTER TABLE ADD COLUMN
  if (trimmed.includes('ALTER TABLE') && trimmed.includes('ADD COLUMN')) {
    const tableMatch = statement.match(/ALTER TABLE "?(\w+)"?/i);
    const columnMatch = statement.match(/ADD COLUMN "?(\w+)"?/i);
    return {
      type: 'ALTER_TABLE_ADD',
      tableName: tableMatch?.[1],
      columnName: columnMatch?.[1],
      original: statement,
    };
  }

  // ALTER TABLE DROP COLUMN
  if (trimmed.includes('ALTER TABLE') && trimmed.includes('DROP COLUMN')) {
    const tableMatch = statement.match(/ALTER TABLE "?(\w+)"?/i);
    const columnMatch = statement.match(/DROP COLUMN "?(\w+)"?/i);
    return {
      type: 'ALTER_TABLE_DROP',
      tableName: tableMatch?.[1],
      columnName: columnMatch?.[1],
      original: statement,
    };
  }

  // DROP TABLE
  if (trimmed.startsWith('DROP TABLE')) {
    const match = statement.match(/DROP TABLE (?:IF EXISTS )?"?(\w+)"?/i);
    return {
      type: 'DROP_TABLE',
      tableName: match?.[1],
      original: statement,
    };
  }

  // CREATE INDEX
  if (
    trimmed.startsWith('CREATE INDEX') ||
    trimmed.startsWith('CREATE UNIQUE INDEX')
  ) {
    const match = statement.match(
      /CREATE (?:UNIQUE )?INDEX "?(\w+)"? ON "?(\w+)"?/i,
    );
    return {
      type: 'CREATE_INDEX',
      indexName: match?.[1],
      tableName: match?.[2],
      original: statement,
    };
  }

  // DROP INDEX
  if (trimmed.startsWith('DROP INDEX')) {
    const match = statement.match(/DROP INDEX (?:IF EXISTS )?"?(\w+)"?/i);
    return {
      type: 'DROP_INDEX',
      indexName: match?.[1],
      original: statement,
    };
  }

  return {
    type: 'UNKNOWN',
    original: statement,
  };
}

function generateRollbackStatement(parsed: ParsedStatement): string | null {
  switch (parsed.type) {
    case 'CREATE_TABLE':
      return `DROP TABLE IF EXISTS "${parsed.tableName}" CASCADE;`;

    case 'ALTER_TABLE_ADD':
      return `ALTER TABLE "${parsed.tableName}" DROP COLUMN IF EXISTS "${parsed.columnName}";`;

    case 'ALTER_TABLE_DROP':
      // Cannot auto-generate ADD COLUMN without knowing the column definition
      return `-- TODO: Manually add back column "${parsed.columnName}" to table "${parsed.tableName}"`;

    case 'DROP_TABLE':
      // Cannot auto-generate CREATE TABLE without knowing the schema
      return `-- TODO: Manually recreate table "${parsed.tableName}"`;

    case 'CREATE_INDEX':
      return `DROP INDEX IF EXISTS "${parsed.indexName}";`;

    case 'DROP_INDEX':
      // Cannot auto-generate CREATE INDEX without knowing the definition
      return `-- TODO: Manually recreate index "${parsed.indexName}"`;

    case 'CREATE_TYPE':
      return `DROP TYPE IF EXISTS "public"."${parsed.typeName}" CASCADE;`;

    case 'DO_BLOCK':
      // DO blocks are usually for constraints - skip in rollback
      return null;

    default:
      return `-- UNKNOWN: ${parsed.original.substring(0, 50)}...`;
  }
}

function getLatestMigrationFile(): string | null {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    return null;
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('_down.sql'))
    .sort()
    .reverse();

  return files.length > 0 ? files[0] : null;
}

function generateRollback(migrationFile: string) {
  const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
  const rollbackFile = migrationFile.replace('.sql', '_down.sql');
  const rollbackPath = path.join(MIGRATIONS_DIR, rollbackFile);

  // Check if rollback already exists
  if (fs.existsSync(rollbackPath)) {
    console.log(`✓ Rollback file already exists: ${rollbackFile}`);
    return;
  }

  console.log(`Generating rollback for: ${migrationFile}`);

  // Read migration file
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // Split into statements
  const statements = migrationSql
    .split(/-->.*statement-breakpoint.*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  // Parse and generate rollback statements
  const rollbackStatements: string[] = [];
  const parsedStatements = statements.map(parseStatement);

  // Reverse order for rollback
  for (let i = parsedStatements.length - 1; i >= 0; i--) {
    const rollback = generateRollbackStatement(parsedStatements[i]);
    if (rollback) {
      rollbackStatements.push(rollback);
    }
  }

  // Generate rollback SQL
  const rollbackSql = `-- Rollback migration ${migrationFile}
-- Auto-generated by scripts/generate-rollback.ts
-- Review and modify as needed before running

${rollbackStatements.join('\n')}
`;

  // Write rollback file
  fs.writeFileSync(rollbackPath, rollbackSql);

  console.log(`✓ Generated rollback file: ${rollbackFile}`);
  console.log(
    `\nReview the file and add any missing statements marked with TODO.`,
  );
}

function main() {
  console.log('🔄 Auto-generating rollback SQL...\n');

  const latestMigration = getLatestMigrationFile();

  if (!latestMigration) {
    console.log('No migration files found.');
    return;
  }

  generateRollback(latestMigration);

  console.log('\n✅ Done!');
}

main();
