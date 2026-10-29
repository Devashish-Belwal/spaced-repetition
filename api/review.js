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
    const data = req.body || {};
    const cardId = parseInt(data.id, 10);

    if (isNaN(cardId)) {
      return res.status(400).json({ error: 'Valid card ID is required' });
    }

    const reps = data.reps !== undefined ? parseInt(data.reps, 10) : 0;
    const interval_mins = data.interval_mins !== undefined ? parseFloat(data.interval_mins) : 0;
    const ease_factor = data.ease_factor !== undefined ? parseFloat(data.ease_factor) : 2.5;
    const due_date = data.due_date || new Date().toISOString();
    const last_reviewed = data.last_reviewed || new Date().toISOString();
    const last_rating = data.last_rating || '';
    const state = data.state || 'review';

    const result = await sql`
      UPDATE cards
      SET reps = ${reps},
          interval_mins = ${interval_mins},
          ease_factor = ${ease_factor},
          due_date = ${due_date},
          last_reviewed = ${last_reviewed},
          last_rating = ${last_rating},
          state = ${state}
      WHERE id = ${cardId}
      RETURNING id;
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    return res.status(200).json({ success: true, updated_id: cardId });
  } catch (err) {
    console.error('Failed updating review in Neon:', err);
    return res.status(500).json({ error: err.message });
  }
};
