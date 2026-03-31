import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { CategoryProvider } from "@/components/layout/CategoryContext";
import {
  H2HMatchupPage,
  MyRosterPage,
  SettingsPage,
  SleeperReportPage,
  StatExplorerPage,
  TradeAnalyzerPage
} from "@/pages";

export default function App() {
  return (
    <CategoryProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<SleeperReportPage />} />
          <Route path="/roster" element={<MyRosterPage />} />
          <Route path="/matchup" element={<H2HMatchupPage />} />
          <Route path="/trade" element={<TradeAnalyzerPage />} />
          <Route path="/explorer" element={<StatExplorerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </CategoryProvider>
  );
}
