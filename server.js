const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, 'data');
const CSV_PATH = path.join(BASE_DIR, 'data.csv');
const SETTINGS_PATH = path.join(BASE_DIR, 'settings.json');
const KEYS_PATH = path.join(BASE_DIR, 'openrouter_keys.txt');

const DEFAULT_SETTINGS = {
  difficult: { value: 10, unit: 'minutes' },
  hard: { value: 1, unit: 'days' },
  good: { value: 3, unit: 'days' },
  easy: { value: 7, unit: 'days' }
};

function loadApiKeys() {
  const keys = [];
  if (fs.existsSync(KEYS_PATH)) {
    try {
      const lines = fs.readFileSync(KEYS_PATH, 'utf-8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          keys.push(trimmed);
        }
      }
    } catch (err) {
      console.warn('[Warning] Failed reading openrouter_keys.txt:', err);
    }
  }

  if (keys.length === 0 && fs.existsSync(SETTINGS_PATH)) {
    try {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
      if (Array.isArray(settings.openrouter_keys)) {
        for (const k of settings.openrouter_keys) {
          if (typeof k === 'string' && k.trim()) keys.push(k.trim());
        }
      } else if (settings.openrouter_api_key) {
        keys.push(settings.openrouter_api_key.trim());
      }
    } catch (e) {}
  }

  return Array.from(new Set(keys));
}

function saveApiKeys(keys) {
  const cleanKeys = Array.from(new Set((keys || []).map(k => (typeof k === 'string' ? k.trim() : '')).filter(Boolean)));
  try {
    fs.writeFileSync(KEYS_PATH, cleanKeys.join('\n') + (cleanKeys.length > 0 ? '\n' : ''), 'utf-8');
    console.log(`[Keys] Successfully saved ${cleanKeys.length} API keys to ${KEYS_PATH}`);
  } catch (err) {
    console.warn('[Warning] Failed writing openrouter_keys.txt:', err);
  }

  try {
    ensureSettings();
    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    settings.openrouter_keys = cleanKeys;
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Warning] Failed syncing keys to settings.json:', err);
  }

  return cleanKeys;
}

function ensureSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  }
}

function loadSettings() {
  ensureSettings();
  try {
    const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    const fileKeys = loadApiKeys();
    if (fileKeys && fileKeys.length > 0) {
      data.openrouter_keys = fileKeys;
    }
    return data;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings) {
  if (Array.isArray(settings.openrouter_keys)) {
    saveApiKeys(settings.openrouter_keys);
  }
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

// RFC 4180 CSV Writer & Reader
function toCsvField(val) {
  if (val === null || val === undefined) val = '';
  val = String(val);
  return `"${val.replace(/"/g, '""')}"`;
}

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
  for (let r = 1; r < lines.length; r++) {
    const rRow = lines[r];
    if (rRow.length === 1 && !rRow[0].trim()) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = rRow[c] !== undefined ? rRow[c] : '';
    }
    results.push(obj);
  }
  return results;
}

function writeCsv(cards) {
  const fieldnames = ['id', 'category', 'level', 'question', 'answer', 'explanation', 'reps', 'interval_mins', 'ease_factor', 'due_date', 'last_reviewed', 'last_rating', 'state'];
  let output = fieldnames.map(toCsvField).join(',') + '\n';
  for (const c of cards) {
    const row = fieldnames.map(f => toCsvField(c[f] !== undefined ? c[f] : ''));
    output += row.join(',') + '\n';
  }
  const tmp = CSV_PATH + '.tmp';
  fs.writeFileSync(tmp, output, 'utf-8');
  fs.renameSync(tmp, CSV_PATH);
}

function parseMarkdownQuestions(content) {
  const cards = [];
  const blocks = ('\n' + content).split(/\n(?=(?:#{1,4}\s+|\d+\.\s+))/);

  for (let b of blocks) {
    b = b.trim();
    if (!b || !/^(?:#{1,4}\s+|\d+\.\s+)/.test(b)) continue;

    const hasDeep = /\*\*Deep [Ee]xplanation:\*\*/.test(b);
    const hasAns = /\*\*Interview [Aa]nswer:\*\*/.test(b);

    if (hasDeep && hasAns) {
      const mDeep = b.match(/\*\*Deep [Ee]xplanation:\*\*\s*([\s\S]*?)(?=\*\*Interview [Aa]nswer:\*\*|$)/);
      const mAns = b.match(/\*\*Interview [Aa]nswer:\*\*\s*([\s\S]*?)(?=\*\*Deep [Ee]xplanation:\*\*|$)/);
      const qMatch = b.match(/^(?:#{1,4}\s+|\d+\.\s+)([\s\S]*?)(?=\*\*Deep [Ee]xplanation:\*\*|\*\*Interview [Aa]nswer:\*)/);

      if (qMatch && mDeep && mAns) {
        cards.push({
          question: qMatch[1].trim(),
          answer: mAns[1].trim(),
          explanation: mDeep[1].trim()
        });
        continue;
      }
    } else if (hasDeep || hasAns) {
      const splitRegex = /\*\*Deep [Ee]xplanation:\*\*|\*\*Interview [Aa]nswer:\*\*/;
      const parts = b.split(splitRegex);
      const qPart = parts[0].replace(/^(?:#{1,4}\s+|\d+\.\s+)/, '').trim();
      const ansPart = parts[1] ? parts[1].trim() : '';
      cards.push({
        question: qPart,
        answer: ansPart,
        explanation: ansPart
      });
      continue;
    } else {
      const lines = b.split('\n');
      const qText = lines[0].replace(/^(?:#{1,4}\s+|\d+\.\s+)/, '').trim();
      const ansText = lines.slice(1).join('\n').trim() || qText;
      if (qText && ansText) {
        cards.push({
          question: qText,
          answer: ansText,
          explanation: ansText
        });
      }
    }
  }
  return cards;
}

function syncDataWithMarkdown() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`[Error] Data directory not found: ${DATA_DIR}`);
    return { added_count: 0, total_cards: 0 };
  }

  const existingCards = fs.existsSync(CSV_PATH) && fs.statSync(CSV_PATH).size > 0
    ? parseCsv(fs.readFileSync(CSV_PATH, 'utf-8'))
    : [];

  const existingKeys = new Set();
  let maxId = 0;

  for (const c of existingCards) {
    const catKey = (c.category || '').trim().toLowerCase();
    const qKey = (c.question || '').trim().toLowerCase();
    existingKeys.add(`${catKey}:::${qKey}`);
    const cid = parseInt(c.id, 10);
    if (!isNaN(cid) && cid > maxId) maxId = cid;
  }

  const newlyAdded = [];
  const nowIso = new Date().toISOString();

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        scanDir(fullPath);
      } else if (ent.isFile() && ent.name.endsWith('.md')) {
        const rel = path.relative(DATA_DIR, fullPath);
        const parts = rel.split(path.sep);
        const category = parts.length > 1 ? parts[0] : 'General';
        const level = path.basename(ent.name, '.md');
        const content = fs.readFileSync(fullPath, 'utf-8');

        const qnaList = parseMarkdownQuestions(content);
        for (const item of qnaList) {
          const catKey = category.trim().toLowerCase();
          const qKey = item.question.trim().toLowerCase();
          const key = `${catKey}:::${qKey}`;

          if (!existingKeys.has(key)) {
            maxId++;
            const newCard = {
              id: String(maxId),
              category,
              level,
              question: item.question,
              answer: item.answer,
              explanation: item.explanation,
              reps: '0',
              interval_mins: '0',
              ease_factor: '2.5',
              due_date: nowIso,
              last_reviewed: '',
              last_rating: '',
              state: 'new'
            };
            existingCards.push(newCard);
            newlyAdded.push(newCard);
            existingKeys.add(key);
          }
        }
      }
    }
  }

  scanDir(DATA_DIR);

  if (newlyAdded.length > 0 || !fs.existsSync(CSV_PATH) || fs.statSync(CSV_PATH).size === 0) {
    writeCsv(existingCards);
    console.log(`[Sync] Added ${newlyAdded.length} new questions into data.csv! Total cards: ${existingCards.length}`);
  } else {
    console.log(`[Sync] Data up-to-date. Total cards: ${existingCards.length}`);
  }

  return { added_count: newlyAdded.length, total_cards: existingCards.length };
}

function ensureDataCsv() {
  syncDataWithMarkdown();
}

function readAllCards() {
  ensureDataCsv();
  if (!fs.existsSync(CSV_PATH)) return [];
  const text = fs.readFileSync(CSV_PATH, 'utf-8');
  return parseCsv(text);
}

function addNewCard(cardData) {
  ensureDataCsv();
  const cards = readAllCards();
  let maxId = 0;
  for (const c of cards) {
    const cid = parseInt(c.id, 10);
    if (!isNaN(cid) && cid > maxId) {
      maxId = cid;
    }
  }

  const newId = String(maxId + 1);
  const category = (cardData.category || 'General').trim() || 'General';
  const levelRaw = (cardData.level || 'Intermediate').trim();
  const level = levelRaw.charAt(0).toUpperCase() + levelRaw.slice(1).toLowerCase();
  const question = (cardData.question || '').trim();
  const answer = (cardData.answer || '').trim();
  const explanation = (cardData.explanation || '').trim();
  const nowIso = new Date().toISOString();

  const newCard = {
    id: newId,
    category,
    level,
    question,
    answer,
    explanation,
    reps: 0,
    interval_mins: 0,
    ease_factor: 2.5,
    due_date: nowIso,
    last_reviewed: '',
    last_rating: '',
    state: 'new'
  };

  cards.push(newCard);
  writeCsv(cards);

  // Also append to markdown file in data/<category>/<level>.md if DATA_DIR exists
  try {
    const catDir = path.join(DATA_DIR, category);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }
    const mdFile = path.join(catDir, `${level}.md`);
    let qNum = 1;
    if (fs.existsSync(mdFile)) {
      const existingText = fs.readFileSync(mdFile, 'utf-8');
      const matches = existingText.match(/^(?:#{1,4}\s+|\d+\.\s+)/gm);
      if (matches) qNum = matches.length + 1;
    }
    const mdEntry = `\n\n${qNum}. ${question}\n\n**Deep explanation:** ${explanation}\n\n**Interview answer:** ${answer}\n`;
    fs.appendFileSync(mdFile, mdEntry, 'utf-8');
  } catch (err) {
    console.warn('[Warning] Could not append to markdown file:', err);
  }

  return newCard;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  function sendJson(statusCode, data) {
    const payload = Buffer.from(JSON.stringify(data), 'utf-8');
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': payload.length,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(payload);
  }

  if (req.method === 'GET') {
    if (pathname === '/api/status') {
      const syncRes = syncDataWithMarkdown();
      const cards = readAllCards();
      return sendJson(200, {
        status: 'ok',
        csv_exists: fs.existsSync(CSV_PATH),
        total_cards: cards.length,
        added_count: syncRes.added_count,
        timestamp: new Date().toISOString()
      });
    }

    if (pathname === '/api/sync') {
      const syncRes = syncDataWithMarkdown();
      return sendJson(200, {
        success: true,
        added_count: syncRes.added_count,
        total_cards: syncRes.total_cards
      });
    }

    if (pathname === '/api/cards') {
      syncDataWithMarkdown();
      const cards = readAllCards();
      return sendJson(200, cards);
    }

    if (pathname === '/api/settings') {
      return sendJson(200, loadSettings());
    }

    if (pathname === '/api/keys') {
      return sendJson(200, { keys: loadApiKeys() });
    }

    // Static file serving
    let filePath = path.join(BASE_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(BASE_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('File not found');
      }
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch (e) {}

      if (pathname === '/api/sync') {
        const syncRes = syncDataWithMarkdown();
        return sendJson(200, {
          success: true,
          added_count: syncRes.added_count,
          total_cards: syncRes.total_cards
        });
      }

      if (pathname === '/api/review') {
        const cards = readAllCards();
        const cardId = String(data.id);
        let updated = false;

        for (const c of cards) {
          if (String(c.id) === cardId) {
            c.reps = data.reps !== undefined ? data.reps : c.reps;
            c.interval_mins = data.interval_mins !== undefined ? data.interval_mins : c.interval_mins;
            c.ease_factor = data.ease_factor !== undefined ? data.ease_factor : c.ease_factor;
            c.due_date = data.due_date || c.due_date;
            c.last_reviewed = data.last_reviewed || new Date().toISOString();
            c.last_rating = data.last_rating || '';
            c.state = data.state || 'review';
            updated = true;
            break;
          }
        }
        if (updated) {
          writeCsv(cards);
          return sendJson(200, { success: true });
        }
        return sendJson(404, { success: false, error: 'Card not found' });
      }

      if (pathname === '/api/cards') {
        if (!data.question || !data.answer) {
          return sendJson(400, { error: 'Question and answer are required' });
        }
        const newCard = addNewCard(data);
        return sendJson(201, { success: true, card: newCard });
      }

      if (pathname === '/api/import') {
        const incomingCards = Array.isArray(data.cards) ? data.cards : [];
        if (incomingCards.length === 0) {
          return sendJson(400, { error: 'No cards provided' });
        }

        const cards = readAllCards();
        const cardMap = new Map();
        const questionMap = new Map();
        let maxId = 0;

        for (const c of cards) {
          const cid = parseInt(c.id, 10);
          if (!isNaN(cid) && cid > maxId) maxId = cid;
          cardMap.set(String(c.id), c);
          if (c.question) questionMap.set(c.question.trim().toLowerCase(), c);
        }

        let updatedCount = 0;
        let newCount = 0;
        const nowIso = new Date().toISOString();

        for (const inc of incomingCards) {
          if (!inc.question || !inc.answer) continue;

          // Match by ID or by exact question text
          const existing = cardMap.get(String(inc.id)) || questionMap.get(inc.question.trim().toLowerCase());
          if (existing) {
            existing.reps = inc.reps !== undefined ? inc.reps : existing.reps;
            existing.interval_mins = inc.interval_mins !== undefined ? inc.interval_mins : existing.interval_mins;
            existing.ease_factor = inc.ease_factor !== undefined ? inc.ease_factor : existing.ease_factor;
            existing.due_date = inc.due_date || existing.due_date;
            existing.last_reviewed = inc.last_reviewed || existing.last_reviewed;
            existing.last_rating = inc.last_rating || existing.last_rating;
            existing.state = inc.state || existing.state;
            updatedCount++;
          } else {
            // Brand new card
            maxId++;
            const category = (inc.category || 'General').trim() || 'General';
            const levelRaw = (inc.level || 'Intermediate').trim();
            const level = levelRaw.charAt(0).toUpperCase() + levelRaw.slice(1).toLowerCase();
            const newCard = {
              id: String(maxId),
              category,
              level,
              question: inc.question.trim(),
              answer: inc.answer.trim(),
              explanation: (inc.explanation || '').trim(),
              reps: inc.reps !== undefined ? inc.reps : '0',
              interval_mins: inc.interval_mins !== undefined ? inc.interval_mins : '0',
              ease_factor: inc.ease_factor !== undefined ? inc.ease_factor : '2.5',
              due_date: inc.due_date || nowIso,
              last_reviewed: inc.last_reviewed || '',
              last_rating: inc.last_rating || '',
              state: inc.state || 'new'
            };
            cards.push(newCard);
            cardMap.set(newCard.id, newCard);
            questionMap.set(newCard.question.toLowerCase(), newCard);
            newCount++;

            // Append to markdown file in data/<category>/<level>.md
            try {
              const catDir = path.join(DATA_DIR, category);
              if (!fs.existsSync(catDir)) {
                fs.mkdirSync(catDir, { recursive: true });
              }
              const mdFile = path.join(catDir, `${level}.md`);
              let qNum = 1;
              if (fs.existsSync(mdFile)) {
                const existingText = fs.readFileSync(mdFile, 'utf-8');
                const matches = existingText.match(/^(?:#{1,4}\s+|\d+\.\s+)/gm);
                if (matches) qNum = matches.length + 1;
              }
              const mdEntry = `\n\n${qNum}. ${newCard.question}\n\n**Deep explanation:** ${newCard.explanation}\n\n**Interview answer:** ${newCard.answer}\n`;
              fs.appendFileSync(mdFile, mdEntry, 'utf-8');
            } catch (err) {
              console.warn('[Warning] Could not append to markdown file during import:', err);
            }
          }
        }

        writeCsv(cards);
        return sendJson(200, {
          success: true,
          new_count: newCount,
          updated_count: updatedCount,
          total_cards: cards.length
        });
      }

      if (pathname === '/api/settings') {
        saveSettings(data);
        return sendJson(200, { success: true, settings: data });
      }

      if (pathname === '/api/keys') {
        const saved = saveApiKeys(data.keys || []);
        return sendJson(200, { success: true, keys: saved, count: saved.length });
      }

      if (pathname === '/api/reset') {
        const cards = readAllCards();
        const nowIso = new Date().toISOString();
        for (const c of cards) {
          c.reps = 0;
          c.interval_mins = 0;
          c.ease_factor = 2.5;
          c.due_date = nowIso;
          c.last_reviewed = '';
          c.last_rating = '';
          c.state = 'new';
        }
        writeCsv(cards);
        return sendJson(200, { success: true });
      }

      if (pathname === '/api/rebuild') {
        if (fs.existsSync(CSV_PATH)) fs.unlinkSync(CSV_PATH);
        ensureDataCsv();
        const cards = readAllCards();
        return sendJson(200, { success: true, total_cards: cards.length });
      }

      return sendJson(404, { error: 'Not found' });
    });
    return;
  }

  res.writeHead(405);
  res.end();
});

ensureDataCsv();
ensureSettings();

server.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`🚀 Spaced Repetition App running at: http://localhost:${PORT}`);
  console.log(`📂 Data directory: ${DATA_DIR}`);
  console.log(`📄 Local CSV file: ${CSV_PATH}`);
  console.log(`=======================================================\n`);
});
