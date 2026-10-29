const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

module.exports = { getDb };
