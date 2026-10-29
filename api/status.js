const { getDb } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const sql = getDb();
  if (!sql) {
    return res.status(200).json({
      status: 'fallback_csv',
      message: 'DATABASE_URL not configured. Running in static CSV mode.'
    });
  }

  try {
    const result = await sql`SELECT COUNT(*)::int as count FROM cards;`;
    const count = result[0]?.count || 0;
    return res.status(200).json({
      status: 'ok',
      db: 'neon',
      total_cards: count,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({
      status: 'error',
      error: err.message
    });
  }
};
