import fs from 'fs';
import path from 'path';
import { pool } from './index';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration file(s)`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`Running migration: ${file}`);
    try {
      await pool.query(sql);
      console.log(`  ✓ ${file} applied successfully`);
    } catch (err) {
      console.error(`  ✗ Error applying ${file}:`, err);
      process.exit(1);
    }
  }

  console.log('All migrations completed successfully!');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
