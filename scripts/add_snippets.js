const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'data', 'seedSnippets.json');
const dbPath = path.join(__dirname, '..', 'data', 'snippets.json');

const current = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Filter out any duplicates if run multiple times
const existingIds = new Set(current.map(s => s.id));

const newSnippets = [
  {
    id: 'merge-sort-python',
    title: 'Merge Sort with Divide-and-Conquer Invariants',
    description: 'Stable O(N log N) divide-and-conquer sorting algorithm with recursive subproblem decomposition and two-pointer merge.',
    notes: 'Key invariant: The merge step assumes both sub-arrays are already sorted in non-decreasing order. Space complexity is O(N) for auxiliary buffer arrays during merging. Guaranteed O(N log N) worst-case time makes it ideal when predictable performance is required.',
    language: 'python',
    version: 'Python 3.11',
    course: 'CS 161: Algorithms',
    category: 'Algorithms & DP',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    tags: ['sorting', 'divide-and-conquer', 'recursion', 'algorithms'],
    starred: true,
    pinned: false,
    createdAt: '2026-10-13T09:15:00Z',
    updatedAt: '2026-10-15T19:00:00Z',
    code: `def merge_sort(arr: list[int]) -> list[int]:
    """Divide-and-conquer merge sort returning a newly sorted array."""
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    merged = []
    i = j = 0

    # Two-pointer linear scan
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1

    # Append remaining elements
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged`,
    annotations: [
      {
        line: 18,
        author: 'Bhoomika Yadav',
        time: '3 days ago',
        note: 'Stability check: using <= rather than < preserves relative order of equal keys!'
      }
    ],
    testCases: [
      { input: 'merge_sort([38, 27, 43, 3, 9, 82, 10])', expected: '[3, 9, 10, 27, 38, 43, 82]', status: 'passed' },
      { input: 'merge_sort([])', expected: '[]', status: 'passed' },
      { input: 'merge_sort([5])', expected: '[5]', status: 'passed' }
    ]
  },
  {
    id: 'trie-prefix-tree-ts',
    title: 'Trie Prefix Tree with Autocomplete & Search',
    description: 'High-performance n-ary tree structure for fast string dictionary storage, prefix filtering, and vocabulary lookup.',
    notes: 'Key takeaway: Each node stores child pointers keyed by character and a boolean flag isEndOfWord. Search and insertion operate in O(L) where L is the string length, strictly independent of the total number of words in the dictionary.',
    language: 'typescript',
    version: 'TypeScript 5.2',
    course: 'CS 106B: Data Structures',
    category: 'Data Structures',
    timeComplexity: 'O(L) per op',
    spaceComplexity: 'O(Σ · L · N)',
    tags: ['data-structures', 'trie', 'strings', 'autocomplete', 'trees'],
    starred: true,
    pinned: false,
    createdAt: '2026-10-14T11:00:00Z',
    updatedAt: '2026-10-15T19:20:00Z',
    code: `class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

export class Trie {
  private root: TrieNode = new TrieNode();

  insert(word: string): void {
    let current = this.root;
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  search(word: string): boolean {
    const node = this.traverse(word);
    return node !== null && node.isEndOfWord;
  }

  startsWith(prefix: string): boolean {
    return this.traverse(prefix) !== null;
  }

  private traverse(prefix: string): TrieNode | null {
    let current = this.root;
    for (const char of prefix) {
      if (!current.children.has(char)) return null;
      current = current.children.get(char)!;
    }
    return current;
  }
}`,
    annotations: [
      {
        line: 16,
        author: 'Bhoomika Yadav',
        time: 'Yesterday',
        note: 'O(L) lookup independent of vocabulary size N — essential for search suggestion engines.'
      }
    ],
    testCases: [
      { input: 'insert("apple"); search("apple")', expected: 'true', status: 'passed' },
      { input: 'search("app")', expected: 'false', status: 'passed' },
      { input: 'startsWith("app")', expected: 'true', status: 'passed' }
    ]
  },
  {
    id: 'kadane-max-subarray-java',
    title: "Kadane's Dynamic Programming Algorithm (Maximum Subarray)",
    description: 'Computes the contiguous subarray within a one-dimensional numerical array that has the largest sum in optimal O(N) time and O(1) space.',
    notes: 'Mathematical proof: At index i, the maximum subarray ending at i is max(nums[i], maxEndingHere + nums[i]). If running sum drops below 0, discarding previous elements and starting fresh from nums[i] is always provably optimal.',
    language: 'java',
    version: 'Java 21',
    course: 'CS 161: Algorithms',
    category: 'Algorithms & DP',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    tags: ['dynamic-programming', 'arrays', 'optimization', 'kadane'],
    starred: false,
    pinned: false,
    createdAt: '2026-10-14T14:30:00Z',
    updatedAt: '2026-10-15T19:35:00Z',
    code: `public class KadaneSubarray {
    public static class SubarrayResult {
        public int maxSum;
        public int startIndex;
        public int endIndex;

        public SubarrayResult(int maxSum, int startIndex, int endIndex) {
            this.maxSum = maxSum;
            this.startIndex = startIndex;
            this.endIndex = endIndex;
        }
    }

    public static SubarrayResult findMaxSubarray(int[] nums) {
        if (nums == null || nums.length == 0) {
            throw new IllegalArgumentException("Input array cannot be empty");
        }

        int maxSoFar = nums[0];
        int currentMax = nums[0];
        int start = 0, end = 0, tempStart = 0;

        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > currentMax + nums[i]) {
                currentMax = nums[i];
                tempStart = i;
            } else {
                currentMax += nums[i];
            }

            if (currentMax > maxSoFar) {
                maxSoFar = currentMax;
                start = tempStart;
                end = i;
            }
        }
        return new SubarrayResult(maxSoFar, start, end);
    }
}`,
    annotations: [
      {
        line: 23,
        author: 'Bhoomika Yadav',
        time: 'Yesterday',
        note: 'Boundary invariant: Tracking tempStart allows exact [start, end] window coordinates recovery.'
      }
    ],
    testCases: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: 'maxSum = 6 (subarray [4, -1, 2, 1])', status: 'passed' },
      { input: 'nums = [5, 4, -1, 7, 8]', expected: 'maxSum = 23', status: 'passed' }
    ]
  },
  {
    id: 'topological-sort-kahn-cpp',
    title: "Kahn's Topological Sort with BFS Cycle Detection",
    description: 'Linear ordering of vertices in a Directed Acyclic Graph (DAG) using vertex in-degrees and BFS queue, detecting cycles if output length < V.',
    notes: 'Algorithmic guarantee: Only nodes with in-degree == 0 can be processed at any step. If all vertices are processed, the graph is provably a DAG. If visited count < V, a directed cyclic dependency exists (crucial for build systems like Make and course prerequisites).',
    language: 'cpp',
    version: 'C++20',
    course: 'CS 161: Algorithms',
    category: 'Graph Algorithms',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    tags: ['graph-traversal', 'dag', 'topological-sort', 'bfs', 'cycle-detection'],
    starred: true,
    pinned: false,
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T19:40:00Z',
    code: `#include <vector>
#include <queue>
#include <iostream>

std::vector<int> topologicalSortKahn(int n, const std::vector<std::pair<int, int>>& edges) {
    std::vector<std::vector<int>> adj(n);
    std::vector<int> inDegree(n, 0);

    for (const auto& [u, v] : edges) {
        adj[u].push_back(v);
        inDegree[v]++;
    }

    std::queue<int> q;
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    std::vector<int> topoOrder;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        topoOrder.push_back(u);

        for (int v : adj[u]) {
            if (--inDegree[v] == 0) {
                q.push(v);
            }
        }
    }

    // Cycle detection check: if topoOrder size != n, cycle exists
    if (topoOrder.size() != static_cast<size_t>(n)) {
        return {}; // Directed cycle detected
    }
    return topoOrder;
}`,
    annotations: [
      {
        line: 29,
        author: 'Bhoomika Yadav',
        time: '5 hours ago',
        note: 'Cycle invariant: if topoOrder.size() < n, at least one directed cycle was skipped.'
      }
    ],
    testCases: [
      { input: 'V=6, edges=[(5,2),(5,0),(4,0),(4,1),(2,3),(3,1)]', expected: 'topoOrder = [4, 5, 2, 0, 3, 1]', status: 'passed' },
      { input: 'V=2, edges=[(0,1),(1,0)]', expected: 'Cycle detected: return []', status: 'passed' }
    ]
  },
  {
    id: 'async-rwlock-rust',
    title: 'Thread-Safe Shared State with Arc<RwLock<T>>',
    description: 'Idiomatic Rust concurrency pattern enabling concurrent multiple readers or exclusive single writer under compiler-enforced borrow checks.',
    notes: 'Key takeaway: `Arc<RwLock<T>>` guarantees safe data sharing across threads without data races. Multiple readers acquire shared locks concurrently; writers acquire exclusive mutable locks, preventing stale reads and torn writes with zero garbage collection.',
    language: 'rust',
    version: 'Rust 1.76',
    course: 'CS 110: Systems',
    category: 'Systems & Concurrency',
    timeComplexity: 'O(1) lock acquire',
    spaceComplexity: 'O(1) overhead',
    tags: ['systems', 'concurrency', 'rust', 'threads', 'mutex', 'rwlock'],
    starred: false,
    pinned: false,
    createdAt: '2026-10-15T10:30:00Z',
    updatedAt: '2026-10-15T19:50:00Z',
    code: `use std::sync::{Arc, RwLock};
use std::thread;
use std::time::Duration;

#[derive(Debug)]
struct SharedState {
    counter: u64,
    status: String,
}

fn main() {
    let state = Arc::new(RwLock::new(SharedState {
        counter: 0,
        status: "INITIALIZED".to_string(),
    }));

    let mut handles = vec![];

    // Spawn 4 concurrent reader threads
    for id in 0..4 {
        let state_clone = Arc::clone(&state);
        handles.push(thread::spawn(move || {
            let lock = state_clone.read().unwrap();
            println!("Reader {}: counter={}, status={}", id, lock.counter, lock.status);
        }));
    }

    // Spawn 1 exclusive writer thread
    let writer_state = Arc::clone(&state);
    handles.push(thread::spawn(move || {
        let mut lock = writer_state.write().unwrap();
        lock.counter += 42;
        lock.status = "MUTATED_EXCLUSIVE".to_string();
        println!("Writer finalized state mutation");
    }));

    for h in handles {
        h.join().unwrap();
    }
}`,
    annotations: [
      {
        line: 23,
        author: 'Bhoomika Yadav',
        time: '4 hours ago',
        note: 'Send + Sync invariants: Arc provides atomic reference counting while RwLock prevents data races.'
      }
    ],
    testCases: [
      { input: '4 readers + 1 exclusive writer', expected: 'Safe concurrent execution, 0 data races', status: 'passed' }
    ]
  },
  {
    id: 'window-partition-sql',
    title: 'Rolling 7-Day Window Moving Average & Partition LAG',
    description: 'Advanced analytic SQL using OVER(), PARTITION BY, sliding window ROWS BETWEEN frames, and LAG() delta calculations.',
    notes: 'Key takeaway: Window functions compute cumulative or moving aggregates without collapsing rows like GROUP BY. `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` ensures exact physical frame bounds for moving average and trend detection.',
    language: 'sql',
    version: 'PostgreSQL / SQLite 3.38+',
    course: 'CS 145: Data Management',
    category: 'Databases & Storage',
    timeComplexity: 'O(N log N) index sort',
    spaceComplexity: 'O(N) window buffer',
    tags: ['sql', 'databases', 'analytics', 'window-functions', 'cte'],
    starred: false,
    pinned: false,
    createdAt: '2026-10-15T12:00:00Z',
    updatedAt: '2026-10-15T19:55:00Z',
    code: `WITH DailyUserMetrics AS (
    SELECT
        student_id,
        event_date,
        snippets_created,
        LAG(snippets_created, 1) OVER (
            PARTITION BY student_id
            ORDER BY event_date
        ) AS prev_day_snippets
    FROM student_study_log
)
SELECT
    student_id,
    event_date,
    snippets_created,
    (snippets_created - COALESCE(prev_day_snippets, 0)) AS day_over_day_delta,
    ROUND(AVG(snippets_created) OVER (
        PARTITION BY student_id
        ORDER BY event_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 2) AS rolling_7day_avg,
    SUM(snippets_created) OVER (
        PARTITION BY student_id
        ORDER BY event_date
    ) AS cumulative_study_snippets
FROM DailyUserMetrics
ORDER BY student_id, event_date;`,
    annotations: [
      {
        line: 18,
        author: 'Bhoomika Yadav',
        time: '3 hours ago',
        note: 'Analytical frame invariant: ROWS BETWEEN 6 PRECEDING calculates exact 7-day rolling window.'
      }
    ],
    testCases: [
      { input: '7 daily rows: [2, 4, 3, 5, 6, 8, 7]', expected: 'rolling_7day_avg = 5.00', status: 'passed' }
    ]
  }
];

const toAdd = newSnippets.filter(s => !existingIds.has(s.id));
const merged = [...current, ...toAdd];

fs.writeFileSync(seedPath, JSON.stringify(merged, null, 2), 'utf8');
fs.writeFileSync(dbPath, JSON.stringify(merged, null, 2), 'utf8');
console.log('Seeded successfully. Total programs:', merged.length);
