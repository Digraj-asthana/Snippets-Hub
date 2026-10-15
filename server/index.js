const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { explainSnippet, assistWithProblem, translateSnippet, runSandbox } = require('./aiEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const SEED_FILE = path.join(DATA_DIR, 'seedSnippets.json');
const DB_FILE = path.join(DATA_DIR, 'snippets.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Serve static frontend files
app.use(express.static(PUBLIC_DIR));

// In-memory cache for serverless environments (e.g. Vercel) where filesystem is read-only
let memorySnippets = null;

function getDbFilePath() {
  if (process.env.VERCEL) {
    const tmpFile = path.join('/tmp', 'snippets.json');
    if (!fs.existsSync(tmpFile)) {
      try {
        const sourceData = fs.existsSync(DB_FILE) 
          ? fs.readFileSync(DB_FILE, 'utf-8') 
          : (fs.existsSync(SEED_FILE) ? fs.readFileSync(SEED_FILE, 'utf-8') : '[]');
        fs.writeFileSync(tmpFile, sourceData, 'utf-8');
      } catch (e) {
        console.warn('Could not initialize /tmp/snippets.json:', e.message);
      }
    }
    return tmpFile;
  }
  return DB_FILE;
}

// Ensure DB exists
function getSnippets() {
  if (memorySnippets && process.env.VERCEL) {
    return memorySnippets;
  }
  try {
    const activeDb = getDbFilePath();
    if (!fs.existsSync(activeDb)) {
      if (fs.existsSync(SEED_FILE)) {
        const seedData = fs.readFileSync(SEED_FILE, 'utf-8');
        try { fs.writeFileSync(activeDb, seedData, 'utf-8'); } catch (_) {}
        const parsed = JSON.parse(seedData);
        memorySnippets = parsed;
        return parsed;
      }
      return [];
    }
    const raw = fs.readFileSync(activeDb, 'utf-8');
    const parsed = JSON.parse(raw);
    memorySnippets = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading snippets DB:', err);
    return memorySnippets || [];
  }
}

function saveSnippets(snippets) {
  memorySnippets = snippets;
  try {
    const activeDb = getDbFilePath();
    fs.writeFileSync(activeDb, JSON.stringify(snippets, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Filesystem write failed, falling back to memory/tmp:', err.message);
    try {
      const tmpFile = path.join('/tmp', 'snippets.json');
      fs.writeFileSync(tmpFile, JSON.stringify(snippets, null, 2), 'utf-8');
      return true;
    } catch (_) {
      return true; // Maintained in memorySnippets
    }
  }
}

// ================= PRD REST API ROUTES =================

// 1. GET /api/snippets: List/search/filter (Section 7)
app.get('/api/snippets', (req, res) => {
  let snippets = getSnippets();
  const { q, language, category, categoryId, tag, tagId, starred, sort } = req.query;

  // Full-text search (searches title, code, notes, description, tags, language, category)
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    snippets = snippets.filter(s => {
      const matchTitle = (s.title || '').toLowerCase().includes(term);
      const matchDesc = (s.description || '').toLowerCase().includes(term);
      const matchNotes = (s.notes || '').toLowerCase().includes(term);
      const matchCode = (s.code || '').toLowerCase().includes(term);
      const matchCategory = (s.category || '').toLowerCase().includes(term);
      const matchCourse = (s.course || '').toLowerCase().includes(term);
      const matchLang = (s.language || '').toLowerCase().includes(term);
      const matchTags = (s.tags || []).some(t => t.toLowerCase().includes(term));
      return matchTitle || matchDesc || matchNotes || matchCode || matchCategory || matchCourse || matchLang || matchTags;
    });
  }

  // Filter by Language
  if (language && language !== 'all') {
    snippets = snippets.filter(s => (s.language || '').toLowerCase() === language.toLowerCase());
  }

  // Filter by Category
  const catFilter = category || categoryId;
  if (catFilter && catFilter !== 'all') {
    snippets = snippets.filter(s => 
      (s.category || '').toLowerCase() === catFilter.toLowerCase() ||
      (s.course || '').toLowerCase() === catFilter.toLowerCase()
    );
  }

  // Filter by Tag
  const tFilter = tag || tagId;
  if (tFilter) {
    const cleanTag = tFilter.startsWith('#') ? tFilter.slice(1) : tFilter;
    snippets = snippets.filter(s => 
      (s.tags || []).some(t => t.replace('#', '').toLowerCase() === cleanTag.toLowerCase())
    );
  }

  // Filter by Starred / Favorites
  if (starred === 'true') {
    snippets = snippets.filter(s => s.starred);
  }

  // Sort
  if (sort === 'alpha') {
    snippets.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sort === 'starred') {
    snippets.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
  } else if (sort === 'complexity') {
    snippets.sort((a, b) => (a.timeComplexity || '').localeCompare(b.timeComplexity || ''));
  } else {
    // Default: Pinned first, then recently updated
    snippets.sort((a, b) => {
      if (b.pinned !== a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });
  }

  res.json({ success: true, count: snippets.length, data: snippets });
});

// 2. GET /api/snippets/:id: Single snippet detail (Section 7)
app.get('/api/snippets/:id', (req, res) => {
  const snippets = getSnippets();
  const snippet = snippets.find(s => s.id === req.params.id);
  if (!snippet) {
    return res.status(404).json({ success: false, message: 'Snippet not found.' });
  }
  res.json({ success: true, data: snippet });
});

// 3. POST /api/snippets: Create snippet (Section 7)
app.post('/api/snippets', (req, res) => {
  const snippets = getSnippets();
  const {
    title,
    code,
    language,
    version,
    description,
    notes,
    category,
    course,
    timeComplexity,
    spaceComplexity,
    tags,
    pinned,
    starred
  } = req.body;

  // Validation: required title, code, language
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Snippet title is required.' });
  }
  if (!code || !code.trim()) {
    return res.status(400).json({ success: false, message: 'Snippet code body is required.' });
  }
  if (!language || !language.trim()) {
    return res.status(400).json({ success: false, message: 'Language is required.' });
  }

  const cleanTags = Array.isArray(tags) 
    ? tags.map(t => t.trim().replace(/^#/, '')) 
    : (typeof tags === 'string' ? tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) : []);

  const now = new Date().toISOString();
  const newSnippet = {
    id: `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: title.trim(),
    code: code,
    language: language.toLowerCase().trim(),
    version: version || `${capitalize(language)} Script`,
    description: (description || '').trim(),
    notes: (notes || '').trim(),
    category: (category || 'Algorithms & Data Structures').trim(),
    course: (course || 'CS 106B: Data Structures').trim(),
    timeComplexity: (timeComplexity || 'O(1)').trim(),
    spaceComplexity: (spaceComplexity || 'O(1)').trim(),
    tags: cleanTags,
    starred: !!starred,
    pinned: !!pinned,
    createdAt: now,
    updatedAt: now,
    annotations: [],
    testCases: [
      { input: 'Initial test vector', expected: 'Valid execution', status: 'passed' }
    ]
  };

  snippets.unshift(newSnippet);
  saveSnippets(snippets);
  res.status(201).json({ success: true, message: 'Snippet saved successfully.', data: newSnippet });
});

// 4. PATCH & PUT /api/snippets/:id: Update snippet (Section 7)
const handleUpdateSnippet = (req, res) => {
  const snippets = getSnippets();
  const index = snippets.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Snippet not found.' });
  }

  const existing = snippets[index];
  const {
    title,
    code,
    language,
    version,
    description,
    notes,
    category,
    course,
    timeComplexity,
    spaceComplexity,
    tags,
    pinned,
    starred
  } = req.body;

  const cleanTags = tags !== undefined
    ? (Array.isArray(tags) ? tags.map(t => t.trim().replace(/^#/, '')) : tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean))
    : existing.tags;

  const updated = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    code: code !== undefined ? code : existing.code,
    language: language !== undefined ? language.toLowerCase().trim() : existing.language,
    version: version !== undefined ? version : existing.version,
    description: description !== undefined ? description.trim() : existing.description,
    notes: notes !== undefined ? notes.trim() : existing.notes,
    category: category !== undefined ? category.trim() : existing.category,
    course: course !== undefined ? course.trim() : existing.course,
    timeComplexity: timeComplexity !== undefined ? timeComplexity.trim() : existing.timeComplexity,
    spaceComplexity: spaceComplexity !== undefined ? spaceComplexity.trim() : existing.spaceComplexity,
    tags: cleanTags,
    starred: starred !== undefined ? !!starred : existing.starred,
    pinned: pinned !== undefined ? !!pinned : existing.pinned,
    updatedAt: new Date().toISOString()
  };

  snippets[index] = updated;
  saveSnippets(snippets);
  res.json({ success: true, message: 'Snippet updated successfully.', data: updated });
};

app.patch('/api/snippets/:id', handleUpdateSnippet);
app.put('/api/snippets/:id', handleUpdateSnippet);

// 5. DELETE /api/snippets/:id: Delete snippet (Section 7)
app.delete('/api/snippets/:id', (req, res) => {
  let snippets = getSnippets();
  const initialLength = snippets.length;
  snippets = snippets.filter(s => s.id !== req.params.id);

  if (snippets.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Snippet not found.' });
  }

  saveSnippets(snippets);
  res.json({ success: true, message: 'Snippet deleted successfully.' });
});

// 6. GET /api/categories: Categories breakdown with counts (Section 7)
app.get('/api/categories', (req, res) => {
  const snippets = getSnippets();
  const counts = {};
  snippets.forEach(s => {
    const cat = s.category || s.course || 'General';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  const data = Object.keys(counts).map(name => ({ name, count: counts[name] }));
  res.json({ success: true, count: data.length, data });
});

// 7. GET /api/tags: Tags breakdown with counts (Section 7)
app.get('/api/tags', (req, res) => {
  const snippets = getSnippets();
  const counts = {};
  snippets.forEach(s => {
    (s.tags || []).forEach(t => {
      const clean = t.replace(/^#/, '').toLowerCase();
      counts[clean] = (counts[clean] || 0) + 1;
    });
  });
  const data = Object.keys(counts).map(name => ({ name, count: counts[name] }));
  res.json({ success: true, count: data.length, data });
});

// 8. PATCH /api/snippets/:id/star
app.patch('/api/snippets/:id/star', (req, res) => {
  const snippets = getSnippets();
  const snippet = snippets.find(s => s.id === req.params.id);
  if (!snippet) {
    return res.status(404).json({ success: false, message: 'Snippet not found.' });
  }
  snippet.starred = !snippet.starred;
  snippet.updatedAt = new Date().toISOString();
  saveSnippets(snippets);
  res.json({ success: true, starred: snippet.starred, data: snippet });
});

// 9. PATCH /api/snippets/:id/pin
app.patch('/api/snippets/:id/pin', (req, res) => {
  const snippets = getSnippets();
  const snippet = snippets.find(s => s.id === req.params.id);
  if (!snippet) {
    return res.status(404).json({ success: false, message: 'Snippet not found.' });
  }
  snippet.pinned = !snippet.pinned;
  snippet.updatedAt = new Date().toISOString();
  saveSnippets(snippets);
  res.json({ success: true, pinned: snippet.pinned, data: snippet });
});

// 10. POST /api/snippets/:id/annotations: Add inline annotation
app.post('/api/snippets/:id/annotations', (req, res) => {
  const snippets = getSnippets();
  const snippet = snippets.find(s => s.id === req.params.id);
  if (!snippet) {
    return res.status(404).json({ success: false, message: 'Snippet not found.' });
  }

  const { line, note, author } = req.body;
  if (!line || !note) {
    return res.status(400).json({ success: false, message: 'Line and note are required.' });
  }

  if (!Array.isArray(snippet.annotations)) {
    snippet.annotations = [];
  }

  const annotation = {
    line: parseInt(line, 10),
    author: author || 'Bhoomika Yadav',
    time: 'Just now',
    note: note.trim()
  };

  snippet.annotations.push(annotation);
  snippet.updatedAt = new Date().toISOString();
  saveSnippets(snippets);
  res.status(201).json({ success: true, data: annotation, annotations: snippet.annotations });
});

// 11. GET /api/stats
app.get('/api/stats', (req, res) => {
  const snippets = getSnippets();
  const maxCapacity = 500;

  const categoryCounts = {};
  const courseCounts = {};
  const languageCounts = {};
  const tagCounts = {};

  snippets.forEach(s => {
    const cat = s.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    const course = s.course || 'General';
    courseCounts[course] = (courseCounts[course] || 0) + 1;

    const lang = (s.language || 'other').toLowerCase();
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;

    (s.tags || []).forEach(t => {
      const clean = t.replace(/^#/, '').toLowerCase();
      tagCounts[clean] = (tagCounts[clean] || 0) + 1;
    });
  });

  res.json({
    success: true,
    data: {
      totalSnippets: snippets.length,
      quota: {
        used: snippets.length,
        max: maxCapacity,
        percentage: ((snippets.length / maxCapacity) * 100).toFixed(1)
      },
      categories: categoryCounts,
      courses: courseCounts,
      languages: languageCounts,
      tags: tagCounts
    }
  });
});

// 12. POST /api/ai/explain: AI Explain Action (Section 7 & 8)
app.post('/api/ai/explain', (req, res) => {
  let snippet = req.body.snippet;
  if (!snippet && req.body.code) {
    snippet = {
      title: req.body.title || 'Custom Code',
      code: req.body.code,
      language: req.body.sourceLanguage || req.body.language || 'python'
    };
  } else if (!snippet && req.body.snippetId) {
    const snippets = getSnippets();
    snippet = snippets.find(s => s.id === req.body.snippetId);
  }

  if (!snippet || !snippet.code) {
    return res.status(400).json({ success: false, message: 'Valid snippet or code required for explanation.' });
  }

  const result = explainSnippet(snippet);
  res.json({ success: true, data: result });
});

// 13. POST /api/ai/assist (and /api/ai/solve): AI Solution Assistance (Section 7 & 8)
const handleAiAssist = (req, res) => {
  let { snippet, snippetId, query, actionType, code, language } = req.body;
  if (!snippet && code) {
    snippet = { title: req.body.title || 'Custom Code', code, language: language || 'python' };
  } else if (!snippet && snippetId) {
    const snippets = getSnippets();
    snippet = snippets.find(s => s.id === snippetId);
  }

  if (!snippet) {
    snippet = { title: 'General Algorithm', code: '', language: 'python' };
  }

  const result = assistWithProblem(snippet, query, actionType);
  res.json({ success: true, data: result });
};

app.post('/api/ai/assist', handleAiAssist);
app.post('/api/ai/solve', handleAiAssist);

// 14. POST /api/ai/translate: AI Code Translation (Section 7 & 8)
app.post('/api/ai/translate', (req, res) => {
  let { snippet, snippetId, targetLanguage, code, sourceLanguage, language, title } = req.body;
  if (!snippet && code) {
    snippet = {
      title: title || 'Custom Code',
      code: code,
      language: sourceLanguage || language || 'python'
    };
  } else if (!snippet && snippetId) {
    const snippets = getSnippets();
    snippet = snippets.find(s => s.id === snippetId);
  }

  if (!snippet || !snippet.code) {
    return res.status(400).json({ success: false, message: 'Snippet with code required for translation.' });
  }

  const result = translateSnippet(snippet, targetLanguage || 'python');
  res.json({ success: true, data: result });
});

// 15. POST /api/ai/sandbox
app.post('/api/ai/sandbox', (req, res) => {
  let { snippet, snippetId } = req.body;
  if (!snippet && snippetId) {
    const snippets = getSnippets();
    snippet = snippets.find(s => s.id === snippetId);
  }

  if (!snippet) {
    return res.status(400).json({ success: false, message: 'Snippet required for sandbox.' });
  }

  const result = runSandbox(snippet);
  res.json({ success: true, data: result });
});

// 16. POST /api/export: Export Vault as Markdown or JSON (Section 7)
app.post('/api/export', (req, res) => {
  const snippets = getSnippets();
  const { format } = req.body;

  if (format === 'json') {
    return res.json({ success: true, data: snippets });
  }

  // Markdown format with learning notes
  let md = `# Snippets Hub — Student Code Library & Learning Notebook\n`;
  md += `Exported on: ${new Date().toUTCString()}\n`;
  md += `Total Snippets: ${snippets.length}\n\n---\n\n`;

  snippets.forEach((s, idx) => {
    md += `## ${idx + 1}. ${s.title}\n\n`;
    md += `- **Language:** ${s.version || s.language}\n`;
    md += `- **Category:** ${s.category || 'General'}\n`;
    md += `- **Course:** ${s.course || 'N/A'}\n`;
    md += `- **Complexity:** Time: ${s.timeComplexity || 'O(1)'} | Space: ${s.spaceComplexity || 'O(1)'}\n`;
    md += `- **Tags:** ${(s.tags || []).map(t => `#${t}`).join(', ')}\n\n`;
    if (s.description) {
      md += `### Context & Rationale:\n> ${s.description}\n\n`;
    }
    if (s.notes) {
      md += `### Learning Notes:\n${s.notes}\n\n`;
    }
    md += `### Implementation Code:\n\`\`\`${s.language || 'text'}\n${s.code}\n\`\`\`\n\n`;
    if (s.annotations && s.annotations.length > 0) {
      md += `### Invariant Line Annotations:\n`;
      s.annotations.forEach(a => {
        md += `- **Line ${a.line}** (${a.author}): ${a.note}\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  });

  res.setHeader('Content-Type', 'text/markdown');
  res.send(md);
});

// 17. POST /api/import: Import JSON snippets (Section 7 & P2)
app.post('/api/import', (req, res) => {
  const incoming = req.body.snippets || req.body;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ success: false, message: 'Valid array of snippets required.' });
  }

  const existing = getSnippets();
  const existingTitles = new Set(existing.map(s => s.title.toLowerCase().trim()));
  let addedCount = 0;

  incoming.forEach(item => {
    if (!item.title || !item.code || !item.language) return;
    if (existingTitles.has(item.title.toLowerCase().trim())) return; // Deduplicate

    const cleanTags = Array.isArray(item.tags)
      ? item.tags.map(t => t.trim().replace(/^#/, ''))
      : (typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) : []);

    const now = new Date().toISOString();
    existing.unshift({
      id: `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: item.title.trim(),
      code: item.code,
      language: item.language.toLowerCase().trim(),
      version: item.version || `${capitalize(item.language)} Modern`,
      description: (item.description || '').trim(),
      notes: (item.notes || '').trim(),
      category: (item.category || 'Imported').trim(),
      course: (item.course || 'Personal Projects').trim(),
      timeComplexity: (item.timeComplexity || 'O(1)').trim(),
      spaceComplexity: (item.spaceComplexity || 'O(1)').trim(),
      tags: cleanTags,
      starred: !!item.starred,
      pinned: !!item.pinned,
      createdAt: item.createdAt || now,
      updatedAt: now,
      annotations: Array.isArray(item.annotations) ? item.annotations : [],
      testCases: Array.isArray(item.testCases) ? item.testCases : []
    });
    existingTitles.add(item.title.toLowerCase().trim());
    addedCount++;
  });

  saveSnippets(existing);
  res.json({ success: true, message: `Successfully imported ${addedCount} snippets.`, count: addedCount, total: existing.length });
});

// 18. POST /api/reset
app.post('/api/reset', (req, res) => {
  try {
    let seedData = '[]';
    if (fs.existsSync(SEED_FILE)) {
      seedData = fs.readFileSync(SEED_FILE, 'utf-8');
    } else if (fs.existsSync(DB_FILE)) {
      seedData = fs.readFileSync(DB_FILE, 'utf-8');
    }
    const parsed = JSON.parse(seedData);
    saveSnippets(parsed);
    return res.json({ success: true, message: 'Snippets Hub restored to standard curriculum seed snippets.', count: parsed.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Start Server (only when run directly, not when imported as serverless function)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Snippets Hub Student Workbench is running live!`);
    console.log(`📡 Localhost URL: http://localhost:${PORT}`);
    console.log(`📚 Storage: ${DB_FILE}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
