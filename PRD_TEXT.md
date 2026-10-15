PRODUCT REQUIREMENTS DOCUMENT
Snippet Hub
A personal code library that helps students save, understand, find, and adapt useful code.
PRD and Claude implementation prompt  |  Version 1.0  |  15 October 2026
Build-ready starting point. Assumptions are labeled so a student or beginner developer can change them deliberately.
Executive summary
CodeShelf is a responsive web app for students to collect reusable code snippets and retrieve them later by title, code, language, tags, and category. Each snippet includes context and a learning note. Optional AI actions explain code, suggest a solution approach, or translate a snippet between languages. The first release prioritizes reliable saving, organization, and search; AI follows behind safe key handling, consent, and useful failure states.
Decision area
Default
Audience
Individual students learning programming; one account owns one private library.
MVP platform
Responsive web app, desktop-first for code editing and usable on mobile.
Suggested stack
Next.js + TypeScript, PostgreSQL via Supabase, Supabase Auth, server-side API routes, Vercel-compatible hosting.
AI
Provider-agnostic server adapter; server-side secret. AI is optional and never required to save/search.
Commercial model
Free student MVP; no payments, sharing, or classroom administration initially.
Success signal
Users save a snippet and later find and reuse it quickly; AI assistance is understandable when enabled.
How to use this document
Use Sections 1–12 as the product and engineering brief. Copy Section 13 into Claude Code or another coding agent. The prompt asks the agent to inspect the repository first, build in small verified steps, and explain beginner-relevant decisions.
1. Product overview
Problem
Students encounter useful code in lessons, assignments, documentation, and experiments, then lose it across files, browser tabs, and chat history. Even when they find a fragment later, they may not remember what it does, which language it uses, or how to adapt it. Generic notes tools lack code-aware search and a learning-oriented explanation workflow.
Product vision
Give each student a dependable, searchable coding notebook that turns saved examples into reusable learning material.
Goals
Make adding a snippet fast and structured without requiring every optional field.
Make retrieval predictable through full-text search, filters, tags, categories, and language.
Help users learn from saved code with optional, contextual AI actions.
Keep data private by default and make AI sharing explicit.
Use the app to teach practical data organization: metadata, relationships, and search.
Non-goals for MVP
Public marketplace, social feed, collaborative editing, or classroom dashboards.
Executing or compiling arbitrary user code on the server.
AI agents that modify a library without review.
IDE extensions, native apps, offline sync, payments, or broad third-party imports.
Assumptions to validate
Assumption
Default and validation
Primary user
Beginner/intermediate student; validate with 5–8 students before broadening.
Privacy
Snippets are private to their owner unless explicit sharing is added later.
AI provider
Start with one provider behind an adapter; keep provider/model configurable.
Search scale
Personal library (hundreds to a few thousand snippets); PostgreSQL full-text search is sufficient.
Authentication
Managed auth; authentication required to persist data.
Education context
AI supports learning; generated answers are not guaranteed correct.
2. Users and jobs to be done
User
Need
Product response
Student learning a first language
Save examples with context and retrieve them while practicing.
Quick add, language/category, tags, notes, readable code view, explain.
Student working across languages
Understand a pattern and compare an equivalent in another language.
Translation action with target language, assumptions, and side-by-side result.
Student stuck on a small task
Get a hint tied to their code or problem context.
Solution assistance with steps, hints, and optional example.
Beginner developer building the app
Know what to build first and how parts connect.
Phased roadmap, schema/API contracts, setup and deployment steps.
Jobs to be done
When I learn a useful pattern, I want to save it with enough context to understand it later.
When I remember part of a solution, I want to search titles, code, notes, and tags and narrow results quickly.
When I revisit unfamiliar code, I want an explanation at my level without losing the original.
When I need the same idea in another language, I want a draft translation I can inspect and edit.
3. Scope and feature priorities
Priority
Capability
Acceptance summary
P0 MVP
Account and private library
User signs in and sees only their own snippets.
P0 MVP
Snippet CRUD
Required title/code/language; optional description, notes, category, tags; clear save state.
P0 MVP
Organization
Create/select categories and tags; filter by language/category/tag; empty states.
P0 MVP
Search
Search title, code, notes, description, tags; combine with filters; sort recent/title.
P0 MVP
Responsive and accessible UX
Keyboard-operable forms, labels, focus, narrow layouts, loading/error/empty states.
P1 next
AI explain
Beginner-friendly explanation; explicitly invoked.
P1 next
AI solution assistance
Guided approach, hints, optional example; never overwrite source.
P1 next
AI translation
Target language, draft code and differences, copy/save-as option.
P2 later
Import/export
JSON/Markdown export; validated import with duplicate handling.
P2 later
Favorites
Quick access to frequently reused snippets.
P3 later
Sharing/collaboration
Explicit public links, class collections, comments, and access controls.
MVP release boundary
MVP is complete when users can authenticate, maintain private snippets, organize them with tags/categories/languages, search and filter, and deploy with documented configuration. Enable AI for a public pilot only after the core library, key management, and privacy behavior are verified.
4. User flows
Flow A: first use and save
Open the site and sign in or create an account.
See a short welcome state with Add snippet and a search hint.
Enter title and code; choose/add language; optionally add category, tags, description, and learning notes.
Save; receive confirmation and land on details or see a clear saved state.
Later edit or delete; deletion has clear confirmation.
Flow B: find and reuse
Enter a phrase, identifier, or code fragment.
See title, language, category, tags, and a matching excerpt.
Refine by language/category/tag and sort by recent or title.
Open a result, inspect code and notes, then copy with accessible confirmation.
Flow C: AI explanation
Open a snippet and choose Explain.
Show what selected code and optional context will be sent to the configured AI provider.
Server sends a bounded request; UI shows progress and actionable errors.
Render purpose, walkthrough, concepts, and caveats; allow retry/copy/dismiss. Original remains unchanged.
Flow D: translation
Choose Translate and select a target language.
Optionally add runtime/version or style constraints.
Review translated code and notes side by side as a draft.
Copy it or save as a new snippet; never silently replace the source.
5. UX and visual direction
Use a calm, student-friendly workspace: light neutral canvas, one restrained blue/teal accent, strong contrast, and monospaced code. The library and search are the home-screen focus, not a chatbot.
Area
Recommended behavior
App shell
Left navigation for All snippets, Categories, Settings; top bar with global search and Add snippet.
Library
Desktop list/table and mobile cards; title, language, tags, updated date, concise description.
Editor
Title and code are prominent; metadata grouped and optional; preserve whitespace and highlight code.
Snippet detail
Readable code and copy action; notes and metadata; Explain, Help me solve, Translate grouped.
AI results
Clearly generated; structured headings; copy/retry/dismiss; original retained.
Accessibility
Semantic headings, labels, contrast, keyboard navigation, visible focus, screen-reader messages, reduced motion.
Feedback
Inline validation and save state; useful loading indicators and plain-language errors.
Content rules
Use “Help me solve” or “Give me a hint”; do not position AI as an answer authority.
Explain what data is sent; send no unrelated library content.
Use plain-language labels and examples.
Show dates in the user’s locale and identify code language explicitly.
6. Data model
Use PostgreSQL with UUID primary keys, UTC timestamps, foreign keys, indexes, and ownership checks. Keep MVP metadata normalized: tags/categories are separate records.
Entity
Fields
Notes
users
id UUID (auth subject), email, display_name nullable, created_at
Identity managed by auth; no app-stored passwords.
snippets
id, user_id FK, title, code, language, description?, notes?, category_id?, created_at, updated_at
Required title/code/language; owner indexed.
categories
id, user_id FK, name, created_at
Unique per user on normalized name; one category per snippet.
tags
id, user_id FK, name, created_at
Unique per user on normalized name.
snippet_tags
snippet_id FK, tag_id FK, created_at
Composite primary key; ensure both rows share owner.
ai_generations
id, user_id, snippet_id?, action, languages?, model?, status, created_at
Optional metadata only; do not store full prompts/responses by default.
Data constraints and indexes
Trim labels; use case-insensitive per-user uniqueness; reject empty names.
Index snippets by (user_id, updated_at DESC), language, category; index normalized tag names and join keys.
Search title, description, notes, code, and tags. Begin with PostgreSQL full-text plus substring matching for identifiers.
Enforce ownership in database RLS and backend; never trust browser-supplied user_id.
Use confirmed deletion and document cascading behavior; add soft deletion only with a recovery design.
7. API and backend requirements
Use authenticated server routes as the policy boundary for mutations and AI. Validate server-side, return consistent errors, and do not leak provider/database details.
Method and route
Purpose
Key behavior
GET /api/snippets
List/search/filter
q, language, categoryId, tagId, sort, cursor; owner scope; paginate.
POST /api/snippets
Create
Validate title/code/language; attach only owned category/tags.
GET /api/snippets/:id
Detail
Owner only; return 404 for missing or non-owned.
PATCH /api/snippets/:id
Update
Allowlist fields; transactionally update tags; refresh updated_at.
DELETE /api/snippets/:id
Delete
Owner-only; require UI confirmation; return 204.
GET/POST /api/categories
List/create
Owner-scoped; normalize names and reject duplicates.
GET/POST /api/tags
List/create
Owner-scoped; normalize names and reject duplicates.
POST /api/ai/explain
Explain
Authenticate, bound input, rate-limit, validate structured response.
POST /api/ai/assist
Learning help
Return steps/hints and optional example; never execute code.
POST /api/ai/translate
Translate
Validate target and size; return code and caveats; do not overwrite.
Backend conventions
Paginate and cap page/payload sizes.
Return 400 validation, 401 unauthenticated, 404 absent/non-owned, 429 rate limited, and generic 5xx errors.
Use transactions for snippet/tag updates. Log request IDs but not source code or secrets.
Use CSRF protections appropriate to session model; secure, httpOnly, sameSite cookies where applicable.
Version migrations and document local database setup/reset.
8. AI integration
Provider architecture
Define a small server-only interface such as explainSnippet(input), assistWithProblem(input), and translateSnippet(input). Keep provider selection behind an adapter. Credentials belong in deployment secrets and never in client bundles.
Prompt and response design
Send only the current snippet and context needed for the action.
Set token limits, timeout, and per-user rate limits; reject oversized code.
Request structured output and validate before rendering; handle malformed output safely.
Treat snippet text as untrusted data. Ignore instructions embedded in code/comments; never execute code.
Explanation: summary, walkthrough, concepts, caveats. Assistance: assumptions, progressive hints, approach, optional example. Translation: target code, mapping notes, compatibility assumptions.
Label responses AI-generated and encourage verification/testing; never claim guaranteed correctness or security.
Privacy, cost, and reliability
User triggers actions; disclose data transfer and allow dismissal.
Do not store full prompts/responses by default. Define retention before adding storage.
Use timeout, bounded transient retries, and per-user quota.
When AI is unavailable, CRUD/search continue and AI shows a helpful configuration state.
Track action, provider/model, latency, outcome as needed, but never code, notes, tokens, or keys.
9. Security and privacy requirements
Use a maintained auth provider and protect account/session endpoints.
Scope every query and mutation to the authenticated owner; add database RLS.
Keep secrets in local environment and production secret manager; commit placeholders only; rotate exposed keys.
Validate lengths/types, escape rendered text, sanitize markdown, and never render user HTML unsafely.
Rate-limit login and AI endpoints; cap snippet sizes and request frequency.
Use HTTPS and managed encrypted storage; collect minimal personal data.
Explain AI data transfer; support account deletion and define cascading cleanup.
Use lockfiles; update dependencies deliberately; scan for secrets and vulnerabilities before release.
Never execute saved snippets in the app server. A future sandbox must be separately isolated and bounded.
10. Testing and quality plan
Test highest-risk boundaries first: ownership, search filters, persistence, and AI request handling.
Layer
Coverage examples
Unit
Validation/normalization, tag/category logic, search query, AI parsing, rate limits.
Integration
Authenticated CRUD; cross-user denial; owned metadata; database constraints.
UI/component
Forms, filters, loading/empty/error states, copy feedback, keyboard, AI notice.
End-to-end
Sign in, create tagged snippet, search, edit, copy, delete; verify isolation.
Security
Unauthenticated access, IDOR, oversized input, injection/XSS, secret scanning, AI boundaries.
Accessibility
Automated checks plus keyboard/screen-reader spot checks; contrast and responsive review.
Definition of done
Acceptance criteria pass locally and in a production-like deployment.
No secrets in client bundles or repository; ownership checks covered.
Search combines query and filters and has clear no-results behavior.
Errors do not discard unsaved content; users can recover from network/provider failures.
README covers setup, environment, migrations, test/lint/build, and deployment.
Core flows work on mobile and desktop with visible focus and meaningful labels.
11. Deployment and operations
Create repository, choose stack, commit lockfile and .env.example.
Provision managed PostgreSQL/auth and apply versioned migrations.
Configure local secrets outside source control; AI credentials are optional for core development.
Deploy previews for review, then production with HTTPS, managed secrets, least privilege.
Run migration and smoke checks before traffic; maintain application rollback steps.
Monitor uptime, errors, auth, database health, AI use/cost/latency, and rate limits without logging snippet content.
Back up the database and verify restore steps before relying on it for student work.
Environment variables (example names)
Variable
Purpose
Exposure
DATABASE_URL
Server PostgreSQL connection
Server only
NEXT_PUBLIC_SUPABASE_URL
Supabase URL if using client auth
Public config
NEXT_PUBLIC_SUPABASE_ANON_KEY
Anon key protected by RLS
Public config
SUPABASE_SERVICE_ROLE_KEY
Privileged server operations, if required
Server secret only
AI_PROVIDER_API_KEY
Provider credential
Server secret only
AI_PROVIDER / AI_MODEL
Adapter selection/model
Server config
APP_URL
Canonical URL for auth callbacks
Server/public as needed
12. Phased MVP roadmap
Phase
Outcome
Exit criteria
0 Validate (2–3 days)
Confirm problem, labels, and flows with students.
5–8 interviews/usability sessions; prioritize confusion and metadata.
1 Foundation (week 1)
App shell, auth, schema, migrations, ownership.
Two accounts isolated; local setup documented.
2 Library core (weeks 2–3)
CRUD, detail, language/category/tags, responsive list.
CRUD and metadata complete with validation/states.
3 Retrieval (week 4)
Search, filters, sorting, pagination, copy.
Search acceptance cases pass for personal library scale.
4 AI actions (week 5, gated)
Explain, assistance, translation, adapter, quotas, privacy notice.
Optional, bounded, validated; source remains unchanged.
5 Pilot/launch (week 6)
Accessibility/security, deployment, backup, feedback.
Definition of done; pilot users complete save/find/reuse.
Timing assumes one beginner developer using AI coding assistance. Extend phases rather than skipping ownership, security, or verification work.
Product metrics
Metric
How to interpret
Activation
New users saving their first snippet within 24 hours.
Retrieval success
Search sessions that open or copy a result.
Time to retrieve
Median time from search entry to open/copy; validate with usability tests.
Reuse
Weekly active users revisiting or copying a saved snippet.
AI usefulness
Optional rating paired with failure, latency, and cost.
Reliability
API errors, search latency, AI timeouts, and verified backup restore.