/**
 * Snippets Hub - Student Code Vault & Learning Notebook Frontend
 * Implements PRD & Claude Build Prompt specifications
 */

const STATE = {
  snippets: [],
  activeSnippet: null,
  activeMainView: 'home',
  activeAiTab: 'breakdown', // 'breakdown' (explain) | 'socratic' (hints) | 'complexity' | 'translate'
  viewMode: 'grid', // 'grid' | 'table'
  searchQuery: '',
  filterLanguage: 'all',
  filterCategory: 'all',
  filterTag: null,
  filterStarred: false,
  sortBy: 'recent',
  stats: null,
  categories: [],
  tags: [],
  pendingDeleteId: null,
  socraticChat: []
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupEventListeners();
  loadData();
});

async function loadData() {
  await Promise.all([fetchSnippets(), fetchStats(), fetchCategories(), fetchTags()]);
  renderHome();
}

// ================= API CALLS =================
async function fetchSnippets() {
  try {
    const params = new URLSearchParams();
    if (STATE.searchQuery.trim()) params.append('q', STATE.searchQuery.trim());
    if (STATE.filterLanguage && STATE.filterLanguage !== 'all') params.append('language', STATE.filterLanguage);
    if (STATE.filterCategory && STATE.filterCategory !== 'all') params.append('category', STATE.filterCategory);
    if (STATE.filterTag) params.append('tag', STATE.filterTag);
    if (STATE.filterStarred) params.append('starred', 'true');
    if (STATE.sortBy) params.append('sort', STATE.sortBy);

    const res = await fetch(`/api/snippets?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      STATE.snippets = data.data;
      renderSnippets();
      updatePillCounts();

      // If no active snippet is set, default to Dijkstra or first available
      if (!STATE.activeSnippet && STATE.snippets.length > 0) {
        const defaultSnippet = STATE.snippets.find(s => s.id === 'dijkstra-cpp') || STATE.snippets[0];
        setActiveSnippet(defaultSnippet, false);
      } else if (STATE.activeSnippet) {
        const refreshed = STATE.snippets.find(s => s.id === STATE.activeSnippet.id);
        if (refreshed) {
          STATE.activeSnippet = refreshed;
          if (STATE.activeMainView === 'ai-studio') renderAiStudio();
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch snippets:', err);
    showToast('Failed to load snippets from local server', 'error');
  }
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success) {
      STATE.stats = data.data;
      renderStats();
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
}

async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
      STATE.categories = data.data;
      renderCategoriesSidebar();
    }
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
}

async function fetchTags() {
  try {
    const res = await fetch('/api/tags');
    const data = await res.json();
    if (data.success) {
      STATE.tags = data.data;
      renderTagsSidebar();
    }
  } catch (err) {
    console.error('Failed to fetch tags:', err);
  }
}

async function toggleStarApi(id) {
  try {
    const res = await fetch(`/api/snippets/${id}/star`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      showToast(data.starred ? 'Snippet added to Favorites' : 'Snippet removed from Favorites', 'info');
      await Promise.all([fetchSnippets(), fetchStats()]);
    }
  } catch (err) {
    showToast('Failed to update star', 'error');
  }
}

async function togglePinApi(id) {
  try {
    const res = await fetch(`/api/snippets/${id}/pin`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      showToast(data.pinned ? 'Snippet pinned to top' : 'Snippet unpinned', 'info');
      await fetchSnippets();
    }
  } catch (err) {
    showToast('Failed to update pin', 'error');
  }
}

async function deleteSnippetApi(id) {
  try {
    const res = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Snippet deleted successfully', 'info');
      if (STATE.activeSnippet && STATE.activeSnippet.id === id) {
        STATE.activeSnippet = STATE.snippets.find(s => s.id !== id) || null;
      }
      closeDeleteModal();
      await Promise.all([fetchSnippets(), fetchStats(), fetchCategories(), fetchTags()]);
    }
  } catch (err) {
    showToast('Failed to delete snippet', 'error');
  }
}

// ================= CODE PRESETS FOR PLAYGROUND =================
const CODE_PRESETS = {
  custom: {
    code: '',
    sourceLang: 'python',
    targetLang: 'cpp'
  },
  quicksort: {
    code: `def quick_sort(arr: list[int]) -> list[int]:
    """In-place or partitioned recursive quick sort."""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
    sourceLang: 'python',
    targetLang: 'cpp'
  },
  binarysearch: {
    code: `def binary_search(arr: list[int], target: int) -> int:
    """Iterative O(log N) binary search returning target index or -1."""
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    sourceLang: 'python',
    targetLang: 'typescript'
  },
  twosum: {
    code: `#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`,
    sourceLang: 'cpp',
    targetLang: 'python'
  },
  fib: {
    code: `export function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  const res = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, res);
  return res;
}`,
    sourceLang: 'typescript',
    targetLang: 'python'
  },
  reverseList: {
    code: `public class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }

    public static ListNode reverse(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`,
    sourceLang: 'java',
    targetLang: 'python'
  }
};

// ================= NAVIGATION & ROUTING =================
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      switchView(view);
    });
  });

  // Top Header Nav Tabs
  const headerTabs = document.querySelectorAll('.header-nav-tab');
  headerTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.getAttribute('data-target');
      switchView(target);
    });
  });

  const btnBack = document.getElementById('btnBackToSnippets');
  if (btnBack) {
    btnBack.addEventListener('click', () => switchView('snippets'));
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'snippets', 'ai-studio', 'translate', 'settings'].includes(hash)) {
      switchView(hash);
    }
  });

  const initHash = window.location.hash.replace('#', '');
  if (initHash && ['home', 'snippets', 'ai-studio', 'translate', 'settings'].includes(initHash)) {
    switchView(initHash);
  } else {
    switchView('home');
  }
}

function switchView(viewName) {
  STATE.activeMainView = viewName;
  window.location.hash = viewName;

  // Update Sidebar Links
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active', 'bg-emerald-500/10', 'text-emerald-300', 'border-emerald-500/20');
      link.classList.remove('text-[#94a3b8]', 'border-transparent');
    } else {
      link.classList.remove('active', 'bg-emerald-500/10', 'text-emerald-300', 'border-emerald-500/20');
      link.classList.add('text-[#94a3b8]', 'border-transparent');
    }
  });

  // Update Top Header Tabs
  document.querySelectorAll('.header-nav-tab').forEach(tab => {
    if (tab.getAttribute('data-target') === viewName) {
      tab.classList.add('active', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
      tab.classList.remove('text-[#94a3b8]', 'border-transparent');
    } else {
      tab.classList.remove('active', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
      tab.classList.add('text-[#94a3b8]', 'border-transparent');
    }
  });

  const views = {
    'home': document.getElementById('viewHome'),
    'snippets': document.getElementById('viewSnippets'),
    'ai-studio': document.getElementById('viewAiStudio'),
    'translate': document.getElementById('viewTranslate'),
    'settings': document.getElementById('viewSettings')
  };

  Object.keys(views).forEach(v => {
    if (views[v]) {
      if (v === viewName) {
        views[v].classList.remove('hidden');
        views[v].classList.add('flex');
      } else {
        views[v].classList.add('hidden');
        views[v].classList.remove('flex');
      }
    }
  });

  if (viewName === 'home') {
    renderHome();
  } else if (viewName === 'ai-studio') {
    renderAiStudio();
  } else if (viewName === 'translate') {
    initStandaloneTranslate();
  } else if (viewName === 'snippets') {
    renderSnippets();
  }
}

// ================= RENDER HOMEPAGE =================
function renderHome() {
  const container = document.getElementById('viewHome');
  if (!container) return;

  // Initialize Home CTA Buttons
  const btnHeroOpenSnippets = document.getElementById('btnHeroOpenSnippets');
  const btnHeroOpenTranslate = document.getElementById('btnHeroOpenTranslate');
  const btnHeroOpenAi = document.getElementById('btnHeroOpenAi');
  const btnHeroNewSnippet = document.getElementById('btnHeroNewSnippet');

  if (btnHeroOpenSnippets) btnHeroOpenSnippets.onclick = () => switchView('snippets');
  if (btnHeroOpenTranslate) btnHeroOpenTranslate.onclick = () => switchView('translate');
  if (btnHeroOpenAi) btnHeroOpenAi.onclick = () => switchView('ai-studio');
  if (btnHeroNewSnippet) btnHeroNewSnippet.onclick = () => openCreateSnippetModal();

  // Initialize Direct Workspace Assistant Buttons
  const btnWsSnippets = document.getElementById('btnDirectWorkspaceSnippets');
  const btnWsTranslate = document.getElementById('btnDirectWorkspaceTranslate');
  const btnWsAi = document.getElementById('btnDirectWorkspaceAi');
  const btnWsSandbox = document.getElementById('btnDirectWorkspaceSandbox');

  if (btnWsSnippets) btnWsSnippets.onclick = () => switchView('snippets');
  if (btnWsTranslate) btnWsTranslate.onclick = () => switchView('translate');
  if (btnWsAi) btnWsAi.onclick = () => switchView('ai-studio');
  if (btnWsSandbox) {
    btnWsSandbox.onclick = () => {
      switchView('ai-studio');
      setTimeout(() => {
        const btnRun = document.getElementById('btnRunSandbox');
        if (btnRun) btnRun.click();
      }, 300);
    };
  }

  // Populate Curriculum Tracks Spotlight
  const tracksContainer = document.getElementById('homeCurriculumTracksContainer');
  if (tracksContainer) {
    const tracks = [
      { name: 'Data Structures', icon: 'account_tree', desc: 'LRU Cache, Red-Black, Trie' },
      { name: 'Graph Algorithms', icon: 'hub', desc: 'Dijkstra, Kahn Topo Sort' },
      { name: 'Systems & Concurrency', icon: 'memory', desc: 'RwLock, Ring Buffer' },
      { name: 'Algorithms & DP', icon: 'speed', desc: 'Merge Sort, Kadane DP' },
      { name: 'Databases & Storage', icon: 'database', desc: 'Recursive CTE, Window LAG' },
      { name: 'Frontend & React', icon: 'devices', desc: 'Debounce & Throttle Hook' }
    ];

    tracksContainer.innerHTML = tracks.map(t => {
      const count = STATE.snippets.filter(s => (s.category || '').toLowerCase().includes(t.name.toLowerCase().split(' ')[0])).length;
      return `
        <div class="track-pill bg-[#131b2e] border border-[#1e293b] rounded-xl p-3 flex flex-col justify-between gap-2 cursor-pointer shadow-sm hover:border-emerald-500/40 transition-all" data-category="${t.name}">
          <div class="flex items-center justify-between">
            <span class="material-symbols-outlined text-base text-emerald-400">${t.icon}</span>
            <span class="font-label-mono-sm text-[10px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">${count || 2}</span>
          </div>
          <div>
            <span class="font-body-md text-xs font-semibold text-[#dae2fd] block">${t.name}</span>
            <span class="text-[10px] text-[#64748b] block mt-0.5 truncate">${t.desc}</span>
          </div>
        </div>
      `;
    }).join('');

    tracksContainer.querySelectorAll('.track-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-category');
        STATE.filterCategory = cat;
        STATE.filterLanguage = 'all';
        STATE.filterTag = null;
        switchView('snippets');
      });
    });
  }

  // Populate Featured Core Algorithms Showcase
  const featuredContainer = document.getElementById('homeFeaturedSnippetsContainer');
  if (featuredContainer && STATE.snippets.length > 0) {
    const featuredList = [
      STATE.snippets.find(s => s.id === 'dijkstra-cpp') || STATE.snippets[0],
      STATE.snippets.find(s => s.id === 'lru-cache-python') || STATE.snippets[1],
      STATE.snippets.find(s => s.id === 'merge-sort-python') || STATE.snippets[2],
      STATE.snippets.find(s => s.id === 'trie-prefix-tree-ts') || STATE.snippets[3]
    ].filter(Boolean);

    featuredContainer.innerHTML = featuredList.map(s => {
      const langColor = getLanguageColor(s.language);
      return `
        <div class="bg-[#131b2e] border border-[#1e293b] hover:border-slate-600 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md transition-all">
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1e293b] text-[#dae2fd] border border-slate-700 font-label-mono-sm text-[10.5px]">
                <span class="w-1.5 h-1.5 rounded-full ${langColor}"></span>
                ${s.version || capitalize(s.language)}
              </span>
              <span class="font-label-mono-sm text-[10px] text-teal-300 bg-teal-950/60 border border-teal-500/20 px-2 py-0.5 rounded">
                ${s.timeComplexity || 'O(1)'}
              </span>
            </div>
            <h3 class="font-headline-sm text-sm font-semibold text-[#dae2fd] mt-1">${escapeHtml(s.title)}</h3>
            <p class="text-xs text-[#94a3b8] line-clamp-2">${escapeHtml(s.description || s.notes || '')}</p>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-[#1e293b]">
            <span class="font-label-mono-sm text-[10.5px] text-[#64748b]">${s.category || 'Algorithms'}</span>
            <div class="flex items-center gap-1.5">
              <button class="px-2.5 py-1 rounded bg-[#0b1326] border border-[#1e293b] hover:bg-[#1e293b] text-[#cbd5e1] font-label-mono-sm text-[11px] btn-home-inspect" data-id="${s.id}">
                Inspect
              </button>
              <button class="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-label-mono-sm text-[11px] btn-home-explain flex items-center gap-1" data-id="${s.id}">
                <span class="material-symbols-outlined text-xs">psychology</span> Explain
              </button>
              <button class="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-label-mono-sm text-[11px] btn-home-translate flex items-center gap-1" data-id="${s.id}">
                <span class="material-symbols-outlined text-xs">compare_arrows</span> Translate
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    featuredContainer.querySelectorAll('.btn-home-inspect').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const s = STATE.snippets.find(x => x.id === id);
        if (s) setActiveSnippet(s, true);
      };
    });

    featuredContainer.querySelectorAll('.btn-home-explain').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const s = STATE.snippets.find(x => x.id === id);
        if (s) {
          setActiveSnippet(s, false);
          STATE.activeAiTab = 'breakdown';
          switchView('ai-studio');
        }
      };
    });

    featuredContainer.querySelectorAll('.btn-home-translate').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const s = STATE.snippets.find(x => x.id === id);
        if (s) {
          setActiveSnippet(s, false);
          switchView('translate');
          const sourceCodeInput = document.getElementById('standaloneSourceCode');
          const sourceLangSelect = document.getElementById('standaloneSourceLang');
          const targetLangSelect = document.getElementById('standaloneTargetLang');
          if (sourceCodeInput) sourceCodeInput.value = s.code;
          if (sourceLangSelect) sourceLangSelect.value = s.language || 'python';
          if (targetLangSelect) targetLangSelect.value = s.language === 'python' ? 'cpp' : 'python';
          const btnTranslate = document.getElementById('btnRunStandaloneTranslate');
          if (btnTranslate) btnTranslate.click();
        }
      };
    });
  }

  const btnViewAll = document.getElementById('btnHomeViewAllSnippets');
  if (btnViewAll) btnViewAll.onclick = () => switchView('snippets');

  // Setup Live Universal Code Translator on Homepage
  setupHomeTranslator();
}

// ================= SETUP LIVE HOMEPAGE TRANSLATOR =================
function setupHomeTranslator() {
  const sourceCodeInput = document.getElementById('homeSourceCode');
  const sourceLangSelect = document.getElementById('homeSourceLang');
  const targetLangSelect = document.getElementById('homeTargetLang');
  const presetSelect = document.getElementById('homeSelectPreset');
  const btnTranslate = document.getElementById('btnHomeTranslateCode');
  const resultCanvas = document.getElementById('homeResultCodeCanvas');
  const notesList = document.getElementById('homeMappingNotesList');
  const btnClear = document.getElementById('btnHomeClearSource');
  const btnCopy = document.getElementById('btnHomeCopyResult');
  const btnSave = document.getElementById('btnHomeSaveSnippet');
  const btnExplain = document.getElementById('btnHomeExplainResult');
  const targetHeader = document.getElementById('homeTargetCanvasHeader');

  if (presetSelect && sourceCodeInput) {
    presetSelect.onchange = () => {
      const val = presetSelect.value;
      if (CODE_PRESETS[val]) {
        sourceCodeInput.value = CODE_PRESETS[val].code;
        if (CODE_PRESETS[val].sourceLang) sourceLangSelect.value = CODE_PRESETS[val].sourceLang;
        if (CODE_PRESETS[val].targetLang) targetLangSelect.value = CODE_PRESETS[val].targetLang;
        if (CODE_PRESETS[val].code) {
          btnTranslate.click();
        }
      }
    };
    if (!sourceCodeInput.value) {
      presetSelect.value = 'quicksort';
      sourceCodeInput.value = CODE_PRESETS.quicksort.code;
      sourceLangSelect.value = 'python';
      targetLangSelect.value = 'cpp';
    }
  }

  if (btnClear && sourceCodeInput) {
    btnClear.onclick = () => {
      sourceCodeInput.value = '';
      resultCanvas.innerHTML = `<span class="text-[#64748b] italic">// Cleared. Write or paste new code...</span>`;
      presetSelect.value = 'custom';
      showToast('Source canvas cleared', 'info');
    };
  }

  if (btnTranslate && sourceCodeInput) {
    btnTranslate.onclick = async () => {
      const code = sourceCodeInput.value.trim();
      const sourceLang = sourceLangSelect.value;
      const targetLang = targetLangSelect.value;

      if (!code) {
        showToast('Please enter code to translate', 'warning');
        return;
      }

      btnTranslate.innerHTML = `<span class="material-symbols-outlined text-sm font-bold animate-spin">sync</span><span>Translating...</span>`;
      resultCanvas.innerHTML = `<span class="text-[#64748b] italic">Translating code idiomatic to ${capitalize(targetLang)} with invariant preservation...</span>`;
      if (targetHeader) targetHeader.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span> ${capitalize(targetLang)} Translated Output`;

      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang
          })
        });

        const data = await res.json();
        if (data.success && data.data) {
          const trans = data.data;
          resultCanvas.innerHTML = `<pre class="m-0">${highlightCode(trans.translatedCode, targetLang)}</pre>`;
          if (notesList && trans.mappingNotes) {
            notesList.innerHTML = trans.mappingNotes.map(n => `<li>${escapeHtml(n)}</li>`).join('');
          }
          showToast(`Successfully translated to ${capitalize(targetLang)}!`, 'success');
        } else {
          resultCanvas.textContent = 'Translation failed: ' + (data.message || 'Unknown error');
        }
      } catch (err) {
        resultCanvas.textContent = 'Network or server error during translation.';
      } finally {
        btnTranslate.innerHTML = `<span class="material-symbols-outlined text-sm font-bold">sync_alt</span><span>Translate Code Now</span>`;
      }
    };
  }

  if (btnCopy && resultCanvas) {
    btnCopy.onclick = () => {
      const text = resultCanvas.innerText;
      if (text && !text.includes('Translating') && !text.includes('Select code above')) {
        copyToClipboard(text, 'Translated code copied to clipboard!');
      } else {
        showToast('No translated code to copy yet', 'warning');
      }
    };
  }

  if (btnSave && resultCanvas) {
    btnSave.onclick = () => {
      const text = resultCanvas.innerText;
      const target = targetLangSelect.value;
      if (!text || text.includes('Select code above')) {
        showToast('Please translate code first before saving', 'warning');
        return;
      }
      openCreateSnippetModal();
      document.getElementById('inputSnippetTitle').value = `Translated Algorithm (${capitalize(target)})`;
      document.getElementById('selectSnippetLanguage').value = target;
      document.getElementById('inputSnippetCategory').value = 'Algorithms & DP';
      document.getElementById('inputSnippetCourse').value = 'CS Curriculum';
      document.getElementById('textareaSnippetCode').value = text;
      document.getElementById('inputSnippetDesc').value = `Idiomatically translated from ${capitalize(sourceLangSelect.value)} to ${capitalize(target)}.`;
      document.getElementById('inputSnippetNotes').value = `Paradigmatic conversion with asymptotic invariance.`;
      document.getElementById('inputSnippetTags').value = `translated, ${target}, algorithm`;
      showToast('Pre-filled new snippet modal!', 'info');
    };
  }

  if (btnExplain) {
    btnExplain.onclick = async () => {
      const sourceCode = sourceCodeInput.value.trim();
      if (!sourceCode) {
        showToast('Please write code to explain', 'warning');
        return;
      }
      const tempSnippet = {
        id: 'custom-playground-code',
        title: 'Custom Algorithm Playground',
        code: sourceCode,
        language: sourceLangSelect.value,
        category: 'Playground',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        description: 'Custom code written in Snippets Hub Playground',
        notes: 'Explaining user-provided code'
      };
      setActiveSnippet(tempSnippet, false);
      STATE.activeAiTab = 'breakdown';
      switchView('ai-studio');
      showToast('Analyzing code in AI Studio...', 'info');
    };
  }
}

// ================= RENDER SNIPPETS EXPLORER =================
function renderSnippets() {
  const container = document.getElementById('snippetsGridContainer');
  const tableContainer = document.getElementById('snippetsTableContainer');
  const tableBody = document.getElementById('snippetsTableBody');
  const emptyState = document.getElementById('emptyStateContainer');
  const titleElem = document.getElementById('explorerViewTitle');
  const badgeElem = document.getElementById('explorerTotalAssetBadge');

  if (!container) return;

  // Title & Count
  let title = 'All Snippets';
  if (STATE.filterCategory !== 'all') title = `Category: ${STATE.filterCategory}`;
  else if (STATE.filterLanguage !== 'all') title = `${capitalize(STATE.filterLanguage)} Snippets`;
  else if (STATE.filterTag) title = `#${STATE.filterTag}`;
  else if (STATE.filterStarred) title = 'Favorites / Starred';
  else if (STATE.searchQuery.trim()) title = `Search: "${STATE.searchQuery}"`;

  titleElem.textContent = title;
  badgeElem.textContent = `${STATE.snippets.length} total assets`;

  renderActiveFiltersBar();

  if (STATE.snippets.length === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    tableContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
    return;
  }

  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');

  if (STATE.viewMode === 'table') {
    container.classList.add('hidden');
    tableContainer.classList.remove('hidden');
    renderTableView(tableBody);
  } else {
    container.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    renderGridView(container);
  }
}

function renderGridView(container) {
  container.innerHTML = STATE.snippets.map((snippet, idx) => {
    const isPinned = snippet.pinned;
    const isStarred = snippet.starred;
    const langColor = getLanguageColor(snippet.language);
    const codeSnippetPreview = snippet.code.split('\n').slice(0, 8).join('\n');
    const highlightedCode = highlightCode(codeSnippetPreview, snippet.language);
    const lineCount = snippet.code.split('\n').length;
    const isFeatureCard = isPinned || (idx === 0 && !STATE.searchQuery && STATE.filterLanguage === 'all' && STATE.filterCategory === 'all');

    return `
      <article class="snippet-card ${isFeatureCard ? 'col-span-1 md:col-span-2' : 'col-span-1'} bg-[#131b2e] border border-[#1e293b] rounded-xl shadow-lg p-5 flex flex-col justify-between gap-3.5 transition-all" data-id="${snippet.id}">
        <!-- Card Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            ${isPinned ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-label-mono-sm text-[10px] font-semibold">
                <span class="material-symbols-outlined text-[11px]">push_pin</span> PINNED
              </span>
            ` : ''}
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1e293b] text-[#dae2fd] border border-slate-700 font-label-mono-sm text-[11px]">
              <span class="w-1.5 h-1.5 rounded-full ${langColor}"></span>
              ${snippet.version || capitalize(snippet.language)}
            </span>
            <span class="font-label-mono-sm text-[11px] text-[#94a3b8] flex items-center gap-1">
              <span class="material-symbols-outlined text-xs text-primary">folder</span>
              ${snippet.category || 'General'}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="inline-flex items-center px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 font-label-mono-sm text-[10px] font-semibold">
              Time: ${snippet.timeComplexity || 'O(1)'}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded bg-[#0b1326] border border-[#1e293b] text-[#94a3b8] font-label-mono-sm text-[10px]">
              Space: ${snippet.spaceComplexity || 'O(1)'}
            </span>
            <button class="p-1 rounded text-amber-400 hover:bg-[#1e293b] transition-colors btn-star" data-id="${snippet.id}" title="${isStarred ? 'Unstar' : 'Star'}">
              <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' ${isStarred ? 1 : 0};">star</span>
            </button>
            <button class="p-1 rounded text-[#94a3b8] hover:bg-[#1e293b] hover:text-rose-400 transition-colors btn-delete" data-id="${snippet.id}" title="Delete">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </div>

        <!-- Title & Description / Context -->
        <div class="flex flex-col gap-1">
          <h2 class="font-headline-sm text-base text-[#dae2fd] font-semibold cursor-pointer hover:text-emerald-400 transition-colors btn-open-detail" data-id="${snippet.id}">
            ${escapeHtml(snippet.title)}
          </h2>
          <p class="text-xs text-[#94a3b8] leading-relaxed line-clamp-2">
            ${escapeHtml(snippet.description || 'No description provided.')}
          </p>
          ${snippet.notes ? `
            <div class="mt-1 px-2.5 py-1.5 rounded-lg bg-[#0b1326] border border-[#1e293b] flex items-start gap-1.5 text-[11px] text-[#cbd5e1]">
              <span class="material-symbols-outlined text-xs text-amber-400 mt-0.5 shrink-0">menu_book</span>
              <span class="line-clamp-1 italic"><strong class="text-amber-300 font-medium not-italic">Note:</strong> ${escapeHtml(snippet.notes)}</span>
            </div>
          ` : ''}
        </div>

        <!-- Sunken Code Preview -->
        <div class="bg-[#060e20] border border-[#1e293b] rounded-lg overflow-hidden flex flex-col font-code-block text-xs shadow-inner">
          <div class="bg-[#0b1326] border-b border-[#1e293b] px-3 py-1 flex items-center justify-between text-[#94a3b8] text-[11px] select-none">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-rose-500/80 inline-block"></span>
              <span class="w-2 h-2 rounded-full bg-amber-500/80 inline-block"></span>
              <span class="w-2 h-2 rounded-full bg-emerald-500/80 inline-block"></span>
              <span class="font-label-mono-sm text-[#94a3b8] ml-1.5">${snippet.id}.${getFileExtension(snippet.language)}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-label-mono-sm text-[#64748b]">${lineCount} lines</span>
              <button class="text-[#94a3b8] hover:text-[#dae2fd] flex items-center gap-1 font-label-mono-sm btn-copy-code" data-id="${snippet.id}" title="Copy code">
                <span class="material-symbols-outlined text-xs">content_copy</span> Copy
              </button>
            </div>
          </div>
          <div class="p-3 overflow-x-auto leading-relaxed select-text cursor-pointer btn-open-detail" data-id="${snippet.id}">
            <pre class="m-0">${highlightedCode}</pre>
          </div>
        </div>

        <!-- Card Footer Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#1e293b]/60">
          <div class="flex items-center gap-1 flex-wrap">
            ${(snippet.tags || []).map(t => `
              <span class="px-2 py-0.5 rounded bg-[#0b1326] border border-[#1e293b] font-label-mono-sm text-[10px] text-[#94a3b8] cursor-pointer hover:border-emerald-500/50 hover:text-emerald-300 transition-colors btn-tag-filter" data-tag="${t.replace('#', '')}">
                #${t.replace('#', '')}
              </span>
            `).join('')}
          </div>

          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold font-body-sm text-xs hover:bg-emerald-400 transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.25)] btn-explain-ai" data-id="${snippet.id}">
              <span class="material-symbols-outlined text-sm font-bold">psychology</span>
              <span>Explain</span>
            </button>
            <button class="px-2.5 py-1.5 rounded-lg bg-[#0b1326] border border-[#1e293b] text-[#dae2fd] font-body-sm text-xs hover:bg-[#1e293b] hover:border-slate-600 transition-colors flex items-center gap-1 btn-quick-translate" data-id="${snippet.id}">
              <span class="material-symbols-outlined text-sm text-teal-400">compare_arrows</span>
              <span>Translate</span>
            </button>
            <button class="p-1 rounded text-[#94a3b8] hover:bg-[#1e293b] hover:text-emerald-400 btn-pin" data-id="${snippet.id}" title="${isPinned ? 'Unpin' : 'Pin'}">
              <span class="material-symbols-outlined text-base">push_pin</span>
            </button>
            <button class="p-1 rounded text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#dae2fd] btn-edit-snippet" data-id="${snippet.id}" title="Edit snippet">
              <span class="material-symbols-outlined text-base">edit</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  attachCardEventListeners(container);
}

function renderTableView(tableBody) {
  tableBody.innerHTML = STATE.snippets.map(snippet => `
    <tr class="hover:bg-[#1e293b]/50 transition-colors cursor-pointer" data-id="${snippet.id}">
      <td class="p-3">
        <button class="text-amber-400 btn-star" data-id="${snippet.id}">
          <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' ${snippet.starred ? 1 : 0};">star</span>
        </button>
      </td>
      <td class="p-3 btn-open-detail" data-id="${snippet.id}">
        <div class="flex flex-col">
          <span class="font-semibold text-[#dae2fd] hover:text-emerald-400">${escapeHtml(snippet.title)}</span>
          <span class="text-[#94a3b8] text-[11px] truncate max-w-md">${escapeHtml(snippet.notes || snippet.description || '')}</span>
        </div>
      </td>
      <td class="p-3 font-label-mono-sm text-[11px] text-[#94a3b8]">${snippet.category || snippet.course || '-'}</td>
      <td class="p-3 font-label-mono-sm text-[11px] text-teal-300">${snippet.version || capitalize(snippet.language)}</td>
      <td class="p-3 font-label-mono-sm text-[11px] text-emerald-400">${snippet.timeComplexity || 'O(1)'}</td>
      <td class="p-3">
        <div class="flex items-center gap-1 flex-wrap">
          ${(snippet.tags || []).slice(0, 3).map(t => `
            <span class="px-1.5 py-0.5 rounded bg-[#0b1326] border border-[#1e293b] font-label-mono-sm text-[10px] text-[#94a3b8]">#${t.replace('#', '')}</span>
          `).join('')}
        </div>
      </td>
      <td class="p-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button class="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500 hover:text-slate-950 transition-all btn-explain-ai" data-id="${snippet.id}">Explain</button>
          <button class="p-1 rounded text-[#94a3b8] hover:text-emerald-300 btn-copy-code" data-id="${snippet.id}" title="Copy code"><span class="material-symbols-outlined text-sm">content_copy</span></button>
          <button class="p-1 rounded text-[#94a3b8] hover:text-rose-400 btn-delete" data-id="${snippet.id}" title="Delete"><span class="material-symbols-outlined text-sm">delete</span></button>
        </div>
      </td>
    </tr>
  `).join('');

  attachCardEventListeners(tableBody);
}

function attachCardEventListeners(root) {
  root.querySelectorAll('.btn-open-detail').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      const snippet = STATE.snippets.find(s => s.id === id);
      if (snippet) {
        setActiveSnippet(snippet, true);
      }
    });
  });

  root.querySelectorAll('.btn-explain-ai').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      const snippet = STATE.snippets.find(s => s.id === id);
      if (snippet) {
        setActiveSnippet(snippet, false);
        STATE.activeAiTab = 'breakdown';
        switchView('ai-studio');
      }
    });
  });

  root.querySelectorAll('.btn-quick-translate').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      const snippet = STATE.snippets.find(s => s.id === id);
      if (snippet) {
        setActiveSnippet(snippet, false);
        switchView('translate');
        const sourceCodeInput = document.getElementById('standaloneSourceCode');
        const sourceLangSelect = document.getElementById('standaloneSourceLang');
        const targetLangSelect = document.getElementById('standaloneTargetLang');
        if (sourceCodeInput) sourceCodeInput.value = snippet.code;
        if (sourceLangSelect) sourceLangSelect.value = snippet.language || 'python';
        if (targetLangSelect) targetLangSelect.value = snippet.language === 'python' ? 'cpp' : 'python';
        const btnTranslate = document.getElementById('btnRunStandaloneTranslate');
        if (btnTranslate) btnTranslate.click();
      }
    });
  });

  root.querySelectorAll('.btn-star').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      toggleStarApi(id);
    });
  });

  root.querySelectorAll('.btn-pin').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      togglePinApi(id);
    });
  });

  root.querySelectorAll('.btn-copy-code').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      const snippet = STATE.snippets.find(s => s.id === id);
      if (snippet) {
        copyToClipboard(snippet.code, 'Snippet code copied to clipboard!');
      }
    });
  });

  root.querySelectorAll('.btn-edit-snippet').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      const snippet = STATE.snippets.find(s => s.id === id);
      if (snippet) {
        openEditSnippetModal(snippet);
      }
    });
  });

  root.querySelectorAll('.btn-delete').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      const snippet = STATE.snippets.find(s => s.id === id);
      if (snippet) {
        openDeleteModal(snippet);
      }
    });
  });

  root.querySelectorAll('.btn-tag-filter').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = el.getAttribute('data-tag');
      STATE.filterTag = tag;
      fetchSnippets();
    });
  });
}

function renderActiveFiltersBar() {
  const bar = document.getElementById('activeFiltersBar');
  const tagsContainer = document.getElementById('activeFilterTags');
  if (!bar || !tagsContainer) return;

  const filters = [];
  if (STATE.filterCategory !== 'all') filters.push({ type: 'Category', val: STATE.filterCategory, key: 'category' });
  if (STATE.filterLanguage !== 'all') filters.push({ type: 'Language', val: STATE.filterLanguage, key: 'language' });
  if (STATE.filterTag) filters.push({ type: 'Tag', val: `#${STATE.filterTag}`, key: 'tag' });
  if (STATE.filterStarred) filters.push({ type: 'Favorites', val: 'Starred Only', key: 'starred' });
  if (STATE.searchQuery.trim()) filters.push({ type: 'Search', val: `"${STATE.searchQuery}"`, key: 'search' });

  if (filters.length === 0) {
    bar.classList.add('hidden');
    bar.classList.remove('flex');
    return;
  }

  bar.classList.remove('hidden');
  bar.classList.add('flex');

  tagsContainer.innerHTML = filters.map(f => `
    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-label-mono-sm text-[11px]">
      <strong class="text-white">${f.type}:</strong> ${f.val}
      <button class="hover:text-white transition-colors btn-remove-filter" data-key="${f.key}">
        <span class="material-symbols-outlined text-xs">close</span>
      </button>
    </span>
  `).join('');

  tagsContainer.querySelectorAll('.btn-remove-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      if (key === 'category') STATE.filterCategory = 'all';
      if (key === 'language') STATE.filterLanguage = 'all';
      if (key === 'tag') STATE.filterTag = null;
      if (key === 'starred') STATE.filterStarred = false;
      if (key === 'search') {
        STATE.searchQuery = '';
        document.getElementById('globalSearchInput').value = '';
        document.getElementById('explorerSearchInput').value = '';
      }
      fetchSnippets();
    });
  });
}

function updatePillCounts() {
  const allCount = STATE.snippets.length;
  const pillAll = document.getElementById('pillCountAll');
  if (pillAll) pillAll.textContent = allCount;
}

// ================= RENDER STATS & SIDEBAR =================
function renderStats() {
  if (!STATE.stats) return;

  const { quota, languages } = STATE.stats;

  const quotaText = document.getElementById('quotaText');
  const quotaBar = document.getElementById('quotaBar');
  const quotaPercent = document.getElementById('quotaPercent');
  if (quotaText) quotaText.textContent = `${quota.used} / ${quota.max}`;
  if (quotaBar) quotaBar.style.width = `${Math.min(100, quota.percentage)}%`;
  if (quotaPercent) quotaPercent.textContent = `${quota.percentage}% capacity`;

  const settingsQuotaText = document.getElementById('settingsQuotaText');
  const settingsQuotaPercent = document.getElementById('settingsQuotaPercent');
  if (settingsQuotaText) settingsQuotaText.textContent = `${quota.used} / ${quota.max} Snippets`;
  if (settingsQuotaPercent) settingsQuotaPercent.textContent = `${quota.percentage}% capacity used`;

  // Render Languages grid
  const langContainer = document.getElementById('sidebarLanguagesContainer');
  if (langContainer && languages) {
    const langKeys = Object.keys(languages);
    langContainer.innerHTML = langKeys.map(lang => {
      const count = languages[lang];
      const color = getLanguageColor(lang);
      const isActive = STATE.filterLanguage === lang;
      return `
        <button class="flex items-center justify-between px-2 py-1 rounded-lg border text-left transition-colors ${isActive ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-medium' : 'bg-[#0b1326] border-[#1e293b] text-[#dae2fd] hover:border-slate-600'}" data-lang="${lang}">
          <span class="flex items-center gap-1 font-label-mono-sm text-[11px] truncate">
            <span class="w-1.5 h-1.5 rounded-full ${color}"></span>
            ${capitalize(lang)}
          </span>
          <span class="font-label-mono-sm text-[10px] text-[#94a3b8]">${count}</span>
        </button>
      `;
    }).join('');

    langContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const l = btn.getAttribute('data-lang');
        STATE.filterLanguage = (STATE.filterLanguage === l) ? 'all' : l;
        updateLangPills();
        switchView('snippets');
        fetchSnippets();
      });
    });
  }
}

function renderCategoriesSidebar() {
  const container = document.getElementById('sidebarCategoriesContainer');
  const badge = document.getElementById('sidebarCategoryCountBadge');
  if (!container) return;

  if (badge) badge.textContent = STATE.categories.length;

  container.innerHTML = STATE.categories.map(cat => {
    const isActive = STATE.filterCategory === cat.name;
    return `
      <button class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${isActive ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium' : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#dae2fd]'}" data-cat="${cat.name}">
        <span class="flex items-center gap-2 text-xs truncate">
          <span class="material-symbols-outlined text-sm ${isActive ? 'text-emerald-400' : 'text-[#94a3b8]'}">folder</span>
          ${cat.name}
        </span>
        <span class="font-label-mono-sm text-[10px] px-1.5 py-0.5 rounded bg-[#0b1326] text-[#cbd5e1] border border-[#1e293b]">${cat.count}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.getAttribute('data-cat');
      STATE.filterCategory = (STATE.filterCategory === c) ? 'all' : c;
      switchView('snippets');
      fetchSnippets();
    });
  });
}

function renderTagsSidebar() {
  const container = document.getElementById('sidebarTagsContainer');
  if (!container) return;

  container.innerHTML = STATE.tags.map(t => {
    const isActive = STATE.filterTag === t.name;
    return `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-sm text-[10px] cursor-pointer transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-[#1e293b] text-[#cbd5e1] border border-slate-700 hover:bg-slate-700'}" data-tag="${t.name}">
        #${t.name} <span class="text-[9px] text-[#94a3b8]">(${t.count})</span>
      </span>
    `;
  }).join('');

  container.querySelectorAll('span').forEach(sp => {
    sp.addEventListener('click', () => {
      const t = sp.getAttribute('data-tag');
      STATE.filterTag = (STATE.filterTag === t) ? null : t;
      switchView('snippets');
      fetchSnippets();
    });
  });
}

// ================= AI STUDIO & DETAIL INSPECTOR =================
function setActiveSnippet(snippet, navigateToStudio = false) {
  STATE.activeSnippet = snippet;
  if (navigateToStudio) {
    switchView('ai-studio');
  }
}

async function renderAiStudio() {
  const snippet = STATE.activeSnippet;
  if (!snippet) return;

  const categoryBreadcrumb = document.getElementById('detailCategoryBreadcrumb');
  const titleBreadcrumb = document.getElementById('detailSnippetTitleBreadcrumb');
  const versionBadge = document.getElementById('detailVersionBadge');
  const starIcon = document.getElementById('detailStarIcon');
  const starText = document.getElementById('detailStarText');

  if (categoryBreadcrumb) categoryBreadcrumb.textContent = snippet.category || 'General';
  if (titleBreadcrumb) {
    titleBreadcrumb.innerHTML = `<span class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(78,222,163,0.8)]"></span> ${escapeHtml(snippet.title)}`;
  }
  if (versionBadge) versionBadge.textContent = `${snippet.version || capitalize(snippet.language)} • ${snippet.category || 'Curriculum'}`;
  if (starIcon) starIcon.style.fontVariationSettings = `'FILL' ${snippet.starred ? 1 : 0}`;
  if (starText) starText.textContent = snippet.starred ? 'Starred' : 'Star';

  const langBadge = document.getElementById('detailLanguageBadge');
  const catBadge = document.getElementById('detailCategoryBadge');
  const metricsBadge = document.getElementById('detailMetricsBadge');
  const filenameBadge = document.getElementById('detailFilenameBadge');

  const lines = snippet.code.split('\n');
  const byteCount = new Blob([snippet.code]).size;

  if (langBadge) langBadge.textContent = snippet.version || capitalize(snippet.language);
  if (catBadge) catBadge.textContent = snippet.category || 'Algorithm';
  if (metricsBadge) metricsBadge.textContent = `${lines.length} lines • ${byteCount} bytes`;
  if (filenameBadge) filenameBadge.textContent = `${snippet.id}.${getFileExtension(snippet.language)}`;

  // Learning notes & description rendering
  const learningNotesElem = document.getElementById('detailLearningNotesContent');
  if (learningNotesElem) {
    learningNotesElem.textContent = snippet.notes || 'No learning notes recorded yet. Click "Edit Notes" above to add your insights on invariants and adaptation.';
  }

  const descElem = document.getElementById('detailDescriptionContent');
  if (descElem) {
    descElem.textContent = snippet.description || 'No problem context provided.';
  }

  // Render Line-by-line code canvas with student annotations
  renderDetailCodeCanvas(snippet);

  // Setup tab switcher for AI Companion
  setupAiTabs(snippet);

  // Load Breakdown by default
  loadAiExplanation(snippet);

  // Load Socratic Dialog / Help Me Solve
  loadSocraticChat(snippet);

  // Load Translation Tab
  loadAiTranslationTab(snippet);
}

function renderDetailCodeCanvas(snippet) {
  const canvas = document.getElementById('detailCodeCanvas');
  if (!canvas) return;

  const lines = snippet.code.split('\n');
  const annotations = snippet.annotations || [];

  let html = '';
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const lineAnnotation = annotations.find(a => a.line === lineNum);
    const highlightedLine = highlightCode(lineText || ' ', snippet.language);
    const isAnnotated = !!lineAnnotation;

    html += `
      <div class="code-line group flex hover:bg-white/[0.04] -mx-4 px-4 transition-colors relative ${isAnnotated ? 'bg-primary/10 border-y border-primary/20' : ''}" data-line="${lineNum}">
        ${isAnnotated ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(78,222,163,0.8)]"></div>' : ''}
        <span class="w-8 text-right pr-4 text-[#475569] select-none font-label-mono-sm text-xs cursor-pointer hover:text-primary transition-colors btn-line-num" data-line="${lineNum}" title="Click to add invariant annotation">${lineNum}</span>
        <span class="flex-1 font-code-block text-xs text-slate-200">${highlightedLine}</span>
        <button class="opacity-0 group-hover:opacity-100 text-[#64748b] hover:text-primary transition-opacity text-[10px] font-label-mono-sm flex items-center gap-0.5 ml-2 btn-add-note-inline" data-line="${lineNum}" title="Add annotation on line ${lineNum}">
          <span class="material-symbols-outlined text-xs">edit_note</span>
        </button>
      </div>
    `;

    if (lineAnnotation) {
      html += `
        <div class="-mx-4 px-4 py-1.5 bg-[#0b1326]/60">
          <div class="ml-10 mr-2 my-1 p-3 bg-[#131b2e] border border-primary/30 text-[#e2e8f0] rounded-lg shadow-xl flex items-start gap-2.5">
            <div class="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <span class="material-symbols-outlined text-xs">notes</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-label-mono-sm text-xs font-semibold text-primary">Invariant Annotation • ${escapeHtml(lineAnnotation.author || 'Bhoomika Yadav')}</span>
                <span class="font-label-mono-sm text-[10px] text-[#94a3b8]">${escapeHtml(lineAnnotation.time || 'Yesterday')}</span>
              </div>
              <p class="text-xs text-[#cbd5e1] mt-1 leading-relaxed">
                ${escapeHtml(lineAnnotation.note)}
              </p>
            </div>
          </div>
        </div>
      `;
    }
  });

  canvas.innerHTML = html;

  canvas.querySelectorAll('.btn-line-num, .btn-add-note-inline').forEach(btn => {
    btn.addEventListener('click', () => {
      const line = btn.getAttribute('data-line');
      openAnnotationModal(line);
    });
  });
}

function setupAiTabs(snippet) {
  const tabs = document.querySelectorAll('.ai-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      STATE.activeAiTab = tabName;

      tabs.forEach(t => {
        if (t === tab) {
          t.classList.add('active', 'bg-[#1a2236]', 'text-primary', 'border-primary/20', 'font-semibold', 'shadow-sm');
          t.classList.remove('text-[#94a3b8]', 'border-transparent');
        } else {
          t.classList.remove('active', 'bg-[#1a2236]', 'text-primary', 'border-primary/20', 'font-semibold', 'shadow-sm');
          t.classList.add('text-[#94a3b8]', 'border-transparent');
        }
      });

      const panels = {
        'breakdown': document.getElementById('aiTabPanelBreakdown'),
        'socratic': document.getElementById('aiTabPanelSocratic'),
        'complexity': document.getElementById('aiTabPanelComplexity'),
        'translate': document.getElementById('aiTabPanelTranslate')
      };

      Object.keys(panels).forEach(p => {
        if (panels[p]) {
          if (p === tabName) {
            panels[p].classList.remove('hidden');
            panels[p].classList.add('flex');
          } else {
            panels[p].classList.add('hidden');
            panels[p].classList.remove('flex');
          }
        }
      });

      if (tabName === 'complexity') {
        renderComplexityTab(snippet);
      }
    });
  });

  const activeBtn = document.querySelector(`.ai-tab[data-tab="${STATE.activeAiTab}"]`);
  if (activeBtn) activeBtn.click();
}

// 1. AI Code Explanation (PRD Section 7 & 8)
async function loadAiExplanation(snippet) {
  const summaryElem = document.getElementById('breakdownSummaryText');
  const stepsContainer = document.getElementById('breakdownStepsContainer');
  const conceptsList = document.getElementById('breakdownConceptsList');
  const caveatsList = document.getElementById('breakdownCaveatsList');
  const timeBigO = document.getElementById('breakdownTimeBigO');
  const timeDeriv = document.getElementById('breakdownTimeDerivation');
  const spaceBigO = document.getElementById('breakdownSpaceBigO');
  const spaceDeriv = document.getElementById('breakdownSpaceDerivation');

  try {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snippet })
    });
    const result = await res.json();
    if (result.success && result.data) {
      const exp = result.data;
      if (summaryElem) summaryElem.textContent = exp.summary;
      if (timeBigO) timeBigO.textContent = exp.timeComplexity.notation;
      if (timeDeriv) timeDeriv.textContent = exp.timeComplexity.derivation;
      if (spaceBigO) spaceBigO.textContent = exp.spaceComplexity.notation;
      if (spaceDeriv) spaceDeriv.textContent = exp.spaceComplexity.derivation;

      if (stepsContainer && exp.walkthrough) {
        stepsContainer.innerHTML = exp.walkthrough.map((s, idx) => `
          <div class="p-2.5 bg-[#131b2e] border border-[#1e293b] rounded-lg flex items-start gap-2.5">
            <span class="w-5 h-5 rounded-full bg-[#1a2236] border border-[#334155] text-primary font-label-mono-sm text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">${idx + 1}</span>
            <div class="flex flex-col">
              <span class="font-body-md text-xs font-semibold text-[#f1f5f9]">${escapeHtml(s.phase)} (${escapeHtml(s.lines)})</span>
              <p class="text-xs text-[#94a3b8] mt-0.5 leading-relaxed">${escapeHtml(s.explanation)}</p>
            </div>
          </div>
        `).join('');
      }

      if (conceptsList && exp.concepts) {
        conceptsList.innerHTML = exp.concepts.map(c => `<li>${escapeHtml(c)}</li>`).join('');
      }

      if (caveatsList && exp.caveats) {
        caveatsList.innerHTML = exp.caveats.map(c => `<li>${escapeHtml(c)}</li>`).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load AI explanation:', err);
  }
}

// 2. Socratic Solution Assistance / "Help Me Solve" (PRD Section 7 & 8)
function loadSocraticChat(snippet) {
  const historyContainer = document.getElementById('socraticChatHistory');
  if (!historyContainer) return;

  if (STATE.socraticChat.length === 0) {
    STATE.socraticChat = [
      {
        sender: 'student',
        author: 'Bhoomika Yadav • Student',
        text: `How can I verify the invariants of "${snippet.title}" and prepare for edge cases?`
      },
      {
        sender: 'mentor',
        author: 'Stanford Algorithmic Mentor',
        role: 'CS TA Bot',
        text: `Great question. When studying ${snippet.title}, verify the 3 foundational pillars:
1. Base Anchor: Check initial setup on empty or zero-bound inputs.
2. Invariant Loop: Verify the state transition preserved on each mutation.
3. Edge Case Handling: Review extreme inputs before writing final code.`,
        hints: [
          'Hint 1: Check what happens when N = 0 or input is empty.',
          'Hint 2: Review pointer detachments to ensure no orphaned nodes or memory leaks.',
          'Hint 3: Consider the cost of duplicate key insertions.'
        ],
        diagram: snippet.id === 'dijkstra-cpp',
        recommendation: 'Click "Generate Edge-Case Matrix" below to see high-risk exam test vectors.'
      }
    ];
  }

  renderSocraticChatHistory();
  setupSocraticInput(snippet);
}

function renderSocraticChatHistory() {
  const historyContainer = document.getElementById('socraticChatHistory');
  if (!historyContainer) return;

  historyContainer.innerHTML = STATE.socraticChat.map(msg => {
    if (msg.sender === 'student') {
      return `
        <div class="flex items-start gap-2 self-end max-w-[90%]">
          <div class="p-2.5 bg-primary/20 border border-primary/35 text-[#e2e8f0] rounded-xl rounded-tr-none shadow-md text-right">
            <span class="font-label-mono-sm text-[10px] text-primary block text-right font-medium">${escapeHtml(msg.author || 'Bhoomika Yadav')}</span>
            <p class="text-xs mt-0.5 text-left text-[#cbd5e1] leading-relaxed">${escapeHtml(msg.text)}</p>
          </div>
          <div class="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-1">
            BY
          </div>
        </div>
      `;
    }

    return `
      <div class="flex items-start gap-2 max-w-[95%]">
        <div class="w-6 h-6 rounded-full bg-tertiary/20 border border-tertiary/40 text-tertiary flex items-center justify-center shrink-0 mt-1 shadow-sm">
          <span class="material-symbols-outlined text-xs">school</span>
        </div>
        <div class="p-3 bg-[#131b2e] border border-[#1e293b] text-[#e2e8f0] rounded-xl rounded-tl-none shadow-md flex flex-col gap-2">
          <div class="flex items-center justify-between pb-1 border-b border-[#1e293b]/60">
            <span class="font-label-mono-sm text-xs font-bold text-tertiary">${escapeHtml(msg.author || 'Algorithmic Mentor')}</span>
            <span class="font-label-mono-sm text-[10px] text-[#64748b]">${escapeHtml(msg.role || 'CS TA')}</span>
          </div>
          <p class="text-xs leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">${escapeHtml(msg.text)}</p>

          ${msg.hints && msg.hints.length > 0 ? `
            <div class="p-2.5 bg-tertiary/10 border border-tertiary/25 rounded-lg flex flex-col gap-1">
              <span class="font-label-mono-sm text-[10.5px] uppercase font-semibold text-amber-300 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">lightbulb</span> Progressive Hints:
              </span>
              <ul class="text-xs text-[#fed7aa] space-y-1 list-disc pl-4">
                ${msg.hints.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${msg.diagram ? `
            <div class="bg-[#0b0f17] border border-[#1e293b] p-2 rounded-lg flex flex-col items-center">
              <span class="font-label-mono-sm text-[10px] text-[#94a3b8] mb-1 self-start font-medium">Counterexample Graph Schema:</span>
              <svg class="w-full max-w-xs h-20" fill="none" viewbox="0 0 320 90">
                <circle cx="40" cy="45" fill="#10b981" r="14"></circle>
                <text fill="#003824" font-family="JetBrains Mono" font-size="10" font-weight="bold" text-anchor="middle" x="40" y="49">S</text>
                <circle cx="160" cy="22" fill="#1e293b" r="14" stroke="#334155" stroke-width="1.5"></circle>
                <text fill="#e2e8f0" font-family="JetBrains Mono" font-size="10" font-weight="bold" text-anchor="middle" x="160" y="26">A</text>
                <circle cx="280" cy="45" fill="#1e293b" r="14" stroke="#334155" stroke-width="1.5"></circle>
                <text fill="#e2e8f0" font-family="JetBrains Mono" font-size="10" font-weight="bold" text-anchor="middle" x="280" y="49">B</text>
                <path d="M54 38 L144 25" marker-end="url(#arrow1)" stroke="#64748b" stroke-width="1.5"></path>
                <text fill="#cbd5e1" font-family="JetBrains Mono" font-size="9" font-weight="bold" x="96" y="23">+2</text>
                <path d="M56 47 L262 47" stroke="#64748b" stroke-width="1.5"></path>
                <text fill="#cbd5e1" font-family="JetBrains Mono" font-size="9" font-weight="bold" x="160" y="58">+5</text>
                <path d="M174 27 L266 40" stroke="#f87171" stroke-dasharray="3 3" stroke-width="2"></path>
                <text fill="#f87171" font-family="JetBrains Mono" font-size="10" font-weight="bold" x="226" y="24">-4</text>
                <defs>
                  <marker id="arrow1" markerheight="6" markerwidth="6" orient="auto-start-reverse" refx="5" refy="5" viewbox="0 0 10 10">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"></path>
                  </marker>
                </defs>
              </svg>
              <span class="font-label-mono-sm text-[10px] text-[#94a3b8] italic text-center mt-1">
                Dijkstra explores S&rarr;A (cost 2) and locks it before evaluating negative edge A&rarr;B (-4).
              </span>
            </div>
          ` : ''}

          ${msg.recommendation ? `
            <p class="text-[11px] text-[#94a3b8] leading-relaxed">${escapeHtml(msg.recommendation)}</p>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  historyContainer.scrollTop = historyContainer.scrollHeight;
}

function setupSocraticInput(snippet) {
  const input = document.getElementById('socraticQueryInput');
  const btn = document.getElementById('btnSendSocraticQuery');

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;

    STATE.socraticChat.push({
      sender: 'student',
      author: 'Bhoomika Yadav • Student',
      text
    });
    input.value = '';
    renderSocraticChatHistory();

    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet, query: text })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const sol = data.data;
        STATE.socraticChat.push({
          sender: 'mentor',
          author: sol.title || 'Stanford Algorithmic Mentor',
          role: 'CS TA Bot',
          text: sol.approach || sol.response || 'Analyzing invariant boundaries...',
          hints: sol.progressiveHints || [],
          diagram: !!sol.counterExample,
          recommendation: sol.recommendation
        });
        renderSocraticChatHistory();
      }
    } catch (err) {
      showToast('Error communicating with AI mentor', 'error');
    }
  };

  if (btn) btn.onclick = handleSend;
  if (input) {
    input.onkeydown = (e) => {
      if (e.key === 'Enter') handleSend();
    };
  }

  document.querySelectorAll('.branch-btn').forEach(b => {
    b.onclick = async () => {
      const action = b.getAttribute('data-action');
      try {
        const res = await fetch('/api/ai/assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snippet, actionType: action })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const resData = data.data;
          let replyText = '';
          if (resData.type === 'edge-cases') {
            replyText = `**${resData.title}**\n${resData.summary}\n\n` + resData.matrix.map(m => `• **${m.case}**: ${m.expected}`).join('\n');
          } else if (resData.type === 'optimization') {
            replyText = `**${resData.title}**\n${resData.summary}\n\n` + resData.suggestions.map(s => `• **${s.technique}**: ${s.detail}`).join('\n');
          } else {
            replyText = resData.approach || resData.response;
          }

          STATE.socraticChat.push({
            sender: 'mentor',
            author: resData.title || 'Algorithmic Exploration',
            role: 'Pedagogy Engine',
            text: replyText,
            hints: resData.progressiveHints || [],
            diagram: !!resData.counterExample,
            recommendation: resData.recommendation
          });
          renderSocraticChatHistory();
        }
      } catch (err) {
        showToast('Failed to load exploration branch', 'error');
      }
    };
  });
}

// 3. Complexity Tab
function renderComplexityTab(snippet) {
  const container = document.getElementById('complexityDetailedContent');
  if (!container) return;

  container.innerHTML = `
    <div class="p-3 bg-[#131b2e] border border-[#1e293b] rounded-lg flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <span class="font-label-mono-sm text-xs font-semibold text-emerald-400 uppercase">Time Complexity</span>
        <span class="font-headline-sm text-sm font-bold text-white">${snippet.timeComplexity || 'O(N)'}</span>
      </div>
      <p class="text-xs text-[#94a3b8]">
        Mathematically proven by summing loop bounds, heap operations, and recursive tree heights.
      </p>
    </div>

    <div class="p-3 bg-[#131b2e] border border-[#1e293b] rounded-lg flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <span class="font-label-mono-sm text-xs font-semibold text-secondary uppercase">Auxiliary Memory Space</span>
        <span class="font-headline-sm text-sm font-bold text-white">${snippet.spaceComplexity || 'O(1)'}</span>
      </div>
      <p class="text-xs text-[#94a3b8]">
        Includes call stack activation records during recursion and dynamic memory allocated in containers.
      </p>
    </div>

    <div class="p-3 bg-[#060e20] border border-[#1e293b] rounded-lg flex flex-col gap-2">
      <span class="font-label-mono-sm text-[11px] font-semibold text-amber-300">Asymptotic Derivation:</span>
      <p class="font-code-block text-xs text-[#cbd5e1] leading-relaxed">
        T(N) = V &times; T_pop(V) + E &times; T_push(V)<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= V &times; O(log V) + E &times; O(log V)<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span class="text-primary font-bold">${snippet.timeComplexity || 'O((V + E) log V)'}</span>
      </p>
    </div>
  `;
}

// 4. Translate Tab in AI Studio
async function loadAiTranslationTab(snippet) {
  const selectTarget = document.getElementById('selectTranslateTarget');
  const targetHeader = document.getElementById('translatedTargetHeader');
  const preview = document.getElementById('translatedCodePreview');
  const notesList = document.getElementById('translationNotesList');
  const btnCopy = document.getElementById('btnCopyTranslatedCode');
  const btnSave = document.getElementById('btnSaveTranslatedAsSnippet');

  if (!selectTarget || !preview) return;

  const currentLang = (snippet.language || '').toLowerCase();
  if (currentLang === 'python') selectTarget.value = 'cpp';
  else if (currentLang === 'cpp') selectTarget.value = 'python';
  else selectTarget.value = 'python';

  const updateTranslation = async () => {
    const target = selectTarget.value;
    targetHeader.textContent = `${capitalize(target)} Translation`;
    preview.innerHTML = `<span class="text-[#64748b] italic">Translating code idiomatic to ${target}...</span>`;

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet, targetLanguage: target })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const trans = data.data;
        preview.innerHTML = `<pre class="m-0">${highlightCode(trans.translatedCode, target)}</pre>`;
        notesList.innerHTML = (trans.mappingNotes || []).map(n => `<li>${escapeHtml(n)}</li>`).join('');

        btnCopy.onclick = () => {
          copyToClipboard(trans.translatedCode, `Translated ${target} code copied!`);
        };

        btnSave.onclick = async () => {
          const newTitle = `${snippet.title} (${capitalize(target)})`;
          const payload = {
            title: newTitle,
            description: `Idiomatic ${capitalize(target)} translation of ${snippet.title}. Preserves asymptotic complexity ${snippet.timeComplexity}.`,
            notes: `Translated from ${snippet.language}. Original notes: ${snippet.notes || 'None'}`,
            code: trans.translatedCode,
            language: target,
            version: trans.targetVersion || `${capitalize(target)} Modern`,
            course: snippet.course,
            category: snippet.category,
            timeComplexity: snippet.timeComplexity,
            spaceComplexity: snippet.spaceComplexity,
            tags: [...(snippet.tags || []), 'translated', target]
          };

          try {
            const saveRes = await fetch('/api/snippets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const saveJson = await saveRes.json();
            if (saveJson.success) {
              showToast(`Saved translated snippet to your Snippets Hub!`, 'success');
              await Promise.all([fetchSnippets(), fetchStats(), fetchCategories(), fetchTags()]);
            }
          } catch (err) {
            showToast('Failed to save translated snippet', 'error');
          }
        };
      }
    } catch (err) {
      preview.textContent = 'Translation service encountered an error.';
    }
  };

  selectTarget.onchange = updateTranslation;
  await updateTranslation();
}

// ================= STANDALONE TRANSLATE WORKBENCH =================
function initStandaloneTranslate() {
  const sourceCodeInput = document.getElementById('standaloneSourceCode');
  const sourceLangSelect = document.getElementById('standaloneSourceLang');
  const targetLangSelect = document.getElementById('standaloneTargetLang');
  const presetSelect = document.getElementById('standaloneSelectPreset');
  const btnTranslate = document.getElementById('btnRunStandaloneTranslate');
  const resultCanvas = document.getElementById('standaloneResultCanvas');
  const btnLoadActive = document.getElementById('btnLoadCurrentSnippetForTranslate');
  const btnCopyResult = document.getElementById('btnCopyStandaloneResult');
  const btnSaveSnippet = document.getElementById('btnStandaloneSaveSnippet');
  const btnExplain = document.getElementById('btnStandaloneExplain');

  if (presetSelect && sourceCodeInput) {
    presetSelect.onchange = () => {
      const val = presetSelect.value;
      if (CODE_PRESETS[val]) {
        sourceCodeInput.value = CODE_PRESETS[val].code;
        if (CODE_PRESETS[val].sourceLang) sourceLangSelect.value = CODE_PRESETS[val].sourceLang;
        if (CODE_PRESETS[val].targetLang) targetLangSelect.value = CODE_PRESETS[val].targetLang;
        if (CODE_PRESETS[val].code) {
          btnTranslate.click();
        }
      }
    };
  }

  if (btnLoadActive) {
    btnLoadActive.onclick = () => {
      if (STATE.activeSnippet) {
        sourceCodeInput.value = STATE.activeSnippet.code;
        sourceLangSelect.value = STATE.activeSnippet.language || 'cpp';
        targetLangSelect.value = STATE.activeSnippet.language === 'python' ? 'cpp' : 'python';
        showToast(`Loaded "${STATE.activeSnippet.title}"`, 'info');
        btnTranslate.click();
      }
    };
  }

  if (sourceCodeInput && !sourceCodeInput.value && STATE.activeSnippet) {
    sourceCodeInput.value = STATE.activeSnippet.code;
    sourceLangSelect.value = STATE.activeSnippet.language || 'cpp';
    targetLangSelect.value = STATE.activeSnippet.language === 'python' ? 'cpp' : 'python';
  }

  if (btnTranslate) {
    btnTranslate.onclick = async () => {
      const code = sourceCodeInput.value.trim();
      const target = targetLangSelect.value;
      if (!code) {
        showToast('Please enter or load code to translate', 'warning');
        return;
      }

      btnTranslate.innerHTML = `<span class="material-symbols-outlined text-sm font-bold animate-spin">sync</span><span>Translating...</span>`;
      resultCanvas.innerHTML = `<span class="text-[#64748b] italic">Translating to ${capitalize(target)} with invariant preservation...</span>`;

      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code,
            sourceLanguage: sourceLangSelect.value,
            targetLanguage: target
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const trans = data.data;
          resultCanvas.innerHTML = `<pre class="m-0">${highlightCode(trans.translatedCode, target)}</pre>`;
          const notesText = document.getElementById('standaloneNotesText');
          if (notesText && trans.mappingNotes) {
            notesText.innerHTML = trans.mappingNotes.join('<br>&bull; ');
          }
          showToast(`Successfully translated to ${capitalize(target)}!`, 'success');
        } else {
          resultCanvas.textContent = 'Translation failed: ' + (data.message || 'Unknown error');
        }
      } catch (err) {
        resultCanvas.textContent = 'Translation service encountered an error.';
      } finally {
        btnTranslate.innerHTML = `<span class="material-symbols-outlined text-sm font-bold">sync_alt</span><span>Translate Now</span>`;
      }
    };
  }

  if (btnCopyResult) {
    btnCopyResult.onclick = () => {
      const text = resultCanvas.innerText;
      if (text && !text.includes('Click "Translate Now"') && !text.includes('Translating')) {
        copyToClipboard(text, 'Translated code copied!');
      } else {
        showToast('No translated code to copy yet', 'warning');
      }
    };
  }

  if (btnSaveSnippet) {
    btnSaveSnippet.onclick = () => {
      const text = resultCanvas.innerText;
      const target = targetLangSelect.value;
      if (!text || text.includes('Click "Translate Now"') || text.includes('Translating')) {
        showToast('Please translate code before saving', 'warning');
        return;
      }
      openCreateSnippetModal();
      document.getElementById('inputSnippetTitle').value = `Translated Algorithm (${capitalize(target)})`;
      document.getElementById('selectSnippetLanguage').value = target;
      document.getElementById('inputSnippetCategory').value = 'Algorithms & DP';
      document.getElementById('inputSnippetCourse').value = 'CS Curriculum';
      document.getElementById('textareaSnippetCode').value = text;
      document.getElementById('inputSnippetDesc').value = `Idiomatically translated from ${capitalize(sourceLangSelect.value)} to ${capitalize(target)}.`;
      document.getElementById('inputSnippetNotes').value = `Paradigmatic conversion with asymptotic invariance.`;
      document.getElementById('inputSnippetTags').value = `translated, ${target}, algorithm`;
      showToast('Pre-filled new snippet modal!', 'info');
    };
  }

  if (btnExplain) {
    btnExplain.onclick = () => {
      const sourceCode = sourceCodeInput.value.trim();
      if (!sourceCode) {
        showToast('Please write or load code to explain', 'warning');
        return;
      }
      const tempSnippet = {
        id: 'custom-translator-code',
        title: 'Custom Algorithm',
        code: sourceCode,
        language: sourceLangSelect.value,
        category: 'Playground',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        description: 'Code from Translation Laboratory',
        notes: 'Explaining user code'
      };
      setActiveSnippet(tempSnippet, false);
      STATE.activeAiTab = 'breakdown';
      switchView('ai-studio');
      showToast('Analyzing code in AI Studio...', 'info');
    };
  }
}

// ================= RUN SANDBOX SIMULATOR =================
function setupSandboxRunner() {
  const btnRun = document.getElementById('btnRunSandbox');
  const consoleOutput = document.getElementById('sandboxConsoleOutput');
  const btnToggleConsole = document.getElementById('btnToggleSandboxConsole');
  const summaryElem = document.getElementById('sandboxStatusSummary');
  const peakMemElem = document.getElementById('sandboxPeakMemory');
  const execTimeElem = document.getElementById('sandboxExecutionTime');
  const harnessTitle = document.getElementById('sandboxHarnessTitle');

  if (btnToggleConsole && consoleOutput) {
    btnToggleConsole.onclick = () => {
      consoleOutput.classList.toggle('hidden');
    };
  }

  if (btnRun) {
    btnRun.onclick = async () => {
      if (!STATE.activeSnippet) return;

      btnRun.innerHTML = `<span class="material-symbols-outlined text-sm font-bold animate-spin">sync</span><span>Running...</span>`;

      try {
        const res = await fetch('/api/ai/sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snippet: STATE.activeSnippet })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const sb = data.data;
          if (harnessTitle) harnessTitle.textContent = `Sandbox Test Suite (${sb.compiler})`;
          if (summaryElem) summaryElem.innerHTML = `<span class="material-symbols-outlined text-xs">check_circle</span><span>${sb.testSummary}</span>`;
          if (peakMemElem) peakMemElem.textContent = sb.memory;
          if (execTimeElem) execTimeElem.textContent = `${sb.runtime} (${sb.testCases.length} vectors)`;
          if (consoleOutput) {
            consoleOutput.textContent = sb.stdout;
            consoleOutput.classList.remove('hidden');
          }
          showToast(`Test suite passed in ${sb.runtime}!`, 'success');
        }
      } catch (err) {
        showToast('Sandbox execution error', 'error');
      } finally {
        btnRun.innerHTML = `<span class="material-symbols-outlined text-sm font-bold">play_arrow</span><span>Run Sandbox</span>`;
      }
    };
  }
}

// ================= MODALS & FORMS =================
function setupEventListeners() {
  const globalSearch = document.getElementById('globalSearchInput');
  const explorerSearch = document.getElementById('explorerSearchInput');

  const onSearch = (val) => {
    STATE.searchQuery = val;
    fetchSnippets();
  };

  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      if (explorerSearch) explorerSearch.value = e.target.value;
      onSearch(e.target.value);
    });
  }

  if (explorerSearch) {
    explorerSearch.addEventListener('input', (e) => {
      if (globalSearch) globalSearch.value = e.target.value;
      onSearch(e.target.value);
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (globalSearch) {
        globalSearch.focus();
        globalSearch.select();
      }
    } else if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  document.querySelectorAll('.lang-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const lang = pill.getAttribute('data-lang');
      STATE.filterLanguage = lang;
      updateLangPills();
      fetchSnippets();
    });
  });

  const selectSort = document.getElementById('selectSort');
  if (selectSort) {
    selectSort.addEventListener('change', (e) => {
      STATE.sortBy = e.target.value;
      fetchSnippets();
    });
  }

  const btnGrid = document.getElementById('btnToggleGridView');
  const btnTable = document.getElementById('btnToggleTableView');
  if (btnGrid && btnTable) {
    btnGrid.addEventListener('click', () => {
      STATE.viewMode = 'grid';
      btnGrid.classList.add('bg-[#1e293b]', 'text-emerald-400', 'border', 'border-slate-700/60');
      btnGrid.classList.remove('text-[#94a3b8]');
      btnTable.classList.remove('bg-[#1e293b]', 'text-emerald-400', 'border', 'border-slate-700/60');
      btnTable.classList.add('text-[#94a3b8]');
      renderSnippets();
    });

    btnTable.addEventListener('click', () => {
      STATE.viewMode = 'table';
      btnTable.classList.add('bg-[#1e293b]', 'text-emerald-400', 'border', 'border-slate-700/60');
      btnTable.classList.remove('text-[#94a3b8]');
      btnGrid.classList.remove('bg-[#1e293b]', 'text-emerald-400', 'border', 'border-slate-700/60');
      btnGrid.classList.add('text-[#94a3b8]');
      renderSnippets();
    });
  }

  const btnReload = document.getElementById('btnReloadVault');
  if (btnReload) {
    btnReload.addEventListener('click', async () => {
      showToast('Reloading Snippets Hub...', 'info');
      await Promise.all([fetchSnippets(), fetchStats(), fetchCategories(), fetchTags()]);
      showToast('Library refreshed', 'success');
    });
  }

  const btnReset = document.getElementById('btnResetFilters');
  const btnEmptyReset = document.getElementById('btnEmptyReset');
  const btnClearAll = document.getElementById('btnClearAllFilters');
  const resetAll = () => {
    STATE.filterCategory = 'all';
    STATE.filterLanguage = 'all';
    STATE.filterTag = null;
    STATE.filterStarred = false;
    STATE.searchQuery = '';
    if (globalSearch) globalSearch.value = '';
    if (explorerSearch) explorerSearch.value = '';
    updateLangPills();
    fetchSnippets();
  };
  if (btnReset) btnReset.onclick = resetAll;
  if (btnEmptyReset) btnEmptyReset.onclick = resetAll;
  if (btnClearAll) btnClearAll.onclick = resetAll;

  // New Snippet Modal
  const btnNew1 = document.getElementById('btnHeaderNewSnippet');
  const btnNew2 = document.getElementById('btnOpenNewSnippetModal');
  if (btnNew1) btnNew1.onclick = () => openCreateSnippetModal();
  if (btnNew2) btnNew2.onclick = () => openCreateSnippetModal();

  const btnCloseModal = document.getElementById('btnCloseSnippetModal');
  const btnCancelModal = document.getElementById('btnCancelSnippetModal');
  if (btnCloseModal) btnCloseModal.onclick = closeSnippetModal;
  if (btnCancelModal) btnCancelModal.onclick = closeSnippetModal;

  // Snippet Form Submit (Create or Update)
  const formSnippet = document.getElementById('formSnippet');
  if (formSnippet) {
    formSnippet.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('inputSnippetId').value;
      const title = document.getElementById('inputSnippetTitle').value.trim();
      const language = document.getElementById('selectSnippetLanguage').value;
      const category = document.getElementById('inputSnippetCategory').value.trim();
      const course = document.getElementById('inputSnippetCourse').value.trim();
      const timeComplexity = document.getElementById('inputSnippetTime').value.trim();
      const spaceComplexity = document.getElementById('inputSnippetSpace').value.trim();
      const tags = document.getElementById('inputSnippetTags').value.trim();
      const description = document.getElementById('inputSnippetDesc').value.trim();
      const notes = document.getElementById('inputSnippetNotes').value.trim();
      const pinned = document.getElementById('checkboxSnippetPinned').checked;
      const starred = document.getElementById('checkboxSnippetStarred').checked;
      const code = document.getElementById('textareaSnippetCode').value;

      const payload = {
        title,
        language,
        category,
        course,
        timeComplexity,
        spaceComplexity,
        tags,
        description,
        notes,
        pinned,
        starred,
        code
      };

      try {
        let res;
        if (id) {
          res = await fetch(`/api/snippets/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch('/api/snippets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const data = await res.json();
        if (data.success) {
          showToast(id ? 'Snippet updated!' : 'Snippet saved to Snippets Hub!', 'success');
          closeSnippetModal();
          await Promise.all([fetchSnippets(), fetchStats(), fetchCategories(), fetchTags()]);
          if (data.data) {
            setActiveSnippet(data.data, true);
          }
        } else {
          showToast(data.message || 'Error saving snippet', 'error');
        }
      } catch (err) {
        showToast('Error saving snippet', 'error');
      }
    };
  }

  // Delete Modal
  const btnCancelDelete = document.getElementById('btnCancelDelete');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  if (btnCancelDelete) btnCancelDelete.onclick = closeDeleteModal;
  if (btnConfirmDelete) {
    btnConfirmDelete.onclick = () => {
      if (STATE.pendingDeleteId) {
        deleteSnippetApi(STATE.pendingDeleteId);
      }
    };
  }

  // Quick Edit Learning Notes Modal
  const btnEditNotes = document.getElementById('btnEditLearningNotes');
  const btnCloseNotes = document.getElementById('btnCloseEditNotes');
  const btnCancelNotes = document.getElementById('btnCancelEditNotes');
  const btnSaveNotes = document.getElementById('btnSaveQuickLearningNotes');

  if (btnEditNotes) {
    btnEditNotes.onclick = () => {
      if (!STATE.activeSnippet) return;
      document.getElementById('textareaQuickLearningNotes').value = STATE.activeSnippet.notes || '';
      const modal = document.getElementById('modalEditNotes');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.getElementById('textareaQuickLearningNotes').focus();
    };
  }
  if (btnCloseNotes) btnCloseNotes.onclick = closeEditNotesModal;
  if (btnCancelNotes) btnCancelNotes.onclick = closeEditNotesModal;
  if (btnSaveNotes) {
    btnSaveNotes.onclick = async () => {
      if (!STATE.activeSnippet) return;
      const updatedNotes = document.getElementById('textareaQuickLearningNotes').value.trim();
      try {
        const res = await fetch(`/api/snippets/${STATE.activeSnippet.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: updatedNotes })
        });
        const data = await res.json();
        if (data.success) {
          STATE.activeSnippet.notes = updatedNotes;
          const notesElem = document.getElementById('detailLearningNotesContent');
          if (notesElem) notesElem.textContent = updatedNotes || 'No learning notes recorded yet.';
          closeEditNotesModal();
          showToast('Learning notes updated!', 'success');
          await fetchSnippets();
        }
      } catch (err) {
        showToast('Failed to update notes', 'error');
      }
    };
  }

  // Annotation Modal
  const btnCancelAnno = document.getElementById('btnCancelAnnotation');
  const btnSaveAnno = document.getElementById('btnSaveAnnotation');
  if (btnCancelAnno) btnCancelAnno.onclick = closeAnnotationModal;
  if (btnSaveAnno) {
    btnSaveAnno.onclick = async () => {
      const line = document.getElementById('annotationTargetLine').value;
      const note = document.getElementById('textareaAnnotationText').value.trim();
      if (!note || !STATE.activeSnippet) return;

      try {
        const res = await fetch(`/api/snippets/${STATE.activeSnippet.id}/annotations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line, note, author: 'Bhoomika Yadav' })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Annotation attached to line ' + line, 'success');
          closeAnnotationModal();
          STATE.activeSnippet.annotations = data.annotations;
          renderDetailCodeCanvas(STATE.activeSnippet);
        }
      } catch (err) {
        showToast('Failed to add annotation', 'error');
      }
    };
  }

  // Re-analyze Explanation button
  const btnRefreshExpl = document.getElementById('btnRefreshExplanation');
  if (btnRefreshExpl) {
    btnRefreshExpl.onclick = () => {
      if (STATE.activeSnippet) {
        loadAiExplanation(STATE.activeSnippet);
        showToast('AI Explanation updated', 'info');
      }
    };
  }

  // Star & Gist in AI Studio Header
  const btnDetailStar = document.getElementById('btnDetailToggleStar');
  const btnDetailGist = document.getElementById('btnDetailExportGist');
  const btnDetailCopy = document.getElementById('btnDetailCopyCode');

  if (btnDetailStar) {
    btnDetailStar.onclick = () => {
      if (STATE.activeSnippet) toggleStarApi(STATE.activeSnippet.id);
    };
  }

  if (btnDetailGist) {
    btnDetailGist.onclick = () => {
      if (STATE.activeSnippet) {
        const md = `# ${STATE.activeSnippet.title}\n\n${STATE.activeSnippet.description}\n\n### Learning Notes:\n${STATE.activeSnippet.notes || 'None'}\n\n\`\`\`${STATE.activeSnippet.language}\n${STATE.activeSnippet.code}\n\`\`\``;
        downloadFile(`${STATE.activeSnippet.id}.md`, md, 'text/markdown');
        showToast('Snippet exported as Markdown', 'success');
      }
    };
  }

  if (btnDetailCopy) {
    btnDetailCopy.onclick = () => {
      if (STATE.activeSnippet) {
        copyToClipboard(STATE.activeSnippet.code, 'Code copied to clipboard!');
      }
    };
  }

  // Notifications Bell dropdown
  const btnBell = document.getElementById('btnNotificationsBell');
  const notifDropdown = document.getElementById('notificationsDropdown');
  if (btnBell && notifDropdown) {
    btnBell.onclick = (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    };
    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && e.target !== btnBell) {
        notifDropdown.classList.add('hidden');
      }
    });
  }

  setupSettingsActions();
  setupSandboxRunner();
}

function updateLangPills() {
  document.querySelectorAll('.lang-pill').forEach(pill => {
    const lang = pill.getAttribute('data-lang');
    if (lang === STATE.filterLanguage) {
      pill.classList.add('active', 'bg-emerald-500', 'text-slate-950', 'font-semibold', 'shadow-[0_0_12px_rgba(16,185,129,0.25)]');
      pill.classList.remove('bg-[#0b1326]', 'text-[#dae2fd]', 'border', 'border-[#1e293b]');
    } else {
      pill.classList.remove('active', 'bg-emerald-500', 'text-slate-950', 'font-semibold', 'shadow-[0_0_12px_rgba(16,185,129,0.25)]');
      pill.classList.add('bg-[#0b1326]', 'text-[#dae2fd]', 'border', 'border-[#1e293b]');
    }
  });
}

function setupSettingsActions() {
  const btnMd = document.getElementById('btnDownloadMarkdown');
  const btnJson = document.getElementById('btnDownloadJson');
  const btnCopyVault = document.getElementById('btnCopyAllMarkdown');
  const btnQuickExport = document.getElementById('btnQuickExportMd');
  const btnReset = document.getElementById('btnResetToDefaults');
  const btnTriggerImport = document.getElementById('btnTriggerImport');
  const fileInput = document.getElementById('inputFileImport');

  const exportMarkdown = async (download = true) => {
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'markdown' })
      });
      const md = await res.text();
      if (download) {
        downloadFile('SnippetsHub_Collection.md', md, 'text/markdown');
        showToast('Library exported as Markdown!', 'success');
      } else {
        copyToClipboard(md, 'Complete Snippets Hub Markdown copied to clipboard!');
      }
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  if (btnMd) btnMd.onclick = () => exportMarkdown(true);
  if (btnQuickExport) btnQuickExport.onclick = () => exportMarkdown(true);
  if (btnCopyVault) btnCopyVault.onclick = () => exportMarkdown(false);

  if (btnJson) {
    btnJson.onclick = async () => {
      try {
        const res = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format: 'json' })
        });
        const data = await res.json();
        downloadFile('SnippetsHub_Backup.json', JSON.stringify(data.data, null, 2), 'application/json');
        showToast('JSON backup downloaded!', 'success');
      } catch (err) {
        showToast('Export JSON failed', 'error');
      }
    };
  }

  // Import JSON with validation (PRD Section 7 & P2)
  if (btnTriggerImport && fileInput) {
    btnTriggerImport.onclick = () => {
      const file = fileInput.files[0];
      if (!file) {
        showToast('Please select a JSON file first.', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ snippets: parsed })
          });
          const data = await res.json();
          if (data.success) {
            showToast(data.message, 'success');
            fileInput.value = '';
            await Promise.all([fetchSnippets(), fetchStats(), fetchCategories(), fetchTags()]);
          } else {
            showToast(data.message || 'Import failed', 'error');
          }
        } catch (err) {
          showToast('Invalid JSON file format', 'error');
        }
      };
      reader.readAsText(file);
    };
  }

  if (btnReset) {
    btnReset.onclick = async () => {
      if (confirm('Are you sure you want to restore Snippets Hub to Stanford CS curriculum defaults?')) {
        try {
          const res = await fetch('/api/reset', { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showToast(data.message, 'success');
            await Promise.all([fetchSnippets(), fetchStats(), fetchCategories(), fetchTags()]);
          }
        } catch (err) {
          showToast('Failed to reset Snippets Hub', 'error');
        }
      }
    };
  }
}

// ================= MODAL HELPERS =================
function openCreateSnippetModal() {
  document.getElementById('modalSnippetTitle').textContent = 'Add New Code Snippet';
  document.getElementById('inputSnippetId').value = '';
  document.getElementById('inputSnippetTitle').value = '';
  document.getElementById('inputSnippetDesc').value = '';
  document.getElementById('inputSnippetNotes').value = '';
  document.getElementById('selectSnippetLanguage').value = 'python';
  document.getElementById('inputSnippetCategory').value = 'Algorithms';
  document.getElementById('inputSnippetCourse').value = 'CS 106B: Data Structures';
  document.getElementById('inputSnippetTime').value = 'O(1)';
  document.getElementById('inputSnippetSpace').value = 'O(1)';
  document.getElementById('inputSnippetTags').value = '';
  document.getElementById('checkboxSnippetPinned').checked = false;
  document.getElementById('checkboxSnippetStarred').checked = false;
  document.getElementById('textareaSnippetCode').value = '';

  const modal = document.getElementById('modalSnippet');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function openEditSnippetModal(snippet) {
  document.getElementById('modalSnippetTitle').textContent = 'Edit Code Snippet';
  document.getElementById('inputSnippetId').value = snippet.id;
  document.getElementById('inputSnippetTitle').value = snippet.title;
  document.getElementById('inputSnippetDesc').value = snippet.description || '';
  document.getElementById('inputSnippetNotes').value = snippet.notes || '';
  document.getElementById('selectSnippetLanguage').value = snippet.language || 'python';
  document.getElementById('inputSnippetCategory').value = snippet.category || '';
  document.getElementById('inputSnippetCourse').value = snippet.course || '';
  document.getElementById('inputSnippetTime').value = snippet.timeComplexity || 'O(1)';
  document.getElementById('inputSnippetSpace').value = snippet.spaceComplexity || 'O(1)';
  document.getElementById('inputSnippetTags').value = (snippet.tags || []).join(', ');
  document.getElementById('checkboxSnippetPinned').checked = !!snippet.pinned;
  document.getElementById('checkboxSnippetStarred').checked = !!snippet.starred;
  document.getElementById('textareaSnippetCode').value = snippet.code;

  const modal = document.getElementById('modalSnippet');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeSnippetModal() {
  const modal = document.getElementById('modalSnippet');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function openDeleteModal(snippet) {
  STATE.pendingDeleteId = snippet.id;
  const titleText = document.getElementById('deleteSnippetTitleText');
  if (titleText) titleText.textContent = `"${snippet.title}"`;
  const modal = document.getElementById('modalDelete');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeDeleteModal() {
  STATE.pendingDeleteId = null;
  const modal = document.getElementById('modalDelete');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function closeEditNotesModal() {
  const modal = document.getElementById('modalEditNotes');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function openAnnotationModal(line) {
  document.getElementById('annotationTargetLine').value = line;
  document.getElementById('annotationLineNumBadge').textContent = `Line ${line}`;
  document.getElementById('textareaAnnotationText').value = '';

  const modal = document.getElementById('modalAnnotation');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.getElementById('textareaAnnotationText').focus();
}

function closeAnnotationModal() {
  const modal = document.getElementById('modalAnnotation');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function closeAllModals() {
  closeSnippetModal();
  closeDeleteModal();
  closeEditNotesModal();
  closeAnnotationModal();
}

// ================= UTILITIES & SYNTAX HIGHLIGHTING =================
function highlightCode(code, lang = 'cpp') {
  if (!code) return '';
  const escaped = escapeHtml(code);
  const l = (lang || '').toLowerCase();

  if (l === 'python') {
    return escaped
      .replace(/(#.*$)/gm, '<span class="syn-comm">$1</span>')
      .replace(/\b(def|class|return|if|else|elif|for|while|in|import|from|as|with|try|except|pass|lambda|yield|raise|is|not|and|or)\b/g, '<span class="syn-kw">$1</span>')
      .replace(/\b(int|float|str|bool|list|dict|set|tuple|self|None|True|False)\b/g, '<span class="syn-type">$1</span>')
      .replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="syn-func">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="syn-num">$1</span>');
  }

  if (l === 'cpp' || l === 'c++') {
    return escaped
      .replace(/(\/\/.*$)/gm, '<span class="syn-comm">$1</span>')
      .replace(/(#include\s+&lt;[^&]+&gt;)/g, '<span class="syn-kw">$1</span>')
      .replace(/\b(using|namespace|class|struct|public|private|template|typename|return|if|else|while|for|auto|const|static|inline|explicit)\b/g, '<span class="syn-kw">$1</span>')
      .replace(/\b(int|void|float|double|bool|char|long|unsigned|std|vector|priority_queue|pair|greater|less|numeric_limits|limits|string)\b/g, '<span class="syn-type">$1</span>')
      .replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="syn-func">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="syn-num">$1</span>');
  }

  if (l === 'typescript' || l === 'javascript' || l === 'ts' || l === 'js') {
    return escaped
      .replace(/(\/\/.*$)/gm, '<span class="syn-comm">$1</span>')
      .replace(/\b(export|import|function|const|let|var|return|if|else|for|while|type|interface|class|new|from|as|async|await)\b/g, '<span class="syn-kw">$1</span>')
      .replace(/\b(number|string|boolean|any|void|Array|Map|Set|Promise|T)\b/g, '<span class="syn-type">$1</span>')
      .replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="syn-func">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="syn-num">$1</span>');
  }

  if (l === 'rust') {
    return escaped
      .replace(/(\/\/.*$)/gm, '<span class="syn-comm">$1</span>')
      .replace(/\b(pub|fn|struct|impl|mut|let|use|std|match|if|else|return|for|while|in|loop|where|type|enum)\b/g, '<span class="syn-kw">$1</span>')
      .replace(/\b(usize|u32|i32|f64|bool|Option|Result|Some|None|Ok|Err|Self|Vec|AtomicUsize)\b/g, '<span class="syn-type">$1</span>')
      .replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="syn-func">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="syn-num">$1</span>');
  }

  return escaped
    .replace(/(\/\/.*$|#.*$)/gm, '<span class="syn-comm">$1</span>')
    .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|WITH|RECURSIVE|UNION|ALL|ORDER|BY|AS)\b/gi, '<span class="syn-kw">$1</span>')
    .replace(/\b(return|if|else|for|while|function|def|class)\b/g, '<span class="syn-kw">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="syn-num">$1</span>');
}

function getLanguageColor(lang) {
  const l = (lang || '').toLowerCase();
  if (l === 'python') return 'bg-teal-400';
  if (l === 'cpp' || l === 'c++') return 'bg-emerald-400';
  if (l === 'typescript' || l === 'javascript') return 'bg-amber-400';
  if (l === 'rust') return 'bg-orange-400';
  if (l === 'sql') return 'bg-slate-400';
  if (l === 'java') return 'bg-indigo-400';
  if (l === 'go') return 'bg-cyan-400';
  return 'bg-slate-400';
}

function getFileExtension(lang) {
  const l = (lang || '').toLowerCase();
  if (l === 'python') return 'py';
  if (l === 'cpp' || l === 'c++') return 'cpp';
  if (l === 'typescript') return 'ts';
  if (l === 'javascript') return 'js';
  if (l === 'rust') return 'rs';
  if (l === 'sql') return 'sql';
  if (l === 'java') return 'java';
  if (l === 'go') return 'go';
  return 'txt';
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
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

function copyToClipboard(text, message = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message, 'success');
    }).catch(() => {
      fallbackCopy(text, message);
    });
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast(message, 'success');
}

function downloadFile(filename, content, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  let icon = 'info';
  let iconColor = 'text-emerald-400';
  if (type === 'success') {
    icon = 'check_circle';
    iconColor = 'text-emerald-400';
  } else if (type === 'error') {
    icon = 'error';
    iconColor = 'text-rose-400';
  } else if (type === 'warning') {
    icon = 'warning';
    iconColor = 'text-amber-400';
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined text-base ${iconColor}">${icon}</span>
    <span class="text-xs text-[#cbd5e1]">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
