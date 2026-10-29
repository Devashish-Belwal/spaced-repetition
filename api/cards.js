const { getDb } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getDb();
  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured' });
  }

  if (req.method === 'GET') {
    try {
      const cards = await sql`SELECT * FROM cards ORDER BY id ASC;`;
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json(cards);
    } catch (err) {
      console.error('Failed reading cards from Neon:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { category, level, question, answer, explanation } = body;

      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      const catClean = (category || 'General').trim() || 'General';
      const levelClean = (level || 'Intermediate').trim();
      const nowIso = new Date().toISOString();

      const inserted = await sql`
        INSERT INTO cards (category, level, question, answer, explanation, reps, interval_mins, ease_factor, due_date, last_reviewed, last_rating, state)
        VALUES (${catClean}, ${levelClean}, ${question.trim()}, ${answer.trim()}, ${(explanation || '').trim()}, 0, 0, 2.5, ${nowIso}, '', '', 'new')
        RETURNING *;
      `;

      return res.status(201).json({ success: true, card: inserted[0] });
    } catch (err) {
      console.error('Failed creating card in Neon:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query?.id || (req.body && req.body.id);
      const cardId = parseInt(id, 10);
      if (isNaN(cardId)) {
        return res.status(400).json({ error: 'Valid card ID is required' });
      }

      await sql`DELETE FROM cards WHERE id = ${cardId};`;
      return res.status(200).json({ success: true, deleted_id: cardId });
    } catch (err) {
      console.error('Failed deleting card in Neon:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
