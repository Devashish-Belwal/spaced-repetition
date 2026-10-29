const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const CSV_PATH = path.join(__dirname, '..', 'data.csv');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('\n❌ ERROR: DATABASE_URL is not set!');
  console.error('Please create a .env file in the project root with:');
  console.error('DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require\n');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

function parseCsv(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let cur = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        cur += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cur += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cur);
        cur = '';
      } else if (char === '\r') {
        // ignore
      } else if (char === '\n') {
        row.push(cur);
        lines.push(row);
        row = [];
        cur = '';
      } else {
        cur += char;
      }
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    lines.push(row);
  }

  if (lines.length === 0) return [];
  const headers = lines[0];
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const r = lines[i];
    if (r.length === 0 || (r.length === 1 && !r[0].trim())) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = r[j] !== undefined ? r[j] : '';
    }
    results.push(obj);
  }

  return results;
}

async function runMigration() {
  console.log('\n=======================================================');
  console.log('🚀 FlashSRS -> Neon Database Migration');
  console.log('=======================================================');

  try {
    console.log('📡 1. Connecting to Neon & creating schema...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        level VARCHAR(50) NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        explanation TEXT,
        reps INTEGER DEFAULT 0,
        interval_mins REAL DEFAULT 0,
        ease_factor REAL DEFAULT 2.5,
        due_date TEXT,
        last_reviewed TEXT,
        last_rating VARCHAR(50),
        state VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);`;

    console.log('✓ Schema verified.');

    const countRes = await sql`SELECT COUNT(*)::int as count FROM cards;`;
    const existingCount = countRes[0].count;
    console.log(`📊 Current cards in Neon: ${existingCount}`);

    if (existingCount > 0) {
      console.log(`⚠️  Neon already has ${existingCount} cards.`);
      const forceArg = process.argv.includes('--force');
      if (!forceArg) {
        console.log('💡 To re-import from data.csv and overwrite, run:');
        console.log('   node scripts/migrate_to_neon.js --force\n');
        process.exit(0);
      } else {
        console.log('🗑️  --force passed: clearing existing cards before re-importing...');
        await sql`TRUNCATE TABLE cards RESTART IDENTITY;`;
      }
    }

    if (!fs.existsSync(CSV_PATH)) {
      console.error(`❌ data.csv not found at: ${CSV_PATH}`);
      process.exit(1);
    }

    console.log(`📖 2. Reading and parsing ${CSV_PATH}...`);
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const cards = parseCsv(csvContent);
    console.log(`✓ Parsed ${cards.length} cards from data.csv.`);

    console.log(`⏳ 3. Inserting ${cards.length} cards into Neon in batches...`);
    const BATCH_SIZE = 100;
    let inserted = 0;

    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const chunk = cards.slice(i, i + BATCH_SIZE);
      
      // Multi-row INSERT using VALUES
      await Promise.all(
        chunk.map(c => {
          const id = parseInt(c.id, 10) || null;
          const category = (c.category || 'General').trim();
          const level = (c.level || 'Intermediate').trim();
          const question = (c.question || '').trim();
          const answer = (c.answer || '').trim();
          const explanation = (c.explanation || '').trim();
          const reps = parseInt(c.reps, 10) || 0;
          const interval_mins = parseFloat(c.interval_mins) || 0;
          const ease_factor = parseFloat(c.ease_factor) || 2.5;
          const due_date = c.due_date || new Date().toISOString();
          const last_reviewed = c.last_reviewed || '';
          const last_rating = c.last_rating || '';
          const state = c.state || 'new';

          return sql`
            INSERT INTO cards (id, category, level, question, answer, explanation, reps, interval_mins, ease_factor, due_date, last_reviewed, last_rating, state)
            VALUES (${id}, ${category}, ${level}, ${question}, ${answer}, ${explanation}, ${reps}, ${interval_mins}, ${ease_factor}, ${due_date}, ${last_reviewed}, ${last_rating}, ${state})
            ON CONFLICT (id) DO UPDATE SET
              reps = EXCLUDED.reps,
              interval_mins = EXCLUDED.interval_mins,
              ease_factor = EXCLUDED.ease_factor,
              due_date = EXCLUDED.due_date,
              last_reviewed = EXCLUDED.last_reviewed,
              last_rating = EXCLUDED.last_rating,
              state = EXCLUDED.state;
          `;
        })
      );

      inserted += chunk.length;
      process.stdout.write(`   Processed: ${inserted}/${cards.length} cards...\r`);
    }

    // Reset sequence to highest ID
    await sql`SELECT setval('cards_id_seq', COALESCE((SELECT MAX(id) FROM cards), 1));`;

    console.log(`\n🎉 Success! All ${inserted} cards are now in Neon!`);
    console.log('=======================================================\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
