# Snippets Hub — Personal Code Library & Learning Notebook for Students

Built strictly according to the **Snippets Hub Product Requirements Document (PRD Version 1.0)** and styled using the **Nocturnal Algorithmic Precision** design system.

---

## 🚀 Live Localhost URL

The application is running live and available at:
**[http://localhost:3000](http://localhost:3000)**

---

## 🌟 PRD Core Capabilities & Interconnected Architecture

### 1. 🏠 Homepage & Command Center (New)
- **Unified Background Aesthetics**: Styled with the Nocturnal Algorithmic Precision dark theme, ambient glow meshes, and glassmorphic panels.
- **Top Header Nav Tabs**: Instant 1-click navigation across `Home`, `Snippets Vault`, `Code Translator`, and `AI Studio`.
- **Direct Workspace Assistants**: 4 distinct launch cards taking students immediately to Snippets Vault, Code Translator, AI Studio, or the Algorithm Sandbox.
- **Live Universal Code Writer & Translator**: Interactive live playground right on the Homepage where students can write or paste custom code, select from starter templates, and translate into Python, C++, TypeScript, Rust, Java, or Go in 1 click.
- **Curriculum Specialization Tracks**: 6 interactive study roadmaps (Data Structures, Graph Algorithms, Systems & Concurrency, Algorithms & DP, Databases & Storage, Frontend & React).
- **Featured Algorithm Showcase**: Curated cards with 1-click `Explain`, `Translate`, and `Inspect` buttons.

### 2. 🗄️ Account & Private Library (P0 MVP)
- **Private Student Notebook**: Owned by individual students (Bhoomika Yadav, CSAI @ GL Bajaj).
- **Persistent Local Database**: High-performance persistent storage ([`data/snippets.json`](file:///c:/Users/pc/Desktop/code%20snippet%20manager/data/snippets.json)) with real-time auto-save.
- **14 Pre-seeded Stanford CS Curriculum Programs**:
  1. *LRU Cache with Doubly Linked List & Hash Map* (Python)
  2. *Dijkstra's Shortest Path with Min-Priority Queue* (C++)
  3. *Merge Sort with Divide-and-Conquer Invariants* (Python)
  4. *Trie Prefix Tree with Autocomplete & Search* (TypeScript)
  5. *Kadane's Dynamic Programming Algorithm (Maximum Subarray)* (Java)
  6. *Kahn's Topological Sort with BFS Cycle Detection* (C++)
  7. *Thread-Safe Shared State with Arc<RwLock<T>>* (Rust)
  8. *Rolling 7-Day Window Moving Average & Partition LAG* (SQL)
  9. *Debounce & Throttle Hook Implementation* (TypeScript)
  10. *Fast I/O & Modular Arithmetic Template* (C++)
  11. *Container With Most Water (Greedy Two-Pointer)* (Python)
  12. *Thread-Safe Ring Buffer (Producer-Consumer)* (Rust)
  13. *Recursive CTE Hierarchical Graph & Tree Traversal* (SQL)
  14. *Left-Leaning Red-Black Tree Balance Invariants* (Java)

### 3. 📝 Snippet CRUD & Learning Notes (P0 MVP)
- **First-Class Learning Notes**: Each snippet includes dedicated **Problem Context / Description** and **Learning Notes** explaining why the code was saved, key invariants, and how to adapt it.
- **Inline Editing of Notes**: Edit learning notes directly from the detail view without leaving the code.
- **Required & Optional Fields**: Required `title`, `code`, `language`; optional `category`, `course`, `tags`, `description`, `notes`, `timeComplexity`, and `spaceComplexity`.
- **Confirmed Deletion**: Modal confirmation protects against accidental data loss.

### 4. 🏷️ Multi-Taxonomy Organization (P0 MVP)
- **Categories**: Dynamic category management with real-time counters in the left sidebar and instant library filtering.
- **Languages**: Fast filtering across Python, C++, TypeScript, Rust, SQL, and Java with visual dialect badges.
- **Tags Cloud**: Algorithmic taxonomy tags (`#recursion`, `#graph-traversal`, `#greedy`, `#heap`, `#concurrency`). Clicking any tag on any card filters the library immediately.
- **Storage Quota Meter**: Visual ledger quota bar (14 / 500 Snippets) with capacity analytics.

### 5. 🔍 Full-Text & Contextual Search (P0 MVP)
- Searches title, code, learning notes, description, language, and taxonomy tags simultaneously.
- Keyboard shortcut: Press `⌘K` or `Ctrl+K` to immediately focus the search bar.
- Layout toggles: Bento Grid view and compact Table/List view.

### 6. 🧠 One-Click AI Code Explanation (P1)
- **Accessible Everywhere**: 1-click `Explain` buttons right on snippet cards, table rows, and the Homepage showcase!
- **Purpose & High-Level Summary**: Explains what the snippet does and why it exists.
- **Step-by-Step Walkthrough**: Detailed phase-by-phase execution trace with line number ranges.
- **Concepts & Invariants**: Identifies the underlying algorithmic paradigms and invariant checks.
- **Caveats & Common Student Mistakes**: Highlights boundary vulnerabilities students miss on exams.
- **Mathematical Rigor Badges**: Formal Big-O Time and Space Complexity with algebraic derivations.

### 7. 💡 AI Solution Assistance / "Help Me Solve" (P1)
- **Socratic Guidance**: Provides educational inquiry without spoon-feeding answers or overwriting source code.
- **Progressive Hints**: Step-by-step clues (Hint 1, Hint 2, Hint 3).
- **1-Click Exploration Branches**: Edge-case verification matrix and memory & cache locality optimizations.

### 8. ⚡ Universal Live Code Writing & Translation Laboratory (P1)
- **Dedicated Interactive Writing Canvas**: Write or paste arbitrary custom code and translate into C++, Python, TypeScript, Java, Rust, or Go with 1 click.
- **Starter Code Presets**: QuickSort, Binary Search, Two Sum, Fibonacci, Reverse Linked List.
- **Paradigmatic Mapping Notes**: Explains type signatures, collection conversions (`list` &harr; `std::vector`), and memory management models.
- **Action Buttons**: Instant Copy, Save as New Snippet in Library, and Explain Code in AI Studio.

### 9. 💾 Import & Export Portability (P2)
- **Export Markdown**: Downloads the entire library as a compiled Markdown archive with code blocks, learning notes, and complexity.
- **Export JSON**: Complete database backup.
- **Import JSON**: Upload `.json` files with automatic validation, deduplication, and merging.
- **Reset to Curriculum Seed**: Restore default Stanford CS seed library at any time.

---

## 🔒 Privacy & Safety Guarantee (PRD Section 8 & 9)

- **Isolated AI Requests**: Only the current snippet and problem context are sent to the AI adapter. No unrelated vault snippets or private credentials are shared.
- **Safe Execution Boundary**: User code is never compiled or executed on the server. The sandbox runs purely simulated, safe test vectors.

---

## 🏃 Running the Application

```powershell
# 1. Install dependencies
npm install

# 2. Start the workbench server
npm start
# or
npm run dev

# 3. Access in browser
http://localhost:3000
```

---

## 🚀 Deploying to Vercel

The project is pre-configured for seamless zero-config deployment on [Vercel](https://vercel.com):

1. **Import into Vercel**:
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
   - Select and import the `Digraj-asthana/Snippets-Hub` repository.
   - Vercel automatically detects [`vercel.json`](file:///c:/Users/pc/Desktop/code%20snippet%20manager/vercel.json) and routes the static assets in `public/` and serverless API in `api/index.js`.
2. **Deploy**:
   - Click **Deploy**. Your Snippets Hub will be live with full API functionality and global CDN delivery!

