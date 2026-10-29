import os
import sys

# Ensure UTF-8 output on Windows consoles
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import glob
import re
import csv
import json
import datetime
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CSV_PATH = os.path.join(BASE_DIR, 'data.csv')
SETTINGS_PATH = os.path.join(BASE_DIR, 'settings.json')
KEYS_PATH = os.path.join(BASE_DIR, 'openrouter_keys.txt')

DEFAULT_SETTINGS = {
    "difficult": {"value": 10, "unit": "minutes"},
    "hard": {"value": 1, "unit": "days"},
    "good": {"value": 3, "unit": "days"},
    "easy": {"value": 7, "unit": "days"}
}

def load_api_keys():
    keys = []
    if os.path.exists(KEYS_PATH):
        try:
            with open(KEYS_PATH, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        keys.append(line)
        except Exception as e:
            print(f"[Warning] Failed reading {KEYS_PATH}: {e}")

    if not keys and os.path.exists(SETTINGS_PATH):
        try:
            with open(SETTINGS_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'openrouter_keys' in data and isinstance(data['openrouter_keys'], list):
                    keys = [k.strip() for k in data['openrouter_keys'] if isinstance(k, str) and k.strip()]
                elif 'openrouter_api_key' in data and data['openrouter_api_key']:
                    keys = [data['openrouter_api_key'].strip()]
        except Exception:
            pass

    return list(dict.fromkeys(keys))

def save_api_keys(keys):
    clean_keys = []
    for k in keys:
        if isinstance(k, str) and k.strip():
            clean_keys.append(k.strip())
    clean_keys = list(dict.fromkeys(clean_keys))

    try:
        with open(KEYS_PATH, 'w', encoding='utf-8') as f:
            for k in clean_keys:
                f.write(k + '\n')
        print(f"[Keys] Successfully saved {len(clean_keys)} API keys to {KEYS_PATH}")
    except Exception as e:
        print(f"[Warning] Failed writing {KEYS_PATH}: {e}")

    try:
        ensure_settings()
        with open(SETTINGS_PATH, 'r', encoding='utf-8') as f:
            settings_data = json.load(f)
        settings_data['openrouter_keys'] = clean_keys
        with open(SETTINGS_PATH, 'w', encoding='utf-8') as f:
            json.dump(settings_data, f, indent=2)
    except Exception as e:
        print(f"[Warning] Failed syncing keys to {SETTINGS_PATH}: {e}")

    return clean_keys

def ensure_settings():
    if not os.path.exists(SETTINGS_PATH):
        with open(SETTINGS_PATH, 'w', encoding='utf-8') as f:
            json.dump(DEFAULT_SETTINGS, f, indent=2)

def load_settings():
    ensure_settings()
    try:
        with open(SETTINGS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            file_keys = load_api_keys()
            if file_keys:
                data['openrouter_keys'] = file_keys
            return data
    except Exception:
        return DEFAULT_SETTINGS

def save_settings(settings):
    if 'openrouter_keys' in settings and isinstance(settings['openrouter_keys'], list):
        save_api_keys(settings['openrouter_keys'])
    with open(SETTINGS_PATH, 'w', encoding='utf-8') as f:
        json.dump(settings, f, indent=2)

def parse_markdown_questions(content):
    cards = []
    blocks = re.split(r'\n(?=(?:#{1,4}\s+|\d+\.\s+))', '\n' + content)
    for b in blocks:
        b = b.strip()
        if not b:
            continue
        m_start = re.match(r'^(?:(#{1,4})\s+|(\d+)\.\s+)', b)
        if not m_start:
            continue

        has_deep = bool(re.search(r'\*\*Deep [Ee]xplanation:\*\*', b))
        has_ans = bool(re.search(r'\*\*Interview [Aa]nswer:\*\*', b))

        if has_deep and has_ans:
            m_deep = re.search(r'\*\*Deep [Ee]xplanation:\*\*\s*(.*?)(?=\*\*Interview [Aa]nswer:\*\*|$)', b, re.DOTALL)
            m_ans = re.search(r'\*\*Interview [Aa]nswer:\*\*\s*(.*?)(?=\*\*Deep [Ee]xplanation:\*\*|$)', b, re.DOTALL)
            q_match = re.search(r'^(?:#{1,4}\s+|\d+\.\s+)(.*?)(?=\*\*Deep [Ee]xplanation:\*\*|\*\*Interview [Aa]nswer:\*)', b, re.DOTALL)
            if q_match and m_deep and m_ans:
                cards.append({
                    'question': q_match.group(1).strip(),
                    'answer': m_ans.group(1).strip(),
                    'explanation': m_deep.group(1).strip()
                })
                continue
        elif has_deep or has_ans:
            split_marker = r'\*\*Deep [Ee]xplanation:\*\*|\*\*Interview [Aa]nswer:\*\*'
            parts = re.split(split_marker, b, maxsplit=1)
            q_part = re.sub(r'^(?:#{1,4}\s+|\d+\.\s+)', '', parts[0]).strip()
            ans_part = parts[1].strip() if len(parts) > 1 else ''
            cards.append({
                'question': q_part,
                'answer': ans_part,
                'explanation': ans_part
            })
            continue
        else:
            lines = b.split('\n', 1)
            q_text = re.sub(r'^(?:#{1,4}\s+|\d+\.\s+)', '', lines[0]).strip()
            ans_text = lines[1].strip() if len(lines) > 1 else q_text
            if q_text and ans_text:
                cards.append({
                    'question': q_text,
                    'answer': ans_text,
                    'explanation': ans_text
                })
    return cards

def sync_data_with_markdown():
    if not os.path.exists(DATA_DIR):
        print(f"[Error] Data directory not found: {DATA_DIR}")
        return {"added_count": 0, "total_cards": 0}

    existing_cards = []
    if os.path.exists(CSV_PATH) and os.path.getsize(CSV_PATH) > 0:
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing_cards.append(row)

    # Track existing question keys: (category.strip().lower(), question.strip().lower())
    existing_keys = set()
    max_id = 0
    for c in existing_cards:
        cat_key = (c.get('category') or '').strip().lower()
        q_key = (c.get('question') or '').strip().lower()
        existing_keys.add((cat_key, q_key))
        try:
            cid = int(c.get('id', 0))
            if cid > max_id:
                max_id = cid
        except ValueError:
            pass

    files = glob.glob(os.path.join(DATA_DIR, '**', '*.md'), recursive=True)
    files.sort()
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    newly_added = []

    for f in files:
        rel_path = os.path.relpath(f, DATA_DIR)
        parts = rel_path.split(os.sep)
        category = parts[0] if len(parts) > 1 else 'General'
        level = os.path.splitext(parts[-1])[0]

        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
        except Exception as e:
            print(f"[Warning] Failed reading {f}: {e}")
            continue

        qna_list = parse_markdown_questions(content)
        for item in qna_list:
            cat_key = category.strip().lower()
            q_key = item['question'].strip().lower()

            if (cat_key, q_key) not in existing_keys:
                max_id += 1
                new_card = {
                    'id': str(max_id),
                    'category': category,
                    'level': level,
                    'question': item['question'],
                    'answer': item['answer'],
                    'explanation': item['explanation'],
                    'reps': '0',
                    'interval_mins': '0',
                    'ease_factor': '2.5',
                    'due_date': now_str,
                    'last_reviewed': '',
                    'last_rating': '',
                    'state': 'new'
                }
                existing_cards.append(new_card)
                newly_added.append(new_card)
                existing_keys.add((cat_key, q_key))

    fieldnames = ['id', 'category', 'level', 'question', 'answer', 'explanation', 'reps', 'interval_mins', 'ease_factor', 'due_date', 'last_reviewed', 'last_rating', 'state']
    if newly_added or not os.path.exists(CSV_PATH) or os.path.getsize(CSV_PATH) == 0:
        temp_csv = CSV_PATH + '.tmp'
        with open(temp_csv, 'w', encoding='utf-8', newline='') as fp:
            writer = csv.DictWriter(fp, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            writer.writerows(existing_cards)
        os.replace(temp_csv, CSV_PATH)
        print(f"[Sync] Added {len(newly_added)} new questions into data.csv! Total cards: {len(existing_cards)}")
    else:
        print(f"[Sync] Data up-to-date. Total cards: {len(existing_cards)}")

    return {"added_count": len(newly_added), "total_cards": len(existing_cards)}

def ensure_data_csv():
    sync_data_with_markdown()

def read_all_cards():
    ensure_data_csv()
    cards = []
    if not os.path.exists(CSV_PATH):
        return cards
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cards.append(row)
    return cards

def update_card_review(review_data):
    ensure_data_csv()
    card_id = str(review_data.get('id'))
    cards = read_all_cards()
    fieldnames = ['id', 'category', 'level', 'question', 'answer', 'explanation', 'reps', 'interval_mins', 'ease_factor', 'due_date', 'last_reviewed', 'last_rating', 'state']
    updated = False

    for c in cards:
        if str(c.get('id')) == card_id:
            c['reps'] = str(review_data.get('reps', c.get('reps', 0)))
            c['interval_mins'] = str(review_data.get('interval_mins', c.get('interval_mins', 0)))
            c['ease_factor'] = str(review_data.get('ease_factor', c.get('ease_factor', 2.5)))
            c['due_date'] = str(review_data.get('due_date', c.get('due_date', '')))
            c['last_reviewed'] = str(review_data.get('last_reviewed', ''))
            c['last_rating'] = str(review_data.get('last_rating', ''))
            c['state'] = str(review_data.get('state', 'review'))
            updated = True
            break

    if updated:
        temp_csv = CSV_PATH + '.tmp'
        with open(temp_csv, 'w', encoding='utf-8', newline='') as fp:
            writer = csv.DictWriter(fp, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            writer.writerows(cards)
        os.replace(temp_csv, CSV_PATH)
    return updated

def reset_all_progress():
    cards = read_all_cards()
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    fieldnames = ['id', 'category', 'level', 'question', 'answer', 'explanation', 'reps', 'interval_mins', 'ease_factor', 'due_date', 'last_reviewed', 'last_rating', 'state']
    for c in cards:
        c['reps'] = 0
        c['interval_mins'] = 0
        c['ease_factor'] = 2.5
        c['due_date'] = now_str
        c['last_reviewed'] = ''
        c['last_rating'] = ''
        c['state'] = 'new'
    temp_csv = CSV_PATH + '.tmp'
    with open(temp_csv, 'w', encoding='utf-8', newline='') as fp:
        writer = csv.DictWriter(fp, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(cards)
    os.replace(temp_csv, CSV_PATH)

def add_new_card(card_data):
    ensure_data_csv()
    cards = read_all_cards()
    fieldnames = ['id', 'category', 'level', 'question', 'answer', 'explanation', 'reps', 'interval_mins', 'ease_factor', 'due_date', 'last_reviewed', 'last_rating', 'state']

    max_id = 0
    for c in cards:
        try:
            cid = int(c.get('id', 0))
            if cid > max_id:
                max_id = cid
        except (ValueError, TypeError):
            pass

    new_id = str(max_id + 1)
    category = str(card_data.get('category', 'General')).strip() or 'General'
    level_raw = str(card_data.get('level', 'Intermediate')).strip()
    level = level_raw.capitalize() if level_raw else 'Intermediate'
    question = str(card_data.get('question', '')).strip()
    answer = str(card_data.get('answer', '')).strip()
    explanation = str(card_data.get('explanation', '')).strip()
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    new_card = {
        'id': new_id,
        'category': category,
        'level': level,
        'question': question,
        'answer': answer,
        'explanation': explanation,
        'reps': '0',
        'interval_mins': '0',
        'ease_factor': '2.5',
        'due_date': now_str,
        'last_reviewed': '',
        'last_rating': '',
        'state': 'new'
    }
    cards.append(new_card)

    temp_csv = CSV_PATH + '.tmp'
    with open(temp_csv, 'w', encoding='utf-8', newline='') as fp:
        writer = csv.DictWriter(fp, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(cards)
    os.replace(temp_csv, CSV_PATH)

    # Also append to markdown file in data/<category>/<level>.md if DATA_DIR exists
    try:
        cat_dir = os.path.join(DATA_DIR, category)
        os.makedirs(cat_dir, exist_ok=True)
        md_file = os.path.join(cat_dir, f"{level}.md")

        q_num = 1
        if os.path.exists(md_file):
            with open(md_file, 'r', encoding='utf-8', errors='ignore') as fp:
                existing_text = fp.read()
                matches = re.findall(r'^(?:#{1,4}\s+|\d+\.\s+)', existing_text, re.MULTILINE)
                q_num = len(matches) + 1

        md_entry = f"\n\n{q_num}. {question}\n\n**Deep explanation:** {explanation}\n\n**Interview answer:** {answer}\n"
        with open(md_file, 'a', encoding='utf-8') as fp:
            fp.write(md_entry)
    except Exception as e:
        print(f"[Warning] Could not append to markdown file: {e}")

    return new_card

class SRSRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/status':
            res = sync_data_with_markdown()
            cards = read_all_cards()
            self.send_json_response(200, {
                "status": "ok",
                "csv_exists": os.path.exists(CSV_PATH),
                "total_cards": len(cards),
                "added_count": res.get("added_count", 0),
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            })
            return

        if path == '/api/sync':
            res = sync_data_with_markdown()
            self.send_json_response(200, {
                "success": True,
                "added_count": res.get("added_count", 0),
                "total_cards": res.get("total_cards", 0)
            })
            return

        if path == '/api/cards':
            sync_data_with_markdown()
            cards = read_all_cards()
            self.send_json_response(200, cards)
            return

        if path == '/api/settings':
            settings = load_settings()
            self.send_json_response(200, settings)
            return

        if path == '/api/keys':
            keys = load_api_keys()
            self.send_json_response(200, {"keys": keys})
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'

        try:
            data = json.loads(body)
        except Exception:
            data = {}

        if path == '/api/sync':
            res = sync_data_with_markdown()
            self.send_json_response(200, {
                "success": True,
                "added_count": res.get("added_count", 0),
                "total_cards": res.get("total_cards", 0)
            })
            return

        if path == '/api/review':
            success = update_card_review(data)
            self.send_json_response(200 if success else 400, {"success": success})
            return

        if path == '/api/cards':
            if not data.get('question') or not data.get('answer'):
                self.send_json_response(400, {"error": "Question and answer are required"})
                return
            new_card = add_new_card(data)
            self.send_json_response(201, {"success": True, "card": new_card})
            return

        if path == '/api/import':
            incoming_cards = data.get('cards', [])
            if not isinstance(incoming_cards, list) or len(incoming_cards) == 0:
                self.send_json_response(400, {"error": "No cards provided"})
                return

            cards = read_all_cards()
            card_map = {str(c.get('id')): c for c in cards}
            question_map = {c.get('question', '').strip().lower(): c for c in cards if c.get('question')}
            max_id = 0
            for c in cards:
                try:
                    cid = int(c.get('id', 0))
                    if cid > max_id:
                        max_id = cid
                except ValueError:
                    pass

            updated_count = 0
            new_count = 0
            now_iso = datetime.now(timezone.utc).isoformat()

            for inc in incoming_cards:
                q = (inc.get('question') or '').strip()
                a = (inc.get('answer') or '').strip()
                if not q or not a:
                    continue

                existing = card_map.get(str(inc.get('id'))) or question_map.get(q.lower())
                if existing:
                    if 'reps' in inc: existing['reps'] = inc['reps']
                    if 'interval_mins' in inc: existing['interval_mins'] = inc['interval_mins']
                    if 'ease_factor' in inc: existing['ease_factor'] = inc['ease_factor']
                    if 'due_date' in inc: existing['due_date'] = inc['due_date']
                    if 'last_reviewed' in inc: existing['last_reviewed'] = inc['last_reviewed']
                    if 'last_rating' in inc: existing['last_rating'] = inc['last_rating']
                    if 'state' in inc: existing['state'] = inc['state']
                    updated_count += 1
                else:
                    max_id += 1
                    category = (inc.get('category') or 'General').strip() or 'General'
                    level_raw = (inc.get('level') or 'Intermediate').strip()
                    level = level_raw.capitalize() if level_raw else 'Intermediate'
                    new_card = {
                        "id": str(max_id),
                        "category": category,
                        "level": level,
                        "question": q,
                        "answer": a,
                        "explanation": (inc.get('explanation') or '').strip(),
                        "reps": inc.get('reps', '0'),
                        "interval_mins": inc.get('interval_mins', '0'),
                        "ease_factor": inc.get('ease_factor', '2.5'),
                        "due_date": inc.get('due_date', now_iso),
                        "last_reviewed": inc.get('last_reviewed', ''),
                        "last_rating": inc.get('last_rating', ''),
                        "state": inc.get('state', 'new')
                    }
                    cards.append(new_card)
                    card_map[new_card['id']] = new_card
                    question_map[q.lower()] = new_card
                    new_count += 1

                    try:
                        cat_dir = os.path.join(DATA_DIR, category)
                        os.makedirs(cat_dir, exist_ok=True)
                        md_file = os.path.join(cat_dir, f"{level}.md")
                        q_num = 1
                        if os.path.exists(md_file):
                            with open(md_file, 'r', encoding='utf-8') as f:
                                existing_text = f.read()
                            matches = re.findall(r'^(?:#{1,4}\s+|\d+\.\s+)', existing_text, re.MULTILINE)
                            if matches:
                                q_num = len(matches) + 1
                        md_entry = f"\n\n{q_num}. {new_card['question']}\n\n**Deep explanation:** {new_card['explanation']}\n\n**Interview answer:** {new_card['answer']}\n"
                        with open(md_file, 'a', encoding='utf-8') as f:
                            f.write(md_entry)
                    except Exception as err:
                        print(f"[Warning] Could not append to markdown file during import: {err}")

            write_csv(cards)
            self.send_json_response(200, {
                "success": True,
                "new_count": new_count,
                "updated_count": updated_count,
                "total_cards": len(cards)
            })
            return

        if path == '/api/settings':
            save_settings(data)
            self.send_json_response(200, {"success": True, "settings": data})
            return

        if path == '/api/keys':
            keys = data.get('keys', [])
            saved = save_api_keys(keys)
            self.send_json_response(200, {"success": True, "keys": saved, "count": len(saved)})
            return

        if path == '/api/reset':
            reset_all_progress()
            self.send_json_response(200, {"success": True})
            return

        if path == '/api/rebuild':
            if os.path.exists(CSV_PATH):
                os.remove(CSV_PATH)
            ensure_data_csv()
            cards = read_all_cards()
            self.send_json_response(200, {"success": True, "total_cards": len(cards)})
            return

        self.send_json_response(404, {"error": "Not Found"})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == '/api/cards':
            card_ids = query.get('id', [])
            card_id = card_ids[0] if card_ids else None
            if not card_id:
                self.send_json_response(400, {"error": "Card ID required"})
                return

            cards = read_all_cards()
            filtered = [c for c in cards if str(c.get('id')) != str(card_id)]
            if len(filtered) == len(cards):
                self.send_json_response(404, {"error": "Card not found"})
                return

            write_csv(filtered)
            self.send_json_response(200, {"success": True, "deleted_id": card_id})
            return

        self.send_json_response(404, {"error": "Not Found"})

    def send_json_response(self, status_code, data):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.end_headers()
        self.wfile.write(payload)

def run_server(port=PORT):
    ensure_data_csv()
    ensure_settings()
    server_address = ('', port)
    try:
        httpd = HTTPServer(server_address, SRSRequestHandler)
    except OSError:
        port += 1
        server_address = ('', port)
        httpd = HTTPServer(server_address, SRSRequestHandler)

    url = f"http://localhost:{port}"
    print(f"\n=======================================================")
    print(f"[Server] Spaced Repetition App running at: {url}")
    print(f"[Server] Data directory: {DATA_DIR}")
    print(f"[Server] Local CSV file: {CSV_PATH}")
    print(f"Press Ctrl+C to stop the server.")
    print(f"=======================================================\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
