# UNIWEB-711 — Z. Books Session 2: Books (Player / Review / Detail Book)

Jira: https://univini-web.atlassian.net/browse/UNIWEB-711 (Sprint: BOOKS - LÂM LÀM, Assignee: Thanh Huệ, Priority: Medium, Status: EST)
Figma: file `WSwox0rdb2HsuH8eY9QawZ` (📚 Website | Library), page "UI" → section **"2. Books"** (node `162-55119`, ~888k tokens estimated by Figma's own MCP panel — this is a large section, budget accordingly).
Depends on: UNIWEB-710 (Overview) — done and verified, see `docs/plans/UNIWEB-710-books-session1-overview.md`. This ticket picks up where that one left off, specifically the P2 "Audio player parity" item that was deferred there.

## Read this before writing any code

This is a big ticket (Jira lists ~20 sub-items across Player / Review / Detail Book, matching ~25 Figma frames). **Recommend splitting into 3 sequential PRs** rather than one — Detail Book baseline, Review, Player. Don't attempt all of it in one branch; each phase below is independently shippable and testable.

I inspected roughly a third of the Figma frames directly (node-ids given below); the rest were not opened individually — pull them via the Figma Dev Mode MCP (`.cursor/mcp.json` → `http://127.0.0.1:3845/mcp`) as you reach each phase rather than guessing from names alone. Every current-code claim below was verified by reading the actual source, not assumed.

## Two findings that resolve open questions from the UNIWEB-710 plan

1. **The mini player is meant to be global/persistent.** The Figma layer tree literally names it "Persistent Player Bar" and it appears on the Detail Book, Review-modal, and player-text frames alike — not just while actively on a "listen" screen. Current `BookMiniPlayer.tsx` returns `null` whenever `!url`, i.e. it disappears entirely with no book loaded. That early "should it show when idle" question is answered: **yes, per Figma naming, it's a persistent shell element**, though whether it renders in a true zero-state (never played anything this session) or only "paused but loaded" is still worth a quick Figma MCP check on the exact idle-state frame before building it.
2. **Skip amount is 10s, not 15s** (already corrected in the UNIWEB-710 plan) — `BookMiniPlayer.tsx`'s existing ±10s is right, don't change it.

## Current code inventory (verified by reading source)

```
src/Container/Book/BookDetail/BookDetail.tsx   → Detail Book page: hero, Read/Listen CTAs, Summary/Chapter tabs only
src/Container/Book/BookReader/BookReader.tsx   → Reader: chapter select, Read/Listen mode, flat bilingual sentence list, pager
src/Components/Book/BookMiniPlayer/BookMiniPlayer.tsx → global mini player: play/pause, ±10s, prev/next chapter, seek, speed cycle
src/Components/Book/BookLanguageModal/          → learning + native language picker (already covers "Select two languages")
src/hooks/Book/{useBookDetail,useBookReader}.tsx
src/apis/book/{bookApis,chapterApis,readerApis}.tsx
```

No vocab, review-submission, or share code exists anywhere in the Book feature (`grep -ri vocab src/apis/book src/Container/Book src/hooks/Book` and the equivalent for `share` both return nothing). Review is read-only today (`book.review_summary?.overall_rating` displayed, no way to submit one).

## Phase 1 — Detail Book baseline gaps (do first, smallest, unblocks the rest)

Figma reference frame: `detail book-Searched Vocab` (node `268-69402`) — even though this phase isn't the vocab tab itself, this frame is the clearest reference for the page's full header treatment (best node to pull via MCP for the shared header/tab-bar styling).

- **Metadata row incomplete.** Figma shows `Listening time` · `Vocabulary size` · `Rating` as three explicit stat blocks with icons under the title. Current `BookDetail.tsx` meta line is a single joined string (`level · category · duration · words · rating`) — different shape and missing "listening time" as its own labeled stat. Rework to match, source `est_duration` (already used) for listening time, `total_words` for vocabulary size, `review_summary` for rating — no new API fields needed, just markup.
- **Action row missing icon buttons.** Figma has Read (filled), Listen (filled), then three icon buttons: bookmark/add, share, "…" more. Current code only has Read + Listen + `BookLanguageButton`. Add:
  - Bookmark/save-to-library icon — check `bookApis.tsx` for an existing "add to library" endpoint before inventing one (the Overview's "All books" and the sidebar nav both reference a library concept already).
  - Share icon — check whether this is a native `navigator.share`/copy-link pattern used elsewhere in the codebase (`grep -ri "navigator.share\|copy.*link" src/Components`) before building bespoke share UI.
  - "…" more menu — pull the Figma frame for it (visible in the "2. Books" layer list as its own node, not yet opened this session) to see what it contains before implementing blind.
- **Third tab: "Searched vocab".** Add as a tab alongside Summary/Chapter (`BookDetail.tsx` `tab` state currently only handles `'summary' | 'chapter'`). Content: list of looked-up words, each with UK/US IPA + pronunciation-audio icon + translation + a small level/frequency indicator + expand chevron. This tab's data depends on Phase 3's vocab-save mechanism existing — if no words have been saved yet when this ships, just wire the empty state (reuse `BookEmptyState` from the UNIWEB-710 work) rather than block the tab on Phase 3 being done.

## Phase 2 — Review

Figma reference: `detail book-Review` (node `176-72470` for the modal, `176-70353` for a cleaner second pass of the same modal) — a **modal**, not a page: emoji reaction, 5-star rating, free-text textarea (1000 char limit shown in the mock — `0/1000` counter), "Submit review" button. Triggered from the new Review icon/entry on the Detail Book action row (Phase 1).

- Check `bookApis.tsx` / the Apidog export (`docs/vn-connection-openapi.json` at the univini workspace root, or https://app.apidog.com/project/1059338) for an existing submit-review endpoint before adding one — the read side (`review_summary`) already exists, so a write counterpart likely does too.
- Build the modal as a shared `Components/Book` component (e.g. `BookReviewModal`) — don't inline it in `BookDetail.tsx`, since the Jira also lists a standalone "Book review" list view (reading others' reviews), which will want the same rating-display primitives.
- "Book review" (the list of existing reviews, separate from the submit-one-review modal) — not inspected this session; pull its Figma node via MCP before building, don't assume it's just a list of the same modal's fields.

## Phase 3 — Player (largest phase, do last)

This is the deep-reading/listening experience, replacing large parts of `BookReader.tsx`.

- **Sentence-sync highlighting is the core gap and has an explicit designer note on the Figma frame itself** (`player-text`, node `181-58060`): *"LOGIC highlight: highlight theo câu, đọc câu nào highlight câu đó không highlight 1 đoạn nhiều câu"* — i.e. highlight exactly the sentence currently being narrated, never a whole multi-sentence paragraph at once. Current `BookReader.tsx` renders all sentences flatly with no highlight state at all and no dark "listen mode" theme (Figma's player-text frame is a distinct dark background, not the light reading theme). This needs: (a) sentence-level timing data from the audio (check `chapterApis.tsx`/`readerApis.tsx` for per-sentence timestamps before assuming you need to add them), (b) a highlight-state computed from `currentTime` in `BookPlayerContext`, (c) the dark listen-mode visual treatment as a distinct mode from the existing light "read" mode.
- **Player-text-Translate**: inline/tap translate for the currently-highlighted sentence — not inspected in detail this session, pull via Figma MCP. Likely toggles the native-language line's visibility per sentence rather than always showing both (current code always shows both `learning` and `native` text).
- **Choose audio languages**: a language picker specifically for which audio track/TTS voice plays — distinct from `BookLanguageModal` (that's the reading-text language pair, not confirmed to also drive audio track selection). Check `bookApis.tsx`/`readerApis.tsx` for whether a book can have multiple audio tracks before assuming this is just re-using the existing language modal.
- **Display**: a text-appearance settings panel (the "Aa" icon seen in the player-text control bar) — font size / theme, not inspected in detail, pull via Figma MCP.
- **Vocab auto-saved**: tapping a word while reading/listening saves it to the vocabulary list (feeds Phase 1's "Searched vocab" tab, and possibly the separate top-level "6. Learn Vocabulary" Figma section — check whether that section is actually the same feature viewed from a different entry point before building two parallel vocab systems). No backend wiring exists at all for this yet (`grep -ri vocab` across the Book API/hooks/interface layers returns nothing) — this is 0%, budget real time for it, including checking Apidog for a vocab-save endpoint.
- **Player-voice-not available**: already done — `BookReader.tsx`'s `audioMissing` banner ("No audio for this chapter") covers this.
- **Playback speed**: already done — `BookMiniPlayer.tsx`'s `cycleSpeed`/rate display.
- **Finished a book**: a completion state/celebration — not inspected, pull via Figma MCP; likely triggers off `currentTime >= duration` on the last chapter in `BookPlayerContext`.

## Non-goals / out of scope for this ticket
- "6. Learn Vocabulary" and "7. Reader Profile" as their own top-level Figma sections — separate tickets, don't fold into this one even though "Vocab auto-saved" may end up sharing data with "Learn Vocabulary". Confirm the boundary with Admin if it's unclear once you're in Phase 3.
- Real TTS/audio-track infrastructure if "Choose audio languages" turns out to need multiple audio files per book that don't exist in the current data model — flag to Admin rather than building speculative backend support.

## Suggested order
1. Phase 1 (Detail Book baseline) — contained, no new heavy data modeling, good first PR.
2. Phase 2 (Review) — needs Phase 1's action-row entry point, self-contained modal otherwise.
3. Phase 3 (Player) — largest and riskiest (sentence-timing data dependency), do last once Admin has confirmed the vocab/audio-language open questions above.
