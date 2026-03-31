## Why

目前的專案規劃仍以 Python + Streamlit 的單體 dashboard 為基礎，但 `prototype` 內的 v2 文件已經把產品方向明確改成 React/Vite 前端、Vercel API、Supabase、GitHub Actions 的 web app 架構。最新 `prototype/UIUX` 設計也進一步把產品定位從一般 sports dashboard 拉高到「Modern Sabermetrician」的高端 editorial analytics 體驗，因此需要更新 OpenSpec proposal，讓後續實作、規格與任務都以 v2 架構與新的 UI 產品定位為準，而不是繼續沿用已失效的 v1 假設。

## What Changes

- **BREAKING** 將應用架構從 Streamlit dashboard 重構為 React (Vite) + TypeScript SPA。
- **BREAKING** 將後端整合模式改為 Vercel API Routes + Supabase，而非本地 Python app 直接讀取快取。
- **BREAKING** 將資料更新機制改為 GitHub Actions 定時寫入 Supabase，而非本地 APScheduler 與檔案快取驅動。
- 將整體 UI 方向更新為 `prototype/UIUX` 定義的高端 editorial analytics 設計系統，採用深色分層表面、強化排版階層、非表格式的資訊編排與 premium PWA 氣質。
- 要求前端頁面資訊架構、導覽層級、主要區塊編排、資料模組與主視覺語言，必須以 `prototype/UIUX/dashboard.html` 作為重製基準，而不是僅做風格接近的二次設計。
- 新增 RWD 與 PWA 能力，包含可安裝、manifest、service worker、行動與桌面斷點下的可用 layout。
- 新增 league、category、stat preferences 的前端設定管理流程，並以 localStorage 作為主要使用者偏好儲存層。
- 引入 `CategoryContext` 作為跨頁面的 league/category 驅動資料模型，所有主要頁面依此 context 請求資料並動態渲染欄位。
- 保留既有五大產品能力方向：FA Sleeper Report、My Roster、H2H Matchup、Trade Analyzer、Stat Explorer，但更新它們的執行架構、互動契約與全域 shell 體驗。

## Capabilities

### New Capabilities
- `league-settings-management`: 管理聯盟、比項與進階數據偏好，並以 localStorage 作為主要設定來源，驅動整個 dashboard 的 category context。
- `responsive-pwa-shell`: 以 prototype 頁面為基準重製全域 app shell，並提供 responsive layout 與 PWA installability。

### Modified Capabilities
- `baseball-data-pipeline`: 將資料拉取與更新從本地快取模式改為 GitHub Actions 寫入 Supabase 的集中式資料管線。
- `yahoo-fantasy-sync`: 將 Yahoo OAuth 與同步流程改為透過 Vercel API Routes 執行，token 儲存在 Supabase。
- `sleeper-report`: 將報表頁更新為由 CategoryContext 驅動、且版面與主視覺遵循 prototype 的 web 表格體驗，依聯盟比項與 stat preferences 動態生成欄位與篩選。
- `roster-insights`: 將 roster 頁更新為遵循 prototype 設計系統的 web app 卡片與 watch-status workflow，並要求與 replacement thinking 流程整合。
- `matchup-analysis`: 將 H2H 頁更新為 context-driven 類別預測格與補強建議流程，並遵循 prototype 頁面階層與互動語言。
- `player-evaluation-tools`: 將 trade analyzer 與 stat explorer 更新為遵循 prototype 設計系統的 web app 互動模型，支援 league-aware 結果與比較視圖。

## Impact

- Affected codebase scope shifts from Python app structure to a hybrid TypeScript + serverless + Python ingest repository.
- New dependencies include React, Vite, TypeScript, Tailwind CSS, TanStack Table, Recharts, Zustand, React Router, Next-style/Vercel API patterns, and Supabase clients.
- Frontend implementation now needs to honor a defined UI system from `prototype/UIUX`, including premium dark surfaces, editorial typography, asymmetrical layout composition, navigation patterns expressed in the dashboard mockup, and page-level fidelity to the prototype shell.
- Additional frontend delivery work is required for responsive breakpoints, installable PWA assets, offline shell caching strategy, and mobile-safe navigation behavior.
- Existing planning assumptions around local YAML league config, Streamlit UI, local cache artifacts, and APScheduler are no longer valid for implementation planning.
- New specs and delta specs will be required before implementation tasks can be trusted.
