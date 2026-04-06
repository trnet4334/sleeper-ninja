## 1. Navigation

- [x] 1.1 Add `"News"` to the `sectionOrder` array in `src/components/layout/AppShell.tsx` between `"Tools"` and `"Config"`
- [x] 1.2 Add two nav items to `src/lib/navigation.ts`: `{ label: "Prospects News", path: "/news/prospects", section: "News" }` and `{ label: "Injury Update", path: "/news/injury", section: "News" }`

## 2. Page Components

- [x] 2.1 Create `src/pages/ProspectsNews.tsx` — export `ProspectsNewsPage` using `PageHeader` with title "Prospects News" and a placeholder content card
- [x] 2.2 Create `src/pages/InjuryUpdate.tsx` — export `InjuryUpdatePage` using `PageHeader` with title "Injury Update" and a placeholder content card

## 3. Router Registration

- [x] 3.1 Export `ProspectsNewsPage` and `InjuryUpdatePage` from `src/pages/index.ts`
- [x] 3.2 Import both pages in `src/App.tsx` and add `<Route path="/news/prospects" element={<ProspectsNewsPage />} />` and `<Route path="/news/injury" element={<InjuryUpdatePage />} />`
