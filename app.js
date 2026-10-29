// FlashSRS - Spaced Repetition App for Software Developer Interview QnA

(function () {
  'use strict';

  // --- STATE ---
  let allCards = [];
  let filteredCards = [];
  let currentIndex = 0;
  let isAnswerRevealed = false;
  let isServerConnected = false;
  let selectedCategories = new Set();
  let allSortedCategories = [];
  let customPresets = [];
  let activePresetId = 'all';
  let modalSelectedCategories = new Set();
  let modalActivePresetId = 'all';

  // --- AI CHAT & OPENROUTER MULTI-KEY STATE ---
  let openRouterKeys = [];
  let currentKeyIndex = 0;
  let keyCooldowns = {};
  let cardChatHistories = {};
  let isAiRequestPending = false;

  // --- DEFAULT PRESETS ---
  const DEFAULT_PRESETS = [
    {
      id: 'frontend',
      name: 'Frontend Mastery',
      isDefault: true,
      categories: [
        '05 HTML and CSS', '06 JavaScript', '07 TypeScript', '08 React', '09 Frontend Engineering',
        '01 - Computed Property Syntax', '02 - Functions and useEffect', '03 - useReducer Flash Card',
        '04 - useEffect Purpose', '05 - Side Effects', '06 - Reconciliation and DOM Update',
        '07 - React Render and Commit Cycle', '08 - useLayoutEffect vs useEffect',
        '09 - ScrollHeight and DOM Measurements', '10 - useEffectEvent', '18 - TypeScript CSS Module Declarations',
        '19 - Next.js Directives and Server-Client Boundaries', '20 - useContext Cheat Sheet',
        '21 - Zod Date Coercion', '22 - Context and Page Reloads', '23 - Nested Components vs Re-renders',
        '24 - Context Provider Memoization', '25 - Component Architecture and Placement',
        '26 - Authentication in Next.js Server Components', '27 - Minimizing Use Client Directive',
        '28 - Next.js Server Actions', '29 - Server and Client Component Imports',
        '30 - Dynamic Segments vs Catch-all Segments', '31 - Query Parameters in Next.js',
        '32 - Handling Query Parameters with Hooks and Props', '33 - Common Navigation Methods in Next.js',
        '34 - Programmatic Navigation with useRouter', '35 - Reading Current URL in Client Components'
      ]
    },
    {
      id: 'backend',
      name: 'Backend & Databases',
      isDefault: true,
      categories: [
        '10 Backend Engineering', '11 Node.js', '12 SQL', '13 Databases', '14 Caching', '15 Messaging and Streaming',
        '11 - Cookie Parser', '12 - express.json Middleware', '13 - Cookie Creation and Attributes',
        '14 - Client vs Server Cookies', '15 - CORS Configuration in Express',
        '16 - Process Not Found and Bun Environment', '17 - Fetch Credentials Mode',
        '36 - WebSockets with ws Cheat Sheet'
      ]
    },
    {
      id: 'systems',
      name: 'System Design & Distributed',
      isDefault: true,
      categories: [
        '04 Low Level Design', '23 System Design', '24 Distributed Systems', '25 Reliability and Observability',
        '30 Search and Information Retrieval', '31 Storage Systems'
      ]
    },
    {
      id: 'devops',
      name: 'DevOps, Cloud & Linux',
      isDefault: true,
      categories: [
        '16 Networking and Web Protocols', '17 Security', '18 Operating Systems and Linux', '19 Git and Collaboration',
        '20 Docker and Kubernetes', '21 CI CD and Infrastructure as Code', '22 Cloud Engineering',
        '26 Testing and Code Quality'
      ]
    },
    {
      id: 'fundamentals',
      name: 'Core CS & Fundamentals',
      isDefault: true,
      categories: [
        '01 Programming Fundamentals', '02 Data Structures and Algorithms', '03 Object Oriented Programming',
        '27 AI ML and LLM Engineering', '28 Behavioral and Communication', '29 Mixed Engineering Scenarios'
      ]
    }
  ];

  let settings = {
    difficult: { value: 10, unit: 'minutes' },
    hard: { value: 1, unit: 'days' },
    good: { value: 3, unit: 'days' },
    easy: { value: 7, unit: 'days' }
  };

  let activeFilters = {
    category: 'all',
    level: 'all',
    mode: 'due', // 'due', 'all', 'hard'
    search: ''
  };

  // --- DOM ELEMENTS ---
  const els = {
    btnOpenCategoryModal: document.getElementById('btn-open-category-modal'),
    catFilterCountBadge: document.getElementById('cat-filter-count-badge'),
    categoryFilter: document.getElementById('category-filter'),
    activeCategoryChip: document.getElementById('active-category-chip'),
    activeCategoryChipText: document.getElementById('active-category-chip-text'),
    btnClearCatChip: document.getElementById('btn-clear-cat-chip'),

    // Category & Presets Modal
    categoryModal: document.getElementById('category-modal'),
    catModalCloseBtn: document.getElementById('cat-modal-close-btn'),
    btnSidebarNewPreset: document.getElementById('btn-sidebar-new-preset'),
    inlinePresetCreator: document.getElementById('inline-preset-creator'),
    newPresetNameInput: document.getElementById('new-preset-name-input'),
    btnConfirmSavePreset: document.getElementById('btn-confirm-save-preset'),
    btnCancelSavePreset: document.getElementById('btn-cancel-save-preset'),
    catPresetsList: document.getElementById('cat-presets-list'),
    catModalSearch: document.getElementById('cat-modal-search'),
    catModalSearchClear: document.getElementById('cat-modal-search-clear'),
    catSummaryCount: document.getElementById('cat-summary-count'),
    catSummaryTotal: document.getElementById('cat-summary-total'),
    catSummaryCards: document.getElementById('cat-summary-cards'),
    btnModalSelectAll: document.getElementById('btn-modal-select-all'),
    btnModalClearAll: document.getElementById('btn-modal-clear-all'),
    btnModalInvert: document.getElementById('btn-modal-invert'),
    catModalCollectionsList: document.getElementById('cat-modal-collections-list'),
    btnModalResetAll: document.getElementById('btn-modal-reset-all'),
    btnModalCancel: document.getElementById('btn-modal-cancel'),
    btnModalApply: document.getElementById('btn-modal-apply'),

    levelFilter: document.getElementById('level-filter'),
    searchInput: document.getElementById('search-input'),
    deckTabs: document.querySelectorAll('.deck-tab'),
    
    // Stats
    statDue: document.getElementById('stat-due'),
    statLearning: document.getElementById('stat-learning'),
    statMastered: document.getElementById('stat-mastered'),
    statTotal: document.getElementById('stat-total'),

    // Flashcard View
    flashcardContainer: document.getElementById('flashcard-container'),
    emptyState: document.getElementById('empty-state'),
    badgeCategory: document.getElementById('badge-category'),
    badgeLevel: document.getElementById('badge-level'),
    cardCounter: document.getElementById('card-counter'),
    cardIntervalMeta: document.getElementById('card-interval-meta'),
    
    questionText: document.getElementById('question-text'),
    revealContainer: document.getElementById('reveal-container'),
    btnReveal: document.getElementById('btn-reveal'),
    answerSection: document.getElementById('answer-section'),
    answerText: document.getElementById('answer-text'),
    btnExplanation: document.getElementById('btn-explanation'),
    
    // Rating Buttons
    btnDifficult: document.getElementById('btn-difficult'),
    btnHard: document.getElementById('btn-hard'),
    btnGood: document.getElementById('btn-good'),
    btnEasy: document.getElementById('btn-easy'),
    intDifficult: document.getElementById('int-difficult'),
    intHard: document.getElementById('int-hard'),
    intGood: document.getElementById('int-good'),
    intEasy: document.getElementById('int-easy'),

    // Sub Navigation
    btnPrev: document.getElementById('btn-prev'),
    btnSkip: document.getElementById('btn-skip'),
    btnRehide: document.getElementById('btn-rehide'),

    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalQuestion: document.getElementById('modal-question'),
    modalExplanation: document.getElementById('modal-explanation'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalDoneBtn: document.getElementById('modal-done-btn'),

    // Footer Settings
    difficultVal: document.getElementById('setting-difficult-val'),
    difficultUnit: document.getElementById('setting-difficult-unit'),
    hardVal: document.getElementById('setting-hard-val'),
    hardUnit: document.getElementById('setting-hard-unit'),
    goodVal: document.getElementById('setting-good-val'),
    goodUnit: document.getElementById('setting-good-unit'),
    easyVal: document.getElementById('setting-easy-val'),
    easyUnit: document.getElementById('setting-easy-unit'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    btnResetSettings: document.getElementById('btn-reset-settings'),
    btnResetProgress: document.getElementById('btn-reset-progress'),
    btnDownloadCsv: document.getElementById('btn-download-csv'),
    btnImportCsv: document.getElementById('btn-import-csv'),
    fileImportCsv: document.getElementById('file-import-csv'),
    syncText: document.getElementById('sync-text'),
    syncDot: document.getElementById('sync-dot'),

    // Sync Buttons
    btnSync: document.getElementById('btn-sync'),
    btnSyncFooter: document.getElementById('btn-sync-footer'),

    // Drawer / Browser
    btnBrowseCards: document.getElementById('btn-browse-cards'),
    drawerOverlay: document.getElementById('drawer-overlay'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    drawerList: document.getElementById('drawer-list'),
    drawerSearch: document.getElementById('drawer-search'),
    drawerCount: document.getElementById('drawer-count'),

    // Shortcuts Modal
    btnShortcuts: document.getElementById('btn-shortcuts'),
    shortcutsModal: document.getElementById('shortcuts-modal'),
    shortcutsCloseBtn: document.getElementById('shortcuts-close-btn'),

    // AI Chat Modal & Card Buttons
    btnCardAiHeader: document.getElementById('btn-card-ai-header'),
    btnCardChat: document.getElementById('btn-card-chat'),
    aiChatModal: document.getElementById('ai-chat-modal'),
    aiModalCloseBtn: document.getElementById('ai-modal-close-btn'),
    aiActiveKeyPill: document.getElementById('ai-active-key-pill'),
    aiCardTitleSubtitle: document.getElementById('ai-card-title-subtitle'),
    btnToggleKeyMgr: document.getElementById('btn-toggle-key-mgr'),
    btnClearChat: document.getElementById('btn-clear-chat'),
    aiKeyManagerPanel: document.getElementById('ai-key-manager-panel'),
    aiKeysInput: document.getElementById('ai-keys-input'),
    btnSaveKeys: document.getElementById('btn-save-keys'),
    btnCycleKeyManual: document.getElementById('btn-cycle-key-manual'),
    aiKeysSummary: document.getElementById('ai-keys-summary'),
    aiKeysListPreview: document.getElementById('ai-keys-list-preview'),
    btnToggleContextPreview: document.getElementById('btn-toggle-context-preview'),
    aiContextPreviewBody: document.getElementById('ai-context-preview-body'),
    aiContextQ: document.getElementById('ai-context-q'),
    aiContextA: document.getElementById('ai-context-a'),
    aiContextE: document.getElementById('ai-context-e'),
    aiChatMessages: document.getElementById('ai-chat-messages'),
    aiPromptChips: document.getElementById('ai-prompt-chips'),
    aiRotationBanner: document.getElementById('ai-rotation-banner'),
    aiChatInput: document.getElementById('ai-chat-input'),
    btnAiSend: document.getElementById('btn-ai-send'),
    aiInputStatusNote: document.getElementById('ai-input-status-note'),

    // Create New Card Modal
    btnCreateCardHeader: document.getElementById('btn-create-card-header'),
    createCardModal: document.getElementById('create-card-modal'),
    createCardCloseBtn: document.getElementById('create-card-close-btn'),
    createCardKeyPill: document.getElementById('create-card-key-pill'),
    createCardCategory: document.getElementById('create-card-category'),
    collectionDatalist: document.getElementById('collection-datalist'),
    createCardLevel: document.getElementById('create-card-level'),
    createCardQuestion: document.getElementById('create-card-question'),
    btnAiGenerateCard: document.getElementById('btn-ai-generate-card'),
    createCardLoading: document.getElementById('create-card-loading'),
    createCardLoadingText: document.getElementById('create-card-loading-text'),
    createCardAnswer: document.getElementById('create-card-answer'),
    btnTogglePreviewAnswer: document.getElementById('btn-toggle-preview-answer'),
    previewCardAnswer: document.getElementById('preview-card-answer'),
    createCardExplanation: document.getElementById('create-card-explanation'),
    btnTogglePreviewExplanation: document.getElementById('btn-toggle-preview-explanation'),
    previewCardExplanation: document.getElementById('preview-card-explanation'),
    refinementInstructionInput: document.getElementById('refinement-instruction-input'),
    btnAiRefineCard: document.getElementById('btn-ai-refine-card'),
    createCardSuccessBanner: document.getElementById('create-card-success-banner'),
    createCardSuccessText: document.getElementById('create-card-success-text'),
    btnCreateAnother: document.getElementById('btn-create-another'),
    btnViewCreatedCard: document.getElementById('btn-view-created-card'),
    btnCancelCreateCard: document.getElementById('btn-cancel-create-card'),
    btnSaveNewCard: document.getElementById('btn-save-new-card'),

    toast: document.getElementById('toast')
  };

  // --- INITIALIZATION ---
  async function init() {
    loadLocalSettings();
    bindEvents();
    await checkServerAndLoad();
    await loadOpenRouterKeys();
    populateCollectionDatalist();
    updateFooterUI();
    updateIntervalBadges();
  }

  // --- SIMPLE MARKDOWN FORMATTER ---
  function formatMarkdown(str) {
    if (!str) return '';
    let out = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Fenced code blocks
    out = out.replace(/```([\w-]*)\r?\n([\s\S]*?)```/g, (m, lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings
    out = out.replace(/(?:^|\n)###\s+(.+)/g, '<br><strong>$1</strong>');
    out = out.replace(/(?:^|\n)##\s+(.+)/g, '<br><strong>$1</strong>');
    out = out.replace(/(?:^|\n)#\s+(.+)/g, '<br><strong>$1</strong>');

    // Bold
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Bullet lists
    out = out.replace(/(?:^|\n)-\s+(.+)/g, '<br>&bull; $1');
    out = out.replace(/(?:^|\n)\*\s+(.+)/g, '<br>&bull; $1');

    // Numbered lists
    out = out.replace(/(?:^|\n)(\d+)\.\s+(.+)/g, '<br><strong>$1.</strong> $2');

    // Paragraph breaks
    out = out.replace(/\r?\n\r?\n+/g, '<br><br>');
    out = out.replace(/\r?\n/g, '<br>');

    return out;
  }

  // --- INTERVAL HELPERS ---
  function unitToMinutes(val, unit) {
    val = parseFloat(val) || 1;
    if (unit === 'minutes') return val;
    if (unit === 'hours') return val * 60;
    if (unit === 'days') return val * 1440;
    return val;
  }

  function formatMinutes(mins) {
    if (mins < 60) return `${Math.round(mins)}m`;
    if (mins < 1440) return `${Math.round(mins / 60)}h`;
    const days = Math.round((mins / 1440) * 10) / 10;
    return `${days % 1 === 0 ? Math.round(days) : days}d`;
  }

  function getScheduledIntervalMins(card, rating) {
    const reps = parseInt(card.reps) || 0;
    const currentMins = parseFloat(card.interval_mins) || 0;
    const ease = parseFloat(card.ease_factor) || 2.5;

    const diffMins = unitToMinutes(settings.difficult.value, settings.difficult.unit);
    const hardMins = unitToMinutes(settings.hard.value, settings.hard.unit);
    const goodMins = unitToMinutes(settings.good.value, settings.good.unit);
    const easyMins = unitToMinutes(settings.easy.value, settings.easy.unit);

    if (rating === 'difficult') {
      return diffMins;
    }
    if (rating === 'hard') {
      if (reps === 0 || currentMins === 0) return hardMins;
      return Math.max(hardMins, Math.round(currentMins * 1.2));
    }
    if (rating === 'good') {
      if (reps === 0 || currentMins === 0) return goodMins;
      return Math.max(goodMins, Math.round(currentMins * ease));
    }
    if (rating === 'easy') {
      if (reps === 0 || currentMins === 0) return easyMins;
      return Math.max(easyMins, Math.round(currentMins * ease * 1.3));
    }
    return goodMins;
  }

  function updateIntervalBadges() {
    const card = getCurrentCard();
    if (!card) {
      els.intDifficult.textContent = `+${formatMinutes(unitToMinutes(settings.difficult.value, settings.difficult.unit))}`;
      els.intHard.textContent = `+${formatMinutes(unitToMinutes(settings.hard.value, settings.hard.unit))}`;
      els.intGood.textContent = `+${formatMinutes(unitToMinutes(settings.good.value, settings.good.unit))}`;
      els.intEasy.textContent = `+${formatMinutes(unitToMinutes(settings.easy.value, settings.easy.unit))}`;
      return;
    }

    els.intDifficult.textContent = `+${formatMinutes(getScheduledIntervalMins(card, 'difficult'))}`;
    els.intHard.textContent = `+${formatMinutes(getScheduledIntervalMins(card, 'hard'))}`;
    els.intGood.textContent = `+${formatMinutes(getScheduledIntervalMins(card, 'good'))}`;
    els.intEasy.textContent = `+${formatMinutes(getScheduledIntervalMins(card, 'easy'))}`;
  }

  // --- SETTINGS STORAGE & SYNC ---
  function loadLocalSettings() {
    try {
      const stored = localStorage.getItem('flashsrs_settings');
      if (stored) {
        settings = Object.assign(settings, JSON.parse(stored));
      }
    } catch (e) {}
  }

  function saveLocalSettings() {
    try {
      localStorage.setItem('flashsrs_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  async function syncSettingsWithServer() {
    if (isServerConnected) {
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
      } catch (e) {}
    }
  }

  function updateFooterUI() {
    els.difficultVal.value = settings.difficult.value;
    els.difficultUnit.value = settings.difficult.unit;
    els.hardVal.value = settings.hard.value;
    els.hardUnit.value = settings.hard.unit;
    els.goodVal.value = settings.good.value;
    els.goodUnit.value = settings.good.unit;
    els.easyVal.value = settings.easy.value;
    els.easyUnit.value = settings.easy.unit;
  }

  function readSettingsFromFooter() {
    settings.difficult.value = Math.max(1, parseFloat(els.difficultVal.value) || 1);
    settings.difficult.unit = els.difficultUnit.value;

    settings.hard.value = Math.max(1, parseFloat(els.hardVal.value) || 1);
    settings.hard.unit = els.hardUnit.value;

    settings.good.value = Math.max(1, parseFloat(els.goodVal.value) || 1);
    settings.good.unit = els.goodUnit.value;

    settings.easy.value = Math.max(1, parseFloat(els.easyVal.value) || 1);
    settings.easy.unit = els.easyUnit.value;

    saveLocalSettings();
    syncSettingsWithServer();
    updateIntervalBadges();
    showToast('✓ Reschedule intervals updated!');
  }

  // --- SYNC NEW FOLDERS / FILES ---
  async function syncDataFiles(showToastFeedback = true) {
    if (!isServerConnected) {
      if (showToastFeedback) {
        showToast('To scan for new files/folders, please run the app using start.bat, python server.py, or node server.js');
      }
      return;
    }

    try {
      els.syncText.textContent = 'Scanning data folder for new files...';
      const res = await fetch('/api/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        els.syncText.textContent = `Connected to local data.csv (${data.total_cards} cards)`;

        if (data.added_count > 0) {
          // Fetch updated cards
          const cRes = await fetch('/api/cards');
          if (cRes.ok) {
            allCards = await cRes.json();
            populateCategoryDropdown();
            applyFilters();
            updateOverallStats();
            showToast(`✨ Added ${data.added_count} new flashcard(s) from data/! (Total: ${data.total_cards})`);
          }
        } else if (showToastFeedback) {
          showToast(`✓ Data folder is up to date (${data.total_cards} cards). No new cards found.`);
        }
      }
    } catch (err) {
      console.error('Error syncing data files:', err);
      if (showToastFeedback) showToast('Failed to sync data folder.');
    } finally {
      els.syncText.textContent = `Connected to local data.csv (${allCards.length} cards)`;
    }
  }

  // --- PROGRESS PERSISTENCE (BROWSER / CLOUD MODE) ---
  function saveLocalProgress(card) {
    if (!card || !card.id) return;
    try {
      let progressMap = {};
      const stored = localStorage.getItem('flashsrs_progress_map');
      if (stored) {
        try { progressMap = JSON.parse(stored); } catch (e) {}
      }
      progressMap[String(card.id)] = {
        reps: card.reps,
        interval_mins: card.interval_mins,
        ease_factor: card.ease_factor,
        due_date: card.due_date,
        last_reviewed: card.last_reviewed,
        last_rating: card.last_rating,
        state: card.state
      };
      localStorage.setItem('flashsrs_progress_map', JSON.stringify(progressMap));
    } catch (e) {
      console.warn('Failed saving progress to localStorage:', e);
    }
  }

  function restoreLocalProgress() {
    try {
      // 1. Restore reviews from lightweight progress map
      const stored = localStorage.getItem('flashsrs_progress_map');
      let progressMap = null;
      if (stored) {
        try { progressMap = JSON.parse(stored); } catch (e) {}
      }

      if (progressMap && Object.keys(progressMap).length > 0) {
        allCards.forEach(c => {
          const p = progressMap[String(c.id)];
          if (p) {
            if (p.reps !== undefined) c.reps = p.reps;
            if (p.interval_mins !== undefined) c.interval_mins = p.interval_mins;
            if (p.ease_factor !== undefined) c.ease_factor = p.ease_factor;
            if (p.due_date) c.due_date = p.due_date;
            if (p.last_reviewed !== undefined) c.last_reviewed = p.last_reviewed;
            if (p.last_rating !== undefined) c.last_rating = p.last_rating;
            if (p.state) c.state = p.state;
          }
        });
      } else {
        // Fallback: check legacy flashsrs_cards
        const legacy = localStorage.getItem('flashsrs_cards');
        if (legacy) {
          try {
            const legacyCards = JSON.parse(legacy);
            const legacyMap = {};
            legacyCards.forEach(lc => { if (lc.id) legacyMap[String(lc.id)] = lc; });
            allCards.forEach(c => {
              const lc = legacyMap[String(c.id)];
              if (lc && (parseInt(lc.reps) > 0 || lc.last_reviewed)) {
                c.reps = lc.reps;
                c.interval_mins = lc.interval_mins;
                c.ease_factor = lc.ease_factor;
                c.due_date = lc.due_date;
                c.last_reviewed = lc.last_reviewed;
                c.last_rating = lc.last_rating;
                c.state = lc.state;
              }
            });
          } catch (e) {}
        }
      }

      // 2. Restore any custom user-created cards
      const customStored = localStorage.getItem('flashsrs_custom_cards');
      if (customStored) {
        try {
          const customCards = JSON.parse(customStored);
          if (Array.isArray(customCards) && customCards.length > 0) {
            const existingIds = new Set(allCards.map(c => String(c.id)));
            customCards.forEach(cc => {
              if (!existingIds.has(String(cc.id))) {
                allCards.push(cc);
              }
            });
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Failed restoring local progress:', e);
    }
  }

  // --- DATA LOADING & PARSING ---
  async function checkServerAndLoad() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        isServerConnected = true;
        els.syncDot.style.backgroundColor = '#10b981';
        els.syncText.textContent = 'Connected to local data.csv';

        // Load settings from server if available
        const sRes = await fetch('/api/settings');
        if (sRes.ok) {
          const remoteSettings = await sRes.json();
          settings = Object.assign(settings, remoteSettings);
          saveLocalSettings();
          updateFooterUI();
        }

        // Fetch cards
        const cRes = await fetch('/api/cards');
        if (cRes.ok) {
          allCards = await cRes.json();
          onDataLoaded();
          // Quietly check if newly added files need syncing
          syncDataFiles(false);
          return;
        }
      }
    } catch (e) {
      console.log('Server not reachable or cloud/static mode:', e);
    }

    // Fallback: Cloud / Static Hosting Mode (Vercel / GitHub Pages / Offline)
    isServerConnected = false;
    els.syncDot.style.backgroundColor = '#10b981';
    els.syncText.textContent = 'Cloud / Browser Mode (Progress saved to device)';

    try {
      const csvRes = await fetch('data.csv');
      if (csvRes.ok) {
        const text = await csvRes.text();
        allCards = parseCsvText(text);
        restoreLocalProgress();
        onDataLoaded();
        return;
      }
    } catch (e) {}

    // Check localStorage fallback
    const local = localStorage.getItem('flashsrs_cards');
    if (local) {
      allCards = JSON.parse(local);
      restoreLocalProgress();
      onDataLoaded();
    } else {
      showToast('Please start the server or ensure data.csv is accessible.');
    }
  }

  function parseCsvText(text) {
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

  function onDataLoaded() {
    populateCategoryDropdown();
    applyFilters();
    updateOverallStats();
    showToast(`Loaded ${allCards.length.toLocaleString()} flashcards!`);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  }

  // --- PRESET STORAGE & HELPERS ---
  function loadCustomPresets() {
    if (settings && Array.isArray(settings.presets)) {
      customPresets = settings.presets;
      return;
    }
    try {
      const stored = localStorage.getItem('flashsrs_custom_presets');
      if (stored) {
        customPresets = JSON.parse(stored);
      }
    } catch (e) {}
  }

  function saveCustomPresets() {
    try {
      localStorage.setItem('flashsrs_custom_presets', JSON.stringify(customPresets));
    } catch (e) {}
    if (settings) {
      settings.presets = customPresets;
      syncSettingsWithServer();
    }
  }

  function getAllPresets() {
    return [...DEFAULT_PRESETS, ...customPresets];
  }

  function populatePresetDropdown() {
    if (!els.presetFilter) return;
    const presets = getAllPresets();

    let html = `<option value="all" ${activePresetId === 'all' ? 'selected' : ''}>⚡ All Collections (${allSortedCategories.length})</option>`;

    presets.forEach(p => {
      const available = p.categories.filter(c => allSortedCategories.includes(c));
      const prefix = p.isDefault ? '⚡ ' : '⭐ ';
      const isSelected = activePresetId === p.id ? 'selected' : '';
      html += `<option value="${p.id}" ${isSelected}>${prefix}${escapeHtml(p.name)} (${available.length})</option>`;
    });

    if (activePresetId === 'custom_adhoc') {
      html += `<option value="custom_adhoc" selected>📂 Custom Filter (${selectedCategories.size})</option>`;
    }

    html += `<option value="__open_modal__">➕ Create / Manage Presets...</option>`;
    els.presetFilter.innerHTML = html;
  }

  function applyPreset(presetId) {
    if (presetId === 'all') {
      selectedCategories.clear();
      activePresetId = 'all';
    } else {
      const preset = getAllPresets().find(p => p.id === presetId);
      if (preset) {
        const available = preset.categories.filter(c => allSortedCategories.includes(c));
        selectedCategories = new Set(available);
        activePresetId = preset.id;
      }
    }
    updateCategoryPickerUI();
    applyFilters();
    populatePresetDropdown();
  }

  function updateCategoryPickerUI() {
    const totalCats = allSortedCategories.length;
    const isAll = selectedCategories.size === 0 || selectedCategories.has('all') || (totalCats > 0 && selectedCategories.size === totalCats);

    if (els.catFilterCountBadge) {
      els.catFilterCountBadge.textContent = isAll ? totalCats : selectedCategories.size;
    }

    if (isAll) {
      if (els.btnOpenCategoryModal) els.btnOpenCategoryModal.classList.remove('is-filtered');
      if (els.activeCategoryChip) els.activeCategoryChip.classList.remove('visible');
      if (els.categoryFilter) els.categoryFilter.value = 'all';
    } else if (selectedCategories.size === 1) {
      const cat = Array.from(selectedCategories)[0];
      const count = allCards.filter(c => c.category === cat).length;
      if (els.btnOpenCategoryModal) els.btnOpenCategoryModal.classList.add('is-filtered');
      if (els.activeCategoryChip) {
        els.activeCategoryChipText.textContent = `${cat} (${count})`;
        els.activeCategoryChip.classList.add('visible');
      }
      if (els.categoryFilter) els.categoryFilter.value = cat;
    } else {
      let count = 0;
      allCards.forEach(c => {
        if (selectedCategories.has(c.category)) count++;
      });
      if (els.btnOpenCategoryModal) els.btnOpenCategoryModal.classList.add('is-filtered');
      if (els.activeCategoryChip) {
        const p = getAllPresets().find(x => x.id === activePresetId);
        const label = p ? p.name : `${selectedCategories.size} Collections`;
        els.activeCategoryChipText.textContent = `${label} (${count})`;
        els.activeCategoryChip.classList.add('visible');
      }
      if (els.categoryFilter) els.categoryFilter.value = 'all';
    }
  }

  // --- COLLECTIONS & PRESETS MODAL ---
  function openCategoryModal() {
    if (!els.categoryModal) return;
    els.categoryModal.classList.add('open');

    try {
      if (!allSortedCategories || allSortedCategories.length === 0) {
        populateCategoryDropdown();
      }
      modalSelectedCategories = new Set(selectedCategories.size === 0 ? allSortedCategories : selectedCategories);
      modalActivePresetId = activePresetId;
      if (els.catModalSearch) els.catModalSearch.value = '';
      if (els.catModalSearchClear) els.catModalSearchClear.style.display = 'none';
      toggleInlinePresetCreator(false);

      renderSidebarPresets();
      renderModalCollectionsList('');
      updateModalSummary();
    } catch (err) {
      console.error('Error rendering category modal content:', err);
    }

    if (els.catModalSearch) {
      setTimeout(() => {
        try { els.catModalSearch.focus(); } catch (e) {}
      }, 80);
    }
  }

  function closeCategoryModal() {
    if (els.categoryModal) {
      els.categoryModal.classList.remove('open');
    }
    toggleInlinePresetCreator(false);
  }

  function toggleInlinePresetCreator(show) {
    if (!els.inlinePresetCreator) return;
    const isVisible = show !== undefined ? show : !els.inlinePresetCreator.classList.contains('visible');
    if (isVisible) {
      els.inlinePresetCreator.classList.add('visible');
      if (els.newPresetNameInput) {
        els.newPresetNameInput.value = '';
        els.newPresetNameInput.focus();
      }
    } else {
      els.inlinePresetCreator.classList.remove('visible');
    }
  }

  function updateModalPresetMatch() {
    const totalCats = allSortedCategories.length;
    if (modalSelectedCategories.size === 0 || modalSelectedCategories.size === totalCats) {
      modalActivePresetId = 'all';
    } else {
      const match = getAllPresets().find(p => {
        const avail = p.categories.filter(c => allSortedCategories.includes(c));
        return avail.length === modalSelectedCategories.size && avail.every(c => modalSelectedCategories.has(c));
      });
      modalActivePresetId = match ? match.id : 'custom_adhoc';
    }
  }

  function renderSidebarPresets() {
    if (!els.catPresetsList) return;
    const presets = getAllPresets();
    const totalCats = allSortedCategories.length;
    const isAll = (modalSelectedCategories.size === totalCats) || (modalSelectedCategories.size === 0);

    let html = '';

    // "All Collections" option
    const isAllActive = (modalActivePresetId === 'all') || isAll;
    html += `
      <div class="preset-nav-item ${isAllActive ? 'active' : ''}" data-preset-id="all" title="Select all ${totalCats} collections">
        <div class="preset-nav-left">
          <span>⚡</span>
          <span class="preset-nav-name">All Collections</span>
        </div>
        <div class="preset-nav-right">
          <span class="cat-badge-count">${totalCats}</span>
        </div>
      </div>
    `;

    // Presets
    presets.forEach(p => {
      if (!p) return;
      const pCats = Array.isArray(p.categories) ? p.categories : [];
      const avail = pCats.filter(c => allSortedCategories.includes(c));
      const isMatch = avail.length > 0 &&
                      avail.length === modalSelectedCategories.size &&
                      avail.every(c => modalSelectedCategories.has(c));
      const isActive = (modalActivePresetId === p.id) || isMatch;

      const icon = p.isDefault ? '⚡' : '⭐';
      const deleteBtn = !p.isDefault
        ? `<button type="button" class="btn-delete-preset-row" data-delete-preset-id="${p.id}" title="Delete custom preset">&times;</button>`
        : '';

      html += `
        <div class="preset-nav-item ${isActive ? 'active' : ''}" data-preset-id="${p.id}" title="${escapeHtml(p.name)} (${avail.length} topics)">
          <div class="preset-nav-left">
            <span>${icon}</span>
            <span class="preset-nav-name">${escapeHtml(p.name)}</span>
          </div>
          <div class="preset-nav-right">
            <span class="cat-badge-count">${avail.length}</span>
            ${deleteBtn}
          </div>
        </div>
      `;
    });

    els.catPresetsList.innerHTML = html;

    // Preset selection clicks
    els.catPresetsList.querySelectorAll('.preset-nav-item[data-preset-id]').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete-preset-row')) return;

        const pid = item.dataset.presetId;
        if (pid === 'all') {
          modalSelectedCategories = new Set(allSortedCategories);
          modalActivePresetId = 'all';
        } else {
          const p = getAllPresets().find(x => x.id === pid);
          if (p) {
            const avail = p.categories.filter(c => allSortedCategories.includes(c));
            modalSelectedCategories = new Set(avail);
            modalActivePresetId = p.id;
          }
        }
        renderSidebarPresets();
        renderModalCollectionsList(els.catModalSearch ? els.catModalSearch.value : '');
        updateModalSummary();
      });
    });

    // Delete preset buttons
    els.catPresetsList.querySelectorAll('[data-delete-preset-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.dataset.deletePresetId;
        const p = customPresets.find(x => x.id === pid);
        if (p && confirm(`Delete custom preset "${p.name}"?`)) {
          customPresets = customPresets.filter(x => x.id !== pid);
          saveCustomPresets();
          if (activePresetId === pid) {
            activePresetId = 'all';
            selectedCategories.clear();
            applyFilters();
          }
          if (modalActivePresetId === pid) {
            modalActivePresetId = 'all';
          }
          renderSidebarPresets();
          updateCategoryPickerUI();
          populatePresetDropdown();
          showToast(`Deleted preset.`);
        }
      });
    });
  }

  function confirmSavePreset() {
    if (!els.newPresetNameInput) return;
    const name = (els.newPresetNameInput.value || '').trim();
    if (!name) {
      showToast('⚠️ Please enter a preset name');
      els.newPresetNameInput.focus();
      return;
    }
    const categories = Array.from(modalSelectedCategories);
    if (categories.length === 0) {
      showToast('⚠️ Please select at least one collection for this preset');
      return;
    }

    const newPreset = {
      id: 'custom_' + Date.now(),
      name,
      isDefault: false,
      categories
    };

    customPresets.push(newPreset);
    saveCustomPresets();
    modalActivePresetId = newPreset.id;

    toggleInlinePresetCreator(false);
    renderSidebarPresets();
    populatePresetDropdown();
    showToast(`✓ Saved preset "${name}" with ${categories.length} collections!`);
  }

  function updateModalSummary() {
    const totalCats = allSortedCategories.length;
    const selCount = modalSelectedCategories.size;
    if (els.catSummaryCount) els.catSummaryCount.textContent = selCount;
    if (els.catSummaryTotal) els.catSummaryTotal.textContent = totalCats;

    let cardCount = 0;
    allCards.forEach(c => {
      if (modalSelectedCategories.has(c.category)) cardCount++;
    });
    if (els.catSummaryCards) els.catSummaryCards.textContent = cardCount.toLocaleString();
  }

  function renderModalCollectionsList(query = '') {
    if (!els.catModalCollectionsList) return;
    const now = new Date();
    const q = (query || '').toLowerCase().trim();

    const catStats = {};
    allCards.forEach(c => {
      const cat = c.category || 'General';
      if (!catStats[cat]) catStats[cat] = { total: 0, due: 0 };
      catStats[cat].total++;
      if (!c.due_date || new Date(c.due_date) <= now) {
        catStats[cat].due++;
      }
    });

    const matching = allSortedCategories.filter(cat => {
      if (!q) return true;
      return cat.toLowerCase().includes(q);
    });

    els.catModalCollectionsList.innerHTML = '';
    if (matching.length === 0) {
      els.catModalCollectionsList.innerHTML = `<div class="cat-empty-search">No collections match "${escapeHtml(query)}"</div>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    matching.forEach(cat => {
      const isSelected = modalSelectedCategories.has(cat);
      const stats = catStats[cat] || { total: 0, due: 0 };

      const item = document.createElement('div');
      item.className = 'cat-item-card' + (isSelected ? ' selected' : '');

      const dueHtml = stats.due > 0 ? `<span class="cat-badge-due">🔥 ${stats.due} due</span>` : '';

      item.innerHTML = `
        <div class="cat-item-card-left">
          <input type="checkbox" ${isSelected ? 'checked' : ''} />
          <span class="cat-item-card-name" title="${escapeHtml(cat)}">${highlightMatch(cat, q)}</span>
        </div>
        <div class="cat-item-card-right">
          <span class="cat-badge-count">${stats.total}</span>
          ${dueHtml}
          <button type="button" class="cat-btn-only" title="Select only this collection">Only</button>
        </div>
      `;

      const cb = item.querySelector('input[type="checkbox"]');

      const toggleCategory = () => {
        if (modalSelectedCategories.has(cat)) {
          modalSelectedCategories.delete(cat);
          cb.checked = false;
          item.classList.remove('selected');
        } else {
          modalSelectedCategories.add(cat);
          cb.checked = true;
          item.classList.add('selected');
        }
        updateModalPresetMatch();
        renderSidebarPresets();
        updateModalSummary();
      };

      // Checkbox click
      cb.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCategory();
      });

      // "Only" click
      const onlyBtn = item.querySelector('.cat-btn-only');
      onlyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modalSelectedCategories = new Set([cat]);
        modalActivePresetId = 'custom_adhoc';
        renderSidebarPresets();
        renderModalCollectionsList(els.catModalSearch ? els.catModalSearch.value : '');
        updateModalSummary();
      });

      // Row click
      item.addEventListener('click', () => {
        toggleCategory();
      });

      fragment.appendChild(item);
    });

    els.catModalCollectionsList.appendChild(fragment);
  }

  function applyCategoryModalSelection() {
    if (modalSelectedCategories.size === 0 || modalSelectedCategories.size === allSortedCategories.length) {
      selectedCategories.clear();
      activePresetId = 'all';
    } else {
      selectedCategories = new Set(modalSelectedCategories);
      activePresetId = modalActivePresetId;
    }

    updateCategoryPickerUI();
    applyFilters();
    populatePresetDropdown();
    closeCategoryModal();
    const count = selectedCategories.size === 0 ? `All (${allSortedCategories.length})` : `${selectedCategories.size} collections`;
    showToast(`✓ Filter applied: ${count}`);
  }

  function populateCategoryDropdown() {
    loadCustomPresets();
    const categories = new Set();
    allCards.forEach(c => {
      if (c.category) categories.add(c.category);
    });
    allSortedCategories = Array.from(categories).sort();

    // Populate native select fallback
    if (els.categoryFilter) {
      els.categoryFilter.innerHTML = `<option value="all">All Categories (${allSortedCategories.length} topics)</option>`;
      allSortedCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        els.categoryFilter.appendChild(opt);
      });
    }

    populatePresetDropdown();
    updateCategoryPickerUI();
  }

  // --- FILTERING & QUEUE ---
  function applyFilters() {
    const now = new Date();
    const searchLow = activeFilters.search.toLowerCase().trim();

    filteredCards = allCards.filter(c => {
      // Category filter: supports multi-category, single category, or all
      if (selectedCategories.size > 0 && !selectedCategories.has('all')) {
        if (!selectedCategories.has(c.category)) {
          return false;
        }
      } else if (activeFilters.category !== 'all') {
        if (c.category !== activeFilters.category) {
          return false;
        }
      }
      // Level filter
      if (activeFilters.level !== 'all' && c.level.toLowerCase() !== activeFilters.level.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchLow) {
        const qMatch = (c.question || '').toLowerCase().includes(searchLow);
        const aMatch = (c.answer || '').toLowerCase().includes(searchLow);
        if (!qMatch && !aMatch) return false;
      }
      // Mode filter
      if (activeFilters.mode === 'due') {
        if (!c.due_date) return true;
        return new Date(c.due_date) <= now;
      }
      if (activeFilters.mode === 'hard') {
        return c.last_rating === 'difficult' || c.last_rating === 'hard';
      }
      return true; // 'all'
    });

    // Sort: Due first, then new
    filteredCards.sort((a, b) => {
      const da = a.due_date ? new Date(a.due_date).getTime() : 0;
      const db = b.due_date ? new Date(b.due_date).getTime() : 0;
      return da - db;
    });

    currentIndex = 0;
    renderCurrentCard();
    updateFilterStats();
  }

  function updateOverallStats() {
    const now = new Date();
    let dueCount = 0;
    let learningCount = 0;
    let masteredCount = 0;

    allCards.forEach(c => {
      const reps = parseInt(c.reps) || 0;
      const isDue = !c.due_date || new Date(c.due_date) <= now;
      if (isDue) dueCount++;
      if (reps > 0 && reps < 3) learningCount++;
      if (reps >= 3) masteredCount++;
    });

    els.statDue.textContent = dueCount;
    els.statLearning.textContent = learningCount;
    els.statMastered.textContent = masteredCount;
    els.statTotal.textContent = allCards.length;
  }

  function updateFilterStats() {
    updateOverallStats();
  }

  function getCurrentCard() {
    if (filteredCards.length === 0 || currentIndex >= filteredCards.length) return null;
    return filteredCards[currentIndex];
  }

  // --- RENDERING CARD ---
  function renderCurrentCard() {
    const card = getCurrentCard();
    hideAnswer();

    if (!card) {
      els.flashcardContainer.style.display = 'none';
      els.emptyState.classList.add('visible');
      return;
    }

    els.flashcardContainer.style.display = 'flex';
    els.emptyState.classList.remove('visible');

    // Badges & Meta
    els.badgeCategory.textContent = card.category || 'General';
    els.badgeLevel.textContent = card.level || 'Beginner';
    els.badgeLevel.className = `badge badge-${(card.level || 'beginner').toLowerCase()}`;

    els.cardCounter.textContent = `Card ${currentIndex + 1} of ${filteredCards.length}`;

    const reps = parseInt(card.reps) || 0;
    const intervalMins = parseFloat(card.interval_mins) || 0;
    let metaText = reps === 0 ? 'New Card' : `Reviewed ${reps} time${reps > 1 ? 's' : ''}`;
    if (intervalMins > 0) metaText += ` · Current Interval: ${formatMinutes(intervalMins)}`;
    if (card.last_rating) metaText += ` · Last: ${card.last_rating.toUpperCase()}`;
    els.cardIntervalMeta.textContent = metaText;

    // Question
    els.questionText.innerHTML = formatMarkdown(card.question);

    // Answer (Prepared)
    els.answerText.innerHTML = formatMarkdown(card.answer);

    updateIntervalBadges();
  }

  function revealAnswer() {
    if (isAnswerRevealed) return;
    isAnswerRevealed = true;
    els.revealContainer.style.display = 'none';
    els.answerSection.classList.add('revealed');
  }

  function hideAnswer() {
    isAnswerRevealed = false;
    els.revealContainer.style.display = 'flex';
    els.answerSection.classList.remove('revealed');
  }

  // --- RATING & RESCHEDULING ---
  async function rateCard(rating) {
    const card = getCurrentCard();
    if (!card) return;

    const scheduledMins = getScheduledIntervalMins(card, rating);
    const now = new Date();
    const nextDue = new Date(now.getTime() + scheduledMins * 60 * 1000);

    const oldReps = parseInt(card.reps) || 0;
    let newReps = oldReps;
    let ease = parseFloat(card.ease_factor) || 2.5;

    if (rating === 'difficult') {
      newReps = 0;
      ease = Math.max(1.3, ease - 0.2);
    } else if (rating === 'hard') {
      newReps = Math.max(1, oldReps);
      ease = Math.max(1.3, ease - 0.15);
    } else if (rating === 'good') {
      newReps = oldReps + 1;
    } else if (rating === 'easy') {
      newReps = oldReps + 1;
      ease = Math.min(3.0, ease + 0.15);
    }

    const newState = newReps >= 3 ? 'mastered' : (newReps > 0 ? 'learning' : 'review');

    // Update in-memory
    card.reps = newReps;
    card.interval_mins = scheduledMins;
    card.ease_factor = Math.round(ease * 100) / 100;
    card.due_date = nextDue.toISOString();
    card.last_reviewed = now.toISOString();
    card.last_rating = rating;
    card.state = newState;

    // Send review to server
    if (isServerConnected) {
      try {
        await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: card.id,
            reps: card.reps,
            interval_mins: card.interval_mins,
            ease_factor: card.ease_factor,
            due_date: card.due_date,
            last_reviewed: card.last_reviewed,
            last_rating: card.last_rating,
            state: card.state
          })
        });
      } catch (err) {
        console.error('Error saving review to server:', err);
      }
    }

    // Always update local device storage for cloud/offline resilience
    saveLocalProgress(card);

    showToast(`Marked ${rating.toUpperCase()} · Rescheduled for +${formatMinutes(scheduledMins)}`);

    // Advance queue
    if (activeFilters.mode === 'due') {
      // Remove reviewed card from due queue
      filteredCards.splice(currentIndex, 1);
      // Stay on same index (which is now the next card)
    } else {
      currentIndex++;
    }

    renderCurrentCard();
    updateFilterStats();
  }

  // --- MODAL CONTROLS ---
  function openExplanationModal() {
    const card = getCurrentCard();
    if (!card) return;

    els.modalQuestion.textContent = card.question;
    els.modalExplanation.innerHTML = formatMarkdown(card.explanation);
    els.modalOverlay.classList.add('open');
  }

  function closeExplanationModal() {
    els.modalOverlay.classList.remove('open');
  }

  // --- AI CHAT & OPENROUTER MULTI-KEY MANAGEMENT ---

  async function loadOpenRouterKeys() {
    openRouterKeys = [];

    // 1. Fetch from server's openrouter_keys.txt if connected
    if (isServerConnected) {
      try {
        const res = await fetch('/api/keys');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.keys) && data.keys.length > 0) {
            openRouterKeys = data.keys.map(k => (k || '').trim()).filter(Boolean);
            try {
              localStorage.setItem('flashsrs_openrouter_keys', JSON.stringify(openRouterKeys));
            } catch (e) {}
            currentKeyIndex = 0;
            updateKeyManagerUI();
            updateCreateCardKeyPill();
            return;
          }
        }
      } catch (e) {
        console.warn('Could not read keys from /api/keys:', e);
      }
    }

    // 2. Fallback to localStorage
    try {
      const stored = localStorage.getItem('flashsrs_openrouter_keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          openRouterKeys = parsed.map(k => (k || '').trim()).filter(Boolean);
        }
      } else {
        const single = localStorage.getItem('flashsrs_openrouter_api_key') || localStorage.getItem('openrouter_api_key');
        if (single && single.trim()) {
          openRouterKeys = [single.trim()];
        }
      }
    } catch (e) {
      console.warn('Failed to parse openrouter keys from localStorage', e);
    }

    // 3. Fallback to settings.json
    if (openRouterKeys.length === 0 && settings.openrouter_keys && Array.isArray(settings.openrouter_keys)) {
      openRouterKeys = settings.openrouter_keys.map(k => (k || '').trim()).filter(Boolean);
    } else if (openRouterKeys.length === 0 && settings.openrouter_api_key) {
      openRouterKeys = [settings.openrouter_api_key.trim()];
    }

    currentKeyIndex = 0;
    updateKeyManagerUI();
    updateCreateCardKeyPill();
  }

  async function saveOpenRouterKeys(keysArray) {
    const cleanKeys = Array.from(new Set(keysArray.map(k => (k || '').trim()).filter(Boolean)));
    openRouterKeys = cleanKeys;
    currentKeyIndex = 0;

    // 1. Save to localStorage
    try {
      localStorage.setItem('flashsrs_openrouter_keys', JSON.stringify(cleanKeys));
      if (cleanKeys.length > 0) {
        localStorage.setItem('flashsrs_openrouter_api_key', cleanKeys[0]);
      } else {
        localStorage.removeItem('flashsrs_openrouter_api_key');
      }
    } catch (e) {}

    // 2. Save directly to local file openrouter_keys.txt via server
    if (isServerConnected) {
      try {
        await fetch('/api/keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keys: cleanKeys })
        });
      } catch (e) {
        console.warn('Failed saving keys to /api/keys:', e);
      }
    }

    settings.openrouter_keys = cleanKeys;
    syncSettingsWithServer().catch(() => {});

    updateKeyManagerUI();
    updateCreateCardKeyPill();
  }

  function maskKey(key) {
    if (!key) return '';
    if (key.length <= 12) return key.slice(0, 4) + '...';
    return key.slice(0, 8) + '...' + key.slice(-4);
  }

  function getCurrentActiveKey() {
    if (openRouterKeys.length === 0) return null;
    return openRouterKeys[currentKeyIndex % openRouterKeys.length];
  }

  function rotateToNextKey(reason = 'rate_limited') {
    if (openRouterKeys.length === 0) return false;
    const oldKey = getCurrentActiveKey();
    if (oldKey) {
      keyCooldowns[oldKey] = Date.now() + 60000;
    }

    if (openRouterKeys.length === 1) {
      updateKeyManagerUI();
      return false;
    }

    currentKeyIndex = (currentKeyIndex + 1) % openRouterKeys.length;
    updateKeyManagerUI();
    return true;
  }

  function updateKeyManagerUI() {
    if (!els.aiActiveKeyPill || !els.aiKeysSummary) return;

    const count = openRouterKeys.length;
    if (count === 0) {
      els.aiActiveKeyPill.textContent = '⚠️ No API Key';
      els.aiActiveKeyPill.className = 'ai-key-pill danger';
      els.aiActiveKeyPill.title = 'Click to configure your OpenRouter API Key';
      els.aiKeysSummary.textContent = 'No keys configured. Please add an OpenRouter API key.';
      if (els.aiInputStatusNote) els.aiInputStatusNote.textContent = 'API key required';
    } else {
      const activeIdx = currentKeyIndex % count;
      const activeKey = openRouterKeys[activeIdx];
      const isCooldown = keyCooldowns[activeKey] && keyCooldowns[activeKey] > Date.now();

      els.aiActiveKeyPill.textContent = `🔑 Key ${activeIdx + 1}/${count}: ${maskKey(activeKey)}`;
      els.aiActiveKeyPill.className = `ai-key-pill ${isCooldown ? 'warning' : ''}`;
      els.aiActiveKeyPill.title = `Currently active key: ${maskKey(activeKey)} (Click to manage keys)`;
      els.aiKeysSummary.textContent = `${count} key${count > 1 ? 's' : ''} configured · Active: Key #${activeIdx + 1}`;
      if (els.aiInputStatusNote) els.aiInputStatusNote.textContent = `${count} key${count > 1 ? 's' : ''} available`;
    }

    if (els.aiKeysInput && document.activeElement !== els.aiKeysInput) {
      els.aiKeysInput.value = openRouterKeys.join('\n');
    }

    if (els.aiKeysListPreview) {
      els.aiKeysListPreview.innerHTML = '';
      openRouterKeys.forEach((k, idx) => {
        const pill = document.createElement('span');
        const isActive = idx === (currentKeyIndex % count);
        const isCooldown = keyCooldowns[k] && keyCooldowns[k] > Date.now();
        let statusClass = 'key-preview-pill';
        if (isActive) statusClass += ' active';
        if (isCooldown) statusClass += ' rate-limited';

        pill.className = statusClass;
        pill.innerHTML = `<span>#${idx + 1} ${maskKey(k)}</span> ${isActive ? '<span style="color:#10b981;font-weight:bold;">● Active</span>' : ''} ${isCooldown ? '<span style="color:#f59e0b;">⏳ 429 Cooldown</span>' : ''}`;
        pill.style.cursor = 'pointer';
        pill.title = 'Click to activate this key directly';
        pill.addEventListener('click', () => {
          currentKeyIndex = idx;
          updateKeyManagerUI();
          showToast(`Switched active key to #${idx + 1}`);
        });
        els.aiKeysListPreview.appendChild(pill);
      });
    }
  }

  function buildCardSystemPrompt(card) {
    const category = card.category || 'General';
    const level = card.level || 'Standard';
    const question = card.question || '';
    const answer = card.answer || '';
    const explanation = card.explanation || '';

    return `You are an expert technical interview tutor and staff software engineering mentor.
You are assisting a developer preparing for software engineering interviews.
Here is the full context of the interview flashcard currently being studied:

Collection / Category: ${category}
Difficulty Level: ${level}

Question:
${question}

Interview Answer:
${answer}

Deep Explanation:
${explanation}

Instructions for your responses:
1. Provide accurate, encouraging, and clear pedagogical explanations.
2. If the user asks for a hint or asks a clarifying question before seeing the full answer, guide them incrementally with thoughtful hints without spoiling the full solution immediately.
3. If the user asks for code examples, edge cases, trade-offs, or real-world system designs, provide production-grade, idiomatic code and thorough analysis.
4. Format all responses using clean GitHub-flavored Markdown:
   - Use triple-backtick fenced code blocks with the language identifier (e.g. \`\`\`javascript, \`\`\`python, \`\`\`sql).
   - Use bold for emphasis and bullet points for lists.
   - Keep answers structured and readable.`;
  }

  function openAiChatModal() {
    const card = getCurrentCard();
    if (!card) {
      showToast('No card available to chat about');
      return;
    }

    const cleanQ = (card.question || '').replace(/\s+/g, ' ').trim();
    if (els.aiCardTitleSubtitle) {
      els.aiCardTitleSubtitle.textContent = `${card.category || 'General'} · "${cleanQ.slice(0, 65)}${cleanQ.length > 65 ? '...' : ''}"`;
    }

    if (els.aiContextQ) els.aiContextQ.innerHTML = formatMarkdown(card.question || '(No question text)');
    if (els.aiContextA) els.aiContextA.innerHTML = formatMarkdown(card.answer || '(No answer text)');
    if (els.aiContextE) els.aiContextE.innerHTML = formatMarkdown(card.explanation || '(No explanation text)');

    renderChatHistory(card.id);
    updateKeyManagerUI();

    if (openRouterKeys.length === 0) {
      if (els.aiKeyManagerPanel) els.aiKeyManagerPanel.style.display = 'flex';
      setTimeout(() => { if (els.aiKeysInput) els.aiKeysInput.focus(); }, 120);
    } else {
      if (els.aiKeyManagerPanel) els.aiKeyManagerPanel.style.display = 'none';
      setTimeout(() => { if (els.aiChatInput) els.aiChatInput.focus(); }, 120);
    }

    hideRotationNotice();
    if (els.aiChatModal) els.aiChatModal.classList.add('open');
  }

  function closeAiChatModal() {
    if (els.aiChatModal) els.aiChatModal.classList.remove('open');
    hideRotationNotice();
  }

  function renderChatHistory(cardId) {
    if (!els.aiChatMessages) return;
    els.aiChatMessages.innerHTML = '';
    const history = cardChatHistories[cardId] || [];

    if (history.length === 0) {
      const greeting = document.createElement('div');
      greeting.className = 'ai-message assistant';
      greeting.innerHTML = `
        <div class="ai-msg-avatar">🤖</div>
        <div class="ai-msg-body">
          <p>Hello! I'm your <strong>AI Interview Tutor</strong> for this question.</p>
          <p style="margin-top:0.4rem; color:var(--text-secondary);">
            Ask me anything: request a conceptual hint, real-world code examples, edge cases, time/space complexity analysis, or potential interviewer follow-up questions.
          </p>
        </div>
      `;
      els.aiChatMessages.appendChild(greeting);
      if (els.aiPromptChips) els.aiPromptChips.style.display = 'flex';
    } else {
      if (els.aiPromptChips) els.aiPromptChips.style.display = 'none';
      for (const msg of history) {
        appendMessageBubble(msg.role, msg.content, false);
      }
    }

    els.aiChatMessages.scrollTop = els.aiChatMessages.scrollHeight;
  }

  function appendMessageBubble(role, content, shouldScroll = true) {
    if (!els.aiChatMessages) return;
    const msgEl = document.createElement('div');
    msgEl.className = `ai-message ${role}`;

    const avatar = role === 'user' ? '👤' : '🤖';
    const formattedBody = role === 'assistant' ? formatMarkdown(content) : escapeHtml(content).replace(/\n/g, '<br>');

    msgEl.innerHTML = `
      <div class="ai-msg-avatar">${avatar}</div>
      <div class="ai-msg-body">${formattedBody}</div>
    `;

    els.aiChatMessages.appendChild(msgEl);
    if (shouldScroll) {
      els.aiChatMessages.scrollTop = els.aiChatMessages.scrollHeight;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  let typingIndicatorEl = null;

  function showTypingIndicator() {
    if (typingIndicatorEl || !els.aiChatMessages) return;
    typingIndicatorEl = document.createElement('div');
    typingIndicatorEl.className = 'ai-message assistant';
    typingIndicatorEl.innerHTML = `
      <div class="ai-msg-avatar">🤖</div>
      <div class="ai-msg-body ai-typing-indicator">
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
      </div>
    `;
    els.aiChatMessages.appendChild(typingIndicatorEl);
    els.aiChatMessages.scrollTop = els.aiChatMessages.scrollHeight;
  }

  function hideTypingIndicator() {
    if (typingIndicatorEl && typingIndicatorEl.parentNode) {
      typingIndicatorEl.parentNode.removeChild(typingIndicatorEl);
    }
    typingIndicatorEl = null;
  }

  let rotationNoticeTimeout = null;

  function showRotationNotice(msg) {
    if (!els.aiRotationBanner) return;
    if (rotationNoticeTimeout) clearTimeout(rotationNoticeTimeout);
    els.aiRotationBanner.innerHTML = msg;
    els.aiRotationBanner.style.display = 'flex';

    rotationNoticeTimeout = setTimeout(() => {
      hideRotationNotice();
    }, 6000);
  }

  function hideRotationNotice() {
    if (!els.aiRotationBanner) return;
    els.aiRotationBanner.style.display = 'none';
    if (rotationNoticeTimeout) {
      clearTimeout(rotationNoticeTimeout);
      rotationNoticeTimeout = null;
    }
  }

  async function callOpenRouterApi(messages, onRotationNotice = null) {
    if (openRouterKeys.length === 0) {
      throw new Error('No OpenRouter API key configured. Please configure an API key in the Keys Manager.');
    }

    let attempts = 0;
    const maxAttempts = Math.max(1, openRouterKeys.length);
    let lastErrorMessage = '';

    while (attempts < maxAttempts) {
      const currentKey = getCurrentActiveKey();

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin || 'http://localhost:3000',
            'X-Title': 'FlashSRS'
          },
          body: JSON.stringify({
            model: 'openrouter/free',
            messages: messages
          })
        });

        if (response.status === 429) {
          const oldIndex = currentKeyIndex;
          const rotated = rotateToNextKey('rate_limited');

          if (rotated && attempts < maxAttempts - 1) {
            const notice = `⚠️ Key #${oldIndex + 1} (${maskKey(currentKey)}) hit rate limit (HTTP 429). Rotated to Key #${currentKeyIndex + 1}. Retrying...`;
            if (onRotationNotice) onRotationNotice(notice);
            attempts++;
            continue;
          } else {
            throw new Error(`OpenRouter rate limit reached (HTTP 429). All ${openRouterKeys.length} configured keys are currently rate-limited. Please wait ~60s or configure additional keys.`);
          }
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;

          const lowerMsg = errMsg.toLowerCase();
          if (lowerMsg.includes('rate limit') || lowerMsg.includes('quota') || response.status === 402) {
            const oldIndex = currentKeyIndex;
            const rotated = rotateToNextKey('rate_limited');
            if (rotated && attempts < maxAttempts - 1) {
              const notice = `⚠️ Key #${oldIndex + 1} quota/rate limit error. Rotating to Key #${currentKeyIndex + 1}...`;
              if (onRotationNotice) onRotationNotice(notice);
              attempts++;
              continue;
            }
          }

          throw new Error(errMsg);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
          throw new Error('Received empty response from OpenRouter.');
        }

        return reply;

      } catch (err) {
        lastErrorMessage = err.message || 'Unknown network error';
        if (attempts < maxAttempts - 1) {
          rotateToNextKey('error');
          attempts++;
        } else {
          throw new Error(lastErrorMessage);
        }
      }
    }

    throw new Error(lastErrorMessage || 'Failed to communicate with OpenRouter');
  }

  async function sendAiChatMessage(customText = null) {
    const rawText = customText !== null ? customText : (els.aiChatInput ? els.aiChatInput.value : '');
    const text = (rawText || '').trim();

    if (!text || isAiRequestPending) return;

    if (openRouterKeys.length === 0) {
      if (els.aiKeyManagerPanel) els.aiKeyManagerPanel.style.display = 'flex';
      if (els.aiKeysInput) els.aiKeysInput.focus();
      showToast('Please enter at least one OpenRouter API key first');
      return;
    }

    const card = getCurrentCard();
    if (!card) {
      showToast('No active card selected');
      return;
    }

    if (customText === null && els.aiChatInput) {
      els.aiChatInput.value = '';
      els.aiChatInput.style.height = 'auto';
    }
    if (els.aiPromptChips) els.aiPromptChips.style.display = 'none';

    if (!cardChatHistories[card.id]) {
      cardChatHistories[card.id] = [];
    }

    cardChatHistories[card.id].push({
      role: 'user',
      content: text,
      timestamp: Date.now()
    });
    appendMessageBubble('user', text);

    isAiRequestPending = true;
    if (els.btnAiSend) els.btnAiSend.disabled = true;
    if (els.aiChatInput) els.aiChatInput.disabled = true;
    showTypingIndicator();

    const systemPrompt = buildCardSystemPrompt(card);
    const systemMessage = { role: 'system', content: systemPrompt };
    const historyTurns = cardChatHistories[card.id].map(m => ({ role: m.role, content: m.content }));
    const payloadMessages = [systemMessage, ...historyTurns];

    try {
      const reply = await callOpenRouterApi(payloadMessages, (notice) => {
        showRotationNotice(notice);
      });

      hideTypingIndicator();
      cardChatHistories[card.id].push({
        role: 'assistant',
        content: reply,
        timestamp: Date.now()
      });
      appendMessageBubble('assistant', reply);

    } catch (err) {
      hideTypingIndicator();
      appendMessageBubble('assistant', `⚠️ **Error communicating with OpenRouter:**\n\n${err.message}\n\n*Click **⚙️ Keys** above to verify or add OpenRouter API keys.*`);
    } finally {
      isAiRequestPending = false;
      if (els.btnAiSend) els.btnAiSend.disabled = false;
      if (els.aiChatInput) {
        els.aiChatInput.disabled = false;
        els.aiChatInput.focus();
      }
    }
  }

  // --- CREATE NEW CARD & AI GENERATION/REFINEMENT CONTROLLER ---

  let newlyCreatedCardId = null;

  function populateCollectionDatalist() {
    if (!els.collectionDatalist) return;
    els.collectionDatalist.innerHTML = '';
    allSortedCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      els.collectionDatalist.appendChild(opt);
    });
  }

  function updateCreateCardKeyPill() {
    if (!els.createCardKeyPill) return;
    const count = openRouterKeys.length;
    if (count === 0) {
      els.createCardKeyPill.textContent = '⚠️ No API Key';
      els.createCardKeyPill.className = 'ai-key-pill danger';
      els.createCardKeyPill.title = 'Click to configure your OpenRouter API Key';
    } else {
      const activeIdx = currentKeyIndex % count;
      els.createCardKeyPill.textContent = `🔑 Key ${activeIdx + 1}/${count}: ${maskKey(openRouterKeys[activeIdx])}`;
      els.createCardKeyPill.className = 'ai-key-pill';
      els.createCardKeyPill.title = `Active key: ${maskKey(openRouterKeys[activeIdx])}`;
    }
  }

  function openCreateCardModal(prefillCategory = null) {
    populateCollectionDatalist();
    updateCreateCardKeyPill();

    const currentCard = getCurrentCard();
    const defaultCat = prefillCategory || (currentCard ? currentCard.category : (allSortedCategories[0] || 'General'));
    if (els.createCardCategory) {
      els.createCardCategory.value = defaultCat;
    }

    if (els.createCardSuccessBanner) {
      els.createCardSuccessBanner.style.display = 'none';
    }
    if (els.createCardLoading) {
      els.createCardLoading.style.display = 'none';
    }

    // Reset preview states
    if (els.previewCardAnswer) els.previewCardAnswer.style.display = 'none';
    if (els.createCardAnswer) els.createCardAnswer.style.display = 'block';
    if (els.btnTogglePreviewAnswer) {
      els.btnTogglePreviewAnswer.textContent = '👁️ Preview';
      els.btnTogglePreviewAnswer.classList.remove('active');
    }

    if (els.previewCardExplanation) els.previewCardExplanation.style.display = 'none';
    if (els.createCardExplanation) els.createCardExplanation.style.display = 'block';
    if (els.btnTogglePreviewExplanation) {
      els.btnTogglePreviewExplanation.textContent = '👁️ Preview';
      els.btnTogglePreviewExplanation.classList.remove('active');
    }

    if (els.createCardModal) {
      els.createCardModal.classList.add('open');
    }

    setTimeout(() => {
      if (els.createCardQuestion) els.createCardQuestion.focus();
    }, 120);
  }

  function closeCreateCardModal() {
    if (els.createCardModal) {
      els.createCardModal.classList.remove('open');
    }
  }

  function updateCardPreviews() {
    if (els.previewCardAnswer && els.createCardAnswer) {
      els.previewCardAnswer.innerHTML = formatMarkdown(els.createCardAnswer.value || '*(No answer provided)*');
    }
    if (els.previewCardExplanation && els.createCardExplanation) {
      els.previewCardExplanation.innerHTML = formatMarkdown(els.createCardExplanation.value || '*(No deep explanation provided)*');
    }
  }

  function togglePreviewAnswer() {
    if (!els.createCardAnswer || !els.previewCardAnswer || !els.btnTogglePreviewAnswer) return;
    const isShowingPreview = els.previewCardAnswer.style.display !== 'none';
    if (isShowingPreview) {
      els.previewCardAnswer.style.display = 'none';
      els.createCardAnswer.style.display = 'block';
      els.btnTogglePreviewAnswer.textContent = '👁️ Preview';
      els.btnTogglePreviewAnswer.classList.remove('active');
      els.createCardAnswer.focus();
    } else {
      updateCardPreviews();
      els.createCardAnswer.style.display = 'none';
      els.previewCardAnswer.style.display = 'block';
      els.btnTogglePreviewAnswer.textContent = '✏️ Edit';
      els.btnTogglePreviewAnswer.classList.add('active');
    }
  }

  function togglePreviewExplanation() {
    if (!els.createCardExplanation || !els.previewCardExplanation || !els.btnTogglePreviewExplanation) return;
    const isShowingPreview = els.previewCardExplanation.style.display !== 'none';
    if (isShowingPreview) {
      els.previewCardExplanation.style.display = 'none';
      els.createCardExplanation.style.display = 'block';
      els.btnTogglePreviewExplanation.textContent = '👁️ Preview';
      els.btnTogglePreviewExplanation.classList.remove('active');
      els.createCardExplanation.focus();
    } else {
      updateCardPreviews();
      els.createCardExplanation.style.display = 'none';
      els.previewCardExplanation.style.display = 'block';
      els.btnTogglePreviewExplanation.textContent = '✏️ Edit';
      els.btnTogglePreviewExplanation.classList.add('active');
    }
  }

  function parseAiGeneratedCard(rawText) {
    let answer = '';
    let explanation = '';

    const trimmed = (rawText || '').trim();

    // Strategy 1: Check for JSON format
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.answer || parsed.explanation) {
          return {
            answer: (parsed.answer || '').trim(),
            explanation: (parsed.explanation || '').trim()
          };
        }
      } catch (e) {}
    }

    const jsonMatch = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.answer || parsed.explanation) {
          return {
            answer: (parsed.answer || '').trim(),
            explanation: (parsed.explanation || '').trim()
          };
        }
      } catch (e) {}
    }

    // Strategy 2: Look for Section Delimiters (### or ** markers)
    const ansMarkerRegex = /(?:###\s*|\*\*|#+\s*)Interview [Aa]nswer:?\*?\*?/i;
    const expMarkerRegex = /(?:###\s*|\*\*|#+\s*)(?:Deep |Long )?[Ee]xplanation:?\*?\*?/i;

    const hasAnsMarker = ansMarkerRegex.test(rawText);
    const hasExpMarker = expMarkerRegex.test(rawText);

    if (hasAnsMarker && hasExpMarker) {
      const ansMatch = rawText.match(ansMarkerRegex);
      const expMatch = rawText.match(expMarkerRegex);

      const ansIndex = ansMatch.index;
      const expIndex = expMatch.index;

      if (ansIndex < expIndex) {
        answer = rawText.slice(ansIndex + ansMatch[0].length, expIndex).trim();
        explanation = rawText.slice(expIndex + expMatch[0].length).trim();
      } else {
        explanation = rawText.slice(expIndex + expMatch[0].length, ansIndex).trim();
        answer = rawText.slice(ansIndex + ansMatch[0].length).trim();
      }
    } else if (hasAnsMarker) {
      const parts = rawText.split(ansMarkerRegex);
      answer = parts[1] ? parts[1].trim() : '';
      explanation = parts[0] ? parts[0].trim() : answer;
    } else if (hasExpMarker) {
      const parts = rawText.split(expMarkerRegex);
      answer = parts[0] ? parts[0].trim() : '';
      explanation = parts[1] ? parts[1].trim() : answer;
    } else {
      const paragraphs = rawText.split(/\r?\n\s*\r?\n/);
      if (paragraphs.length >= 2) {
        answer = paragraphs[0].trim();
        explanation = paragraphs.slice(1).join('\n\n').trim();
      } else {
        answer = rawText.trim();
        explanation = rawText.trim();
      }
    }

    return {
      answer: answer.replace(/^[:\-\s]+/, '').trim(),
      explanation: explanation.replace(/^[:\-\s]+/, '').trim()
    };
  }

  async function generateCardContentWithAi() {
    const question = (els.createCardQuestion.value || '').trim();
    if (!question) {
      showToast('Please enter an interview question first');
      els.createCardQuestion.focus();
      return;
    }

    const category = (els.createCardCategory.value || 'General').trim();
    const level = els.createCardLevel.value || 'Intermediate';

    if (openRouterKeys.length === 0) {
      openAiChatModal();
      showToast('Please configure at least one OpenRouter API key first');
      return;
    }

    els.btnAiGenerateCard.disabled = true;
    els.btnAiRefineCard.disabled = true;
    els.createCardLoadingText.textContent = `OpenRouter AI is generating answer & explanation for "${question.slice(0, 40)}..."`;
    els.createCardLoading.style.display = 'flex';
    if (els.createCardSuccessBanner) els.createCardSuccessBanner.style.display = 'none';

    const systemPrompt = `You are an expert technical interview coach and senior software architect.
Generate a concise, high-impact interview answer and a deep, comprehensive technical explanation for the provided question.

Collection / Category: ${category}
Target Level: ${level}

Question:
${question}

Instructions:
1. "Interview Answer": A direct, spoken-style verbal answer suitable for answering an interviewer out loud (typically 2-4 sentences or clear high-level bullet points).
2. "Deep Explanation": A deep, comprehensive explanation covering underlying mechanisms, code examples (with language tags in \`\`\` fenced blocks), edge cases, common pitfalls, and performance/trade-offs.

Format your response strictly as follows:
### Interview Answer
<concise verbal response>

### Deep Explanation
<comprehensive explanation with code snippets and trade-offs>`;

    try {
      const reply = await callOpenRouterApi([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please generate the Interview Answer and Deep Explanation for: "${question}"` }
      ], (notice) => {
        els.createCardLoadingText.textContent = notice;
      });

      const parsed = parseAiGeneratedCard(reply);
      els.createCardAnswer.value = parsed.answer;
      els.createCardExplanation.value = parsed.explanation;

      updateCardPreviews();
      showToast('✨ AI generated Answer & Deep Explanation!');

    } catch (err) {
      showToast(`AI Generation Error: ${err.message}`);
    } finally {
      els.btnAiGenerateCard.disabled = false;
      els.btnAiRefineCard.disabled = false;
      els.createCardLoading.style.display = 'none';
    }
  }

  async function refineCardContentWithAi(customInstruction = null) {
    const question = (els.createCardQuestion.value || '').trim();
    const currentAnswer = (els.createCardAnswer.value || '').trim();
    const currentExplanation = (els.createCardExplanation.value || '').trim();

    if (!question) {
      showToast('Please enter a question first');
      els.createCardQuestion.focus();
      return;
    }

    if (!currentAnswer && !currentExplanation) {
      showToast('Please provide an answer or click "⚡ Generate with AI" first');
      return;
    }

    const instruction = (customInstruction || (els.refinementInstructionInput ? els.refinementInstructionInput.value : '') || 'Improve clarity, accuracy, and technical depth').trim();
    const category = (els.createCardCategory.value || 'General').trim();
    const level = els.createCardLevel.value || 'Intermediate';

    els.btnAiGenerateCard.disabled = true;
    els.btnAiRefineCard.disabled = true;
    els.createCardLoadingText.textContent = `OpenRouter AI is refining card content (${instruction.slice(0, 40)}...)...`;
    els.createCardLoading.style.display = 'flex';
    if (els.createCardSuccessBanner) els.createCardSuccessBanner.style.display = 'none';

    const systemPrompt = `You are an expert technical interview coach.
The user wants to improve and refine the following interview flashcard content according to this instruction:
"${instruction}"

Category: ${category}
Level: ${level}
Question:
${question}

Current Interview Answer:
${currentAnswer}

Current Deep Explanation:
${currentExplanation}

Instructions:
1. Provide an improved, high-quality "Interview Answer" (concise verbal response).
2. Provide an improved, high-quality "Deep Explanation" (deep analysis with clean code examples where appropriate).
3. Strictly address the requested improvement: "${instruction}".

Format your response strictly as follows:
### Interview Answer
<improved concise verbal response>

### Deep Explanation
<improved comprehensive explanation with code snippets and trade-offs>`;

    try {
      const reply = await callOpenRouterApi([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please refine the flashcard according to this instruction: "${instruction}"` }
      ], (notice) => {
        els.createCardLoadingText.textContent = notice;
      });

      const parsed = parseAiGeneratedCard(reply);
      if (parsed.answer) els.createCardAnswer.value = parsed.answer;
      if (parsed.explanation) els.createCardExplanation.value = parsed.explanation;

      updateCardPreviews();
      showToast('✨ Card refined with AI!');
      if (els.refinementInstructionInput) els.refinementInstructionInput.value = '';

    } catch (err) {
      showToast(`Refinement Error: ${err.message}`);
    } finally {
      els.btnAiGenerateCard.disabled = false;
      els.btnAiRefineCard.disabled = false;
      els.createCardLoading.style.display = 'none';
    }
  }

  async function saveNewCard() {
    const question = (els.createCardQuestion.value || '').trim();
    const answer = (els.createCardAnswer.value || '').trim();
    const explanation = (els.createCardExplanation.value || '').trim() || answer;
    const category = (els.createCardCategory.value || 'General').trim() || 'General';
    const level = els.createCardLevel.value || 'Intermediate';

    if (!question) {
      showToast('Please enter a question');
      els.createCardQuestion.focus();
      return;
    }

    if (!answer) {
      showToast('Please provide an interview answer (or click "⚡ Generate with AI")');
      els.createCardAnswer.focus();
      return;
    }

    els.btnSaveNewCard.disabled = true;
    els.btnSaveNewCard.textContent = 'Saving...';

    const cardPayload = {
      category,
      level,
      question,
      answer,
      explanation
    };

    let savedCard = null;

    if (isServerConnected) {
      try {
        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardPayload)
        });

        if (res.ok) {
          const resData = await res.json();
          savedCard = resData.card;
        } else {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn('Failed saving to server, falling back to local save:', err);
      }
    }

    // Local / Offline fallback
    if (!savedCard) {
      let maxId = 0;
      allCards.forEach(c => {
        const cid = parseInt(c.id, 10);
        if (!isNaN(cid) && cid > maxId) maxId = cid;
      });

      const nowIso = new Date().toISOString();
      savedCard = {
        id: String(maxId + 1),
        category,
        level,
        question,
        answer,
        explanation,
        reps: '0',
        interval_mins: '0',
        ease_factor: '2.5',
        due_date: nowIso,
        last_reviewed: '',
        last_rating: '',
        state: 'new'
      };
    }

    allCards.push(savedCard);
    newlyCreatedCardId = savedCard.id;

    if (!allSortedCategories.includes(category)) {
      allSortedCategories.push(category);
      allSortedCategories.sort();
      selectedCategories.add(category);
      modalSelectedCategories.add(category);
      populateCategoryFilter();
      populateCollectionDatalist();
    }

    filterCards();
    updateFilterStats();

    if (!isServerConnected) {
      try {
        let customCards = [];
        const customStored = localStorage.getItem('flashsrs_custom_cards');
        if (customStored) {
          try { customCards = JSON.parse(customStored); } catch (e) {}
        }
        customCards.push(savedCard);
        localStorage.setItem('flashsrs_custom_cards', JSON.stringify(customCards));
      } catch (e) {}
    }

    els.btnSaveNewCard.disabled = false;
    els.btnSaveNewCard.textContent = '💾 Save Card to Collection';

    if (els.createCardSuccessText) {
      els.createCardSuccessText.textContent = `Card #${savedCard.id} successfully saved to "${category}"!`;
    }
    if (els.createCardSuccessBanner) {
      els.createCardSuccessBanner.style.display = 'flex';
    }

    showToast(`Card #${savedCard.id} saved to ${category}`);
  }

  // --- CARD BROWSER DRAWER ---
  function openDrawer() {
    renderDrawerList(allCards);
    els.drawerOverlay.classList.add('open');
  }

  function closeDrawer() {
    els.drawerOverlay.classList.remove('open');
  }

  function renderDrawerList(cards) {
    const term = (els.drawerSearch.value || '').toLowerCase();
    const filtered = cards.filter(c => {
      if (!term) return true;
      return (c.question || '').toLowerCase().includes(term) ||
             (c.category || '').toLowerCase().includes(term);
    });

    els.drawerCount.textContent = `${filtered.length} cards`;
    els.drawerList.innerHTML = '';

    const fragment = document.createDocumentFragment();
    filtered.slice(0, 100).forEach(c => {
      const item = document.createElement('div');
      item.className = 'drawer-card-item';
      
      const reps = parseInt(c.reps) || 0;
      const statusText = reps === 0 ? 'New' : `${reps} reps (${c.last_rating || 'reviewed'})`;

      item.innerHTML = `
        <div class="drawer-item-header">
          <span>${c.category} · ${c.level}</span>
          <span>${statusText}</span>
        </div>
        <div class="drawer-item-q">${c.question}</div>
      `;

      item.addEventListener('click', () => {
        jumpToCard(c.id);
        closeDrawer();
      });

      fragment.appendChild(item);
    });

    els.drawerList.appendChild(fragment);
  }

  function jumpToCard(id) {
    // Switch filter to 'all'
    activeFilters.mode = 'all';
    selectedCategories.clear();
    activeFilters.category = 'all';
    updateCategoryPickerUI();
    els.deckTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.mode === 'all');
    });

    applyFilters();
    const targetIdx = filteredCards.findIndex(c => String(c.id) === String(id));
    if (targetIdx !== -1) {
      currentIndex = targetIdx;
      renderCurrentCard();
    }
  }

  // --- EXPORT CSV ---
  function downloadCsv() {
    const fieldnames = ['id', 'category', 'level', 'question', 'answer', 'explanation', 'reps', 'interval_mins', 'ease_factor', 'due_date', 'last_reviewed', 'last_rating', 'state'];
    
    function toCsvField(val) {
      if (val === null || val === undefined) val = '';
      val = String(val);
      return `"${val.replace(/"/g, '""')}"`;
    }

    let csvContent = fieldnames.map(toCsvField).join(',') + '\n';
    allCards.forEach(c => {
      const row = fieldnames.map(f => toCsvField(c[f]));
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded data.csv');
  }

  // --- IMPORT CSV ---
  function handleImportCsv(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (evt) {
      try {
        const text = evt.target.result;
        const importedCards = parseCsvText(text);
        if (!importedCards || importedCards.length === 0) {
          showToast('Failed to import: CSV is empty or has invalid formatting.');
          return;
        }

        // 1. If running locally with PC server connected:
        if (isServerConnected) {
          showToast('Syncing imported cards and progress to local data.csv...');
          try {
            const res = await fetch('/api/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cards: importedCards })
            });

            if (res.ok) {
              const data = await res.json();
              // Reload all cards fresh from server
              const cRes = await fetch('/api/cards');
              if (cRes.ok) {
                allCards = await cRes.json();
                populateCategoryDropdown();
                applyFilters();
                updateOverallStats();
                showToast(`✓ Synced: ${data.new_count} new card(s) added & ${data.updated_count} reviews updated in data.csv!`);
                return;
              }
            }
          } catch (err) {
            console.warn('Server import failed, falling back to local merge:', err);
          }
        }

        // 2. Fallback / Cloud / Browser mode:
        const existingMap = new Map();
        const existingQMap = new Map();
        let maxId = 0;
        allCards.forEach(c => {
          const cid = parseInt(c.id, 10);
          if (!isNaN(cid) && cid > maxId) maxId = cid;
          existingMap.set(String(c.id), c);
          if (c.question) existingQMap.set(c.question.trim().toLowerCase(), c);
        });

        let updatedCount = 0;
        let newCount = 0;
        let progressMap = {};
        const stored = localStorage.getItem('flashsrs_progress_map');
        if (stored) {
          try { progressMap = JSON.parse(stored); } catch (e) {}
        }

        const newCustomCards = [];

        importedCards.forEach(imp => {
          if (!imp.question || !imp.answer) return;

          const match = existingMap.get(String(imp.id)) || existingQMap.get((imp.question || '').trim().toLowerCase());
          if (match) {
            match.reps = imp.reps !== undefined ? imp.reps : match.reps;
            match.interval_mins = imp.interval_mins !== undefined ? imp.interval_mins : match.interval_mins;
            match.ease_factor = imp.ease_factor !== undefined ? imp.ease_factor : match.ease_factor;
            match.due_date = imp.due_date || match.due_date;
            match.last_reviewed = imp.last_reviewed || match.last_reviewed;
            match.last_rating = imp.last_rating || match.last_rating;
            match.state = imp.state || match.state;

            if (parseInt(match.reps) > 0 || match.last_reviewed) {
              progressMap[String(match.id)] = {
                reps: match.reps,
                interval_mins: match.interval_mins,
                ease_factor: match.ease_factor,
                due_date: match.due_date,
                last_reviewed: match.last_reviewed,
                last_rating: match.last_rating,
                state: match.state
              };
              updatedCount++;
            }
          } else {
            // New card
            maxId++;
            const newCard = {
              id: String(maxId),
              category: imp.category || 'General',
              level: imp.level || 'Intermediate',
              question: imp.question.trim(),
              answer: imp.answer.trim(),
              explanation: (imp.explanation || '').trim(),
              reps: imp.reps || '0',
              interval_mins: imp.interval_mins || '0',
              ease_factor: imp.ease_factor || '2.5',
              due_date: imp.due_date || new Date().toISOString(),
              last_reviewed: imp.last_reviewed || '',
              last_rating: imp.last_rating || '',
              state: imp.state || 'new'
            };
            allCards.push(newCard);
            existingMap.set(newCard.id, newCard);
            existingQMap.set(newCard.question.toLowerCase(), newCard);
            newCustomCards.push(newCard);
            newCount++;
          }
        });

        localStorage.setItem('flashsrs_progress_map', JSON.stringify(progressMap));

        if (newCustomCards.length > 0) {
          let customCards = [];
          const customStored = localStorage.getItem('flashsrs_custom_cards');
          if (customStored) {
            try { customCards = JSON.parse(customStored); } catch (e) {}
          }
          customCards.push(...newCustomCards);
          localStorage.setItem('flashsrs_custom_cards', JSON.stringify(customCards));
        }

        populateCategoryDropdown();
        applyFilters();
        updateOverallStats();
        showToast(`✓ Synced: ${newCount} new card(s) added & ${updatedCount} reviews updated!`);
      } catch (err) {
        console.error('Error importing CSV:', err);
        showToast('Error importing CSV: ' + err.message);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  // --- RESET ALL PROGRESS ---
  async function resetAllProgress() {
    if (!confirm('Are you sure you want to reset all review progress and intervals back to new?')) {
      return;
    }
    const nowIso = new Date().toISOString();
    allCards.forEach(c => {
      c.reps = 0;
      c.interval_mins = 0;
      c.ease_factor = 2.5;
      c.due_date = nowIso;
      c.last_reviewed = '';
      c.last_rating = '';
      c.state = 'new';
    });

    if (isServerConnected) {
      try {
        await fetch('/api/reset', { method: 'POST' });
      } catch (e) {}
    }
    try {
      localStorage.removeItem('flashsrs_progress_map');
      localStorage.removeItem('flashsrs_cards');
    } catch (e) {}

    applyFilters();
    showToast('Progress reset for all 3,500 questions.');
  }

  // --- TOAST NOTIFICATION ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    els.toast.textContent = msg;
    els.toast.style.display = 'block';
    toastTimer = setTimeout(() => {
      els.toast.style.display = 'none';
    }, 2400);
  }

  // --- EVENT BINDING ---
  function bindEvents() {
    // Show Answer
    els.btnReveal.addEventListener('click', revealAnswer);

    // Deep Explanation
    els.btnExplanation.addEventListener('click', openExplanationModal);
    els.modalCloseBtn.addEventListener('click', closeExplanationModal);
    els.modalDoneBtn.addEventListener('click', closeExplanationModal);
    els.modalOverlay.addEventListener('click', (e) => {
      if (e.target === els.modalOverlay) closeExplanationModal();
    });

    // Rating buttons
    els.btnDifficult.addEventListener('click', () => rateCard('difficult'));
    els.btnHard.addEventListener('click', () => rateCard('hard'));
    els.btnGood.addEventListener('click', () => rateCard('good'));
    els.btnEasy.addEventListener('click', () => rateCard('easy'));

    // Sub nav
    els.btnPrev.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderCurrentCard();
      }
    });

    els.btnSkip.addEventListener('click', () => {
      if (currentIndex < filteredCards.length - 1) {
        currentIndex++;
        renderCurrentCard();
      } else {
        currentIndex = 0;
        renderCurrentCard();
      }
    });

    els.btnRehide.addEventListener('click', hideAnswer);

    // Quick Preset Filter Dropdown (fallback if present)
    if (els.presetFilter) {
      els.presetFilter.addEventListener('change', (e) => {
        applyPreset(e.target.value);
      });
    }

    // Filter Collections & Presets Modal Button
    if (els.btnOpenCategoryModal) {
      els.btnOpenCategoryModal.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        openCategoryModal();
      });
    }

    // Modal Close
    if (els.catModalCloseBtn) {
      els.catModalCloseBtn.addEventListener('click', closeCategoryModal);
    }
    if (els.btnModalCancel) {
      els.btnModalCancel.addEventListener('click', closeCategoryModal);
    }
    if (els.categoryModal) {
      els.categoryModal.addEventListener('click', (e) => {
        if (e.target === els.categoryModal) closeCategoryModal();
      });
    }

    // Sidebar: ➕ New Preset button
    if (els.btnSidebarNewPreset) {
      els.btnSidebarNewPreset.addEventListener('click', () => {
        toggleInlinePresetCreator();
      });
    }

    // Inline Preset Creator: Save & Cancel
    if (els.btnConfirmSavePreset) {
      els.btnConfirmSavePreset.addEventListener('click', confirmSavePreset);
    }
    if (els.btnCancelSavePreset) {
      els.btnCancelSavePreset.addEventListener('click', () => {
        toggleInlinePresetCreator(false);
      });
    }
    if (els.newPresetNameInput) {
      els.newPresetNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmSavePreset();
        if (e.key === 'Escape') toggleInlinePresetCreator(false);
      });
    }

    // Modal Apply
    if (els.btnModalApply) {
      els.btnModalApply.addEventListener('click', applyCategoryModalSelection);
    }

    // Modal Reset to All
    if (els.btnModalResetAll) {
      els.btnModalResetAll.addEventListener('click', () => {
        modalSelectedCategories = new Set(allSortedCategories);
        modalActivePresetId = 'all';
        renderSidebarPresets();
        renderModalCollectionsList(els.catModalSearch ? els.catModalSearch.value : '');
        updateModalSummary();
      });
    }

    // Modal Search
    if (els.catModalSearch) {
      els.catModalSearch.addEventListener('input', (e) => {
        const val = e.target.value;
        if (els.catModalSearchClear) {
          els.catModalSearchClear.style.display = val ? 'block' : 'none';
        }
        renderModalCollectionsList(val);
      });
    }

    if (els.catModalSearchClear) {
      els.catModalSearchClear.addEventListener('click', () => {
        els.catModalSearch.value = '';
        els.catModalSearchClear.style.display = 'none';
        els.catModalSearch.focus();
        renderModalCollectionsList('');
      });
    }

    // Bulk buttons in Modal
    if (els.btnModalSelectAll) {
      els.btnModalSelectAll.addEventListener('click', () => {
        modalSelectedCategories = new Set(allSortedCategories);
        modalActivePresetId = 'all';
        renderSidebarPresets();
        renderModalCollectionsList(els.catModalSearch ? els.catModalSearch.value : '');
        updateModalSummary();
      });
    }

    if (els.btnModalClearAll) {
      els.btnModalClearAll.addEventListener('click', () => {
        modalSelectedCategories.clear();
        modalActivePresetId = 'custom_adhoc';
        renderSidebarPresets();
        renderModalCollectionsList(els.catModalSearch ? els.catModalSearch.value : '');
        updateModalSummary();
      });
    }

    if (els.btnModalInvert) {
      els.btnModalInvert.addEventListener('click', () => {
        allSortedCategories.forEach(c => {
          if (modalSelectedCategories.has(c)) {
            modalSelectedCategories.delete(c);
          } else {
            modalSelectedCategories.add(c);
          }
        });
        updateModalPresetMatch();
        renderSidebarPresets();
        renderModalCollectionsList(els.catModalSearch ? els.catModalSearch.value : '');
        updateModalSummary();
      });
    }

    // Active Category Chip interactions
    if (els.activeCategoryChipText) {
      els.activeCategoryChipText.addEventListener('click', () => {
        openCategoryModal();
      });
    }
    if (els.btnClearCatChip) {
      els.btnClearCatChip.addEventListener('click', () => {
        applyPreset('all');
      });
    }

    // Legacy Category Filter fallback
    if (els.categoryFilter) {
      els.categoryFilter.addEventListener('change', (e) => {
        activeFilters.category = e.target.value;
        if (e.target.value === 'all') {
          selectedCategories.clear();
          activePresetId = 'all';
        } else {
          selectedCategories.clear();
          selectedCategories.add(e.target.value);
          activePresetId = 'custom_adhoc';
        }
        updateCategoryPickerUI();
        applyFilters();
      });
    }

    els.levelFilter.addEventListener('change', (e) => {
      activeFilters.level = e.target.value;
      applyFilters();
    });

    els.searchInput.addEventListener('input', (e) => {
      activeFilters.search = e.target.value;
      applyFilters();
    });

    // Mode tabs
    els.deckTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        els.deckTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilters.mode = tab.dataset.mode;
        applyFilters();
      });
    });

    // Footer settings inputs
    [els.difficultVal, els.difficultUnit, els.hardVal, els.hardUnit,
     els.goodVal, els.goodUnit, els.easyVal, els.easyUnit].forEach(el => {
      el.addEventListener('change', readSettingsFromFooter);
    });

    els.btnSaveSettings.addEventListener('click', readSettingsFromFooter);

    els.btnResetSettings.addEventListener('click', () => {
      settings = {
        difficult: { value: 10, unit: 'minutes' },
        hard: { value: 1, unit: 'days' },
        good: { value: 3, unit: 'days' },
        easy: { value: 7, unit: 'days' }
      };
      updateFooterUI();
      saveLocalSettings();
      syncSettingsWithServer();
      updateIntervalBadges();
      showToast('Reset intervals to defaults.');
    });

    if (els.btnDownloadCsv) els.btnDownloadCsv.addEventListener('click', downloadCsv);
    if (els.btnImportCsv && els.fileImportCsv) {
      els.btnImportCsv.addEventListener('click', () => els.fileImportCsv.click());
      els.fileImportCsv.addEventListener('change', handleImportCsv);
    }
    if (els.btnResetProgress) els.btnResetProgress.addEventListener('click', resetAllProgress);

    // Sync button
    if (els.btnSync) {
      els.btnSync.addEventListener('click', () => syncDataFiles(true));
    }
    if (els.btnSyncFooter) {
      els.btnSyncFooter.addEventListener('click', () => syncDataFiles(true));
    }

    // Drawer
    els.btnBrowseCards.addEventListener('click', openDrawer);
    els.drawerCloseBtn.addEventListener('click', closeDrawer);
    els.drawerOverlay.addEventListener('click', (e) => {
      if (e.target === els.drawerOverlay) closeDrawer();
    });
    els.drawerSearch.addEventListener('input', () => renderDrawerList(allCards));

    // Shortcuts modal
    els.btnShortcuts.addEventListener('click', () => {
      els.shortcutsModal.classList.add('open');
    });
    els.shortcutsCloseBtn.addEventListener('click', () => {
      els.shortcutsModal.classList.remove('open');
    });
    els.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === els.shortcutsModal) els.shortcutsModal.classList.remove('open');
    });

    // AI Chat Modal & Card Buttons
    if (els.btnCardChat) els.btnCardChat.addEventListener('click', openAiChatModal);
    if (els.btnCardAiHeader) els.btnCardAiHeader.addEventListener('click', openAiChatModal);
    if (els.aiModalCloseBtn) els.aiModalCloseBtn.addEventListener('click', closeAiChatModal);
    if (els.aiChatModal) {
      els.aiChatModal.addEventListener('click', (e) => {
        if (e.target === els.aiChatModal) closeAiChatModal();
      });
    }

    // AI Key Manager toggle
    if (els.btnToggleKeyMgr) {
      els.btnToggleKeyMgr.addEventListener('click', () => {
        const isHidden = els.aiKeyManagerPanel.style.display === 'none';
        els.aiKeyManagerPanel.style.display = isHidden ? 'flex' : 'none';
        if (isHidden && els.aiKeysInput) els.aiKeysInput.focus();
      });
    }
    if (els.aiActiveKeyPill) {
      els.aiActiveKeyPill.addEventListener('click', () => {
        const isHidden = els.aiKeyManagerPanel.style.display === 'none';
        els.aiKeyManagerPanel.style.display = isHidden ? 'flex' : 'none';
        if (isHidden && els.aiKeysInput) els.aiKeysInput.focus();
      });
    }

    // Save Keys button
    if (els.btnSaveKeys) {
      els.btnSaveKeys.addEventListener('click', () => {
        const lines = (els.aiKeysInput.value || '').split(/[\n,]+/);
        saveOpenRouterKeys(lines);
        showToast(`Saved ${openRouterKeys.length} OpenRouter API key(s)`);
        els.aiKeyManagerPanel.style.display = 'none';
        if (els.aiChatInput) els.aiChatInput.focus();
      });
    }

    // Manual cycle button
    if (els.btnCycleKeyManual) {
      els.btnCycleKeyManual.addEventListener('click', () => {
        if (openRouterKeys.length <= 1) {
          showToast('Configure multiple keys to rotate');
          return;
        }
        rotateToNextKey('manual');
        const activeIdx = (currentKeyIndex % openRouterKeys.length) + 1;
        showToast(`Manually switched to Key #${activeIdx}`);
      });
    }

    // Clear chat button
    if (els.btnClearChat) {
      els.btnClearChat.addEventListener('click', () => {
        const card = getCurrentCard();
        if (card && cardChatHistories[card.id]) {
          cardChatHistories[card.id] = [];
          renderChatHistory(card.id);
          showToast('Chat history cleared for this card');
        }
      });
    }

    // Context preview toggle
    if (els.btnToggleContextPreview) {
      els.btnToggleContextPreview.addEventListener('click', () => {
        const isHidden = els.aiContextPreviewBody.style.display === 'none';
        els.aiContextPreviewBody.style.display = isHidden ? 'flex' : 'none';
        els.btnToggleContextPreview.textContent = isHidden ? 'Hide Context ▴' : 'Inspect Context ▾';
      });
    }

    // Send button & input keydown
    if (els.btnAiSend) {
      els.btnAiSend.addEventListener('click', () => sendAiChatMessage());
    }

    if (els.aiChatInput) {
      els.aiChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendAiChatMessage();
        }
      });

      // Auto-resize textarea
      els.aiChatInput.addEventListener('input', () => {
        els.aiChatInput.style.height = 'auto';
        els.aiChatInput.style.height = Math.min(els.aiChatInput.scrollHeight, 140) + 'px';
      });
    }

    // Prompt chips
    if (els.aiPromptChips) {
      els.aiPromptChips.querySelectorAll('.ai-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          sendAiChatMessage(btn.dataset.prompt);
        });
      });
    }

    // Create New Card Modal Events
    if (els.btnCreateCardHeader) {
      els.btnCreateCardHeader.addEventListener('click', () => openCreateCardModal());
    }
    if (els.createCardCloseBtn) {
      els.createCardCloseBtn.addEventListener('click', closeCreateCardModal);
    }
    if (els.btnCancelCreateCard) {
      els.btnCancelCreateCard.addEventListener('click', closeCreateCardModal);
    }
    if (els.createCardModal) {
      els.createCardModal.addEventListener('click', (e) => {
        if (e.target === els.createCardModal) closeCreateCardModal();
      });
    }

    if (els.createCardKeyPill) {
      els.createCardKeyPill.addEventListener('click', () => {
        openAiChatModal();
        if (els.aiKeyManagerPanel) els.aiKeyManagerPanel.style.display = 'flex';
      });
    }

    // Generate with AI
    if (els.btnAiGenerateCard) {
      els.btnAiGenerateCard.addEventListener('click', generateCardContentWithAi);
    }

    // Refine with AI
    if (els.btnAiRefineCard) {
      els.btnAiRefineCard.addEventListener('click', () => refineCardContentWithAi());
    }

    // Refinement Preset Chips
    document.querySelectorAll('.refine-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        refineCardContentWithAi(chip.dataset.instruction);
      });
    });

    // Preview Toggles
    if (els.btnTogglePreviewAnswer) {
      els.btnTogglePreviewAnswer.addEventListener('click', togglePreviewAnswer);
    }
    if (els.btnTogglePreviewExplanation) {
      els.btnTogglePreviewExplanation.addEventListener('click', togglePreviewExplanation);
    }

    // Live update previews on typing
    if (els.createCardAnswer) {
      els.createCardAnswer.addEventListener('input', () => {
        if (els.previewCardAnswer && els.previewCardAnswer.style.display !== 'none') {
          updateCardPreviews();
        }
      });
    }
    if (els.createCardExplanation) {
      els.createCardExplanation.addEventListener('input', () => {
        if (els.previewCardExplanation && els.previewCardExplanation.style.display !== 'none') {
          updateCardPreviews();
        }
      });
    }

    // Save Card
    if (els.btnSaveNewCard) {
      els.btnSaveNewCard.addEventListener('click', saveNewCard);
    }

    // Create Another Card
    if (els.btnCreateAnother) {
      els.btnCreateAnother.addEventListener('click', () => {
        if (els.createCardQuestion) els.createCardQuestion.value = '';
        if (els.createCardAnswer) els.createCardAnswer.value = '';
        if (els.createCardExplanation) els.createCardExplanation.value = '';
        if (els.refinementInstructionInput) els.refinementInstructionInput.value = '';
        if (els.createCardSuccessBanner) els.createCardSuccessBanner.style.display = 'none';

        // Reset previews
        if (els.previewCardAnswer) els.previewCardAnswer.style.display = 'none';
        if (els.createCardAnswer) els.createCardAnswer.style.display = 'block';
        if (els.btnTogglePreviewAnswer) {
          els.btnTogglePreviewAnswer.textContent = '👁️ Preview';
          els.btnTogglePreviewAnswer.classList.remove('active');
        }

        if (els.previewCardExplanation) els.previewCardExplanation.style.display = 'none';
        if (els.createCardExplanation) els.createCardExplanation.style.display = 'block';
        if (els.btnTogglePreviewExplanation) {
          els.btnTogglePreviewExplanation.textContent = '👁️ Preview';
          els.btnTogglePreviewExplanation.classList.remove('active');
        }

        if (els.createCardQuestion) els.createCardQuestion.focus();
      });
    }

    // View Created Card in Deck
    if (els.btnViewCreatedCard) {
      els.btnViewCreatedCard.addEventListener('click', () => {
        closeCreateCardModal();
        if (newlyCreatedCardId) {
          const idx = filteredCards.findIndex(c => String(c.id) === String(newlyCreatedCardId));
          if (idx !== -1) {
            currentIndex = idx;
            renderCurrentCard();
            showToast(`Displaying Card #${newlyCreatedCardId}`);
          } else {
            // If filtered out, switch to all cards mode
            activeFilters.mode = 'all';
            document.querySelectorAll('.deck-tab').forEach(t => {
              t.classList.toggle('active', t.dataset.mode === 'all');
            });
            filterCards();
            const allIdx = filteredCards.findIndex(c => String(c.id) === String(newlyCreatedCardId));
            if (allIdx !== -1) {
              currentIndex = allIdx;
              renderCurrentCard();
            }
          }
        }
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // If typing in input, don't trigger shortcuts
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        closeCategoryModal();
        closeExplanationModal();
        closeAiChatModal();
        closeCreateCardModal();
        closeDrawer();
        els.shortcutsModal.classList.remove('open');
        return;
      }

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openCreateCardModal();
        return;
      }

      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        openAiChatModal();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isAnswerRevealed) {
          revealAnswer();
        }
        return;
      }

      if (isAnswerRevealed) {
        if (e.key === '1') {
          e.preventDefault();
          rateCard('difficult');
        } else if (e.key === '2') {
          e.preventDefault();
          rateCard('hard');
        } else if (e.key === '3') {
          e.preventDefault();
          rateCard('good');
        } else if (e.key === '4') {
          e.preventDefault();
          rateCard('easy');
        } else if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          openExplanationModal();
        }
      }

      if (e.key === 'ArrowRight') {
        els.btnSkip.click();
      } else if (e.key === 'ArrowLeft') {
        els.btnPrev.click();
      }
    });
  }

  // Run on page load
  document.addEventListener('DOMContentLoaded', init);
})();
