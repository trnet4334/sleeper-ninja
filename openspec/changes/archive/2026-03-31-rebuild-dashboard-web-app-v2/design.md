## Context

`prototype` 的 v2 文件已經將產品目標從本地 Python/Streamlit dashboard 轉為可部署的 web app：React (Vite) SPA、Vercel API Routes、Supabase、GitHub Actions、Yahoo OAuth 與 localStorage 驅動的 league/category 設定。現有 OpenSpec 仍建立在 v1 的本地快取、YAML league config、APScheduler 與 Streamlit UI 假設上，若不先重寫設計與規格，後續任務會持續錯配到已經被放棄的架構。

主要約束如下：
- 前端需要支援多聯盟切換，但 league/category/stat preference 以瀏覽器 localStorage 為主，而不是伺服器端帳號設定。
- Yahoo token 屬於敏感資料，只能進 Supabase，不可落地在 localStorage。
- 外部資料來源包含 Statcast、MLB Stats、FanGraphs projections、FantasyPros ADP，資料更新必須與使用者請求解耦，避免前端/API route 直接打慢速來源。
- 五個核心頁面仍保留，但所有資料請求都必須改成由 CategoryContext 驅動的 API 呼叫與動態欄位渲染。
- `prototype/UIUX/dashboard.html` 與 `prototype/UIUX/DESIGN.md` 現在是明確的 UI 基準，不能只取其風格靈感，必須將 app shell、頁面階層、主要模組與品牌語言重製到正式產品中。
- 使用者要求同一套前端在桌面與行動裝置都可用，且支援 PWA 安裝與基本離線 shell 體驗。

## Goals / Non-Goals

**Goals:**
- 定義從 v1 單體 dashboard 遷移到 v2 web app 的正式系統邊界。
- 明確拆分前端狀態、API route、背景資料管線、Supabase 儲存責任。
- 將 league/category/stat preferences 管理納入正式 capability，而不是散落在實作細節。
- 保留既有產品能力方向，但把其互動與資料契約更新為 context-driven web app 模式。
- 把 `prototype/UIUX` 的資訊架構與視覺語言提升為正式交付要求，而非可選的視覺參考。
- 將 RWD 與 PWA 納入 v2 首波範圍，而不是留待後續補強。

**Non-Goals:**
- 不在本次設計中定義完整 Supabase migration SQL；schema 只保留到能力邊界所需層級。
- 不處理跨裝置同步的完整帳號設定同步；v2 仍以 localStorage 為主。
- 不在本次設計中要求完整離線資料同步；PWA 僅保證 app shell 可安裝與基礎資產快取。
- 不在本次設計中要求即時串流或 websocket 更新。

## Decisions

### 1. 採用「前端 localStorage + 後端 Supabase token/data」的雙層狀態模型

- 使用者可自行管理聯盟、比項、stat preferences，這些偏好不需要登入即可運作，因此放在 localStorage。
- Yahoo OAuth token 與背景拉取資料屬於敏感或共享資料，放在 Supabase。
- 這樣可以保留低摩擦的設定體驗，同時避免把 credentials 暴露到前端。

**Alternatives considered**
- 全部設定都存 Supabase：較適合未來多裝置同步，但會把 v2 的初始流程複雜化。
- 全部都存 localStorage：會讓 Yahoo token 與背景資料同步模型不安全且不可維護。

### 2. 採用 CategoryContext 作為所有頁面的資料契約入口

- 所有主要頁面都依 active league 的 hitterCats、pitcherCats、statPrefs、daysBack 生成查詢參數。
- API route 不直接推導使用者偏好，而是接受前端 context 作為查詢條件。
- 這使同一組 API 能服務不同聯盟與不同顯示偏好，而不必為每個頁面硬編欄位。

**Alternatives considered**
- 每頁各自管理 league/category state：會導致欄位邏輯分散、切 league 時難以保持一致。
- 後端主導所有欄位與 league mapping：會把前端的設定管理能力弱化，也不符合 v2 文件。

### 3. 背景資料更新改為 GitHub Actions 寫入 Supabase

- Statcast、injury、projection、ADP 資料都透過 Python scripts 在排程中執行，再集中寫入 Supabase。
- API route 只讀 Supabase 聚合結果，不直接進行重型抓取或長時間計算。
- 這符合 Vercel serverless timeout 限制，也讓前端刷新只需要重新查詢 API。

**Alternatives considered**
- API route 即時抓第三方資料：延遲過高，且容易超時。
- 保留本地排程器與檔案快取：不適合部署到 Vercel/Supabase 的 web app 架構。

### 4. 將 Yahoo 整合限制在 API Routes 內

- OAuth redirect、callback、token refresh、roster sync、matchup sync 都由 API routes 執行。
- 前端只處理登入狀態與資料顯示，不接觸 client secret 或 refresh token。
- Supabase 的 `yahoo_tokens` 成為 Yahoo 整合的單一憑證來源。

**Alternatives considered**
- 前端直接打 Yahoo OAuth：需要暴露不該暴露的敏感資訊。
- 背景 job 預先拉所有 Yahoo 使用者資料：會把即時 roster/matchup 同步做得過度複雜。

### 5. 保留五大頁面，但讓其輸出改為 web-native interaction contract

- Sleeper Report 用動態欄位表格與 drawer drill-down。
- My Roster 用卡片與 watch/drop flag。
- H2H Matchup 用 category grid 與 targeted pickup suggestions。
- Trade Analyzer 與 Stat Explorer 共享 active league context。
- 這讓 v1 的產品概念保留下來，但其互動模式與部署模式全面符合 v2。

**Alternatives considered**
- 重新定義整個產品資訊架構：風險過高，且與 prototype v2 不符。
- 僅替換技術棧而不改 interaction contract：會留下大量不一致的舊假設。

### 6. 以前端 shell fidelity 為硬性要求

- 側邊導覽、頂部 league tab bar、頁首節奏、主要內容模組、深色表面分層、字體階層與資料模組語言，都以 `prototype/UIUX/dashboard.html` 和 `prototype/UIUX/DESIGN.md` 為重製基準。
- 實作可做必要的產品化補完，但不能退化成僅「相似風格」的通用 dashboard。
- 共享 layout、tokens、component variants 必須從這份 prototype 反推出正式 design system，避免頁面各自偏移。

**Alternatives considered**
- 把 prototype 僅當 moodboard：會讓最終產品失去使用者已確認的視覺與資訊架構基準。
- 先做功能再補設計：會導致大幅返工，且 shell、RWD、PWA 會互相牽連。

### 7. RWD 與 PWA 作為首版內建能力

- app shell 必須從 desktop layout 適配到 tablet 與 mobile，包含側邊導覽折疊、table/card 模組在窄寬度下的重排策略。
- 專案需提供 manifest、icons、service worker 與 install prompt 流程，讓使用者可將 dashboard 以 PWA 形式安裝。
- 離線策略以 shell-first 為主：保證核心靜態資產與最近一次 shell 可載入，不承諾全資料離線查詢。

**Alternatives considered**
- 將 RWD 延後：會讓 prototype 的 app shell 難以落地到實際裝置情境。
- 將 PWA 延後：會與已確認的 premium PWA 產品定位不一致。

## Risks / Trade-offs

- [localStorage 為主的設定模型缺乏跨裝置同步] → 先保留匯出/匯入與未來同步延伸點，不在 v2 首波強做帳號化。
- [Vercel API 依賴前端傳入 context，可能導致查詢條件不一致] → 明確定義 CategoryContext 與 API 參數契約，並在 hooks 層集中處理。
- [Supabase schema 同時承接原始資料、聚合資料與 token，資料責任較多] → 以資料表分層和背景更新流程隔離責任，不把即時計算堆到 request path。
- [從 Python app 遷移到 TypeScript/web app 是破壞性重構] → 透過 OpenSpec 先重寫 capability 契約，再依 capability 拆任務，避免邊改邊漂移。
- [Yahoo roster/matchup 仍是即時 API 路徑，可能受 token 與 rate limit 影響] → 將 refresh 與 retry 邏輯留在 server-side，前端只暴露 retry UX。
- [高 fidelity prototype 重製會壓縮頁面自由度] → 先抽成共享 tokens 與 layout primitives，在 fidelity 與可維護性之間取平衡。
- [資料密度高的桌面設計在 mobile 上容易失真] → 針對表格、grid、drawer 制定明確窄螢幕降階規則，避免單純縮放。
- [PWA service worker 可能造成 stale data 錯覺] → 僅快取 shell 與靜態資產，資料請求維持 network-first 並顯示 last updated。

## Migration Plan

1. 以 v2 capability 與 delta specs 取代 v1 的 planning baseline。
2. 建立新的 repo 結構：`src/` React app、`api/` serverless routes、`scripts/` background fetchers。
3. 先建立 prototype 對應的 design system、responsive shell 與 PWA 基礎設施。
4. 再完成 settings/context/data contract，之後實作五大頁面。
5. 最後導入 Yahoo OAuth、Supabase schema、GitHub Actions 排程。
6. 若遷移中止，保留現有 archived v1 artifacts 作為歷史參考，不與 v2 implementation 混用。

## Open Questions

- Yahoo token 是否以單使用者模型先行，或需預留多使用者 schema？
- Trade Analyzer 的 Z-score 計算要完全在 API route 執行，還是部分由前端組裝結果？
- league/category 設定是否需要匯出/匯入 JSON 作為 v2 首版能力？
- 後續若加入登入與跨裝置同步，localStorage 與 Supabase 設定同步的優先權規則為何？
- PWA install prompt 是否需要在桌面與 mobile 採不同入口文案？
