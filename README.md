# FlashSRS — Software Developer Interview Spaced Repetition

A responsive, high-performance HTML/CSS/JavaScript Spaced Repetition application for revising **3,500 Software Developer Interview Questions & Answers**.

---

## 🚀 Quick Start

### Option 1: Start with Python (Zero dependencies)
Run the following in PowerShell or Command Prompt:
```bash
python server.py
```
Or double-click `start.bat`.

### Option 2: Start with Node.js (Zero dependencies)
```bash
node server.js
```

### Option 3: Direct Browser Launch
You can also open `index.html` directly in your browser. The app runs fully offline and supports direct data export.

### Option 4: Deploy to Vercel (100% Free Cloud Hosting)
You can host FlashSRS globally on Vercel with zero configuration:
1. Initialize Git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Log in to [vercel.com](https://vercel.com) -> **Add New...** -> **Project**.
3. Select your GitHub repository and click **Deploy**.
   - Framework preset: **Other** (leave defaults, no build command needed).
4. Or deploy directly from the CLI:
   ```bash
   npx vercel
   ```
*(In cloud mode on Vercel, cards and presets load instantly from `data.csv`, and all your study reviews and OpenRouter keys are saved in your browser storage. You can backup or transfer progress between devices anytime using the "Download data.csv" and "Import data.csv" buttons in the footer.)*

---

## 📁 Project Structure

```
D:\aaaaa-super30\spaced-repetition\
├── data\                                # All 31 categories & 93 markdown files
│   ├── 01 Programming Fundamentals\
│   ├── 02 Data Structures and Algorithms\
│   ├── 06 JavaScript\
│   ├── 08 React\
│   ├── 12 SQL\
│   └── ... (31 total topics)
├── data.csv                             # Primary local database for all 3,500 questions & review states
├── settings.json                        # Saved footer reschedule intervals
├── index.html                           # Single Page Application
├── styles.css                           # Modern responsive UI & dark theme
├── app.js                               # Spaced Repetition scheduling & card interactions
├── server.py                            # Standalone Python HTTP & API server
├── server.js                            # Standalone Node.js HTTP & API server
├── start.bat                            # 1-Click launcher for Windows
└── README.md
```

---

## ✨ Features

1. **Auto-creation & Dynamic Sync of `data.csv`:**
   - On launch, the app automatically checks the `./data/` folder and generates `data.csv` if missing.
   - **New Folders & Files Detection:** Whenever you add new folders or markdown files inside `./data/`, the app automatically detects them, extracts the new questions, assigns unique IDs, and appends them to `data.csv` without touching or resetting your existing review progress!
   - You can also click the **"🔄 Sync New Files"** button directly in the SPA header or footer at any time to scan and import new content instantly.

2. **Single-Question Flashcards:**
   - Displays a clean card with category badges, difficulty level (Beginner / Intermediate / Advanced), and progress tracking.

3. **Step-by-Step Question & Answer Reveal:**
   - **Step 1:** Only the Question is displayed first.
   - **Step 2:** Click **"Show Answer"** (or hit <kbd>Space</kbd> / <kbd>Enter</kbd>) to reveal the **Interview Answer**.
   - **Step 3:** Click **"📖 View Deep Explanation"** (or press <kbd>E</kbd>) to open the **Deep Explanation modal** with formatted markdown and code blocks.

4. **Spaced Repetition (SRS) Rescheduling:**
   - Mark cards as **Difficult (1)**, **Hard (2)**, **Good (3)**, or **Easy (4)**.
   - Updates `reps`, `interval_mins`, `ease_factor`, `due_date`, and `state` directly into `data.csv`.

5. **Footer-Editable Reschedule Intervals:**
   - Customize intervals for Difficult, Hard, Good, and Easy directly in the footer of the SPA.
   - Choose values and units (minutes, hours, days).
   - Changing intervals immediately updates the badges on rating buttons and recalculates future reschedule times.

6. **Unified Collections & Presets Modal:**
   - **Single Header Button:** Click **"📂 Collections & Presets"** in the top navigation bar to open the dedicated 2-column modal.
   - **Preset Selection in Modal (Left Sidebar):**
     - Browse all curated presets (`⚡ All Collections`, `⚡ Frontend Mastery`, `⚡ Backend & Databases`, `⚡ System Design & Distributed`, `⚡ DevOps, Cloud & Linux`, `⚡ Core CS & Fundamentals`) as well as your custom presets.
     - Clicking any preset immediately selects it and updates the checked collections and cards in real time.
   - **Preset Creation in Modal (Left Sidebar):**
     - Click **"➕ New Preset"** right in the sidebar to open the inline creator form.
     - Type a preset name and save your current collection selection as a custom preset.
     - Custom presets include a `[✕]` delete button on hover.
   - **Collections Filtering & Search (Right Panel):**
     - **Real-time Search:** Search across all 67 collections with instant match highlighting.
     - **Bulk Actions:** `Select All`, `Clear All`, and `Invert` buttons.
     - **Flexible Selection:** Toggle checkboxes, or click **"Only"** on any topic to focus solely on that collection.
     - **Live Card & Due Counts:** View total flashcards and cards currently due for review per collection.
   - **Active Filter Chip:** The secondary toolbar displays the active preset/collection with card counts and a 1-click `[✕]` clear button to return to all collections.

7. **Interactive Question Browser:**
   - Search across all questions, inspect review counts, and jump directly to any card.

8. **AI Flashcard Tutor (OpenRouter Free Model Router):**
   - Click **"💬 Ask AI Tutor"** (or press <kbd>C</kbd>) on any card to open the AI Chat Modal.
   - On the first query, the card's full contents (Question, Interview Answer, and Deep Explanation) are automatically injected as context into OpenRouter's free model router (`openrouter/free`).
   - Subsequent queries preserve full conversational context.
   - **Multi-Key Cycling:** Add multiple OpenRouter API keys in the key manager; if any key encounters a rate limit (HTTP 429), FlashSRS automatically rotates to the next available key and retries the request seamlessly.

9. **AI Card Creator & Refiner:**
   - Click **"➕ New Card"** in the top navigation bar (or press <kbd>N</kbd>).
   - Enter your interview question, choose or type a collection name, and select a difficulty level.
   - Click **"⚡ Generate with AI"** to generate both a concise verbal **Interview Answer** and a comprehensive **Deep Explanation** using OpenRouter's free model router.
   - Edit the content directly with live markdown preview toggles.
   - Click **"✨ Improve"** or select quick refinement chips (*"⚡ More Concise"*, *"💻 Add Code Example"*, *"🔬 Deeper Mechanics"*, *"🎯 Add Follow-up Q&A"*) to iterate and polish with AI.
   - Click **"💾 Save Card to Collection"** to append the card to `data.csv` (and `./data/<Category>/<Level>.md`), instantly ready for Spaced Repetition practice.

10. **Keyboard Shortcuts:**
   - <kbd>Space</kbd> / <kbd>Enter</kbd>: Reveal Answer
   - <kbd>1</kbd>: Difficult
   - <kbd>2</kbd>: Hard
   - <kbd>3</kbd>: Good
   - <kbd>4</kbd>: Easy
   - <kbd>E</kbd>: Deep Explanation Modal
   - <kbd>C</kbd>: AI Chat Tutor Modal
   - <kbd>N</kbd>: Create New Card with AI
   - <kbd>Esc</kbd>: Close Modals / Drawers
   - <kbd>←</kbd> / <kbd>→</kbd>: Previous / Skip Card
