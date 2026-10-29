const { getDb } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sql = getDb();
  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured' });
  }

  try {
    const nowIso = new Date().toISOString();
    await sql`
      UPDATE cards
      SET reps = 0,
          interval_mins = 0,
          ease_factor = 2.5,
          due_date = ${nowIso},
          last_reviewed = '',
          last_rating = '',
          state = 'new';
    `;

    return res.status(200).json({ success: true, message: 'All card progress reset in Neon' });
  } catch (err) {
    console.error('Failed resetting progress in Neon:', err);
    return res.status(500).json({ error: err.message });
  }
};
