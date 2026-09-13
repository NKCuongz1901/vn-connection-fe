# UNIWEB-710 — Books Session 1: Overview

Jira: https://univini-web.atlassian.net/browse/UNIWEB-710 (Sprint: BOOKS - LÂM LÀM, Assignee: Thanh Huệ, Priority: Medium, Status: EST)
Figma file: https://www.figma.com/design/WSwox0rdb2HsuH8eY9QawZ/Website-%7C-Library — page "UI" → section "1. Overview [DUYỆT]"
Live route: `/en/mini-apps/books-audio` (branch `feature/web-710-books-overview`, based on `develop`)

**Status update (2026-09-13):** the Books/Audiobooks feature already exists in `develop` — routes, containers, hooks, and API calls are wired up with real data (see file map below). **This is not a greenfield build.** UNIWEB-710 is a gap-closing / UI-alignment pass against the approved Figma, not new construction. Do not re-scaffold anything listed as "exists" below.

**Status update (2026-09-13, later same day): P0 + P1 + P2 empty-state shipped and verified in-browser (logged in as the test account, `feature/web-710-books-overview`).** Working tree has uncommitted changes covering all of that — see the per-item status below before picking up more work here.

## Existing implementation (verified against the running app + source)

```
src/app/[locale]/mini-apps/books-audio/
  layout.tsx            → BookLibraryProvider + BookPlayerProvider + BookShell
  page.tsx               → Overview (Container/Book/Overview/BookOverview.tsx)
  all/page.tsx            → BookSeeAll kind="all"
  continue/page.tsx       → BookSeeAll kind="continue"
  top-pick/page.tsx       → BookSeeAll kind="top-pick"
  recent/page.tsx         → BookSeeAll kind="recent"
  popular/page.tsx        → BookSeeAll kind="popular"
  book/[id]/page.tsx      → BookDetail
  book/[id]/read/page.tsx → BookReader

src/Container/Book/{Overview,SeeAll,BookDetail,BookReader,BookShell}/
src/Components/Book/{BookCard,BookRail,BookMiniPlayer,BookLanguageModal}/
src/hooks/Book/{useLibraryOverview,useBookSeeAll,useBookDetail,useBookReader}.tsx
src/apis/book/{bookApis,chapterApis,readerApis}.tsx
src/context/{BookLibraryContext,BookPlayerContext}.tsx
src/interface/Book/book.interface.tsx
src/Variable/book.variable.tsx
```

Confirmed working end-to-end against the dev API (logged in as the test account): Continue reading, All books, Top picks for you, Recently added, Popular now all render real book data; the sidebar has working Level and Category filters; BookMiniPlayer plays/seeks/skips when a book is active.

## Gap list vs. Figma "1. Overview [DUYỆT]" — this is the actual scope of UNIWEB-710

Ordered by priority per Admin (category-detail and Popular now first):

### P0 — Category-detail — ✅ DONE, verified in-browser
- New route `src/app/[locale]/mini-apps/books-audio/category/[id]/page.tsx` → `BookSeeAll kind="category" categoryId={id}`.
- Sidebar category chips (`BookShell.tsx`) now call `onChangeRoute(bookCategoryPath(id))` instead of the old in-place `setCategory` filter (that state/handler was removed cleanly from `useLibraryOverview.tsx` — no dead code left).
- Verified live: clicking "Fiction" navigates to `/category/<uuid>`, shows back chevron, title "Fiction" + total-count badge (30), "Level A1", search box, grid of tiles with ratings, "Load more" pagination. Matches Figma `node 39-9602`.
- Empty-result state (searched a nonsense query) correctly renders the new `BookEmptyState` illustration — matches Figma `node 39-15210`.

### P0 — Popular now layout — ✅ DONE, verified in-browser
- `BookOverview.tsx`: dropped `layout="list"` — Popular now rail is now the same tile grid as Recently added.
- `BookSeeAll.tsx`: dropped the `kind === 'popular'` special-case (`classes.rows` / `variant="row"`) — always renders `classes.grid` / `variant="tile"` now.
- Rating metadata (`★ 5.0`) kept on the tile (via `BookCard.tsx` meta line joining progress/author + rating) — resolved the plan's open question: keep it, since Figma's own see-all pages show that metadata (only the bare Overview-rail covers omit it).
- Verified live at `/mini-apps/books-audio/popular`: grid layout, ratings shown, search box present, badge count (52).

### P1 — Section order — ✅ DONE, verified in-browser
- `BookOverview.tsx` reordered to: Continue reading → Top picks for you → Popular now → Recently added → All books (level), matching Figma order with "All books" (not a Jira sub-item, kept per plan) pushed to last.
- Verified by scrolling the live Overview page.

### P1 — Top picks for you — search — ✅ DONE, verified in-browser
- `BookSeeAll.tsx` now shows a debounced (300ms) search input (`search_text` API param, already supported server-side) for `top-pick`, `popular`, and `category` kinds — broader than the plan's minimum ask, reasonable since Figma likely wants it on any browsable grid, not just Top picks.
- Verified live at `/mini-apps/books-audio/top-pick`: search box present, results/badge count update.

### P2 — Empty state — ✅ DONE, verified in-browser
- New `src/Components/Book/BookEmptyState/` (icon `public/images/book/empty-books.png` 80×80 + "There are no book yet!" + subtext), matching Figma `node 39-15210`. Swapped into `BookRail.tsx` (compact variant, rail-level empty) and `BookSeeAll.tsx` (full variant, page-level empty/no-results).
- Verified live: category search with no matches renders the illustration correctly.

### P2 — Audio player parity — INTENTIONALLY NOT STARTED
- Not touched. Correction to this doc's earlier note: the Figma frame's skip-button label actually reads **"10 sec"**, not 15 — so `BookMiniPlayer.tsx`'s existing ±10s skip already matches Figma; no change needed there after all.
- Still open and blocking any work here: whether the mini player bar should render in an idle/no-track state (Figma's empty-state frame shows it; current code returns `null` with no `url`), and whether to add like/bookmark/shuffle/queue controls. **Get Admin's answer before touching `BookMiniPlayer.tsx`.**

### P3 — Polish — back button DONE, visual pass still open
- `BookSeeAll.tsx` header rebuilt: `IconChevronLeft` icon button (was plain "← Back" text), title row with count badge, "Level A1" subtitle — done as part of the P0/P1 changes above since they touched the same file.
- Broader visual/spacing pass against Figma (type scale, colors, card polish) not done — still open, do last per the original plan.

## Non-goals (unchanged)
- Real audio streaming/DRM concerns — playback already works via `BookPlayerContext`; this ticket is not about the playback engine itself, only the surrounding UI (player bar controls/skip amount excepted, see P2).
- "My Library", "Reading profile", "Contributed book" (visible as disabled/"Coming soon" nav items in `BookShell.tsx`) — separate tickets, don't implement.

## Remaining work
1. ~~Popular now layout fix (P0)~~ — done.
2. ~~Category-detail page (P0)~~ — done.
3. ~~Section reorder (P1)~~ — done.
4. ~~Top picks search (P1)~~ — done (plus popular/category).
5. ~~Shared empty-state component (P2)~~ — done.
6. **Audio player parity (P2)** — blocked on Admin's answer re: idle-state bar + like/bookmark/shuffle/queue scope. Skip amount does NOT need changing (Figma says 10 sec, code already does 10 sec).
7. **Visual/spacing polish pass (P3)** — only remaining open item besides the player. Compare the live pages above against Figma node-by-node once this branch is otherwise ready to commit.

Changes are currently **uncommitted** on `feature/web-710-books-overview` — not yet committed or pushed. Lint is clean on the touched files and `tsc` reports no errors on the Book path (per the implementer); browser verification (this session) confirms Overview, Popular now, Top picks, and a category-detail page all render and behave correctly against the real dev API, including the search-empty state.

Use the Figma Dev Mode MCP (`.cursor/mcp.json` → `http://127.0.0.1:3845/mcp`, requires Figma desktop's Dev Mode MCP Server enabled) to pull exact spacing/assets per node-id above for the remaining polish pass, rather than eyeballing the screenshots in this doc.
