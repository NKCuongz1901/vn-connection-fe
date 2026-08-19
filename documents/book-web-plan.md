# Plan — Xây Book & Audio (Library) trên Web FE

> **Repo:** `vn-connection-fe`  
> **Tham chiếu hành vi:** `vn-connection-mb/mini_app/vn-connection-mb-lib`  
> **Tham chiếu API:** `vn-connection-cms/documents/VN Connection.postman.json` (folder **Library**)  
> **UI:** [Website | Library (Figma)](https://www.figma.com/design/WSwox0rdb2HsuH8eY9QawZ/%F0%9F%8C%90-%F0%9F%93%9A-Website-%7C-Library?node-id=5-2) — canvas `5:2` **UI**, page Welcome `0:1`  
> **Trạng thái:** Đã đọc Figma MCP. Section **[DUYỆT]**: Overview, Streaks, My Library. Chờ approval MVP trước khi implement.  
> **Ngày:** 2026-08-19

---

## Mục lục

1. [Tóm tắt](#1-tóm-tắt)
2. [Hiện trạng](#2-hiện-trạng)
3. [Phạm vi sản phẩm](#3-phạm-vi-sản-phẩm)
4. [Map màn hình Mobile → Web](#4-map-màn-hình-mobile--web)
5. [Kiến trúc FE đề xuất](#5-kiến-trúc-fe-đề-xuất)
6. [Route map](#6-route-map)
7. [API mapping](#7-api-mapping)
8. [Gap API (Postman vs Mobile)](#8-gap-api-postman-vs-mobile)
9. [UI / Figma](#9-ui--figma)
10. [Phased delivery](#10-phased-delivery)
11. [File structure dự kiến](#11-file-structure-dự-kiến)
12. [Rủi ro & quyết định](#12-rủi-ro--quyết-định)
13. [Test plan](#13-test-plan)
14. [Checklist approval](#14-checklist-approval)

---

## 1. Tóm tắt

Port mini-app **Book & Audio** (Library) từ Flutter sang web Next.js, giữ **cùng API backend**, **cùng luồng nghiệp vụ**, UI lấy từ **Figma web** (không copy 1:1 layout mobile).

Sản phẩm mobile hiện có 4 tab gốc + ~25 route con: Overview, My Library, Vocabulary, Reader Profile, cộng Read/Listen, Streak, Review, Distribute book.

Web **không** port: offline download (Isar), notification native, admin UniVini chapter (đã có CMS), mini-app Tutor/Biz.

Đề xuất ship theo 4 phase: **Discover → Read/Listen → Library+Review+Streak → Vocab+Distribute**.

---

## 2. Hiện trạng

### 2.1 `vn-connection-fe` — Book chưa có

| Hạng mục | Hiện trạng |
|----------|------------|
| Stack | Next.js 14 App Router, axios, antd, SCSS module, next-intl |
| Pattern feature mới | `app/[locale]/…/page.tsx` → `Container/` + `hooks/` + `apis/` + `Components/` + `interface/` (xem TalkRoom) |
| Mini apps entry | Sidebar **Mini apps** → `/mini-apps` = **"Coming soon"** |
| Button Books & Audio | Có route `mini-apps/books-audio` trong `MINI_APP_ITEMS`, **click bị disable**, tooltip *"This mini app is available in the UniVini app"* |
| API Book | **Chưa có** `bookApis` / `chapterApis` / `vocabularyApis` / `streakApis` |
| Audio sẵn có | `wavesurfer.js` + `VisualizerWithPlay`; TTS path `files/text-to-speech` đã dùng trong chat |
| i18n | `messages/{en,vi,de}.json` gần như stub — Book sẽ cần namespace riêng |
| Auth | Header `platform: WEB`. Mini apps **bắt buộc login** (không nằm `appLayoutGuestAllowed`) |
| Layout | `MainLayout` sidebar + content. Book nên sống **trong** layout này, reader/listen có thể fullscreen overlay |

Điểm vào hiện tại:

```
Search page → MiniAppList → MiniAppButton (disabled)
Sidebar → Mini apps → Coming soon
```

### 2.2 Mobile Library (`vn-connection-mb-lib`) — source of truth hành vi

4 tab shell `HomeLibraryPage`:

| Tab | Screen | Việc chính |
|-----|--------|------------|
| Overview | `LibraryOverviewPage` | Level A1–B2, category chips, Continue reading, All books, Top pick, Recently added, Popular now, mini player, Streak badge, Distribute |
| My Library | `MyLibraryPage` | Tab Books / Favorites → `GET /book/my-lib` |
| Vocabulary | `MyVocabularyPage` | UniVini sets + user folders + learn flashcard |
| Profile | `ReaderProfilePage` | Reader profile, reading goal, journey, my reviews, contributed books, badges |

Route con quan trọng (`book_router.dart`):

- Discovery: Search, Category, All books, Top pick, Popular, Recently added, Continue reading
- Book: Detail (Description / Chapters / Comments), Listen+Read, Review, Report
- Vocab: UniVini folder, User folder, Word type, Flashcard learning
- Streak: Account streak, reminder, completed, leaderboard
- Authoring: Upsert book, Upsert chapter, Manage book, Crop image

Service layer mobile (cần tương đương hook/context web):

- `LibraryOverviewService` — list controllers + level
- `ListenBookService` — audio global (mini player)
- `ReadingBookService` — current book + chapters
- `TrackReadingService` — progress + streak
- `StreakMissionService` — init reader + missions
- `LanguageBookService` — single/bilingual
- `ReaderProfileService`

### 2.3 Postman — dùng folder **Library**, không dùng folder **Book**

Folder gốc tên `Book` (khoảng line 55014) **lẫn API sticker / chapter cũ**, không dùng.

Source of truth API user-facing: folder **`Library`** (~105 request), nhóm:

| Folder Postman | Số API | Dùng cho phase |
|----------------|--------|----------------|
| Library/Book | 16 | 1–2 |
| Library/Book/Report translation | 2 | 2 |
| Library/Review Book | 6 | 2–3 |
| Library/Reader | 10 | 1, 3 |
| Library/Streak | 10 | 3 |
| Library/Vocabulary (+ sub) | 37 | 4 |
| Library/Chapter upload - Normal user | 8 | 4 |
| Library/Chapters Upload - Univini | 9 | **Không port** (CMS) |
| Library/User chapter management | 2 | CMS / admin |
| Library | 1 (`languages-variant`) | 1–2 |

---

## 3. Phạm vi sản phẩm

### 3.1 In scope (web)

- Vào Book từ Mini apps + Search `MiniAppList`
- Init `GET /reader/profile` (backend tạo profile nếu chưa có — Postman note: *call get reader first*)
- Browse theo level / category / search
- Book detail + Read (bilingual) + Listen (audio)
- Lưu reading progress, continue reading, favorite
- My Library, reviews, report book / report translation
- Streak cơ bản (current streak, missions, calendar, leaderboard)
- Vocabulary (sau Read/Listen)
- User distribute book (sau core read)

### 3.2 Out of scope v1

| Hạng mục | Lý do |
|----------|--------|
| Offline / download chapter (Isar) | Không có trên web; My Library tab Downloaded bỏ |
| Native notification / reminder OS | Web: in-app + optional later |
| UniVini chapter admin (`create-published`, regenerate audio…) | Đã có CMS |
| `GET /book/admin/list` | Admin |
| Mini apps Tutor / Biz / Dating | Ngoài Book |
| Copy pixel mobile layout | UI theo Figma **web** |

### 3.3 Web-only adaptations

- **Mini player** dính đáy content (giống Spotify web), không overlay native.
- Reader: keyboard (← → page, Space play/pause), chọn chữ để tra vocab.
- Layout desktop: sidebar UniVini **giữ**; Book có sub-nav 4 mục (Overview / My Library / Vocabulary / Profile) **trong** vùng content — không thêm item sidebar gốc.
- Không port `LibOfflineView`.

---

## 4. Map màn hình Mobile → Web

| Mobile route | Web path đề xuất | P |
|--------------|------------------|---|
| `HomeLibrary` + Overview | `/mini-apps/books-audio` | P0 |
| Search book | `/mini-apps/books-audio/search` | P0 |
| Category books | `/mini-apps/books-audio/category/[name]` | P0 |
| All / Top pick / Popular / Recently / Continue | `/mini-apps/books-audio/{all,top-pick,popular,recent,continue}` | P0 |
| Book detail | `/mini-apps/books-audio/book/[id]` | P0 |
| Listen + Read | `/mini-apps/books-audio/book/[id]/read?chapter=&mode=read\|listen` | P0 |
| My Library | `/mini-apps/books-audio/library` | P1 |
| Reviews (book / mine) | `/mini-apps/books-audio/book/[id]/reviews` | P1 |
| Report book | modal trên detail | P1 |
| Account streak | `/mini-apps/books-audio/streak` | P1 |
| Reader profile | `/mini-apps/books-audio/profile` | P1 |
| Badge collection | `/mini-apps/books-audio/profile/badges` | P2 |
| Vocabulary home | `/mini-apps/books-audio/vocab` | P2 |
| UniVini / User folder detail | `/mini-apps/books-audio/vocab/folder/[id]` | P2 |
| Flashcard learning | `/mini-apps/books-audio/vocab/learn` | P2 |
| Upsert book / chapter / manage | `/mini-apps/books-audio/manage/...` | P3 |

Query chung: `level=A1|A2|B1|B2`, `sortBy`, `search`.

---

## 5. Kiến trúc FE đề xuất

Bám TalkRoom. **Không** nhét 1 file API khổng lồ.

```
src/
  apis/
    book/
      bookApis.tsx
      chapterApis.tsx
      readerApis.tsx
      reviewApis.tsx
      streakApis.tsx
      vocabularyApis.tsx
  interface/Book/...
  hooks/Book/
    useReaderProfile.tsx      # GET profile, bắt buộc trước streak
    useLibraryOverview.tsx
    useBookDetail.tsx
    useListenBook.tsx         # audio + page content
    useReadingProgress.tsx
    useMyLibrary.tsx
    useBookStreak.tsx
    useVocabulary.tsx
  context/
    BookPlayerProvider.tsx    # mini player global trong Book shell
  Container/Book/...
  Components/Book/...
  Variable/book.variable.tsx
  app/[locale]/mini-apps/books-audio/...
```

Quy ước:

- API functions + types trong `apis/` (như `talkRoomApis.tsx`).
- Path constants trong `src/routes/index.tsx` → `BOOK_ROUTES`.
- Hook gọi API, giữ pagination `{ total, current_page, limit }` (`PaginationProps`).
- Container = page logic + layout; Components = presentational + SCSS module.
- `platform: WEB` đã có sẵn axios interceptor.

**Book shell:** `Container/Book/BookShell` = UniVini `MainLayout` + Book inner sidebar (Figma: All books / Shadowing / My Library / Vocabulary / Reading profile / Contributed book) + `BookPlayerProvider` (player bar đáy). Reader/Listen **giữ** header + sidebar + player (không fullscreen mobile).

**Init bắt buộc** khi vào shell (login):

1. `GET /reader/profile`
2. `GET /book/streak` (optional, cho badge)
3. `GET /book/languages-variant` + categories

---

## 6. Route map

Thêm vào `mainRoutes`:

```ts
booksAudio: 'mini-apps/books-audio',
```

App router:

```
app/[locale]/mini-apps/page.tsx                    // hub mini apps (thay Coming soon)
app/[locale]/mini-apps/books-audio/page.tsx        // Overview
app/[locale]/mini-apps/books-audio/layout.tsx      // BookShell
app/[locale]/mini-apps/books-audio/search/page.tsx
app/[locale]/mini-apps/books-audio/library/page.tsx
app/[locale]/mini-apps/books-audio/vocab/...
app/[locale]/mini-apps/books-audio/profile/...
app/[locale]/mini-apps/books-audio/streak/page.tsx
app/[locale]/mini-apps/books-audio/book/[id]/page.tsx
app/[locale]/mini-apps/books-audio/book/[id]/read/page.tsx
```

Enable click:

- `MiniAppList`: `onClick` → `onChangeRoute(route)` **chỉ Book**; Tutor/Biz giữ tooltip app.
- `/mini-apps`: list 4 mini apps, Book navigate, còn lại "available in UniVini app".

---

## 7. API mapping

Prefix: `/api/v1`. Auth Bearer. Pagination `limit` + `offset` (mobile) hoặc `page`.

### 7.1 Phase 0–1 — Discover + Detail

| Việc | Method | Path | Query / body |
|------|--------|------|----------------|
| Init reader | GET | `/reader/profile` | — |
| Set level | PUT | `/reader/profile/last-selected-level` | `{ last_selected_level }` |
| Languages | GET | `/book/languages-variant` | — |
| Categories | GET | `/category` | **Thiếu Postman Library** — mobile `GET /category` |
| All books | GET | `/book/v2` | `limit, offset, level, category, search_text, sortBy, page` |
| Top pick | GET | `/book/top-pick` | `limit, offset, languages, category, level, search_text` |
| Popular | GET | `/book/popular-now` | tương tự |
| Recently added | GET | `/book/recently-added` | tương tự |
| Continue reading | GET | `/book/continue-reading` | `limit, offset` |
| Detail | GET | `/book/:id` | — |
| Share link | GET | `/book/:id/share-link` | — |
| Favorite | POST | `/book/favourite/:id` | **Thiếu Postman** — mobile có |
| My lib | GET | `/book/my-lib` | `limit, offset, book_ids, sortBy, favorite` |
| Chapter list | GET | `/chapter` | `fields, where={"book_id"}` — **Thiếu Postman Library** |
| Chapter info | GET | `/chapter/:id` | **Thiếu Postman Library** |
| Audio list | GET | `/book/audio/list` | `book_id, limit, offset` |

`sortBy`: `'newest' \| 'oldest' \| 'a-z' \| 'z-a'`.

### 7.2 Phase 1 — Read / Listen

| Việc | Method | Path | Ghi chú |
|------|--------|------|---------|
| Page content | GET | `/chapter/:id/:page/:language` | **Critical, thiếu Postman.** Body page: `{ content: [{ type, parts: [{ lang, text }] }], total_pages }` |
| Update progress | POST | `/book/reading-progress` | `{ book_id, chapter_id, current_page, audio_minute, language_code }` |
| Get progress | GET | `/reading-progress/:bookId` | **Thiếu Postman** — mobile có |
| Report translation | POST | `/book/translation/error` | `{ book_id, page, original_text, translated_text, chapter_id, suggest_correction }` |
| TTS | POST | `/files/text-to-speech` | Đã có FE chat |
| Quick translate | POST | `/vocabulary/quick-translate` | Tra từ khi đọc |
| Enrichment | GET | `/vocabulary/enrichment-vocab` | `word, sourceLanguage, languages` |
| Save reading vocab | related | `/vocabulary/reading-search-vocab` | Phase 2 có thể kéo sớm nếu reader cần |

Listen: `GET /book/audio/list` → play URL S3. Dùng `wavesurfer` hoặc `HTMLAudioElement` + context mini player. Sync `audio_minute` debounce ~5s cùng `current_page`.

### 7.3 Phase 2 — Review + Streak + Profile

**Review**

| Method | Path |
|--------|------|
| POST | `/book/review` `{ book_id, content_rating, narrator_rating, comment }` |
| GET | `/book/:book_id/reviews` `sort, limit, offset` |
| GET | `/book/:bookId/my-review` |
| PUT / DELETE | `/book/review/:review_id` |
| GET | `/book/my/reviews` |
| POST | `/book-reports` |

**Reader / goal**

| Method | Path |
|--------|------|
| POST | `/reading-goal/goal` `{ timezone, read, unit }` |
| GET/PUT | `/reading-goal/progress` |
| POST | `/reading-goal/progress/add` |
| POST | `/reading-goal/progress/pages` và `/audio` — **mobile có, Postman Reader khác** — verify backend |

**Streak** (nhớ gọi reader profile trước)

| Method | Path |
|--------|------|
| GET | `/book/streak` `/missions` `/history` `/leaderboard` `/achievements` `/achievements/calendar` |
| POST | `/book/streak/progress` `{ amountCompleted, missionId, timezoneOffset }` |
| PUT | `/book/streak/goal` |
| POST | `/book/streak/open-pro-count` |
| DELETE | `/book/streak/reset` — **không expose** user web trừ debug |

### 7.4 Phase 3 — Vocabulary + Distribute

Vocab: UniVini folders, user folders, flashcard `GET /vocabulary/flashcard/questions`, `POST /vocabulary/learning/progress`, user languages, search v2.

Distribute user (bám **mobile** `*-single-language`, không copy nguyên Postman `create-user` nếu backend đã đổi):

| Mobile (ưu tiên verify) | Postman Library |
|-------------------------|-----------------|
| POST `/chapter/create-single-language` | POST `/chapter/create-user` |
| POST `/chapter/publish-single-language` | POST `/chapter/publish-user` |
| PUT `/chapter/update-single-language/:id` | PUT `/chapter/update-user/:id` |
| DELETE `/chapter/single-language/:id` | DELETE `/chapter/user/:id` |
| POST `/chapter/draft-single-language` | POST `/chapter/draft-user` |
| GET `/chapter/my-book/:bookId` | cùng |
| POST `/book` + PUT `/book/:id` | cùng |
| GET `/book/my-distributed` | cùng |

**Verify 1 lần với backend trước Phase 3.** Không implement UniVini `create-published`.

---

## 8. Gap API (Postman vs Mobile)

Các API **mobile đang gọi**, **không có (hoặc sai chỗ)** trong Postman Library — BE có thể vẫn sống. Cần confirm trước Phase 1:

| API mobile | Mức | Dùng cho |
|------------|-----|----------|
| `GET /chapter/:id/:page/:language` | **Blocker Read** | Nội dung trang bilingual |
| `GET /chapter?where={"book_id"}` | **Blocker Detail** | List chapter |
| `GET /chapter/:id` | High | Chapter meta / total pages |
| `POST /book/favourite/:id` | High | Favorite |
| `GET /category` (book) | High | Overview chips |
| `GET /book/languages` | Medium | Có `languages-variant` |
| `GET /reading-progress/:bookId` | Medium | Resume |
| `PUT /reader/profile` | Medium | Edit profile |
| `POST /reading-goal/progress/pages` `/audio` | Medium | Goal |
| `GET /reading-goal/analytics` | Low | Journey charts |
| User chapter `*-single-language` vs `*-user` | Phase 3 blocker | Distribute |

Folder Postman `Book` (sticker) = rác, bỏ.

---

## 9. UI / Figma

Đã đọc qua Figma MCP (2026-08-19). Page **Welcome** `0:1`, canvas **UI** `5:2`. Frame desktop **1440×1024** (Overview dài hơn: 1440×1714).

File: https://www.figma.com/design/WSwox0rdb2HsuH8eY9QawZ/?node-id=5-2

### 9.1 Khác mobile — bám Figma web

| | Mobile app | Figma web |
|--|------------|-----------|
| Nav Book | 4 bottom tab: Overview / My Library / Vocab / Profile | Inner sidebar **Audiobooks**: All books, Shadowing, My Library, Vocabulary, Reading profile, Contributed book |
| Level | Chips A1–B2 trên content | Filter trong sidebar: **A1, A2, B1, B2, Native** |
| Category | Horizontal chips trên Overview | Tag list trong sidebar (Self-growth, Conversation, Fiction, …) |
| Header | Back + Distribute + streak + noti | UniVini logo + **Distribute a book** (cam) + streak fire + bell + avatar |
| Player | Mini overlay | **Persistent bar** full width, mint green: cover, favorite, download, ±10s, seek, speed, chapters |
| Download | Offline Isar | Icon download trên card + player — **web: ẩn hoặc no-op** (không port offline) |
| Shadowing | Không nằm core Library plan | Có section riêng — **out of MVP**, Phase sau |

Section **[DUYỆT]** trên canvas: Overview, Streaks, My Library. Books / Vocab / Profile / My Book / Shadowing **chưa** stamp DUYỆT — implement UI vẫn theo frame, nhưng ưu tiên 3 section đã duyệt.

### 9.2 Chrome layout (mọi màn Book)

```
┌ Header UniVini: Logo |                    [+ Distribute a book] [🔥streak] [🔔] [avatar]
├ Sidebar UniVini (240) ┬ Book sidebar (300) ┬ Content (~804–1200) ─────────────────────┐
│ Overview, Event, …    │ All books          │ greeting / rails / detail / reader        │
│ Mini apps → Book      │ Shadowing          │                                           │
│                       │ My Library         │                                           │
│                       │ Vocabulary         │                                           │
│                       │ Reading profile    │                                           │
│                       │ Contributed book   │                                           │
│                       │ Level A1…Native    │                                           │
│                       │ Category tags      │                                           │
└───────────────────────┴────────────────────┴───────────────────────────────────────────┘
└ Player bar (khi đang nghe): cover · title · ♥ · ⏮ −10s ⏯ +10s ⏭ · seek · 1.0x · chapters ┘
```

Frame chrome: Overview `15:11358`, detail `163:55501`.

### 9.3 Inventory map

| Section Figma | Frame (node) | Component FE | API | Phase |
|---------------|--------------|--------------|-----|-------|
| ✅1. Overview `8:7567` | Overview `15:11358` | `BookOverview` | profile, streak badge, v2, continue, top-pick, recent, popular | P0 |
| | Continue reading `36:8019` | `ContinueReadingPage` | `/book/continue-reading` | P0 |
| | Top picks `37:9986` + search `37:12621` | `TopPickPage` | `/book/top-pick` | P0 |
| | Popular now `37:13354` | `PopularNowPage` | `/book/popular-now` | P0 |
| | Recently added `37:14063` | `RecentlyAddedPage` | `/book/recently-added` | P0 |
| | category-detail `39:9602` | `CategoryBookPage` | `/book/v2?category=` | P0 |
| ✅2. Books `162:55119` | detail Summary `163:55501` | `BookDetail` | `GET /book/:id` | P0 |
| | Chapter `268:69938` | tab Chapters | `GET /chapter` | P0 |
| | Searched Vocab `268:69402` | tab Vocab | reading-search-vocab | P2 |
| | Review `176:69872` | tab Review | `/book/:id/reviews` | P1 |
| | share / more / languages | modal | share-link, favourite | P0–P1 |
| | player-voice `180:56139` | `BookListen` | `/book/audio/list` | P0 |
| | player-text `181:58060` | `BookReader` | `/chapter/:id/:page/:lang` | P0 |
| | Playback speed, Display, Translate, empty, finished | overlays | progress, translation/error | P0–P1 |
| ✅Report `176:66227` | detail book-report `176:66248` | `ReportBookModal` | `POST /book-reports` | P1 |
| ✅3. Streaks `56:9888` | Streak `59:12278` | `BookStreak` | `/book/streak*` | P1 |
| | Leaderboard `68:10755` | `BookStreakLeaderboard` | `/book/streak/leaderboard` | P1 |
| | Daily challenge `381:83669` | `StreakChallenge` | `/book/streak/missions` | P1 |
| | Daily Streak `740:98428` | calendar | `/achievements/calendar` | P1 |
| ✅4. My Library `290:57769` | books-inprogress `290:57770` | `MyLibrary` tab Books | `/book/my-lib` | P1 |
| | Favourites-* | tab Favorites | `favorite=true` | P1 |
| | books-dowloaded | **không port** offline | — | skip |
| ✅6. Vocab `70:15006` | Vocabulary-overview `70:64294` | `VocabHome` | univini + user folders | P2 |
| | flashcard / writing | `VocabLearn` | flashcard/questions | P2 |
| | UniVini / My vocab sets + states | folder CRUD | vocabulary/* | P2 |
| ✅7. Profile `295:69764` | Reading profile `442:85478` | `ReaderProfile` | `/reader/profile`, goals | P1 |
| | Your reviews* | `MyReviews` | `/book/my/reviews` | P1 |
| | badge collection `321:61232` | `BadgeCollection` | streak achievements | P2 |
| ✅5. My Book `326:71060` | My contributed books `369:94977` | `ManageBook` | `/book/my-distributed` | P3 |
| | Distribute a book `329:76790` | `UpsertBook` | `POST /book` | P3 |
| | Create new chapter* | `UpsertChapter` | chapter user APIs | P3 |
| 8. Shadowing `573:85799` | player-shadowing* | — | **chưa có trong Postman Library** | later |
| Theme `229:50199` | player-text themes | reader theme | local | P0 |
| Menu `156:38309` | Home - Opt1 | variant nav — không dùng nếu Overview đã DUYỆT | — | skip |

### 9.4 Overview content (frame `15:11358`)

Thứ tự main (khớp screenshot):

1. Greeting + stats bar (“people learning Vocabulary”, “words learned”)
2. **Top reader streaks** (3 user cards)
3. **Continue reading** — card ngang: cover, chapter title, author, progress, `Page x/y`
4. **All books (level)** — rail cover
5. **Recently added** / **Top picks for you** — rail
6. **Popular now** — list: cover, title, author, category, duration, language, rating, heart, download

“See all →” mỗi rail → page list tương ứng.

### 9.5 Book detail (frame `163:55501`)

- Back: `< {title}`
- Cover + title + author
- Meta: listening time, vocabulary size, rating
- CTA: **Read** (cam) · **Listen** (xanh đậm) · download · share · more
- Tabs: **Summary** | **Searched vocab** | **Chapter** | (Review trên frame riêng)
- Tags: Level, category
- Player bar có thể đang phát **sách khác** với sách đang xem

### 9.6 Token quan sát từ Figma

- Accent cam: Distribute, Read
- Brand green: Listen, tab active, A1 selected
- Player: mint/light green bar
- Desktop only 1440 — **chưa thấy breakpoint tablet/mobile web** trong canvas UI; FE vẫn cần collapse sidebar trên &lt;1200 (UniVini `MainLayout` hiện có)

---

## 10. Phased delivery

### Phase 0 — Foundation (0.5–1 sprint)

- [ ] `BOOK_ROUTES` + `mainRoutes.booksAudio`
- [ ] Hub `/mini-apps` + enable nút Book
- [ ] `BookShell` theo Figma: inner sidebar 6 mục + level + category + player bar
- [ ] `bookApis` / `chapterApis` / `readerApis` + types
- [ ] `useReaderProfile` — bắt login + GET profile
- [ ] i18n namespace `Book` trong `en.json` / `vi.json`
- [ ] Confirm 5 API gap blocker với backend
- [x] Đọc Figma canvas `5:2` — inventory §9.3

### Phase 1 — Discover + Detail + Read/Listen (MVP) — **P0**

Overview rails + search/filter + detail + read/listen + progress + mini player + favorite.

**Không** vocab flashcard, streak full, distribute.

Acceptance:

- User login → Mini apps → Books & Audio → thấy sách theo level
- Mở sách → chapter → đọc bilingual, nghe audio, resume được
- Mini player còn khi back về Overview
- Favorite ↔ My Library (skeleton tab)

### Phase 2 — My Library + Review + Streak + Profile — **P1**

My Library Books/Favorites, CRUD review, report, streak (missions, calendar, leaderboard), reading goal + journey.

Acceptance:

- Continue reading / my-lib khớp progress
- Review hiển thị trên detail
- Streak tăng sau read/listen (cùng timezoneOffset như mobile, GMT+7 = `-420`)

### Phase 3 — Vocabulary — **P2**

Home vocab, UniVini + user folders, lookup trong reader, flashcard.

Cao effort (37 API). Có thể cắt v1: lookup + save word + list folder, **chưa** flashcard.

### Phase 4 — Distribute (user authoring) — **P3**

Create/edit book, upload chapter (docx + audio), publish/unpublish, my-distributed.

Phụ thuộc upload (`uploadApis`) + confirm path `single-language` vs `user`. Crop image: dùng cropper web, không port Flutter crop screen.

---

## 11. File structure dự kiến

Phase 0–1 (tối thiểu):

```
src/apis/book/bookApis.tsx
src/apis/book/chapterApis.tsx
src/apis/book/readerApis.tsx
src/interface/Book/book.interface.tsx
src/interface/Book/chapter.interface.tsx
src/hooks/Book/useReaderProfile.tsx
src/hooks/Book/useLibraryOverview.tsx
src/hooks/Book/useBookDetail.tsx
src/hooks/Book/useListenBook.tsx
src/context/BookPlayerProvider.tsx
src/Container/Book/BookShell/BookShell.tsx
src/Container/Book/Overview/BookOverview.tsx
src/Container/Book/BookDetail/BookDetail.tsx
src/Container/Book/ReadBook/ReadBook.tsx
src/Components/Book/BookCard/BookCard.tsx
src/Components/Book/BookRail/BookRail.tsx
src/Components/Book/LevelFilter/LevelFilter.tsx
src/Components/Book/BookMiniPlayer/BookMiniPlayer.tsx
src/Components/MiniApp/MiniAppList/MiniAppList.tsx   # enable Book click
src/app/[locale]/mini-apps/page.tsx
src/app/[locale]/mini-apps/books-audio/layout.tsx
src/app/[locale]/mini-apps/books-audio/page.tsx
src/app/[locale]/mini-apps/books-audio/book/[id]/page.tsx
src/app/[locale]/mini-apps/books-audio/book/[id]/read/page.tsx
src/Variable/book.variable.tsx
src/routes/MainRoutes.tsx
src/routes/index.tsx
messages/en.json
messages/vi.json
```

---

## 12. Rủi ro & quyết định

| # | Rủi ro | Hướng xử lý |
|---|--------|-------------|
| 1 | Thiếu `GET /chapter/:id/:page/:language` trong Postman | Confirm BE; đây là blocker MVP |
| 2 | Figma chưa có | Không code UI; chỉ scaffold API |
| 3 | Postman chapter user ≠ mobile `single-language` | Verify trước Phase 4 |
| 4 | Audio CORS S3 | Có `fetch-audio` proxy; tái sử dụng nếu stream fail |
| 5 | Dual write progress (page + audio + streak + reading-goal) | Port debounce/logic `TrackReadingService` + `StreakMissionService` |
| 6 | Reader profile chưa init → streak 4xx | Luôn GET profile lúc vào shell |
| 7 | Scope vocab/distribute phình | Cắt sau MVP Read/Listen |
| 8 | i18n Book lớn (mobile `library_local_keys`) | Namespace `Book.*`, port dần theo phase |
| 9 | Mini player vs TalkRoom audio | 1 audio context: pause cái kia khi play |

**Quyết định cần product:**

1. MVP web có **Listen** không, hay chỉ Read trước?
2. Vocab nằm MVP hay P2?
3. User có **distribute** trên web không?
4. Figma file URL + breakpoint bắt buộc?

Đề xuất default: MVP = Discover + Detail + Read + Listen + progress + favorite. Vocab/Streak/Distribute sau.

---

## 13. Test plan

### Phase 1

- [ ] Chưa login → Mini apps / Book → modal login (giống menu khác)
- [ ] Login → GET profile 200, Overview load 4–5 rails
- [ ] Đổi level → PUT last-selected-level + refresh list
- [ ] Search / category / all / top-pick / popular / recent
- [ ] Detail: cover, level, summary, chapter list, reviews count
- [ ] Read: page 1..n, đổi language, bilingual 2 cột
- [ ] Listen: play/pause, seek, speed, đổi chapter
- [ ] Reload → continue-reading + resume page/audio
- [ ] Favorite toggle → my-lib `favorite=true`
- [ ] Mini player: navigate Overview vẫn chạy; vào sách khác thì đổi track

### Phase 2+

- [ ] Review CRUD, 1 user 1 review / book
- [ ] Streak: timezoneOffset, mission complete sau đọc
- [ ] Vocab save từ reader
- [ ] Upload chapter user (khi có Phase 4)

---

## 14. Checklist approval

- [ ] Chốt phạm vi MVP = Phase 1 (có/không Listen)
- [x] Đọc Figma MCP — canvas UI `5:2`, map §9
- [ ] Chốt: Shadowing / Native level / Download icon web (ẩn vs no-op)
- [ ] Chốt: nav Figma (All books + Shadowing + Contributed) vs 4 tab mobile
- [ ] Backend confirm 5 API gap (§8)
- [ ] Confirm chapter user path trước khi hứa Distribute
- [ ] Enable Mini apps hub + Book entry
- [ ] Không port CMS UniVini chapter / offline download

---

## Phụ lục A — Mobile screens (inventory)

```
home_library/
  library_overview/     + category, all, top_pick, popular, recently_added, continue_reading
  my_library/           Books | Favorites
  my_vocabulary/        univini + user folders + flashcard
  reader_profile/       goal, journey, reviews, badges
book_detail/            description, chapters, comments
listen_book/            read_book + listen_voice + bilingual flags + report translate
search_book/
streak/account_streak/
manage_book/            upsert book/chapter
my_review/
```

## Phụ lục B — Enable entry (thay đổi nhỏ, làm Phase 0)

`MiniAppList.tsx` hiện:

```tsx
onClick={() => {}}
```

Đổi: Book → `onChangeRoute('mini-apps/books-audio')`; Tutor/Biz giữ disabled + tooltip.

`mini-apps/page.tsx` thay "Coming soon" bằng hub dùng `MINI_APP_ITEMS`.
