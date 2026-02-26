#!/usr/bin/env node

/**
 * Migration helper script to update API routes from SQLite to PlanetScale
 * This script provides examples of the migration pattern
 */

const fs = require('fs');
const path = require('path');

const migrationPatterns = {
  'db.prepare().run()': {
    old: /db\.prepare\(['"`](.+?)["`]\)\.run\((.+?)\)/gs,
    description: 'Convert db.prepare().run() to executeInsert() or executeUpdate()',
    example: {
      before: `db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(userId, email)`,
      after: `await executeInsert('INSERT INTO users (id, email) VALUES (?, ?)', [userId, email])`,
    },
  },
  'db.prepare().get()': {
    old: /db\.prepare\(['"`](.+?)["`]\)\.get\((.+?)\)/gs,
    description: 'Convert db.prepare().get() to executeQuery() with array handling',
    example: {
      before: `const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)`,
      after: `const users = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]); const user = users[0]`,
    },
  },
  'db.prepare().all()': {
    old: /db\.prepare\(['"`](.+?)["`]\)\.all\((.+?)\)/gs,
    description: 'Convert db.prepare().all() to executeQuery()',
    example: {
      before: `const expenses = db.prepare('SELECT * FROM expenses WHERE user_id = ?').all(userId)`,
      after: `const expenses = await executeQuery('SELECT * FROM expenses WHERE user_id = ?', [userId])`,
    },
  },
};

console.log('📝 SQLite → PlanetScale API Route Migration Guide\n');

console.log('Key Changes Required:\n');
Object.entries(migrationPatterns).forEach(([key, value]) => {
  console.log(`${key}`);
  console.log(`  Description: ${value.description}`);
  console.log(`  Before: ${value.example.before}`);
  console.log(`  After:  ${value.example.after}\n`);
});

console.log('\nGeneral Migration Steps:\n');
console.log('1. Replace imports:');
console.log('   OLD: import { getDb, initializeDbAsync } from "@/lib/db"');
console.log('   NEW: import { initializeDbAsync, executeQuery, executeInsert, executeUpdate, executeDelete } from "@/lib/db"\n');

console.log('2. Remove sync database operations and use async versions');
console.log('   OLD: const db = getDb(); const result = db.prepare(...).get(...);');
console.log('   NEW: const results = await executeQuery(...); const result = results[0];\n');

console.log('3. Update timestamp handling');
console.log('   OLD: const now = Date.now(); // integer milliseconds');
console.log('   NEW: const now = new Date(); // Date object for MySQL\n');

console.log('4. Wrap parameters in arrays');
console.log('   OLD: db.prepare(sql).run(param1, param2)');
console.log('   NEW: await executeInsert(sql, [param1, param2])\n');

console.log('5. Handle returned data from queries');
console.log('   OLD: .get() returns single object or undefined');
console.log('   NEW: executeQuery returns array, use [0] to get first result\n');

console.log('\n✅ Next Steps:');
console.log('1. Update each API route following the patterns above');
console.log('2. Test locally with DATABASE_URL set to your PlanetScale connection string');
console.log('3. Deploy to Vercel and add DATABASE_URL environment variable');
